const axios = require('axios');

const S3_BASE_URL = process.env.S3_BASE_URL || 'http://localhost:3003';
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || '';

/**
 * Cliente HTTP para comunicarse con S3
 */
const s3Client = axios.create({
  baseURL: S3_BASE_URL,
  timeout: 10000,
  headers: {
    'X-Internal-Secret': INTERNAL_SECRET
  }
});

// Interceptor para logging
s3Client.interceptors.request.use(
  (config) => {
    console.log(`[S3 Client] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

s3Client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('[S3 Client] Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ No se puede conectar a S3. ¿Está corriendo?');
    }
    return Promise.reject(error);
  }
);

module.exports = s3Client;
