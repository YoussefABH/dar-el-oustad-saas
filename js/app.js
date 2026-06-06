document.addEventListener('DOMContentLoaded', () => {
    alert("app.js chargé");
    // Écouteurs de base
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('register-btn').addEventListener('click', register);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('add-student-btn').addEventListener('click', addStudent);

    // Initialisation des modals
    initEditModal();
    initTeacherModal();
    initParentModal();
    initTeacherForm();
    initParentForm();

    // Vérifier session existante
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            afterLogin();
        } else {
            toggleView('login');
        }
    });

    // Écouter les changements d'état de connexion
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            afterLogin();
        } else if (event === 'SIGNED_OUT') {
            toggleView('login');
        }
    });
});
