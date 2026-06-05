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

loadDashboard();

}

async function register() {
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
});

if (error) {
    alert(error.message);
    return;
}

alert("Compte créé avec succès");

}

async function logout() {
await supabaseClient.auth.signOut();

document.getElementById("login-view").style.display = "block";
document.getElementById("dashboard-view").style.display = "none";

}

async function loadDashboard() {

document.getElementById("login-view").style.display = "none";
document.getElementById("dashboard-view").style.display = "block";

await loadStudents();

}

async function loadStudents() {

const user = await getCurrentUser();

if (!user) return;

const { data: profile } = await supabaseClient
    .from("profiles")
    .select("centre_id")
    .eq("id", user.id)
    .single();

if (!profile) return;

const { data: students, error } = await supabaseClient
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
    container.innerHTML =
        "<p>Aucun étudiant enregistré.</p>";
    return;
}

container.innerHTML = students.map(student => `
    <div class="student-card">
        <h3>${student.first_name} ${student.last_name}</h3>
        <p>Niveau : ${student.level}</p>
        <p>Filière : ${student.track}</p>
        <p>Statut : ${student.status}</p>
        <p>Paiement : ${student.payment_amount} DH</p>
    </div>
`).join("");

}

async function createStudent(studentData) {

const user = await getCurrentUser();

const { data: profile } = await supabaseClient
    .from("profiles")
    .select("centre_id")
    .eq("id", user.id)
    .single();

const { error } = await supabaseClient
    .from("students")
    .insert([
        {
            centre_id: profile.centre_id,
            ...studentData
        }
    ]);

if (error) {
    alert(error.message);
    return;
}

await loadStudents();

}

window.addEventListener("DOMContentLoaded", async () => {

const { data } = await supabaseClient.auth.getSession();

if (data.session) {
    loadDashboard();
}

});
