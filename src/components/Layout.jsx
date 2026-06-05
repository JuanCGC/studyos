import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function Layout({ view, onNavigate, subjects, chapPct, todayStr, currentWeek, onLogout, userName, streak, children }) {
  const navMain = [
    { id: 'dashboard', icon: 'squares-four', label: 'Dashboard' },
    { id: 'pomodoro', icon: 'timer', label: 'Pomodoro' },
    { id: 'tasks', icon: 'clipboard-text', label: 'Tasks' },
    { id: 'calendar', icon: 'calendar', label: 'Calendar' },
  ];

  return (
    <div className="app">
      <Sidebar
        view={view}
        onNavigate={onNavigate}
        subjects={subjects}
        chapPct={chapPct}
        todayStr={todayStr}
        currentWeek={currentWeek}
        onLogout={onLogout}
      />
      <main className="main">
        <Topbar
          userName={userName}
          streak={streak}
          subjects={subjects}
          chapPct={chapPct}
        />
        <div className="page">
          {children}
        </div>
      </main>
      <nav className="mobile-nav">
        {navMain.map(item => (
          <button
            key={item.id}
            className={'mob-btn' + (view === item.id ? ' active' : '')}
            onClick={() => onNavigate(item.id)}
          >
            <i className={`ph micon ph-${item.icon}`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
