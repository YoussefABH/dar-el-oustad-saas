export async function renderStudents(container) {
    const state = window.appState;
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
            <div id="students-list"></div>
        </div>
    `;
    await loadStudentsList(container, isDirector);
    if (isDirector) {
        const form = container.querySelector('#student-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await addStudent(container);
            await loadStudentsList(container, true);
            form.reset();
        });
    }
}

async function loadStudentsList(container, isDirector) {
    const listDiv = container.querySelector('#students-list');
    if (!listDiv) return;
    listDiv.innerHTML = '<div class="loader">Chargement...</div>';
    const state = window.appState;
    const { data: students, error } = await window.supabaseClient
        .from('students')
        .select('*')
        .eq('centre_id', state.centreId)
        .order('created_at', { ascending: false });
    if (error) {
        listDiv.innerHTML = `<div class="error">Erreur : ${error.message}</div>`;
        return;
    }
    if (students.length === 0) {
        listDiv.innerHTML = '<p>Aucun étudiant.</p>';
        return;
    }
    let html = `<table class="data-table"><thead><tr><th>Nom</th><th>Niveau</th><th>Filière</th><th>Paiement</th><th>Statut</th>${isDirector ? '<th>Actions</th>' : ''}</tr></thead><tbody>`;
    students.forEach(s => {
        html += `<tr>
            <td>${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.level || '-')}</td>
            <td>${escapeHtml(s.track || '-')}</td>
            <td>${s.payment_amount || 0} DH</td>
            <td>${s.status}</td>
            ${isDirector ? `<td><button class="btn-edit" data-id="${s.id}" data-name="${escapeHtml(s.name)}" data-level="${escapeHtml(s.level||'')}" data-track="${escapeHtml(s.track||'')}" data-payment="${s.payment_amount||0}" data-status="${s.status}">Modifier</button> <button class="btn-delete" data-id="${s.id}">Supprimer</button></td>` : ''}
        </tr>`;
    });
    html += `</tbody></table>`;
    listDiv.innerHTML = html;
    if (isDirector) {
        listDiv.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', () => deleteStudent(btn.dataset.id, container)));
        listDiv.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => openEditModal(btn.dataset, container)));
    }
}

async function addStudent(container) {
    const state = window.appState;
    const name = container.querySelector('#student-name').value.trim();
    if (!name) return alert("Nom requis");
    const level = container.querySelector('#student-level').value;
    const track = container.querySelector('#student-track').value;
    const payment = parseFloat(container.querySelector('#student-payment').value) || 0;
    const status = container.querySelector('#student-status').value;
    const { error } = await window.supabaseClient.from('students').insert([{
        centre_id: state.centreId,
        name, level, track, payment_amount: payment, status,
        created_by: state.user.id
    }]);
    if (error) alert("Erreur : " + error.message);
}

async function deleteStudent(id, container) {
    if (!confirm("Supprimer définitivement ?")) return;
    const { error } = await window.supabaseClient.from('students').delete().eq('id', id);
    if (error) alert("Erreur : " + error.message);
    else await loadStudentsList(container, true);
}

function openEditModal(data, container) {
    const modalHtml = `
        <div id="edit-modal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Modifier l'étudiant</h3>
                <input type="hidden" id="edit-id" value="${data.id}">
                <div class="form-group"><label>Nom</label><input type="text" id="edit-name" value="${escapeHtml(data.name)}"></div>
                <div class="form-group"><label>Niveau</label><input type="text" id="edit-level" value="${escapeHtml(data.level)}"></div>
                <div class="form-group"><label>Filière</label><input type="text" id="edit-track" value="${escapeHtml(data.track)}"></div>
                <div class="form-group"><label>Paiement</label><input type="number" id="edit-payment" value="${data.payment}"></div>
                <div class="form-group"><label>Statut</label><select id="edit-status"><option value="Paid" ${data.status==='Paid'?'selected':''}>Payé</option><option value="Pending" ${data.status==='Pending'?'selected':''}>En attente</option></select></div>
                <button id="save-edit" class="btn">Enregistrer</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'flex';
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    document.getElementById('save-edit').onclick = async () => {
        const id = document.getElementById('edit-id').value;
        const name = document.getElementById('edit-name').value.trim();
        const level = document.getElementById('edit-level').value;
        const track = document.getElementById('edit-track').value;
        const payment = parseFloat(document.getElementById('edit-payment').value) || 0;
        const status = document.getElementById('edit-status').value;
        if (!name) return alert("Nom requis");
        const { error } = await window.supabaseClient.from('students').update({ name, level, track, payment_amount: payment, status }).eq('id', id);
        if (error) alert("Erreur : " + error.message);
        else {
            modal.remove();
            await loadStudentsList(container, true);
        }
    };
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m] || m));
}
