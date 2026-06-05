import { PhosphorIcon } from './PhosphorIcon';

export function Topbar({ userName, streak, pomosToday, subjects, chapPct }) {
  const pct = subjects.length > 0
    ? Math.round(subjects.reduce((a, s) => a + chapPct(s), 0) / subjects.length)
    : 0;

  return (
    <div className="topbar">
      <div className="flex aic g8">
        <i className="ph ph-hand-waving" style={{ fontSize: 18 }}></i>
        <h1>Good day, <span>{userName}</span></h1>
      </div>
      <div className="topbar-right">
        <div style={{ fontSize: 11, color: 'var(--t4)', fontFamily: 'var(--mono)' }}>{pct}%</div>
        <div style={{ width: 80, height: 3, background: 'var(--layer)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: pct + '%', background: 'var(--blue)', borderRadius: 2, transition: 'width .4s' }} />
        </div>
        <div className="streak"><i className="ph ph-fire"></i> <span>{streak} days</span></div>
        <div className="avatar">{userName?.charAt(0)?.toUpperCase() || 'U'}</div>
      </div>
    </div>
  );
}
