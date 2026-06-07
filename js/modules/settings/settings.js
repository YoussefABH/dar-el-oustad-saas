import { getAppState, setAppState } from '../../core/state.js';
import { showAlert } from '../../utils/dom.js';

export async function render(container) {
    const state = getAppState();

    container.innerHTML = `
        <div class="card">
            <h2>⚙️ Paramètres Généraux de l'Établissement</h2>
            <form id="settings-form">
                <div class="form-group">
                    <label>Raison Sociale de l'École</label>
                    <input type="text" id="set-name" value="${state.config?.establishment?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Identifiant Commun des Entreprises (ICE)</label>
                    <input type="text" id="set-ice" value="${state.config?.legal?.ice || ''}">
                </div>
                <button type="submit" class="btn">Sauvegarder les changements</button>
            </form>
        </div>
    `;

    container.querySelector('#settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updated = {
            establishment: { name: document.getElementById('set-name').value.trim() },
            legal: { ice: document.getElementById('set-ice').value.trim() }
        };

        const { error } = await window.supabaseClient
            .from('settings')
            .upsert({ centre_id: state.centreId, ...updated }, { onConflict: 'centre_id' });

        if (error) showAlert(error.message, 'error');
        else {
            showAlert('Configuration mise à jour', 'success');
            setAppState({ config: { ...state.config, ...updated } });
        }
    });
}
