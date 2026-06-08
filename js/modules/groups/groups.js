import { ApiService } from '../../services/api.js';
import { escapeHtml, showAlert, withLoading } from '../../utils/dom.js';

export async function render(container) {
    container.innerHTML = `
        <div class="card">
            <h2>👥 Configuration des Groupes de Cours</h2>
            <form id="group-form" class="form-row">
                <input type="text" id="g-name" placeholder="Intitulé du groupe (ex: Groupe 2 - Maths)" required>
                <input type="text" id="g-desc" placeholder="Description courte (Optionnelle)">
                <button type="submit" id="g-submit" class="btn">Créer la classe</button>
            </form>
        </div>
        <div class="card">
            <h3>Groupes Actifs</h3>
            <div id="groups-list-wrapper"></div>
        </div>
    `;

    const form = container.querySelector('#group-form');
    const submitBtn = container.querySelector('#g-submit');

    await refreshList();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const groupData = {
            name: document.getElementById('g-name').value.trim(),
            description: document.getElementById('g-desc').value.trim() || null
        };

        await withLoading(submitBtn, async () => {
            await ApiService.createGroup(groupData);
            showAlert('Groupe de cours créé avec succès', 'success');
            form.reset();
            await refreshList();
        });
    });
}

async function refreshList() {
    const wrapper = document.getElementById('groups-list-wrapper');
    if (!wrapper) return;

    try {
        const data = await ApiService.fetchGroups();

        if (!data || data.length === 0) {
            wrapper.innerHTML = '<p style="color: #64748b; font-style: italic;">Aucun groupe de cours n\'est configuré.</p>';
            return;
        }

        wrapper.innerHTML = `
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Identifiant / Nom du Groupe</th><th>Description</th></tr></thead>
                    <tbody>
                        ${data.map(g => `
                            <tr>
                                <td><strong>${escapeHtml(g.name)}</strong></td>
                                <td>${escapeHtml(g.description || 'Aucun détail fourni')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        wrapper.innerHTML = '<p style="color:#ef4444;">Échec du chargement des groupes.</p>';
    }
}
