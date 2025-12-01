// Autenticación
const auth = {
    isAuthenticated() {
        return !!localStorage.getItem(CONFIG.TOKEN_KEY);
    },

    saveAuth(token, user) {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
    },

    getUser() {
        const userStr = localStorage.getItem(CONFIG.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    logout() {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
        showScreen('login');
    },

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

    async login(email, password) {
        const response = await api.post(API.LOGIN, { email, password });
        
        if (response.data && response.data.token) {
            const { token, user } = response.data;
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
    
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    
    try {
        const user = await auth.login(email, password);
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
    document.getElementById('user-email').textContent = user.email;
    
    // Cargar estado de contraseña
    loadPasswordStatus();
}
