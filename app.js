// =========================
// AUTH
// =========================

async function register() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Compte créé avec succès. Vérifie ton email.");
}

async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    await loadDashboard();
}

async function logout() {

    await supabaseClient.auth.signOut();

    document.getElementById("login-view").style.display = "block";
    document.getElementById("dashboard-view").style.display = "none";
}

// =========================
// USER
// =========================

async function getCurrentUser() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    return user;
}

// =========================
// DASHBOARD
// =========================

async function loadDashboard() {

    document.getElementById("login-view").style.display = "none";
    document.getElementById("dashboard-view").style.display = "block";

    await loadStudents();
}

// =========================
// STUDENTS
// =========================

async function loadStudents() {

    const user = await getCurrentUser();

    if (!user) return;

    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("centre_id")
            .eq("id", user.id)
            .single();

    if (profileError) {
        console.error(profileError);
        return;
    }

    const { data: students, error } =
        await supabaseClient
            .from("students")
            .select("*")
            .eq("centre_id", profile.centre_id)
            .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    renderStudents(students);
}

function renderStudents(students) {

    const container =
        document.getElementById("students-container");

    if (!students || students.length === 0) {

        container.innerHTML = `
            <p>Aucun étudiant enregistré.</p>
        `;

        return;
    }

    container.innerHTML = students.map(student => `

        <div class="student-card">

            <h3>${student.full_name}</h3>

            <p>
                <strong>Niveau :</strong>
                ${student.level}
            </p>

            <p>
                <strong>Filière :</strong>
                ${student.track || "-"}
            </p>

            <p>
                <strong>Statut :</strong>
                ${student.status}
            </p>

            <p>
                <strong>Paiement :</strong>
                ${student.payment_amount} DH
            </p>

            <button onclick="deleteStudent('${student.id}')">
                Supprimer
            </button>

        </div>

        <hr>

    `).join("");
}

async function addStudent() {

    const user = await getCurrentUser();

    if (!user) {
        alert("Utilisateur non connecté");
        return;
    }

    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("centre_id")
            .eq("id", user.id)
            .single();

    if (profileError) {
        alert(profileError.message);
        return;
    }

    const full_name =
        document.getElementById("student-name").value;

    const level =
        document.getElementById("student-level").value;

    const track =
        document.getElementById("student-track").value;

    const payment_amount =
        Number(
            document.getElementById("student-payment").value
        ) || 0;

    const status =
        document.getElementById("student-status").value;

    const { error } = await supabaseClient
        .from("students")
        .insert([
            {
                centre_id: profile.centre_id,
                full_name,
                level,
                track,
                payment_amount,
                status
            }
        ]);

    if (error) {
        alert(error.message);
        return;
    }

    document.getElementById("student-name").value = "";
    document.getElementById("student-level").value = "";
    document.getElementById("student-track").value = "";
    document.getElementById("student-payment").value = "";

    await loadStudents();

    alert("Étudiant ajouté");
}

async function deleteStudent(studentId) {

    if (!confirm("Supprimer cet étudiant ?"))
        return;

    const { error } = await supabaseClient
        .from("students")
        .delete()
        .eq("id", studentId);

    if (error) {
        alert(error.message);
        return;
    }

    await loadStudents();
}

// =========================
// SESSION CHECK
// =========================

window.addEventListener("DOMContentLoaded", async () => {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {
        await loadDashboard();
    }
});
