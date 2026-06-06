async function getCurrentUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) return null;
    return user;
}

async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (!validateEmail(email)) { showAlert("Email invalide", "error"); return; }
    if (password.length < 6) { showAlert("Mot de passe trop court", "error"); return; }
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) { showAlert(error.message, "error"); return; }
    showAlert("Compte créé ! Vérifiez votre email (ou connectez-vous)", "success");
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) { showAlert(error.message, "error"); return; }
    await afterLogin();
}

async function logout() {
    await supabaseClient.auth.signOut();
    toggleView('login');
    document.getElementById("email").value = '';
    document.getElementById("password").value = '';
}

async function afterLogin() {
    alert("afterLogin - début");
    const user = await getCurrentUser();
    alert("user: " + (user ? user.email : "null"));
    if (!user) return;

    alert("Appel loadCenterInfo");
    await loadCenterInfo();
    alert("loadCenterInfo terminé");

    alert("Appel loadDashboardStats");
    await loadDashboardStats();
    alert("loadDashboardStats terminé");

    alert("Appel loadStudentsList");
    await loadStudentsList();
    alert("loadStudentsList terminé");

    const isDir = await isDirector();
    alert("isDirector: " + isDir);
    const directorSection = document.getElementById("director-section");
    if (directorSection) directorSection.style.display = isDir ? "block" : "none";

    if (isDir) {
        if (typeof loadTeachersList === 'function') await loadTeachersList();
        if (typeof loadParentsList === 'function') await loadParentsList();
    }

    toggleView('dashboard');
    alert("afterLogin terminé");
}
