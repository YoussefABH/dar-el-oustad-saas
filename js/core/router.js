import { getAppState } from './state.js';

// Définition des routes
const routes = {
    dashboard: './modules/dashboard/dashboard.js',
    students: './modules/students/students.js',
    teachers: './modules/teachers/teachers.js',
    groups: './modules/groups/groups.js',
    attendance: './modules/attendance/attendance.js',
    payments: './modules/payments/payments.js',
    expenses: './modules/expenses/expenses.js',
    courses: './modules/courses/courses.js',
    reports: './modules/reports/reports.js',
    settings: './modules/settings/settings.js'
};

const rolePermissions = {
    director: [
        'dashboard',
        'students',
        'teachers',
        'groups',
        'attendance',
        'payments',
        'expenses',
        'courses',
        'reports',
        'settings'
    ],
    teacher: [
        'dashboard',
        'students',
        'groups',
        'attendance',
        'courses'
    ]
};

const loadedModules = {};

export async function navigateTo(viewName) {
    const container = document.getElementById('content-container');

    if (!container) {
        console.error('Container introuvable : #content-container');
        return;
    }

    const state = getAppState();

    // Vérification session
    if (!state?.user) {
        container.innerHTML = `
            <div class="card alert-error">
                ⛓️ Session expirée. Veuillez vous reconnecter.
            </div>
        `;
        return;
    }

    // Vérification permissions
    if (
        rolePermissions[state.role] &&
        !rolePermissions[state.role].includes(viewName)
    ) {
        container.innerHTML = `
            <div class="card alert-error">
                ⛔ Accès non autorisé pour le rôle : ${state.role}
            </div>
        `;
        return;
    }

    // Vérification route
    if (!routes[viewName]) {
        container.innerHTML = `
            <div class="card alert-error">
                Route inconnue : ${viewName}
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="loader-global">
            <div class="spinner"></div>
            <p>Chargement...</p>
        </div>
    `;

    try {
        // Utilisation de import.meta.url (plus fiable)
        const moduleUrl = new URL(routes[viewName], import.meta.url).href;

        // Chargement unique
        if (!loadedModules[viewName]) {
            loadedModules[viewName] = await import(moduleUrl);
        }

        const module = loadedModules[viewName];

        // Synchronisation état global
        window.appState = state;

        // Compatibilité render() ou renderDashboard()
        if (typeof module.render === 'function') {
            await module.render(container);
        } else if (typeof module.renderDashboard === 'function') {
            await module.renderDashboard(container);
        } else {
            throw new Error(
                `Le module "${viewName}" ne contient aucune fonction render().`
            );
        }

    } catch (error) {
        console.error(`Erreur chargement ${viewName}:`, error);

        container.innerHTML = `
            <div class="card alert-error">
                <h3>⚠️ Erreur de chargement</h3>

                <p>
                    <strong>Vue :</strong> ${viewName}
                </p>

                <p>
                    <strong>Message :</strong>
                    ${error.message}
                </p>

                <button
                    class="btn btn-sm"
                    onclick="window.location.reload()"
                >
                    ⟳ Recharger
                </button>
            </div>
        `;
    }
}
