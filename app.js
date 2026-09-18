// ============================================
// UNIVERSAL EDUCATION IELTS
// MAIN APP.JS
// ============================================

// ============================================
// SUPABASE CONFIGURATION
// ============================================

const SUPABASE_URL = "https://fmwcvwgcwisdxiudlstq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ibtCq2hamnZkRNWPsxlddQ_JfexwHYM";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ============================================
// GLOBAL VARIABLES
// ============================================

let loginMode = "student";


// ============================================
// DOM ELEMENTS
// ============================================

const studentTab = document.getElementById("studentTab");
const staffTab = document.getElementById("staffTab");
const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");


// ============================================
// LOGIN MODE — STUDENT
// ============================================

studentTab.addEventListener("click", () => {

    loginMode = "student";

    studentTab.classList.add("active");
    staffTab.classList.remove("active");

    loginMessage.textContent = "";

});


// ============================================
// LOGIN MODE — ADMIN / TUTOR
// ============================================

staffTab.addEventListener("click", () => {

    loginMode = "staff";

    staffTab.classList.add("active");
    studentTab.classList.remove("active");

    loginMessage.textContent = "";

});


// ============================================
// LOGIN FORM
// ============================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (!email || !password) {

        showMessage(
            "Please enter email and password.",
            true
        );

        return;
    }


    // ----------------------------------------
    // LOADING STATE
    // ----------------------------------------

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";
    loginMessage.textContent = "";


    try {

        // ------------------------------------
        // SUPABASE AUTH LOGIN
        // ------------------------------------

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,
                password: password

            });


        if (error) {
            throw error;
        }


        if (!data.user) {

            throw new Error(
                "Login failed."
            );

        }


        // ------------------------------------
        // GET USER PROFILE
        // ------------------------------------

        const { data: profile, error: profileError } =
            await supabaseClient
                .from("profiles")
                .select(
                    "full_name, role, active"
                )
                .eq("id", data.user.id)
                .single();


        if (profileError) {
            throw profileError;
        }


        // ------------------------------------
        // CHECK ACCOUNT STATUS
        // ------------------------------------

        if (!profile.active) {

            await supabaseClient.auth.signOut();

            throw new Error(
                "This account is inactive."
            );

        }


        // ------------------------------------
        // CHECK LOGIN TYPE
        // ------------------------------------

        if (loginMode === "staff") {

            // Admin / Tutor login

            if (
                profile.role !== "admin" &&
                profile.role !== "tutor"
            ) {

                await supabaseClient.auth.signOut();

                throw new Error(
                    "This account is not an Admin / Tutor account."
                );

            }


            showMessage(
                "Admin / Tutor login successful."
            );


        } else {

            // Student login

            if (profile.role !== "student") {

                await supabaseClient.auth.signOut();

                throw new Error(
                    "Please use Admin / Tutor login for this account."
                );

            }


            showMessage(
                "Student login successful."
            );

        }


        // ------------------------------------
        // OPEN DASHBOARD
        // ------------------------------------

        setTimeout(() => {

            openDashboard(profile);

        }, 500);


    } catch (error) {

        console.error(
            "Login Error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to login.",
            true
        );


    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "Login";

    }

});


// ============================================
// MESSAGE FUNCTION
// ============================================

function showMessage(
    message,
    isError = false
) {

    loginMessage.textContent = message;

    loginMessage.style.color =
        isError
            ? "#dc2626"
            : "#15803d";

}


// ============================================
// OPEN DASHBOARD
// ============================================

function openDashboard(profile) {

    const isStaff =
        profile.role === "admin" ||
        profile.role === "tutor";


    // ========================================
    // STAFF DASHBOARD
    // ========================================

    if (isStaff) {

        openStaffDashboard(profile);

        return;
    }


    // ========================================
    // STUDENT DASHBOARD
    // ========================================

    openStudentDashboard(profile);

}


// ============================================
// ADMIN / TUTOR DASHBOARD
// ============================================

function openStaffDashboard(profile) {

    document.getElementById("app").innerHTML = `

        <div class="dashboard">

            <!-- HEADER -->

            <header class="dashboard-header">

                <div>

                    <h1>
                        Universal Education IELTS
                    </h1>

                    <p>
                        Testing Platform
                    </p>

                </div>


                <div class="user-area">

                    <div>

                        <strong>
                            ${escapeHtml(profile.full_name)}
                        </strong>

                        <span>
                            ${escapeHtml(profile.role)}
                        </span>

                    </div>


                    <button
                        id="dashboardLogout"
                        type="button"
                    >
                        Logout
                    </button>

                </div>

            </header>


            <!-- CONTENT -->

            <main class="dashboard-content">

                <div class="dashboard-title">

                    <h2>
                        Admin Dashboard
                    </h2>

                    <p>
                        Manage your IELTS testing platform
                    </p>

                </div>


                <!-- MODULES -->

                <section class="dashboard-grid">


                    <!-- STUDENTS -->

                    <button
                        class="dashboard-card"
                        data-module="students"
                        type="button"
                    >

                        <span class="card-icon">
                            👨‍🎓
                        </span>

                        <strong>
                            Students
                        </strong>

                        <small>
                            Manage students
                        </small>

                    </button>


                    <!-- TESTS -->

                    <button
                        class="dashboard-card"
                        data-module="tests"
                        type="button"
                    >

                        <span class="card-icon">
                            📝
                        </span>

                        <strong>
                            Tests
                        </strong>

                        <small>
                            Create and manage tests
                        </small>

                    </button>


                    <!-- LISTENING -->

                    <button
                        class="dashboard-card"
                        data-module="listening"
                        type="button"
                    >

                        <span class="card-icon">
                            🎧
                        </span>

                        <strong>
                            Listening
                        </strong>

                        <small>
                            Manage listening tests
                        </small>

                    </button>


                    <!-- READING -->

                    <button
                        class="dashboard-card"
                        data-module="reading"
                        type="button"
                    >

                        <span class="card-icon">
                            📖
                        </span>

                        <strong>
                            Reading
                        </strong>

                        <small>
                            Manage reading tests
                        </small>

                    </button>


                    <!-- WRITING -->

                    <button
                        class="dashboard-card"
                        data-module="writing"
                        type="button"
                    >

                        <span class="card-icon">
                            ✍️
                        </span>

                        <strong>
                            Writing
                        </strong>

                        <small>
                            Manage writing tasks
                        </small>

                    </button>


                    <!-- RESULTS -->

                    <button
                        class="dashboard-card"
                        data-module="results"
                        type="button"
                    >

                        <span class="card-icon">
                            📊
                        </span>

                        <strong>
                            Results
                        </strong>

                        <small>
                            View student results
                        </small>

                    </button>


                </section>


                <!-- MODULE MESSAGE -->

                <div
                    id="dashboardMessage"
                ></div>


            </main>

        </div>

    `;


    // ========================================
    // LOGOUT
    // ========================================

    document
        .getElementById("dashboardLogout")
        .addEventListener(
            "click",
            logout
        );


    // ========================================
    // MODULE BUTTONS
    // ========================================

document
    .querySelectorAll(".dashboard-card")
    .forEach(card => {

        card.addEventListener("click", async () => {

            const module = card.dataset.module;

            if (module === "students") {

                await openStudents();

                return;
            }

            if (module === "listening") {

                await openListeningAdmin(profile);

                return;
            }

            document
                .getElementById("dashboardMessage")
                .innerHTML = `

                    <div class="coming-soon">

                        <strong>
                            ${escapeHtml(module.toUpperCase())}
                        </strong>

                        <p>
                            This module will be connected next.
                        </p>

                    </div>

                `;

        });

    });

}


