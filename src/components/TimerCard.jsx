import { useTimer, useTimerTick } from '../hooks/TimerContext';

const CIRC = 2 * Math.PI * 60;

export default function TimerCard() {
  const { phase, setPhase, running, donePomos, resetTimer, toggleTimer } = useTimer();
  const { fmtTime, phaseLabel, dash } = useTimerTick();

  return (
    <div className="card">
      <div className="sh mb14">
        <span className="st">Timer</span>
        <span className={'chip ' + (phase === 'work' ? 'blue' : 'green')}>
          {phase === 'work' ? 'Focus' : 'Break'}
        </span>
      </div>
      <div className="pomo-wrap">
        <div className="pomo-tabs">
          <button className={'pomo-tab' + (phase === 'work' ? ' active' : '')} onClick={() => setPhase('work')}>25 min</button>
          <button className={'pomo-tab' + (phase === 'short' ? ' active' : '')} onClick={() => setPhase('short')}>5 min</button>
          <button className={'pomo-tab' + (phase === 'long' ? ' active' : '')} onClick={() => setPhase('long')}>15 min</button>
        </div>
        <div className="ring-wrap">
          <svg className="rsvg" viewBox="0 0 140 140">
            <circle className="rtrack" cx="70" cy="70" r="60" />
            <circle className={'rfill ' + phase} cx="70" cy="70" r="60"
              strokeDasharray={CIRC} strokeDashoffset={dash} />
          </svg>
          <div className="rcenter">
            <div className="rtime">{fmtTime}</div>
            <div className="rphase">{phaseLabel}</div>
          </div>
        </div>
        <div className="pomo-btns">
          <button className="pbtn" onClick={resetTimer}>↺</button>
          <button className={'pbtn' + (running ? ' stop' : ' go')} onClick={toggleTimer}>
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
        </div>
        <div className="pomo-dots">
          {[0, 1, 2, 3].map((x, i) => (
            <div
              key={i}
              className={'pdot' +
                (i < donePomos ? ' done' : '') +
                (i === donePomos && running ? ' cur' : '')
              }
            ></div>
          ))}
        </div>
      </div>
      <div className="div"></div>
      <div className="flex aic jbs txt-sm">
        <span className="c-t4">Completed sessions</span>
        <span className="mono c-blue">{donePomos}/4</span>
      </div>
    </div>
  );
}
