import { useState, useCallback, useRef } from 'react';
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

  const saveTimer = useRef(null);

  const chapPct = useCallback((s) => {
    if (!s.chapList || !s.chapList.length) return 0;
    return Math.round(s.chapList.filter(c => c.done).length / s.chapList.length * 100);
  }, []);

  const syncSubjectPct = useCallback((s) => {
    s.pct = chapPct(s);
  }, [chapPct]);

  const overallPct = Math.round(subjects.reduce((a, s) => a + chapPct(s), 0) / subjects.length);

  const saveProgress = useCallback(async () => {
    try {
      localStorage.setItem('studit_subjects', JSON.stringify(subjects));
      localStorage.setItem('studit_tasks', JSON.stringify(tasks));
    } catch (e) { /* ignore */ }
    if (!supabase || !user) return;
    try {
      await supabase.from('progress').upsert({
        user_id: user.id,
        subjects: JSON.stringify(subjects),
        tasks: JSON.stringify(tasks),
        updated_at: new Date().toISOString(),
      });
    } catch (e) { /* ignore */ }
  }, [subjects, tasks, user]);

  const debounceSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveProgress(), 1500);
  }, [saveProgress]);

  const loadProgress = useCallback(async () => {
    if (!supabase || !user) return;
    try {
      const { data } = await supabase.from('progress').select('*').eq('user_id', user.id).single();
      if (data?.subjects) {
        const parsed = JSON.parse(data.subjects);
        setSubjects(parsed);
        localStorage.setItem('studit_subjects', JSON.stringify(parsed));
      }
      if (data?.tasks) {
        const parsed = JSON.parse(data.tasks);
        setTasks(parsed);
        localStorage.setItem('studit_tasks', JSON.stringify(parsed));
      }
    } catch (e) { /* ignore */ }
  }, [user]);

  return {
    subjects, setSubjects,
    tasks, setTasks,
    chapPct, syncSubjectPct, overallPct,
    saveProgress, debounceSave, loadProgress,
  };
}
