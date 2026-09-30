// UNIVERSAL EDUCATION IELTS — COMPLETE V12.3.6 CUMULATIVE
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
      if(st.fontSize)keep.push(`font-size:${st.fontSize}`);
      if(st.color)keep.push(`color:${st.color}`);
      el.setAttribute("style",keep.join(";"));
    }
  });
  return box.innerHTML;
}
function richEditor(id,value="",height=220){
  const sizes=[12,14,16,18,20,22,24,28,32];
  return `<div class="rich-toolbar" data-rich-toolbar="${id}">
    <label class="rich-select-label">Size <select onchange="richFontSize('${id}',this.value)"><option value="">Default</option>${sizes.map(n=>`<option value="${n}px">${n}px</option>`).join("")}</select></label>
    <button type="button" onclick="richExec('${id}','bold')"><b>B</b></button>
    <button type="button" onclick="richExec('${id}','italic')"><i>I</i></button>
    <button type="button" onclick="richExec('${id}','underline')"><u>U</u></button>
    <span class="rich-sep"></span>
    <label class="rich-color-label">Text <input type="color" value="#111827" onchange="richColor('${id}',this.value)" title="Text color"></label>
    <label class="rich-color-label">Highlight <input type="color" value="#fff59d" onchange="richHighlight('${id}',this.value)" title="Highlight color"></label>
    <span class="rich-sep"></span>
    <button type="button" onclick="richAlign('${id}','left')">Left</button>
    <button type="button" onclick="richAlign('${id}','center')">Center</button>
    <button type="button" onclick="richAlign('${id}','right')">Right</button>
    <button type="button" onclick="richAlign('${id}','justify')">Justify</button>
    <span class="rich-sep"></span>
    <button type="button" onclick="richExec('${id}','insertUnorderedList')">• List</button>
    <button type="button" onclick="richExec('${id}','insertOrderedList')">1. List</button>
    <button type="button" onclick="richExec('${id}','removeFormat')">Clear Format</button>
  </div><div id="${id}" class="rich-editor" contenteditable="true" spellcheck="true" style="min-height:${height}px">${richTextSanitize(value)}</div>`;
}
function richExec(id,cmd){const e=$(id);if(!e)return;e.focus();document.execCommand(cmd,false,null)}
function richAlign(id,a){const e=$(id);if(!e)return;e.focus();const m={left:"justifyLeft",center:"justifyCenter",right:"justifyRight",justify:"justifyFull"}[a];document.execCommand(m,false,null)}
function richFontSize(id,size){
  const e=$(id);if(!e||!size)return;e.focus();
  document.execCommand('fontSize',false,'7');
  e.querySelectorAll('font[size="7"]').forEach(f=>{f.removeAttribute('size');f.style.fontSize=size;});
}
function richColor(id,color){const e=$(id);if(!e)return;e.focus();document.execCommand('foreColor',false,color)}
function richHighlight(id,color){const e=$(id);if(!e)return;e.focus();try{document.execCommand('hiliteColor',false,color)}catch(_){document.execCommand('backColor',false,color)}}
function richValue(id){return richTextSanitize($(id)?.innerHTML||"")}
function initRichStyles(){if($("ueRichStyles"))return;const st=document.createElement("style");st.id="ueRichStyles";st.textContent=`
.rich-toolbar{display:flex;flex-wrap:wrap;gap:5px;padding:7px;border:1px solid #d5dce5;border-bottom:0;border-radius:8px 8px 0 0;background:#f5f7fa;margin-top:5px}.rich-toolbar button{border:1px solid #cbd5e1;background:#fff;padding:5px 9px;border-radius:5px;cursor:pointer;font-size:13px}.rich-toolbar button:hover{background:#e8eef7}.rich-select-label,.rich-color-label{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:#334155}.rich-toolbar select{border:1px solid #cbd5e1;background:#fff;border-radius:5px;padding:4px 6px}.rich-toolbar input[type=color]{width:30px;height:28px;padding:1px;border:1px solid #cbd5e1;border-radius:5px;background:#fff;cursor:pointer}.rich-sep{width:1px;background:#cbd5e1;margin:2px 4px}.rich-editor{padding:12px;border:1px solid #d5dce5;border-radius:0 0 8px 8px;background:#fff;line-height:1.7;outline:none;overflow:auto}.rich-editor:focus{border-color:#2563eb}.rich-editor p{margin:0 0 10px}.student-rich{line-height:1.8;user-select:text}.student-rich p{margin:0 0 12px}.student-highlight{background:#fff59d!important;border-radius:2px;padding:0 1px}.student-highlight-menu{position:absolute;z-index:99999;display:none;background:#111827;padding:5px;border-radius:7px;box-shadow:0 5px 18px rgba(0,0,0,.25)}.student-highlight-menu button{color:#fff;background:#111827;border:0;padding:7px 11px;border-radius:5px;cursor:pointer}.student-highlight-menu button:hover{background:#374151}.writing-review{white-space:pre-wrap;border:1px solid #d5dce5;border-radius:8px;padding:14px;background:#fff;line-height:1.7;min-height:120px}`;document.head.appendChild(st)}
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
async function objectiveAttemptSummary(r){
  const d=await loadTestBundle(r.test_id);
  const mod=normalizeModule(r.tests?.module||d?.test?.module||"");
  if(mod!=='listening'&&mod!=='reading') return {module:mod,score:null,correct:0,wrong:0,unanswered:0,total:0,questions:[]};
  const questions=mod==='listening'?listeningQuestions40(d):readingQuestions40(d);
  const qids=questions.map(q=>q.id);
  let rows=[];
  if(qids.length){const a=await sb.from("answers").select("question_id,answer_text").eq("result_id",r.id).in("question_id",qids);if(a.error)throw a.error;rows=a.data||[]}
  const am=new Map(rows.map(a=>[a.question_id,a]));
  const answerMap={};
  for(const q of questions){const row=am.get(q.id);if(row)answerMap[q.id]=deserializeStoredAnswer(q,row.answer_text);}
  const summary=calculateObjectiveScore(questions,answerMap);
  return {...summary,module:mod,questions};
}
async function recalculateStoredScore(r){
  const summary=await objectiveAttemptSummary(r);
  if(summary.module!=='listening'&&summary.module!=='reading') return null;
  const field=summary.module==='listening'?'listening_score':'reading_score';
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
async function persistWritingAttempt(part,answer,locked=false,submissionTime=null){
  if(!exam||exam.preview||!exam.testId||!exam.studentId||!part)return;
  try{
    const text=String(answer??"");
    const payload={
      test_id:exam.testId,
      student_id:exam.studentId,
      part:Number(part),
      answer:text,
      word_count:answerWords(text),
      submission_time:submissionTime||null,
      time_taken_seconds:exam.startedAt?Math.max(0,Math.floor((Date.now()-new Date(exam.startedAt).getTime())/1000)):null,
      evaluation_status:locked?'submitted':'pending',
      locked:!!locked,
      updated_at:new Date().toISOString()
    };
    const {error}=await sb.from('writing_attempts').upsert(payload,{onConflict:'test_id,student_id,part'});
    if(error)throw error;
  }catch(e){console.warn('Writing attempt autosave failed:',e.message)}
}
function queueWritingAttemptSave(part,answer){
  if(!exam||exam.preview||exam.locked||!part)return;
  const key=`writing_part_${part}`;
  const old=answerSaveTimers.get(key);if(old)clearTimeout(old);
  answerSaveTimers.set(key,setTimeout(()=>{answerSaveTimers.delete(key);persistWritingAttempt(part,answer,false)},600));
}
async function loadWritingAttempts(testId,studentId){
  if(!testId||!studentId)return [];
  const {data,error}=await sb.from('writing_attempts').select('*').eq('test_id',testId).eq('student_id',studentId).order('part');
  if(error){console.warn('Could not load writing attempts:',error.message);return []}
  return data||[];
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
    <button class="dashbtn" onclick="testsPage('speaking')">🗣️<strong>Speaking</strong><span class="muted">Faculty Band Assessment</span></button>
    <button class="dashbtn" onclick="resultsPage()">📊<strong>Results</strong><span class="muted">Module Results</span></button>
    <button class="dashbtn" onclick="overallResultsPage()">🏆<strong>Overall Results</strong><span class="muted">4-module IELTS score</span></button>
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
  <button class="btn secondary" onclick="editTest('${t.id}')">Edit</button><button class="btn primary" onclick="answerKeyPage('${t.id}')">Answer Key</button><button class="btn ${t.is_published?"warning":"success"}" onclick="togglePublish('${t.id}',${!t.is_published})">${t.is_published?"Unpublish":"Publish"}</button>
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
  const m=["listening","reading","writing","speaking"].includes(module)?module:"listening";
  shell(`<div class="actions"><button class="btn secondary" onclick="testsPage('${module}')">← Back</button></div><h2>Create New Test</h2><div class="card">
  <div class="grid"><div><label>Title</label><input id="ntTitle" value="${m[0].toUpperCase()+m.slice(1)} Test"></div><div><label>Module</label><select id="ntModule" onchange="syncNewTestDefaults()">
  <option value="listening" ${m==="listening"?"selected":""}>Listening</option><option value="reading" ${m==="reading"?"selected":""}>Reading</option><option value="writing" ${m==="writing"?"selected":""}>Writing</option><option value="speaking" ${m==="speaking"?"selected":""}>Speaking — Faculty Assessment</option></select></div></div>
  <label>Description</label><textarea id="ntDesc"></textarea><div class="grid"><div><label>Duration</label><input id="ntDur" type="number" value="${m==="listening"?40:m==="speaking"?0:60}" ${m==="speaking"?"disabled":""}></div><div><label>Total Questions</label><input id="ntTotal" type="number" value="${m==="writing"?2:m==="speaking"?0:40}" ${m==="speaking"?"disabled":""}></div></div>
  <label>Overall Result Group</label><input id="ntOverallGroup" value="${attr(m[0].toUpperCase()+m.slice(1)+" Mock")}" placeholder="Use the same group name for Listening, Reading, Writing and Speaking">
  <div class="inline-help">Use the same Overall Result Group for all four module tests belonging to one IELTS mock.</div>
  ${m==="reading"?`<div style="margin-top:12px"><label>Reading Test Type</label><select id="ntReadingType"><option value="academic" selected>IELTS Academic Reading</option><option value="general">IELTS General Training Reading</option></select><div class="inline-help">This setting controls the Reading raw-score → band conversion for every student attempt of this test.</div></div>`:""}
  <div class="actions" style="margin-top:14px"><button class="btn primary" onclick="createTest()">Create & Open Builder</button></div></div>`);
}
function syncNewTestDefaults(){const m=$("ntModule").value;$("ntDur").value=m==="listening"?40:m==="speaking"?0:60;$("ntTotal").value=m==="writing"?2:m==="speaking"?0:40;$("ntDur").disabled=m==="speaking";$("ntTotal").disabled=m==="speaking"}
async function createTest(){
  try{
    const uid=(await sb.auth.getUser()).data.user.id,m=$("ntModule").value;
    const settings={...(m==="reading"?{reading_type:$("ntReadingType")?.value||"academic"}:{}),overall_group:$("ntOverallGroup")?.value.trim()||$("ntTitle").value.trim()};
    const {data:t,error}=await sb.from("tests").insert({title:$("ntTitle").value.trim(),module:m,description:$("ntDesc").value.trim(),duration_minutes:+$("ntDur").value,total_questions:+$("ntTotal").value,is_published:false,created_by:uid,settings}).select().single();if(error)throw error;
    const count=m==="listening"?4:m==="reading"?3:1;
    const rows=Array.from({length:count},(_,i)=>({test_id:t.id,section_number:i+1,title:m==="listening"?`Part ${i+1}`:m==="reading"?`Passage ${i+1}`:m==="writing"?"Writing Tasks":"Speaking Assessment",instructions:"",content:""}));
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
  if(d.test.module==="speaking"){if(d.sections.length!==1)issues.push("Speaking assessment must have one assessment section.");return issues;}
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
  if(test.module==="writing"){
    const wt=await sb.from("writing_tasks").select("*").eq("test_id",id).order("part");
    if(wt.error)throw wt.error;
    writingTasks=(wt.data||[]).map(x=>({
      ...x,
      minimum:x.minimum_words,
      maximum:x.maximum_words,
      suggested:x.suggested_time,
      media_url:Array.isArray(x.media)&&x.media[0]?.url?x.media[0].url:null
    }));
  }
  if(qids.length){const o=await sb.from("options").select("*").in("question_id",qids).order("sort_order");if(o.error)throw o.error;options=o.data||[]}
  if(gids.length){const o=await sb.from("question_group_options").select("*").in("group_id",gids).order("sort_order");if(o.error)throw o.error;groupOptions=o.data||[]}
  const byQ={};options.forEach(o=>(byQ[o.question_id]??=[]).push(o));questions=questions.map(q=>({...q,options:byQ[q.id]||[],config:q.question_config||{}}));
  const byG={};groupOptions.forEach(o=>(byG[o.group_id]??=[]).push(o));groups=groups.map(g=>({...g,options:byG[g.id]||[]}));
  let audio=null;if(test.module==="listening"){const a=await sb.from("test_audio").select("*").eq("test_id",id).maybeSingle();if(!a.error)audio=a.data}
  return {test,sections:sections||[],groups,questions,audio,writingTasks};
}
async function openBuilder(id,sectionIndex=0,scrollTop=0){
  try{
    if(!id) throw new Error("Test ID is missing.");
    setRoute("builder",{testId:id});
    admin=await loadTestBundle(id);
    const requested=Number.isFinite(Number(sectionIndex))?Number(sectionIndex):0;
    admin.sectionIndex=Math.min(Math.max(0,requested),Math.max(0,admin.sections.length-1));
    renderBuilder();
    setTimeout(()=>window.scrollTo({top:Math.max(0,Number(scrollTop)||0),behavior:"instant"}),0);
  }catch(e){
    console.error("Could not open Test Builder",e);
    alert("Could not open Test Builder: "+(e?.message||e));
    try{testsPage(admin?.test?.module||"all")}catch(_){}
  }
}
window.openBuilder=openBuilder;

async function editTest(id){
  return openBuilder(id,0,0);
}
window.editTest=editTest;

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
  <label>Overall Result Group</label><input id="btOverallGroup" value="${attr((t.settings||{}).overall_group||t.title||"")}" placeholder="Same group name across the 4 modules">
  ${t.module==="reading"?`<div style="margin-top:12px"><label>Reading Test Type</label><select id="btReadingType"><option value="academic" ${getReadingType(t)==="academic"?"selected":""}>IELTS Academic Reading</option><option value="general" ${getReadingType(t)==="general"?"selected":""}>IELTS General Training Reading</option></select><div class="inline-help">The selected type controls the Reading raw-score → band conversion for this test.</div></div>`:""}
  <button class="btn primary" onclick="saveTestHeader()">Save Test Details</button></div>
  ${t.module==="listening"?renderAudioAdmin():""}
  <div class="section-tabs">${admin.sections.map((x,i)=>`<button class="btn ${i===admin.sectionIndex?"primary":"secondary"}" onclick="switchAdminSection(${i})">${t.module==="reading"?"Passage":"Part"} ${i+1}</button>`).join("")}</div>
  ${s?`<div class="card"><h3>${esc(s.title||"Section")}</h3><div class="grid"><div><label>Title</label><input id="bsTitle" value="${attr(s.title||"")}"></div><div><label>Existing Image URL / Path (optional)</label><input id="bsImage" value="${attr(s.image_url||s.image_path||"")}"></div></div>
  ${t.module==="reading"?`<div class="media-upload-box"><label><strong>Passage Image / Chart / Diagram</strong></label><input id="bsImageFile" type="file" accept="image/*"><div class="inline-help">Upload, replace or remove a passage-level image. This is useful for Reading charts, diagrams, figures and visual material.</div>${s.image_url?`<div class="editor-block" style="margin-top:8px"><strong>Current image:</strong><br><img class="media" style="max-width:420px;max-height:220px;object-fit:contain" src="${attr(s.image_url)}" onerror="this.style.display='none'"><label style="display:inline-flex;gap:6px;align-items:center;margin-top:6px"><input id="bsRemoveImage" type="checkbox"> Remove current image</label></div>`:""}</div>`:""}
  <label>Instructions</label>${richEditor("bsInstEditor",s.instructions||"",140)}<label>${t.module==="reading"?"Passage Text":"Content / Notes"}</label>${richEditor("bsContentEditor",s.content||"",260)}
  <div class="actions"><button class="btn primary" onclick="saveSection('${s.id}')">Save ${t.module==="reading"?"Passage":"Part"}</button></div></div>`:""}
  ${t.module==="writing"?renderWritingAdmin(qs):t.module==="speaking"?`<div class="card" style="margin-top:12px"><h3>Speaking Faculty Assessment</h3><p class="muted">This Speaking module is assessment-only. Students do not take a timed Speaking test here. Faculty assigns the Speaking band from Overall Results.</p><p class="muted">Use the same Overall Result Group as the corresponding Listening, Reading and Writing tests.</p></div>`:renderQuestionAdmin(gs,qs)}`);
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
async function saveTestHeader(){const current=admin.test.settings||{};const settings={...current,overall_group:$("btOverallGroup")?.value.trim()||admin.test.title};if(admin.test.module==="reading")settings.reading_type=$("btReadingType")?.value||getReadingType(admin.test);const {error}=await sb.from("tests").update({title:$("btTitle").value.trim(),description:$("btDesc").value.trim(),duration_minutes:+$("btDur").value,settings,updated_at:new Date().toISOString()}).eq("id",admin.test.id);if(error)alert(error.message);else openBuilder(admin.test.id)}
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
  const tasks=admin.writingTasks||[],w=part?tasks.find(x=>x.part===part):null,n=part||([1,2].find(x=>!tasks.some(t=>t.part===x))||1),current=w?.media_url||((Array.isArray(w?.media)&&w.media[0]?.url)||"");
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
    const currentMedia=remove?[]:(current?[{type:'image',url:current}]:[]);
    const payload={
      test_id:admin.test.id,
      part,
      task_type:part===1?'task1':'task2',
      instructions:richValue('wInstEditor'),
      prompt:richValue('wPromptEditor'),
      minimum_words:+$('wMin').value||0,
      maximum_words:+$('wMax').value||null,
      suggested_time:part===1?20:40,
      media:currentMedia,
      evaluation_status:'pending',
      updated_at:new Date().toISOString()
    };
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
      const {error}=await sb.from('writing_tasks').update({media:[{type:'image',url:mediaPath}],updated_at:new Date().toISOString()}).eq('id',rowId);if(error)throw error;
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
async function signed(bucket,path){
  if(!path)return null;
  const raw=String(path).trim();
  if(!raw)return null;
  // Accept both Storage object paths and full public/signed URLs. This prevents
  // accidental double-signing and makes older saved paths compatible.
  if(/^https?:\/\//i.test(raw))return raw;
  const {data,error}=await sb.storage.from(bucket).createSignedUrl(raw,3600);
  if(error){
    console.warn(`Storage object could not be signed (${bucket}):`,raw,error.message||error);
    return null;
  }
  return data?.signedUrl||null;
}
async function resolveListeningAudio(testId,audio){
  if(!audio?.audio_path)return null;
  const direct=await signed("listening-audio",audio.audio_path);
  if(direct)return direct;
  // Recover from an old/stale database path when the actual uploaded file still
  // exists under this test's folder.
  try{
    const folder=String(testId||'').trim();
    if(!folder)return null;
    const {data:files,error}=await sb.storage.from("listening-audio").list(folder,{limit:50});
    if(error)throw error;
    const candidate=(files||[]).find(f=>/^listening\.[a-z0-9]+$/i.test(f.name||'')) || (files||[]).find(f=>/\.(mp3|m4a|wav|aac|ogg|webm)$/i.test(f.name||''));
    if(!candidate)return null;
    const path=`${folder}/${candidate.name}`;
    const url=await signed("listening-audio",path);
    if(url && path!==audio.audio_path){
      const {error:updateError}=await sb.from("test_audio").update({audio_path:path,updated_at:new Date().toISOString()}).eq("test_id",testId);
      if(updateError)console.warn("Could not repair test_audio path:",updateError.message);
    }
    return url;
  }catch(e){
    console.warn("Listening audio recovery failed:",e.message||e);
    return null;
  }
}

function overallBandFromComponents(listening,reading,writing,speaking){
  const vals=[listening,reading,writing,speaking].map(Number);
  if(vals.some(v=>!Number.isFinite(v)))return null;
  const avg=vals.reduce((a,b)=>a+b,0)/4;
  return Math.round(avg*2)/2;
}
function overallGroup(test){return String(test?.settings?.overall_group||test?.title||"").trim()||"Ungrouped";}
async function ensureSpeakingResult(testId,studentId){
  const {data:existing,error}=await sb.from("results").select("id,speaking_score").eq("student_id",studentId).eq("test_id",testId).maybeSingle();
  if(error)throw error;
  if(existing)return existing;
  const {data:created,error:ce}=await sb.from("results").insert({student_id:studentId,test_id:testId,status:"faculty_review",started_at:new Date().toISOString()}).select("id,speaking_score").single();
  if(ce)throw ce;
  return created;
}
async function getStudentOverallSummary(userId,tests,attempts){
  // Overall score is STUDENT-ID based, not Overall-Result-Group based.
  // Only submitted module results are eligible for the Overall calculation.
  const amap=new Map();
  (attempts||[]).filter(a=>a.status==='submitted').forEach(a=>{
    const prev=amap.get(a.test_id);
    if(!prev || new Date(a.submitted_at||a.created_at||0)>new Date(prev.submitted_at||prev.created_at||0)) amap.set(a.test_id,a);
  });
  const byModule={listening:null,reading:null,writing:null,speaking:null};
  const byModuleTest={listening:null,reading:null,writing:null,speaking:null};
  (tests||[]).forEach(t=>{
    const m=normalizeModule(t.module), a=amap.get(t.id);
    if(!a || !['listening','reading','writing','speaking'].includes(m)) return;
    // If more than one test of the same module is assigned, use the latest submitted one.
    const prev=byModuleTest[m];
    const prevDate=prev?.attempt ? new Date(prev.attempt.submitted_at||prev.attempt.created_at||0) : new Date(0);
    const curDate=new Date(a.submitted_at||a.created_at||0);
    if(prev && prevDate>=curDate) return;
    let band=null;
    if(m==='listening' && a.listening_score!=null) band=bandFromRaw('listening',a.listening_score,getReadingType(t));
    if(m==='reading' && a.reading_score!=null) band=bandFromRaw('reading',a.reading_score,getReadingType(t));
    if(m==='writing' && a.writing_score!=null) band=Number(a.writing_score);
    if(m==='speaking' && a.speaking_score!=null) band=Number(a.speaking_score);
    byModule[m]=Number.isFinite(Number(band))?Number(band):null;
    byModuleTest[m]={test:t,attempt:a,band:byModule[m]};
  });
  return {scores:byModule, moduleTests:byModuleTest, overall:overallBandFromComponents(byModule.listening,byModule.reading,byModule.writing,byModule.speaking)};
}
async function studentDashboard(){
  setRoute("student-dashboard");
  const user=(await sb.auth.getUser()).data.user;
  const {data:access,error:accessErr}=await sb.from("student_test_access").select("test_id,allowed").eq("student_id",user.id).eq("allowed",true);
  if(accessErr)return alert(accessErr.message);
  const allowedIds=(access||[]).map(x=>x.test_id);
  let tests=[];
  if(allowedIds.length){const tq=await sb.from("tests").select("id,title,module,description,duration_minutes,total_questions,settings").eq("is_published",true).in("id",allowedIds).order("module");if(tq.error)return alert(tq.error.message);tests=tq.data||[]}
  const ids=tests.map(t=>t.id);
  let attempts=[];
  if(ids.length){const a=await sb.from("results").select("id,test_id,status,started_at,submitted_at,listening_score,reading_score,writing_score,speaking_score,created_at").eq("student_id",user.id).in("test_id",ids).order("created_at",{ascending:false});if(a.error)return alert(a.error.message);attempts=a.data||[]}
  for(const t of tests){if(normalizeModule(t.module)==="speaking"){try{await ensureSpeakingResult(t.id,user.id)}catch(e){console.warn("Could not initialize Speaking review:",e.message)}}}
  if(tests.some(t=>normalizeModule(t.module)==="speaking")){
    const refreshed=await sb.from("results").select("id,test_id,status,started_at,submitted_at,listening_score,reading_score,writing_score,speaking_score,created_at").eq("student_id",user.id).in("test_id",ids).order("created_at",{ascending:false});
    if(!refreshed.error)attempts=refreshed.data||attempts;
  }
  const overall=await getStudentOverallSummary(user.id,tests,attempts);
  const hasAny=Object.values(overall.moduleTests).some(Boolean);
  const overallButton=hasAny?`<div class="card" style="margin:14px 0 20px;border:2px solid #2563eb;background:linear-gradient(135deg,#eff6ff,#ffffff)"><div class="actions" style="justify-content:space-between;align-items:center"><div><div style="font-size:30px">🏆</div><h3 style="margin:4px 0">Overall Score</h3><p class="muted" style="margin:0">All submitted module results for your Student ID are combined here.</p></div><button class="btn primary" onclick="studentOverallResultsPage()">Check Overall Score</button></div></div>`:"";
  const latest=new Map();
  attempts.forEach(a=>{const prev=latest.get(a.test_id);if(!prev||a.status==="submitted"||(prev.status!=="submitted"&&new Date(a.created_at||0)>new Date(prev.created_at||0)))latest.set(a.test_id,a)});
  const testCards=tests.map(t=>{
    const a=latest.get(t.id),m=normalizeModule(t.module),icon=m==="listening"?"🎧":m==="reading"?"📖":m==="writing"?"✍️":"🗣️";
    if(m==="speaking")return `<div class="dashbtn"><div style="font-size:32px">${icon}</div><strong>${esc(t.title)}</strong><span class="muted">SPEAKING • Faculty Assessment</span><div style="margin-top:10px"><span class="status warning">${a?.speaking_score!=null?`Faculty Band: ${Number(a.speaking_score).toFixed(1)}`:`Faculty Score Pending / Assigned`}</span></div></div>`;
    let action=a?.status==="submitted"?`<div class="actions"><button class="btn primary" onclick="studentResultPage('${a.id}')">View Result</button><button class="btn secondary" onclick="startStudentTest('${t.id}',true)">View Submitted Test</button></div>`:a?.status==="in_progress"?`<button class="btn warning" onclick="startStudentTest('${t.id}',true)">Resume Test</button>`:`<button class="btn primary" onclick="startStudentTest('${t.id}',true)">Start Test</button>`;
    const status=a?.status==="submitted"?`<span class="status published">Completed</span>`:a?.status==="in_progress"?`<span class="status draft">In Progress</span>`:`<span class="status draft">Not Started</span>`;
    return `<div class="dashbtn"><div style="font-size:32px">${icon}</div><strong>${esc(t.title)}</strong><span class="muted">${m.toUpperCase()} • ${t.duration_minutes} min</span><div style="margin-top:10px">${status}</div><div class="actions" style="margin-top:10px">${action}</div></div>`;
  }).join("");
  shell(`<h2>Student Dashboard</h2><p class="muted">Complete your module tests. Writing and Speaking are finalized by Faculty.</p>
    ${overallButton}
    <h3 style="margin-top:22px">Module Tests</h3><div class="dashboard-grid">${testCards||`<div class="card">No published tests are available.</div>`}</div>`);
}

async function studentOverallResultsPage(){
  try{
    const user=(await sb.auth.getUser()).data.user;if(!user)throw new Error("Please login again.");
    const {data:access,error:accessErr}=await sb.from("student_test_access").select("test_id,allowed").eq("student_id",user.id).eq("allowed",true);
    if(accessErr)throw accessErr;
    const ids=(access||[]).map(x=>x.test_id);
    let tests=[];
    if(ids.length){const tq=await sb.from("tests").select("id,title,module,description,duration_minutes,total_questions,settings").eq("is_published",true).in("id",ids).order("module");if(tq.error)throw tq.error;tests=tq.data||[]}
    let attempts=[];
    if(ids.length){const a=await sb.from("results").select("id,test_id,status,started_at,submitted_at,listening_score,reading_score,writing_score,speaking_score,created_at").eq("student_id",user.id).in("test_id",ids).order("created_at",{ascending:false});if(a.error)throw a.error;attempts=a.data||[]}
    for(const t of tests){if(normalizeModule(t.module)==="speaking"){try{await ensureSpeakingResult(t.id,user.id)}catch(e){console.warn(e.message)}}}
    if(tests.some(t=>normalizeModule(t.module)==="speaking")){
      const a=await sb.from("results").select("id,test_id,status,started_at,submitted_at,listening_score,reading_score,writing_score,speaking_score,created_at").eq("student_id",user.id).in("test_id",ids).order("created_at",{ascending:false});
      if(!a.error)attempts=a.data||attempts;
    }
    const o=await getStudentOverallSummary(user.id,tests,attempts),s=o.scores,fmt=v=>v==null?"Pending":Number(v).toFixed(1);
    const complete=o.overall!=null;
    const moduleRows=["listening","reading","writing","speaking"].map(m=>{const x=o.moduleTests[m];const label=m[0].toUpperCase()+m.slice(1);return `<tr><td><strong>${label}</strong></td><td>${x?esc(x.test.title):"—"}</td><td>${x?.attempt?.submitted_at?new Date(x.attempt.submitted_at).toLocaleString():"Pending"}</td><td><strong>${fmt(s[m])}</strong></td><td>${x?.attempt?.id?`<button class="btn secondary" onclick="studentResultPage('${x.attempt.id}')">View Result</button>`:"—"}</td></tr>`}).join("");
    shell(`<div class="actions"><button class="btn secondary" onclick="studentDashboard()">← Dashboard</button></div><h2>🏆 My Overall IELTS Score</h2><p class="muted">Student ID: <strong>${esc(currentProfile?.student_code||user.id)}</strong></p>
      <div class="card" style="max-width:920px;margin:18px auto;text-align:center;border:2px solid #2563eb"><div style="font-size:44px">🏆</div><h2 style="margin:4px 0">${complete?"Overall IELTS Band":"TEST IN REVIEW"}</h2><div style="font-size:64px;font-weight:800;margin:10px 0">${complete?Number(o.overall).toFixed(1):"—"}</div><p class="muted">Overall is calculated only from submitted module results for this Student ID. Writing and Speaking must have their final Faculty bands.</p></div>
      <div class="dashboard-grid" style="grid-template-columns:repeat(4,minmax(0,1fr));margin:18px 0">${[["Listening",s.listening],["Reading",s.reading],["Writing",s.writing],["Speaking",s.speaking]].map(([n,v])=>`<div class="card" style="text-align:center"><strong>${n}</strong><div style="font-size:30px;margin-top:8px">${fmt(v)}</div></div>`).join("")}</div>
      <div class="card table-wrap"><h3>Submitted Tests Used for Overall Score</h3><table><thead><tr><th>Module</th><th>Test</th><th>Submitted</th><th>Band</th><th>Result</th></tr></thead><tbody>${moduleRows}</tbody></table></div>`);
  }catch(e){alert("Could not load Overall Score: "+(e.message||e))}
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
    let d=await loadTestBundle(id);
    if(normalizeModule(d.test.module)==="speaking"&&!preview)throw new Error("Speaking is a Faculty-assessment module. Please use Overall Results.");
if(!d.test.is_published&&!preview)throw new Error("This test is not published.");
    let saved=null,attempt=null,user=null,review=false;
    if(!preview){
      user=(await sb.auth.getUser()).data.user;
      if(!user)throw new Error("Please login again.");
      const existing=await sb.from("results").select("*").eq("student_id",user.id).eq("test_id",id).order("created_at",{ascending:false});
      if(existing.error)throw existing.error;
      const attemptsForTest=existing.data||[];
      // If any submitted attempt exists, it is the canonical attempt for review. Otherwise use the latest draft.
      attempt=attemptsForTest.find(x=>x.status==="submitted")||attemptsForTest[0]||null;
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
    let audioUrl=null;if(d.test.module==="listening"&&d.audio?.audio_path)audioUrl=await resolveListeningAudio(id,d.audio);
    if(d.sections?.length){for(const sec of d.sections){const raw=sec.image_path||sec.image_url;if(raw&&!String(raw).startsWith("http")){try{sec.image_url=await signed("question-images",raw)}catch(e){console.warn("Section image could not be signed",e)}}}}
    if(d.groups?.length){for(const g of d.groups){if(g.image_path){try{g.image_url=await signed("question-images",g.image_path)}catch(e){console.warn("Group image could not be signed",e)}}}}
    if(d.questions?.length){for(const q of d.questions){if(q.image_url&&!String(q.image_url).startsWith("http")){try{q.image_url=await signed("question-images",q.image_url)}catch(e){console.warn("Question image could not be signed",e)}}}}
    if(d.writingTasks?.length){
      for(const wt of d.writingTasks){
        const url=wt.media_url||((Array.isArray(wt.media)&&wt.media[0]?.url)||null);
        if(url&&!String(url).startsWith("http")){
          try{
            const signedUrl=await signed("question-images",url);
            wt.media_url=signedUrl;
            if(Array.isArray(wt.media)&&wt.media.length)wt.media=[{...wt.media[0],url:signedUrl}];
          }catch(e){console.warn("Writing task image could not be signed",e)}
        } else if(url){wt.media_url=url}
      }
    }
    let dbAnswers={};if(!preview&&attempt?.id)dbAnswers=await loadAttemptAnswers(attempt.id);
    if(!preview&&user&&d.test.module==='writing'){
      const wattempts=await loadWritingAttempts(id,user.id);
      for(const wa of wattempts){
        const wt=(d.writingTasks||[]).find(x=>Number(x.part)===Number(wa.part));
        if(wt)dbAnswers[`task_${wt.id}`]=String(wa.answer||'');
      }
    }
    const mergedAnswers={...(saved?.answers||{}),...dbAnswers};
    const endAt=preview?null:(attempt?.started_at?new Date(attempt.started_at).getTime()+d.test.duration_minutes*60000:(saved?.endAt||Date.now()+d.test.duration_minutes*60000));
    exam={preview,testId:id,studentId:preview?null:(user?.id||saved?.studentId),resultId:preview?null:(attempt?.id||saved?.resultId),data:d,currentSection:preview?0:(saved?.currentSection||0),currentTask:saved?.currentTask||0,answers:mergedAnswers,startedAt:attempt?.started_at||saved?.startedAt||new Date().toISOString(),endAt:review?null:endAt, audioUrl,locked:review||!!saved?.locked,review};
    if(!preview){setRoute("exam",{testId:id});saveExam();}
    if(review) stopStudentListeningAudio();
    renderExam();
    if(!preview&&!review&&endAt<=Date.now())return submitExam(true);
    if(!review) startTimer();
    if(mListening(exam)&&!review)initStudentListeningAudio(!preview);
  }catch(e){
    console.error("Student test load failed:",e);
    clearRoute();
    if(currentProfile?.role==="student"){
      alert(e.message||"Could not open the test.");
      try{await studentDashboard()}catch(_){/* keep the original error visible */}
    }else alert(e.message||"Could not open the test.");
  }
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
function setAns(k,v){if(!exam||exam.locked)return;if(!exam.answers||typeof exam.answers!=="object")exam.answers={};exam.answers[k]=v;saveExam();queueAnswerSave(k,v)}
function toggleAns(k,v,on){if(!exam||exam.locked)return;if(!exam.answers||typeof exam.answers!=="object")exam.answers={};let a=Array.isArray(exam.answers[k])?[...exam.answers[k]]:[];if(on&&!a.includes(v))a.push(v);if(!on)a=a.filter(x=>x!==v);exam.answers[k]=a;saveExam();queueAnswerSave(k,a)}
function switchExamSection(i){if(exam?.locked&&!exam?.review)return;exam.currentSection=Math.max(0,Math.min(i,exam.data.sections.length-1));saveExam();renderExam();window.scrollTo({top:0,behavior:"instant"});if(!exam?.review){startTimer();if(mListening(exam))initStudentListeningAudio(!exam.preview)}}
function switchTask(i){if(exam?.locked&&!exam?.review)return;exam.currentTask=Math.max(0,Math.min(i,1));saveExam();renderExam();window.scrollTo({top:0,behavior:"instant"});if(!exam?.review)startTimer()}
function tabs(label){return `<div class="section-tabs">${exam.data.sections.map((s,i)=>`<button class="btn ${i===exam.currentSection?"primary":"secondary"}" onclick="switchExamSection(${i})">${label} ${i+1}</button>`).join("")}</div>`}
function qnav(qs){return `<div class="qnav">${qs.map(q=>`<button class="${hasAns(q.id)?"done":""}" onclick="document.getElementById('q-${q.id}')?.scrollIntoView({behavior:'smooth'})">${q.question_number}</button>`).join("")}</div>`}
function hasAns(id){const v=exam?.answers?.[id];return Array.isArray(v)?v.length>0:String(v??"").trim()!==""}
function renderExamBase(){
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
  else if((["matching","map","headings","information","features","endings"].includes(t) || (COMPLETION_TYPES.includes(t)&&opts.length))&&opts.length){c=`<select onchange="setAns('${q.id}',this.value)" ${exam.locked?"disabled":""}><option value="">Select answer</option>${opts.map(o=>`<option value="${attr(o.option_key)}" ${s===o.option_key?"selected":""}>${esc(o.option_key)} — ${esc(o.option_text)}</option>`).join("")}</select>`}
  else c=`<input value="${attr(Array.isArray(s)?s.join(", "):s)}" oninput="setAns('${q.id}',this.value)" placeholder="Type your answer" ${exam.locked?"disabled":""}>`;
  return `<div id="q-${q.id}" class="question"><div class="student-rich" data-highlight-key="${attr(highlightKey("question",q.id))}"><strong>${q.question_number}. </strong>${richTextSanitize(q.question_text||"")}</div>${q.image_url?`<img class="media" src="${attr(q.image_url)}">`:""}<div style="margin-top:8px">${c}</div></div>`;
}
function examNav(){return `<div class="actions" style="justify-content:space-between;align-items:center;margin-top:14px"><button class="btn secondary" ${exam.currentSection===0?"disabled":""} onclick="switchExamSection(${exam.currentSection-1})">← Previous</button>${exam.review?`<div class="actions" style="align-items:center"><span class="status published">Submitted — Read Only Review</span>${exam.resultId?`<button class="btn primary" onclick="studentResultPage('${exam.resultId}')">View Your Score</button>`:""}</div>`:exam.locked?`<div class="actions" style="align-items:center"><span class="status warning">Submission completed</span>${exam.resultId?`<button class="btn primary" onclick="studentResultPage('${exam.resultId}')">View Your Score</button>`:""}</div>`:exam.currentSection<exam.data.sections.length-1?`<button class="btn primary" onclick="switchExamSection(${exam.currentSection+1})">Next →</button>`:`<button class="btn success" onclick="${exam.preview?"exitExam()":"submitExam(false)"}">${exam.preview?"Close Preview":"Submit Test"}</button>`}</div>`}
function renderWritingExam(){
  const tasks=(exam.data.writingTasks||[]).slice().sort((a,b)=>a.part-b.part),q=tasks[Math.min(exam.currentTask,tasks.length-1)];
  app().innerHTML=headerExam()+`<div class="shell"><div class="section-tabs">${tasks.map((x,i)=>`<button class="btn ${i===exam.currentTask?"primary":"secondary"}" onclick="switchTask(${i})">Task ${i+1}</button>`).join("")}</div>
  ${q?`<div class="writing-grid"><div class="pane"><h2>Writing Task ${q.part}</h2>${q.instructions?`<div class="instructions student-rich" data-highlight-key="${attr(highlightKey("writing-instructions",q.id))}">${richTextSanitize(q.instructions)}</div>`:""}${q.media_url?`<img class="media" src="${attr(q.media_url)}">`:""}<div class="student-rich" data-highlight-key="${attr(highlightKey("writing-prompt",q.id))}">${richTextSanitize(q.prompt||"")}</div></div>
  <div class="pane"><div class="actions" style="justify-content:space-between"><h3>Your Answer</h3><strong id="wc">0 words</strong></div><textarea class="writing-answer" id="wa" oninput="setWriting('task_${q.id}',this.value)" ${exam.locked?"disabled":""}>${esc(exam.answers['task_'+q.id]||"")}</textarea><p class="muted">Minimum: ${q.minimum|| (q.part===1?150:250)} words${q.maximum?` • Maximum: ${q.maximum}`:""}</p></div></div>`:`<div class="card">Writing tasks not configured.</div>`}
  <div class="actions" style="justify-content:space-between;margin-top:14px"><button class="btn secondary" ${exam.currentTask===0?"disabled":""} onclick="switchTask(${exam.currentTask-1})">← Previous Task</button>${exam.currentTask<tasks.length-1?`<button class="btn primary" onclick="switchTask(${exam.currentTask+1})">Next Task →</button>`:`<button class="btn success" onclick="${exam.preview?"exitExam()":"submitExam(false)"}">${exam.preview?"Close Preview":"Submit Writing Test"}</button>`}</div></div>`;
  setTimeout(restoreAndBindHighlights,0);
  updateWC();
}
function setWriting(id,v){
  if(!exam||exam.locked)return;
  exam.answers[id]=v;saveExam();
  const qid=String(id||'').replace(/^task_/,'');
  const wt=(exam.data.writingTasks||[]).find(x=>String(x.id)===qid);
  if(wt)queueWritingAttemptSave(Number(wt.part),v);
  updateWC();
}
function updateWC(){const v=$("wa")?.value||"",n=v.trim()?v.trim().split(/\s+/).length:0;if($("wc"))$("wc").textContent=n+" words"}

function norm(v){return String(v??"").trim().toLowerCase().replace(/\s+/g," ")}
function answerWords(v){const s=String(v??"").trim();return s?s.split(/\s+/).filter(Boolean).length:0}
function renderStudentRichAnswer(value,empty="—"){
  const raw=String(value??"");
  if(!raw.trim())return `<span class="muted">${esc(empty)}</span>`;
  return `<div class="student-rich">${richTextSanitize(raw)}</div>`;
}
function plainTextFromRich(value){
  const box=document.createElement('div');box.innerHTML=richTextSanitize(value||'');
  return (box.innerText||box.textContent||'').replace(/\u00a0/g,' ').replace(/\n{3,}/g,'\n\n').trim();
}

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
  if(!exam)return;
  if(exam.preview)return exitExam();
  if(exam.locked)return;
  const activeExam=exam;
  if(!activeExam.resultId) { alert("This test attempt could not be identified. Please return to the dashboard and resume the test."); return; }
  if(!auto&&!confirm("You can not change answers after submitting the test.\n\nAre you sure you want to submit?"))return;
  if(!activeExam.answers||typeof activeExam.answers!=="object")activeExam.answers={};
  stopStudentListeningAudio();
  try{
    activeExam.locked=true;saveExam();if(timerHandle)clearInterval(timerHandle);for(const t of answerSaveTimers.values())clearTimeout(t);answerSaveTimers.clear();
    const mod=activeExam.data.test.module;
    const qs=mod==="writing"?validModuleQuestions(activeExam.data):(mod==="listening"?listeningQuestions40(activeExam.data):readingQuestions40(activeExam.data));
    for(const q of qs){
      const key=mod==="writing"?`task_${q.question_config?.writingTaskId||q.id}`:q.id;
      const value=activeExam.answers[key]??"";
      const answerText=Array.isArray(value)?value.join(", "):String(value??"");
      const correct=mod==="writing"?null:evalQ(q,value);
      // IELTS Listening and Reading award exactly 1 mark per correct question.
      const marks=mod==="writing"?0:(correct?1:0);
      const {data:existing,error:findErr}=await sb.from("answers").select("id").eq("result_id",activeExam.resultId).eq("question_id",q.id).maybeSingle();if(findErr)throw findErr;
      const payload={result_id:activeExam.resultId,question_id:q.id,answer_text:answerText,is_correct:correct,marks_obtained:marks};
      if(existing?.id){const {error}=await sb.from("answers").update(payload).eq("id",existing.id);if(error)throw error}
      else {const {error}=await sb.from("answers").insert(payload);if(error)throw error}
    }
    if(mod==="writing"){
      const now=new Date().toISOString();
      for(const wt of (activeExam.data.writingTasks||[])){
        const key=`task_${wt.id}`;
        const finalAnswer=String(activeExam.answers[key]??"");
        await persistWritingAttempt(Number(wt.part),finalAnswer,true,now);
      }
    }
    const summary=mod==="writing"?null:calculateObjectiveScore(qs,activeExam.answers);
    const score=summary?.score??null;
    // Submit through a SECURITY DEFINER RPC so RLS cannot silently discard the status update.
    // The RPC verifies that the authenticated user owns the attempt and only changes submission fields.
    const {data:submittedResult,error:submitError}=await sb.rpc("submit_exam_result",{
      p_result_id:activeExam.resultId,
      p_listening_score:mod==="listening"?score:null,
      p_reading_score:mod==="reading"?score:null
    });
    if(submitError)throw submitError;
    if(!submittedResult || submittedResult.status!=="submitted") throw new Error("The test could not be marked as submitted.");
    const resultId=activeExam.resultId;clearExam(activeExam.testId,activeExam.studentId,activeExam.resultId);clearRoute();exam=null;
    // Submission is final: the test session is exited immediately and the calculated score is shown.
    // The dashboard will no longer offer Resume Test for this submitted attempt.
    await studentResultPage(resultId,true);
  }catch(e){
    console.error(e);
    if(exam===activeExam){activeExam.locked=false;saveExam();renderExam();}
    alert("Submission failed: "+(e?.message||e)+"\nYour answers are still saved. Please try Submit Test again.");
  }
}
function exitExam(){if(timerHandle)clearInterval(timerHandle);stopStudentListeningAudio();if(exam?.preview){exam=null;return openBuilder(admin.test.id)}saveExam();exam=null;clearRoute();studentDashboard()}


async function loadOverallForStudent(studentId,group){
  // Compatibility wrapper: Overall is now Student-ID based. The group argument is ignored.
  const {data:access,error:ae}=await sb.from("student_test_access").select("test_id,allowed").eq("student_id",studentId).eq("allowed",true);
  if(ae)throw ae;
  const ids=(access||[]).map(x=>x.test_id);
  let tests=[];
  if(ids.length){const tq=await sb.from("tests").select("id,title,module,settings,is_published").in("id",ids).eq("is_published",true).order("created_at",{ascending:true});if(tq.error)throw tq.error;tests=tq.data||[]}
  let results=[];
  if(ids.length){const rq=await sb.from("results").select("id,test_id,status,submitted_at,created_at,listening_score,reading_score,writing_score,speaking_score").eq("student_id",studentId).in("test_id",ids).order("created_at",{ascending:false});if(rq.error)throw rq.error;results=rq.data||[]}
  const summary=await getStudentOverallSummary(studentId,tests,results);
  const resultIds={};Object.entries(summary.moduleTests).forEach(([m,x])=>{if(x?.attempt?.id)resultIds[m]=x.attempt.id});
  return {group:"All Assigned Tests",tests,results:results.filter(r=>r.status==='submitted'),scores:summary.scores,resultIds,overall:summary.overall,moduleTests:summary.moduleTests};
}
async function studentOverallResult(group){
  try{
    const user=(await sb.auth.getUser()).data.user;if(!user)throw new Error("Please login again.");
    await studentOverallResultsPage();
  }catch(e){alert("Could not load Overall Result: "+e.message)}
}
async function overallResultsPage(){
  try{
    setRoute("overall-results");
    const {data:tests,error:te}=await sb.from("tests").select("id,title,module,settings,is_published").order("created_at",{ascending:true});if(te)throw te;
    const {data:results,error:re}=await sb.from("results").select("id,student_id,test_id,status,submitted_at,created_at,listening_score,reading_score,writing_score,speaking_score").order("created_at",{ascending:false});if(re)throw re;
    const studentIds=[...new Set((results||[]).map(r=>r.student_id).filter(Boolean))];
    let profiles=[];if(studentIds.length){const p=await sb.from("profiles").select("id,full_name,student_code").in("id",studentIds);if(p.error)throw p.error;profiles=p.data||[]}
    const pm=new Map(profiles.map(p=>[p.id,p]));
    const tmap=new Map((tests||[]).map(t=>[t.id,t]));
    const rows=[];
    for(const studentId of studentIds){
      const stTests=(tests||[]).filter(t=>results.some(r=>r.student_id===studentId&&r.test_id===t.id));
      const stResults=results.filter(r=>r.student_id===studentId);
      const summary=await getStudentOverallSummary(studentId,stTests,stResults);
      const s=summary.scores;
      rows.push(`<tr><td><strong>${esc(pm.get(studentId)?.full_name||studentId)}</strong><br><small>${esc(pm.get(studentId)?.student_code||"")}</small></td><td>${s.listening==null?"Pending":Number(s.listening).toFixed(1)}</td><td>${s.reading==null?"Pending":Number(s.reading).toFixed(1)}</td><td>${s.writing==null?"Pending":Number(s.writing).toFixed(1)}</td><td>${s.speaking==null?"Pending":Number(s.speaking).toFixed(1)}</td><td><strong>${summary.overall==null?"TEST IN REVIEW":Number(summary.overall).toFixed(1)}</strong></td><td><button class="btn primary" onclick="overallResultDetails('${studentId}')">Open</button></td></tr>`);
    }
    shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button></div><h2>Overall IELTS Results</h2><p class="muted">One Overall Result per Student ID. Only submitted module results are used; Writing and Speaking require final Faculty bands.</p><div class="card table-wrap"><table><thead><tr><th>Student</th><th>Listening</th><th>Reading</th><th>Writing</th><th>Speaking</th><th>Overall</th><th>Action</th></tr></thead><tbody>${rows.join("")||`<tr><td colspan="7">No student results found.</td></tr>`}</tbody></table></div>`);
  }catch(e){alert("Could not load Overall Results: "+e.message)}
}
async function overallResultDetails(studentId,group){
  try{
    const o=await loadOverallForStudent(studentId,group),p=(await sb.from("profiles").select("full_name,student_code").eq("id",studentId).single()).data;
    const wr=o.moduleTests?.writing?.attempt,sp=o.moduleTests?.speaking?.attempt,s=o.scores;
    const moduleButton=(mod,label)=>o.resultIds[mod]?`<button class="btn secondary" onclick="resultDetails('${o.resultIds[mod]}')">${label} Details</button>`:`<button class="btn secondary" disabled>${label} Pending</button>`;
    shell(`<div class="actions"><button class="btn secondary" onclick="overallResultsPage()">← Overall Results</button></div><h2>${esc(p?.full_name||studentId)}</h2><p class="muted">Student ID: ${esc(p?.student_code||studentId)} • One consolidated result</p>
      <div class="dashboard-grid" style="grid-template-columns:repeat(5,minmax(0,1fr));margin:14px 0">${[["Listening",s.listening],["Reading",s.reading],["Writing",s.writing],["Speaking",s.speaking],["Overall",o.overall]].map(([n,v])=>`<div class="card"><strong>${n}</strong><div style="font-size:28px;margin-top:6px">${v==null?"Pending":Number(v).toFixed(1)}</div></div>`).join("")}</div>
      <div class="card"><h3>Submitted Module Results</h3><p class="muted">The Overall score uses the latest submitted test for each IELTS module assigned to this Student ID.</p><div class="actions">${moduleButton("listening","Listening")}${moduleButton("reading","Reading")}${moduleButton("writing","Writing")}${moduleButton("speaking","Speaking")}</div></div>
      <div class="card"><h3>Writing Faculty Score</h3><p class="muted">${wr?`Writing submission: <strong>${esc(o.moduleTests.writing.test.title)}</strong>. Enter or update the final Writing band.`:"No submitted Writing test found."}</p><input id="overallWritingBand" type="number" step="0.5" min="0" max="9" value="${wr?.writing_score??""}" ${wr?"":"disabled"}><div class="actions" style="margin-top:10px"><button class="btn primary" onclick="saveOverallWritingScore('${wr?.id||""}','${studentId}')" ${wr?"":"disabled"}>Save Writing Score</button></div></div>
      <div class="card"><h3>Speaking Faculty Score</h3><p class="muted">${sp?`Speaking test: <strong>${esc(o.moduleTests.speaking.test.title)}</strong>. Enter the final Speaking band.`:"No submitted/assigned Speaking test found."}</p><input id="overallSpeakingBand" type="number" step="0.5" min="0" max="9" value="${sp?.speaking_score??""}"><div class="actions" style="margin-top:10px"><button class="btn primary" onclick="saveOverallSpeakingScore('${sp?.id||""}','${o.moduleTests?.speaking?.test?.id||""}','${studentId}')">Save Speaking Score</button></div></div>
      <div class="card" style="text-align:center"><h3>Overall IELTS Band</h3><div style="font-size:44px;font-weight:800">${o.overall==null?"TEST IN REVIEW":Number(o.overall).toFixed(1)}</div><p class="muted">Overall is calculated automatically from the submitted Listening, Reading, Writing and Speaking bands for this Student ID.</p></div>`);
  }catch(e){alert("Could not open Overall Result: "+e.message)}
}
async function saveOverallWritingScore(resultId,studentId,group){
  try{const v=Number($("overallWritingBand").value);if(!Number.isFinite(v)||v<0||v>9||Math.round(v*2)!==v*2)throw new Error("Enter a valid Writing band from 0 to 9 in 0.5 steps.");if(!resultId)throw new Error("Writing result not found.");const {error}=await sb.from("results").update({writing_score:v,writing_score_source:"faculty"}).eq("id",resultId);if(error)throw error;alert("Writing score saved. Overall result updated.");overallResultDetails(studentId)}catch(e){alert("Could not save Writing score: "+e.message)}
}
async function saveOverallSpeakingScore(resultId,testId,studentId,group){
  try{const v=Number($("overallSpeakingBand").value);if(!Number.isFinite(v)||v<0||v>9||Math.round(v*2)!==v*2)throw new Error("Enter a valid Speaking band from 0 to 9 in 0.5 steps.");let rid=resultId;if(rid){const {error}=await sb.from("results").update({speaking_score:v,speaking_score_source:"faculty",status:"submitted",submitted_at:new Date().toISOString()}).eq("id",rid);if(error)throw error}else{if(!testId)throw new Error("Speaking test is not configured for this Student ID.");const {data:user}=await sb.auth.getUser();if(!user?.user)throw new Error("Faculty session not found.");const ins=await sb.from("results").insert({student_id:studentId,test_id:testId,status:"submitted",speaking_score:v,speaking_score_source:"faculty",submitted_at:new Date().toISOString()}).select("id").single();if(ins.error)throw ins.error}alert("Speaking score saved. Overall result updated.");overallResultDetails(studentId)}catch(e){alert("Could not save Speaking score: "+e.message)}
}
async function renderStudentWritingResultCard(result){
  const band=result.writing_score==null?'Pending':Number(result.writing_score).toFixed(1);
  return `<div class="card"><strong>Final Writing Band</strong><div style="font-size:34px;margin-top:6px">${band}</div><p class="muted">Writing result is evaluated by Faculty.</p></div>`;
}
async function studentResultPage(resultId,justSubmitted=false){
  try{
    const {data:r,error:re}=await sb.from("results").select("*,tests(title,module,total_questions,settings)").eq("id",resultId).single();if(re)throw re;
    const mod=normalizeModule(r.tests?.module);let raw=mod==="listening"?r.listening_score:mod==="reading"?r.reading_score:mod==="writing"?r.writing_score:mod==="speaking"?r.speaking_score:null;if(r.status==="submitted"&&(mod==="listening"||mod==="reading")) raw=await recalculateStoredScore(r);const readingType=getReadingType(r.tests);const band=(mod==="listening"||mod==="reading")?scoreBand(mod,raw,readingType):raw;
    shell(`<div class="actions"><button class="btn secondary" onclick="studentDashboard()">← Dashboard</button></div><div class="card" style="max-width:760px;margin:20px auto;text-align:center">
      <div style="font-size:52px">✅</div><h2>${justSubmitted?"Test Submitted":"Test Result"}</h2><h3>${esc(r.tests?.title||"")}</h3>
      ${mod==="writing"?await renderStudentWritingResultCard(r):`<div class="dashboard-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:18px"><div class="card"><strong>${mod==="speaking"?"Faculty Band":"Score"}</strong><div style="font-size:34px;margin-top:6px">${esc(raw??"-")}${mod==="listening"||mod==="reading"?" / 40":""}</div></div><div class="card"><strong>Band Score</strong><div style="font-size:34px;margin-top:6px">${esc(band==null?"Pending":Number(band).toFixed(1))}</div></div></div>`}
      <div class="actions" style="justify-content:center;margin-top:20px"><button class="btn secondary" onclick="studentReviewAnswers('${r.id}')">View My Saved Answers</button><button class="btn primary" onclick="studentOverallResultsPage()">View Overall Score</button><button class="btn primary" onclick="studentDashboard()">Back to Dashboard</button></div>
    </div>`);
  }catch(e){alert("Could not load result: "+e.message)}
}
async function studentReviewAnswers(resultId){
  try{
    const {data:r,error:re}=await sb.from("results").select("*,tests(title,module,id,settings)").eq("id",resultId).single();if(re)throw re;
    const d=await loadTestBundle(r.test_id);
    const mod=normalizeModule(r.tests?.module);
    if(mod==="writing"){
      const wa=await sb.from('writing_attempts').select('*').eq('test_id',r.test_id).eq('student_id',r.student_id).order('part');
      if(wa.error)throw wa.error;
      const attempts=wa.data||[];
      const cards=(d.writingTasks||[]).slice().sort((a,b)=>a.part-b.part).map(wt=>{
        const a=attempts.find(x=>Number(x.part)===Number(wt.part));
        return `<div class="card"><h3>Task ${wt.part} — Submitted Answer</h3>${wt.prompt?`<p class="muted">${esc(wt.prompt)}</p>`:""}${renderStudentRichAnswer(a?.answer)}<p class="muted">Word Count: ${Number(a?.word_count||0)} • ${a?.locked?"Locked":"Saved"}</p></div>`;
      }).join("");
      shell(`<div class="actions"><button class="btn secondary" onclick="studentDashboard()">← Dashboard</button></div><h2>Submitted Writing Review</h2><p class="muted">${esc(r.tests?.title||"")} • Submitted and read-only. Your original Task 1 and Task 2 answers are preserved.</p>${cards||`<div class="card">No writing submissions found.</div>`}`);
      return;
    }
    const qs=mod==="listening"?listeningQuestions40(d):readingQuestions40(d);
    const qids=qs.map(q=>q.id);
    let ans=[];
    if(qids.length){const a=await sb.from("answers").select("*").eq("result_id",resultId).in("question_id",qids);if(a.error)throw a.error;ans=a.data||[]}
    const am=new Map(ans.map(a=>[a.question_id,a]));
    const rows=qs.map(q=>{
      const a=am.get(q.id);const given=String(a?.answer_text??"").trim();const stored=deserializeStoredAnswer(q,a?.answer_text);const correct=(Array.isArray(stored)?stored.length>0:!!given)&&evalQ(q,stored);
      return `<tr><td><strong>Q${esc(q.question_number)}</strong></td><td>${esc(q.question_text||"")}</td><td>${esc(given||"—")}</td><td>${esc(q.correct_answer||"—")}</td><td>${esc((q.question_config?.acceptedAnswers||[]).join(" / ")||"—")}</td><td><span class="status ${!given?"warning":correct?"success":"danger"}">${!given?"Not Answered":correct?"Correct":"Wrong"}</span></td></tr>`;
    }).join("");
    const raw=await recalculateStoredScore(r);const band=scoreBand(mod,raw,getReadingType(r.tests));
    shell(`<div class="actions"><button class="btn secondary" onclick="studentResultPage('${r.id}')">← Score</button><button class="btn primary" onclick="studentDashboard()">Dashboard</button></div><h2>Submitted Test Review</h2><p class="muted">${esc(r.tests?.title||"")} • Submitted and read-only. You can review your saved answers, but you cannot start a new attempt for this test.</p><div class="dashboard-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin:14px 0"><div class="card"><strong>Raw Score</strong><div style="font-size:30px;margin-top:6px">${esc(raw??"-")} / 40</div></div><div class="card"><strong>Band</strong><div style="font-size:30px;margin-top:6px">${esc(band==null?"—":Number(band).toFixed(1))}</div></div></div><div class="card table-wrap"><table><thead><tr><th>Q</th><th>Question</th><th>My Answer</th><th>Correct Answer</th><th>Alternative Accepted</th><th>Status</th></tr></thead><tbody>${rows||`<tr><td colspan="6">No questions configured.</td></tr>`}</tbody></table></div>`);
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
async function downloadTextFile(filename,text,mime='text/plain'){
  const blob=new Blob([text],{type:mime+';charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function downloadWritingSubmission(resultId,studentName,testTitle,task1,task2,mode='all'){
  try{
    const {data:r,error:re}=await sb.from('results').select('id,test_id,student_id').eq('id',resultId).single();
    if(re)throw re;
    const {data:attempts,error:ae}=await sb.from('writing_attempts').select('*').eq('test_id',r.test_id).eq('student_id',r.student_id).order('part');
    if(ae)throw ae;
    const {data:tasks,error:te}=await sb.from('writing_tasks').select('*').eq('test_id',r.test_id).order('part');
    if(te)throw te;
    const safe=s=>String(s||'').replace(/[^a-z0-9._-]+/gi,'_').replace(/^_+|_+$/g,'')||'student';
    const chosen=(tasks||[]).filter(t=>mode==='all'||Number(t.part)===(mode==='task1'?1:2));
    const sections=chosen.map(t=>{
      const a=(attempts||[]).find(x=>Number(x.part)===Number(t.part));
      return `<section><h2>Task ${t.part}</h2><h3>${richTextSanitize(t.title||t.task_type||`Writing Task ${t.part}`)}</h3>${t.instructions?`<div class="instructions">${richTextSanitize(t.instructions)}</div>`:''}<div class="prompt"><strong>Prompt</strong><div>${richTextSanitize(t.prompt||'')}</div></div><p><strong>Word Count:</strong> ${Number(a?.word_count||0)}</p><div class="answer"><h3>Student Answer</h3>${richTextSanitize(a?.answer||'<p>No answer submitted.</p>')}</div></section>`;
    }).join('<hr>');
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>${esc(testTitle)} - Writing</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;line-height:1.65;color:#111}h1{font-size:24px}h2{font-size:20px;margin-top:28px}.instructions,.prompt,.answer{padding:14px;border:1px solid #ddd;border-radius:8px;margin:12px 0}.answer{background:#fafafa}.answer p{margin:0 0 10px}.meta{color:#555;font-size:13px}hr{border:0;border-top:1px solid #ddd;margin:30px 0}</style></head><body><h1>${esc(testTitle||'Writing Test')}</h1><p class="meta"><strong>Student:</strong> ${esc(studentName||'Student')}</p>${sections}</body></html>`;
    const suffix=mode==='task1'?'Task1':mode==='task2'?'Task2':'Writing';
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`${safe(studentName)}_${safe(testTitle)}_${suffix}.html`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){alert('Could not download Writing submission: '+e.message)}
}
async function saveWritingFacultyEvaluation(resultId,testId,studentId){
  try{
    const rows=await sb.from('writing_attempts').select('*').eq('test_id',testId).eq('student_id',studentId).order('part');
    if(rows.error)throw rows.error;
    const t1=Number($('wtTask1Band')?.value);const t2=Number($('wtTask2Band')?.value);const final=Number($('wtFinalBand')?.value);
    if(Number.isFinite(t1)){const r=(rows.data||[]).find(x=>Number(x.part)===1);if(r){const u=await sb.from('writing_attempts').update({band_score:t1,evaluation_status:'evaluated',updated_at:new Date().toISOString()}).eq('id',r.id);if(u.error)throw u.error}}
    if(Number.isFinite(t2)){const r=(rows.data||[]).find(x=>Number(x.part)===2);if(r){const u=await sb.from('writing_attempts').update({band_score:t2,evaluation_status:'evaluated',updated_at:new Date().toISOString()}).eq('id',r.id);if(u.error)throw u.error}}
    if(Number.isFinite(final)){const u=await sb.from('results').update({writing_score:final,writing_score_source:'faculty'}).eq('id',resultId);if(u.error)throw u.error}
    alert('Writing evaluation saved.');
    resultDetails(resultId);
  }catch(e){alert('Could not save writing evaluation: '+e.message)}
}

async function resultsPage(){
  try{
    setRoute("results");
    const {data:tests,error:te}=await sb.from("tests").select("id,title,module,total_questions,settings,is_published").order("created_at",{ascending:true});
    if(te)throw te;
    const {data:results,error:re}=await sb.from("results").select("id,student_id,test_id,status,created_at,submitted_at,listening_score,reading_score,writing_score,speaking_score").order("created_at",{ascending:false});
    if(re)throw re;
    const studentIds=[...new Set((results||[]).map(r=>r.student_id).filter(Boolean))];
    let profiles=[];
    if(studentIds.length){
      const p=await sb.from("profiles").select("id,full_name,student_code,role,active,created_at").in("id",studentIds);
      if(p.error)throw new Error("Could not load student names: "+p.error.message);
      profiles=p.data||[];
    }
    const pm=new Map(profiles.map(x=>[x.id,x]));
    const rows=[];
    for(const studentId of studentIds){
      const stTests=(tests||[]).filter(t=>results.some(r=>r.student_id===studentId&&r.test_id===t.id));
      const stResults=results.filter(r=>r.student_id===studentId);
      const summary=await getStudentOverallSummary(studentId,stTests,stResults);
      const s=summary.scores;
      const p=pm.get(studentId),name=p?.full_name||studentId||"Unknown Student";
      const status=summary.overall!=null?`<span class="status success">Complete</span>`:`<span class="status draft">In Review</span>`;
      rows.push(`<tr>
        <td><strong>${esc(name)}</strong><br><small>${esc(p?.student_code||"")}</small></td>
        <td>${s.listening==null?"—":Number(s.listening).toFixed(1)}</td>
        <td>${s.reading==null?"—":Number(s.reading).toFixed(1)}</td>
        <td>${s.writing==null?"—":Number(s.writing).toFixed(1)}</td>
        <td>${s.speaking==null?"—":Number(s.speaking).toFixed(1)}</td>
        <td><strong style="font-size:18px">${summary.overall==null?"—":Number(summary.overall).toFixed(1)}</strong></td>
        <td>${status}</td>
        <td><button class="btn primary" onclick="overallResultDetails('${studentId}')">Open Result</button></td>
      </tr>`);
    }
    rows.sort((a,b)=>a.localeCompare(b));
    shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button></div>
      <h2>Student Results</h2>
      <p class="muted">One consolidated entry per <strong>Student ID</strong>. Scores are taken only from submitted module tests and the Overall Band is calculated from the four module bands.</p>
      <p class="muted">Individual test attempts remain separate in the database for answer/history isolation. Open a student to see the submitted module results and Faculty scoring.</p>
      <div class="card table-wrap"><table><thead><tr>
        <th>Student</th><th>Listening</th><th>Reading</th><th>Writing</th><th>Speaking</th><th>Overall</th><th>Status</th><th>Details</th>
      </tr></thead><tbody>${rows.join("")||`<tr><td colspan="8">No results.</td></tr>`}</tbody></table></div>`);
  }catch(e){alert("Could not load Student Results: "+(e.message||e))}
}

async function resultDetails(resultId){
  try{
    const {data:r,error:re}=await sb.from("results").select("*,tests(title,module,total_questions,settings)").eq("id",resultId).single();
    if(re)throw re;
    const {data:p,error:pe}=await sb.from("profiles").select("id,full_name,role,active").eq("id",r.student_id).single();
    if(pe)throw pe;
    const d=await loadTestBundle(r.test_id);
    const mod=normalizeModule(r.tests?.module||d.test?.module||"");
    if(mod==="writing"){
      const wa=await sb.from('writing_attempts').select('*').eq('test_id',r.test_id).eq('student_id',r.student_id).order('part');
      if(wa.error)throw wa.error;
      const attempts=wa.data||[];
      const t1=attempts.find(x=>Number(x.part)===1),t2=attempts.find(x=>Number(x.part)===2);
      const task1=(d.writingTasks||[]).find(x=>Number(x.part)===1),task2=(d.writingTasks||[]).find(x=>Number(x.part)===2);
      const studentName=p.full_name||r.student_id||'Student';
      shell(`<div class="actions"><button class="btn secondary" onclick="resultsPage()">← Results</button><button class="btn danger" onclick="deleteResult('${r.id}')">Delete Result</button></div>
      <h2>${esc(studentName)}</h2><p class="muted"><strong>${esc(r.tests?.title||"")}</strong> • WRITING${r.submitted_at?` • Submitted ${new Date(r.submitted_at).toLocaleString()}`:""}</p>
      <div class="dashboard-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin:14px 0"><div class="card"><strong>Final Writing Band</strong><div style="font-size:26px;margin-top:6px">${r.writing_score==null?"Pending":Number(r.writing_score).toFixed(1)}</div><small>Source: ${esc(r.writing_score_source||'pending')}</small></div><div class="card"><strong>Status</strong><div style="font-size:26px;margin-top:6px">${esc(r.status||"")}</div></div></div>
      <div class="card"><h3>Task 1 — Original Student Answer</h3><div class="muted">${task1?.prompt?richTextSanitize(task1.prompt):''}</div>${renderStudentRichAnswer(t1?.answer)}<p class="muted">Word Count: ${Number(t1?.word_count||0)} • Evaluation: ${esc(t1?.evaluation_status||"pending")}</p><div class="actions"><button class="btn secondary" onclick="downloadWritingSubmission('${r.id}','${attr(studentName)}','${attr(r.tests?.title||'')}','','','task1')">Download Task 1</button></div></div>
      <div class="card"><h3>Task 2 — Original Student Answer</h3><div class="muted">${task2?.prompt?richTextSanitize(task2.prompt):''}</div>${renderStudentRichAnswer(t2?.answer)}<p class="muted">Word Count: ${Number(t2?.word_count||0)} • Evaluation: ${esc(t2?.evaluation_status||"pending")}</p><div class="actions"><button class="btn secondary" onclick="downloadWritingSubmission('${r.id}','${attr(studentName)}','${attr(r.tests?.title||'')}','','','task2')">Download Task 2</button></div></div>
      <div class="card"><h3>Download Complete Writing</h3><p class="muted">Downloads the student's original Task 1 and Task 2 answers with rich formatting preserved.</p><div class="actions"><button class="btn secondary" onclick="downloadWritingSubmission('${r.id}','${attr(studentName)}','${attr(r.tests?.title||'')}','','','all')">Download Complete Writing</button></div></div>
      <div class="card"><h3>Faculty Evaluation</h3><div class="grid"><div><label>Task 1 Band</label><input id="wtTask1Band" type="number" step="0.5" min="0" max="9" value="${t1?.band_score??''}"></div><div><label>Task 2 Band</label><input id="wtTask2Band" type="number" step="0.5" min="0" max="9" value="${t2?.band_score??''}"></div><div><label>Final Writing Band</label><input id="wtFinalBand" type="number" step="0.5" min="0" max="9" value="${r.writing_score??''}"></div></div><p class="muted">Faculty can manually evaluate Task 1, Task 2 and the Final Writing Band. Faculty scores are not overwritten by any automated assessment.</p><div class="actions" style="margin-top:12px"><button class="btn primary" onclick="saveWritingFacultyEvaluation('${r.id}','${r.test_id}','${r.student_id}')">Save Faculty Evaluation</button></div></div>`);
      return;
    }
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



/* =========================================================
   V13.0 PROPER IELTS EXAM-SET ARCHITECTURE
   Student ID identifies the student. exam_set_id identifies one
   IELTS mock/exam. The four module results are calculated only
   inside the same exam set.
   ========================================================= */
function v13ModuleLabel(m){return m==='listening'?'Listening':m==='reading'?'Reading':m==='writing'?'Writing':'Speaking'}
function v13Icon(m){return m==='listening'?'🎧':m==='reading'?'📖':m==='writing'?'✍️':'🗣️'}
function v13RoundBand(v){const n=Number(v);if(!Number.isFinite(n))return null;return Math.round(n*2)/2}
function v13WritingFinalBand(t1,t2){
  const a=Number(t1),b=Number(t2);
  if(!Number.isFinite(a)||!Number.isFinite(b))return null;
  // IELTS Writing Task 2 carries double weighting.
  return v13RoundBand((a+(b*2))/3);
}
async function v13GetExamSet(id){
  const {data,error}=await sb.from('exam_sets').select('*').eq('id',id).single();
  if(error)throw error;
  const [mods,students]=await Promise.all([
    sb.from('exam_set_modules').select('id,exam_set_id,module,test_id').eq('exam_set_id',id),
    sb.from('student_exam_sets').select('id,exam_set_id,student_id,assigned_at').eq('exam_set_id',id)
  ]);
  if(mods.error)throw mods.error;if(students.error)throw students.error;
  const tids=(mods.data||[]).map(x=>x.test_id), sids=(students.data||[]).map(x=>x.student_id);
  let tests=[],profiles=[];
  if(tids.length){const q=await sb.from('tests').select('id,title,module,is_published,duration_minutes,total_questions,settings').in('id',tids);if(q.error)throw q.error;tests=q.data||[]}
  if(sids.length){const q=await sb.from('profiles').select('id,student_code,full_name,active').in('id',sids);if(q.error)throw q.error;profiles=q.data||[]}
  const tm=new Map(tests.map(x=>[x.id,x])), pm=new Map(profiles.map(x=>[x.id,x]));
  return {...data,modules:mods.data||[],assignments:students.data||[],tests,profiles,tm,pm};
}
async function examSetsPage(){
  try{
    setRoute('exam-sets');
    const {data:sets,error}=await sb.from('exam_sets').select('*').order('created_at',{ascending:false});if(error)throw error;
    const ids=(sets||[]).map(x=>x.id);let mods=[],assign=[];
    if(ids.length){const a=await sb.from('exam_set_modules').select('exam_set_id,module,test_id').in('exam_set_id',ids);if(a.error)throw a.error;mods=a.data||[];const b=await sb.from('student_exam_sets').select('exam_set_id,student_id').in('exam_set_id',ids);if(b.error)throw b.error;assign=b.data||[]}
    const tids=[...new Set(mods.map(x=>x.test_id))];let tests=[];if(tids.length){const q=await sb.from('tests').select('id,title,module').in('id',tids);if(q.error)throw q.error;tests=q.data||[]}
    const tm=new Map(tests.map(x=>[x.id,x]));
    const rows=(sets||[]).map(es=>{const mm=mods.filter(x=>x.exam_set_id===es.id);const aa=assign.filter(x=>x.exam_set_id===es.id);const labels=['listening','reading','writing','speaking'].map(m=>{const x=mm.find(z=>z.module===m);return x?`${v13Icon(m)} ${esc(tm.get(x.test_id)?.title||'')}`:`${v13Icon(m)} —`;}).join('<br>');return `<tr><td><strong>${esc(es.title)}</strong><br><small>${esc(es.description||'')}</small></td><td>${labels}</td><td>${aa.length}</td><td>${es.is_published?'<span class="status published">Published</span>':'<span class="status draft">Draft</span>'}</td><td><div class="actions"><button class="btn secondary" onclick="editExamSet('${es.id}')">Edit</button><button class="btn ${es.is_published?'warning':'success'}" onclick="toggleExamSet('${es.id}',${!es.is_published})">${es.is_published?'Unpublish':'Publish'}</button><button class="btn danger" onclick="deleteExamSet('${es.id}')">Delete</button></div></td></tr>`}).join('');
    shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button><button class="btn primary" onclick="newExamSetForm()">+ Create IELTS Mock / Exam</button></div><h2>IELTS Mock / Exam Sets</h2><p class="muted">One Exam Set = one IELTS attempt. It links exactly one Listening, Reading, Writing and Speaking assessment for each assigned Student ID.</p><div class="notice"><strong>Important:</strong> Overall Band is calculated only inside the same Exam Set. A student's Mock 01 scores can never mix with Mock 02.</div><div class="card table-wrap"><table><thead><tr><th>Exam Set</th><th>Modules</th><th>Students</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows||'<tr><td colspan="5">No Exam Sets created yet.</td></tr>'}</tbody></table></div>`);
  }catch(e){alert('Could not load Exam Sets: '+(e.message||e))}
}
async function newExamSetForm(existingId=null){
  try{
    const es=existingId?await v13GetExamSet(existingId):null;
    const tq=await sb.from('tests').select('id,title,module,is_published').order('created_at',{ascending:false});if(tq.error)throw tq.error;
    const pq=await sb.from('profiles').select('id,student_code,full_name,active').eq('role','student').order('full_name');if(pq.error)throw pq.error;
    const tests=tq.data||[], students=pq.data||[], selected=new Map((es?.modules||[]).map(x=>[x.module,x.test_id])), assigned=new Set((es?.assignments||[]).map(x=>x.student_id));
    const select=(m)=>`<select id="esTest_${m}"><option value="">— No ${v13ModuleLabel(m)} test —</option>${tests.filter(t=>normalizeModule(t.module)===m).map(t=>`<option value="${t.id}" ${selected.get(m)===t.id?'selected':''}>${esc(t.title)}${t.is_published?'':' (Draft)'}</option>`).join('')}</select>`;
    shell(`<div class="actions"><button class="btn secondary" onclick="examSetsPage()">← Exam Sets</button></div><h2>${es?'Edit':'Create'} IELTS Mock / Exam</h2><div class="card"><div class="grid"><div><label>Exam / Mock Name</label><input id="esTitle" value="${attr(es?.title||'Academic Mock Test 01')}" placeholder="e.g. Academic Mock Test 01"></div><div><label>Description</label><input id="esDesc" value="${attr(es?.description||'')}" placeholder="Optional description"></div></div><div class="notice">Select the exact four module tests that belong to this one Overall Result. Speaking is Faculty Assessment and is not a timed student test.</div><div class="grid"><div><label>🎧 Listening Test</label>${select('listening')}</div><div><label>📖 Reading Test</label>${select('reading')}</div><div><label>✍️ Writing Test</label>${select('writing')}</div><div><label>🗣️ Speaking Assessment</label>${select('speaking')}</div></div><h3>Assign Students</h3><div class="actions" style="margin-bottom:10px"><button class="btn secondary" type="button" onclick="v13SelectAllStudents(true)">Select All</button><button class="btn secondary" type="button" onclick="v13SelectAllStudents(false)">Clear All</button></div><div class="grid3" id="esStudents">${students.map(s=>`<label style="display:flex;gap:8px;align-items:center;font-weight:600"><input class="esStudent" type="checkbox" value="${s.id}" ${assigned.has(s.id)?'checked':''} style="width:auto"><span>${esc(s.student_code||'')} — ${esc(s.full_name||'')}</span></label>`).join('')||'No students created yet.'}</div><div class="actions" style="margin-top:18px"><button class="btn primary" onclick="saveExamSet('${existingId||''}')">💾 ${es?'Save Exam Set':'Create Exam Set'}</button></div></div>`);
  }catch(e){alert('Could not open Exam Set form: '+(e.message||e))}
}
function v13SelectAllStudents(on){document.querySelectorAll('.esStudent').forEach(x=>x.checked=!!on)}
async function saveExamSet(id=''){
  try{
    const title=$('esTitle').value.trim(),description=$('esDesc').value.trim();if(!title)throw new Error('Enter an Exam / Mock name.');
    const modules=['listening','reading','writing','speaking'].map(m=>({module:m,test_id:$('esTest_'+m)?.value||null})).filter(x=>x.test_id);
    if(modules.length!==4)throw new Error('An IELTS Exam Set must contain exactly one Listening, Reading, Writing and Speaking test.');
    const studentIds=[...document.querySelectorAll('.esStudent:checked')].map(x=>x.value);if(!studentIds.length)throw new Error('Assign at least one student.');
    const uid=(await sb.auth.getUser()).data.user?.id;if(!uid)throw new Error('Faculty session expired.');
    let setId=id;
    if(id){const u=await sb.from('exam_sets').update({title,description,updated_at:new Date().toISOString()}).eq('id',id);if(u.error)throw u.error;await sb.from('exam_set_modules').delete().eq('exam_set_id',id);await sb.from('student_exam_sets').delete().eq('exam_set_id',id)}
    else{const c=await sb.from('exam_sets').insert({title,description,created_by:uid,is_published:false}).select('id').single();if(c.error)throw c.error;setId=c.data.id}
    const mr=await sb.from('exam_set_modules').insert(modules.map(x=>({exam_set_id:setId,module:x.module,test_id:x.test_id})));if(mr.error)throw mr.error;
    const ar=await sb.from('student_exam_sets').insert(studentIds.map(student_id=>({exam_set_id:setId,student_id})));if(ar.error)throw ar.error;
    // Keep legacy per-test access synchronized so existing student-test security remains compatible.
    for(const m of modules)for(const student_id of studentIds){const r=await sb.from('student_test_access').upsert({student_id,test_id:m.test_id,allowed:true},{onConflict:'student_id,test_id'});if(r.error)throw r.error}
    alert(`Exam Set ${id?'updated':'created'} successfully.`);examSetsPage();
  }catch(e){alert('Could not save Exam Set: '+(e.message||e))}
}
async function editExamSet(id){return newExamSetForm(id)}
async function toggleExamSet(id,val){try{if(val){const es=await v13GetExamSet(id);const mods=['listening','reading','writing','speaking'];if(es.modules.length!==4||mods.some(m=>!es.modules.some(x=>x.module===m)))throw new Error('Exam Set must contain exactly one Listening, Reading, Writing and Speaking test before publishing.');if(es.tests.some(t=>!t.is_published))throw new Error('All four module tests must be published before publishing this Exam Set.');}const {error}=await sb.from('exam_sets').update({is_published:val,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error;examSetsPage()}catch(e){alert('Could not change Exam Set status: '+(e.message||e))}}
async function deleteExamSet(id){if(!confirm('Delete this Exam Set? Individual test definitions and existing student attempts will NOT be deleted.'))return;const {error}=await sb.from('exam_sets').delete().eq('id',id);if(error)alert(error.message);else examSetsPage()}

function v13ExamSetSummary(examSetId,mods,tests,results){
  const tm=new Map(tests.map(t=>[t.id,t]));
  const rm=new Map();
  for(const r of (results||[])){
    const prev=rm.get(r.test_id);
    if(!prev || r.status==='submitted' || (prev.status!=='submitted' && new Date(r.created_at||0)>new Date(prev.created_at||0))) rm.set(r.test_id,r);
  }
  const out={};
  for(const m of ['listening','reading','writing','speaking']){
    const x=mods.find(z=>z.module===m);const r=x?rm.get(x.test_id):null;let band=null;
    if(r?.status==='submitted'){
      if(m==='listening'&&r.listening_score!=null)band=bandFromRaw('listening',r.listening_score,getReadingType(tm.get(x.test_id)));
      if(m==='reading'&&r.reading_score!=null)band=bandFromRaw('reading',r.reading_score,getReadingType(tm.get(x.test_id)));
      if(m==='writing'&&r.writing_score!=null)band=Number(r.writing_score);
      if(m==='speaking'&&r.speaking_score!=null)band=Number(r.speaking_score);
    }
    out[m]={test:x?tm.get(x.test_id):null,result:r||null,band:v13RoundBand(band)};
  }
  return out;
}
async function v13LoadStudentExamSets(studentId){
  const a=await sb.from('student_exam_sets').select('exam_set_id,assigned_at').eq('student_id',studentId);if(a.error)throw a.error;const ids=(a.data||[]).map(x=>x.exam_set_id);if(!ids.length)return [];
  const [es,mm,rr]=await Promise.all([sb.from('exam_sets').select('*').in('id',ids).eq('is_published',true).order('created_at',{ascending:false}),sb.from('exam_set_modules').select('exam_set_id,module,test_id').in('exam_set_id',ids),sb.from('results').select('id,exam_set_id,test_id,status,started_at,submitted_at,listening_score,reading_score,writing_score,speaking_score,created_at').eq('student_id',studentId).in('exam_set_id',ids).order('created_at',{ascending:false})]);
  if(es.error)throw es.error;if(mm.error)throw mm.error;if(rr.error)throw rr.error;
  const tids=[...new Set((mm.data||[]).map(x=>x.test_id))];let tests=[];if(tids.length){const t=await sb.from('tests').select('id,title,module,description,duration_minutes,total_questions,settings,is_published').in('id',tids);if(t.error)throw t.error;tests=t.data||[]}
  return (es.data||[]).map(e=>({...e,modules:(mm.data||[]).filter(x=>x.exam_set_id===e.id),tests:tests.filter(t=>(mm.data||[]).some(x=>x.exam_set_id===e.id&&x.test_id===t.id)),results:(rr.data||[]).filter(r=>r.exam_set_id===e.id)}));
}
function v13ExamSetOverall(es){const by=v13ExamSetSummary(es.id,es.modules,es.tests,es.results),vals=['listening','reading','writing','speaking'].map(m=>by[m].band);const complete=vals.every(v=>Number.isFinite(Number(v)));return {by,overall:complete?overallBandFromComponents(...vals):null,complete}}

async function studentDashboard(){
  try{
    setRoute('student-dashboard');const user=(await sb.auth.getUser()).data.user;if(!user)throw new Error('Please login again.');
    const sets=await v13LoadStudentExamSets(user.id);
    if(!sets.length){
      // Compatibility fallback for students created before V13 Exam Sets existed.
      return v13LegacyStudentDashboard(user.id);
    }
    const cards=sets.map(es=>{const o=v13ExamSetOverall(es);const vals=['listening','reading','writing','speaking'].map(m=>o.by[m].band);const status=o.complete?'<span class="status success">Overall Complete</span>':'<span class="status draft">TEST IN REVIEW</span>';const rows=['listening','reading','writing','speaking'].map(m=>{const x=o.by[m],r=x.result,t=x.test;const label=v13ModuleLabel(m);let action='';if(m==='speaking'){action=r?.speaking_score!=null?'<span class="status success">Faculty Checked</span>':'<span class="status warning">Faculty Pending</span>'}else if(r?.status==='submitted'){action=`<button class="btn secondary" onclick="studentResultPage('${r.id}')">View Result</button>`}else if(r?.status==='in_progress'){action=`<button class="btn warning" onclick="startStudentTest('${t.id}',true,false,'${es.id}')">Resume</button>`}else if(t){action=`<button class="btn primary" onclick="startStudentTest('${t.id}',true,false,'${es.id}')">Start Test</button>`}return `<tr><td><strong>${v13Icon(m)} ${label}</strong></td><td>${esc(t?.title||'Not configured')}</td><td>${r?.status==='submitted'?(x.band==null?'Pending':Number(x.band).toFixed(1)):r?.status==='in_progress'?'In Progress':'Not Started'}</td><td>${action}</td></tr>`}).join('');return `<div class="card" style="margin-bottom:16px"><div class="actions" style="justify-content:space-between;align-items:flex-start"><div><h3 style="margin:0">🏆 ${esc(es.title)}</h3><p class="muted" style="margin:5px 0">${esc(es.description||'')}</p></div><button class="btn primary" onclick="studentOverallResult('${es.id}')">View Overall Score</button></div><div class="dashboard-grid" style="grid-template-columns:repeat(5,minmax(0,1fr));margin:14px 0">${[['Listening',o.by.listening.band],['Reading',o.by.reading.band],['Writing',o.by.writing.band],['Speaking',o.by.speaking.band],['Overall',o.overall]].map(([n,v])=>`<div class="card" style="text-align:center;padding:12px"><strong>${n}</strong><div style="font-size:24px;margin-top:5px">${v==null?'Pending':Number(v).toFixed(1)}</div></div>`).join('')}</div><div class="table-wrap"><table><thead><tr><th>Module</th><th>Assigned Test</th><th>Score/Band</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table></div><div style="margin-top:10px">${status}</div></div>`}).join('');
    shell(`<h2>Student Dashboard</h2><p class="muted">Student ID: <strong>${esc(currentProfile?.student_code||user.id)}</strong>. Each IELTS Mock/Exam has its own separate Overall Band.</p><h3>My IELTS Mock / Exam Results</h3>${cards}`);
  }catch(e){alert('Could not load Student Dashboard: '+(e.message||e))}
}
async function v13LegacyStudentDashboard(studentId){
  const {data:access,error}=await sb.from('student_test_access').select('test_id,allowed').eq('student_id',studentId).eq('allowed',true);if(error)throw error;const ids=(access||[]).map(x=>x.test_id);let tests=[];if(ids.length){const q=await sb.from('tests').select('id,title,module,description,duration_minutes,total_questions,settings,is_published').eq('is_published',true).in('id',ids).order('module');if(q.error)throw q.error;tests=q.data||[]}
  let results=[];if(ids.length){const q=await sb.from('results').select('id,test_id,status,started_at,submitted_at,listening_score,reading_score,writing_score,speaking_score,created_at').eq('student_id',studentId).in('test_id',ids).order('created_at',{ascending:false});if(q.error)throw q.error;results=q.data||[]}
  const latest=new Map();for(const r of results){if(!latest.has(r.test_id)||r.status==='submitted')latest.set(r.test_id,r)}
  const cards=tests.map(t=>{const r=latest.get(t.id),m=normalizeModule(t.module);if(m==='speaking')return `<div class="dashbtn"><div style="font-size:30px">🗣️</div><strong>${esc(t.title)}</strong><span class="muted">Speaking • Faculty Assessment</span><div style="margin-top:10px"><span class="status warning">${r?.speaking_score!=null?'Band '+Number(r.speaking_score).toFixed(1):'Faculty Pending'}</span></div></div>`;const action=r?.status==='submitted'?`<button class="btn primary" onclick="studentResultPage('${r.id}')">View Result</button>`:r?.status==='in_progress'?`<button class="btn warning" onclick="startStudentTest('${t.id}',true,false,'')">Resume</button>`:`<button class="btn primary" onclick="startStudentTest('${t.id}',true,false,'')">Start Test</button>`;return `<div class="dashbtn"><div style="font-size:30px">${v13Icon(m)}</div><strong>${esc(t.title)}</strong><span class="muted">${m.toUpperCase()} • ${t.duration_minutes} min</span><div class="actions" style="margin-top:10px">${action}</div></div>`}).join('');shell(`<h2>Student Dashboard</h2><div class="notice">This student has legacy direct-test assignments. Create an IELTS Exam Set in Admin to get the new Mock-wise Overall workflow.</div><div class="dashboard-grid">${cards||'<div class="card">No published tests are assigned.</div>'}</div>`);
}

async function createAttempt(test,examSetId=null){const user=(await sb.auth.getUser()).data.user;const payload={student_id:user.id,test_id:test.id,status:'in_progress',started_at:new Date().toISOString()};if(examSetId)payload.exam_set_id=examSetId;const {data,error}=await sb.from('results').insert(payload).select().single();if(error)throw error;return data}

async function startStudentTest(id,resume=true,preview=false,examSetId=''){
  try{
    let d=await loadTestBundle(id);const mod=normalizeModule(d.test.module);if(mod==='speaking'&&!preview)throw new Error('Speaking is a Faculty-assessment module. Please use the Exam Set Overall Result.');if(!d.test.is_published&&!preview)throw new Error('This test is not published.');
    let saved=null,attempt=null,user=null,review=false;
    if(!preview){
      user=(await sb.auth.getUser()).data.user;if(!user)throw new Error('Please login again.');
      if(examSetId){const a=await sb.from('student_exam_sets').select('exam_set_id').eq('exam_set_id',examSetId).eq('student_id',user.id).maybeSingle();if(a.error)throw a.error;if(!a.data)throw new Error('This IELTS Exam is not assigned to your Student ID.');const m=await sb.from('exam_set_modules').select('test_id').eq('exam_set_id',examSetId).eq('test_id',id).maybeSingle();if(m.error)throw m.error;if(!m.data)throw new Error('This test is not part of the selected IELTS Exam.')}
      let q=sb.from('results').select('*').eq('student_id',user.id).eq('test_id',id).order('created_at',{ascending:false});if(examSetId)q=q.eq('exam_set_id',examSetId);const existing=await q;if(existing.error)throw existing.error;const arr=existing.data||[];attempt=arr.find(x=>x.status==='submitted')||arr[0]||null;
      if(attempt?.status==='submitted'){review=true;saved=loadExam(id,user.id,attempt.id)}else{if(!attempt)attempt=await createAttempt(d.test,examSetId||null);saved=resume?loadExam(id,user.id,attempt.id):null}
      localStorage.removeItem(legacyExamKey(id));
    }
    d=await ensureWritingQuestions(d);
    let audioUrl=null;
    if(mod==='listening'&&d.audio?.audio_path) audioUrl=await resolveListeningAudio(id,d.audio);
    if(d.sections?.length){
      for(const sec of d.sections){
        const raw=sec.image_path||sec.image_url;
        if(raw&&!String(raw).startsWith('http')){try{sec.image_url=await signed('question-images',raw)}catch(_){}}
      }
    }
    if(d.groups?.length){
      for(const g of d.groups){
        if(g.image_path){try{g.image_url=await signed('question-images',g.image_path)}catch(_){}}
      }
    }
    if(d.questions?.length){
      for(const q of d.questions){
        if(q.image_url&&!String(q.image_url).startsWith('http')){try{q.image_url=await signed('question-images',q.image_url)}catch(_){}}
      }
    }
    if(d.writingTasks?.length){
      for(const wt of d.writingTasks){
        const url=wt.media_url||((Array.isArray(wt.media)&&wt.media[0]?.url)||null);
        if(url&&!String(url).startsWith('http')){
          try{
            const su=await signed('question-images',url);
            wt.media_url=su;
            if(Array.isArray(wt.media)&&wt.media.length) wt.media=[{...wt.media[0],url:su}];
          }catch(_){}
        }else if(url) wt.media_url=url;
      }
    }
    let dbAnswers={};if(!preview&&attempt?.id)dbAnswers=await loadAttemptAnswers(attempt.id);if(!preview&&user&&mod==='writing'){const wa=await loadWritingAttempts(id,user.id);for(const x of wa){const wt=(d.writingTasks||[]).find(z=>Number(z.part)===Number(x.part));if(wt)dbAnswers['task_'+wt.id]=String(x.answer||'')}}
    const mergedAnswers={...(saved?.answers||{}),...dbAnswers};const endAt=preview?null:(attempt?.started_at?new Date(attempt.started_at).getTime()+d.test.duration_minutes*60000:(saved?.endAt||Date.now()+d.test.duration_minutes*60000));
    exam={preview,testId:id,examSetId:examSetId||attempt?.exam_set_id||'',studentId:preview?null:(user?.id||saved?.studentId),resultId:preview?null:(attempt?.id||saved?.resultId),data:d,currentSection:preview?0:(saved?.currentSection||0),currentTask:saved?.currentTask||0,answers:mergedAnswers,startedAt:attempt?.started_at||saved?.startedAt||new Date().toISOString(),endAt:review?null:endAt,audioUrl,locked:review||!!saved?.locked,review};if(!preview){setRoute('exam',{testId:id,examSetId:exam.examSetId});saveExam()}if(review)stopStudentListeningAudio();renderExam();if(!preview&&!review&&endAt<=Date.now())return submitExam(true);if(!review)startTimer();if(mListening(exam)&&!review)initStudentListeningAudio(!preview);
  }catch(e){console.error(e);clearRoute();if(currentProfile?.role==='student'){alert(e.message||'Could not open the test.');try{await studentDashboard()}catch(_){}}else alert(e.message||'Could not open the test.')}
}

async function studentOverallResultsPage(examSetId=''){
  try{const user=(await sb.auth.getUser()).data.user;if(!user)throw new Error('Please login again.');const sets=await v13LoadStudentExamSets(user.id);if(!sets.length)return v13LegacyStudentDashboard(user.id);const es=examSetId?sets.find(x=>x.id===examSetId):sets[0];if(!es)throw new Error('Exam Set not found.');const o=v13ExamSetOverall(es);const fmt=v=>v==null?'Pending':Number(v).toFixed(1);const rows=['listening','reading','writing','speaking'].map(m=>{const x=o.by[m],r=x.result;return `<tr><td><strong>${v13Icon(m)} ${v13ModuleLabel(m)}</strong></td><td>${esc(x.test?.title||'Not configured')}</td><td>${r?.status==='submitted'?new Date(r.submitted_at).toLocaleString():r?.status==='in_progress'?'In Progress':'Pending'}</td><td><strong>${fmt(x.band)}</strong></td><td>${r?.id?`<button class="btn secondary" onclick="studentResultPage('${r.id}')">View Result</button>`:'—'}</td></tr>`}).join('');shell(`<div class="actions"><button class="btn secondary" onclick="studentDashboard()">← Dashboard</button>${sets.length>1?`<select onchange="studentOverallResultsPage(this.value)">${sets.map(x=>`<option value="${x.id}" ${x.id===es.id?'selected':''}>${esc(x.title)}</option>`).join('')}</select>`:''}</div><h2>🏆 ${esc(es.title)} — Overall IELTS Score</h2><p class="muted">Student ID: <strong>${esc(currentProfile?.student_code||user.id)}</strong></p><div class="card" style="max-width:900px;margin:18px auto;text-align:center;border:2px solid #2563eb"><div style="font-size:42px">🏆</div><h2>${o.complete?'Overall IELTS Band':'TEST IN REVIEW'}</h2><div style="font-size:64px;font-weight:800">${o.overall==null?'—':Number(o.overall).toFixed(1)}</div><p class="muted">Overall uses only the four module results belonging to this Exam Set.</p></div><div class="dashboard-grid" style="grid-template-columns:repeat(4,minmax(0,1fr));margin:18px 0">${['listening','reading','writing','speaking'].map(m=>`<div class="card" style="text-align:center"><strong>${v13ModuleLabel(m)}</strong><div style="font-size:30px;margin-top:8px">${fmt(o.by[m].band)}</div></div>`).join('')}</div><div class="card table-wrap"><h3>Module Results</h3><table><thead><tr><th>Module</th><th>Test</th><th>Status</th><th>Band</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table></div>`)}catch(e){alert('Could not load Overall Score: '+(e.message||e))}
}
async function studentOverallResult(examSetId=''){return studentOverallResultsPage(examSetId)}

async function overallResultsPage(){
  try{setRoute('overall-results');const {data:sets,error}=await sb.from('exam_sets').select('*').order('created_at',{ascending:false});if(error)throw error;const ids=(sets||[]).map(x=>x.id);let assigns=[],mods=[],results=[];if(ids.length){const a=await sb.from('student_exam_sets').select('exam_set_id,student_id').in('exam_set_id',ids);if(a.error)throw a.error;assigns=a.data||[];const m=await sb.from('exam_set_modules').select('exam_set_id,module,test_id').in('exam_set_id',ids);if(m.error)throw m.error;mods=m.data||[];const tids=[...new Set(mods.map(x=>x.test_id))];if(tids.length){const r=await sb.from('results').select('id,student_id,exam_set_id,test_id,status,submitted_at,created_at,listening_score,reading_score,writing_score,speaking_score').in('exam_set_id',ids);if(r.error)throw r.error;results=r.data||[]}}
    const studentIds=[...new Set(assigns.map(x=>x.student_id))];let profiles=[];if(studentIds.length){const p=await sb.from('profiles').select('id,full_name,student_code').in('id',studentIds);if(p.error)throw p.error;profiles=p.data||[]}const pm=new Map(profiles.map(x=>[x.id,x]));const rows=[];for(const es of sets||[]){for(const sid of [...new Set(assigns.filter(a=>a.exam_set_id===es.id).map(a=>a.student_id))]){const eMods=mods.filter(x=>x.exam_set_id===es.id),tids=eMods.map(x=>x.test_id);let tests=[];if(tids.length){const t=await sb.from('tests').select('id,title,module,settings').in('id',tids);if(t.error)throw t.error;tests=t.data||[]}const esObj={...es,modules:eMods,tests,results:results.filter(r=>r.exam_set_id===es.id&&r.student_id===sid)};const o=v13ExamSetOverall(esObj),p=pm.get(sid);rows.push(`<tr><td><strong>${esc(p?.full_name||sid)}</strong><br><small>${esc(p?.student_code||'')}</small></td><td>${esc(es.title)}</td><td>${o.by.listening.band==null?'—':Number(o.by.listening.band).toFixed(1)}</td><td>${o.by.reading.band==null?'—':Number(o.by.reading.band).toFixed(1)}</td><td>${o.by.writing.band==null?'—':Number(o.by.writing.band).toFixed(1)}</td><td>${o.by.speaking.band==null?'—':Number(o.by.speaking.band).toFixed(1)}</td><td><strong>${o.overall==null?'TEST IN REVIEW':Number(o.overall).toFixed(1)}</strong></td><td><button class="btn primary" onclick="overallResultDetails('${sid}','${es.id}')">Open</button></td></tr>`)}}
    shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button></div><h2>Overall IELTS Results</h2><p class="muted">One result row per <strong>Student + Exam Set</strong>. Module scores never mix between different mocks.</p><div class="card table-wrap"><table><thead><tr><th>Student</th><th>Exam / Mock</th><th>Listening</th><th>Reading</th><th>Writing</th><th>Speaking</th><th>Overall</th><th>Details</th></tr></thead><tbody>${rows.join('')||'<tr><td colspan="8">No Exam Set results found.</td></tr>'}</tbody></table></div>`);
  }catch(e){alert('Could not load Overall Results: '+(e.message||e))}
}
async function overallResultDetails(studentId,examSetId){
  try{
    const sets=await v13LoadStudentExamSets(studentId);
    let es=sets.find(x=>x.id===examSetId);
    if(!es){
      const g=await v13GetExamSet(examSetId);
      const rr=await sb.from('results').select('id,student_id,exam_set_id,test_id,status,submitted_at,created_at,listening_score,reading_score,writing_score,speaking_score').eq('student_id',studentId).eq('exam_set_id',examSetId);
      if(rr.error)throw rr.error;
      es={...g,results:rr.data||[]};
    }
    const o=v13ExamSetOverall(es);
    const p=(await sb.from('profiles').select('full_name,student_code').eq('id',studentId).single()).data;
    const detailButtons=['listening','reading','writing','speaking'].map(m=>{
      return o.by[m].result?.id
        ? `<button class="btn secondary" onclick="resultDetails('${o.by[m].result.id}')">${v13ModuleLabel(m)} Details</button>`
        : `<button class="btn secondary" disabled>${v13ModuleLabel(m)} Pending</button>`;
    }).join('');
    const wr=o.by.writing.result, sp=o.by.speaking.result;
    let wtBands={};
    if(wr){const wa=await sb.from('writing_attempts').select('part,band_score').eq('test_id',wr.test_id).eq('student_id',studentId).order('part');if(wa.error)throw wa.error;(wa.data||[]).forEach(x=>wtBands[Number(x.part)]=x.band_score)}
    const scoreCards=[['Listening',o.by.listening.band],['Reading',o.by.reading.band],['Writing',o.by.writing.band],['Speaking',o.by.speaking.band],['Overall',o.overall]].map(([n,v])=>`<div class="card"><strong>${n}</strong><div style="font-size:28px;margin-top:6px">${v==null?'Pending':Number(v).toFixed(1)}</div></div>`).join('');
    const writingCard=wr ? `
      <div class="card"><h3>Writing Faculty Evaluation</h3>
        <p class="muted">Task 2 carries double weighting. Enter both task bands; the Final Writing Band is calculated automatically.</p>
        <div class="grid">
          <div><label>Task 1 Band</label><input id="wtTask1Band" type="number" step="0.5" min="0" max="9" value="${wtBands[1]??''}"></div>
          <div><label>Task 2 Band</label><input id="wtTask2Band" type="number" step="0.5" min="0" max="9" value="${wtBands[2]??''}"></div>
        </div>
        <p class="muted">Calculated Final Writing Band: <strong id="v13WritingCalc">Enter both task bands</strong></p>
        <div class="actions"><button class="btn primary" onclick="saveV13WritingFacultyEvaluation('${wr.id}','${wr.test_id}','${studentId}','${examSetId}')">Save Writing Evaluation</button></div>
      </div>` : `<div class="card"><h3>Writing Faculty Evaluation</h3><p class="muted">No Writing result yet.</p></div>`;
    const speakingCard=`<div class="card"><h3>Speaking Faculty Assessment</h3><p class="muted">Enter the final Speaking band for this Exam Set.</p><input id="overallSpeakingBand" type="number" step="0.5" min="0" max="9" value="${sp?.speaking_score??''}"><div class="actions" style="margin-top:10px"><button class="btn primary" onclick="saveV13SpeakingScore('${sp?.id||''}','${sp?.test_id||o.by.speaking.test?.id||''}','${studentId}','${examSetId}')">Save Speaking Score</button></div></div>`;
    shell(`
      <div class="actions"><button class="btn secondary" onclick="overallResultsPage()">← Overall Results</button></div>
      <h2>${esc(p?.full_name||studentId)} — ${esc(es.title)}</h2>
      <p class="muted">Student ID: ${esc(p?.student_code||studentId)} • One Overall Result per Exam Set</p>
      <div class="dashboard-grid" style="grid-template-columns:repeat(5,minmax(0,1fr));margin:14px 0">${scoreCards}</div>
      <div class="card"><h3>Module Details</h3><div class="actions">${detailButtons}</div></div>
      ${writingCard}
      ${speakingCard}
      <div class="card" style="text-align:center"><h3>Overall IELTS Band</h3><div style="font-size:44px;font-weight:800">${o.overall==null?'TEST IN REVIEW':Number(o.overall).toFixed(1)}</div><p class="muted">Overall is calculated only when Listening, Reading, Writing and Speaking are all finalized for this Exam Set.</p></div>
    `);
    setTimeout(()=>{
      const a=$('wtTask1Band'),b=$('wtTask2Band'),out=$('v13WritingCalc');
      const f=()=>{const v=v13WritingFinalBand(a?.value,b?.value);if(out)out.textContent=v==null?'Enter both task bands':v.toFixed(1)};
      a?.addEventListener('input',f);b?.addEventListener('input',f);
    },0);
  }catch(e){alert('Could not open Overall Result: '+(e.message||e))}
}
async function saveV13WritingFacultyEvaluation(resultId,testId,studentId,examSetId){try{const t1=Number($('wtTask1Band').value),t2=Number($('wtTask2Band').value);if(!Number.isFinite(t1)||!Number.isFinite(t2)||t1<0||t1>9||t2<0||t2>9||Math.round(t1*2)!==t1*2||Math.round(t2*2)!==t2*2)throw new Error('Enter valid Task 1 and Task 2 bands in 0.5 steps.');const rows=await sb.from('writing_attempts').select('id,part').eq('test_id',testId).eq('student_id',studentId).order('part');if(rows.error)throw rows.error;for(const partBand of [[1,t1],[2,t2]]){const r=(rows.data||[]).find(x=>Number(x.part)===partBand[0]);if(r){const u=await sb.from('writing_attempts').update({band_score:partBand[1],evaluation_status:'evaluated',updated_at:new Date().toISOString()}).eq('id',r.id);if(u.error)throw u.error}}const final=v13WritingFinalBand(t1,t2);const u=await sb.from('results').update({writing_score:final,writing_score_source:'faculty'}).eq('id',resultId);if(u.error)throw u.error;alert(`Writing saved. Final Writing Band = ${final.toFixed(1)} (Task 2 double-weighted).`);overallResultDetails(studentId,examSetId)}catch(e){alert('Could not save Writing evaluation: '+(e.message||e))}}
async function saveV13SpeakingScore(resultId,testId,studentId,examSetId){try{const v=Number($('overallSpeakingBand').value);if(!Number.isFinite(v)||v<0||v>9||Math.round(v*2)!==v*2)throw new Error('Enter a valid Speaking band from 0 to 9 in 0.5 steps.');let rid=resultId;if(rid){const u=await sb.from('results').update({speaking_score:v,speaking_score_source:'faculty',status:'submitted',submitted_at:new Date().toISOString()}).eq('id',rid);if(u.error)throw u.error}else{if(!testId)throw new Error('Speaking test is not configured for this Exam Set.');const ins=await sb.from('results').insert({student_id:studentId,test_id:testId,exam_set_id:examSetId,status:'submitted',speaking_score:v,speaking_score_source:'faculty',submitted_at:new Date().toISOString()}).select('id').single();if(ins.error)throw ins.error}alert('Speaking score saved. Overall result updated.');overallResultDetails(studentId,examSetId)}catch(e){alert('Could not save Speaking score: '+(e.message||e))}}

// V13 Listening/Builder defaults and labels.
function newTestForm(module='all'){
  const m=['listening','reading','writing','speaking'].includes(module)?module:'listening';shell(`<div class="actions"><button class="btn secondary" onclick="testsPage('${module}')">← Back</button></div><h2>Create New Test</h2><div class="card"><div class="grid"><div><label>Title</label><input id="ntTitle" value="${m[0].toUpperCase()+m.slice(1)} Test"></div><div><label>Module</label><select id="ntModule" onchange="syncNewTestDefaults()"><option value="listening" ${m==='listening'?'selected':''}>Listening</option><option value="reading" ${m==='reading'?'selected':''}>Reading</option><option value="writing" ${m==='writing'?'selected':''}>Writing</option><option value="speaking" ${m==='speaking'?'selected':''}>Speaking — Faculty Assessment</option></select></div></div><label>Description</label><textarea id="ntDesc"></textarea><div class="grid"><div><label>Duration</label><input id="ntDur" type="number" value="${m==='listening'?30:m==='speaking'?0:60}" ${m==='speaking'?'disabled':''}></div><div><label>Total Questions</label><input id="ntTotal" type="number" value="${m==='writing'?2:m==='speaking'?0:40}" ${m==='speaking'?'disabled':''}></div></div><div class="notice">Listening uses one continuous audio track for the complete test. Recommended duration: 30 minutes.</div><div class="actions" style="margin-top:14px"><button class="btn primary" onclick="createTest()">Create & Open Builder</button></div></div>`)}
function syncNewTestDefaults(){const m=$('ntModule').value;$('ntDur').value=m==='listening'?30:m==='speaking'?0:60;$('ntTotal').value=m==='writing'?2:m==='speaking'?0:40;$('ntDur').disabled=m==='speaking';$('ntTotal').disabled=m==='speaking'}

// Staff dashboard: Exam Sets is the primary Overall workflow.
function staffDashboard(){setRoute('dashboard');shell(`<h2>Admin Dashboard</h2><p class="muted">Build module tests, combine them into IELTS Exam Sets, assign students and finalize Overall Bands.</p><div class="dashboard-grid"><button class="dashbtn" onclick="studentsPage()">👨‍🎓<strong>Students</strong><span class="muted">Manage Student IDs</span></button><button class="dashbtn" onclick="examSetsPage()">🏆<strong>IELTS Mock / Exam Sets</strong><span class="muted">Link Listening + Reading + Writing + Speaking</span></button><button class="dashbtn" onclick="testsPage('all')">📝<strong>All Tests</strong><span class="muted">Create / edit / publish module tests</span></button><button class="dashbtn" onclick="testsPage('listening')">🎧<strong>Listening</strong><span class="muted">Section 1–4 • 40 Questions • 30 min</span></button><button class="dashbtn" onclick="testsPage('reading')">📖<strong>Reading</strong><span class="muted">Passage 1–3 • 40 Questions</span></button><button class="dashbtn" onclick="testsPage('writing')">✍️<strong>Writing</strong><span class="muted">Task 1 + Task 2 • Faculty</span></button><button class="dashbtn" onclick="testsPage('speaking')">🗣️<strong>Speaking</strong><span class="muted">Faculty Band Assessment</span></button><button class="dashbtn" onclick="resultsPage()">📊<strong>Module Results</strong><span class="muted">Individual attempts</span></button><button class="dashbtn" onclick="overallResultsPage()">🏆<strong>Overall Results</strong><span class="muted">One row per Student + Exam Set</span></button></div>`)}

// Override the builder save/display labels for Listening Sections.
const _v13_originalRenderBuilder=renderBuilder;
function renderBuilder(){_v13_originalRenderBuilder();setTimeout(()=>{if(admin?.test?.module==='listening'){document.querySelectorAll('.section-tabs button').forEach((b,i)=>b.textContent='Section '+(i+1));const h=[...document.querySelectorAll('h3')].find(x=>/^Part \d+/.test(x.textContent));if(h)h.textContent=h.textContent.replace(/^Part /,'Section ') }},0)}



async function createTest(){
  try{
    const uid=(await sb.auth.getUser()).data.user?.id;
    if(!uid)throw new Error('Admin session expired.');
    const m=$('ntModule').value;
    const title=$('ntTitle').value.trim();if(!title)throw new Error('Enter a test title.');
    const duration=m==='listening'?30:m==='speaking'?0:Number($('ntDur').value||60);
    const total=m==='writing'?2:m==='speaking'?0:40;
    const settings={};
    if(m==='reading')settings.reading_type=$('ntReadingType')?.value||'academic';
    const {data:t,error}=await sb.from('tests').insert({title,module:m,description:$('ntDesc').value.trim(),duration_minutes:duration,total_questions:total,is_published:false,created_by:uid,settings}).select().single();
    if(error)throw error;
    const count=m==='listening'?4:m==='reading'?3:1;
    const rows=Array.from({length:count},(_,i)=>({test_id:t.id,section_number:i+1,title:m==='listening'?`Section ${i+1}`:m==='reading'?`Passage ${i+1}`:m==='writing'?'Writing Tasks':'Speaking Assessment',instructions:'',content:''}));
    const {error:e2}=await sb.from('sections').insert(rows);if(e2)throw e2;
    openBuilder(t.id);
  }catch(e){alert('Could not create test: '+(e.message||e))}
}

async function validateTest(id){
  const d=await loadTestBundle(id),issues=[],mod=normalizeModule(d.test.module);
  if(mod==='listening'){
    if(Number(d.test.duration_minutes)!==30)issues.push('Listening duration must be exactly 30 minutes.');
    if(d.sections.length!==4)issues.push('Listening must have exactly 4 Sections.');
    if(!d.audio?.audio_path)issues.push('Upload the single Listening audio before publishing.');
  }
  if(mod==='reading'&&d.sections.length!==3)issues.push('Reading must have exactly 3 Passages.');
  if(mod==='writing'){
    const parts=(d.writingTasks||[]).map(x=>Number(x.part));
    if(!parts.includes(1)||!parts.includes(2))issues.push('Writing requires Task 1 and Task 2.');
    for(const wt of (d.writingTasks||[])){if(!String(wt.prompt||'').trim())issues.push(`Writing Task ${wt.part}: prompt is missing.`);if(Number(wt.minimum_words||0)<=0)issues.push(`Writing Task ${wt.part}: minimum word count is missing.`)}
  }
  if(mod==='speaking'){if(d.sections.length!==1)issues.push('Speaking must have one Faculty Assessment section.');return issues;}
  if(mod==='listening'||mod==='reading'){
    const qs=validModuleQuestions(d),nums=qs.map(q=>Number(q.question_number));
    if(qs.length!==40)issues.push(`${v13ModuleLabel(mod)} must contain exactly 40 valid questions; currently ${qs.length}.`);
    const missing=Array.from({length:40},(_,i)=>i+1).filter(n=>!nums.includes(n));if(missing.length)issues.push(`Missing question numbers: ${missing.join(', ')}.`);
    if(new Set(nums).size!==nums.length)issues.push('Duplicate question numbers are not allowed.');
    for(const q of qs){
      if(!String(q.correct_answer||'').trim())issues.push(`Question ${q.question_number}: correct answer is missing.`);
      const type=normalizeType(q.question_type),needsOptions=['single','multi','matching','map','headings','information','features','endings','tfng','yng','title','list'].includes(type);
      if(needsOptions&&(q.options||[]).length<2)issues.push(`Question ${q.question_number}: at least 2 options are required for ${q.question_type}.`);
    }
  }
  return issues;
}

function renderListeningAudioBox(){
  if(!exam.audioUrl)return '<div class="audio-box"><strong>Listening Audio</strong><div class="muted">Audio not configured.</div></div>';
  const status=exam.review?'Submitted review — audio is not replayed.':examAudioEnded?'Audio finished — it cannot be replayed.':'One continuous audio track for the complete Listening test. Pause, replay and seeking are disabled.';
  return `<div class="audio-box"><strong>🎧 Listening Audio</strong><audio id="ueListeningPlayer" preload="auto" ${exam.review?'':'controls'} controlsList="nodownload noplaybackrate nofullscreen"></audio><div id="ueListeningStatus" class="muted" style="margin-top:6px">${status}</div></div>`;
}

const _v13RenderExamBase=renderExamBase;
function renderExam(){
  _v13RenderExamBase();
  if(exam?.data?.test?.module==='listening'){
    const tabs=document.querySelectorAll('.section-tabs button');tabs.forEach((b,i)=>b.textContent='Section '+(i+1));
    const box=document.querySelector('.audio-box');
    if(box&&exam.audioUrl){
      box.outerHTML=renderListeningAudioBox();
      const player=$('ueListeningPlayer');
      if(player){player.src=exam.audioUrl;player.currentTime=examAudio?.currentTime||0;player.controls=!exam.review;player.addEventListener('play',()=>{if(examAudio&&!examAudio.paused)return;initStudentListeningAudio(true)});player.addEventListener('pause',()=>{if(examAudioStopping||exam.review||examAudioEnded)return;player.play().catch(()=>{})});player.addEventListener('seeking',()=>{if(examAudio)player.currentTime=examAudio.currentTime||0});player.addEventListener('timeupdate',()=>{if(examAudio&&!examAudio.paused&&Math.abs(player.currentTime-examAudio.currentTime)>0.4)player.currentTime=examAudio.currentTime});}
    }
  }
}
function initStudentListeningAudio(autoplay){
  if(!mListening(exam)||!exam.audioUrl)return;
  examAudioStopping=false;
  const p=$('ueListeningPlayer');
  if(!p){
    // Fallback for preview/legacy render paths.
    const a=new Audio(exam.audioUrl);a.preload='auto';examAudio=a;examAudioTestId=exam.testId;examAudioEnded=false;
    a.addEventListener('ended',()=>{examAudioEnded=true;renderExam()});
    if(autoplay&&!exam.preview)a.play().catch(()=>{});
    return;
  }
  const isNew=examAudioTestId!==exam.testId||examAudio!==p;
  if(isNew){
    if(examAudio&&examAudio!==p){try{examAudio.pause()}catch(_){} }
    examAudio=p;examAudioTestId=exam.testId;examAudioEnded=false;
    p.src=exam.audioUrl;p.preload='auto';p.controls=!exam.review;p.controlsList='nodownload noplaybackrate nofullscreen';
    p.addEventListener('ended',()=>{examAudioEnded=true;p.controls=false;if($('ueListeningStatus'))$('ueListeningStatus').textContent='Audio finished — it cannot be replayed.';});
    p.addEventListener('pause',()=>{
      if(examAudioStopping||exam.review||examAudioEnded)return;
      p.play().catch(()=>{});
    });
    p.addEventListener('seeking',()=>{
      const allowed=Number(p.dataset.lastTime||0);
      if(Math.abs(p.currentTime-allowed)>0.75)p.currentTime=allowed;
    });
    p.addEventListener('timeupdate',()=>{p.dataset.lastTime=String(p.currentTime||0)});
    p.addEventListener('play',()=>{p.dataset.lastTime=String(p.currentTime||0)});
  }
  if(autoplay&&!exam.preview&&!examAudioEnded)p.play().catch(()=>{});
}
function stopStudentListeningAudio(){
  examAudioStopping=true;
  if(examAudio){try{examAudio.pause();examAudio.currentTime=0;examAudio.removeAttribute('src');examAudio.load()}catch(_){} }
  examAudio=null;examAudioTestId=null;examAudioEnded=false;
}

window.staffDashboard=staffDashboard;window.examSetsPage=examSetsPage;window.newExamSetForm=newExamSetForm;window.saveExamSet=saveExamSet;window.editExamSet=editExamSet;window.toggleExamSet=toggleExamSet;window.deleteExamSet=deleteExamSet;window.v13SelectAllStudents=v13SelectAllStudents;window.studentDashboard=studentDashboard;window.studentOverallResultsPage=studentOverallResultsPage;window.studentOverallResult=studentOverallResult;window.startStudentTest=startStudentTest;window.overallResultsPage=overallResultsPage;window.overallResultDetails=overallResultDetails;window.saveV13WritingFacultyEvaluation=saveV13WritingFacultyEvaluation;window.saveV13SpeakingScore=saveV13SpeakingScore;window.newTestForm=newTestForm;window.syncNewTestDefaults=syncNewTestDefaults;

window.staffDashboard=staffDashboard;window.studentDashboard=studentDashboard;window.studentsPage=studentsPage;window.newStudentForm=newStudentForm;window.createStudent=createStudent;window.manageStudent=manageStudent;window.saveStudent=saveStudent;window.toggleStudent=toggleStudent;window.setTestAccess=setTestAccess;window.deleteStudent=deleteStudent;window.testsPage=testsPage;window.answerKeyPage=answerKeyPage;window.saveAnswerKey=saveAnswerKey;window.newTestForm=newTestForm;window.syncNewTestDefaults=syncNewTestDefaults;window.createTest=createTest;window.togglePublish=togglePublish;window.deleteTest=deleteTest;window.openBuilder=openBuilder;window.renderBuilder=renderBuilder;window.switchAdminSection=switchAdminSection;window.saveTestHeader=saveTestHeader;window.saveSection=saveSection;window.groupForm=groupForm;window.saveGroup=saveGroup;window.deleteGroup=deleteGroup;window.questionForm=questionForm;window.saveQuestion=saveQuestion;window.deleteQuestion=deleteQuestion;window.writingTaskForm=writingTaskForm;window.saveWritingTask=saveWritingTask;window.deleteWritingTask=deleteWritingTask;window.uploadAudio=uploadAudio;window.removeAudio=removeAudio;window.previewCurrentTest=previewCurrentTest;window.startStudentTest=startStudentTest;window.switchExamSection=switchExamSection;window.switchTask=switchTask;window.setAns=setAns;window.toggleAns=toggleAns;window.setWriting=setWriting;window.submitExam=submitExam;window.exitExam=exitExam;window.resultsPage=resultsPage;window.overallResultsPage=overallResultsPage;window.overallResultDetails=overallResultDetails;window.saveOverallWritingScore=saveOverallWritingScore;window.saveOverallSpeakingScore=saveOverallSpeakingScore;window.studentOverallResult=studentOverallResult;window.studentOverallResultsPage=studentOverallResultsPage;window.resultDetails=resultDetails;window.studentResultPage=studentResultPage;window.studentReviewAnswers=studentReviewAnswers;window.deleteResult=deleteResult;window.downloadWritingSubmission=downloadWritingSubmission;window.saveWritingFacultyEvaluation=saveWritingFacultyEvaluation;window.logout=logout;
document.addEventListener("DOMContentLoaded",init);

/* =========================================================
   V13.1.3 MOCK-CENTRIC FINAL ARCHITECTURE
   - One Student ID can have unlimited Mock/Exam Sets.
   - Each Mock contains Listening + Reading + Writing tests.
   - Speaking is NOT a student test; Faculty records a Speaking band
     directly against Student + Mock.
   - Overall belongs only to Student + Mock.
   - Writing faculty can publish a checked/annotated essay + feedback.
   ========================================================= */
async function v131EnsureMockAttempt(examSetId, studentId){
  if(!examSetId||!studentId) throw new Error('Mock and Student are required.');
  const q=await sb.from('mock_attempts').select('*').eq('exam_set_id',examSetId).eq('student_id',studentId).maybeSingle();
  if(q.error)throw q.error;
  if(q.data)return q.data;
  const ins=await sb.from('mock_attempts').insert({exam_set_id:examSetId,student_id:studentId}).select('*').single();
  if(ins.error)throw ins.error;
  return ins.data;
}
function v131MockOverall(es,results,mockAttempt){
  const tm=new Map((es.tests||[]).map(t=>[t.id,t]));
  const mods=(es.modules||[]).filter(x=>x.module!=='speaking');
  const latest=new Map();
  for(const r of (results||[])){
    const prev=latest.get(r.test_id);
    if(!prev || (r.status==='submitted' && prev.status!=='submitted') || (r.status===prev.status && new Date(r.created_at||0)>new Date(prev.created_at||0))) latest.set(r.test_id,r);
  }
  const by={};
  for(const m of ['listening','reading','writing']){
    const x=mods.find(z=>z.module===m), test=x?tm.get(x.test_id):null, r=x?latest.get(x.test_id):null;
    let band=null;
    if(r?.status==='submitted'){
      if(m==='listening'&&r.listening_score!=null) band=scoreBand('listening',Number(r.listening_score),getReadingType(test));
      if(m==='reading'&&r.reading_score!=null) band=scoreBand('reading',Number(r.reading_score),getReadingType(test));
      if(m==='writing'&&r.writing_score!=null) band=Number(r.writing_score);
    }
    by[m]={test,result:r||null,band:v13RoundBand(band)};
  }
  const speaking=mockAttempt?.speaking_score==null?null:Number(mockAttempt.speaking_score);
  by.speaking={test:null,result:null,band:v13RoundBand(speaking)};
  const vals=[by.listening.band,by.reading.band,by.writing.band,by.speaking.band].map(Number);
  const complete=vals.every(v=>Number.isFinite(v));
  const overall=complete ? overallBandFromComponents(...vals) : null;
  return {by,overall,complete,mockAttempt};
}
async function v131LoadStudentMocks(studentId){
  const a=await sb.from('student_exam_sets').select('exam_set_id,assigned_at').eq('student_id',studentId);if(a.error)throw a.error;
  const ids=(a.data||[]).map(x=>x.exam_set_id);if(!ids.length)return [];
  const [esq,mq,rq,aq]=await Promise.all([
    sb.from('exam_sets').select('*').in('id',ids).eq('is_published',true).order('created_at',{ascending:false}),
    sb.from('exam_set_modules').select('exam_set_id,module,test_id').in('exam_set_id',ids),
    sb.from('results').select('id,exam_set_id,test_id,status,started_at,submitted_at,listening_score,reading_score,writing_score,speaking_score,created_at').eq('student_id',studentId).in('exam_set_id',ids).order('created_at',{ascending:false}),
    sb.from('mock_attempts').select('*').eq('student_id',studentId).in('exam_set_id',ids)
  ]);
  for(const x of [esq,mq,rq,aq])if(x.error)throw x.error;
  const modules=(mq.data||[]).filter(x=>x.module!=='speaking');
  const tids=[...new Set(modules.map(x=>x.test_id))];let tests=[];
  if(tids.length){const t=await sb.from('tests').select('id,title,module,description,duration_minutes,total_questions,settings,is_published').in('id',tids);if(t.error)throw t.error;tests=t.data||[]}
  return (esq.data||[]).map(es=>({...es,
    modules:modules.filter(x=>x.exam_set_id===es.id),
    tests:tests.filter(t=>modules.some(x=>x.exam_set_id===es.id&&x.test_id===t.id)),
    results:(rq.data||[]).filter(r=>r.exam_set_id===es.id),
    mockAttempt:(aq.data||[]).find(x=>x.exam_set_id===es.id)||null
  }));
}

async function examSetsPage(){
  try{
    setRoute('exam-sets');
    const {data:sets,error}=await sb.from('exam_sets').select('*').order('created_at',{ascending:false});if(error)throw error;
    const ids=(sets||[]).map(x=>x.id);let mods=[],assign=[];
    if(ids.length){const a=await sb.from('exam_set_modules').select('exam_set_id,module,test_id').in('exam_set_id',ids);if(a.error)throw a.error;mods=a.data||[];const b=await sb.from('student_exam_sets').select('exam_set_id,student_id').in('exam_set_id',ids);if(b.error)throw b.error;assign=b.data||[]}
    const tids=[...new Set(mods.filter(x=>x.module!=='speaking').map(x=>x.test_id))];let tests=[];
    if(tids.length){const t=await sb.from('tests').select('id,title,module,is_published').in('id',tids);if(t.error)throw t.error;tests=t.data||[]}
    const tm=new Map(tests.map(x=>[x.id,x]));
    const rows=(sets||[]).map(es=>{const mm=mods.filter(x=>x.exam_set_id===es.id&&x.module!=='speaking');const aa=assign.filter(x=>x.exam_set_id===es.id);const labels=['listening','reading','writing'].map(m=>{const x=mm.find(z=>z.module===m);return x?`${v13Icon(m)} ${esc(tm.get(x.test_id)?.title||'')}`:`${v13Icon(m)} —`;}).join('<br>');return `<tr><td><strong>${esc(es.title)}</strong><br><small>${esc(es.description||'')}</small></td><td>${labels}<br><small>🗣️ Speaking = Faculty score</small></td><td>${aa.length}</td><td>${es.is_published?'<span class="status published">Published</span>':'<span class="status draft">Draft</span>'}</td><td><div class="actions"><button class="btn secondary" onclick="editExamSet('${es.id}')">Edit</button><button class="btn ${es.is_published?'warning':'success'}" onclick="toggleExamSet('${es.id}',${!es.is_published})">${es.is_published?'Unpublish':'Publish'}</button><button class="btn danger" onclick="deleteExamSet('${es.id}')">Delete</button></div></td></tr>`}).join('');
    shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button><button class="btn primary" onclick="newExamSetForm()">+ Create IELTS Mock / Exam</button></div><h2>IELTS Mock / Exam Sets</h2><p class="muted">Each Mock belongs to one Student attempt set. It contains Listening + Reading + Writing. Speaking is entered directly by Faculty for each Student in that Mock.</p><div class="notice"><strong>Rule:</strong> One Student ID can be assigned to Mock 1, Mock 2, Mock 3, etc. Scores from different Mocks are never mixed.</div><div class="card table-wrap"><table><thead><tr><th>Mock / Exam</th><th>Modules</th><th>Students</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows||'<tr><td colspan="5">No Exam Sets created yet.</td></tr>'}</tbody></table></div>`);
  }catch(e){alert('Could not load Exam Sets: '+(e.message||e))}
}
async function newExamSetForm(existingId=null){
  try{
    const es=existingId?await v13GetExamSet(existingId):null;
    const tq=await sb.from('tests').select('id,title,module,is_published').order('created_at',{ascending:false});if(tq.error)throw tq.error;
    const pq=await sb.from('profiles').select('id,student_code,full_name,active').eq('role','student').order('full_name');if(pq.error)throw pq.error;
    const tests=tq.data||[], students=pq.data||[], selected=new Map((es?.modules||[]).filter(x=>x.module!=='speaking').map(x=>[x.module,x.test_id])), assigned=new Set((es?.assignments||[]).map(x=>x.student_id));
    const select=(m)=>`<select id="esTest_${m}"><option value="">— Select ${v13ModuleLabel(m)} test —</option>${tests.filter(t=>normalizeModule(t.module)===m).map(t=>`<option value="${t.id}" ${selected.get(m)===t.id?'selected':''}>${esc(t.title)}${t.is_published?'':' (Draft)'}</option>`).join('')}</select>`;
    shell(`<div class="actions"><button class="btn secondary" onclick="examSetsPage()">← Exam Sets</button></div><h2>${es?'Edit':'Create'} IELTS Mock / Exam</h2><div class="card"><div class="grid"><div><label>Mock / Exam Name</label><input id="esTitle" value="${attr(es?.title||'Mock Test 01')}" placeholder="e.g. Mock Test 01"></div><div><label>Description</label><input id="esDesc" value="${attr(es?.description||'')}" placeholder="Optional description"></div></div><div class="notice"><strong>Modules:</strong> Select Listening, Reading and Writing. <strong>Speaking is NOT a student test.</strong> Faculty will enter the Speaking band directly for each student who completes this Mock.</div><div class="grid"><div><label>🎧 Listening Test</label>${select('listening')}</div><div><label>📖 Reading Test</label>${select('reading')}</div><div><label>✍️ Writing Test</label>${select('writing')}</div></div><h3>Assign Students</h3><p class="muted">The same Student ID can be assigned to unlimited different Mocks.</p><div class="actions" style="margin-bottom:10px"><button class="btn secondary" type="button" onclick="v13SelectAllStudents(true)">Select All</button><button class="btn secondary" type="button" onclick="v13SelectAllStudents(false)">Clear All</button></div><div class="grid3" id="esStudents">${students.map(s=>`<label style="display:flex;gap:8px;align-items:center;font-weight:600"><input class="esStudent" type="checkbox" value="${s.id}" ${assigned.has(s.id)?'checked':''} style="width:auto"><span>${esc(s.student_code||'')} — ${esc(s.full_name||'')}</span></label>`).join('')||'No students created yet.'}</div><div class="actions" style="margin-top:18px"><button class="btn primary" onclick="saveExamSet('${existingId||''}')">💾 ${es?'Save Mock':'Create Mock'}</button></div></div>`);
  }catch(e){alert('Could not open Mock form: '+(e.message||e))}
}
async function saveExamSet(id=''){
  try{
    const title=$('esTitle').value.trim(),description=$('esDesc').value.trim();if(!title)throw new Error('Enter a Mock / Exam name.');
    const modules=['listening','reading','writing'].map(m=>({module:m,test_id:$('esTest_'+m)?.value||null}));if(modules.some(x=>!x.test_id))throw new Error('Select exactly one Listening, Reading and Writing test. Speaking is added later by Faculty as a score.');
    const studentIds=[...document.querySelectorAll('.esStudent:checked')].map(x=>x.value);if(!studentIds.length)throw new Error('Assign at least one student.');
    const uid=(await sb.auth.getUser()).data.user?.id;if(!uid)throw new Error('Staff session expired.');let setId=id;
    if(id){const u=await sb.from('exam_sets').update({title,description,updated_at:new Date().toISOString()}).eq('id',id);if(u.error)throw u.error;await sb.from('exam_set_modules').delete().eq('exam_set_id',id);await sb.from('student_exam_sets').delete().eq('exam_set_id',id)}
    else{const c=await sb.from('exam_sets').insert({title,description,created_by:uid,is_published:false}).select('id').single();if(c.error)throw c.error;setId=c.data.id}
    const mr=await sb.from('exam_set_modules').insert(modules.map(x=>({exam_set_id:setId,module:x.module,test_id:x.test_id})));if(mr.error)throw mr.error;
    const ar=await sb.from('student_exam_sets').insert(studentIds.map(student_id=>({exam_set_id:setId,student_id})));if(ar.error)throw ar.error;
    for(const m of modules)for(const student_id of studentIds){const r=await sb.from('student_test_access').upsert({student_id,test_id:m.test_id,allowed:true},{onConflict:'student_id,test_id'});if(r.error)throw r.error;}
    alert(`Mock ${id?'updated':'created'} successfully.`);examSetsPage();
  }catch(e){alert('Could not save Mock: '+(e.message||e))}
}
async function toggleExamSet(id,val){try{if(val){const es=await v13GetExamSet(id);const mods=['listening','reading','writing'];if(mods.some(m=>!es.modules.some(x=>x.module===m)))throw new Error('Mock must contain Listening, Reading and Writing before publishing.');if(es.tests.some(t=>t.module!=='speaking'&&!t.is_published))throw new Error('All three student module tests must be published before publishing this Mock.');}const {error}=await sb.from('exam_sets').update({is_published:val,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error;examSetsPage()}catch(e){alert('Could not change Mock status: '+(e.message||e))}}

async function studentDashboard(){
  try{
    setRoute('student-dashboard');const user=(await sb.auth.getUser()).data.user;if(!user)throw new Error('Please login again.');
    const sets=await v131LoadStudentMocks(user.id);
    if(!sets.length)return v13LegacyStudentDashboard(user.id);
    const cards=sets.map(es=>{const o=v131MockOverall(es,es.results,es.mockAttempt);const modRows=['listening','reading','writing'].map(m=>{const x=o.by[m],r=x.result,t=x.test;let action='';if(r?.status==='submitted')action=`<button class="btn secondary" onclick="studentResultPage('${r.id}')">View Result</button>`;else if(r?.status==='in_progress')action=`<button class="btn warning" onclick="startStudentTest('${t.id}',true,false,'${es.id}')">Resume</button>`;else action=t?`<button class="btn primary" onclick="startStudentTest('${t.id}',true,false,'${es.id}')">Start Test</button>`:'—';return `<tr><td>${v13Icon(m)} <strong>${v13ModuleLabel(m)}</strong></td><td>${esc(t?.title||'Not configured')}</td><td>${r?.status==='submitted'?(x.band==null?'Pending':Number(x.band).toFixed(1)):r?.status==='in_progress'?'In Progress':'Not Started'}</td><td>${action}</td></tr>`}).join('');
      const sp=o.by.speaking.band==null?'<span class="status warning">Faculty Pending</span>':`<span class="status success">${Number(o.by.speaking.band).toFixed(1)}</span>`;const overall=o.overall==null?'TEST IN REVIEW':Number(o.overall).toFixed(1);
      return `<div class="card" style="margin-bottom:18px"><div class="actions" style="justify-content:space-between;align-items:flex-start"><div><h3 style="margin:0">🏆 ${esc(es.title)}</h3><p class="muted" style="margin:5px 0">${esc(es.description||'')}</p></div><button class="btn primary" onclick="studentOverallResult('${es.id}')">View Overall Score</button></div><div class="dashboard-grid" style="grid-template-columns:repeat(5,minmax(0,1fr));margin:14px 0">${[['Listening',o.by.listening.band],['Reading',o.by.reading.band],['Writing',o.by.writing.band],['Speaking',o.by.speaking.band],['Overall',o.overall]].map(([n,v])=>`<div class="card" style="text-align:center;padding:12px"><strong>${n}</strong><div style="font-size:24px;margin-top:5px">${v==null?'Pending':Number(v).toFixed(1)}</div></div>`).join('')}</div><div class="table-wrap"><table><thead><tr><th>Module</th><th>Test</th><th>Band / Status</th><th>Action</th></tr></thead><tbody>${modRows}<tr><td>🗣️ <strong>Speaking</strong></td><td>Faculty Assessment</td><td>${sp}</td><td>—</td></tr></tbody></table></div><div style="margin-top:10px"><span class="status ${o.complete?'success':'draft'}">${o.complete?'Overall Complete':'TEST IN REVIEW'}</span></div></div>`}).join('');
    shell(`<h2>Student Dashboard</h2><p class="muted">Student ID: <strong>${esc(currentProfile?.student_code||user.id)}</strong>. You can receive unlimited Mocks. Each Mock has its own independent 4-module Overall.</p><h3>My Mock Test Results</h3>${cards}`);
  }catch(e){alert('Could not load Student Dashboard: '+(e.message||e))}
}

async function startStudentTest(id,resume=true,preview=false,examSetId=''){
  try{
    let d=await loadTestBundle(id);const mod=normalizeModule(d.test.module);if(mod==='speaking'&&!preview)throw new Error('Speaking is Faculty Assessment only. No Speaking student test is assigned.');if(!d.test.is_published&&!preview)throw new Error('This test is not published.');
    let saved=null,attempt=null,user=null,review=false;
    if(!preview){user=(await sb.auth.getUser()).data.user;if(!user)throw new Error('Please login again.');if(!examSetId)throw new Error('This test must be opened from an assigned Mock Test.');const as=await sb.from('student_exam_sets').select('exam_set_id').eq('exam_set_id',examSetId).eq('student_id',user.id).maybeSingle();if(as.error)throw as.error;if(!as.data)throw new Error('This Mock is not assigned to your Student ID.');const em=await sb.from('exam_set_modules').select('test_id,module').eq('exam_set_id',examSetId).eq('test_id',id).neq('module','speaking').maybeSingle();if(em.error)throw em.error;if(!em.data)throw new Error('This test is not part of the selected Mock.');let q=sb.from('results').select('*').eq('student_id',user.id).eq('test_id',id).eq('exam_set_id',examSetId).order('created_at',{ascending:false});const existing=await q;if(existing.error)throw existing.error;const arr=existing.data||[];attempt=arr.find(x=>x.status==='submitted')||arr[0]||null;if(attempt?.status==='submitted'){review=true;saved=loadExam(id,user.id,attempt.id)}else{if(!attempt)attempt=await createAttempt(d.test,examSetId);saved=resume?loadExam(id,user.id,attempt.id):null}}
    d=await ensureWritingQuestions(d);let audioUrl=null;if(mod==='listening'&&d.audio?.audio_path)audioUrl=await resolveListeningAudio(id,d.audio);
    if(d.sections?.length)for(const sec of d.sections){const raw=sec.image_path||sec.image_url;if(raw&&!String(raw).startsWith('http')){try{sec.image_url=await signed('question-images',raw)}catch(_){}}}
    if(d.groups?.length)for(const g of d.groups){if(g.image_path){try{g.image_url=await signed('question-images',g.image_path)}catch(_){}}}
    if(d.questions?.length)for(const q of d.questions){if(q.image_url&&!String(q.image_url).startsWith('http')){try{q.image_url=await signed('question-images',q.image_url)}catch(_){}}}
    if(d.writingTasks?.length)for(const wt of d.writingTasks){const url=wt.media_url||((Array.isArray(wt.media)&&wt.media[0]?.url)||null);if(url&&!String(url).startsWith('http')){try{const su=await signed('question-images',url);wt.media_url=su;if(Array.isArray(wt.media)&&wt.media.length)wt.media=[{...wt.media[0],url:su}]}catch(_){}}else if(url)wt.media_url=url}
    let dbAnswers={};if(!preview&&attempt?.id)dbAnswers=await loadAttemptAnswers(attempt.id);if(!preview&&user&&mod==='writing'){const wa=await loadWritingAttempts(id,user.id);for(const x of wa){const wt=(d.writingTasks||[]).find(z=>Number(z.part)===Number(x.part));if(wt)dbAnswers['task_'+wt.id]=String(x.answer||'')}}
    const mergedAnswers={...(saved?.answers||{}),...dbAnswers};const endAt=preview?null:(attempt?.started_at?new Date(attempt.started_at).getTime()+d.test.duration_minutes*60000:(saved?.endAt||Date.now()+d.test.duration_minutes*60000));
    exam={preview,testId:id,examSetId:examSetId||attempt?.exam_set_id||'',studentId:preview?null:(user?.id||saved?.studentId),resultId:preview?null:(attempt?.id||saved?.resultId),data:d,currentSection:preview?0:(saved?.currentSection||0),currentTask:saved?.currentTask||0,answers:mergedAnswers,startedAt:attempt?.started_at||saved?.startedAt||new Date().toISOString(),endAt:review?null:endAt,audioUrl,locked:review||!!saved?.locked,review};if(!preview){setRoute('exam',{testId:id,examSetId:exam.examSetId});saveExam()}if(review)stopStudentListeningAudio();renderExam();if(!preview&&!review&&endAt<=Date.now())return submitExam(true);if(!review)startTimer();if(mListening(exam)&&!review)initStudentListeningAudio(!preview);
  }catch(e){console.error(e);clearRoute();if(currentProfile?.role==='student'){alert(e.message||'Could not open the test.');try{await studentDashboard()}catch(_){}}else alert(e.message||'Could not open the test.')}
}

async function studentOverallResultsPage(examSetId=''){
  try{
    const user=(await sb.auth.getUser()).data.user;if(!user)throw new Error('Please login again.');
    const sets=await v131LoadStudentMocks(user.id);if(!sets.length)return v13LegacyStudentDashboard(user.id);
    const es=examSetId?sets.find(x=>x.id===examSetId):sets[0];if(!es)throw new Error('Mock not found.');
    const o=v131MockOverall(es,es.results,es.mockAttempt),fmt=v=>v==null?'Pending':Number(v).toFixed(1);
    const rows=['listening','reading','writing'].map(m=>{const x=o.by[m],r=x.result;return `<tr><td>${v13Icon(m)} <strong>${v13ModuleLabel(m)}</strong></td><td>${esc(x.test?.title||'Not configured')}</td><td>${r?.status==='submitted'?'Completed':r?.status==='in_progress'?'In Progress':'Pending'}</td><td><strong>${fmt(x.band)}</strong></td><td>${r?.id?`<button class="btn secondary" onclick="studentResultPage('${r.id}')">View Result</button>`:'—'}</td></tr>`}).join('');
    shell(`<div class="actions"><button class="btn secondary" onclick="studentDashboard()">← Dashboard</button>${sets.length>1?`<select onchange="studentOverallResultsPage(this.value)">${sets.map(x=>`<option value="${x.id}" ${x.id===es.id?'selected':''}>${esc(x.title)}</option>`).join('')}</select>`:''}</div>
      <h2>🏆 ${esc(es.title)} — Overall IELTS Score</h2>
      <p class="muted">Student ID: <strong>${esc(currentProfile?.student_code||user.id)}</strong></p>
      <div class="card" style="max-width:920px;margin:18px auto;text-align:center;border:2px solid #2563eb"><div style="font-size:42px">🏆</div><h2>${o.complete?'Overall IELTS Band':'TEST IN REVIEW'}</h2><div style="font-size:64px;font-weight:800">${o.overall==null?'—':Number(o.overall).toFixed(1)}</div><p class="muted">Only this Mock's Listening, Reading, Writing and Faculty Speaking score are used.</p></div>
      <div class="dashboard-grid" style="grid-template-columns:repeat(5,minmax(0,1fr));margin:18px 0">${['listening','reading','writing','speaking','overall'].map(m=>{const v=m==='overall'?o.overall:o.by[m].band;return `<div class="card" style="text-align:center"><strong>${m==='overall'?'Overall':v13ModuleLabel(m)}</strong><div style="font-size:30px;margin-top:8px">${fmt(v)}</div></div>`}).join('')}</div>
      <div class="card table-wrap"><h3>Module Results</h3><table><thead><tr><th>Module</th><th>Test</th><th>Status</th><th>Band</th><th>Result</th></tr></thead><tbody>${rows}<tr><td>🗣️ <strong>Speaking</strong></td><td>Faculty Assessment</td><td>${o.by.speaking.band==null?'Faculty Pending':'Faculty Checked'}</td><td><strong>${fmt(o.by.speaking.band)}</strong></td><td>—</td></tr></tbody></table></div>`);
  }catch(e){alert('Could not load Overall Score: '+(e.message||e))}
}
async function studentOverallResult(examSetId=''){return studentOverallResultsPage(examSetId)}

async function overallResultsPage(){
  try{setRoute('overall-results');const {data:sets,error}=await sb.from('exam_sets').select('*').order('created_at',{ascending:false});if(error)throw error;const ids=(sets||[]).map(x=>x.id);let assigns=[],mods=[],results=[],mocks=[];if(ids.length){const a=await sb.from('student_exam_sets').select('exam_set_id,student_id').in('exam_set_id',ids);if(a.error)throw a.error;assigns=a.data||[];const m=await sb.from('exam_set_modules').select('exam_set_id,module,test_id').in('exam_set_id',ids);if(m.error)throw m.error;mods=m.data||[];const r=await sb.from('results').select('id,student_id,exam_set_id,test_id,status,submitted_at,created_at,listening_score,reading_score,writing_score').in('exam_set_id',ids);if(r.error)throw r.error;results=r.data||[];const ma=await sb.from('mock_attempts').select('*').in('exam_set_id',ids);if(ma.error)throw ma.error;mocks=ma.data||[]}
    const studentIds=[...new Set(assigns.map(x=>x.student_id))];let profiles=[];if(studentIds.length){const p=await sb.from('profiles').select('id,full_name,student_code').in('id',studentIds);if(p.error)throw p.error;profiles=p.data||[]}const pm=new Map(profiles.map(x=>[x.id,x]));const rows=[];
    for(const es of sets||[]){for(const sid of [...new Set(assigns.filter(a=>a.exam_set_id===es.id).map(a=>a.student_id))]){const eMods=mods.filter(x=>x.exam_set_id===es.id&&x.module!=='speaking'),tids=eMods.map(x=>x.test_id);let tests=[];if(tids.length){const t=await sb.from('tests').select('id,title,module,settings').in('id',tids);if(t.error)throw t.error;tests=t.data||[]}const esObj={...es,modules:eMods,tests,results:results.filter(r=>r.exam_set_id===es.id&&r.student_id===sid)},ma=mocks.find(x=>x.exam_set_id===es.id&&x.student_id===sid),o=v131MockOverall(esObj,esObj.results,ma),p=pm.get(sid);rows.push(`<tr><td><strong>${esc(p?.full_name||sid)}</strong><br><small>${esc(p?.student_code||'')}</small></td><td>${esc(es.title)}</td><td>${o.by.listening.band==null?'—':Number(o.by.listening.band).toFixed(1)}</td><td>${o.by.reading.band==null?'—':Number(o.by.reading.band).toFixed(1)}</td><td>${o.by.writing.band==null?'—':Number(o.by.writing.band).toFixed(1)}</td><td>${o.by.speaking.band==null?'—':Number(o.by.speaking.band).toFixed(1)}</td><td><strong>${o.overall==null?'TEST IN REVIEW':Number(o.overall).toFixed(1)}</strong></td><td><button class="btn primary" onclick="overallResultDetails('${sid}','${es.id}')">Open</button></td></tr>`)}}
    shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button></div><h2>Overall IELTS Results</h2><p class="muted">One row per <strong>Student + Mock</strong>. Speaking is a Faculty score; no Speaking student test is assigned.</p><div class="card table-wrap"><table><thead><tr><th>Student</th><th>Mock</th><th>Listening</th><th>Reading</th><th>Writing</th><th>Speaking</th><th>Overall</th><th>Details</th></tr></thead><tbody>${rows.join('')||'<tr><td colspan="8">No Mock results found.</td></tr>'}</tbody></table></div>`);
  }catch(e){alert('Could not load Overall Results: '+(e.message||e))}
}

async function overallResultDetails(studentId,examSetId){
  try{
    const g=await v13GetExamSet(examSetId);const rr=await sb.from('results').select('id,student_id,exam_set_id,test_id,status,submitted_at,created_at,listening_score,reading_score,writing_score').eq('student_id',studentId).eq('exam_set_id',examSetId);if(rr.error)throw rr.error;const maq=await sb.from('mock_attempts').select('*').eq('student_id',studentId).eq('exam_set_id',examSetId).maybeSingle();if(maq.error)throw maq.error;const es={...g,modules:(g.modules||[]).filter(x=>x.module!=='speaking'),results:rr.data||[],tests:(g.tests||[]).filter(t=>t.module!=='speaking')},o=v131MockOverall(es,es.results,maq.data);const p=(await sb.from('profiles').select('full_name,student_code').eq('id',studentId).single()).data;const detailButtons=['listening','reading','writing'].map(m=>o.by[m].result?.id?`<button class="btn secondary" onclick="resultDetails('${o.by[m].result.id}')">${v13ModuleLabel(m)} Details</button>`:`<button class="btn secondary" disabled>${v13ModuleLabel(m)} Pending</button>`).join('');
    const wr=o.by.writing.result,sp=o.by.speaking.band;let wtBands={},checked={};if(wr){const wa=await sb.from('writing_attempts').select('id,part,band_score,faculty_feedback,checked_answer').eq('test_id',wr.test_id).eq('student_id',studentId).order('part');if(wa.error)throw wa.error;(wa.data||[]).forEach(x=>{wtBands[Number(x.part)]=x.band_score;checked[Number(x.part)]=x})}
    const writingCard=wr?`<div class="card"><h3>Writing Faculty Evaluation</h3><p class="muted">Task 2 carries double weighting. Faculty can score both tasks and optionally add a checked/annotated version plus feedback that the student will see in the Writing section.</p><div class="grid"><div><label>Task 1 Band</label><input id="wtTask1Band" type="number" step="0.5" min="0" max="9" value="${wtBands[1]??''}"></div><div><label>Task 2 Band</label><input id="wtTask2Band" type="number" step="0.5" min="0" max="9" value="${wtBands[2]??''}"></div></div><div class="grid"><div><label>Task 1 Faculty Feedback</label><textarea id="wtFeedback1">${esc(checked[1]?.faculty_feedback||'')}</textarea></div><div><label>Task 2 Faculty Feedback</label><textarea id="wtFeedback2">${esc(checked[2]?.faculty_feedback||'')}</textarea></div></div><div><label>Task 1 Checked / Annotated Essay</label><textarea id="wtChecked1" rows="8">${esc(checked[1]?.checked_answer||'')}</textarea></div><div><label>Task 2 Checked / Annotated Essay</label><textarea id="wtChecked2" rows="10">${esc(checked[2]?.checked_answer||'')}</textarea></div><p class="muted">Calculated Final Writing Band: <strong id="v13WritingCalc">Enter both task bands</strong></p><div class="actions"><button class="btn primary" onclick="saveV131WritingEvaluation('${wr.id}','${wr.test_id}','${studentId}','${examSetId}')">Save Writing Evaluation</button></div></div>`:`<div class="card"><h3>Writing Faculty Evaluation</h3><p class="muted">No submitted Writing result yet.</p></div>`;
    const speakingCard=`<div class="card"><h3>Speaking Faculty Assessment</h3><p class="muted">No Speaking test is assigned. Faculty simply records the Speaking band for this student in this Mock.</p><input id="overallSpeakingBand" type="number" step="0.5" min="0" max="9" value="${maq.data?.speaking_score??''}"><div class="actions" style="margin-top:10px"><button class="btn primary" onclick="saveV131SpeakingScore('${studentId}','${examSetId}')">Save Speaking Score</button></div></div>`;
    const scoreCards=[['Listening',o.by.listening.band],['Reading',o.by.reading.band],['Writing',o.by.writing.band],['Speaking',o.by.speaking.band],['Overall',o.overall]].map(([n,v])=>`<div class="card"><strong>${n}</strong><div style="font-size:28px;margin-top:6px">${v==null?'Pending':Number(v).toFixed(1)}</div></div>`).join('');
    shell(`<div class="actions"><button class="btn secondary" onclick="overallResultsPage()">← Overall Results</button></div><h2>${esc(p?.full_name||studentId)} — ${esc(g.title)}</h2><p class="muted">Student ID: ${esc(p?.student_code||studentId)} • One Overall Result for this Mock</p><div class="dashboard-grid" style="grid-template-columns:repeat(5,minmax(0,1fr));margin:14px 0">${scoreCards}</div><div class="card"><h3>Module Details</h3><div class="actions">${detailButtons}</div></div>${writingCard}${speakingCard}<div class="card" style="text-align:center"><h3>Overall IELTS Band</h3><div style="font-size:44px;font-weight:800">${o.overall==null?'TEST IN REVIEW':Number(o.overall).toFixed(1)}</div><p class="muted">Overall is calculated only from this Mock's Listening, Reading, Writing and Speaking scores.</p></div>`);
    setTimeout(()=>{const a=$('wtTask1Band'),b=$('wtTask2Band'),out=$('v13WritingCalc');const f=()=>{const v=v13WritingFinalBand(a?.value,b?.value);if(out)out.textContent=v==null?'Enter both task bands':v.toFixed(1)};a?.addEventListener('input',f);b?.addEventListener('input',f)},0);
  }catch(e){alert('Could not open Overall Result: '+(e.message||e))}
}
async function saveV131WritingEvaluation(resultId,testId,studentId,examSetId){try{const t1=Number($('wtTask1Band').value),t2=Number($('wtTask2Band').value);if(!Number.isFinite(t1)||!Number.isFinite(t2)||t1<0||t1>9||t2<0||t2>9||Math.round(t1*2)!==t1*2||Math.round(t2*2)!==t2*2)throw new Error('Enter valid Task 1 and Task 2 bands in 0.5 steps.');const rows=await sb.from('writing_attempts').select('id,part').eq('test_id',testId).eq('student_id',studentId).order('part');if(rows.error)throw rows.error;const updates=[[1,t1,$('wtFeedback1').value,$('wtChecked1').value],[2,t2,$('wtFeedback2').value,$('wtChecked2').value]];for(const [part,band,feedback,checkedAnswer] of updates){const r=(rows.data||[]).find(x=>Number(x.part)===part);if(r){const u=await sb.from('writing_attempts').update({band_score:band,evaluation_status:'evaluated',faculty_feedback:feedback,checked_answer:checkedAnswer,updated_at:new Date().toISOString()}).eq('id',r.id);if(u.error)throw u.error}}const final=v13WritingFinalBand(t1,t2),u=await sb.from('results').update({writing_score:final,writing_score_source:'faculty'}).eq('id',resultId);if(u.error)throw u.error;alert(`Writing saved. Final Writing Band = ${final.toFixed(1)}.`);overallResultDetails(studentId,examSetId)}catch(e){alert('Could not save Writing evaluation: '+(e.message||e))}}
async function saveV131SpeakingScore(studentId,examSetId){try{const v=Number($('overallSpeakingBand').value);if(!Number.isFinite(v)||v<0||v>9||Math.round(v*2)!==v*2)throw new Error('Enter a valid Speaking band from 0 to 9 in 0.5 steps.');const q=await v131EnsureMockAttempt(examSetId,studentId);const u=await sb.from('mock_attempts').update({speaking_score:v,speaking_score_source:'faculty',speaking_scored_at:new Date().toISOString()}).eq('id',q.id);if(u.error)throw u.error;alert('Speaking score saved. Overall result updated.');overallResultDetails(studentId,examSetId)}catch(e){alert('Could not save Speaking score: '+(e.message||e))}}

async function studentResultPage(resultId,justSubmitted=false){
  try{const {data:r,error:re}=await sb.from('results').select('*,tests(title,module,total_questions,settings)').eq('id',resultId).single();if(re)throw re;const mod=normalizeModule(r.tests?.module);let raw=mod==='listening'?r.listening_score:mod==='reading'?r.reading_score:mod==='writing'?r.writing_score:null;if(r.status==='submitted'&&(mod==='listening'||mod==='reading'))raw=await recalculateStoredScore(r);const band=(mod==='listening'||mod==='reading')?scoreBand(mod,raw,getReadingType(r.tests)):raw;let writingExtra='';if(mod==='writing'){const wa=await sb.from('writing_attempts').select('*').eq('test_id',r.test_id).eq('student_id',r.student_id).order('part');if(wa.error)throw wa.error;const cards=(wa.data||[]).map(a=>`<div class="card"><h3>Task ${a.part} — Faculty Checked Writing</h3><p><strong>Band:</strong> ${a.band_score==null?'Pending':Number(a.band_score).toFixed(1)}</p>${a.faculty_feedback?`<div class="notice"><strong>Faculty Feedback</strong><div style="white-space:pre-wrap;margin-top:8px">${esc(a.faculty_feedback)}</div></div>`:''}${a.checked_answer?`<div class="card"><strong>Checked / Annotated Essay</strong><div class="student-rich" style="margin-top:10px;white-space:pre-wrap">${esc(a.checked_answer)}</div></div>`:`<p class="muted">Checked essay not uploaded yet. Your submitted answer remains available below.</p>`}<div class="card"><strong>Original Submitted Answer</strong>${renderStudentRichAnswer(a.answer)}</div></div>`).join('');writingExtra=`<div class="card"><h3>Writing Section</h3><p class="muted">Your Faculty-checked essay and feedback are shown here after evaluation.</p>${cards||'<p>No Writing submission found.</p>'}</div>`}
    shell(`<div class="actions"><button class="btn secondary" onclick="studentDashboard()">← Dashboard</button></div><div class="card" style="max-width:900px;margin:20px auto;text-align:center"><div style="font-size:52px">✅</div><h2>${justSubmitted?'Test Submitted':'Test Result'}</h2><h3>${esc(r.tests?.title||'')}</h3>${mod==='writing'?await renderStudentWritingResultCard(r):`<div class="dashboard-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:18px"><div class="card"><strong>Score</strong><div style="font-size:34px;margin-top:6px">${esc(raw??'-')}${mod==='listening'||mod==='reading'?' / 40':''}</div></div><div class="card"><strong>Band Score</strong><div style="font-size:34px;margin-top:6px">${band==null?'Pending':Number(band).toFixed(1)}</div></div></div>`}${writingExtra}<div class="actions" style="justify-content:center;margin-top:20px"><button class="btn secondary" onclick="studentReviewAnswers('${r.id}')">View My Saved Answers</button><button class="btn primary" onclick="studentOverallResult('${r.exam_set_id||''}')">View Mock Overall</button><button class="btn primary" onclick="studentDashboard()">Back to Dashboard</button></div></div>`);
  }catch(e){alert('Could not load result: '+(e.message||e))}
}

async function studentsPage(){
  try{
    setRoute('students');const {data,error}=await sb.from('profiles').select('id,student_code,full_name,role,active,created_at').eq('role','student').order('created_at',{ascending:false});if(error)throw error;
    const rows=(data||[]).map(s=>`<tr><td><strong>${esc(s.student_code||'—')}</strong></td><td>${esc(s.full_name||'')}</td><td>${s.active?'Active':'Inactive'}</td><td>${new Date(s.created_at).toLocaleDateString()}</td><td><div class="actions"><button class="btn secondary" onclick="manageStudent('${s.id}')">Manage</button><button class="btn warning" onclick="resetStudentAccount('${s.id}','${attr(s.student_code||'')}')">Reset Student</button><button class="btn ${s.active?'warning':'success'}" onclick="toggleStudent('${s.id}',${!s.active})">${s.active?'Deactivate':'Activate'}</button><button class="btn danger" onclick="deleteStudent('${s.id}','${attr(s.student_code||'')}')">Delete</button></div></td></tr>`).join('')||'<tr><td colspan="5">No students.</td></tr>';
    shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button><button class="btn primary" onclick="newStudentForm()">+ Create Student</button></div><h2>Student Management</h2><p class="muted">Create a Student ID once. The same ID can be assigned to Mock 1, Mock 2, Mock 3, etc. Use Reset Student when the ID must be reused for a new person.</p><div class="card table-wrap"><table><thead><tr><th>Student ID</th><th>Name</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>`);
  }catch(e){alert('Could not load students: '+(e.message||e))}
}
async function resetStudentAccount(id,code){
  if(!confirm(`RESET Student ${code}?\n\nThis permanently deletes all Mock attempts, Listening/Reading/Writing answers, Writing submissions, Speaking scores and results for this Student ID. The Student ID itself will remain reusable.`))return;
  try{const {data,error}=await sb.rpc('ue_reset_student_account',{p_student_id:id});if(error)throw error;if(!data?.success)throw new Error(data?.error||'Reset failed.');alert(`Student ${code} has been reset. The Student ID can now be reused.`);studentsPage()}catch(e){alert('Could not reset student: '+(e.message||e))}
}

// V13.1 Student management: no direct per-test assignment UI.
async function manageStudent(id){
  try{
    const {data:s,error}=await sb.from('profiles').select('id,student_code,full_name,active,created_at').eq('id',id).single();if(error)throw error;
    const a=await sb.from('student_exam_sets').select('exam_set_id').eq('student_id',id);if(a.error)throw a.error;
    const mockCount=(a.data||[]).length;
    shell(`<div class="actions"><button class="btn secondary" onclick="studentsPage()">← Students</button></div><h2>Manage Student</h2>
      <div class="card"><div class="grid"><div><label>Student ID</label><input value="${attr(s.student_code||'')}" disabled></div><div><label>Student Name</label><input id="msName" value="${attr(s.full_name||'')}"></div></div>
      <label>New Password (optional)</label><input id="msPass" type="password" placeholder="Leave blank to keep current password">
      <p class="muted">This Student ID can be assigned to unlimited Mock Tests. Current Mock assignments: <strong>${mockCount}</strong>.</p>
      <div class="actions"><button class="btn primary" onclick="saveStudent('${s.id}')">Save Student</button><button class="btn ${s.active?'warning':'success'}" onclick="toggleStudent('${s.id}',${!s.active})">${s.active?'Deactivate':'Activate'}</button><button class="btn warning" onclick="resetStudentAccount('${s.id}','${attr(s.student_code||'')}')">Reset Student for Reuse</button></div></div>
      <div class="notice"><strong>Mock assignment:</strong> Use <b>IELTS Mock / Exam Sets</b> to assign this Student ID to Mock 1, Mock 2, Mock 3, etc. Do not assign individual Listening/Reading/Writing tests from this page.</div>`);
  }catch(e){alert('Could not load student: '+(e.message||e))}
}
async function resetStudentAccount(id,code){
  const newName=prompt(`Reset ${code} for reuse.\n\nEnter the NEW student's name. Leave blank if you want to set it later.` ,'');
  if(newName===null)return;
  const newPassword=prompt(`Set a new password for ${code}.\n\nMinimum 6 characters:` ,'');
  if(newPassword===null)return;
  if(newPassword.length<6)return alert('Password must be at least 6 characters.');
  if(!confirm(`FINAL RESET for ${code}?\n\nAll previous Mock assignments, Listening/Reading answers, Writing submissions, Faculty evaluations, Speaking scores and results will be permanently deleted. The Student ID ${code} will remain and be assigned to the new student.`))return;
  try{
    const {data,error}=await sb.rpc('ue_reset_student_account',{p_student_id:id,p_full_name:newName.trim()});if(error)throw error;if(!data?.success)throw new Error(data?.error||'Reset failed.');
    await edgeStudentAdmin({action:'reset_password',id,password:newPassword});
    alert(`Student ID ${code} has been reset successfully. All old test data was deleted and the new account is ready.`);studentsPage();
  }catch(e){alert('Could not reset student: '+(e.message||e))}
}

// V13.1: Speaking is no longer a student test module.
// Existing legacy Speaking test definitions are left untouched in the database
// for safety, but they are hidden from the new Mock workflow.
async function testsPage(module='all'){
  try{
    setRoute('tests',{module});
    if(module==='speaking'){
      shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button></div><h2>🗣️ Speaking — Faculty Assessment</h2><div class="notice"><strong>No Speaking student test is required.</strong><br>For every Mock, Faculty records the student's Speaking band directly from <b>Overall Results → Mock → Speaking Faculty Assessment</b>.</div><div class="card"><h3>How Speaking works</h3><ol><li>Create the Mock with Listening + Reading + Writing.</li><li>Assign the Student ID to the Mock.</li><li>Faculty conducts the Speaking interview separately.</li><li>Faculty enters the Speaking band against that Student + Mock.</li><li>The Overall Band updates automatically.</li></ol></div>`);return;
    }
    let q=sb.from('tests').select('*').neq('module','speaking').order('created_at',{ascending:false});if(module!=='all')q=q.eq('module',module);const {data,error}=await q;if(error)throw error;
    shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button><button class="btn primary" onclick="newTestForm('${module}')">+ Create Test</button></div><h2>${module==='all'?'All Student Tests':module[0].toUpperCase()+module.slice(1)+' Tests'}</h2><p class="muted">Speaking is handled separately as Faculty Assessment and is not created or assigned as a student test.</p><div class="card table-wrap"><table><thead><tr><th>Title</th><th>Module</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead><tbody>${(data||[]).map(t=>`<tr><td><strong>${esc(t.title)}</strong><br><small>${esc(t.description||'')}</small></td><td>${esc(t.module)}${t.module==='reading'?`<br><small>${getReadingType(t)==='general'?'General Training':'Academic'}</small>`:''}</td><td>${t.duration_minutes} min</td><td><span class="status ${t.is_published?'published':'draft'}">${t.is_published?'Published':'Draft'}</span></td><td><div class="actions"><button class="btn secondary" onclick="editTest('${t.id}')">Edit</button><button class="btn primary" onclick="answerKeyPage('${t.id}')">Answer Key</button><button class="btn ${t.is_published?'warning':'success'}" onclick="togglePublish('${t.id}',${!t.is_published})">${t.is_published?'Unpublish':'Publish'}</button><button class="btn danger" onclick="deleteTest('${t.id}')">Delete</button></div></td></tr>`).join('')||'<tr><td colspan="5">No tests.</td></tr>'}</tbody></table></div>`);
  }catch(e){alert('Could not load Tests: '+(e.message||e))}
}
function newTestForm(module='all'){
  const m=['listening','reading','writing'].includes(module)?module:'listening';
  shell(`<div class="actions"><button class="btn secondary" onclick="testsPage('${module}')">← Back</button></div><h2>Create New ${m[0].toUpperCase()+m.slice(1)} Test</h2><div class="card"><div class="grid"><div><label>Title</label><input id="ntTitle" value="${m[0].toUpperCase()+m.slice(1)} Test"></div><div><label>Module</label><select id="ntModule" onchange="syncNewTestDefaults()"><option value="listening" ${m==='listening'?'selected':''}>Listening</option><option value="reading" ${m==='reading'?'selected':''}>Reading</option><option value="writing" ${m==='writing'?'selected':''}>Writing</option></select></div></div><label>Description</label><textarea id="ntDesc"></textarea><div class="grid"><div><label>Duration</label><input id="ntDur" type="number" value="${m==='listening'?30:60}"></div><div><label>Total Questions</label><input id="ntTotal" type="number" value="${m==='writing'?2:40}"></div></div><div class="notice">Listening uses one continuous audio track for the complete 30-minute test. Speaking is handled by Faculty in each Mock and is not created here.</div><div class="actions" style="margin-top:14px"><button class="btn primary" onclick="createTest()">Create & Open Builder</button></div></div>`);
}
function syncNewTestDefaults(){const m=$('ntModule').value;$('ntDur').value=m==='listening'?30:60;$('ntTotal').value=m==='writing'?2:40}

/* =========================================================
   V13.1.2 UX + OVERALL HARDENING
   - Admin dashboard simplified around the Mock-centric workflow.
   - Never treat null/pending module scores as 0.
   - Overall is calculated only from the same Student + Mock.
   - Speaking is Faculty-only and stored in mock_attempts.
   ========================================================= */
function v1312SafeBand(v){
  const n=Number(v);
  return v===null||v===undefined||v===''||!Number.isFinite(n)?null:v13RoundBand(n);
}
function v1312Overall(listening,reading,writing,speaking){
  const vals=[listening,reading,writing,speaking].map(v=>v1312SafeBand(v));
  if(vals.some(v=>v===null)) return null;
  return overallBandFromComponents(...vals);
}
function v1312MockOverall(es,results,mockAttempt){
  const tm=new Map((es?.tests||[]).map(t=>[t.id,t]));
  const mods=(es?.modules||[]).filter(x=>x.module!=='speaking');
  const latest=new Map();
  for(const r of (results||[])){
    const prev=latest.get(r.test_id);
    if(!prev || (r.status==='submitted' && prev.status!=='submitted') ||
      (r.status===prev.status && new Date(r.created_at||0)>new Date(prev.created_at||0))) latest.set(r.test_id,r);
  }
  const by={};
  for(const m of ['listening','reading','writing']){
    const x=mods.find(z=>z.module===m);
    const test=x?tm.get(x.test_id):null;
    const r=x?latest.get(x.test_id):null;
    let band=null;
    if(r?.status==='submitted'){
      if(m==='listening' && r.listening_score!=null) band=scoreBand('listening',Number(r.listening_score),getReadingType(test));
      if(m==='reading' && r.reading_score!=null) band=scoreBand('reading',Number(r.reading_score),getReadingType(test));
      if(m==='writing' && r.writing_score!=null) band=Number(r.writing_score);
    }
    by[m]={test,result:r||null,band:v1312SafeBand(band)};
  }
  const speaking=v1312SafeBand(mockAttempt?.speaking_score);
  by.speaking={test:null,result:null,band:speaking};
  const overall=v1312Overall(by.listening.band,by.reading.band,by.writing.band,by.speaking.band);
  return {by,overall,complete:overall!==null,mockAttempt:mockAttempt||null};
}

function staffDashboard(){
  setRoute('dashboard');
  shell(`
    <h2>Admin Dashboard</h2>
    <p class="muted">Use this order: <strong>1. Create module tests → 2. Create Mock → 3. Assign Students → 4. Faculty checks → 5. Overall Results.</strong></p>
    <div class="notice"><strong>Important:</strong> A Student ID can receive unlimited Mocks. Each Mock has its own Listening + Reading + Writing results and one Faculty Speaking score. Different Mocks are never mixed.</div>

    <h3 style="margin-top:22px">👥 Setup</h3>
    <div class="dashboard-grid">
      <button class="dashbtn" onclick="studentsPage()"><span style="font-size:24px">👨‍🎓</span><strong>Students</strong><span class="muted">Create / manage Student IDs and reset accounts</span></button>
      <button class="dashbtn" onclick="examSetsPage()"><span style="font-size:24px">🏆</span><strong>IELTS Mock / Exam Sets</strong><span class="muted">Create Mock 01, Mock 02, assign students and link modules</span></button>
    </div>

    <h3 style="margin-top:22px">📝 Test Builder</h3>
    <div class="dashboard-grid">
      <button class="dashbtn" onclick="testsPage('all')"><span style="font-size:24px">📝</span><strong>All Student Tests</strong><span class="muted">Create, edit, publish and manage Listening / Reading / Writing</span></button>
      <button class="dashbtn" onclick="testsPage('listening')"><span style="font-size:24px">🎧</span><strong>Listening</strong><span class="muted">4 Sections • 40 Questions • 30 minutes</span></button>
      <button class="dashbtn" onclick="testsPage('reading')"><span style="font-size:24px">📖</span><strong>Reading</strong><span class="muted">3 Passages • 40 Questions</span></button>
      <button class="dashbtn" onclick="testsPage('writing')"><span style="font-size:24px">✍️</span><strong>Writing</strong><span class="muted">Task 1 + Task 2 • Faculty Evaluation</span></button>
    </div>

    <h3 style="margin-top:22px">📊 Results</h3>
    <div class="dashboard-grid">
      <button class="dashbtn" onclick="overallResultsPage()"><span style="font-size:24px">🏆</span><strong>Overall Results</strong><span class="muted">Student + Mock • 4 module scores • Speaking • Overall Band</span></button>
    </div>
    <div class="notice" style="margin-top:14px">
      <strong>Faculty work is inside Overall Results.</strong> Open a Student + Mock to enter the Speaking band, review the Writing submission, and view the Listening / Reading / Writing results. No separate Module Results or Speaking Assessment page is required.
    </div>
  `);
}

async function studentDashboard(){
  try{
    setRoute('student-dashboard');
    const user=(await sb.auth.getUser()).data.user;
    if(!user)throw new Error('Please login again.');
    const sets=await v131LoadStudentMocks(user.id);
    if(!sets.length){
      shell(`<h2>Student Dashboard</h2><p class="muted">Student ID: <strong>${esc(currentProfile?.student_code||user.id)}</strong></p><div class="card"><h3>No Mock Tests Assigned</h3><p class="muted">Your Student ID has no published Mock Test assignment yet.</p></div>`);
      return;
    }
    const fmt=v=>v===null||v===undefined?'Pending':Number(v).toFixed(1);
    const cards=sets.map(es=>{
      const o=v1312MockOverall(es,es.results,es.mockAttempt);
      const modRows=['listening','reading','writing'].map(m=>{
        const x=o.by[m],r=x.result,t=x.test;
        let action='—';
        if(r?.status==='submitted') action=`<button class="btn secondary" onclick="studentResultPage('${r.id}')">View Result</button>`;
        else if(r?.status==='in_progress') action=t?`<button class="btn warning" onclick="startStudentTest('${t.id}',true,false,'${es.id}')">Resume</button>`:'—';
        else if(t) action=`<button class="btn primary" onclick="startStudentTest('${t.id}',true,false,'${es.id}')">Start Test</button>`;
        return `<tr><td>${v13Icon(m)} <strong>${v13ModuleLabel(m)}</strong></td><td>${esc(t?.title||'Not configured')}</td><td>${r?.status==='submitted'?fmt(x.band):r?.status==='in_progress'?'In Progress':'Not Started'}</td><td>${action}</td></tr>`;
      }).join('');
      const speaking=o.by.speaking.band===null?'<span class="status warning">Faculty Pending</span>':`<span class="status success">${fmt(o.by.speaking.band)}</span>`;
      const status=o.complete?'<span class="status success">Overall Complete</span>':'<span class="status draft">TEST IN REVIEW</span>';
      return `<div class="card" style="margin-bottom:18px">
        <div class="actions" style="justify-content:space-between;align-items:flex-start"><div><h3 style="margin:0">🏆 ${esc(es.title)}</h3><p class="muted" style="margin:5px 0">${esc(es.description||'')}</p></div><button class="btn primary" onclick="studentOverallResult('${es.id}')">View Overall Score</button></div>
        <div class="dashboard-grid" style="grid-template-columns:repeat(5,minmax(0,1fr));margin:14px 0">${[['Listening',o.by.listening.band],['Reading',o.by.reading.band],['Writing',o.by.writing.band],['Speaking',o.by.speaking.band],['Overall',o.overall]].map(([n,v])=>`<div class="card" style="text-align:center;padding:12px"><strong>${n}</strong><div style="font-size:24px;margin-top:5px">${fmt(v)}</div></div>`).join('')}</div>
        <div class="table-wrap"><table><thead><tr><th>Module</th><th>Test</th><th>Band / Status</th><th>Action</th></tr></thead><tbody>${modRows}<tr><td>🗣️ <strong>Speaking</strong></td><td>Faculty Assessment</td><td>${speaking}</td><td>—</td></tr></tbody></table></div>
        <div style="margin-top:10px">${status}</div>
      </div>`;
    }).join('');
    shell(`<h2>Student Dashboard</h2><p class="muted">Student ID: <strong>${esc(currentProfile?.student_code||user.id)}</strong> • Each Mock has its own independent Overall.</p><h3>My Mock Test Results</h3>${cards}`);
  }catch(e){alert('Could not load Student Dashboard: '+(e.message||e))}
}

async function studentOverallResultsPage(examSetId=''){
  try{
    const user=(await sb.auth.getUser()).data.user;if(!user)throw new Error('Please login again.');
    const sets=await v131LoadStudentMocks(user.id);if(!sets.length){await studentDashboard();return;}
    const es=examSetId?sets.find(x=>x.id===examSetId):sets[0];if(!es)throw new Error('Mock not found.');
    const o=v1312MockOverall(es,es.results,es.mockAttempt),fmt=v=>v===null||v===undefined?'Pending':Number(v).toFixed(1);
    const rows=['listening','reading','writing'].map(m=>{const x=o.by[m],r=x.result;return `<tr><td>${v13Icon(m)} <strong>${v13ModuleLabel(m)}</strong></td><td>${esc(x.test?.title||'Not configured')}</td><td>${r?.status==='submitted'?'Completed':r?.status==='in_progress'?'In Progress':'Not Started'}</td><td><strong>${fmt(x.band)}</strong></td><td>${r?.id?`<button class="btn secondary" onclick="studentResultPage('${r.id}')">View Result</button>`:'—'}</td></tr>`}).join('');
    shell(`<div class="actions"><button class="btn secondary" onclick="studentDashboard()">← Dashboard</button>${sets.length>1?`<select onchange="studentOverallResultsPage(this.value)">${sets.map(x=>`<option value="${x.id}" ${x.id===es.id?'selected':''}>${esc(x.title)}</option>`).join('')}</select>`:''}</div><h2>🏆 ${esc(es.title)} — Overall IELTS Score</h2><p class="muted">Student ID: <strong>${esc(currentProfile?.student_code||user.id)}</strong> • This result uses only this Mock.</p>
    <div class="card" style="max-width:920px;margin:18px auto;text-align:center;border:2px solid #2563eb"><div style="font-size:42px">🏆</div><h2>${o.complete?'Overall IELTS Band':'TEST IN REVIEW'}</h2><div style="font-size:64px;font-weight:800">${o.overall===null?'—':Number(o.overall).toFixed(1)}</div><p class="muted">Listening + Reading + Writing + Faculty Speaking are combined only after all four final bands are available.</p></div>
    <div class="dashboard-grid" style="grid-template-columns:repeat(5,minmax(0,1fr));margin:18px 0">${['listening','reading','writing','speaking','overall'].map(m=>{const v=m==='overall'?o.overall:o.by[m].band;return `<div class="card" style="text-align:center"><strong>${m==='overall'?'Overall':v13ModuleLabel(m)}</strong><div style="font-size:30px;margin-top:8px">${fmt(v)}</div></div>`}).join('')}</div>
    <div class="card table-wrap"><h3>Module Results</h3><table><thead><tr><th>Module</th><th>Test</th><th>Status</th><th>Band</th><th>Result</th></tr></thead><tbody>${rows}<tr><td>🗣️ <strong>Speaking</strong></td><td>Faculty Assessment</td><td>${o.by.speaking.band===null?'Faculty Pending':'Faculty Checked'}</td><td><strong>${fmt(o.by.speaking.band)}</strong></td><td>—</td></tr></tbody></table></div>`);
  }catch(e){alert('Could not load Overall Score: '+(e.message||e))}
}
async function studentOverallResult(examSetId=''){return studentOverallResultsPage(examSetId)}

async function overallResultsPage(){
  try{
    setRoute('overall-results');
    const {data:sets,error}=await sb.from('exam_sets').select('*').order('created_at',{ascending:false});if(error)throw error;
    const ids=(sets||[]).map(x=>x.id);let assigns=[],mods=[],results=[],mocks=[];
    if(ids.length){
      const a=await sb.from('student_exam_sets').select('exam_set_id,student_id').in('exam_set_id',ids);if(a.error)throw a.error;assigns=a.data||[];
      const m=await sb.from('exam_set_modules').select('exam_set_id,module,test_id').in('exam_set_id',ids);if(m.error)throw m.error;mods=m.data||[];
      const r=await sb.from('results').select('id,student_id,exam_set_id,test_id,status,submitted_at,created_at,listening_score,reading_score,writing_score').in('exam_set_id',ids);if(r.error)throw r.error;results=r.data||[];
      const ma=await sb.from('mock_attempts').select('*').in('exam_set_id',ids);if(ma.error)throw ma.error;mocks=ma.data||[];
    }
    const studentIds=[...new Set(assigns.map(x=>x.student_id))];let profiles=[];
    if(studentIds.length){const p=await sb.from('profiles').select('id,full_name,student_code').in('id',studentIds);if(p.error)throw p.error;profiles=p.data||[]}
    const pm=new Map(profiles.map(x=>[x.id,x]));const rows=[];
    for(const es of sets||[]){
      for(const sid of [...new Set(assigns.filter(a=>a.exam_set_id===es.id).map(a=>a.student_id))]){
        const eMods=mods.filter(x=>x.exam_set_id===es.id&&x.module!=='speaking'),tids=eMods.map(x=>x.test_id);let tests=[];
        if(tids.length){const t=await sb.from('tests').select('id,title,module,settings').in('id',tids);if(t.error)throw t.error;tests=t.data||[]}
        const esObj={...es,modules:eMods,tests,results:results.filter(r=>r.exam_set_id===es.id&&r.student_id===sid)};
        const ma=mocks.find(x=>x.exam_set_id===es.id&&x.student_id===sid),o=v1312MockOverall(esObj,esObj.results,ma),p=pm.get(sid);
        rows.push(`<tr><td><strong>${esc(p?.full_name||sid)}</strong><br><small>${esc(p?.student_code||'')}</small></td><td>${esc(es.title)}</td><td>${o.by.listening.band==null?'—':Number(o.by.listening.band).toFixed(1)}</td><td>${o.by.reading.band==null?'—':Number(o.by.reading.band).toFixed(1)}</td><td>${o.by.writing.band==null?'—':Number(o.by.writing.band).toFixed(1)}</td><td>${o.by.speaking.band==null?'—':Number(o.by.speaking.band).toFixed(1)}</td><td><strong>${o.overall===null?'TEST IN REVIEW':Number(o.overall).toFixed(1)}</strong></td><td><button class="btn primary" onclick="overallResultDetails('${sid}','${es.id}')">Open</button></td></tr>`);
      }
    }
    shell(`<div class="actions"><button class="btn secondary" onclick="staffDashboard()">← Dashboard</button></div><h2>🏆 Overall IELTS Results</h2><p class="muted">One row per <strong>Student + Mock</strong>. Listening, Reading, Writing and Speaking never mix between different Mocks.</p><div class="card table-wrap"><table><thead><tr><th>Student</th><th>Mock</th><th>Listening</th><th>Reading</th><th>Writing</th><th>Speaking</th><th>Overall</th><th>Details</th></tr></thead><tbody>${rows.join('')||'<tr><td colspan="8">No Mock results found.</td></tr>'}</tbody></table></div>`);
  }catch(e){alert('Could not load Overall Results: '+(e.message||e))}
}

async function saveV13SpeakingScore(resultId,testId,studentId,examSetId){
  try{
    const v=Number($('overallSpeakingBand')?.value);
    if(!Number.isFinite(v)||v<0||v>9||Math.round(v*2)!==v*2)throw new Error('Enter a valid Speaking band from 0 to 9 in 0.5 steps.');
    const q=await v131EnsureMockAttempt(examSetId,studentId);
    const u=await sb.from('mock_attempts').update({speaking_score:v,speaking_score_source:'faculty',speaking_scored_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',q.id);
    if(u.error)throw u.error;
    alert('Speaking score saved. Overall result updated.');
    overallResultDetails(studentId,examSetId);
  }catch(e){alert('Could not save Speaking score: '+(e.message||e))}
}

window.staffDashboard=staffDashboard;
window.studentDashboard=studentDashboard;
window.studentOverallResultsPage=studentOverallResultsPage;
window.studentOverallResult=studentOverallResult;
window.overallResultsPage=overallResultsPage;
window.saveV13SpeakingScore=saveV13SpeakingScore;


/* V13.1.2: final Overall Details override - Speaking is mock_attempt, never a test. */
async function overallResultDetails(studentId,examSetId){
  try{
    const sets=await v131LoadStudentMocks(studentId);
    const es=sets.find(x=>x.id===examSetId);
    if(!es)throw new Error('Mock not found for this Student ID.');
    const o=v1312MockOverall(es,es.results,es.mockAttempt);
    const p=(await sb.from('profiles').select('full_name,student_code').eq('id',studentId).single()).data;
    const detailButtons=['listening','reading','writing'].map(m=>{
      const id=o.by[m].result?.id;
      return id?`<button class="btn secondary" onclick="studentResultPage('${id}')">${v13ModuleLabel(m)} Details</button>`:`<button class="btn secondary" disabled>${v13ModuleLabel(m)} Pending</button>`;
    }).join('');
    const wr=o.by.writing.result;
    let wtBands={};
    if(wr){
      const wa=await sb.from('writing_attempts').select('part,band_score,faculty_feedback,checked_answer').eq('test_id',wr.test_id).eq('student_id',studentId).order('part');
      if(wa.error)throw wa.error;
      (wa.data||[]).forEach(x=>wtBands[Number(x.part)]=x);
    }
    const scoreCards=[['Listening',o.by.listening.band],['Reading',o.by.reading.band],['Writing',o.by.writing.band],['Speaking',o.by.speaking.band],['Overall',o.overall]].map(([n,v])=>`<div class="card"><strong>${n}</strong><div style="font-size:28px;margin-top:6px">${v===null?'Pending':Number(v).toFixed(1)}</div></div>`).join('');
    const writingCard=wr?`<div class="card"><h3>✍️ Writing Faculty Evaluation</h3><p class="muted">Task 2 carries double weighting. Final Writing Band is calculated automatically.</p><div class="grid"><div><label>Task 1 Band</label><input id="wtTask1Band" type="number" step="0.5" min="0" max="9" value="${wtBands[1]?.band_score??''}"></div><div><label>Task 2 Band</label><input id="wtTask2Band" type="number" step="0.5" min="0" max="9" value="${wtBands[2]?.band_score??''}"></div></div><p class="muted">Calculated Final Writing Band: <strong id="v13WritingCalc">Enter both task bands</strong></p><div class="actions"><button class="btn primary" onclick="saveV131WritingEvaluation('${wr.id}','${wr.test_id}','${studentId}','${examSetId}')">Save Writing Evaluation</button></div><p class="muted" style="margin-top:8px">After saving, the student's Writing Result can show the original essay, checked essay and Faculty feedback.</p></div>`:`<div class="card"><h3>✍️ Writing Faculty Evaluation</h3><p class="muted">Writing is not submitted yet.</p></div>`;
    const speakingCard=`<div class="card"><h3>🗣️ Speaking Faculty Assessment</h3><p class="muted">No Speaking student test is assigned. Enter the Speaking band directly for this Student + Mock.</p><input id="overallSpeakingBand" type="number" step="0.5" min="0" max="9" value="${o.by.speaking.band??''}" placeholder="e.g. 6.5"><div class="actions" style="margin-top:10px"><button class="btn primary" onclick="saveV13SpeakingScore('','','${studentId}','${examSetId}')">Save Speaking Score</button></div></div>`;
    shell(`<div class="actions"><button class="btn secondary" onclick="overallResultsPage()">← Overall Results</button></div><h2>${esc(p?.full_name||studentId)} — ${esc(es.title)}</h2><p class="muted">Student ID: ${esc(p?.student_code||studentId)} • One Overall Result for this Mock</p><div class="dashboard-grid" style="grid-template-columns:repeat(5,minmax(0,1fr));margin:14px 0">${scoreCards}</div><div class="card"><h3>Module Details</h3><div class="actions">${detailButtons}</div></div>${writingCard}${speakingCard}<div class="card" style="text-align:center"><h3>🏆 Overall IELTS Band</h3><div style="font-size:44px;font-weight:800">${o.overall===null?'TEST IN REVIEW':Number(o.overall).toFixed(1)}</div><p class="muted">Overall is calculated only after Listening, Reading, Writing and Speaking are all finalized for this Mock.</p></div>`);
    setTimeout(()=>{const a=$('wtTask1Band'),b=$('wtTask2Band'),out=$('v13WritingCalc');const f=()=>{const v=v13WritingFinalBand(a?.value,b?.value);if(out)out.textContent=v==null?'Enter both task bands':v.toFixed(1)};a?.addEventListener('input',f);b?.addEventListener('input',f);f()},0);
  }catch(e){alert('Could not open Overall Result: '+(e.message||e))}
}
window.overallResultDetails=overallResultDetails;

