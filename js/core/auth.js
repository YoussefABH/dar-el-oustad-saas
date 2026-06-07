// auth.js

import { supabaseClient } from '../config/supabase.js';

import {
    setAppState,
    getAppState
} from './state.js';

import {
    loadCenterConfig
} from '../config/app-config.js';

import {
    loadLayout,
    showView
} from './layout.js';

// Récupérer l'utilisateur connecté
export async function getCurrentUser() {

    try {

        const {
            data: { user },
            error
        } = await supabaseClient.auth.getUser();

        if (error) {
            console.error(error);
            return null;
        }

        return user;

    } catch (err) {

        console.error('Erreur getCurrentUser :', err);

        return null;
    }
}

// Connexion
export async function login(email, password) {

    if (!email || !password) {
        throw new Error('Email et mot de passe obligatoires');
    }

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw error;
    }

    await afterLogin();
}

// Inscription
export async function register(email, password) {

    if (!email || !password) {
        throw new Error('Email et mot de passe obligatoires');
    }

    const { error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    if (error) {
        throw error;
    }

    return true;
}

// Déconnexion
export async function logout() {

    try {

        await supabaseClient.auth.signOut();

        setAppState({
            user: null,
            profile: null,
            centreId: null,
            role: null,
            config: null
        });

        window.location.reload();

    } catch (err) {

        console.error('Erreur logout :', err);
    }
}

// Traitement après connexion
async function afterLogin() {

    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Utilisateur non trouvé');
    }

    const {
        data: profile,
        error: profileError
    } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        throw profileError;
    }

    if (!profile) {
        throw new Error('Profil introuvable');
    }

    if (!profile.centre_id) {
        throw new Error('Aucun centre associé à ce compte');
    }

    const config = await loadCenterConfig(
        profile.centre_id
    );

    setAppState({
        user,
        profile,
        centreId: profile.centre_id,
        role: profile.role,
        config
    });

    await loadLayout();

    showView('dashboard');

    return true;
}