// ============================================
// ADMIN LISTENING TEST MANAGEMENT
// ============================================

async function openAdminListeningTests(profile) {

    const message =
        document.getElementById("dashboardMessage");

    if (!message) {
        return;
    }

    message.innerHTML = `
        <div class="students-panel">

            <div class="students-panel-header">

                <div>
                    <h2>🎧 Listening Tests</h2>

                    <p>
                        Create and manage Listening Tests
                    </p>
                </div>

                <button
                    type="button"
                    class="add-student-button"
                    id="createListeningTestButton"
                >
                    + Create Listening Test
                </button>

            </div>

            <div id="listeningTestsContent">
                <div class="coming-soon">
                    Loading Listening Tests...
                </div>
            </div>

        </div>
    `;

    document
        .getElementById("createListeningTestButton")
        .addEventListener(
            "click",
            () => openCreateListeningTestForm(profile)
        );

    try {

        const {
            data: tests,
            error
        } = await supabaseClient
            .from("tests")
            .select("*")
            .eq("module", "listening")
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        const content =
            document.getElementById("listeningTestsContent");

        if (!tests || tests.length === 0) {

            content.innerHTML = `
                <div class="empty-test-state">

                    <div class="empty-icon">🎧</div>

                    <h2>No Listening Tests Yet</h2>

                    <p>
                        Create your first Listening Test
                        to continue.
                    </p>

                </div>
            `;

            return;
        }

        const rows = tests.map(test => `

            <tr>

                <td>
                    ${escapeHtml(test.title || "-")}
                </td>

                <td>
                    ${escapeHtml(test.status || "draft")}
                </td>

                <td>
                    ${test.duration_minutes || 40} min
                </td>

                <td>
                    ${test.created_at
                        ? new Date(test.created_at).toLocaleDateString()
                        : "-"
                    }
                </td>

            </tr>

        `).join("");

        content.innerHTML = `

            <div class="students-table-wrapper">

                <table class="students-table">

                    <thead>
                        <tr>
                            <th>Test Title</th>
                            <th>Status</th>
                            <th>Duration</th>
                            <th>Created</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

            </div>
        `;

    } catch (error) {

        console.error(
            "Listening Tests Error:",
            error
        );

        document
            .getElementById("listeningTestsContent")
            .innerHTML = `

                <div class="coming-soon">

                    <strong>
                        Unable to load Listening Tests
                    </strong>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Unknown error"
                        )}
                    </p>

                </div>
            `;
    }
}


// ============================================
// CREATE LISTENING TEST
// ============================================

function openCreateListeningTestForm(profile) {

    const message =
        document.getElementById("dashboardMessage");

    if (!message) {
        return;
    }

    message.innerHTML = `

        <div class="students-panel">

            <div class="students-panel-header">

                <div>
                    <h2>🎧 Create Listening Test</h2>

                    <p>
                        Enter the basic test information.
                    </p>
                </div>

                <button
                    type="button"
                    class="cancel-button"
                    id="cancelListeningTestButton"
                >
                    Cancel
                </button>

            </div>


            <form
                id="createListeningTestForm"
                class="student-form"
            >

                <div class="form-group">

                    <label for="listeningTestTitle">
                        Test Title
                    </label>

                    <input
                        type="text"
                        id="listeningTestTitle"
                        placeholder="Example: Listening Test 01"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="listeningTestInstructions">
                        Instructions
                    </label>

                    <textarea
                        id="listeningTestInstructions"
                        rows="5"
                        placeholder="Enter test instructions"
                    ></textarea>

                </div>


                <div class="form-group">

                    <label for="listeningTestDuration">
                        Duration (Minutes)
                    </label>

                    <input
                        type="number"
                        id="listeningTestDuration"
                        value="40"
                        min="1"
                        required
                    >

                </div>


                <div class="student-form-actions">

                    <button
                        type="button"
                        id="cancelListeningTestButton2"
                        class="cancel-button"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        id="saveListeningTestButton"
                        class="save-button"
                    >
                        Create Listening Test
                    </button>

                </div>


                <div
                    id="listeningTestFormMessage"
                    class="login-message"
                ></div>

            </form>

        </div>
    `;

    document
        .getElementById("cancelListeningTestButton")
        .addEventListener(
            "click",
            () => openAdminListeningTests(profile)
        );

    document
        .getElementById("cancelListeningTestButton2")
        .addEventListener(
            "click",
            () => openAdminListeningTests(profile)
        );

    document
        .getElementById("createListeningTestForm")
        .addEventListener(
            "submit",
            (event) =>
                saveListeningTest(event, profile)
        );
}


// ============================================
// SAVE LISTENING TEST
// ============================================

async function saveListeningTest(event, profile) {

    event.preventDefault();

    const title =
        document
            .getElementById("listeningTestTitle")
            .value
            .trim();

    const instructions =
        document
            .getElementById("listeningTestInstructions")
            .value
            .trim();

    const duration =
        Number(
            document
                .getElementById("listeningTestDuration")
                .value
        );

    const saveButton =
        document.getElementById(
            "saveListeningTestButton"
        );

    const formMessage =
        document.getElementById(
            "listeningTestFormMessage"
        );

    if (!title) {

        formMessage.textContent =
            "Please enter a test title.";

        formMessage.style.color =
            "#dc2626";

        return;
    }

    if (!duration || duration < 1) {

        formMessage.textContent =
            "Please enter a valid duration.";

        formMessage.style.color =
            "#dc2626";

        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Creating Test...";
    formMessage.textContent = "";

    try {

        const {
            data: test,
            error
        } = await supabaseClient
            .from("tests")
            .insert({
                title: title,
                module: "listening",
                instructions: instructions || null,
                duration_minutes: duration,
                status: "draft"
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        formMessage.textContent =
            "Listening Test created successfully.";

        formMessage.style.color =
            "#15803d";

        setTimeout(
            () => openAdminListeningTests(profile),
            700
        );

    } catch (error) {

        console.error(
            "Create Listening Test Error:",
            error
        );

        formMessage.textContent =
            error.message ||
            "Unable to create Listening Test.";

        formMessage.style.color =
            "#dc2626";

        saveButton.disabled = false;
        saveButton.textContent =
            "Create Listening Test";
    }
}


// ============================================
// STUDENT DASHBOARD
// ============================================

function openStudentDashboard(profile) {

    document.getElementById("app").innerHTML = `

        <div class="dashboard">

            <header class="dashboard-header">

                <div>

                    <h1>
                        Universal Education IELTS
                    </h1>

                    <p>
                        Student Testing Platform
                    </p>

                </div>


                <div class="user-area">

                    <div>

                        <strong>
                            ${escapeHtml(profile.full_name)}
                        </strong>

                        <span>
                            Student
                        </span>

                    </div>


                    <button
                        id="studentLogout"
                        type="button"
                    >
                        Logout
                    </button>

                </div>

            </header>


            <main class="dashboard-content">

                <div class="dashboard-title">

                    <h2>
                        Student Dashboard
                    </h2>

                    <p>
                        Select your IELTS test
                    </p>

                </div>


                <section class="dashboard-grid">


                    <button
                        class="dashboard-card"
                        data-module="listening"
                        type="button"
                    >

                        <span class="card-icon">
                            🎧
                        </span>

                        <strong>
                            Listening
                        </strong>

                        <small>
                            Start Listening Test
                        </small>

                    </button>


                    <button
                        class="dashboard-card"
                        data-module="reading"
                        type="button"
                    >

                        <span class="card-icon">
                            📖
                        </span>

                        <strong>
                            Reading
                        </strong>

                        <small>
                            Start Reading Test
                        </small>

                    </button>


                    <button
                        class="dashboard-card"
                        data-module="writing"
                        type="button"
                    >

                        <span class="card-icon">
                            ✍️
                        </span>

                        <strong>
                            Writing
                        </strong>

                        <small>
                            Start Writing Test
                        </small>

                    </button>


                    <button
                        class="dashboard-card"
                        data-module="results"
                        type="button"
                    >

                        <span class="card-icon">
                            📊
                        </span>

                        <strong>
                            My Results
                        </strong>

                        <small>
                            View your results
                        </small>

                    </button>


                </section>


                <div
                    id="dashboardMessage"
                ></div>


            </main>

        </div>

    `;


    // ========================================
    // LOGOUT
    // ========================================

    document
        .getElementById("studentLogout")
        .addEventListener(
            "click",
            logout
        );


    // ========================================
    // STUDENT MODULE BUTTONS
    // ========================================

    document
        .querySelectorAll(".dashboard-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const module = card.dataset.module;

                    if (module === "listening") {
                        openStudentListeningTests(profile);
                        return;
                    }

                    document
                        .getElementById("dashboardMessage")
                        .innerHTML = `
                            <div class="coming-soon">
                                <strong>${escapeHtml(module.toUpperCase())}</strong>
                                <p>This module will be connected next.</p>
                            </div>
                        `;
                }
            );

        });

}


