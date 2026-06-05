async function addStudent() {

    const user = (await supabaseClient.auth.getUser()).data.user;

    if (!user) {
        alert("Utilisateur non connecté");
        return;
    }

    const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("centre_id")
        .eq("id", user.id)
        .single();

    if (profileError) {
        alert(profileError.message);
        return;
    }

    const full_name = document.getElementById("student-name").value;
    const level = document.getElementById("student-level").value;
    const track = document.getElementById("student-track").value;
    const payment_amount = document.getElementById("student-payment").value;
    const status = document.getElementById("student-status").value;

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

    alert("Étudiant ajouté");

    await loadStudents();
}
