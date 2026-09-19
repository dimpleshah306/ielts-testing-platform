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
// DOM / LOGIN INITIALIZATION
// ============================================

let studentTab = null;
let staffTab = null;
let loginForm = null;
let loginButton = null;
let loginMessage = null;

function initLoginUI() {
    studentTab = document.getElementById("studentTab");
    staffTab = document.getElementById("staffTab");
    loginForm = document.getElementById("loginForm");
    loginButton = document.getElementById("loginButton");
    loginMessage = document.getElementById("loginMessage");

    if (!studentTab || !staffTab || !loginForm) {
        console.warn("Login UI elements were not found. Check index.html IDs.");
        return;
    }

    studentTab.type = "button";
    staffTab.type = "button";

    studentTab.addEventListener("click", () => {
        loginMode = "student";
        studentTab.classList.add("active");
        staffTab.classList.remove("active");
        if (loginMessage) loginMessage.textContent = "";
    });

    staffTab.addEventListener("click", () => {
        loginMode = "staff";
        staffTab.classList.add("active");
        studentTab.classList.remove("active");
        if (loginMessage) loginMessage.textContent = "";
    });

    loginForm.addEventListener("submit", handleLoginSubmit);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLoginUI);
} else {
    initLoginUI();
}

// ============================================
// LOGIN FORM
// ============================================

async function handleLoginSubmit(event) {

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

}


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
            try {
                if (module === "students") { await openStudents(); return; }
                if (module === "tests") { await openTestManager("all"); return; }
                if (module === "listening") { await openTestManager("listening"); return; }
                if (module === "reading") { await openTestManager("reading"); return; }
                if (module === "writing") { await openTestManager("writing"); return; }
                if (module === "results") { await openAdminResults(); return; }
            } catch (err) {
                console.error(err);
                const box = document.getElementById("dashboardMessage");
                if (box) box.innerHTML = `<div class="coming-soon"><strong>Unable to open ${escapeHtml(module)}</strong><p>${escapeHtml(err.message || "Unknown error")}</p></div>`;
            }
        });
    });

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

                    const module =
                        card.dataset.module;


                    document
                        .getElementById(
                            "dashboardMessage"
                        )
                        .innerHTML = `

                            <div class="coming-soon">

                                <strong>
                                    ${escapeHtml(
                                        module.toUpperCase()
                                    )}
                                </strong>

                                <p>
                                    This module will be connected next.
                                </p>

                            </div>

                        `;

                }
            );

        });

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

// ============================================================================
// TEST / QUESTION MANAGEMENT — SUPABASE EDITION
// ============================================================================

const LISTENING_QUESTION_TYPES = {
    single: "Multiple Choice — Single Answer",
    multi: "Multiple Choice — Multiple Answers",
    matching: "Matching",
    note: "Note Completion",
    form: "Form Completion",
    table: "Table Completion",
    sentence: "Sentence Completion",
    summary: "Summary Completion",
    short: "Short Answer Questions",
    map: "Map / Plan / Diagram Labelling",
    flow: "Flowchart Completion"
};

const READING_QUESTION_TYPES = {
    single: "Multiple Choice — Single Answer",
    multi: "Multiple Choice — Multiple Answers",
    tfng: "True / False / Not Given",
    yng: "Yes / No / Not Given",
    headings: "Matching Headings",
    information: "Matching Information",
    features: "Matching Features",
    endings: "Matching Sentence Endings",
    sentence: "Sentence Completion",
    summary: "Summary Completion",
    note: "Note Completion",
    table: "Table Completion",
    short: "Short Answer Questions",
    matching: "Matching",
    map: "Map / Plan / Diagram Labelling",
    flow: "Flowchart Completion"
};

let adminCurrentTest = null;
let adminCurrentSections = [];
let adminCurrentQuestions = [];
let adminCurrentGroups = [];

function adminModuleBox(title, subtitle = "") {
    return `<div class="students-panel" style="margin-top:10px">
        <div class="students-panel-header">
            <div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(subtitle)}</p></div>
            <button type="button" class="cancel-button" onclick="backToAdminDashboard()">← Dashboard</button>
        </div>
        <div id="adminModuleBody"></div>
    </div>`;
}

function backToAdminDashboard() {
    supabaseClient.auth.getUser().then(({ data }) => {
        const user = data?.user;
        if (!user) return window.location.reload();
        supabaseClient.from("profiles").select("full_name,role,active").eq("id", user.id).single().then(({ data: profile }) => {
            if (profile) openStaffDashboard(profile);
            else window.location.reload();
        });
    });
}

async function getCurrentUserId() {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error("Your session has expired. Please log in again.");
    return data.user.id;
}

