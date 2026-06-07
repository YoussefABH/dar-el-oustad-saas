import { ApiService } from '../services/api.js';
import { escapeHtml, showAlert, withLoading } from '../utils/dom.js';

export async function render(container) {
    container.innerHTML = `
        <div class="card">
            <h2>💰 Encaissements & Facturation</h2>
            <form id="payment-form" class="form-row">
                <select id="p-student" required><option value="">-- Étudiant --</option></select>
                <input type="number" id="p-amount" placeholder="Montant (DH)" required>
                <select id="p-method">
                    <option value="cash">Espèces</option>
                    <option value="transfer">Virement</option>
                    <option value="card">Carte bancaire</option>
                </select>
                <button type="submit" class="btn">Enregistrer le paiement</button>
            </form>
        </div>
        <div class="card">
            <h3>Historique des transactions</h3>
            <div id="payments-history-wrapper"></div>
        </div>
    `;

    // Remplir la liste des étudiants
    const students = await ApiService.fetchStudents();
    const selectStudent = document.getElementById('p-student');
    students.forEach(s => {
        selectStudent.insertAdjacentHTML('beforeend', `<option value="${s.id}">${escapeHtml(s.name)}</option>`);
    });

    await refreshHistory();

    const form = container.querySelector('#payment-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        await withLoading(btn, async () => {
            await ApiService.createPayment({
                student_id: parseInt(selectStudent.value),
                amount: parseFloat(document.getElementById('p-amount').value),
                payment_date: new Date().toISOString().slice(0,10),
                payment_method: document.getElementById('p-method').value
            });
            showAlert('Paiement enregistré', 'success');
            form.reset();
            await refreshHistory();
        });
    });
}

async function refreshHistory() {
    const wrapper = document.getElementById('payments-history-wrapper');
    try {
        const payments = await ApiService.fetchPayments();
        if (!payments.length) {
            wrapper.innerHTML = '<p>Aucun paiement enregistré.</p>';
            return;
        }
        wrapper.innerHTML = `
            <div class="data-table-container">
                <table class="data-table">
                    <thead><tr><th>Élève</th><th>Montant</th><th>Mode</th><th>Date</th></tr></thead>
                    <tbody>
                        ${payments.map(p => `
                            <tr>
                                <td>${escapeHtml(p.students?.name || 'Inconnu')}</td>
                                <td>${p.amount} DH</td>
                                <td>${p.payment_method === 'cash' ? 'Espèces' : p.payment_method === 'transfer' ? 'Virement' : 'Carte'}</td>
                                <td>${p.payment_date}</td>
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
