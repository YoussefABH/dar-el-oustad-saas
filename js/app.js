// Détecteur d'erreurs
window.addEventListener('error', function(event) {
    alert('ERREUR JS : ' + event.message + ' (ligne ' + event.lineno + ')');
});
window.addEventListener('unhandledrejection', function(event) {
    alert('ERREUR PROMESSE : ' + event.reason);
});

document.addEventListener('DOMContentLoaded', () => {
    try {
        alert("1. DOM prêt");

        // Vérifier supabaseClient
        if (typeof supabaseClient === 'undefined') {
            alert("ERREUR: supabaseClient non défini");
            return;
        }
        alert("2. supabaseClient OK");

        // Récupérer les éléments du DOM
        const loginBtn = document.getElementById('login-btn');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        if (!loginBtn) alert("Bouton login introuvable");
        if (!emailInput) alert("Champ email introuvable");
        if (!passwordInput) alert("Champ mot de passe introuvable");

        if (loginBtn && emailInput && passwordInput) {
            loginBtn.onclick = async () => {
                try {
                    alert("Clic sur connexion détecté");
                    const email = emailInput.value;
                    const password = passwordInput.value;
                    if (!email || !password) {
                        alert("Email ou mot de passe vide");
                        return;
                    }
                    alert("Tentative de connexion avec " + email);
                    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                    if (error) {
                        alert("Erreur Supabase : " + error.message);
                        return;
                    }
                    alert("Connexion OK !");
                    document.getElementById('login-view').style.display = 'none';
                    document.getElementById('dashboard-view').style.display = 'block';
                } catch (err) {
                    alert("Exception dans login : " + err.message);
                }
            };
        } else {
            alert("Un ou plusieurs éléments manquent");
        }

        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.onclick = async () => {
                try {
                    const email = emailInput.value;
                    const password = passwordInput.value;
                    const { error } = await supabaseClient.auth.signUp({ email, password });
                    if (error) alert("Erreur inscription : " + error.message);
                    else alert("Compte créé ! Connectez-vous.");
                } catch (err) {
                    alert("Exception inscription : " + err.message);
                }
            };
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = async () => {
                await supabaseClient.auth.signOut();
                document.getElementById('login-view').style.display = 'block';
                document.getElementById('dashboard-view').style.display = 'none';
                alert("Déconnecté");
            };
        }
    } catch (err) {
        alert("ERREUR GLOBALE au chargement : " + err.message);
    }
});
