import { getAppState } from '../../core/state.js';
import { escapeHtml, showAlert } from '../../utils/dom.js';

export async function render(container) {
    const state = getAppState();

    container.innerHTML = `
        <div class="card">
            <h2>Gestion des Enseignants</h2>
            <form id="teacher-form" class="form-row">
                <input type="text" id="t-name" placeholder="Nom complet" required>
                <input type="text" id="t-subject" placeholder="Matière" required>
                <input type="email" id="t-email" placeholder="Email (Optionnel)">
                <button type="submit" class="btn">Enregistrer</button>
            </form>
        </div>
        <div class="card">
            <h3>Corps professoral</h3>
            <div id="teachers-list-wrapper"></div>
        </div>
    `;

    await refreshList();

    container.querySelector('#teacher-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            centre_id: state.centreId,
            full_name: document.getElementById('t-name').value.trim(),
            subject: document.getElementById('t-subject').value.trim(),
            email: document.getElementById('t-email').value.trim() || null,
            created_by: state.user.id
        };

        const { error } = await window.supabaseClient.from('teachers').insert([payload]);
        if (error) showAlert(error.message, 'error');
        else { showAlert('Enseignant ajouté', 'success'); e.target.reset(); refreshList(); }
    });
}

async function refreshList() {
    const wrapper = document.getElementById('teachers-list-wrapper');
    const { data, error } = await window.supabaseClient.from('teachers').select('*').eq('centre_id', getAppState().centreId);

    if (error) { wrapper.innerHTML = 'Erreur.'; return; }
    if (!data.length) { wrapper.innerHTML = 'Aucun enseignant.'; return; }

    wrapper.innerHTML = `
        <div class="data-table-container">
            <table class="data-table">
                <thead><tr><th>Nom Nom</th><th>Spécialité</th><th>Email</th></tr></thead>
                <tbody>
                    ${data.map(t => `<tr><td>${escapeHtml(t.full_name)}</td><td>${escapeHtml(t.subject)}</td><td>${escapeHtml(t.email || '-')}</td></tr>`).join('')}
                </tbody>
            </table>
        </div>
    `;
}
