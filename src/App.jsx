import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { usePlan } from './hooks/usePlan';
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

import AIGuideView from './views/AIGuideView';
import OnboardingWizard from './views/OnboardingWizard';
import PlanGate from './components/PlanGate';

export default function App() {
  const { user, loading: authLoading, reconnecting, logout } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [onboardingChecking, setOnboardingChecking] = useState(true);
  const { plan, loading: planLoading } = usePlan(user);
  const [showPlanGate, setShowPlanGate] = useState(null);
  const isBootstrapping = authLoading || (user && (planLoading || onboardingChecking));

  useEffect(() => {
    if (!user) { setOnboardingChecking(false); return; }
    const flag = localStorage.getItem('studit_onboarding_done') === 'true';
    const uid = localStorage.getItem('studit_onboarding_uid');
    if (flag && uid === user.id) {
      setOnboardingDone(true);
      setOnboardingChecking(false);
      return;
    }
    supabase?.from('profiles').select('preferences').eq('id', user.id).single()
      .then(({ data }) => {
        if (data?.preferences?.onboarding_completed) {
          localStorage.setItem('studit_onboarding_done', 'true');
          localStorage.setItem('studit_onboarding_uid', user.id);
          setOnboardingDone(true);
        }
        setOnboardingChecking(false);
      })
      .catch(() => setOnboardingChecking(false));
  }, [user]);
  const {
    subjects, setSubjects, tasks, setTasks,
    chapPct, syncSubjectPct, overallPct,
    saveProgress, debounceSave, loadProgress,
  } = useProgress(user);
  const lockedCount = plan === 'free' ? Math.max(0, (subjects?.length || 0) - 3) : 0;
  const displaySubjects = (subjects || []).map((s, i) => ({ ...s, locked: plan === 'free' && i >= 3 }));

  // ── Routing ──
  const [view, setView] = useState(() => {
    const v = localStorage.getItem('studit_view');
    return v ? v : 'dashboard';
  });
  const navigate = useCallback((v) => {
    window.history.pushState({ view }, '', '/' + v);
    setView(v);
    localStorage.setItem('studit_view', v);
    if (v !== 'ai-guide') localStorage.removeItem('studit_ai_guide');
  }, [view]);

  useEffect(() => {
    const handler = (e) => {
      const prev = e.state?.view;
      if (prev) {
        setView(prev);
        localStorage.setItem('studit_view', prev);
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const fetchControllerRef = useRef(null);
  const viewOnFetchRef = useRef('');
  const getFetchSignal = useCallback(() => {
    if (fetchControllerRef.current) fetchControllerRef.current.abort();
    fetchControllerRef.current = new AbortController();
    viewOnFetchRef.current = view;
    return fetchControllerRef.current.signal;
  }, [view]);

  const isViewStale = useCallback(() => viewOnFetchRef.current !== view, [view]);

  useEffect(() => {
    return () => { if (fetchControllerRef.current) fetchControllerRef.current.abort(); };
  }, [view]);

  // ── Profile ──
  const [profileName, setProfileName] = useState(() => localStorage.getItem('studit_profileName') || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // ── Deep-Dive Comments ──
  const [showDeepDiveComments, setShowDeepDiveComments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studit_deepDiveComments') || 'false');
    } catch { return false; }
  });
  useEffect(() => {
    localStorage.setItem('studit_deepDiveComments', JSON.stringify(showDeepDiveComments));
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
    const saved = localStorage.getItem('studit_ai_guide');
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
      localStorage.setItem('studit_profileName', profileName);
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
      return JSON.parse(localStorage.getItem('studit_settings') || '{}').settings || { alarmOn: true, focusMode: false };
    } catch { return { alarmOn: true, focusMode: false }; }
  });
  const [pomoSettings, setPomoSettingsRaw] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studit_settings') || '{}').pomoSettings || { work: 25, short: 5, long: 15 };
    } catch { return { work: 25, short: 5, long: 15 }; }
  });
  const [weekGoal, setWeekGoalRaw] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studit_settings') || '{}').weekGoal || 35;
    } catch { return 35; }
  });
  const [pomosGoal, setPomosGoalRaw] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studit_settings') || '{}').pomosGoal || 8;
    } catch { return 8; }
  });
  const [currentWeek, setCurrentWeekRaw] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studit_settings') || '{}').currentWeek || 1;
    } catch { return 1; }
  });

  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem('studit_settings', JSON.stringify({ settings, pomoSettings, weekGoal, pomosGoal, currentWeek }));
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

  const onToggleChapter = useCallback((subjectId, chapterIndex) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;
      const chapList = sub.chapList?.map((c, i) =>
        i === chapterIndex ? { ...c, done: false } : c
      );
      return { ...sub, chapList };
    }));
    debounceSave();
  }, [debounceSave]);

  const onUpdateNotes = useCallback((subjectId, chapterIndex, value) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;
      const chapList = sub.chapList?.map((c, i) =>
        i === chapterIndex ? { ...c, notes: value } : c
      );
      return { ...sub, chapList };
    }));
    debounceSave();
  }, [debounceSave]);

  // ── Hours / Streak ──
  const [weekHours, setWeekHours] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('studit_weekHours') || 'null') || [0, 0, 0, 0, 0, 0, 0];
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
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const r = await fetch('/api/analytics-hours?timezone=' + encodeURIComponent(tz), {
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
      const signal = getFetchSignal();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        signal,
        body: JSON.stringify({ fileBase64, mimeType: 'application/pdf', currentSubjects: subjects.map(s => ({ name: s.name })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      if (isViewStale()) return;
      setCvAnalysis(data.analysis);
      if (plan === 'free' && subjects.length >= 3) {
        setShowPlanGate('cv');
      } else {
        const slots = plan === 'free' ? Math.max(0, 3 - subjects.length) : Infinity;
        const newSubjects = (data.analysis.recommended_subjects || []).slice(0, slots);
        if (newSubjects.length) setSubjects(prev => {
          const existing = new Set(prev.map(p => p.id));
          return [...prev, ...newSubjects.filter(s => !existing.has(s.id))];
        });
        debounceSave();
      }
    } catch (e) {
      if (e.name === 'AbortError') return;
      if (isViewStale()) return;
      setCvError(e.message);
    }
    finally { setCvAnalyzing(false); }
  }, [cvFile, subjects, debounceSave, plan, isViewStale]);

  const clearCv = useCallback(() => {
    setCvFile(null);
    setCvFilename('');
    setCvAnalysis(null);
    setCvError('');
  }, []);

  // ── Interview ──
  const [interviewTopic, setInterviewTopic] = useState('');
  const [interviewMessages, setInterviewMessages] = useState([]);
  const [interviewUserInput, setInterviewUserInput] = useState('');
  const [interviewLoading, setInterviewLoading] = useState(false);
  const interviewStartTimeRef = useRef(null);
  const [interviewHistory, setInterviewHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('studit_interview_history') || '[]'); }
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
      try { localStorage.setItem('studit_interview_history', JSON.stringify(next)); } catch (e) { /* ignore */ }
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
      const signal = getFetchSignal();
      const cvSummary = cvAnalysis ? `${cvAnalysis.experience_summary} Skills: ${(cvAnalysis.skills || []).join(', ')}` : '';
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        signal,
        body: JSON.stringify({
          messages: (text ? [...interviewMessages, { role: 'user', content: text }] : interviewMessages).slice(-10),
          cvSummary, topic: interviewTopic, userName: profileName || userName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInterviewMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      if (e.name === 'AbortError') return;
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

  // ── AI Guide ──
  const guideSessionRef = useRef(0);

  const openAIGuide = useCallback(async (subject, chapter, chapterIndex, quizOnly = false, language) => {
    const lang = language || localStorage.getItem('studit_ai_language') || subject.defaultLang || 'JavaScript';
    setAiGuide({
      subject, chapter, chapterIndex, loading: false, quizOnly, error: '', content: null,
      quiz: { questions: [], answers: [null, null, null], loading: false, submitted: false, score: 0, error: false },
      keyConcept: '', labExpress: null, projectEvolution: null,
      language: lang,
    });
    const embeddedKey = subject.id + '_' + chapterIndex;
    const embedded = EMBEDDED_GUIDES[embeddedKey];
    if (embedded) {
      setAiGuide(prev => ({ ...prev, keyConcept: embedded.kc, labExpress: embedded.le, projectEvolution: embedded.pe }));
    }
    navigate('ai-guide');
    localStorage.setItem('studit_ai_guide', JSON.stringify({ subjectId: subject.id, chapterIndex, quizOnly, language: lang }));
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
  }, [navigate]);

  const submitAIQuiz = useCallback(() => {
    let subjectId = null;
    let chapterIdx = -1;
    let quizDone = false;
    setAiGuide(prev => {
      const qs = prev.quiz?.questions || [];
      const ans = prev.quiz?.answers || [];
      let score = 0;
      qs.forEach((q, i) => { if (ans[i] === q.correct) score++; });
      const passed = score >= 2;
      if (passed && prev.subject?.chapList?.[prev.chapterIndex]) {
        subjectId = prev.subject.id;
        chapterIdx = prev.chapterIndex;
      }
      quizDone = passed;
      return { ...prev, quiz: { ...prev.quiz, submitted: true, score } };
    });
    if (quizDone && subjectId) {
      setSubjects(prev => prev.map(sub => {
        if (sub.id !== subjectId) return sub;
        const chapList = sub.chapList?.map((c, i) =>
          i === chapterIdx ? { ...c, done: true } : c
        );
        return { ...sub, chapList };
      }));
      debounceSave();
    }
  }, [debounceSave]);

  const answerQuiz = useCallback((qi, oi) => {
    setAiGuide(prev => {
      const answers = [...(prev.quiz?.answers || [])];
      answers[qi] = oi;
      return { ...prev, quiz: { ...prev.quiz, answers } };
    });
  }, []);

  const regenerateGuide = useCallback(() => {
    localStorage.setItem('studit_ai_language', aiGuide.language);
    const { subject, chapter, chapterIndex, labExpress, keyConcept, projectEvolution } = aiGuide;
    if (!subject) { setAiGuide(prev => ({ ...prev, error: 'No chapter selected.' })); return; }
    const cacheKey = `guide_${subject.id}_${chapterIndex}`;
    localStorage.removeItem(cacheKey);
    const quizKey = `quiz_${subject.id}_${chapterIndex}`;
    localStorage.removeItem(quizKey);
    setAiGuide(prev => ({ ...prev, content: null, loading: true, error: '',
      quiz: { questions: [], answers: [null, null, null], loading: true, submitted: false, score: 0, error: false },
    }));
    const sessionId = ++guideSessionRef.current;
    const lang = aiGuide.language;
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authHeader = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
      const signal = getFetchSignal();
      const promises = [
        fetch('/api/generate-guide', {
          method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader },
          signal,
          body: JSON.stringify({
            subjectName: subject.name, chapterName: chapter.name, language: lang,
            embeddedGuide: labExpress ? { keyConcept, labExpress, projectEvolution } : null,
            showDeepDiveComments,
          }),
        }),
        fetch('/api/quiz', {
          method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader },
          signal,
          body: JSON.stringify({
            subjectName: subject.name, chapterName: chapter.name, chapterIndex, totalChapters: subject.chapList?.length || 0,
          }),
        }),
      ];
      Promise.all(promises)
        .then(async ([guideRes, quizRes]) => {
          if (guideSessionRef.current !== sessionId) return;
          if (!guideRes.ok || !quizRes.ok) throw new Error('Regeneration failed');
          const [guideData, quizData] = await Promise.all([guideRes.json(), quizRes.json()]);
          if (guideSessionRef.current !== sessionId) return;
          setAiGuide(prev => ({ ...prev, content: guideData.guide, loading: false,
            quiz: { questions: quizData.questions, answers: [null, null, null], loading: false, submitted: false, score: 0, error: false },
          }));
          try { localStorage.setItem(cacheKey, JSON.stringify(guideData.guide)); } catch (e) { /* ignore */ }
          try { localStorage.setItem(quizKey, JSON.stringify(quizData.questions)); } catch (e) { /* ignore */ }
        })
        .catch(e => {
          if (e.name === 'AbortError') return;
          if (guideSessionRef.current === sessionId) setAiGuide(prev => ({ ...prev, error: e.message, loading: false }));
        });
    });
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
    supabase?.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        fetch(`/api/subjects?id=${s.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${session.access_token}` },
        }).catch(() => {});
      }
    });
  }, [navigate, debounceSave]);
  const confirmReset = useCallback((s) => { setResetTarget(resetTarget === s.id ? null : s.id); }, [resetTarget]);
  const doReset = useCallback((s) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== s.id) return sub;
      return {
        ...sub,
        chapList: sub.chapList?.map(ch => ({ ...ch, done: false })),
        pct: 0,
      };
    }));
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
      const signal = getFetchSignal();
      const payload = subjects.map(s => ({ name: s.name, pct: chapPct(s) }));
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        signal,
        body: JSON.stringify({ subjects: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      if (isViewStale()) return;
      if (plan === 'free' && subjects.length >= 3) {
        setShowPlanGate('suggest');
      } else {
        const slots = plan === 'free' ? Math.max(0, 3 - subjects.length) : Infinity;
        const newSugs = data.suggestions.slice(0, slots);
        if (newSugs.length) setSubjects(prev => {
          const existing = new Set(prev.map(p => p.id));
          return [...prev, ...newSugs.filter(s => !existing.has(s.id))];
        });
        debounceSave();
      }
    } catch (e) {
      if (e.name === 'AbortError') return;
      if (isViewStale()) return;
      setAiError(e.message);
    }
    finally { setAiLoading(false); }
  }, [subjects, chapPct, debounceSave, plan, isViewStale]);

  // ── Misc ──
  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'short' });
  }, []);

  // ── Redirect unauthenticated users to login ──
  useEffect(() => {
    if (!authLoading && !user && !reconnecting) {
      window.location.replace('/login.html');
    }
  }, [authLoading, user, reconnecting]);

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
          subjects={displaySubjects}
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
          subjects={displaySubjects}
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
          subjects={displaySubjects}
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
          subjects={displaySubjects}
          onNavigate={(v) => { if (v.startsWith('subject-')) { const s = subjects.find(x => x.id === v.replace('subject-', '')); if (s?.locked) { setShowPlanGate('subjects'); return; } } navigate(v); }}
          chapPct={chapPct}
          overallPct={overallPct}
          plan={plan}
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
          onClearCv={clearCv}
        />;
      case 'interview':
        return <InterviewView
          subjects={displaySubjects}
          interviewTopic={interviewTopic}
          setInterviewTopic={setInterviewTopic}
          interviewMessages={interviewMessages}
          interviewUserInput={interviewUserInput}
          setInterviewUserInput={setInterviewUserInput}
          interviewLoading={interviewLoading}
          onStartInterview={startInterview}
          onSendMessage={sendInterviewMessage}
          interviewHistory={interviewHistory}
          onClearHistory={() => { setInterviewHistory([]); localStorage.removeItem('studit_interview_history'); }}
          cvAnalysis={cvAnalysis}
          profileName={profileName}
        />;
      case 'ai-guide':
        return <AIGuideView
          aiGuide={aiGuide}
          onRegenerateGuide={regenerateGuide}
          onSubmitQuiz={submitAIQuiz}
          onAnswerQuiz={answerQuiz}
          onNavigate={navigate}
          onChangeLanguage={(lang) => {
            localStorage.setItem('studit_ai_language', lang);
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
            subjects={displaySubjects}
            onDeleteSubject={doDelete}
            onResetSubject={doReset}
            notesOpen={notesOpen}
            toggleNotes={toggleNotes}
            isNotesOpen={isNotesOpen}
            onToggleChapter={onToggleChapter}
            onUpdateNotes={onUpdateNotes}
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
          subjects={displaySubjects}
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

  if (isBootstrapping) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A', color: '#64748B', fontFamily: 'var(--mono)', fontSize: 14 }}>Loading...</div>;
  }

  if (reconnecting) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg)', color: 'var(--t2)', fontFamily: 'var(--mono)',
        padding: 32, textAlign: 'center', gap: 20,
      }}>
        <i className="ph ph-wifi-slash" style={{ fontSize: 48, color: 'var(--amber2)' }}></i>
        <h2 style={{ color: 'var(--t1)', margin: 0, fontSize: 20 }}>Connection lost</h2>
        <p style={{ fontSize: 13, maxWidth: 400, lineHeight: 1.6, color: 'var(--t3)' }}>
          Your data is safe in memory. We'll reconnect automatically once the network is back.
        </p>
        <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--purple2)', borderRadius: '50%', animation: 'spin .8s linear infinite' }}></div>
      </div>
    );
  }

  if (!user) return null;

  if (!onboardingDone) {
    return <OnboardingWizard plan={plan} onComplete={() => {
      localStorage.setItem('studit_onboarding_done', 'true');
      if (user) localStorage.setItem('studit_onboarding_uid', user.id);
      const savedSubjects = JSON.parse(localStorage.getItem('studit_subjects'));
      if (savedSubjects) setSubjects(savedSubjects);
      setOnboardingDone(true);
    }} />;
  }

  return (
    <TimerProvider>
      {showPlanGate && <PlanGate onClose={() => setShowPlanGate(null)} />}
      <Layout
        view={view}
        onNavigate={navigate}
        subjects={displaySubjects}
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
