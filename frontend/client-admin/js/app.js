// Funciones de utilidad de la aplicación

// Mostrar pantalla
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId + '-screen').classList.add('active');
}

// Cambiar entre tabs
document.querySelectorAll('.tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        
        // Actualizar tabs
        document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Actualizar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName + '-tab').classList.add('active');
    });
});

// Mostrar modal
function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

// Cerrar modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Event listeners para cerrar modales
document.querySelectorAll('.modal .close-btn, .modal .cancel-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.classList.remove('show');
        }
    });
});

// Cerrar modal al hacer click fuera
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar si hay sesión activa
    if (auth.isAuthenticated()) {
        const isValid = await auth.verify();
        
        if (isValid) {
            const user = auth.getUser();
            showDashboard(user);
        } else {
            showScreen('login');
        }
    } else {
        showScreen('login');
    }
});
