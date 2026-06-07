import { getAppState } from '../../core/state.js';
import { escapeHtml, showAlert } from '../../utils/dom.js';

export async function render(container) {
    const state = getAppState();

    container.innerHTML = `
        <div class="card">
            <h2>👨‍👩‍👧‍👦 Gestion des Parents d'Élèves</h2>
            <form id="parent-form" class="form-row">
                <input type="text" id="p-name" placeholder="Nom complet du tuteur" required>
                <input type="tel" id="p-phone" placeholder="Téléphone (ex: 0661......)" required>
                <input type="email" id="p-email" placeholder="Adresse Email (Optionnel)">
                <button type="submit" class="btn">Enregistrer</button>
            </form>
        </div>
        <div class="card">
            <h3>Fiches Contacts Parents</h3>
            <div id="parents-list-wrapper"></div>
        </div>
    `;

    await refreshList();

    container.querySelector('#parent-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            centre_id: state.centreId,
            full_name: document.getElementById('p-name').value.trim(),
            phone: document.getElementById('p-phone').value.trim(),
            email: document.getElementById('p-email').value.trim() || null,
            created_by: state.user.id
        };

        const { error } = await window.supabaseClient.from('parents').insert([payload]);
        if (error) {
            showAlert(error.message, 'error');
        } else {
            showAlert('Fiche parent créée avec succès', 'success');
            e.target.reset();
            await refreshList();
        }
    });
}

async function refreshList() {
    const wrapper = document.getElementById('parents-list-wrapper');
    const { data, error } = await window.supabaseClient
        .from('parents')
        .select('*')
        .eq('centre_id', getAppState().centreId);

    if (error) { 
        wrapper.innerHTML = '<p style="color: #ef4444;">Erreur lors du chargement des données.</p>'; 
        return; 
    }
    if (!data.length) { 
        wrapper.innerHTML = '<p style="color: #64748b;">Aucun parent enregistré pour le moment.</p>'; 
        return; 
    }

    wrapper.innerHTML = `
        <div class="data-table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nom du Tuteur</th>
                        <th>Téléphone</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(p => `
                        <tr>
                            <td><strong>${escapeHtml(p.full_name)}</strong></td>
                            <td>${escapeHtml(p.phone)}</td>
                            <td>${escapeHtml(p.email || '-')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
