// Module Payments – Gestion des paiements des étudiants
export async function renderPayments(container) {
    const state = window.appState;
    if (!state || !state.centreId) {
        container.innerHTML = '<div class="card">Erreur : centre non trouvé</div>';
        return;
    }

    const isDirector = state.role === 'director';
    if (!isDirector) {
        container.innerHTML = '<div class="card">Accès réservé au directeur.</div>';
        return;
    }

    // Récupérer la liste des étudiants pour le select
    const { data: students, error } = await window.supabaseClient
        .from('students')
        .select('id, name, payment_amount, status')
        .eq('centre_id', state.centreId)
        .order('name');

    if (error) {
        container.innerHTML = `<div class="card error">Erreur : ${error.message}</div>`;
        return;
    }

    container.innerHTML = `
        <div class="card">
            <h2>💰 Enregistrement de paiement</h2>
            <form id="payment-form">
                <div class="form-group">
                    <label>Étudiant</label>
                    <select id="payment-student" required>
                        <option value="">-- Sélectionner --</option>
                        ${students.map(s => `<option value="${s.id}" data-total="${s.payment_amount || 0}" data-status="${s.status}">${escapeHtml(s.name)} (Total dû: ${s.payment_amount || 0} DH - ${s.status})</option>`).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex:1;">
                        <label>Montant (DH)</label>
                        <input type="number" id="payment-amount" step="0.01" required>
                    </div>
                    <div class="form-group" style="flex:1;">
                        <label>Date</label>
                        <input type="date" id="payment-date" value="${new Date().toISOString().slice(0,10)}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex:1;">
                        <label>Mode de paiement</label>
                        <select id="payment-method" required>
                            <option value="cash">Espèces</option>
                            <option value="bank_transfer">Virement bancaire</option>
                            <option value="check">Chèque</option>
                            <option value="online">Paiement en ligne</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex:1;">
                        <label>Numéro de reçu (optionnel)</label>
                        <input type="text" id="receipt-number">
                    </div>
                </div>
                <div class="form-group">
                    <label>Notes (optionnel)</label>
                    <textarea id="payment-notes" rows="2"></textarea>
                </div>
                <button type="submit" class="btn">Enregistrer le paiement</button>
            </form>
        </div>
        <div class="card">
            <h3>Historique des paiements</h3>
            <div id="payments-list"></div>
        </div>
    `;

    // Charger l'historique des paiements
    await loadPaymentsHistory();

    // Soumission du formulaire
    document.getElementById('payment-form').onsubmit = async (e) => {
        e.preventDefault();
        await addPayment();
        await loadPaymentsHistory();
        document.getElementById('payment-form').reset();
        document.getElementById('payment-date').value = new Date().toISOString().slice(0,10);
    };
}

async function addPayment() {
    const state = window.appState;
    const studentId = document.getElementById('payment-student').value;
    const amount = parseFloat(document.getElementById('payment-amount').value);
    const paymentDate = document.getElementById('payment-date').value;
    const method = document.getElementById('payment-method').value;
    const receiptNumber = document.getElementById('receipt-number').value || null;
    const notes = document.getElementById('payment-notes').value || null;

    if (!studentId) { alert("Veuillez sélectionner un étudiant"); return; }
    if (isNaN(amount) || amount <= 0) { alert("Montant invalide"); return; }
    if (!paymentDate) { alert("Date invalide"); return; }

    // 1. Insérer le paiement
    const { error: insertError } = await window.supabaseClient
        .from('payments')
        .insert({
            centre_id: state.centreId,
            student_id: studentId,
            amount: amount,
            payment_date: paymentDate,
            payment_method: method,
            receipt_number: receiptNumber,
            notes: notes,
            created_by: state.user.id
        });
    if (insertError) {
        alert("Erreur lors de l'enregistrement : " + insertError.message);
        return;
    }

    // 2. Mettre à jour le montant total dû dans students (optionnel)
    // On récupère le total actuel de l'étudiant
    const { data: student } = await window.supabaseClient
        .from('students')
        .select('payment_amount, status')
        .eq('id', studentId)
        .single();
    if (student) {
        const newTotal = Math.max(0, (student.payment_amount || 0) - amount);
        const newStatus = newTotal === 0 ? 'Paid' : (student.status === 'Paid' && newTotal > 0 ? 'Pending' : student.status);
        await window.supabaseClient
            .from('students')
            .update({ payment_amount: newTotal, status: newStatus })
            .eq('id', studentId);
    }
    alert("Paiement enregistré avec succès !");
    // Recharger la liste des étudiants dans le select pour mettre à jour le total affiché
    await refreshStudentSelect();
}

async function loadPaymentsHistory() {
    const state = window.appState;
    const container = document.getElementById('payments-list');
    container.innerHTML = '<div class="loader">Chargement...</div>';

    const { data: payments, error } = await window.supabaseClient
        .from('payments')
        .select(`
            *,
            students (name)
        `)
        .eq('centre_id', state.centreId)
        .order('payment_date', { ascending: false });

    if (error) {
        container.innerHTML = `<div class="error">Erreur : ${error.message}</div>`;
        return;
    }

    if (payments.length === 0) {
        container.innerHTML = '<p>Aucun paiement enregistré.</p>';
        return;
    }

    let html = `<table class="data-table">
        <thead><tr><th>Étudiant</th><th>Montant</th><th>Date</th><th>Mode</th><th>Reçu</th><th>Notes</th></thead>
        <tbody>`;
    payments.forEach(p => {
        const methodLabel = { cash:'Espèces', bank_transfer:'Virement', check:'Chèque', online:'En ligne' }[p.payment_method] || p.payment_method;
        html += `<tr>
            <td>${escapeHtml(p.students?.name || 'Inconnu')}</td>
            <td>${p.amount} DH</td>
            <td>${new Date(p.payment_date).toLocaleDateString('fr-FR')}</td>
            <td>${methodLabel}</td>
            <td>${p.receipt_number || '-'}</td>
            <td>${escapeHtml(p.notes || '-')}</td>
        </tr>`;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;
}

async function refreshStudentSelect() {
    const state = window.appState;
    const { data: students } = await window.supabaseClient
        .from('students')
        .select('id, name, payment_amount, status')
        .eq('centre_id', state.centreId)
        .order('name');
    const select = document.getElementById('payment-student');
    if (select && students) {
        select.innerHTML = '<option value="">-- Sélectionner --</option>' +
            students.map(s => `<option value="${s.id}" data-total="${s.payment_amount || 0}" data-status="${s.status}">${escapeHtml(s.name)} (Total dû: ${s.payment_amount || 0} DH - ${s.status})</option>`).join('');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m] || m));
          }
