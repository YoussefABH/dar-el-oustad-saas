async function addTeacher(email, fullName, subject) {
    const user = await getCurrentUser();
    if (!user) return { error: "Non connecté" };

    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('centre_id')
        .eq('id', user.id)
        .single();
    if (profileError || !profile.centre_id) {
        return { error: "Centre non trouvé" };
    }

    // Mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8) + "A1!";

    // Création de l'utilisateur enseignant via signUp (public)
    const { data: authData, error: signUpError } = await supabaseClient.auth.signUp({
        email: email,
        password: tempPassword,
        options: {
            data: { full_name: fullName, role: 'teacher' }
        }
    });

    if (signUpError) return { error: signUpError.message };
    if (!authData.user) return { error: "Erreur création utilisateur" };

    // Création du profil
    const { error: profileInsertError } = await supabaseClient
        .from('profiles')
        .insert({
            id: authData.user.id,
            full_name: fullName,
            centre_id: profile.centre_id,
            role: 'teacher'
        });
    if (profileInsertError) return { error: profileInsertError.message };

    // Création de l'entrée dans teachers
    const { error: teacherError } = await supabaseClient
        .from('teachers')
        .insert({
            user_id: authData.user.id,
            centre_id: profile.centre_id,
            subject: subject,
            full_name: fullName
        });
    if (teacherError) return { error: teacherError.message };

    return { success: true, tempPassword: tempPassword, email: email };
}

async function loadTeachersList() {
    const user = await getCurrentUser();
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
    const user = await getCurrentUser();
    if (!user) return false;
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    return profile?.role === 'teacher';
}

async function isDirector() {
    const user = await getCurrentUser();
    if (!user) return false;
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    return profile?.role === 'director';
        }
