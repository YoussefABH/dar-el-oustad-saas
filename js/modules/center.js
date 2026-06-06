async function loadCenterInfo() {
    try {
        const user = await getCurrentUser();
        if (!user) return;
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('centre_id')
            .eq('id', user.id)
            .single();
        if (error) throw error;
        if (!profile.centre_id) throw new Error("centre_id manquant");
        const { data: center, error: centerError } = await supabaseClient
            .from('centers')
            .select('name')
            .eq('id', profile.centre_id)
            .single();
        if (centerError) throw centerError;
        document.getElementById('center-name').textContent = center ? `Centre : ${center.name}` : "Centre inconnu";
    } catch (e) {
        logError("loadCenterInfo error", e.message);
        document.getElementById('center-name').textContent = "Erreur chargement centre";
    }
}
