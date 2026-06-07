export default function SubjectsView({ subjects, onNavigate, chapPct, overallPct, plan }) {
  return (
    <div className="view">
      <div className="sh mb20">
        <span className="st">All Subjects</span>
        {plan === 'free' && <span className="chip orange">Free plan ({subjects.filter(s => !s.locked).length}/3 active)</span>}
        <span className="chip blue">{overallPct}% average</span>
      </div>
      {subjects.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {subjects.map(s => (
            <div key={s.id} className={'card' + (s.locked ? ' opacity-50' : '')} style={{ cursor: s.locked ? 'default' : 'pointer', position: 'relative', overflow: 'hidden' }} onClick={() => { if (!s.locked) onNavigate('subject-' + s.id); }}>
              {s.locked && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,.7)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 2, borderRadius: 'inherit' }}>
                  <i className="ph ph-lock" style={{ fontSize: 24, color: 'var(--amber2)' }}></i>
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--t4)' }}>Upgrade to unlock</span>
                </div>
              )}
              <div className="flex aic jbs mb12">
                <div className="flex aic g8">
                  <i className={'ph ph-' + s.icon} style={{ fontSize: 22 }}></i>
                  <div>
                    <div className="fs13 fw6">{s.name}</div>
                    <span className={'badge ' + s.color}>{s.tag || s.name}</span>
                  </div>
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--' + s.color + '2' }}>{chapPct(s)}%</span>
              </div>
              <div className="track" style={{ marginBottom: 10 }}>
                <div className={'fill ' + s.color} style={{ width: chapPct(s) + '%' }}></div>
              </div>
              <div className="flex aic jbs txt-xs c-t4 mono">
                <span>{s.chapList.filter(c => c.done).length}/{s.chapList.length} ch</span>
                <span>{s.hours}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-col aic jcc ta-center" style={{ padding: '60px 32px', gap: 16 }}>
          <div style={{ fontSize: 52 }}><i className="ph ph-book-open"></i></div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>No subjects yet</div>
          <div style={{ fontSize: 14, color: 'var(--t4)', lineHeight: 1.6 }}>
            Add subjects from Settings or the Calendar section to start tracking your progress
          </div>
        </div>
      )}
    </div>
  );
}
