import PomodoroMini from './PomodoroMini';
import DynamicIcon from './DynamicIcon';

const NAV_MAIN = [
  { id: 'dashboard', icon: 'squares-four', label: 'Dashboard' },
  { id: 'pomodoro', icon: 'timer', label: 'Pomodoro' },
  { id: 'tasks', icon: 'clipboard-text', label: 'Tasks' },
  { id: 'calendar', icon: 'calendar', label: 'Calendar' },
];

export function Sidebar({ view, onNavigate, subjects, chapPct, todayStr, currentWeek, onLogout }) {
  return (
    <aside className="sidebar">
      <span className="nav-label">General</span>
      {NAV_MAIN.map(item => (
        <div
          key={item.id}
          className={'nav-item' + (view === item.id ? ' active' : '')}
          onClick={() => onNavigate(item.id)}
        >
          <i className={`ph nav-icon ph-${item.icon}`}></i>
          <span>{item.label}</span>
        </div>
      ))}

      <span className="nav-label">Subjects</span>
      {subjects.map(s => {
        const pct = chapPct(s);
        return (
          <div
            key={s.id}
            className={'nav-item' + (view === 'subject-' + s.id ? ' active' : '')}
            onClick={() => onNavigate('subject-' + s.id)}
          >
            <DynamicIcon subjectName={s.name} iconName={s.icon} />
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
            <span style={{ flexShrink: 0, fontSize: 10, fontFamily: 'var(--mono)', color: pct > 0 ? `var(--${s.color}2)` : 'var(--t4)' }}>{pct}%</span>
          </div>
        );
      })}

      <span className="nav-label">Tools</span>
      <div className={'nav-item' + (view === 'challenges' ? ' active' : '')} onClick={() => onNavigate('challenges')}>
        <i className="ph nav-icon ph-trophy"></i> Challenges
      </div>
      <div className={'nav-item' + (view === 'interview' ? ' active' : '')} onClick={() => onNavigate('interview')}>
        <i className="ph nav-icon ph-microphone"></i> AI Interview
      </div>

      <span className="nav-label">Account</span>
      <div className={'nav-item' + (view === 'settings' ? ' active' : '')} onClick={() => onNavigate('settings')}>
        <i className="ph nav-icon ph-gear"></i> Settings
      </div>
      <div className="nav-item" onClick={onLogout} style={{ color: 'var(--t4)' }}>
        <i className="ph nav-icon ph-sign-out"></i> Sign out
      </div>

      <PomodoroMini />
      <div className="sb-bottom">
        <div className="today-pill">
          <div className="d">{todayStr}</div>
          <div>Week {currentWeek} of study</div>
        </div>
      </div>
    </aside>
  );
}
