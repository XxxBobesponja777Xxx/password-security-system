// Funciones de API
const api = {
    // Obtener token del localStorage
    getToken() {
        return localStorage.getItem(CONFIG.TOKEN_KEY);
    },

    // Headers con autenticación
    getHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    },

    // Realizar petición fetch
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

    // Métodos HTTP
    async get(url) {
        return this.request(url);
    },

    async post(url, body) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    async put(url, body) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
    }
};
