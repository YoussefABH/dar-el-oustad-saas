async function register() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    console.log("REGISTER:", data, error);

    if (error) {
        alert(error.message);
        return;
    }

    alert("Compte créé avec succès");
}

async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    console.log("LOGIN:", data, error);

    if (error) {
        alert(error.message);
        return;
    }

    document.getElementById("login-view").style.display = "none";
    document.getElementById("dashboard-view").style.display = "block";

    alert("Connexion réussie");
}

async function logout() {

    await supabaseClient.auth.signOut();

    document.getElementById("login-view").style.display = "block";
    document.getElementById("dashboard-view").style.display = "none";
}
