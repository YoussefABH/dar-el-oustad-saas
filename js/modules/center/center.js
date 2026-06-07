import { getAppState, setAppState } from '../../core/state.js';
import { escapeHtml, showAlert } from '../../utils/dom.js';

export async function render(container) {
    const state = getAppState();

    // Récupération des données actuelles du centre
    const { data: centerData, error } = await window.supabaseClient
        .from('centres')
        .select('*')
        .eq('id', state.centreId)
        .single();

    if (error && !centerData) {
        container.innerHTML = `<div class="card alert-error">Erreur d'accès aux données du centre : ${error.message}</div>`;
        return;
    }

    container.innerHTML = `
        <div class="card">
            <h2>🏢 Identité & Profil du Centre</h2>
            <p style="color: #64748b; margin-bottom: 24px; font-size: 0.9rem;">
                Configurez les détails officiels qui apparaîtront sur vos reçus et fiches d'inscription.
            </p>
            
            <form id="center-profile-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nom du Centre</label>
                        <input type="text" id="c-name" value="${escapeHtml(centerData.name || '')}" required>
                    </div>
                    <div class="form-group">
                        <label>Ville</label>
                        <input type="text" id="c-city" value="${escapeHtml(centerData.city || '')}" placeholder="ex: Casablanca">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Adresse Complète</label>
                    <textarea id="c-address" rows="3" placeholder="Numéro, Rue, Quartier...">${escapeHtml(centerData.address || '')}</textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Téléphone Fixe / Mobile</label>
                        <input type="tel" id="c-phone" value="${escapeHtml(centerData.phone || '')}" placeholder="ex: 0522......">
                    </div>
                    <div class="form-group">
                        <label>Type d'Abonnement Actuel</label>
                        <input type="text" value="${escapeHtml(centerData.plan_type || 'Essai Gratuit')}" disabled style="background: #f1f5f9; cursor: not-allowed; font-weight: 600;">
                    </div>
                </div>

                <button type="submit" class="btn" style="margin-top: 8px;">Enregistrer les informations</button>
            </form>
        </div>
    `;

    container.querySelector('#center-profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedData = {
            name: document.getElementById('c-name').value.trim(),
            city: document.getElementById('c-city').value.trim(),
            address: document.getElementById('c-address').value.trim(),
            phone: document.getElementById('c-phone').value.trim()
        };

        const { error: updateError } = await window.supabaseClient
            .from('centres')
            .update(updatedData)
            .eq('id', state.centreId);

        if (updateError) {
            showAlert(updateError.message, 'error');
        } else {
            showAlert('Fiche d\'identité du centre mise à jour', 'success');
            
            // Mise à jour de la configuration globale de l'état
            if (state.config && state.config.establishment) {
                state.config.establishment.name = updatedData.name;
                setAppState({ config: state.config });
            }
            
            // Rechargement léger de l'en-tête pour refléter le nouveau nom si changé
            const headerTitle = document.querySelector('header div');
            if (headerTitle) {
                headerTitle.innerHTML = `🏢 ${escapeHtml(updatedData.name)}`;
            }
        }
    });
}
