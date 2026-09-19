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

                await openAdminListeningTests(profile);

                return;
            }

            if (module === "reading") {

                await openAdminModuleTests(profile, "reading");

                return;
            }

            if (module === "writing") {

                await openAdminModuleTests(profile, "writing");

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
            .select("id, title, module, description, duration_minutes, total_questions, is_published, created_by, created_at")
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
                    ${test.is_published ? "Published" : "Draft"}
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

                <td>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button type="button" class="module-btn" data-edit-listening-test="${test.id}">Edit / Manage</button>
                        <button type="button" class="cancel-button" data-delete-listening-test="${test.id}" style="color:#b91c1c;border-color:#fecaca;">Delete Test</button>
                    </div>
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
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

            </div>
        `;

        content.querySelectorAll("[data-edit-listening-test]").forEach(button => {
            button.addEventListener("click", () =>
                openListeningTestEditor(button.dataset.editListeningTest, profile)
            );
        });

        content.querySelectorAll("[data-delete-listening-test]").forEach(button => {
            button.addEventListener("click", () =>
                deleteCompleteTest(button.dataset.deleteListeningTest, "Listening", profile)
            );
        });

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
// COMPLETE TEST DELETE / ADMIN CRUD HELPERS
// ============================================

async function deleteCompleteTest(testId, moduleName, profile) {
    const confirmed = confirm(
        `Delete the entire ${moduleName} test?\n\nThis permanently removes the test, its sections/parts, questions, options and associated student result records. This cannot be undone.`
    );
    if (!confirmed) return;

    const second = prompt(`Type DELETE to permanently remove this ${moduleName} test.`);
    if (second !== "DELETE") return;

    try {
        const { data: sections, error: sectionError } = await supabaseClient
            .from("sections").select("id").eq("test_id", testId);
        if (sectionError) throw sectionError;

        const sectionIds = (sections || []).map(x => x.id);
        if (sectionIds.length) {
            const { data: qs, error: qError } = await supabaseClient
                .from("questions").select("id").in("section_id", sectionIds);
            if (qError) throw qError;
            const qIds = (qs || []).map(x => x.id);
            if (qIds.length) {
                const { error: ao } = await supabaseClient.from("options").delete().in("question_id", qIds);
                if (ao) throw ao;
                const { error: aq } = await supabaseClient.from("answers").delete().in("question_id", qIds);
                if (aq) throw aq;
                const { error: dq } = await supabaseClient.from("questions").delete().in("id", qIds);
                if (dq) throw dq;
            }
            const { error: ds } = await supabaseClient.from("sections").delete().in("id", sectionIds);
            if (ds) throw ds;
        }

        const { error: resultsError } = await supabaseClient.from("results").delete().eq("test_id", testId);
        if (resultsError) throw resultsError;
        const { error: writingError } = await supabaseClient.from("writing_submissions").delete().eq("test_id", testId);
        if (writingError) throw writingError;
        const { error: testError } = await supabaseClient.from("tests").delete().eq("id", testId);
        if (testError) throw testError;

        alert(`${moduleName} test deleted successfully.`);
        if (moduleName === "Listening") await openAdminListeningTests(profile);
        else await openAdminModuleTests(profile, moduleName.toLowerCase());
    } catch (error) {
        console.error("Delete Complete Test Error:", error);
        alert(error.message || "Unable to delete the test. Check your Supabase RLS policies.");
    }
}

// Generic admin manager for Reading/Writing tests. This gives full test-level
// create/edit/delete control while their detailed builders are added below.
async function openAdminModuleTests(profile, module) {
    const label = module === "reading" ? "Reading" : "Writing";
    const message = document.getElementById("dashboardMessage");
    message.innerHTML = `<div class="students-panel"><div class="students-panel-header"><div><h2>${label === "Reading" ? "📖" : "✍️"} ${label} Tests</h2><p>Create, edit, publish/unpublish and delete ${label} tests.</p></div><button type="button" class="add-student-button" id="createGenericTestButton">+ Create ${label} Test</button></div><div id="genericTestsContent"><div class="coming-soon">Loading...</div></div></div>`;
    document.getElementById("createGenericTestButton").addEventListener("click", () => createGenericTest(profile, module));
    try {
        const { data: tests, error } = await supabaseClient.from("tests").select("id,title,module,description,duration_minutes,total_questions,is_published,created_at").eq("module", module).order("created_at", {ascending:false});
        if (error) throw error;
        const content = document.getElementById("genericTestsContent");
        content.innerHTML = tests?.length ? `<div class="students-table-wrapper"><table class="students-table"><thead><tr><th>Test</th><th>Status</th><th>Duration</th><th>Actions</th></tr></thead><tbody>${tests.map(t => `<tr><td>${escapeHtml(t.title||"-")}</td><td>${t.is_published?"Published":"Draft"}</td><td>${t.duration_minutes||0} min</td><td><button type="button" class="module-btn" data-generic-edit="${t.id}">Edit / Manage</button> <button type="button" class="cancel-button" data-generic-delete="${t.id}" style="color:#b91c1c;border-color:#fecaca;">Delete Test</button></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-test-state"><div class="empty-icon">${label==="Reading"?"📖":"✍️"}</div><h2>No ${label} Tests Yet</h2></div>`;
        content.querySelectorAll("[data-generic-edit]").forEach(b => b.addEventListener("click", () => openGenericTestEditor(b.dataset.genericEdit, profile, module)));
        content.querySelectorAll("[data-generic-delete]").forEach(b => b.addEventListener("click", () => deleteCompleteTest(b.dataset.genericDelete, label, profile)));
    } catch (error) { document.getElementById("genericTestsContent").innerHTML = `<div class="coming-soon"><strong>Unable to load ${label} Tests</strong><p>${escapeHtml(error.message||"Unknown error")}</p></div>`; }
}

async function createGenericTest(profile, module) {
    const label = module === "reading" ? "Reading" : "Writing";
    const title = prompt(`Enter ${label} Test title:`, `${label} Test 01`);
    if (!title || !title.trim()) return;
    const duration = module === "reading" ? 60 : 60;
    const total = module === "reading" ? 40 : 0;
    try {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        const session = sessionData?.session; if (!session) throw new Error("Your login session has expired.");
        const { data:test,error } = await supabaseClient.from("tests").insert({title:title.trim(),module,description:null,duration_minutes:duration,total_questions:total,is_published:false,created_by:session.user.id}).select().single();
        if(error) throw error;
        const count = module === "reading" ? 3 : 2;
        const rows = Array.from({length:count},(_,i)=>({test_id:test.id,section_number:i+1,title:module==="reading"?`Reading Passage ${i+1}`:`Writing Task ${i+1}`,instructions:"",content:null,audio_url:null,image_url:null}));
        const {error:se} = await supabaseClient.from("sections").insert(rows); if(se) throw se;
        await openGenericTestEditor(test.id, profile, module);
    } catch(error) { alert(error.message||`Unable to create ${label} test.`); }
}

async function openGenericTestEditor(testId, profile, module) {
    const label = module === "reading" ? "Reading" : "Writing";
    const message = document.getElementById("dashboardMessage");
    const {data:test,error:te}=await supabaseClient.from("tests").select("*").eq("id",testId).single(); if(te){alert(te.message);return;}
    const {data:sections,error:se}=await supabaseClient.from("sections").select("*").eq("test_id",testId).order("section_number"); if(se){alert(se.message);return;}
    message.innerHTML = `<div class="students-panel"><div class="students-panel-header"><div><h2>${module==="reading"?"📖":"✍️"} ${label} Test Editor</h2><p>Edit every test-level setting and ${module==="reading"?"all three passages":"both writing tasks"}.</p></div><button type="button" class="cancel-button" id="backGeneric">← ${label} Tests</button></div><div class="form-group"><label>Test Title</label><input id="genericTitle" value="${escapeHtml(test.title||"")}"></div><div class="form-group"><label>Description</label><textarea id="genericDescription" rows="3">${escapeHtml(test.description||"")}</textarea></div><div class="form-group"><label>Duration (minutes)</label><input id="genericDuration" type="number" min="1" value="${test.duration_minutes||60}"></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0;"><button type="button" class="save-button" id="saveGenericTest">Save Test Details</button><button type="button" class="module-btn" id="toggleGenericPublish">${test.is_published?"Unpublish":"Publish"}</button><button type="button" class="cancel-button" id="deleteGenericTest" style="color:#b91c1c;border-color:#fecaca;">🗑 Delete Entire Test</button></div><div id="genericTestMsg" class="login-message"></div><h3>${module==="reading"?"Passages":"Tasks"}</h3><div id="genericSections">${sections.map(s=>`<div style="border:1px solid #e5e7eb;border-radius:14px;padding:16px;margin-bottom:14px;background:#fff;"><h4>${escapeHtml(s.title||`${label} Section ${s.section_number}`)}</h4><div class="form-group"><label>Title</label><input id="gtitle${s.id}" value="${escapeHtml(s.title||"")}"></div><div class="form-group"><label>Instructions</label><textarea id="ginstructions${s.id}" rows="2">${escapeHtml(s.instructions||"")}</textarea></div><div class="form-group"><label>${module==="reading"?"Passage Text / Content":"Task Prompt / Content"}</label><textarea id="gcontent${s.id}" rows="8">${escapeHtml(s.content||"")}</textarea></div><div class="form-group"><label>Image URL (optional)</label><input id="gimage${s.id}" value="${escapeHtml(s.image_url||"")}"></div><button type="button" class="save-button" data-save-section="${s.id}">Save ${module==="reading"?"Passage":"Task"}</button></div>`).join("")}</div></div>`;
    document.getElementById("backGeneric").addEventListener("click",()=>openAdminModuleTests(profile,module));
    document.getElementById("saveGenericTest").addEventListener("click",async()=>{const {error}=await supabaseClient.from("tests").update({title:document.getElementById("genericTitle").value.trim(),description:document.getElementById("genericDescription").value.trim()||null,duration_minutes:Number(document.getElementById("genericDuration").value)||60}).eq("id",test.id);if(error){alert(error.message);return;}alert("Test details saved.");openGenericTestEditor(test.id,profile,module);});
    document.getElementById("toggleGenericPublish").addEventListener("click",async()=>{const {error}=await supabaseClient.from("tests").update({is_published:!test.is_published}).eq("id",test.id);if(error){alert(error.message);return;}openGenericTestEditor(test.id,profile,module);});
    document.getElementById("deleteGenericTest").addEventListener("click",()=>deleteCompleteTest(test.id,label,profile));
    document.querySelectorAll("[data-save-section]").forEach(b=>b.addEventListener("click",async()=>{const id=b.dataset.saveSection;const {error}=await supabaseClient.from("sections").update({title:document.getElementById("gtitle"+id).value.trim(),instructions:document.getElementById("ginstructions"+id).value.trim(),content:document.getElementById("gcontent"+id).value.trim()||null,image_url:document.getElementById("gimage"+id).value.trim()||null}).eq("id",id);if(error)alert(error.message);else {b.textContent="Saved ✓";setTimeout(()=>b.textContent=`Save ${module==="reading"?"Passage":"Task"}`,800);}}));
}

// ============================================
// CREATE LISTENING TEST
// ============================================

function openCreateListeningTestForm(profile) {

    const message = document.getElementById("dashboardMessage");

    message.innerHTML = `
        <div class="students-panel">

            <div class="students-panel-header">

                <div>
                    <h2>🎧 Create Listening Test</h2>
                    <p>Step 1 — Create the test and Parts 1–4.</p>
                </div>

                <button
                    type="button"
                    class="cancel-button"
                    id="cancelListeningTestButton"
                >
                    Cancel
                </button>

            </div>

            <form id="createListeningTestForm" class="student-form">

                <div class="form-group">
                    <label for="listeningTestTitle">Test Title</label>
                    <input
                        type="text"
                        id="listeningTestTitle"
                        placeholder="Example: Listening Test 02"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="listeningTestDescription">Description</label>
                    <textarea
                        id="listeningTestDescription"
                        rows="4"
                        placeholder="Enter test description"
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
                        Create Test + Parts
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
            event => saveListeningTest(event, profile)
        );
}


async function saveListeningTest(event, profile) {

    event.preventDefault();

    const title =
        document.getElementById("listeningTestTitle")
            .value.trim();

    const description =
        document.getElementById("listeningTestDescription")
            .value.trim();

    const duration =
        Number(
            document.getElementById("listeningTestDuration")
                .value
        );

    const saveButton =
        document.getElementById("saveListeningTestButton");

    const formMessage =
        document.getElementById("listeningTestFormMessage");

    if (!title) {
        formMessage.textContent = "Please enter a test title.";
        formMessage.style.color = "#dc2626";
        return;
    }

    if (!duration || duration < 1) {
        formMessage.textContent = "Please enter a valid duration.";
        formMessage.style.color = "#dc2626";
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Creating...";

    try {

        const {
            data: sessionData,
            error: sessionError
        } = await supabaseClient.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData.session;

        if (!session) {
            throw new Error(
                "Your login session has expired. Please login again."
            );
        }

        const {
            data: test,
            error: testError
        } = await supabaseClient
            .from("tests")
            .insert({
                title,
                module: "listening",
                description: description || null,
                duration_minutes: duration,
                total_questions: 40,
                is_published: false,
                created_by: session.user.id
            })
            .select()
            .single();

        if (testError) throw testError;

        const parts = [
            {
                test_id: test.id,
                section_number: 1,
                title: "Listening Part 1",
                instructions: "Questions 1–10",
                content: null,
                audio_url: null,
                image_url: null
            },
            {
                test_id: test.id,
                section_number: 2,
                title: "Listening Part 2",
                instructions: "Questions 11–20",
                content: null,
                audio_url: null,
                image_url: null
            },
            {
                test_id: test.id,
                section_number: 3,
                title: "Listening Part 3",
                instructions: "Questions 21–30",
                content: null,
                audio_url: null,
                image_url: null
            },
            {
                test_id: test.id,
                section_number: 4,
                title: "Listening Part 4",
                instructions: "Questions 31–40",
                content: null,
                audio_url: null,
                image_url: null
            }
        ];

        const {
            error: sectionError
        } = await supabaseClient
            .from("sections")
            .insert(parts);

        if (sectionError) {

            await supabaseClient
                .from("tests")
                .delete()
                .eq("id", test.id);

            throw sectionError;
        }

        formMessage.textContent =
            "Test and Parts 1–4 created successfully.";

        formMessage.style.color = "#15803d";

        setTimeout(
            () => openListeningTestEditor(
                test.id,
                profile
            ),
            600
        );

    } catch (error) {

        console.error(
            "Create Listening Test Error:",
            error
        );

        formMessage.textContent =
            error.message ||
            "Unable to create Listening Test.";

        formMessage.style.color = "#dc2626";

        saveButton.disabled = false;
        saveButton.textContent = "Create Test + Parts";
    }
}


// ============================================
// LISTENING TEST EDITOR
// ============================================

async function openListeningTestEditor(testId, profile) {

    const message =
        document.getElementById("dashboardMessage");

    message.innerHTML = `
        <div class="students-panel">

            <div class="students-panel-header">

                <div>
                    <h2>🎧 Listening Test Editor</h2>
                    <p>Parts • Audio • Questions • Publish</p>
                </div>

                <button
                    type="button"
                    class="cancel-button"
                    id="backToListeningTests"
                >
                    ← Listening Tests
                </button>

            </div>

            <div id="listeningEditorContent">
                <div class="coming-soon">Loading...</div>
            </div>

        </div>
    `;

    document
        .getElementById("backToListeningTests")
        .addEventListener(
            "click",
            () => openAdminListeningTests(profile)
        );

    try {

        const {
            data: test,
            error: testError
        } = await supabaseClient
            .from("tests")
            .select(
                "id, title, module, description, duration_minutes, total_questions, is_published"
            )
            .eq("id", testId)
            .single();

        if (testError) throw testError;

        const {
            data: sections,
            error: sectionError
        } = await supabaseClient
            .from("sections")
            .select(
                "id, test_id, section_number, title, instructions, content, audio_url, image_url"
            )
            .eq("test_id", testId)
            .order("section_number", { ascending: true });

        if (sectionError) throw sectionError;

        const {
            data: questionRows,
            error: questionError
        } = await supabaseClient
            .from("questions")
            .select("id, section_id, question_number, question_type, question_text, marks")
            .in(
                "section_id",
                (sections || []).map(section => section.id)
            );

        if (questionError) throw questionError;

        const questionCount = (questionRows || []).length;

        document
            .getElementById("listeningEditorContent")
            .innerHTML = `

            <div class="dashboard-title">
                <h2>${escapeHtml(test.title)}</h2>
                <p>
                    ${escapeHtml(test.description || "")}
                </p>
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;margin:15px 0;">
                <button type="button" class="module-btn" id="editListeningTestDetailsButton">✏️ Edit Test Details</button>
                <button type="button" class="cancel-button" id="deleteListeningTestFromEditor" style="color:#b91c1c;border-color:#fecaca;">🗑 Delete Entire Test</button>
            </div>

            <div id="listeningTestDetailsEditor" style="display:none;border:1px solid #e5e7eb;border-radius:14px;padding:18px;margin-bottom:20px;background:#fff;">
                <h3>Edit Test Details</h3>
                <div class="form-group"><label>Test Title</label><input id="editListeningTitle" value="${escapeHtml(test.title || "")}"></div>
                <div class="form-group"><label>Description</label><textarea id="editListeningDescription" rows="3">${escapeHtml(test.description || "")}</textarea></div>
                <div class="form-group"><label>Duration (Minutes)</label><input id="editListeningDuration" type="number" min="1" value="${test.duration_minutes || 40}"></div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button type="button" class="save-button" id="saveListeningDetailsButton">Save Test Details</button>
                    <button type="button" class="cancel-button" id="cancelListeningDetailsButton">Cancel</button>
                </div>
                <div id="listeningDetailsMessage" class="login-message"></div>
            </div>

            <div
                style="
                    display:grid;
                    grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
                    gap:12px;
                    margin-bottom:25px;
                "
            >

                <div class="coming-soon">
                    <strong>Questions</strong>
                    <p>${questionCount} / 40</p>
                </div>

                <div class="coming-soon">
                    <strong>Duration</strong>
                    <p>${test.duration_minutes || 40} minutes</p>
                </div>

                <div class="coming-soon">
                    <strong>Status</strong>
                    <p>${test.is_published ? "Published" : "Draft"}</p>
                </div>

            </div>

            <div class="dashboard-grid">

                ${(sections || []).map(section => {

                    const start =
                        ((section.section_number - 1) * 10) + 1;

                    const end =
                        section.section_number * 10;

                    const count =
                        (questionRows || [])
                            .filter(
                                question =>
                                    question.section_id === section.id
                            )
                            .length;

                    return `
                        <button
                            type="button"
                            class="dashboard-card"
                            data-section-id="${section.id}"
                        >

                            <span class="card-icon">🎧</span>

                            <strong>
                                ${escapeHtml(section.title)}
                            </strong>

                            <small>
                                Questions ${start}–${end}
                            </small>

                            <small>
                                ${count} / 10 Questions
                            </small>

                            <small>
                                ${
                                    section.audio_url
                                        ? "🔊 Audio Added"
                                        : "⚠️ Audio Missing"
                                }
                            </small>

                        </button>
                    `;

                }).join("")}

            </div>

            <div
                style="
                    margin-top:25px;
                    padding:20px;
                    border:1px solid #e5e7eb;
                    border-radius:14px;
                    background:#fff;
                "
            >

                <strong>Publish Test</strong>

                <p style="color:#64748b;">
                    Publish only after all 4 Parts have audio
                    and exactly 40 questions.
                </p>

                <button
                    type="button"
                    class="module-btn"
                    id="publishListeningTestButton"
                >
                    ${
                        test.is_published
                            ? "Unpublish Test"
                            : "Publish Test"
                    }
                </button>

                <div
                    id="publishListeningMessage"
                    class="login-message"
                ></div>

            </div>
        `;

        document
            .querySelectorAll("[data-section-id]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => openListeningSectionEditor(
                        button.dataset.sectionId,
                        test,
                        profile
                    )
                );

            });

        document.getElementById("editListeningTestDetailsButton").addEventListener("click", () => {
            document.getElementById("listeningTestDetailsEditor").style.display = "block";
        });
        document.getElementById("cancelListeningDetailsButton").addEventListener("click", () => {
            document.getElementById("listeningTestDetailsEditor").style.display = "none";
        });
        document.getElementById("saveListeningDetailsButton").addEventListener("click", async () => {
            const msg = document.getElementById("listeningDetailsMessage");
            const title = document.getElementById("editListeningTitle").value.trim();
            const description = document.getElementById("editListeningDescription").value.trim();
            const duration = Number(document.getElementById("editListeningDuration").value);
            if (!title || !duration || duration < 1) { msg.textContent = "Title and valid duration are required."; msg.style.color="#dc2626"; return; }
            const { error } = await supabaseClient.from("tests").update({title, description: description || null, duration_minutes: duration}).eq("id", test.id);
            if (error) { msg.textContent = error.message; msg.style.color="#dc2626"; return; }
            msg.textContent = "Test details saved."; msg.style.color="#15803d";
            setTimeout(() => openListeningTestEditor(test.id, profile), 500);
        });
        document.getElementById("deleteListeningTestFromEditor").addEventListener("click", () =>
            deleteCompleteTest(test.id, "Listening", profile)
        );

        document
            .getElementById("publishListeningTestButton")
            .addEventListener(
                "click",
                () => toggleListeningPublish(
                    test,
                    sections || [],
                    questionRows || [],
                    profile
                )
            );

    } catch (error) {

        console.error(
            "Listening Editor Error:",
            error
        );

        document
            .getElementById("listeningEditorContent")
            .innerHTML = `
                <div class="coming-soon">
                    <strong>Unable to load test</strong>
                    <p>${escapeHtml(error.message || "Unknown error")}</p>
                </div>
            `;
    }
}


async function toggleListeningPublish(
    test,
    sections,
    questions,
    profile
) {

    const message =
        document.getElementById("publishListeningMessage");

    if (!test.is_published) {

        if (sections.length !== 4) {
            message.textContent =
                "The test must have exactly 4 Parts.";
            message.style.color = "#dc2626";
            return;
        }

        if (questions.length !== 40) {
            message.textContent =
                `The test currently has ${questions.length} questions. Exactly 40 are required.`;
            message.style.color = "#dc2626";
            return;
        }

        const missingAudio =
            sections.some(
                section => !section.audio_url
            );

        if (missingAudio) {
            message.textContent =
                "Add audio to all 4 Parts before publishing.";
            message.style.color = "#dc2626";
            return;
        }
    }

    const {
        error
    } = await supabaseClient
        .from("tests")
        .update({
            is_published: !test.is_published
        })
        .eq("id", test.id);

    if (error) {
        message.textContent = error.message;
        message.style.color = "#dc2626";
        return;
    }

    openListeningTestEditor(
        test.id,
        profile
    );
}


// ============================================
// LISTENING PART EDITOR
// ============================================

async function openListeningSectionEditor(
    sectionId,
    test,
    profile
) {

    const message =
        document.getElementById("dashboardMessage");

    message.innerHTML = `
        <div class="students-panel">

            <div class="students-panel-header">

                <div>
                    <h2>🎧 Part Editor</h2>
                    <p>Audio + Questions</p>
                </div>

                <button
                    type="button"
                    class="cancel-button"
                    id="backToListeningEditor"
                >
                    ← Test Editor
                </button>

            </div>

            <div id="sectionEditorContent">
                <div class="coming-soon">Loading...</div>
            </div>

        </div>
    `;

    document
        .getElementById("backToListeningEditor")
        .addEventListener(
            "click",
            () => openListeningTestEditor(
                test.id,
                profile
            )
        );

    try {

        const {
            data: section,
            error: sectionError
        } = await supabaseClient
            .from("sections")
            .select(
                "id, test_id, section_number, title, instructions, content, audio_url, image_url"
            )
            .eq("id", sectionId)
            .single();

        if (sectionError) throw sectionError;

        const {
            data: questions,
            error: questionError
        } = await supabaseClient
            .from("questions")
            .select(
                "id, section_id, question_number, question_type, question_text, marks, correct_answer, explanation, image_url"
            )
            .eq("section_id", sectionId)
            .order("question_number", { ascending: true });

        if (questionError) throw questionError;

        document
            .getElementById("sectionEditorContent")
            .innerHTML = `

            <form
                id="sectionSettingsForm"
                class="student-form"
            >

                <div class="form-group">
                    <label>Part Title</label>

                    <input
                        id="sectionTitle"
                        value="${escapeHtml(section.title || "")}"
                        required
                    >
                </div>

                <div class="form-group">
                    <label>Part Instructions</label>

                    <textarea
                        id="sectionInstructions"
                        rows="3"
                    >${escapeHtml(section.instructions || "")}</textarea>
                </div>

                <div class="form-group">
                    <label>Audio URL</label>

                    <input
                        type="url"
                        id="sectionAudioUrl"
                        value="${escapeHtml(section.audio_url || "")}"
                        placeholder="Paste public/signed audio URL"
                    >
                </div>

                <div class="form-group">
                    <label>Image URL (optional)</label>

                    <input
                        type="url"
                        id="sectionImageUrl"
                        value="${escapeHtml(section.image_url || "")}"
                    >
                </div>

                <div class="form-group">
                    <label>Part Content / Notes (optional)</label>

                    <textarea
                        id="sectionContent"
                        rows="4"
                    >${escapeHtml(section.content || "")}</textarea>
                </div>

                <div class="student-form-actions">
                    <button
                        type="submit"
                        class="save-button"
                    >
                        Save Part
                    </button>
                </div>

                <div
                    id="sectionSettingsMessage"
                    class="login-message"
                ></div>

            </form>

            <div
                class="students-panel-header"
                style="margin-top:25px;margin-bottom:15px;"
            >

                <div>
                    <h2>Questions</h2>
                    <p>
                        Questions ${
                            ((section.section_number - 1) * 10) + 1
                        }–${section.section_number * 10}
                    </p>
                </div>

                <button
                    type="button"
                    class="add-student-button"
                    id="addListeningQuestionButton"
                >
                    + Add Question
                </button>

            </div>

            <div id="listeningQuestionsList"></div>
        `;

        document
            .getElementById("sectionSettingsForm")
            .addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    const settingsMessage =
                        document.getElementById(
                            "sectionSettingsMessage"
                        );

                    const {
                        error
                    } = await supabaseClient
                        .from("sections")
                        .update({
                            title:
                                document
                                    .getElementById("sectionTitle")
                                    .value.trim(),

                            instructions:
                                document
                                    .getElementById("sectionInstructions")
                                    .value.trim(),

                            audio_url:
                                document
                                    .getElementById("sectionAudioUrl")
                                    .value.trim() || null,

                            image_url:
                                document
                                    .getElementById("sectionImageUrl")
                                    .value.trim() || null,

                            content:
                                document
                                    .getElementById("sectionContent")
                                    .value.trim() || null
                        })
                        .eq("id", section.id);

                    if (error) {

                        settingsMessage.textContent =
                            error.message;

                        settingsMessage.style.color =
                            "#dc2626";

                        return;
                    }

                    settingsMessage.textContent =
                        "Part saved successfully.";

                    settingsMessage.style.color =
                        "#15803d";
                }
            );

        document
            .getElementById("addListeningQuestionButton")
            .addEventListener(
                "click",
                () => {

                    if ((questions || []).length >= 10) {
                        alert(
                            `Part ${section.section_number} already has 10 questions. Delete an existing question before adding another.`
                        );
                        return;
                    }

                    openListeningQuestionForm(
                        section,
                        test,
                        profile
                    );
                }
            );

        renderListeningQuestions(
            questions || [],
            section,
            test,
            profile
        );

    } catch (error) {

        console.error(
            "Section Editor Error:",
            error
        );

        document
            .getElementById("sectionEditorContent")
            .innerHTML = `
                <div class="coming-soon">
                    <strong>Unable to load Part</strong>
                    <p>${escapeHtml(error.message || "Unknown error")}</p>
                </div>
            `;
    }
}


// ============================================
// LISTENING QUESTION LIST
// ============================================

function renderListeningQuestions(
    questions,
    section,
    test,
    profile
) {

    const container =
        document.getElementById(
            "listeningQuestionsList"
        );

    if (!questions.length) {

        container.innerHTML = `
            <div class="empty-test-state">
                <div class="empty-icon">📝</div>
                <h2>No Questions Yet</h2>
                <p>Add up to 10 questions for this Part.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = questions.map(question => `

        <div
            style="
                border:1px solid #e5e7eb;
                border-radius:14px;
                padding:18px;
                margin-bottom:14px;
                background:#fff;
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:15px;
                    flex-wrap:wrap;
                    align-items:flex-start;
                "
            >

                <div style="flex:1;min-width:240px;">
                    <strong>
                        Q${question.question_number}
                    </strong>

                    <span style="margin-left:10px;">
                        ${escapeHtml(question.question_type)}
                    </span>

                    <p style="margin:8px 0;">
                        ${escapeHtml(question.question_text || "")}
                    </p>

                    <small>
                        Marks: ${question.marks || 1}
                    </small>
                </div>

                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button
                        type="button"
                        class="module-btn"
                        data-edit-question="${question.id}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="cancel-button"
                        data-delete-question="${question.id}"
                        style="color:#b91c1c;border-color:#fecaca;"
                    >
                        Delete
                    </button>
                </div>

            </div>

        </div>

    `).join("");

    container
        .querySelectorAll("[data-edit-question]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => openListeningQuestionForm(
                    section,
                    test,
                    profile,
                    button.dataset.editQuestion
                )
            );

        });

    container
        .querySelectorAll("[data-delete-question]")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const confirmed = confirm(
                        `Delete Question ${button.closest('div[style*="border:1px solid"]')?.querySelector('strong')?.textContent || ""}?\n\nThis question and all its options will be permanently deleted.`
                    );

                    if (!confirmed) return;

                    try {

                        const { error } = await supabaseClient
                            .from("questions")
                            .delete()
                            .eq("id", button.dataset.deleteQuestion);

                        if (error) throw error;

                        await openListeningSectionEditor(
                            section.id,
                            test,
                            profile
                        );

                    } catch (error) {

                        console.error(
                            "Delete Question Error:",
                            error
                        );

                        alert(
                            error.message ||
                            "Unable to delete question."
                        );
                    }
                }
            );

        });
}


