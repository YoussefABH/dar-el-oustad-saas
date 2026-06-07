// Module Dashboard – version corrigée et sécurisée

export async function renderDashboard(container) {

    const state = window.appState || {};

    if (!container) return;

    if (!state.centreId) {
        container.innerHTML = '<div class="card">Erreur : centre non trouvé</div>';
        return;
    }

    const client = window.supabaseClient;

    if (!client) {
        container.innerHTML = '<div class="card error">Erreur : Supabase non initialisé</div>';
        return;
    }

    try {

        const { data: students, error } = await client
            .from('students')
            .select('id, name, level, status, payment_amount, created_at')
            .eq('centre_id', state.centreId)
            .order('created_at', { ascending: false });

        if (error) {
            container.innerHTML = `<div class="card error">Erreur : ${error.message}</div>`;
            return;
        }

        const list = students || [];

        const total = list.length;
        const paid = list.filter(s => s.status === 'Paid').length;
        const pending = total - paid;

        const revenue = list.reduce(
            (sum, s) => sum + (Number(s.payment_amount) || 0),
            0
        );

        const thisMonth = new Date().getMonth();

        const studentsThisMonth = list.filter(
            s => new Date(s.created_at).getMonth() === thisMonth
        ).length;

        const paidThisMonth = list.filter(
            s => s.status === 'Paid' &&
                 new Date(s.created_at).getMonth() === thisMonth
        ).length;

        const recentStudents = list.slice(0, 5);

        container.innerHTML = `
            <div class="dashboard-grid">

                <div class="kpi-card">
                    <div class="kpi-icon">👩‍🎓</div>
                    <div class="kpi-title">Étudiants</div>
                    <div class="kpi-value">${total}</div>
                    <div class="kpi-trend">+${studentsThisMonth} ce mois</div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-icon">✅</div>
                    <div class="kpi-title">Payés</div>
                    <div class="kpi-value">${paid}</div>
                    <div class="kpi-trend">+${paidThisMonth}</div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-icon">⏳</div>
                    <div class="kpi-title">En attente</div>
                    <div class="kpi-value">${pending}</div>
                </div>

                <div class="kpi-card">
                    <div class="kpi-icon">💰</div>
                    <div class="kpi-title">Revenus</div>
                    <div class="kpi-value">${revenue} DH</div>
                </div>

            </div>

            <div class="card activity-card">
                <h3>📅 Activité récente</h3>

                ${
                    recentStudents.length === 0
                        ? '<p>Aucun étudiant.</p>'
                        : recentStudents.map(s => `
                            <div class="activity-item">
                                <div>
                                    <strong>${escapeHtml(s.name || '')}</strong>
                                    <div style="font-size:12px;opacity:0.7">
                                        ${new Date(s.created_at).toLocaleDateString('fr-FR')}
                                    </div>
                                </div>

                                <span class="${
                                    s.status === 'Paid'
                                        ? 'status-paid'
                                        : 'status-pending'
                                }">
                                    ${s.status === 'Paid' ? 'Payé' : 'En attente'}
                                </span>
                            </div>
                        `).join('')
                }
            </div>
        `;

    } catch (err) {

        container.innerHTML = `
            <div class="card error">
                Erreur dashboard : ${err.message}
            </div>
        `;
    }
}

// Sécurisation HTML
function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
        }