// ============================================
// COMPLETE LISTENING TEST MODULE
// Admin: tests → 4 parts → audio → questions/options
// Student: test list → instructions → 4 parts → timer → submit → scoring
// ============================================

const LISTENING_BUCKET = "listening-audio";
const LISTENING_PARTS = [
    { number: 1, from: 1, to: 10, title: "Part 1" },
    { number: 2, from: 11, to: 20, title: "Part 2" },
    { number: 3, from: 21, to: 30, title: "Part 3" },
    { number: 4, from: 31, to: 40, title: "Part 4" }
];

let listeningEditorState = null;
let listeningRunnerState = null;

function listeningEscape(value) {
    return escapeHtml(value == null ? "" : value);
}

function listeningAnswerKey(question) {
    const raw = question.correct_answer;
    if (raw == null) return "";
    if (Array.isArray(raw)) return raw.map(v => String(v).trim().toLowerCase());
    return String(raw).split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
}

function listeningNormalize(value) {
    return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function listeningIsCorrect(question, answer) {
    const keys = listeningAnswerKey(question);
    if (!keys.length) return false;
    if (Array.isArray(answer)) {
        const a = answer.map(listeningNormalize).filter(Boolean).sort();
        const k = keys.map(listeningNormalize).sort();
        return JSON.stringify(a) === JSON.stringify(k);
    }
    return keys.includes(listeningNormalize(answer));
}

function listeningQuestionTypeLabel(type) {
    const map = {
        "mcq_single": "MCQ – Single Answer",
        "mcq_multiple": "MCQ – Multiple Answer",
        "true_false_not_given": "True / False / Not Given",
        "yes_no_not_given": "Yes / No / Not Given",
        "matching": "Matching",
        "completion": "Completion",
        "short_answer": "Short Answer",
        "diagram": "Diagram / Map / Plan"
    };
    return map[type] || type || "Completion";
}

async function openListeningAdmin(profile) {
    const message = document.getElementById("dashboardMessage");
    if (!message) return;

    message.innerHTML = `
        <div class="students-panel">
            <div class="students-panel-header">
                <div>
                    <h2>🎧 Listening Test Management</h2>
                    <p>Create, edit and manage complete 40-question Listening Tests.</p>
                </div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <button type="button" class="add-student-button" id="newListeningTestBtn">+ Create Listening Test</button>
                    <button type="button" class="cancel-button" id="backStaffFromListening">← Dashboard</button>
                </div>
            </div>
            <div id="adminListeningList"><div class="coming-soon">Loading Listening Tests...</div></div>
        </div>`;

    document.getElementById("backStaffFromListening")?.addEventListener("click", () => openStaffDashboard(profile));
    document.getElementById("newListeningTestBtn")?.addEventListener("click", () => openListeningTestEditor(profile));

    try {
        const { data, error } = await supabaseClient.from("tests")
            .select("*").eq("module", "listening").order("created_at", { ascending: false });
        if (error) throw error;
        const list = document.getElementById("adminListeningList");
        if (!data?.length) {
            list.innerHTML = `<div class="empty-test-state"><div class="empty-icon">🎧</div><h2>No Listening Tests Yet</h2><p>Create your first test. The editor will create Parts 1–4 automatically.</p></div>`;
            return;
        }
        list.innerHTML = `<div class="students-table-wrapper"><table class="students-table"><thead><tr><th>Title</th><th>Status</th><th>Duration</th><th>Created</th><th>Action</th></tr></thead><tbody>
            ${data.map(t => `<tr><td>${listeningEscape(t.title)}</td><td>${listeningEscape(t.status || "draft")}</td><td>${t.duration_minutes || 40} min</td><td>${t.created_at ? new Date(t.created_at).toLocaleDateString() : "-"}</td><td><button type="button" class="module-btn" data-edit-listening="${t.id}">Open</button></td></tr>`).join("")}
        </tbody></table></div>`;
        list.querySelectorAll("[data-edit-listening]").forEach(btn => btn.addEventListener("click", () => openListeningTestEditor(profile, btn.dataset.editListening)));
    } catch (error) {
        document.getElementById("adminListeningList").innerHTML = `<div class="coming-soon"><strong>Unable to load Listening Tests</strong><p>${listeningEscape(error.message)}</p></div>`;
    }
}

async function openListeningTestEditor(profile, testId = null) {
    const message = document.getElementById("dashboardMessage");
    if (!message) return;
    listeningEditorState = { profile, testId, test: null, sections: [] };
    message.innerHTML = `<div class="students-panel"><div class="students-panel-header"><div><h2>🎧 ${testId ? "Edit" : "Create"} Listening Test</h2><p>Configure the test, then manage all four parts.</p></div><button type="button" class="cancel-button" id="backListeningAdmin">← Tests</button></div><div id="listeningEditorContent"><div class="coming-soon">Loading...</div></div></div>`;
    document.getElementById("backListeningAdmin")?.addEventListener("click", () => openListeningAdmin(profile));

    try {
        if (testId) {
            const { data: test, error } = await supabaseClient.from("tests").select("*").eq("id", testId).single();
            if (error) throw error;
            const { data: sections, error: se } = await supabaseClient.from("sections").select("*").eq("test_id", testId).order("section_number");
            if (se) throw se;
            listeningEditorState.test = test;
            listeningEditorState.sections = sections || [];
        }
        renderListeningEditor();
    } catch (error) {
        document.getElementById("listeningEditorContent").innerHTML = `<div class="coming-soon"><strong>Unable to open test</strong><p>${listeningEscape(error.message)}</p></div>`;
    }
}

function renderListeningEditor() {
    const c = document.getElementById("listeningEditorContent");
    const st = listeningEditorState;
    if (!c) return;
    const t = st.test || {};
    const sections = LISTENING_PARTS.map(part => st.sections.find(s => Number(s.section_number) === part.number) || ({ section_number: part.number, title: part.title, instructions: "", audio_path: "", test_id: t.id })).sort((a,b)=>a.section_number-b.section_number);
    st.sections = sections;
    c.innerHTML = `
        <form id="listeningTestBasicForm" class="student-form">
            <div class="form-group"><label>Test Title</label><input id="ltTitle" required value="${listeningEscape(t.title || "")}" placeholder="Listening Test 01"></div>
            <div class="form-group"><label>Test Instructions</label><textarea id="ltInstructions" rows="4" placeholder="Enter overall instructions">${listeningEscape(t.instructions || "")}</textarea></div>
            <div class="form-group"><label>Duration (minutes)</label><input id="ltDuration" type="number" min="1" value="${t.duration_minutes || 40}" required></div>
            <div class="form-group"><label>Status</label><select id="ltStatus"><option value="draft" ${t.status === "draft" || !t.status ? "selected" : ""}>Draft</option><option value="published" ${t.status === "published" ? "selected" : ""}>Published</option></select></div>
            <div class="student-form-actions"><button type="submit" class="save-button" id="saveListeningBasic">${t.id ? "Save Test Details" : "Create Test + Parts"}</button></div>
            <div id="ltBasicMsg" class="login-message"></div>
        </form>
        ${t.id ? `<div style="margin-top:25px"><h3>Parts 1–4</h3><p style="color:#64748b">Each part has its own instructions, audio and 10 questions.</p>${sections.map(s => listeningAdminPartCard(s)).join("")}</div>` : `<div class="empty-test-state" style="margin-top:20px"><div class="empty-icon">🎧</div><h3>Four Parts will be created automatically</h3><p>After saving, you can upload audio and add Questions 1–40.</p></div>`}
    `;
    document.getElementById("listeningTestBasicForm")?.addEventListener("submit", saveListeningBasic);
    c.querySelectorAll("[data-open-part]").forEach(b => b.addEventListener("click", () => openListeningPartEditor(Number(b.dataset.openPart))));
    c.querySelectorAll("[data-delete-test]").forEach(b => b.addEventListener("click", deleteListeningTest));
}

function listeningAdminPartCard(section) {
    const p = LISTENING_PARTS.find(x => x.number === Number(section.section_number));
    return `<div style="border:1px solid #e5e7eb;border-radius:14px;padding:18px;margin:14px 0;background:#fff"><div style="display:flex;justify-content:space-between;gap:15px;align-items:center;flex-wrap:wrap"><div><strong>${p.title}</strong><div style="color:#64748b;font-size:14px">Questions ${p.from}–${p.to}</div><div style="font-size:13px;margin-top:5px">${section.audio_path ? "🔊 Audio uploaded" : "⚠️ No audio"}</div></div><button type="button" class="module-btn" data-open-part="${p.number}">Manage Part ${p.number}</button></div></div>`;
}

async function saveListeningBasic(event) {
    event.preventDefault();
    const st = listeningEditorState;
    const msg = document.getElementById("ltBasicMsg");
    const btn = document.getElementById("saveListeningBasic");
    const payload = { title: document.getElementById("ltTitle").value.trim(), instructions: document.getElementById("ltInstructions").value.trim() || null, duration_minutes: Number(document.getElementById("ltDuration").value) || 40, status: document.getElementById("ltStatus").value, module: "listening" };
    btn.disabled = true; btn.textContent = "Saving..."; msg.textContent = "";
    try {
        if (!st.testId) {
            const { data: test, error } = await supabaseClient.from("tests").insert(payload).select().single();
            if (error) throw error;
            st.testId = test.id; st.test = test;
            for (const part of LISTENING_PARTS) {
                const { data: sec, error: se } = await supabaseClient.from("sections").insert({ test_id: test.id, section_number: part.number, title: part.title, instructions: "" }).select().single();
                if (se) throw se;
                st.sections.push(sec);
            }
            msg.textContent = "Test and Parts 1–4 created successfully.";
        } else {
            const { data: test, error } = await supabaseClient.from("tests").update(payload).eq("id", st.testId).select().single();
            if (error) throw error; st.test = test; msg.textContent = "Test details saved.";
        }
        msg.style.color = "#15803d"; renderListeningEditor();
    } catch (error) {
        msg.textContent = error.message || "Unable to save test."; msg.style.color = "#dc2626"; btn.disabled = false; btn.textContent = st.testId ? "Save Test Details" : "Create Test + Parts";
    }
}

async function deleteListeningTest() {
    const st = listeningEditorState;
    if (!st?.testId || !confirm("Delete this Listening Test and its parts/questions?")) return;
    try {
        const { error } = await supabaseClient.from("tests").delete().eq("id", st.testId);
        if (error) throw error;
        openListeningAdmin(st.profile);
    } catch (error) { alert(error.message); }
}

async function openListeningPartEditor(partNumber) {
    const st = listeningEditorState;
    const section = st.sections.find(s => Number(s.section_number) === partNumber);
    if (!section?.id) { alert("Please save the test first."); return; }
    const c = document.getElementById("listeningEditorContent");
    c.innerHTML = `<div class="students-panel" style="padding:0"><div class="students-panel-header"><div><h2>🎧 Part ${partNumber}</h2><p>Questions ${LISTENING_PARTS[partNumber-1].from}–${LISTENING_PARTS[partNumber-1].to}</p></div><button type="button" class="cancel-button" id="backListeningEditor">← Test</button></div><form id="partForm" class="student-form"><div class="form-group"><label>Part Title</label><input id="partTitle" value="${listeningEscape(section.title || `Part ${partNumber}`)}" required></div><div class="form-group"><label>Part Instructions</label><textarea id="partInstructions" rows="4">${listeningEscape(section.instructions || "")}</textarea></div><div class="form-group"><label>Audio File</label><input id="partAudio" type="file" accept="audio/*"><small>Bucket: ${LISTENING_BUCKET}. Uploading a new file replaces the section audio reference.</small>${section.audio_path ? `<div style="margin-top:8px">Current: ${listeningEscape(section.audio_path)}</div><audio controls style="width:100%;margin-top:8px" id="currentPartAudio"></audio>` : ""}</div><div class="student-form-actions"><button type="submit" class="save-button">Save Part</button></div><div id="partMsg" class="login-message"></div></form><div style="margin-top:25px"><h3>Questions</h3><div id="partQuestions"><div class="coming-soon">Loading questions...</div></div></div></div>`;
    document.getElementById("backListeningEditor")?.addEventListener("click", renderListeningEditor);
    document.getElementById("partForm")?.addEventListener("submit", e => saveListeningPart(e, section));
    if (section.audio_path) loadSectionAudioUrl(section.audio_path, "currentPartAudio");
    await renderPartQuestions(section);
}

async function loadSectionAudioUrl(path, elementId) {
    try {
        const { data, error } = await supabaseClient.storage.from(LISTENING_BUCKET).createSignedUrl(path, 3600);
        if (!error && data?.signedUrl) { const el = document.getElementById(elementId); if (el) el.src = data.signedUrl; }
    } catch (_) {}
}

async function saveListeningPart(event, section) {
    event.preventDefault();
    const msg = document.getElementById("partMsg");
    try {
        let audioPath = section.audio_path || null;
        const file = document.getElementById("partAudio").files[0];
        if (file) {
            const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            audioPath = `${listeningEditorState.testId}/part-${section.section_number}-${Date.now()}-${safe}`;
            const { error: upError } = await supabaseClient.storage.from(LISTENING_BUCKET).upload(audioPath, file, { upsert: false, contentType: file.type || "audio/mpeg" });
            if (upError) throw upError;
        }
        const { data, error } = await supabaseClient.from("sections").update({ title: document.getElementById("partTitle").value.trim(), instructions: document.getElementById("partInstructions").value.trim() || null, audio_path: audioPath }).eq("id", section.id).select().single();
        if (error) throw error;
        const idx = listeningEditorState.sections.findIndex(s => s.id === section.id);
        if (idx >= 0) listeningEditorState.sections[idx] = data;
        msg.textContent = "Part saved successfully."; msg.style.color = "#15803d";
        await renderPartQuestions(data);
    } catch (error) { msg.textContent = error.message || "Unable to save Part."; msg.style.color = "#dc2626"; }
}

async function renderPartQuestions(section) {
    const holder = document.getElementById("partQuestions"); if (!holder) return;
    const p = LISTENING_PARTS.find(x => x.number === Number(section.section_number));
    try {
        const { data: questions, error } = await supabaseClient.from("questions").select("*, options(*)").eq("section_id", section.id).order("question_number");
        if (error) throw error;
        const qs = questions || [];
        holder.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px"><p>${qs.length}/10 questions created.</p><button type="button" class="add-student-button" id="addQuestionBtn">+ Add Question</button></div>${qs.length ? qs.map(q => `<div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;margin:10px 0;background:#fff"><div style="display:flex;justify-content:space-between;gap:10px"><strong>Q${q.question_number} — ${listeningEscape(listeningQuestionTypeLabel(q.question_type))}</strong><button type="button" class="module-btn" data-edit-question="${q.id}">Edit</button></div><div style="margin-top:8px">${listeningEscape(q.question_text || "")}</div></div>`).join("") : `<div class="empty-test-state"><div class="empty-icon">📝</div><h3>No questions yet</h3><p>Part ${p.number} needs Questions ${p.from}–${p.to}.</p></div>`}`;
        document.getElementById("addQuestionBtn")?.addEventListener("click", () => openQuestionEditor(section, null));
        holder.querySelectorAll("[data-edit-question]").forEach(b => b.addEventListener("click", () => openQuestionEditor(section, b.dataset.editQuestion)));
    } catch (error) { holder.innerHTML = `<div class="coming-soon"><p>${listeningEscape(error.message)}</p></div>`; }
}

async function openQuestionEditor(section, questionId) {
    const holder = document.getElementById("partQuestions"); if (!holder) return;
    let q = null;
    if (questionId) {
        const { data, error } = await supabaseClient.from("questions").select("*, options(*)").eq("id", questionId).single();
        if (error) { alert(error.message); return; } q = data;
    }
    const p = LISTENING_PARTS.find(x => x.number === Number(section.section_number));
    let nextNumber = q?.question_number;
    if (!nextNumber) {
        const { data } = await supabaseClient.from("questions").select("question_number").eq("section_id", section.id).order("question_number", { ascending:false }).limit(1);
        nextNumber = (data?.[0]?.question_number || p.from - 1) + 1;
    }
    if (nextNumber > p.to) { alert(`Part ${p.number} already has 10 questions.`); return; }
    holder.innerHTML = `<form id="questionForm" class="student-form" style="border:1px solid #e5e7eb;border-radius:14px;padding:20px"><div class="form-group"><label>Question Number</label><input id="qNumber" type="number" min="${p.from}" max="${p.to}" value="${nextNumber}" required></div><div class="form-group"><label>Question Type</label><select id="qType"><option value="completion">Completion</option><option value="mcq_single">MCQ – Single Answer</option><option value="mcq_multiple">MCQ – Multiple Answer</option><option value="true_false_not_given">True / False / Not Given</option><option value="yes_no_not_given">Yes / No / Not Given</option><option value="matching">Matching</option><option value="short_answer">Short Answer</option><option value="diagram">Diagram / Map / Plan</option></select></div><div class="form-group"><label>Question / Prompt</label><textarea id="qText" rows="4" required>${listeningEscape(q?.question_text || "")}</textarea></div><div class="form-group"><label>Correct Answer(s)</label><input id="qCorrect" value="${listeningEscape(Array.isArray(q?.correct_answer) ? q.correct_answer.join(", ") : (q?.correct_answer || ""))}" placeholder="For multiple answers separate with comma"></div><div class="form-group"><label>Options (one per line)</label><textarea id="qOptions" rows="5" placeholder="Option A\nOption B\nOption C\nOption D">${listeningEscape((q?.options || []).map(o => o.option_text || "").join("\n"))}</textarea></div><div class="form-group"><label>Question Image (optional)</label><input id="qImage" type="file" accept="image/*">${q?.image_path ? `<small>Current: ${listeningEscape(q.image_path)}</small>` : ""}</div><div class="student-form-actions"><button type="button" class="cancel-button" id="cancelQuestionEdit">Cancel</button><button type="submit" class="save-button">${q ? "Update" : "Save"} Question</button></div><div id="qMsg" class="login-message"></div></form>`;
    document.getElementById("qType").value = q?.question_type || "completion";
    document.getElementById("cancelQuestionEdit")?.addEventListener("click", () => renderPartQuestions(section));
    document.getElementById("questionForm")?.addEventListener("submit", e => saveListeningQuestion(e, section, q));
}

async function saveListeningQuestion(event, section, existing) {
    event.preventDefault();
    const msg = document.getElementById("qMsg");
    try {
        const number = Number(document.getElementById("qNumber").value);
        const p = LISTENING_PARTS.find(x => x.number === Number(section.section_number));
        if (number < p.from || number > p.to) throw new Error(`Part ${p.number} accepts Questions ${p.from}–${p.to}.`);
        const correctRaw = document.getElementById("qCorrect").value.trim();
        const options = document.getElementById("qOptions").value.split("\n").map(x => x.trim()).filter(Boolean);
        let imagePath = existing?.image_path || null;
        const image = document.getElementById("qImage").files[0];
        if (image) {
            const safe = image.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            imagePath = `${listeningEditorState.testId}/q-${number}-${Date.now()}-${safe}`;
            const { error: upError } = await supabaseClient.storage.from("question-images").upload(imagePath, image, { upsert: false, contentType: image.type || "image/*" });
            if (upError) throw upError;
        }
        const payload = { section_id: section.id, question_number: number, question_type: document.getElementById("qType").value, question_text: document.getElementById("qText").value.trim(), correct_answer: correctRaw || null, image_path: imagePath };
        let question;
        if (existing) {
            const { data, error } = await supabaseClient.from("questions").update(payload).eq("id", existing.id).select().single();
            if (error) throw error; question = data;
            await supabaseClient.from("options").delete().eq("question_id", question.id);
        } else {
            const { data, error } = await supabaseClient.from("questions").insert(payload).select().single();
            if (error) throw error; question = data;
        }
        if (options.length) {
            const optionRows = options.map((text, i) => ({ question_id: question.id, option_text: text, option_order: i + 1, is_correct: listeningAnswerKey(question).includes(listeningNormalize(text)) }));
            const { error } = await supabaseClient.from("options").insert(optionRows);
            if (error) throw error;
        }
        await renderPartQuestions(section);
    } catch (error) { msg.textContent = error.message || "Unable to save question."; msg.style.color = "#dc2626"; }
}

// ---------- STUDENT LISTENING ----------
async function openStudentListeningTests(profile) {
    const message = document.getElementById("dashboardMessage"); if (!message) return;
    message.innerHTML = `<div class="students-panel"><div class="students-panel-header"><div><h2>🎧 Listening Tests</h2><p>Select an available test.</p></div><button type="button" class="cancel-button" id="studentListeningBack">← Dashboard</button></div><div id="studentListeningList"><div class="coming-soon">Loading...</div></div></div>`;
    document.getElementById("studentListeningBack")?.addEventListener("click", () => openStudentDashboard(profile));
    try {
        const { data, error } = await supabaseClient.from("tests").select("*").eq("module", "listening").eq("status", "published").order("created_at", { ascending:false });
        if (error) throw error;
        const list = document.getElementById("studentListeningList");
        if (!data?.length) { list.innerHTML = `<div class="empty-test-state"><div class="empty-icon">🎧</div><h2>No Published Listening Tests</h2><p>Your tutor/admin will publish a Listening Test here.</p></div>`; return; }
        list.innerHTML = `<div class="dashboard-grid">${data.map(t => `<div class="test-module-card"><div class="module-icon">🎧</div><h3>${listeningEscape(t.title)}</h3><p>4 Parts • 40 Questions • ${t.duration_minutes || 40} minutes</p><button type="button" class="module-btn" data-start-listening="${t.id}">Start Test</button></div>`).join("")}</div>`;
        list.querySelectorAll("[data-start-listening]").forEach(b => b.addEventListener("click", () => openStudentListeningInstructions(profile, b.dataset.startListening)));
    } catch (error) { document.getElementById("studentListeningList").innerHTML = `<div class="coming-soon"><p>${listeningEscape(error.message)}</p></div>`; }
}

async function openStudentListeningInstructions(profile, testId) {
    try {
        const { data: test, error } = await supabaseClient.from("tests").select("*").eq("id", testId).single(); if (error) throw error;
        const { data: sections, error: se } = await supabaseClient.from("sections").select("*").eq("test_id", testId).order("section_number"); if (se) throw se;
        listeningRunnerState = { profile, test, sections: sections || [], questions: [], answers: {}, currentPart: 1, timer: null, seconds: Number(test.duration_minutes || 40) * 60, started: false };
        const msg = document.getElementById("dashboardMessage");
        msg.innerHTML = `<div class="students-panel"><div class="students-panel-header"><div><h2>🎧 ${listeningEscape(test.title)}</h2><p>Listening Test Instructions</p></div><button type="button" class="cancel-button" id="cancelListeningStart">← Tests</button></div><div class="empty-test-state" style="text-align:left"><h3>Before you begin</h3><p>${listeningEscape(test.instructions || "Listen carefully and answer all 40 questions. The test contains 4 parts.")}</p><ul><li>Part 1: Questions 1–10</li><li>Part 2: Questions 11–20</li><li>Part 3: Questions 21–30</li><li>Part 4: Questions 31–40</li></ul><p><strong>Time:</strong> ${test.duration_minutes || 40} minutes</p><button type="button" class="save-button" id="beginListeningTest">Begin Listening Test</button></div></div>`;
        document.getElementById("cancelListeningStart")?.addEventListener("click", () => openStudentListeningTests(profile));
        document.getElementById("beginListeningTest")?.addEventListener("click", () => startStudentListening(profile));
    } catch (error) { alert(error.message); }
}

async function startStudentListening(profile) {
    const st = listeningRunnerState; if (!st) return;
    try {
        for (const sec of st.sections) {
            const { data: qs, error } = await supabaseClient.from("questions").select("*, options(*)").eq("section_id", sec.id).order("question_number");
            if (error) throw error;
            st.questions.push(...(qs || []).map(q => ({...q, section_number: sec.section_number, audio_path: sec.audio_path, section_title: sec.title, section_instructions: sec.instructions})));
        }
        st.questions.sort((a,b)=>Number(a.question_number)-Number(b.question_number));
        if (st.questions.length < 40) { alert(`This test currently has ${st.questions.length} questions. Please ask Admin to complete all 40 questions before starting.`); return; }
        renderListeningRunner(); startListeningTimer();
    } catch (error) { alert(error.message); }
}

function renderListeningRunner() {
    const st = listeningRunnerState; const msg = document.getElementById("dashboardMessage"); if (!st || !msg) return;
    const part = LISTENING_PARTS.find(p => p.number === st.currentPart);
    const sec = st.sections.find(s => Number(s.section_number) === st.currentPart);
    const qs = st.questions.filter(q => Number(q.section_number) === st.currentPart);
    msg.innerHTML = `<div class="dashboard" style="background:transparent"><div class="dashboard-header" style="position:sticky;top:0;z-index:5"><div><h1>${listeningEscape(st.test.title)}</h1><p>${part.title} • Questions ${part.from}–${part.to}</p></div><div class="user-area"><strong id="listeningTimer">${formatListeningTime(st.seconds)}</strong><button type="button" id="submitListeningTop">Submit Test</button></div></div><main class="dashboard-content"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px">${LISTENING_PARTS.map(p => `<button type="button" class="module-btn" style="opacity:${p.number===st.currentPart?1:.7}" data-run-part="${p.number}">Part ${p.number}</button>`).join("")}</div><div class="listening-split" style="display:grid;grid-template-columns:minmax(300px,1fr) minmax(380px,1fr);gap:18px;align-items:start"><section class="students-panel" style="margin:0;position:sticky;top:90px"><h2>🎧 ${listeningEscape(sec?.title || part.title)}</h2><p>${listeningEscape(sec?.instructions || "Listen to the audio and answer the questions.")}</p><div id="runnerAudio">Loading audio...</div></section><section class="students-panel" style="margin:0"><div id="runnerQuestions">${qs.map(renderStudentListeningQuestion).join("")}</div><div style="display:flex;justify-content:space-between;gap:10px;margin-top:20px"><button type="button" class="cancel-button" id="prevListeningPart" ${st.currentPart===1?"disabled":""}>← Previous</button><button type="button" class="module-btn" id="nextListeningPart">${st.currentPart===4?"Review & Submit":"Next Part →"}</button></div></section></div></main></div>`;
    document.querySelectorAll("[data-run-part]").forEach(b => b.addEventListener("click", () => { saveRunnerAnswersFromDOM(); st.currentPart = Number(b.dataset.runPart); renderListeningRunner(); }));
    document.getElementById("prevListeningPart")?.addEventListener("click", () => { saveRunnerAnswersFromDOM(); st.currentPart--; renderListeningRunner(); });
    document.getElementById("nextListeningPart")?.addEventListener("click", () => { saveRunnerAnswersFromDOM(); if (st.currentPart < 4) { st.currentPart++; renderListeningRunner(); } else { submitListeningTest(); } });
    document.getElementById("submitListeningTop")?.addEventListener("click", submitListeningTest);
    document.querySelectorAll("[data-run-answer]").forEach(el => el.addEventListener("change", saveRunnerAnswersFromDOM));
    if (sec?.audio_path) loadRunnerAudio(sec.audio_path); else document.getElementById("runnerAudio").innerHTML = `<div class="coming-soon">No audio uploaded for this part.</div>`;
}

function renderStudentListeningQuestion(q) {
    const answer = listeningRunnerState.answers[q.id]; const type = q.question_type || "completion"; const opts = q.options || [];
    let input = "";
    if (type === "mcq_single") input = opts.map((o,i)=>`<label style="display:block;margin:8px 0"><input data-run-answer type="radio" name="q_${q.id}" value="${listeningEscape(o.option_text)}" ${String(answer||"")===String(o.option_text)?"checked":""}> ${listeningEscape(o.option_text)}</label>`).join("");
    else if (type === "mcq_multiple") input = opts.map(o=>`<label style="display:block;margin:8px 0"><input data-run-answer type="checkbox" name="q_${q.id}" value="${listeningEscape(o.option_text)}" ${(Array.isArray(answer)?answer:[]).includes(o.option_text)?"checked":""}> ${listeningEscape(o.option_text)}</label>`).join("");
    else if (type === "true_false_not_given") input = ["True","False","Not Given"].map(v=>`<label style="display:block;margin:8px 0"><input data-run-answer type="radio" name="q_${q.id}" value="${v}" ${answer===v?"checked":""}> ${v}</label>`).join("");
    else if (type === "yes_no_not_given") input = ["Yes","No","Not Given"].map(v=>`<label style="display:block;margin:8px 0"><input data-run-answer type="radio" name="q_${q.id}" value="${v}" ${answer===v?"checked":""}> ${v}</label>`).join("");
    else input = `<input data-run-answer type="text" name="q_${q.id}" value="${listeningEscape(answer || "")}" placeholder="Your answer" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px">`;
    return `<div style="padding:16px 0;border-bottom:1px solid #e5e7eb"><div><strong>Question ${q.question_number}</strong> <small style="color:#64748b">${listeningEscape(listeningQuestionTypeLabel(type))}</small></div><p>${listeningEscape(q.question_text || "")}</p>${q.image_path ? `<div style="margin:10px 0"><img data-q-image="${listeningEscape(q.image_path)}" style="max-width:100%;max-height:240px;border-radius:8px"></div>` : ""}<div>${input}</div></div>`;
}

function saveRunnerAnswersFromDOM() {
    const st = listeningRunnerState; if (!st) return;
    st.questions.filter(q => Number(q.section_number) === st.currentPart).forEach(q => {
        const els = document.querySelectorAll(`[name="q_${q.id}"]`);
        if (!els.length) return;
        if (els[0].type === "checkbox") st.answers[q.id] = Array.from(els).filter(x=>x.checked).map(x=>x.value);
        else if (els[0].type === "radio") st.answers[q.id] = Array.from(els).find(x=>x.checked)?.value || "";
        else st.answers[q.id] = els[0].value;
    });
}

async function loadRunnerAudio(path) {
    const holder = document.getElementById("runnerAudio"); if (!holder) return;
    const { data, error } = await supabaseClient.storage.from(LISTENING_BUCKET).createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) { holder.innerHTML = `<div class="coming-soon">Unable to load audio: ${listeningEscape(error?.message || "No signed URL")}</div>`; return; }
    holder.innerHTML = `<audio controls preload="metadata" style="width:100%" src="${data.signedUrl}"></audio>`;
}

