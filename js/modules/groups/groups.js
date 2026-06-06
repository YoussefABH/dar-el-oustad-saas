// Module Gestion des groupes/classes
window.renderGroups = async function() {
    const container = document.getElementById('content-container');
    const state = window.getAppState();
    if (!state) return;
    
    const isDirector = state.role === 'director';
    
    container.innerHTML = `
        <div class="card">
            <h2>Gestion des groupes</h2>
            ${isDirector ? `
                <form id="group-form" class="form-row">
                    <input type="text" id="group-name" placeholder="Nom du groupe (ex: 3ème Maths)" required>
                    <input type="text" id="group-desc" placeholder="Description">
                    <select id="group-teacher">
                        <option value="">Sélectionner un enseignant</option>
                    </select>
                    <button type="submit" class="btn">Ajouter</button>
                </form>
            ` : '<p>Mode consultation uniquement</p>'}
        </div>
        <div class="card">
            <h3>Liste des groupes</h3>
            <div id="groups-list-container"></div>
        </div>
    `;
    
    // Charger la liste des enseignants pour le select (si directeur)
    if (isDirector) {
        await loadTeachersForSelect();
    }
    await loadGroupsList(isDirector);
    
    if (isDirector) {
        document.getElementById('group-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await addGroup();
            await loadGroupsList(true);
            document.getElementById('group-name').value = '';
            document.getElementById('group-desc').value = '';
            document.getElementById('group-teacher').value = '';
        });
    }
};

async function loadTeachersForSelect() {
    const state = window.getAppState();
    if (!state) return;
    const { data: teachers, error } = await supabaseClient
        .from('teachers')
        .select('id, full_name')
        .eq('centre_id', state.centreId);
    if (error) return;
    const select = document.getElementById('group-teacher');
    if (!select) return;
    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.full_name;
        select.appendChild(option);
    });
}

async function loadGroupsList(isDirector) {
    const container = document.getElementById('groups-list-container');
    if (!container) return;
    container.innerHTML = '<div class="loader">Chargement...</div>';
    const state = window.getAppState();
    if (!state || !state.centreId) return;
    
    const { data: groups, error } = await supabaseClient
        .from('groups')
        .select(`
            *,
            teachers:teacher_id (full_name)
        `)
        .eq('centre_id', state.centreId)
        .order('created_at', { ascending: false });
    
    if (error) {
        container.innerHTML = `<div class="error">Erreur : ${error.message}</div>`;
        return;
    }
    
    if (groups.length === 0) {
        container.innerHTML = '<p>Aucun groupe.</p>';
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr><th>Nom</th><th>Description</th><th>Enseignant</th>${isDirector ? '<th>Actions</th>' : ''} </thead>
            <tbody>
    `;
    groups.forEach(g => {
        html += `
            <tr>
                <td>${escapeHtml(g.name)}</td>
                <td>${escapeHtml(g.description || '-')}</td>
                <td>${g.teachers ? escapeHtml(g.teachers.full_name) : 'Non assigné'}</td>
                ${isDirector ? `
                    <td>
                        <button class="btn-edit-group btn-sm" data-id="${g.id}" data-name="${escapeHtml(g.name)}" data-desc="${escapeHtml(g.description || '')}" data-teacher="${g.teacher_id || ''}">Modifier</button>
                        <button class="btn-delete-group btn-sm btn-danger" data-id="${g.id}">Supprimer</button>
                    </td>
                ` : ''}
            </table>
        `;
    });
    html += `</tbody><tr>`;
    container.innerHTML = html;
    
    if (isDirector) {
        document.querySelectorAll('.btn-edit-group').forEach(btn => {
            btn.addEventListener('click', () => {
                openEditGroupModal(btn.dataset.id, btn.dataset.name, btn.dataset.desc, btn.dataset.teacher);
            });
        });
        document.querySelectorAll('.btn-delete-group').forEach(btn => {
            btn.addEventListener('click', () => deleteGroup(btn.dataset.id));
        });
    }
}

async function addGroup() {
    const state = window.getAppState();
    if (!state || state.role !== 'director') {
        alert("Seul le directeur peut ajouter des groupes");
        return;
    }
    const name = document.getElementById('group-name').value.trim();
    if (!name) {
        alert("Nom du groupe requis");
        return;
    }
    const description = document.getElementById('group-desc').value;
    const teacher_id = document.getElementById('group-teacher').value || null;
    
    const { error } = await supabaseClient
        .from('groups')
        .insert([{
            centre_id: state.centreId,
            name,
            description,
            teacher_id,
            created_by: state.user.id
        }]);
    if (error) {
        alert("Erreur : " + error.message);
    }
}

async function deleteGroup(id) {
    if (!confirm("Supprimer définitivement ce groupe ?")) return;
    const { error } = await supabaseClient.from('groups').delete().eq('id', id);
    if (error) {
        alert("Erreur : " + error.message);
        return;
    }
    await loadGroupsList(true);
}

function openEditGroupModal(id, name, description, teacherId) {
    const modalHtml = `
        <div id="edit-group-modal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Modifier le groupe</h3>
                <input type="hidden" id="edit-group-id" value="${id}">
                <div class="form-group"><label>Nom</label><input type="text" id="edit-group-name" value="${escapeHtml(name)}"></div>
                <div class="form-group"><label>Description</label><input type="text" id="edit-group-desc" value="${escapeHtml(description)}"></div>
                <div class="form-group">
                    <label>Enseignant</label>
                    <select id="edit-group-teacher"></select>
                </div>
                <button id="save-edit-group" class="btn">Enregistrer</button>
            </div>
        </div>
    `;
    const existing = document.getElementById('edit-group-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('edit-group-modal');
    modal.style.display = 'flex';
    
    // Remplir le select avec les enseignants
    (async () => {
        const state = window.getAppState();
        const { data: teachers } = await supabaseClient
            .from('teachers')
            .select('id, full_name')
            .eq('centre_id', state.centreId);
        const select = document.getElementById('edit-group-teacher');
        select.innerHTML = '<option value="">Aucun</option>';
        teachers.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.full_name;
            if (t.id === teacherId) opt.selected = true;
            select.appendChild(opt);
        });
    })();
    
    document.getElementById('save-edit-group').onclick = async () => {
        await updateGroup();
        modal.remove();
        await loadGroupsList(true);
    };
    document.querySelector('#edit-group-modal .close-modal').onclick = () => modal.remove();
    window.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

async function updateGroup() {
    const id = document.getElementById('edit-group-id').value;
    const name = document.getElementById('edit-group-name').value.trim();
    const description = document.getElementById('edit-group-desc').value;
    const teacher_id = document.getElementById('edit-group-teacher').value || null;
    if (!name) {
        alert("Nom requis");
        return;
    }
    const { error } = await supabaseClient
        .from('groups')
        .update({ name, description, teacher_id })
        .eq('id', id);
    if (error) alert("Erreur : " + error.message);
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
