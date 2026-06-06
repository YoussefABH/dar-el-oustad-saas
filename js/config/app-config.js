// Configuration par défaut du centre (sera fusionnée avec les données de la table settings plus tard)
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

// Fonction pour charger la configuration du centre depuis la table settings (à appeler après login)
let currentConfig = { ...defaultAppConfig };

export async function loadCenterConfig(centreId) {
    if (!centreId) return;
    const { data, error } = await supabaseClient
        .from('settings')
        .select('*')
        .eq('centre_id', centreId)
        .single();
    if (!error && data) {
        // Fusionner avec la config par défaut
        currentConfig = {
            establishment: { ...defaultAppConfig.establishment, ...data.establishment },
            legal: { ...defaultAppConfig.legal, ...data.legal },
            contact: { ...defaultAppConfig.contact, ...data.contact },
            preferences: { ...defaultAppConfig.preferences, ...data.preferences }
        };
        // Appliquer le favicon
        if (currentConfig.establishment.favicon) {
            const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/png';
            link.rel = 'shortcut icon';
            link.href = currentConfig.establishment.favicon;
            document.head.appendChild(link);
        }
    }
    return currentConfig;
}

export function getAppConfig() {
    return currentConfig;
}