function formatListeningTime(seconds) { const m=Math.floor(Math.max(0,seconds)/60).toString().padStart(2,"0"); const s=(Math.max(0,seconds)%60).toString().padStart(2,"0"); return `${m}:${s}`; }
function startListeningTimer() {
    const st = listeningRunnerState; if (!st || st.timer) return;
    st.timer = setInterval(() => { st.seconds--; const el=document.getElementById("listeningTimer"); if(el) el.textContent=formatListeningTime(st.seconds); if(st.seconds<=0){ clearInterval(st.timer); st.timer=null; submitListeningTest(true); } },1000);
}

async function submitListeningTest(auto=false) {
    const st=listeningRunnerState; if(!st || st.submitting) return;
    saveRunnerAnswersFromDOM();
    if(!auto && !confirm("Submit the Listening Test now? You will not be able to continue after submission.")) return;
    st.submitting=true; if(st.timer) clearInterval(st.timer);
    let correct=0; const answerRows=[];
    for(const q of st.questions){ const a=st.answers[q.id] ?? ""; const ok=listeningIsCorrect(q,a); if(ok) correct++; answerRows.push({question_id:q.id,test_id:st.test.id,student_id:st.profile.id,answer:Array.isArray(a)?a.join(", "):String(a),is_correct:ok}); }
    const score=Math.round((correct/Math.max(1,st.questions.length))*100)/100;
    const band=listeningBand(correct);
    try {
        // Save answers; if a deployment uses a reduced answers schema, report that clearly.
        const { error: ae } = await supabaseClient.from("answers").insert(answerRows); if(ae) throw ae;
        const { error: re } = await supabaseClient.from("results").insert({ test_id:st.test.id, student_id:st.profile.id, score:correct, band_score:band, submitted_at:new Date().toISOString() }); if(re) throw re;
        const msg=document.getElementById("dashboardMessage"); msg.innerHTML=`<div class="students-panel"><div class="students-panel-header"><div><h2>🎉 Listening Test Submitted</h2><p>${listeningEscape(st.test.title)}</p></div></div><div class="empty-test-state"><div class="empty-icon">📊</div><h2>${correct} / ${st.questions.length}</h2><p>Estimated Listening Band: <strong>${band}</strong></p><p>Your answers and result have been saved.</p><button type="button" class="module-btn" id="backAfterListening">Back to Listening Tests</button></div></div>`; document.getElementById("backAfterListening")?.addEventListener("click",()=>openStudentListeningTests(st.profile));
    } catch(error) { st.submitting=false; alert(`Could not save the result: ${error.message}`); }
}

