const s3Client = require('../config/s3Client');

/**
 * Obtener todos los usuarios (Admin)
 */
async function getAllUsers(req, res) {
  try {
    const response = await s3Client.get('/users');
    res.json(response.data);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      data: null,
      error: 'Error obteniendo usuarios'
    });
  }
}

/**
 * Obtener usuario por ID (Admin)
 */
async function getUserById(req, res) {
  try {
    const response = await s3Client.get(`/users/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(error.response?.status || 500).json({
      data: null,
      error: error.response?.data?.error || 'Error obteniendo usuario'
    });
  }
}

/**
 * Crear usuario (Admin)
 */
async function createUser(req, res) {
  try {
    const response = await s3Client.post('/users', req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(error.response?.status || 500).json({
      data: null,
      error: error.response?.data?.error || 'Error creando usuario'
    });
  }
}

/**
 * Actualizar usuario (Admin)
 */
async function updateUser(req, res) {
  try {
    const response = await s3Client.put(`/users/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(error.response?.status || 500).json({
      data: null,
      error: error.response?.data?.error || 'Error actualizando usuario'
    });
  }
}

/**
 * Eliminar usuario (Admin)
 */
async function deleteUser(req, res) {
  try {
    const response = await s3Client.delete(`/users/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(error.response?.status || 500).json({
      data: null,
      error: error.response?.data?.error || 'Error eliminando usuario'
    });
  }
}

/**
 * Obtener todas las políticas (Admin)
 */
async function getAllPolicies(req, res) {
  try {
    const response = await s3Client.get('/policies');
    res.json(response.data);
  } catch (error) {
    console.error('Error obteniendo políticas:', error);
    res.status(500).json({
      data: null,
      error: 'Error obteniendo políticas'
    });
  }
}

/**
 * Obtener política activa (Admin)
 */
async function getActivePolicy(req, res) {
  try {
    const response = await s3Client.get('/policies/active');
    res.json(response.data);
  } catch (error) {
    console.error('Error obteniendo política activa:', error);
    res.status(error.response?.status || 500).json({
      data: null,
      error: error.response?.data?.error || 'Error obteniendo política activa'
    });
  }
}

/**
 * Crear política (Admin)
 */
async function createPolicy(req, res) {
  try {
    const response = await s3Client.post('/policies', req.body);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creando política:', error);
    res.status(error.response?.status || 500).json({
      data: null,
      error: error.response?.data?.error || 'Error creando política'
    });
  }
}

/**
 * Actualizar política (Admin)
 */
async function updatePolicy(req, res) {
  try {
    const response = await s3Client.put(`/policies/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error actualizando política:', error);
    res.status(error.response?.status || 500).json({
      data: null,
      error: error.response?.data?.error || 'Error actualizando política'
    });
  }
}

/**
 * Eliminar política (Admin)
 */
async function deletePolicy(req, res) {
  try {
    const response = await s3Client.delete(`/policies/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error eliminando política:', error);
    res.status(error.response?.status || 500).json({
      data: null,
      error: error.response?.data?.error || 'Error eliminando política'
    });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllPolicies,
  getActivePolicy,
  createPolicy,
  updatePolicy,
  deletePolicy
};
