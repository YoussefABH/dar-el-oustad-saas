import { supabaseClient } from '../config/supabase.js';
import { setAppState } from './state.js';
import { loadCenterConfig } from '../config/app-config.js';
import { loadLayout, showView } from './layout.js';
import { safeQuery } from '../services/safeQuery.js';

export async function getCurrentUser() {
    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    return user;
}

export async function login(email, password) {

    console.log('=== LOGIN START ===');

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('LOGIN ERROR:', error);
        throw error;
    }

    console.log('LOGIN SUCCESS');

    await afterLogin();
}

export async function register(email, password) {

    const { error } = await supabaseClient.auth.signUp({
        email,
        password
    });

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

        console.log('1 - USER');
        console.log(user);

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

        console.log('2 - PROFILE');
        console.log(profile);

        if (!profile) {
            throw new Error(
                'Profil utilisateur introuvable.'
            );
        }

        if (!profile.centre_id) {
            throw new Error(
                'centre_id manquant dans le profil.'
            );
        }

        console.log('3 - CENTRE ID');
        console.log(profile.centre_id);

        const config = await loadCenterConfig(
            profile.centre_id
        );

        console.log('4 - CONFIG');
        console.log(config);

        console.log('5 - SET APP STATE');

        setAppState({
            user,
            profile,
            centreId: profile.centre_id,
            role: profile.role || 'teacher',
            config
        });

        console.log('APP STATE INITIALISÉ');

        console.log('6 - LOAD LAYOUT');

        await loadLayout();

        console.log('LAYOUT CHARGÉ');

        console.log('7 - SHOW DASHBOARD');

        await showView('dashboard');

        console.log('DASHBOARD DEMANDÉ');

        console.log('===== AFTER LOGIN SUCCESS =====');

    } catch (error) {

        console.error(
            'ERREUR APRÈS CONNEXION :',
            error
        );

        throw error;
    }
}

window.logout = logout;
