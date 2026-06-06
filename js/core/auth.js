import { setAppState, getAppState } from './state.js';
import { loadCenterConfig } from '../config/app-config.js';
import { loadLayout, showView } from './layout.js';

export async function getCurrentUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) return null;
    return user;
}

export async function login(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await afterLogin();
}

export async function register(email, password) {
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) throw error;
}

export async function logout() {
    await supabaseClient.auth.signOut();
    // Nettoyer l'état
    setAppState({ user: null, profile: null, centreId: null, role: null });
    // Rediriger vers l'écran de login (on recharge la page ou on affiche un formulaire)
    window.location.reload(); // simplifié pour MVP
}

async function afterLogin() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Utilisateur non trouvé");

    // Récupérer le profil
    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    if (profileError) throw profileError;
    if (!profile.centre_id) throw new Error("Profil sans centre");

    // Charger la configuration du centre
    const config = await loadCenterConfig(profile.centre_id);
    setAppState({
        user,
        profile,
        centreId: profile.centre_id,
        role: profile.role,
        config
    });

    // Construire le layout (sidebar, header)
    await loadLayout();
    // Afficher le module par défaut (dashboard)
    showView('dashboard');
}
