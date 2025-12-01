// Gestión de contraseña

// Cargar estado de contraseña
async function loadPasswordStatus() {
    const container = document.getElementById('status-content');
    container.innerHTML = '<div class="loading">Cargando estado...</div>';
    
    try {
        const response = await api.get(API.PASSWORD_STATUS);
        const status = response.data;
        
        const daysClass = status.daysRemaining <= 7 ? 'danger' : 
                         status.daysRemaining <= 30 ? 'warning' : 'success';
        
        let html = `
            <div class="status-info">
                <div class="status-item">
                    <div class="status-item-label">Días Restantes</div>
                    <div class="status-item-value ${daysClass}">${status.daysRemaining}</div>
                </div>
                <div class="status-item">
                    <div class="status-item-label">Último Cambio</div>
                    <div class="status-item-value">${formatDate(status.passwordLastChangedAt)}</div>
                </div>
                <div class="status-item">
                    <div class="status-item-label">Expira el</div>
                    <div class="status-item-value">${formatDate(status.passwordExpiresAt)}</div>
                </div>
            </div>
        `;
        
        if (status.expiringSoon) {
            html += `
                <div class="warning-banner">
                    <div class="warning-banner-icon">⚠️</div>
                    <div class="warning-banner-content">
                        <h4>¡Atención! Tu contraseña está por expirar</h4>
                        <p>Te recomendamos cambiarla lo antes posible para mantener tu cuenta segura.</p>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = `<div class="loading" style="color: var(--danger);">Error: ${error.message}</div>`;
    }
}

// Medidor de fuerza de contraseña
document.getElementById('new-password').addEventListener('input', (e) => {
    const password = e.target.value;
    const strengthBar = document.getElementById('strength-bar-fill');
    const strengthText = document.getElementById('strength-text');
    
    if (!password) {
        strengthBar.className = 'strength-bar-fill';
        strengthText.textContent = '';
        strengthText.className = 'strength-text';
        return;
    }
    
    let strength = 0;
    
    // Longitud
    if (password.length >= 15) strength += 20;
    else if (password.length >= 10) strength += 10;
    
    // Mayúsculas
    if (/[A-Z]/.test(password)) strength += 20;
    
    // Minúsculas
    if (/[a-z]/.test(password)) strength += 20;
    
    // Dígitos
    if (/[0-9]/.test(password)) strength += 20;
    
    // Símbolos
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 20;
    
    let className = 'weak';
    let text = 'Débil';
    
    if (strength >= 80) {
        className = 'strong';
        text = 'Fuerte';
    } else if (strength >= 50) {
        className = 'medium';
        text = 'Media';
    }
    
    strengthBar.className = `strength-bar-fill ${className}`;
    strengthText.className = `strength-text ${className}`;
    strengthText.textContent = `Fuerza: ${text}`;
});

// Manejo del formulario de cambio de contraseña
document.getElementById('change-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    const errorDiv = document.getElementById('change-password-error');
    const successDiv = document.getElementById('change-password-success');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('span');
    const spinner = submitBtn.querySelector('.spinner');
    
    // Limpiar mensajes
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');
    errorDiv.textContent = '';
    successDiv.textContent = '';
    
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Las contraseñas no coinciden';
        errorDiv.classList.add('show');
        return;
    }
    
    // Validar longitud mínima
    if (newPassword.length < 15) {
        errorDiv.textContent = 'La nueva contraseña debe tener al menos 15 caracteres';
        errorDiv.classList.add('show');
        return;
    }
    
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    
    try {
        const response = await api.post(API.CHANGE_PASSWORD, {
            currentPassword,
            newPassword
        });
        
        // Mostrar mensaje de éxito
        successDiv.textContent = 'Contraseña cambiada exitosamente';
        successDiv.classList.add('show');
        
        // Limpiar formulario
        e.target.reset();
        
        // Actualizar estado
        await loadPasswordStatus();
        
        // Scroll al mensaje de éxito
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
    } catch (error) {
        let errorMessage = error.message;
        
        // Si hay razones de validación, mostrarlas
        if (error.message.includes('reasons')) {
            errorMessage = 'La contraseña no cumple con los requisitos de seguridad';
        }
        
        errorDiv.textContent = errorMessage;
        errorDiv.classList.add('show');
        
        // Scroll al mensaje de error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
    }
});

// Utilidades
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
