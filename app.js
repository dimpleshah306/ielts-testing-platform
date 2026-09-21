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
let adminCurrentTestAudio = null;
let adminPreviewSnapshot = null;

const STORAGE_BUCKET_AUDIO = "listening-audio";
const STORAGE_BUCKET_IMAGES = "question-images";

function safeFileName(name) {
    return String(name || "file").replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^\.+/, "file");
}

async function getSignedStorageUrl(bucket, path, expiresIn = 3600) {
    if (!path) return null;
    const { data, error } = await supabaseClient.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data?.signedUrl || null;
}

async function uploadStorageFile(bucket, path, file, upsert = true) {
    const { data, error } = await supabaseClient.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert,
        contentType: file.type || undefined
    });
    if (error) throw error;
    return data?.path || path;
}

async function removeStorageFile(bucket, path) {
    if (!path) return;
    const { error } = await supabaseClient.storage.from(bucket).remove([path]);
    if (error && !String(error.message || "").toLowerCase().includes("not found")) throw error;
}

async function loadListeningTestAudio(testId) {
    if (!testId) return null;
    const { data, error } = await supabaseClient.from("test_audio").select("*").eq("test_id", testId).maybeSingle();
    if (error) {
        if (String(error.message || "").toLowerCase().includes("test_audio")) return null;
        throw error;
    }
    if (!data?.audio_path) return data || null;
    const signedUrl = await getSignedStorageUrl(STORAGE_BUCKET_AUDIO, data.audio_path, 3600);
    return { ...data, signedUrl };
}

async function uploadListeningTestAudio(testId, file) {
    if (!testId || !file) throw new Error("Please select an audio file.");
    const ext = (file.name.split(".").pop() || "mp3").toLowerCase();
    const path = `${testId}/listening.${safeFileName(ext)}`;
    const current = await loadListeningTestAudio(testId);
    if (current?.audio_path && current.audio_path !== path) await removeStorageFile(STORAGE_BUCKET_AUDIO, current.audio_path);
    await uploadStorageFile(STORAGE_BUCKET_AUDIO, path, file, true);
    const payload = {
        test_id: testId,
        audio_path: path,
        original_name: file.name,
        mime_type: file.type || null,
        duration_seconds: null,
        updated_at: new Date().toISOString()
    };
    const { data, error } = await supabaseClient.from("test_audio").upsert(payload, { onConflict: "test_id" }).select().single();
    if (error) throw error;
    return data;
}

async function removeListeningTestAudio(testId) {
    const current = await loadListeningTestAudio(testId);
    if (current?.audio_path) await removeStorageFile(STORAGE_BUCKET_AUDIO, current.audio_path);
    const { error } = await supabaseClient.from("test_audio").delete().eq("test_id", testId);
    if (error && !String(error.message || "").toLowerCase().includes("test_audio")) throw error;
}