function testModuleTitle(module) {
    if (module === "listening") return "🎧 Listening Tests";
    if (module === "reading") return "📖 Reading Tests";
    if (module === "writing") return "✍️ Writing Tests";
    return "📝 All Tests";
}

function moduleFilter(module) {
    if (module === "all") return null;
    return module;
}

async function openTestManager(module = "all") {
    const message = document.getElementById("dashboardMessage");
    if (!message) return;
    message.innerHTML = adminModuleBox(testModuleTitle(module), "Create, edit, publish/unpublish, and delete tests.");
    await renderTestManager(module);
}

async function renderTestManager(module = "all") {
    const body = document.getElementById("adminModuleBody");
    if (!body) return;

    const filter = moduleFilter(module);
    let query = supabaseClient
        .from("tests")
        .select("id,title,module,description,duration_minutes,total_questions,is_published,created_at,created_by")
        .order("created_at", { ascending: false });
    if (filter) query = query.eq("module", filter);

    const { data: tests, error } = await query;
    if (error) throw error;

    body.innerHTML = `
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px">
            <button type="button" class="save-button" onclick="openCreateTestForm('${escapeHtml(module)}')">+ Create New Test</button>
            ${module !== "all" ? `<button type="button" class="cancel-button" onclick="openTestManager('all')">View All Tests</button>` : ""}
        </div>
        <div style="overflow:auto">
        <table class="students-table">
            <thead><tr><th>Test</th><th>Module</th><th>Questions</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
                ${(tests || []).length ? tests.map(t => `
                    <tr>
                        <td><strong>${escapeHtml(t.title)}</strong><br><small>${escapeHtml(t.description || "")}</small></td>
                        <td>${escapeHtml(t.module || "-")}</td>
                        <td>${Number(t.total_questions || 0)}</td>
                        <td>${Number(t.duration_minutes || 0)} min</td>
                        <td><span class="${t.is_published ? "status-active" : "status-inactive"}">${t.is_published ? "Published" : "Draft"}</span></td>
                        <td style="white-space:nowrap">
                            <button type="button" onclick="editAdminTest('${t.id}')">Edit</button>
                            <button type="button" onclick="toggleAdminTestPublish('${t.id}',${!t.is_published})">${t.is_published ? "Unpublish" : "Publish"}</button>
                            <button type="button" class="danger" onclick="deleteAdminTest('${t.id}')">Delete</button>
                        </td>
                    </tr>`).join("") : `<tr><td colspan="6" style="text-align:center;padding:30px">No tests found.</td></tr>`}
            </tbody>
        </table></div>`;
}

async function openCreateTestForm(module = "all") {
    const body = document.getElementById("adminModuleBody");
    if (!body) return;
    const selected = ["listening", "reading", "writing"].includes(module) ? module : "listening";
    body.innerHTML = `
        <div class="student-form">
            <h3>Create New IELTS Test</h3>
            <label>Test Title<input id="newTestTitle" type="text" placeholder="e.g. Listening Test 03" required></label>
            <label>Module<select id="newTestModule"><option value="listening" ${selected === "listening" ? "selected" : ""}>Listening</option><option value="reading" ${selected === "reading" ? "selected" : ""}>Reading</option><option value="writing" ${selected === "writing" ? "selected" : ""}>Writing</option></select></label>
            <label>Description<textarea id="newTestDescription" placeholder="Short description/instructions"></textarea></label>
            <div class="grid"><label>Duration (minutes)<input id="newTestDuration" type="number" min="1" value="40"></label><label>Total Questions<input id="newTestTotal" type="number" min="1" max="40" value="40"></label></div>
            <label><input id="newTestPublished" type="checkbox"> Publish immediately</label>
            <div style="display:flex;gap:10px"><button type="button" class="save-button" onclick="createAdminTest()">Create Test</button><button type="button" class="cancel-button" onclick="openTestManager('${escapeHtml(module)}')">Cancel</button></div>
            <div id="newTestMessage" class="login-message"></div>
        </div>`;
    document.getElementById("newTestModule").addEventListener("change", e => {
        const duration = document.getElementById("newTestDuration");
        const total = document.getElementById("newTestTotal");
        if (e.target.value === "listening") { duration.value = 40; total.value = 40; }
        if (e.target.value === "reading") { duration.value = 60; total.value = 40; }
        if (e.target.value === "writing") { duration.value = 60; total.value = 2; }
    });
}

