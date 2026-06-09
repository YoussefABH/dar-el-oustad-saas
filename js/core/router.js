import { getAppState } from './state.js';

// Table de permissions par rôle (Directeur vs Enseignant)
const rolePermissions = {
    director: ['dashboard', 'students', 'teachers', 'groups', 'attendance', 'payments', 'settings', 'center', 'parents'],
    teacher: ['dashboard', 'students', 'groups', 'attendance', 'parents']
};

// ATTENTION À LA CASSE : Vérifiez si vos dossiers sur GitHub ont des majuscules !
const routes = {
    dashboard: 'modules/dashboard/dashboard.js',
    students: 'modules/students/students.js',
    teachers: 'modules/teachers/teachers.js',
    groups: 'modules/groups/groups.js',
    attendance: 'modules/attendance/attendance.js',
    payments: 'modules/payments/payments.js',
    settings: 'modules/settings/settings.js',
    center: 'modules/center/center.js',     // Si votre dossier s'appelle "center"
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

    // 2. Affichage d'un loader interne propre
    container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 200px;">
            <div class="spinner"></div>
        </div>
    `;

    try {
        if (!routes[viewName]) throw new Error(`La vue "${viewName}" n'existe pas.`);
        
        const moduleUrl = `${getBasePath()}${routes[viewName]}`;
        console.log("Tentative de chargement du module :", moduleUrl); // Pour déboguer dans la console F12
        
        const module = await import(moduleUrl);
        
        if (typeof module.render === 'function') {
            container.innerHTML = ''; // Nettoyage du spinner
            await module.render(container);
        } else {
            throw new Error(`Le module "${viewName}" ne possède pas de méthode render().`);
        }
    } catch (err) {
        console.error("Erreur de routage critique :", err);
        container.innerHTML = `
            <div class="card" style="border-left: 4px solid #ef4444; padding: 24px;">
                <h3 style="color: #ef4444; display: flex; align-items: center; gap: 8px;">
                    ⚠️ Erreur d'aiguillage du module [${viewName}]
                </h3>
                <p style="margin-top: 12px; color: #475569; background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 0.9rem;">
                    ${err.message}
                </p>
                <p style="margin-top: 12px; font-size: 0.85rem; color: #64748b;">
                    💡 Vérifiez que le nom du dossier sur votre dépôt GitHub ne contient pas de majuscule (ex: "center" au lieu de "Center").
                </p>
                <button class="btn btn-sm" style="margin-top: 16px;" onclick="window.location.reload()">Réessayer</button>
            </div>
        `;
    }
}