function listeningBand(correct) {
    // Common 40-question IELTS Listening raw-score conversion, used here as an editable estimate.
    const map={39:9,40:9,37:8.5,38:8.5,35:8,36:8,32:7.5,33:7.5,34:7.5,30:7,31:7,26:6.5,27:6.5,28:6.5,29:6.5,23:6,24:6,25:6,18:5.5,19:5.5,20:5.5,21:5.5,22:5.5,16:5,17:5,13:4.5,14:4.5,15:4.5,10:4,11:4,12:4,8:3.5,9:3.5,6:3,7:3,4:2.5,5:2.5}; return map[correct] ?? (correct>=40?9:correct>=0?Math.max(0,Math.round((correct/40)*9*2)/2):0);
}

// ============================================
// STUDENT LISTENING TESTS
// ============================================

function openStudentListeningTestsLegacy(profile) {
    const message = document.getElementById("dashboardMessage");

    if (!message) {
        return;
    }

    message.innerHTML = `
        <div class="students-panel">

            <div class="students-panel-header">
                <div>
                    <h2>🎧 Listening Tests</h2>
                    <p>Select a Listening Test to begin.</p>
                </div>

                <button type="button" class="cancel-button" id="backToStudentDashboard">
                    ← Dashboard
                </button>
            </div>

            <div class="empty-test-state">
                <div class="empty-icon">🎧</div>
                <h2>No Listening Tests Available</h2>
                <p>Listening tests created by Admin will appear here.</p>
            </div>

        </div>
    `;

    const backButton = document.getElementById("backToStudentDashboard");

    if (backButton) {
        backButton.addEventListener("click", () => openStudentDashboard(profile));
    }
}


