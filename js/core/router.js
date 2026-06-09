import { getAppState } from './state.js';

// Table de permissions par rôle (Directeur vs Enseignant)
const rolePermissions = {
    director: ['dashboard', 'students', 'teachers', 'groups', 'attendance', 'payments', 'settings', 'center', 'parents'],
    teacher: ['dashboard', 'students', 'groups', 'attendance', 'parents']
};

// Utilisation de chemins relatifs cleans et standardisés pour le routeur
const routes = {
    dashboard: '../modules/dashboard/dashboard.js',
    students: '../modules/students/students.js',
    teachers: '../modules/teachers/teachers.js',
    groups: '../modules/groups/groups.js',
    attendance: '../modules/attendance/attendance.js',
    payments: '../modules/payments/payments.js',
    settings: '../modules/settings/settings.js',
    center: '../modules/center/center.js',
    parents: '../modules/parents/parents.js'
};

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
            <div style="width: 32px; height: 32px; border: 3px solid rgba(0,0,0,0.1); border-top-color: #2c7da0; border-radius: 50%; animation: spinRouter 0.8s linear infinite;"></div>
        </div>
    `;

    try {
        if (!routes[viewName]) throw new Error(`La vue "${viewName}" n'existe pas.`);
        
        // Résolution dynamique du module à partir de la position de router.js (js/core/)
        const moduleUrl = new URL(routes[viewName], import.meta.url).href;
        
        // Importation globale
        const module = await import(moduleUrl);
        
        if (typeof module.render === 'function') {
            container.innerHTML = ''; // Nettoyage
            await module.render(container);
        } else if (typeof module[`render${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`] === 'function') {
            // Sécurité alternative si le module utilise un nommage spécifique (ex: renderDashboard)
            container.innerHTML = '';
            await module[`render${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`](container);
        } else {
            throw new Error(`Le module "${viewName}" ne possède pas de méthode de rendu compatible.`);
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

// Style d'attente pour le routeur
if (!document.getElementById('router-animation-style')) {
    const style = document.createElement('style');
    style.id = 'router-animation-style';
    style.innerHTML = `@keyframes spinRouter { to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
}
