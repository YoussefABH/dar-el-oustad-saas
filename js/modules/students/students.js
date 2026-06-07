import { getAppState, isDirector } from '../../core/state.js';
import { escapeHtml, showAlert } from '../../utils/dom.js';

export async function render(container) {
    const state = getAppState();
    const canEdit = isDirector();

    container.innerHTML = `
        <div class="card">
            <h2>👩‍🎓 Gestion des Étudiants</h2>
            ${canEdit ? `
                <form id="student-form" class="form-row">
                    <input type="text" id="s-name" placeholder="Nom complet de l'élève" required>
                    <input type="text" id="s-level" placeholder="Niveau (ex: 2ème année Bac)">
                    <input type="number" id="s-payment" placeholder="Frais d'inscription (DH)" required>
                    <select id="s-status">
                        <option value="Pending">⏳ En attente</option>
                        <option value="Paid">✅ Règlement validé</option>
                    </select>
                    <button type="submit" class="btn">Inscrire l'élève</button>
                </form>
            ` : '<p style="color: #64748b; font-style: italic;">Aperçu en lecture seule (Droits Enseignant).</p>'}
        </div>
        <div class="card">
            <h3>Répertoire des apprenants actifs</h3>
            <div id="students-list-wrapper"></div>
        </div>
    `;

    // Premier chargement de la table des étudiants
    await refreshList();

    // Attachement de l'événement de soumission si l'utilisateur est Directeur
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
            
            if (error) {
                showAlert(error.message, 'error');
            } else {
                showAlert('Étudiant inscrit avec succès', 'success');
                e.target.reset();
                await refreshList(); // Rafraîchissement automatique de la liste
            }
        });
    }
}

/**
 * Charge et reconstruit dynamiquement le tableau des étudiants
 */
async function refreshList() {
    const wrapper = document.getElementById('students-list-wrapper');
    if (!wrapper) return;

    const { data, error } = await window.supabaseClient
        .from('students')
        .select('*')
        .eq('centre_id', getAppState().centreId);
    
    if (error) { 
        wrapper.innerHTML = '<p style="color: #ef4444;">Erreur lors du chargement de la liste des étudiants.</p>'; 
        return; 
    }
    if (!data || !data.length) { 
        wrapper.innerHTML = '<p style="color: #64748b;">Aucun élève enregistré pour le moment dans ce centre.</p>'; 
        return; 
    }

    wrapper.innerHTML = `
        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nom Complet</th>
                        <th>Niveau Scolaire</th>
                        <th>Montant Scolarité</th>
                        <th>Statut Facture</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(s => `
                        <tr>
                            <td><strong>${escapeHtml(s.name)}</strong></td>
                            <td>${escapeHtml(s.level || 'Non spécifié')}</td>
                            <td>${s.payment_amount} DH</td>
                            <td>
                                <span class="btn btn-sm ${s.status === 'Paid' ? '' : 'btn-danger'}" style="pointer-events: none; padding: 4px 8px; font-size: 0.8rem;">
                                    ${s.status === 'Paid' ? 'Reglé' : 'En attente'}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
