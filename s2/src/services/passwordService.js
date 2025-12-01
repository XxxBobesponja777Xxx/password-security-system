const axios = require('axios');
const bcrypt = require('bcrypt');
const weakPasswords = require('../data/weakPasswords');

const S3_BASE_URL = process.env.S3_BASE_URL || 'http://localhost:3003';
const CACHE_REFRESH_INTERVAL = process.env.POLICY_CACHE_REFRESH_INTERVAL || 60000;

// Caché de política en memoria
let cachedPolicy = null;
let lastCacheUpdate = null;

/**
 * Obtener política activa de S3
 */
async function fetchActivePolicy() {
  try {
    const response = await axios.get(`${S3_BASE_URL}/policies/active`, {
      timeout: 5000,
      headers: {
        'X-Internal-Secret': process.env.INTERNAL_SECRET || ''
      }
    });

    if (response.data && response.data.data) {
      cachedPolicy = response.data.data;
      lastCacheUpdate = new Date();
      console.log('✅ Política actualizada en caché:', cachedPolicy);
      return cachedPolicy;
    }
  } catch (error) {
    console.error('⚠️  Error obteniendo política de S3:', error.message);
    
    if (cachedPolicy) {
      console.log('📦 Usando política en caché (última actualización:', lastCacheUpdate, ')');
    } else {
      console.log('⚠️  No hay política en caché. Usando política por defecto.');
      cachedPolicy = getDefaultPolicy();
    }
  }

  return cachedPolicy;
}

/**
 * Obtener política por defecto si S3 no está disponible
 */
function getDefaultPolicy() {
  return {
    minLength: 15,
    requireUppercase: true,
    requireLowercase: true,
    requireDigits: true,
    requireSymbols: true,
    maxPasswordAgeDays: 90
  };
}

/**
 * Iniciar refresh periódico de la política
 */
function startPolicyCacheRefresh() {
  // Cargar inmediatamente al inicio
  fetchActivePolicy();

  // Refrescar periódicamente
  setInterval(async () => {
    console.log('🔄 Refrescando caché de política...');
    await fetchActivePolicy();
  }, CACHE_REFRESH_INTERVAL);
}

/**
 * Validar contraseña según todas las reglas
 */
async function validatePassword(email, newPassword, previousPasswordHash) {
  const reasons = [];

  // Obtener política (de caché o S3)
  const policy = cachedPolicy || await fetchActivePolicy();

  // 1. Longitud mínima
  if (newPassword.length < policy.minLength) {
    reasons.push(`La contraseña debe tener al menos ${policy.minLength} caracteres`);
  }

  // 2. Mayúsculas
  if (policy.requireUppercase && !/[A-Z]/.test(newPassword)) {
    reasons.push('La contraseña debe contener al menos una letra mayúscula');
  }

  // 3. Minúsculas
  if (policy.requireLowercase && !/[a-z]/.test(newPassword)) {
    reasons.push('La contraseña debe contener al menos una letra minúscula');
  }

  // 4. Dígitos
  if (policy.requireDigits && !/[0-9]/.test(newPassword)) {
    reasons.push('La contraseña debe contener al menos un dígito');
  }

  // 5. Símbolos
  if (policy.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
    reasons.push('La contraseña debe contener al menos un símbolo especial');
  }

  // 6. No debe estar en la lista de contraseñas débiles
  if (weakPasswords.isWeakPassword(newPassword)) {
    reasons.push('La contraseña es demasiado común y fácil de adivinar');
  }

  // 7. No debe contener el email del usuario
  if (email && newPassword.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
    reasons.push('La contraseña no debe contener tu dirección de email');
  }

  // 8. No debe ser muy similar a la contraseña anterior
  if (previousPasswordHash) {
    try {
      const isSamePassword = await bcrypt.compare(newPassword, previousPasswordHash);
      
      if (isSamePassword) {
        reasons.push('La nueva contraseña no puede ser igual a la anterior');
      } else {
        const similarity = calculateSimilarity(newPassword, previousPasswordHash);
        if (similarity > 0.8) {
          reasons.push('La nueva contraseña es demasiado similar a la anterior');
        }
      }
    } catch (error) {
      console.warn('No se pudo comparar con contraseña anterior:', error.message);
    }
  }

  return {
    valid: reasons.length === 0,
    reasons: reasons
  };
}

/**
 * Calcular similitud entre dos strings usando distancia de Levenshtein simplificada
 */
function calculateSimilarity(str1, str2) {
  // Para contraseñas hasheadas, esto no es útil
  // En su lugar, comparamos caracteres comunes en posición similar
  if (str2.startsWith('$2')) {
    // Es un hash bcrypt, no podemos comparar directamente
    return 0;
  }

  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);

  if (maxLen === 0) return 1.0;

  let matches = 0;
  const minLen = Math.min(len1, len2);

  for (let i = 0; i < minLen; i++) {
    if (str1[i] === str2[i]) {
      matches++;
    }
  }

  return matches / maxLen;
}

/**
 * Función auxiliar para comparar contraseñas con bcrypt (si es necesario)
 */
async function comparePassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error comparando contraseñas:', error);
    return false;
  }
}

module.exports = {
  validatePassword,
  startPolicyCacheRefresh,
  fetchActivePolicy
};
