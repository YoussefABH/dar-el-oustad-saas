import { getAppState } from '../../core/state.js';
import { escapeHtml, showAlert } from '../../utils/dom.js';

export async function render(container) {
    const state = getAppState();

    container.innerHTML = `
        <div class="card">
            <h2>Configuration des Groupes de cours</h2>
            <form id="group-form" class="form-row">
                <input type="text" id="g-name" placeholder="Nom de la classe / groupe" required>
                <input type="text" id="g-desc" placeholder="Détails (Optionnels)">
                <button type="submit" class="btn">Créer</button>
            </form>
        </div>
        <div class="card">
            <h3>Groupes Ouverts</h3>
            <div id="groups-list-wrapper"></div>
        </div>
    `;

    await refreshList();

    container.querySelector('#group-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const { error } = await window.supabaseClient.from('groups').insert([{
            centre_id: state.centreId,
            name: document.getElementById('g-name').value.trim(),
            description: document.getElementById('g-desc').value.trim(),
            created_by: state.user.id
        }]);

        if (error) showAlert(error.message, 'error');
        else { showAlert('Groupe actif crée', 'success'); e.target.reset(); refreshList(); }
    });
}

async function refreshList() {
    const wrapper = document.getElementById('groups-list-wrapper');
    const { data, error } = await window.supabaseClient.from('groups').select('*').eq('centre_id', getAppState().centreId);

    if (error) { wrapper.innerHTML = 'Erreur.'; return; }
    if (!data.length) { wrapper.innerHTML = 'Aucun groupe structuré.'; return; }

    wrapper.innerHTML = `
        <div class="data-table-container">
            <table class="data-table">
                <thead><tr><th>Identifiant du Groupe</th><th>Description</th></tr></thead>
                <tbody>
                    ${data.map(g => `<tr><td><strong>${escapeHtml(g.name)}</strong></td><td>${escapeHtml(g.description || '-')}</td></tr>`).join('')}
                </tbody>
            </table>
        </div>
    `;
}