async function uploadImageForEntity(entityType, entityId, file, currentPath = null) {
    if (!file) throw new Error("Please select an image file.");
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${entityType}/${entityId}/image.${safeFileName(ext)}`;
    if (currentPath && currentPath !== path) await removeStorageFile(STORAGE_BUCKET_IMAGES, currentPath);
    await uploadStorageFile(STORAGE_BUCKET_IMAGES, path, file, true);
    const signedUrl = await getSignedStorageUrl(STORAGE_BUCKET_IMAGES, path, 3600);
    return { path, signedUrl };
}

async function deleteImagePath(path) {
    if (path) await removeStorageFile(STORAGE_BUCKET_IMAGES, path);
}

async function getImageSignedUrl(path) {
    return path ? getSignedStorageUrl(STORAGE_BUCKET_IMAGES, path, 3600) : null;
}


async function loadStudentTestData(testId) {
    const { data: test, error: testError } = await supabaseClient.from("tests").select("*").eq("id", testId).single();
    if (testError) throw testError;
    if (!test.is_published && !studentTestState?.preview) throw new Error("This test is not published.");

    const { data: sections, error: secError } = await supabaseClient.from("sections").select("*").eq("test_id", testId).order("section_number", { ascending: true });
    if (secError) throw secError;
    const listeningAudio = test.module === "listening" ? await loadListeningTestAudio(testId) : null;
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
        groups = await Promise.all((gdata || []).map(async g => ({
            ...g,
            image_url: g.image_path ? await getImageSignedUrl(g.image_path) : g.image_url
        })));
        const gids = groups.map(g => g.id);
        if (gids.length) {
            const { data: go, error: goError } = await supabaseClient.from("question_group_options").select("*").in("group_id", gids).order("sort_order", { ascending: true });
            if (goError) throw goError;
            const byG = {};
            (go || []).forEach(o => (byG[o.group_id] ||= []).push(o));
            groups = groups.map(g => ({ ...g, options: byG[g.id] || [] }));
        }
    }
    return { test, sections: resolvedSections, questions, groups, listeningAudio };
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
    const app = document.getElementById("app");
    if (app && !adminPreviewSnapshot) {
        adminPreviewSnapshot = { html: app.innerHTML, scrollY: window.scrollY || 0 };
    }
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
    const { test, sections, listeningAudio } = state.data;
    const s = sections[state.currentSection];
    if (!s) return;
    const isListening = test.module === "listening";
    const isReading = test.module === "reading";
    const sectionQuestions = state.data.questions.filter(q => q.section_id === s.id).sort((a,b) => Number(a.question_number) - Number(b.question_number));
    const sectionGroups = state.data.groups.filter(g => g.section_id === s.id).sort((a,b) => Number(a.group_order) - Number(b.group_order));
    const sectionLabel = isListening ? "Section" : isReading ? "Passage" : "Section";
    const audioUrl = listeningAudio?.signedUrl || null;

    app.innerHTML = `<div class="dashboard">
        <header class="dashboard-header">
            <div><h1>${escapeHtml(test.title)}</h1><p>${state.preview ? "Student View Preview" : "Student Test"}</p></div>
            <div class="user-area"><button type="button" onclick="exitStudentTest()">✕ ${state.preview ? "Close Preview" : "Exit Test"}</button></div>
        </header>
        <main class="dashboard-content" style="max-width:1100px;margin:0 auto;width:100%">
            ${state.preview ? `<div style="padding:10px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;margin-bottom:14px"><strong>Preview Mode:</strong> This is how the test will appear to a student. Answers are not submitted.</div>` : ""}
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">${sections.map((sec,i) => `<button type="button" class="${i === state.currentSection ? "save-button" : "cancel-button"}" onclick="switchStudentSection(${i})">${sectionLabel} ${i+1}</button>`).join("")}</div>

            <section style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px">
                ${isListening && audioUrl ? `<div style="margin-bottom:20px;padding:14px;background:#f8fafc;border-radius:10px"><div style="font-weight:700;margin-bottom:8px">Listening Audio</div><audio id="listeningMainAudio" controls preload="metadata" style="width:100%" src="${escapeHtml(audioUrl)}"></audio></div>` : ""}
                <h2 style="margin-top:0">${escapeHtml(s.title || `${sectionLabel} ${s.section_number}`)}</h2>
                ${s.instructions ? `<div style="padding:12px;background:#fff7df;border-radius:8px;white-space:pre-wrap;margin:12px 0"><strong>Instructions</strong><br>${escapeHtml(s.instructions)}</div>` : ""}
                ${s.image_url ? `<img src="${escapeHtml(s.image_url)}" alt="Section image" style="display:block;max-width:100%;height:auto;border-radius:8px;margin:12px 0">` : ""}
                ${s.content ? `<div style="white-space:pre-wrap;line-height:1.7;margin-bottom:18px">${renderInlineBlanks(s.content, state)}</div>` : ""}
                ${sectionGroups.length ? sectionGroups.map(g => renderStudentFullWidthGroup(g, sectionQuestions, state)).join("") : sectionQuestions.map(q => renderStudentQuestion(q)).join("")}
                ${!sectionQuestions.length ? `<div class="coming-soon">No questions have been added to this section yet.</div>` : ""}
            </section>

            <div style="display:flex;justify-content:space-between;gap:10px;margin-top:16px">
                <button type="button" class="cancel-button" ${state.currentSection === 0 ? "disabled" : ""} onclick="switchStudentSection(${state.currentSection - 1})">← Previous</button>
                ${state.currentSection < sections.length - 1 ? `<button type="button" class="save-button" onclick="switchStudentSection(${state.currentSection + 1})">Next →</button>` : state.preview ? `<button type="button" class="save-button" onclick="exitStudentTest()">Close Preview</button>` : `<button type="button" class="save-button" onclick="submitStudentTest()">Submit Test</button>`}
            </div>
        </main>
    </div>`;

    // Keep one audio element across section changes as far as the browser allows.
    // The source is the same test-level audio; changing section never creates a new audio file.
}

function renderInlineBlanks(text, state) {
    const raw = String(text || "");
    return escapeHtml(raw).replace(/\[BLANK\s*(\d+)\]/gi, (_, n) => {
        const key = `blank_${n}`;
        const value = state.answers?.[key] || "";
        return `<input type="text" aria-label="Answer ${n}" value="${escAttr(value)}" style="display:inline-block;width:120px;max-width:40%;margin:0 4px;padding:6px 8px;border:1px solid #94a3b8;border-radius:5px" oninput="setStudentAnswer('${key}',this.value)">`;
    });
}

function renderStudentFullWidthGroup(g, questions, state) {
    const qs = questions.filter(q => Number(q.question_number) >= Number(g.start_question) && Number(q.question_number) <= Number(g.end_question)).sort((a,b)=>Number(a.question_number)-Number(b.question_number));
    return `<div style="margin-top:24px;padding-top:18px;border-top:1px solid #e5e7eb">
        <div style="font-weight:700;margin-bottom:10px">Questions ${Number(g.start_question)}–${Number(g.end_question)}</div>
        ${g.instructions ? `<div style="padding:12px;background:#fff7df;border-radius:8px;white-space:pre-wrap;margin:10px 0"><strong>Instructions</strong><br>${escapeHtml(g.instructions)}</div>` : ""}
        ${g.image_url ? `<img src="${escapeHtml(g.image_url)}" alt="Question image" style="display:block;max-width:100%;height:auto;border-radius:8px;margin:10px 0">` : ""}
        ${g.content ? `<div style="white-space:pre-wrap;line-height:1.7;margin:12px 0">${renderInlineBlanks(g.content, state)}</div>` : ""}
        ${g.options?.length ? `<div style="margin:12px 0;padding:12px;background:#f8fafc;border-radius:8px">${g.options.map(o => `<div style="margin:4px 0"><strong>${escapeHtml(o.option_key)}.</strong> ${escapeHtml(o.option_text)}</div>`).join("")}</div>` : ""}
        <div>${qs.map(q => renderStudentQuestion(q, g.options || [])).join("")}</div>
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
    const testId = studentTestState?.testId;
    studentTestState = null;
    if (preview && adminPreviewSnapshot) {
        const app = document.getElementById("app");
        if (app) app.innerHTML = adminPreviewSnapshot.html;
        const y = adminPreviewSnapshot.scrollY || 0;
        adminPreviewSnapshot = null;
        requestAnimationFrame(() => window.scrollTo(0, y));
        return;
    }
    if (testId) {
        openStudentDashboard();
        return;
    }
    window.location.reload();
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
        if (e.target.value === "listening") { duration.value = 30; total.value = 40; }
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
            title: module === "listening" ? `Section ${i + 1}` : module === "reading" ? `Passage ${i + 1}` : "Writing Task",
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
    let resolvedSections = sections || [];
    resolvedSections = await Promise.all(resolvedSections.map(async s => ({
        ...s,
        image_url: s.image_path ? await getImageSignedUrl(s.image_path) : s.image_url
    })));
    const sectionIds = resolvedSections.map(s => s.id);
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
        groups = await Promise.all((grow || []).map(async g => ({
            ...g,
            image_url: g.image_path ? await getImageSignedUrl(g.image_path) : g.image_url
        })));
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
    adminCurrentTestAudio = test.module === "listening" ? await loadListeningTestAudio(id) : null;
    adminCurrentSections = resolvedAdminSections;
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
        ${isListening ? renderAdminListeningAudioCard() : ""}
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
    const label = isListening ? `Section ${s.section_number}` : isReading ? `Passage ${s.section_number}` : "Writing Section";
    const groups = adminCurrentGroups.filter(g => g.section_id === s.id).sort((a,b) => Number(a.group_order || 0) - Number(b.group_order || 0));
    return `<div class="students-panel" style="margin:12px 0;padding:16px">
        <h4>${label}</h4>
        <input type="hidden" id="sec-id-${s.id}" value="${s.id}">
        <label>Title<input id="sec-title-${s.id}" value="${escapeHtml(s.title || label)}"></label>
        <label>Part / Section Instructions<textarea id="sec-instructions-${s.id}" placeholder="General instructions for this section">${escapeHtml(s.instructions || "")}</textarea></label>
        <label>${isReading ? "Passage Content" : isListening ? "Section Content / Notes" : "Task Content / Notes"}<textarea id="sec-content-${s.id}" style="min-height:120px" placeholder="Optional content for this section">${escapeHtml(s.content || "")}</textarea></label>
        <div style="padding:12px;background:#f8fafc;border-radius:8px;margin:10px 0">
            <strong>Section Image</strong>
            <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
                <input id="sec-image-file-${s.id}" type="file" accept="image/*">
                <button type="button" onclick="uploadAdminSectionImage('${s.id}')">Upload / Change Image</button>
                ${s.image_url ? `<button type="button" class="danger" onclick="removeAdminSectionImage('${s.id}')">Remove Image</button>` : ""}
            </div>
            ${s.image_url ? `<div style="margin-top:10px"><img src="${escapeHtml(s.image_url)}" alt="Current section image" style="max-width:260px;border-radius:8px"></div>` : `<small class="muted">No image uploaded.</small>`}
        </div>
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
        <div style="padding:12px;background:#f8fafc;border-radius:8px;margin:10px 0">
            <strong>Question Group Image</strong>
            <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
                <input id="group-image-file-${g.id}" type="file" accept="image/*">
                <button type="button" onclick="uploadAdminGroupImage('${g.id}')">Upload / Change Image</button>
                ${g.image_url ? `<button type="button" class="danger" onclick="removeAdminGroupImage('${g.id}')">Remove Image</button>` : ""}
            </div>
            ${g.image_url ? `<div style="margin-top:10px"><img src="${escapeHtml(g.image_url)}" alt="Current group image" style="max-width:260px;border-radius:8px"></div>` : `<small class="muted">No image uploaded.</small>`}
        </div>
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
            ${isListening ? `<label>Section<select id="q-sec-${q.id}">${adminCurrentSections.map(s => `<option value="${s.id}" ${s.id === q.section_id ? "selected" : ""}>Section ${s.section_number}</option>`).join("")}</select></label>` : isReading ? `<label>Passage<select id="q-sec-${q.id}">${adminCurrentSections.map(s => `<option value="${s.id}" ${s.id === q.section_id ? "selected" : ""}>Passage ${s.section_number}</option>`).join("")}</select></label>` : ""}
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

function renderAdminListeningAudioCard() {
    const a = adminCurrentTestAudio;
    return `<div class="student-form" style="margin-top:14px;border:1px solid #dbe3ee;background:#fff">
        <h3>🎧 Listening Test Audio — One Audio for the Entire Test</h3>
        <p class="muted">Upload one audio file for Sections 1–4. The same audio is used for Questions 1–40.</p>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <input id="listening-audio-file" type="file" accept="audio/*">
            <button type="button" class="save-button" onclick="uploadAdminListeningAudio('${adminCurrentTest.id}')">Upload / Change Audio</button>
            ${a?.audio_path ? `<button type="button" class="danger" onclick="removeAdminListeningAudio('${adminCurrentTest.id}')">Remove Audio</button>` : ""}
        </div>
        ${a?.signedUrl ? `<div style="margin-top:12px"><div><strong>${escapeHtml(a.original_name || "Current listening audio")}</strong></div><audio controls preload="metadata" style="width:100%;margin-top:8px" src="${escapeHtml(a.signedUrl)}"></audio></div>` : `<small class="muted">No listening audio uploaded yet.</small>`}
    </div>`;
}

async function uploadAdminListeningAudio(testId) {
    try {
        const file = document.getElementById("listening-audio-file")?.files?.[0];
        if (!file) return alert("Please select the Listening audio file first.");
        await uploadListeningTestAudio(testId, file);
        await editAdminTest(testId);
    } catch (error) { alert("Could not upload audio: " + (error.message || "Unknown error")); }
}

async function removeAdminListeningAudio(testId) {
    if (!confirm("Remove the Listening audio from this test?")) return;
    try { await removeListeningTestAudio(testId); await editAdminTest(testId); }
    catch (error) { alert("Could not remove audio: " + (error.message || "Unknown error")); }
}

async function uploadAdminSectionImage(sectionId) {
    try {
        const file = document.getElementById(`sec-image-file-${sectionId}`)?.files?.[0];
        if (!file) return alert("Please select an image first.");
        const section = adminCurrentSections.find(s => s.id === sectionId);
        const uploaded = await uploadImageForEntity("sections", sectionId, file, section?.image_path || null);
        const { error } = await supabaseClient.from("sections").update({ image_url: uploaded.path, image_path: uploaded.path }).eq("id", sectionId);
        if (error) throw error;
        await editAdminTest(adminCurrentTest.id);
    } catch (error) { alert("Could not upload image: " + (error.message || "Unknown error")); }
}

async function removeAdminSectionImage(sectionId) {
    if (!confirm("Remove this section image?")) return;
    try {
        const section = adminCurrentSections.find(s => s.id === sectionId);
        await deleteImagePath(section?.image_path || null);
        const { error } = await supabaseClient.from("sections").update({ image_url: null, image_path: null }).eq("id", sectionId);
        if (error) throw error;
        await editAdminTest(adminCurrentTest.id);
    } catch (error) { alert("Could not remove image: " + (error.message || "Unknown error")); }
}

async function uploadAdminGroupImage(groupId) {
    try {
        const file = document.getElementById(`group-image-file-${groupId}`)?.files?.[0];
        if (!file) return alert("Please select an image first.");
        const group = adminCurrentGroups.find(g => g.id === groupId);
        const uploaded = await uploadImageForEntity("groups", groupId, file, group?.image_path || null);
        const { error } = await supabaseClient.from("question_groups").update({ image_url: uploaded.path, image_path: uploaded.path }).eq("id", groupId);
        if (error) throw error;
        await editAdminTest(adminCurrentTest.id);
    } catch (error) { alert("Could not upload group image: " + (error.message || "Unknown error")); }
}

async function removeAdminGroupImage(groupId) {
    if (!confirm("Remove this question group image?")) return;
    try {
        const group = adminCurrentGroups.find(g => g.id === groupId);
        await deleteImagePath(group?.image_path || null);
        const { error } = await supabaseClient.from("question_groups").update({ image_url: null, image_path: null }).eq("id", groupId);
        if (error) throw error;
        await editAdminTest(adminCurrentTest.id);
    } catch (error) { alert("Could not remove image: " + (error.message || "Unknown error")); }
}

async function saveAdminSection(sectionId) {
    const payload = {
        title: document.getElementById(`sec-title-${sectionId}`)?.value.trim(),
        instructions: document.getElementById(`sec-instructions-${sectionId}`)?.value || "",
        content: document.getElementById(`sec-content-${sectionId}`)?.value || ""
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
window.uploadAdminListeningAudio = uploadAdminListeningAudio;
window.removeAdminListeningAudio = removeAdminListeningAudio;
window.uploadAdminSectionImage = uploadAdminSectionImage;
window.removeAdminSectionImage = removeAdminSectionImage;
window.uploadAdminGroupImage = uploadAdminGroupImage;
window.removeAdminGroupImage = removeAdminGroupImage;
