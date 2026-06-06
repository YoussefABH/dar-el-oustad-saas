document.addEventListener('DOMContentLoaded', () => {
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

    // Écouter changements auth
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            afterLogin();
        } else if (event === 'SIGNED_OUT') {
            toggleView('login');
        }
    });
});

// Redéfinition de afterLogin pour charger les listes supplémentaires
const originalAfterLogin = afterLogin;
window.afterLogin = async function() {
    await originalAfterLogin();
    if (document.getElementById("dashboard-view").style.display === "block") {
        loadTeachersList();
        loadParentsList();
    }
};
