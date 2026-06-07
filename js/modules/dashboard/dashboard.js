import { getAppState } from '../../core/state.js';
import { escapeHtml } from '../../utils/dom.js';

export async function render(container) {
    const state = getAppState();
    const { data: students, error } = await window.supabaseClient
        .from('students')
        .select('*')
        .eq('centre_id', state.centreId);

    if (error) {
        container.innerHTML = `<div class="card alert-error">Erreur: ${error.message}</div>`;
        return;
    }

    const total = students.length;
    const paid = students.filter(s => s.status === 'Paid').length;
    const pending = total - paid;
    const revenue = students.reduce((acc, s) => acc + (Number(s.payment_amount) || 0), 0);

    container.innerHTML = `
        <div class="dashboard-grid">
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#e0f2fe; color:#0369a1;">👩‍🎓</div>
                <div><div class="kpi-title">Total Étudiants</div><div class="kpi-value">${total}</div></div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#dcfce7; color:#15803d;">✅</div>
                <div><div class="kpi-title">Règlements Validés</div><div class="kpi-value">${paid}</div></div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#fef3c7; color:#b45309;">⏳</div>
                <div><div class="kpi-title">En Attente</div><div class="kpi-value">${pending}</div></div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon" style="background:#f3e8ff; color:#6b21a8;">💰</div>
                <div><div class="kpi-title">Chiffre d'Affaires</div><div class="kpi-value">${revenue} DH</div></div>
            </div>
        </div>

        <div class="card">
            <h3>📈 Inscriptions Récentes</h3>
            <div class="data-table-container">
                <table class="data-table">
                    <thead>
                        <tr><th>Nom</th><th>Niveau</th><th>Statut</th></tr>
                    </thead>
                    <tbody>
                        ${students.slice(0, 5).map(s => `
                            <tr>
                                <td>${escapeHtml(s.name)}</td>
                                <td>${escapeHtml(s.level || '-')}</td>
                                <td><span class="btn btn-sm ${s.status === 'Paid' ? '' : 'btn-danger'}">${s.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
