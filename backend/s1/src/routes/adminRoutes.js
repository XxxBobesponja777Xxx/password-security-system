const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticateToken);
router.use(requireAdmin);

// Rutas de usuarios
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Rutas de políticas
router.get('/policies', adminController.getAllPolicies);
router.get('/policies/active', adminController.getActivePolicy);
router.post('/policies', adminController.createPolicy);
router.put('/policies/:id', adminController.updatePolicy);
router.delete('/policies/:id', adminController.deletePolicy);

module.exports = router;
