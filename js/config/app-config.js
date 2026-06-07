// app-config.js

import { supabaseClient } from './supabase.js';

// Configuration par défaut
export const defaultAppConfig = {
    establishment: {
        name: "Dar El-Oustad",
        slogan: "L'excellence pour tous",
        logo: "/assets/logo-default.png",
        favicon: "/assets/favicon-default.png"
    },

    legal: {
        ice: "",
        rc: "",
        if: "",
        patente: "",
        city: "",
        country: "Maroc"
    },

    contact: {
        phone: "",
        email: "contact@dar-el-oustad.ma",
        website: "",
        address: ""
    },

    preferences: {
        currency: "DH",
        language: "fr",
        activeSchoolYear: "2025-2026"
    }
};

// Configuration courante
let currentConfig = structuredClone(defaultAppConfig);

// Charger la configuration depuis Supabase
export async function loadCenterConfig(centreId) {

    if (!centreId) {
        return currentConfig;
    }

    try {

        const { data, error } = await supabaseClient
            .from('settings')
            .select('*')
            .eq('centre_id', centreId)
            .single();

        if (error) {
            console.warn('Configuration centre non trouvée :', error.message);
            return currentConfig;
        }

        if (data) {

            currentConfig = {
                establishment: {
                    ...defaultAppConfig.establishment,
                    ...(data.establishment || {})
                },

                legal: {
                    ...defaultAppConfig.legal,
                    ...(data.legal || {})
                },

                contact: {
                    ...defaultAppConfig.contact,
                    ...(data.contact || {})
                },

                preferences: {
                    ...defaultAppConfig.preferences,
                    ...(data.preferences || {})
                }
            };

            updateFavicon(
                currentConfig.establishment.favicon
            );
        }

        return currentConfig;

    } catch (err) {

        console.error('Erreur chargement configuration :', err);

        return currentConfig;
    }
}

// Mettre à jour le favicon
function updateFavicon(faviconUrl) {

    if (!faviconUrl) return;

    let favicon = document.querySelector("link[rel='icon']");

    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
    }

    favicon.href = faviconUrl;
}

// Retourner la configuration actuelle
export function getAppConfig() {
    return currentConfig;
}
