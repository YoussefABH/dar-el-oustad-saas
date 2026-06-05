const SUPABASE_URL = "https://ecwlqiuvgmikglnfybon.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ROrM2kw2PBgsYr1xq7Oi4w_pThtprFF";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function getCurrentUser() {
    const { data } = await supabaseClient.auth.getUser();
    return data.user;
}
