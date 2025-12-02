const s3Client = require('../config/s3Client');
const { validatePassword } = require('../config/grpcClient');
const { comparePassword, hashPassword } = require('../utils/bcryptUtils');
const { sendPasswordExpiryNotification } = require('../services/telegramService');

/**
 * Obtener estado de contraseña del usuario actual
 */
async function getPasswordStatus(req, res) {
  try {
    const userId = req.user.sub;

    // Obtener usuario de S3
    const userResponse = await s3Client.get(`/users/${userId}`);
    const user = userResponse.data.data;

    if (!user) {
      return res.status(404).json({
        data: null,
        error: 'Usuario no encontrado'
      });
    }

    // Calcular días restantes
    const now = new Date();
    const expiresAt = new Date(user.passwordExpiresAt);
    const diffTime = expiresAt - now;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const expiringSoon = daysRemaining <= 7;

    // Si está por expirar y tiene Telegram configurado, enviar notificación
    if (expiringSoon && user.telegramChatId && !user.notificationSent) {
      const notificationSent = await sendPasswordExpiryNotification(user, daysRemaining);
      
      if (notificationSent) {
        // Actualizar estado de notificación en S3
        await s3Client.patch(`/users/${userId}/notification`, {
          notificationSent: true,
          lastNotificationDate: new Date()
        });
      }
    }

    res.json({
      data: {
        daysRemaining,
        expiringSoon,
        passwordLastChangedAt: user.passwordLastChangedAt,
        passwordExpiresAt: user.passwordExpiresAt
      },
      error: null
    });

  } catch (error) {
    console.error('Error obteniendo estado de contraseña:', error);
    res.status(500).json({
      data: null,
      error: 'Error obteniendo estado de contraseña'
    });
  }
}

/**
 * Cambiar contraseña del usuario actual
 */
async function changePassword(req, res) {
  try {
    const userId = req.user.sub;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        data: null,
        error: 'Contraseña actual y nueva son requeridas'
      });
    }

    // Obtener usuario de S3 (con hash)
    const userResponse = await s3Client.get(`/users/email?email=${encodeURIComponent(req.user.email)}`);
    const user = userResponse.data.data;

    if (!user) {
      return res.status(404).json({
        data: null,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isValidCurrentPassword = await comparePassword(currentPassword, user.passwordHash);

    if (!isValidCurrentPassword) {
      return res.status(401).json({
        data: null,
        error: 'Contraseña actual incorrecta'
      });
    }

    // Validar nueva contraseña con S2 (gRPC)
    try {
      const validationResult = await validatePassword(
        user.email,
        newPassword,
        user.passwordHash
      );

      if (!validationResult.valid) {
        return res.status(400).json({
          data: null,
          error: 'La contraseña no cumple con los requisitos',
          reasons: validationResult.reasons
        });
      }
    } catch (grpcError) {
      console.error('Error en validación gRPC:', grpcError);
      return res.status(503).json({
        data: null,
        error: 'Servicio de validación no disponible'
      });
    }

    // Hashear nueva contraseña
    const newPasswordHash = await hashPassword(newPassword);

    // Calcular nueva fecha de expiración
    const now = new Date();
    const expiresAt = new Date(now);
    
    // Obtener política activa para determinar días de expiración
    try {
      const policyResponse = await s3Client.get('/policies/active');
      const policy = policyResponse.data.data;
      expiresAt.setDate(expiresAt.getDate() + (policy.maxPasswordAgeDays || 90));
    } catch (error) {
      // Si no se puede obtener política, usar 90 días por defecto
      expiresAt.setDate(expiresAt.getDate() + 90);
    }

    // Actualizar contraseña en S3
    await s3Client.put(`/users/${userId}`, {
      password: newPassword, // S3 se encargará de hashearla y guardar en historial
      passwordLastChangedAt: now,
      passwordExpiresAt: expiresAt,
      notificationSent: false // Resetear flag de notificación
    });

    res.json({
      data: {
        message: 'Contraseña cambiada exitosamente',
        passwordExpiresAt: expiresAt
      },
      error: null
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    
    if (error.response && error.response.status === 503) {
      return res.status(503).json({
        data: null,
        error: 'Servicio no disponible. Intenta más tarde.'
      });
    }

    res.status(500).json({
      data: null,
      error: 'Error cambiando contraseña'
    });
  }
}

/**
 * Obtener información del usuario actual
 */
async function getCurrentUser(req, res) {
  try {
    const userId = req.user.sub;

    const userResponse = await s3Client.get(`/users/${userId}`);
    const user = userResponse.data.data;

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
}

module.exports = {
  getPasswordStatus,
  changePassword,
  getCurrentUser
};
