// UNIVERSAL EDUCATION IELTS — COMPLETE V12.0 CUMULATIVE
const SUPABASE_URL = "https://fmwcvwgcwisdxiudlstq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ibtCq2hamnZkRNWPsxlddQ_JfexwHYM";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});

const app = () => document.getElementById("app");
const esc = v => String(v ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const attr = v => esc(v).replace(/`/g,"&#96;");
const $ = id => document.getElementById(id);

/* =========================================================
   V12.2 RICH TEXT + STUDENT HIGHLIGHT
   Cumulative feature: does not replace scoring/auth/test logic.
   ========================================================= */
function richTextSanitize(html=""){
  const raw=String(html||"");
  if(raw && !/<[a-z][\s\S]*>/i.test(raw)){
    // Decode any previously HTML-encoded plain text (e.g. &#039;) before re-encoding safely.
    const decoder=document.createElement("textarea");
    decoder.innerHTML=raw;
    const decoded=decoder.value;
    return esc(decoded).replace(/\r?\n/g,"<br>");
  }
  const box=document.createElement("div");
  box.innerHTML=raw;
  const allowed=new Set(["P","BR","STRONG","B","EM","I","U","UL","OL","LI","DIV","SPAN","MARK","H1","H2","H3","H4","BLOCKQUOTE"]);
  box.querySelectorAll("*").forEach(el=>{
    if(!allowed.has(el.tagName)){el.replaceWith(document.createTextNode(el.textContent||""));return;}
    [...el.attributes].forEach(a=>{if(a.name!=="style")el.removeAttribute(a.name)});
    if(el.hasAttribute("style")){
      const st=el.style, keep=[];
      if(st.fontWeight)keep.push(`font-weight:${st.fontWeight}`);
      if(st.fontStyle)keep.push(`font-style:${st.fontStyle}`);
      if(st.textDecoration)keep.push(`text-decoration:${st.textDecoration}`);
      if(st.textAlign)keep.push(`text-align:${st.textAlign}`);
      if(st.backgroundColor)keep.push(`background-color:${st.backgroundColor}`);
      el.setAttribute("style",keep.join(";"));
    }
  });
  return box.innerHTML;
}
function richEditor(id,value="",height=220){
  return `<div class="rich-toolbar" data-rich-toolbar="${id}">
    <button type="button" onclick="richExec('${id}','bold')"><b>B</b></button>
    <button type="button" onclick="richExec('${id}','italic')"><i>I</i></button>
    <button type="button" onclick="richExec('${id}','underline')"><u>U</u></button>
    <span class="rich-sep"></span>
    <button type="button" onclick="richAlign('${id}','left')">Left</button>
    <button type="button" onclick="richAlign('${id}','center')">Center</button>
    <button type="button" onclick="richAlign('${id}','right')">Right</button>
    <button type="button" onclick="richAlign('${id}','justify')">Justify</button>
    <span class="rich-sep"></span>
    <button type="button" onclick="richExec('${id}','insertUnorderedList')">• List</button>
    <button type="button" onclick="richExec('${id}','insertOrderedList')">1. List</button>
  </div><div id="${id}" class="rich-editor" contenteditable="true" spellcheck="true" style="min-height:${height}px">${richTextSanitize(value)}</div>`;
}
function richExec(id,cmd){const e=$(id);if(!e)return;e.focus();document.execCommand(cmd,false,null)}
function richAlign(id,a){const e=$(id);if(!e)return;e.focus();const m={left:"justifyLeft",center:"justifyCenter",right:"justifyRight",justify:"justifyFull"}[a];document.execCommand(m,false,null)}
function richValue(id){return richTextSanitize($(id)?.innerHTML||"")}
function initRichStyles(){if($("ueRichStyles"))return;const st=document.createElement("style");st.id="ueRichStyles";st.textContent=`
.rich-toolbar{display:flex;flex-wrap:wrap;gap:5px;padding:7px;border:1px solid #d5dce5;border-bottom:0;border-radius:8px 8px 0 0;background:#f5f7fa;margin-top:5px}.rich-toolbar button{border:1px solid #cbd5e1;background:#fff;padding:5px 9px;border-radius:5px;cursor:pointer;font-size:13px}.rich-toolbar button:hover{background:#e8eef7}.rich-sep{width:1px;background:#cbd5e1;margin:2px 4px}.rich-editor{padding:12px;border:1px solid #d5dce5;border-radius:0 0 8px 8px;background:#fff;line-height:1.7;outline:none;overflow:auto}.rich-editor:focus{border-color:#2563eb}.rich-editor p{margin:0 0 10px}.student-rich{line-height:1.8;user-select:text}.student-rich p{margin:0 0 12px}.student-highlight{background:#fff59d!important;border-radius:2px;padding:0 1px}.student-highlight-menu{position:absolute;z-index:99999;display:none;background:#111827;padding:5px;border-radius:7px;box-shadow:0 5px 18px rgba(0,0,0,.25)}.student-highlight-menu button{color:#fff;background:#111827;border:0;padding:7px 11px;border-radius:5px;cursor:pointer}.student-highlight-menu button:hover{background:#374151}`;document.head.appendChild(st)}
function highlightKey(kind,id){return `ue_highlight_v1_${exam?.studentId||currentProfile?.id||"anon"}_${exam?.testId||"test"}_${exam?.resultId||"attempt"}_${kind}_${id}`}
function showHighlightMenu(key){let m=$("studentHighlightMenu");if(!m){m=document.createElement("div");m.id="studentHighlightMenu";m.className="student-highlight-menu";m.innerHTML=`<button type="button" onclick="applyStudentHighlight(window.__ueHighlightKey)">🖍 Highlight</button>`;document.body.appendChild(m)}window.__ueHighlightKey=key;const sel=window.getSelection();if(sel&&sel.rangeCount&&!sel.isCollapsed){const r=sel.getRangeAt(0).getBoundingClientRect();m.style.left=(window.scrollX+r.left)+"px";m.style.top=(window.scrollY+r.bottom+6)+"px";m.style.display="block"}}
function bindHighlightable(root){if(!root)return;root.querySelectorAll(".student-rich").forEach(el=>{el.addEventListener("mouseup",()=>{const sel=window.getSelection();if(sel&&!sel.isCollapsed&&sel.toString().trim())showHighlightMenu(el.dataset.highlightKey)})})}
function applyStudentHighlight(key){const sel=window.getSelection();if(!sel||sel.rangeCount===0||sel.isCollapsed)return;try{document.execCommand("hiliteColor",false,"#fff59d")}catch(_){try{const r=sel.getRangeAt(0),sp=document.createElement("span");sp.className="student-highlight";r.surroundContents(sp)}catch(__){}};saveStudentHighlight(key);if($("studentHighlightMenu"))$("studentHighlightMenu").style.display="none";sel.removeAllRanges()}
function saveStudentHighlight(key){if(!key)return;const el=document.querySelector(`[data-highlight-key="${CSS.escape(key)}"]`);if(el)localStorage.setItem(key,richTextSanitize(el.innerHTML))}
function restoreStudentHighlight(key){const el=document.querySelector(`[data-highlight-key="${CSS.escape(key)}"]`);if(!el)return;const v=localStorage.getItem(key);if(v)el.innerHTML=richTextSanitize(v)}
function restoreAndBindHighlights(){document.querySelectorAll(".student-rich").forEach(el=>{if(el.dataset.highlightKey)restoreStudentHighlight(el.dataset.highlightKey)});if(!exam?.review)bindHighlightable(document)}
document.addEventListener("mousedown",e=>{const m=$("studentHighlightMenu");if(m&&!m.contains(e.target))m.style.display="none"});
initRichStyles();
const routeKey="ue_ielts_route_v1", examPrefix="ue_ielts_exam_v1_";
let loginMode="student", currentProfile=null, admin={test:null,sections:[],groups:[],questions:[],audio:null,sectionIndex:0}, exam=null, timerHandle=null, answerSaveTimers=new Map();
let examAudio=null, examAudioTestId=null, examAudioEnded=false, examAudioStopping=false;

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

// IELTS raw-score to band conversion based on the supplied score table.
const IELTS_BANDS = {
  listening: [
    [[39,40],9],[[37,38],8.5],[[35,36],8],[[32,34],7.5],[[30,31],7],[[26,29],6.5],[[23,25],6],[[18,22],5.5],[[16,17],5],[[13,15],4.5],[[10,12],4],[[8,9],3.5],[[6,7],3],[[4,5],2.5],[[2,3],2],[[0,1],1]
  ],
  academicReading: [
    [[39,40],9],[[37,38],8.5],[[35,36],8],[[33,34],7.5],[[30,32],7],[[27,29],6.5],[[23,26],6],[[19,22],5.5],[[15,18],5],[[13,14],4.5],[[10,12],4],[[8,9],3.5],[[6,7],3],[[4,5],2.5],[[3,3],2],[[2,2],1.5],[[1,1],1],[[0,0],0]
  ],
  generalReading: [
    [[40,40],9],[[39,39],8.5],[[37,38],8],[[36,36],7.5],[[34,35],7],[[32,33],6.5],[[30,31],6],[[27,29],5.5],[[23,26],5],[[19,22],4.5],[[15,18],4],[[13,14],3.5],[[10,12],3],[[8,9],2.5],[[6,7],2],[[4,5],1.5],[[2,3],1],[[0,1],0]
  ]
};
function bandFromRaw(module, score, readingType='academic'){
  const n=Number(score);
  if(!Number.isFinite(n)) return null;
  let table=module==='listening'?IELTS_BANDS.listening:readingType==='general'?IELTS_BANDS.generalReading:IELTS_BANDS.academicReading;
  for(const [[lo,hi],band] of table){ if(n>=lo && n<=hi) return band; }
  return null;
}
function bandText(module, score, readingType='academic'){
  const b=bandFromRaw(module,score,readingType);
  return b==null?'—':String(b);
}

// Keep scoring/review strictly aligned to the official question ranges.
function sectionQuestionRange(module, sectionNumber, data=null){
  const n=Number(sectionNumber||1);
  if(module==='listening') return [((n-1)*10)+1, n*10];
  if(module==='reading'){
    // Reading passage ranges are configurable. Prefer the actual question/group
    // numbers stored in this passage; fall back to the standard 13/13/14 split
    // only when the passage has not been configured yet.
    const sec=(data?.sections||[]).find(x=>Number(x.section_number)===n);
    if(sec){
      const nums=(data?.questions||[])
        .filter(q=>q.section_id===sec.id)
        .map(q=>Number(q.question_number))
        .filter(Number.isFinite);
      const gs=(data?.groups||[])
        .filter(g=>g.section_id===sec.id)
        .flatMap(g=>[Number(g.start_question),Number(g.end_question)])
        .filter(Number.isFinite);
      const all=[...nums,...gs];
      if(all.length) return [Math.min(...all),Math.max(...all)];
    }
    if(n===1) return [1,13];
    if(n===2) return [14,26];
    if(n===3) return [27,40];
  }
  return [1,40];
}
function validModuleQuestions(d){
  const mod=d?.test?.module;
  if(mod==='writing') return (d.questions||[]).filter(q=>q.question_type==='writing').sort((a,b)=>Number(a.question_number)-Number(b.question_number));
  const sections=(d.sections||[]).slice().sort((a,b)=>Number(a.section_number)-Number(b.section_number));
  const byNumber=new Map();
  for(const s of sections){
    const [lo,hi]=sectionQuestionRange(mod,s.section_number,d);
    const qs=(d.questions||[]).filter(q=>q.section_id===s.id && Number(q.question_number)>=lo && Number(q.question_number)<=hi);
    for(const q of qs){
      const no=Number(q.question_number);
      if(!byNumber.has(no)) byNumber.set(no,q);
    }
  }
  return [...byNumber.values()].sort((a,b)=>Number(a.question_number)-Number(b.question_number));
}
function listeningQuestions40(d){
  return validModuleQuestions(d).filter(q=>Number(q.question_number)>=1&&Number(q.question_number)<=40).slice(0,40);
}
function readingQuestions40(d){
  return validModuleQuestions(d).filter(q=>Number(q.question_number)>=1&&Number(q.question_number)<=40).slice(0,40);
}
function normalizeModule(module){ return String(module||"").trim().toLowerCase(); }
function getReadingType(test){ return String((test?.settings||{}).reading_type||"academic").trim().toLowerCase()==='general'?'general':'academic'; }
function scoreBand(module, raw, readingType='academic'){
  const m=normalizeModule(module);
  const n=Number(raw);
  if(!Number.isFinite(n)) return null;
  const whole=Math.max(0,Math.min(40,Math.round(n)));
  if(m==='listening') return bandFromRaw('listening', whole);
  if(m==='reading') return bandFromRaw('reading', whole, readingType);
  return null;
}
async function recalculateStoredScore(r){
  const mod=normalizeModule(r.tests?.module);
  if(mod!=='listening'&&mod!=='reading') return null;
  const d=await loadTestBundle(r.test_id);
  const questions=mod==='listening'?listeningQuestions40(d):readingQuestions40(d);
  const qids=questions.map(q=>q.id);
  let rows=[];
  if(qids.length){const a=await sb.from("answers").select("question_id,answer_text").eq("result_id",r.id).in("question_id",qids);if(a.error)throw a.error;rows=a.data||[]}
  const am=new Map(rows.map(a=>[a.question_id,a]));
  const answerMap={};
  for(const [qid,row] of am.entries()) answerMap[qid]=deserializeStoredAnswer(questions.find(q=>q.id===qid),row.answer_text);
  const summary=calculateObjectiveScore(questions,answerMap);
  const field=mod==='listening'?'listening_score':'reading_score';
  if(Number(r[field])!==summary.score){const u=await sb.from("results").update({[field]:summary.score}).eq("id",r.id);if(u.error)throw u.error;r[field]=summary.score;}
  return summary.score;
}

function setRoute(page,extra={}){localStorage.setItem(routeKey,JSON.stringify({page,...extra}));}
function getRoute(){try{return JSON.parse(localStorage.getItem(routeKey)||"null")}catch{return null}}
function clearRoute(){localStorage.removeItem(routeKey)}
function examKey(id,studentId=null,resultId=null){
  const sid=studentId||exam?.studentId||currentProfile?.id||"anon";
  const rid=resultId||exam?.resultId||"new";
  return `${examPrefix}${sid}_${id}_${rid}`;
}
function legacyExamKey(id){return examPrefix+id}
function saveExam(){
  if(exam&&!exam.preview)localStorage.setItem(examKey(exam.testId,exam.studentId,exam.resultId),JSON.stringify({testId:exam.testId,resultId:exam.resultId,studentId:exam.studentId,currentSection:exam.currentSection,currentTask:exam.currentTask,answers:exam.answers,endAt:exam.endAt,startedAt:exam.startedAt,locked:!!exam.locked}));
}
async function persistAnswerToDb(questionId,value){
  if(!exam||exam.preview||!exam.resultId||!questionId||exam.locked)return;
  try{
    const answerText=Array.isArray(value)?value.join(", "):String(value??"");
    const {data:existing,error:findErr}=await sb.from("answers").select("id").eq("result_id",exam.resultId).eq("question_id",questionId).maybeSingle();
    if(findErr)throw findErr;
    const payload={result_id:exam.resultId,question_id:questionId,answer_text:answerText,is_correct:null,marks_obtained:0};
    if(existing?.id){const {error}=await sb.from("answers").update(payload).eq("id",existing.id);if(error)throw error}
    else {const {error}=await sb.from("answers").insert(payload);if(error)throw error}
  }catch(e){console.warn("Answer autosave failed:",e.message)}
}
function queueAnswerSave(questionId,value){
  if(!exam||exam.preview||exam.locked||!questionId)return;
  const old=answerSaveTimers.get(questionId);if(old)clearTimeout(old);
  answerSaveTimers.set(questionId,setTimeout(()=>{answerSaveTimers.delete(questionId);persistAnswerToDb(questionId,value)},450));
}
async function loadAttemptAnswers(resultId){
  if(!resultId)return {};
  const {data,error}=await sb.from("answers").select("question_id,answer_text").eq("result_id",resultId);
  if(error){console.warn("Could not load saved answers:",error.message);return {}}
  const out={};
  (data||[]).forEach(a=>{out[a.question_id]=String(a.answer_text??"").includes(", ")?String(a.answer_text).split(", ").map(x=>x.trim()).filter(Boolean):String(a.answer_text??"")});
  return out;
}
function loadExam(id,studentId=null,resultId=null){try{return JSON.parse(localStorage.getItem(examKey(id,studentId,resultId))||"null")}catch{return null}}
function clearExam(id,studentId=null,resultId=null){localStorage.removeItem(examKey(id,studentId,resultId));localStorage.removeItem(legacyExamKey(id))}

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
  st.onclick=()=>{loginMode="student";st.classList.add("active");sf.classList.remove("active");$("loginIdLabel").textContent="Student ID";$("loginId").type="text";$("loginId").placeholder="e.g. STU001"};
  sf.onclick=()=>{loginMode="staff";sf.classList.add("active");st.classList.remove("active");$("loginIdLabel").textContent="Admin / Tutor Email";$("loginId").type="email";$("loginId").placeholder="admin@example.com"};
  form.onsubmit=login;
}
async function getProfile(uid){
  const {data,error}=await sb.from("profiles").select("*").eq("id",uid).single();
  if(error) throw error; return data;
}
async function login(e){
  e.preventDefault(); const btn=$("loginButton"),msg=$("loginMessage"); btn.disabled=true; msg.textContent="";
  try{
    const raw=$("loginId").value.trim();
    if(!raw) throw new Error(loginMode==="student"?"Enter Student ID.":"Enter email address.");
    const email=loginMode==="student" ? studentAuthEmail(raw) : raw;
    const {data,error}=await sb.auth.signInWithPassword({email,password:$("password").value});
    if(error) throw error;
    const p=await getProfile(data.user.id); if(!p.active) throw new Error("Account inactive.");
    if(loginMode==="student"&&p.role!=="student") throw new Error("Use Student login.");
    if(loginMode==="staff"&&!['admin','tutor'].includes(p.role)) throw new Error("Use Admin / Tutor login.");
    currentProfile=p; clearRoute(); p.role==="student"?studentDashboard():staffDashboard();
  }catch(err){msg.textContent=err.message;msg.style.color="#dc2626"}finally{btn.disabled=false}
}
function normalizeStudentId(v){return String(v||"").trim().toLowerCase()}
function studentAuthEmail(v){const id=normalizeStudentId(v); if(!/^[a-z0-9][a-z0-9._-]{2,49}$/.test(id)) throw new Error("Student ID may contain only letters, numbers, dot, underscore or hyphen."); return `${id}@students.universaleducation.local`}
async function edgeStudentAdmin(payload){
  const {data:{session}}=await sb.auth.getSession(); if(!session) throw new Error("Admin session expired. Please login again.");
  const {data,error}=await sb.functions.invoke("student-admin",{body:payload});
  if(error) throw error; if(!data?.success) throw new Error(data?.error||"Student management request failed."); return data;
}
async function logout(){stopStudentListeningAudio();clearRoute();if(exam)clearExam(exam.testId,exam.studentId,exam.resultId);exam=null;currentProfile=null;await sb.auth.signOut();location.reload()}

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
  const {data,error}=await sb.from("profiles").select("id,student_code,full_name,role,active,created_at").eq("role","student").order("created_at",{ascending:false});
  if(error)return alert(error.message);
  const {data:tests,tError}=await sb.from("tests").select("id,title,module,is_published").order("created_at",{ascending:false});
  if(tError)return alert(tError.message);
  const rows=(data||[]).map(s=>`<tr><td><strong>${esc(s.student_code||"—")}</strong></td><td>${esc(s.full_name||"")}</td><td>${s.active?"Active":"Inactive"}</td><td>${new Date(s.created_at).toLocaleDateString()}</td><td><div class="actions"><button class="btn secondary" onclick="manageStudent('${s.id}')">Manage</button><button class="btn ${s.active?'warning':'success'}" onclick="toggleStudent('${s.id}',${!s.active})">${s.active?'Deactivate':'Activate'}</button><button class="btn danger" onclick="deleteStudent('${s.id}','${attr(s.student_code||"")}')">Delete</button></div></td></tr>`).join("")||`<tr><td colspan="5">No students.</td></tr>`;
  shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button><button class="btn primary" onclick="newStudentForm()">+ Create Student</button></div>
  <h2>Student Management</h2><p class="muted">Students login with Student ID + Password. Email is not required for students.</p>
  <div class="card"><div class="table-wrap"><table><thead><tr><th>Student ID</th><th>Name</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div></div>`);
}
function newStudentForm(){
  shell(`<div class="actions"><button class="btn secondary" onclick="studentsPage()">← Students</button></div><h2>Create Student</h2><div class="card">
  <label>Student ID</label><input id="stCode" placeholder="e.g. STU001" autocomplete="off">
  <label>Student Name</label><input id="stName" placeholder="Student full name">
  <label>Password</label><input id="stPass" type="password" placeholder="Create password" autocomplete="new-password">
  <label>Confirm Password</label><input id="stPass2" type="password" autocomplete="new-password">
  <div class="notice">The student will login using only <b>Student ID + Password</b>. No student email is required.</div>
  <div class="actions"><button class="btn primary" onclick="createStudent()">Create Student</button></div><div id="studentCreateMsg"></div></div>`);
}
async function createStudent(){
  const code=normalizeStudentId($("stCode").value), name=$("stName").value.trim(), pass=$("stPass").value, pass2=$("stPass2").value;
  if(!/^[a-z0-9][a-z0-9._-]{2,49}$/.test(code))return alert("Student ID must be 3-50 characters: letters, numbers, dot, underscore or hyphen.");
  if(!name)return alert("Enter student name."); if(pass.length<6)return alert("Password must be at least 6 characters."); if(pass!==pass2)return alert("Passwords do not match.");
  try{await edgeStudentAdmin({action:"create",student_code:code,full_name:name,password:pass});alert("Student created successfully.");studentsPage()}catch(e){alert(e.message)}
}
async function manageStudent(id){
  const {data:s,error}=await sb.from("profiles").select("id,student_code,full_name,active").eq("id",id).single(); if(error)return alert(error.message);
  const {data:tests,error:te}=await sb.from("tests").select("id,title,module,is_published").order("created_at",{ascending:false}); if(te)return alert(te.message);
  const {data:access,error:ae}=await sb.from("student_test_access").select("test_id,allowed").eq("student_id",id); if(ae)return alert(ae.message);
  const amap=new Map((access||[]).map(x=>[x.test_id,!!x.allowed]));
  shell(`<div class="actions"><button class="btn secondary" onclick="studentsPage()">← Students</button></div><h2>Manage Student</h2><div class="card">
    <div class="grid"><div><label>Student ID</label><input id="msCode" value="${attr(s.student_code||"")}" ${s.student_code?'disabled':''} placeholder="e.g. STU001"></div><div><label>Student Name</label><input id="msName" value="${attr(s.full_name||"")}"></div></div>
    <label>New Password (optional)</label><input id="msPass" type="password" placeholder="Leave blank to keep current password">
    <div class="actions" style="margin-top:12px"><button class="btn primary" onclick="saveStudent('${s.id}')">Save Student</button><button class="btn ${s.active?'warning':'success'}" onclick="toggleStudent('${s.id}',${!s.active})">${s.active?'Deactivate':'Activate'}</button></div>
  </div><div class="card"><h3>Assign Tests</h3><p class="muted">Only assigned + published tests can be taken by this student.</p><div class="grid3">${(tests||[]).map(t=>`<label style="display:flex;gap:8px;align-items:center;font-weight:600"><input type="checkbox" style="width:auto" id="access-${t.id}" ${amap.get(t.id)?"checked":""} onchange="setTestAccess('${id}','${t.id}',this.checked)"><span>${esc(t.title)} <small class="muted">(${esc(t.module)})</small></span></label>`).join("")||"No tests created yet."}</div></div>`);
}
async function saveStudent(id){const name=$("msName").value.trim(),code=normalizeStudentId($("msCode").value),pass=$("msPass").value;try{await edgeStudentAdmin({action:"update",id,full_name:name,student_code:code});if(pass){if(pass.length<6)throw new Error("Password must be at least 6 characters.");await edgeStudentAdmin({action:"reset_password",id,password:pass})}alert("Student updated.");manageStudent(id)}catch(e){alert(e.message)}}
async function toggleStudent(id,active){try{await edgeStudentAdmin({action:"update",id,active});studentsPage()}catch(e){alert(e.message)}}
async function setTestAccess(studentId,testId,allowed){const {error}=await sb.from("student_test_access").upsert({student_id:studentId,test_id:testId,allowed},{onConflict:"student_id,test_id"});if(error)alert(error.message)}
async function deleteStudent(id,code){if(!confirm(`Delete Student ${code}? This permanently deletes the student account, assigned tests, attempts, answers and results.`))return;try{await edgeStudentAdmin({action:"delete",id});alert("Student and associated data deleted.");studentsPage()}catch(e){alert(e.message)}}

async function testsPage(module="all"){
  setRoute("tests",{module});
  let q=sb.from("tests").select("*").order("created_at",{ascending:false}); if(module!=="all")q=q.eq("module",module);
  const {data,error}=await q;if(error)return alert(error.message);
  shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button><button class="btn primary" onclick="newTestForm('${module}')">+ Create Test</button></div>
  <h2>${module==="all"?"All Tests":module[0].toUpperCase()+module.slice(1)+" Tests"}</h2>
  <div class="card table-wrap"><table><thead><tr><th>Title</th><th>Module</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead><tbody>
  ${(data||[]).map(t=>`<tr><td><strong>${esc(t.title)}</strong><br><small>${esc(t.description||"")}</small></td><td>${esc(t.module)}${t.module==="reading"?`<br><small>${getReadingType(t)==="general"?"General Training":"Academic"}</small>`:""}</td><td>${t.duration_minutes} min</td>
  <td><span class="status ${t.is_published?"published":"draft"}">${t.is_published?"Published":"Draft"}</span></td><td><div class="actions">
  <button class="btn secondary" onclick="openBuilder('${t.id}')">Edit</button><button class="btn primary" onclick="answerKeyPage('${t.id}')">Answer Key</button><button class="btn ${t.is_published?"warning":"success"}" onclick="togglePublish('${t.id}',${!t.is_published})">${t.is_published?"Unpublish":"Publish"}</button>
  <button class="btn danger" onclick="deleteTest('${t.id}')">Delete</button></div></td></tr>`).join("")||`<tr><td colspan="5">No tests.</td></tr>`}</tbody></table></div>`);
}
async function answerKeyPage(testId){
  try{
    const d=await loadTestBundle(testId),t=d.test,mod=normalizeModule(t.module);
    if(mod==="writing"){
      shell(`<div class="actions"><button class="btn secondary" onclick="testsPage('all')">← All Tests</button><button class="btn secondary" onclick="openBuilder('${t.id}')">Open Builder</button></div>
      <h2>Answer Key — ${esc(t.title)}</h2><div class="card"><div class="notice"><strong>Writing Test:</strong> Writing Tasks do not use an objective correct-answer key. Task 1 and Task 2 are evaluated separately using the configured writing evaluation workflow.</div></div>`);
      return;
    }
    const questions=(mod==="listening"?listeningQuestions40(d):readingQuestions40(d));
    const expected=40;
    const rows=Array.from({length:expected},(_,i)=>{
      const no=i+1,q=questions.find(x=>Number(x.question_number)===no);
      if(!q) return `<tr class="missing-row"><td><strong>Q${no}</strong></td><td colspan="6"><span class="status warning">Question not configured</span> — Add Question ${no} in the Test Builder before publishing.</td></tr>`;
      const cfg=q.question_config||{};
      const accepted=Array.isArray(cfg.acceptedAnswers)?cfg.acceptedAnswers:[];
      const opts=(q.options||[]).map(o=>`${esc(o.option_key)} — ${esc(o.option_text)}`).join('<br>');
      return `<tr>
        <td><strong>Q${no}</strong><div class="inline-help">${esc(q.question_type||'')}</div></td>
        <td style="min-width:240px"><strong>${esc(q.question_text||'')}</strong>${opts?`<div class="answer-options"><strong>Options:</strong><br>${opts}</div>`:''}</td>
        <td style="min-width:170px"><input id="ak-c-${q.id}" value="${attr(String(q.correct_answer||'').split('||')[0].trim())}" placeholder="Correct answer"></td>
        <td style="min-width:220px"><textarea id="ak-a-${q.id}" rows="3" placeholder="One alternative answer per line">${esc(accepted.join('\n'))}</textarea><div class="inline-help">All alternatives are accepted automatically.</div></td>
        <td style="width:90px"><input id="ak-w-${q.id}" type="number" min="1" value="${cfg.wordLimit??''}" placeholder="—"></td>
        <td style="width:120px"><select id="ak-case-${q.id}"><option value="false" ${cfg.caseSensitive?'':'selected'}>No</option><option value="true" ${cfg.caseSensitive?'selected':''}>Yes</option></select></td>
        <td><span class="status published">Auto</span></td>
      </tr>`;
    }).join('');
    shell(`<div class="actions"><button class="btn secondary" onclick="testsPage('all')">← All Tests</button><button class="btn secondary" onclick="openBuilder('${t.id}')">Open Builder</button><button class="btn primary" onclick="saveAnswerKey('${t.id}')">💾 Save Answer Key</button></div>
      <h2>Answer Key — ${esc(t.title)}</h2>
      <p class="muted">Set the official answer once here. Student answers matching the Correct Answer or any Alternative Accepted Answer will automatically receive 1 mark. The same key is used for every student attempt.</p>
      <div class="notice"><strong>${mod==='listening'?'Listening':'Reading'}:</strong> Questions Q1–Q40 are shown. Correct = 1 mark; Wrong/Not Answered = 0. For completion questions, add accepted spelling/synonym variants as alternatives. For MCQ/Matching, enter the option key such as <b>B</b>.</div>
      <div class="card table-wrap"><table><thead><tr><th>Q</th><th>Question / Options</th><th>Correct Answer</th><th>Alternative Accepted Answers</th><th>Word Limit</th><th>Case Sensitive</th><th>Scoring</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="actions" style="margin-top:14px"><button class="btn primary" onclick="saveAnswerKey('${t.id}')">💾 Save All Answers</button></div>`);
  }catch(e){alert('Could not load answer key: '+e.message)}
}
async function saveAnswerKey(testId){
  try{
    const d=await loadTestBundle(testId),mod=normalizeModule(d.test.module);
    if(mod==='writing') return;
    const questions=(mod==='listening'?listeningQuestions40(d):readingQuestions40(d));
    if(!questions.length) throw new Error('No questions configured yet.');
    for(const q of questions){
      const rawCorrect=$("ak-c-"+q.id)?.value?.trim()||'';
      const rawAlt=$("ak-a-"+q.id)?.value||'';
      const parts=rawCorrect.split('||').map(x=>x.trim()).filter(Boolean);
      const correct=parts.shift()||'';
      const alts=[...parts,...rawAlt.split(/\n/).map(x=>x.trim()).filter(Boolean)];
      const unique=[...new Set(alts.filter(x=>norm(x)!==norm(correct)))];
      if(!correct) throw new Error(`Q${q.question_number}: Correct Answer is required.`);
      const old=q.question_config||{};
      const config={...old,acceptedAnswers:unique,wordLimit:Number($("ak-w-"+q.id)?.value||0)||null,caseSensitive:$("ak-case-"+q.id)?.value==='true'};
      const {error}=await sb.from('questions').update({correct_answer:correct,question_config:config}).eq('id',q.id);
      if(error) throw error;
    }
    alert('Answer Key saved successfully. Student scoring will automatically use these Correct + Alternative Answers.');
    await answerKeyPage(testId);
  }catch(e){alert('Could not save Answer Key: '+e.message)}
}
function newTestForm(module="all"){
  const m=["listening","reading","writing"].includes(module)?module:"listening";
  shell(`<div class="actions"><button class="btn secondary" onclick="testsPage('${module}')">← Back</button></div><h2>Create New Test</h2><div class="card">
  <div class="grid"><div><label>Title</label><input id="ntTitle" value="${m[0].toUpperCase()+m.slice(1)} Test"></div><div><label>Module</label><select id="ntModule" onchange="syncNewTestDefaults()">
  <option value="listening" ${m==="listening"?"selected":""}>Listening</option><option value="reading" ${m==="reading"?"selected":""}>Reading</option><option value="writing" ${m==="writing"?"selected":""}>Writing</option></select></div></div>
  <label>Description</label><textarea id="ntDesc"></textarea><div class="grid"><div><label>Duration</label><input id="ntDur" type="number" value="${m==="listening"?40:60}"></div><div><label>Total Questions</label><input id="ntTotal" type="number" value="${m==="writing"?2:40}"></div></div>
  ${m==="reading"?`<div style="margin-top:12px"><label>Reading Test Type</label><select id="ntReadingType"><option value="academic" selected>IELTS Academic Reading</option><option value="general">IELTS General Training Reading</option></select><div class="inline-help">This setting controls the Reading raw-score → band conversion for every student attempt of this test.</div></div>`:""}
  <div class="actions" style="margin-top:14px"><button class="btn primary" onclick="createTest()">Create & Open Builder</button></div></div>`);
}
function syncNewTestDefaults(){const m=$("ntModule").value;$("ntDur").value=m==="listening"?40:60;$("ntTotal").value=m==="writing"?2:40}
async function createTest(){
  try{
    const uid=(await sb.auth.getUser()).data.user.id,m=$("ntModule").value;
    const settings=m==="reading"?{reading_type:$("ntReadingType")?.value||"academic"}:{};
    const {data:t,error}=await sb.from("tests").insert({title:$("ntTitle").value.trim(),module:m,description:$("ntDesc").value.trim(),duration_minutes:+$("ntDur").value,total_questions:+$("ntTotal").value,is_published:false,created_by:uid,settings}).select().single();if(error)throw error;
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
  if(["listening","reading"].includes(d.test.module)){
    const expected=Array.from({length:40},(_,i)=>i+1);
    const validQs=validModuleQuestions(d);
    const nums=validQs.map(q=>Number(q.question_number));
    if(validQs.length!==40)issues.push(`${d.test.module[0].toUpperCase()+d.test.module.slice(1)} must contain exactly 40 scored questions (currently ${validQs.length}).`);
    const missing=expected.filter(n=>!nums.includes(n));
    if(missing.length)issues.push(`Missing question numbers: ${missing.join(", ")}.`);
    if(new Set(nums).size!==nums.length)issues.push("Duplicate question numbers are not allowed.");
  }
  if(d.test.module==="listening"&&!d.audio?.audio_path)issues.push("Upload Listening audio before publishing.");
  d.questions.forEach(q=>{if(d.test.module!=="writing"&&Number(q.question_number)>=1&&Number(q.question_number)<=40&&!String(q.correct_answer||"").trim())issues.push(`Question ${q.question_number}: correct answer missing.`)});
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
async function openBuilder(id,sectionIndex=0,scrollTop=0){
  setRoute("builder",{testId:id});
  admin=await loadTestBundle(id);
  const requested=Number.isFinite(Number(sectionIndex))?Number(sectionIndex):0;
  admin.sectionIndex=Math.min(Math.max(0,requested),Math.max(0,admin.sections.length-1));
  renderBuilder();
  setTimeout(()=>window.scrollTo({top:Math.max(0,Number(scrollTop)||0),behavior:"instant"}),0);
}

function parseOptionLines(raw){
  const lines=String(raw||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return lines.map((line,i)=>{
    const pipe=line.indexOf("|");
    if(pipe>0){
      const key=line.slice(0,pipe).trim();
      const text=line.slice(pipe+1).trim();
      return key&&text?{option_key:key,option_text:text,sort_order:i}:null;
    }
    return {option_key:letters[i]||String(i+1),option_text:line,sort_order:i};
  }).filter(Boolean);
}
function normalizeCorrectForOptions(raw,opts){
  const vals=String(raw||"").split("||").map(x=>x.trim()).filter(Boolean);
  if(!opts.length)return vals.join("||");
  return vals.map(v=>{
    const byKey=opts.find(o=>o.option_key.toLowerCase()===v.toLowerCase());
    if(byKey)return byKey.option_key;
    const byText=opts.find(o=>o.option_text.toLowerCase()===v.toLowerCase());
    return byText?byText.option_key:v;
  }).join("||");
}

function normalizeType(t){
  let x=String(t||"").toLowerCase().trim();
  x=x.replace(/^listening_/,'').replace(/^reading_/,'');
  // Admin may store either registry keys (matching_features) or human labels (Matching Features).
  // Normalize separators so both forms render identically on the student side.
  x=x.replace(/[\s-]+/g,'_');
  const m={
    multiple_choice:'single',multiple_choice_single:'single',multiple_choice_multiple:'multi',
    short_answer:'short',note_completion:'note',form_completion:'form',table_completion:'table',
    sentence_completion:'sentence',summary_completion:'summary',flowchart_completion:'flow',flow_chart_completion:'flow',
    diagram_label:'map',diagram_label_completion:'map',plan_map:'map',
    true_false_not_given:'tfng',yes_no_not_given:'yng',
    matching_headings:'headings',matching_information:'information',matching_features:'features',
    matching_sentence_endings:'endings',sentence_endings:'endings'
  };
  return m[x]||x;
}
function typeMap(){return admin.test.module==="reading"?R_TYPES:L_TYPES}
function renderBuilder(){
  const t=admin.test,s=admin.sections[admin.sectionIndex],qs=admin.questions.filter(q=>q.section_id===s?.id),gs=admin.groups.filter(g=>g.section_id===s?.id);
  shell(`<div class="actions"><button class="btn secondary" onclick="testsPage('${t.module}')">← Tests</button><button class="btn primary" onclick="answerKeyPage('${t.id}')">🔑 Answer Key</button><button class="btn primary" onclick="previewCurrentTest()">👁 Preview</button></div>
  <h2>Edit: ${esc(t.title)}</h2><div class="card"><h3>Test Details</h3><div class="grid"><div><label>Title</label><input id="btTitle" value="${attr(t.title)}"></div><div><label>Duration</label><input id="btDur" type="number" value="${t.duration_minutes}"></div></div>
  <label>Description</label><textarea id="btDesc">${esc(t.description||"")}</textarea>
  ${t.module==="reading"?`<div style="margin-top:12px"><label>Reading Test Type</label><select id="btReadingType"><option value="academic" ${getReadingType(t)==="academic"?"selected":""}>IELTS Academic Reading</option><option value="general" ${getReadingType(t)==="general"?"selected":""}>IELTS General Training Reading</option></select><div class="inline-help">The selected type controls the Reading raw-score → band conversion for this test.</div></div>`:""}
  <button class="btn primary" onclick="saveTestHeader()">Save Test Details</button></div>
  ${t.module==="listening"?renderAudioAdmin():""}
  <div class="section-tabs">${admin.sections.map((x,i)=>`<button class="btn ${i===admin.sectionIndex?"primary":"secondary"}" onclick="switchAdminSection(${i})">${t.module==="reading"?"Passage":"Part"} ${i+1}</button>`).join("")}</div>
  ${s?`<div class="card"><h3>${esc(s.title||"Section")}</h3><div class="grid"><div><label>Title</label><input id="bsTitle" value="${attr(s.title||"")}"></div><div><label>Existing Image URL / Path (optional)</label><input id="bsImage" value="${attr(s.image_url||s.image_path||"")}"></div></div>
  ${t.module==="reading"?`<div class="media-upload-box"><label><strong>Passage Image / Chart / Diagram</strong></label><input id="bsImageFile" type="file" accept="image/*"><div class="inline-help">Upload, replace or remove a passage-level image. This is useful for Reading charts, diagrams, figures and visual material.</div>${s.image_url?`<div class="editor-block" style="margin-top:8px"><strong>Current image:</strong><br><img class="media" style="max-width:420px;max-height:220px;object-fit:contain" src="${attr(s.image_url)}" onerror="this.style.display='none'"><label style="display:inline-flex;gap:6px;align-items:center;margin-top:6px"><input id="bsRemoveImage" type="checkbox"> Remove current image</label></div>`:""}</div>`:""}
  <label>Instructions</label>${richEditor("bsInstEditor",s.instructions||"",140)}<label>${t.module==="reading"?"Passage Text":"Content / Notes"}</label>${richEditor("bsContentEditor",s.content||"",260)}
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
async function saveTestHeader(){const current=admin.test.settings||{};const settings=admin.test.module==="reading"?{...current,reading_type:$("btReadingType")?.value||getReadingType(admin.test)}:current;const {error}=await sb.from("tests").update({title:$("btTitle").value.trim(),description:$("btDesc").value.trim(),duration_minutes:+$("btDur").value,settings,updated_at:new Date().toISOString()}).eq("id",admin.test.id);if(error)alert(error.message);else openBuilder(admin.test.id)}
async function saveSection(id){
  try{
    const s=admin.sections.find(x=>x.id===id), isReading=admin.test.module==="reading";
    const current=$("bsImage").value.trim()||null, remove=$("bsRemoveImage")?.checked===true, file=$("bsImageFile")?.files?.[0];
    let imagePath=remove?null:current;
    if(remove && current && !String(current).startsWith("http")){const rm=await sb.storage.from("question-images").remove([current]);if(rm.error)throw rm.error}
    if(file){
      if(current && !String(current).startsWith("http")){await sb.storage.from("question-images").remove([current])}
      const ext=(file.name.split(".").pop()||"png").toLowerCase().replace(/[^a-z0-9]/g,"")||"png";
      imagePath=`${admin.test.id}/${id}/passage-${Date.now()}.${ext}`;
      const up=await sb.storage.from("question-images").upload(imagePath,file,{upsert:true,contentType:file.type||`image/${ext}`});
      if(up.error)throw up.error;
    }
    const payload={title:$("bsTitle").value.trim(),instructions:richValue("bsInstEditor"),content:richValue("bsContentEditor"),image_url:isReading?(imagePath||null):(current||null)};
    const {error}=await sb.from("sections").update(payload).eq("id",id);if(error)throw error;
    const currentSection=admin.sectionIndex;
    const currentScroll=window.scrollY||document.documentElement.scrollTop||0;
    openBuilder(admin.test.id,currentSection,currentScroll)
  }catch(e){alert(e.message)}
}

function groupForm(id=null){
  const s=admin.sections[admin.sectionIndex],g=id?admin.groups.find(x=>x.id===id):null;
  const current=g?.image_path||g?.image_url||"";
  shell(`<div class="actions"><button class="btn secondary" onclick="renderBuilder()">← Builder</button></div><h2>${g?"Edit":"Add"} Question Group</h2><div class="card">
  <div class="grid3"><div><label>Start Question</label><input id="gStart" type="number" value="${g?.start_question||1}"></div><div><label>End Question</label><input id="gEnd" type="number" value="${g?.end_question||1}"></div>
  <div><label>Question Type</label><select id="gType">${Object.entries(typeMap()).map(([k,v])=>`<option value="${k}" ${normalizeType(g?.question_type)===k?"selected":""}>${esc(v)}</option>`).join("")}</select></div></div>
  <label>Group Title / Heading</label><input id="gTitle" value="${attr(g?.group_title||"")}">
  <label>Instructions</label>${richEditor("gInstEditor",g?.instructions||"",140)}<label>Group Content / Heading / Notes</label>${richEditor("gContentEditor",g?.content||"",260)}
  <p class="inline-help">For completion types use tokens such as: Cheapest properties: £ [BLANK 1] per week</p>
  <div class="media-upload-box">
    <label><strong>Group Image / Map / Plan / Diagram</strong></label>
    <input id="gImageFile" type="file" accept="image/*">
    <div class="inline-help">Choose an image file. It will be uploaded to Supabase <b>question-images</b> and shown to students above the group questions.</div>
    ${current ? `<div class="editor-block" style="margin-top:8px"><strong>Current image:</strong> ${esc(current)}<br><img class="media" style="max-width:420px;max-height:220px;object-fit:contain" src="${attr(current)}" onerror="this.style.display='none'"><label style="display:inline-flex;gap:6px;align-items:center;margin-top:6px"><input id="gRemoveImage" type="checkbox"> Remove current image</label></div>` : ""}
    <input id="gImage" type="hidden" value="${attr(current)}">
  </div>
  <label>Shared Option Bank <span class="muted">(one option per line — simply type the option text, or use A|Option text)</span></label><textarea id="gOptions">${esc((g?.options||[]).map(o=>`${o.option_key}|${o.option_text}`).join("\n"))}</textarea>
  <div class="inline-help"><strong>Matching Features / Matching Information / Matching Headings / Matching Sentence Endings:</strong> the same option may be used more than once automatically. No extra setting is required.</div>
  <div class="actions" style="margin-top:12px"><button class="btn primary" onclick="saveGroup('${id||""}','${s.id}')">Save Group</button>${g?`<button class="btn secondary" onclick="duplicateGroup('${g.id}')">Duplicate Group</button>`:""}</div></div>`);
}
async function saveGroup(id,sid){
  try{
    const payload={section_id:sid,start_question:+$("gStart").value,end_question:+$("gEnd").value,question_type:$("gType").value,instructions:richValue("gInstEditor"),content:richValue("gContentEditor"),image_url:null,group_order:+$("gStart").value,group_title:$("gTitle").value.trim()||null};
    let gid=id;
    if(id){const {error}=await sb.from("question_groups").update(payload).eq("id",id);if(error)throw error}
    else{const {data,error}=await sb.from("question_groups").insert(payload).select().single();if(error)throw error;gid=data.id}

    const file=$("gImageFile")?.files?.[0];
    const remove=$("gRemoveImage")?.checked===true;
    let imagePath=$("gImage")?.value?.trim()||null;
    if(remove && imagePath && !String(imagePath).startsWith("http")){const rm=await sb.storage.from("question-images").remove([imagePath]);if(rm.error)throw rm.error;imagePath=null}
     else if(remove){imagePath=null}
    if(file){
      if(imagePath) await sb.storage.from("question-images").remove([imagePath]);
      const ext=(file.name.split(".").pop()||"png").toLowerCase().replace(/[^a-z0-9]/g,"")||"png";
      imagePath=`${admin.test.id}/${sid}/groups/${gid}-${Date.now()}.${ext}`;
      const up=await sb.storage.from("question-images").upload(imagePath,file,{upsert:true,contentType:file.type||`image/${ext}`});
      if(up.error)throw up.error;
    }
    if(imagePath!==($("gImage")?.value?.trim()||null) || remove || file){
      const {error}=await sb.from("question_groups").update({image_path:imagePath,image_url:null}).eq("id",gid);
      if(error)throw error;
    }

    await sb.from("question_group_options").delete().eq("group_id",gid);
    const rows=parseOptionLines($("gOptions").value).map(o=>({group_id:gid,option_key:o.option_key,option_text:o.option_text,sort_order:o.sort_order}));
    if(rows.length){const {error}=await sb.from("question_group_options").insert(rows);if(error)throw error}
    const currentSection=admin.sectionIndex;
    const currentScroll=window.scrollY||document.documentElement.scrollTop||0;
    openBuilder(admin.test.id,currentSection,currentScroll);
  }catch(e){alert(e.message)}
}
async function deleteGroup(id){if(!confirm("Delete this group?"))return;const {error}=await sb.from("question_groups").delete().eq("id",id);if(error)alert(error.message);else openBuilder(admin.test.id)}

function questionForm(id=null){
  const s=admin.sections[admin.sectionIndex],q=id?admin.questions.find(x=>x.id===id):null;
  shell(`<div class="actions"><button class="btn secondary" onclick="renderBuilder()">← Builder</button></div><h2>${q?"Edit":"Add"} Question</h2><div class="card">
  <div class="grid3"><div><label>Question No.</label><input id="qNo" type="number" value="${q?.question_number||1}"></div><div><label>Question Type</label><select id="qType">${Object.entries(typeMap()).map(([k,v])=>`<option value="${k}" ${normalizeType(q?.question_type)===k?"selected":""}>${esc(v)}</option>`).join("")}</select></div><div><label>Marks</label><input id="qMarks" type="number" value="${q?.marks||1}"></div></div>
  <label>Question Text</label>${richEditor("qTextEditor",q?.question_text||"",140)}<label>Correct Answer</label><input id="qCorrect" value="${attr(q?.correct_answer||"")}"><p class="inline-help">For multiple accepted answers, separate with ||, e.g. centre||center</p>
  <label>Alternative Accepted Answers (optional)</label><input id="qAccepted" value="${attr((q?.config?.acceptedAnswers||[]).join("||"))}"><div class="grid"><div><label>Word Limit</label><input id="qLimit" type="number" value="${q?.config?.wordLimit||""}"></div><div><label>Case Sensitive</label><select id="qCase"><option value="false" ${q?.config?.caseSensitive?"":"selected"}>No</option><option value="true" ${q?.config?.caseSensitive?"selected":""}>Yes</option></select></div></div>
  <label>Options <span class="muted">(one option per line — simply type TRUE, FALSE, NOT GIVEN, etc.; A|Option text is also supported)</span></label><textarea id="qOptions">${esc((q?.options||[]).map(o=>`${o.option_key}|${o.option_text}`).join("\n"))}</textarea>
  <div class="media-upload-box">
    <label><strong>Question Image</strong></label>
    <input id="qImageFile" type="file" accept="image/*">
    <div class="inline-help">Optional. Upload a question-specific image, chart, diagram or picture. It will be stored in Supabase <b>question-images</b>.</div>
    ${q?.image_url?`<div class="editor-block" style="margin-top:8px"><strong>Current image:</strong> ${esc(q.image_url)}<br><img class="media" style="max-width:420px;max-height:220px;object-fit:contain" src="${attr(q.image_url)}" onerror="this.style.display='none'"><label style="display:inline-flex;gap:6px;align-items:center;margin-top:6px"><input id="qRemoveImage" type="checkbox"> Remove current image</label></div>`:""}
    <input id="qImage" type="hidden" value="${attr(q?.image_url||"")}">
  </div>
  <div class="actions" style="margin-top:12px"><button class="btn primary" onclick="saveQuestion('${id||""}','${s.id}')">Save Question</button>${q?`<button class="btn secondary" onclick="duplicateQuestion('${q.id}')">Duplicate Question</button>`:""}</div></div>`);
}
async function saveQuestion(id,sid){
  try{
    const accepted=$("qAccepted").value.split("||").map(x=>x.trim()).filter(Boolean);
    const parsedOptions=parseOptionLines($("qOptions").value);
    const normalizedCorrect=normalizeCorrectForOptions($("qCorrect").value.trim(),parsedOptions);
    const normalizedAccepted=accepted.map(a=>normalizeCorrectForOptions(a,parsedOptions)).join("||").split("||").map(x=>x.trim()).filter(Boolean);
    const config={...(id?((admin.questions.find(x=>x.id===id)||{}).question_config||{}):{}),acceptedAnswers:normalizedAccepted,wordLimit:+$("qLimit").value||null,caseSensitive:$("qCase").value==="true"};
    const existingImage=$("qImage").value.trim()||null;
    const remove=$("qRemoveImage")?.checked===true;
    const payload={section_id:sid,question_number:+$("qNo").value,question_type:$("qType").value,question_text:richValue("qTextEditor"),marks:+$("qMarks").value||1,correct_answer:normalizedCorrect,image_url:remove?null:existingImage,question_config:config};
    let qid=id;if(id){const {error}=await sb.from("questions").update(payload).eq("id",id);if(error)throw error}else{const {data,error}=await sb.from("questions").insert(payload).select().single();if(error)throw error;qid=data.id}
    const file=$("qImageFile")?.files?.[0];
    let imagePath=remove?null:existingImage;
    if(remove && existingImage && !String(existingImage).startsWith("http")) await sb.storage.from("question-images").remove([existingImage]);
    if(file){
      if(existingImage && !String(existingImage).startsWith("http")) await sb.storage.from("question-images").remove([existingImage]);
      const ext=(file.name.split(".").pop()||"png").toLowerCase().replace(/[^a-z0-9]/g,"")||"png";
      imagePath=`${admin.test.id}/${sid}/questions/${qid}-${Date.now()}.${ext}`;
      const up=await sb.storage.from("question-images").upload(imagePath,file,{upsert:true,contentType:file.type||`image/${ext}`});
      if(up.error)throw up.error;
      const {error}=await sb.from("questions").update({image_url:imagePath}).eq("id",qid);if(error)throw error;
    }
    await sb.from("options").delete().eq("question_id",qid);
    const rows=parseOptionLines($("qOptions").value).map(o=>({question_id:qid,option_key:o.option_key,option_text:o.option_text,sort_order:o.sort_order,is_correct:false}));
    if(rows.length){const {error}=await sb.from("options").insert(rows);if(error)throw error}
    const currentSection=admin.sectionIndex;
    const currentScroll=window.scrollY||document.documentElement.scrollTop||0;
    openBuilder(admin.test.id,currentSection,currentScroll);
  }catch(e){alert(e.message)}
}
function writingTaskForm(part=null){
  const tasks=admin.writingTasks||[],w=part?tasks.find(x=>x.part===part):null,n=part||([1,2].find(x=>!tasks.some(t=>t.part===x))||1),current=w?.media_url||"";
  shell(`<div class="actions"><button class="btn secondary" onclick="renderBuilder()">← Builder</button></div><h2>${w?"Edit":"Add"} Writing Task ${n}</h2><div class="card">
  <label>Task Number</label><select id="wNo"><option value="1" ${n==1?"selected":""}>Task 1</option><option value="2" ${n==2?"selected":""}>Task 2</option></select>
  <label>Instructions</label>${richEditor("wInstEditor",w?.instructions||"",140)}<label>Prompt</label>${richEditor("wPromptEditor",w?.prompt||"",220)}
  <div class="grid"><div><label>Minimum Words</label><input id="wMin" type="number" value="${w?.minimum??(n==1?150:250)}"></div><div><label>Maximum Words (optional)</label><input id="wMax" type="number" value="${w?.maximum??""}"></div></div>
  <div class="media-upload-box"><label><strong>Task Image / Chart / Graph / Table / Diagram</strong></label><input id="wMediaFile" type="file" accept="image/*"><div class="inline-help">Upload, replace or remove the visual for Task ${n}. This is available for both Writing Task 1 and Task 2.</div>
  ${current?`<div class="editor-block" style="margin-top:8px"><strong>Current image:</strong><br><img class="media" style="max-width:420px;max-height:240px;object-fit:contain" src="${attr(current)}" onerror="this.style.display='none'"><label style="display:inline-flex;gap:6px;align-items:center;margin-top:6px"><input id="wRemoveImage" type="checkbox"> Remove current image</label></div>`:""}
  <input id="wMedia" type="hidden" value="${attr(current)}"></div>
  <div class="actions"><button class="btn primary" onclick="saveWritingTask('${w?.id||""}')">Save Task</button></div></div>`);
}
async function saveWritingTask(id){
  try{
    const part=+$('wNo').value, current=$('wMedia').value.trim()||null, remove=$('wRemoveImage')?.checked===true, file=$('wMediaFile')?.files?.[0];
    const payload={test_id:admin.test.id,part,task_type:part===1?'task1':'task2',instructions:$('wInst').value,prompt:$('wPrompt').value,minimum:+$('wMin').value||null,maximum:+$('wMax').value||null,suggested:part===1?20:40,media_url:remove?null:current,evaluation_status:'pending',updated_at:new Date().toISOString()};
    let rowId=id;
    if(id){const {error}=await sb.from('writing_tasks').update(payload).eq('id',id);if(error)throw error}
    else{const {data,error}=await sb.from('writing_tasks').insert(payload).select().single();if(error)throw error;rowId=data.id}
    let mediaPath=remove?null:current;
    if(remove && current && !String(current).startsWith('http')){const rm=await sb.storage.from('question-images').remove([current]);if(rm.error)throw rm.error}
    if(file){
      if(current && !String(current).startsWith('http')) await sb.storage.from('question-images').remove([current]);
      const ext=(file.name.split('.').pop()||'png').toLowerCase().replace(/[^a-z0-9]/g,'')||'png';
      mediaPath=`${admin.test.id}/writing/task-${part}-${rowId}-${Date.now()}.${ext}`;
      const up=await sb.storage.from('question-images').upload(mediaPath,file,{upsert:true,contentType:file.type||`image/${ext}`});
      if(up.error)throw up.error;
      const {error}=await sb.from('writing_tasks').update({media_url:mediaPath,updated_at:new Date().toISOString()}).eq('id',rowId);if(error)throw error;
    }
    openBuilder(admin.test.id)
  }catch(e){alert(e.message)}
}
async function deleteWritingTask(id){if(!confirm('Delete this writing task?'))return;const {error}=await sb.from('writing_tasks').delete().eq('id',id);if(error)alert(error.message);else openBuilder(admin.test.id)}
async function duplicateQuestion(id){
  try{
    const q=admin.questions.find(x=>x.id===id);
    if(!q) return alert("Question not found.");
    const sid=q.section_id;
    const sectionQuestions=(admin.questions||[]).filter(x=>x.section_id===sid);
    const used=new Set(sectionQuestions.map(x=>+x.question_number));
    let newNo=+q.question_number+1;
    while(used.has(newNo)) newNo++;
    const payload={
      section_id:sid,
      question_number:newNo,
      question_type:q.question_type,
      question_text:q.question_text||"",
      marks:q.marks||1,
      correct_answer:"",
      explanation:q.explanation||null,
      image_url:q.image_url||null,
      question_config:JSON.parse(JSON.stringify(q.question_config||{}))
    };
    if(payload.question_config) delete payload.question_config.duplicatedFrom;
    const {data:newQ,error}=await sb.from("questions").insert(payload).select().single();
    if(error) throw error;
    const opts=(q.options||[]).map((o,i)=>({
      question_id:newQ.id,
      option_key:o.option_key,
      option_text:o.option_text,
      is_correct:false,
      sort_order:o.sort_order??i,
      metadata:o.metadata||null
    }));
    if(opts.length){const {error:oe}=await sb.from("options").insert(opts);if(oe)throw oe}
    alert(`Question ${newNo} duplicated. Question type, options, image and formatting were copied. Correct answer was cleared.`);
    openBuilder(admin.test.id);
  }catch(e){alert(e.message)}
}

async function duplicateGroup(id){
  try{
    const g=admin.groups.find(x=>x.id===id);
    if(!g) return alert("Question group not found.");
    const sid=g.section_id;
    const groups=(admin.groups||[]).filter(x=>x.section_id===sid).sort((a,b)=>(a.group_order||0)-(b.group_order||0));
    const used=new Set();
    for(const x of groups){for(let n=+x.start_question;n<=+x.end_question;n++)used.add(n)}
    const oldStart=+g.start_question||1, oldEnd=+g.end_question||oldStart;
    const span=Math.max(1,oldEnd-oldStart+1);
    let start=oldEnd+1;
    while(used.has(start) || used.has(start+span-1)) start++;
    const end=start+span-1;
    const delta=start-oldStart;
    const shiftBlanks=(text)=>String(text||"").replace(/\[BLANK\s+(\d+)\]/gi,(m,n)=>{
      const num=+n; return num>=oldStart&&num<=oldEnd?`[BLANK ${num+delta}]`:m;
    });
    const payload={
      section_id:sid,
      start_question:start,
      end_question:end,
      question_type:g.question_type,
      instructions:g.instructions||"",
      content:shiftBlanks(g.content||""),
      image_url:g.image_url||null,
      group_order:start,
      group_title:g.group_title||null,
      image_path:g.image_path||null,
      audio_start:g.audio_start??null,
      audio_end:g.audio_end??null,
      configuration:JSON.parse(JSON.stringify(g.configuration||{}))
    };
    const {data:newG,error}=await sb.from("question_groups").insert(payload).select().single();
    if(error) throw error;

    const opts=(g.options||[]).map((o,i)=>({group_id:newG.id,option_key:o.option_key,option_text:o.option_text,sort_order:o.sort_order??i}));
    if(opts.length){const {error:oe}=await sb.from("question_group_options").insert(opts);if(oe)throw oe}

    const sourceQuestions=(admin.questions||[]).filter(q=>q.section_id===sid && +q.question_number>=oldStart && +q.question_number<=oldEnd).sort((a,b)=>+a.question_number-+b.question_number);
    for(const q of sourceQuestions){
      const newNumber=+q.question_number+delta;
      const config=JSON.parse(JSON.stringify(q.question_config||{}));
      const newPayload={
        section_id:sid,
        question_number:newNumber,
        question_type:q.question_type,
        question_text:shiftBlanks(q.question_text||""),
        marks:q.marks||1,
        correct_answer:"",
        explanation:q.explanation||null,
        image_url:q.image_url||null,
        question_config:config
      };
      const {data:newQ,error:qe}=await sb.from("questions").insert(newPayload).select().single();
      if(qe)throw qe;
      const qOpts=(q.options||[]).map((o,i)=>({question_id:newQ.id,option_key:o.option_key,option_text:o.option_text,is_correct:false,sort_order:o.sort_order??i,metadata:o.metadata||null}));
      if(qOpts.length){const {error:oe}=await sb.from("options").insert(qOpts);if(oe)throw oe}
    }
    alert(`Group duplicated as Questions ${start}-${end}. Questions, options, instructions, formatting and images were copied. Correct answers were cleared.`);
    openBuilder(admin.test.id);
  }catch(e){alert(e.message)}
}

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
  const user=(await sb.auth.getUser()).data.user;
  const {data:access,error:accessErr}=await sb.from("student_test_access").select("test_id,allowed").eq("student_id",user.id).eq("allowed",true);
  if(accessErr)return alert(accessErr.message);
  const allowedIds=(access||[]).map(x=>x.test_id);
  let tests=[];
  if(allowedIds.length){const tq=await sb.from("tests").select("id,title,module,description,duration_minutes,total_questions,settings").eq("is_published",true).in("id",allowedIds).order("module");if(tq.error)return alert(tq.error.message);tests=tq.data||[]}
  const ids=(tests||[]).map(t=>t.id);
  let attempts=[];
  if(ids.length){const a=await sb.from("results").select("id,test_id,status,started_at,submitted_at,listening_score,reading_score,writing_score").eq("student_id",user.id).in("test_id",ids).order("created_at",{ascending:false});if(a.error)return alert(a.error.message);attempts=a.data||[]}
  const latest=new Map();attempts.forEach(a=>{if(!latest.has(a.test_id))latest.set(a.test_id,a)});
  shell(`<h2>Student Dashboard</h2><p class="muted">Published tests are shown below. After submission, the result and the submitted test can be reviewed again in read-only mode.</p><div class="dashboard-grid">${(tests||[]).map(t=>{
    const a=latest.get(t.id);
    const icon=t.module==="listening"?"🎧":t.module==="reading"?"📖":"✍️";
    let action=a?.status==="submitted"?`<div class="actions"><button class="btn primary" onclick="studentResultPage('${a.id}')">View Result</button><button class="btn secondary" onclick="startStudentTest('${t.id}',true)">View Submitted Test</button></div>`:a?.status==="in_progress"?`<button class="btn warning" onclick="startStudentTest('${t.id}',true)">Resume Test</button>`:`<button class="btn primary" onclick="startStudentTest('${t.id}',true)">Start Test</button>`;
    const status=a?.status==="submitted"?`<span class="status published">Completed</span>`:a?.status==="in_progress"?`<span class="status draft">In Progress</span>`:`<span class="status draft">Not Started</span>`;
    const score=a?.status==="submitted"?(t.module==="listening"?a.listening_score:t.module==="reading"?a.reading_score:"Pending"):"";
    const band=a?.status==="submitted"&&t.module!=="writing"?bandText(t.module,t.module==="listening"?a.listening_score:a.reading_score,(t.settings||{}).reading_type||"academic"):"";
    return `<div class="dashbtn"><div style="font-size:32px">${icon}</div><strong>${esc(t.title)}</strong><span class="muted">${t.module.toUpperCase()} • ${t.duration_minutes} min</span><div style="margin-top:10px">${status}</div>${score!==""?`<div style="margin:8px 0"><strong>Score: ${esc(score)}</strong>${band?` • <strong>Band: ${esc(band)}</strong>`:""}</div>`:""}<div class="actions" style="margin-top:10px">${action}</div></div>`;
  }).join("")||`<div class="card">No published tests are available.</div>`}</div>`);
}
async function createAttempt(test){
  const user=(await sb.auth.getUser()).data.user;
  const {data,error}=await sb.from("results").insert({student_id:user.id,test_id:test.id,status:"in_progress",started_at:new Date().toISOString()}).select().single();
  if(error)throw error;return data;
}
async function ensureWritingQuestions(d){
  if(d.test.module!=="writing")return d;
  const existing=d.questions||[];
  for(const wt of (d.writingTasks||[])){
    let q=existing.find(x=>x.question_config?.writingTaskId===wt.id);
    if(!q){
      const sec=d.sections[0];
      const payload={section_id:sec.id,question_number:wt.part,question_type:"writing",question_text:wt.prompt||"",marks:0,correct_answer:null,image_url:wt.media_url||null,question_config:{writingTaskId:wt.id}};
      const {data,error}=await sb.from("questions").insert(payload).select().single();if(error)throw error; q={...data,config:data.question_config||{},options:[]}; existing.push(q);
    }
  }
  d.questions=existing;return d;
}
async function startStudentTest(id,resume=true,preview=false){
  try{
    let d=await loadTestBundle(id);if(!d.test.is_published&&!preview)throw new Error("This test is not published.");
    let saved=null,attempt=null,user=null,review=false;
    if(!preview){
      user=(await sb.auth.getUser()).data.user;
      if(!user)throw new Error("Please login again.");
      const existing=await sb.from("results").select("*").eq("student_id",user.id).eq("test_id",id).order("created_at",{ascending:false}).limit(1).maybeSingle();
      if(existing.error)throw existing.error;
      attempt=existing.data||null;
      if(attempt?.status==="submitted"){
        // A submitted attempt remains available for review after logout/login.
        // It is read-only: the original answers are loaded from this student's result_id.
        review=true;
        saved=loadExam(id,user.id,attempt.id);
      }else{
        if(!attempt)attempt=await createAttempt(d.test);
        // Exam state is isolated by student + test + attempt. Never reuse another student's cache.
        saved=resume?loadExam(id,user.id,attempt.id):null;
      }
      // Remove any legacy shared exam cache left by V11.4 or earlier.
      localStorage.removeItem(legacyExamKey(id));
    }
    d=await ensureWritingQuestions(d);
    let audioUrl=null;if(d.audio?.audio_path)audioUrl=await signed("listening-audio",d.audio.audio_path);
    if(d.sections?.length){for(const sec of d.sections){const raw=sec.image_path||sec.image_url;if(raw&&!String(raw).startsWith("http")){try{sec.image_url=await signed("question-images",raw)}catch(e){console.warn("Section image could not be signed",e)}}}}
    if(d.groups?.length){for(const g of d.groups){if(g.image_path){try{g.image_url=await signed("question-images",g.image_path)}catch(e){console.warn("Group image could not be signed",e)}}}}
    if(d.questions?.length){for(const q of d.questions){if(q.image_url&&!String(q.image_url).startsWith("http")){try{q.image_url=await signed("question-images",q.image_url)}catch(e){console.warn("Question image could not be signed",e)}}}}
    if(d.writingTasks?.length){for(const wt of d.writingTasks){if(wt.media_url&&!String(wt.media_url).startsWith("http")){try{wt.media_url=await signed("question-images",wt.media_url)}catch(e){console.warn("Writing task image could not be signed",e)}}}}
    let dbAnswers={};if(!preview&&attempt?.id)dbAnswers=await loadAttemptAnswers(attempt.id);
    const mergedAnswers={...(saved?.answers||{}),...dbAnswers};
    const endAt=preview?null:(attempt?.started_at?new Date(attempt.started_at).getTime()+d.test.duration_minutes*60000:(saved?.endAt||Date.now()+d.test.duration_minutes*60000));
    exam={preview,testId:id,studentId:preview?null:(user?.id||saved?.studentId),resultId:preview?null:(attempt?.id||saved?.resultId),data:d,currentSection:preview?0:(saved?.currentSection||0),currentTask:saved?.currentTask||0,answers:mergedAnswers,startedAt:attempt?.started_at||saved?.startedAt||new Date().toISOString(),endAt:review?null:endAt, audioUrl,locked:review||!!saved?.locked,review};
    if(!preview){setRoute("exam",{testId:id});saveExam();}
    if(review) stopStudentListeningAudio();
    renderExam();
    if(!preview&&!review&&endAt<=Date.now())return submitExam(true);
    if(!review) startTimer();
    if(mListening(exam)&&!review)initStudentListeningAudio(!preview);
  }catch(e){alert(e.message)}
}
function previewCurrentTest(){startStudentTest(admin.test.id,false,true)}
function headerExam(){return `<div class="topbar"><div><div class="brand">${esc(exam.data.test.title)}</div><div class="subbrand">${exam.preview?"Student Preview":exam.review?"Submitted Test — Read Only":exam.data.test.module.toUpperCase()+" Test"}</div></div><div class="userbox"><span id="timer" class="timer">${exam.preview?"PREVIEW":exam.review?"SUBMITTED":fmtTime(Math.max(0,exam.endAt-Date.now()))}</span><button class="btn secondary" onclick="exitExam()">${exam.preview?"Close Preview":"Exit"}</button></div></div>`}
function fmtTime(ms){const x=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(x/3600),m=Math.floor(x%3600/60),s=x%60;return `${h?String(h).padStart(2,"0")+":":""}${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
function startTimer(){if(timerHandle)clearInterval(timerHandle);if(exam?.preview||exam?.locked)return;timerHandle=setInterval(()=>{if(!exam)return clearInterval(timerHandle);const ms=exam.endAt-Date.now(),el=$("timer");if(el)el.textContent=fmtTime(ms);if(ms<=0){clearInterval(timerHandle);stopStudentListeningAudio();submitExam(true)}},1000)}
function mListening(x){return !!x&&x.data?.test?.module==="listening"}
function stopStudentListeningAudio(){
  examAudioStopping=true;
  if(examAudio){try{examAudio.pause();examAudio.currentTime=0}catch(e){}}
  examAudio=null;examAudioTestId=null;examAudioEnded=false;
}
function initStudentListeningAudio(autoplay){
  if(!mListening(exam)||!exam.audioUrl)return;
  examAudioStopping=false;
  const isNew=examAudioTestId!==exam.testId||!examAudio;
  if(isNew){
    if(examAudio){try{examAudio.pause()}catch(e){}}
    examAudio=new Audio(exam.audioUrl);
    examAudio.preload="auto";
    examAudioTestId=exam.testId;
    examAudioEnded=false;
    examAudio.addEventListener("ended",()=>{examAudioEnded=true;renderExam();});
    examAudio.addEventListener("pause",()=>{
      if(examAudioStopping||!exam||exam.locked||exam.preview||examAudioEnded)return;
      setTimeout(()=>{if(exam&&!exam.locked&&!exam.preview&&!examAudioEnded&&examAudio?.paused)examAudio.play().catch(()=>{});},50);
    });
  }
  if(autoplay&&!examAudioEnded&&examAudio.paused)examAudio.play().catch(()=>{});
}
function setAns(k,v){if(!exam||exam.locked)return;exam.answers[k]=v;saveExam();queueAnswerSave(k,v)}
function toggleAns(k,v,on){if(!exam||exam.locked)return;let a=Array.isArray(exam.answers[k])?[...exam.answers[k]]:[];if(on&&!a.includes(v))a.push(v);if(!on)a=a.filter(x=>x!==v);exam.answers[k]=a;saveExam();queueAnswerSave(k,a)}
function switchExamSection(i){if(exam?.locked&&!exam?.review)return;exam.currentSection=Math.max(0,Math.min(i,exam.data.sections.length-1));saveExam();renderExam();window.scrollTo({top:0,behavior:"instant"});if(!exam?.review){startTimer();if(mListening(exam))initStudentListeningAudio(!exam.preview)}}
function switchTask(i){if(exam?.locked&&!exam?.review)return;exam.currentTask=Math.max(0,Math.min(i,1));saveExam();renderExam();window.scrollTo({top:0,behavior:"instant"});if(!exam?.review)startTimer()}
function tabs(label){return `<div class="section-tabs">${exam.data.sections.map((s,i)=>`<button class="btn ${i===exam.currentSection?"primary":"secondary"}" onclick="switchExamSection(${i})">${label} ${i+1}</button>`).join("")}</div>`}
function qnav(qs){return `<div class="qnav">${qs.map(q=>`<button class="${hasAns(q.id)?"done":""}" onclick="document.getElementById('q-${q.id}')?.scrollIntoView({behavior:'smooth'})">${q.question_number}</button>`).join("")}</div>`}
function hasAns(id){const v=exam.answers[id];return Array.isArray(v)?v.length>0:String(v??"").trim()!==""}
function renderExam(){
  const m=exam.data.test.module;if(m==="writing")return renderWritingExam();
  const s=exam.data.sections[exam.currentSection];
  const [rangeLo,rangeHi]=sectionQuestionRange(m,s.section_number,exam.data);
  const qs=exam.data.questions.filter(q=>q.section_id===s.id&&Number(q.question_number)>=rangeLo&&Number(q.question_number)<=rangeHi).sort((a,b)=>a.question_number-b.question_number);
  const gs=exam.data.groups.filter(g=>g.section_id===s.id).sort((a,b)=>(Number(a.group_order)||Number(a.start_question)||0)-(Number(b.group_order)||Number(b.start_question)||0));
  if(m==="reading"){
    app().innerHTML=headerExam()+`<div class="shell">${tabs("Passage")}<div class="exam-split"><div class="pane"><h2>${esc(s.title)}</h2>${s.instructions?`<div class="instructions student-rich" data-highlight-key="${attr(highlightKey("reading-instructions",s.id))}">${richTextSanitize(s.instructions)}</div>`:""}${s.image_url?`<img class="media" src="${attr(s.image_url)}">`:""}<div class="student-rich" data-highlight-key="${attr(highlightKey("reading-content",s.id))}">${richTextSanitize(s.content||"")}</div></div>
    <div class="pane"><h3>Questions</h3>${gs.length?"":qnav(qs)}${renderGroupsOrQuestions(gs,qs)}</div></div>${examNav()}</div>`;
    setTimeout(restoreAndBindHighlights,0);
  }else{
    const audioStatus=exam.audioUrl?(exam.review?"Submitted review — audio is not replayed.":examAudioEnded?"Audio finished — it cannot be replayed.":"Audio plays continuously for the whole Listening test. Pause, stop, seek and replay are disabled."):"Audio not configured.";
    app().innerHTML=headerExam()+`<div class="shell">${tabs("Part")}${exam.audioUrl?`<div class="audio-box"><strong>Listening Audio</strong><div class="muted" style="margin-top:6px">${audioStatus}</div></div>`:""}
    <div class="card"><h2>${esc(s.title)}</h2>${s.instructions?`<div class="instructions student-rich" data-highlight-key="${attr(highlightKey("listening-instructions",s.id))}">${richTextSanitize(s.instructions)}</div>`:""}${s.image_url?`<img class="media" src="${attr(s.image_url)}">`:""}${s.content?`<div class="student-rich" data-highlight-key="${attr(highlightKey("listening-content",s.id))}">${renderInlineRich(s.content,qs)}</div>`:""}${gs.length?"":qnav(qs)}${renderGroupsOrQuestions(gs,qs)}</div>${examNav()}</div>`;
    setTimeout(restoreAndBindHighlights,0);
  }
}
function renderGroupsOrQuestions(gs,qs){return gs.length?gs.map(g=>renderGroup(g,qs)).join(""):qs.map(q=>renderQuestion(q)).join("")}
function renderInlineRich(txt,qs){
  const tokenMap=[];
  let html=String(txt||"").replace(/\[BLANK\s*(\d+)\]/gi,(_,n)=>{
    const q=qs.find(x=>+x.question_number===+n),k=q?.id||`blank_${n}`;
    const token=`__UEBLANK_${tokenMap.length}__`;
    const opts=(q?.options||[]);
    if(opts.length){
      const current=exam.answers[k]??"";
      tokenMap.push(`<select style="display:inline-block;min-width:180px;margin:0 4px" onchange="setAns('${k}',this.value)" ${exam.locked?"disabled":""}><option value="">Select answer</option>${opts.map(o=>`<option value="${attr(o.option_key)}" ${String(current)===String(o.option_key)?"selected":""}>${esc(o.option_key)}. ${esc(o.option_text)}</option>`).join("")}</select>`);
    }else{
      tokenMap.push(`<input style="display:inline-block;width:130px;margin:0 4px" value="${attr(exam.answers[k]||"")}" oninput="setAns('${k}',this.value)" ${exam.locked?"disabled":""}>`);
    }
    return token;
  });
  html=richTextSanitize(html);
  tokenMap.forEach((v,i)=>{html=html.replace(`__UEBLANK_${i}__`,v)});
  return html;
}
function renderGroup(g,qs){
  const sub=qs.filter(q=>q.question_number>=g.start_question&&q.question_number<=g.end_question),t=normalizeType(g.question_type),inline=COMPLETION_TYPES.includes(t)&&/\[BLANK\s*\d+\]/i.test(g.content||"");
  const wordList=inline ? (()=>{
    const seen=new Set(),out=[];
    for(const q of sub){for(const o of (q.options||[])){const key=String(o.option_key||"");if(!seen.has(key)){seen.add(key);out.push(o)}}}
    return out;
  })() : [];
  const hasQuestionWordList=wordList.length>0;
  return `<div class="group"><strong>Questions ${g.start_question}–${g.end_question}</strong>${g.instructions?`<div class="instructions student-rich" data-highlight-key="${attr(highlightKey("group-instructions",g.id))}">${richTextSanitize(g.instructions)}</div>`:""}${g.image_url?`<img class="media" src="${attr(g.image_url)}">`:""}${hasQuestionWordList?`<div class="notice"><strong>Word List:</strong>${wordList.map(o=>`<div><strong>${esc(o.option_key)}.</strong> ${esc(o.option_text)}</div>`).join("")}</div>`:""}${g.content?`<div class="student-rich" data-highlight-key="${attr(highlightKey("group-content",g.id))}">${renderInlineRich(g.content,sub)}</div>`:""}
  ${(g.options||[]).length?`<div class="notice">${g.options.map(o=>`<div><strong>${esc(o.option_key)}.</strong> ${esc(o.option_text)}</div>`).join("")}</div>`:""}${inline?"":sub.map(q=>renderQuestion(q,g.options||[],g.question_type)).join("")}</div>`;
}
function renderQuestion(q,shared=[],groupType=null){
  const opts=(q.options||[]).length?q.options:shared,s=exam.answers[q.id]??"",t=normalizeType(groupType||q.question_type);let c="";
  if(t==="single"||["tfng","yng","title"].includes(t)){c=opts.map(o=>`<label style="font-weight:400"><input style="width:auto" type="radio" name="r-${q.id}" value="${attr(o.option_key)}" ${s===o.option_key?"checked":""} onchange="setAns('${q.id}',this.value)" ${exam.locked?"disabled":""}> <strong>${esc(o.option_key)}.</strong> ${esc(o.option_text)}</label>`).join("")}
  else if(t==="multi"||t==="list"){const a=Array.isArray(s)?s:[];c=opts.map(o=>`<label style="font-weight:400"><input style="width:auto" type="checkbox" value="${attr(o.option_key)}" ${a.includes(o.option_key)?"checked":""} onchange="toggleAns('${q.id}',this.value,this.checked)" ${exam.locked?"disabled":""}> ${esc(o.option_key)}. ${esc(o.option_text)}</label>`).join("")}
  else if(["matching","map","headings","information","features","endings"].includes(t)&&opts.length){c=`<select onchange="setAns('${q.id}',this.value)" ${exam.locked?"disabled":""}><option value="">Select answer</option>${opts.map(o=>`<option value="${attr(o.option_key)}" ${s===o.option_key?"selected":""}>${esc(o.option_key)} — ${esc(o.option_text)}</option>`).join("")}</select>`}
  else c=`<input value="${attr(Array.isArray(s)?s.join(", "):s)}" oninput="setAns('${q.id}',this.value)" placeholder="Type your answer" ${exam.locked?"disabled":""}>`;
  return `<div id="q-${q.id}" class="question"><div class="student-rich" data-highlight-key="${attr(highlightKey("question",q.id))}"><strong>${q.question_number}. </strong>${richTextSanitize(q.question_text||"")}</div>${q.image_url?`<img class="media" src="${attr(q.image_url)}">`:""}<div style="margin-top:8px">${c}</div></div>`;
}
function examNav(){return `<div class="actions" style="justify-content:space-between;margin-top:14px"><button class="btn secondary" ${exam.currentSection===0?"disabled":""} onclick="switchExamSection(${exam.currentSection-1})">← Previous</button>${exam.review?`<span class="status published">Submitted — Read Only Review</span>`:exam.locked?`<span class="status warning">Submission completed</span>`:exam.currentSection<exam.data.sections.length-1?`<button class="btn primary" onclick="switchExamSection(${exam.currentSection+1})">Next →</button>`:`<button class="btn success" onclick="${exam.preview?"exitExam()":"submitExam(false)"}">${exam.preview?"Close Preview":"Submit Test"}</button>`}</div>`}
function renderWritingExam(){
  const tasks=(exam.data.writingTasks||[]).slice().sort((a,b)=>a.part-b.part),q=tasks[Math.min(exam.currentTask,tasks.length-1)];
  app().innerHTML=headerExam()+`<div class="shell"><div class="section-tabs">${tasks.map((x,i)=>`<button class="btn ${i===exam.currentTask?"primary":"secondary"}" onclick="switchTask(${i})">Task ${i+1}</button>`).join("")}</div>
  ${q?`<div class="writing-grid"><div class="pane"><h2>Writing Task ${q.part}</h2>${q.instructions?`<div class="instructions student-rich" data-highlight-key="${attr(highlightKey("writing-instructions",q.id))}">${richTextSanitize(q.instructions)}</div>`:""}${q.media_url?`<img class="media" src="${attr(q.media_url)}">`:""}<div class="student-rich" data-highlight-key="${attr(highlightKey("writing-prompt",q.id))}">${richTextSanitize(q.prompt||"")}</div></div>
  <div class="pane"><div class="actions" style="justify-content:space-between"><h3>Your Answer</h3><strong id="wc">0 words</strong></div><textarea class="writing-answer" id="wa" oninput="setWriting('task_${q.id}',this.value)" ${exam.locked?"disabled":""}>${esc(exam.answers['task_'+q.id]||"")}</textarea><p class="muted">Minimum: ${q.minimum|| (q.part===1?150:250)} words${q.maximum?` • Maximum: ${q.maximum}`:""}</p></div></div>`:`<div class="card">Writing tasks not configured.</div>`}
  <div class="actions" style="justify-content:space-between;margin-top:14px"><button class="btn secondary" ${exam.currentTask===0?"disabled":""} onclick="switchTask(${exam.currentTask-1})">← Previous Task</button>${exam.currentTask<tasks.length-1?`<button class="btn primary" onclick="switchTask(${exam.currentTask+1})">Next Task →</button>`:`<button class="btn success" onclick="${exam.preview?"exitExam()":"submitExam(false)"}">${exam.preview?"Close Preview":"Submit Writing Test"}</button>`}</div></div>`;
  setTimeout(restoreAndBindHighlights,0);
  updateWC();
}
function setWriting(id,v){setAns(id,v);updateWC()}function updateWC(){const v=$("wa")?.value||"",n=v.trim()?v.trim().split(/\s+/).length:0;if($("wc"))$("wc").textContent=n+" words"}

function norm(v){return String(v??"").trim().toLowerCase().replace(/\s+/g," ")}
function answerWords(v){const s=String(v??"").trim();return s?s.split(/\s+/).filter(Boolean).length:0}
function normalizeAnswerValue(v,caseSensitive=false){
  const s=String(v??"").trim().replace(/\s+/g," ");
  return caseSensitive?s:s.toLowerCase();
}
function evalQ(q,a){
  const cfg=q.config||q.question_config||{};
  const caseSensitive=!!cfg.caseSensitive;
  const clean=v=>normalizeAnswerValue(v,caseSensitive);
  const base=String(q.correct_answer||"").split("||").map(x=>x.trim()).filter(Boolean);
  const extra=Array.isArray(cfg.acceptedAnswers)?cfg.acceptedAnswers:[];
  const exp=[...base,...extra].map(clean).filter(Boolean);
  if(Array.isArray(a)){
    const aa=[...new Set(a.map(clean).filter(Boolean))].sort();
    const ee=[...new Set(exp)].sort();
    return JSON.stringify(aa)===JSON.stringify(ee);
  }
  const given=clean(a);
  if(!given)return false;
  const limit=Number(cfg.wordLimit||0);
  if(limit>0 && answerWords(a)>limit)return false;
  return exp.includes(given);
}
function deserializeStoredAnswer(q,text){
  const raw=String(text??"");
  const t=normalizeType(q?.question_type);
  if(t==="multi"||t==="list") return raw.split(/,\s*/).map(x=>x.trim()).filter(Boolean);
  return raw;
}
function calculateObjectiveScore(questions,answers){
  const qs=(questions||[]).filter(q=>Number(q.question_number)>=1&&Number(q.question_number)<=40);
  let correct=0,wrong=0,unanswered=0;
  for(const q of qs){
    const a=answers?.[q.id];
    const has=Array.isArray(a)?a.length>0:String(a??"").trim()!=="";
    if(!has) unanswered++;
    else if(evalQ(q,a)) correct++;
    else wrong++;
  }
  return {correct,wrong,unanswered,score:correct,total:qs.length};
}
function bandForAttempt(module,questions,answers,readingType="academic"){
  const summary=calculateObjectiveScore(questions,answers);
  return {...summary,band:scoreBand(module,summary.score,readingType)};
}
async function submitExam(auto=false){
  if(exam.preview)return exitExam();
  if(exam.locked)return;
  if(!auto&&!confirm("Submit test? Answers will be locked."))return;
  stopStudentListeningAudio();
  try{
    exam.locked=true;saveExam();if(timerHandle)clearInterval(timerHandle);for(const t of answerSaveTimers.values())clearTimeout(t);answerSaveTimers.clear();
    const mod=exam.data.test.module;
    const qs=mod==="writing"?validModuleQuestions(exam.data):(mod==="listening"?listeningQuestions40(exam.data):readingQuestions40(exam.data));
    for(const q of qs){
      const key=mod==="writing"?`task_${q.question_config?.writingTaskId||q.id}`:q.id;
      const value=exam.answers[key]??"";
      const answerText=Array.isArray(value)?value.join(", "):String(value??"");
      const correct=mod==="writing"?null:evalQ(q,value);
      // IELTS Listening and Reading award exactly 1 mark per correct question.
      const marks=mod==="writing"?0:(correct?1:0);
      const {data:existing,error:findErr}=await sb.from("answers").select("id").eq("result_id",exam.resultId).eq("question_id",q.id).maybeSingle();if(findErr)throw findErr;
      const payload={result_id:exam.resultId,question_id:q.id,answer_text:answerText,is_correct:correct,marks_obtained:marks};
      if(existing?.id){const {error}=await sb.from("answers").update(payload).eq("id",existing.id);if(error)throw error}
      else {const {error}=await sb.from("answers").insert(payload);if(error)throw error}
    }
    const summary=mod==="writing"?null:calculateObjectiveScore(qs,exam.answers);
    const score=summary?.score??null;
    const upd={status:"submitted",submitted_at:new Date().toISOString()};
    if(mod==="listening")upd.listening_score=score;if(mod==="reading")upd.reading_score=score;if(mod==="writing")upd.writing_score=null;
    const {error}=await sb.from("results").update(upd).eq("id",exam.resultId).eq("status","in_progress");if(error)throw error;
    const resultId=exam.resultId;clearExam(exam.testId,exam.studentId,exam.resultId);clearRoute();exam=null;
    await studentResultPage(resultId,true);
  }catch(e){
    console.error(e);
    if(exam){exam.locked=true;saveExam();renderExam();}
    alert("Submission failed: "+e.message+"\nYour answers are locked locally. Please contact the administrator.");
  }
}
function exitExam(){if(timerHandle)clearInterval(timerHandle);stopStudentListeningAudio();if(exam?.preview){exam=null;return openBuilder(admin.test.id)}saveExam();exam=null;clearRoute();studentDashboard()}

async function studentResultPage(resultId,justSubmitted=false){
  try{
    const {data:r,error:re}=await sb.from("results").select("*,tests(title,module,total_questions,settings)").eq("id",resultId).single();if(re)throw re;
    const mod=normalizeModule(r.tests?.module);let raw=mod==="listening"?r.listening_score:mod==="reading"?r.reading_score:null;if(r.status==="submitted"&&(mod==="listening"||mod==="reading")) raw=await recalculateStoredScore(r);const readingType=getReadingType(r.tests);const band=scoreBand(mod,raw,readingType);
    shell(`<div class="actions"><button class="btn secondary" onclick="studentDashboard()">← Dashboard</button></div><div class="card" style="max-width:760px;margin:20px auto;text-align:center">
      <div style="font-size:52px">✅</div><h2>${justSubmitted?"Test Submitted":"Test Result"}</h2><h3>${esc(r.tests?.title||"")}</h3>
      ${mod==="writing"?`<p style="font-size:20px"><strong>Writing Evaluation Pending</strong></p>`:`<div class="dashboard-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:18px"><div class="card"><strong>Score</strong><div style="font-size:34px;margin-top:6px">${esc(raw??"-")} / 40</div></div><div class="card"><strong>Band Score</strong><div style="font-size:34px;margin-top:6px">${esc(band==null?"—":Number(band).toFixed(1))}</div></div></div>`}
      <div class="actions" style="justify-content:center;margin-top:20px"><button class="btn secondary" onclick="studentReviewAnswers('${r.id}')">View My Saved Answers</button><button class="btn primary" onclick="studentDashboard()">Back to Dashboard</button></div>
    </div>`);
  }catch(e){alert("Could not load result: "+e.message)}
}
async function studentReviewAnswers(resultId){
  try{
    const {data:r,error:re}=await sb.from("results").select("*,tests(title,module,id,settings)").eq("id",resultId).single();if(re)throw re;
    const d=await loadTestBundle(r.test_id);
    const qs=r.tests?.module==="listening"?listeningQuestions40(d):r.tests?.module==="reading"?readingQuestions40(d):validModuleQuestions(d);
    const qids=qs.map(q=>q.id);
    let ans=[];
    if(qids.length){const a=await sb.from("answers").select("*").eq("result_id",resultId).in("question_id",qids);if(a.error)throw a.error;ans=a.data||[]}
    const am=new Map(ans.map(a=>[a.question_id,a]));
    const rows=qs.map(q=>{
      const a=am.get(q.id);const given=String(a?.answer_text??"").trim();const stored=deserializeStoredAnswer(q,a?.answer_text);const correct=(Array.isArray(stored)?stored.length>0:!!given)&&evalQ(q,stored);
      return `<tr><td><strong>Q${esc(q.question_number)}</strong></td><td>${esc(q.question_text||"")}</td><td>${esc(given||"—")}</td><td>${esc(q.correct_answer||"—")}</td><td>${esc((q.question_config?.acceptedAnswers||[]).join(" / ")||"—")}</td><td><span class="status ${!given?"warning":correct?"success":"danger"}">${!given?"Not Answered":correct?"Correct":"Wrong"}</span></td></tr>`;
    }).join("");
    const mod=normalizeModule(r.tests?.module);const raw=mod==="listening"?await recalculateStoredScore(r):mod==="reading"?await recalculateStoredScore(r):null;const band=mod!=="writing"?scoreBand(mod,raw,getReadingType(r.tests)):null;
    shell(`<div class="actions"><button class="btn secondary" onclick="studentResultPage('${r.id}')">← Score</button><button class="btn primary" onclick="studentDashboard()">Dashboard</button></div><h2>Submitted Test Review</h2><p class="muted">${esc(r.tests?.title||"")} • Submitted and read-only. You can review your saved answers, but you cannot start a new attempt for this test.</p>${mod!=="writing"?`<div class="dashboard-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin:14px 0"><div class="card"><strong>Raw Score</strong><div style="font-size:30px;margin-top:6px">${esc(raw??"-")} / 40</div></div><div class="card"><strong>Band</strong><div style="font-size:30px;margin-top:6px">${esc(band==null?"—":Number(band).toFixed(1))}</div></div></div>`:""}<div class="card table-wrap"><table><thead><tr><th>Q</th><th>Question</th><th>My Answer</th><th>Correct Answer</th><th>Alternative Accepted</th><th>Status</th></tr></thead><tbody>${rows||`<tr><td colspan="6">No questions configured.</td></tr>`}</tbody></table></div>`);
  }catch(e){alert("Could not load saved answers: "+e.message)}
}

async function deleteResult(resultId){
  if(!confirm("Delete this student result and all saved answers? This cannot be undone."))return;
  try{
    const {error:ae}=await sb.from("answers").delete().eq("result_id",resultId);if(ae)throw ae;
    const {error:re}=await sb.from("results").delete().eq("id",resultId);if(re)throw re;
    alert("Result deleted successfully.");resultsPage();
  }catch(e){alert("Could not delete result: "+e.message)}
}
async function resultsPage(){
  setRoute("results");
  const {data,error}=await sb.from("results").select("*,tests(title,module,total_questions)").order("created_at",{ascending:false});
  if(error)return alert(error.message);
  const ids=[...new Set((data||[]).map(r=>r.student_id).filter(Boolean))];
  let profiles=[];
  if(ids.length){
    const p=await sb.from("profiles").select("id,full_name,role,active,created_at").in("id",ids);
    if(p.error)return alert("Could not load student names: "+p.error.message);
    profiles=p.data||[];
  }
  const pm=new Map(profiles.map(x=>[x.id,x]));
  shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button></div>
  <h2>Student Results</h2><p class="muted">Open a submitted attempt to see the student's answer for every question, the correct answer, and the marking status.</p>
  <div class="card table-wrap"><table><thead><tr><th>Student</th><th>Test</th><th>Module</th><th>Status</th><th>Score</th><th>Submitted</th><th>Details</th></tr></thead><tbody>
  ${(data||[]).map(r=>{
    const mod=r.tests?.module,p=pm.get(r.student_id);
    const score=mod==="listening"?r.listening_score??"-":mod==="reading"?r.reading_score??"-":r.writing_score??"Pending";
    const band=mod==="listening"?bandText("listening",r.listening_score):mod==="reading"?bandText("reading",r.reading_score):"Pending";
    const name=p?.full_name||r.student_id||"Unknown Student";
    return `<tr><td><strong>${esc(name)}</strong></td><td>${esc(r.tests?.title||"")}</td><td>${esc((mod||"").toUpperCase())}</td><td>${esc(r.status||"")}</td><td><strong>${esc(score)}</strong>${mod!=="writing"?`<br><small>Band: <strong>${esc(band)}</strong></small>`:""}</td><td>${r.submitted_at?new Date(r.submitted_at).toLocaleString():"-"}</td><td><div class="actions"><button class="btn primary" onclick="resultDetails('${r.id}')">View Answers</button><button class="btn danger" onclick="deleteResult('${r.id}')">Delete</button></div></td></tr>`
  }).join("")||`<tr><td colspan="7">No results.</td></tr>`}</tbody></table></div>`);
}

async function resultDetails(resultId){
  try{
    const {data:r,error:re}=await sb.from("results").select("*,tests(title,module,total_questions,settings)").eq("id",resultId).single();
    if(re)throw re;
    const {data:p,error:pe}=await sb.from("profiles").select("id,full_name,role,active").eq("id",r.student_id).single();
    if(pe)throw pe;
    const d=await loadTestBundle(r.test_id);
    const mod=normalizeModule(r.tests?.module||d.test?.module||"");
    const questions=mod==="listening"?listeningQuestions40(d):validModuleQuestions(d);
    const qids=questions.map(q=>q.id);
    let ans=[];
    if(qids.length){const a=await sb.from("answers").select("*").eq("result_id",resultId).in("question_id",qids);if(a.error)throw a.error;ans=a.data||[]}
    const am=new Map(ans.map(a=>[a.question_id,a]));
    let correctCount=0,wrongCount=0,unansweredCount=0;
    const rows=questions.map(q=>{
      const a=am.get(q.id);
      const given=String(a?.answer_text??"").trim();
      const correct=!!given&&evalQ(q,given);
      if(!given) unansweredCount++; else if(correct) correctCount++; else wrongCount++;
      const status=!given?"Not Answered":correct?"Correct":"Wrong";
      const cls=!given?"warning":correct?"success":"danger";
      const cfg=q.question_config||{};
      const accepted=Array.isArray(cfg.acceptedAnswers)?cfg.acceptedAnswers:[];
      const acceptedText=accepted.length?accepted.join(" / "):"";
      return `<tr><td><strong>Q${esc(q.question_number)}</strong></td><td>${esc(q.question_text||"")}</td><td>${esc(given||"—")}</td><td>${esc(q.correct_answer||"—")}</td><td>${esc(acceptedText||"—")}</td><td><span class="status ${cls}">${status}</span></td><td>${correct?1:0}</td></tr>`;
    }).join("");
    const score=(mod==="listening"||mod==="reading")?correctCount:questions.reduce((n,q)=>n+Number(am.get(q.id)?.marks_obtained||0),0);
    const scoreField=mod==="listening"?r.listening_score:mod==="reading"?r.reading_score:r.writing_score;
    if(r.status==="submitted"&&(mod==="listening"||mod==="reading")){const field=mod==="listening"?"listening_score":"reading_score";if(Number(scoreField)!==score){const u=await sb.from("results").update({[field]:score}).eq("id",resultId);if(u.error)throw u.error;r[field]=score;}}
    const finalScore=mod==="listening"?score:mod==="reading"?score:r.writing_score;
    const band=scoreBand(mod,finalScore,getReadingType(r.tests));
    shell(`<div class="actions"><button class="btn secondary" onclick="resultsPage()">← Results</button><button class="btn danger" onclick="deleteResult('${r.id}')">Delete Result</button></div>
      <h2>${esc(p.full_name||"Student")}</h2>
      <p class="muted"><strong>${esc(r.tests?.title||"")}</strong> • ${esc(mod.toUpperCase())}${mod==="reading"?` • ${getReadingType(r.tests)==="general"?"General Training":"Academic"}`:""} • ${r.submitted_at?`Submitted ${new Date(r.submitted_at).toLocaleString()}`:"Not submitted"}</p>
      <div class="dashboard-grid" style="grid-template-columns:repeat(5,minmax(0,1fr));margin:14px 0">
        <div class="card"><strong>Raw Score</strong><div style="font-size:26px;margin-top:6px">${esc(scoreField??score)}${mod==="writing"?"":" / 40"}</div></div>
        <div class="card"><strong>Band</strong><div style="font-size:26px;margin-top:6px">${mod==="writing"?"Pending":esc(band??"—")}</div></div>
        <div class="card"><strong>Correct</strong><div style="font-size:26px;margin-top:6px">${correctCount}</div></div>
        <div class="card"><strong>Wrong</strong><div style="font-size:26px;margin-top:6px">${wrongCount}</div></div>
        <div class="card"><strong>Not Answered</strong><div style="font-size:26px;margin-top:6px">${unansweredCount}</div></div>
      </div>
      <div class="card table-wrap"><h3>Question-by-Question Review</h3><table><thead><tr><th>Q</th><th>Question</th><th>Student Answer</th><th>Correct Answer</th><th>Alternative Accepted</th><th>Status</th><th>Marks</th></tr></thead><tbody>${rows||`<tr><td colspan="7">No questions configured for this test.</td></tr>`}</tbody></table></div>`);
  }catch(e){alert("Could not load result details: "+e.message)}
}

window.staffDashboard=staffDashboard;window.studentDashboard=studentDashboard;window.studentsPage=studentsPage;window.newStudentForm=newStudentForm;window.createStudent=createStudent;window.manageStudent=manageStudent;window.saveStudent=saveStudent;window.toggleStudent=toggleStudent;window.setTestAccess=setTestAccess;window.deleteStudent=deleteStudent;window.testsPage=testsPage;window.answerKeyPage=answerKeyPage;window.saveAnswerKey=saveAnswerKey;window.newTestForm=newTestForm;window.syncNewTestDefaults=syncNewTestDefaults;window.createTest=createTest;window.togglePublish=togglePublish;window.deleteTest=deleteTest;window.openBuilder=openBuilder;window.renderBuilder=renderBuilder;window.switchAdminSection=switchAdminSection;window.saveTestHeader=saveTestHeader;window.saveSection=saveSection;window.groupForm=groupForm;window.saveGroup=saveGroup;window.deleteGroup=deleteGroup;window.questionForm=questionForm;window.saveQuestion=saveQuestion;window.deleteQuestion=deleteQuestion;window.writingTaskForm=writingTaskForm;window.saveWritingTask=saveWritingTask;window.deleteWritingTask=deleteWritingTask;window.uploadAudio=uploadAudio;window.removeAudio=removeAudio;window.previewCurrentTest=previewCurrentTest;window.startStudentTest=startStudentTest;window.switchExamSection=switchExamSection;window.switchTask=switchTask;window.setAns=setAns;window.toggleAns=toggleAns;window.setWriting=setWriting;window.submitExam=submitExam;window.exitExam=exitExam;window.resultsPage=resultsPage;window.resultDetails=resultDetails;window.studentResultPage=studentResultPage;window.studentReviewAnswers=studentReviewAnswers;window.deleteResult=deleteResult;window.logout=logout;
document.addEventListener("DOMContentLoaded",init);