// ============================================
// LOGOUT
// ============================================

async function logout() {

    try {

        await supabaseClient.auth.signOut();

    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );

    }

    window.location.reload();

}


// ============================================
// HTML ESCAPE
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
// STUDENTS MANAGEMENT
// ============================================

async function openStudents() {

    const message =
        document.getElementById("dashboardMessage");


    // ----------------------------------------
    // LOADING
    // ----------------------------------------

    message.innerHTML = `
        <div class="coming-soon">
            Loading students...
        </div>
    `;


    try {

        // ------------------------------------
        // GET STUDENTS FROM SUPABASE
        // ------------------------------------

        const { data: students, error } =
            await supabaseClient
                .from("students")
                .select(
                    "id, student_id, full_name, email, active, created_at"
                )
                .order(
                    "created_at",
                    { ascending: false }
                );


        if (error) {
            throw error;
        }


        // ------------------------------------
        // CREATE TABLE ROWS
        // ------------------------------------

        let rows = "";


        if (!students || students.length === 0) {

            rows = `
                <tr>

                    <td
                        colspan="5"
                        style="
                            text-align:center;
                            padding:30px;
                            color:#64748b;
                        "
                    >
                        No students found.
                    </td>

                </tr>
            `;

        } else {

            rows = students.map(student => `

                <tr>

                    <td>
                        ${escapeHtml(
                            student.student_id
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            student.full_name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            student.email || "-"
                        )}
                    </td>

                    <td>

                        <span class="${
                            student.active
                                ? "status-active"
                                : "status-inactive"
                        }">

                            ${
                                student.active
                                    ? "Active"
                                    : "Inactive"
                            }

                        </span>

                    </td>

                    <td>
                        ${new Date(
                            student.created_at
                        ).toLocaleDateString()}
                    </td>

                </tr>

            `).join("");

        }


        // ------------------------------------
        // STUDENTS SCREEN
        // ------------------------------------

        message.innerHTML = `

            <div class="students-panel">


                <!-- HEADER -->

                <div class="students-panel-header">

                    <div>

                        <h2>
                            Students
                        </h2>

                        <p>
                            Manage registered students
                        </p>

                    </div>


                    <button
                        type="button"
                        id="addStudentButton"
                        class="add-student-button"
                    >
                        + Add Student
                    </button>

                </div>


                <!-- TABLE -->

                <div class="students-table-wrapper">

                    <table class="students-table">

                        <thead>

                            <tr>

                                <th>
                                    Student ID
                                </th>

                                <th>
                                    Name
                                </th>

                                <th>
                                    Email
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Created
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${rows}

                        </tbody>

                    </table>

                </div>


            </div>

        `;


        // ------------------------------------
        // ADD STUDENT BUTTON
        // ------------------------------------

        const addStudentButton =
            document.getElementById(
                "addStudentButton"
            );


        addStudentButton.addEventListener(
            "click",
            openAddStudentForm
        );


    } catch (error) {

        console.error(
            "Students Error:",
            error
        );


        message.innerHTML = `

            <div class="coming-soon">

                <strong>
                    Unable to load students
                </strong>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Unknown error"
                    )}
                </p>

            </div>

        `;

    }

}

