import { createContext, useContext, useEffect, useRef } from 'react';
import { usePomodoro } from './usePomodoro';
import { supabase } from '../lib/supabaseClient';

const TimerContext = createContext(null);

export function TimerProvider({ children }) {
  const timer = usePomodoro();
  const loggedRef = useRef(new Set());

  useEffect(() => {
    const latest = timer.pomoLog[0];
    if (!latest || latest.type !== 'work' || !latest.subjectId) return;
    if (loggedRef.current.has(latest.id)) return;
    loggedRef.current.add(latest.id);

    const log = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      try {
        await fetch('/api/pomodoro-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({
            subjectId: latest.subjectId,
            chapterName: latest.chapterName || null,
            durationMinutes: latest.durationMinutes || 25,
          }),
        });
      } catch (e) { /* silent */ }
    };
    log();
  }, [timer.pomoLog]);

  return <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}