async function createAdminTest() {
    const title = document.getElementById("newTestTitle")?.value.trim();
    const module = document.getElementById("newTestModule")?.value;
    const description = document.getElementById("newTestDescription")?.value.trim();
    const duration = Number(document.getElementById("newTestDuration")?.value || 0);
    const total = Number(document.getElementById("newTestTotal")?.value || 0);
    const published = !!document.getElementById("newTestPublished")?.checked;
    const msg = document.getElementById("newTestMessage");
    if (!title || !module || !duration || !total) { if (msg) msg.textContent = "Please fill all required fields."; return; }
    try {
        const userId = await getCurrentUserId();
        const { data: test, error } = await supabaseClient.from("tests").insert({
            title, module, description: description || null, duration_minutes: duration, total_questions: total, is_published: published, created_by: userId
        }).select().single();
        if (error) throw error;
        const sectionCount = module === "listening" ? 4 : module === "reading" ? 3 : 1;
        const sectionRows = Array.from({ length: sectionCount }, (_, i) => ({
            test_id: test.id,
            section_number: i + 1,
            title: module === "listening" ? `Part ${i + 1}` : module === "reading" ? `Passage ${i + 1}` : "Writing Task",
            instructions: "",
            content: "",
            audio_url: null,
            image_url: null
        }));
        const { error: secError } = await supabaseClient.from("sections").insert(sectionRows);
        if (secError) throw secError;
        await editAdminTest(test.id);
    } catch (error) {
        if (msg) msg.textContent = error.message || "Unable to create test.";
        console.error(error);
    }
}

async function toggleAdminTestPublish(id, publish) {
    const { error } = await supabaseClient.from("tests").update({ is_published: !!publish }).eq("id", id);
    if (error) return alert(error.message);
    await openTestManager("all");
}

async function deleteAdminTest(id) {
    if (!confirm("Delete this entire test, its sections, questions and options? This cannot be undone.")) return;
    try {
        const { data: sections, error: secReadError } = await supabaseClient.from("sections").select("id").eq("test_id", id);
        if (secReadError) throw secReadError;
        const sectionIds = (sections || []).map(s => s.id);
        if (sectionIds.length) {
            const { error: groupDeleteError } = await supabaseClient.from("question_groups").delete().in("section_id", sectionIds);
            if (groupDeleteError && !String(groupDeleteError.message || "").toLowerCase().includes("does not exist")) throw groupDeleteError;
            const { data: qs, error: qReadError } = await supabaseClient.from("questions").select("id").in("section_id", sectionIds);
            if (qReadError) throw qReadError;
            const qids = (qs || []).map(q => q.id);
            if (qids.length) {
                const { error: optError } = await supabaseClient.from("options").delete().in("question_id", qids);
                if (optError) throw optError;
                const { error: ansError } = await supabaseClient.from("answers").delete().in("question_id", qids);
                if (ansError && !String(ansError.message || "").toLowerCase().includes("foreign")) throw ansError;
                const { error: qError } = await supabaseClient.from("questions").delete().in("id", qids);
                if (qError) throw qError;
            }
            const { error: sError } = await supabaseClient.from("sections").delete().in("id", sectionIds);
            if (sError) throw sError;
        }
        const { error } = await supabaseClient.from("tests").delete().eq("id", id);
        if (error) throw error;
        await openTestManager("all");
    } catch (error) {
        alert("Could not delete test: " + (error.message || "Unknown error"));
    }
}

async function editAdminTest(id) {
    const message = document.getElementById("dashboardMessage");
    if (!message) return;
    const { data: test, error: testError } = await supabaseClient.from("tests").select("*").eq("id", id).single();
    if (testError) throw testError;
    const { data: sections, error: secError } = await supabaseClient.from("sections").select("*").eq("test_id", id).order("section_number", { ascending: true });
    if (secError) throw secError;
    const sectionIds = (sections || []).map(s => s.id);
    let questions = [];
    if (sectionIds.length) {
        const { data: qrows, error: qError } = await supabaseClient.from("questions").select("*").in("section_id", sectionIds).order("question_number", { ascending: true });
        if (qError) throw qError;
        questions = qrows || [];
        const qids = questions.map(q => q.id);
        if (qids.length) {
            const { data: options, error: oError } = await supabaseClient.from("options").select("*").in("question_id", qids).order("option_key", { ascending: true });
            if (oError) throw oError;
            const byQ = {};
            (options || []).forEach(o => { (byQ[o.question_id] ||= []).push(o); });
            questions = questions.map(q => ({ ...q, options: byQ[q.id] || [] }));
        }
    }
    let groups = [];
    if (sectionIds.length) {
        const { data: grow, error: gError } = await supabaseClient
            .from("question_groups")
            .select("*")
            .in("section_id", sectionIds)
            .order("group_order", { ascending: true });
        if (gError) {
            if (String(gError.message || "").toLowerCase().includes("question_groups")) {
                throw new Error("Question Groups table is not created yet. Run the SQL provided with this update first.");
            }
            throw gError;
        }
        groups = grow || [];
    }
    adminCurrentTest = test;
    adminCurrentSections = sections || [];
    adminCurrentQuestions = questions;
    adminCurrentGroups = groups;

    message.innerHTML = adminModuleBox(`Edit: ${test.title}`, `${test.module.toUpperCase()} • Full test editor`);
    await renderAdminTestEditor();
}

