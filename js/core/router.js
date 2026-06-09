import { getAppState } from './state.js';

// Table de permissions par rôle (Directeur vs Enseignant)
const rolePermissions = {
    director: ['dashboard', 'students', 'teachers', 'groups', 'attendance', 'payments', 'settings', 'center', 'parents'],
    teacher: ['dashboard', 'students', 'groups', 'attendance', 'parents']
};

const routes = {
    dashboard: 'js/modules/dashboard/dashboard.js',
    students: 'js/modules/students/students.js',
    teachers: 'js/modules/teachers/teachers.js',
    groups: 'js/modules/groups/groups.js',
    attendance: 'js/modules/attendance/attendance.js',
    payments: 'js/modules/payments/payments.js',
    settings: 'js/modules/settings/settings.js',
    center: 'js/modules/center/center.js',
    parents: 'js/modules/parents/parents.js'
};

/**
 * Calcule proprement la racine du projet, que ce soit en local ou sur GitHub Pages
 */
function getBasePath() {
    // Si nous sommes sur GitHub Pages, le chemin doit inclure le nom du dépôt
    if (window.location.hostname.includes('github.io')) {
        return window.location.origin + '/dar-el-oustad-saas/';
    }
    // En local (Live Server, Localhost), on repart simplement de la racine standard
    return window.location.origin + '/';
}

export async function navigateTo(viewName) {
    const container = document.getElementById('content-container');
    if (!container) return;

    const state = getAppState();
    const userRole = state.role || 'teacher';

    // 1. Vérification de sécurité des permissions
    if (!rolePermissions[userRole].includes(viewName)) {
        container.innerHTML = `
            <div class="card" style="border-left: 4px solid #ef4444; text-align: center; padding: 40px;">
                <span style="font-size: 3rem;">🚫</span>
                <h2 style="color: #ef4444; margin-top: 10px;">Accès Restreint</h2>
                <p style="color: #64748b; margin-top: 8px;">Votre profil (${userRole}) ne dispose pas des droits nécessaires pour consulter cette page.</p>
            </div>
        `;
        return;
    }

    // 2. Affichage du loader interne pendant le chargement
    container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 200px;">
            <div class="spinner"></div>
        </div>
    `;

    try {
        if (!routes[viewName]) throw new Error(`La vue "${viewName}" n'existe pas.`);
        
        // Construction de l'URL absolue sans faille
        const moduleUrl = `${getBasePath()}${routes[viewName]}`;
        
        // Importation dynamique globale du module
        const module = await import(moduleUrl);
        
        if (typeof module.render === 'function') {
            container.innerHTML = ''; // Nettoyage du spinner
            await module.render(container);
        } else {
            throw new Error(`Le module "${viewName}" ne possède pas de méthode render().`);
        }
    } catch (err) {
        console.error("Erreur d'aiguillage du module :", err);
        container.innerHTML = `
            <div class="card" style="border-left: 4px solid #ef4444; padding: 24px;">
                <h3 style="color: #ef4444;">⚠️ Impossible de charger la page [${viewName}]</h3>
                <p style="margin-top: 12px; color: #475569; background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 0.9rem;">
                    ${err.message}
                </p>
                <button class="btn btn-sm" style="margin-top: 16px;" onclick="window.location.reload()">Réessayer</button>
            </div>
        `;
    }
}
