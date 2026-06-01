// ═══════════════════════════════════════════════
//  UNIFIED APP — STUDYOS + SDET GUIDE
// ═══════════════════════════════════════════════

window.CHAP_MAP = {"Fundamentos HTTP y REST": "api-basics", "Status codes y headers": "api-basics", "RestAssured setup + pom.xml": "project1", "PostsTest.java — happy path": "project1", "JSON Schema validation": "api-testing", "Negative tests y boundaries": "api-testing", "Auth testing — JWT y OAuth": "auth", "Security checklist — IDOR, XSS": "auth", "Data-driven tests @ParameterizedTest": "project1", "Allure reporting": "project1", "UsersTest.java completo": "project1", "CommentsTest.java completo": "project1", "Pact contract tests": "project2", "WireMock stubs": "project2", "CI/CD — GitHub Actions gate": "cicd", "k6 performance gates": "cicd", "Pipelines y stages": "cicd", "GitHub Actions basics": "cicd", "Quality gates": "cicd", "Docker fundamentals": "project2", "Docker Compose para tests": "project2", "Matrix builds": "project2", "Environments y secrets": "cicd", "Allure + artefactos": "project2", "Setup y configuración": "playwright", "API tests con request fixture": "playwright", "E2E tests básicos": "playwright", "Page Object Model": "playwright", "Hybrid API + UI tests": "playwright", "Visual regression testing": "project-playwright", "Network interception": "project-playwright", "Cross-browser testing": "project-playwright", "Debugging y traces": "playwright", "GitHub Actions integration": "cicd", "demoqa.com proyecto completo": "project-playwright", "Dev Org setup + SF CLI": "sf-overview", "Apex basics": "apex-testing", "@isTest y @TestSetup": "apex-testing", "HttpCalloutMock": "apex-testing", "System.runAs() y FLS": "apex-testing", "Governor limits testing": "apex-testing", "Debug logs reading": "apex-testing", "LWC Jest tests": "apex-testing", "Batch Apex testing": "apex-testing", "Platform Events testing": "sf-project", "Flow testing en Apex": "sf-project", "SF CLI CI/CD pipeline": "sf-project", "Multi-org regression": "sf-project", "Copado basics": "sf-project", "Colecciones y workspaces": "project-postman", "Variables de entorno": "project-postman", "pm.test assertions": "project-postman", "Pre-request scripts": "project-postman", "Schema validation": "api-testing", "Chaining con env variables": "project-postman", "Collection Runner": "project-postman", "Data-driven con CSV": "project-postman", "Newman CLI": "project-postman", "HTML reports": "project-postman", "GitHub Actions + Newman": "project-postman", "Monitors": "project-postman", "Mock servers": "project-postman", "API documentation": "frameworks", "Flows (nuevo)": "project-postman", "Contract testing": "project2", "Performance testing": "cicd", "Negative test folder": "project-postman", "Advanced scripting": "project-postman", "Examen final": "cheatsheet", "API design patterns": "api-testing", "GraphQL testing": "frameworks", "gRPC testing": "frameworks"};
const CHAP_MAP = window.CHAP_MAP;


// ── GUIDE routing (from sdet-guide.html) ────────
const SECTIONS = ['dashboard','api-basics','api-testing','auth','cicd','frameworks',
  'sf-overview','apex-testing','playwright','sf-project','project1','project2',
  'project-postman','project-playwright','cheatsheet','study','notes','tracker','interview'];

function go(id) {
  SECTIONS.forEach(s => { document.getElementById('s-'+s).classList.toggle('active', s===id); });
  document.querySelectorAll('.sb-item').forEach(n => {
    n.classList.toggle('active', n.getAttribute('onclick') && n.getAttribute('onclick').includes("'"+id+"'"));
  });
  const panel = document.getElementById('panel-guide');
  if (panel) panel.scrollTo(0, 0);
  const crumb = document.getElementById('guide-crumb');
  if (crumb) crumb.textContent = id.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}

function toggleGroup(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}

// ── PANEL switching ─────────────────────────────
function switchPanel(panel) {
  document.getElementById('panel-dash').classList.toggle('visible', panel==='dash');
  document.getElementById('panel-guide').classList.toggle('visible', panel==='guide');
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.panel===panel));
  if (panel==='dash') window._dashApp && window._dashApp.$nextTick(()=>null);
}

// Navigate guide from dashboard chapter click
function openGuideSection(sectionId, chapName) {
  switchPanel('guide');
  go(sectionId);
  const crumb = document.getElementById('guide-crumb');
  if (crumb) crumb.textContent = chapName;
}

// ── Notes (guide) ───────────────────────────────
function saveNote() {
  try { localStorage.setItem('sdet_notes', document.getElementById('note-area').value); } catch(e){}
  const s = document.getElementById('note-status');
  if(s) { s.style.opacity='1'; setTimeout(()=>s.style.opacity='0',2000); }
}
function copyNote() { navigator.clipboard.writeText(document.getElementById('note-area').value).catch(()=>{}); }
function clearNote() {
  if(!confirm('¿Borrar todas las notas?')) return;
  const el = document.getElementById('note-area');
  if(el) el.value = '';
  try { localStorage.removeItem('sdet_notes'); } catch(e){}
}

// ── Supabase init + Auth guard ───────────────────
window._sb = null;
window._user = null;

(async () => {
  try {
    const cfg = await fetch('/api/config').then(r => r.json());
    if (!cfg.supabaseUrl) return; // local dev without Supabase
    window._sb = supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    const { data: { session } } = await window._sb.auth.getSession();
    if (!session) {
      window.location.href = '/login.html';
      return;
    }
    window._user = session.user;
    window.dispatchEvent(new CustomEvent('supabase-ready'));
  } catch (e) {
    console.warn('Supabase init failed (local dev?):', e.message);
  }
})();

