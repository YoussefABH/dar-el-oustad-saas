export async function renderDashboard(container) {
    const state = window.appState;
    if (!state || !state.centreId) {
        container.innerHTML = '<div class="card">Erreur : centre non trouvé</div>';
        return;
    }
    const { data: students, error } = await window.supabaseClient
        .from('students')
        .select('status, payment_amount')
        .eq('centre_id', state.centreId);
    if (error) {
        container.innerHTML = `<div class="card">Erreur : ${error.message}</div>`;
        return;
    }
    const total = students?.length || 0;
    const paid = students?.filter(s => s.status === 'Paid').length || 0;
    const revenue = students?.reduce((s, a) => s + (Number(a.payment_amount) || 0), 0) || 0;
    container.innerHTML = `
        <div class="card">
            <h2>Bienvenue, ${state.user?.email}</h2>
            <p>Total étudiants : ${total}</p>
            <p>Payés : ${paid}</p>
            <p>En attente : ${total - paid}</p>
            <p>Revenus : ${revenue} DH</p>
        </div>
    `;
}
