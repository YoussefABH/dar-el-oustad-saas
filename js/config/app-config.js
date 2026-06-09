import { supabaseClient } from './supabase.js';

export const defaultAppConfig = {
    establishment: { name: "Dar El-Oustad" },
    contact: { phone: "", email: "contact@dar-el-oustad.ma" },
    legal: { ice: "" }
};

let currentConfig = structuredClone(defaultAppConfig);

export async function loadCenterConfig(centreId) {
    if (!centreId) return currentConfig;
    try {
        const { data, error } = await supabaseClient
            .from('settings')
            .select('*')
            .eq('centre_id', centreId)
            .maybeSingle();
            
        if (data) {
            currentConfig = {
                establishment: { ...defaultAppConfig.establishment, ...data.establishment },
                contact: { ...defaultAppConfig.contact, ...data.contact },
                legal: { ...defaultAppConfig.legal, ...data.legal }
            };
        }
        return currentConfig;
    } catch (err) {
        console.error('Erreur config:', err);
        return currentConfig;
    }
}

export function getAppConfig() { return currentConfig; }
