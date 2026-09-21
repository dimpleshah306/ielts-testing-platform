// UNIVERSAL EDUCATION IELTS — COMPLETE V1
const SUPABASE_URL = "https://fmwcvwgcwisdxiudlstq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ibtCq2hamnZkRNWPsxlddQ_JfexwHYM";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});

const app = () => document.getElementById("app");
const esc = v => String(v ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const attr = v => esc(v).replace(/`/g,"&#96;");
const $ = id => document.getElementById(id);
const routeKey="ue_ielts_route_v1", examPrefix="ue_ielts_exam_v1_";
let loginMode="student", currentProfile=null, admin={test:null,sections:[],groups:[],questions:[],audio:null,sectionIndex:0}, exam=null, timerHandle=null;

const L_TYPES = {
 single:"Multiple Choice — Single Answer",multi:"Multiple Choice — Multiple Answers",matching:"Matching",
 note:"Note Completion",form:"Form Completion",table:"Table Completion",sentence:"Sentence Completion",
 summary:"Summary Completion",short:"Short Answer",map:"Plan / Map / Diagram Labelling",flow:"Flow-chart Completion",list:"List Selection"
};
const R_TYPES = {
 single:"Multiple Choice — Single Answer",multi:"Multiple Choice — Multiple Answers",tfng:"True / False / Not Given",
 yng:"Yes / No / Not Given",headings:"Matching Headings",information:"Matching Information",features:"Matching Features",
 endings:"Matching Sentence Endings",sentence:"Sentence Completion",summary:"Summary Completion",note:"Note Completion",
 table:"Table Completion",flow:"Flow-chart Completion",map:"Diagram Label Completion",short:"Short Answer",title:"Choosing a Title",list:"List Selection"
};
const COMPLETION_TYPES=["note","form","table","sentence","summary","flow","short"];

function setRoute(page,extra={}){localStorage.setItem(routeKey,JSON.stringify({page,...extra}));}
function getRoute(){try{return JSON.parse(localStorage.getItem(routeKey)||"null")}catch{return null}}
function clearRoute(){localStorage.removeItem(routeKey)}
function examKey(id){return examPrefix+id}
function saveExam(){if(exam&&!exam.preview)localStorage.setItem(examKey(exam.testId),JSON.stringify({testId:exam.testId,resultId:exam.resultId,currentSection:exam.currentSection,currentTask:exam.currentTask,answers:exam.answers,endAt:exam.endAt,startedAt:exam.startedAt}))}
function loadExam(id){try{return JSON.parse(localStorage.getItem(examKey(id))||"null")}catch{return null}}
function clearExam(id){localStorage.removeItem(examKey(id))}

function shell(body, title="Universal Education IELTS", sub="Testing Platform"){
  app().innerHTML=`<div class="topbar"><div><div class="brand">${esc(title)}</div><div class="subbrand">${esc(sub)}</div></div>
  <div class="userbox">${currentProfile?`<span>${esc(currentProfile.full_name||"")} • ${esc(currentProfile.role||"")}</span><button class="btn secondary" onclick="logout()">Logout</button>`:""}</div></div>
  <div class="shell">${body}</div>`;
}
function messageBox(msg,type="notice"){return `<div class="${type}">${esc(msg)}</div>`}

async function init(){
  bindLogin();
  const {data}=await sb.auth.getSession();
  if(!data.session) return;
  const p=await getProfile(data.session.user.id);
  if(!p?.active){await sb.auth.signOut();return}
  currentProfile=p;
  const r=getRoute();
  if(p.role==="student"){
    if(r?.page==="exam"&&r.testId) return startStudentTest(r.testId,true);
    return studentDashboard();
  }
  if(r?.page==="students") return studentsPage();
  if(r?.page==="tests") return testsPage(r.module||"all");
  if(r?.page==="builder"&&r.testId) return openBuilder(r.testId);
  if(r?.page==="results") return resultsPage();
  return staffDashboard();
}
function bindLogin(){
  const st=$("studentTab"), sf=$("staffTab"), form=$("loginForm");
  if(!st||!sf||!form)return;
  st.onclick=()=>{loginMode="student";st.classList.add("active");sf.classList.remove("active")};
  sf.onclick=()=>{loginMode="staff";sf.classList.add("active");st.classList.remove("active")};
  form.onsubmit=login;
}
async function getProfile(uid){
  const {data,error}=await sb.from("profiles").select("*").eq("id",uid).single();
  if(error) throw error; return data;
}
async function login(e){
  e.preventDefault(); const btn=$("loginButton"),msg=$("loginMessage"); btn.disabled=true; msg.textContent="";
  try{
    const {data,error}=await sb.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
    if(error) throw error;
    const p=await getProfile(data.user.id); if(!p.active) throw new Error("Account inactive.");
    if(loginMode==="student"&&p.role!=="student") throw new Error("Use Admin / Tutor login.");
    if(loginMode==="staff"&&!["admin","tutor"].includes(p.role)) throw new Error("Use Student login.");
    currentProfile=p; clearRoute(); p.role==="student"?studentDashboard():staffDashboard();
  }catch(err){msg.textContent=err.message;msg.style.color="#dc2626"}finally{btn.disabled=false}
}
async function logout(){clearRoute();if(exam)clearExam(exam.testId);exam=null;currentProfile=null;await sb.auth.signOut();location.reload()}

function staffDashboard(){
  setRoute("dashboard");
  shell(`<h2>Admin Dashboard</h2><p class="muted">Create IELTS tests, manage students, publish exams and view results.</p>
  <div class="dashboard-grid">
    <button class="dashbtn" onclick="studentsPage()">👨‍🎓<strong>Students</strong><span class="muted">Manage student profiles</span></button>
    <button class="dashbtn" onclick="testsPage('all')">📝<strong>All Tests</strong><span class="muted">Create / edit / publish</span></button>
    <button class="dashbtn" onclick="testsPage('listening')">🎧<strong>Listening</strong><span class="muted">4 Parts • 40 Questions</span></button>
    <button class="dashbtn" onclick="testsPage('reading')">📖<strong>Reading</strong><span class="muted">3 Passages • 40 Questions</span></button>
    <button class="dashbtn" onclick="testsPage('writing')">✍️<strong>Writing</strong><span class="muted">Task 1 + Task 2</span></button>
    <button class="dashbtn" onclick="resultsPage()">📊<strong>Results</strong><span class="muted">Scores and writing evaluation</span></button>
  </div>`);
}

async function studentsPage(){
  setRoute("students");
  const {data,error}=await sb.from("profiles").select("id,full_name,email,role,active,created_at").eq("role","student").order("created_at",{ascending:false});
  if(error)return alert(error.message);
  shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button></div>
  <h2>Students</h2><p class="muted">Student login accounts are created through the included secure Edge Function. Existing students are listed below.</p>
  <div class="card"><div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Created</th></tr></thead>
  <tbody>${(data||[]).map(s=>`<tr><td>${esc(s.full_name)}</td><td>${esc(s.email)}</td><td>${s.active?"Active":"Inactive"}</td><td>${new Date(s.created_at).toLocaleDateString()}</td></tr>`).join("")||`<tr><td colspan="4">No students.</td></tr>`}</tbody></table></div></div>`);
}

