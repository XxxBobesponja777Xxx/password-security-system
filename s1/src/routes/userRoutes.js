const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de usuario
router.get('/me', userController.getCurrentUser);
router.get('/me/password-status', userController.getPasswordStatus);
router.post('/me/change-password', userController.changePassword);

module.exports = router;
