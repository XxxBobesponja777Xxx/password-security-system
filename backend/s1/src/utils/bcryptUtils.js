const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

/**
 * Hashear contraseña con bcrypt
 */
async function hashPassword(plainPassword) {
  try {
    const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Error hasheando contraseña:', error);
    throw new Error('Error procesando contraseña');
  }
}

/**
 * Comparar contraseña en texto plano con hash
 */
async function comparePassword(plainPassword, hash) {
  try {
    const match = await bcrypt.compare(plainPassword, hash);
    return match;
  } catch (error) {
    console.error('Error comparando contraseña:', error);
    return false;
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  SALT_ROUNDS
};
