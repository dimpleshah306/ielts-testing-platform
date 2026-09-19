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
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = `
        <div class="dashboard">
            <header class="dashboard-header">
                <div><h1>Universal Education IELTS</h1><p>Student Testing Platform</p></div>
                <div class="user-area"><div><strong>${escapeHtml(profile.full_name || "Student")}</strong><span>Student</span></div><button id="studentLogout" type="button">Logout</button></div>
            </header>
            <main class="dashboard-content">
                <div class="dashboard-title"><h2>Student Dashboard</h2><p>Select an available IELTS test</p></div>
                <div id="studentDashboardContent"><div class="coming-soon">Loading published tests...</div></div>
            </main>
        </div>`;
    document.getElementById("studentLogout")?.addEventListener("click", logout);
    loadStudentTestList();
}

async function loadStudentTestList() {
    const box = document.getElementById("studentDashboardContent");
    if (!box) return;
    try {
        const { data: tests, error } = await supabaseClient
            .from("tests")
            .select("id,title,module,description,duration_minutes,total_questions,is_published")
            .eq("is_published", true)
            .order("module", { ascending: true })
            .order("created_at", { ascending: false });
        if (error) throw error;
        if (!tests?.length) {
            box.innerHTML = `<div class="coming-soon"><strong>No tests are published yet.</strong><p>Your Admin / Tutor can publish a test from the test manager.</p></div>`;
            return;
        }
        box.innerHTML = `<section class="dashboard-grid">${tests.map(t => `
            <button class="dashboard-card" type="button" onclick="startStudentTest('${t.id}')">
                <span class="card-icon">${t.module === "listening" ? "🎧" : t.module === "reading" ? "📖" : "✍️"}</span>
                <strong>${escapeHtml(t.title)}</strong>
                <small>${escapeHtml(String(t.module).toUpperCase())} • ${Number(t.total_questions || 0)} Questions • ${Number(t.duration_minutes || 0)} min</small>
            </button>`).join("")}</section>`;
    } catch (error) {
        box.innerHTML = `<div class="coming-soon"><strong>Unable to load tests</strong><p>${escapeHtml(error.message || "Unknown error")}</p></div>`;
    }
}

let studentTestState = null;

async function loadStudentTestData(testId) {
    const { data: test, error: testError } = await supabaseClient.from("tests").select("*").eq("id", testId).single();
    if (testError) throw testError;
    if (!test.is_published && !studentTestState?.preview) throw new Error("This test is not published.");

    const { data: sections, error: secError } = await supabaseClient.from("sections").select("*").eq("test_id", testId).order("section_number", { ascending: true });
    if (secError) throw secError;
    const sectionIds = (sections || []).map(s => s.id);

    let questions = [];
    if (sectionIds.length) {
        const { data, error } = await supabaseClient.from("questions").select("*").in("section_id", sectionIds).order("question_number", { ascending: true });
        if (error) throw error;
        questions = data || [];
        const qids = questions.map(q => q.id);
        if (qids.length) {
            const { data: options, error: oError } = await supabaseClient.from("options").select("*").in("question_id", qids).order("option_key", { ascending: true });
            if (oError) throw oError;
            const byQ = {};
            (options || []).forEach(o => (byQ[o.question_id] ||= []).push(o));
            questions = questions.map(q => ({ ...q, options: byQ[q.id] || [] }));
        }
    }

    let groups = [];
    if (sectionIds.length) {
        const { data: gdata, error: gError } = await supabaseClient.from("question_groups").select("*").in("section_id", sectionIds).order("group_order", { ascending: true });
        if (gError) throw gError;
        groups = gdata || [];
        const gids = groups.map(g => g.id);
        if (gids.length) {
            const { data: go, error: goError } = await supabaseClient.from("question_group_options").select("*").in("group_id", gids).order("sort_order", { ascending: true });
            if (goError) throw goError;
            const byG = {};
            (go || []).forEach(o => (byG[o.group_id] ||= []).push(o));
            groups = groups.map(g => ({ ...g, options: byG[g.id] || [] }));
        }
    }
    return { test, sections: sections || [], questions, groups };
}

async function startStudentTest(testId) {
    studentTestState = { preview: false, testId, currentSection: 0, answers: {} };
    try {
        const data = await loadStudentTestData(testId);
        studentTestState.data = data;
        renderStudentTestRunner();
    } catch (error) {
        alert(error.message || "Unable to open test.");
    }
}

async function openStudentTestPreview(testId) {
    studentTestState = { preview: true, testId, currentSection: 0, answers: {} };
    try {
        const data = await loadStudentTestData(testId);
        studentTestState.data = data;
        renderStudentTestRunner();
    } catch (error) {
        alert(error.message || "Unable to preview test.");
    }
}

function renderStudentTestRunner() {
    const app = document.getElementById("app");
    const state = studentTestState;
    if (!app || !state?.data) return;
    const { test, sections } = state.data;
    const s = sections[state.currentSection];
    const isListening = test.module === "listening";
    const isReading = test.module === "reading";
    const sectionQuestions = state.data.questions.filter(q => q.section_id === s.id).sort((a,b) => Number(a.question_number) - Number(b.question_number));
    const sectionGroups = state.data.groups.filter(g => g.section_id === s.id).sort((a,b) => Number(a.group_order) - Number(b.group_order));

    app.innerHTML = `<div class="dashboard">
        <header class="dashboard-header">
            <div><h1>${escapeHtml(test.title)}</h1><p>${state.preview ? "Student View Preview" : "Student Test"}</p></div>
            <div class="user-area"><button type="button" onclick="exitStudentTest()">← ${state.preview ? "Back to Admin" : "Dashboard"}</button></div>
        </header>
        <main class="dashboard-content">
            ${state.preview ? `<div style="padding:10px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;margin-bottom:14px"><strong>Preview Mode:</strong> This is how the test will appear to a student. Answers are not submitted.</div>` : ""}
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">${sections.map((sec,i) => `<button type="button" class="${i === state.currentSection ? "save-button" : "cancel-button"}" onclick="switchStudentSection(${i})">${isListening ? "Part" : isReading ? "Passage" : "Section"} ${i+1}</button>`).join("")}</div>
            <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,1fr);gap:16px;align-items:start">
                <section style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px;position:sticky;top:10px;max-height:calc(100vh - 100px);overflow:auto">
                    ${isListening && s.audio_url ? `<audio controls style="width:100%;margin-bottom:14px" src="${escapeHtml(s.audio_url)}"></audio>` : ""}
                    <h2>${escapeHtml(s.title || `${isListening ? "Part" : "Section"} ${s.section_number}`)}</h2>
                    ${s.instructions ? `<div style="padding:12px;background:#fff7df;border-radius:8px;white-space:pre-wrap;margin:12px 0"><strong>Instructions</strong><br>${escapeHtml(s.instructions)}</div>` : ""}
                    ${s.image_url ? `<img src="${escapeHtml(s.image_url)}" alt="Section image" style="max-width:100%;border-radius:8px;margin:10px 0">` : ""}
                    ${s.content ? `<div style="white-space:pre-wrap;line-height:1.7">${escapeHtml(s.content)}</div>` : ""}
                    ${sectionGroups.map(g => renderStudentGroupContent(g, sectionQuestions)).join("")}
                </section>
                <section style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px;max-height:calc(100vh - 100px);overflow:auto">
                    <h2>Questions</h2>
                    ${sectionGroups.length ? sectionGroups.map(g => renderStudentQuestionGroup(g, sectionQuestions)).join("") : sectionQuestions.map(q => renderStudentQuestion(q)).join("")}
                    ${!sectionQuestions.length ? `<div class="coming-soon">No questions have been added to this section yet.</div>` : ""}
                </section>
            </div>
            <div style="display:flex;justify-content:space-between;gap:10px;margin-top:16px">
                <button type="button" class="cancel-button" ${state.currentSection === 0 ? "disabled" : ""} onclick="switchStudentSection(${state.currentSection - 1})">← Previous</button>
                ${state.currentSection < sections.length - 1 ? `<button type="button" class="save-button" onclick="switchStudentSection(${state.currentSection + 1})">Next →</button>` : state.preview ? `<button type="button" class="save-button" onclick="exitStudentTest()">Finish Preview</button>` : `<button type="button" class="save-button" onclick="submitStudentTest()">Submit Test</button>`}
            </div>
        </main>
    </div>`;
}

function renderStudentGroupContent(g, questions) {
    const qs = questions.filter(q => Number(q.question_number) >= Number(g.start_question) && Number(q.question_number) <= Number(g.end_question));
    return `<div style="margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb">
        <h3>Questions ${Number(g.start_question)}-${Number(g.end_question)}</h3>
        ${g.instructions ? `<div style="padding:12px;background:#fff7df;border-radius:8px;white-space:pre-wrap;margin:10px 0"><strong>Instructions</strong><br>${escapeHtml(g.instructions)}</div>` : ""}
        ${g.image_url ? `<img src="${escapeHtml(g.image_url)}" alt="Question group" style="max-width:100%;border-radius:8px;margin:8px 0">` : ""}
        ${g.content ? `<div style="white-space:pre-wrap;line-height:1.7">${escapeHtml(g.content)}</div>` : ""}
        ${g.options?.length ? `<div style="margin-top:12px"><strong>Options</strong><div style="display:grid;gap:6px;margin-top:6px">${g.options.map(o => `<div><strong>${escapeHtml(o.option_key)}.</strong> ${escapeHtml(o.option_text)}</div>`).join("")}</div></div>` : ""}
    </div>`;
}

function renderStudentQuestionGroup(g, questions) {
    const qs = questions.filter(q => Number(q.question_number) >= Number(g.start_question) && Number(q.question_number) <= Number(g.end_question));
    if (!qs.length) return `<div style="margin:16px 0;padding:12px;background:#f8fafc;border-radius:8px">Questions ${Number(g.start_question)}-${Number(g.end_question)} are not added yet.</div>`;
    return `<div style="margin:0 0 22px"><h3>Questions ${Number(g.start_question)}-${Number(g.end_question)}</h3>${qs.map(q => renderStudentQuestion(q, g.options || [])).join("")}</div>`;
}

function renderStudentQuestion(q, sharedOptions = []) {
    const type = q.question_type || "short";
    const saved = studentTestState.answers[q.id] ?? "";
    const opts = q.options || [];
    const optionBank = opts.length ? opts : sharedOptions;
    let control = "";
    if (["single"].includes(type)) {
        control = optionBank.map(o => `<label style="display:block;margin:8px 0"><input type="radio" name="ans-${q.id}" value="${escapeHtml(o.option_key)}" ${saved === o.option_key ? "checked" : ""} onchange="setStudentAnswer('${q.id}',this.value)"> <strong>${escapeHtml(o.option_key)}.</strong> ${escapeHtml(o.option_text)}</label>`).join("");
    } else if (["multi"].includes(type)) {
        const selected = Array.isArray(saved) ? saved : [];
        control = optionBank.map(o => `<label style="display:block;margin:8px 0"><input type="checkbox" value="${escapeHtml(o.option_key)}" ${selected.includes(o.option_key) ? "checked" : ""} onchange="toggleStudentAnswer('${q.id}',this.value,this.checked)"> <strong>${escapeHtml(o.option_key)}.</strong> ${escapeHtml(o.option_text)}</label>`).join("");
    } else if (["matching","map"].includes(type) && optionBank.length) {
        control = `<select style="width:100%;padding:9px" onchange="setStudentAnswer('${q.id}',this.value)"><option value="">Select answer</option>${optionBank.map(o => `<option value="${escapeHtml(o.option_key)}" ${saved === o.option_key ? "selected" : ""}>${escapeHtml(o.option_key)} — ${escapeHtml(o.option_text)}</option>`).join("")}</select>`;
    } else {
        control = `<input type="text" style="width:100%;padding:9px" value="${escapeHtml(Array.isArray(saved) ? saved.join(", ") : saved)}" oninput="setStudentAnswer('${q.id}',this.value)" placeholder="Type your answer">`;
    }
    return `<div style="padding:14px 0;border-bottom:1px solid #e5e7eb"><div style="font-weight:700;margin-bottom:8px">${Number(q.question_number)}. ${escapeHtml(q.question_text || "")}</div>${q.image_url ? `<img src="${escapeHtml(q.image_url)}" alt="Question" style="max-width:100%;margin:8px 0;border-radius:8px">` : ""}<div>${control}</div></div>`;
}

