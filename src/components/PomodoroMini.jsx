import { useTimer } from '../hooks/TimerContext';

export default function PomodoroMini() {
  const {
    running, fmtTime, phase, phaseLabel,
    timeLeft, toggleTimer, resetTimer, changePhase,
    phaseDur, donePomos,
  } = useTimer();

  const isFocus = phase === 'work';
  const accent = isFocus ? 'var(--blue3)' : 'var(--green)';
  const bgAccent = isFocus ? 'rgba(59,130,246,.08)' : 'rgba(16,185,129,.08)';
  const pct = 1 - timeLeft / phaseDur[phase];

  return (
    <div style={{
      margin: '10px 12px', padding: '10px 12px', borderRadius: 10,
      background: running ? bgAccent : 'var(--layer)',
      border: '1px solid ' + (running ? accent : 'var(--border)'),
      transition: 'all .25s',
    }}>
      {running ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--mono)', color: accent, letterSpacing: '-.02em' }}>
              {fmtTime}
            </span>
            <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {phaseLabel}
            </span>
          </div>
          <div style={{ height: 3, borderRadius: 2, background: 'var(--layer2)', marginBottom: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: (pct * 100) + '%', background: accent, borderRadius: 2, transition: 'width 1s linear' }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={toggleTimer}
              style={{
                flex: 1, padding: '5px 0', borderRadius: 6, border: 'none',
                background: accent, color: '#fff', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--mono)',
              }}
            >⏸ Pause</button>
            <button
              onClick={resetTimer}
              style={{
                padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--t4)', fontSize: 11,
                cursor: 'pointer', fontFamily: 'var(--mono)',
              }}
            >■ Stop</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Pomodoro
            </span>
            <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: accent }}>{donePomos}/4</span>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 7 }}>
            {[
              { key: 'work', label: '25m' },
              { key: 'short', label: '5m' },
              { key: 'long', label: '15m' },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => changePhase(p.key)}
                style={{
                  flex: 1, padding: '3px 0', borderRadius: 5, border: 'none',
                  fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 600, cursor: 'pointer',
                  background: phase === p.key ? accent : 'var(--layer2)',
                  color: phase === p.key ? '#fff' : 'var(--t4)',
                  transition: 'all .15s',
                }}
              >{p.label}</button>
            ))}
          </div>
          <button
            onClick={toggleTimer}
            style={{
              width: '100%', padding: '6px 0', borderRadius: 6, border: 'none',
              background: accent, color: '#fff', fontSize: 11, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--mono)',
              transition: 'all .15s',
            }}
          >▶ Focus</button>
        </>
      )}
    </div>
  );
}
