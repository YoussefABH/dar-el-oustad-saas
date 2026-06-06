window.login = async function() {
    alert("login() appelée");
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    alert("Email: " + email + " / Password length: " + password.length);

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        alert("Erreur Supabase: " + error.message);
        return;
    }
    alert("Connexion réussie !");
    // Afficher le dashboard
    document.getElementById("login-view").style.display = "none";
    document.getElementById("dashboard-view").style.display = "block";
};

window.register = async function() {
    alert("register() appelée");
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) alert("Erreur: " + error.message);
    else alert("Compte créé ! Vérifiez vos emails ou connectez-vous.");
};

window.logout = async function() {
    await supabaseClient.auth.signOut();
    document.getElementById("login-view").style.display = "block";
    document.getElementById("dashboard-view").style.display = "none";
    alert("Déconnecté");
};
