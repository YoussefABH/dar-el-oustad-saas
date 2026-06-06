document.addEventListener('DOMContentLoaded', () => {
    alert("app.js chargé - DOM prêt");

    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginBtn) {
        loginBtn.onclick = () => {
            alert("Clic sur le bouton Connexion détecté !");
            window.login(); // appelle la fonction globale
        };
    } else {
        alert("Bouton login non trouvé ! Vérifiez l'ID dans index.html");
    }

    if (registerBtn) {
        registerBtn.onclick = () => {
            alert("Clic inscription");
            window.register();
        };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            alert("Clic déconnexion");
            window.logout();
        };
    }
});
