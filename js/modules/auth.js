async function getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user || null;
}

async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (!email || password.length < 6) { alert("Email ou mot de passe invalide"); return; }
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Compte créé! Vérifiez vos emails (ou connectez-vous)");
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else await afterLogin();
}

async function logout() {
    await supabaseClient.auth.signOut();
    toggleView('login');
}

async function afterLogin() {
    await loadCenterInfo();
    await loadDashboardStats();
    await loadStudentsList();
    const isDir = await isDirector();
    const dirSection = document.getElementById("director-section");
    if (dirSection) dirSection.style.display = isDir ? "block" : "none";
    toggleView('dashboard');
}
