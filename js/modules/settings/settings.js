// Module Paramètres du Centre
window.renderSettings = async function() {
    const container = document.getElementById('content-container');
    const state = window.getAppState();
    if (!state) return;
    // Récupérer les settings actuelles (ou config par défaut)
    const { data: settings, error } = await supabaseClient
        .from('settings')
        .select('*')
        .eq('centre_id', state.centreId)
        .single();
    const config = settings || state.config;
    container.innerHTML = `
        <div class="card">
            <h2>Paramètres du centre</h2>
            <form id="settings-form">
                <div class="form-group">
                    <label>Nom de l'établissement</label>
                    <input type="text" name="establishment_name" value="${config.establishment?.name || ''}">
                </div>
                <div class="form-group">
                    <label>Téléphone</label>
                    <input type="text" name="phone" value="${config.contact?.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="${config.contact?.email || ''}">
                </div>
                <div class="form-group">
                    <label>ICE</label>
                    <input type="text" name="ice" value="${config.legal?.ice || ''}">
                </div>
                <button type="submit" class="btn">Enregistrer</button>
            </form>
        </div>
    `;
    document.getElementById('settings-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updated = {
            establishment: { name: formData.get('establishment_name') },
            contact: { phone: formData.get('phone'), email: formData.get('email') },
            legal: { ice: formData.get('ice') }
        };
        const { error } = await supabaseClient
            .from('settings')
            .upsert({ centre_id: state.centreId, ...updated });
        if (error) alert("Erreur : " + error.message);
        else alert("Paramètres enregistrés");
    };
};
