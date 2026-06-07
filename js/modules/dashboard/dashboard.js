import { ApiService } from '../services/api.js';
import { getAppState } from '../core/state.js';
import { escapeHtml } from '../utils/dom.js';

export async function render(container) {
    const state = getAppState();
    
    try {
        const students = await ApiService.fetchStudents();
        const total = students.length;
        const paid = students.filter(s => s.status === 'Paid').length;
        const pending = total - paid;
        const revenue = students.reduce((acc, s) => acc + (Number(s.payment_amount) || 0), 0);

        container.innerHTML = `
            <div class="dashboard-grid">
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:#e0f2fe;">👩‍🎓</div>
                    <div>
                        <div class="kpi-title">Total Étudiants</div>
                        <div class="kpi-value">${total}</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:#dcfce7;">✅</div>
                    <div>
                        <div class="kpi-title">Règlements validés</div>
                        <div class="kpi-value">${paid}</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:#fef3c7;">⏳</div>
                    <div>
                        <div class="kpi-title">En attente</div>
                        <div class="kpi-value">${pending}</div>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon" style="background:#f3e8ff;">💰</div>
                    <div>
                        <div class="kpi-title">Chiffre d'affaires</div>
                        <div class="kpi-value">${revenue} DH</div>
                    </div>
                </div>
            </div>
            <div class="card">
                <h3>📈 Dernières inscriptions</h3>
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr><th>Nom</th><th>Niveau</th><th>Statut paiement</th></tr>
                        </thead>
                        <tbody>
                            ${students.slice(0, 5).map(s => `
                                <tr>
                                    <td><strong>${escapeHtml(s.name)}</strong></td>
                                    <td>${escapeHtml(s.level || '-')}</td>
                                    <td><span class="btn btn-sm ${s.status === 'Paid' ? '' : 'btn-danger'}">${s.status}</span></td>
                                </tr>
                            `).join('')}
                            ${students.length === 0 ? '<tr><td colspan="3">Aucun étudiant inscrit</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="card alert-error">Erreur chargement dashboard : ${err.message}</div>`;
    }
}
