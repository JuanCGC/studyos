export default function InterviewView({
  interviewTopic, setInterviewTopic, interviewMessages, interviewUserInput,
  setInterviewUserInput, interviewLoading, onStartInterview, onSendMessage,
  interviewHistory, onClearHistory, subjects, cvAnalysis, profileName
}) {
  return (
    <div className="view">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '.06em' }}>AI Interview</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="sinput"
            value={interviewTopic}
            onChange={e => setInterviewTopic(e.target.value)}
            style={{ minWidth: 160, padding: '7px 12px', borderRadius: 9 }}
          >
            <option value="">Free topic</option>
            {subjects.map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <button className="btn-p" onClick={onStartInterview}>{interviewMessages.length ? 'Restart' : 'Start Session'}</button>
        </div>
      </div>

      <div className="card" style={{ minHeight: 340, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="fs13 fw6 c-t2">Interview Starter Guide</div>
        </div>
        {interviewMessages.length === 0 && (
          <div className="flex-col aic jcc g20 ta-center" style={{ padding: '48px 32px' }}>
            <div style={{ fontSize: 52, filter: 'drop-shadow(0 4px 16px rgba(59,130,246,.3))' }}><i className="ph ph-microphone"></i></div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>Select a topic and press Start Session</div>
              <div style={{ fontSize: 13, color: 'var(--t4)', lineHeight: 1.6 }}>The interviewer will use your CV context</div>
            </div>
          </div>
        )}
        {interviewMessages.length > 0 && (
          <div id="interview-scroll" style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', maxHeight: 420 }}>
            {interviewMessages.map((msg, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                {msg.role === 'assistant' && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,rgba(59,130,246,.18),rgba(99,102,241,.18))', border: '1px solid rgba(99,102,241,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 2 }}>🤖</div>
                    <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '4px 14px 14px 14px', padding: '14px 18px', fontSize: 14, color: 'var(--t1)', lineHeight: 1.75, maxWidth: '88%' }}>{msg.content}</div>
                  </div>
                )}
                {msg.role === 'user' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ background: 'var(--blue3)', border: '1px solid rgba(59,130,246,.3)', borderRadius: '14px 4px 14px 14px', padding: '12px 16px', fontSize: 14, color: '#fff', lineHeight: 1.65, maxWidth: '80%' }}>{msg.content}</div>
                  </div>
                )}
              </div>
            ))}
            {interviewLoading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,rgba(59,130,246,.18),rgba(99,102,241,.18))', border: '1px solid rgba(99,102,241,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 2 }}>🤖</div>
                <div className="imsg-bubble imsg-typing"><span></span><span></span><span></span></div>
              </div>
            )}
          </div>
        )}
        {interviewMessages.length > 0 && (
          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
              <textarea
                value={interviewUserInput}
                onChange={e => setInterviewUserInput(e.target.value)}
                placeholder="Type your answer..."
                onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') onSendMessage(); }}
                rows="3"
                style={{
                  flex: 1, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 14, padding: '12px 50px 12px 16px', fontSize: 14, color: 'var(--t1)',
                  fontFamily: 'var(--font)', resize: 'none', outline: 'none', lineHeight: 1.6,
                  transition: 'border-color .2s,box-shadow .2s', boxSizing: 'border-box', display: 'block'
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,.1)'; e.target.style.boxShadow = ''; }}
              ></textarea>
              <button
                className="btn-p"
                onClick={onSendMessage}
                disabled={interviewLoading || !interviewUserInput.trim()}
                style={{ position: 'absolute', right: 8, bottom: 8, width: 34, height: 34, padding: 0, fontSize: 17, borderRadius: 10, justifyContent: 'center', zIndex: 2, lineHeight: 1 }}
              >↑</button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--t4)', fontFamily: 'var(--mono)', marginTop: 6, opacity: 0.6 }}>Ctrl+Enter to send</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: 16, marginBottom: 16, alignItems: 'start', gridTemplateColumns: cvAnalysis ? '1fr auto' : '1fr' }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div className="ttu fs11 fw7 c-t4 ls-1 mono mb12">Topic Suggestions</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {subjects.map(s => (
              <button
                key={s.id}
                onClick={() => setInterviewTopic(s.name)}
                style={{
                  fontSize: 13, padding: '7px 16px', borderRadius: 999, border: '1px solid',
                  cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all .18s',
                  display: 'flex', alignItems: 'center', gap: 7,
                  ...(interviewTopic === s.name
                    ? { borderColor: 'rgba(59,130,246,.6)', background: 'rgba(59,130,246,.12)', color: 'var(--blue2)', boxShadow: '0 0 0 2px rgba(59,130,246,.15)' }
                    : { borderColor: 'rgba(255,255,255,.14)', background: 'rgba(255,255,255,.03)', color: 'var(--t3)' }
                  )
                }}
                onMouseOver={e => {
                  if (e.currentTarget.style.background.indexOf('59,130,246') < 0) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,.25)';
                    e.currentTarget.style.background = 'rgba(255,255,255,.07)';
                    e.currentTarget.style.color = 'var(--t2)';
                  }
                }}
                onMouseOut={e => {
                  if (e.currentTarget.style.background.indexOf('59,130,246') < 0) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,.14)';
                    e.currentTarget.style.background = 'rgba(255,255,255,.03)';
                    e.currentTarget.style.color = 'var(--t3)';
                  }
                }}
              >
                <i className={'ph ph-' + s.icon} style={{ fontSize: 14 }}></i><span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
        {cvAnalysis && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, maxWidth: 280 }}>
            <div style={{ width: 38, height: 46, borderRadius: 8, background: 'linear-gradient(160deg,rgba(239,68,68,.15),rgba(239,68,68,.06))', border: '1px solid rgba(239,68,68,.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, flexShrink: 0 }}>
              <div style={{ fontSize: 7, fontWeight: 800, color: '#f87171', fontFamily: 'var(--mono)', letterSpacing: '.05em', background: 'rgba(239,68,68,.2)', padding: '1px 4px', borderRadius: 2 }}>PDF</div>
              <div style={{ fontSize: 16, lineHeight: 1 }}>📄</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>CV of {profileName || 'candidate'}</div>
              <div style={{ fontSize: 11, color: 'var(--t4)', fontFamily: 'var(--mono)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cvFilename || ''}</div>
            </div>
          </div>
        )}
      </div>

      {interviewHistory.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="flex aic jbs" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>Interview History</div>
            <button onClick={onClearHistory} style={{ fontSize: 11, color: 'var(--t4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--mono)' }}>Clear</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'var(--mono)' }}>Date</th>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'var(--mono)' }}>Topic</th>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'var(--mono)' }}>Duration</th>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'var(--mono)' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {interviewHistory.map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', ...(i === interviewHistory.length - 1 ? { borderBottom: 'none' } : {}) }}>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{h.date}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--t2)', fontWeight: 500 }}>{h.topic}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{h.duration > 0 ? h.duration + ' min' : '< 1 min'}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      fontSize: 13, fontWeight: 700, fontFamily: 'var(--mono)', padding: '3px 10px', borderRadius: 20,
                      ...(h.score >= 80
                        ? { color: 'var(--green2)', background: 'rgba(16,185,129,.1)' }
                        : h.score >= 60
                        ? { color: 'var(--orange2,#fb923c)', background: 'rgba(251,146,60,.1)' }
                        : { color: '#f87171', background: 'rgba(248,113,113,.1)' }
                      )
                    }}>{h.score}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
