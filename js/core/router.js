import { getAppState } from './state.js';

const routes = {
    dashboard: 'js/modules/dashboard/dashboard.js',
    students: 'js/modules/students/students.js',
    teachers: 'js/modules/teachers/teachers.js',
    groups: 'js/modules/groups/groups.js',
    attendance: 'js/modules/attendance/attendance.js',
    payments: 'js/modules/payments/payments.js',
    expenses: 'js/modules/expenses/expenses.js',
    courses: 'js/modules/courses/courses.js',
    reports: 'js/modules/reports/reports.js',
    settings: 'js/modules/settings/settings.js'
};

const rolePermissions = {
    director: ['dashboard', 'students', 'teachers', 'groups', 'attendance', 'payments', 'expenses', 'courses', 'reports', 'settings'],
    teacher: ['dashboard', 'students', 'groups', 'attendance', 'courses']
};

const loadedModules = {};

function getBasePath() {
    const scriptUrl = import.meta.url;
    const index = scriptUrl.indexOf('/js/');
    if (index === -1) {
        return window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
    }
    return scriptUrl.substring(0, index + 1);
}

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
        
        const baseUrl = getBasePath();
        const fullPath = baseUrl + routes[viewName];
        
        if (!loadedModules[viewName]) {
            loadedModules[viewName] = await import(fullPath);
        }
        
        const module = loadedModules[viewName];
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
                <p><strong>Fichier :</strong> ${routes[viewName] || viewName}</p>
                <p><strong>Détail :</strong> ${error.message}</p>
                <button class="btn btn-sm" onclick="window.location.reload()" style="margin-top: 12px;">⟳ Recharger l'application</button>
            </div>
        `;
    }
}
