// Funciones de API
const api = {
    getToken() {
        return localStorage.getItem(CONFIG.TOKEN_KEY);
    },

    getHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    },

    async request(url, options = {}) {
        try {
            const response = await fetch(CONFIG.API_BASE_URL + url, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async get(url) {
        return this.request(url);
    },

    async post(url, body) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }
};