// ============================================
// LISTENING QUESTION FORM
// ============================================

async function openListeningQuestionForm(
    section,
    test,
    profile,
    questionId = null
) {

    const message =
        document.getElementById("dashboardMessage");

    message.innerHTML = `
        <div class="students-panel">

            <div class="students-panel-header">

                <div>
                    <h2>
                        📝 ${
                            questionId
                                ? "Edit Question"
                                : "Add Question"
                        }
                    </h2>

                    <p>${escapeHtml(section.title)}</p>
                </div>

                <button
                    type="button"
                    class="cancel-button"
                    id="cancelQuestionForm"
                >
                    ← Back
                </button>

            </div>

            <form
                id="listeningQuestionForm"
                class="student-form"
            >

                <div class="form-group">
                    <label>Question Number</label>

                    <input
                        type="number"
                        id="questionNumber"
                        min="${
                            ((section.section_number - 1) * 10) + 1
                        }"
                        max="${section.section_number * 10}"
                        required
                    >
                </div>

                <div class="form-group">
                    <label>Question Type</label>

                    <select id="questionType" required>

                        <option value="short_answer">
                            Short Answer
                        </option>

                        <option value="multiple_choice">
                            Multiple Choice
                        </option>

                        <option value="true_false_not_given">
                            True / False / Not Given
                        </option>

                        <option value="yes_no_not_given">
                            Yes / No / Not Given
                        </option>

                        <option value="matching">
                            Matching
                        </option>

                        <option value="completion">
                            Completion
                        </option>

                    </select>
                </div>

                <div class="form-group">
                    <label>Question Text</label>

                    <textarea
                        id="questionText"
                        rows="5"
                        required
                    ></textarea>
                </div>

                <div class="form-group">
                    <label>Marks</label>

                    <input
                        type="number"
                        id="questionMarks"
                        value="1"
                        min="1"
                        required
                    >
                </div>

                <div class="form-group">
                    <label>Correct Answer</label>

                    <input
                        type="text"
                        id="correctAnswer"
                        placeholder="Example: A / TRUE / answer"
                        required
                    >
                </div>

                <div class="form-group">
                    <label>Explanation (optional)</label>

                    <textarea
                        id="questionExplanation"
                        rows="3"
                    ></textarea>
                </div>

                <div class="form-group">
                    <label>Image URL (optional)</label>

                    <input
                        type="url"
                        id="questionImageUrl"
                    >
                </div>

                <div id="questionOptionsArea"></div>

                <div class="student-form-actions">

                    <button
                        type="button"
                        id="cancelQuestionForm2"
                        class="cancel-button"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        id="saveQuestionButton"
                        class="save-button"
                    >
                        ${questionId ? "Update" : "Save"} Question
                    </button>

                </div>

                <div
                    id="questionFormMessage"
                    class="login-message"
                ></div>

            </form>
        </div>
    `;

    const back = () =>
        openListeningSectionEditor(
            section.id,
            test,
            profile
        );

    document
        .getElementById("cancelQuestionForm")
        .addEventListener("click", back);

    document
        .getElementById("cancelQuestionForm2")
        .addEventListener("click", back);

    let existingQuestion = null;
    let existingOptions = [];

    if (questionId) {

        const {
            data: question,
            error
        } = await supabaseClient
            .from("questions")
            .select(
                "id, section_id, question_number, question_type, question_text, marks, correct_answer, explanation, image_url"
            )
            .eq("id", questionId)
            .single();

        if (error) {
            alert(error.message);
            return;
        }

        existingQuestion = question;

        const {
            data: options,
            error: optionError
        } = await supabaseClient
            .from("options")
            .select(
                "id, question_id, option_key, option_text, is_correct"
            )
            .eq("question_id", questionId)
            .order("option_key", { ascending: true });

        if (optionError) {
            alert(optionError.message);
            return;
        }

        existingOptions = options || [];

        document.getElementById("questionNumber").value =
            question.question_number;

        document.getElementById("questionType").value =
            question.question_type;

        document.getElementById("questionText").value =
            question.question_text || "";

        document.getElementById("questionMarks").value =
            question.marks || 1;

        document.getElementById("correctAnswer").value =
            question.correct_answer || "";

        document.getElementById("questionExplanation").value =
            question.explanation || "";

        document.getElementById("questionImageUrl").value =
            question.image_url || "";
    }

    function optionKey(index) {

        let n = index + 1;
        let key = "";

        while (n > 0) {
            n--;
            key = String.fromCharCode(65 + (n % 26)) + key;
            n = Math.floor(n / 26);
        }

        return key;
    }

    function renderOptions() {

        const type =
            document.getElementById("questionType").value;

        const area =
            document.getElementById("questionOptionsArea");

        if (
            type !== "multiple_choice" &&
            type !== "matching"
        ) {
            area.innerHTML = "";
            return;
        }

        const options = existingOptions.length
            ? existingOptions.map(option => ({ ...option }))
            : [
                { option_key: "A", option_text: "", is_correct: false },
                { option_key: "B", option_text: "", is_correct: false },
                { option_key: "C", option_text: "", is_correct: false },
                { option_key: "D", option_text: "", is_correct: false }
            ];

        area.innerHTML = `
            <div
                style="
                    border:1px solid #e5e7eb;
                    border-radius:12px;
                    padding:15px;
                    margin-bottom:15px;
                    background:#fafafa;
                "
            >

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:10px;
                        margin-bottom:12px;
                    "
                >
                    <strong>Options</strong>

                    <button
                        type="button"
                        class="module-btn"
                        id="addQuestionOptionButton"
                    >
                        + Add Option
                    </button>
                </div>

                <div id="dynamicQuestionOptions"></div>

                <small style="display:block;margin-top:8px;color:#64748b;">
                    You can add or remove as many options as required.
                </small>

            </div>
        `;

        const list = document.getElementById("dynamicQuestionOptions");

        function drawOptions() {

            list.innerHTML = options.map((option, index) => `
                <div
                    class="question-option-row"
                    data-option-index="${index}"
                    style="
                        display:grid;
                        grid-template-columns:60px minmax(0,1fr) auto;
                        gap:10px;
                        align-items:center;
                        margin-bottom:10px;
                    "
                >
                    <strong>${optionKey(index)}</strong>

                    <input
                        type="text"
                        class="dynamic-option-text"
                        data-index="${index}"
                        value="${escapeHtml(option.option_text || "")}"
                        placeholder="Option ${optionKey(index)}"
                    >

                    <button
                        type="button"
                        class="cancel-button dynamic-remove-option"
                        data-index="${index}"
                        style="color:#b91c1c;border-color:#fecaca;white-space:nowrap;"
                    >
                        Remove
                    </button>
                </div>
            `).join("");

            list.querySelectorAll(".dynamic-remove-option").forEach(button => {

                button.addEventListener("click", () => {

                    const index = Number(button.dataset.index);

                    if (options.length <= 2) {
                        alert("A question must have at least 2 options.");
                        return;
                    }

                    options.splice(index, 1);
                    drawOptions();
                });
            });
        }

        drawOptions();

        document
            .getElementById("addQuestionOptionButton")
            .addEventListener("click", () => {

                options.push({
                    option_key: optionKey(options.length),
                    option_text: "",
                    is_correct: false
                });

                drawOptions();
            });

        area._questionOptions = options;
    }

    document
        .getElementById("questionType")
        .addEventListener(
            "change",
            renderOptions
        );

    renderOptions();

    document
        .getElementById("listeningQuestionForm")
        .addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const message =
                    document.getElementById(
                        "questionFormMessage"
                    );

                const saveButton =
                    document.getElementById(
                        "saveQuestionButton"
                    );

                const questionNumber =
                    Number(
                        document
                            .getElementById("questionNumber")
                            .value
                    );

                const minNumber =
                    ((section.section_number - 1) * 10) + 1;

                const maxNumber =
                    section.section_number * 10;

                if (
                    questionNumber < minNumber ||
                    questionNumber > maxNumber
                ) {
                    message.textContent =
                        `Question number must be between ${minNumber} and ${maxNumber}.`;

                    message.style.color = "#dc2626";
                    return;
                }

                saveButton.disabled = true;
                saveButton.textContent =
                    questionId ? "Updating..." : "Saving...";

                try {

                    const payload = {

                        section_id:
                            section.id,

                        question_number:
                            questionNumber,

                        question_type:
                            document
                                .getElementById("questionType")
                                .value,

                        question_text:
                            document
                                .getElementById("questionText")
                                .value
                                .trim(),

                        marks:
                            Number(
                                document
                                    .getElementById("questionMarks")
                                    .value
                            ) || 1,

                        correct_answer:
                            document
                                .getElementById("correctAnswer")
                                .value
                                .trim(),

                        explanation:
                            document
                                .getElementById("questionExplanation")
                                .value
                                .trim() || null,

                        image_url:
                            document
                                .getElementById("questionImageUrl")
                                .value
                                .trim() || null
                    };

                    if (!payload.question_text) {
                        throw new Error(
                            "Question text is required."
                        );
                    }

                    let savedQuestion;

                    if (questionId) {

                        const {
                            data,
                            error
                        } = await supabaseClient
                            .from("questions")
                            .update(payload)
                            .eq("id", questionId)
                            .select()
                            .single();

                        if (error) throw error;

                        savedQuestion = data;

                    } else {

                        const {
                            data,
                            error
                        } = await supabaseClient
                            .from("questions")
                            .insert(payload)
                            .select()
                            .single();

                        if (error) throw error;

                        savedQuestion = data;
                    }

                    const needsOptions =
                        payload.question_type === "multiple_choice" ||
                        payload.question_type === "matching";

                    if (needsOptions) {

                        const area =
                            document.getElementById("questionOptionsArea");

                        const optionState =
                            area?._questionOptions || [];

                        const optionTextInputs =
                            document.querySelectorAll(".dynamic-option-text");

                        optionTextInputs.forEach(input => {
                            const index = Number(input.dataset.index);
                            if (optionState[index]) {
                                optionState[index].option_text =
                                    input.value.trim();
                            }
                        });

                        const rows = optionState
                            .map((option, index) => {

                                const value =
                                    String(option.option_text || "").trim();

                                if (!value) return null;

                                const key = optionKey(index);

                                const correctAnswers =
                                    payload.correct_answer
                                        .split(",")
                                        .map(value => value.trim().toUpperCase())
                                        .filter(Boolean);

                                return {
                                    question_id:
                                        savedQuestion.id,

                                    option_key:
                                        key,

                                    option_text:
                                        value,

                                    is_correct:
                                        correctAnswers.includes(key)
                                };
                            })
                            .filter(Boolean);

                        if (questionId) {

                            const { error } = await supabaseClient
                                .from("options")
                                .delete()
                                .eq("question_id", savedQuestion.id);

                            if (error) throw error;
                        }

                        if (rows.length) {

                            const { error } = await supabaseClient
                                .from("options")
                                .insert(rows);

                            if (error) throw error;
                        }
                    } else if (questionId) {

                        const { error } = await supabaseClient
                            .from("options")
                            .delete()
                            .eq("question_id", savedQuestion.id);

                        if (error) throw error;
                    }

                    message.textContent =
                        questionId
                            ? "Question updated successfully."
                            : "Question saved successfully.";

                    message.style.color = "#15803d";

                    setTimeout(
                        back,
                        700
                    );

                } catch (error) {

                    console.error(
                        "Question Save Error:",
                        error
                    );

                    message.textContent =
                        error.message ||
                        "Unable to save question.";

                    message.style.color = "#dc2626";

                    saveButton.disabled = false;

                    saveButton.textContent =
                        questionId
                            ? "Update Question"
                            : "Save Question";
                }
            }
        );
}


