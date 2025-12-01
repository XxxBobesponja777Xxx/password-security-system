// Configuración global
const CONFIG = {
    API_BASE_URL: window.location.origin,
    TOKEN_KEY: 'user_token',
    USER_KEY: 'user_data'
};

// Rutas de API
const API = {
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify',
    PASSWORD_STATUS: '/users/me/password-status',
    CHANGE_PASSWORD: '/users/me/change-password',
    ME: '/users/me'
};
