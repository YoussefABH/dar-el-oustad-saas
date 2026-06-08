import { getAppState } from './state.js';

// Table de permissions par rôle (Directeur vs Enseignant)
const rolePermissions = {
    director: ['dashboard', 'students', 'teachers', 'groups', 'attendance', 'payments', 'settings', 'center', 'parents'],
    teacher: ['dashboard', 'students', 'groups', 'attendance', 'parents']
};

const routes = {
    dashboard: 'modules/dashboard/dashboard.js',
    students: 'modules/students/students.js',
    teachers: 'modules/teachers/teachers.js',
    groups: 'modules/groups/groups.js',
    attendance: 'modules/attendance/attendance.js',
    payments: 'modules/payments/payments.js',
    settings: 'modules/settings/settings.js',
    center: 'modules/center/center.js',
    parents: 'modules/parents/parents.js'
};

/**
 * Calcule dynamiquement le chemin racine pour éviter les erreurs de sous-dossiers sur GitHub Pages
 */
function getBasePath() {
    const url = new URL(import.meta.url);
    const pathParts = url.pathname.split('/');
    pathParts.pop(); // Retire 'router.js'
    pathParts.pop(); // Retire 'core'
    return url.origin + pathParts.join('/') + '/';
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

    // 2. Affichage du loader-global dans le conteneur cible pendant le chargement du module
    container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 200px;">
            <div class="spinner"></div>
        </div>
    `;

    try {
        if (!routes[viewName]) throw new Error(`La vue "${viewName}" n'existe pas.`);
        
        const moduleUrl = `${getBasePath()}${routes[viewName]}`;
        const module = await import(moduleUrl);
        
        if (typeof module.render === 'function') {
            container.innerHTML = ''; // Nettoyage du spinner
            await module.render(container);
        } else {
            throw new Error(`Le module "${viewName}" ne possède pas de méthode render().`);
        }
    } catch (err) {
        console.error("Erreur de routage :", err);
        container.innerHTML = `
            <div class="card" style="border-left: 4px solid #ef4444;">
                <h3 style="color: #ef4444;">Impossible de charger la page</h3>
                <p style="margin-top: 8px; color: #475569;">${err.message}</p>
                <button class="btn btn-sm" style="margin-top: 16px;" onclick="window.location.reload()">Recharger l'application</button>
            </div>
        `;
    }
}
