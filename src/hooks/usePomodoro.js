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
  const donePomosRef = useRef(0);
  const startRef = useRef(0);
  const totalDurRef = useRef(25 * 60);
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
    totalDurRef.current = phaseDur[p];
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [phaseDur]);

  const toggleTimer = useCallback(() => {
    if (running) {
      clearInterval(timerRef.current);
      setRunning(false);
    } else {
      setRunning(true);
      startRef.current = Date.now();
      totalDurRef.current = phaseDur[phase];
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
        const remaining = Math.max(0, totalDurRef.current - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setRunning(false);
          const now = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
          const isWork = phase === 'work';
          donePomosRef.current = isWork ? donePomosRef.current + 1 : donePomosRef.current;
          if (isWork) {
            setDonePomos(donePomosRef.current);
            setPomosToday(pt => pt + 1);
            const nextPhase = donePomosRef.current % 4 === 0 ? 'long' : 'short';
            setPhase(nextPhase);
            setTimeLeft(phaseDur[nextPhase]);
            setPomoLog(l => [{
              id: Date.now(), label: `Session #${donePomosRef.current}`, type: 'work', time: now,
              focus: focusLabel, subjectId: focusSubjectId, chapterName: focusChapterName,
              durationMinutes: 25,
            }, ...l]);
          } else {
            setPhase('work');
            setTimeLeft(phaseDur.work);
            setPomoLog(l => [{
              id: Date.now(), label: 'Break', type: phase, time: now,
              focus: '', subjectId: '', chapterName: '', durationMinutes: 5,
            }, ...l]);
          }
        }
      }, 1000);
    }
  }, [running, phase, phaseDur, focusLabel]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setRunning(false);
    setTimeLeft(phaseDur[phase]);
  }, [phase, phaseDur]);

  const phaseRef = useRef(phase);
  const runningRef = useRef(running);
  const focusLabelRef = useRef(focusLabel);
  const focusSubjectIdRef = useRef(focusSubjectId);
  const focusChapterNameRef = useRef(focusChapterName);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { focusLabelRef.current = focusLabel; }, [focusLabel]);
  useEffect(() => { focusSubjectIdRef.current = focusSubjectId; }, [focusSubjectId]);
  useEffect(() => { focusChapterNameRef.current = focusChapterName; }, [focusChapterName]);

  useEffect(() => {
    const onVisible = () => {
      if (!runningRef.current) return;
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const remaining = Math.max(0, totalDurRef.current - elapsed);
      setTimeLeft(remaining);
      if (remaining > 0) return;
      clearInterval(timerRef.current);
      setRunning(false);
      const now = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
      if (phaseRef.current === 'work') {
        donePomosRef.current += 1;
        setDonePomos(donePomosRef.current);
        setPomosToday(pt => pt + 1);
        const nextPhase = donePomosRef.current % 4 === 0 ? 'long' : 'short';
        setPhase(nextPhase);
        setTimeLeft(phaseDur[nextPhase]);
        totalDurRef.current = phaseDur[nextPhase];
        setPomoLog(l => [{
          id: Date.now(), label: `Session #${donePomosRef.current}`, type: 'work', time: now,
          focus: focusLabelRef.current, subjectId: focusSubjectIdRef.current, chapterName: focusChapterNameRef.current,
          durationMinutes: 25,
        }, ...l]);
      } else {
        setPhase('work');
        setTimeLeft(phaseDur.work);
        totalDurRef.current = phaseDur.work;
        setPomoLog(l => [{
          id: Date.now(), label: 'Break', type: phaseRef.current, time: now,
          focus: '', subjectId: '', chapterName: '', durationMinutes: 5,
        }, ...l]);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [phaseDur]);

  useEffect(() => { donePomosRef.current = donePomos; }, [donePomos]);

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
