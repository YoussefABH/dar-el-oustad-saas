// Module Enseignants
export async function renderTeachers(container) {
    const state = window.appState;
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
            <div id="teachers-list"></div>
        </div>
    `;
    await loadTeachersList(container, isDirector);
    if (isDirector) {
        const form = container.querySelector('#teacher-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await addTeacher(container);
            await loadTeachersList(container, true);
            form.reset();
        });
    }
}

async function loadTeachersList(container, isDirector) {
    const listDiv = container.querySelector('#teachers-list');
    if (!listDiv) return;
    listDiv.innerHTML = '<div class="loader">Chargement...</div>';
    const state = window.appState;
    const { data: teachers, error } = await window.supabaseClient
        .from('teachers')
        .select('*')
        .eq('centre_id', state.centreId)
        .order('created_at', { ascending: false });
    if (error) {
        listDiv.innerHTML = `<div class="error">Erreur : ${error.message}</div>`;
        return;
    }
    if (teachers.length === 0) {
        listDiv.innerHTML = '<p>Aucun enseignant.</p>';
        return;
    }
    let html = `<table class="data-table"><thead><tr><th>Nom</th><th>Matière</th><th>Email</th><th>Téléphone</th>${isDirector ? '<th>Actions</th>' : ''}</tr></thead><tbody>`;
    teachers.forEach(t => {
        html += `<tr>
            <td>${escapeHtml(t.full_name)}</td>
            <td>${escapeHtml(t.subject || '-')}</td>
            <td>${escapeHtml(t.email || '-')}</td>
            <td>${escapeHtml(t.phone || '-')}</td>
            ${isDirector ? `<td><button class="btn-edit" data-id="${t.id}" data-name="${escapeHtml(t.full_name)}" data-subject="${escapeHtml(t.subject||'')}" data-email="${escapeHtml(t.email||'')}" data-phone="${escapeHtml(t.phone||'')}">Modifier</button> <button class="btn-delete" data-id="${t.id}">Supprimer</button></td>` : ''}
        </tr>`;
    });
    html += `</tbody></table>`;
    listDiv.innerHTML = html;
    if (isDirector) {
        listDiv.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', () => deleteTeacher(btn.dataset.id, container)));
        listDiv.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => openEditTeacherModal(btn.dataset, container)));
    }
}

async function addTeacher(container) {
    const state = window.appState;
    const full_name = container.querySelector('#teacher-name').value.trim();
    if (!full_name) return alert("Nom requis");
    const subject = container.querySelector('#teacher-subject').value;
    const email = container.querySelector('#teacher-email').value;
    const phone = container.querySelector('#teacher-phone').value;
    const { error } = await window.supabaseClient.from('teachers').insert([{
        centre_id: state.centreId,
        full_name, subject, email, phone,
        created_by: state.user.id
    }]);
    if (error) alert("Erreur : " + error.message);
}

async function deleteTeacher(id, container) {
    if (!confirm("Supprimer définitivement cet enseignant ?")) return;
    const { error } = await window.supabaseClient.from('teachers').delete().eq('id', id);
    if (error) alert("Erreur : " + error.message);
    else await loadTeachersList(container, true);
}

function openEditTeacherModal(data, container) {
    const modalHtml = `
        <div id="edit-teacher-modal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Modifier l'enseignant</h3>
                <input type="hidden" id="edit-id" value="${data.id}">
                <div class="form-group"><label>Nom</label><input type="text" id="edit-name" value="${escapeHtml(data.name)}"></div>
                <div class="form-group"><label>Matière</label><input type="text" id="edit-subject" value="${escapeHtml(data.subject)}"></div>
                <div class="form-group"><label>Email</label><input type="email" id="edit-email" value="${escapeHtml(data.email)}"></div>
                <div class="form-group"><label>Téléphone</label><input type="tel" id="edit-phone" value="${escapeHtml(data.phone)}"></div>
                <button id="save-edit" class="btn">Enregistrer</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('edit-teacher-modal');
    modal.style.display = 'flex';
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    document.getElementById('save-edit').onclick = async () => {
        const id = document.getElementById('edit-id').value;
        const name = document.getElementById('edit-name').value.trim();
        const subject = document.getElementById('edit-subject').value;
        const email = document.getElementById('edit-email').value;
        const phone = document.getElementById('edit-phone').value;
        if (!name) return alert("Nom requis");
        const { error } = await window.supabaseClient.from('teachers').update({ full_name: name, subject, email, phone }).eq('id', id);
        if (error) alert("Erreur : " + error.message);
        else {
            modal.remove();
            await loadTeachersList(container, true);
        }
    };
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m] || m));
                                       }
