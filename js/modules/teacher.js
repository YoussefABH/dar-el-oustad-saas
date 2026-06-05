async function addTeacher(email, fullName, subject) {
    try {
        // 1. Vérifier le directeur
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error("Non connecté");

        const { data: profile, error: pe } = await supabaseClient
            .from('profiles')
            .select('centre_id')
            .eq('id', user.id)
            .single();
        if (pe || !profile.centre_id) throw new Error("Centre directeur introuvable");

        const centre_id = profile.centre_id;
        const tempPassword = "Pass1234!"; // mot de passe fixe pour test, à changer après

        // 2. Créer l'utilisateur
        const { data: authData, error: signUpError } = await supabaseClient.auth.signUp({
            email: email,
            password: tempPassword,
            options: { data: { full_name: fullName, role: 'teacher' } }
        });
        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("Utilisateur non créé");

        const teacherId = authData.user.id;

        // 3. Ajouter profil
        const { error: profInsert } = await supabaseClient
            .from('profiles')
            .insert({ id: teacherId, full_name: fullName, centre_id: centre_id, role: 'teacher' });
        if (profInsert) throw profInsert;

        // 4. Ajouter dans teachers
        const { error: teachInsert } = await supabaseClient
            .from('teachers')
            .insert({ user_id: teacherId, centre_id: centre_id, subject: subject, full_name: fullName });
        if (teachInsert) throw teachInsert;

        return { success: true, tempPassword: tempPassword, email: email };
    } catch (err) {
        console.error("addTeacher error:", err);
        return { error: err.message };
    }
}

// Les fonctions loadTeachersList, isTeacher, isDirector restent identiques à la version précédente
// Je les remets ci-dessous pour être complet
async function loadTeachersList() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return [];
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('centre_id')
        .eq('id', user.id)
        .single();
    if (!profile || !profile.centre_id) return [];
    const { data, error } = await supabaseClient
        .from('teachers')
        .select('*, profiles(email)')
        .eq('centre_id', profile.centre_id);
    if (error) return [];
    return data;
}

async function isTeacher() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    return profile?.role === 'teacher';
}

async function isDirector() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    return profile?.role === 'director';
    }
