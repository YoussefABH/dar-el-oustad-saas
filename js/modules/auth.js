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
    const user = await getCurrentUser();
    if (!user) return;
    await loadCenterInfo();
    await loadDashboardStats();
    await loadStudentsList();
    const isDir = await isDirector();
    const directorSection = document.getElementById("director-section");
    if (directorSection) {
        directorSection.style.display = isDir ? "block" : "none";
    }
    toggleView('dashboard');
}
