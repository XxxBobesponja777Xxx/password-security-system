const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');

// Rutas de políticas
router.get('/', policyController.getAllPolicies);
router.get('/active', policyController.getActivePolicy);
router.get('/:id', policyController.getPolicyById);
router.post('/', policyController.createPolicy);
router.put('/:id', policyController.updatePolicy);
router.delete('/:id', policyController.deletePolicy);

module.exports = router;
