const { verifyToken } = require('../utils/jwtUtils');

/**
 * Middleware para verificar JWT
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      data: null,
      error: 'Token no proporcionado'
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Adjuntar usuario decodificado a la request
    next();
  } catch (error) {
    return res.status(403).json({
      data: null,
      error: error.message
    });
  }
}

/**
 * Middleware para verificar rol de administrador
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      data: null,
      error: 'Acceso denegado. Se requiere rol de administrador.'
    });
  }
  next();
}

/**
 * Middleware opcional de autenticación
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Ignorar errores, simplemente no autenticado
    }
  }
  
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};