// ============================================
// ADD STUDENT FORM
// ============================================

function openAddStudentForm() {

    const message =
        document.getElementById("dashboardMessage");

    message.innerHTML = `

        <div class="students-panel">

            <div class="students-panel-header">

                <div>
                    <h2>Add New Student</h2>

                    <p>
                        Create student login account
                    </p>
                </div>

                <button
                    type="button"
                    id="cancelStudentButton"
                    class="cancel-button"
                >
                    Cancel
                </button>

            </div>


            <form
                id="addStudentForm"
                class="student-form"
            >

                <div class="form-group">

                    <label for="studentId">
                        Student ID
                    </label>

                    <input
                        type="text"
                        id="studentId"
                        placeholder="Example: UE001"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="studentFullName">
                        Full Name
                    </label>

                    <input
                        type="text"
                        id="studentFullName"
                        placeholder="Enter student's full name"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="studentEmail">
                        Email Address
                    </label>

                    <input
                        type="email"
                        id="studentEmail"
                        placeholder="Enter student's email"
                        autocomplete="email"
                        required
                    >

                </div>


                <div class="form-group">

                    <label for="studentPassword">
                        Student Login Password
                    </label>

                    <input
                        type="password"
                        id="studentPassword"
                        placeholder="Minimum 8 characters"
                        autocomplete="new-password"
                        minlength="8"
                        required
                    >

                </div>


                <div class="student-form-actions">

                    <button
                        type="button"
                        id="cancelStudentButton2"
                        class="cancel-button"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        id="saveStudentButton"
                        class="save-button"
                    >
                        Create Student Account
                    </button>

                </div>


                <div
                    id="studentFormMessage"
                    class="login-message"
                ></div>

            </form>

        </div>

    `;


    // ========================================
    // CANCEL BUTTONS
    // ========================================

    document
        .getElementById("cancelStudentButton")
        .addEventListener(
            "click",
            openStudents
        );


    document
        .getElementById("cancelStudentButton2")
        .addEventListener(
            "click",
            openStudents
        );


    // ========================================
    // FORM SUBMIT
    // ========================================

    document
        .getElementById("addStudentForm")
        .addEventListener(
            "submit",
            saveStudent
        );

}


