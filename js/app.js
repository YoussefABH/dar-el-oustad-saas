import { supabaseClient } from './config/supabase.js';
import { setAppState } from './core/state.js';
import { loadLayout, showView } from './core/layout.js';
import { loadCenterConfig } from './config/app-config.js';
import { showAlert } from './utils/dom.js';

async function initApp() {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = `<div class="loader-global"><div class="spinner"></div><p>Connexion sécurisée...</p></div>`;

    try {
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session) {
            showLoginScreen();
            return;
        }

        // Récupérer profil utilisateur
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('centre_id, role')
            .eq('id', session.user.id)
            .single();

        if (profileError || !profile) {
            throw new Error('Profil utilisateur introuvable. Contactez l\'administrateur.');
        }

        // Charger configuration du centre
        const config = await loadCenterConfig(profile.centre_id);

        setAppState({
            user: session.user,
            profile: profile,
            centreId: profile.centre_id,
            role: profile.role,
            config: config
        });

        await loadLayout();
        await showView('dashboard');

    } catch (err) {
        console.error(err);
        appDiv.innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <h2>⚠️ Erreur critique</h2>
                    <p style="color: red; margin-bottom: 16px;">${err.message}</p>
                    <button id="retry-init" class="btn">Réessayer</button>
                </div>
            </div>
        `;
        document.getElementById('retry-init')?.addEventListener('click', () => initApp());
    }
}

function showLoginScreen() {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <h1>Dar El-Oustad Pro</h1>
                <input type="email" id="email" placeholder="Email professionnel" autocomplete="email">
                <input type="password" id="password" placeholder="Mot de passe">
                <button id="login-btn" class="btn">Connexion</button>
                <button id="register-btn" class="btn btn-secondary" style="margin-top: 12px;">Créer un compte</button>
            </div>
        </div>
    `;

    document.getElementById('login-btn').onclick = async () => {
        const email = document.getElementById('email').value;
        const pwd = document.getElementById('password').value;
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pwd });
        if (error) {
            showAlert(error.message, 'error');
        } else {
            initApp();
        }
    };

    document.getElementById('register-btn').onclick = async () => {
        const email = document.getElementById('email').value;
        const pwd = document.getElementById('password').value;
        const { error } = await supabaseClient.auth.signUp({ email, password: pwd });
        if (error) {
            showAlert(error.message, 'error');
        } else {
            showAlert('Compte créé ! Vérifiez votre email puis connectez-vous.', 'success');
        }
    };
}

// Démarrage
initApp();
