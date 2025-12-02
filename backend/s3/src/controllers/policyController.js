const PasswordPolicy = require('../models/PasswordPolicy');

/**
 * Obtener todas las políticas
 */
exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await PasswordPolicy.find().sort({ createdAt: -1 });

    res.json({
      data: policies,
      error: null
    });
  } catch (error) {
    console.error('Error obteniendo políticas:', error);
    res.status(500).json({
      data: null,
      error: 'Error obteniendo políticas'
    });
  }
};

/**
 * Obtener política activa
 */
exports.getActivePolicy = async (req, res) => {
  try {
    const policy = await PasswordPolicy.findOne({ isActive: true });

    if (!policy) {
      return res.status(404).json({
        data: null,
        error: 'No hay política activa'
      });
    }

    res.json({
      data: policy,
      error: null
    });
  } catch (error) {
    console.error('Error obteniendo política activa:', error);
    res.status(500).json({
      data: null,
      error: 'Error obteniendo política activa'
    });
  }
};

/**
 * Obtener política por ID
 */
exports.getPolicyById = async (req, res) => {
  try {
    const policy = await PasswordPolicy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        data: null,
        error: 'Política no encontrada'
      });
    }

    res.json({
      data: policy,
      error: null
    });
  } catch (error) {
    console.error('Error obteniendo política:', error);
    res.status(500).json({
      data: null,
      error: 'Error obteniendo política'
    });
  }
};

/**
 * Crear nueva política
 */
exports.createPolicy = async (req, res) => {
  try {
    const {
      minLength,
      requireUppercase,
      requireLowercase,
      requireDigits,
      requireSymbols,
      maxPasswordAgeDays,
      isActive,
      description
    } = req.body;

    const newPolicy = new PasswordPolicy({
      minLength: minLength || 15,
      requireUppercase: requireUppercase !== false,
      requireLowercase: requireLowercase !== false,
      requireDigits: requireDigits !== false,
      requireSymbols: requireSymbols !== false,
      maxPasswordAgeDays: maxPasswordAgeDays || 90,
      isActive: isActive || false,
      description: description || ''
    });

    await newPolicy.save();

    res.status(201).json({
      data: newPolicy,
      error: null
    });
  } catch (error) {
    console.error('Error creando política:', error);
    res.status(500).json({
      data: null,
      error: 'Error creando política'
    });
  }
};

/**
 * Actualizar política
 */
exports.updatePolicy = async (req, res) => {
  try {
    const updates = req.body;

    // Si se está activando esta política, desactivar las demás
    if (updates.isActive === true) {
      await PasswordPolicy.updateMany(
        { _id: { $ne: req.params.id } },
        { $set: { isActive: false } }
      );
    }

    const policy = await PasswordPolicy.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!policy) {
      return res.status(404).json({
        data: null,
        error: 'Política no encontrada'
      });
    }

    res.json({
      data: policy,
      error: null
    });
  } catch (error) {
    console.error('Error actualizando política:', error);
    res.status(500).json({
      data: null,
      error: 'Error actualizando política'
    });
  }
};

/**
 * Eliminar política
 */
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await PasswordPolicy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        data: null,
        error: 'Política no encontrada'
      });
    }

    // No permitir eliminar la política activa
    if (policy.isActive) {
      return res.status(400).json({
        data: null,
        error: 'No se puede eliminar la política activa'
      });
    }

    await policy.deleteOne();

    res.json({
      data: { message: 'Política eliminada exitosamente' },
      error: null
    });
  } catch (error) {
    console.error('Error eliminando política:', error);
    res.status(500).json({
      data: null,
      error: 'Error eliminando política'
    });
  }
};
