const s3Client = require('../config/s3Client');
const { comparePassword } = require('../utils/bcryptUtils');
const { generateToken } = require('../utils/jwtUtils');

/**
 * Login de usuario
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        data: null,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Obtener usuario de S3 (con hash de contraseña)
    const userResponse = await s3Client.get(`/users/email?email=${encodeURIComponent(email)}`);
    
    if (!userResponse.data || !userResponse.data.data) {
      return res.status(401).json({
        data: null,
        error: 'Credenciales inválidas'
      });
    }

    const user = userResponse.data.data;

    // Verificar contraseña
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        data: null,
        error: 'Credenciales inválidas'
      });
    }

    // Generar JWT
    const token = generateToken(user);

    // Responder con token y datos de usuario (sin hash)
    res.json({
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          passwordExpiresAt: user.passwordExpiresAt,
          passwordLastChangedAt: user.passwordLastChangedAt
        }
      },
      error: null
    });

  } catch (error) {
    console.error('Error en login:', error);
    
    if (error.response && error.response.status === 404) {
      return res.status(401).json({
        data: null,
        error: 'Credenciales inválidas'
      });
    }

    res.status(500).json({
      data: null,
      error: 'Error en el servidor'
    });
  }
}

/**
 * Verificar token (opcional)
 */
function verifyTokenEndpoint(req, res) {
  // Si llegamos aquí, el middleware ya verificó el token
  res.json({
    data: {
      valid: true,
      user: req.user
    },
    error: null
  });
}

module.exports = {
  login,
  verifyTokenEndpoint
};