// ============================================
// STUDENT LISTENING TESTS
// ============================================

async function openStudentListeningTests(profile) {

    const message =
        document.getElementById("dashboardMessage");

    message.innerHTML = `
        <div class="students-panel">

            <div class="students-panel-header">

                <div>
                    <h2>🎧 Listening Tests</h2>
                    <p>Select a published Listening Test.</p>
                </div>

                <button
                    type="button"
                    class="cancel-button"
                    id="backStudentListeningDashboard"
                >
                    ← Dashboard
                </button>

            </div>

            <div id="studentListeningTestsContent">
                <div class="coming-soon">
                    Loading...
                </div>
            </div>

        </div>
    `;

    document
        .getElementById("backStudentListeningDashboard")
        .addEventListener(
            "click",
            () => openStudentDashboard(profile)
        );

    try {

        const {
            data: tests,
            error
        } = await supabaseClient
            .from("tests")
            .select(
                "id, title, description, duration_minutes, total_questions, is_published"
            )
            .eq("module", "listening")
            .eq("is_published", true)
            .order("created_at", { ascending: false });

        if (error) throw error;

        const content =
            document.getElementById(
                "studentListeningTestsContent"
            );

        if (!tests || !tests.length) {

            content.innerHTML = `
                <div class="empty-test-state">
                    <div class="empty-icon">🎧</div>
                    <h2>No Published Listening Tests</h2>
                    <p>
                        No Listening Test is available yet.
                    </p>
                </div>
            `;

            return;
        }

        content.innerHTML = `
            <div class="dashboard-grid">

                ${tests.map(test => `

                    <button
                        type="button"
                        class="dashboard-card"
                        data-start-listening="${test.id}"
                    >

                        <span class="card-icon">🎧</span>

                        <strong>
                            ${escapeHtml(test.title)}
                        </strong>

                        <small>
                            ${
                                test.total_questions || 40
                            } Questions • ${
                                test.duration_minutes || 40
                            } Minutes
                        </small>

                        <small>
                            ${escapeHtml(
                                test.description || ""
                            )}
                        </small>

                    </button>

                `).join("")}

            </div>
        `;

        content
            .querySelectorAll("[data-start-listening]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => openStudentListeningTest(
                        button.dataset.startListening,
                        profile
                    )
                );

            });

    } catch (error) {

        console.error(
            "Student Listening Error:",
            error
        );

        document
            .getElementById(
                "studentListeningTestsContent"
            )
            .innerHTML = `
                <div class="coming-soon">
                    <strong>Unable to load Listening Tests</strong>
                    <p>${escapeHtml(error.message || "Unknown error")}</p>
                </div>
            `;
    }
}


