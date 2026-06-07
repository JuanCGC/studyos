import { createContext, useContext, useEffect, useRef, useMemo } from 'react';
import { usePomodoro } from './usePomodoro';
import { supabase } from '../lib/supabaseClient';

const TimerCtx = createContext(null);
const TimerTickCtx = createContext({ timeLeft: 25 * 60, fmtTime: '25:00', phaseLabel: 'FOCUS', dash: 0, dashBig: 0 });

export function TimerProvider({ children }) {
  const timer = usePomodoro();
  const loggedRef = useRef(new Set());

  useEffect(() => {
    const latest = timer.pomoLog[0];
    if (!latest || latest.type !== 'work' || !latest.subjectId) return;
    if (loggedRef.current.has(latest.id)) return;
    loggedRef.current.add(latest.id);

    const getToken = async () => {
      if (!supabase) return null;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return null;
      const expiresAt = session.expires_at;
      if (expiresAt && Date.now() / 1000 > expiresAt - 60) {
        const { data: { session: refreshed } } = await supabase.auth.refreshSession();
        return refreshed?.access_token || null;
      }
      return session.access_token;
    };

    const log = async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        await fetch('/api/pomodoro-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            subjectId: latest.subjectId,
            chapterName: latest.chapterName || null,
            durationMinutes: latest.durationMinutes || 25,
            timezone: tz,
          }),
        });
      } catch (e) { /* silent */ }
    };
    log();
  }, [timer.pomoLog]);

  const tick = useMemo(() => ({
    timeLeft: timer.timeLeft,
    fmtTime: timer.fmtTime,
    phaseLabel: timer.phaseLabel,
    dash: timer.dash,
    dashBig: timer.dashBig,
  }), [timer.timeLeft, timer.fmtTime, timer.phaseLabel, timer.dash, timer.dashBig]);

  const stable = useMemo(() => ({
    phase: timer.phase,
    setPhase: timer.setPhase,
    changePhase: timer.changePhase,
    running: timer.running,
    donePomos: timer.donePomos,
    pomosToday: timer.pomosToday,
    pomoLog: timer.pomoLog,
    phaseDur: timer.phaseDur,
    focusSubjectId: timer.focusSubjectId,
    setFocusSubjectId: timer.setFocusSubjectId,
    focusChapterName: timer.focusChapterName,
    setFocusChapterName: timer.setFocusChapterName,
    focusLabel: timer.focusLabel,
    toggleTimer: timer.toggleTimer,
    resetTimer: timer.resetTimer,
  }), [
    timer.phase, timer.setPhase, timer.changePhase,
    timer.running, timer.donePomos, timer.pomosToday,
    timer.pomoLog, timer.phaseDur,
    timer.focusSubjectId, timer.setFocusSubjectId,
    timer.focusChapterName, timer.setFocusChapterName,
    timer.focusLabel,
    timer.toggleTimer, timer.resetTimer,
  ]);

  return (
    <TimerTickCtx.Provider value={tick}>
      <TimerCtx.Provider value={stable}>
        {children}
      </TimerCtx.Provider>
    </TimerTickCtx.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerCtx);
  if (!ctx) throw new Error('useTimer must be used within TimerProvider');
  return ctx;
}

export function useTimerTick() {
  return useContext(TimerTickCtx);
}
