// Gestión de políticas
let currentPolicies = [];
let editingPolicyId = null;

// Cargar políticas
async function loadPolicies() {
    await loadActivePolicy();
    await loadAllPolicies();
}

// Cargar política activa
async function loadActivePolicy() {
    const container = document.getElementById('active-policy-content');
    container.innerHTML = '<div class="loading">Cargando política activa...</div>';
    
    try {
        const response = await api.get(API.POLICIES_ACTIVE);
        const policy = response.data;
        
        if (policy) {
            container.innerHTML = `
                <div class="policy-grid">
                    <div class="policy-item">
                        <span class="policy-item-label">Longitud Mínima:</span>
                        <span class="policy-item-value">${policy.minLength} caracteres</span>
                    </div>
                    <div class="policy-item">
                        <span class="policy-item-label">Mayúsculas:</span>
                        <span class="policy-item-value">${policy.requireUppercase ? '✓ Sí' : '✗ No'}</span>
                    </div>
                    <div class="policy-item">
                        <span class="policy-item-label">Minúsculas:</span>
                        <span class="policy-item-value">${policy.requireLowercase ? '✓ Sí' : '✗ No'}</span>
                    </div>
                    <div class="policy-item">
                        <span class="policy-item-label">Dígitos:</span>
                        <span class="policy-item-value">${policy.requireDigits ? '✓ Sí' : '✗ No'}</span>
                    </div>
                    <div class="policy-item">
                        <span class="policy-item-label">Símbolos:</span>
                        <span class="policy-item-value">${policy.requireSymbols ? '✓ Sí' : '✗ No'}</span>
                    </div>
                    <div class="policy-item">
                        <span class="policy-item-label">Vigencia Máxima:</span>
                        <span class="policy-item-value">${policy.maxPasswordAgeDays} días</span>
                    </div>
                </div>
                ${policy.description ? `<p style="margin-top: 15px; color: var(--gray);">${escapeHtml(policy.description)}</p>` : ''}
            `;
        } else {
            container.innerHTML = '<div class="loading" style="color: var(--danger);">No hay política activa</div>';
        }
    } catch (error) {
        container.innerHTML = `<div class="loading" style="color: var(--danger);">Error: ${error.message}</div>`;
    }
}

// Cargar todas las políticas
async function loadAllPolicies() {
    const tbody = document.getElementById('policies-tbody');
    tbody.innerHTML = '<tr><td colspan="9" class="loading">Cargando políticas...</td></tr>';
    
    try {
        const response = await api.get(API.POLICIES);
        currentPolicies = response.data || [];
        
        if (currentPolicies.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="loading">No hay políticas</td></tr>';
            return;
        }
        
        tbody.innerHTML = currentPolicies.map(policy => `
            <tr>
                <td>${escapeHtml(policy.description || 'Sin descripción')}</td>
                <td>${policy.minLength}</td>
                <td>${policy.requireUppercase ? '✓' : '✗'}</td>
                <td>${policy.requireLowercase ? '✓' : '✗'}</td>
                <td>${policy.requireDigits ? '✓' : '✗'}</td>
                <td>${policy.requireSymbols ? '✓' : '✗'}</td>
                <td>${policy.maxPasswordAgeDays}</td>
                <td><span class="badge ${policy.isActive ? 'badge-active' : 'badge-inactive'}">${policy.isActive ? 'Activa' : 'Inactiva'}</span></td>
                <td>
                    ${!policy.isActive ? `
                        <button class="btn btn-success action-btn" onclick="activatePolicy('${policy._id}')">
                            Activar
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary action-btn" onclick="editPolicy('${policy._id}')">
                        Editar
                    </button>
                    ${!policy.isActive ? `
                        <button class="btn btn-danger action-btn" onclick="deletePolicy('${policy._id}')">
                            Eliminar
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="9" class="loading" style="color: var(--danger);">Error: ${error.message}</td></tr>`;
    }
}

// Abrir modal para nueva política
document.getElementById('add-policy-btn').addEventListener('click', () => {
    editingPolicyId = null;
    document.getElementById('policy-modal-title').textContent = 'Nueva Política';
    document.getElementById('policy-form').reset();
    document.getElementById('policy-minLength').value = '15';
    document.getElementById('policy-maxDays').value = '90';
    document.getElementById('policy-uppercase').checked = true;
    document.getElementById('policy-lowercase').checked = true;
    document.getElementById('policy-digits').checked = true;
    document.getElementById('policy-symbols').checked = true;
    document.getElementById('policy-active').checked = false;
    document.getElementById('policy-form-error').classList.remove('show');
    showModal('policy-modal');
});

// Editar política
function editPolicy(policyId) {
    const policy = currentPolicies.find(p => p._id === policyId);
    if (!policy) return;
    
    editingPolicyId = policyId;
    document.getElementById('policy-modal-title').textContent = 'Editar Política';
    document.getElementById('policy-description').value = policy.description || '';
    document.getElementById('policy-minLength').value = policy.minLength;
    document.getElementById('policy-maxDays').value = policy.maxPasswordAgeDays;
    document.getElementById('policy-uppercase').checked = policy.requireUppercase;
    document.getElementById('policy-lowercase').checked = policy.requireLowercase;
    document.getElementById('policy-digits').checked = policy.requireDigits;
    document.getElementById('policy-symbols').checked = policy.requireSymbols;
    document.getElementById('policy-active').checked = policy.isActive;
    document.getElementById('policy-form-error').classList.remove('show');
    showModal('policy-modal');
}

// Activar política
async function activatePolicy(policyId) {
    if (!confirm('¿Activar esta política? La política actual será desactivada.')) {
        return;
    }
    
    try {
        await api.put(`${API.POLICIES}/${policyId}`, { isActive: true });
        await loadPolicies();
        alert('Política activada exitosamente');
    } catch (error) {
        alert('Error activando política: ' + error.message);
    }
}

// Eliminar política
async function deletePolicy(policyId) {
    if (!confirm('¿Estás seguro de eliminar esta política?')) {
        return;
    }
    
    try {
        await api.delete(`${API.POLICIES}/${policyId}`);
        await loadPolicies();
        alert('Política eliminada exitosamente');
    } catch (error) {
        alert('Error eliminando política: ' + error.message);
    }
}

// Guardar política
document.getElementById('policy-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        description: formData.get('description'),
        minLength: parseInt(formData.get('minLength')),
        maxPasswordAgeDays: parseInt(formData.get('maxPasswordAgeDays')),
        requireUppercase: document.getElementById('policy-uppercase').checked,
        requireLowercase: document.getElementById('policy-lowercase').checked,
        requireDigits: document.getElementById('policy-digits').checked,
        requireSymbols: document.getElementById('policy-symbols').checked,
        isActive: document.getElementById('policy-active').checked
    };
    
    const errorDiv = document.getElementById('policy-form-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('span');
    const spinner = submitBtn.querySelector('.spinner');
    
    errorDiv.classList.remove('show');
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'block';
    
    try {
        if (editingPolicyId) {
            await api.put(`${API.POLICIES}/${editingPolicyId}`, data);
        } else {
            await api.post(API.POLICIES, data);
        }
        
        closeModal('policy-modal');
        await loadPolicies();
        
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
    }
});
