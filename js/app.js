import { getCurrentUser, afterLogin } from './core/auth.js';
import { login, register } from './core/auth.js';
import { showAlert } from './utils/dom.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await getCurrentUser();
        if (user) {
            await afterLogin();
        } else {
            showLoginGate();
        }
    } catch (err) {
        console.error(err);
        showLoginGate();
    }
});

function showLoginGate() {
    const app = document.getElementById('app');
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

    document.getElementById('btn-login').onclick = async () => {
        const email = document.getElementById('auth-email').value.trim();
        const pass = document.getElementById('auth-password').value;
        try {
            await login(email, pass);
        } catch (e) {
            showAlert(e.message, 'error');
        }
    };

    document.getElementById('btn-register').onclick = async () => {
        const email = document.getElementById('auth-email').value.trim();
        const pass = document.getElementById('auth-password').value;
        try {
            await register(email, pass);
            showAlert('Compte créé, vous pouvez vous identifier.', 'success');
        } catch (e) {
            showAlert(e.message, 'error');
        }
    };
}