// ============================================
// SAVE STUDENT THROUGH EDGE FUNCTION
// ============================================

async function saveStudent(event) {

    event.preventDefault();


    const studentId =
        document
            .getElementById("studentId")
            .value
            .trim()
            .toUpperCase();


    const fullName =
        document
            .getElementById("studentFullName")
            .value
            .trim();


    const email =
        document
            .getElementById("studentEmail")
            .value
            .trim()
            .toLowerCase();


    const password =
        document
            .getElementById("studentPassword")
            .value;


    const saveButton =
        document.getElementById(
            "saveStudentButton"
        );


    const formMessage =
        document.getElementById(
            "studentFormMessage"
        );


    // ========================================
    // VALIDATION
    // ========================================

    if (
        !studentId ||
        !fullName ||
        !email ||
        !password
    ) {

        formMessage.textContent =
            "Please fill all required fields.";

        formMessage.style.color =
            "#dc2626";

        return;

    }


    if (password.length < 8) {

        formMessage.textContent =
            "Password must contain at least 8 characters.";

        formMessage.style.color =
            "#dc2626";

        return;

    }


    // ========================================
    // LOADING
    // ========================================

    saveButton.disabled = true;

    saveButton.textContent =
        "Creating Account...";

    formMessage.textContent = "";


    try {

        // ====================================
        // GET CURRENT SESSION
        // ====================================

        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient
                .auth
                .getSession();


        if (sessionError) {
            throw sessionError;
        }


        const session =
            sessionData.session;


        if (!session) {

            throw new Error(
                "Your login session has expired. Please login again."
            );

        }


        // ====================================
        // CALL EDGE FUNCTION
        // ====================================

        const response =
            await fetch(
                `${SUPABASE_URL}/functions/v1/create-student`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${session.access_token}`,

                        "apikey":
                            SUPABASE_PUBLISHABLE_KEY
                    },

                    body: JSON.stringify({

                        student_id:
                            studentId,

                        full_name:
                            fullName,

                        email:
                            email,

                        password:
                            password

                    })
                }
            );


        // ====================================
        // READ RESPONSE
        // ====================================

        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.error ||
                "Unable to create student account."
            );

        }


        // ====================================
        // SUCCESS
        // ====================================

        formMessage.textContent =
            "Student account created successfully.";

        formMessage.style.color =
            "#15803d";


        setTimeout(() => {

            openStudents();

        }, 1000);


    } catch (error) {

        console.error(
            "Create Student Error:",
            error
        );


        formMessage.textContent =
            error.message ||
            "Unable to create student account.";

        formMessage.style.color =
            "#dc2626";


        saveButton.disabled = false;

        saveButton.textContent =
            "Create Student Account";

    }

}


// ============================================
// LISTENING MODULE RESPONSIVE CSS
// ============================================
(function addListeningStyles(){
    if (document.getElementById("listeningModuleStyles")) return;
    const style=document.createElement("style"); style.id="listeningModuleStyles";
    style.textContent=`
        .test-module-card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:24px;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.06)}
        .module-btn,.save-button,.add-student-button,.cancel-button{cursor:pointer}
        .listening-split{min-height:500px}
        @media(max-width:850px){.listening-split{grid-template-columns:1fr!important}.listening-split section{position:static!important}.dashboard-header{gap:12px}}
    `; document.head.appendChild(style);
})();