async function renderAdminTestEditor() {
    const body = document.getElementById("adminModuleBody");
    if (!body || !adminCurrentTest) return;
    const isListening = adminCurrentTest.module === "listening";
    const isReading = adminCurrentTest.module === "reading";
    const typeMap = isListening ? LISTENING_QUESTION_TYPES : READING_QUESTION_TYPES;

    body.innerHTML = `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
            <button type="button" class="save-button" onclick="saveAdminTestHeader()">💾 Save Test Details</button>
            <button type="button" onclick="addAdminQuestion()">+ Add Question</button>
            <button type="button" class="danger" onclick="deleteAdminTest('${adminCurrentTest.id}')">Delete Entire Test</button>
            <button type="button" class="cancel-button" onclick="openTestManager('${adminCurrentTest.module}')">← Back to Tests</button>
        </div>
        <div class="student-form">
            <h3>Test Details</h3>
            <label>Title<input id="editTestTitle" value="${escapeHtml(adminCurrentTest.title || "")}"></label>
            <label>Module<select id="editTestModule" disabled><option>${escapeHtml(adminCurrentTest.module)}</option></select></label>
            <label>Description<textarea id="editTestDescription">${escapeHtml(adminCurrentTest.description || "")}</textarea></label>
            <div class="grid"><label>Duration (minutes)<input id="editTestDuration" type="number" min="1" value="${Number(adminCurrentTest.duration_minutes || 0)}"></label><label>Total Questions<input id="editTestTotal" type="number" min="1" max="40" value="${Number(adminCurrentTest.total_questions || 0)}"></label></div>
            <label><input id="editTestPublished" type="checkbox" ${adminCurrentTest.is_published ? "checked" : ""}> Published</label>
        </div>
        <hr>
        <h3>${isListening ? "🎧 Listening Parts" : isReading ? "📖 Reading Passages" : "✍️ Writing Section"}</h3>
        <div id="adminSections">${adminCurrentSections.map((s, idx) => adminSectionEditor(s, idx, isListening, isReading)).join("")}</div>
        <hr>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
            <div><h3>Questions</h3><p class="muted">Add, edit or delete questions. Options are fully dynamic.</p></div>
            <button type="button" onclick="addAdminQuestion()">+ Add Question</button>
        </div>
        <div id="adminQuestions">${adminCurrentQuestions.map(q => adminQuestionEditor(q, typeMap, isListening, isReading)).join("")}</div>`;
}

function adminSectionEditor(s, idx, isListening, isReading) {
    const label = isListening ? `Part ${s.section_number}` : isReading ? `Passage ${s.section_number}` : "Writing Section";
    const groups = adminCurrentGroups.filter(g => g.section_id === s.id).sort((a,b) => Number(a.group_order || 0) - Number(b.group_order || 0));
    return `<div class="students-panel" style="margin:12px 0;padding:16px">
        <h4>${label}</h4>
        <input type="hidden" id="sec-id-${s.id}" value="${s.id}">
        <label>Title<input id="sec-title-${s.id}" value="${escapeHtml(s.title || label)}"></label>
        <label>Part / Section Instructions<textarea id="sec-instructions-${s.id}" placeholder="General instructions for this part/section">${escapeHtml(s.instructions || "")}</textarea></label>
        ${isListening ? `<label>Audio URL<input id="sec-audio-${s.id}" value="${escapeHtml(s.audio_url || "")}" placeholder="https://..."></label>` : ""}
        <label>${isReading ? "Passage Content" : "Part Content / Notes"}<textarea id="sec-content-${s.id}" style="min-height:120px" placeholder="Optional general content for this part/section">${escapeHtml(s.content || "")}</textarea></label>
        <label>Image URL (optional)<input id="sec-image-${s.id}" value="${escapeHtml(s.image_url || "")}" placeholder="https://..."></label>
        <button type="button" onclick="saveAdminSection('${s.id}')">Save ${label}</button>

        <div style="margin-top:22px;border-top:1px solid #e5e7eb;padding-top:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
                <div><h4 style="margin:0">Question Groups</h4><small class="muted">Create separate IELTS-style blocks. Question numbers and ranges are fully manual.</small></div>
                <button type="button" class="save-button" onclick="addAdminQuestionGroup('${s.id}')">+ Add Question Group</button>
            </div>
            <div style="margin-top:12px">
                ${groups.length ? groups.map(g => adminQuestionGroupEditor(g, label)).join("") : `<div style="padding:14px;background:#f8fafc;border-radius:8px;margin-top:10px">No question groups yet. Click <strong>+ Add Question Group</strong> to create one.</div>`}
            </div>
        </div>
    </div>`;
}

