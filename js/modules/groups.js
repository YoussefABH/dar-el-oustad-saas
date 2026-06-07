import { ApiService } from '../services/api.js';
import { escapeHtml, showAlert, withLoading } from '../utils/dom.js';

export async function render(container) {
    container.innerHTML = `
        <div class="card">
            <h2>👥 Groupes & Classes</h2>
            <form id="group-form" class="form-row">
                <input type="text" id="g-name" placeholder="Nom du groupe (ex: BAC Sc Maths)" required>
                <input type="text" id="g-desc" placeholder="Description (optionnelle)">
                <button type="submit" class="btn">Créer le groupe</button>
            </form>
        </div>
        <div class="card">
            <h3>Groupes actifs</h3>
            <div id="groups-list-wrapper"></div>
        </div>
    `;

    await refreshList();

    const form = container.querySelector('#group-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        await withLoading(btn, async () => {
            await ApiService.createGroup({
                name: document.getElementById('g-name').value.trim(),
                description: document.getElementById('g-desc').value.trim() || null
            });
            showAlert('Groupe créé avec succès', 'success');
            form.reset();
            await refreshList();
        });
    });
}

async function refreshList() {
    const wrapper = document.getElementById('groups-list-wrapper');
    try {
        const groups = await ApiService.fetchGroups();
        if (!groups.length) {
            wrapper.innerHTML = '<p>Aucun groupe pour le moment.</p>';
            return;
        }
        wrapper.innerHTML = `
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Nom</th><th>Description</th></thead>
                    <tbody>
                        ${groups.map(g => `
                            <tr>
                                <td><strong>${escapeHtml(g.name)}</strong></td>
                                <td>${escapeHtml(g.description || '-')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        wrapper.innerHTML = `<p class="alert-error">Erreur : ${err.message}</p>`;
    }
}
