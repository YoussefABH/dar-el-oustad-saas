const SUPABASE_URL = "https://ecwlqiuvgmikglnfybon.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ROrM2kw2PBgsYr1xq7Oi4w_pThtprFF";

// 1. Création de l'instance
export const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Ancrage explicite dans le scope global pour vos modules
window.supabaseClient = supabaseClient;
