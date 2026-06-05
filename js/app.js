document.addEventListener('DOMContentLoaded', () => {
    // Écouteurs des boutons de la vue login
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('register-btn').addEventListener('click', register);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('add-student-btn').addEventListener('click', addStudent);

    // Initialiser le modal d'édition
    initEditModal();

    // Vérifier si l'utilisateur est déjà connecté
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
