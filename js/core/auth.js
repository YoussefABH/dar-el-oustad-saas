import { supabaseClient } from '../config/supabase.js';
import { setAppState } from './state.js';
import { loadCenterConfig } from '../config/app-config.js';
import { loadLayout, showView } from './layout.js';
import { safeQuery } from '../services/safeQuery.js';

export async function getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

export async function login(email, password) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await afterLogin();
}

export async function register(email, password) {
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) throw error;
}

export async function logout() {
    await supabaseClient.auth.signOut();
    setAppState({ user: null, profile: null, centreId: null, role: null, config: null });
    window.location.reload();
}

export async function afterLogin() {
    const user = await getCurrentUser();
    if (!user) throw new Error('Authentification échouée');

    // Récupération sécurisée du profil utilisateur via safeQuery
    const profile = await safeQuery(() => supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    );

    if (!profile || !profile.centre_id) {
        throw new Error('Profil utilisateur ou ID de centre introuvable.');
    }

    const config = await loadCenterConfig(profile.centre_id);

    // Initialisation de l'état centralisé
    setAppState({ 
        user, 
        profile, 
        centreId: profile.centre_id, 
        role: profile.role || 'teacher', 
        config 
    });

    await loadLayout();
    showView('dashboard');
}

window.logout = logout;