// ── DASHBOARD Alpine app ─────────────────────────
function app() {
  return {
    // ── Routing ──
    view: (() => { const v = localStorage.getItem('stos_view'); return (v && (v === 'dashboard' || v === 'subjects' || v === 'pomodoro' || v === 'interview' || v === 'settings' || v.startsWith('subject-'))) ? v : 'dashboard'; })(),
    navigate(v) {
      this.view = v;
      localStorage.setItem('stos_view', v);
      this.$nextTick(() => document.getElementById('panel-dash').scrollTo(0, 0));
    },
    goGuide(sectionId) {
      if (sectionId) {
        switchPanel('guide');
        go(sectionId);
      } else {
        switchPanel('dash');
      }
    },
    goChapter(chapName, subjectId) {
      const sectionId = CHAP_MAP[chapName];
      if (sectionId) {
        openGuideSection(sectionId, chapName);
      }
    },

    navMain: [
      {id:'dashboard',icon:'⊞',label:'Dashboard'},
      {id:'pomodoro',icon:'🍅',label:'Pomodoro'},
      {id:'tasks',icon:'📋',label:'Tareas'},
      {id:'calendar',icon:'📅',label:'Calendario'},
    ],

    // ── Auth / user ──
    profileName: '',
    profileSaving: false,
    profileSaved: false,
    get userName() { return this.profileName || window._user?.user_metadata?.full_name?.split(' ')[0] || window._user?.email?.split('@')[0] || 'Usuario'; },
    async saveProfile() {
      this.profileSaving = true;
      try {
        localStorage.setItem('studyos_profileName', this.profileName);
        if (window._sb && window._user) {
          await window._sb.auth.updateUser({ data: { full_name: this.profileName } });
        }
        this.profileSaved = true;
        setTimeout(() => this.profileSaved = false, 2000);
      } catch(e) {}
      this.profileSaving = false;
    },
    async logout() {
      if (window._sb) await window._sb.auth.signOut();
      window.location.href = '/login.html';
    },

    // ── CV ──
    cvFile: null,
    cvFilename: '',
    cvAnalyzing: false,
    cvError: '',
    cvAnalysis: null,

    handleCVFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.cvFile = file;
      this.cvFilename = file.name;
      this.cvError = '';
    },

    async analyzeCV() {
      if (!this.cvFile) return;
      this.cvAnalyzing = true;
      this.cvError = '';
      try {
        const buffer = await this.cvFile.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        bytes.forEach(b => binary += String.fromCharCode(b));
        const fileBase64 = btoa(binary);
        const res = await fetch('/api/analyze-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64,
            mimeType: 'application/pdf',
            currentSubjects: this.subjects.map(s => ({ name: s.name })),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error');
        this.cvAnalysis = data.analysis;
        // add recommended subjects to learning path
        (data.analysis.recommended_subjects || []).forEach(s => this.subjects.push(s));
        this.saveProgress();
        // save analysis to Supabase profile
        if (window._sb && window._user) {
          await window._sb.from('profiles').upsert({
            id: window._user.id,
            cv_filename: this.cvFilename,
            cv_analysis: data.analysis,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        this.cvError = e.message;
      } finally {
        this.cvAnalyzing = false;
      }
    },

    // ── Interview ──
    interviewTopic: '',
    interviewMessages: [],
    interviewUserInput: '',
    interviewLoading: false,
    interviewStartTime: null,
    interviewHistory: JSON.parse(localStorage.getItem('stos_interview_history') || '[]'),

    _saveInterviewSession() {
      const userMsgs = this.interviewMessages.filter(m => m.role === 'user').length;
      if (!userMsgs) return;
      const duration = this.interviewStartTime ? Math.round((Date.now() - this.interviewStartTime) / 60000) : 0;
      const score = Math.min(100, Math.round(40 + userMsgs * 8 + (duration > 5 ? 10 : 0)));
      const entry = {
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        topic: this.interviewTopic || 'Tema libre',
        duration,
        score,
      };
      this.interviewHistory = [entry, ...this.interviewHistory].slice(0, 20);
      try { localStorage.setItem('stos_interview_history', JSON.stringify(this.interviewHistory)); } catch(e) {}
    },

    async startInterview() {
      this._saveInterviewSession();
      this.interviewMessages = [];
      this.interviewUserInput = '';
      this.interviewStartTime = Date.now();
      await this.sendInterviewMessage('__start__');
    },

    startInterviewWithQuestion(q) {
      this.navigate('interview');
      this._saveInterviewSession();
      this.interviewMessages = [];
      this.interviewStartTime = Date.now();
      this.$nextTick(() => this.sendInterviewMessage('__start__'));
    },

    async sendInterviewMessage(override) {
      const text = override === '__start__' ? '' : this.interviewUserInput.trim();
      if (!override && !text) return;

      if (text) {
        this.interviewMessages.push({ role: 'user', content: text });
        this.interviewUserInput = '';
      }

      this.interviewLoading = true;
      this.$nextTick(() => {
        const el = document.getElementById('interview-scroll');
        if (el) el.scrollTop = el.scrollHeight;
      });

      try {
        const cvSummary = this.cvAnalysis
          ? `${this.cvAnalysis.experience_summary} Skills: ${(this.cvAnalysis.skills || []).join(', ')}`
          : '';
        const res = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: this.interviewMessages.slice(-10),
            cvSummary,
            topic: this.interviewTopic,
            userName: this.profileName || this.userName,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        this.interviewMessages.push({ role: 'assistant', content: data.reply });
      } catch (e) {
        this.interviewMessages.push({ role: 'assistant', content: '⚠️ Error: ' + e.message });
      } finally {
        this.interviewLoading = false;
        this.$nextTick(() => {
          const el = document.getElementById('interview-scroll');
          if (el) el.scrollTop = el.scrollHeight;
        });
      }
    },

    // ── Supabase save / load ──
    async saveProgress() {
      if (!window._sb || !window._user) return;
      await window._sb.from('progress').upsert({
        user_id: window._user.id,
        subjects: JSON.stringify(this.subjects),
        tasks: JSON.stringify(this.tasks),
        updated_at: new Date().toISOString(),
      });
    },

    async loadProgress() {
      if (!window._sb || !window._user) return;
      const { data } = await window._sb.from('progress').select('*').eq('user_id', window._user.id).single();
      if (data?.subjects) {
        try { this.subjects = JSON.parse(data.subjects); } catch(e){}
      }
      if (data?.tasks) {
        try { this.tasks = JSON.parse(data.tasks); } catch(e){}
      }
      // load CV analysis
      const { data: profile } = await window._sb.from('profiles').select('*').eq('id', window._user.id).single();
      if (profile?.cv_analysis) {
        this.cvAnalysis = profile.cv_analysis;
        this.cvFilename = profile.cv_filename || '';
      }
    },

    // ── State ──
    streak: 0, pomosToday: 0, pomosGoal: 8,
    weekGoal: 35, currentWeek: 1,
    settings: { alarmOn: true, focusMode: false },
    pomoSettings: { work: 25, short: 5, long: 15 },
    taskFilter: 'all', newTask: '',

    // ── Subjects ──
    subjects: [
      {
        id:'api', name:'API Testing', icon:'🔬', pct:0, color:'blue', tag:'En curso', priority:1,
        chapters:'14/20 caps', hours:'18h', exam:'Jun 15',
        chapList: [
          {name:'Fundamentos HTTP y REST',done:false},{name:'Status codes y headers',done:false},
          {name:'RestAssured setup + pom.xml',done:false},{name:'PostsTest.java — happy path',done:false},
          {name:'JSON Schema validation',done:false},{name:'Negative tests y boundaries',done:false},
          {name:'Auth testing — JWT y OAuth',done:false},{name:'Security checklist — IDOR, XSS',done:false},
          {name:'Data-driven tests @ParameterizedTest',done:false},{name:'Allure reporting',done:false},
          {name:'UsersTest.java completo',done:false},{name:'CommentsTest.java completo',done:false},
          {name:'Pact contract tests',done:false},{name:'WireMock stubs',done:false},
          {name:'CI/CD — GitHub Actions gate',done:false},{name:'k6 performance gates',done:false},
          {name:'API design patterns',done:false},{name:'GraphQL testing',done:false},
          {name:'gRPC testing',done:false},{name:'Examen final',done:false},
        ]
      },
      {
        id:'cicd', name:'CI/CD', icon:'🚀', pct:0, color:'green', tag:'En curso', priority:4,
        chapters:'8/14 caps', hours:'12h', exam:null,
        chapList: [
          {name:'Pipelines y stages',done:false},{name:'GitHub Actions basics',done:false},
          {name:'Quality gates',done:false},{name:'Docker fundamentals',done:false},
          {name:'Docker Compose para tests',done:false},{name:'Matrix builds',done:false},
          {name:'Environments y secrets',done:false},{name:'Allure + artefactos',done:false},
          {name:'k6 performance gates',done:false},{name:'Pact contract tests',done:false},
          {name:'Slack notifications',done:false},{name:'Ephemeral environments',done:false},
          {name:'Multi-org deployment',done:false},{name:'Examen final',done:false},
        ]
      },
      {
        id:'playwright', name:'Playwright', icon:'🎭', pct:0, color:'purple', tag:'Iniciado', priority:3,
        chapters:'5/12 caps', hours:'8h', exam:'Jul 2',
        chapList: [
          {name:'Setup y configuración',done:false},{name:'API tests con request fixture',done:false},
          {name:'E2E tests básicos',done:false},{name:'Page Object Model',done:false},
          {name:'Hybrid API + UI tests',done:false},{name:'Visual regression testing',done:false},
          {name:'Network interception',done:false},{name:'Cross-browser testing',done:false},
          {name:'Debugging y traces',done:false},{name:'GitHub Actions integration',done:false},
          {name:'demoqa.com proyecto completo',done:false},{name:'Examen final',done:false},
        ]
      },
      {
        id:'sf', name:'Apex/Salesforce', icon:'☁', pct:0, color:'orange', tag:'Pendiente', priority:5,
        chapters:'3/15 caps', hours:'5h', exam:'Jul 20',
        chapList: [
          {name:'Dev Org setup + SF CLI',done:false},{name:'Apex basics',done:false},
          {name:'@isTest y @TestSetup',done:false},{name:'HttpCalloutMock',done:false},
          {name:'System.runAs() y FLS',done:false},{name:'Governor limits testing',done:false},
          {name:'Debug logs reading',done:false},{name:'LWC Jest tests',done:false},
          {name:'Batch Apex testing',done:false},{name:'Platform Events testing',done:false},
          {name:'Flow testing en Apex',done:false},{name:'SF CLI CI/CD pipeline',done:false},
          {name:'Multi-org regression',done:false},{name:'Copado basics',done:false},
          {name:'Examen final',done:false},
        ]
      },
      {
        id:'postman', name:'Postman', icon:'📮', pct:0, color:'green', tag:'Avanzado', priority:2,
        chapters:'17/20 caps', hours:'22h', exam:null,
        chapList: [
          {name:'Colecciones y workspaces',done:false},{name:'Variables de entorno',done:false},
          {name:'pm.test assertions',done:false},{name:'Pre-request scripts',done:false},
          {name:'Schema validation',done:false},{name:'Chaining con env variables',done:false},
          {name:'Collection Runner',done:false},{name:'Data-driven con CSV',done:false},
          {name:'Newman CLI',done:false},{name:'HTML reports',done:false},
          {name:'GitHub Actions + Newman',done:false},{name:'Monitors',done:false},
          {name:'Mock servers',done:false},{name:'API documentation',done:false},
          {name:'Flows (nuevo)',done:false},{name:'Contract testing',done:false},
          {name:'Performance testing',done:false},{name:'Negative test folder',done:false},
          {name:'Advanced scripting',done:false},{name:'Examen final',done:false},
        ]
      },
    ],

    get overallPct() {
      return Math.round(this.subjects.reduce((a,s)=>a+this.chapPct(s),0)/this.subjects.length);
    },

    // ── Deadlines ──
    getSubjectTag(s) {
      const pct = this.chapPct(s);
      if (pct === 100) return 'Completado';
      if (pct > 0) return 'En curso';
      return 'Pendiente';
    },
    get nextChapters() {
      return this.subjects
        .map(s => {
          const done = s.chapList.filter(c => c.done).length;
          const total = s.chapList.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const nextChap = s.chapList.find(c => !c.done);
          return { s, done, total, pct, nextChap };
        })
        .filter(({ nextChap }) => nextChap)
        .sort((a, b) => {
          // 1. in-progress first
          const aActive = a.pct > 0 ? 1 : 0;
          const bActive = b.pct > 0 ? 1 : 0;
          if (bActive !== aActive) return bActive - aActive;
          // 2. highest % among in-progress
          if (a.pct !== b.pct) return b.pct - a.pct;
          // 3. tiebreak by pedagogical priority (lower = first)
          return (a.s.priority || 99) - (b.s.priority || 99);
        })
        .slice(0, 4)
        .map(({ s, done, total, pct, nextChap }) => ({
          id: s.id,
          subject: s.name,
          color: s.color,
          icon: s.icon,
          title: nextChap.name,
          pct,
          done,
          total,
          reason: pct > 0
            ? `${done}/${total} caps · ${pct}% completado`
            : 'Siguiente: cap. 1',
          action: pct > 0 ? 'Continuar' : 'Empezar',
        }));
    },

    // ── Tasks ──
    tasks: [
      {id:1,text:'Leer cap 15 RestAssured',done:false,pri:'high'},
      {id:2,text:'Escribir PostsTest.java completo',done:false,pri:'high'},
      {id:3,text:'Configurar Docker Compose Proyecto 2',done:false,pri:'high'},
      {id:4,text:'Ejercicios Auth & Security',done:false,pri:'medium'},
      {id:5,text:'Instalar Playwright + primeros tests',done:false,pri:'medium'},
      {id:6,text:'Revisar cheat sheet CI/CD',done:false,pri:'low'},
      {id:7,text:'Crear Dev Org Salesforce',done:false,pri:'medium'},
      {id:8,text:'Newman CLI en pipeline',done:false,pri:'high'},
    ],
    get doneTasks(){ return this.tasks.filter(t=>t.done).length },
    get filteredTasks(){
      if(this.taskFilter==='pending') return this.tasks.filter(t=>!t.done);
      if(this.taskFilter==='done')    return this.tasks.filter(t=>t.done);
      return this.tasks;
    },
    toggleTask(i){ this.tasks[i].done=!this.tasks[i].done },
    deleteTask(id){ this.tasks=this.tasks.filter(t=>t.id!==id); },
    addTask(){
      if(!this.newTask.trim()) return;
      this.tasks.push({id:Date.now(),text:this.newTask.trim(),done:false,pri:'medium'});
      this.newTask='';
    },

    // ── Hours ──
    weekHours: [0,0,0,0,0,0,0],
    get totalHours(){ return this.weekHours.reduce((a,b)=>a+b,0) },
    get maxH(){ return Math.max(...this.weekHours,1) },
    get todayIdx(){ const d=new Date().getDay(); return d===0?6:d-1 },
    days: ['L','M','X','J','V','S','D'],
    activity: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],

    // ── Pomodoro ──
    pomoPhase:'work', running:false, donePomos:0, timerInterval:null, timeLeft:25*60,
    circ:2*Math.PI*60, circBig:2*Math.PI*96, pomoLog:[],
    phaseDur:{work:25*60,short:5*60,long:15*60},
    phaseNames:{work:'ENFOQUE',short:'DESCANSO CORTO',long:'DESCANSO LARGO'},
    get fmtTime(){
      const m=Math.floor(this.timeLeft/60).toString().padStart(2,'0');
      const s=(this.timeLeft%60).toString().padStart(2,'0');
      return m+':'+s;
    },
    get phaseLabel(){ return this.phaseNames[this.pomoPhase] },
    get dash(){
      return this.circ*(1-this.timeLeft/this.phaseDur[this.pomoPhase]);
    },
    get dashBig(){
      return this.circBig*(1-this.timeLeft/this.phaseDur[this.pomoPhase]);
    },
    setPhase(phase){
      this.pomoPhase=phase; this.timeLeft=this.phaseDur[phase];
      this.running=false; clearInterval(this.timerInterval);
    },
    toggleTimer(){
      if(this.running){ clearInterval(this.timerInterval); this.running=false; }
      else {
        this.running=true;
        this.timerInterval=setInterval(()=>{
          if(this.timeLeft>0){ this.timeLeft--; }
          else {
            clearInterval(this.timerInterval); this.running=false;
            const now=new Date().toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'});
            this.pomoLog.unshift({id:Date.now(),
              label:this.pomoPhase==='work'?`Sesión #${this.donePomos+1}`:'Descanso',
              type:this.pomoPhase, time:now,
              focus: this.pomoPhase==='work' ? this.pomoFocusLabel : ''});
            if(this.pomoPhase==='work'){
              this.donePomos=Math.min(4,this.donePomos+1); this.pomosToday++;
              this.setPhase(this.donePomos%4===0?'long':'short');
            } else { this.setPhase('work'); }
          }
        },1000);
      }
    },
    resetTimer(){
      clearInterval(this.timerInterval); this.running=false;
      this.timeLeft=this.phaseDur[this.pomoPhase];
    },
    applyPomoSettings(){
      this.phaseDur={work:this.pomoSettings.work*60,short:this.pomoSettings.short*60,long:this.pomoSettings.long*60};
      this.resetTimer();
    },

    // ── Chapter Notes ──
    notesOpen: {},
    toggleNotes(s, idx) {
      const key = s.id + '_' + idx;
      this.notesOpen = { ...this.notesOpen, [key]: !this.notesOpen[key] };
    },
    isNotesOpen(s, idx) {
      return !!this.notesOpen[s.id + '_' + idx];
    },


    // ── Pomodoro focus ──
    pomoFocusSubjectId: '',
    pomoFocusChapterName: '',
    get pomoFocusSubject() {
      return this.subjects.find(s => s.id === this.pomoFocusSubjectId) || null;
    },
    get pomoFocusLabel() {
      if (!this.pomoFocusSubjectId) return '';
      const s = this.pomoFocusSubject;
      if (!s) return '';
      return this.pomoFocusChapterName ? s.name + ' — ' + this.pomoFocusChapterName : s.name;
    },

    // ── Chapter / subject helpers ──
    resetTarget: null,
    deleteTarget: null,
    confirmDelete(s){ this.deleteTarget = this.deleteTarget === s.id ? null : s.id; },
    doDelete(s){
      this.subjects = this.subjects.filter(sub => sub.id !== s.id);
      this.deleteTarget = null;
      this.navigate('subjects');
      this.saveProgress();
    },
    chapPct(s){
      if(!s.chapList||!s.chapList.length) return 0;
      return Math.round(s.chapList.filter(c=>c.done).length/s.chapList.length*100);
    },
    syncSubjectPct(s){ s.pct=this.chapPct(s); },
    confirmReset(s){ this.resetTarget=this.resetTarget===s.id?null:s.id; },
    doReset(s){ s.chapList.forEach(ch=>ch.done=false); s.pct=0; this.resetTarget=null; this.saveProgress(); },

    // ── AI Guide View ──
    aiGuide: { subject: null, chapter: null, chapterIndex: 0, loading: false, quizOnly: false, error: '', content: null, quiz: null },
    _guideSession: 0,

    async openAIGuide(subject, chapter, chapterIndex, quizOnly = false) {
      const session = ++this._guideSession;
      const alreadyDone = chapter?.done === true;
      this.aiGuide = {
        subject, chapter, chapterIndex, loading: !quizOnly, quizOnly, error: '', content: null,
        quiz: { questions: [], answers: [null, null, null], loading: !alreadyDone, submitted: alreadyDone, score: alreadyDone ? 3 : 0, error: false },
      };
      this.navigate('ai-guide');

      const cacheKey = `guide_${subject.id}_${chapterIndex}`;
      const quizKey  = `quiz_${subject.id}_${chapterIndex}`;

      if (!quizOnly) {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) { this.aiGuide.content = JSON.parse(cached); this.aiGuide.loading = false; }
        } catch(e) {}
      }
      try {
        const cachedQ = localStorage.getItem(quizKey);
        if (cachedQ) { this.aiGuide.quiz.questions = JSON.parse(cachedQ); this.aiGuide.quiz.loading = false; }
      } catch(e) {}

      const tasks = [];

      if (!quizOnly && !this.aiGuide.content) {
        tasks.push(
          fetch('/api/generate-guide', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjectName: subject.name, chapterName: chapter.name, subjectReason: subject.reason || '' }),
          })
          .then(r => r.json())
          .then(data => {
            if (this._guideSession !== session) return;
            if (data.error) throw new Error(data.error);
            this.aiGuide.content = data.guide;
            try { localStorage.setItem(cacheKey, JSON.stringify(data.guide)); } catch(e) {}
          })
          .catch(e => { if (this._guideSession === session) this.aiGuide.error = e.message; })
          .finally(() => { if (this._guideSession === session) this.aiGuide.loading = false; })
        );
      }

      if (!this.aiGuide.quiz.questions.length) {
        tasks.push(
          fetch('/api/quiz', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjectName: subject.name, chapterName: chapter.name, chapterIndex, totalChapters: subject.chapList?.length || 0 }),
          })
          .then(r => r.json())
          .then(data => {
            if (this._guideSession !== session) return;
            if (data.questions) {
              this.aiGuide.quiz.questions = data.questions;
              try { localStorage.setItem(quizKey, JSON.stringify(data.questions)); } catch(e) {}
            }
          })
          .catch(() => { if (this._guideSession === session) this.aiGuide.quiz.error = true; })
          .finally(() => { if (this._guideSession === session) this.aiGuide.quiz.loading = false; })
        );
      }

      await Promise.all(tasks);
    },

    submitAIQuiz() {
      let score = 0;
      (this.aiGuide.quiz.questions || []).forEach((q, i) => {
        if (this.aiGuide.quiz.answers[i] === q.correct) score++;
      });
      this.aiGuide.quiz.score = score;
      this.aiGuide.quiz.submitted = true;
      if (score >= 2) {
        const s = this.aiGuide.subject;
        const idx = this.aiGuide.chapterIndex;
        if (s?.chapList?.[idx]) {
          s.chapList[idx].done = true;
          this.syncSubjectPct(s);
          this.saveProgress();
        }
      }
    },

    // ── AI Suggestions ──
    aiLoading: false,
    aiError: '',

    async fetchSuggestions() {
      this.aiLoading = true;
      this.aiError = '';
      try {
        const payload = this.subjects.map(s => ({
          name: s.name,
          pct: this.chapPct(s),
        }));
        const res = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subjects: payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error desconocido');
        data.suggestions.forEach(s => this.subjects.push(s));
        await this.saveProgress();
      } catch (e) {
        this.aiError = e.message;
      } finally {
        this.aiLoading = false;
      }
    },

    // ── Calendar ──
    calYear:new Date().getFullYear(), calMonth:new Date().getMonth(),
    get calLabel(){
      return new Date(this.calYear,this.calMonth,1).toLocaleDateString('es',{month:'long',year:'numeric'});
    },
    get calCells(){
      const today=new Date();
      const first=new Date(this.calYear,this.calMonth,1);
      const last=new Date(this.calYear,this.calMonth+1,0);
      let dow=first.getDay()===0?7:first.getDay();
      const cells=[];
      const evMap={};
      for(let i=dow-1;i>0;i--){
        const d=new Date(this.calYear,this.calMonth,1-i);
        cells.push({key:'p'+i,d:d.getDate(),inMonth:false,today:false,event:false,urgent:false,events:[]});
      }
      for(let d=1;d<=last.getDate();d++){
        const isToday=today.getFullYear()===this.calYear&&today.getMonth()===this.calMonth&&today.getDate()===d;
        const evs=evMap[d]||[];
        cells.push({key:'c'+d,d,inMonth:true,today:isToday,event:evs.length>0,urgent:evs.some(e=>e.urg),events:evs});
      }
      const rem=42-cells.length;
      for(let i=1;i<=rem;i++) cells.push({key:'n'+i,d:i,inMonth:false,today:false,event:false,urgent:false,events:[]});
      return cells;
    },
    prevMonth(){ if(this.calMonth===0){this.calMonth=11;this.calYear--;}else this.calMonth--; },
    nextMonth(){ if(this.calMonth===11){this.calMonth=0;this.calYear++;}else this.calMonth++; },

    // ── Misc ──
    get todayStr(){
      return new Date().toLocaleDateString('es',{weekday:'long',day:'numeric',month:'short'});
    },

    pomoSettings: {work:25,short:5,long:15},
    settings: {alarmOn:true,focusMode:false},

    // ── Settings persistence (localStorage) ──
    loadSettings() {
      try {
        const s = JSON.parse(localStorage.getItem('studyos_settings') || '{}');
        if (s.settings) Object.assign(this.settings, s.settings);
        if (s.pomoSettings) { Object.assign(this.pomoSettings, s.pomoSettings); this.applyPomoSettings(); }
        if (s.weekGoal != null) this.weekGoal = s.weekGoal;
        if (s.pomosGoal != null) this.pomosGoal = s.pomosGoal;
        if (s.currentWeek != null) this.currentWeek = s.currentWeek;
        const savedName = localStorage.getItem('studyos_profileName');
        if (savedName) this.profileName = savedName;
        else if (window._user?.user_metadata?.full_name) this.profileName = window._user.user_metadata.full_name;
      } catch(e) {}
    },
    _saveSettings() {
      try {
        localStorage.setItem('studyos_settings', JSON.stringify({
          settings: this.settings,
          pomoSettings: this.pomoSettings,
          weekGoal: this.weekGoal,
          pomosGoal: this.pomosGoal,
          currentWeek: this.currentWeek,
        }));
      } catch(e) {}
    },

    async init() {
      // Bust old quiz caches so improved prompt regenerates questions
      if (!localStorage.getItem('stos_quiz_cache_v2')) {
        Object.keys(localStorage).filter(k => k.startsWith('quiz_')).forEach(k => localStorage.removeItem(k));
        localStorage.setItem('stos_quiz_cache_v2', '1');
      }
      this.loadSettings();
      // Wait for Supabase auth before loading progress (auth init is async)
      if (window._sb) {
        await this.loadProgress();
      } else {
        window.addEventListener('supabase-ready', async () => {
          await this.loadProgress();
          if (!this.profileName && window._user?.user_metadata?.full_name) {
            this.profileName = window._user.user_metadata.full_name;
          }
        }, { once: true });
      }
      this.$watch('subjects', () => this._debounceSave(), { deep: true });
      this.$watch('tasks', () => this._debounceSave(), { deep: true });
      this.$watch('settings', () => this._saveSettings(), { deep: true });
      this.$watch('pomoSettings', () => this._saveSettings(), { deep: true });
      this.$watch('weekGoal', () => this._saveSettings());
      this.$watch('pomosGoal', () => this._saveSettings());
      this.$watch('currentWeek', () => this._saveSettings());
    },

    _saveTimer: null,
    _debounceSave() {
      clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => this.saveProgress(), 1500);
    },
  };
}

