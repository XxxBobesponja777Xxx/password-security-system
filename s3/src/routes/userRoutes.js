const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas de usuarios
router.get('/', userController.getAllUsers);
router.get('/email', userController.getUserByEmail);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Rutas de historial de contraseñas
router.get('/:id/password-history', userController.getUserPasswordHistory);

// Actualizar estado de notificación
router.patch('/:id/notification', userController.updateNotificationStatus);

module.exports = router;
