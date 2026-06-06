// Module Gestion des étudiants
let currentEditId = null;

window.renderStudents = async function() {
    const container = document.getElementById('content-container');
    const state = window.getAppState();
    if (!state) return;
    
    // Vérifier les droits (seul le directeur peut ajouter/modifier/supprimer)
    const isDirector = state.role === 'director';
    
    container.innerHTML = `
        <div class="card">
            <h2>Gestion des étudiants</h2>
            ${isDirector ? `
                <form id="student-form" class="form-row">
                    <input type="text" id="student-name" placeholder="Nom complet" required>
                    <input type="text" id="student-level" placeholder="Niveau">
                    <input type="text" id="student-track" placeholder="Filière">
                    <input type="number" id="student-payment" placeholder="Paiement (DH)">
                    <select id="student-status">
                        <option value="Paid">Payé</option>
                        <option value="Pending">En attente</option>
                    </select>
                    <button type="submit" class="btn">Ajouter</button>
                </form>
            ` : '<p>Mode consultation uniquement</p>'}
        </div>
        <div class="card">
            <h3>Liste des étudiants</h3>
            <div id="students-list-container"></div>
        </div>
    `;
    
    await loadStudentsList(isDirector);
    
    if (isDirector) {
        document.getElementById('student-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await addStudent();
            await loadStudentsList(true);
        });
    }
};

async function loadStudentsList(isDirector) {
    const container = document.getElementById('students-list-container');
    if (!container) return;
    container.innerHTML = '<div class="loader">Chargement...</div>';
    
    const state = window.getAppState();
    if (!state || !state.centreId) return;
    
    const { data: students, error } = await supabaseClient
        .from('students')
        .select('*')
        .eq('centre_id', state.centreId)
        .order('created_at', { ascending: false });
    
    if (error) {
        container.innerHTML = `<div class="error">Erreur : ${error.message}</div>`;
        return;
    }
    
    if (students.length === 0) {
        container.innerHTML = '<p>Aucun étudiant.</p>';
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr><th>Nom</th><th>Niveau</th><th>Filière</th><th>Paiement</th><th>Statut</th>${isDirector ? '<th>Actions</th>' : ''}</tr>
            </thead>
            <tbody>
    `;
    students.forEach(s => {
        html += `
            <tr>
                <td>${escapeHtml(s.name)}</td>
                <td>${escapeHtml(s.level || '-')}</td>
                <td>${escapeHtml(s.track || '-')}</td>
                <td>${s.payment_amount || 0} DH</td>
                <td>${s.status}</td>
                ${isDirector ? `
                    <td>
                        <button class="btn-edit btn-sm" data-id="${s.id}" data-name="${escapeHtml(s.name)}" data-level="${escapeHtml(s.level || '')}" data-track="${escapeHtml(s.track || '')}" data-payment="${s.payment_amount || 0}" data-status="${s.status}">Modifier</button>
                        <button class="btn-delete btn-sm btn-danger" data-id="${s.id}">Supprimer</button>
                    </td>
                ` : ''}
            </tr>
        `;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
    
    if (isDirector) {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                openEditModal(btn.dataset.id, btn.dataset.name, btn.dataset.level, btn.dataset.track, btn.dataset.payment, btn.dataset.status);
            });
        });
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteStudent(btn.dataset.id));
        });
    }
}

async function addStudent() {
    const state = window.getAppState();
    if (!state || state.role !== 'director') {
        alert("Seul le directeur peut ajouter des étudiants");
        return;
    }
    const name = document.getElementById('student-name').value.trim();
    if (!name) {
        alert("Nom requis");
        return;
    }
    const level = document.getElementById('student-level').value;
    const track = document.getElementById('student-track').value;
    const payment = parseFloat(document.getElementById('student-payment').value) || 0;
    const status = document.getElementById('student-status').value;
    
    const { error } = await supabaseClient
        .from('students')
        .insert([{
            centre_id: state.centreId,
            name,
            level,
            track,
            payment_amount: payment,
            status,
            created_by: state.user.id
        }]);
    if (error) {
        alert("Erreur : " + error.message);
        return;
    }
    // Réinitialiser le formulaire
    document.getElementById('student-name').value = '';
    document.getElementById('student-level').value = '';
    document.getElementById('student-track').value = '';
    document.getElementById('student-payment').value = '';
    document.getElementById('student-status').value = 'Pending';
}

async function deleteStudent(id) {
    if (!confirm("Supprimer définitivement cet étudiant ?")) return;
    const { error } = await supabaseClient.from('students').delete().eq('id', id);
    if (error) {
        alert("Erreur : " + error.message);
        return;
    }
    await loadStudentsList(true);
}

function openEditModal(id, name, level, track, payment, status) {
    currentEditId = id;
    const modalHtml = `
        <div id="edit-modal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Modifier l'étudiant</h3>
                <input type="hidden" id="edit-id" value="${id}">
                <div class="form-group"><label>Nom</label><input type="text" id="edit-name" value="${escapeHtml(name)}"></div>
                <div class="form-group"><label>Niveau</label><input type="text" id="edit-level" value="${escapeHtml(level)}"></div>
                <div class="form-group"><label>Filière</label><input type="text" id="edit-track" value="${escapeHtml(track)}"></div>
                <div class="form-group"><label>Paiement (DH)</label><input type="number" id="edit-payment" value="${payment}"></div>
                <div class="form-group"><label>Statut</label>
                    <select id="edit-status">
                        <option value="Paid" ${status === 'Paid' ? 'selected' : ''}>Payé</option>
                        <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>En attente</option>
                    </select>
                </div>
                <button id="save-edit" class="btn">Enregistrer</button>
            </div>
        </div>
    `;
    const existingModal = document.getElementById('edit-modal');
    if (existingModal) existingModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'flex';
    document.getElementById('save-edit').onclick = async () => {
        await updateStudent();
        modal.remove();
        await loadStudentsList(true);
    };
    document.querySelector('#edit-modal .close-modal').onclick = () => modal.remove();
    window.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

async function updateStudent() {
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const level = document.getElementById('edit-level').value;
    const track = document.getElementById('edit-track').value;
    const payment = parseFloat(document.getElementById('edit-payment').value) || 0;
    const status = document.getElementById('edit-status').value;
    if (!name) {
        alert("Nom requis");
        return;
    }
    const { error } = await supabaseClient
        .from('students')
        .update({ name, level, track, payment_amount: payment, status })
        .eq('id', id);
    if (error) {
        alert("Erreur : " + error.message);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
                              }
