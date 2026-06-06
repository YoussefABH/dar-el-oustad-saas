// Module Dashboard
window.renderDashboard = async function() {
    const container = document.getElementById('content-container');
    container.innerHTML = '<div class="card">Chargement du tableau de bord...</div>';
    const state = window.getAppState?.();
    if (!state) return;

    // Récupérer les étudiants pour afficher des stats
    const { data: students, error } = await supabaseClient
        .from('students')
        .select('*')
        .eq('centre_id', state.centreId);
    if (error) {
        container.innerHTML = `<div class="card error">Erreur : ${error.message}</div>`;
        return;
    }
    const total = students.length;
    const paid = students.filter(s => s.status === 'Paid').length;
    const pending = total - paid;
    const revenue = students.reduce((sum, s) => sum + (Number(s.payment_amount) || 0), 0);
    container.innerHTML = `
        <div class="card">
            <h2>Bienvenue, ${state.user?.email}</h2>
            <div class="stats-grid" style="display:flex; gap:20px; margin-top:20px;">
                <div class="stat-item">Total étudiants : ${total}</div>
                <div class="stat-item">Payés : ${paid}</div>
                <div class="stat-item">En attente : ${pending}</div>
                <div class="stat-item">Revenus : ${revenue} DH</div>
            </div>
        </div>
    `;
};