function setStudentAnswer(qid, value) { if (studentTestState) studentTestState.answers[qid] = value; }
function toggleStudentAnswer(qid, value, checked) {
    if (!studentTestState) return;
    const arr = Array.isArray(studentTestState.answers[qid]) ? [...studentTestState.answers[qid]] : [];
    if (checked && !arr.includes(value)) arr.push(value);
    if (!checked) studentTestState.answers[qid] = arr.filter(x => x !== value);
    else studentTestState.answers[qid] = arr;
}
function switchStudentSection(index) {
    if (!studentTestState?.data) return;
    studentTestState.currentSection = Math.max(0, Math.min(index, studentTestState.data.sections.length - 1));
    renderStudentTestRunner();
}
function exitStudentTest() {
    const preview = studentTestState?.preview;
    studentTestState = null;
    if (preview && adminCurrentTest) editAdminTest(adminCurrentTest.id);
    else window.location.reload();
}
async function submitStudentTest() {
    alert("Test submission screen is ready. Result/answer persistence can be connected after you confirm the Student View layout.");
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

async function callStudentAdmin(action, payload = {}) {
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError) throw sessionError;
    const session = sessionData.session;
    if (!session) throw new Error("Your login session has expired. Please login again.");
    const response = await fetch(`${SUPABASE_URL}/functions/v1/student-admin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({ action, ...payload })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) throw new Error(result.error || "Student account operation failed.");
    return result;
}

async function openStudents() {
    const message = document.getElementById("dashboardMessage");
    if (!message) return;
    message.innerHTML = `<div class="coming-soon">Loading students...</div>`;
    try {
        const { data: students, error } = await supabaseClient
            .from("students")
            .select("id, student_id, full_name, email, active, created_at")
            .order("created_at", { ascending: false });
        if (error) throw error;
        const rows = (students || []).map(student => `
            <tr>
                <td>${escapeHtml(student.student_id || "-")}</td>
                <td>${escapeHtml(student.full_name || "-")}</td>
                <td>${escapeHtml(student.email || "-")}</td>
                <td><span class="${student.active ? "status-active" : "status-inactive"}">${student.active ? "Active" : "Inactive"}</span></td>
                <td>${new Date(student.created_at).toLocaleDateString()}</td>
                <td><div style="display:flex;gap:5px;flex-wrap:wrap">
                    <button type="button" onclick="editStudentAccount('${student.id}')">Edit</button>
                    <button type="button" onclick="resetStudentPassword('${student.id}','${escapeHtml(student.full_name || "Student")}')">Reset Password</button>
                    <button type="button" onclick="toggleStudentAccount('${student.id}',${!student.active})">${student.active ? "Deactivate" : "Activate"}</button>
                    <button type="button" class="danger" onclick="deleteStudentAccount('${student.id}','${escapeHtml(student.full_name || "Student")}')">Delete</button>
                </div></td>
            </tr>`).join("");
        message.innerHTML = `<div class="students-panel">
            <div class="students-panel-header"><div><h2>Students</h2><p>Add, edit, activate/deactivate, reset password or delete student accounts.</p></div><button type="button" class="add-student-button" onclick="openAddStudentForm()">+ Add Student</button></div>
            <div class="students-table-wrapper"><table class="students-table"><thead><tr><th>Student ID</th><th>Name</th><th>Email</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>${rows || `<tr><td colspan="6" style="text-align:center;padding:30px">No students found.</td></tr>`}</tbody></table></div>
        </div>`;
    } catch (error) {
        message.innerHTML = `<div class="coming-soon"><strong>Unable to load students</strong><p>${escapeHtml(error.message || "Unknown error")}</p></div>`;
    }
}

function openAddStudentForm(student = null) {
    const message = document.getElementById("dashboardMessage");
    if (!message) return;
    const editing = !!student;
    message.innerHTML = `<div class="students-panel">
        <div class="students-panel-header"><div><h2>${editing ? "Edit Student" : "Add New Student"}</h2><p>${editing ? "Update student profile details." : "Create a student login account."}</p></div><button type="button" class="cancel-button" onclick="openStudents()">Cancel</button></div>
        <form id="studentAdminForm" class="student-form">
            <div class="grid"><label>Student ID<input id="adminStudentId" value="${escapeHtml(student?.student_id || "")}" required></label><label>Full Name<input id="adminStudentName" value="${escapeHtml(student?.full_name || "")}" required></label></div>
            <label>Email Address<input id="adminStudentEmail" type="email" value="${escapeHtml(student?.email || "")}" required></label>
            ${editing ? `<label><input id="adminStudentActive" type="checkbox" ${student.active ? "checked" : ""}> Account Active</label>` : `<label>Password<input id="adminStudentPassword" type="password" minlength="8" required placeholder="Minimum 8 characters"></label>`}
            <div style="display:flex;gap:8px"><button type="button" class="cancel-button" onclick="openStudents()">Cancel</button><button type="submit" class="save-button">${editing ? "Save Changes" : "Create Student Account"}</button></div>
            <div id="studentAdminFormMessage" class="login-message"></div>
        </form></div>`;
    document.getElementById("studentAdminForm").addEventListener("submit", async e => {
        e.preventDefault();
        const formMessage = document.getElementById("studentAdminFormMessage");
        try {
            if (!editing) {
                await callStudentAdmin("create", {
                    student_id: document.getElementById("adminStudentId").value.trim(),
                    full_name: document.getElementById("adminStudentName").value.trim(),
                    email: document.getElementById("adminStudentEmail").value.trim(),
                    password: document.getElementById("adminStudentPassword").value
                });
            } else {
                await callStudentAdmin("update", {
                    id: student.id,
                    student_id: document.getElementById("adminStudentId").value.trim(),
                    full_name: document.getElementById("adminStudentName").value.trim(),
                    email: document.getElementById("adminStudentEmail").value.trim(),
                    active: document.getElementById("adminStudentActive").checked
                });
            }
            formMessage.style.color = "#15803d";
            formMessage.textContent = "Saved successfully.";
            setTimeout(openStudents, 500);
        } catch (error) {
            formMessage.style.color = "#dc2626";
            formMessage.textContent = error.message || "Operation failed.";
        }
    });
}

async function editStudentAccount(id) {
    try {
        const { data: student, error } = await supabaseClient.from("students").select("id,student_id,full_name,email,active").eq("id", id).single();
        if (error) throw error;
        openAddStudentForm(student);
    } catch (error) { alert(error.message || "Could not open student."); }
}

async function resetStudentPassword(id, name) {
    const password = prompt(`Set a new password for ${name}. Minimum 8 characters:`);
    if (password === null) return;
    if (password.length < 8) return alert("Password must contain at least 8 characters.");
    try { await callStudentAdmin("reset_password", { id, password }); alert("Password reset successfully."); }
    catch (error) { alert(error.message || "Could not reset password."); }
}

async function toggleStudentAccount(id, active) {
    const action = active ? "activate" : "deactivate";
    if (!confirm(`Are you sure you want to ${action} this student account?`)) return;
    try { await callStudentAdmin("update", { id, active }); await openStudents(); }
    catch (error) { alert(error.message || "Could not update account status."); }
}

async function deleteStudentAccount(id, name) {
    if (!confirm(`Delete the student account for ${name}? This cannot be undone. Students with saved results are protected from deletion.`)) return;
    try { await callStudentAdmin("delete", { id }); alert("Student account deleted."); await openStudents(); }
    catch (error) { alert(error.message || "Could not delete student account."); }
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
        const groupIds = groups.map(g => g.id);
        if (groupIds.length) {
            const { data: groupOptions, error: goError } = await supabaseClient
                .from("question_group_options")
                .select("*")
                .in("group_id", groupIds)
                .order("sort_order", { ascending: true });
            if (goError) throw goError;
            const byGroup = {};
            (groupOptions || []).forEach(o => (byGroup[o.group_id] ||= []).push(o));
            groups = groups.map(g => ({ ...g, options: byGroup[g.id] || [] }));
        }
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
            <button type="button" onclick="openStudentTestPreview('${adminCurrentTest.id}')">👁 Preview Student View</button>
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
    const groupOptions = g.options || [];
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
        <div style="margin-top:14px;padding:12px;background:#f8fafc;border-radius:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
                <div><strong>Shared Options / Answer Bank</strong><div class="muted">Use this for shared A-G options, matching lists, map labels, etc. Leave empty when the question has its own options.</div></div>
                <button type="button" onclick="addAdminGroupOption('${g.id}')">+ Add Option</button>
            </div>
            <div id="group-option-list-${g.id}" style="margin-top:8px">${groupOptions.length ? groupOptions.map((o,i)=>adminGroupOptionRow(g.id,i,o.option_key,o.option_text)).join("") : adminGroupOptionRow(g.id,0,"A","")}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px">
            <button type="button" class="save-button" onclick="saveAdminQuestionGroup('${g.id}')">💾 Save Question Group + Options</button>
            <small class="muted">This group currently contains ${groupQuestions.length} question(s) by number range ${start}–${end}.</small>
        </div>
    </div>`;
}

function adminGroupOptionRow(groupId, index, key, value) {
    return `<div class="grid" style="grid-template-columns:70px 1fr 90px;align-items:end;margin:6px 0" data-group-option-row="${groupId}">
        <label>Key<input class="group-option-key" value="${escapeHtml(key || String.fromCharCode(65 + index))}"></label>
        <label>Option<input class="group-option-text" value="${escapeHtml(value || "")}" placeholder="Option ${index + 1}"></label>
        <button type="button" onclick="removeAdminGroupOption(this)">Remove</button>
    </div>`;
}
function addAdminGroupOption(groupId) {
    const list = document.getElementById(`group-option-list-${groupId}`);
    if (!list) return;
    const index = list.querySelectorAll(`[data-group-option-row="${groupId}"]`).length;
    list.insertAdjacentHTML("beforeend", adminGroupOptionRow(groupId,index,String.fromCharCode(65+index),""));
}
function removeAdminGroupOption(button) {
    const row = button.closest("[data-group-option-row]");
    if (!row) return;
    const list = row.parentElement;
    if (list.children.length > 1) row.remove();
}
function collectAdminGroupOptions(groupId) {
    const rows = document.querySelectorAll(`[data-group-option-row="${groupId}"]`);
    return Array.from(rows).map((row,i) => ({
        option_key: row.querySelector(".group-option-key")?.value.trim() || String.fromCharCode(65+i),
        option_text: row.querySelector(".group-option-text")?.value.trim() || "",
        sort_order: i+1
    })).filter(o => o.option_text);
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
    const groupOptions = collectAdminGroupOptions(groupId);
    const { error: deleteOptionError } = await supabaseClient.from("question_group_options").delete().eq("group_id", groupId);
    if (deleteOptionError) return alert("Could not update group options: " + deleteOptionError.message);
    if (groupOptions.length) {
        const { error: insertOptionError } = await supabaseClient.from("question_group_options").insert(groupOptions.map(o => ({ group_id: groupId, ...o })));
        if (insertOptionError) return alert("Could not save group options: " + insertOptionError.message);
    }
    alert("Question Group and Options saved successfully.");
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
window.openStudents = openStudents;
window.openAddStudentForm = openAddStudentForm;
window.editStudentAccount = editStudentAccount;
window.resetStudentPassword = resetStudentPassword;
window.toggleStudentAccount = toggleStudentAccount;
window.deleteStudentAccount = deleteStudentAccount;
window.openTestManager = openTestManager;
window.openStudentTestPreview = openStudentTestPreview;
window.startStudentTest = startStudentTest;
window.switchStudentSection = switchStudentSection;
window.setStudentAnswer = setStudentAnswer;
window.toggleStudentAnswer = toggleStudentAnswer;
window.exitStudentTest = exitStudentTest;
window.submitStudentTest = submitStudentTest;
window.addAdminGroupOption = addAdminGroupOption;
window.removeAdminGroupOption = removeAdminGroupOption;
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

// ============================================================================
// DYNAMIC LISTENING QUESTION BUILDER V2
// This layer intentionally overrides the earlier generic question editor while
// preserving the rest of the project (Auth, Student Management, Test CRUD, etc.).
// ============================================================================

const LISTENING_TYPE_REGISTRY_V2 = {
    multiple_choice: { label: "Multiple Choice", renderer: "mcq" },
    matching: { label: "Matching", renderer: "matching" },
    map_labelling: { label: "Plan / Map / Diagram Labelling", renderer: "map" },
    completion: { label: "Form / Note / Table / Flow-chart Completion", renderer: "completion" },
    sentence_completion: { label: "Sentence Completion", renderer: "typed" },
    summary_completion: { label: "Summary Completion", renderer: "summary" },
    short_answer: { label: "Short Answer", renderer: "typed" }
};

const LEGACY_TYPE_TO_V2 = {
    single: "multiple_choice",
    multi: "multiple_choice",
    matching: "matching",
    map: "map_labelling",
    note: "completion",
    form: "completion",
    table: "completion",
    flow: "completion",
    sentence: "sentence_completion",
    summary: "summary_completion",
    short: "short_answer"
};

function safeJson(value, fallback = {}) {
    if (value == null) return fallback;
    if (typeof value === "object") return value;
    try { return JSON.parse(value); } catch (_) { return fallback; }
}
function escAttr(value) { return escapeHtml(String(value ?? "")).replace(/"/g, "&quot;"); }
function parseLines(text) { return String(text || "").split(/\r?\n/).map(x => x.trim()).filter(Boolean); }
function uniq(arr) { return [...new Set((arr || []).map(x => String(x).trim()).filter(Boolean))]; }
function normalizeQuestionTypeV2(type) { return LISTENING_TYPE_REGISTRY_V2[type] ? type : (LEGACY_TYPE_TO_V2[type] || "short_answer"); }
function optionKeyV2(i) { return String.fromCharCode(65 + i); }

async function loadStudentTestData(testId) {
    const { data: test, error: testError } = await supabaseClient.from("tests").select("*").eq("id", testId).single();
    if (testError) throw testError;
    if (!test.is_published && !studentTestState?.preview) throw new Error("This test is not published.");

    const { data: sections, error: secError } = await supabaseClient.from("sections").select("*").eq("test_id", testId).order("section_number", { ascending: true });
    if (secError) throw secError;
    const sectionIds = (sections || []).map(s => s.id);

    let groups = [];
    if (sectionIds.length) {
        const { data, error } = await supabaseClient.from("question_groups").select("*").in("section_id", sectionIds).order("group_order", { ascending: true });
        if (error) throw error;
        groups = (data || []).map(g => ({ ...g, configuration: safeJson(g.configuration, {}) }));
        const gids = groups.map(g => g.id);
        if (gids.length) {
            const { data: opts, error: optErr } = await supabaseClient.from("question_group_options").select("*").in("group_id", gids).order("sort_order", { ascending: true });
            if (optErr) throw optErr;
            const byG = {};
            (opts || []).forEach(o => (byG[o.group_id] ||= []).push(o));
            groups = groups.map(g => ({ ...g, options: byG[g.id] || [] }));
        }
    }

    let questions = [];
    if (sectionIds.length) {
        const { data, error } = await supabaseClient.from("questions").select("*").in("section_id", sectionIds).order("question_number", { ascending: true });
        if (error) throw error;
        questions = (data || []).map(q => ({
            ...q,
            question_type: normalizeQuestionTypeV2(q.question_type),
            accepted_answers: Array.isArray(q.accepted_answers) ? q.accepted_answers : safeJson(q.accepted_answers, []),
            question_config: safeJson(q.question_config, {})
        }));
        const qids = questions.map(q => q.id);
        if (qids.length) {
            const { data: options, error: oError } = await supabaseClient.from("options").select("*").in("question_id", qids).order("sort_order", { ascending: true });
            if (oError) throw oError;
            const byQ = {};
            (options || []).forEach(o => (byQ[o.question_id] ||= []).push(o));
            questions = questions.map(q => ({ ...q, options: byQ[q.id] || [] }));
        }
    }
    return { test, sections: sections || [], questions, groups };
}

function groupQuestionsV2(group, questions) {
    const linked = questions.filter(q => q.group_id === group.id);
    if (linked.length) return linked.sort((a,b) => Number(a.question_order || a.question_number) - Number(b.question_order || b.question_number));
    return questions.filter(q => q.section_id === group.section_id && Number(q.question_number) >= Number(group.start_question) && Number(q.question_number) <= Number(group.end_question)).sort((a,b) => Number(a.question_number)-Number(b.question_number));
}

function renderStudentGroupContent(g, questions) {
    const cfg = safeJson(g.configuration, {});
    const type = normalizeQuestionTypeV2(g.question_type);
    const qs = groupQuestionsV2(g, questions);
    const image = g.image_url || cfg.image_url || "";
    const typeLabel = LISTENING_TYPE_REGISTRY_V2[type]?.label || type;
    const optionBankNeeded = ["matching", "summary_completion"].includes(type) || (type === "map_labelling" && cfg.answer_mode === "option");
    return `<div style="margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb">
        <h3 style="margin-bottom:6px">${escapeHtml(g.group_title || `Questions ${g.start_question}-${g.end_question}`)}</h3>
        <div style="font-size:12px;color:#64748b;margin-bottom:8px">Questions ${Number(g.start_question)}-${Number(g.end_question)} • ${escapeHtml(typeLabel)}</div>
        ${g.instructions ? `<div style="padding:12px 14px;background:#fff5d6;border-radius:8px;white-space:pre-wrap;margin:10px 0;font-weight:600">${escapeHtml(g.instructions)}</div>` : ""}
        ${g.content ? `<div style="white-space:pre-wrap;line-height:1.75;margin:12px 0">${escapeHtml(g.content)}</div>` : ""}
        ${image ? `<div class="student-map-wrap" style="position:relative;display:inline-block;max-width:100%;margin:10px 0"><img id="student-map-${g.id}" src="${escAttr(image)}" alt="Question visual" style="max-width:100%;display:block;border-radius:8px">${type === "map_labelling" ? qs.map(q => renderStudentMapMarkerV2(q)).join("") : ""}</div>` : ""}
        ${optionBankNeeded && g.options?.length ? `<div style="margin-top:12px;padding:12px;background:#f8fafc;border-radius:8px"><strong>Options</strong><div style="display:grid;gap:6px;margin-top:8px">${g.options.map(o => `<div><strong>${escapeHtml(o.option_key)}.</strong> ${escapeHtml(o.option_text)}</div>`).join("")}</div></div>` : ""}
    </div>`;
}

function renderStudentMapMarkerV2(q) {
    const cfg = safeJson(q.question_config, {});
    if (cfg.marker_x == null || cfg.marker_y == null) return "";
    return `<span title="Question ${Number(q.question_number)}" style="position:absolute;left:${Number(cfg.marker_x)}%;top:${Number(cfg.marker_y)}%;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;background:#111827;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,.35)">${Number(q.question_number)}</span>`;
}

function renderStudentQuestionGroup(g, questions) {
    const qs = groupQuestionsV2(g, questions);
    if (!qs.length) return `<div style="margin:16px 0;padding:12px;background:#f8fafc;border-radius:8px">Questions ${Number(g.start_question)}-${Number(g.end_question)} are not added yet.</div>`;
    return `<div style="margin:0 0 24px"><h3>Questions ${Number(g.start_question)}-${Number(g.end_question)}</h3>${qs.map(q => renderStudentQuestion(q, g.options || [], g)).join("")}</div>`;
}

function renderStudentQuestion(q, sharedOptions = [], group = null) {
    const type = normalizeQuestionTypeV2(q.question_type || group?.question_type);
    const cfg = safeJson(q.question_config, {});
    const gcfg = safeJson(group?.configuration, {});
    const saved = studentTestState?.answers?.[q.id] ?? (type === "multiple_choice" && cfg.mode === "multiple" ? [] : "");
    const opts = (q.options?.length ? q.options : sharedOptions) || [];
    let control = "";

    if (type === "multiple_choice") {
        const mode = cfg.mode || gcfg.mcq_mode || "single";
        if (mode === "multiple") {
            const selected = Array.isArray(saved) ? saved : [];
            control = opts.map(o => `<label style="display:block;margin:8px 0"><input type="checkbox" value="${escAttr(o.option_key)}" ${selected.includes(o.option_key) ? "checked" : ""} onchange="toggleStudentAnswer('${q.id}',this.value,this.checked)"> ${cfg.show_option_letters === false ? "" : `<strong>${escapeHtml(o.option_key)}.</strong> `}${escapeHtml(o.option_text)}</label>`).join("");
        } else {
            control = opts.map(o => `<label style="display:block;margin:8px 0"><input type="radio" name="ans-${q.id}" value="${escAttr(o.option_key)}" ${saved === o.option_key ? "checked" : ""} onchange="setStudentAnswer('${q.id}',this.value)"> ${cfg.show_option_letters === false ? "" : `<strong>${escapeHtml(o.option_key)}.</strong> `}${escapeHtml(o.option_text)}</label>`).join("");
        }
    } else if (type === "matching") {
        control = `<select style="width:100%;padding:9px" onchange="setStudentAnswer('${q.id}',this.value)"><option value="">Select answer</option>${opts.map(o => `<option value="${escAttr(o.option_key)}" ${saved === o.option_key ? "selected" : ""}>${escapeHtml(o.option_key)} — ${escapeHtml(o.option_text)}</option>`).join("")}</select>`;
    } else if (type === "map_labelling" && (cfg.answer_type === "option" || gcfg.answer_mode === "option")) {
        control = `<select style="width:100%;padding:9px" onchange="setStudentAnswer('${q.id}',this.value)"><option value="">Select label</option>${opts.map(o => `<option value="${escAttr(o.option_key)}" ${saved === o.option_key ? "selected" : ""}>${escapeHtml(o.option_key)} — ${escapeHtml(o.option_text)}</option>`).join("")}</select>`;
    } else if (type === "summary_completion" && (gcfg.summary_mode === "options" || cfg.summary_mode === "options")) {
        control = `<select style="width:100%;padding:9px" onchange="setStudentAnswer('${q.id}',this.value)"><option value="">Select answer</option>${opts.map(o => `<option value="${escAttr(o.option_key)}" ${saved === o.option_key ? "selected" : ""}>${escapeHtml(o.option_key)} — ${escapeHtml(o.option_text)}</option>`).join("")}</select>`;
    } else {
        const maxChars = Number(cfg.character_limit || 0);
        control = `<input type="text" ${maxChars ? `maxlength="${maxChars}"` : ""} style="width:100%;padding:9px" value="${escAttr(Array.isArray(saved) ? saved.join(", ") : saved)}" oninput="setStudentAnswer('${q.id}',this.value)" placeholder="Type your answer">`;
    }

    return `<div style="padding:14px 0;border-bottom:1px solid #e5e7eb" data-student-question="${q.id}">
        <div style="font-weight:700;margin-bottom:8px">${Number(q.question_number)}. ${escapeHtml(q.question_text || cfg.label || "")}</div>
        ${q.image_url ? `<img src="${escAttr(q.image_url)}" alt="Question" style="max-width:100%;margin:8px 0;border-radius:8px">` : ""}
        <div>${control}</div>
    </div>`;
}

function answerConfigDefaultsV2() {
    return {
        word_limit: 0, character_limit: 0, case_sensitive: false,
        punctuation_sensitive: false, whitespace_normalization: true,
        number_format: "exact", allow_minor_spelling: false, required: true
    };
}

function normalizeTypedAnswerV2(value, cfg) {
    let s = String(value ?? "");
    if (cfg.whitespace_normalization !== false) s = s.trim().replace(/\s+/g, " ");
    if (!cfg.case_sensitive) s = s.toLowerCase();
    if (!cfg.punctuation_sensitive) s = s.replace(/[.,!?;:'"()\[\]{}]/g, "");
    return s;
}
function wordCountV2(value) { return String(value || "").trim().split(/\s+/).filter(Boolean).length; }
function evaluateQuestionV2(q, studentAnswer, group = null) {
    const type = normalizeQuestionTypeV2(q.question_type || group?.question_type);
    const cfg = { ...answerConfigDefaultsV2(), ...safeJson(q.question_config, {}) };
    const gcfg = safeJson(group?.configuration, {});
    const marks = Number(q.marks || 1);

    if (type === "multiple_choice") {
        const mode = cfg.mode || gcfg.mcq_mode || "single";
        const correct = (q.options || []).filter(o => o.is_correct).map(o => o.option_key);
        const fallback = parseLines(String(q.correct_answer || "").replace(/\|\|/g, "\n").replace(/,/g, "\n"));
        const expected = uniq(correct.length ? correct : fallback);
        if (mode === "multiple") {
            const actual = uniq(Array.isArray(studentAnswer) ? studentAnswer : []);
            const ok = expected.length === actual.length && expected.every(x => actual.includes(x));
            return { isCorrect: ok, marks: ok ? marks : 0 };
        }
        const ok = expected.includes(String(studentAnswer || ""));
        return { isCorrect: ok, marks: ok ? marks : 0 };
    }

    if (type === "matching" || (type === "map_labelling" && (cfg.answer_type === "option" || gcfg.answer_mode === "option")) || (type === "summary_completion" && (gcfg.summary_mode === "options" || cfg.summary_mode === "options"))) {
        const expected = String(q.correct_answer || "").trim();
        const ok = expected !== "" && String(studentAnswer || "").trim() === expected;
        return { isCorrect: ok, marks: ok ? marks : 0 };
    }

    if (cfg.required && !String(studentAnswer || "").trim()) return { isCorrect: false, marks: 0 };
    if (Number(cfg.word_limit || 0) > 0 && wordCountV2(studentAnswer) > Number(cfg.word_limit)) return { isCorrect: false, marks: 0 };
    if (Number(cfg.character_limit || 0) > 0 && String(studentAnswer || "").length > Number(cfg.character_limit)) return { isCorrect: false, marks: 0 };

    let accepted = [q.correct_answer, ...(Array.isArray(q.accepted_answers) ? q.accepted_answers : [])].filter(Boolean);
    if (cfg.number_format === "numeric_equivalent" || cfg.number_format === "both") {
        const actualNum = Number(String(studentAnswer || "").replace(/,/g, ""));
        const numOk = accepted.some(a => Number(String(a).replace(/,/g, "")) === actualNum && !Number.isNaN(actualNum));
        if (numOk) return { isCorrect: true, marks };
    }
    const actual = normalizeTypedAnswerV2(studentAnswer, cfg);
    const ok = accepted.some(a => normalizeTypedAnswerV2(a, cfg) === actual);
    return { isCorrect: ok, marks: ok ? marks : 0 };
}

async function submitStudentTest() {
    if (!studentTestState?.data) return;
    const { test, questions, groups } = studentTestState.data;
    const evaluations = questions.map(q => {
        const g = groups.find(x => x.id === q.group_id) || groups.find(x => x.section_id === q.section_id && Number(q.question_number) >= Number(x.start_question) && Number(q.question_number) <= Number(x.end_question));
        return { q, result: evaluateQuestionV2(q, studentTestState.answers[q.id], g) };
    });
    const totalMarks = evaluations.reduce((n,x) => n + Number(x.q.marks || 1), 0);
    const obtained = evaluations.reduce((n,x) => n + Number(x.result.marks || 0), 0);
    const correctCount = evaluations.filter(x => x.result.isCorrect).length;

    try {
        const { data: auth } = await supabaseClient.auth.getUser();
        const uid = auth?.user?.id;
        if (!uid) throw new Error("Student session not found.");
        const now = new Date().toISOString();
        const payload = { student_id: uid, test_id: test.id, status: "completed", submitted_at: now };
        if (test.module === "listening") payload.listening_score = obtained;
        if (test.module === "reading") payload.reading_score = obtained;
        const { data: resultRow, error: rErr } = await supabaseClient.from("results").insert(payload).select().single();
        if (rErr) throw rErr;
        if (evaluations.length) {
            const rows = evaluations.map(x => ({
                result_id: resultRow.id,
                question_id: x.q.id,
                answer_text: Array.isArray(studentTestState.answers[x.q.id]) ? studentTestState.answers[x.q.id].join(",") : String(studentTestState.answers[x.q.id] ?? ""),
                is_correct: x.result.isCorrect,
                marks_obtained: x.result.marks
            }));
            const { error: aErr } = await supabaseClient.from("answers").insert(rows);
            if (aErr) throw aErr;
        }
        alert(`Test submitted successfully.\nCorrect: ${correctCount}/${questions.length}\nMarks: ${obtained}/${totalMarks}`);
        studentTestState = null;
        window.location.reload();
    } catch (error) {
        console.error(error);
        alert(`Your answers were evaluated, but Supabase could not save the result.\nCorrect: ${correctCount}/${questions.length}\nMarks: ${obtained}/${totalMarks}\n\n${error.message || "Unknown error"}`);
    }
}

// ---------------------------- ADMIN DYNAMIC BUILDER ---------------------------
function listeningTypeOptionsV2(selected) {
    return Object.entries(LISTENING_TYPE_REGISTRY_V2).map(([k,v]) => `<option value="${k}" ${normalizeQuestionTypeV2(selected)===k ? "selected" : ""}>${escapeHtml(v.label)}</option>`).join("");
}

function adminQuestionGroupEditor(g, sectionLabel) {
    const type = normalizeQuestionTypeV2(g.question_type);
    const cfg = safeJson(g.configuration, {});
    const questions = groupQuestionsV2(g, adminCurrentQuestions);
    return `<div class="students-panel" id="group-${g.id}" style="margin:14px 0;padding:16px;border:1px solid #cbd5e1">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
            <div><strong>${escapeHtml(g.group_title || `Question Group ${Number(g.group_order || 1)}`)}</strong><div class="muted">${escapeHtml(sectionLabel)} • Questions ${Number(g.start_question)}-${Number(g.end_question)}</div></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" onclick="previewAdminGroupV2('${g.id}')">👁 Preview</button><button type="button" class="danger" onclick="deleteAdminQuestionGroup('${g.id}')">Delete Group</button></div>
        </div>
        <div class="grid" style="margin-top:12px">
            <label>Group Title<input id="group-title-${g.id}" value="${escAttr(g.group_title || "")}" placeholder="Optional title"></label>
            <label>Question Type<select id="group-type-${g.id}" onchange="changeAdminGroupTypeV2('${g.id}')">${listeningTypeOptionsV2(type)}</select></label>
            <label>Start Question No.<input id="group-start-${g.id}" type="number" min="1" value="${Number(g.start_question || 1)}"></label>
            <label>End Question No.<input id="group-end-${g.id}" type="number" min="1" value="${Number(g.end_question || g.start_question || 1)}"></label>
        </div>
        <label>Instructions<textarea id="group-inst-${g.id}" style="min-height:80px" placeholder="e.g. Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.">${escapeHtml(g.instructions || "")}</textarea></label>
        <label>Group Content / Notes / Summary / Context<textarea id="group-content-${g.id}" style="min-height:120px">${escapeHtml(g.content || "")}</textarea></label>
        <div id="group-dynamic-${g.id}">${renderGroupTypePanelV2(g, cfg)}</div>
        <div class="grid"><label>Audio Start (seconds, optional)<input id="group-audio-start-${g.id}" type="number" min="0" step="0.1" value="${g.audio_start_seconds ?? ""}"></label><label>Audio End (seconds, optional)<input id="group-audio-end-${g.id}" type="number" min="0" step="0.1" value="${g.audio_end_seconds ?? ""}"></label></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0"><button type="button" class="save-button" onclick="saveAdminQuestionGroup('${g.id}')">💾 Save Group Settings</button><button type="button" onclick="addAdminQuestionToGroup('${g.id}')">+ Add Question / Blank / Item</button></div>
        <div id="group-questions-${g.id}">${questions.length ? questions.map(q => adminQuestionEditorV2(q,g)).join("") : `<div style="padding:12px;background:#f8fafc;border-radius:8px">No questions/items added yet.</div>`}</div>
    </div>`;
}

function renderGroupTypePanelV2(g, cfg) {
    const type = normalizeQuestionTypeV2(g.question_type);
    if (type === "multiple_choice") {
        return `<div style="padding:12px;background:#f8fafc;border-radius:8px;margin-top:10px"><strong>Multiple Choice Settings</strong><div class="grid" style="margin-top:8px"><label>Question Mode<select id="group-mcq-mode-${g.id}"><option value="single" ${(cfg.mcq_mode||"single")==="single"?"selected":""}>Single Answer</option><option value="multiple" ${cfg.mcq_mode==="multiple"?"selected":""}>Multiple Answers</option></select></label><label>Default answers required<input id="group-mcq-required-${g.id}" type="number" min="1" value="${Number(cfg.answers_required || 1)}"></label></div></div>`;
    }
    if (type === "matching") {
        return `<div style="padding:12px;background:#f8fafc;border-radius:8px;margin-top:10px"><strong>Matching Settings</strong><label><input id="group-match-repeat-${g.id}" type="checkbox" ${cfg.allow_repeat!==false?"checked":""}> Allow an option to be used more than once</label>${renderGroupOptionBankV2(g,"Right-side Answer Options")}</div>`;
    }
    if (type === "map_labelling") {
        return `<div style="padding:12px;background:#f8fafc;border-radius:8px;margin-top:10px"><strong>Plan / Map / Diagram</strong><div class="grid" style="margin-top:8px"><label>Image URL<input id="group-image-${g.id}" value="${escAttr(g.image_url || cfg.image_url || "")}" placeholder="https://..."></label><label>Answer Mode<select id="group-map-mode-${g.id}"><option value="text" ${(cfg.answer_mode||"text")==="text"?"selected":""}>Typed Answer</option><option value="option" ${cfg.answer_mode==="option"?"selected":""}>Select from Options</option></select></label></div><label>Upload Image<input id="group-image-file-${g.id}" type="file" accept="image/*" onchange="uploadGroupImageV2('${g.id}',this)"></label>${renderGroupOptionBankV2(g,"Optional Label / Answer Bank")}</div>`;
    }
    if (type === "completion") {
        return `<div style="padding:12px;background:#f8fafc;border-radius:8px;margin-top:10px"><strong>Completion Settings</strong><label>Completion Format<select id="group-completion-format-${g.id}"><option value="form" ${cfg.completion_format==="form"?"selected":""}>Form</option><option value="note" ${(cfg.completion_format||"note")==="note"?"selected":""}>Notes</option><option value="table" ${cfg.completion_format==="table"?"selected":""}>Table</option><option value="flowchart" ${cfg.completion_format==="flowchart"?"selected":""}>Flow Chart</option></select></label><small>Each added question below represents one editable blank.</small></div>`;
    }
    if (type === "summary_completion") {
        return `<div style="padding:12px;background:#f8fafc;border-radius:8px;margin-top:10px"><strong>Summary Completion Settings</strong><label>Mode<select id="group-summary-mode-${g.id}" onchange="changeSummaryModeV2('${g.id}')"><option value="typed" ${(cfg.summary_mode||"typed")==="typed"?"selected":""}>Summary with Typed Blanks</option><option value="options" ${cfg.summary_mode==="options"?"selected":""}>Summary with Answer Options</option></select></label><div id="group-summary-options-${g.id}">${cfg.summary_mode==="options" ? renderGroupOptionBankV2(g,"Summary Answer Options") : ""}</div></div>`;
    }
    if (type === "sentence_completion") return `<div style="padding:12px;background:#f8fafc;border-radius:8px;margin-top:10px"><strong>Sentence Completion</strong><small style="display:block;margin-top:6px">Add one question for each blank/sentence. Configure accepted answers and word limit below.</small></div>`;
    return `<div style="padding:12px;background:#f8fafc;border-radius:8px;margin-top:10px"><strong>Short Answer</strong><small style="display:block;margin-top:6px">Add each short-answer question below and configure accepted answers and validation.</small></div>`;
}

function renderGroupOptionBankV2(g, title) {
    const opts = g.options || [];
    return `<div style="margin-top:10px"><div style="display:flex;justify-content:space-between;align-items:center"><strong>${escapeHtml(title)}</strong><button type="button" onclick="addAdminGroupOption('${g.id}')">+ Add Option</button></div><div id="group-option-list-${g.id}">${opts.length ? opts.map((o,i)=>adminGroupOptionRow(g.id,i,o.option_text)).join("") : adminGroupOptionRow(g.id,0,"")}</div></div>`;
}

function changeAdminGroupTypeV2(groupId) {
    const g = adminCurrentGroups.find(x => x.id === groupId); if (!g) return;
    g.question_type = document.getElementById(`group-type-${groupId}`)?.value || "short_answer";
    g.configuration = {};
    g.options = [];
    const box = document.getElementById(`group-dynamic-${groupId}`); if (box) box.innerHTML = renderGroupTypePanelV2(g, {});
}
function changeSummaryModeV2(groupId) {
    const g = adminCurrentGroups.find(x=>x.id===groupId); if(!g) return;
    const mode = document.getElementById(`group-summary-mode-${groupId}`)?.value || "typed";
    const box = document.getElementById(`group-summary-options-${groupId}`);
    if (box) box.innerHTML = mode === "options" ? renderGroupOptionBankV2(g,"Summary Answer Options") : "";
}

async function uploadGroupImageV2(groupId, input) {
    const file = input?.files?.[0]; if (!file) return;
    try {
        const ext = (file.name.split(".").pop() || "png").toLowerCase();
        const path = `groups/${groupId}-${Date.now()}.${ext}`;
        const { error } = await supabaseClient.storage.from("question-images").upload(path, file, { upsert:true });
        if (error) throw error;
        const { data } = supabaseClient.storage.from("question-images").getPublicUrl(path);
        const url = data?.publicUrl || "";
        const field = document.getElementById(`group-image-${groupId}`); if (field) field.value = url;
        alert("Image uploaded. Save Group Settings to store the URL.");
    } catch (e) { alert("Image upload failed: " + (e.message || "Unknown error") + "\nYou can still paste an image URL manually."); }
}

function adminQuestionEditorV2(q, g) {
    const type = normalizeQuestionTypeV2(g.question_type || q.question_type);
    const cfg = { ...answerConfigDefaultsV2(), ...safeJson(q.question_config,{}) };
    const alternatives = Array.isArray(q.accepted_answers) ? q.accepted_answers.join("\n") : "";
    const controls = renderQuestionTypeFieldsV2(q,g,cfg,alternatives);
    return `<div style="margin:12px 0;padding:14px;border:1px solid #e2e8f0;border-radius:10px;background:white" id="admin-q-${q.id}">
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap"><strong>Question ${Number(q.question_number)}</strong><div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" onclick="moveAdminQuestionV2('${q.id}',-1)">↑ Move Up</button><button type="button" onclick="moveAdminQuestionV2('${q.id}',1)">↓ Move Down</button><button type="button" onclick="duplicateAdminQuestionV2('${q.id}')">Duplicate</button><button type="button" class="danger" onclick="deleteAdminQuestion('${q.id}')">Delete</button></div></div>
        <div class="grid" style="margin-top:10px"><label>Question No.<input id="q-num-${q.id}" type="number" min="1" value="${Number(q.question_number||1)}"></label><label>Marks<input id="q-marks-${q.id}" type="number" min="0" step="0.5" value="${Number(q.marks||1)}"></label></div>
        ${controls}
        <label>Explanation / Tutor Note<textarea id="q-exp-${q.id}">${escapeHtml(q.explanation||"")}</textarea></label>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="save-button" onclick="saveAdminQuestion('${q.id}')">💾 Save Question</button><button type="button" onclick="previewAdminGroupV2('${g.id}')">👁 Preview Student View</button></div>
    </div>`;
}

function renderQuestionTypeFieldsV2(q,g,cfg,alternatives) {
    const type = normalizeQuestionTypeV2(g.question_type || q.question_type);
    const gcfg = safeJson(g.configuration,{});
    if (type === "multiple_choice") {
        const mode = cfg.mode || gcfg.mcq_mode || "single";
        const opts = q.options || [];
        return `<label>Question<textarea id="q-text-${q.id}" style="min-height:80px">${escapeHtml(q.question_text||"")}</textarea></label><div class="grid"><label>Mode<select id="q-mode-${q.id}"><option value="single" ${mode==="single"?"selected":""}>Single Answer</option><option value="multiple" ${mode==="multiple"?"selected":""}>Multiple Answers</option></select></label><label>Answers Required<input id="q-required-count-${q.id}" type="number" min="1" value="${Number(cfg.answers_required || (mode==="multiple"?2:1))}"></label></div><div style="display:flex;gap:14px;flex-wrap:wrap"><label><input id="q-randomize-${q.id}" type="checkbox" ${cfg.randomize_options?"checked":""}> Randomize options</label><label><input id="q-showletters-${q.id}" type="checkbox" ${cfg.show_option_letters!==false?"checked":""}> Show option letters</label><label><input id="q-required-${q.id}" type="checkbox" ${cfg.required!==false?"checked":""}> Required</label></div><div id="options-${q.id}" style="margin-top:10px"><div style="display:flex;justify-content:space-between"><strong>Options & Correct Answer</strong><button type="button" onclick="addAdminOption('${q.id}')">+ Add Option</button></div><div id="option-list-${q.id}">${opts.length ? opts.map((o,i)=>adminOptionRowV2(q.id,i,o.option_text,!!o.is_correct,mode)).join("") : [0,1,2,3].map(i=>adminOptionRowV2(q.id,i,"",false,mode)).join("")}</div></div>`;
    }
    if (type === "matching") {
        return `<label>Left-side Item / Question<textarea id="q-text-${q.id}">${escapeHtml(q.question_text||"")}</textarea></label><label>Correct Option Letter<input id="q-answer-${q.id}" value="${escAttr(q.correct_answer||"")}" placeholder="e.g. C"></label>`;
    }
    if (type === "map_labelling") {
        return `<label>Label / Prompt<textarea id="q-text-${q.id}">${escapeHtml(q.question_text||"")}</textarea></label><div class="grid"><label>Answer Type<select id="q-answer-type-${q.id}"><option value="text" ${cfg.answer_type==="text"?"selected":""}>Text</option><option value="letter" ${cfg.answer_type==="letter"?"selected":""}>Letter</option><option value="number" ${cfg.answer_type==="number"?"selected":""}>Number</option><option value="option" ${cfg.answer_type==="option"?"selected":""}>Option</option></select></label><label>Correct Answer<input id="q-answer-${q.id}" value="${escAttr(q.correct_answer||"")}"></label></div><label>Alternative Accepted Answers<textarea id="q-alt-${q.id}" placeholder="One per line">${escapeHtml(alternatives)}</textarea></label><div class="grid"><label>Marker X %<input id="q-marker-x-${q.id}" type="number" min="0" max="100" step="0.1" value="${cfg.marker_x??""}"></label><label>Marker Y %<input id="q-marker-y-${q.id}" type="number" min="0" max="100" step="0.1" value="${cfg.marker_y??""}"></label></div><button type="button" onclick="openMapMarkerPickerV2('${g.id}','${q.id}')">📍 Click Image to Place Marker</button>${renderTypedValidationV2(q,cfg)}`;
    }
    if (type === "summary_completion" && gcfg.summary_mode === "options") {
        return `<label>Blank / Prompt<textarea id="q-text-${q.id}">${escapeHtml(q.question_text||"")}</textarea></label><label>Correct Option Letter<input id="q-answer-${q.id}" value="${escAttr(q.correct_answer||"")}" placeholder="e.g. C"></label>`;
    }
    return `<label>${type === "completion" ? "Blank Label / Line" : type === "sentence_completion" ? "Sentence / Blank Prompt" : type === "summary_completion" ? "Summary Blank Prompt" : "Question"}<textarea id="q-text-${q.id}" style="min-height:70px">${escapeHtml(q.question_text||"")}</textarea></label><label>Correct Answer<input id="q-answer-${q.id}" value="${escAttr(q.correct_answer||"")}"></label><label>Alternative Accepted Answers<textarea id="q-alt-${q.id}" placeholder="One accepted answer per line">${escapeHtml(alternatives)}</textarea></label>${renderTypedValidationV2(q,cfg)}`;
}

function renderTypedValidationV2(q,cfg) {
    return `<div style="padding:10px;background:#f8fafc;border-radius:8px;margin:10px 0"><strong>Answer Validation</strong><div class="grid" style="margin-top:8px"><label>Maximum Words<input id="q-wordlimit-${q.id}" type="number" min="0" value="${Number(cfg.word_limit||0)}"><small>0 = no limit</small></label><label>Character Limit<input id="q-charlimit-${q.id}" type="number" min="0" value="${Number(cfg.character_limit||0)}"><small>0 = no limit</small></label><label>Number Format<select id="q-numberformat-${q.id}"><option value="exact" ${cfg.number_format==="exact"?"selected":""}>Exact</option><option value="numeric_equivalent" ${cfg.number_format==="numeric_equivalent"?"selected":""}>Numeric equivalent</option><option value="both" ${cfg.number_format==="both"?"selected":""}>Both</option></select></label></div><div style="display:flex;gap:14px;flex-wrap:wrap"><label><input id="q-case-${q.id}" type="checkbox" ${cfg.case_sensitive?"checked":""}> Case Sensitive</label><label><input id="q-punct-${q.id}" type="checkbox" ${cfg.punctuation_sensitive?"checked":""}> Punctuation Sensitive</label><label><input id="q-space-${q.id}" type="checkbox" ${cfg.whitespace_normalization!==false?"checked":""}> Normalize Whitespace</label><label><input id="q-required-${q.id}" type="checkbox" ${cfg.required!==false?"checked":""}> Required</label><label><input id="q-spell-${q.id}" type="checkbox" ${cfg.allow_minor_spelling?"checked":""}> Controlled minor spelling variation</label></div></div>`;
}

function adminOptionRowV2(qid,index,value,isCorrect,mode) {
    return `<div style="display:grid;grid-template-columns:55px 1fr 90px 80px;gap:8px;align-items:end;margin:6px 0" data-option-row="${qid}"><label>Key<input class="q-option-key" value="${optionKeyV2(index)}" readonly></label><label>Option<input class="q-option-input" data-qid="${qid}" value="${escAttr(value)}"></label><label>Correct<input class="q-option-correct" data-qid="${qid}" type="${mode==="multiple"?"checkbox":"radio"}" name="q-correct-${qid}" ${isCorrect?"checked":""}></label><button type="button" onclick="removeAdminOption(this)">Remove</button></div>`;
}
function addAdminOption(qid) {
    const list = document.getElementById(`option-list-${qid}`); if(!list) return;
    const mode = document.getElementById(`q-mode-${qid}`)?.value || "single";
    const i = list.querySelectorAll(`[data-option-row="${qid}"]`).length;
    list.insertAdjacentHTML("beforeend",adminOptionRowV2(qid,i,"",false,mode)); renumberAdminOptions(qid);
}
function renumberAdminOptions(qid) {
    const list=document.getElementById(`option-list-${qid}`); if(!list) return;
    list.querySelectorAll(`[data-option-row="${qid}"]`).forEach((row,i)=>{ const k=row.querySelector(".q-option-key"); if(k) k.value=optionKeyV2(i); });
}
function collectAdminOptionsV2(qid) {
    return Array.from(document.querySelectorAll(`[data-option-row="${qid}"]`)).map((row,i)=>({ option_key: optionKeyV2(i), option_text: row.querySelector(".q-option-input")?.value.trim()||"", is_correct: !!row.querySelector(".q-option-correct")?.checked, sort_order:i+1 })).filter(x=>x.option_text);
}

function collectTypedConfigV2(qid, base={}) {
    return { ...base,
        word_limit:Number(document.getElementById(`q-wordlimit-${qid}`)?.value||0), character_limit:Number(document.getElementById(`q-charlimit-${qid}`)?.value||0),
        case_sensitive:!!document.getElementById(`q-case-${qid}`)?.checked, punctuation_sensitive:!!document.getElementById(`q-punct-${qid}`)?.checked,
        whitespace_normalization:document.getElementById(`q-space-${qid}`)?.checked !== false, number_format:document.getElementById(`q-numberformat-${qid}`)?.value||"exact",
        required:document.getElementById(`q-required-${qid}`)?.checked !== false, allow_minor_spelling:!!document.getElementById(`q-spell-${qid}`)?.checked
    };
}

async function saveAdminQuestion(qid) {
    const q = adminCurrentQuestions.find(x=>x.id===qid); if(!q) return;
    const g = adminCurrentGroups.find(x=>x.id===q.group_id) || adminCurrentGroups.find(x=>x.section_id===q.section_id && Number(q.question_number)>=Number(x.start_question)&&Number(q.question_number)<=Number(x.end_question));
    const type = normalizeQuestionTypeV2(g?.question_type || q.question_type);
    let cfg = safeJson(q.question_config,{}), accepted = [], correctAnswer = document.getElementById(`q-answer-${qid}`)?.value.trim() || "";
    let options = [];
    if (type === "multiple_choice") {
        const mode = document.getElementById(`q-mode-${qid}`)?.value || "single";
        options = collectAdminOptionsV2(qid);
        const correct = options.filter(o=>o.is_correct).map(o=>o.option_key);
        const required = Number(document.getElementById(`q-required-count-${qid}`)?.value || (mode==="multiple"?2:1));
        if (!options.length) return alert("Add at least one option.");
        if (mode === "single" && correct.length !== 1) return alert("Single Answer MCQ must have exactly one correct option.");
        if (mode === "multiple" && correct.length !== required) return alert(`Select exactly ${required} correct answers.`);
        correctAnswer = correct.join("||");
        cfg = { ...cfg, mode, answers_required:required, randomize_options:!!document.getElementById(`q-randomize-${qid}`)?.checked, show_option_letters:document.getElementById(`q-showletters-${qid}`)?.checked!==false, required:document.getElementById(`q-required-${qid}`)?.checked!==false };
    } else if (type === "map_labelling") {
        accepted = parseLines(document.getElementById(`q-alt-${qid}`)?.value);
        cfg = collectTypedConfigV2(qid,{ ...cfg, answer_type:document.getElementById(`q-answer-type-${qid}`)?.value||"text", marker_x:Number(document.getElementById(`q-marker-x-${qid}`)?.value||0), marker_y:Number(document.getElementById(`q-marker-y-${qid}`)?.value||0) });
    } else if (!["matching"].includes(type) && !(type==="summary_completion" && safeJson(g?.configuration,{}).summary_mode==="options")) {
        accepted = parseLines(document.getElementById(`q-alt-${qid}`)?.value);
        cfg = collectTypedConfigV2(qid,cfg);
    }
    const payload = { question_number:Number(document.getElementById(`q-num-${qid}`)?.value||q.question_number), question_type:type, question_text:document.getElementById(`q-text-${qid}`)?.value||"", marks:Number(document.getElementById(`q-marks-${qid}`)?.value||1), correct_answer:correctAnswer, accepted_answers:accepted, question_config:cfg, explanation:document.getElementById(`q-exp-${qid}`)?.value||"", group_id:g?.id||q.group_id||null };
    try {
        const { error } = await supabaseClient.from("questions").update(payload).eq("id",qid); if(error) throw error;
        if (type === "multiple_choice") {
            await supabaseClient.from("options").delete().eq("question_id",qid);
            if (options.length) { const { error:oErr } = await supabaseClient.from("options").insert(options.map(o=>({question_id:qid,...o,metadata:{}}))); if(oErr) throw oErr; }
        }
        await editAdminTest(adminCurrentTest.id);
    } catch(e){ alert("Could not save question: "+(e.message||"Unknown error")); }
}

async function saveAdminQuestionGroup(groupId) {
    const g=adminCurrentGroups.find(x=>x.id===groupId); if(!g) return;
    const type=document.getElementById(`group-type-${groupId}`)?.value||"short_answer";
    const start=Number(document.getElementById(`group-start-${groupId}`)?.value||1), end=Number(document.getElementById(`group-end-${groupId}`)?.value||start);
    if (end<start) return alert("End Question No. must be greater than or equal to Start Question No.");
    let cfg={};
    if(type==="multiple_choice") cfg={mcq_mode:document.getElementById(`group-mcq-mode-${groupId}`)?.value||"single",answers_required:Number(document.getElementById(`group-mcq-required-${groupId}`)?.value||1)};
    if(type==="matching") cfg={allow_repeat:!!document.getElementById(`group-match-repeat-${groupId}`)?.checked};
    if(type==="map_labelling") cfg={answer_mode:document.getElementById(`group-map-mode-${groupId}`)?.value||"text",image_url:document.getElementById(`group-image-${groupId}`)?.value.trim()||null};
    if(type==="completion") cfg={completion_format:document.getElementById(`group-completion-format-${groupId}`)?.value||"note"};
    if(type==="summary_completion") cfg={summary_mode:document.getElementById(`group-summary-mode-${groupId}`)?.value||"typed"};
    const payload={group_title:document.getElementById(`group-title-${groupId}`)?.value.trim()||null,start_question:start,end_question:end,question_type:type,instructions:document.getElementById(`group-inst-${groupId}`)?.value||"",content:document.getElementById(`group-content-${groupId}`)?.value||"",image_url:document.getElementById(`group-image-${groupId}`)?.value.trim()||g.image_url||null,audio_start_seconds:document.getElementById(`group-audio-start-${groupId}`)?.value?Number(document.getElementById(`group-audio-start-${groupId}`).value):null,audio_end_seconds:document.getElementById(`group-audio-end-${groupId}`)?.value?Number(document.getElementById(`group-audio-end-${groupId}`).value):null,configuration:cfg};
    try{
        const {error}=await supabaseClient.from("question_groups").update(payload).eq("id",groupId); if(error) throw error;
        const bank = Array.from(document.querySelectorAll(`.group-option-input[data-group-id="${groupId}"]`)).map((input,i)=>({group_id:groupId,option_key:optionKeyV2(i),option_text:input.value.trim(),sort_order:i+1,metadata:{}})).filter(x=>x.option_text);
        await supabaseClient.from("question_group_options").delete().eq("group_id",groupId);
        if(bank.length){const {error:oErr}=await supabaseClient.from("question_group_options").insert(bank);if(oErr)throw oErr;}
        alert("Question Group saved."); await editAdminTest(adminCurrentTest.id);
    }catch(e){alert("Could not save group: "+(e.message||"Unknown error"));}
}

async function addAdminQuestionGroup(sectionId) {
    const sectionGroups=adminCurrentGroups.filter(g=>g.section_id===sectionId);
    const nextOrder=sectionGroups.length?Math.max(...sectionGroups.map(g=>Number(g.group_order||0)))+1:1;
    const prior=sectionGroups.sort((a,b)=>Number(a.group_order)-Number(b.group_order)).at(-1);
    const start=prior?Number(prior.end_question)+1:1;
    const {error}=await supabaseClient.from("question_groups").insert({section_id:sectionId,group_order:nextOrder,start_question:start,end_question:start,question_type:"short_answer",instructions:"",content:"",configuration:{}});
    if(error)return alert("Could not add Question Group: "+error.message); await editAdminTest(adminCurrentTest.id);
}

async function addAdminQuestionToGroup(groupId) {
    const g=adminCurrentGroups.find(x=>x.id===groupId); if(!g)return;
    const qs=groupQuestionsV2(g,adminCurrentQuestions); const next=qs.length?Math.max(...qs.map(q=>Number(q.question_number||0)))+1:Number(g.start_question||1);
    const {data,error}=await supabaseClient.from("questions").insert({section_id:g.section_id,group_id:g.id,question_number:next,question_order:qs.length+1,question_type:normalizeQuestionTypeV2(g.question_type),question_text:"",marks:1,correct_answer:"",accepted_answers:[],question_config:{},explanation:"",image_url:null}).select().single();
    if(error)return alert("Could not add question: "+error.message); await editAdminTest(adminCurrentTest.id); setTimeout(()=>document.getElementById(`admin-q-${data.id}`)?.scrollIntoView({behavior:"smooth",block:"center"}),100);
}

async function duplicateAdminQuestionV2(qid) {
    const q=adminCurrentQuestions.find(x=>x.id===qid); if(!q)return;
    const {id,created_at,options,...copy}=q; copy.question_number=Number(q.question_number)+1; copy.question_order=Number(q.question_order||q.question_number)+1;
    const {data:newQ,error}=await supabaseClient.from("questions").insert(copy).select().single(); if(error)return alert(error.message);
    if(q.options?.length){const rows=q.options.map((o,i)=>({question_id:newQ.id,option_key:o.option_key,option_text:o.option_text,is_correct:o.is_correct,sort_order:i+1,metadata:o.metadata||{}})); const {error:oErr}=await supabaseClient.from("options").insert(rows); if(oErr)return alert(oErr.message);}
    await editAdminTest(adminCurrentTest.id);
}
async function moveAdminQuestionV2(qid,delta){
    const q=adminCurrentQuestions.find(x=>x.id===qid); if(!q)return; const g=adminCurrentGroups.find(x=>x.id===q.group_id); if(!g)return;
    const qs=groupQuestionsV2(g,adminCurrentQuestions); const i=qs.findIndex(x=>x.id===qid), j=i+delta; if(j<0||j>=qs.length)return;
    const a=qs[i],b=qs[j]; const ao=Number(a.question_order||i+1),bo=Number(b.question_order||j+1); await supabaseClient.from("questions").update({question_order:bo}).eq("id",a.id); await supabaseClient.from("questions").update({question_order:ao}).eq("id",b.id); await editAdminTest(adminCurrentTest.id);
}

function openMapMarkerPickerV2(groupId,qid){
    const g=adminCurrentGroups.find(x=>x.id===groupId); if(!g)return; const src=document.getElementById(`group-image-${groupId}`)?.value||g.image_url; if(!src)return alert("Add/Upload the map image first.");
    const modal=document.createElement("div"); modal.id="map-picker-v2"; modal.style="position:fixed;inset:0;background:rgba(15,23,42,.75);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px"; modal.innerHTML=`<div style="background:white;max-width:1000px;width:100%;max-height:90vh;overflow:auto;padding:16px;border-radius:12px"><div style="display:flex;justify-content:space-between;align-items:center"><strong>Click the exact answer marker position</strong><button type="button" onclick="document.getElementById('map-picker-v2').remove()">Close</button></div><div style="position:relative;display:inline-block;margin-top:12px"><img id="map-picker-image-v2" src="${escAttr(src)}" style="max-width:100%;display:block;cursor:crosshair"></div></div>`; document.body.appendChild(modal);
    const img=modal.querySelector("#map-picker-image-v2"); img.addEventListener("click",e=>{const r=img.getBoundingClientRect();const x=((e.clientX-r.left)/r.width*100).toFixed(2),y=((e.clientY-r.top)/r.height*100).toFixed(2); const xi=document.getElementById(`q-marker-x-${qid}`),yi=document.getElementById(`q-marker-y-${qid}`);if(xi)xi.value=x;if(yi)yi.value=y;modal.remove();});
}

async function previewAdminGroupV2(groupId){
    if(!adminCurrentTest)return; await openStudentTestPreview(adminCurrentTest.id); const g=studentTestState?.data?.groups?.find(x=>x.id===groupId); if(g){const idx=studentTestState.data.sections.findIndex(s=>s.id===g.section_id);if(idx>=0){studentTestState.currentSection=idx;renderStudentTestRunner();}}
}

async function validateListeningTestV2(testId) {
    const data=await loadStudentTestData(testId); const errors=[];
    if(data.test.module!=="listening") return errors;
    for(const s of data.sections){
        const gs=data.groups.filter(g=>g.section_id===s.id); if(!gs.length)errors.push(`Part ${s.section_number}: no Question Group.`);
        for(const g of gs){
            const type=normalizeQuestionTypeV2(g.question_type), qs=groupQuestionsV2(g,data.questions), cfg=safeJson(g.configuration,{});
            if(Number(g.end_question)<Number(g.start_question))errors.push(`Part ${s.section_number}: invalid range ${g.start_question}-${g.end_question}.`);
            if(!qs.length)errors.push(`Questions ${g.start_question}-${g.end_question}: no questions/items added.`);
            if(type==="map_labelling" && !g.image_url && !cfg.image_url)errors.push(`Questions ${g.start_question}-${g.end_question}: map/diagram image is required.`);
            for(const q of qs){
                if(!String(q.question_text||"").trim())errors.push(`Q${q.question_number}: question/prompt is empty.`);
                if(type==="multiple_choice"){
                    const mode=safeJson(q.question_config,{}).mode||cfg.mcq_mode||"single"; const correct=(q.options||[]).filter(o=>o.is_correct); const req=Number(safeJson(q.question_config,{}).answers_required||1);
                    if(!(q.options||[]).length)errors.push(`Q${q.question_number}: MCQ options missing.`); if(mode==="single"&&correct.length!==1)errors.push(`Q${q.question_number}: select exactly one correct option.`); if(mode==="multiple"&&correct.length!==req)errors.push(`Q${q.question_number}: correct answer count must be ${req}.`);
                } else if(type==="matching" && !String(q.correct_answer||"").trim()) errors.push(`Q${q.question_number}: matching answer missing.`);
                else if(type==="map_labelling" && !String(q.correct_answer||"").trim()) errors.push(`Q${q.question_number}: map answer missing.`);
                else if(type==="summary_completion"&&cfg.summary_mode==="options"&&!String(q.correct_answer||"").trim())errors.push(`Q${q.question_number}: summary option answer missing.`);
                else if(!["matching","multiple_choice"].includes(type)&&!String(q.correct_answer||"").trim())errors.push(`Q${q.question_number}: correct answer missing.`);
            }
        }
    }
    return errors;
}

async function toggleAdminTestPublish(id,publish){
    try{
        if(publish){const errors=await validateListeningTestV2(id); if(errors.length){alert("Test cannot be published yet:\n\n"+errors.slice(0,30).map(x=>"• "+x).join("\n"));return;}}
        const {error}=await supabaseClient.from("tests").update({is_published:!!publish}).eq("id",id); if(error)throw error; await openTestManager(adminTestModuleFilter||"all");
    }catch(e){alert("Could not update publish status: "+(e.message||"Unknown error"));}
}

// Make sure the newer implementations are used by inline handlers.
window.addAdminQuestionGroup=addAdminQuestionGroup;
window.saveAdminQuestionGroup=saveAdminQuestionGroup;
window.addAdminQuestionToGroup=addAdminQuestionToGroup;
window.saveAdminQuestion=saveAdminQuestion;
window.addAdminOption=addAdminOption;
window.renumberAdminOptions=renumberAdminOptions;
window.changeAdminGroupTypeV2=changeAdminGroupTypeV2;
window.changeSummaryModeV2=changeSummaryModeV2;
window.uploadGroupImageV2=uploadGroupImageV2;
window.duplicateAdminQuestionV2=duplicateAdminQuestionV2;
window.moveAdminQuestionV2=moveAdminQuestionV2;
window.openMapMarkerPickerV2=openMapMarkerPickerV2;
window.previewAdminGroupV2=previewAdminGroupV2;
window.toggleAdminTestPublish=toggleAdminTestPublish;
window.submitStudentTest=submitStudentTest;

// ---- V2 patch: option bank rows + listening-focused test editor ----------------
function adminGroupOptionRowV2(groupId,index,key,value){
    return `<div class="grid" style="grid-template-columns:70px 1fr 90px;align-items:end;margin:6px 0" data-group-option-row="${groupId}"><label>Key<input class="group-option-key" value="${escAttr(key||optionKeyV2(index))}"></label><label>Option<input class="group-option-text" value="${escAttr(value||"")}" placeholder="Option ${index+1}"></label><button type="button" onclick="removeAdminGroupOption(this)">Remove</button></div>`;
}
function renderGroupOptionBankV2(g,title){
    const opts=g.options||[];
    return `<div style="margin-top:10px"><div style="display:flex;justify-content:space-between;align-items:center"><strong>${escapeHtml(title)}</strong><button type="button" onclick="addAdminGroupOption('${g.id}')">+ Add Option</button></div><div id="group-option-list-${g.id}">${opts.length?opts.map((o,i)=>adminGroupOptionRowV2(g.id,i,o.option_key,o.option_text)).join(""):adminGroupOptionRowV2(g.id,0,"A","")}</div></div>`;
}
function addAdminGroupOption(groupId){
    const list=document.getElementById(`group-option-list-${groupId}`); if(!list)return; const i=list.querySelectorAll(`[data-group-option-row="${groupId}"]`).length; list.insertAdjacentHTML("beforeend",adminGroupOptionRowV2(groupId,i,optionKeyV2(i),""));
}
async function saveAdminQuestionGroup(groupId){
    const g=adminCurrentGroups.find(x=>x.id===groupId); if(!g)return;
    const type=document.getElementById(`group-type-${groupId}`)?.value||"short_answer";
    const start=Number(document.getElementById(`group-start-${groupId}`)?.value||1),end=Number(document.getElementById(`group-end-${groupId}`)?.value||start);
    if(end<start)return alert("End Question No. must be greater than or equal to Start Question No.");
    let cfg={};
    if(type==="multiple_choice")cfg={mcq_mode:document.getElementById(`group-mcq-mode-${groupId}`)?.value||"single",answers_required:Number(document.getElementById(`group-mcq-required-${groupId}`)?.value||1)};
    if(type==="matching")cfg={allow_repeat:!!document.getElementById(`group-match-repeat-${groupId}`)?.checked};
    if(type==="map_labelling")cfg={answer_mode:document.getElementById(`group-map-mode-${groupId}`)?.value||"text",image_url:document.getElementById(`group-image-${groupId}`)?.value.trim()||null};
    if(type==="completion")cfg={completion_format:document.getElementById(`group-completion-format-${groupId}`)?.value||"note"};
    if(type==="summary_completion")cfg={summary_mode:document.getElementById(`group-summary-mode-${groupId}`)?.value||"typed"};
    const payload={group_title:document.getElementById(`group-title-${groupId}`)?.value.trim()||null,start_question:start,end_question:end,question_type:type,instructions:document.getElementById(`group-inst-${groupId}`)?.value||"",content:document.getElementById(`group-content-${groupId}`)?.value||"",image_url:document.getElementById(`group-image-${groupId}`)?.value.trim()||g.image_url||null,audio_start_seconds:document.getElementById(`group-audio-start-${groupId}`)?.value?Number(document.getElementById(`group-audio-start-${groupId}`).value):null,audio_end_seconds:document.getElementById(`group-audio-end-${groupId}`)?.value?Number(document.getElementById(`group-audio-end-${groupId}`).value):null,configuration:cfg};
    try{
        const {error}=await supabaseClient.from("question_groups").update(payload).eq("id",groupId); if(error)throw error;
        const bank=Array.from(document.querySelectorAll(`[data-group-option-row="${groupId}"]`)).map((row,i)=>({group_id:groupId,option_key:row.querySelector(".group-option-key")?.value.trim()||optionKeyV2(i),option_text:row.querySelector(".group-option-text")?.value.trim()||"",sort_order:i+1,metadata:{}})).filter(x=>x.option_text);
        await supabaseClient.from("question_group_options").delete().eq("group_id",groupId);
        if(bank.length){const {error:oErr}=await supabaseClient.from("question_group_options").insert(bank);if(oErr)throw oErr;}
        alert("Question Group saved."); await editAdminTest(adminCurrentTest.id);
    }catch(e){alert("Could not save group: "+(e.message||"Unknown error"));}
}

async function renderAdminTestEditor(){
    const body=document.getElementById("adminModuleBody"); if(!body||!adminCurrentTest)return;
    const isListening=adminCurrentTest.module==="listening",isReading=adminCurrentTest.module==="reading";
    const typeMap=isListening?LISTENING_QUESTION_TYPES:READING_QUESTION_TYPES;
    body.innerHTML=`
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        <button type="button" class="save-button" onclick="saveAdminTestHeader()">💾 Save Test Details</button>
        <button type="button" onclick="openStudentTestPreview('${adminCurrentTest.id}')">👁 Preview Student View</button>
        ${isListening?`<button type="button" onclick="validateCurrentListeningTestV2()">✓ Validate Test</button>`:`<button type="button" onclick="addAdminQuestion()">+ Add Question</button>`}
        <button type="button" class="danger" onclick="deleteAdminTest('${adminCurrentTest.id}')">Delete Entire Test</button>
        <button type="button" class="cancel-button" onclick="openTestManager('${adminCurrentTest.module}')">← Back to Tests</button>
      </div>
      <div class="student-form"><h3>Test Details</h3><label>Title<input id="editTestTitle" value="${escAttr(adminCurrentTest.title||"")}"></label><label>Module<select id="editTestModule" disabled><option>${escapeHtml(adminCurrentTest.module)}</option></select></label><label>Description<textarea id="editTestDescription">${escapeHtml(adminCurrentTest.description||"")}</textarea></label><div class="grid"><label>Duration (minutes)<input id="editTestDuration" type="number" min="1" value="${Number(adminCurrentTest.duration_minutes||0)}"></label><label>Total Questions<input id="editTestTotal" type="number" min="1" value="${Number(adminCurrentTest.total_questions||0)}"></label></div><label><input id="editTestPublished" type="checkbox" ${adminCurrentTest.is_published?"checked":""}> Published</label></div>
      <hr><h3>${isListening?"🎧 Listening Parts":isReading?"📖 Reading Passages":"✍️ Writing Section"}</h3>
      <div id="adminSections">${adminCurrentSections.map((s,idx)=>adminSectionEditor(s,idx,isListening,isReading)).join("")}</div>
      ${isListening?`<div style="padding:12px;background:#eef6ff;border-radius:8px;margin-top:14px"><strong>Dynamic Builder:</strong> Add a Question Group inside each Part. Choose the question type there; only relevant fields are shown. Start/End question numbers remain manual.</div>`:`<hr><div style="display:flex;justify-content:space-between;align-items:center"><div><h3>Questions</h3><p class="muted">Add/edit questions.</p></div><button type="button" onclick="addAdminQuestion()">+ Add Question</button></div><div id="adminQuestions">${adminCurrentQuestions.map(q=>adminQuestionEditor(q,typeMap,isListening,isReading)).join("")}</div>`}`;
}

async function validateCurrentListeningTestV2(){
    if(!adminCurrentTest)return; try{const errors=await validateListeningTestV2(adminCurrentTest.id); if(errors.length)alert("Validation errors:\n\n"+errors.map(x=>"• "+x).join("\n")); else alert("Validation passed. This Listening Test is ready to publish.");}catch(e){alert(e.message||"Validation failed.");}
}
async function toggleAdminTestPublish(id,publish){
    try{if(publish){const errors=await validateListeningTestV2(id);if(errors.length){alert("Test cannot be published yet:\n\n"+errors.slice(0,30).map(x=>"• "+x).join("\n"));return;}}const {error}=await supabaseClient.from("tests").update({is_published:!!publish}).eq("id",id);if(error)throw error;await openTestManager(adminCurrentTest?.module||"all");}catch(e){alert("Could not update publish status: "+(e.message||"Unknown error"));}
}

window.addAdminGroupOption=addAdminGroupOption;
window.saveAdminQuestionGroup=saveAdminQuestionGroup;
window.validateCurrentListeningTestV2=validateCurrentListeningTestV2;
window.toggleAdminTestPublish=toggleAdminTestPublish;

// ---- V2 patch: Listening Part audio controls ---------------------------------
function adminSectionEditor(s,idx,isListening,isReading){
    const label=isListening?`Part ${s.section_number}`:isReading?`Passage ${s.section_number}`:"Writing Section";
    const groups=adminCurrentGroups.filter(g=>g.section_id===s.id).sort((a,b)=>Number(a.group_order||0)-Number(b.group_order||0));
    const ac=safeJson(s.audio_config,{});
    return `<div class="students-panel" style="margin:12px 0;padding:16px">
      <h4>${label}</h4><input type="hidden" id="sec-id-${s.id}" value="${s.id}">
      <label>Title<input id="sec-title-${s.id}" value="${escAttr(s.title||label)}"></label>
      <label>Part / Section Instructions<textarea id="sec-instructions-${s.id}" placeholder="General instructions">${escapeHtml(s.instructions||"")}</textarea></label>
      ${isListening?`<div style="padding:12px;background:#f8fafc;border-radius:8px;margin:10px 0"><strong>Audio Configuration</strong><label>Audio URL<input id="sec-audio-${s.id}" value="${escAttr(s.audio_url||"")}" placeholder="https://..."></label><label>Upload Audio<input id="sec-audio-file-${s.id}" type="file" accept="audio/*" onchange="uploadSectionAudioV2('${s.id}',this)"></label><div style="display:flex;gap:14px;flex-wrap:wrap"><label><input id="sec-audio-controlled-${s.id}" type="checkbox" ${ac.controlled?"checked":""}> Controlled IELTS-style playback (no seeking/rewind)</label><label><input id="sec-audio-play-${s.id}" type="checkbox" ${ac.allow_play!==false?"checked":""}> Allow playback</label></div><div id="sec-audio-meta-${s.id}" class="muted">${ac.duration_seconds?`Detected duration: ${Math.round(Number(ac.duration_seconds))} sec`:"Duration will be detected when an uploaded/local audio file is selected."}</div></div>`:""}
      <label>${isReading?"Passage Content":"Part Content / Notes"}<textarea id="sec-content-${s.id}" style="min-height:120px">${escapeHtml(s.content||"")}</textarea></label>
      <label>Image URL (optional)<input id="sec-image-${s.id}" value="${escAttr(s.image_url||"")}" placeholder="https://..."></label>
      <button type="button" onclick="saveAdminSection('${s.id}')">Save ${label}</button>
      <div style="margin-top:22px;border-top:1px solid #e5e7eb;padding-top:16px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div><h4 style="margin:0">Question Groups</h4><small class="muted">Start and End question numbers are manual. Question Type controls the editor below.</small></div><button type="button" class="save-button" onclick="addAdminQuestionGroup('${s.id}')">+ Add Question Group</button></div><div style="margin-top:12px">${groups.length?groups.map(g=>adminQuestionGroupEditor(g,label)).join(""):`<div style="padding:14px;background:#f8fafc;border-radius:8px;margin-top:10px">No question groups yet.</div>`}</div></div>
    </div>`;
}

async function uploadSectionAudioV2(sectionId,input){
    const file=input?.files?.[0]; if(!file)return;
    try{
        const meta=document.getElementById(`sec-audio-meta-${sectionId}`);
        const temp=URL.createObjectURL(file),audio=new Audio(temp);
        audio.addEventListener("loadedmetadata",()=>{ if(meta)meta.textContent=`Detected duration: ${Math.round(audio.duration)} sec`; input.dataset.duration=String(audio.duration||0); URL.revokeObjectURL(temp); },{once:true});
        const ext=(file.name.split(".").pop()||"mp3").toLowerCase(),path=`parts/${sectionId}-${Date.now()}.${ext}`;
        const {error}=await supabaseClient.storage.from("listening-audio").upload(path,file,{upsert:true}); if(error)throw error;
        const {data}=supabaseClient.storage.from("listening-audio").getPublicUrl(path); const field=document.getElementById(`sec-audio-${sectionId}`); if(field)field.value=data?.publicUrl||"";
        alert("Audio uploaded. Save this Part to store the URL.");
    }catch(e){alert("Audio upload failed: "+(e.message||"Unknown error")+"\nYou can paste an Audio URL manually.");}
}

async function saveAdminSection(sectionId){
    const audioInput=document.getElementById(`sec-audio-file-${sectionId}`);
    const payload={title:document.getElementById(`sec-title-${sectionId}`)?.value.trim(),instructions:document.getElementById(`sec-instructions-${sectionId}`)?.value||"",content:document.getElementById(`sec-content-${sectionId}`)?.value||"",image_url:document.getElementById(`sec-image-${sectionId}`)?.value.trim()||null,audio_url:document.getElementById(`sec-audio-${sectionId}`)?.value.trim()||null,audio_config:{controlled:!!document.getElementById(`sec-audio-controlled-${sectionId}`)?.checked,allow_play:document.getElementById(`sec-audio-play-${sectionId}`)?.checked!==false,duration_seconds:Number(audioInput?.dataset?.duration||0)||undefined}};
    const {error}=await supabaseClient.from("sections").update(payload).eq("id",sectionId); if(error)return alert(error.message); alert("Section saved successfully."); await editAdminTest(adminCurrentTest.id);
}

function renderStudentTestRunner(){
    const app=document.getElementById("app"),state=studentTestState;if(!app||!state?.data)return;const {test,sections}=state.data,s=sections[state.currentSection];if(!s)return;
    const isListening=test.module==="listening",isReading=test.module==="reading";const sectionQuestions=state.data.questions.filter(q=>q.section_id===s.id).sort((a,b)=>Number(a.question_number)-Number(b.question_number));const sectionGroups=state.data.groups.filter(g=>g.section_id===s.id).sort((a,b)=>Number(a.group_order)-Number(b.group_order));const ac=safeJson(s.audio_config,{});
    app.innerHTML=`<div class="dashboard"><header class="dashboard-header"><div><h1>${escapeHtml(test.title)}</h1><p>${state.preview?"Student View Preview":"Student Test"}</p></div><div class="user-area"><button type="button" onclick="exitStudentTest()">← ${state.preview?"Back to Admin":"Dashboard"}</button></div></header><main class="dashboard-content">${state.preview?`<div style="padding:10px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;margin-bottom:14px"><strong>Preview Mode:</strong> This uses the same renderer as the Student Test.</div>`:""}<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">${sections.map((sec,i)=>`<button type="button" class="${i===state.currentSection?"save-button":"cancel-button"}" onclick="switchStudentSection(${i})">${isListening?"Part":isReading?"Passage":"Section"} ${i+1}</button>`).join("")}</div><div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,1fr);gap:16px;align-items:start"><section style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px;position:sticky;top:10px;max-height:calc(100vh - 100px);overflow:auto">${isListening&&s.audio_url&&ac.allow_play!==false?`<audio id="student-audio-v2" controls ${ac.controlled?`controlsList="nodownload noplaybackrate"`:""} style="width:100%;margin-bottom:14px" src="${escAttr(s.audio_url)}"></audio>`:""}<h2>${escapeHtml(s.title||`${isListening?"Part":"Section"} ${s.section_number}`)}</h2>${s.instructions?`<div style="padding:12px;background:#fff7df;border-radius:8px;white-space:pre-wrap;margin:12px 0"><strong>Instructions</strong><br>${escapeHtml(s.instructions)}</div>`:""}${s.image_url?`<img src="${escAttr(s.image_url)}" alt="Section image" style="max-width:100%;border-radius:8px;margin:10px 0">`:""}${s.content?`<div style="white-space:pre-wrap;line-height:1.7">${escapeHtml(s.content)}</div>`:""}${sectionGroups.map(g=>renderStudentGroupContent(g,sectionQuestions)).join("")}</section><section style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px;max-height:calc(100vh - 100px);overflow:auto"><h2>Questions</h2>${sectionGroups.length?sectionGroups.map(g=>renderStudentQuestionGroup(g,sectionQuestions)).join(""):sectionQuestions.map(q=>renderStudentQuestion(q)).join("")}${!sectionQuestions.length?`<div class="coming-soon">No questions have been added to this section yet.</div>`:""}</section></div><div style="display:flex;justify-content:space-between;gap:10px;margin-top:16px"><button type="button" class="cancel-button" ${state.currentSection===0?"disabled":""} onclick="switchStudentSection(${state.currentSection-1})">← Previous</button>${state.currentSection<sections.length-1?`<button type="button" class="save-button" onclick="switchStudentSection(${state.currentSection+1})">Next →</button>`:state.preview?`<button type="button" class="save-button" onclick="exitStudentTest()">Finish Preview</button>`:`<button type="button" class="save-button" onclick="submitStudentTest()">Submit Test</button>`}</div></main></div>`;
    if(isListening&&ac.controlled)setTimeout(initControlledAudioV2,0);
}
function initControlledAudioV2(){const a=document.getElementById("student-audio-v2");if(!a)return;let furthest=0;a.addEventListener("timeupdate",()=>{if(!a.seeking&&a.currentTime>furthest)furthest=a.currentTime;});a.addEventListener("seeking",()=>{if(Math.abs(a.currentTime-furthest)>0.75)a.currentTime=furthest;});}

window.uploadSectionAudioV2=uploadSectionAudioV2;
window.saveAdminSection=saveAdminSection;


/* ============================================================
   UNIVERSAL EDUCATION IELTS - MASTER PLATFORM V3 OVERLAY
   Integrates Reading + Listening + Writing into the existing app.
   This block intentionally reuses the existing auth/student/test services.
   ============================================================ */

const IELTS_V3_READING_TYPES = {
  reading_multiple_choice:'Multiple Choice', reading_true_false_not_given:'True / False / Not Given',
  reading_yes_no_not_given:'Yes / No / Not Given', reading_matching_headings:'Matching Headings',
  reading_matching_information:'Matching Information / Paragraph Information', reading_matching_features:'Matching Features',
  reading_matching_sentence_endings:'Matching Sentence Endings', reading_sentence_completion:'Sentence Completion',
  reading_summary_completion:'Summary Completion', reading_note_completion:'Note Completion', reading_table_completion:'Table Completion',
  reading_flowchart_completion:'Flow-chart Completion', reading_diagram_completion:'Diagram Label Completion',
  reading_short_answer:'Short Answer Questions', reading_title_selection:'Choosing a Title', reading_list_selection:'List Selection'
};
const IELTS_V3_LISTENING_TYPES = {
  listening_multiple_choice:'Multiple Choice', listening_matching:'Matching', listening_map_labelling:'Plan / Map Labelling',
  listening_diagram_labelling:'Diagram Labelling', listening_form_completion:'Form Completion', listening_note_completion:'Note Completion',
  listening_table_completion:'Table Completion', listening_flowchart_completion:'Flow-chart Completion', listening_sentence_completion:'Sentence Completion',
  listening_summary_completion:'Summary Completion', listening_short_answer:'Short Answer Questions', listening_list_selection:'List Selection'
};
const IELTS_V3_ALL_TYPES={...IELTS_V3_READING_TYPES,...IELTS_V3_LISTENING_TYPES};
const IELTS_V3_WRITING_TASKS={task1:'Writing Task 1',task2:'Writing Task 2'};

function v3Json(v,d={}){try{return v?JSON.parse(v):d}catch{return d}}
function v3Arr(v){return Array.isArray(v)?v:[]}
function v3Esc(v){return typeof escapeHtml==='function'?escapeHtml(v??''):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function v3Attr(v){return v3Esc(v).replace(/`/g,'&#96;')}
function v3Lines(v){return String(v||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean)}
function v3OptionKey(i){let n=i+1,s='';while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)}return s}
function v3TypeLabel(type){return IELTS_V3_ALL_TYPES[type]||type||'Question'}
function v3IsTyped(type){return /completion|short_answer|map_labelling|diagram_labelling/.test(type)}
function v3GroupQuestions(g){return (adminCurrentQuestions||[]).filter(q=>q.group_id===g.id || (q.section_id===g.section_id && Number(q.question_number)>=Number(g.start_question) && Number(q.question_number)<=Number(g.end_question))).sort((a,b)=>Number(a.question_order||a.question_number)-Number(b.question_order||b.question_number))}

/* ---------- Unified test creation ---------- */
async function createAdminTest(){
  const title=document.getElementById('newTestTitle')?.value.trim();
  const module=document.getElementById('newTestModule')?.value;
  const description=document.getElementById('newTestDescription')?.value||'';
  const duration=Number(document.getElementById('newTestDuration')?.value||60);
  const total=Number(document.getElementById('newTestTotal')?.value||(module==='writing'?2:40));
  if(!title||!module)return alert('Please enter Test Title and Module.');
  const {data:test,error}=await supabaseClient.from('tests').insert({title,module,description,duration_minutes:duration,total_questions:total,is_published:false,settings:{platform_version:'v3'}}).select().single();
  if(error)return alert(error.message);
  const count=module==='reading'?3:module==='listening'?4:2;
  const rows=[];
  for(let i=1;i<=count;i++) rows.push({test_id:test.id,section_number:i,title:module==='reading'?`Passage ${i}`:module==='listening'?`Part ${i}`:`Part ${i}`,instructions:'',content:'',audio_url:null,image_url:null,audio_config:{}});
  const {data:sections,error:se}=await supabaseClient.from('sections').insert(rows).select();
  if(se){await supabaseClient.from('tests').delete().eq('id',test.id);return alert(se.message)}
  if(module==='writing'){
    const tasks=[{test_id:test.id,part:1,task_type:'task1',instructions:'You should spend about 20 minutes on this task.',prompt:'',minimum_words:150,maximum_words:null,suggested_time:20,media:[]},{test_id:test.id,part:2,task_type:'task2',instructions:'You should spend about 40 minutes on this task.',prompt:'',minimum_words:250,maximum_words:null,suggested_time:40,media:[]}];
    const {error:we}=await supabaseClient.from('writing_tasks').insert(tasks); if(we)alert('Test created, but Writing Tasks could not be initialized: '+we.message);
  }
  await editAdminTest(test.id);
}

/* ---------- Load richer editor data ---------- */
async function editAdminTest(id){
  const message=document.getElementById('dashboardMessage'); if(!message)return;
  const {data:test,error:te}=await supabaseClient.from('tests').select('*').eq('id',id).single(); if(te)throw te;
  const {data:sections,error:se}=await supabaseClient.from('sections').select('*').eq('test_id',id).order('section_number'); if(se)throw se;
  const ids=(sections||[]).map(x=>x.id);
  let questions=[],groups=[];
  if(ids.length){
    const {data:q,error:qe}=await supabaseClient.from('questions').select('*').in('section_id',ids).order('question_number'); if(qe)throw qe; questions=q||[];
    const qids=questions.map(q=>q.id); if(qids.length){const {data:o,error:oe}=await supabaseClient.from('options').select('*').in('question_id',qids).order('sort_order');if(oe)throw oe;const m={};(o||[]).forEach(x=>(m[x.question_id]||=[]).push(x));questions=questions.map(q=>({...q,options:m[q.id]||[]}))}
    const {data:g,error:ge}=await supabaseClient.from('question_groups').select('*').in('section_id',ids).order('group_order'); if(ge)throw ge;groups=g||[];
    const gids=groups.map(g=>g.id);if(gids.length){const {data:o,error:oe}=await supabaseClient.from('question_group_options').select('*').in('group_id',gids).order('sort_order');if(oe)throw oe;const m={};(o||[]).forEach(x=>(m[x.group_id]||=[]).push(x));groups=groups.map(g=>({...g,options:m[g.id]||[]}))}
  }
  let writingTasks=[]; if(test.module==='writing'){const {data:w,error:we}=await supabaseClient.from('writing_tasks').select('*').eq('test_id',id).order('part');if(we)throw we;writingTasks=w||[];}
  adminCurrentTest=test;adminCurrentSections=sections||[];adminCurrentQuestions=questions;adminCurrentGroups=groups;window.__v3WritingTasks=writingTasks;
  message.innerHTML=adminModuleBox(`Edit: ${test.title}`,`${test.module.toUpperCase()} • Master Builder`);
  await renderAdminTestEditor();
}

/* ---------- Type-specific group editor ---------- */
function v3TypeFields(g){
  const type=g.question_type||''; const cfg=v3Json(g.configuration,{}); const opts=g.options||[];
  const optionBank=()=>`<div class="v3-box"><div class="v3-row"><strong>Answer / Option Bank</strong><button type="button" onclick="v3AddBankOption('${g.id}')">+ Add Option</button></div><div id="v3-bank-${g.id}">${(opts.length?opts:[{option_key:'A',option_text:''}]).map((o,i)=>`<div class="v3-bank-row" data-g="${g.id}"><input class="v3-bank-key" value="${v3Attr(o.option_key||v3OptionKey(i))}" style="max-width:70px"><input class="v3-bank-text" value="${v3Attr(o.option_text||'')}" placeholder="Option text"><button type="button" onclick="this.parentElement.remove()">Remove</button></div>`).join('')}</div></div>`;
  if(type==='listening_multiple_choice'||type==='reading_multiple_choice')return `<div class="v3-box"><div class="v3-grid"><label>Mode<select id="v3-mode-${g.id}"><option value="single" ${(cfg.mode||'single')==='single'?'selected':''}>Single Answer</option><option value="multiple" ${cfg.mode==='multiple'?'selected':''}>Multiple Answers</option></select></label><label>Answers Required<input id="v3-required-${g.id}" type="number" min="1" value="${Number(cfg.answers_required||1)}"></label><label><input id="v3-random-${g.id}" type="checkbox" ${cfg.randomize?'checked':''}> Randomize Options</label><label><input id="v3-letters-${g.id}" type="checkbox" ${cfg.show_letters!==false?'checked':''}> Show Option Letters</label></div>${optionBank()}</div>`;
  if(['listening_matching','reading_matching_headings','reading_matching_information','reading_matching_features','reading_matching_sentence_endings'].includes(type))return `<div class="v3-box"><div class="v3-grid"><label><input id="v3-repeat-${g.id}" type="checkbox" ${cfg.allow_repeat?'checked':''}> Allow option reuse</label><label><input id="v3-random-${g.id}" type="checkbox" ${cfg.randomize!==false?'checked':''}> Randomize answer options</label></div>${optionBank()}<p class="muted">Create individual items below and set each item's correct option in its question editor.</p></div>`;
  if(['listening_map_labelling','listening_diagram_labelling','reading_diagram_completion'].includes(type))return `<div class="v3-box"><div class="v3-grid"><label>Image URL<input id="v3-image-${g.id}" value="${v3Attr(g.image_url||cfg.image_url||'')}" placeholder="https://..."></label><label>Answer Mode<select id="v3-mapmode-${g.id}"><option value="text" ${cfg.answer_mode!=='option'?'selected':''}>Typed Answer</option><option value="option" ${cfg.answer_mode==='option'?'selected':''}>Select from Options</option></select></label></div><p class="muted">Use the question editor's “Place Marker” button to save responsive X/Y coordinates.</p>${optionBank()}</div>`;
  if(['listening_form_completion','listening_note_completion','listening_table_completion','listening_flowchart_completion','reading_note_completion','reading_table_completion','reading_flowchart_completion'].includes(type))return `<div class="v3-box"><label>Completion Format<select id="v3-format-${g.id}"><option value="form" ${cfg.format==='form'?'selected':''}>Form</option><option value="note" ${cfg.format==='note'?'selected':''}>Notes</option><option value="table" ${cfg.format==='table'?'selected':''}>Table</option><option value="flowchart" ${cfg.format==='flowchart'?'selected':''}>Flow Chart</option></select></label><p class="muted">Each blank is a separate question. Use the blank/question editor to configure accepted answers and word limits.</p></div>`;
  if(type==='listening_summary_completion'||type==='reading_summary_completion')return `<div class="v3-box"><label>Summary Mode<select id="v3-summary-${g.id}"><option value="typed" ${cfg.mode!=='options'?'selected':''}>Summary with Typed Blanks</option><option value="options" ${cfg.mode==='options'?'selected':''}>Summary with Answer Options</option></select></label>${cfg.mode==='options'?optionBank():''}</div>`;
  if(type==='listening_sentence_completion'||type==='reading_sentence_completion')return `<div class="v3-box"><p>Insert each blank as an individual question. Configure accepted alternatives, word limit and number format on each blank.</p></div>`;
  if(type==='listening_short_answer'||type==='reading_short_answer')return `<div class="v3-box"><p>Each short-answer question supports typed answer, alternatives, word limit, answer type and case sensitivity.</p></div>`;
  if(type==='reading_true_false_not_given'||type==='reading_yes_no_not_given')return `<div class="v3-box"><strong>Fixed student options:</strong> ${type==='reading_true_false_not_given'?'TRUE / FALSE / NOT GIVEN':'YES / NO / NOT GIVEN'}</div>`;
  if(type==='reading_title_selection'||type==='reading_list_selection')return `<div class="v3-box">${optionBank()}<p class="muted">Configure the required number of selections in the group settings or individual question.</p></div>`;
  return `<div class="v3-box"><p>Select a question type to load its dedicated configuration.</p></div>`;
}
function v3QuestionEditor(q,g){
  const cfg=v3Json(q.question_config,{}),type=g.question_type||q.question_type||''; const alt=v3Arr(q.accepted_answers).join('\n');
  const isMC=/multiple_choice$/.test(type); const fixed=type==='reading_true_false_not_given'||type==='reading_yes_no_not_given';
  const typed=v3IsTyped(type);
  const opts=q.options||[];
  let extra='';
  if(isMC){extra=`<div class="v3-box"><strong>Question Options</strong><div id="v3-qopts-${q.id}">${(opts.length?opts:[{option_key:'A',option_text:'',is_correct:false},{option_key:'B',option_text:'',is_correct:false},{option_key:'C',option_text:'',is_correct:false},{option_key:'D',option_text:'',is_correct:false}]).map((o,i)=>`<div class="v3-qopt" data-q="${q.id}"><input class="v3-qkey" value="${v3Attr(o.option_key||v3OptionKey(i))}" style="max-width:65px"><input class="v3-qtext" value="${v3Attr(o.option_text||'')}" placeholder="Option"><label><input class="v3-qcorrect" type="checkbox" ${o.is_correct?'checked':''}> Correct</label><button type="button" onclick="this.parentElement.remove()">Remove</button></div>`).join('')}</div><button type="button" onclick="v3AddQuestionOption('${q.id}')">+ Add Option</button></div>`}
  if(type==='listening_matching'||['reading_matching_headings','reading_matching_information','reading_matching_features','reading_matching_sentence_endings'].includes(type)){extra=`<div class="v3-box"><label>Correct Option / Mapping<input id="v3-qanswer-${q.id}" value="${v3Attr(q.correct_answer||'')}"></label><p class="muted">Use A/B/C or the configured heading/feature key.</p></div>`}
  if(fixed)extra=`<div class="v3-box"><label>Correct Answer<select id="v3-qanswer-${q.id}">${(type==='reading_true_false_not_given'?['TRUE','FALSE','NOT GIVEN']:['YES','NO','NOT GIVEN']).map(x=>`<option ${q.correct_answer===x?'selected':''}>${x}</option>`).join('')}</select></label></div>`;
  if(type==='reading_title_selection'||type==='reading_list_selection'||type==='listening_list_selection')extra=`<div class="v3-box"><label>Correct Answer(s)<input id="v3-qanswer-${q.id}" value="${v3Attr(q.correct_answer||'')}" placeholder="A||C||E"></label></div>`;
  if(typed){extra+=`<div class="v3-box"><div class="v3-grid"><label>Answer Type<select id="v3-qatype-${q.id}">${['text','number','date','time','name','letter','mixed'].map(x=>`<option value="${x}" ${cfg.answer_type===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Maximum Words<input id="v3-qwords-${q.id}" type="number" min="0" value="${Number(cfg.word_limit||0)||''}"></label><label>Character Limit<input id="v3-qchars-${q.id}" type="number" min="0" value="${Number(cfg.character_limit||0)||''}"></label><label>Number Format<select id="v3-qnumfmt-${q.id}"><option value="exact" ${cfg.number_format!=='numeric_equivalent'&&cfg.number_format!=='both'?'selected':''}>Exact</option><option value="numeric_equivalent" ${cfg.number_format==='numeric_equivalent'?'selected':''}>Numeric Equivalent</option><option value="both" ${cfg.number_format==='both'?'selected':''}>Both</option></select></label></div><label>Alternative Accepted Answers<textarea id="v3-qalt-${q.id}" placeholder="One alternative per line">${v3Esc(alt)}</textarea><div class="v3-checks"><label><input id="v3-qcase-${q.id}" type="checkbox" ${cfg.case_sensitive?'checked':''}> Case Sensitive</label><label><input id="v3-qpunct-${q.id}" type="checkbox" ${cfg.punctuation_sensitive?'checked':''}> Punctuation Sensitive</label><label><input id="v3-qspell-${q.id}" type="checkbox" ${cfg.allow_minor_spelling?'checked':''}> Allow minor spelling variation</label><label><input id="v3-qspace-${q.id}" type="checkbox" ${cfg.whitespace_normalization!==false?'checked':''}> Normalize whitespace</label></div></div>`}
  return `<div class="v3-question" id="v3-q-${q.id}"><div class="v3-row"><strong>Q${Number(q.question_number||0)} — ${v3TypeLabel(type)}</strong><div class="v3-actions"><button type="button" onclick="v3PreviewQuestion('${q.id}')">👁 Preview</button><button type="button" onclick="v3DuplicateQuestion('${q.id}')">Duplicate</button><button type="button" onclick="v3MoveQuestion('${q.id}',-1)">↑</button><button type="button" onclick="v3MoveQuestion('${q.id}',1)">↓</button><button type="button" class="danger" onclick="v3DeleteQuestion('${q.id}')">Delete</button></div></div><div class="v3-grid"><label>Question Number<input id="v3-qnum-${q.id}" type="number" min="1" value="${Number(q.question_number||1)}"></label><label>Marks<input id="v3-qmarks-${q.id}" type="number" min="0" step="0.5" value="${Number(q.marks||1)}"></label></div><label>Question / Blank / Statement<textarea id="v3-qtext-${q.id}" style="min-height:75px">${v3Esc(q.question_text||'')}</textarea></label>${extra}<label>Explanation (optional)<textarea id="v3-qexp-${q.id}">${v3Esc(q.explanation||'')}</textarea></label><button type="button" class="save-button" onclick="v3SaveQuestion('${q.id}')">💾 Save Question</button></div>`;
}
function adminQuestionGroupEditor(g,sectionLabel){
  const typeMap=adminCurrentTest?.module==='listening'?IELTS_V3_LISTENING_TYPES:IELTS_V3_READING_TYPES; const qs=v3GroupQuestions(g);
  const typeOptions=Object.entries(typeMap).map(([k,v])=>`<option value="${k}" ${g.question_type===k?'selected':''}>${v3Esc(v)}</option>`).join(''); const cfg=v3Json(g.configuration,{});
  return `<div class="v3-group"><div class="v3-row"><div><strong>${v3Esc(g.group_title||`Question Group ${g.group_order||1}`)}</strong><div class="muted">${v3Esc(sectionLabel)} • Questions ${Number(g.start_question)}–${Number(g.end_question)}</div></div><div class="v3-actions"><button type="button" onclick="v3AddQuestionToGroup('${g.id}')">+ Add Question</button><button type="button" class="danger" onclick="v3DeleteGroup('${g.id}')">Delete Group</button></div></div><div class="v3-grid"><label>Group Title<input id="v3-gt-${g.id}" value="${v3Attr(g.group_title||'')}" placeholder="e.g. Questions 1–5"></label><label>Start Question No.<input id="v3-gstart-${g.id}" type="number" min="1" value="${Number(g.start_question||1)}"></label><label>End Question No.<input id="v3-gend-${g.id}" type="number" min="1" value="${Number(g.end_question||1)}"></label><label>Group Order<input id="v3-gorder-${g.id}" type="number" min="1" value="${Number(g.group_order||1)}"></label><label>Question Type<select id="v3-gtype-${g.id}" onchange="v3RefreshGroupType('${g.id}')">${typeOptions}</select></label></div><label>Instructions<textarea id="v3-ginst-${g.id}" style="min-height:80px">${v3Esc(g.instructions||'')}</textarea></label><label>Group Content / Notes / Heading<textarea id="v3-gcontent-${g.id}" style="min-height:120px">${v3Esc(g.content||'')}</textarea></label><div class="v3-grid"><label>Image URL<input id="v3-gimage-${g.id}" value="${v3Attr(g.image_url||'')}"></label><label>Audio Start (sec)<input id="v3-gastart-${g.id}" type="number" min="0" step="0.1" value="${g.audio_start_seconds??''}"></label><label>Audio End (sec)<input id="v3-gaend-${g.id}" type="number" min="0" step="0.1" value="${g.audio_end_seconds??''}"></label></div><div id="v3-gtypepanel-${g.id}">${v3TypeFields(g)}</div><div class="v3-row"><button type="button" class="save-button" onclick="v3SaveGroup('${g.id}')">💾 Save Group + Options</button><span class="muted">${qs.length} question(s)</span></div><div id="v3-gquestions-${g.id}">${qs.map(q=>v3QuestionEditor(q,g)).join('')||'<div class="muted" style="padding:12px">No questions yet. Click + Add Question.</div>'}</div></div>`;
}
function v3RefreshGroupType(id){const g=adminCurrentGroups.find(x=>x.id===id);if(!g)return;g.question_type=document.getElementById(`v3-gtype-${id}`)?.value||g.question_type;const box=document.getElementById(`v3-gtypepanel-${id}`);if(box)box.innerHTML=v3TypeFields(g)}
async function v3SaveGroup(id){const g=adminCurrentGroups.find(x=>x.id===id);if(!g)return;const start=Number(document.getElementById(`v3-gstart-${id}`)?.value||0),end=Number(document.getElementById(`v3-gend-${id}`)?.value||0);if(!start||!end||end<start)return alert('Please enter a valid manual Start and End Question Number.');const type=document.getElementById(`v3-gtype-${id}`)?.value||g.question_type;const cfg={};if(/multiple_choice$/.test(type))Object.assign(cfg,{mode:document.getElementById(`v3-mode-${id}`)?.value||'single',answers_required:Number(document.getElementById(`v3-required-${id}`)?.value||1),randomize:!!document.getElementById(`v3-random-${id}`)?.checked,show_letters:document.getElementById(`v3-letters-${id}`)?.checked!==false});if(/matching/.test(type))Object.assign(cfg,{allow_repeat:!!document.getElementById(`v3-repeat-${id}`)?.checked,randomize:document.getElementById(`v3-random-${id}`)?.checked!==false});if(/map_labelling|diagram_labelling|diagram_completion/.test(type))Object.assign(cfg,{answer_mode:document.getElementById(`v3-mapmode-${id}`)?.value||'text',image_url:document.getElementById(`v3-image-${id}`)?.value.trim()||null});if(/completion/.test(type))cfg.format=document.getElementById(`v3-format-${id}`)?.value||cfg.format||'note';if(/summary_completion/.test(type))cfg.mode=document.getElementById(`v3-summary-${id}`)?.value||'typed';const payload={group_title:document.getElementById(`v3-gt-${id}`)?.value.trim()||null,start_question:start,end_question:end,group_order:Number(document.getElementById(`v3-gorder-${id}`)?.value||1),question_type:type,instructions:document.getElementById(`v3-ginst-${id}`)?.value||'',content:document.getElementById(`v3-gcontent-${id}`)?.value||'',image_url:document.getElementById(`v3-gimage-${id}`)?.value.trim()||null,audio_start_seconds:document.getElementById(`v3-gastart-${id}`)?.value?Number(document.getElementById(`v3-gastart-${id}`).value):null,audio_end_seconds:document.getElementById(`v3-gaend-${id}`)?.value?Number(document.getElementById(`v3-gaend-${id}`).value):null,configuration:cfg};const {error}=await supabaseClient.from('question_groups').update(payload).eq('id',id);if(error)return alert(error.message);const bank=Array.from(document.querySelectorAll(`#v3-bank-${id} .v3-bank-row`)).map((r,i)=>({group_id:id,option_key:r.querySelector('.v3-bank-key')?.value.trim()||v3OptionKey(i),option_text:r.querySelector('.v3-bank-text')?.value.trim()||'',sort_order:i+1,metadata:{}})).filter(x=>x.option_text);await supabaseClient.from('question_group_options').delete().eq('group_id',id);if(bank.length){const {error:e}=await supabaseClient.from('question_group_options').insert(bank);if(e)return alert(e.message)}alert('Question Group saved.');await editAdminTest(adminCurrentTest.id)}
async function v3AddBankOption(id){const box=document.getElementById(`v3-bank-${id}`);if(!box)return;const i=box.querySelectorAll('.v3-bank-row').length;box.insertAdjacentHTML('beforeend',`<div class="v3-bank-row"><input class="v3-bank-key" value="${v3OptionKey(i)}" style="max-width:70px"><input class="v3-bank-text" placeholder="Option text"><button type="button" onclick="this.parentElement.remove()">Remove</button></div>`)}
async function v3AddQuestionToGroup(id){const g=adminCurrentGroups.find(x=>x.id===id);if(!g)return;const qs=v3GroupQuestions(g);let n=qs.length?Math.max(...qs.map(q=>Number(q.question_number)))+1:Number(g.start_question);if(n>Number(g.end_question)){const ok=confirm(`Question ${n} is outside the current End Question ${g.end_question}. Extend the group to ${n}?`);if(!ok)return;await supabaseClient.from('question_groups').update({end_question:n}).eq('id',id)}const {data,error}=await supabaseClient.from('questions').insert({section_id:g.section_id,group_id:g.id,question_number:n,question_order:qs.length+1,question_type:g.question_type,question_text:'',marks:1,correct_answer:'',accepted_answers:[],question_config:{},explanation:'',image_url:null}).select().single();if(error)return alert(error.message);await editAdminTest(adminCurrentTest.id);setTimeout(()=>document.getElementById(`v3-q-${data.id}`)?.scrollIntoView({behavior:'smooth'}),100)}
async function v3AddQuestionOption(qid){const box=document.getElementById(`v3-qopts-${qid}`);if(!box)return;const i=box.querySelectorAll('.v3-qopt').length;box.insertAdjacentHTML('beforeend',`<div class="v3-qopt" data-q="${qid}"><input class="v3-qkey" value="${v3OptionKey(i)}" style="max-width:65px"><input class="v3-qtext" placeholder="Option"><label><input class="v3-qcorrect" type="checkbox"> Correct</label><button type="button" onclick="this.parentElement.remove()">Remove</button></div>`)}
async function v3SaveQuestion(qid){const q=adminCurrentQuestions.find(x=>x.id===qid);if(!q)return;const g=adminCurrentGroups.find(x=>x.id===q.group_id)||adminCurrentGroups.find(x=>x.section_id===q.section_id&&Number(q.question_number)>=Number(x.start_question)&&Number(q.question_number)<=Number(x.end_question));const type=g?.question_type||q.question_type;const correctEl=document.getElementById(`v3-qanswer-${qid}`);let correct=correctEl?.value?.trim()||q.correct_answer||'';let accepted=v3Lines(document.getElementById(`v3-qalt-${qid}`)?.value);let cfg=v3Json(q.question_config,{});if(/multiple_choice$/.test(type)){const rows=Array.from(document.querySelectorAll(`.v3-qopt[data-q="${qid}"]`));const opts=rows.map((r,i)=>({option_key:r.querySelector('.v3-qkey')?.value.trim()||v3OptionKey(i),option_text:r.querySelector('.v3-qtext')?.value.trim()||'',is_correct:!!r.querySelector('.v3-qcorrect')?.checked,sort_order:i+1,metadata:{}})).filter(x=>x.option_text);const mode=document.getElementById(`v3-mode-${g.id}`)?.value||v3Json(g.configuration,{}).mode||'single';const req=Number(document.getElementById(`v3-required-${g.id}`)?.value||v3Json(g.configuration,{}).answers_required||1);const good=opts.filter(x=>x.is_correct).map(x=>x.option_key);if(mode==='single'&&good.length!==1)return alert('Single Answer Multiple Choice requires exactly one correct option.');if(mode==='multiple'&&good.length!==req)return alert(`Multiple Answers requires exactly ${req} correct options.`);correct=good.join('||');cfg={...cfg,mode,answers_required:req,randomize:v3Json(g.configuration,{}).randomize,show_letters:v3Json(g.configuration,{}).show_letters};await supabaseClient.from('options').delete().eq('question_id',qid);if(opts.length){const {error}=await supabaseClient.from('options').insert(opts.map(o=>({question_id:qid,...o})));if(error)return alert(error.message)}}if(v3IsTyped(type)){cfg={...cfg,answer_type:document.getElementById(`v3-qatype-${qid}`)?.value||cfg.answer_type||'text',word_limit:Number(document.getElementById(`v3-qwords-${qid}`)?.value||0)||0,character_limit:Number(document.getElementById(`v3-qchars-${qid}`)?.value||0)||0,case_sensitive:!!document.getElementById(`v3-qcase-${qid}`)?.checked,punctuation_sensitive:!!document.getElementById(`v3-qpunct-${qid}`)?.checked,allow_minor_spelling:!!document.getElementById(`v3-qspell-${qid}`)?.checked,whitespace_normalization:document.getElementById(`v3-qspace-${qid}`)?.checked!==false,number_format:document.getElementById(`v3-qnumfmt-${qid}`)?.value||'exact'}}const payload={question_number:Number(document.getElementById(`v3-qnum-${qid}`)?.value||q.question_number),question_type:type,question_text:document.getElementById(`v3-qtext-${qid}`)?.value||'',marks:Number(document.getElementById(`v3-qmarks-${qid}`)?.value||1),correct_answer:correct,accepted_answers:accepted,question_config:cfg,explanation:document.getElementById(`v3-qexp-${qid}`)?.value||'',group_id:g?.id||q.group_id||null};const {error}=await supabaseClient.from('questions').update(payload).eq('id',qid);if(error)return alert(error.message);alert(`Question ${payload.question_number} saved.`);await editAdminTest(adminCurrentTest.id)}
async function v3DeleteQuestion(qid){if(!confirm('Delete this question?'))return;await supabaseClient.from('options').delete().eq('question_id',qid);const {error}=await supabaseClient.from('questions').delete().eq('id',qid);if(error)return alert(error.message);await editAdminTest(adminCurrentTest.id)}
async function v3DuplicateQuestion(qid){const q=adminCurrentQuestions.find(x=>x.id===qid);if(!q)return;const {data:n,error}=await supabaseClient.from('questions').insert({section_id:q.section_id,group_id:q.group_id,question_number:Number(q.question_number)+1,question_order:Number(q.question_order||q.question_number)+1,question_type:q.question_type,question_text:q.question_text,marks:q.marks,correct_answer:q.correct_answer,accepted_answers:q.accepted_answers||[],question_config:q.question_config||{},explanation:q.explanation,image_url:q.image_url}).select().single();if(error)return alert(error.message);if(q.options?.length){const {error:e}=await supabaseClient.from('options').insert(q.options.map((o,i)=>({question_id:n.id,option_key:o.option_key,option_text:o.option_text,is_correct:o.is_correct,sort_order:i+1,metadata:o.metadata||{}})));if(e)return alert(e.message)}await editAdminTest(adminCurrentTest.id)}
async function v3MoveQuestion(qid,delta){const q=adminCurrentQuestions.find(x=>x.id===qid),g=adminCurrentGroups.find(x=>x.id===q?.group_id);if(!q||!g)return;const qs=v3GroupQuestions(g),i=qs.findIndex(x=>x.id===qid),j=i+delta;if(j<0||j>=qs.length)return;const a=qs[i],b=qs[j];await supabaseClient.from('questions').update({question_order:Number(b.question_order||j+1),question_number:Number(b.question_number)}).eq('id',a.id);await supabaseClient.from('questions').update({question_order:Number(a.question_order||i+1),question_number:Number(a.question_number)}).eq('id',b.id);await editAdminTest(adminCurrentTest.id)}
async function v3DeleteGroup(id){if(!confirm('Delete this Question Group and its questions?'))return;await supabaseClient.from('questions').delete().eq('group_id',id);const {error}=await supabaseClient.from('question_groups').delete().eq('id',id);if(error)return alert(error.message);await editAdminTest(adminCurrentTest.id)}

/* ---------- Writing builder ---------- */
function v3WritingEditor(){const tasks=window.__v3WritingTasks||[];return `<div class="v3-writing-builder"><div class="v3-info">Writing Test: Part 1 and Part 2 • Total default 60 minutes • Task 1 minimum 150 words • Task 2 minimum 250 words.</div>${[1,2].map(part=>{const t=tasks.find(x=>Number(x.part)===part)||{part,task_type:part===1?'task1':'task2',instructions:part===1?'You should spend about 20 minutes on this task.':'You should spend about 40 minutes on this task.',prompt:'',minimum_words:part===1?150:250,maximum_words:null,suggested_time:part===1?20:40,media:[]};return `<div class="v3-writing-task"><div class="v3-row"><h3>Part ${part} — ${part===1?'Writing Task 1':'Writing Task 2'}</h3><button type="button" class="save-button" onclick="v3SaveWritingTask(${part})">💾 Save Part ${part}</button></div><input type="hidden" id="v3-wtask-id-${part}" value="${v3Attr(t.id||'')}"><label>Instructions<textarea id="v3-winst-${part}">${v3Esc(t.instructions||'')}</textarea></label><label>Task Prompt / Question<textarea id="v3-wprompt-${part}" style="min-height:130px">${v3Esc(t.prompt||'')}</textarea></label><div class="v3-grid"><label>Minimum Words<input id="v3-wmin-${part}" type="number" value="${Number(t.minimum_words||0)}"></label><label>Maximum Words (optional)<input id="v3-wmax-${part}" type="number" value="${Number(t.maximum_words||0)||''}"></label><label>Suggested Time (minutes)<input id="v3-wtime-${part}" type="number" value="${Number(t.suggested_time||0)}"></label></div>${part===1?`<div class="v3-box"><strong>Task 1 Visual</strong><label>Visual Type<select id="v3-wvisual-${part}"><option value="chart">Chart</option><option value="graph">Graph</option><option value="table">Table</option><option value="diagram">Diagram</option><option value="image">Image</option></select></label><label>Visual Image URL<input id="v3-wmedia-${part}" value="${v3Attr((t.media||[])[0]?.url||'')}"></label><label>Upload / Replace Visual<input type="file" accept="image/*" onchange="v3UploadWritingVisual(${part},this)"></label><div class="muted">Admin can replace or delete the visual. The student sees it on the left.</div></div>`:''}<div class="v3-box"><strong>Writing Evaluation Fields</strong><div class="v3-grid"><label>Task Achievement / Response<input id="v3-wa-${part}" type="number" min="0" max="9" step="0.5" value="${t.task_achievement??''}"></label><label>Coherence & Cohesion<input id="v3-wcc-${part}" type="number" min="0" max="9" step="0.5" value="${t.coherence_cohesion??''}"></label><label>Lexical Resource<input id="v3-wlr-${part}" type="number" min="0" max="9" step="0.5" value="${t.lexical_resource??''}"></label><label>Grammar<input id="v3-wgr-${part}" type="number" min="0" max="9" step="0.5" value="${t.grammar??''}"></label><label>Band<input id="v3-wband-${part}" type="number" min="0" max="9" step="0.5" value="${t.band_score??''}"></label></div></div></div>`}).join('')}</div>`}
async function v3EnsureWritingTasks(){if(!adminCurrentTest||adminCurrentTest.module!=='writing')return;const {data}=await supabaseClient.from('writing_tasks').select('*').eq('test_id',adminCurrentTest.id).order('part');if(!(data||[]).length){await supabaseClient.from('writing_tasks').insert([{test_id:adminCurrentTest.id,part:1,task_type:'task1',instructions:'You should spend about 20 minutes on this task.',prompt:'',minimum_words:150,suggested_time:20,media:[]},{test_id:adminCurrentTest.id,part:2,task_type:'task2',instructions:'You should spend about 40 minutes on this task.',prompt:'',minimum_words:250,suggested_time:40,media:[]}]);return v3EnsureWritingTasks()}window.__v3WritingTasks=data||[]}
async function v3SaveWritingTask(part){const t=(window.__v3WritingTasks||[]).find(x=>Number(x.part)===part);const payload={test_id:adminCurrentTest.id,part,task_type:part===1?'task1':'task2',instructions:document.getElementById(`v3-winst-${part}`).value,prompt:document.getElementById(`v3-wprompt-${part}`).value,minimum_words:Number(document.getElementById(`v3-wmin-${part}`).value||0),maximum_words:Number(document.getElementById(`v3-wmax-${part}`).value||0)||null,suggested_time:Number(document.getElementById(`v3-wtime-${part}`).value||0),media:part===1&&document.getElementById(`v3-wmedia-${part}`)?.value?[{type:document.getElementById(`v3-wvisual-${part}`).value,url:document.getElementById(`v3-wmedia-${part}`).value}]:[],task_achievement:document.getElementById(`v3-wa-${part}`).value?Number(document.getElementById(`v3-wa-${part}`).value):null,coherence_cohesion:document.getElementById(`v3-wcc-${part}`).value?Number(document.getElementById(`v3-wcc-${part}`).value):null,lexical_resource:document.getElementById(`v3-wlr-${part}`).value?Number(document.getElementById(`v3-wlr-${part}`).value):null,grammar:document.getElementById(`v3-wgr-${part}`).value?Number(document.getElementById(`v3-wgr-${part}`).value):null,band_score:document.getElementById(`v3-wband-${part}`).value?Number(document.getElementById(`v3-wband-${part}`).value):null,evaluation_status:'pending'};let res;if(t?.id)res=await supabaseClient.from('writing_tasks').update(payload).eq('id',t.id);else res=await supabaseClient.from('writing_tasks').insert(payload);if(res.error)return alert(res.error.message);alert(`Writing Part ${part} saved.`);await editAdminTest(adminCurrentTest.id)}
async function v3UploadWritingVisual(part,input){const file=input?.files?.[0];if(!file)return;try{const path=`writing/${adminCurrentTest.id}/task-${part}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const {error}=await supabaseClient.storage.from('question-images').upload(path,file,{upsert:true});if(error)throw error;const {data}=supabaseClient.storage.from('question-images').getPublicUrl(path);document.getElementById(`v3-wmedia-${part}`).value=data.publicUrl;alert('Visual uploaded. Click Save Part to store it.')}catch(e){alert('Upload failed: '+e.message)}}

/* ---------- Master admin editor ---------- */
async function renderAdminTestEditor(){const body=document.getElementById('adminModuleBody');if(!body||!adminCurrentTest)return;const isL=adminCurrentTest.module==='listening',isR=adminCurrentTest.module==='reading';let top=`<div class="v3-toolbar"><button type="button" class="save-button" onclick="saveAdminTestHeader()">💾 Save Test</button><button type="button" onclick="openStudentTestPreview('${adminCurrentTest.id}')">👁 Preview Student Test</button><button type="button" onclick="v3ValidateTest()">✓ Validate</button><button type="button" class="danger" onclick="deleteAdminTest('${adminCurrentTest.id}')">Delete Test</button><button type="button" class="cancel-button" onclick="openTestManager('${adminCurrentTest.module}')">← Back</button></div>`;let details=`<div class="v3-panel"><h3>Test Details</h3><div class="v3-grid"><label>Title<input id="editTestTitle" value="${v3Attr(adminCurrentTest.title||'')}"></label><label>Duration (minutes)<input id="editTestDuration" type="number" value="${Number(adminCurrentTest.duration_minutes||60)}"></label><label>Total Questions / Tasks<input id="editTestTotal" type="number" value="${Number(adminCurrentTest.total_questions||40)}"></label><label>Published <input id="editTestPublished" type="checkbox" ${adminCurrentTest.is_published?'checked':''}></label></div><label>Description<textarea id="editTestDescription">${v3Esc(adminCurrentTest.description||'')}</textarea></div>`;let content='';if(adminCurrentTest.module==='writing'){await v3EnsureWritingTasks();content=v3WritingEditor()}else{content=`<div class="v3-panel"><h3>${isL?'🎧 Listening Parts':'📖 Reading Passages'}</h3>${adminCurrentSections.map((s,i)=>{const groups=adminCurrentGroups.filter(g=>g.section_id===s.id).sort((a,b)=>Number(a.group_order)-Number(b.group_order));const label=isL?`Part ${s.section_number}`:`Passage ${s.section_number}`;return `<div class="v3-section"><div class="v3-row"><h3>${label}</h3><button type="button" class="save-button" onclick="saveAdminSection('${s.id}')">💾 Save ${label}</button></div><label>Title<input id="sec-title-${s.id}" value="${v3Attr(s.title||label)}"></label><label>Instructions<textarea id="sec-instructions-${s.id}">${v3Esc(s.instructions||'')}</textarea></label>${isL?`<div class="v3-grid"><label>Audio URL<input id="sec-audio-${s.id}" value="${v3Attr(s.audio_url||'')}"></label><label>Upload Audio<input type="file" accept="audio/*" onchange="uploadSectionAudioV2('${s.id}',this)"></label><label><input id="sec-audio-controlled-${s.id}" type="checkbox" ${v3Json(s.audio_config,{}).controlled?'checked':''}> Controlled playback</label></div>`:''}<label>${isR?'Passage Text':'Part Content / Notes'}<textarea id="sec-content-${s.id}" style="min-height:150px">${v3Esc(s.content||'')}</textarea></label><label>Section Image URL<input id="sec-image-${s.id}" value="${v3Attr(s.image_url||'')}"></label><div class="v3-row"><strong>Question Groups</strong><button type="button" onclick="v3AddGroup('${s.id}')">+ Add Question Group</button></div>${groups.map(g=>adminQuestionGroupEditor(g,label)).join('')||'<div class="muted">No groups yet.</div>'}</div>`}).join('')}</div>`}body.innerHTML=top+details+content}
async function v3AddGroup(sectionId){const gs=adminCurrentGroups.filter(g=>g.section_id===sectionId);const order=gs.length?Math.max(...gs.map(g=>Number(g.group_order||0)))+1:1;const start=gs.length?Math.max(...gs.map(g=>Number(g.end_question||0)))+1:1;const type=adminCurrentTest.module==='listening'?'listening_short_answer':'reading_multiple_choice';const {error}=await supabaseClient.from('question_groups').insert({section_id:sectionId,group_order:order,start_question:start,end_question:start,question_type:type,instructions:'',content:'',configuration:{}});if(error)return alert(error.message);await editAdminTest(adminCurrentTest.id)}
async function saveAdminTestHeader(){const p={title:document.getElementById('editTestTitle').value.trim(),description:document.getElementById('editTestDescription').value,duration_minutes:Number(document.getElementById('editTestDuration').value||60),total_questions:Number(document.getElementById('editTestTotal').value||40),is_published:false};const {error}=await supabaseClient.from('tests').update(p).eq('id',adminCurrentTest.id);if(error)return alert(error.message);alert('Test details saved. Use Validate then Publish from Test Manager.');await editAdminTest(adminCurrentTest.id)}

/* ---------- Reading / Listening validation ---------- */
async function v3ValidateTest(){const errors=[];const t=adminCurrentTest;if(!t)return;if(t.module==='reading'){if(adminCurrentSections.length!==3)errors.push('Reading must have 3 passages.');const qs=adminCurrentQuestions;if(!qs.length)errors.push('No Reading questions configured.');for(const q of qs){if(!q.question_type)errors.push(`Q${q.question_number}: missing question type.`);if(!q.question_text)errors.push(`Q${q.question_number}: missing question content.`);if(!q.correct_answer&&!['reading_multiple_choice'].includes(q.question_type))errors.push(`Q${q.question_number}: correct answer missing.`)}}else if(t.module==='listening'){if(adminCurrentSections.length!==4)errors.push('Listening must have 4 parts.');if(!adminCurrentGroups.length)errors.push('No Listening Question Groups configured.');for(const s of adminCurrentSections){if(!s.audio_url)errors.push(`Part ${s.section_number}: audio is not configured.`)}for(const q of adminCurrentQuestions){if(!q.question_type)errors.push(`Q${q.question_number}: type missing.`);if(!q.question_text)errors.push(`Q${q.question_number}: content missing.`);if(!q.correct_answer&&q.question_type!=='listening_matching')errors.push(`Q${q.question_number}: correct answer missing.`)}}else{const tasks=window.__v3WritingTasks||[];if(tasks.length<2)errors.push('Writing requires Task 1 and Task 2.');for(const t of tasks){if(!t.instructions)errors.push(`Writing Part ${t.part}: instructions missing.`);if(!t.prompt)errors.push(`Writing Part ${t.part}: task prompt missing.`);if(Number(t.minimum_words||0)<=0)errors.push(`Writing Part ${t.part}: minimum words missing.`)}}if(errors.length){alert('Validation errors:\n\n'+errors.map(x=>'• '+x).join('\n'))}else alert('Validation passed. The test is structurally ready for publishing.')} 

/* ---------- Student loader + renderers ---------- */
async function loadStudentTestData(testId){const {data:test,error:te}=await supabaseClient.from('tests').select('*').eq('id',testId).single();if(te)throw te;if(!test.is_published&&!studentTestState?.preview)throw new Error('This test is not published.');const {data:sections,error:se}=await supabaseClient.from('sections').select('*').eq('test_id',testId).order('section_number');if(se)throw se;const ids=(sections||[]).map(s=>s.id);let questions=[],groups=[];if(ids.length){const {data:q,error:qe}=await supabaseClient.from('questions').select('*').in('section_id',ids).order('question_number');if(qe)throw qe;questions=q||[];const qids=questions.map(q=>q.id);if(qids.length){const {data:o,error:oe}=await supabaseClient.from('options').select('*').in('question_id',qids).order('sort_order');if(oe)throw oe;const m={};(o||[]).forEach(o=>(m[o.question_id]||=[]).push(o));questions=questions.map(q=>({...q,options:m[q.id]||[]}))}const {data:g,error:ge}=await supabaseClient.from('question_groups').select('*').in('section_id',ids).order('group_order');if(ge)throw ge;groups=g||[];const gids=groups.map(g=>g.id);if(gids.length){const {data:o,error:oe}=await supabaseClient.from('question_group_options').select('*').in('group_id',gids).order('sort_order');if(oe)throw oe;const m={};(o||[]).forEach(o=>(m[o.group_id]||=[]).push(o));groups=groups.map(g=>({...g,options:m[g.id]||[]}))}}let writingTasks=[];if(test.module==='writing'){const {data:w,error:we}=await supabaseClient.from('writing_tasks').select('*').eq('test_id',testId).order('part');if(we)throw we;writingTasks=w||[]}return {test,sections:sections||[],questions,groups,writingTasks}}
function v3WordCount(s){return String(s||'').trim()?String(s).trim().split(/\s+/).length:0}
function v3Normalize(s,cfg={}){let x=String(s??'');if(cfg.whitespace_normalization!==false)x=x.trim().replace(/\s+/g,' ');else x=x.trim();if(!cfg.case_sensitive)x=x.toLowerCase();if(!cfg.punctuation_sensitive)x=x.replace(/[.,!?;:'"“”‘’()\[\]{}]/g,'');return x}
function v3TypedCorrect(q,answer){const cfg=v3Json(q.question_config,{});const wc=v3WordCount(answer);if(cfg.word_limit&&wc>Number(cfg.word_limit))return false;if(cfg.character_limit&&String(answer||'').length>Number(cfg.character_limit))return false;const accepted=[q.correct_answer,...v3Arr(q.accepted_answers)].filter(Boolean);const a=v3Normalize(answer,cfg);for(let c of accepted){let cc=v3Normalize(c,cfg);if(a===cc)return true;if(cfg.number_format==='both'||cfg.number_format==='numeric_equivalent'){if(!isNaN(Number(a))&&!isNaN(Number(cc))&&Number(a)===Number(cc))return true}}return false}
function v3RenderQuestion(q,group){const type=group?.question_type||q.question_type;const ans=studentTestState.answers[q.id]??'';const opts=q.options?.length?q.options:(group?.options||[]);if(/multiple_choice$/.test(type))return `<div class="v3-sq"><div><strong>${q.question_number}.</strong> ${v3Esc(q.question_text)}</div><div>${opts.map(o=>`<label class="v3-choice"><input type="${v3Json(group?.configuration,{}).mode==='multiple'?'checkbox':'radio'}" name="q-${q.id}" value="${v3Attr(o.option_key)}" ${String(ans).split('||').includes(o.option_key)?'checked':''} onchange="v3SetAnswer('${q.id}',this)"><span>${v3Esc(o.option_key)}. ${v3Esc(o.option_text)}</span></label>`).join('')}</div></div>`;if(type==='reading_true_false_not_given'||type==='reading_yes_no_not_given'){const os=type==='reading_true_false_not_given'?['TRUE','FALSE','NOT GIVEN']:['YES','NO','NOT GIVEN'];return `<div class="v3-sq"><strong>${q.question_number}.</strong> ${v3Esc(q.question_text)}<select onchange="v3SetAnswerValue('${q.id}',this.value)"><option value="">Select...</option>${os.map(o=>`<option ${ans===o?'selected':''}>${o}</option>`).join('')}</select></div>`}if(/matching/.test(type)||type==='reading_title_selection'||type==='listening_list_selection'||type==='reading_list_selection'){const os=opts;return `<div class="v3-sq"><strong>${q.question_number}.</strong> ${v3Esc(q.question_text)}<select onchange="v3SetAnswerValue('${q.id}',this.value)"><option value="">Select...</option>${os.map(o=>`<option value="${v3Attr(o.option_key)}" ${ans===o.option_key?'selected':''}>${v3Esc(o.option_key)}. ${v3Esc(o.option_text)}</option>`).join('')}</select></div>`}if(type==='listening_map_labelling'||type==='listening_diagram_labelling'||type==='reading_diagram_completion')return `<div class="v3-sq"><strong>${q.question_number}.</strong> ${v3Esc(q.question_text)}<input value="${v3Attr(ans)}" placeholder="Your answer" oninput="v3SetAnswerValue('${q.id}',this.value)"></div>`;return `<div class="v3-sq"><strong>${q.question_number}.</strong> ${v3Esc(q.question_text)}<input value="${v3Attr(ans)}" placeholder="Your answer" oninput="v3SetAnswerValue('${q.id}',this.value)"></div>`}
function v3SetAnswerValue(id,v){studentTestState.answers[id]=v;v3AutoSaveLocal()}
function v3SetAnswer(id,el){const type=el.type;if(type==='checkbox'){const cur=String(studentTestState.answers[id]||'').split('||').filter(Boolean);if(el.checked&&!cur.includes(el.value))cur.push(el.value);if(!el.checked){const i=cur.indexOf(el.value);if(i>=0)cur.splice(i,1)}studentTestState.answers[id]=cur.join('||')}else studentTestState.answers[id]=el.value;v3AutoSaveLocal()}
function v3AutoSaveLocal(){if(!studentTestState||studentTestState.preview)return;try{localStorage.setItem('UE_IELTS_ATTEMPT_'+studentTestState.testId,JSON.stringify({answers:studentTestState.answers,writing:studentTestState.writing||{},saved_at:new Date().toISOString()}))}catch{}}
function v3LoadLocal(testId){try{return JSON.parse(localStorage.getItem('UE_IELTS_ATTEMPT_'+testId)||'{}')}catch{return {}}}
function v3WritingView(state){const tasks=state.data.writingTasks||[];return tasks.map(t=>{const a=state.writing?.[t.part]||'';const media=(t.media||[])[0];return `<div class="v3-writing-student"><h2>Part ${t.part} — ${t.part===1?'Writing Task 1':'Writing Task 2'}</h2><div class="v3-writing-grid"><div class="v3-task-pane"><div class="v3-instructions">${v3Esc(t.instructions||'')}</div><div class="v3-prompt">${v3Esc(t.prompt||'')}</div>${media?.url?`<img src="${v3Attr(media.url)}" alt="Writing Task visual" style="max-width:100%;margin-top:14px;border-radius:8px">`:''}<div class="muted" style="margin-top:12px">Write at least ${Number(t.minimum_words||0)} words${t.maximum_words?` and no more than ${Number(t.maximum_words)} words`:''}.</div></div><div class="v3-answer-pane"><textarea id="v3-writing-${t.part}" style="min-height:520px;width:100%;box-sizing:border-box" oninput="v3SetWriting(${t.part},this.value)">${v3Esc(a)}</textarea><div class="v3-wordcount">Word Count: <strong id="v3-wc-${t.part}">${v3WordCount(a)}</strong></div></div></div></div>`}).join('')}
function v3SetWriting(part,value){studentTestState.writing=studentTestState.writing||{};studentTestState.writing[part]=value;const el=document.getElementById(`v3-wc-${part}`);if(el)el.textContent=v3WordCount(value);v3AutoSaveLocal()}
function renderStudentTestRunner(){const app=document.getElementById('app'),state=studentTestState;if(!app||!state?.data)return;const {test,sections}=state.data;if(test.module==='writing')return renderV3WritingRunner();const s=sections[state.currentSection];const isL=test.module==='listening';const groups=state.data.groups.filter(g=>g.section_id===s.id).sort((a,b)=>Number(a.group_order)-Number(b.group_order));const qs=state.data.questions.filter(q=>q.section_id===s.id).sort((a,b)=>Number(a.question_number)-Number(b.question_number));app.innerHTML=`<div class="dashboard"><header class="dashboard-header"><div><h1>${v3Esc(test.title)}</h1><p>${state.preview?'Student View Preview':'Student Test'}</p></div><div class="user-area"><button type="button" onclick="exitStudentTest()">← ${state.preview?'Back to Admin':'Dashboard'}</button></div></header><main class="dashboard-content">${state.preview?'<div class="v3-preview-banner">Preview Mode — same renderer as Student Test.</div>':''}<div class="v3-nav">${sections.map((x,i)=>`<button type="button" class="${i===state.currentSection?'save-button':'cancel-button'}" onclick="switchStudentSection(${i})">${isL?'Part':'Passage'} ${i+1}</button>`).join('')}</div><div class="v3-split"><section class="v3-pane">${isL&&s.audio_url?`<audio id="v3-audio" controls ${v3Json(s.audio_config,{}).controlled?'controlsList="nodownload noplaybackrate"':''} src="${v3Attr(s.audio_url)}" style="width:100%"></audio>`:''}<h2>${v3Esc(s.title||'')}</h2>${s.instructions?`<div class="v3-instructions">${v3Esc(s.instructions)}</div>`:''}${s.image_url?`<img src="${v3Attr(s.image_url)}" style="max-width:100%;border-radius:8px">`:''}${s.content?`<div class="v3-rich">${v3Esc(s.content)}</div>`:''}${groups.map(g=>`<div class="v3-group-content"><h3>${v3Esc(g.group_title||`Questions ${g.start_question}-${g.end_question}`)}</h3>${g.instructions?`<div class="v3-instructions">${v3Esc(g.instructions)}</div>`:''}${g.content?`<div class="v3-rich">${v3Esc(g.content)}</div>`:''}${g.image_url?`<img src="${v3Attr(g.image_url)}" style="max-width:100%">`:''}</div>`).join('')}</section><section class="v3-pane"><h2>Questions</h2>${groups.length?groups.map(g=>`<div><h3>Questions ${g.start_question}–${g.end_question}</h3>${qs.filter(q=>q.group_id===g.id|| (Number(q.question_number)>=Number(g.start_question)&&Number(q.question_number)<=Number(g.end_question))).map(q=>v3RenderQuestion(q,g)).join('')}</div>`).join(''):qs.map(q=>v3RenderQuestion(q,null)).join('')}</section></div><div class="v3-nav"><button type="button" class="cancel-button" ${state.currentSection===0?'disabled':''} onclick="switchStudentSection(${state.currentSection-1})">← Previous</button>${state.currentSection<sections.length-1?`<button type="button" class="save-button" onclick="switchStudentSection(${state.currentSection+1})">Next →</button>`:state.preview?`<button type="button" class="save-button" onclick="exitStudentTest()">Finish Preview</button>`:`<button type="button" class="save-button" onclick="submitStudentTest()">Submit Test</button>`}</div></main></div>`;}
function renderV3WritingRunner(){const state=studentTestState,test=state.data.test;const tasks=state.data.writingTasks||[];const part=Math.min(Math.max(state.currentSection+1,1),2);const t=tasks.find(x=>Number(x.part)===part)||tasks[part-1];const a=state.writing?.[part]||'';const media=(t?.media||[])[0];app.innerHTML=`<div class="dashboard"><header class="dashboard-header"><div><h1>${v3Esc(test.title)}</h1><p>${state.preview?'Student View Preview':'Writing Test'}</p></div><div class="user-area"><span id="v3-writing-timer"></span><button type="button" onclick="exitStudentTest()">← ${state.preview?'Back to Admin':'Dashboard'}</button></div></header><main class="dashboard-content">${state.preview?'<div class="v3-preview-banner">Preview Mode — same renderer as Student Test.</div>':''}<div class="v3-nav">${[1,2].map(i=>`<button type="button" class="${i===part?'save-button':'cancel-button'}" onclick="switchStudentSection(${i-1})">Part ${i}</button>`).join('')}</div><div class="v3-writing-grid"><section class="v3-pane"><h2>Part ${part} — ${part===1?'Writing Task 1':'Writing Task 2'}</h2><div class="v3-instructions">${v3Esc(t?.instructions||'')}</div><div class="v3-prompt">${v3Esc(t?.prompt||'')}</div>${media?.url?`<img src="${v3Attr(media.url)}" style="max-width:100%;border-radius:8px;margin-top:15px">`:''}<p class="muted">Minimum ${Number(t?.minimum_words||0)} words${t?.maximum_words?` • Maximum ${Number(t.maximum_words)} words`:''}</p></section><section class="v3-pane"><textarea id="v3-writing-${part}" oninput="v3SetWriting(${part},this.value)" style="width:100%;min-height:560px;box-sizing:border-box">${v3Esc(a)}</textarea><div class="v3-wordcount">Word Count: <strong id="v3-wc-${part}">${v3WordCount(a)}</strong></div></section></div><div class="v3-nav"><button type="button" class="cancel-button" ${part===1?'disabled':''} onclick="switchStudentSection(0)">← Part 1</button>${part===1?'<button type="button" class="save-button" onclick="switchStudentSection(1)">Part 2 →</button>':state.preview?'<button type="button" class="save-button" onclick="exitStudentTest()">Finish Preview</button>':'<button type="button" class="save-button" onclick="submitStudentTest()">Submit Test</button>'}</div></main></div>`;v3StartTimer()}
let v3TimerHandle=null,v3TimerStartedAt=null;function v3StartTimer(){if(studentTestState?.preview)return;if(v3TimerHandle)return;const total=Number(studentTestState.data.test.duration_minutes||60)*60;const local=v3LoadLocal(studentTestState.testId);v3TimerStartedAt=local.started_at?new Date(local.started_at):new Date();if(!local.started_at){local.started_at=v3TimerStartedAt.toISOString();try{localStorage.setItem('UE_IELTS_ATTEMPT_'+studentTestState.testId,JSON.stringify({...local,started_at:local.started_at}))}catch{}}v3TimerHandle=setInterval(()=>{const used=Math.floor((Date.now()-v3TimerStartedAt.getTime())/1000),left=Math.max(0,total-used);const el=document.getElementById('v3-writing-timer');if(el)el.textContent=`Time Remaining: ${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;if(left<=0){clearInterval(v3TimerHandle);v3TimerHandle=null;if(!studentTestState.preview)submitStudentTest()}},1000)}

/* ---------- Central marking + submission ---------- */
async function v3EvaluateTest(){const state=studentTestState,t=state.data.test;let correct=0,max=0;const details=[];for(const q of state.data.questions){max+=Number(q.marks||1);const type=q.question_type;let ok=false;const a=state.answers[q.id]??'';if(/multiple_choice$/.test(type)){const expected=String(q.correct_answer||'').split('||').filter(Boolean).sort().join('||');ok=String(a).split('||').filter(Boolean).sort().join('||')===expected}else if(/matching/.test(type)||type==='reading_title_selection'||type==='listening_list_selection'||type==='reading_list_selection'){ok=String(a).split('||').sort().join('||')===String(q.correct_answer||'').split('||').sort().join('||')}else if(type==='reading_true_false_not_given'||type==='reading_yes_no_not_given')ok=v3Normalize(a,{})===v3Normalize(q.correct_answer,{});else ok=v3TypedCorrect(q,a);const m=ok?Number(q.marks||1):0;if(ok)correct+=m;details.push({questionId:q.id,questionNumber:q.question_number,questionType:type,studentAnswer:String(a),correctAnswer:q.correct_answer||'',acceptedAnswers:q.accepted_answers||[],marks:Number(q.marks||1),awardedMarks:m,isCorrect:ok})}return {correct,max,details}}
async function submitStudentTest(){const state=studentTestState;if(!state||state.preview)return exitStudentTest();if(state.data.test.module==='writing')return submitV3Writing();const evaluation=await v3EvaluateTest();try{const {data:user}=await supabaseClient.auth.getUser();const studentId=user?.user?.id;if(!studentId)throw new Error('Student session not found.');const {data:result,error:re}=await supabaseClient.from('results').insert({student_id:studentId,test_id:state.testId,reading_score:state.data.test.module==='reading'?evaluation.correct:null,listening_score:state.data.test.module==='listening'?evaluation.correct:null,status:'completed',started_at:v3TimerStartedAt?.toISOString()||new Date().toISOString(),submitted_at:new Date().toISOString()}).select().single();if(re)throw re;const rows=evaluation.details.map(d=>({result_id:result.id,question_id:d.questionId,answer_text:d.studentAnswer,is_correct:d.isCorrect,marks_obtained:d.awardedMarks}));if(rows.length){const {error:ae}=await supabaseClient.from('answers').insert(rows);if(ae)throw ae}localStorage.removeItem('UE_IELTS_ATTEMPT_'+state.testId);alert(`Test submitted. Raw Score: ${evaluation.correct}/${evaluation.max}`);exitStudentTest()}catch(e){alert('Could not submit test: '+e.message)}}
async function submitV3Writing(){if(!confirm('Are you sure you want to submit your Writing Test?'))return;const state=studentTestState;const {data:user}=await supabaseClient.auth.getUser();if(!user?.user)return alert('Student session not found.');const rows=(state.data.writingTasks||[]).map(t=>({test_id:state.testId,student_id:user.user.id,part:t.part,answer:state.writing?.[t.part]||'',word_count:v3WordCount(state.writing?.[t.part]||''),submission_time:new Date().toISOString(),time_taken_seconds:v3TimerStartedAt?Math.floor((Date.now()-v3TimerStartedAt.getTime())/1000):null,evaluation_status:'pending'}));const {error}=await supabaseClient.from('writing_attempts').upsert(rows,{onConflict:'test_id,student_id,part'});if(error)return alert(error.message);localStorage.removeItem('UE_IELTS_ATTEMPT_'+state.testId);alert('Writing Test submitted. Evaluation Pending.');exitStudentTest()}

/* ---------- Preview question ---------- */
function v3PreviewQuestion(qid){const q=adminCurrentQuestions.find(x=>x.id===qid);if(!q)return;const g=adminCurrentGroups.find(x=>x.id===q.group_id);const html=v3RenderQuestion({...q,question_number:q.question_number},g);const modal=document.createElement('div');modal.id='v3-modal';modal.style='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';modal.innerHTML=`<div style="background:white;max-width:760px;width:100%;max-height:90vh;overflow:auto;border-radius:12px;padding:22px"><div class="v3-row"><h3>Student Preview — Q${q.question_number}</h3><button type="button" onclick="document.getElementById('v3-modal')?.remove()">Close</button></div>${html}</div>`;document.body.appendChild(modal)}

/* ---------- Student entry override ---------- */
async function startStudentTest(testId){studentTestState={preview:false,testId,currentSection:0,answers:{},writing:{}};const saved=v3LoadLocal(testId);if(saved.answers)studentTestState.answers=saved.answers;if(saved.writing)studentTestState.writing=saved.writing;try{studentTestState.data=await loadStudentTestData(testId);if(studentTestState.data.test.module==='writing')studentTestState.currentSection=0;renderStudentTestRunner()}catch(e){alert(e.message)}}
async function openStudentTestPreview(testId){studentTestState={preview:true,testId,currentSection:0,answers:{},writing:{}};try{studentTestState.data=await loadStudentTestData(testId);renderStudentTestRunner()}catch(e){alert(e.message)}}
function switchStudentSection(i){if(!studentTestState)return;studentTestState.currentSection=Math.max(0,Math.min(i,studentTestState.data.sections.length-1));v3AutoSaveLocal();renderStudentTestRunner()}

/* ---------- CSS injected so no new stylesheet is required ---------- */
(function(){const s=document.createElement('style');s.textContent=`.v3-panel,.v3-section,.v3-group,.v3-writing-task{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:12px 0}.v3-toolbar,.v3-row,.v3-actions,.v3-nav{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}.v3-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px}.v3-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin:10px 0}.v3-bank-row,.v3-qopt{display:grid;grid-template-columns:70px minmax(0,1fr) auto auto;gap:7px;align-items:center;margin:6px 0}.v3-question{border:1px solid #dbe3ee;border-radius:10px;padding:12px;margin:10px 0;background:#fbfdff}.v3-choice{display:flex;gap:8px;padding:7px;border:1px solid #e5e7eb;border-radius:8px;margin:6px 0}.v3-sq{padding:13px 0;border-bottom:1px solid #eef2f7}.v3-sq input,.v3-sq select{margin:8px 0;padding:8px;width:100%;box-sizing:border-box}.v3-split,.v3-writing-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}.v3-pane{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;max-height:calc(100vh - 170px);overflow:auto}.v3-instructions{background:#fff7df;border-radius:8px;padding:12px;white-space:pre-wrap;margin:10px 0}.v3-rich,.v3-prompt{white-space:pre-wrap;line-height:1.7}.v3-preview-banner{padding:10px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;margin-bottom:12px}.v3-wordcount{padding:10px 0;font-weight:600}.v3-info{padding:12px;background:#eef6ff;border-radius:8px}.muted{color:#64748b}@media(max-width:900px){.v3-split,.v3-writing-grid{grid-template-columns:1fr}.v3-pane{max-height:none}.v3-bank-row,.v3-qopt{grid-template-columns:60px 1fr}.v3-bank-row button,.v3-qopt button{grid-column:2}}`;document.head.appendChild(s)})();

Object.assign(window,{v3SaveGroup,v3AddQuestionToGroup,v3AddBankOption,v3AddQuestionOption,v3SaveQuestion,v3DeleteQuestion,v3DuplicateQuestion,v3MoveQuestion,v3DeleteGroup,v3RefreshGroupType,v3PreviewQuestion,v3ValidateTest,v3SaveWritingTask,v3UploadWritingVisual,v3SetAnswerValue,v3SetAnswer,v3SetWriting});

/* ---------- FINAL QUESTION GROUP HANDLER OVERRIDE ----------
   Canonical handler for every inline + Add Question Group button.
   This intentionally uses the Master V3 listening/reading type registry.
*/
window.addAdminQuestionGroup = async function(sectionId) {
  try {
    if (!window.supabaseClient) throw new Error('Supabase client is not initialized. Please refresh the page.');
    if (!adminCurrentTest) throw new Error('No test is currently open.');

    const existing = (adminCurrentGroups || []).filter(g => g.section_id === sectionId);
    const nextOrder = existing.length
      ? Math.max(...existing.map(g => Number(g.group_order || 0))) + 1
      : 1;
    const lastEnd = existing.length
      ? Math.max(...existing.map(g => Number(g.end_question || 0)))
      : 0;
    const nextStart = lastEnd > 0 ? lastEnd + 1 : 1;

    const defaultType = adminCurrentTest.module === 'listening'
      ? 'listening_short_answer'
      : 'reading_multiple_choice';

    const payload = {
      section_id: sectionId,
      group_order: nextOrder,
      start_question: nextStart,
      end_question: nextStart,
      question_type: defaultType,
      instructions: '',
      content: '',
      image_url: null,
      configuration: {}
    };

    const { data, error } = await supabaseClient
      .from('question_groups')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Add Question Group error:', error);
      alert('Could not add Question Group:\n\n' + (error.message || 'Unknown Supabase error'));
      return;
    }

    adminCurrentGroups = [...(adminCurrentGroups || []), data];
    await editAdminTest(adminCurrentTest.id);

    setTimeout(() => {
      const el = document.getElementById(`v3-group-${data.id}`) || document.getElementById(`group-${data.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  } catch (e) {
    console.error('Add Question Group exception:', e);
    alert('Could not add Question Group:\n\n' + (e?.message || String(e)));
  }
};

/* ======================================================================
   MASTER V3 FINAL GROUP/QUESTION REPAIR
   - Reading + Listening use the same Question Group architecture.
   - Group options are optional and must never prevent the editor opening.
   - Questions are linked to groups through questions.group_id.
   - Reading and Listening can both add groups and questions.
   ====================================================================== */

async function masterV3LoadGroupOptionsSafe(groups) {
  const list = Array.isArray(groups) ? groups : [];
  const ids = list.map(g => g.id).filter(Boolean);
  if (!ids.length) return list.map(g => ({...g, options: []}));
  try {
    const {data, error} = await supabaseClient
      .from('question_group_options')
      .select('*')
      .in('group_id', ids)
      .order('sort_order', {ascending:true});
    if (error) {
      console.warn('Question group option bank unavailable; continuing without shared options.', error);
      return list.map(g => ({...g, options: []}));
    }
    const map = {};
    (data || []).forEach(o => (map[o.group_id] ||= []).push(o));
    return list.map(g => ({...g, options: map[g.id] || []}));
  } catch (e) {
    console.warn('Question group option bank unavailable; continuing.', e);
    return list.map(g => ({...g, options: []}));
  }
}

async function masterV3EditAdminTest(id) {
  const message = document.getElementById('dashboardMessage');
  if (!message) return;
  try {
    const {data:test,error:te} = await supabaseClient.from('tests').select('*').eq('id',id).single();
    if (te) throw te;
    const {data:sections,error:se} = await supabaseClient.from('sections').select('*').eq('test_id',id).order('section_number');
    if (se) throw se;
    const sectionRows = sections || [];
    const sectionIds = sectionRows.map(s => s.id);

    let questions = [];
    if (sectionIds.length) {
      const {data:q,error:qe} = await supabaseClient.from('questions').select('*').in('section_id',sectionIds).order('question_number').order('question_order');
      if (qe) throw qe;
      questions = q || [];
      const qids = questions.map(q => q.id);
      if (qids.length) {
        const {data:o,error:oe} = await supabaseClient.from('options').select('*').in('question_id',qids).order('sort_order');
        if (!oe) {
          const map = {};
          (o || []).forEach(x => (map[x.question_id] ||= []).push(x));
          questions = questions.map(q => ({...q, options: map[q.id] || []}));
        }
      }
    }

    let groups = [];
    if (sectionIds.length) {
      const {data:g,error:ge} = await supabaseClient.from('question_groups').select('*').in('section_id',sectionIds).order('group_order');
      if (ge) throw ge;
      groups = await masterV3LoadGroupOptionsSafe(g || []);
    }

    let writingTasks = [];
    if (test.module === 'writing') {
      const {data:w,error:we} = await supabaseClient.from('writing_tasks').select('*').eq('test_id',id).order('part');
      if (we) throw we;
      writingTasks = w || [];
    }

    adminCurrentTest = test;
    adminCurrentSections = sectionRows;
    adminCurrentQuestions = questions;
    adminCurrentGroups = groups;
    window.__v3WritingTasks = writingTasks;

    message.innerHTML = adminModuleBox(`Edit: ${test.title}`, `${String(test.module || '').toUpperCase()} • Master Builder`);
    await renderAdminTestEditor();
  } catch (e) {
    console.error(e);
    alert('Could not open Test Builder: ' + (e.message || 'Unknown error'));
  }
}

async function masterV3AddGroup(sectionId) {
  if (!adminCurrentTest) return;
  const section = adminCurrentSections.find(s => s.id === sectionId);
  if (!section) return alert('Section not found.');
  const existing = adminCurrentGroups.filter(g => g.section_id === sectionId);
  const order = existing.length ? Math.max(...existing.map(g => Number(g.group_order || 0))) + 1 : 1;
  const nextStart = existing.length ? Math.max(...existing.map(g => Number(g.end_question || 0))) + 1 : 1;
  const type = adminCurrentTest.module === 'listening' ? 'listening_short_answer' : 'reading_multiple_choice';
  const payload = {
    section_id: sectionId,
    group_order: order,
    group_title: `Question Group ${order}`,
    start_question: nextStart,
    end_question: nextStart,
    question_type: type,
    instructions: '',
    content: '',
    image_url: null,
    audio_start_seconds: null,
    audio_end_seconds: null,
    configuration: {}
  };
  try {
    const {error} = await supabaseClient.from('question_groups').insert(payload);
    if (error) throw error;
    await masterV3EditAdminTest(adminCurrentTest.id);
  } catch (e) {
    alert('Could not add Question Group: ' + (e.message || 'Unknown error'));
  }
}

async function masterV3AddQuestionToGroup(groupId) {
  const g = adminCurrentGroups.find(x => x.id === groupId);
  if (!g) return alert('Question Group not found.');
  const qs = (adminCurrentQuestions || []).filter(q => q.group_id === g.id ||
    (q.section_id === g.section_id && Number(q.question_number) >= Number(g.start_question) && Number(q.question_number) <= Number(g.end_question)));
  let n = qs.length ? Math.max(...qs.map(q => Number(q.question_number || 0))) + 1 : Number(g.start_question || 1);
  if (n > Number(g.end_question || n)) {
    const extend = confirm(`Question ${n} is outside the current End Question ${g.end_question}. Extend this group to ${n}?`);
    if (!extend) return;
    const {error:ge} = await supabaseClient.from('question_groups').update({end_question:n}).eq('id',g.id);
    if (ge) return alert('Could not extend Question Group: ' + ge.message);
  }
  const payload = {
    section_id: g.section_id,
    group_id: g.id,
    question_number: n,
    question_order: qs.length + 1,
    question_type: g.question_type,
    question_text: '',
    marks: 1,
    correct_answer: '',
    accepted_answers: [],
    question_config: {},
    explanation: '',
    image_url: null
  };
  try {
    const {data,error} = await supabaseClient.from('questions').insert(payload).select().single();
    if (error) throw error;
    await masterV3EditAdminTest(adminCurrentTest.id);
    setTimeout(() => document.getElementById(`v3-q-${data.id}`)?.scrollIntoView({behavior:'smooth',block:'center'}), 150);
  } catch (e) {
    alert('Could not add Question: ' + (e.message || 'Unknown error'));
  }
}

async function masterV3SaveGroup(id) {
  const g = adminCurrentGroups.find(x => x.id === id);
  if (!g) return;
  const start = Number(document.getElementById(`v3-gstart-${id}`)?.value || 0);
  const end = Number(document.getElementById(`v3-gend-${id}`)?.value || 0);
  if (!start || !end || end < start) return alert('Please enter a valid Start and End Question Number.');
  const type = document.getElementById(`v3-gtype-${id}`)?.value || g.question_type;
  const cfg = {};
  if (/multiple_choice$/.test(type)) Object.assign(cfg, {
    mode: document.getElementById(`v3-mode-${id}`)?.value || 'single',
    answers_required: Number(document.getElementById(`v3-required-${id}`)?.value || 1),
    randomize: !!document.getElementById(`v3-random-${id}`)?.checked,
    show_letters: document.getElementById(`v3-letters-${id}`)?.checked !== false
  });
  if (/matching/.test(type)) Object.assign(cfg, {
    allow_repeat: !!document.getElementById(`v3-repeat-${id}`)?.checked,
    randomize: document.getElementById(`v3-random-${id}`)?.checked !== false
  });
  if (/map_labelling|diagram_labelling|diagram_completion/.test(type)) Object.assign(cfg, {
    answer_mode: document.getElementById(`v3-mapmode-${id}`)?.value || 'text',
    image_url: document.getElementById(`v3-image-${id}`)?.value.trim() || null
  });
  if (/completion/.test(type)) cfg.format = document.getElementById(`v3-format-${id}`)?.value || 'note';
  if (/summary_completion/.test(type)) cfg.mode = document.getElementById(`v3-summary-${id}`)?.value || 'typed';

  const payload = {
    group_title: document.getElementById(`v3-gt-${id}`)?.value.trim() || null,
    start_question: start,
    end_question: end,
    group_order: Number(document.getElementById(`v3-gorder-${id}`)?.value || g.group_order || 1),
    question_type: type,
    instructions: document.getElementById(`v3-ginst-${id}`)?.value || '',
    content: document.getElementById(`v3-gcontent-${id}`)?.value || '',
    image_url: document.getElementById(`v3-gimage-${id}`)?.value.trim() || null,
    audio_start_seconds: document.getElementById(`v3-gastart-${id}`)?.value ? Number(document.getElementById(`v3-gastart-${id}`).value) : null,
    audio_end_seconds: document.getElementById(`v3-gaend-${id}`)?.value ? Number(document.getElementById(`v3-gaend-${id}`).value) : null,
    configuration: cfg
  };
  try {
    const {error} = await supabaseClient.from('question_groups').update(payload).eq('id',id);
    if (error) throw error;

    // Group option bank is optional. If its table/policy is unavailable, the group itself is still saved.
    try {
      const bank = Array.from(document.querySelectorAll(`#v3-bank-${id} .v3-bank-row`)).map((r,i) => ({
        group_id:id,
        option_key:r.querySelector('.v3-bank-key')?.value.trim() || v3OptionKey(i),
        option_text:r.querySelector('.v3-bank-text')?.value.trim() || '',
        sort_order:i+1,
        metadata:{}
      })).filter(x => x.option_text);
      const {error:de} = await supabaseClient.from('question_group_options').delete().eq('group_id',id);
      if (!de && bank.length) await supabaseClient.from('question_group_options').insert(bank);
    } catch (e) {
      console.warn('Optional group option bank save skipped:', e);
    }

    alert('Question Group saved successfully.');
    await masterV3EditAdminTest(adminCurrentTest.id);
  } catch (e) {
    alert('Could not save Question Group: ' + (e.message || 'Unknown error'));
  }
}

// Final handlers: these are intentionally assigned last so older duplicate functions cannot override them.
window.editAdminTest = masterV3EditAdminTest;
window.v3AddGroup = masterV3AddGroup;
window.addAdminQuestionGroup = masterV3AddGroup;
window.v3AddQuestionToGroup = masterV3AddQuestionToGroup;
window.addAdminQuestionToGroup = masterV3AddQuestionToGroup;
window.v3SaveGroup = masterV3SaveGroup;
window.saveAdminQuestionGroup = masterV3SaveGroup;

/* =====================================================================
   INLINE BLANK ENGINE — Listening/Reading Completion Groups
   Use [BLANK 1], [BLANK 2] ... inside Group Content. Each token maps
   to the corresponding Question in that group, in question-number order.
   ===================================================================== */
(function installInlineBlankEngine(){
  const style = document.createElement('style');
  style.textContent = `
    .inline-blank-input{display:inline-block!important;width:150px!important;min-width:90px!important;max-width:220px!important;margin:0 4px!important;padding:3px 6px!important;border:0!important;border-bottom:2px solid #111827!important;border-radius:0!important;background:transparent!important;vertical-align:baseline!important;box-shadow:none!important;font:inherit!important}
    .inline-blank-input:focus{outline:none!important;border-bottom-color:#2563eb!important;background:#eff6ff!important}
    .inline-blank-number{font-size:.72em;color:#475569;margin-right:2px;vertical-align:super}
    .inline-blank-builder{border:1px dashed #94a3b8;background:#f8fafc;border-radius:8px;padding:10px;margin-top:8px}
    .inline-blank-builder code{background:#e2e8f0;padding:2px 5px;border-radius:4px}
  `;
  document.head.appendChild(style);
})();

function insertInlineBlankToken(groupId){
  const ta = document.getElementById(`v3-gcontent-${groupId}`) || document.getElementById(`group-content-${groupId}`);
  if(!ta) return;
  const matches = String(ta.value||'').match(/\[BLANK\s+\d+\]/gi) || [];
  const next = matches.length + 1;
  const token = `[BLANK ${next}]`;
  const start = typeof ta.selectionStart === 'number' ? ta.selectionStart : ta.value.length;
  const end = typeof ta.selectionEnd === 'number' ? ta.selectionEnd : ta.value.length;
  ta.value = ta.value.slice(0,start) + token + ta.value.slice(end);
  ta.focus();
  const pos = start + token.length;
  try { ta.setSelectionRange(pos,pos); } catch(e){}
}
window.insertInlineBlankToken = insertInlineBlankToken;

function inlineBlankHelpV3(groupId){
  return `<div class="inline-blank-builder"><strong>Inline Blank Builder</strong><div style="margin-top:5px">Place answer boxes directly inside the notes/sentence by using <code>[BLANK 1]</code>, <code>[BLANK 2]</code>, etc. Use the button to insert the next blank at the cursor. Each blank uses the matching Question's answer configuration.</div><div style="margin-top:8px"><button type="button" onclick="insertInlineBlankToken('${groupId}')">＋ Insert Next Blank</button></div></div>`;
}

function renderInlineBlankContentV3(content, questions, groupId, opts={}){
  let html = v3Esc(String(content||''));
  const qs = (questions||[]).slice().sort((a,b)=>Number(a.question_number||0)-Number(b.question_number||0));
  html = html.replace(/\[BLANK\s+(\d+)\]/gi, (full,n)=>{
    const idx = Math.max(0, Number(n)-1);
    const q = qs[idx];
    if(!q){ return `<span style="display:inline-block;padding:2px 7px;border-bottom:2px solid #ef4444;color:#ef4444">[BLANK ${Number(n)}]</span>`; }
    const ans = studentTestState?.answers?.[q.id] ?? '';
    const cfg = v3Json(q.question_config,{});
    const limit = Number(cfg.word_limit||0);
    const width = limit > 2 ? 190 : 145;
    const placeholder = opts.preview ? '' : `Answer ${Number(q.question_number||n)}`;
    return `<span class="inline-blank-wrap"><span class="inline-blank-number">${Number(q.question_number||n)}</span><input class="inline-blank-input" style="width:${width}px" data-inline-blank="${v3Attr(q.id)}" value="${v3Attr(ans)}" placeholder="${v3Attr(placeholder)}" ${limit>0?`data-word-limit="${limit}"`:''} oninput="v3SetAnswerValue('${q.id}',this.value)" autocomplete="off"></span>`;
  });
  return html;
}
window.renderInlineBlankContentV3 = renderInlineBlankContentV3;

/* Override the final Group Editor so completion groups have a real inline-blank authoring workflow. */
adminQuestionGroupEditor = function(g, sectionLabel){
  const typeMap = adminCurrentTest?.module==='listening' ? IELTS_V3_LISTENING_TYPES : IELTS_V3_READING_TYPES;
  const qs = v3GroupQuestions(g);
  const typeOptions = Object.entries(typeMap).map(([k,v])=>`<option value="${k}" ${g.question_type===k?'selected':''}>${v3Esc(v)}</option>`).join('');
  const cfg = v3Json(g.configuration,{});
  const isCompletion = /completion|summary_completion|sentence_completion/.test(String(g.question_type||''));
  return `<div class="v3-group">
    <div class="v3-row"><div><strong>${v3Esc(g.group_title||`Question Group ${g.group_order||1}`)}</strong><div class="muted">${v3Esc(sectionLabel)} • Questions ${Number(g.start_question)}–${Number(g.end_question)}</div></div>
    <div class="v3-actions"><button type="button" onclick="v3AddQuestionToGroup('${g.id}')">+ Add Question / Blank</button><button type="button" class="danger" onclick="v3DeleteGroup('${g.id}')">Delete Group</button></div></div>
    <div class="v3-grid">
      <label>Group Title<input id="v3-gt-${g.id}" value="${v3Attr(g.group_title||'')}" placeholder="e.g. Questions 1–4"></label>
      <label>Start Question No.<input id="v3-gstart-${g.id}" type="number" min="1" value="${Number(g.start_question||1)}"></label>
      <label>End Question No.<input id="v3-gend-${g.id}" type="number" min="1" value="${Number(g.end_question||1)}"></label>
      <label>Group Order<input id="v3-gorder-${g.id}" type="number" min="1" value="${Number(g.group_order||1)}"></label>
      <label>Question Type<select id="v3-gtype-${g.id}" onchange="v3RefreshGroupType('${g.id}')">${typeOptions}</select></label>
    </div>
    <label>Instructions<textarea id="v3-ginst-${g.id}" style="min-height:80px" placeholder="e.g. Complete the notes below.\nWrite ONE WORD AND/OR A NUMBER for each answer.">${v3Esc(g.instructions||'')}</textarea></label>
    <label>Group Content / Notes / Heading<textarea id="v3-gcontent-${g.id}" style="min-height:170px" placeholder="Example:\nEasylet Accommodation Agency\n\nCheapest properties: £ [BLANK 1] per week\n\nMinimum period of contract: [BLANK 2]\n\nOffice open Saturdays until [BLANK 3]\n\nList of properties available on the [BLANK 4]">${v3Esc(g.content||'')}</textarea></label>
    ${isCompletion ? inlineBlankHelpV3(g.id) : ''}
    <div class="v3-grid"><label>Image URL<input id="v3-gimage-${g.id}" value="${v3Attr(g.image_url||'')}"></label><label>Audio Start (sec)<input id="v3-gastart-${g.id}" type="number" min="0" step="0.1" value="${g.audio_start_seconds??''}"></label><label>Audio End (sec)<input id="v3-gaend-${g.id}" type="number" min="0" step="0.1" value="${g.audio_end_seconds??''}"></label></div>
    <div id="v3-gtypepanel-${g.id}">${v3TypeFields(g)}</div>
    <div class="v3-row"><button type="button" class="save-button" onclick="v3SaveGroup('${g.id}')">💾 Save Group + Options</button><span class="muted">${qs.length} question(s) / blank(s)</span></div>
    <div id="v3-gquestions-${g.id}">${qs.map(q=>v3QuestionEditor(q,g)).join('')||'<div class="muted" style="padding:12px">No questions yet. Click + Add Question / Blank.</div>'}</div>
  </div>`;
};

/* Override Student renderer: completion/sentence/summary groups render their answer boxes inline. */
function renderStudentTestRunnerInlineBlanks(){
  const app=document.getElementById('app'), state=studentTestState;
  if(!app||!state?.data) return;
  const {test,sections}=state.data;
  if(test.module==='writing') return renderV3WritingRunner();
  const s=sections[state.currentSection];
  const isL=test.module==='listening';
  const groups=state.data.groups.filter(g=>g.section_id===s.id).sort((a,b)=>Number(a.group_order)-Number(b.group_order));
  const qs=state.data.questions.filter(q=>q.section_id===s.id).sort((a,b)=>Number(a.question_number)-Number(b.question_number));
  const groupBlock = groups.map(g=>{
    const gqs=qs.filter(q=>q.group_id===g.id || (Number(q.question_number)>=Number(g.start_question)&&Number(q.question_number)<=Number(g.end_question)));
    const type=String(g.question_type||'');
    const inline=/completion|summary_completion|sentence_completion/.test(type);
    if(inline){
      return `<div class="v3-inline-group"><h3>Questions ${Number(g.start_question)}–${Number(g.end_question)}</h3>${g.instructions?`<div class="v3-instructions">${v3Esc(g.instructions)}</div>`:''}<div class="v3-rich inline-blank-content">${renderInlineBlankContentV3(g.content||'',gqs,g.id)}</div>${g.image_url?`<img src="${v3Attr(g.image_url)}" style="max-width:100%;margin-top:12px">`:''}</div>`;
    }
    return `<div class="v3-inline-group"><h3>Questions ${Number(g.start_question)}–${Number(g.end_question)}</h3>${g.instructions?`<div class="v3-instructions">${v3Esc(g.instructions)}</div>`:''}${g.content?`<div class="v3-rich">${v3Esc(g.content)}</div>`:''}${g.image_url?`<img src="${v3Attr(g.image_url)}" style="max-width:100%;margin-top:12px">`:''}<div class="v3-question-list">${gqs.map(q=>v3RenderQuestion(q,g)).join('')}</div></div>`;
  }).join('');
  const standalone=groups.length?'':qs.map(q=>v3RenderQuestion(q,null)).join('');
  app.innerHTML=`<div class="dashboard"><header class="dashboard-header"><div><h1>${v3Esc(test.title)}</h1><p>${state.preview?'Student View Preview':'Student Test'}</p></div><div class="user-area"><button type="button" onclick="exitStudentTest()">← ${state.preview?'Back to Admin':'Dashboard'}</button></div></header><main class="dashboard-content">${state.preview?'<div class="v3-preview-banner">Preview Mode — same renderer as Student Test.</div>':''}<div class="v3-nav">${sections.map((x,i)=>`<button type="button" class="${i===state.currentSection?'save-button':'cancel-button'}" onclick="switchStudentSection(${i})">${isL?'Part':'Passage'} ${i+1}</button>`).join('')}</div><div class="v3-split"><section class="v3-pane">${isL&&s.audio_url?`<audio id="v3-audio" controls ${v3Json(s.audio_config,{}).controlled?'controlsList="nodownload noplaybackrate"':''} src="${v3Attr(s.audio_url)}" style="width:100%"></audio>`:''}<h2>${v3Esc(s.title||'')}</h2>${s.instructions?`<div class="v3-instructions">${v3Esc(s.instructions)}</div>`:''}${s.image_url?`<img src="${v3Attr(s.image_url)}" style="max-width:100%;border-radius:8px">`:''}${s.content?`<div class="v3-rich">${v3Esc(s.content)}</div>`:''}</section><section class="v3-pane"><h2>Questions</h2>${groupBlock||standalone}</section></div><div class="v3-nav"><button type="button" class="cancel-button" ${state.currentSection===0?'disabled':''} onclick="switchStudentSection(${state.currentSection-1})">← Previous</button>${state.currentSection<sections.length-1?`<button type="button" class="save-button" onclick="switchStudentSection(${state.currentSection+1})">Next →</button>`:state.preview?`<button type="button" class="save-button" onclick="exitStudentTest()">Finish Preview</button>`:`<button type="button" class="save-button" onclick="submitStudentTest()">Submit Test</button>`}</div></main></div>`;
}
window.renderStudentTestRunner = renderStudentTestRunnerInlineBlanks;

/* Make the inline blank feature available to existing Preview/Test flows. */
window.adminQuestionGroupEditor = adminQuestionGroupEditor;

