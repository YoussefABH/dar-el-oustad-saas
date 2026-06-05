const SUPABASE_URL = "https://ecwlqiuvgmikglnfybon.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjd2xxaXV2Z21pa2dsbmZ5Ym9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDEzNDUsImV4cCI6MjA5NjA3NzM0NX0.ppNWQkwIsPLevIcu00a7__oWHgTdVVj3fy9Uv3GRWOs";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

async function getCurrentUser() {
    const { data } = await supabaseClient.auth.getUser();
    return data.user;
}
