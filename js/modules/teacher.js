// teacher.js

async function addTeacher(email, fullName, subject) {
    const user = await getCurrentUser();
    if (!user) return { error: "Non connecté" };

    // Récupérer le centre_id du directeur
    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('centre_id')
        .eq('id', user.id)
        .single();
    if (profileError || !profile.centre_id) {
        return { error: "Centre non trouvé" };
    }

    // 1. Créer un utilisateur auth (mot de passe temporaire, à changer à la première connexion)
    const tempPassword = Math.random().toString(36).slice(-8);
    const { data: authUser, error: signUpError } = await supabaseClient.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName, role: 'teacher' }
    });

    if (signUpError) return { error: signUpError.message };

    // 2. Créer le profil dans profiles (lié au centre)
    const { error: profileInsertError } = await supabaseClient
        .from('profiles')
        .insert({
            id: authUser.user.id,
            full_name: fullName,
            centre_id: profile.centre_id,
            role: 'teacher'
        });
    if (profileInsertError) return { error: profileInsertError.message };

    // 3. Créer l'entrée dans teachers
    const { error: teacherError } = await supabaseClient
        .from('teachers')
        .insert({
            user_id: authUser.user.id,
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
