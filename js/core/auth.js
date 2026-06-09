import { supabaseClient } from '../config/supabase.js';
import { setAppState } from '../core/state.js';
import { loadCenterConfig } from '../config/app-config.js';
import { loadLayout, showView } from '../core/layout.js';
import { safeQuery } from './safeQuery.js';

export async function getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

export async function login(email, password) {
    console.log('=== LOGIN START ===');
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    
    if (error) {
        console.error('LOGIN ERROR:', error);
        throw error;
    }

    console.log('LOGIN SUCCESS');
    await afterLogin();
}

export async function register(email, password) {
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
        throw error;
    }
}

export async function logout() {
    await supabaseClient.auth.signOut();
    setAppState({
        user: null,
        profile: null,
        centreId: null,
        role: null,
        config: null
    });
    window.location.reload();
}

export async function afterLogin() {
    try {
        console.log('===== AFTER LOGIN START =====');
        const user = await getCurrentUser();

        if (!user) {
            throw new Error('Authentification échouée');
        }

        const profile = await safeQuery(() =>
            supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
        );

        if (!profile) {
            throw new Error('Profil utilisateur introuvable.');
        }

        if (!profile.centre_id) {
            throw new Error('centre_id manquant dans le profil.');
        }

        const config = await loadCenterConfig(profile.centre_id);

        setAppState({
            user,
            profile,
            centreId: profile.centre_id,
            role: profile.role || 'teacher',
            config
        });

        console.log('APP STATE INITIALISÉ');
        await loadLayout();
        await showView('dashboard');

    } catch (error) {
        console.error('ERREUR APRÈS CONNEXION :', error);
        throw error;
    }
}

// Rétrocompatibilité globale
window.logout = logout;
