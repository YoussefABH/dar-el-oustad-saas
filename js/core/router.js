import { getAppState } from './state.js';

const routes = {
    dashboard: '../modules/dashboard.js',
    students: '../modules/students.js',
    teachers: '../modules/teachers.js',
    groups: '../modules/groups.js',
    attendance: '../modules/attendance.js',
    payments: '../modules/payments.js',
    settings: '../modules/settings.js',
    parents: '../modules/parents.js',
    center: '../modules/center.js'
};

const rolePermissions = {
    director: ['dashboard','students','teachers','groups','attendance','payments','settings','parents','center'],
    teacher: ['dashboard','students','groups','attendance']
};

export async function navigateTo(viewName) {
    const container = document.getElementById('content-container');
    if (!container) return;

    container.innerHTML = `<div class="loader-global"><div class="spinner"></div><p>Chargement...</p></div>`;

    try {
        if (!routes[viewName]) throw new Error(`Route "${viewName}" inconnue.`);

        const state = getAppState();
        if (!rolePermissions[state.role]?.includes(viewName)) {
            container.innerHTML = `<div class="card alert-error">⛔ Accès non autorisé pour votre rôle.</div>`;
            return;
        }

        const module = await import(routes[viewName]);
        if (typeof module.render !== 'function') {
            throw new Error(`Le module ${viewName} n'exporte pas render().`);
        }
        await module.render(container);
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="card alert-error">❌ Erreur : ${err.message}</div>`;
    }
}
