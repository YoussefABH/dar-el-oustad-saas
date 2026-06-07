// Module Groupes
export async function renderGroups(container) {
    const state = window.appState;
    const isDirector = state.role === 'director';
    container.innerHTML = `
        <div class="card">
            <h2>Gestion des groupes</h2>
            ${isDirector ? `
                <form id="group-form" class="form-row">
                    <input type="text" id="group-name" placeholder="Nom du groupe" required>
                    <input type="text" id="group-desc" placeholder="Description">
                    <select id="group-teacher"></select>
                    <button type="submit" class="btn">Ajouter</button>
                </form>
            ` : '<p>Mode consultation uniquement</p>'}
        </div>
        <div class="card">
            <h3>Liste des groupes</h3>
            <div id="groups-list"></div>
        </div>
    `;
    if (isDirector) {
        await loadTeachersSelect(container);
    }
    await loadGroupsList(container, isDirector);
    if (isDirector) {
        const form = container.querySelector('#group-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await addGroup(container);
            await loadGroupsList(container, true);
            form.reset();
        });
    }
}

async function loadTeachersSelect(container) {
    const state = window.appState;
    const { data: teachers } = await window.supabaseClient
        .from('teachers')
        .select('id, full_name')
        .eq('centre_id', state.centreId);
    const select = container.querySelector('#group-teacher');
    select.innerHTML = '<option value="">Sélectionner un enseignant</option>';
    teachers.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id;
        option.textContent = t.full_name;
        select.appendChild(option);
    });
}

async function loadGroupsList(container, isDirector) {
    const listDiv = container.querySelector('#groups-list');
    if (!listDiv) return;
    listDiv.innerHTML = '<div class="loader">Chargement...</div>';
    const state = window.appState;
    const { data: groups, error } = await window.supabaseClient
        .from('groups')
        .select(`*, teachers:teacher_id (full_name)`)
        .eq('centre_id', state.centreId)
        .order('created_at', { ascending: false });
    if (error) {
        listDiv.innerHTML = `<div class="error">Erreur : ${error.message}</div>`;
        return;
    }
    if (groups.length === 0) {
        listDiv.innerHTML = '<p>Aucun groupe.</p>';
        return;
    }
    let html = `<table class="data-table"><thead><tr><th>Nom</th><th>Description</th><th>Enseignant</th>${isDirector ? '<th>Actions</th>' : ''}</tr></thead><tbody>`;
    groups.forEach(g => {
        const teacherName = g.teachers ? g.teachers.full_name : 'Non assigné';
        html += `<tr>
            <td>${escapeHtml(g.name)}</td>
            <td>${escapeHtml(g.description || '-')}</td>
            <td>${escapeHtml(teacherName)}</td>
            ${isDirector ? `<td><button class="btn-edit" data-id="${g.id}" data-name="${escapeHtml(g.name)}" data-desc="${escapeHtml(g.description||'')}" data-teacher="${g.teacher_id||''}">Modifier</button> <button class="btn-delete" data-id="${g.id}">Supprimer</button></td>` : ''}
        </tr>`;
    });
    html += `</tbody></table>`;
    listDiv.innerHTML = html;
    if (isDirector) {
        listDiv.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', () => deleteGroup(btn.dataset.id, container)));
        listDiv.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => openEditGroupModal(btn.dataset, container)));
    }
}

async function addGroup(container) {
    const state = window.appState;
    const name = container.querySelector('#group-name').value.trim();
    if (!name) return alert("Nom requis");
    const description = container.querySelector('#group-desc').value;
    const teacher_id = container.querySelector('#group-teacher').value || null;
    const { error } = await window.supabaseClient.from('groups').insert([{
        centre_id: state.centreId,
        name, description, teacher_id,
        created_by: state.user.id
    }]);
    if (error) alert("Erreur : " + error.message);
}

async function deleteGroup(id, container) {
    if (!confirm("Supprimer définitivement ce groupe ?")) return;
    const { error } = await window.supabaseClient.from('groups').delete().eq('id', id);
    if (error) alert("Erreur : " + error.message);
    else await loadGroupsList(container, true);
}

function openEditGroupModal(data, container) {
    const modalHtml = `
        <div id="edit-group-modal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Modifier le groupe</h3>
                <input type="hidden" id="edit-id" value="${data.id}">
                <div class="form-group"><label>Nom</label><input type="text" id="edit-name" value="${escapeHtml(data.name)}"></div>
                <div class="form-group"><label>Description</label><input type="text" id="edit-desc" value="${escapeHtml(data.desc)}"></div>
                <div class="form-group"><label>Enseignant</label><select id="edit-teacher"></select></div>
                <button id="save-edit" class="btn">Enregistrer</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('edit-group-modal');
    modal.style.display = 'flex';
    // Charger la liste des enseignants dans le select
    (async () => {
        const state = window.appState;
        const { data: teachers } = await window.supabaseClient
            .from('teachers')
            .select('id, full_name')
            .eq('centre_id', state.centreId);
        const select = document.getElementById('edit-teacher');
        select.innerHTML = '<option value="">Aucun</option>';
        teachers.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.full_name;
            if (t.id === data.teacher) opt.selected = true;
            select.appendChild(opt);
        });
    })();
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    document.getElementById('save-edit').onclick = async () => {
        const id = document.getElementById('edit-id').value;
        const name = document.getElementById('edit-name').value.trim();
        const description = document.getElementById('edit-desc').value;
        const teacher_id = document.getElementById('edit-teacher').value || null;
        if (!name) return alert("Nom requis");
        const { error } = await window.supabaseClient.from('groups').update({ name, description, teacher_id }).eq('id', id);
        if (error) alert("Erreur : " + error.message);
        else {
            modal.remove();
            await loadGroupsList(container, true);
        }
    };
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m] || m));
}
