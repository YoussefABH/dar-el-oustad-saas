async function loadCenterInfo() {
    const user = await getCurrentUser();
    if (!user) return;

    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('centre_id')
        .eq('id', user.id)
        .single();

    if (error || !profile || !profile.centre_id) {
        document.getElementById('center-name').textContent = "Centre non trouvé";
        return;
    }

    const { data: center, error: centerError } = await supabaseClient
        .from('centers')
        .select('name')
        .eq('id', profile.centre_id)
        .single();

    if (centerError || !center) {
        document.getElementById('center-name').textContent = "Centre inconnu";
    } else {
        document.getElementById('center-name').textContent = `Centre : ${center.name}`;
    }
}