// ── Guide notes from localStorage ───────────────
document.addEventListener('DOMContentLoaded', () => {
  try {
    const saved = localStorage.getItem('sdet_notes');
    const el = document.getElementById('note-area');
    if (saved && el) el.value = saved;
  } catch(e) {}

  // Load tracker state
  try {
    const st = JSON.parse(localStorage.getItem('sdet_tracker_v3') || '{}');
    window._trackerState = st;
  } catch(e) {}

  // Task lists definitions for the tracker
  const p1_items = [
    "Configurar JDK 21 y Maven", "Crear proyecto api-test-suite", "Configurar dependencias en pom.xml",
    "Establecer ApiConfig.java baseURI", "T01: GET /posts returns 200 & 100 posts", "T02: GET /posts/1 returns schema & id=1",
    "T03: GET /posts?userId=1 returns filtered results", "T04: POST /posts returns 201 & generated id", "T05: PUT /posts/1 returns updated data",
    "T06: PATCH /posts/1 returns patched title", "T07: DELETE /posts/1 returns empty body", "T08: GET /posts/99999 returns 404",
    "Configurar schemas/post.json", "Validar adicionalProperties: false en schema", "Crear UsersTest.java",
    "T01 (Users): GET /users returns 10", "T02 (Users): Check nested address and company fields", "T03 (Users): GET /users/1/posts returns 10 posts",
    "T04 (Users): Filter by query param username", "T05 (Users): Verify todo items completion status", "T06 (Users): Invalid user IDs return 404",
    "Crear CommentsTest.java", "T01 (Comments): GET /comments returns 500", "T02 (Comments): Filter by query param postId",
    "T03 (Comments): Verify nested route results", "Integrar Allure report en pom.xml", "Generar primer reporte Allure local",
    "Crear workflow GitHub Actions básico", "Habilitar caché Maven en GHA workflow"
  ]; // 29 items

  const p2_items = [
    "Instalar Docker Desktop local", "Crear Dockerfile para tests", "Definir docker-compose.yml",
    "Levantar servicios locales en Docker", "Instalar Grafana k6", "Escribir script smoke.js en k6",
    "Configurar thresholds de performance en k6", "Ejecutar k6 smoke localmente", "Validar fallos de performance en k6",
    "Crear stub en WireMock", "Validar respuestas mock con JUnit", "Escribir tests Pact básicos",
    "Generar contrato Pact local", "Subir contrato a Pact Broker", "Configurar GitHub Actions matrix builds",
    "Habilitar cache de Docker layers en GHA", "Configurar secrets de GitHub Actions", "Ejecutar tests unitarios en pipeline",
    "Ejecutar tests funcionales en pipeline", "Ejecutar k6 performance gate en GHA", "Subir reportes Allure como artefactos GHA",
    "Configurar alertas en Slack desde pipeline"
  ]; // 22 items

  const concepts_items = [
    "Métodos HTTP y su idempotencia", "Status Codes de éxito (2xx) y redirección (3xx)", "Status Codes de error cliente (4xx) y servidor (5xx)",
    "Diferencia entre 401 Unauthorized y 403 Forbidden", "Estructura y campos clave de un JWT (JSON Web Token)", "Diferencia entre autenticación y autorización",
    "Vulnerabilidad de seguridad IDOR (Direct Object Reference)", "Vulnerabilidad de seguridad SQL injection en APIs", "Vulnerabilidad de seguridad XSS en payloads",
    "Concepto de Rate Limiting y código 429", "Qué es la validación estricta de esquemas JSON", "Diferencia entre pruebas de carga, estrés y picos",
    "Qué es Consumer-Driven Contract Testing (Pact)", "Para qué sirve hacer stubs o mocks con WireMock", "Qué es un Quality Gate en un pipeline de CI/CD"
  ]; // 15 items

  const study_items = [
    "Semana 1: Fundamentos HTTP y REST", "Semana 1: Herramientas curl y Postman", "Semana 2: Patrones de API Testing",
    "Semana 2: Primeros assertions en RestAssured", "Semana 3: Auth y Seguridad en APIs", "Semana 3: IDOR, SQLi y XSS",
    "Semana 4: CI/CD Pipelines básico", "Semana 4: GitHub Actions setup", "Semana 5: Docker y Mocking",
    "Semana 5: WireMock y Docker Compose", "Semana 6: Contract Testing", "Semana 6: Pact JVM integration",
    "Semana 7: Performance Testing con k6", "Semana 7: Performance gates en CI/CD", "Semana 8: Salesforce SDET basics",
    "Semana 8: Simulación de entrevistas y portafolio"
  ]; // 16 items

  const p3sf_items = [
    "Crear Dev Org Salesforce gratuita", "Instalar Salesforce CLI local", "Autenticar org con SF CLI",
    "Escribir primera clase Apex de prueba", "Usar anotación @isTest", "Configurar datos en @TestSetup",
    "Implementar HttpCalloutMock", "Mockear llamadas de API externas en Apex", "Validar permisos y FLS en tests",
    "Escribir tests usando System.runAs()", "Probar governor limits en Apex", "Ejecutar tests desde SF CLI",
    "Generar reporte de cobertura de código Apex", "Escribir Jest tests para LWC", "Instalar Node dependencias de LWC",
    "Mockear servicios wire en LWC", "Configurar pipeline CI/CD en GHA para Salesforce", "Configurar variables de entorno y auth CLI en GHA",
    "Ejecutar regression testing en multi-org", "Entender conceptos básicos de Copado"
  ]; // 20 items

  const p4postman_items = [
    "Crear cuenta y workspace en Postman", "Definir variables globales y de entorno", "Escribir assertions con pm.test",
    "Implementar scripts de Pre-request", "Guardar valores de respuesta en variables", "Crear colecciones de happy path",
    "Diseñar carpeta de negative tests", "Validar esquemas JSON en Postman", "Encadenar requests (chaining)",
    "Configurar Collection Runner", "Ejecutar pruebas con Newman CLI", "Generar reportes HTML con htmlextra",
    "Automatizar Newman en GitHub Actions", "Programar Postman Monitors en la nube", "Configurar Mock Servers en Postman",
    "Generar documentación de API interactiva", "Validar flujos con Postman Flows", "Configurar pruebas de contract testing",
    "Implementar pruebas de performance básicas"
  ]; // 19 items

  const p5playwright_items = [
    "Inicializar proyecto Playwright con TypeScript", "Configurar playwright.config.ts", "Escribir pure API tests con request fixture",
    "Diseñar Page Object Models (POM)", "Implementar LoginPage.ts", "Implementar FormsPage.ts",
    "Escribir e2e tests para formularios (demoqa)", "Escribir e2e tests para tablas (webtables)", "Implementar hybrid API + UI tests",
    "Realizar limpieza en afterAll vía API", "Escribir visual regression tests con toHaveScreenshot", "Interceptar tráfico de red (route.fulfill)",
    "Configurar cross-browser testing (chromium/firefox/webkit)", "Ejecutar pruebas con repeat-each para flake detection", "Depurar tests usando Playwright Trace Viewer",
    "Integrar tests Playwright en pipeline CI/CD de GHA"
  ]; // 16 items

  // Build the groups in the DOM
  buildGroup(p1_items, 'p1', 'tr-p1', 'p1-counter', 'p1-bar', 'blue');
  buildGroup(p2_items, 'p2', 'tr-p2', 'p2-counter', 'p2-bar', 'purple');
  buildGroup(concepts_items, 'concepts', 'tr-concepts', 'concepts-counter', 'concepts-bar', 'teal');
  buildGroup(study_items, 'study', 'tr-study', 'study-counter', 'study-bar', 'blue');
  buildGroup(p3sf_items, 'p3sf', 'tr-p3sf', 'p3sf-counter', 'p3sf-bar', 'red');
  buildGroup(p4postman_items, 'p4postman', 'tr-p4postman', 'p4postman-counter', 'p4postman-bar', 'teal');
  buildGroup(p5playwright_items, 'p5playwright', 'tr-p5playwright', 'p5playwright-counter', 'p5playwright-bar', 'amber');

  // Default to dash panel
  switchPanel('dash');
  updateTrackerAll();
});

