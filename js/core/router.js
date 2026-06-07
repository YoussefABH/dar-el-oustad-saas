const routes = {
    dashboard: '../modules/dashboard/dashboard.js',
    students: '../modules/students/students.js',
    teachers: '../modules/teachers/teachers.js',
    groups: '../modules/groups/groups.js',
    attendance: '../modules/attendance/attendance.js',
    payments: '../modules/payments/payments.js',
    settings: '../modules/settings/settings.js'
};

export async function navigateTo(viewName) {
    const container = document.getElementById('content-container');
    if (!container) return;

    container.innerHTML = `<div class="loader-global"><div class="spinner"></div></div>`;

    try {
        if (!routes[viewName]) throw new Error(`Route "${viewName}" inconnue.`);
        const module = await import(routes[viewName]);
        if (typeof module.render === 'function') {
            await module.render(container);
        } else {
            throw new Error(`Le module ${viewName} ne possède pas de méthode render().`);
        }
    } catch (err) {
        container.innerHTML = `
            <div class="card" style="border-left: 4px solid #ef4444;">
                <h2 style="color: #ef4444;">Erreur d'aiguillage</h2>
                <p>${err.message}</p>
            </div>
        `;
    }
}
