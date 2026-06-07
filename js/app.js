// app.js - Point d'entrée principal

import { supabaseClient } from './config/supabase.js';
import {
    getCurrentUser,
    login,
    register,
    logout
} from './core/auth.js';

import {
    setAppState,
    getAppState
} from './core/state.js';

import {
    loadCenterConfig
} from './config/app-config.js';

import {
    loadLayout,
    showView
} from './core/layout.js';

// Fonctions globales accessibles depuis d'autres modules
window.getAppState = getAppState;
window.logout = logout;
window.supabaseClient = supabaseClient;

document.addEventListener('DOMContentLoaded', async () => {

    const app = document.getElementById('app');

    if (!app) {
        console.error('Conteneur #app introuvable');
        return;
    }

    try {

        // Vérifier si un utilisateur est déjà connecté
        const user = await getCurrentUser();

        if (user) {

            // Charger le profil utilisateur
            const { data: profile, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error(error);
                throw error;
            }

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

                console.warn('Profil invalide');

                await logout();

                showLoginForm();
            }

        } else {

            showLoginForm();

        }

    } catch (error) {

        console.error('Erreur au démarrage :', error);

        app.innerHTML = `
            <div class="card" style="max-width:500px;margin:40px auto;">
                <h2>Erreur</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
});


function showLoginForm() {

    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="card" style="max-width:400px;margin:50px auto;">
            <h2>Connexion</h2>

            <div class="form-group">
                <label>Email</label>
                <input
                    type="email"
                    id="login-email"
                    class="form-control"
                    placeholder="Votre email">
            </div>

            <div class="form-group">
                <label>Mot de passe</label>
                <input
                    type="password"
                    id="login-password"
                    class="form-control"
                    placeholder="Votre mot de passe">
            </div>

            <div style="display:flex;gap:10px;margin-top:15px;">
                <button id="do-login" class="btn">
                    Se connecter
                </button>

                <button id="do-register" class="btn btn-secondary">
                    Créer un compte
                </button>
            </div>

            <div id="login-message" style="margin-top:15px;"></div>
        </div>
    `;

    const message = document.getElementById('login-message');

    document.getElementById('do-login').addEventListener('click', async () => {

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {

            message.innerHTML = 'Connexion...';

            await login(email, password);

            location.reload();

        } catch (error) {

            console.error(error);

            message.innerHTML = `
                <div style="color:red;">
                    ${error.message}
                </div>
            `;
        }
    });

    document.getElementById('do-register').addEventListener('click', async () => {

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {

            message.innerHTML = 'Création du compte...';

            await register(email, password);

            message.innerHTML = `
                <div style="color:green;">
                    Compte créé avec succès.
                    Vérifiez votre boîte email.
                </div>
            `;

        } catch (error) {

            console.error(error);

            message.innerHTML = `
                <div style="color:red;">
                    ${error.message}
                </div>
            `;
        }
    });
}
