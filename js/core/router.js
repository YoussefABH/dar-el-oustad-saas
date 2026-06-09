import { getAppState } from './state.js';

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

const loadedModules = {};

export async function navigateTo(viewName) {
    const container = document.getElementById('content-container');
    if (!container) return;

    // Loader temporaire pendant le téléchargement du module .js
    container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 200px;">
            <div style="width: 32px; height: 32px; border: 3px solid rgba(0,0,0,0.1); border-top-color: #2c7da0; border-radius: 50%; animation: spinRouter 0.8s linear infinite;"></div>
        </div>
    `;

    try {
        if (!routes[viewName]) {
            throw new Error(`Route introuvable pour le module : ${viewName}`);
        }

        // Résolution d'URL robuste par rapport à l'emplacement de router.js
        const moduleUrl = new URL(routes[viewName], import.meta.url).href;

        if (!loadedModules[viewName]) {
            loadedModules[viewName] = await import(moduleUrl);
        }

        const module = loadedModules[viewName];
        container.innerHTML = ''; // Nettoyage du loader

        // Synchronisation de l'état global attendu par vos modules autonomes
        window.appState = getAppState();

        // Détection de la fonction de rendu appropriée
        if (typeof module.render === 'function') {
            await module.render(container);
        } else if (typeof module[`render${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`] === 'function') {
            await module[`render${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`](container);
        } else {
            throw new Error(`Le module "${viewName}" ne contient aucune fonction de rendu compatible.`);
        }

    } catch (error) {
        console.error(`Erreur critique sur le module ${viewName}:`, error);
        container.innerHTML = `
            <div class="card" style="border-left: 4px solid #e63946; padding: 20px;">
                <h3 style="color: #e63946;">⚠️ Échec de chargement de la vue [${viewName}]</h3>
                <p style="margin-top: 10px; font-family: monospace; font-size: 0.85rem; background: #fff5f5; padding: 10px; border-radius: 8px;">
                    Détails : ${error.message}
                </p>
                <button class="btn btn-sm" style="margin-top: 12px;" onclick="window.location.reload()">Forcer le rechargement</button>
            </div>
        `;
    }
}

// Injection rapide du style de rotation si absent
if (!document.getElementById('router-spin-style')) {
    const style = document.createElement('style');
    style.id = 'router-spin-style';
    style.innerHTML = `@keyframes spinRouter { to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
}
