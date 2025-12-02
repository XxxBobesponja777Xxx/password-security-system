const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Login
router.post('/login', authController.login);

// Verificar token
router.get('/verify', authenticateToken, authController.verifyTokenEndpoint);

module.exports = router;