// Guide tracker functions (reused from guide)
function buildGroup(items, key, bodyId, counterId, barId, accent) {
  const c = document.getElementById(bodyId);
  if (!c) return;
  const st = window._trackerState || {};
  items.forEach((item, i) => {
    const k = key+'_'+i;
    const done = !!st[k];
    const row = document.createElement('div');
    row.className = 'task-item' + (done ? ' done' : '');
    row.innerHTML = `<div class="task-cb ${done?'on':''}"><span ${done?'':'style="display:none"'}>✓</span></div><span class="task-lbl ${done?'done':''}">${item}</span>`;
    row.addEventListener('click', () => {
      st[k] = !st[k];
      window._trackerState = st;
      try { localStorage.setItem('sdet_tracker_v3', JSON.stringify(st)); } catch(e) {}
      row.classList.toggle('done', st[k]);
      const cb = row.querySelector('.task-cb');
      if(cb) cb.classList.toggle('on', st[k]);
      const lbl = row.querySelector('.task-lbl');
      if(lbl) lbl.classList.toggle('done', st[k]);
      updateTrackerAll();
    });
    c.appendChild(row);
  });
  updateGroupCounter(key, items.length, counterId, barId, accent);
}

function updateGroupCounter(key, total, cId, bId, accent) {
  const st = window._trackerState || {};
  const done = Object.keys(st).filter(k=>k.startsWith(key+'_')&&st[k]).length;
  const pct = total ? Math.round(done/total*100) : 0;
  const ce = document.getElementById(cId); if(ce) ce.textContent = done+' / '+total;
  const be = document.getElementById(bId); if(be) be.style.width = pct+'%';
}

