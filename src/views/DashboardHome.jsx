import { useState, useMemo } from 'react';
import { useTimer } from '../hooks/TimerContext';
import TimerCard from '../components/TimerCard';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getSubjectTag(pct) {
  if (pct === 100) return 'Completed';
  if (pct > 0) return 'In progress';
  return 'To Do';
}

function computeNextChapters(subjects, chapPct) {
  return subjects
    .map(s => {
      const done = s.chapList.filter(c => c.done).length;
      const total = s.chapList.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const nextChap = s.chapList.find(c => !c.done);
      return { s, done, total, pct, nextChap };
    })
    .filter(({ nextChap }) => nextChap)
    .sort((a, b) => {
      const aActive = a.pct > 0 ? 1 : 0;
      const bActive = b.pct > 0 ? 1 : 0;
      if (bActive !== aActive) return bActive - aActive;
      if (a.pct !== b.pct) return b.pct - a.pct;
      return (a.s.priority || 99) - (b.s.priority || 99);
    })
    .slice(0, 4)
    .map(({ s, done, total, pct, nextChap }) => ({
      id: s.id,
      subject: s.name,
      color: s.color,
      icon: s.icon,
      title: nextChap.name,
      pct,
      done,
      total,
      reason: pct > 0 ? `${done}/${total} ch · ${pct}% completed` : 'Next: ch. 1',
      action: pct > 0 ? 'Continue' : 'Start',
    }));
}

function computeCalCells(year, month) {
  const today = new Date();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  let dow = first.getDay() === 0 ? 7 : first.getDay();
  const cells = [];
  for (let i = dow - 1; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    cells.push({ key: 'p' + i, d: d.getDate(), inMonth: false, today: false, event: false, urgent: false });
  }
  for (let d = 1; d <= last.getDate(); d++) {
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    cells.push({ key: 'c' + d, d, inMonth: true, today: isToday, event: false, urgent: false });
  }
  const rem = 42 - cells.length;
  for (let i = 1; i <= rem; i++) {
    cells.push({ key: 'n' + i, d: i, inMonth: false, today: false, event: false, urgent: false });
  }
  return cells;
}

