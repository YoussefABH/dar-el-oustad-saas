import { getAppState } from './state.js';

// Table de routage configurée en chemins relatifs par rapport à js/core/router.js
const routes = {
    dashboard: '../modules/dashboard/dashboard.js',
    students: '../modules/students/students.js',
    teachers: '../modules/teachers/teachers.js',
    groups: '../modules/groups/groups.js',
    attendance: '../modules/attendance/attendance.js',
    payments: '../modules/payments/payments.js',
    expenses: '../modules/expenses/expenses.js',
    courses: '../modules/courses/courses.js',
    reports: '../modules/reports/reports.js',
    settings: '../modules/settings/settings.js'
};

const rolePermissions = {
    director: ['dashboard', 'students', 'teachers', 'groups', 'attendance', 'payments', 'expenses', 'courses', 'reports', 'settings'],
    teacher: ['dashboard', 'students', 'groups', 'attendance', 'courses']
};

const loadedModules = {};

export async function navigateTo(viewName) {
    const container = document.getElementById('content-container');
    if (!container) return;

    const state = getAppState();
    if (!state.user) {
        container.innerHTML = `<div class="card alert-error">⛓️ Session expirée. Veuillez vous reconnecter.</div>`;
        return;
    }
    
    if (rolePermissions[state.role] && !rolePermissions[state.role].includes(viewName)) {
        container.innerHTML = `<div class="card alert-error">⛔ Accès non autorisé pour votre rôle (${state.role}).</div>`;
        return;
    }

    container.innerHTML = `<div class="loader-global"><div class="spinner"></div><p>Chargement de ${viewName}...</p></div>`;

    try {
        if (!routes[viewName]) throw new Error(`Route inconnue : ${viewName}`);

        // Résolution d'URL native et absolue, infaillible sur Localhost et GitHub Pages
        const fullPath = new URL(routes[viewName], import.meta.url).href;

        if (!loadedModules[viewName]) {
            loadedModules[viewName] = await import(fullPath);
        }
        
        const module = loadedModules[viewName];
        
        // Rétrocompatibilité de l'état pour les modules dépendants
        window.appState = getAppState();

        if (typeof module.render === 'function') {
            await module.render(container);
        } else {
            throw new Error(`Le module ${viewName} n'exporte pas de fonction 'render'.`);
        }
    } catch (error) {
        console.error(`Erreur de chargement de la vue ${viewName} :`, error);
        container.innerHTML = `
            <div class="card alert-error" style="border-left-color: #e63946;">
                <h3 style="color: #e63946;">⚠️ Erreur technique</h3>
                <p><strong>Fichier cible :</strong> ${routes[viewName] || viewName}</p>
                <p><strong>Détail :</strong> ${error.message}</p>
                <button class="btn btn-sm" onclick="window.location.reload()" style="margin-top: 12px;">⟳ Recharger l'application</button>
            </div>
        `;
    }
}
