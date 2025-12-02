// Configuración global
const CONFIG = {
    API_BASE_URL: window.location.origin,
    TOKEN_KEY: 'admin_token',
    USER_KEY: 'admin_user'
};

// Rutas de API
const API = {
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify',
    USERS: '/admin/users',
    POLICIES: '/admin/policies',
    POLICIES_ACTIVE: '/admin/policies/active'
};
