const SUPABASE_URL = "https://ecwlqiuvgmikglnfybon.supabase.co";
const SUPABASE_ANON_KEY = "REMPLACE_PAR_TA_CLE_PUBLISHABLE";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function getCurrentUser() {
    const { data } = await supabaseClient.auth.getUser();
    return data.user;
}
