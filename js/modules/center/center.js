import { ApiService } from '../services/api.js';
import { getAppState, setAppState } from '../core/state.js';
import { escapeHtml, showAlert, withLoading } from '../utils/dom.js';

export async function render(container) {
    const state = getAppState();
    let centreInfo = { name: '', city: '', address: '', phone: '' };

    try {
        centreInfo = await ApiService.fetchCentreInfo();
    } catch (err) {
        console.warn('Aucune info centre trouvée, formulaire vide');
    }

    container.innerHTML = `
        <div class="card">
            <h2>🏢 Fiche d'identité du centre</h2>
            <form id="center-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nom du centre</label>
                        <input type="text" id="c-name" value="${escapeHtml(centreInfo.name || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Ville</label>
                        <input type="text" id="c-city" value="${escapeHtml(centreInfo.city || '')}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Adresse complète</label>
                    <textarea id="c-address" rows="3">${escapeHtml(centreInfo.address || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>Téléphone</label>
                    <input type="tel" id="c-phone" value="${escapeHtml(centreInfo.phone || '')}">
                </div>
                <button type="submit" class="btn">Mettre à jour</button>
            </form>
        </div>
    `;

    const form = container.querySelector('#center-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        await withLoading(btn, async () => {
            const updated = {
                name: document.getElementById('c-name').value.trim(),
                city: document.getElementById('c-city').value.trim(),
                address: document.getElementById('c-address').value.trim(),
                phone: document.getElementById('c-phone').value.trim()
            };
            await ApiService.updateCentreInfo(updated);
            // Mettre à jour l'état global et l'en-tête
            if (state.config && state.config.establishment) {
                state.config.establishment.name = updated.name;
                setAppState({ config: state.config });
            }
            // Rafraîchir le nom dans l'en-tête
            const headerTitle = document.querySelector('header div:first-child');
            if (headerTitle) headerTitle.innerHTML = `🏢 ${escapeHtml(updated.name)}`;
            showAlert('Informations du centre mises à jour', 'success');
        });
    });
}