function adminQuestionGroupEditor(g, sectionLabel) {
    const typeMap = adminCurrentTest?.module === "listening" ? LISTENING_QUESTION_TYPES : READING_QUESTION_TYPES;
    const typeOptions = Object.entries(typeMap).map(([k, v]) => `<option value="${k}" ${g.question_type === k ? "selected" : ""}>${escapeHtml(v)}</option>`).join("");
    const start = Number(g.start_question || 1);
    const end = Number(g.end_question || start);
    const groupQuestions = adminCurrentQuestions.filter(q => q.section_id === g.section_id && Number(q.question_number) >= start && Number(q.question_number) <= end).sort((a,b) => Number(a.question_number) - Number(b.question_number));
    return `<div class="students-panel" style="margin:10px 0;padding:14px;border:1px solid #dbe3ee;background:#fff">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
            <strong>Question Group ${Number(g.group_order || 1)} — ${escapeHtml(sectionLabel)}</strong>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button type="button" onclick="addAdminQuestionToGroup('${g.id}')">+ Add Question</button>
                <button type="button" class="danger" onclick="deleteAdminQuestionGroup('${g.id}')">Delete Group</button>
            </div>
        </div>
        <div class="grid" style="margin-top:10px">
            <label>Start Question No.<input id="group-start-${g.id}" type="number" min="1" max="40" value="${start}"></label>
            <label>End Question No.<input id="group-end-${g.id}" type="number" min="1" max="40" value="${end}"></label>
            <label>Question Type<select id="group-type-${g.id}">${typeOptions}</select></label>
            <label>Group Order<input id="group-order-${g.id}" type="number" min="1" value="${Number(g.group_order || 1)}"></label>
        </div>
        <label>Instructions<textarea id="group-instructions-${g.id}" style="min-height:90px" placeholder="Example:\nComplete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.">${escapeHtml(g.instructions || "")}</textarea></label>
        <label>Group Content / Heading / Notes<textarea id="group-content-${g.id}" style="min-height:130px" placeholder="Example:\nEasyl​​et Accommodation Agency\n\nCheapest properties: £ ___ per week...">${escapeHtml(g.content || "")}</textarea></label>
        <label>Group Image URL (optional)<input id="group-image-${g.id}" value="${escapeHtml(g.image_url || "")}" placeholder="https://..."></label>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px">
            <button type="button" class="save-button" onclick="saveAdminQuestionGroup('${g.id}')">💾 Save Question Group</button>
            <small class="muted">This group currently contains ${groupQuestions.length} question(s) by number range ${start}–${end}.</small>
        </div>
    </div>`;
}

