async function loadDashboardStats() {
    alert("loadDashboardStats - début");
    const user = await getCurrentUser();
    alert("user: " + user?.email);
    if (!user) return;

    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('centre_id')
        .eq('id', user.id)
        .single();
    alert("centre_id: " + profile?.centre_id + ", erreur: " + profileError?.message);
    if (profileError || !profile || !profile.centre_id) return;

    const { data: students, error } = await supabaseClient
        .from('students')
        .select('status, payment_amount')
        .eq('centre_id', profile.centre_id);
    alert("Nombre d'étudiants trouvés: " + students?.length);
    if (error) {
        alert("Erreur chargement étudiants: " + error.message);
        return;
    }

    const totalStudents = students.length;
    const paidStudents = students.filter(s => s.status === 'Paid').length;
    const pendingStudents = students.filter(s => s.status === 'Pending').length;
    const revenue = students
        .filter(s => s.status === 'Paid')
        .reduce((sum, s) => sum + (Number(s.payment_amount) || 0), 0);

    document.getElementById("totalStudents").textContent = totalStudents;
    document.getElementById("paidStudents").textContent = paidStudents;
    document.getElementById("pendingStudents").textContent = pendingStudents;
    document.getElementById("revenue").textContent = revenue + " DH";
    alert("Statistiques mises à jour");
}
