import { getAppState } from '../../core/state.js';
import { escapeHtml, showAlert } from '../../utils/dom.js';

export async function render(container) {
    const state = getAppState();

    container.innerHTML = `
        <div class="card">
            <h2>💰 Gestion de la Caisse & Facturation</h2>
            <form id="payment-form" class="form-row">
                <select id="p-student" required><option value="">-- Sélectionner l'élève --</option></select>
                <input type="number" id="p-amount" placeholder="Montant perçu (DH)" required>
                <select id="p-method">
                    <option value="cash">Espèces</option>
                    <option value="transfer">Virement</option>
                </select>
                <button type="submit" class="btn">Saisir l'écriture</button>
            </form>
        </div>
        <div class="card">
            <h3>Journal des Recettes</h3>
            <div id="payments-history-wrapper"></div>
        </div>
    `;

    const { data: students } = await window.supabaseClient.from('students').select('id, name').eq('centre_id', state.centreId);
    const pSelect = document.getElementById('p-student');
    if (students) students.forEach(s => pSelect.insertAdjacentHTML('beforeend', `<option value="${s.id}">${escapeHtml(s.name)}</option>`));

    await refreshHistory();

    container.querySelector('#payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const sid = pSelect.value;
        const amt = parseFloat(document.getElementById('p-amount').value);

        const { error } = await window.supabaseClient.from('payments').insert([{
            centre_id: state.centreId,
            student_id: sid,
            amount: amt,
            payment_date: new Date().toISOString().slice(0,10),
            payment_method: document.getElementById('p-method').value,
            created_by: state.user.id
        }]);

        if (error) showAlert(error.message, 'error');
        else { showAlert('Paiement encaissé', 'success'); e.target.reset(); refreshHistory(); }
    });
}

async function refreshHistory() {
    const wrapper = document.getElementById('payments-history-wrapper');
    const { data, error } = await window.supabaseClient.from('payments').select('amount, payment_method, students(name)').eq('centre_id', getAppState().centreId);

    if (error || !data.length) { wrapper.innerHTML = 'Aucun mouvement de fonds.'; return; }

    wrapper.innerHTML = `
        <div class="data-table-container">
            <table class="data-table">
                <thead><tr><th>Élève</th><th>Versement</th><th>Mode</th></tr></thead>
                <tbody>
                    ${data.map(p => `<tr><td>${escapeHtml(p.students?.name || 'Inconnu')}</td><td>${p.amount} DH</td><td>${p.payment_method}</td></tr>`).join('')}
                </tbody>
            </table>
        </div>
    `;
}
