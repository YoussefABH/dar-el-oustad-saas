import { ApiService } from '../../services/api.js';
import { escapeHtml, showAlert, withLoading } from '../../utils/dom.js';

export async function render(container) {
    container.innerHTML = `
        <div class="card">
            <h2>💰 Journal des Paiements & Comptabilité</h2>
            <form id="payment-form" class="form-row">
                <select id="p-student" required><option value="">-- Sélectionner l'élève débiteur --</option></select>
                <input type="number" id="p-amount" placeholder="Montant encaissé (DH)" min="0" required>
                <select id="p-method">
                    <option value="cash">💵 Espèces</option>
                    <option value="transfer">🏦 Virement / Chèque</option>
                </select>
                <button type="submit" id="p-submit" class="btn">Encaisser le versement</button>
            </form>
        </div>
        <div class="card">
            <h3>Historique Complet des Recettes de Caisse</h3>
            <div id="payments-history-wrapper"></div>
        </div>
    `;

    const form = container.querySelector('#payment-form');
    const studentSelect = document.getElementById('p-student');
    const submitBtn = container.querySelector('#p-submit');

    try {
        // Peuplement dynamique de la liste des étudiants débiteurs
        const students = await ApiService.fetchStudents();
        students.forEach(s => {
            studentSelect.insertAdjacentHTML('beforeend', `<option value="${s.id}">${escapeHtml(s.name)}</option>`);
        });
    } catch (err) {
        showAlert('Erreur lors de la récupération des fiches étudiants.', 'error');
    }

    await refreshHistory();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const paymentData = {
            student_id: studentSelect.value,
            amount: parseFloat(document.getElementById('p-amount').value),
            payment_date: new Date().toISOString().slice(0, 10),
            payment_method: document.getElementById('p-method').value
        };

        await withLoading(submitBtn, async () => {
            await ApiService.createPayment(paymentData);
            showAlert('Règlement enregistré au livre de caisse', 'success');
            form.reset();
            await refreshHistory();
        });
    });
}

async function refreshHistory() {
    const wrapper = document.getElementById('payments-history-wrapper');
    if (!wrapper) return;

    try {
        const data = await ApiService.fetchPayments();

        if (!data || data.length === 0) {
            wrapper.innerHTML = '<p style="color: #64748b; font-style: italic;">Aucun mouvement financier enregistré.</p>';
            return;
        }

        wrapper.innerHTML = `
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Date</th><th>Étudiant Émetteur</th><th>Montant Perçu</th><th>Mode de Règlement</th></tr></thead>
                    <tbody>
                        ${data.map(p => `
                            <tr>
                                <td>${escapeHtml(p.payment_date)}</td>
                                <td><strong>${escapeHtml(p.students?.name || 'Étudiant Supprimé')}</strong></td>
                                <td style="color:#16a34a; font-weight:600;">+ ${p.amount} DH</td>
                                <td><span style="font-size:0.85rem; background:#f8fafc; border:1px solid #e2e8f0; padding:2px 6px; border-radius:4px;">${p.payment_method === 'cash' ? 'Espèces' : 'Virement'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        wrapper.innerHTML = '<p style="color:#ef4444;">Échec du chargement du journal de caisse.</p>';
    }
}
