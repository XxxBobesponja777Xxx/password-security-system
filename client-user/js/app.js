// Funciones de utilidad de la aplicación

// Mostrar pantalla
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId + '-screen').classList.add('active');
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async () => {
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
