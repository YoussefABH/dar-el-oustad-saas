async function getCurrentUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) return null;
    return user;
}

async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!validateEmail(email)) {
        showAlert("Email invalide", "error");
        return;
    }
    if (password.length < 6) {
        showAlert("Le mot de passe doit contenir au moins 6 caractères", "error");
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({ email, password });

    if (error) {
        showAlert(error.message, "error");
        return;
    }

    showAlert("Compte créé avec succès ! Vérifiez votre email (si confirmation demandée) ou connectez-vous.", "success");
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        showAlert(error.message, "error");
        return;
    }

    const user = data.user;
    if (user) {
        await afterLogin();
    }
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

    // Charger le centre et le dashboard
    await loadCenterInfo();
    await loadDashboardStats();
    await loadStudentsList();

    toggleView('dashboard');
}
