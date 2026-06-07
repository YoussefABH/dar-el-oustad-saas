import { ApiService } from '../services/api.js';
import { getAppState, setAppState } from '../core/state.js';
import { showAlert, withLoading } from '../utils/dom.js';

export async function render(container) {
    const state = getAppState();
    const config = state.config || { establishment: {}, legal: {} };

    container.innerHTML = `
        <div class="card">
            <h2>⚙️ Paramètres généraux</h2>
            <form id="settings-form">
                <div class="form-group">
                    <label>Nom officiel de l'établissement</label>
                    <input type="text" id="set-name" value="${config.establishment?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>ICE (Identifiant Commun d'Entreprise)</label>
                    <input type="text" id="set-ice" value="${config.legal?.ice || ''}">
                </div>
                <div class="form-group">
                    <label>Email de contact</label>
                    <input type="email" id="set-email" value="${config.contact?.email || ''}">
                </div>
                <div class="form-group">
                    <label>Téléphone</label>
                    <input type="tel" id="set-phone" value="${config.contact?.phone || ''}">
                </div>
                <button type="submit" class="btn">Sauvegarder la configuration</button>
            </form>
        </div>
    `;

    const form = container.querySelector('#settings-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        await withLoading(btn, async () => {
            const updated = {
                establishment: { name: document.getElementById('set-name').value.trim() },
                legal: { ice: document.getElementById('set-ice').value.trim() },
                contact: {
                    email: document.getElementById('set-email').value.trim(),
                    phone: document.getElementById('set-phone').value.trim()
                }
            };
            await ApiService.updateCentreSettings(updated);
            setAppState({ config: { ...state.config, ...updated } });
            showAlert('Paramètres mis à jour', 'success');
        });
    });
}
