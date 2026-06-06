async function getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user || null;
}

async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (!email || password.length < 6) {
        alert("Email ou mot de passe invalide (min 6 caractères)");
        return;
    }
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Compte créé ! Connectez-vous.");
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        alert(error.message);
        return;
    }
    await afterLogin();
}

async function logout() {
    await supabaseClient.auth.signOut();
    toggleView('login');
}

async function afterLogin() {
    const user = await getCurrentUser();
    if (!user) return;

    // Charger les infos communes
    await loadCenterInfo();
    await loadDashboardStats();
    await loadStudentsList();

    // Vérifier le rôle
    const isDir = await isDirector();
    const directorSection = document.getElementById("director-section");
    if (directorSection) directorSection.style.display = isDir ? "block" : "none";

    // Charger les listes supplémentaires (enseignants, parents) seulement si directeur
    if (isDir) {
        if (typeof loadTeachersList === 'function') await loadTeachersList();
        if (typeof loadParentsList === 'function') await loadParentsList();
    }

    toggleView('dashboard');
}