async function testsPage(module="all"){
  setRoute("tests",{module});
  let q=sb.from("tests").select("*").order("created_at",{ascending:false}); if(module!=="all")q=q.eq("module",module);
  const {data,error}=await q;if(error)return alert(error.message);
  shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button><button class="btn primary" onclick="newTestForm('${module}')">+ Create Test</button></div>
  <h2>${module==="all"?"All Tests":module[0].toUpperCase()+module.slice(1)+" Tests"}</h2>
  <div class="card table-wrap"><table><thead><tr><th>Title</th><th>Module</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead><tbody>
  ${(data||[]).map(t=>`<tr><td><strong>${esc(t.title)}</strong><br><small>${esc(t.description||"")}</small></td><td>${esc(t.module)}</td><td>${t.duration_minutes} min</td>
  <td><span class="status ${t.is_published?"published":"draft"}">${t.is_published?"Published":"Draft"}</span></td><td><div class="actions">
  <button class="btn secondary" onclick="openBuilder('${t.id}')">Edit</button><button class="btn ${t.is_published?"warning":"success"}" onclick="togglePublish('${t.id}',${!t.is_published})">${t.is_published?"Unpublish":"Publish"}</button>
  <button class="btn danger" onclick="deleteTest('${t.id}')">Delete</button></div></td></tr>`).join("")||`<tr><td colspan="5">No tests.</td></tr>`}</tbody></table></div>`);
}
function newTestForm(module="all"){
  const m=["listening","reading","writing"].includes(module)?module:"listening";
  shell(`<div class="actions"><button class="btn secondary" onclick="testsPage('${module}')">← Back</button></div><h2>Create New Test</h2><div class="card">
  <div class="grid"><div><label>Title</label><input id="ntTitle" value="${m[0].toUpperCase()+m.slice(1)} Test"></div><div><label>Module</label><select id="ntModule" onchange="syncNewTestDefaults()">
  <option value="listening" ${m==="listening"?"selected":""}>Listening</option><option value="reading" ${m==="reading"?"selected":""}>Reading</option><option value="writing" ${m==="writing"?"selected":""}>Writing</option></select></div></div>
  <label>Description</label><textarea id="ntDesc"></textarea><div class="grid"><div><label>Duration</label><input id="ntDur" type="number" value="${m==="listening"?40:60}"></div><div><label>Total Questions</label><input id="ntTotal" type="number" value="${m==="writing"?2:40}"></div></div>
  <div class="actions" style="margin-top:14px"><button class="btn primary" onclick="createTest()">Create & Open Builder</button></div></div>`);
}
function syncNewTestDefaults(){const m=$("ntModule").value;$("ntDur").value=m==="listening"?40:60;$("ntTotal").value=m==="writing"?2:40}
async function createTest(){
  try{
    const uid=(await sb.auth.getUser()).data.user.id,m=$("ntModule").value;
    const {data:t,error}=await sb.from("tests").insert({title:$("ntTitle").value.trim(),module:m,description:$("ntDesc").value.trim(),duration_minutes:+$("ntDur").value,total_questions:+$("ntTotal").value,is_published:false,created_by:uid}).select().single();if(error)throw error;
    const count=m==="listening"?4:m==="reading"?3:1;
    const rows=Array.from({length:count},(_,i)=>({test_id:t.id,section_number:i+1,title:m==="listening"?`Part ${i+1}`:m==="reading"?`Passage ${i+1}`:"Writing Tasks",instructions:"",content:""}));
    const {error:e2}=await sb.from("sections").insert(rows);if(e2)throw e2;openBuilder(t.id);
  }catch(e){alert(e.message)}
}
async function togglePublish(id,val){
  try{
    if(val){
      const issues=await validateTest(id); if(issues.length)return alert("Cannot publish yet:\n\n"+issues.join("\n"));
    }
    const {error}=await sb.from("tests").update({is_published:val,updated_at:new Date().toISOString()}).eq("id",id);if(error)throw error;
    const {data:t}=await sb.from("tests").select("module").eq("id",id).single(); testsPage(t?.module||"all");
  }catch(e){alert(e.message)}
}
async function deleteTest(id){
  if(!confirm("Delete this test and its questions?"))return;
  const {error}=await sb.from("tests").delete().eq("id",id); if(error)alert(error.message); else testsPage("all");
}
async function validateTest(id){
  const d=await loadTestBundle(id),issues=[];
  if(d.test.module==="listening"&&d.sections.length!==4)issues.push("Listening must have 4 Parts.");
  if(d.test.module==="reading"&&d.sections.length!==3)issues.push("Reading must have 3 Passages.");
  if(d.test.module==="writing"&&d.writingTasks.length<2)issues.push("Writing requires Task 1 and Task 2.");
  if(["listening","reading"].includes(d.test.module)&&d.questions.length<1)issues.push("Add questions before publishing.");
  if(d.test.module==="listening"&&!d.audio?.audio_path)issues.push("Upload Listening audio before publishing.");
  d.questions.forEach(q=>{if(d.test.module!=="writing"&&!String(q.correct_answer||"").trim())issues.push(`Question ${q.question_number}: correct answer missing.`)});
  return issues;
}

async function loadTestBundle(id){
  const {data:test,error}=await sb.from("tests").select("*").eq("id",id).single();if(error)throw error;
  const {data:sections,error:se}=await sb.from("sections").select("*").eq("test_id",id).order("section_number");if(se)throw se;
  const sids=(sections||[]).map(x=>x.id);let groups=[],questions=[];
  if(sids.length){
    const g=await sb.from("question_groups").select("*").in("section_id",sids).order("group_order");if(g.error)throw g.error;groups=g.data||[];
    const q=await sb.from("questions").select("*").in("section_id",sids).order("question_number");if(q.error)throw q.error;questions=q.data||[];
  }
  const qids=questions.map(x=>x.id),gids=groups.map(x=>x.id);
  let options=[],groupOptions=[];
  let writingTasks=[];
  if(test.module==="writing"){const wt=await sb.from("writing_tasks").select("*").eq("test_id",id).order("part");if(wt.error)throw wt.error;writingTasks=wt.data||[]}
  if(qids.length){const o=await sb.from("options").select("*").in("question_id",qids).order("sort_order");if(o.error)throw o.error;options=o.data||[]}
  if(gids.length){const o=await sb.from("question_group_options").select("*").in("group_id",gids).order("sort_order");if(o.error)throw o.error;groupOptions=o.data||[]}
  const byQ={};options.forEach(o=>(byQ[o.question_id]??=[]).push(o));questions=questions.map(q=>({...q,options:byQ[q.id]||[],config:q.question_config||{}}));
  const byG={};groupOptions.forEach(o=>(byG[o.group_id]??=[]).push(o));groups=groups.map(g=>({...g,options:byG[g.id]||[]}));
  let audio=null;if(test.module==="listening"){const a=await sb.from("test_audio").select("*").eq("test_id",id).maybeSingle();if(!a.error)audio=a.data}
  return {test,sections:sections||[],groups,questions,audio,writingTasks};
}
async function openBuilder(id){
  setRoute("builder",{testId:id});admin=await loadTestBundle(id);admin.sectionIndex=Math.min(admin.sectionIndex,Math.max(0,admin.sections.length-1));renderBuilder();
}
function normalizeType(t){let x=String(t||"").toLowerCase();x=x.replace(/^listening_/,'').replace(/^reading_/,'');const m={multiple_choice:'single',multiple_choice_single:'single',multiple_choice_multiple:'multi',short_answer:'short',note_completion:'note',form_completion:'form',table_completion:'table',sentence_completion:'sentence',summary_completion:'summary',flowchart_completion:'flow',flow_chart_completion:'flow',diagram_label:'map',diagram_label_completion:'map',plan_map:'map',true_false_not_given:'tfng',yes_no_not_given:'yng'};return m[x]||x}
function typeMap(){return admin.test.module==="reading"?R_TYPES:L_TYPES}
function renderBuilder(){
  const t=admin.test,s=admin.sections[admin.sectionIndex],qs=admin.questions.filter(q=>q.section_id===s?.id),gs=admin.groups.filter(g=>g.section_id===s?.id);
  shell(`<div class="actions"><button class="btn secondary" onclick="testsPage('${t.module}')">← Tests</button><button class="btn primary" onclick="previewCurrentTest()">👁 Preview</button></div>
  <h2>Edit: ${esc(t.title)}</h2><div class="card"><h3>Test Details</h3><div class="grid"><div><label>Title</label><input id="btTitle" value="${attr(t.title)}"></div><div><label>Duration</label><input id="btDur" type="number" value="${t.duration_minutes}"></div></div>
  <label>Description</label><textarea id="btDesc">${esc(t.description||"")}</textarea><button class="btn primary" onclick="saveTestHeader()">Save Test Details</button></div>
  ${t.module==="listening"?renderAudioAdmin():""}
  <div class="section-tabs">${admin.sections.map((x,i)=>`<button class="btn ${i===admin.sectionIndex?"primary":"secondary"}" onclick="switchAdminSection(${i})">${t.module==="reading"?"Passage":"Part"} ${i+1}</button>`).join("")}</div>
  ${s?`<div class="card"><h3>${esc(s.title||"Section")}</h3><div class="grid"><div><label>Title</label><input id="bsTitle" value="${attr(s.title||"")}"></div><div><label>Image URL / Path</label><input id="bsImage" value="${attr(s.image_url||s.image_path||"")}"></div></div>
  <label>Instructions</label><textarea id="bsInst">${esc(s.instructions||"")}</textarea><label>${t.module==="reading"?"Passage Text":"Content / Notes"}</label><textarea id="bsContent" style="min-height:220px">${esc(s.content||"")}</textarea>
  <div class="actions"><button class="btn primary" onclick="saveSection('${s.id}')">Save ${t.module==="reading"?"Passage":"Part"}</button></div></div>`:""}
  ${t.module==="writing"?renderWritingAdmin(qs):renderQuestionAdmin(gs,qs)}`);
}
function renderAudioAdmin(){
  return `<div class="card" style="margin-top:12px"><h3>Listening Audio</h3><p class="muted">Use one complete Listening audio file for the test.</p>
  <input id="audioFile" type="file" accept="audio/*"><div class="actions" style="margin-top:10px"><button class="btn primary" onclick="uploadAudio()">Upload / Replace Audio</button>
  ${admin.audio?`<button class="btn danger" onclick="removeAudio()">Remove Audio</button>`:""}</div>${admin.audio?`<p>Current: ${esc(admin.audio.original_name||admin.audio.audio_path)}</p>`:""}</div>`;
}
function renderQuestionAdmin(gs,qs){
  return `<div class="card" style="margin-top:12px"><div class="actions"><button class="btn primary" onclick="groupForm()">+ Question Group</button><button class="btn primary" onclick="questionForm()">+ Question</button></div>
  <h3>Question Groups</h3>${gs.map(g=>`<div class="editor-block"><strong>Q${g.start_question}–${g.end_question} • ${esc(typeMap()[g.question_type]||g.question_type)}</strong><div class="muted">${esc(g.instructions||"")}</div>
  <div class="actions"><button class="btn secondary" onclick="groupForm('${g.id}')">Edit</button><button class="btn danger" onclick="deleteGroup('${g.id}')">Delete</button></div></div>`).join("")||`<p class="muted">No groups yet.</p>`}
  <h3>Questions</h3>${qs.map(q=>`<div class="editor-block"><strong>${q.question_number}. ${esc(q.question_text||"(inline blank)")}</strong><div>${esc(typeMap()[q.question_type]||q.question_type)} • Correct: ${esc(q.correct_answer||"")}</div>
  <div class="actions"><button class="btn secondary" onclick="questionForm('${q.id}')">Edit</button><button class="btn danger" onclick="deleteQuestion('${q.id}')">Delete</button></div></div>`).join("")||`<p class="muted">No questions yet.</p>`}</div>`;
}
function renderWritingAdmin(qs){
  const tasks=(admin.writingTasks||[]).slice().sort((a,b)=>a.part-b.part);
  return `<div class="card" style="margin-top:12px"><h3>Writing Tasks</h3><p class="muted">Task 1 minimum 150 words; Task 2 minimum 250 words. These tasks are stored in <code>writing_tasks</code>.</p>
  <div class="actions"><button class="btn primary" onclick="writingTaskForm()">+ Add / Edit Task</button></div>
  ${tasks.map(q=>`<div class="editor-block"><strong>Task ${q.part} • ${esc(q.task_type||'task')}</strong><div>${esc(q.prompt||'')}</div><div class="muted">Minimum: ${q.minimum||'-'} • Maximum: ${q.maximum||'-'} • Evaluation: ${esc(q.evaluation_status||'pending')}</div><div class="actions"><button class="btn secondary" onclick="writingTaskForm(${q.part})">Edit</button><button class="btn danger" onclick="deleteWritingTask('${q.id}')">Delete</button></div></div>`).join("")||`<p class="muted">No writing tasks yet.</p>`}</div>`;
}
function switchAdminSection(i){admin.sectionIndex=i;renderBuilder()}
async function saveTestHeader(){const {error}=await sb.from("tests").update({title:$("btTitle").value.trim(),description:$("btDesc").value.trim(),duration_minutes:+$("btDur").value,updated_at:new Date().toISOString()}).eq("id",admin.test.id);if(error)alert(error.message);else openBuilder(admin.test.id)}
async function saveSection(id){const {error}=await sb.from("sections").update({title:$("bsTitle").value.trim(),instructions:$("bsInst").value,content:$("bsContent").value,image_url:$("bsImage").value.trim()||null}).eq("id",id);if(error)alert(error.message);else openBuilder(admin.test.id)}

function groupForm(id=null){
  const s=admin.sections[admin.sectionIndex],g=id?admin.groups.find(x=>x.id===id):null;
  shell(`<div class="actions"><button class="btn secondary" onclick="renderBuilder()">← Builder</button></div><h2>${g?"Edit":"Add"} Question Group</h2><div class="card">
  <div class="grid3"><div><label>Start Question</label><input id="gStart" type="number" value="${g?.start_question||1}"></div><div><label>End Question</label><input id="gEnd" type="number" value="${g?.end_question||1}"></div>
  <div><label>Question Type</label><select id="gType">${Object.entries(typeMap()).map(([k,v])=>`<option value="${k}" ${normalizeType(g?.question_type)===k?"selected":""}>${esc(v)}</option>`).join("")}</select></div></div>
  <label>Group Title / Heading</label><input id="gTitle" value="${attr(g?.group_title||"")}">
  <label>Instructions</label><textarea id="gInst">${esc(g?.instructions||"")}</textarea><label>Group Content / Heading / Notes</label><textarea id="gContent" style="min-height:220px">${esc(g?.content||"")}</textarea>
  <p class="inline-help">For completion types use tokens such as: Cheapest properties: £ [BLANK 1] per week</p><label>Image URL / Path</label><input id="gImage" value="${attr(g?.image_url||g?.image_path||"")}">
  <label>Shared Option Bank (one per line: A|Option text)</label><textarea id="gOptions">${esc((g?.options||[]).map(o=>`${o.option_key}|${o.option_text}`).join("\n"))}</textarea>
  <button class="btn primary" onclick="saveGroup('${id||""}','${s.id}')">Save Group</button></div>`);
}
async function saveGroup(id,sid){
  try{
    const payload={section_id:sid,start_question:+$("gStart").value,end_question:+$("gEnd").value,question_type:$("gType").value,instructions:$("gInst").value,content:$("gContent").value,image_url:$("gImage").value.trim()||null,group_order:+$("gStart").value,group_title:$("gTitle").value.trim()||null};
    let gid=id;if(id){const {error}=await sb.from("question_groups").update(payload).eq("id",id);if(error)throw error}else{const {data,error}=await sb.from("question_groups").insert(payload).select().single();if(error)throw error;gid=data.id}
    await sb.from("question_group_options").delete().eq("group_id",gid);
    const rows=$("gOptions").value.split("\n").map((x,i)=>{const [k,...rest]=x.split("|");return k&&rest.length?{group_id:gid,option_key:k.trim(),option_text:rest.join("|").trim(),sort_order:i}:null}).filter(Boolean);
    if(rows.length){const {error}=await sb.from("question_group_options").insert(rows);if(error)throw error}
    openBuilder(admin.test.id);
  }catch(e){alert(e.message)}
}
async function deleteGroup(id){if(!confirm("Delete this group?"))return;const {error}=await sb.from("question_groups").delete().eq("id",id);if(error)alert(error.message);else openBuilder(admin.test.id)}

function questionForm(id=null){
  const s=admin.sections[admin.sectionIndex],q=id?admin.questions.find(x=>x.id===id):null;
  shell(`<div class="actions"><button class="btn secondary" onclick="renderBuilder()">← Builder</button></div><h2>${q?"Edit":"Add"} Question</h2><div class="card">
  <div class="grid3"><div><label>Question No.</label><input id="qNo" type="number" value="${q?.question_number||1}"></div><div><label>Question Type</label><select id="qType">${Object.entries(typeMap()).map(([k,v])=>`<option value="${k}" ${normalizeType(q?.question_type)===k?"selected":""}>${esc(v)}</option>`).join("")}</select></div><div><label>Marks</label><input id="qMarks" type="number" value="${q?.marks||1}"></div></div>
  <label>Question Text</label><textarea id="qText">${esc(q?.question_text||"")}</textarea><label>Correct Answer</label><input id="qCorrect" value="${attr(q?.correct_answer||"")}"><p class="inline-help">For multiple accepted answers, separate with ||, e.g. centre||center</p>
  <label>Alternative Accepted Answers (optional)</label><input id="qAccepted" value="${attr((q?.config?.acceptedAnswers||[]).join("||"))}"><div class="grid"><div><label>Word Limit</label><input id="qLimit" type="number" value="${q?.config?.wordLimit||""}"></div><div><label>Case Sensitive</label><select id="qCase"><option value="false" ${q?.config?.caseSensitive?"":"selected"}>No</option><option value="true" ${q?.config?.caseSensitive?"selected":""}>Yes</option></select></div></div>
  <label>Options (one per line: A|Option text)</label><textarea id="qOptions">${esc((q?.options||[]).map(o=>`${o.option_key}|${o.option_text}`).join("\n"))}</textarea><label>Image URL / Path</label><input id="qImage" value="${attr(q?.image_url||"")}">
  <button class="btn primary" onclick="saveQuestion('${id||""}','${s.id}')">Save Question</button></div>`);
}
async function saveQuestion(id,sid){
  try{
    const accepted=$("qAccepted").value.split("||").map(x=>x.trim()).filter(Boolean);
    const config={...(id?((admin.questions.find(x=>x.id===id)||{}).question_config||{}):{}),acceptedAnswers:accepted,wordLimit:+$("qLimit").value||null,caseSensitive:$("qCase").value==="true"};
    const payload={section_id:sid,question_number:+$("qNo").value,question_type:$("qType").value,question_text:$("qText").value,marks:+$("qMarks").value||1,correct_answer:$("qCorrect").value.trim(),image_url:$("qImage").value.trim()||null,question_config:config};
    let qid=id;if(id){const {error}=await sb.from("questions").update(payload).eq("id",id);if(error)throw error}else{const {data,error}=await sb.from("questions").insert(payload).select().single();if(error)throw error;qid=data.id}
    await sb.from("options").delete().eq("question_id",qid);
    const rows=$("qOptions").value.split("\n").map((x,i)=>{const [k,...rest]=x.split("|");return k&&rest.length?{question_id:qid,option_key:k.trim(),option_text:rest.join("|").trim(),sort_order:i,is_correct:false}:null}).filter(Boolean);
    if(rows.length){const {error}=await sb.from("options").insert(rows);if(error)throw error}
    openBuilder(admin.test.id);
  }catch(e){alert(e.message)}
}
function writingTaskForm(part=null){
  const tasks=admin.writingTasks||[],w=part?tasks.find(x=>x.part===part):null,n=part||([1,2].find(x=>!tasks.some(t=>t.part===x))||1);
  shell(`<div class="actions"><button class="btn secondary" onclick="renderBuilder()">← Builder</button></div><h2>${w?"Edit":"Add"} Writing Task ${n}</h2><div class="card">
  <label>Task Number</label><select id="wNo"><option value="1" ${n==1?"selected":""}>Task 1</option><option value="2" ${n==2?"selected":""}>Task 2</option></select>
  <label>Instructions</label><textarea id="wInst">${esc(w?.instructions||"")}</textarea><label>Prompt</label><textarea id="wPrompt" style="min-height:180px">${esc(w?.prompt||"")}</textarea>
  <div class="grid"><div><label>Minimum Words</label><input id="wMin" type="number" value="${w?.minimum??(n==1?150:250)}"></div><div><label>Maximum Words (optional)</label><input id="wMax" type="number" value="${w?.maximum??""}"></div></div>
  <label>Visual Media URL / Path (Task 1 optional)</label><input id="wMedia" value="${attr(w?.media_url||"")}">
  <button class="btn primary" onclick="saveWritingTask('${w?.id||""}')">Save Task</button></div>`);
}
async function saveWritingTask(id){
  try{const part=+$('wNo').value;const payload={test_id:admin.test.id,part,task_type:part===1?'task1':'task2',instructions:$('wInst').value,prompt:$('wPrompt').value,minimum:+$('wMin').value||null,maximum:+$('wMax').value||null,suggested:part===1?20:40,media_url:$('wMedia').value.trim()||null,evaluation_status:'pending',updated_at:new Date().toISOString()};
    let error; if(id){({error}=await sb.from('writing_tasks').update(payload).eq('id',id))}else{({error}=await sb.from('writing_tasks').insert(payload))} if(error)throw error;openBuilder(admin.test.id)
  }catch(e){alert(e.message)}
}
async function deleteWritingTask(id){if(!confirm('Delete this writing task?'))return;const {error}=await sb.from('writing_tasks').delete().eq('id',id);if(error)alert(error.message);else openBuilder(admin.test.id)}
async function deleteQuestion(id){if(!confirm("Delete this question?"))return;const {error}=await sb.from("questions").delete().eq("id",id);if(error)alert(error.message);else openBuilder(admin.test.id)}

async function deleteQuestion(id){if(!confirm("Delete this question?"))return;const {error}=await sb.from("questions").delete().eq("id",id);if(error)alert(error.message);else openBuilder(admin.test.id)}

async function uploadAudio(){
  const f=$("audioFile").files[0];if(!f)return alert("Choose audio file.");
  try{
    const path=`${admin.test.id}/listening.${(f.name.split(".").pop()||"mp3").replace(/[^a-z0-9]/gi,"")}`;
    const u=await sb.storage.from("listening-audio").upload(path,f,{upsert:true,contentType:f.type});if(u.error)throw u.error;
    const {error}=await sb.from("test_audio").upsert({test_id:admin.test.id,audio_path:path,original_name:f.name,mime_type:f.type,updated_at:new Date().toISOString()},{onConflict:"test_id"});if(error)throw error;openBuilder(admin.test.id)
  }catch(e){alert(e.message)}
}
async function removeAudio(){if(!admin.audio)return;await sb.storage.from("listening-audio").remove([admin.audio.audio_path]);await sb.from("test_audio").delete().eq("test_id",admin.test.id);openBuilder(admin.test.id)}
async function signed(bucket,path){if(!path)return null;const {data,error}=await sb.storage.from(bucket).createSignedUrl(path,3600);if(error)throw error;return data.signedUrl}

async function studentDashboard(){
  setRoute("student-dashboard");
  const {data,error}=await sb.from("tests").select("id,title,module,description,duration_minutes,total_questions").eq("is_published",true).order("module");if(error)return alert(error.message);
  shell(`<h2>Student Dashboard</h2><p class="muted">Select a published test to begin.</p><div class="dashboard-grid">${(data||[]).map(t=>`<button class="dashbtn" onclick="startStudentTest('${t.id}',true)"><div style="font-size:32px">${t.module==="listening"?"🎧":t.module==="reading"?"📖":"✍️"}</div><strong>${esc(t.title)}</strong><span class="muted">${t.module.toUpperCase()} • ${t.duration_minutes} min</span></button>`).join("")||`<div class="card">No published tests are available.</div>`}</div>`,"Universal Education IELTS","Student Testing Platform");
}
async function createAttempt(test){
  const user=(await sb.auth.getUser()).data.user;
  const {data,error}=await sb.from("results").insert({student_id:user.id,test_id:test.id,status:"in_progress",started_at:new Date().toISOString()}).select().single();
  if(error)throw error;return data;
}
async function startStudentTest(id,resume=true,preview=false){
  try{
    const d=await loadTestBundle(id);if(!d.test.is_published&&!preview)throw new Error("This test is not published.");
    let saved=resume?loadExam(id):null,attempt=null;if(!preview&&!saved?.resultId)attempt=await createAttempt(d.test);
    let audioUrl=null;if(d.audio?.audio_path)audioUrl=await signed("listening-audio",d.audio.audio_path);
    exam={preview,testId:id,resultId:preview?null:(saved?.resultId||attempt?.id),data:d,currentSection:saved?.currentSection||0,currentTask:saved?.currentTask||0,answers:saved?.answers||{},startedAt:saved?.startedAt||new Date().toISOString(),endAt:preview?null:(saved?.endAt>Date.now()?saved.endAt:Date.now()+d.test.duration_minutes*60000),audioUrl};
    if(!preview){setRoute("exam",{testId:id});saveExam()}renderExam();startTimer();
  }catch(e){alert(e.message)}
}
function previewCurrentTest(){startStudentTest(admin.test.id,false,true)}
function headerExam(){return `<div class="topbar"><div><div class="brand">${esc(exam.data.test.title)}</div><div class="subbrand">${exam.preview?"Student Preview":exam.data.test.module.toUpperCase()+" Test"}</div></div><div class="userbox"><span id="timer" class="timer">${exam.preview?"PREVIEW":fmtTime(exam.endAt-Date.now())}</span><button class="btn secondary" onclick="exitExam()">${exam.preview?"Close Preview":"Exit"}</button></div></div>`}
function fmtTime(ms){const x=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(x/3600),m=Math.floor(x%3600/60),s=x%60;return `${h?String(h).padStart(2,"0")+":":""}${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
function startTimer(){if(timerHandle)clearInterval(timerHandle);if(exam?.preview)return;timerHandle=setInterval(()=>{if(!exam)return clearInterval(timerHandle);const ms=exam.endAt-Date.now(),el=$("timer");if(el)el.textContent=fmtTime(ms);if(ms<=0){clearInterval(timerHandle);submitExam(true)}},1000)}
function setAns(k,v){exam.answers[k]=v;saveExam()}
function toggleAns(k,v,on){let a=Array.isArray(exam.answers[k])?[...exam.answers[k]]:[];if(on&&!a.includes(v))a.push(v);if(!on)a=a.filter(x=>x!==v);exam.answers[k]=a;saveExam()}
function switchExamSection(i){exam.currentSection=Math.max(0,Math.min(i,exam.data.sections.length-1));saveExam();renderExam();startTimer()}
function switchTask(i){exam.currentTask=Math.max(0,Math.min(i,1));saveExam();renderExam();startTimer()}
function tabs(label){return `<div class="section-tabs">${exam.data.sections.map((s,i)=>`<button class="btn ${i===exam.currentSection?"primary":"secondary"}" onclick="switchExamSection(${i})">${label} ${i+1}</button>`).join("")}</div>`}
function qnav(qs){return `<div class="qnav">${qs.map(q=>`<button class="${hasAns(q.id)?"done":""}" onclick="document.getElementById('q-${q.id}')?.scrollIntoView({behavior:'smooth'})">${q.question_number}</button>`).join("")}</div>`}
function hasAns(id){const v=exam.answers[id];return Array.isArray(v)?v.length>0:String(v??"").trim()!==""}
function renderExam(){
  const m=exam.data.test.module;if(m==="writing")return renderWritingExam();
  const s=exam.data.sections[exam.currentSection],qs=exam.data.questions.filter(q=>q.section_id===s.id).sort((a,b)=>a.question_number-b.question_number),gs=exam.data.groups.filter(g=>g.section_id===s.id).sort((a,b)=>a.group_order-b.group_order);
  if(m==="reading"){
    app().innerHTML=headerExam()+`<div class="shell">${tabs("Passage")}<div class="exam-split"><div class="pane"><h2>${esc(s.title)}</h2>${s.instructions?`<div class="instructions">${esc(s.instructions)}</div>`:""}${s.image_url?`<img class="media" src="${attr(s.image_url)}">`:""}<div style="white-space:pre-wrap;line-height:1.8">${esc(s.content||"")}</div></div>
    <div class="pane"><h3>Questions</h3>${qnav(qs)}${renderGroupsOrQuestions(gs,qs)}</div></div>${examNav()}</div>`;
  }else{
    app().innerHTML=headerExam()+`<div class="shell">${tabs("Part")}${exam.audioUrl?`<div class="audio-box"><strong>Listening Audio</strong><audio controls src="${attr(exam.audioUrl)}"></audio></div>`:""}
    <div class="card"><h2>${esc(s.title)}</h2>${s.instructions?`<div class="instructions">${esc(s.instructions)}</div>`:""}${s.image_url?`<img class="media" src="${attr(s.image_url)}">`:""}${s.content?`<div style="white-space:pre-wrap;line-height:1.8">${renderInline(s.content,qs)}</div>`:""}${qnav(qs)}${renderGroupsOrQuestions(gs,qs)}</div>${examNav()}</div>`;
  }
}
function renderGroupsOrQuestions(gs,qs){return gs.length?gs.map(g=>renderGroup(g,qs)).join(""):qs.map(q=>renderQuestion(q)).join("")}
function renderInline(txt,qs){return esc(txt).replace(/\[BLANK\s*(\d+)\]/gi,(_,n)=>{const q=qs.find(x=>+x.question_number===+n),k=q?.id||`blank_${n}`;return `<input style="display:inline-block;width:130px;margin:0 4px" value="${attr(exam.answers[k]||"")}" oninput="setAns('${k}',this.value)">`})}
function renderGroup(g,qs){
  const sub=qs.filter(q=>q.question_number>=g.start_question&&q.question_number<=g.end_question),inline=COMPLETION_TYPES.includes(normalizeType(g.question_type))&&/\[BLANK\s*\d+\]/i.test(g.content||"");
  return `<div class="group"><strong>Questions ${g.start_question}–${g.end_question}</strong>${g.instructions?`<div class="instructions">${esc(g.instructions)}</div>`:""}${g.image_url?`<img class="media" src="${attr(g.image_url)}">`:""}${g.content?`<div style="white-space:pre-wrap;line-height:1.8">${renderInline(g.content,sub)}</div>`:""}
  ${(g.options||[]).length?`<div class="notice">${g.options.map(o=>`<div><strong>${esc(o.option_key)}.</strong> ${esc(o.option_text)}</div>`).join("")}</div>`:""}${inline?"":sub.map(q=>renderQuestion(q,g.options||[])).join("")}</div>`;
}
function renderQuestion(q,shared=[]){
  const opts=(q.options||[]).length?q.options:shared,s=exam.answers[q.id]??"",t=normalizeType(q.question_type);let c="";
  if(t==="single"||["tfng","yng","title"].includes(t)){c=opts.map(o=>`<label style="font-weight:400"><input style="width:auto" type="radio" name="r-${q.id}" value="${attr(o.option_key)}" ${s===o.option_key?"checked":""} onchange="setAns('${q.id}',this.value)"> <strong>${esc(o.option_key)}.</strong> ${esc(o.option_text)}</label>`).join("")}
  else if(t==="multi"||t==="list"){const a=Array.isArray(s)?s:[];c=opts.map(o=>`<label style="font-weight:400"><input style="width:auto" type="checkbox" value="${attr(o.option_key)}" ${a.includes(o.option_key)?"checked":""} onchange="toggleAns('${q.id}',this.value,this.checked)"> ${esc(o.option_key)}. ${esc(o.option_text)}</label>`).join("")}
  else if(["matching","map","headings","information","features","endings"].includes(t)&&opts.length){c=`<select onchange="setAns('${q.id}',this.value)"><option value="">Select answer</option>${opts.map(o=>`<option value="${attr(o.option_key)}" ${s===o.option_key?"selected":""}>${esc(o.option_key)} — ${esc(o.option_text)}</option>`).join("")}</select>`}
  else c=`<input value="${attr(Array.isArray(s)?s.join(", "):s)}" oninput="setAns('${q.id}',this.value)" placeholder="Type your answer">`;
  return `<div id="q-${q.id}" class="question"><strong>${q.question_number}. ${esc(q.question_text||"")}</strong>${q.image_url?`<img class="media" src="${attr(q.image_url)}">`:""}<div style="margin-top:8px">${c}</div></div>`;
}
function examNav(){return `<div class="actions" style="justify-content:space-between;margin-top:14px"><button class="btn secondary" ${exam.currentSection===0?"disabled":""} onclick="switchExamSection(${exam.currentSection-1})">← Previous</button>${exam.currentSection<exam.data.sections.length-1?`<button class="btn primary" onclick="switchExamSection(${exam.currentSection+1})">Next →</button>`:`<button class="btn success" onclick="${exam.preview?"exitExam()":"submitExam(false)"}">${exam.preview?"Close Preview":"Submit Test"}</button>`}</div>`}
function renderWritingExam(){
  const tasks=(exam.data.writingTasks||[]).slice().sort((a,b)=>a.part-b.part),q=tasks[Math.min(exam.currentTask,tasks.length-1)];
  app().innerHTML=headerExam()+`<div class="shell"><div class="section-tabs">${tasks.map((x,i)=>`<button class="btn ${i===exam.currentTask?"primary":"secondary"}" onclick="switchTask(${i})">Task ${i+1}</button>`).join("")}</div>
  ${q?`<div class="writing-grid"><div class="pane"><h2>Writing Task ${q.part}</h2>${q.instructions?`<div class="instructions">${esc(q.instructions)}</div>`:""}${q.media_url?`<img class="media" src="${attr(q.media_url)}">`:""}<div style="white-space:pre-wrap;line-height:1.8">${esc(q.prompt||"")}</div></div>
  <div class="pane"><div class="actions" style="justify-content:space-between"><h3>Your Answer</h3><strong id="wc">0 words</strong></div><textarea class="writing-answer" id="wa" oninput="setWriting('task_${q.id}',this.value)">${esc(exam.answers['task_'+q.id]||"")}</textarea><p class="muted">Minimum: ${q.minimum|| (q.part===1?150:250)} words${q.maximum?` • Maximum: ${q.maximum}`:""}</p></div></div>`:`<div class="card">Writing tasks not configured.</div>`}
  <div class="actions" style="justify-content:space-between;margin-top:14px"><button class="btn secondary" ${exam.currentTask===0?"disabled":""} onclick="switchTask(${exam.currentTask-1})">← Previous Task</button>${exam.currentTask<tasks.length-1?`<button class="btn primary" onclick="switchTask(${exam.currentTask+1})">Next Task →</button>`:`<button class="btn success" onclick="${exam.preview?"exitExam()":"submitExam(false)"}">${exam.preview?"Close Preview":"Submit Writing Test"}</button>`}</div></div>`;
  updateWC();
}
function setWriting(id,v){setAns(id,v);updateWC()}function updateWC(){const v=$("wa")?.value||"",n=v.trim()?v.trim().split(/\s+/).length:0;if($("wc"))$("wc").textContent=n+" words"}

function norm(v){return String(v??"").trim().toLowerCase().replace(/\s+/g," ")}
function evalQ(q,a){
  const cfg=q.config||q.question_config||{};
  const clean=v=>cfg.caseSensitive?String(v??"").trim().replace(/\s+/g," "):norm(v);
  const base=String(q.correct_answer||"").split("||");
  const extra=Array.isArray(cfg.acceptedAnswers)?cfg.acceptedAnswers:[];
  const exp=[...base,...extra].map(clean).filter(Boolean);
  if(Array.isArray(a)){const aa=a.map(clean).sort(),ee=exp.slice().sort();return JSON.stringify(aa)===JSON.stringify(ee)}
  return exp.includes(clean(a));
}
async function submitExam(auto=false){
  if(exam.preview)return exitExam();
  if(!auto&&!confirm("Submit test? Answers will be locked."))return;
  try{
    if(timerHandle)clearInterval(timerHandle);
    const mod=exam.data.test.module;
    const qs=mod==="writing"?(exam.data.questions.length?exam.data.questions.slice().sort((a,b)=>a.question_number-b.question_number).slice(0,2):(exam.data.writingTasks||[]).map(w=>({id:null,question_number:w.part,marks:0,correct_answer:null,writingTaskId:w.id}))):exam.data.questions;
    if(mod==="writing"){
      for(const q of qs){
        if(!q.id){const wt=(exam.data.writingTasks||[]).find(w=>w.part===q.question_number);const sec=exam.data.sections[0];const ins={section_id:sec.id,question_number:q.question_number,question_type:'writing',question_text:wt?.prompt||'',marks:0,correct_answer:null,image_url:wt?.media_url||null,question_config:{writingTaskId:wt?.id}};const {data,error}=await sb.from('questions').insert(ins).select().single();if(error)throw error;q.id=data.id;}
      }
    }
    const rows=qs.map(q=>({result_id:exam.resultId,question_id:q.id,answer_text:Array.isArray(exam.answers[mod==="writing"?"task_"+((exam.data.writingTasks||[]).find(w=>w.part===q.question_number)?.id||q.id):q.id])?exam.answers[mod==="writing"?"task_"+((exam.data.writingTasks||[]).find(w=>w.part===q.question_number)?.id||q.id):q.id].join(", "):String(exam.answers[mod==="writing"?"task_"+((exam.data.writingTasks||[]).find(w=>w.part===q.question_number)?.id||q.id):q.id]??""),is_correct:mod==="writing"?null:evalQ(q,exam.answers[q.id]),marks_obtained:mod==="writing"?0:(evalQ(q,exam.answers[q.id])?Number(q.marks||1):0)}));
    if(rows.length){const {error}=await sb.from("answers").insert(rows);if(error)throw error}
    if(mod==="writing"){
      // Writing responses are stored in the common answers table; writing_tasks remains the task definition/evaluation source.
    }
    const total=mod==="writing"?0:qs.reduce((s,q)=>s+Number(q.marks||1),0),score=mod==="writing"?null:qs.reduce((s,q)=>s+(evalQ(q,exam.answers[q.id])?Number(q.marks||1):0),0);
    const upd={status:"submitted",submitted_at:new Date().toISOString()};if(mod==="listening")upd.listening_score=score;if(mod==="reading")upd.reading_score=score;if(mod==="writing")upd.writing_score=null;
    const {error}=await sb.from("results").update(upd).eq("id",exam.resultId);if(error)throw error;
    const id=exam.testId;clearExam(id);clearRoute();exam=null;
    shell(`<div class="card" style="max-width:700px;margin:30px auto;text-align:center"><div style="font-size:52px">✅</div><h2>${auto?"Time ended — Test submitted":"Test submitted successfully"}</h2>
    ${mod==="writing"?`<p>Writing response saved. <strong>Evaluation Pending</strong>.</p>`:`<p>Your score: <strong>${score} / ${total}</strong></p>`}<button class="btn primary" onclick="studentDashboard()">Back to Student Dashboard</button></div>`,"Universal Education IELTS","Result");
  }catch(e){alert("Submission failed: "+e.message)}
}
function exitExam(){if(timerHandle)clearInterval(timerHandle);if(exam?.preview){exam=null;return openBuilder(admin.test.id)}saveExam();exam=null;clearRoute();studentDashboard()}

async function resultsPage(){
  setRoute("results");
  const {data,error}=await sb.from("results").select("*,tests(title,module)").order("created_at",{ascending:false});if(error)return alert(error.message);
  const ids=[...new Set((data||[]).map(r=>r.student_id).filter(Boolean))];let profiles=[];if(ids.length){const p=await sb.from("profiles").select("id,full_name,email").in("id",ids);if(!p.error)profiles=p.data||[]}const pm=new Map(profiles.map(x=>[x.id,x]));
  shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button></div><h2>Results</h2><div class="card table-wrap"><table><thead><tr><th>Student</th><th>Test</th><th>Status</th><th>Score</th><th>Submitted</th></tr></thead><tbody>
  ${(data||[]).map(r=>{const mod=r.tests?.module,p=pm.get(r.student_id);const score=mod==="listening"?r.listening_score??"-":mod==="reading"?r.reading_score??"-":r.writing_score??"Pending";return `<tr><td>${esc(p?.full_name||p?.email||r.student_id||"")}</td><td>${esc(r.tests?.title||"")}<br><small>${esc(mod||"")}</small></td><td>${esc(r.status||"")}</td><td>${score}</td><td>${r.submitted_at?new Date(r.submitted_at).toLocaleString():"-"}</td></tr>`}).join("")||`<tr><td colspan="5">No results.</td></tr>`}</tbody></table></div>`);
}

window.staffDashboard=staffDashboard;window.studentDashboard=studentDashboard;window.studentsPage=studentsPage;window.testsPage=testsPage;window.newTestForm=newTestForm;window.syncNewTestDefaults=syncNewTestDefaults;window.createTest=createTest;window.togglePublish=togglePublish;window.deleteTest=deleteTest;window.openBuilder=openBuilder;window.renderBuilder=renderBuilder;window.switchAdminSection=switchAdminSection;window.saveTestHeader=saveTestHeader;window.saveSection=saveSection;window.groupForm=groupForm;window.saveGroup=saveGroup;window.deleteGroup=deleteGroup;window.questionForm=questionForm;window.saveQuestion=saveQuestion;window.deleteQuestion=deleteQuestion;window.writingTaskForm=writingTaskForm;window.saveWritingTask=saveWritingTask;window.deleteWritingTask=deleteWritingTask;window.uploadAudio=uploadAudio;window.removeAudio=removeAudio;window.previewCurrentTest=previewCurrentTest;window.startStudentTest=startStudentTest;window.switchExamSection=switchExamSection;window.switchTask=switchTask;window.setAns=setAns;window.toggleAns=toggleAns;window.setWriting=setWriting;window.submitExam=submitExam;window.exitExam=exitExam;window.resultsPage=resultsPage;window.logout=logout;
document.addEventListener("DOMContentLoaded",init);