function updateTrackerAll() {
  const TD_COUNTS = {
    p1:29, p2:22, concepts:15, study:16, p3sf:20, p4postman:19, p5playwright:16
  };
  const st = window._trackerState || {};
  const total = Object.values(TD_COUNTS).reduce((a,b)=>a+b,0);
  const done  = Object.keys(st).filter(k=>st[k]).length;
  const pct   = total ? Math.round(done/total*100) : 0;
  
  const pb = document.getElementById('progress-bar'); if(pb) pb.style.width=pct+'%';
  const pd = document.getElementById('pct-display');  if(pd) pd.textContent=pct+'%';
  const sb = document.getElementById('sb-badge');     if(sb) sb.textContent=pct+'%';

  // Update top tracker stats
  const tDone = document.getElementById('t-done'); if(tDone) tDone.textContent = done;
  const tTotal = document.getElementById('t-total'); if(tTotal) tTotal.textContent = total;
  const tPctLabel = document.getElementById('t-pct-label'); if(tPctLabel) tPctLabel.textContent = done + ' / ' + total + ' tasks';
  const tBar = document.getElementById('t-bar'); if(tBar) tBar.style.width = pct+'%';

  // Update individual project stats
  const getProjPct = (key, tot) => {
    const d = Object.keys(st).filter(k=>k.startsWith(key+'_')&&st[k]).length;
    return tot ? Math.round(d/tot*100) : 0;
  };
  const tp1 = document.getElementById('t-p1'); if(tp1) tp1.textContent = getProjPct('p1', TD_COUNTS.p1)+'%';
  const tp2 = document.getElementById('t-p2'); if(tp2) tp2.textContent = getProjPct('p2', TD_COUNTS.p2)+'%';
  const tp3 = document.getElementById('t-p3'); if(tp3) tp3.textContent = getProjPct('p3sf', TD_COUNTS.p3sf)+'%';
  const tp4 = document.getElementById('t-p4'); if(tp4) tp4.textContent = getProjPct('p4postman', TD_COUNTS.p4postman)+'%';
  const tp5 = document.getElementById('t-p5'); if(tp5) tp5.textContent = getProjPct('p5playwright', TD_COUNTS.p5playwright)+'%';
}
