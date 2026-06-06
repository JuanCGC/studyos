import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabaseClient';
import { useProgress } from './hooks/useProgress';
import { TimerProvider } from './hooks/TimerContext';
import { CHAP_MAP, EMBEDDED_GUIDES } from './data/subjects';
import { Layout } from './components/Layout';
import DashboardHome from './views/DashboardHome';
import SubjectDetail from './views/SubjectDetail';
import SubjectsView from './views/SubjectsView';
import TasksView from './views/TasksView';
import CalendarView from './views/CalendarView';
import PomodoroView from './views/PomodoroView';
import SettingsView from './views/SettingsView';
import InterviewView from './views/InterviewView';
import ChallengesView from './views/ChallengesView';
import AIGuideView from './views/AIGuideView';

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const {
    subjects, setSubjects, tasks, setTasks,
    chapPct, syncSubjectPct, overallPct,
    saveProgress, debounceSave, loadProgress,
  } = useProgress(user);

  // ── Routing ──
  const [view, setView] = useState(() => {
    const v = localStorage.getItem('stos_view');
    return v ? v : 'dashboard';
  });
  const navigate = useCallback((v) => {
    setView(v);
    localStorage.setItem('stos_view', v);
    if (v !== 'ai-guide') localStorage.removeItem('stos_ai_guide');
  }, []);

  // ── Profile ──
  const [profileName, setProfileName] = useState(() => localStorage.getItem('studyos_profileName') || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // ── Deep-Dive Comments ──
  const [showDeepDiveComments, setShowDeepDiveComments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studyos_deepDiveComments') || 'false');
    } catch { return false; }
  });
  useEffect(() => {
    localStorage.setItem('studyos_deepDiveComments', JSON.stringify(showDeepDiveComments));
  }, [showDeepDiveComments]);

  // ── AI Guide ──
  const [aiGuide, setAiGuide] = useState({
    subject: null, chapter: null, chapterIndex: 0, loading: false, quizOnly: false, error: '', content: null,
    quiz: null, keyConcept: '', labExpress: null, projectEvolution: null, language: 'JavaScript',
  });

  // ── Cache cleanup for users stuck with corrupted cache ──
  useEffect(() => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('guide_') || key.startsWith('quiz_'))) {
        try { JSON.parse(localStorage.getItem(key)); } catch (e) { localStorage.removeItem(key); }
      }
    }
  }, []);

  // ── Restore ai-guide state on refresh ──
  useEffect(() => {
    if (view !== 'ai-guide') return;
    if (aiGuide.subject) return;
    const saved = localStorage.getItem('stos_ai_guide');
    if (!saved) { setView('dashboard'); return; }
    try {
      const { subjectId, chapterIndex, quizOnly, language } = JSON.parse(saved);
      const subject = subjects.find(s => s.id === subjectId);
      if (!subject) { setView('dashboard'); return; }
      const chapter = subject.chapList?.[chapterIndex];
      if (!chapter) { setView('dashboard'); return; }
      const cacheKey = `guide_${subject.id}_${chapterIndex}`;
      const quizKey = `quiz_${subject.id}_${chapterIndex}`;
      let cachedContent = null, cachedQuiz = null;
      try { const g = localStorage.getItem(cacheKey); if (g) cachedContent = JSON.parse(g); } catch {}
      try { const q = localStorage.getItem(quizKey); if (q) cachedQuiz = JSON.parse(q); } catch {}
      if (!cachedContent && !quizOnly) { setView('dashboard'); return; }
      const embedded = EMBEDDED_GUIDES[subject.id + '_' + chapterIndex];
      setAiGuide({
        subject, chapter, chapterIndex, loading: !cachedContent, quizOnly, error: '', content: cachedContent,
        quiz: cachedQuiz ? { questions: cachedQuiz, answers: [null, null, null], loading: false, submitted: false, score: 0, error: false } : { questions: [], answers: [null, null, null], loading: false, submitted: false, score: 0, error: false },
        keyConcept: embedded?.kc || '', labExpress: embedded?.le || null, projectEvolution: embedded?.pe || null,
        language: language || 'JavaScript',
      });
    } catch { setView('dashboard'); }
  }, [view, subjects, aiGuide.subject, setView]);
  const [profileSaved, setProfileSaved] = useState(false);
  const userName = profileName || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  const saveProfile = useCallback(async () => {
    setProfileSaving(true);
    try {
      localStorage.setItem('studyos_profileName', profileName);
      if (user?.id) {
        if (supabase) {
          await supabase.auth.updateUser({ data: { full_name: profileName } });
        }
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (e) { /* ignore */ }
    setProfileSaving(false);
  }, [profileName, user]);

  // ── Settings ──
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studyos_settings') || '{}').settings || { alarmOn: true, focusMode: false };
    } catch { return { alarmOn: true, focusMode: false }; }
  });
  const [pomoSettings, setPomoSettingsRaw] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studyos_settings') || '{}').pomoSettings || { work: 25, short: 5, long: 15 };
    } catch { return { work: 25, short: 5, long: 15 }; }
  });
  const [weekGoal, setWeekGoalRaw] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studyos_settings') || '{}').weekGoal || 35;
    } catch { return 35; }
  });
  const [pomosGoal, setPomosGoalRaw] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studyos_settings') || '{}').pomosGoal || 8;
    } catch { return 8; }
  });
  const [currentWeek, setCurrentWeekRaw] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studyos_settings') || '{}').currentWeek || 1;
    } catch { return 1; }
  });

  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem('studyos_settings', JSON.stringify({ settings, pomoSettings, weekGoal, pomosGoal, currentWeek }));
    } catch (e) { /* ignore */ }
  }, [settings, pomoSettings, weekGoal, pomosGoal, currentWeek]);

  const setPomoSettings = useCallback((v) => {
    setPomoSettingsRaw(v);
    setTimeout(() => saveSettings(), 0);
  }, [saveSettings]);
  const setWeekGoal = useCallback((v) => {
    setWeekGoalRaw(v);
    setTimeout(() => saveSettings(), 0);
  }, [saveSettings]);
  const setPomosGoal = useCallback((v) => {
    setPomosGoalRaw(v);
    setTimeout(() => saveSettings(), 0);
  }, [saveSettings]);
  const setCurrentWeek = useCallback((v) => {
    setCurrentWeekRaw(v);
    setTimeout(() => saveSettings(), 0);
  }, [saveSettings]);

  // ── Tasks ──
  const [taskFilter, setTaskFilter] = useState('all');
  const [newTask, setNewTask] = useState('');
  const doneTasks = tasks.filter(t => t.done).length;
  const filteredTasks = useMemo(() => {
    if (taskFilter === 'pending') return tasks.filter(t => !t.done);
    if (taskFilter === 'done') return tasks.filter(t => t.done);
    return tasks;
  }, [tasks, taskFilter]);
  const toggleTask = useCallback((i) => {
    setTasks(prev => {
      const next = [...prev];
      next[i] = { ...next[i], done: !next[i].done };
      return next;
    });
    debounceSave();
  }, [debounceSave]);
  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    debounceSave();
  }, [debounceSave]);
  const addTask = useCallback(() => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), text: newTask.trim(), done: false, pri: 'medium' }]);
    setNewTask('');
    debounceSave();
  }, [newTask, debounceSave]);

  // ── Hours / Streak ──
  const [weekHours, setWeekHours] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studyos_weekHours') || 'null') || [0, 0, 0, 0, 0, 0, 0];
    } catch { return [0, 0, 0, 0, 0, 0, 0]; }
  });
  const totalHours = weekHours.reduce((a, b) => a + b, 0);
  const maxH = Math.max(...weekHours, 1);
  const todayIdx = ((d) => d === 0 ? 6 : d - 1)(new Date().getDay());
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const streak = 0;

  const [hoursPerSubject, setHoursPerSubject] = useState([]);
  const fetchHoursPerSubject = useCallback(async () => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    try {
      const r = await fetch('/api/analytics-hours', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (r.ok) setHoursPerSubject(await r.json());
    } catch { /* silent */ }
  }, []);
  useEffect(() => { fetchHoursPerSubject(); }, [fetchHoursPerSubject]);
  useEffect(() => {
    const id = setInterval(fetchHoursPerSubject, 30000);
    return () => clearInterval(id);
  }, [fetchHoursPerSubject]);

  const [flashcardSummary, setFlashcardSummary] = useState(null);
  const fetchFlashcardSummary = useCallback(async () => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    try {
      const r = await fetch('/api/analytics/flashcards-summary', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (r.ok) setFlashcardSummary(await r.json());
    } catch { /* silent */ }
  }, []);
  useEffect(() => { fetchFlashcardSummary(); }, [fetchFlashcardSummary]);

  // ── Calendar ──
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const calLabel = new Date(calYear, calMonth, 1).toLocaleDateString('en', { month: 'long', year: 'numeric' });
  const calCells = useMemo(() => {
    const today = new Date();
    const first = new Date(calYear, calMonth, 1);
    const last = new Date(calYear, calMonth + 1, 0);
    let dow = first.getDay() === 0 ? 7 : first.getDay();
    const cells = [];
    for (let i = dow - 1; i > 0; i--) {
      const d = new Date(calYear, calMonth, 1 - i);
      cells.push({ key: 'p' + i, d: d.getDate(), inMonth: false, today: false, event: false, urgent: false, events: [] });
    }
    for (let d = 1; d <= last.getDate(); d++) {
      const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === d;
      cells.push({ key: 'c' + d, d, inMonth: true, today: isToday, event: false, urgent: false, events: [] });
    }
    const rem = 42 - cells.length;
    for (let i = 1; i <= rem; i++) cells.push({ key: 'n' + i, d: i, inMonth: false, today: false, event: false, urgent: false, events: [] });
    return cells;
  }, [calYear, calMonth]);
  const prevMonth = useCallback(() => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  }, [calMonth]);
  const nextMonth = useCallback(() => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  }, [calMonth]);

  // ── CV ──
  const [cvFile, setCvFile] = useState(null);
  const [cvFilename, setCvFilename] = useState('');
  const [cvAnalyzing, setCvAnalyzing] = useState(false);
  const [cvError, setCvError] = useState('');
  const [cvAnalysis, setCvAnalysis] = useState(null);
  const handleCVFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCvFile(file);
    setCvFilename(file.name);
    setCvError('');
  }, []);
  const analyzeCV = useCallback(async () => {
    if (!cvFile) return;
    setCvAnalyzing(true);
    setCvError('');
    try {
      const buffer = await cvFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      bytes.forEach(b => binary += String.fromCharCode(b));
      const fileBase64 = btoa(binary);
      const res = await fetch('/api/analyze-cv', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64, mimeType: 'application/pdf', currentSubjects: subjects.map(s => ({ name: s.name })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setCvAnalysis(data.analysis);
      (data.analysis.recommended_subjects || []).forEach(s => setSubjects(prev => [...prev, s]));
      debounceSave();
    } catch (e) { setCvError(e.message); }
    finally { setCvAnalyzing(false); }
  }, [cvFile, subjects, debounceSave]);

  // ── Interview ──
  const [interviewTopic, setInterviewTopic] = useState('');
  const [interviewMessages, setInterviewMessages] = useState([]);
  const [interviewUserInput, setInterviewUserInput] = useState('');
  const [interviewLoading, setInterviewLoading] = useState(false);
  const interviewStartTimeRef = useRef(null);
  const [interviewHistory, setInterviewHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stos_interview_history') || '[]'); }
    catch { return []; }
  });
  const saveInterviewSession = useCallback(() => {
    const userMsgs = interviewMessages.filter(m => m.role === 'user').length;
    if (!userMsgs) return;
    const duration = interviewStartTimeRef.current ? Math.round((Date.now() - interviewStartTimeRef.current) / 60000) : 0;
    const score = Math.min(100, Math.round(40 + userMsgs * 8 + (duration > 5 ? 10 : 0)));
    const entry = { date: new Date().toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }), topic: interviewTopic || 'Free topic', duration, score };
    setInterviewHistory(prev => {
      const next = [entry, ...prev].slice(0, 20);
      try { localStorage.setItem('stos_interview_history', JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
  }, [interviewMessages, interviewTopic]);
  const startInterview = useCallback(async () => {
    saveInterviewSession();
    setInterviewMessages([]);
    setInterviewUserInput('');
    interviewStartTimeRef.current = Date.now();
    await sendInterviewMessage('__start__');
  }, [saveInterviewSession]);
  const sendInterviewMessage = useCallback(async (override) => {
    const text = override === '__start__' ? '' : interviewUserInput.trim();
    if (!override && !text) return;
    if (text) setInterviewMessages(prev => [...prev, { role: 'user', content: text }]);
    setInterviewUserInput('');
    setInterviewLoading(true);
    try {
      const cvSummary = cvAnalysis ? `${cvAnalysis.experience_summary} Skills: ${(cvAnalysis.skills || []).join(', ')}` : '';
      const res = await fetch('/api/interview', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: (text ? [...interviewMessages, { role: 'user', content: text }] : interviewMessages).slice(-10),
          cvSummary, topic: interviewTopic, userName: profileName || userName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInterviewMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setInterviewMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error: ' + e.message }]);
    }
    setInterviewLoading(false);
  }, [interviewUserInput, interviewMessages, cvAnalysis, interviewTopic, profileName, userName]);
  const startInterviewWithQuestion = useCallback((q) => {
    navigate('interview');
    saveInterviewSession();
    setInterviewMessages([]);
    interviewStartTimeRef.current = Date.now();
    setTimeout(() => sendInterviewMessage('__start__'), 100);
  }, [navigate, saveInterviewSession, sendInterviewMessage]);

  // ── Challenges ──
  const [challengeTopic, setChallengeTopic] = useState('');
  const [challengeTopicCustom, setChallengeTopicCustom] = useState('');
  const [challengeDifficulty, setChallengeDifficulty] = useState('medium');
  const [challengeLanguage, setChallengeLanguage] = useState('javascript');
  const [currentExercise, setCurrentExercise] = useState(null);
  const [challengeCode, setChallengeCode] = useState('');
  const [challengeRunning, setChallengeRunning] = useState(false);
  const [challengeResult, setChallengeResult] = useState(null);
  const [challengeGenerating, setChallengeGenerating] = useState(false);
  const [challengeError, setChallengeError] = useState('');
  const [challengeShowSolution, setChallengeShowSolution] = useState(false);
  const [challengeShowHints, setChallengeShowHints] = useState(false);
  const [challengeHistory, setChallengeHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stos_challenge_history') || '[]'); }
    catch { return []; }
  });
  const generateExercise = useCallback(async () => {
    const topic = challengeTopicCustom.trim() || challengeTopic;
    if (!topic) { setChallengeError('Select or type a topic first'); return; }
    setChallengeGenerating(true);
    setChallengeError('');
    setCurrentExercise(null);
    setChallengeCode('');
    setChallengeResult(null);
    setChallengeShowSolution(false);
    setChallengeShowHints(false);
    try {
      const res = await fetch('/api/exercise', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty: challengeDifficulty, language: challengeLanguage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error generating exercise');
      setCurrentExercise(data.exercise);
      setChallengeCode(data.exercise.starterCode || '');
    } catch (e) { setChallengeError(e.message); }
    finally { setChallengeGenerating(false); }
  }, [challengeTopicCustom, challengeTopic, challengeDifficulty, challengeLanguage]);
  const runChallenge = useCallback(() => {
    if (!currentExercise || !challengeCode.trim()) return;
    setChallengeRunning(true);
    setChallengeResult(null);
    try {
      const tc = currentExercise.testCases || [];
      const fnName = currentExercise.functionName || 'solution';
      let userFn;
      try {
        userFn = new Function(`${challengeCode}; return ${fnName};`)();
      } catch (e) {
        setChallengeResult({ error: 'Syntax error: ' + e.message, passed: 0, total: tc.length, results: [] });
        setChallengeRunning(false);
        return;
      }
      let passed = 0;
      const results = tc.map((t, i) => {
        try {
          const got = userFn(t.input);
          const ok = JSON.stringify(got) === JSON.stringify(t.expected);
          if (ok) passed++;
          return { t: i + 1, s: ok ? 'PASS' : 'FAIL', got: JSON.stringify(got), exp: JSON.stringify(t.expected), label: t.label || '' };
        } catch (e) {
          return { t: i + 1, s: 'ERROR', err: e.message, label: t.label || '' };
        }
      });
      setChallengeResult({ passed, total: tc.length, results });
      if (passed === tc.length && tc.length > 0) {
        const entry = {
          date: new Date().toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }),
          topic: currentExercise?.topic || '', title: currentExercise?.title || '',
          difficulty: currentExercise?.difficulty || '', language: challengeLanguage, passed: true,
        };
        setChallengeHistory(prev => {
          const next = [entry, ...prev].slice(0, 50);
          try { localStorage.setItem('stos_challenge_history', JSON.stringify(next)); } catch (e) { /* ignore */ }
          return next;
        });
      }
    } catch (e) { setChallengeResult({ error: e.message }); }
    setChallengeRunning(false);
  }, [currentExercise, challengeCode, challengeLanguage]);

  // ── AI Guide ──
  const guideSessionRef = useRef(0);

  const openAIGuide = useCallback(async (subject, chapter, chapterIndex, quizOnly = false, language) => {
    const session = ++guideSessionRef.current;
    const alreadyDone = chapter?.done === true;
    const lang = language || localStorage.getItem('stos_ai_language') || subject.defaultLang || 'JavaScript';
    setAiGuide({
      subject, chapter, chapterIndex, loading: !quizOnly, quizOnly, error: '', content: null,
      quiz: { questions: [], answers: [null, null, null], loading: !alreadyDone, submitted: alreadyDone, score: alreadyDone ? 3 : 0, error: false },
      keyConcept: '', labExpress: null, projectEvolution: null,
      language: lang,
    });
    const embeddedKey = subject.id + '_' + chapterIndex;
    const embedded = EMBEDDED_GUIDES[embeddedKey];
    if (embedded) {
      setAiGuide(prev => ({ ...prev, keyConcept: embedded.kc, labExpress: embedded.le, projectEvolution: embedded.pe }));
    }
    navigate('ai-guide');
    localStorage.setItem('stos_ai_guide', JSON.stringify({ subjectId: subject.id, chapterIndex, quizOnly, language: lang }));
    const cacheKey = `guide_${subject.id}_${chapterIndex}`;
    const quizKey = `quiz_${subject.id}_${chapterIndex}`;
    if (!quizOnly) {
      try {
        let cached = localStorage.getItem(cacheKey);
        if (cached) {
          setAiGuide(prev => ({ ...prev, content: JSON.parse(cached), loading: false }));
        }
      } catch (e) { localStorage.removeItem(cacheKey); }
    }
    try {
      let cachedQ = localStorage.getItem(quizKey);
      if (cachedQ) {
        setAiGuide(prev => ({ ...prev, quiz: { ...prev.quiz, questions: JSON.parse(cachedQ), loading: false } }));
      }
    } catch (e) { localStorage.removeItem(quizKey); }
    const tasks = [];
    const withTimeout = (url, opts, ms = 60000) => {
      const ctrl = new AbortController();
      const id = setTimeout(() => ctrl.abort(), ms);
      return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(id));
    };
    if (!quizOnly && !localStorage.getItem(cacheKey)) {
      tasks.push(
        withTimeout('/api/generate-guide', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectName: subject.name, chapterName: chapter.name, language: lang,
            embeddedGuide: embedded ? { keyConcept: embedded.kc, labExpress: embedded.le, projectEvolution: embedded.pe } : null,
            showDeepDiveComments,
          }),
        })
          .then(r => r.json())
          .then(data => {
            if (guideSessionRef.current !== session) return;
            if (data.error) throw new Error(data.error);
            setAiGuide(prev => ({ ...prev, content: data.guide, loading: false }));
            try { if (data.guide) localStorage.setItem(cacheKey, JSON.stringify(data.guide)); } catch (e) { /* ignore */ }
          })
          .catch(e => {
            if (guideSessionRef.current !== session) return;
            const msg = e.name === 'AbortError' ? 'Request timed out. The AI guide took too long. Try again.' : e.message;
            setAiGuide(prev => ({ ...prev, error: msg, loading: false }));
          })
      );
    }
    if (!localStorage.getItem(quizKey)) {
      tasks.push(
        withTimeout('/api/quiz', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subjectName: subject.name, chapterName: chapter.name, chapterIndex, totalChapters: subject.chapList?.length || 0, language: lang }),
        })
          .then(r => r.json())
          .then(data => {
            if (guideSessionRef.current !== session) return;
            if (data.questions) {
              setAiGuide(prev => ({ ...prev, quiz: { ...prev.quiz, questions: data.questions, loading: false } }));
              try { localStorage.setItem(quizKey, JSON.stringify(data.questions)); } catch (e) { /* ignore */ }
            }
          })
          .catch(() => { if (guideSessionRef.current === session) setAiGuide(prev => ({ ...prev, quiz: { ...prev.quiz, error: true, loading: false } })); })
      );
    }
    await Promise.all(tasks);
  }, [navigate, showDeepDiveComments]);

  const submitAIQuiz = useCallback(() => {
    setAiGuide(prev => {
      const qs = prev.quiz?.questions || [];
      const ans = prev.quiz?.answers || [];
      let score = 0;
      qs.forEach((q, i) => { if (ans[i] === q.correct) score++; });
      const passed = score >= 2;
      if (passed) {
        const s = prev.subject;
        const idx = prev.chapterIndex;
        if (s?.chapList?.[idx]) {
          s.chapList[idx].done = true;
          syncSubjectPct(s);
          debounceSave();
        }
      }
      return { ...prev, quiz: { ...prev.quiz, submitted: true, score } };
    });
  }, [syncSubjectPct, debounceSave]);

  const regenerateGuide = useCallback(() => {
    localStorage.setItem('stos_ai_language', aiGuide.language);
    const { subject, chapter, chapterIndex, labExpress, keyConcept, projectEvolution } = aiGuide;
    if (!subject) return;
    const cacheKey = `guide_${subject.id}_${chapterIndex}`;
    localStorage.removeItem(cacheKey);
    setAiGuide(prev => ({ ...prev, content: null, loading: true, error: '' }));
    const session = ++guideSessionRef.current;
    fetch('/api/generate-guide', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectName: subject.name, chapterName: chapter.name, language: aiGuide.language,
        embeddedGuide: labExpress ? { keyConcept, labExpress, projectEvolution } : null,
        showDeepDiveComments,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (guideSessionRef.current !== session) return;
        if (data.error) throw new Error(data.error);
        setAiGuide(prev => ({ ...prev, content: data.guide, loading: false }));
        try { localStorage.setItem(cacheKey, JSON.stringify(data.guide)); } catch (e) { /* ignore */ }
      })
      .catch(e => { if (guideSessionRef.current === session) setAiGuide(prev => ({ ...prev, error: e.message, loading: false })); });
  }, [aiGuide, showDeepDiveComments]);

  // ── Subject helpers ──
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const confirmDelete = useCallback((s) => { setDeleteTarget(deleteTarget === s.id ? null : s.id); }, [deleteTarget]);
  const doDelete = useCallback((s) => {
    setSubjects(prev => prev.filter(sub => sub.id !== s.id));
    setDeleteTarget(null);
    navigate('subjects');
    debounceSave();
  }, [navigate, debounceSave]);
  const confirmReset = useCallback((s) => { setResetTarget(resetTarget === s.id ? null : s.id); }, [resetTarget]);
  const doReset = useCallback((s) => {
    s.chapList.forEach(ch => ch.done = false);
    s.pct = 0;
    setResetTarget(null);
    debounceSave();
  }, [debounceSave]);

  // ── Notes ──
  const [notesOpen, setNotesOpen] = useState({});
  const toggleNotes = useCallback((s, idx) => {
    const key = s.id + '_' + idx;
    setNotesOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);
  const isNotesOpen = useCallback((s, idx) => {
    return !!notesOpen[s.id + '_' + idx];
  }, [notesOpen]);

  // ── AI Suggestions ──
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const fetchSuggestions = useCallback(async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const payload = subjects.map(s => ({ name: s.name, pct: chapPct(s) }));
      const res = await fetch('/api/suggest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      data.suggestions.forEach(s => setSubjects(prev => [...prev, s]));
      debounceSave();
    } catch (e) { setAiError(e.message); }
    finally { setAiLoading(false); }
  }, [subjects, chapPct, debounceSave]);

  // ── Misc ──
  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'short' });
  }, []);

  // ── Load Supabase progress on mount ──
  useEffect(() => {
    if (!authLoading && user) {
      loadProgress();
    }
  }, [authLoading, user, loadProgress]);

  // ── Save on unmount ──
  useEffect(() => {
    const handle = () => { if (user) saveProgress(); };
    window.addEventListener('beforeunload', handle);
    return () => window.removeEventListener('beforeunload', handle);
  }, [user, saveProgress]);

  // ── Watchers ──
  useEffect(() => { debounceSave(); }, [subjects, tasks]);

  // ── Sync deep-dive preference to Supabase ──
  const syncDeepDivePref = useCallback(async () => {
    if (!supabase || !user) return;
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        preferences: { showDeepDiveComments },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch (e) { /* ignore */ }
  }, [user, showDeepDiveComments]);

  const loadProfilePreferences = useCallback(async () => {
    if (!supabase || !user) return;
    try {
      const { data } = await supabase.from('profiles').select('preferences').eq('id', user.id).single();
      if (data?.preferences?.showDeepDiveComments === true) {
        setShowDeepDiveComments(true);
      }
    } catch (e) { /* ignore */ }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      loadProfilePreferences();
    }
  }, [authLoading, user, loadProfilePreferences]);

  const deepDiveSyncTimer = useRef(null);
  useEffect(() => {
    clearTimeout(deepDiveSyncTimer.current);
    deepDiveSyncTimer.current = setTimeout(() => syncDeepDivePref(), 1500);
    return () => clearTimeout(deepDiveSyncTimer.current);
  }, [showDeepDiveComments, syncDeepDivePref]);

  // ── Interview helper ──
  const [clearInterviewHistory, setClearInterviewHistory] = useState(false);

  // ── View rendering ──
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardHome
          subjects={subjects}
          tasks={tasks}
          onNavigate={navigate}
          onToggleTask={toggleTask}
          chapPct={chapPct}
          overallPct={overallPct}
          weekHours={weekHours}
          totalHours={totalHours}
          maxH={maxH}
          weekGoal={weekGoal}
          hoursPerSubject={hoursPerSubject}
          flashcardSummary={flashcardSummary}
          days={days}
          todayIdx={todayIdx}
          calYear={calYear}
          calMonth={calMonth}
          calLabel={calLabel}
          calCells={calCells}
          prevMonth={prevMonth}
          nextMonth={nextMonth}
          streak={streak}
          aiLoading={aiLoading}
          aiError={aiError}
          fetchSuggestions={fetchSuggestions}
          doneTasks={doneTasks}
        />;
      case 'pomodoro':
        return <PomodoroView
          subjects={subjects}
        />;
      case 'tasks':
        return <TasksView
          tasks={tasks}
          onToggleTask={toggleTask}
          onAddTask={addTask}
          onDeleteTask={deleteTask}
          doneTasks={doneTasks}
          filteredTasks={filteredTasks}
          taskFilter={taskFilter}
          setTaskFilter={setTaskFilter}
          newTask={newTask}
          setNewTask={setNewTask}
          subjects={subjects}
        />;
      case 'calendar':
        return <CalendarView
          calLabel={calLabel}
          calCells={calCells}
          prevMonth={prevMonth}
          nextMonth={nextMonth}
        />;
      case 'subjects':
        return <SubjectsView
          subjects={subjects}
          onNavigate={navigate}
          chapPct={chapPct}
          overallPct={overallPct}
        />;
      case 'settings':
        return <SettingsView
          pomoSettings={pomoSettings}
          setPomoSettings={setPomoSettings}
          weekGoal={weekGoal}
          setWeekGoal={setWeekGoal}
          pomosGoal={pomosGoal}
          setPomosGoal={setPomosGoal}
          profileName={profileName}
          setProfileName={setProfileName}
          currentWeek={currentWeek}
          setCurrentWeek={setCurrentWeek}
          settings={settings}
          setSettings={setSettings}
          onSaveProfile={saveProfile}
          profileSaving={profileSaving}
          profileSaved={profileSaved}
          cvFile={cvFile}
          cvFilename={cvFilename}
          cvAnalyzing={cvAnalyzing}
          cvAnalysis={cvAnalysis}
          cvError={cvError}
          onCvFileChange={handleCVFile}
          onAnalyzeCv={analyzeCV}
        />;
      case 'challenges':
        return <ChallengesView
          subjects={subjects}
          challengeTopic={challengeTopic}
          setChallengeTopic={setChallengeTopic}
          challengeTopicCustom={challengeTopicCustom}
          setChallengeTopicCustom={setChallengeTopicCustom}
          challengeDifficulty={challengeDifficulty}
          setChallengeDifficulty={setChallengeDifficulty}
          challengeLanguage={challengeLanguage}
          setChallengeLanguage={setChallengeLanguage}
          challengeGenerating={challengeGenerating}
          onGenerateExercise={generateExercise}
          challengeError={challengeError}
          currentExercise={currentExercise}
          challengeCode={challengeCode}
          setChallengeCode={setChallengeCode}
          challengeRunning={challengeRunning}
          onRunChallenge={runChallenge}
          challengeResult={challengeResult}
          challengeShowHints={challengeShowHints}
          setChallengeShowHints={setChallengeShowHints}
          challengeShowSolution={challengeShowSolution}
          setChallengeShowSolution={setChallengeShowSolution}
          challengeHistory={challengeHistory}
          onClearChallengeHistory={() => { setChallengeHistory([]); localStorage.removeItem('stos_challenge_history'); }}
        />;
      case 'interview':
        return <InterviewView
          subjects={subjects}
          interviewTopic={interviewTopic}
          setInterviewTopic={setInterviewTopic}
          interviewMessages={interviewMessages}
          interviewUserInput={interviewUserInput}
          setInterviewUserInput={setInterviewUserInput}
          interviewLoading={interviewLoading}
          onStartInterview={startInterview}
          onSendMessage={sendInterviewMessage}
          interviewHistory={interviewHistory}
          onClearHistory={() => { setInterviewHistory([]); localStorage.removeItem('stos_interview_history'); }}
          cvAnalysis={cvAnalysis}
          profileName={profileName}
        />;
      case 'ai-guide':
        return <AIGuideView
          aiGuide={aiGuide}
          onRegenerateGuide={regenerateGuide}
          onSubmitQuiz={submitAIQuiz}
          onNavigate={navigate}
          onChangeLanguage={(lang) => {
            localStorage.setItem('stos_ai_language', lang);
            setAiGuide(prev => ({ ...prev, language: lang }));
          }}
          showDeepDiveComments={showDeepDiveComments}
          onToggleDeepDive={() => setShowDeepDiveComments(v => !v)}
        />;
      default:
        if (view.startsWith('subject-')) {
          const sid = view.replace('subject-', '');
          const subject = subjects.find(s => s.id === sid);
          if (!subject) return <div className="view"><p className="c-t4">Subject not found.</p></div>;
          return <SubjectDetail
            subject={subject}
            onNavigate={navigate}
            chapPct={chapPct}
            syncSubjectPct={syncSubjectPct}
            subjects={subjects}
            onDeleteSubject={doDelete}
            onResetSubject={doReset}
            notesOpen={notesOpen}
            toggleNotes={toggleNotes}
            isNotesOpen={isNotesOpen}
            CHAP_MAP={CHAP_MAP}
            onGoChapter={(chapName, sId) => {
              const sectionId = CHAP_MAP[chapName];
              if (sectionId) {
                navigate('ai-guide');
              }
            }}
            onOpenAIGuide={openAIGuide}
          />;
        }
        return <DashboardHome
          subjects={subjects}
          tasks={tasks}
          onNavigate={navigate}
          onToggleTask={toggleTask}
          chapPct={chapPct}
          overallPct={overallPct}
          weekHours={weekHours}
          totalHours={totalHours}
          maxH={maxH}
          weekGoal={weekGoal}
          days={days}
          todayIdx={todayIdx}
          calYear={calYear}
          calMonth={calMonth}
          calLabel={calLabel}
          calCells={calCells}
          prevMonth={prevMonth}
          nextMonth={nextMonth}
          streak={streak}
          doneTasks={doneTasks}
        />;
    }
  };

  if (authLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A', color: '#64748B', fontFamily: 'var(--mono)', fontSize: 14 }}>Loading...</div>;
  }

  return (
    <TimerProvider>
      <Layout
        view={view}
        onNavigate={navigate}
        subjects={subjects}
        chapPct={chapPct}
        todayStr={todayStr}
        currentWeek={currentWeek}
        onLogout={logout}
        userName={userName}
        streak={streak}
        hoursPerSubject={hoursPerSubject}
      >
        {renderView()}
      </Layout>
    </TimerProvider>
  );
}
