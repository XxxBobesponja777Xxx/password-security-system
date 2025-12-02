const User = require('../models/User');
const PasswordHistory = require('../models/PasswordHistory');
const bcrypt = require('bcrypt');

/**
 * Obtener todos los usuarios
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({
      data: users,
      error: null
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      data: null,
      error: 'Error obteniendo usuarios'
    });
  }
};

/**
 * Obtener usuario por ID
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        data: null,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      data: user,
      error: null
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      data: null,
      error: 'Error obteniendo usuario'
    });
  }
};

/**
 * Obtener usuario por email (con hash de contraseña)
 */
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        data: null,
        error: 'Email es requerido'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        data: null,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      data: user,
      error: null
    });
  } catch (error) {
    console.error('Error obteniendo usuario por email:', error);
    res.status(500).json({
      data: null,
      error: 'Error obteniendo usuario'
    });
  }
};

/**
 * Crear nuevo usuario
 */
exports.createUser = async (req, res) => {
  try {
    const { email, role, password, telegramChatId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        data: null,
        error: 'Email y password son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        data: null,
        error: 'El usuario ya existe'
      });
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Calcular fecha de expiración (90 días por defecto)
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 90);

    const newUser = new User({
      email: email.toLowerCase(),
      role: role || 'user',
      passwordHash,
      passwordLastChangedAt: now,
      passwordExpiresAt: expiresAt,
      telegramChatId
    });

    await newUser.save();

    // Guardar en historial
    await new PasswordHistory({
      userId: newUser._id,
      passwordHash,
      changedAt: now
    }).save();

    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({
      data: userResponse,
      error: null
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({
      data: null,
      error: 'Error creando usuario'
    });
  }
};

/**
 * Actualizar usuario
 */
exports.updateUser = async (req, res) => {
  try {
    const { email, role, password, telegramChatId, passwordExpiresAt } = req.body;
    const updates = {};

    if (email) updates.email = email.toLowerCase();
    if (role) updates.role = role;
    if (telegramChatId !== undefined) updates.telegramChatId = telegramChatId;
    if (passwordExpiresAt) updates.passwordExpiresAt = passwordExpiresAt;

    // Si se actualiza la contraseña
    if (password) {
      updates.passwordHash = await bcrypt.hash(password, 12);
      updates.passwordLastChangedAt = new Date();

      // ✅ Si NO nos mandaron passwordExpiresAt desde s1, usamos 90 días por defecto
      // (pero si s1 ya la calculó usando la política, se respeta)
      if (!updates.passwordExpiresAt) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);
        updates.passwordExpiresAt = expiresAt;
      }

      // Guardar en historial
      const userBefore = await User.findById(req.params.id);
      if (userBefore) {
        await new PasswordHistory({
          userId: userBefore._id,
          passwordHash: updates.passwordHash,
          changedAt: updates.passwordLastChangedAt
        }).save();
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        data: null,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      data: user,
      error: null
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      data: null,
      error: 'Error actualizando usuario'
    });
  }
};

/**
 * Eliminar usuario
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        data: null,
        error: 'Usuario no encontrado'
      });
    }

    // Eliminar historial de contraseñas
    await PasswordHistory.deleteMany({ userId: req.params.id });

    res.json({
      data: { message: 'Usuario eliminado exitosamente' },
      error: null
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      data: null,
      error: 'Error eliminando usuario'
    });
  }
};

/**
 * Obtener historial de contraseñas de un usuario
 */
exports.getUserPasswordHistory = async (req, res) => {
  try {
    const history = await PasswordHistory.getUserHistory(req.params.id, 10);

    res.json({
      data: history,
      error: null
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      data: null,
      error: 'Error obteniendo historial de contraseñas'
    });
  }
};

/**
 * Actualizar estado de notificación
 */
exports.updateNotificationStatus = async (req, res) => {
  try {
    const { notificationSent, lastNotificationDate } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        notificationSent,
        lastNotificationDate: lastNotificationDate || new Date()
      },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        data: null,
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      data: user,
      error: null
    });
  } catch (error) {
    console.error('Error actualizando estado de notificación:', error);
    res.status(500).json({
      data: null,
      error: 'Error actualizando estado de notificación'
    });
  }
};
