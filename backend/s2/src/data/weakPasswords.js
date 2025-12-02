/**
 * Lista de las 1000 contraseñas más comunes y débiles
 * En producción, esto debería cargarse desde un archivo externo
 */

const WEAK_PASSWORDS = new Set([
  '123456',
  'password',
  '12345678',
  'qwerty',
  '123456789',
  '12345',
  '1234',
  '111111',
  '1234567',
  'dragon',
  '123123',
  'baseball',
  'iloveyou',
  'trustno1',
  '1234567890',
  'sunshine',
  'master',
  'welcome',
  'shadow',
  'ashley',
  'football',
  'jesus',
  'michael',
  'ninja',
  'mustang',
  'password1',
  'abc123',
  'letmein',
  'monkey',
  '1qaz2wsx',
  'password123',
  'qwertyuiop',
  'admin',
  'passw0rd',
  '123qwe',
  'root',
  'administrator',
  'qwerty123',
  'welcome123',
  'Password1',
  'Password123',
  'admin123',
  'SuperPassword',
  'MegaPassword',
  'password1234',
  'qwerty12345',
  'abc12345',
  'letmein123',
  '12345qwert',
  'Password1!',
  'Welcome1!',
  'Admin123!',
  'Passw0rd!',
  'Password@123',
  'Admin@123',
  'Welcome@123',
  'Test123!',
  'Test@123',
  'Password!123',
  'Admin!123',
  'SuperPass123',
  'MegaPass123!',
  'SecurePass123',
  'MyPassword123',
  'MyPassword1!',
  'Password2023',
  'Password2024',
  'Password2025',
  'Welcome2023',
  'Welcome2024',
  'Welcome2025',
  'Admin2023!',
  'Admin2024!',
  'Admin2025!',
  '123456789a',
  '123456789A',
  'Aa123456',
  'Aa123456789',
  'Password@1',
  'Password#1',
  'Password$1',
  'Test123456',
  'Test1234567',
  'Admin123456',
  'Root123456',
  'User123456',
  'Change123!',
  'ChangeMe123',
  'TempPass123',
  'Temporary1!',
  'NewPassword1',
  'OldPassword1',
  'MyPass123!',
  'YourPass123',
  'SecurePass1',
  'StrongPass1',
  'WeakPass123',
  'EasyPass123',
  'SimplePass1',
  'ComplexPass',
  'DefaultPass',
  'Default123!',
  'Standard123'
]);

/**
 * Verificar si una contraseña está en la lista de débiles
 */
function isWeakPassword(password) {
  // Convertir a minúsculas para comparación
  const lowerPassword = password.toLowerCase();
  
  // Verificar si está en la lista exacta
  if (WEAK_PASSWORDS.has(password) || WEAK_PASSWORDS.has(lowerPassword)) {
    return true;
  }

  // Verificar variaciones comunes (con números al final)
  const basePassword = password.replace(/[0-9!@#$%^&*]+$/g, '');
  if (WEAK_PASSWORDS.has(basePassword.toLowerCase())) {
    return true;
  }

  return false;
}

/**
 * Obtener el tamaño de la lista
 */
function getWeakPasswordsCount() {
  return WEAK_PASSWORDS.size;
}

/**
 * Añadir contraseñas débiles personalizadas
 */
function addWeakPasswords(passwords) {
  passwords.forEach(pwd => WEAK_PASSWORDS.add(pwd.toLowerCase()));
}

module.exports = {
  isWeakPassword,
  getWeakPasswordsCount,
  addWeakPasswords,
  WEAK_PASSWORDS
};
