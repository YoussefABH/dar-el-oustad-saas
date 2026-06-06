// app.js - Point d'entrée après chargement des modules
import { getCurrentUser, logout } from './core/auth.js';
import { setAppState, getAppState } from './core/state.js';
import { loadCenterConfig } from './config/app-config.js';
import { loadLayout, showView } from './core/layout.js';

// Exposer certaines fonctions globalement pour les modules
window.getAppState = getAppState;
window.logout = logout;
window.supabaseClient = supabaseClient;

document.addEventListener('DOMContentLoaded', async () => {
    // Vérifier si un utilisateur est déjà connecté
    const user = await getCurrentUser();
    if (user) {
        // Charger le profil et le centre
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (profile && profile.centre_id) {
            const config = await loadCenterConfig(profile.centre_id);
            setAppState({
                user,
                profile,
                centreId: profile.centre_id,
                role: profile.role,
                config
            });
            await loadLayout();
            showView('dashboard');
        } else {
            // Problème de profil, on force la déconnexion
            await logout();
        }
    } else {
        // Afficher un formulaire de login simple (en attendant d'en faire un module)
        const container = document.getElementById('content-container');
        container.innerHTML = `
            <div class="card" style="max-width:400px; margin:auto;">
                <h2>Connexion</h2>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="login-email" class="form-control">
                </div>
                <div class="form-group">
                    <label>Mot de passe</label>
                    <input type="password" id="login-password" class="form-control">
                </div>
                <button id="do-login" class="btn">Se connecter</button>
                <button id="do-register" class="btn btn-secondary">Créer un compte</button>
            </div>
        `;
        document.getElementById('do-login').onclick = async () => {
            const email = document.getElementById('login-email').value;
            const pwd = document.getElementById('login-password').value;
            try {
                await window.login?.(email, pwd);
            } catch(e) { alert(e.message); }
        };
        document.getElementById('do-register').onclick = async () => {
            const email = document.getElementById('login-email').value;
            const pwd = document.getElementById('login-password').value;
            try {
                await window.register?.(email, pwd);
                alert("Compte créé, vérifiez votre email");
            } catch(e) { alert(e.message); }
        };
    }
});
