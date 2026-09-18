// ============================================
// UNIVERSAL EDUCATION IELTS
// Supabase Connection
// ============================================

const SUPABASE_URL = "https://fmwcvwgcwisdxiudlstq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ibtCq2hamnZkRNWPsxlddQ_JfexwHYM";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// ============================================
// Basic App Test
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>Universal Education IELTS</h1>
            <p>Supabase connection is ready.</p>
        </div>
    `;
});
