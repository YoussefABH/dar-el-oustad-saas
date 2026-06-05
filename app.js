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
async function loadDashboardStats() {

    const user = await getCurrentUser();

    if (!user) return;

    const { data: profile } = await supabaseClient
        .from("profiles")
        .select("centre_id")
        .eq("id", user.id)
        .single();

    if (!profile) return;

    const { data: students } = await supabaseClient
        .from("students")
        .select("*")
        .eq("centre_id", profile.centre_id);

    const totalStudents = students.length;

    const paidStudents = students.filter(
        s => s.status === "Paid"
    ).length;

    const pendingStudents = students.filter(
        s => s.status === "Pending"
    ).length;

    const revenue = students
        .filter(s => s.status === "Paid")
        .reduce(
            (total, student) =>
                total + Number(student.payment_amount || 0),
            0
        );

    document.getElementById("totalStudents").textContent =
        totalStudents;

    document.getElementById("paidStudents").textContent =
        paidStudents;

    document.getElementById("pendingStudents").textContent =
        pendingStudents;

    document.getElementById("revenue").textContent =
        revenue + " DH";
}