// ============================================
// STUDENT LISTENING TEST PLAYER
// ============================================

async function openStudentListeningTest(
    testId,
    profile
) {

    const message =
        document.getElementById("dashboardMessage");

    message.innerHTML = `
        <div class="students-panel">

            <div class="students-panel-header">

                <div>
                    <h2>🎧 Listening Test</h2>
                    <p>Loading test...</p>
                </div>

            </div>

            <div id="studentListeningPlayer">
                <div class="coming-soon">
                    Loading...
                </div>
            </div>

        </div>
    `;

    try {

        const {
            data: test,
            error: testError
        } = await supabaseClient
            .from("tests")
            .select(
                "id, title, description, duration_minutes, total_questions, is_published"
            )
            .eq("id", testId)
            .eq("module", "listening")
            .eq("is_published", true)
            .single();

        if (testError) throw testError;

        const {
            data: sections,
            error: sectionError
        } = await supabaseClient
            .from("sections")
            .select(
                "id, section_number, title, instructions, content, audio_url, image_url"
            )
            .eq("test_id", testId)
            .order("section_number", { ascending: true });

        if (sectionError) throw sectionError;

        if (!sections || sections.length !== 4) {
            throw new Error(
                "This Listening Test does not have all 4 Parts."
            );
        }

        const sectionIds =
            sections.map(section => section.id);

        const {
            data: questions,
            error: questionError
        } = await supabaseClient
            .from("questions")
            .select(
                "id, section_id, question_number, question_type, question_text, marks, image_url"
            )
            .in("section_id", sectionIds)
            .order("question_number", { ascending: true });

        if (questionError) throw questionError;

        if (!questions || questions.length !== 40) {
            throw new Error(
                "This Listening Test must contain exactly 40 questions."
            );
        }

        const questionIds =
            questions.map(question => question.id);

        const {
            data: options,
            error: optionError
        } = await supabaseClient
            .from("options")
            .select(
                "id, question_id, option_key, option_text"
            )
            .in("question_id", questionIds)
            .order("option_key", { ascending: true });

        if (optionError) throw optionError;

        const questionsBySection =
            sections.map(section => ({
                ...section,
                questions:
                    questions
                        .filter(
                            question =>
                                question.section_id === section.id
                        )
                        .map(question => ({
                            ...question,
                            options:
                                (options || [])
                                    .filter(
                                        option =>
                                            option.question_id ===
                                            question.id
                                    )
                        }))
            }));

        renderStudentListeningPlayer(
            test,
            questionsBySection,
            profile
        );

    } catch (error) {

        console.error(
            "Student Listening Player Error:",
            error
        );

        document
            .getElementById("studentListeningPlayer")
            .innerHTML = `
                <div class="coming-soon">
                    <strong>Unable to start test</strong>
                    <p>${escapeHtml(error.message || "Unknown error")}</p>
                </div>
            `;
    }
}