export default function DashboardHome({
  subjects, tasks,
  onNavigate, onToggleTask, chapPct, overallPct,
  weekHours, totalHours, maxH, weekGoal, hoursPerSubject,
  flashcardSummary,
}) {
  const pomodoro = useTimer();
  const { pomosToday } = pomodoro;
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  const calLabel = useMemo(
    () => new Date(calYear, calMonth, 1).toLocaleDateString('en', { month: 'long', year: 'numeric' }),
    [calYear, calMonth]
  );

  const calCells = useMemo(() => computeCalCells(calYear, calMonth), [calYear, calMonth]);

  const nextChapters = useMemo(() => computeNextChapters(subjects, chapPct), [subjects]);

  const doneTasks = useMemo(() => tasks.filter(t => t.done).length, [tasks]);

  const todayIdx = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  return (
    <div className="view">
      {/* ── Learning Path Banner ── */}
      <div className="ruta-banner">
        <div className="ruta-header">
          <div className="ruta-title">
            <span className="ruta-icon"><i className="ph ph-compass"></i></span>
            <div>
              <div className="ruta-label">Learning Path</div>
              <div className="ruta-sub">Updated based on your progress</div>
            </div>
          </div>
          <div className="flex aic g10">
            <span className="chip blue">Next topics</span>
          </div>
        </div>
        <div className="ruta-cards stagger">
          {nextChapters.map((item, idx) => (
            <div key={item.id} className="ruta-card" onClick={() => onNavigate('subject-' + item.id)}>
              <div className="ruta-card-top">
                <span className="ruta-num">{idx + 1}</span>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span className={'ruta-action ' + item.color}>{item.action}</span>
                </div>
              </div>
              <div className="ruta-subject">
                <i className={'ph ph-' + item.icon}></i>
                <span>{item.subject}</span>
              </div>
              <div className="ruta-chap">{item.title}</div>
              <div className="ruta-progress-wrap">
                <div className="track" style={{ marginTop: 8 }}>
                  <div className={'fill ' + item.color} style={{ width: item.pct + '%' }}></div>
                </div>
              </div>
              <div className="ruta-reason">{item.reason}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="stats-row mb22">
        <div className="scard blue">
          <div className="si"><i className="ph ph-book-open"></i></div>
          <div className="sv blue">{totalHours}h</div>
          <div className="slb">Hours this week</div>
          <div className="sdelta">↑ +3h vs previous week</div>
        </div>
        <div className="scard green">
          <div className="si"><i className="ph ph-brain"></i></div>
          <div className="sv green">
            {flashcardSummary
              ? `${flashcardSummary.mastered}/${flashcardSummary.total}`
              : <span style={{ fontSize: 14, opacity: 0.4 }}>—</span>
            }
          </div>
          <div className="slb">Cards mastered</div>
          <div className="sdelta">
            {flashcardSummary
              ? `${flashcardSummary.reviewed} reviewed · ${flashcardSummary.total} total`
              : 'Loading...'
            }
          </div>
        </div>
        <div className="scard orange">
          <div className="si"><i className="ph ph-crosshair"></i></div>
          <div className="sv orange">{subjects.filter(s => chapPct(s) > 0).length}</div>
          <div className="slb">Active subjects</div>
          <div className="sdelta" style={{ color: 'var(--orange2)', fontSize: 10 }}>
            {hoursPerSubject?.filter(h => h.total_hours > 0).length || 0} with study hours
          </div>
        </div>
        <div className="scard purple">
          <div className="si"><i className="ph ph-timer"></i></div>
          <div className="sv purple">{pomosToday}</div>
          <div className="slb">Pomodoros today</div>
          <div className="sdelta" style={{ color: 'var(--purple2)' }}>Goal: 8</div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="mg">
        {/* Overall Progress */}
        <div className="card">
          <div className="sh">
            <span className="st">Overall Progress</span>
            <span className="sl" onClick={() => onNavigate('subjects')}>View details →</span>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div className="flex aic jbs" style={{ marginBottom: 7 }}>
              <span className="txt-sm c-t4">Total semester progress</span>
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--blue2)' }}>{overallPct}%</span>
            </div>
            <div className="track thick"><div className="fill blue" style={{ width: overallPct + '%' }}></div></div>
          </div>
          <div className="subj-list stagger">
            {subjects.map(s => (
              <div key={s.id} className="subj-item" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => { if (s.locked) return; onNavigate('subject-' + s.id); }}>
                {s.locked && <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,.7)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 2, borderRadius: 8 }}><i className="ph ph-lock" style={{ fontSize: 16, color: 'var(--amber2)' }}></i><span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--t4)' }}>Upgrade</span></div>}
                <div className="subj-top">
                  <div className="subj-name">
                    <i className={'ph ph-' + s.icon}></i>
                    <span>{s.name}</span>
                    <span className={'badge ' + s.color}>{getSubjectTag(chapPct(s))}</span>
                  </div>
                  <span className="subj-pct">{chapPct(s)}%</span>
                </div>
                <div className="track"><div className={'fill ' + s.color} style={{ width: chapPct(s) + '%' }}></div></div>
                <div className="subj-foot">
                  <span className="subj-meta">{s.chapList.filter(c => c.done).length}/{s.chapList.length} ch · {hoursPerSubject?.find(h => h.subject_id === s.id)?.total_hours || 0}h studied</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-col">
          {/* Mini Calendar */}
          <div className="card card-sm">
            <div className="calh">
              <button className="calnav" onClick={prevMonth}>‹</button>
              <span className="calmonth">{calLabel}</span>
              <button className="calnav" onClick={nextMonth}>›</button>
            </div>
            <div className="calgrid">
              {DAYS.map(d => (
                <div key={d} className="caldl">{d.slice(0, 1)}</div>
              ))}
              {calCells.map(c => (
                <div
                  key={c.key}
                  className={
                    'calday' +
                    (c.today ? ' today' : '') +
                    (c.event ? ' hase' : '') +
                    (c.urgent ? ' hasu' : '') +
                    (c.inMonth ? '' : ' other')
                  }
                >
                  {c.d}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Dates */}
          <div className="card card-sm" style={{ flex: 1 }}>
            <div className="sh">
              <span className="st">Upcoming dates</span>
            </div>
            <div className="c-t4 txt-sm" style={{ padding: '10px 0' }}>No upcoming dates.</div>
          </div>
        </div>
      </div>

      {/* ── Bottom Grid ── */}
      <div className="bg3">
        <TimerCard />

        {/* Hours Chart */}
        <div className="card">
          <div className="sh mb14">
            <span className="st">Study Hours</span>
            <span className="txt-xs mono c-t4">this week</span>
          </div>
          <div className="flex aic jbs">
            <span style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--blue2)' }}>{totalHours}h</span>
            <span className="txt-xs mono c-t4">Goal: {weekGoal}h</span>
          </div>
          <div className="hchart">
            {weekHours.map((h, i) => (
              <div key={i} className="hbwrap">
                <div
                  className={'hbar' + (i === todayIdx ? ' today' : (h === 0 ? ' zero' : ' past'))}
                  style={{ height: Math.max(3, (h / maxH) * 68) + 'px' }}
                ></div>
                <div className="hday">{DAYS[i]}</div>
              </div>
            ))}
          </div>
          <div className="flex aic jbs mb6">
            <span className="txt-xs c-t4">Weekly goal progress</span>
            <span className="txt-xs mono c-green">
              {Math.min(100, Math.round(totalHours / weekGoal * 100))}%
            </span>
          </div>
          <div className="track">
            <div className="fill green" style={{ width: Math.min(100, Math.round(totalHours / weekGoal * 100)) + '%' }}></div>
          </div>
          <div className="div"></div>
          <span className="st" style={{ display: 'block', marginBottom: 8 }}>4-Week Activity</span>
          <div className="hlabels">
            {DAYS.map(d => (
              <div key={d} className="hl">{d.slice(0, 1)}</div>
            ))}
          </div>
          <div className="hgrid">
            {[...Array(28)].map((_, i) => (
              <div key={i} className="hcell h0"></div>
            ))}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="card">
          <div className="sh mb14">
            <span className="st">Pending Tasks</span>
            <span className="sl" onClick={() => onNavigate('tasks')}>View all →</span>
          </div>
          <div className="task-list stagger">
            {tasks.slice(0, 5).map((t, i) => (
              <div key={t.id} className={'task-item' + (t.done ? ' done' : '')} onClick={() => onToggleTask(i)}>
                <div className={'tcheck' + (t.done ? ' on' : '')}><span>{t.done ? '✓' : ''}</span></div>
                <span className={'ttxt' + (t.done ? ' done' : '')}>{t.text}</span>
                <span className={'tpri ' + (t.pri === 'high' ? 'phi' : (t.pri === 'medium' ? 'pmd' : 'plo'))}>
                  {t.pri === 'high' ? 'High' : (t.pri === 'medium' ? 'Medium' : 'Low')}
                </span>
              </div>
            ))}
          </div>
          <div className="div"></div>
          <div className="flex aic jbs txt-sm">
            <span className="c-t4">{doneTasks} of {tasks.length} completed</span>
            <span className="mono c-green">{Math.round(doneTasks / tasks.length * 100)}%</span>
          </div>
          <div className="track" style={{ marginTop: 7 }}>
            <div className="fill green" style={{ width: Math.round(doneTasks / tasks.length * 100) + '%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
