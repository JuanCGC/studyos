import { useTimer } from '../hooks/TimerContext';

export default function PomodoroView({
  subjects,
}) {
  const {
    phase, timeLeft, fmtTime, phaseLabel, running, donePomos, dashBig, CIRC_BIG,
    toggleTimer, resetTimer, setPhase, focusLabel, pomosToday, pomoLog,
    focusSubjectId, setFocusSubjectId, focusChapterName, setFocusChapterName,
  } = useTimer();
  const focusSubject = subjects.find(s => s.id === focusSubjectId);

  return (
    <div className="view pomo-view">
      <div className="sh mb20">
        <span className="st">Pomodoro Timer</span>
        <span className={'chip ' + (phase === 'work' ? 'blue' : 'green')}>{phase === 'work' ? 'Focus' : 'Break'}</span>
      </div>

      <div className="card" style={{ maxWidth: 480, margin: '0 auto 20px', padding: '16px 18px' }}>
        <div style={{ fontSize: 11, color: 'var(--t4)', fontFamily: 'var(--mono)', letterSpacing: '.08em', marginBottom: 10 }}>WHAT ARE YOU STUDYING?</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            value={focusSubjectId}
            onChange={e => { setFocusSubjectId(e.target.value); setFocusChapterName(''); }}
            style={{ flex: 1, minWidth: 160, background: 'var(--layer)', border: '1px solid var(--border2)', borderRadius: 8, padding: '9px 10px', fontSize: 14, color: 'var(--t1)', fontFamily: 'var(--font)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="">Select subject...</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {focusSubjectId && (
            <select
              value={focusChapterName}
              onChange={e => setFocusChapterName(e.target.value)}
              style={{ flex: 1, minWidth: 160, background: 'var(--layer)', border: '1px solid var(--border2)', borderRadius: 8, padding: '9px 10px', fontSize: 14, color: 'var(--t1)', fontFamily: 'var(--font)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">Select chapter...</option>
              {(focusSubject?.chapList || []).map((ch, i) => (
                <option key={i} value={ch.name} disabled={ch.done}>{String(i + 1).padStart(2, '0') + '. ' + ch.name}</option>
              ))}
            </select>
          )}
        </div>
        {focusLabel && (
          <div style={{ marginTop: 9, fontSize: 13, color: 'var(--blue2)', fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📍</span><span>{focusLabel}</span>
          </div>
        )}
      </div>

      <div className="pomo-tabs" style={{ maxWidth: 280, margin: '0 auto 20px' }}>
        <button className={'pomo-tab' + (phase === 'work' ? ' active' : '')} onClick={() => setPhase('work')}>25 min</button>
        <button className={'pomo-tab' + (phase === 'short' ? ' active' : '')} onClick={() => setPhase('short')}>5 min</button>
        <button className={'pomo-tab' + (phase === 'long' ? ' active' : '')} onClick={() => setPhase('long')}>15 min</button>
      </div>

      <div className="pomo-big-ring">
        <svg className="pbsvg" viewBox="0 0 220 220">
          <circle className="pbtrack" cx="110" cy="110" r="96" />
          <circle className={'pbfill ' + phase} cx="110" cy="110" r="96" strokeDasharray={CIRC_BIG} strokeDashoffset={dashBig} />
        </svg>
        <div className="pbcenter">
          <div className="pbtime">{fmtTime}</div>
          <div className="pbphase">{phaseLabel}</div>
        </div>
      </div>

      <div className="pomo-btns" style={{ justifyContent: 'center', marginBottom: 14 }}>
        <button className="pbtn" onClick={resetTimer}>↺ Reset</button>
        <button className={'pbtn' + (running ? ' stop' : ' go')} onClick={toggleTimer}>{running ? '⏸ Pause' : '▶ Start'}</button>
      </div>

      <div className="pomo-dots" style={{ marginBottom: 24 }}>
        {[0, 1, 2, 3].map((x, i) => (
          <div key={i} className={'pdot' + (i < donePomos ? ' done' : (i === donePomos && running ? ' cur' : ''))}></div>
        ))}
      </div>

      <div className="pomo-stat-row">
        <div className="pomo-scard"><div className="pomo-sv">{pomosToday}</div><div className="pomo-sl">Today</div></div>
        <div className="pomo-scard"><div className="pomo-sv">{donePomos}/4</div><div className="pomo-sl">This round</div></div>
        <div className="pomo-scard"><div className="pomo-sv">{Math.round(pomosToday * 25 / 60) + 'h'}</div><div className="pomo-sl">Total time</div></div>
      </div>

      <div className="sh">
        <span className="st">Today's Log</span>
      </div>
      <div className="pomo-log">
        {pomoLog.map(log => (
          <div key={log.id} className="plog-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <span>{log.label}</span>
              <span className={'badge ' + (log.type === 'work' ? 'blue' : 'green')}>{log.type === 'work' ? 'Focus' : 'Break'}</span>
              <span className="plog-time" style={{ marginLeft: 'auto' }}>{log.time}</span>
            </div>
            {log.focus && (
              <div style={{ fontSize: 12, color: 'var(--blue2)', fontFamily: 'var(--mono)' }}><i className="ph ph-book-open"></i> <span>{log.focus}</span></div>
            )}
          </div>
        ))}
        {!pomoLog.length && (
          <div className="txt-sm c-t4" style={{ textAlign: 'center', padding: 20 }}>
            No sessions recorded yet today
          </div>
        )}
      </div>
    </div>
  );
}