function renderStudentListeningPlayer(
    test,
    sections,
    profile
) {

    let currentPart = 0;
    let timerSeconds =
        (test.duration_minutes || 40) * 60;

    const answers = {};

    const message =
        document.getElementById("dashboardMessage");

    message.innerHTML = `
        <div
            style="
                position:sticky;
                top:0;
                z-index:10;
                background:#fff;
                border-bottom:1px solid #e5e7eb;
                padding:12px 15px;
            "
        >

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:15px;
                    align-items:center;
                    flex-wrap:wrap;
                "
            >

                <strong>
                    🎧 ${escapeHtml(test.title)}
                </strong>

                <div
                    id="listeningTimer"
                    style="
                        font-size:20px;
                        font-weight:700;
                    "
                >
                    40:00
                </div>

            </div>

        </div>

        <div
            style="
                display:flex;
                gap:8px;
                padding:12px 15px;
                border-bottom:1px solid #e5e7eb;
                flex-wrap:wrap;
            "
            id="listeningPartTabs"
        ></div>

        <div
            id="listeningStudentContent"
            style="
                padding:15px;
            "
        ></div>

        <div
            style="
                display:flex;
                justify-content:space-between;
                gap:10px;
                padding:15px;
                border-top:1px solid #e5e7eb;
                position:sticky;
                bottom:0;
                background:#fff;
            "
        >

            <button
                type="button"
                class="cancel-button"
                id="listeningPreviousButton"
            >
                ← Previous
            </button>

            <button
                type="button"
                class="module-btn"
                id="listeningNextButton"
            >
                Next →
            </button>

        </div>
    `;

    const tabs =
        document.getElementById("listeningPartTabs");

    const content =
        document.getElementById(
            "listeningStudentContent"
        );

    const timer =
        document.getElementById("listeningTimer");

    const previousButton =
        document.getElementById(
            "listeningPreviousButton"
        );

    const nextButton =
        document.getElementById(
            "listeningNextButton"
        );

    sections.forEach((section, index) => {

        const button =
            document.createElement("button");

        button.type = "button";
        button.className =
            "module-btn";

        button.textContent =
            `Part ${index + 1}`;

        button.addEventListener(
            "click",
            () => {

                saveCurrentPartAnswers();
                currentPart = index;
                renderPart();
            }
        );

        tabs.appendChild(button);
    });

    function saveCurrentPartAnswers() {

        const inputs =
            content.querySelectorAll(
                "[data-question-input]"
            );

        inputs.forEach(input => {

            const id =
                input.dataset.questionInput;

            answers[id] =
                input.value;

        });

        const checks =
            content.querySelectorAll(
                "input[type='radio'][data-question-input]:checked"
            );

        checks.forEach(input => {

            answers[
                input.dataset.questionInput
            ] = input.value;

        });
    }

    function renderPart() {

        const section =
            sections[currentPart];

        const buttons =
            tabs.querySelectorAll("button");

        buttons.forEach(
            (button, index) => {
                button.style.opacity =
                    index === currentPart
                        ? "1"
                        : "0.65";
            }
        );

        content.innerHTML = `

            <div
                style="
                    display:grid;
                    grid-template-columns:minmax(280px,1fr) minmax(320px,1.2fr);
                    gap:15px;
                "
            >

                <div
                    style="
                        border:1px solid #e5e7eb;
                        border-radius:14px;
                        padding:18px;
                        background:#fff;
                        min-height:450px;
                    "
                >

                    <h2>
                        ${escapeHtml(section.title)}
                    </h2>

                    <p>
                        ${escapeHtml(section.instructions || "")}
                    </p>

                    ${
                        section.audio_url
                            ? `
                                <audio
                                    controls
                                    preload="metadata"
                                    style="width:100%;margin:20px 0;"
                                >
                                    <source
                                        src="${escapeHtml(section.audio_url)}"
                                    >
                                </audio>
                            `
                            : `
                                <div class="coming-soon">
                                    Audio is not available.
                                </div>
                            `
                    }

                    ${
                        section.image_url
                            ? `
                                <img
                                    src="${escapeHtml(section.image_url)}"
                                    alt="Listening Part"
                                    style="
                                        max-width:100%;
                                        border-radius:10px;
                                        margin-top:15px;
                                    "
                                >
                            `
                            : ""
                    }

                    ${
                        section.content
                            ? `
                                <div
                                    style="
                                        margin-top:20px;
                                        white-space:pre-wrap;
                                    "
                                >
                                    ${escapeHtml(section.content)}
                                </div>
                            `
                            : ""
                    }

                </div>

                <div
                    style="
                        border:1px solid #e5e7eb;
                        border-radius:14px;
                        padding:18px;
                        background:#fff;
                        max-height:65vh;
                        overflow:auto;
                    "
                >

                    ${section.questions.map(
                        question => {

                            const inputId =
                                `q_${question.id}`;

                            const saved =
                                answers[inputId] || "";

                            let answerHtml = "";

                            if (
                                question.question_type ===
                                "multiple_choice" ||
                                question.question_type ===
                                "matching"
                            ) {

                                answerHtml =
                                    question.options.map(
                                        option => `
                                            <label
                                                style="
                                                    display:block;
                                                    padding:10px;
                                                    margin:6px 0;
                                                    border:1px solid #e5e7eb;
                                                    border-radius:8px;
                                                    cursor:pointer;
                                                "
                                            >

                                                <input
                                                    type="radio"
                                                    name="${inputId}"
                                                    data-question-input="${inputId}"
                                                    value="${escapeHtml(option.option_key)}"
                                                    ${
                                                        saved ===
                                                        option.option_key
                                                            ? "checked"
                                                            : ""
                                                    }
                                                >

                                                <strong>
                                                    ${escapeHtml(option.option_key)}.
                                                </strong>

                                                ${escapeHtml(option.option_text)}

                                            </label>
                                        `
                                    ).join("");

                            } else {

                                answerHtml = `
                                    <input
                                        type="text"
                                        data-question-input="${inputId}"
                                        value="${escapeHtml(saved)}"
                                        placeholder="Type your answer"
                                        style="
                                            width:100%;
                                            padding:11px;
                                            border:1px solid #d1d5db;
                                            border-radius:8px;
                                            box-sizing:border-box;
                                        "
                                    >
                                `;
                            }

                            return `
                                <div
                                    style="
                                        padding:15px 0;
                                        border-bottom:1px solid #e5e7eb;
                                    "
                                >

                                    <strong>
                                        ${question.question_number}.
                                    </strong>

                                    <span>
                                        ${escapeHtml(
                                            question.question_text
                                        )}
                                    </span>

                                    ${
                                        question.image_url
                                            ? `
                                                <img
                                                    src="${escapeHtml(question.image_url)}"
                                                    alt="Question"
                                                    style="
                                                        max-width:100%;
                                                        margin:10px 0;
                                                    "
                                                >
                                            `
                                            : ""
                                    }

                                    <div style="margin-top:12px;">
                                        ${answerHtml}
                                    </div>

                                </div>
                            `;
                        }
                    ).join("")}

                </div>

            </div>
        `;

        previousButton.disabled =
            currentPart === 0;

        if (currentPart === sections.length - 1) {
            nextButton.textContent =
                "Submit Test";
        } else {
            nextButton.textContent =
                "Next →";
        }
    }

    previousButton.addEventListener(
        "click",
        () => {

            if (currentPart === 0) {
                return;
            }

            saveCurrentPartAnswers();

            currentPart--;

            renderPart();
        }
    );

    nextButton.addEventListener(
        "click",
        async () => {

            saveCurrentPartAnswers();

            if (
                currentPart ===
                sections.length - 1
            ) {

                const confirmed =
                    confirm(
                        "Submit your Listening Test now?"
                    );

                if (!confirmed) return;

                clearInterval(timerInterval);

                await submitStudentListeningTest(
                    test,
                    sections,
                    answers,
                    profile
                );

                return;
            }

            currentPart++;

            renderPart();
        }
    );

    function updateTimer() {

        timerSeconds--;

        if (timerSeconds <= 0) {

            timer.textContent = "00:00";

            clearInterval(timerInterval);

            saveCurrentPartAnswers();

            submitStudentListeningTest(
                test,
                sections,
                answers,
                profile,
                true
            );

            return;
        }

        const minutes =
            Math.floor(timerSeconds / 60);

        const seconds =
            timerSeconds % 60;

        timer.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    const timerInterval =
        setInterval(
            updateTimer,
            1000
        );

    renderPart();
}


// ============================================
// SUBMIT + AUTO SCORE
// ============================================

async function submitStudentListeningTest(
    test,
    sections,
    answers,
    profile,
    autoSubmitted = false
) {

    try {

        const {
            data: sessionData,
            error: sessionError
        } = await supabaseClient.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData.session;

        if (!session) {
            throw new Error("Session expired.");
        }

        const {
            data: student,
            error: studentError
        } = await supabaseClient
            .from("students")
            .select("id, user_id, student_id, full_name")
            .eq("user_id", session.user.id)
            .single();

        if (studentError) throw studentError;

        const allQuestions =
            sections.flatMap(
                section => section.questions
            );

        let score = 0;

        const answerRows = [];

        for (const question of allQuestions) {

            const inputId =
                `q_${question.id}`;

            const studentAnswer =
                String(
                    answers[inputId] || ""
                ).trim();

            const correctAnswer =
                String(
                    question.correct_answer || ""
                ).trim();

            const isCorrect =
                normalizeListeningAnswer(
                    studentAnswer
                ) ===
                normalizeListeningAnswer(
                    correctAnswer
                );

            const marks =
                isCorrect
                    ? Number(question.marks || 1)
                    : 0;

            score += marks;

            answerRows.push({
                question_id: question.id,
                answer_text: studentAnswer,
                is_correct: isCorrect,
                marks_obtained: marks
            });
        }

        const {
            data: result,
            error: resultError
        } = await supabaseClient
            .from("results")
            .insert({
                student_id: student.id,
                test_id: test.id,
                listening_score: score,
                reading_score: null,
                writing_score: null,
                overall_band: null,
                started_at: new Date().toISOString(),
                submitted_at: new Date().toISOString(),
                status: autoSubmitted
                    ? "auto_submitted"
                    : "submitted"
            })
            .select()
            .single();

        if (resultError) throw resultError;

        const rows =
            answerRows.map(row => ({
                ...row,
                result_id: result.id
            }));

        if (rows.length) {

            const {
                error
            } = await supabaseClient
                .from("answers")
                .insert(rows);

            if (error) throw error;
        }

        const message =
            document.getElementById(
                "dashboardMessage"
            );

        message.innerHTML = `

            <div class="empty-test-state">

                <div class="empty-icon">🎉</div>

                <h2>Listening Test Submitted</h2>

                <p>
                    ${
                        autoSubmitted
                            ? "Time expired and the test was submitted automatically."
                            : "Your Listening Test has been submitted successfully."
                    }
                </p>

                <h2 style="margin-top:20px;">
                    Score: ${score} / 40
                </h2>

                <button
                    type="button"
                    class="module-btn"
                    id="backAfterListeningResult"
                    style="max-width:260px;margin-top:20px;"
                >
                    Back to Listening Tests
                </button>

            </div>
        `;

        document
            .getElementById("backAfterListeningResult")
            .addEventListener(
                "click",
                () => openStudentListeningTests(profile)
            );

    } catch (error) {

        console.error(
            "Listening Submit Error:",
            error
        );

        const message =
            document.getElementById(
                "dashboardMessage"
            );

        message.innerHTML = `
            <div class="coming-soon">
                <strong>Unable to submit test</strong>
                <p>${escapeHtml(error.message || "Unknown error")}</p>
            </div>
        `;
    }
}


function normalizeListeningAnswer(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
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
                        openListeningTests(profile);
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
// STUDENT LISTENING TESTS
// ============================================

function openListeningTests(profile) {
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
