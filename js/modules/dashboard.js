import { ApiService } from '../../services/api.js';
import { escapeHtml } from '../../utils/dom.js';

export async function render(container) {
    container.innerHTML = `
        <div style="display: flex; justify-content: center; padding: 40px;">
            <div class="spinner"></div>
        </div>
    `;

    try {
        const students = await ApiService.fetchStudents();
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
                <h3>📈 Dernières Inscriptions</h3>
                <div class="data-table-container">
                    <table class="data-table">
                        <thead>
                            <tr><th>Nom</th><th>Niveau Scolaire</th><th>Statut Règlement</th></tr>
                        </thead>
                        <tbody>
                            ${students.length === 0 ? `<tr><td colspan="3" style="text-align:center; color:#64748b;">Aucun étudiant inscrit.</td></tr>` : 
                              students.slice(0, 5).map(s => `
                                <tr>
                                    <td><strong>${escapeHtml(s.name)}</strong></td>
                                    <td>${escapeHtml(s.level || 'Non spécifié')}</td>
                                    <td>
                                        <span class="btn btn-sm ${s.status === 'Paid' ? '' : 'btn-danger'}" style="pointer-events:none; padding:4px 8px; font-size:0.8rem;">
                                            ${s.status === 'Paid' ? 'Validé' : 'En attente'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="card alert-error">Erreur d'affichage du tableau de bord : ${err.message}</div>`;
    }
}
