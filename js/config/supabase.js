const SUPABASE_URL = "https://ecwlqiuvgmikglnfybon.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ROrM2kw2PBgsYr1xq7Oi4w_pThtprFF";

export const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient; // compatibilité temporaire
