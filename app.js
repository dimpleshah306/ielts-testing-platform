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

    message.innerHTML = `
        <div class="coming-soon">
            Loading students...
        </div>
    `;


    try {

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
                        ${escapeHtml(student.student_id)}
                    </td>

                    <td>
                        ${escapeHtml(student.full_name)}
                    </td>

                    <td>
                        ${escapeHtml(student.email || "-")}
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


        message.innerHTML = `

            <div class="students-panel">

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

