import { getAppState } from './state.js';

// Définition des routes avec chemins relatifs (depuis le dossier courant js/core/)
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

// Permissions par rôle (à adapter selon votre logique)
const rolePermissions = {
    director: ['dashboard', 'students', 'teachers', 'groups', 'attendance', 'payments', 'expenses', 'courses', 'reports', 'settings'],
    teacher: ['dashboard', 'students', 'groups', 'attendance', 'courses']
};

// Cache des modules déjà chargés
const loadedModules = {};

// Fonction utilitaire pour obtenir le chemin de base absolu du projet (fonctionne en local et sur GitHub Pages)
function getBasePath() {
    // On utilise l'URL du script courant pour déterminer la racine
    const scriptUrl = import.meta.url;
    // Cherche le dernier '/' avant le dossier 'js/core/'
    const base = scriptUrl.substring(0, scriptUrl.lastIndexOf('/js/') + 1);
    return base;
}

export async function navigateTo(viewName) {
    const container = document.getElementById('content-container');
    if (!container) return;

    // Vérification des droits d'accès
    const state = getAppState();
    if (!state.user) {
        container.innerHTML = `<div class="card alert-error">⛓️ Session expirée. Veuillez vous reconnecter.</div>`;
        return;
    }
    if (rolePermissions[state.role] && !rolePermissions[state.role].includes(viewName)) {
        container.innerHTML = `<div class="card alert-error">⛔ Accès non autorisé pour votre rôle (${state.role}).</div>`;
        return;
    }

    // Afficher un indicateur de chargement
    container.innerHTML = `<div class="loader-global"><div class="spinner"></div><p>Chargement de ${viewName}...</p></div>`;

    try {
        if (!routes[viewName]) {
            throw new Error(`Route inconnue : ${viewName}`);
        }

        // Résolution du chemin absolu pour l'import dynamique (fonctionne sur GitHub Pages)
        const baseUrl = getBasePath();
        const relativePath = routes[viewName];
        // Nettoyer les double slashes si nécessaire
        const fullPath = `${baseUrl}${relativePath.replace(/^\.\.\//, '')}`;

        // Importer le module (avec cache)
        if (!loadedModules[viewName]) {
            loadedModules[viewName] = await import(fullPath);
        }
        const module = loadedModules[viewName];

        // Rendre l'état global accessible si certains modules en ont besoin
        window.appState = getAppState();

        // Exécuter la fonction de rendu
        if (typeof module.render === 'function') {
            await module.render(container);
        } 
        // Fallback pour d'éventuels modules nommés renderDashboard, etc. (optionnel)
        else if (typeof module[`render${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`] === 'function') {
            await module[`render${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`](container);
        } 
        else {
            throw new Error(`Le module ${viewName} n'exporte pas de fonction 'render' ou 'render${viewName}'.`);
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
