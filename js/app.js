// app.js - Version minimaliste pour tester la connexion

document.addEventListener('DOMContentLoaded', () => {
    alert("app.js chargé - DOM prêt");

    // Définition directe de la fonction login (sans dépendre de auth.js)
    window.login = async function() {
        alert("login() appelée depuis app.js");
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        alert("Email: " + email + " / Password length: " + password.length);
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) {
                alert("Erreur Supabase: " + error.message);
                return;
            }
            alert("Connexion réussie ! Utilisateur: " + data.user.email);
            // Afficher le dashboard
            document.getElementById("login-view").style.display = "none";
            document.getElementById("dashboard-view").style.display = "block";
            alert("Dashboard affiché");
        } catch (e) {
            alert("Exception: " + e.message);
        }
    };

    window.register = async function() {
        alert("register() appelée");
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) alert("Erreur: " + error.message);
        else alert("Compte créé ! Connectez-vous.");
    };

    window.logout = async function() {
        await supabaseClient.auth.signOut();
        document.getElementById("login-view").style.display = "block";
        document.getElementById("dashboard-view").style.display = "none";
        alert("Déconnecté");
    };

    // Attacher les événements
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginBtn) {
        loginBtn.onclick = () => {
            alert("Clic sur Connexion détecté");
            window.login();
        };
    } else {
        alert("Bouton login non trouvé !");
    }

    if (registerBtn) {
        registerBtn.onclick = () => {
            alert("Clic sur Inscription");
            window.register();
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            alert("Clic sur Déconnexion");
            window.logout();
        };
    }
});
