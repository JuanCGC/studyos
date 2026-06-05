export default function SubjectDetail({
  subject, onNavigate, chapPct, syncSubjectPct, subjects,
  onDeleteSubject, onResetSubject, notesOpen, toggleNotes, isNotesOpen,
  CHAP_MAP, onGoChapter, onOpenAIGuide
}) {
  const s = subject;

  return (
    <div className="view">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className="btn-s" onClick={() => onNavigate('subjects')}>← Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <i className={'ph ph-' + s.icon} style={{ fontSize: 26, flexShrink: 0 }}></i>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-.02em', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
          <span className={'badge ' + s.color} style={{ flexShrink: 0 }}>{s.tag || s.name}</span>
          {s.aiSuggested && (
            <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: '#c084fc', background: 'rgba(168,85,247,.08)', border: '1px solid rgba(168,85,247,.2)', padding: '3px 9px', borderRadius: 20, fontFamily: 'var(--mono)', letterSpacing: '.03em' }}>✦ IA</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
          <button
            className="btn-s"
            onClick={() => onResetSubject(s)}
            style={{ borderColor: 'rgba(251,146,60,.25)', color: 'rgba(251,146,60,.7)', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}
          >↺ Reset</button>
          <button
            className="btn-d"
            onClick={() => onDeleteSubject(s)}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}
          >✕ Delete</button>
        </div>
      </div>

      <div className="detail-grid mb20">
        <div className="flex-col g6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'var(--mono)' }}>Total Progress</div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.03em', color: 'var(--' + s.color + '2' }}>{chapPct(s)}%</div>
          <div style={{ height: 4, background: 'var(--layer)', borderRadius: 2, marginTop: 4 }}>
            <div style={{ width: chapPct(s) + '%', background: 'var(--' + s.color + ')', borderRadius: 2, height: '100%', transition: 'width .4s' }}></div>
          </div>
        </div>
        <div className="flex-col g6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'var(--mono)' }}>Chapters Completed</div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.03em', color: 'var(--green2)' }}>{s.chapList.filter(c => c.done).length}/{s.chapList.length}</div>
          <div style={{ fontSize: 12, color: 'var(--t4)', fontFamily: 'var(--mono)' }}>{s.chapList.length - s.chapList.filter(c => c.done).length} remaining</div>
        </div>
        <div className="flex-col g6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'var(--mono)' }}>Pending</div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.03em', color: 'var(--blue2)' }}>{s.chapList.filter(c => !c.done).length}</div>
          <div style={{ fontSize: 12, color: 'var(--t4)', fontFamily: 'var(--mono)' }}>of {s.chapList.length} chapters</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="flex aic jbs mb8">
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'var(--mono)' }}>Overall Progress</span>
          <span style={{ fontSize: 12, fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--' + s.color + '2' }}>{chapPct(s)}%</span>
        </div>
        <div className="track thick">
          <div className={'fill ' + s.color} style={{ width: chapPct(s) + '%' }}></div>
        </div>
      </div>

      <div className="flex aic jbs mb12">
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'var(--mono)' }}>Course Chapters</span>
        <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--t4)' }}>{s.chapList.filter(c => c.done).length} of {s.chapList.length} completed</span>
      </div>

      {s.aiSuggested && (
        <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.18)', fontSize: 12, color: '#c084fc', fontFamily: 'var(--mono)' }}>
          ✦ AI-generated subject — click ✨ next to each chapter to generate a study guide.
        </div>
      )}

      <div className="flex-col g4 stagger">
        {s.chapList.map((ch, i) => (
          <div key={i}>
            <div
              className={'chap-item' + (ch.done ? ' done' : '')}
              style={{ borderRadius: 10, transition: 'background .15s' }}
              onClick={() => ch.done ? (ch.done = false, syncSubjectPct(s)) : onOpenAIGuide(s, ch, i, false)}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
              onMouseOut={e => { if (!e.currentTarget.classList.contains('done')) e.currentTarget.style.background = ''; }}
            >
              <div className={'tcheck' + (ch.done ? ' on' : '')} title={ch.done ? 'Unmark' : 'Complete the quiz to mark as done'}>
                {ch.done ? <span>✓</span> : <span style={{ fontSize: 10, opacity: 0.4 }}>○</span>}
              </div>
              <span style={{
                minWidth: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 7, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)',
                fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--t4)', flexShrink: 0
              }}>{String(i + 1).padStart(2, '0')}</span>
              <span
                className={'chap-name' + (ch.done ? ' done' : '')}
                style={{ cursor: 'pointer', flex: 1 }}
                onClick={e => { e.stopPropagation(); onOpenAIGuide(s, ch, i, false); }}
                title="Generate guide + quiz with AI"
              >{ch.name}</span>
              {CHAP_MAP && CHAP_MAP[ch.name] && (
                <span
                  className="chap-link-icon"
                  onClick={e => { e.stopPropagation(); onGoChapter(ch.name, s.id); }}
                  title="View section in guide"
                ><i className="ph ph-book-open"></i></span>
              )}
              {(!CHAP_MAP || !CHAP_MAP[ch.name]) && (
                <span
                  onClick={e => { e.stopPropagation(); onOpenAIGuide(s, ch, i, false); }}
                  title={s.aiSuggested ? 'Generate guide + quiz with AI' : 'Generate quiz'}
                  style={{
                    fontSize: 13, color: 'var(--blue2)', marginLeft: 2, flexShrink: 0, cursor: 'pointer',
                    opacity: 0.7, transition: 'opacity .15s'
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity = '1'}
                  onMouseOut={e => e.currentTarget.style.opacity = '.7'}
                ><i className="ph ph-sparkle"></i></span>
              )}
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                flexShrink: 0, fontFamily: 'var(--mono)',
                ...(ch.done
                  ? { color: 'var(--green2)', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.15)' }
                  : { color: 'rgba(251,191,36,.8)', background: 'rgba(251,191,36,.07)', border: '1px solid rgba(251,191,36,.15)' }
                )
              }}>{ch.done ? 'Completed' : 'Pending'}</span>
              <button
                onClick={e => { e.stopPropagation(); toggleNotes(s, i); }}
                title={isNotesOpen(s, i) ? 'Close notes' : 'My notes'}
                style={{
                  background: 'none', border: '1px solid', borderRadius: 7, cursor: 'pointer',
                  padding: '3px 7px', fontSize: 12, flexShrink: 0, transition: 'all .15s',
                  marginLeft: 2, fontFamily: 'var(--mono)', lineHeight: 1,
                  ...(isNotesOpen(s, i)
                    ? { color: 'var(--blue2)', borderColor: 'rgba(59,130,246,.3)', background: 'rgba(59,130,246,.08)' }
                    : (ch.notes && ch.notes.trim()
                      ? { color: 'var(--blue2)', borderColor: 'rgba(59,130,246,.2)', background: 'transparent' }
                      : { color: 'var(--t4)', borderColor: 'rgba(255,255,255,.06)', background: 'transparent' })
                  )
                }}
              >✎</button>
            </div>
            {isNotesOpen(s, i) && (
              <div style={{ margin: '6px 0 8px 52px' }}>
                <textarea
                  value={ch.notes || ''}
                  onChange={e => { ch.notes = e.target.value; syncSubjectPct(s); }}
                  onClick={e => e.stopPropagation()}
                  placeholder="Notes, doubts, key concepts from this chapter..."
                  style={{
                    width: '100%', minHeight: 140, maxHeight: 600, background: 'var(--layer2)',
                    border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 14px',
                    fontSize: 13, color: 'var(--t1)', fontFamily: 'var(--font)', resize: 'vertical',
                    outline: 'none', lineHeight: 1.7, transition: 'border-color .15s',
                    boxSizing: 'border-box', display: 'block'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
                ></textarea>
                <div style={{ fontSize: 10, color: 'var(--t4)', fontFamily: 'var(--mono)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>💾 Auto-saved · drag corner to resize</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
