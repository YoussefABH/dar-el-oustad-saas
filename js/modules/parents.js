import { ApiService } from '../services/api.js';
import { escapeHtml, showAlert, withLoading } from '../utils/dom.js';

export async function render(container) {
    container.innerHTML = `
        <div class="card">
            <h2>👨‍👩‍👧‍👦 Gestion des parents</h2>
            <form id="parent-form" class="form-row">
                <input type="text" id="p-name" placeholder="Nom complet du parent" required>
                <input type="tel" id="p-phone" placeholder="Téléphone" required>
                <input type="email" id="p-email" placeholder="Email (optionnel)">
                <button type="submit" class="btn">Ajouter le parent</button>
            </form>
        </div>
        <div class="card">
            <h3>Annuaire des parents</h3>
            <div id="parents-list-wrapper"></div>
        </div>
    `;

    await refreshList();

    const form = container.querySelector('#parent-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        await withLoading(btn, async () => {
            await ApiService.createParent({
                full_name: document.getElementById('p-name').value.trim(),
                phone: document.getElementById('p-phone').value.trim(),
                email: document.getElementById('p-email').value.trim() || null
            });
            showAlert('Parent enregistré', 'success');
            form.reset();
            await refreshList();
        });
    });
}

async function refreshList() {
    const wrapper = document.getElementById('parents-list-wrapper');
    try {
        const parents = await ApiService.fetchParents();
        if (!parents.length) {
            wrapper.innerHTML = '<p>Aucun parent enregistré.</p>';
            return;
        }
        wrapper.innerHTML = `
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Nom</th><th>Téléphone</th><th>Email</th></thead>
                    <tbody>
                        ${parents.map(p => `
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
    } catch (err) {
        wrapper.innerHTML = `<p class="alert-error">Erreur : ${err.message}</p>`;
    }
}
