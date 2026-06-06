async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        return user;
    } catch (e) {
        logError("getCurrentUser failed", e.message);
        return null;
    }
}

async function register() {
    try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        if (!validateEmail(email)) { showAlert("Email invalide", "error"); return; }
        if (password.length < 6) { showAlert("Mot de passe trop court", "error"); return; }
        const { error } = await supabaseClient.auth.signUp({ email, password });
        if (error) throw error;
        showAlert("Compte créé ! Connectez-vous.", "success");
    } catch (e) {
        logError("register", e.message);
        showAlert("Erreur inscription: " + e.message, "error");
    }
}

async function login() {
    try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await afterLogin();
    } catch (e) {
        logError("login", e.message);
        showAlert("Erreur connexion: " + e.message, "error");
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    toggleView('login');
    document.getElementById("email").value = '';
    document.getElementById("password").value = '';
}

async function afterLogin() {
    try {
        logError("afterLogin démarré", null);
        const user = await getCurrentUser();
        if (!user) throw new Error("Utilisateur non trouvé");
        await loadCenterInfo();
        await loadDashboardStats();
        await loadStudentsList();
        const isDir = await isDirector();
        const directorSection = document.getElementById("director-section");
        if (directorSection) directorSection.style.display = isDir ? "block" : "none";
        if (isDir) {
            if (typeof loadTeachersList === 'function') await loadTeachersList();
            if (typeof loadParentsList === 'function') await loadParentsList();
        }
        toggleView('dashboard');
        logError("afterLogin terminé avec succès", null);
    } catch (e) {
        logError("afterLogin error", e.message);
        showAlert("Erreur chargement dashboard: " + e.message, "error");
    }
}
