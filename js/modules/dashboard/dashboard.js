// Module Dashboard – Affichage moderne avec KPI et activité récente
export async function renderDashboard(container) {
    const state = window.appState;
    if (!state || !state.centreId) {
        container.innerHTML = '<div class="card">Erreur : centre non trouvé</div>';
        return;
    }

    // Charger les étudiants
    const { data: students, error } = await window.supabaseClient
        .from('students')
        .select('id, name, level, status, payment_amount, created_at')
        .eq('centre_id', state.centreId)
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = `<div class="card error">Erreur : ${error.message}</div>`;
        return;
    }

    const total = students?.length || 0;
    const paid = students?.filter(s => s.status === 'Paid').length || 0;
    const pending = total - paid;
    const revenue = students?.reduce((sum, s) => sum + (Number(s.payment_amount) || 0), 0) || 0;

    // Derniers étudiants (5 premiers)
    const recentStudents = students?.slice(0, 5) || [];

    // Statistiques du mois (exemple simplifié : on compare avec le mois dernier fictif)
    const thisMonth = new Date().getMonth();
    const studentsThisMonth = students?.filter(s => new Date(s.created_at).getMonth() === thisMonth).length || 0;
    const paidThisMonth = students?.filter(s => s.status === 'Paid' && new Date(s.created_at).getMonth() === thisMonth).length || 0;

    // Construction HTML
    const html = `
        <div class="dashboard-grid">
            <!-- Cartes KPI -->
            <div class="kpi-card">
                <div class="kpi-icon">👩‍🎓</div>
                <div class="kpi-content">
                    <div class="kpi-title">Étudiants</div>
                    <div class="kpi-value">${total}</div>
                    <div class="kpi-trend">+${studentsThisMonth} ce mois</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon">✅</div>
                <div class="kpi-content">
                    <div class="kpi-title">Payés</div>
                    <div class="kpi-value">${paid}</div>
                    <div class="kpi-trend">+${paidThisMonth} traités</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon">📄</div>
                <div class="kpi-content">
                    <div class="kpi-title">Factures</div>
                    <div class="kpi-value">${paid}</div>
                    <div class="kpi-trend">+${paidThisMonth} à facturer</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon">⏳</div>
                <div class="kpi-content">
                    <div class="kpi-title">En attente</div>
                    <div class="kpi-value">${pending}</div>
                    <div class="kpi-trend">en souffrance</div>
                </div>
            </div>
            <div class="kpi-card">
                <div class="kpi-icon">💰</div>
                <div class="kpi-content">
                    <div class="kpi-title">Revenus</div>
                    <div class="kpi-value">${revenue} DH</div>
                    <div class="kpi-trend">total encaissé</div>
                </div>
            </div>
        </div>

        <!-- Section activité mensuelle -->
        <div class="card activity-card">
            <h3>📅 Activité récente</h3>
            ${recentStudents.length === 0 ? '<p>Aucun étudiant inscrit pour le moment.</p>' : `
                <div class="activity-list">
                    ${recentStudents.map(s => `
                        <div class="activity-item">
                            <div class="activity-name">${escapeHtml(s.name)}</div>
                            <div class="activity-detail">Inscrit le ${new Date(s.created_at).toLocaleDateString('fr-FR')}</div>
                            <div class="activity-status ${s.status === 'Paid' ? 'status-paid' : 'status-pending'}">${s.status === 'Paid' ? 'Payé' : 'En attente'}</div>
                        </div>
                    `).join('')}
                </div>
                ${total > 5 ? `<div class="activity-footer">+${total - 5} autres étudiants</div>` : ''}
            `}
        </div>
    `;

    container.innerHTML = html;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m] || m));
        }
