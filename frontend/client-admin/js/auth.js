// Autenticación
const auth = {
    // Verificar si está autenticado
    isAuthenticated() {
        return !!localStorage.getItem(CONFIG.TOKEN_KEY);
    },

    // Guardar token y usuario
    saveAuth(token, user) {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
    },

    // Obtener usuario guardado
    getUser() {
        const userStr = localStorage.getItem(CONFIG.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    // Cerrar sesión
    logout() {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
        showScreen('login');
    },

    // Verificar token con el servidor
    async verify() {
        try {
            await api.get(API.VERIFY);
            return true;
        } catch (error) {
            console.error('Token inválido:', error);
            this.logout();
            return false;
        }
    },

    // Login
    async login(email, password) {
        const response = await api.post(API.LOGIN, { email, password });
        
        if (response.data && response.data.token) {
            const { token, user } = response.data;
            
            // Verificar que sea admin
            if (user.role !== 'admin') {
                throw new Error('Acceso denegado. Solo administradores.');
            }
            
            this.saveAuth(token, user);
            return user;
        } else {
            throw new Error('Respuesta inválida del servidor');
        }
    }
};

// Manejo del formulario de login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('span');
    const spinner = submitBtn.querySelector('.spinner');
    
    // Ocultar error previo
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
    
    // Deshabilitar botón y mostrar spinner
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    
    try {
        const user = await auth.login(email, password);
        
        // Redirigir al dashboard
        showDashboard(user);
        
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
    }
});

// Botón de logout
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        auth.logout();
    }
});

// Función para mostrar el dashboard
function showDashboard(user) {
    showScreen('dashboard');
    document.getElementById('admin-email').textContent = user.email;
    
    // Cargar datos iniciales
    loadUsers();
    loadPolicies();
}
