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
        p_subjects: JSON.stringify(s),
        p_tasks: JSON.stringify(t),
      });
      if (error && (error.message || '').includes('function') && (error.message || '').includes('exist')) {
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

  const loadProgress = useCallback(async () => {
    if (!supabase || !user) return;
    try {
      const { data } = await supabase.from('progress').select('*').eq('user_id', user.id).single();
      const parsedSubjects = parseJSONB(data?.subjects);
      if (parsedSubjects) {
        setSubjects(parsedSubjects);
        localStorage.setItem('studit_subjects', JSON.stringify(parsedSubjects));
      }
      const parsedTasks = parseJSONB(data?.tasks);
      if (parsedTasks) {
        setTasks(parsedTasks);
        localStorage.setItem('studit_tasks', JSON.stringify(parsedTasks));
      }
    } catch (e) { /* ignore */ }
  }, [user]);

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
