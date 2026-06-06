// Module Gestion des enseignants
window.renderTeachers = async function() {
    const container = document.getElementById('content-container');
    const state = window.getAppState();
    if (!state) return;
    
    const isDirector = state.role === 'director';
    
    container.innerHTML = `
        <div class="card">
            <h2>Gestion des enseignants</h2>
            ${isDirector ? `
                <form id="teacher-form" class="form-row">
                    <input type="text" id="teacher-name" placeholder="Nom complet" required>
                    <input type="text" id="teacher-subject" placeholder="Matière">
                    <input type="email" id="teacher-email" placeholder="Email">
                    <input type="tel" id="teacher-phone" placeholder="Téléphone">
                    <button type="submit" class="btn">Ajouter</button>
                </form>
            ` : '<p>Mode consultation uniquement</p>'}
        </div>
        <div class="card">
            <h3>Liste des enseignants</h3>
            <div id="teachers-list-container"></div>
        </div>
    `;
    
    await loadTeachersList(isDirector);
    
    if (isDirector) {
        document.getElementById('teacher-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await addTeacher();
            await loadTeachersList(true);
        });
    }
};

async function loadTeachersList(isDirector) {
    const container = document.getElementById('teachers-list-container');
    if (!container) return;
    container.innerHTML = '<div class="loader">Chargement...</div>';
    const state = window.getAppState();
    if (!state || !state.centreId) return;
    
    const { data: teachers, error } = await supabaseClient
        .from('teachers')
        .select('*')
        .eq('centre_id', state.centreId)
        .order('created_at', { ascending: false });
    
    if (error) {
        container.innerHTML = `<div class="error">Erreur : ${error.message}</div>`;
        return;
    }
    
    if (teachers.length === 0) {
        container.innerHTML = '<p>Aucun enseignant.</p>';
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead><tr><th>Nom</th><th>Matière</th><th>Email</th><th>Téléphone</th>${isDirector ? '<th>Actions</th>' : ''}</tr></thead>
            <tbody>
    `;
    teachers.forEach(t => {
        html += `
            <tr>
                <td>${escapeHtml(t.full_name)}</td>
                <td>${escapeHtml(t.subject || '-')}</td>
                <td>${escapeHtml(t.email || '-')}</td>
                <td>${escapeHtml(t.phone || '-')}</td>
                ${isDirector ? `
                    <td>
                        <button class="btn-edit-teacher btn-sm" data-id="${t.id}" data-name="${escapeHtml(t.full_name)}" data-subject="${escapeHtml(t.subject || '')}" data-email="${escapeHtml(t.email || '')}" data-phone="${escapeHtml(t.phone || '')}">Modifier</button>
                        <button class="btn-delete-teacher btn-sm btn-danger" data-id="${t.id}">Supprimer</button>
                    </td>
                ` : ''}
            </tr>
        `;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
    
    if (isDirector) {
        document.querySelectorAll('.btn-edit-teacher').forEach(btn => {
            btn.addEventListener('click', () => {
                openEditTeacherModal(btn.dataset.id, btn.dataset.name, btn.dataset.subject, btn.dataset.email, btn.dataset.phone);
            });
        });
        document.querySelectorAll('.btn-delete-teacher').forEach(btn => {
            btn.addEventListener('click', () => deleteTeacher(btn.dataset.id));
        });
    }
}

async function addTeacher() {
    const state = window.getAppState();
    if (!state || state.role !== 'director') {
        alert("Seul le directeur peut ajouter des enseignants");
        return;
    }
    const full_name = document.getElementById('teacher-name').value.trim();
    if (!full_name) {
        alert("Nom requis");
        return;
    }
    const subject = document.getElementById('teacher-subject').value;
    const email = document.getElementById('teacher-email').value;
    const phone = document.getElementById('teacher-phone').value;
    
    const { error } = await supabaseClient
        .from('teachers')
        .insert([{
            centre_id: state.centreId,
            full_name,
            subject,
            email,
            phone,
            created_by: state.user.id
        }]);
    if (error) {
        alert("Erreur : " + error.message);
        return;
    }
    document.getElementById('teacher-name').value = '';
    document.getElementById('teacher-subject').value = '';
    document.getElementById('teacher-email').value = '';
    document.getElementById('teacher-phone').value = '';
}

async function deleteTeacher(id) {
    if (!confirm("Supprimer définitivement cet enseignant ?")) return;
    const { error } = await supabaseClient.from('teachers').delete().eq('id', id);
    if (error) {
        alert("Erreur : " + error.message);
        return;
    }
    await loadTeachersList(true);
}

function openEditTeacherModal(id, name, subject, email, phone) {
    const modalHtml = `
        <div id="edit-teacher-modal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Modifier l'enseignant</h3>
                <input type="hidden" id="edit-teacher-id" value="${id}">
                <div class="form-group"><label>Nom</label><input type="text" id="edit-teacher-name" value="${escapeHtml(name)}"></div>
                <div class="form-group"><label>Matière</label><input type="text" id="edit-teacher-subject" value="${escapeHtml(subject)}"></div>
                <div class="form-group"><label>Email</label><input type="email" id="edit-teacher-email" value="${escapeHtml(email)}"></div>
                <div class="form-group"><label>Téléphone</label><input type="tel" id="edit-teacher-phone" value="${escapeHtml(phone)}"></div>
                <button id="save-edit-teacher" class="btn">Enregistrer</button>
            </div>
        </div>
    `;
    const existing = document.getElementById('edit-teacher-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('edit-teacher-modal');
    modal.style.display = 'flex';
    document.getElementById('save-edit-teacher').onclick = async () => {
        await updateTeacher();
        modal.remove();
        await loadTeachersList(true);
    };
    document.querySelector('#edit-teacher-modal .close-modal').onclick = () => modal.remove();
    window.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

async function updateTeacher() {
    const id = document.getElementById('edit-teacher-id').value;
    const name = document.getElementById('edit-teacher-name').value.trim();
    const subject = document.getElementById('edit-teacher-subject').value;
    const email = document.getElementById('edit-teacher-email').value;
    const phone = document.getElementById('edit-teacher-phone').value;
    if (!name) {
        alert("Nom requis");
        return;
    }
    const { error } = await supabaseClient
        .from('teachers')
        .update({ full_name: name, subject, email, phone })
        .eq('id', id);
    if (error) alert("Erreur : " + error.message);
}