async function addAdminQuestionGroup(sectionId) {
    const existing = adminCurrentGroups.filter(g => g.section_id === sectionId);
    const nextOrder = existing.reduce((m, g) => Math.max(m, Number(g.group_order || 0)), 0) + 1;
    const nextStart = existing.length ? Math.min(40, Math.max(...existing.map(g => Number(g.end_question || 0))) + 1) : 1;
    const { data, error } = await supabaseClient.from("question_groups").insert({
        section_id: sectionId,
        group_order: nextOrder,
        start_question: nextStart,
        end_question: nextStart,
        question_type: adminCurrentTest?.module === "listening" ? "note" : "single",
        instructions: "",
        content: "",
        image_url: null
    }).select().single();
    if (error) return alert("Could not create question group: " + error.message);
    adminCurrentGroups.push(data);
    await renderAdminTestEditor();
    setTimeout(() => document.getElementById(`group-start-${data.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
}

async function saveAdminQuestionGroup(groupId) {
    const start = Number(document.getElementById(`group-start-${groupId}`)?.value || 0);
    const end = Number(document.getElementById(`group-end-${groupId}`)?.value || 0);
    const order = Number(document.getElementById(`group-order-${groupId}`)?.value || 1);
    if (!start || !end || start > end || start > 40 || end > 40) return alert("Please enter a valid question range. Start must be less than or equal to End.");
    const payload = {
        start_question: start,
        end_question: end,
        group_order: order,
        question_type: document.getElementById(`group-type-${groupId}`)?.value || "short",
        instructions: document.getElementById(`group-instructions-${groupId}`)?.value || "",
        content: document.getElementById(`group-content-${groupId}`)?.value || "",
        image_url: document.getElementById(`group-image-${groupId}`)?.value.trim() || null
    };
    const { error } = await supabaseClient.from("question_groups").update(payload).eq("id", groupId);
    if (error) return alert("Could not save question group: " + error.message);
    alert("Question Group saved successfully.");
    await editAdminTest(adminCurrentTest.id);
}

async function deleteAdminQuestionGroup(groupId) {
    if (!confirm("Delete this question group? Questions inside the number range will NOT be deleted.")) return;
    const { error } = await supabaseClient.from("question_groups").delete().eq("id", groupId);
    if (error) return alert("Could not delete question group: " + error.message);
    await editAdminTest(adminCurrentTest.id);
}

async function addAdminQuestionToGroup(groupId) {
    const group = adminCurrentGroups.find(g => g.id === groupId);
    if (!group) return;
    const section = adminCurrentSections.find(s => s.id === group.section_id);
    if (!section) return;
    const start = Number(group.start_question || 1);
    const end = Number(group.end_question || start);
    const used = new Set(adminCurrentQuestions.filter(q => q.section_id === section.id).map(q => Number(q.question_number)));
    let next = start;
    while (next <= end && used.has(next)) next++;
    if (next > end) return alert(`All question numbers ${start}-${end} are already used in this group. Change the range or edit existing questions.`);
    const defaultType = group.question_type || (adminCurrentTest?.module === "listening" ? "note" : "single");
    const { data: question, error } = await supabaseClient.from("questions").insert({
        section_id: section.id,
        question_number: next,
        question_type: defaultType,
        question_text: `Question ${next}`,
        marks: 1,
        correct_answer: "",
        explanation: "",
        image_url: null
    }).select().single();
    if (error) return alert("Could not add question: " + error.message);
    await editAdminTest(adminCurrentTest.id);
    setTimeout(() => document.getElementById(`q-num-${question.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
}

function adminQuestionEditor(q, typeMap, isListening, isReading) {
    const options = q.options || [];
    const typeOptions = Object.entries(typeMap).map(([k, v]) => `<option value="${k}" ${q.question_type === k ? "selected" : ""}>${escapeHtml(v)}</option>`).join("");
    const part = adminCurrentSections.find(s => s.id === q.section_id);
    return `<div class="students-panel admin-question-editor" style="margin:12px 0;padding:16px" id="admin-q-${q.id}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
            <h4>Question ${Number(q.question_number || 0)}</h4>
            <button type="button" class="danger" onclick="deleteAdminQuestion('${q.id}')">Delete Question</button>
        </div>
        <div class="grid">
            <label>Question No.<input id="q-num-${q.id}" type="number" min="1" max="40" value="${Number(q.question_number || 1)}"></label>
            ${isListening ? `<label>Part<select id="q-sec-${q.id}">${adminCurrentSections.map(s => `<option value="${s.id}" ${s.id === q.section_id ? "selected" : ""}>Part ${s.section_number}</option>`).join("")}</select></label>` : isReading ? `<label>Passage<select id="q-sec-${q.id}">${adminCurrentSections.map(s => `<option value="${s.id}" ${s.id === q.section_id ? "selected" : ""}>Passage ${s.section_number}</option>`).join("")}</select></label>` : ""}
        </div>
        <label>Question Type<select id="q-type-${q.id}" onchange="refreshAdminQuestion('${q.id}')">${typeOptions}</select></label>
        <label>Question / Prompt<textarea id="q-text-${q.id}" style="min-height:90px">${escapeHtml(q.question_text || "")}</textarea></label>
        <div id="q-extra-${q.id}">${renderAdminQuestionExtras(q)}</div>
        <div class="grid">
            <label>Marks<input id="q-marks-${q.id}" type="number" min="0" step="0.5" value="${Number(q.marks || 1)}"></label>
            <label>Correct Answer / Accepted Answers<textarea id="q-answer-${q.id}" placeholder="For multiple accepted answers, separate with ||">${escapeHtml(q.correct_answer || "")}</textarea></label>
        </div>
        <label>Explanation / Tutor Note<textarea id="q-exp-${q.id}">${escapeHtml(q.explanation || "")}</textarea></label>
        <label>Question Image URL (optional)<input id="q-image-${q.id}" value="${escapeHtml(q.image_url || "")}" placeholder="https://..."></label>
        <button type="button" class="save-button" onclick="saveAdminQuestion('${q.id}')">💾 Save Question</button>
    </div>`;
}

function renderAdminQuestionExtras(q) {
    const type = q.question_type || "short";
    const opts = (q.options || []).map(o => o.option_text || "");
    const needsOptions = ["single", "multi", "matching", "map"].includes(type);
    if (!needsOptions) {
        const hint = type === "note" ? "Fill the missing information in the notes." :
            type === "form" ? "Use form fields / labels in the prompt; correct answers go in the answer box." :
            type === "table" ? "Describe the table/rows/columns in the prompt." :
            type === "sentence" ? "Sentence completion; use the answer box for accepted answers." :
            type === "summary" ? "Summary completion; use the answer box for accepted answers." :
            type === "short" ? "Short answer; use the answer box for accepted answers." :
            type === "flow" ? "Flowchart completion; describe the process/stages in the prompt." : "";
        return `<div style="padding:10px;background:#f8fafc;border-radius:8px"><small>${escapeHtml(hint)}</small></div>`;
    }
    return `<div class="option-builder" id="options-${q.id}">
        <div style="display:flex;justify-content:space-between;align-items:center"><strong>${type === "map" ? "Label / Answer Bank" : type === "matching" ? "Matching Answer Bank" : "Answer Options"}</strong><button type="button" onclick="addAdminOption('${q.id}')">+ Add Option</button></div>
        <div id="option-list-${q.id}">${opts.length ? opts.map((v, i) => adminOptionRow(q.id, i, v)).join("") : adminOptionRow(q.id, 0, "")}</div>
    </div>`;
}

function adminOptionRow(qid, index, value) {
    return `<div class="grid" style="grid-template-columns:70px 1fr 90px;align-items:end;margin:6px 0" data-option-row="${qid}">
        <label>Key<input value="${String.fromCharCode(65 + index)}" disabled></label>
        <label>Option<input class="q-option-input" data-qid="${qid}" value="${escapeHtml(value)}" placeholder="Option ${index + 1}"></label>
        <button type="button" onclick="removeAdminOption(this)">Remove</button>
    </div>`;
}

function addAdminOption(qid) {
    const list = document.getElementById(`option-list-${qid}`);
    if (!list) return;
    const index = list.querySelectorAll(`[data-option-row="${qid}"]`).length;
    list.insertAdjacentHTML("beforeend", adminOptionRow(qid, index, ""));
    renumberAdminOptions(qid);
}

function removeAdminOption(button) {
    const row = button.closest("[data-option-row]");
    if (!row) return;
    const qid = row.getAttribute("data-option-row");
    const list = document.getElementById(`option-list-${qid}`);
    if (list && list.children.length > 1) row.remove();
    renumberAdminOptions(qid);
}

function renumberAdminOptions(qid) {
    const list = document.getElementById(`option-list-${qid}`);
    if (!list) return;
    list.querySelectorAll(`[data-option-row="${qid}"]`).forEach((row, i) => {
        const key = row.querySelector("label:first-child input");
        if (key) key.value = String.fromCharCode(65 + i);
    });
}

function refreshAdminQuestion(qid) {
    const q = adminCurrentQuestions.find(x => x.id === qid);
    if (!q) return;
    const type = document.getElementById(`q-type-${qid}`)?.value || "short";
    q.question_type = type;
    q.options = [];
    const old = document.getElementById(`q-extra-${qid}`);
    if (old) old.innerHTML = renderAdminQuestionExtras(q);
}

function collectAdminOptions(qid) {
    return Array.from(document.querySelectorAll(`.q-option-input[data-qid="${qid}"]`)).map(i => i.value.trim()).filter(Boolean);
}

async function saveAdminTestHeader() {
    if (!adminCurrentTest) return;
    const payload = {
        title: document.getElementById("editTestTitle")?.value.trim(),
        description: document.getElementById("editTestDescription")?.value.trim() || null,
        duration_minutes: Number(document.getElementById("editTestDuration")?.value || 0),
        total_questions: Number(document.getElementById("editTestTotal")?.value || 0),
        is_published: !!document.getElementById("editTestPublished")?.checked
    };
    const { error } = await supabaseClient.from("tests").update(payload).eq("id", adminCurrentTest.id);
    if (error) return alert(error.message);
    await editAdminTest(adminCurrentTest.id);
}

async function saveAdminSection(sectionId) {
    const payload = {
        title: document.getElementById(`sec-title-${sectionId}`)?.value.trim(),
        instructions: document.getElementById(`sec-instructions-${sectionId}`)?.value || "",
        content: document.getElementById(`sec-content-${sectionId}`)?.value || "",
        image_url: document.getElementById(`sec-image-${sectionId}`)?.value.trim() || null,
        audio_url: document.getElementById(`sec-audio-${sectionId}`)?.value.trim() || null
    };
    const { error } = await supabaseClient.from("sections").update(payload).eq("id", sectionId);
    if (error) return alert(error.message);
    alert("Section saved successfully.");
}

async function saveAdminQuestion(qid) {
    const q = adminCurrentQuestions.find(x => x.id === qid);
    if (!q) return;
    const options = collectAdminOptions(qid);
    const payload = {
        section_id: document.getElementById(`q-sec-${qid}`)?.value || q.section_id,
        question_number: Number(document.getElementById(`q-num-${qid}`)?.value || q.question_number),
        question_type: document.getElementById(`q-type-${qid}`)?.value || q.question_type,
        question_text: document.getElementById(`q-text-${qid}`)?.value || "",
        marks: Number(document.getElementById(`q-marks-${qid}`)?.value || 1),
        correct_answer: document.getElementById(`q-answer-${qid}`)?.value || "",
        explanation: document.getElementById(`q-exp-${qid}`)?.value || "",
        image_url: document.getElementById(`q-image-${qid}`)?.value.trim() || null
    };
    try {
        const { error } = await supabaseClient.from("questions").update(payload).eq("id", qid);
        if (error) throw error;
        await supabaseClient.from("options").delete().eq("question_id", qid);
        if (options.length) {
            const rows = options.map((text, i) => ({ question_id: qid, option_key: String.fromCharCode(65 + i), option_text: text, is_correct: false }));
            const { error: oError } = await supabaseClient.from("options").insert(rows);
            if (oError) throw oError;
        }
        alert("Question saved successfully.");
        await editAdminTest(adminCurrentTest.id);
    } catch (error) {
        alert("Could not save question: " + (error.message || "Unknown error"));
    }
}

async function addAdminQuestion() {
    if (!adminCurrentTest || !adminCurrentSections.length) return;
    const section = adminCurrentSections[0];
    const defaultType = adminCurrentTest.module === "listening" ? "note" : "single";
    const { data: question, error } = await supabaseClient.from("questions").insert({
        section_id: section.id,
        question_number: 1,
        question_type: defaultType,
        question_text: "New Question",
        marks: 1,
        correct_answer: "",
        explanation: "",
        image_url: null
    }).select().single();
    if (error) return alert(error.message);
    await editAdminTest(adminCurrentTest.id);
    setTimeout(() => document.getElementById(`q-num-${question.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
}

async function deleteAdminQuestion(qid) {
    if (!confirm("Delete this question and its options?")) return;
    try {
        const { error: oError } = await supabaseClient.from("options").delete().eq("question_id", qid);
        if (oError) throw oError;
        const { error } = await supabaseClient.from("questions").delete().eq("id", qid);
        if (error) throw error;
        await editAdminTest(adminCurrentTest.id);
    } catch (error) {
        alert("Could not delete question: " + (error.message || "Unknown error"));
    }
}

async function openAdminResults() {
    const message = document.getElementById("dashboardMessage");
    if (!message) return;
    message.innerHTML = adminModuleBox("📊 Results", "Student test results stored in Supabase.");
    const body = document.getElementById("adminModuleBody");
    const { data: results, error } = await supabaseClient.from("results").select("id,student_id,test_id,listening_score,reading_score,writing_score,overall_band,started_at,submitted_at,status,created_at").order("created_at", { ascending: false });
    if (error) throw error;
    body.innerHTML = `<div style="overflow:auto"><table class="students-table"><thead><tr><th>Result ID</th><th>Student</th><th>Test</th><th>Scores</th><th>Band</th><th>Status</th></tr></thead><tbody>${(results || []).map(r => `<tr><td>${escapeHtml(String(r.id))}</td><td>${escapeHtml(String(r.student_id || "-"))}</td><td>${escapeHtml(String(r.test_id || "-"))}</td><td>L:${r.listening_score ?? "-"} / R:${r.reading_score ?? "-"} / W:${r.writing_score ?? "-"}</td><td>${escapeHtml(String(r.overall_band ?? "-"))}</td><td>${escapeHtml(String(r.status ?? "-"))}</td></tr>`).join("") || `<tr><td colspan="6" style="text-align:center;padding:30px">No results found.</td></tr>`}</tbody></table></div>`;
}

// Expose admin functions for the inline editor controls.
window.openTestManager = openTestManager;
window.openCreateTestForm = openCreateTestForm;
window.createAdminTest = createAdminTest;
window.toggleAdminTestPublish = toggleAdminTestPublish;
window.deleteAdminTest = deleteAdminTest;
window.editAdminTest = editAdminTest;
window.saveAdminTestHeader = saveAdminTestHeader;
window.saveAdminSection = saveAdminSection;
window.saveAdminQuestion = saveAdminQuestion;
window.addAdminQuestion = addAdminQuestion;
window.addAdminQuestionGroup = addAdminQuestionGroup;
window.saveAdminQuestionGroup = saveAdminQuestionGroup;
window.deleteAdminQuestionGroup = deleteAdminQuestionGroup;
window.addAdminQuestionToGroup = addAdminQuestionToGroup;
window.deleteAdminQuestion = deleteAdminQuestion;
window.addAdminOption = addAdminOption;
window.removeAdminOption = removeAdminOption;
window.refreshAdminQuestion = refreshAdminQuestion;
window.openAdminResults = openAdminResults;
window.backToAdminDashboard = backToAdminDashboard;
