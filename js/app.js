document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('register-btn').addEventListener('click', register);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('add-student-btn').addEventListener('click', addStudent);
    document.getElementById('add-teacher-btn')?.addEventListener('click', async () => {
        const email = document.getElementById('teacher-email').value;
        const name = document.getElementById('teacher-name').value;
        const subject = document.getElementById('teacher-subject').value;
        if (!email || !name || !subject) {
            showAlert("Tous les champs sont requis", "error");
            return;
        }
        const result = await addTeacher(email, name, subject);
        if (result.error) {
            showAlert(result.error, "error");
        } else {
            showAlert(`Enseignant ajouté. Mot de passe temporaire : ${result.tempPassword} envoyé à ${result.email} (notez-le)`, "success");
            document.getElementById('teacher-email').value = '';
            document.getElementById('teacher-name').value = '';
            document.getElementById('teacher-subject').value = '';
            // Recharger la liste des enseignants si besoin
        }
    });

    initEditModal();

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            afterLogin();
        } else {
            toggleView('login');
        }
    });

    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            afterLogin();
        } else if (event === 'SIGNED_OUT') {
            toggleView('login');
        }
    });
});

// Surcharge de afterLogin (définie dans auth.js) pour gérer l'affichage selon le rôle
// On va plutôt modifier auth.js pour appeler une fonction après login qui détermine le rôle.
// Mais pour simplifier, on ajoute ici une fonction que nous appellerons dans afterLogin.
// Je vais plutôt réécrire auth.js pour qu'il utilise isDirector/isTeacher.

// Pour éviter de tout chambouler, nous allons modifier auth.js après.
// Voici le nouveau auth.js complet :
