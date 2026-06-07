import { getAppState, isDirector } from '../../core/state.js';
import { escapeHtml } from '../../utils/dom.js';
import { showAlert } from '../../utils/dom.js';

export async function render(container) {
    const state = getAppState();
    const canEdit = isDirector();

    container.innerHTML = `
        <div class="card">
            <h2>Gestion des Étudiants</h2>
            ${canEdit ? `
                <form id="student-form" class="form-row">
                    <input type="text" id="s-name" placeholder="Nom complet" required>
                    <input type="text" id="s-level" placeholder="Niveau (ex: Bac)">
                    <input type="number" id="s-payment" placeholder="Frais (DH)" required>
                    <select id="s-status">
                        <option value="Pending">En attente</option>
                        <option value="Paid">Payé</option>
                    </select>
                    <button type="submit" class="btn">Ajouter</button>
                </form>
            ` : '<p style="color: #64748b;">Aperçu en lecture seule.</p>'}
        </div>
        <div class="card">
            <h3>Répertoire des apprenants</h3>
            <div id="students-list-wrapper"></div>
        </div>
    `;

    await refreshList();

    if (canEdit) {
        container.querySelector('#student-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                centre_id: state.centreId,
                name: document.getElementById('s-name').value.trim(),
                level: document.getElementById('s-level').value.trim(),
                payment_amount: parseFloat(document.getElementById('s-payment').value),
                status: document.getElementById('s-status').value,
                created_by: state.user.id
            };

            const { error } = await window.supabaseClient.from('students').insert([payload]);
            if (error) showAlert(error.message, 'error');
            else { showAlert('Étudiant inscrit', 'success'); e.target.reset(); refreshList(); }
        });
    }
}

async function refreshList() {
    const wrapper = document.getElementById('students-list-wrapper');
    const { data, error } = await window.supabaseClient.from('students').select('*').eq('centre_id', getAppState().centreId);
    
    if (error) { wrapper.innerHTML = 'Erreur lors du chargement.'; return; }
    if (!data.length) { wrapper.innerHTML = 'Aucun élève enregistré.'; return; }

    wrapper.innerHTML = `
        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr><th>Nom</th><th>Niveau</th><th>Montant</th><th>Statut</th></tr>
                </thead>
                <tbody>
                    ${data.map(s => `
                        <tr>
                            <td>${escapeHtml(s.name)}</td>
                            <td>${escapeHtml(s.level || '-')}</td>
                            <td>${s.payment_amount} DH</td>
                            <td>${s.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
