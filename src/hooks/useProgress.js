import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { SUBJECTS } from '../data/subjects';

const DEFAULT_TASKS = [
  { id: 1, text: 'Leer cap 15 RestAssured', done: false, pri: 'high' },
  { id: 2, text: 'Escribir PostsTest.java completo', done: false, pri: 'high' },
  { id: 3, text: 'Configurar Docker Compose Proyecto 2', done: false, pri: 'high' },
  { id: 4, text: 'Ejercicios Auth & Security', done: false, pri: 'medium' },
  { id: 5, text: 'Instalar Playwright + primeros tests', done: false, pri: 'medium' },
  { id: 6, text: 'Revisar cheat sheet CI/CD', done: false, pri: 'low' },
  { id: 7, text: 'Crear Dev Org Salesforce', done: false, pri: 'medium' },
  { id: 8, text: 'Newman CLI en pipeline', done: false, pri: 'high' },
];

export function useProgress(user) {
  const [subjects, setSubjects] = useState(() => {
    try {
      const saved = localStorage.getItem('studit_subjects');
      return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(SUBJECTS));
    } catch {
      return JSON.parse(JSON.stringify(SUBJECTS));
    }
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('studit_tasks');
      return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_TASKS));
    } catch {
      return JSON.parse(JSON.stringify(DEFAULT_TASKS));
    }
  });

  const subjectsRef = useRef(subjects);
  subjectsRef.current = subjects;
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const saveTimer = useRef(null);
  const initialLoadDone = useRef(false);

  const chapPct = useCallback((s) => {
    if (!s.chapList || !s.chapList.length) return 0;
    return Math.round(s.chapList.filter(c => c.done).length / s.chapList.length * 100);
  }, []);

  const syncSubjectPct = useCallback((s) => {
    s.pct = chapPct(s);
  }, [chapPct]);

  const overallPct = subjects.length ? Math.round(subjects.reduce((a, s) => a + chapPct(s), 0) / subjects.length) : 0;

  const saveProgress = useCallback(async () => {
    const s = subjectsRef.current;
    const t = tasksRef.current;
    try {
      localStorage.setItem('studit_subjects', JSON.stringify(s));
      localStorage.setItem('studit_tasks', JSON.stringify(t));
    } catch (e) { /* ignore */ }
    if (!supabase || !user) return;
    try {
      const { error } = await supabase.rpc('merge_progress', {
        p_user_id: user.id,
        p_subjects: s,
        p_tasks: t,
      });
      if (error) {
        await supabase.from('progress').upsert({
          user_id: user.id,
          subjects: s,
          tasks: t,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) { /* ignore */ }
  }, [user]);

  const debounceSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveProgress(), 1500);
  }, [saveProgress]);

  function parseJSONB(v) {
    if (!v) return null;
    if (typeof v === 'string') { try { return JSON.parse(v); } catch { return null; } }
    return v;
  }

  const syncToRemote = useCallback(async (s, t) => {
    if (!supabase || !user) return;
    try {
      const { error } = await supabase.rpc('merge_progress', {
        p_user_id: user.id,
        p_subjects: s,
        p_tasks: t,
      });
      if (error) {
        await supabase.from('progress').upsert({
          user_id: user.id,
          subjects: s,
          tasks: t,
          updated_at: new Date().toISOString(),
        });
      }
    } catch { /* ignore */ }
  }, [user]);

  const loadProgress = useCallback(async () => {
    if (!supabase || !user) {
      initialLoadDone.current = true;
      return;
    }

    let localSubjects = null;
    let localTasks = null;
    try {
      localSubjects = parseJSONB(localStorage.getItem('studit_subjects'));
      localTasks = parseJSONB(localStorage.getItem('studit_tasks'));
    } catch { /* ignore */ }

    try {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      const remoteSubjects = parseJSONB(data?.subjects);
      const remoteTasks = parseJSONB(data?.tasks);
      const hasRemoteSubjects = Array.isArray(remoteSubjects) && remoteSubjects.length > 0;
      const hasRemoteTasks = Array.isArray(remoteTasks) && remoteTasks.length > 0;
      const hasLocalSubjects = Array.isArray(localSubjects) && localSubjects.length > 0;
      const hasLocalTasks = Array.isArray(localTasks) && localTasks.length > 0;

      const finalSubjects = hasRemoteSubjects ? remoteSubjects : (hasLocalSubjects ? localSubjects : null);
      const finalTasks = hasRemoteTasks ? remoteTasks : (hasLocalTasks ? localTasks : null);

      if (finalSubjects) {
        setSubjects(finalSubjects);
        localStorage.setItem('studit_subjects', JSON.stringify(finalSubjects));
      }
      if (finalTasks) {
        setTasks(finalTasks);
        localStorage.setItem('studit_tasks', JSON.stringify(finalTasks));
      }

      if ((hasLocalSubjects && !hasRemoteSubjects) || (hasLocalTasks && !hasRemoteTasks)) {
        await syncToRemote(
          finalSubjects || subjectsRef.current,
          finalTasks || tasksRef.current,
        );
      }
    } catch { /* keep local state */ }
    finally {
      initialLoadDone.current = true;
    }
  }, [user, syncToRemote]);

  // Load from Supabase when user is available
  useEffect(() => {
    initialLoadDone.current = false;
    if (!user) {
      initialLoadDone.current = true;
      return;
    }
    loadProgress();
  }, [user, loadProgress]);

  // Debounced save — only after initial load to avoid overwriting DB with stale/empty state
  useEffect(() => {
    if (!initialLoadDone.current || !user) return;
    debounceSave();
  }, [subjects, tasks, user, debounceSave]);

  // Cross‑tab sync — storage event fires in other tabs when localStorage changes
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'studit_subjects' && e.newValue) {
        try { setSubjects(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === 'studit_tasks' && e.newValue) {
        try { setTasks(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return {
    subjects, setSubjects,
    tasks, setTasks,
    chapPct, syncSubjectPct, overallPct,
    saveProgress, debounceSave, loadProgress,
  };
}
