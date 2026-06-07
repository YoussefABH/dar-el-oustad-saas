// CHARGEMENT PRIORITAIRE : Initialise et attache window.supabaseClient immédiatement
import './config/supabase.js'; 

// Importations des composants du cœur de l'architecture
import { getCurrentUser, afterLogin } from './core/auth.js';
import { login, register } from './core/auth.js';
import { showAlert } from './utils/dom.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Vérification de l'état de la session utilisateur actuelle
        const user = await getCurrentUser();
        if (user) {
            await afterLogin();
        } else {
            showLoginGate();
        }
    } catch (err) {
        console.error("Erreur d'initialisation de l'application :", err);
        showLoginGate();
    }
});

/**
 * Génère et affiche l'écran d'authentification sécurisé (Login / Enregistrement)
 */
function showLoginGate() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="loader-global" style="background: #0f172a;">
            <div class="card" style="width:100%; max-width:400px; padding: 32px; border-radius:24px;">
                <h2 style="text-align:center; margin-bottom: 8px;">Dar El-Oustad Pro</h2>
                <p style="text-align:center; color:#64748b; font-size:0.9rem; margin-bottom:24px;">Gestion de centres de cours de soutien</p>
                
                <div class="form-group">
                    <label>Adresse Email</label>
                    <input type="email" id="auth-email" placeholder="nom@exemple.com">
                </div>
                <div class="form-group">
                    <label>Mot de passe</label>
                    <input type="password" id="auth-password" placeholder="••••••••">
                </div>
                
                <button id="btn-login" class="btn" style="width:100%; margin-top:8px; padding:12px;">Se connecter</button>
                <button id="btn-register" class="btn btn-sm" style="width:100%; margin-top:12px; background:transparent; color:#64748b;">Créer un accès d'essai</button>
            </div>
        </div>
    `;

    // Gestion de l'action de connexion
    document.getElementById('btn-login').onclick = async () => {
        const email = document.getElementById('auth-email').value.trim();
        const pass = document.getElementById('auth-password').value;
        
        if (!email || !pass) {
            showAlert('Veuillez remplir tous les champs', 'error');
            return;
        }

        try {
            await login(email, pass);
        } catch (e) {
            showAlert(e.message, 'error');
        }
    };

    // Gestion de l'action de création de compte
    document.getElementById('btn-register').onclick = async () => {
        const email = document.getElementById('auth-email').value.trim();
        const pass = document.getElementById('auth-password').value;

        if (!email || !pass) {
            showAlert('Veuillez spécifier un email et un mot de passe', 'error');
            return;
        }

        try {
            await register(email, pass);
            showAlert('Compte créé avec succès ! Vous pouvez maintenant vous identifier.', 'success');
        } catch (e) {
            showAlert(e.message, 'error');
        }
    };
}
