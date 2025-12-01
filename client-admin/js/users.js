// Gestión de usuarios
let currentUsers = [];
let editingUserId = null;

// Cargar usuarios
async function loadUsers() {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Cargando usuarios...</td></tr>';
    
    try {
        const response = await api.get(API.USERS);
        currentUsers = response.data || [];
        
        if (currentUsers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay usuarios</td></tr>';
            return;
        }
        
        tbody.innerHTML = currentUsers.map(user => {
            const daysRemaining = calculateDaysRemaining(user.passwordExpiresAt);
            const badgeClass = daysRemaining <= 7 ? 'badge-warning' : 'badge-active';
            
            return `
                <tr>
                    <td>${escapeHtml(user.email)}</td>
                    <td><span class="badge badge-${user.role}">${user.role}</span></td>
                    <td>${formatDate(user.passwordLastChangedAt)}</td>
                    <td>${formatDate(user.passwordExpiresAt)}</td>
                    <td><span class="badge ${badgeClass}">${daysRemaining} días</span></td>
                    <td>
                        <button class="btn btn-secondary action-btn" onclick="editUser('${user._id}')">
                            Editar
                        </button>
                        <button class="btn btn-danger action-btn" onclick="deleteUser('${user._id}', '${escapeHtml(user.email)}')">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="loading" style="color: var(--danger);">Error: ${error.message}</td></tr>`;
    }
}

// Abrir modal para nuevo usuario
document.getElementById('add-user-btn').addEventListener('click', () => {
    editingUserId = null;
    document.getElementById('user-modal-title').textContent = 'Nuevo Usuario';
    document.getElementById('user-form').reset();
    document.getElementById('user-password-group').style.display = 'block';
    document.getElementById('user-password').required = true;
    document.getElementById('user-form-error').classList.remove('show');
    showModal('user-modal');
});

// Editar usuario
function editUser(userId) {
    const user = currentUsers.find(u => u._id === userId);
    if (!user) return;
    
    editingUserId = userId;
    document.getElementById('user-modal-title').textContent = 'Editar Usuario';
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-role').value = user.role;
    document.getElementById('user-telegram').value = user.telegramChatId || '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-password-group').style.display = 'block';
    document.getElementById('user-password').required = false;
    document.getElementById('user-form-error').classList.remove('show');
    showModal('user-modal');
}

// Eliminar usuario
async function deleteUser(userId, email) {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${email}?`)) {
        return;
    }
    
    try {
        await api.delete(`${API.USERS}/${userId}`);
        await loadUsers();
        alert('Usuario eliminado exitosamente');
    } catch (error) {
        alert('Error eliminando usuario: ' + error.message);
    }
}

// Guardar usuario (crear o actualizar)
document.getElementById('user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        role: formData.get('role'),
        telegramChatId: formData.get('telegramChatId') || undefined
    };
    
    const password = formData.get('password');
    if (password) {
        data.password = password;
    }
    
    const errorDiv = document.getElementById('user-form-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('span');
    const spinner = submitBtn.querySelector('.spinner');
    
    errorDiv.classList.remove('show');
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    
    try {
        if (editingUserId) {
            await api.put(`${API.USERS}/${editingUserId}`, data);
        } else {
            if (!password) {
                throw new Error('La contraseña es requerida para nuevos usuarios');
            }
            await api.post(API.USERS, data);
        }
        
        closeModal('user-modal');
        await loadUsers();
        
    } catch (error) {
        errorDiv.textContent = error.message;
        if (error.message.includes('reasons')) {
            errorDiv.textContent = 'La contraseña no cumple con los requisitos de seguridad';
        }
        errorDiv.classList.add('show');
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
    }
});

// Utilidades
function calculateDaysRemaining(expiresAt) {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
