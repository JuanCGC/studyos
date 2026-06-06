import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

const CIRC = 2 * Math.PI * 60;
const CIRC_BIG = 2 * Math.PI * 96;

export function usePomodoro() {
  const [phase, setPhase] = useState('work');
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [donePomos, setDonePomos] = useState(0);
  const [pomosToday, setPomosToday] = useState(0);
  const [pomoLog, setPomoLog] = useState([]);
  const [focusSubjectId, setFocusSubjectId] = useState('');
  const [focusChapterName, setFocusChapterName] = useState('');
  const timerRef = useRef(null);
  const phaseDur = useMemo(() => ({ work: 25 * 60, short: 5 * 60, long: 15 * 60 }), []);

  const fmtTime = useMemo(() => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    return m + ':' + s;
  }, [timeLeft]);

  const phaseNames = { work: 'FOCUS', short: 'SHORT BREAK', long: 'LONG BREAK' };
  const phaseLabel = phaseNames[phase] || '';

  const dash = CIRC * (1 - timeLeft / phaseDur[phase]);
  const dashBig = CIRC_BIG * (1 - timeLeft / phaseDur[phase]);

  const focusLabel = focusSubjectId && focusChapterName
    ? `${focusSubjectId} — ${focusChapterName}`
    : focusSubjectId || '';

  const changePhase = useCallback((p) => {
    setPhase(p);
    setTimeLeft(phaseDur[p]);
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [phaseDur]);

  const toggleTimer = useCallback(() => {
    if (running) {
      clearInterval(timerRef.current);
      setRunning(false);
    } else {
      setRunning(true);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev > 0) return prev - 1;
          clearInterval(timerRef.current);
          setRunning(false);
          const now = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
          setPomoLog(l => {
            const isWork = phase === 'work';
            return [{
              id: Date.now(),
              label: isWork ? `Session #${donePomos + 1}` : 'Break',
              type: phase, time: now,
              focus: isWork ? focusLabel : '',
            }, ...l];
          });
          if (phase === 'work') {
            setDonePomos(dp => { const n = Math.min(4, dp + 1); return n; });
            setPomosToday(pt => pt + 1);
            setPhase(dp => dp % 4 === 0 ? 'long' : 'short');
            setTimeLeft(phaseDur[phase % 4 === 0 ? 'long' : 'short']);
          } else {
            setPhase('work');
            setTimeLeft(phaseDur.work);
          }
          return prev;
        });
      }, 1000);
    }
  }, [running, phase, phaseDur, donePomos, focusLabel]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setRunning(false);
    setTimeLeft(phaseDur[phase]);
  }, [phase, phaseDur]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return {
    phase, setPhase: changePhase, changePhase, running, timeLeft, fmtTime, phaseLabel,
    donePomos, pomosToday, pomoLog, dash, dashBig, CIRC, CIRC_BIG,
    phaseDur,
    focusSubjectId, setFocusSubjectId, focusChapterName, setFocusChapterName, focusLabel,
    toggleTimer, resetTimer,
  };
}
