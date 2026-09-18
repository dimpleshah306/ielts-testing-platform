// ============================================
// UNIVERSAL EDUCATION IELTS
// AUTHENTICATION
// ============================================

const SUPABASE_URL = "https://fmwcvwgcwisdxiudlstq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ibtCq2hamnZkRNWPsxlddQ_JfexwHYM";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// ============================================
// LOGIN MODE
// ============================================

let loginMode = "student";

const studentTab = document.getElementById("studentTab");
const staffTab = document.getElementById("staffTab");
const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

// ============================================
// TAB SWITCHING
// ============================================

studentTab.addEventListener("click", () => {
    loginMode = "student";

    studentTab.classList.add("active");
    staffTab.classList.remove("active");

    loginMessage.textContent = "";
});

staffTab.addEventListener("click", () => {
    loginMode = "staff";

    staffTab.classList.add("active");
    studentTab.classList.remove("active");

    loginMessage.textContent = "";
});

// ============================================
// LOGIN
// ============================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showMessage("Please enter email and password.", true);
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";
    loginMessage.textContent = "";

    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }

        if (!data.user) {
            throw new Error("Login failed.");
        }

        // Get user's profile
        const { data: profile, error: profileError } =
            await supabaseClient
                .from("profiles")
                .select("full_name, role, active")
                .eq("id", data.user.id)
                .single();

        if (profileError) {
            throw profileError;
        }

        if (!profile.active) {
            await supabaseClient.auth.signOut();
            throw new Error("This account is inactive.");
        }

        // Check selected login type
        if (loginMode === "staff") {

            if (profile.role !== "admin" && profile.role !== "tutor") {
                await supabaseClient.auth.signOut();

                throw new Error(
                    "This account is not an Admin / Tutor account."
                );
            }

            showMessage("Admin / Tutor login successful.");

        } else {

            if (profile.role !== "student") {
                await supabaseClient.auth.signOut();

                throw new Error(
                    "Please use Admin / Tutor login for this account."
                );
            }

            showMessage("Student login successful.");
        }

// ============================================
// OPEN DASHBOARD
// ============================================

setTimeout(() => {
    openDashboard(profile);
}, 500);
                <div style="
                    min-height:100vh;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:24px;
                    font-family:Arial;
                ">
                    <div style="
                        background:#fff;
                        padding:40px;
                        border-radius:18px;
                        text-align:center;
                        box-shadow:0 12px 40px rgba(0,0,0,.10);
                        max-width:450px;
                        width:100%;
                    ">

                        <h1>Welcome, ${escapeHtml(profile.full_name)}</h1>

                        <p style="
                            margin-top:12px;
                            color:#64748b;
                        ">
                            ${escapeHtml(profile.role.toUpperCase())}
                        </p>

                        <p style="
                            margin-top:20px;
                            color:#173f8a;
                            font-weight:600;
                        ">
                            Login successful.
                        </p>

                        <button
                            id="logoutButton"
                            style="
                                margin-top:25px;
                                padding:12px 24px;
                                border:none;
                                border-radius:8px;
                                background:#173f8a;
                                color:#fff;
                                cursor:pointer;
                                font-weight:600;
                            "
                        >
                            Logout
                        </button>

                    </div>
                </div>
            `;

            document
                .getElementById("logoutButton")
                .addEventListener("click", logout);

        }, 500);

    } catch (error) {

        console.error(error);

        showMessage(
            error.message || "Unable to login.",
            true
        );

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
});

// ============================================
// MESSAGE
// ============================================

function showMessage(message, isError = false) {

    loginMessage.textContent = message;

    loginMessage.style.color =
        isError ? "#dc2626" : "#15803d";
}

// ============================================
// LOGOUT
// ============================================

async function logout() {

    await supabaseClient.auth.signOut();

    window.location.reload();
}

// ============================================
// BASIC HTML ESCAPE
// ============================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
// ============================================
// ADMIN / TUTOR DASHBOARD
// ============================================

function openDashboard(profile) {

    document.getElementById("app").innerHTML = `
        <div class="dashboard">

            <header class="dashboard-header">

                <div>
                    <h1>Universal Education IELTS</h1>
                    <p>Testing Platform</p>
                </div>

                <div class="user-area">
                    <div>
                        <strong>${escapeHtml(profile.full_name)}</strong>
                        <span>${escapeHtml(profile.role)}</span>
                    </div>

                    <button id="dashboardLogout">
                        Logout
                    </button>
                </div>

            </header>

            <main class="dashboard-content">

                <div class="dashboard-title">
                    <h2>Admin Dashboard</h2>
                    <p>Manage your IELTS testing platform</p>
                </div>

                <section class="dashboard-grid">

                    <button class="dashboard-card" data-module="students">
                        <span class="card-icon">👨‍🎓</span>
                        <strong>Students</strong>
                        <small>Manage students</small>
                    </button>

                    <button class="dashboard-card" data-module="tests">
                        <span class="card-icon">📝</span>
                        <strong>Tests</strong>
                        <small>Create and manage tests</small>
                    </button>

                    <button class="dashboard-card" data-module="listening">
                        <span class="card-icon">🎧</span>
                        <strong>Listening</strong>
                        <small>Manage listening tests</small>
                    </button>

                    <button class="dashboard-card" data-module="reading">
                        <span class="card-icon">📖</span>
                        <strong>Reading</strong>
                        <small>Manage reading tests</small>
                    </button>

                    <button class="dashboard-card" data-module="writing">
                        <span class="card-icon">✍️</span>
                        <strong>Writing</strong>
                        <small>Manage writing tasks</small>
                    </button>

                    <button class="dashboard-card" data-module="results">
                        <span class="card-icon">📊</span>
                        <strong>Results</strong>
                        <small>View student results</small>
                    </button>

                </section>

                <div id="dashboardMessage"></div>

            </main>

        </div>
    `;

    document
        .getElementById("dashboardLogout")
        .addEventListener("click", logout);

    document
        .querySelectorAll(".dashboard-card")
        .forEach(card => {

            card.addEventListener("click", () => {

                const module = card.dataset.module;

                document.getElementById("dashboardMessage").innerHTML = `
                    <div class="coming-soon">
                        <strong>${module.toUpperCase()}</strong>
                        <p>This module will be connected next.</p>
                    </div>
                `;

            });

        });
}
