export default function ChallengesView({
  challengeTopic, setChallengeTopic, challengeTopicCustom, setChallengeTopicCustom,
  challengeDifficulty, setChallengeDifficulty, challengeLanguage, setChallengeLanguage,
  challengeGenerating, onGenerateExercise, challengeError, currentExercise,
  challengeCode, setChallengeCode, challengeRunning, onRunChallenge,
  challengeResult, challengeShowHints, setChallengeShowHints,
  challengeShowSolution, setChallengeShowSolution,
  challengeHistory, onClearChallengeHistory, subjects
}) {
  return (
    <div className="view">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '.06em' }}><i className="ph ph-trophy"></i> Challenges</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="sinput"
            value={challengeTopic}
            onChange={e => { setChallengeTopic(e.target.value); setChallengeTopicCustom(''); }}
            style={{ minWidth: 160, padding: '7px 12px', borderRadius: 9 }}
          >
            <option value="">— Topic —</option>
            {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            <option value="API Testing">API Testing</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Data Structures">Data Structures</option>
          </select>
          <input
            type="text" className="sinput"
            value={challengeTopicCustom}
            onChange={e => { setChallengeTopicCustom(e.target.value); if (e.target.value) setChallengeTopic(''); }}
            placeholder="or type custom topic…"
            style={{ minWidth: 160, padding: '7px 12px', borderRadius: 9 }}
          />
          <div style={{ display: 'flex', border: '1px solid var(--border2)', borderRadius: 9, overflow: 'hidden' }}>
            {['easy', 'medium', 'hard'].map(d => (
              <button
                key={d}
                onClick={() => setChallengeDifficulty(d)}
                style={{
                  padding: '6px 14px', border: 'none', cursor: 'pointer', fontSize: 12,
                  fontWeight: 600, fontFamily: 'var(--mono)', textTransform: 'capitalize',
                  transition: 'all .15s',
                  ...(challengeDifficulty === d
                    ? { background: 'var(--blue3)', color: 'var(--blue2)' }
                    : { background: 'transparent', color: 'var(--t4)' }
                  )
                }}
              >{d}</button>
            ))}
          </div>
          <div style={{ display: 'flex', border: '1px solid var(--border2)', borderRadius: 9, overflow: 'hidden' }}>
            <button
              onClick={() => setChallengeLanguage('javascript')}
              style={{
                padding: '6px 14px', border: 'none', cursor: 'pointer', fontSize: 12,
                fontWeight: 600, fontFamily: 'var(--mono)', transition: 'all .15s',
                ...(challengeLanguage === 'javascript'
                  ? { background: 'var(--blue3)', color: 'var(--blue2)' }
                  : { background: 'transparent', color: 'var(--t4)' }
                )
              }}
            >JS</button>
          </div>
          <button className="btn-p" onClick={onGenerateExercise} disabled={challengeGenerating}>
            {!challengeGenerating ? <span><i className="ph ph-sparkle"></i> Generate</span> : <span>⏳ Generating…</span>}
          </button>
        </div>
      </div>

      {challengeError && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '12px 16px', color: '#f87171', fontSize: 13, fontFamily: 'var(--mono)', marginBottom: 16 }}>{'Error: ' + challengeError}</div>
      )}

      {challengeGenerating && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 32 }}>⏳</div>
            <div style={{ fontSize: 14, fontFamily: 'var(--mono)', color: 'var(--t4)' }}>Generating exercise…</div>
          </div>
          <div className="card" style={{ minHeight: 420 }}></div>
        </div>
      )}

      {!challengeGenerating && !currentExercise && (
        <div className="flex-col aic jcc g20 ta-center" style={{ padding: '80px 32px' }}>
          <div style={{ fontSize: 60, filter: 'drop-shadow(0 4px 20px rgba(99,102,241,.3))' }}><i className="ph ph-trophy"></i></div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>Select a topic and generate your first challenge</div>
            <div style={{ fontSize: 14, color: 'var(--t4)', lineHeight: 1.6 }}>
              Gemini will create SDET-themed coding exercises<br />that run in a real sandbox via Judge0
            </div>
          </div>
        </div>
      )}

      {currentExercise && !challengeGenerating && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
          <div className="flex-col g14">
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--t1)', lineHeight: 1.4 }}>{currentExercise?.title}</div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 11, fontFamily: 'var(--mono)', padding: '3px 10px', borderRadius: 20,
                    fontWeight: 700, textTransform: 'capitalize',
                    ...(currentExercise?.difficulty === 'easy'
                      ? { background: 'rgba(16,185,129,.12)', color: 'var(--green2)' }
                      : currentExercise?.difficulty === 'hard'
                      ? { background: 'rgba(239,68,68,.12)', color: '#f87171' }
                      : { background: 'rgba(251,191,36,.12)', color: '#fbbf24' }
                    )
                  }}>{currentExercise?.difficulty}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', background: 'rgba(99,102,241,.12)', color: '#a78bfa', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>{currentExercise?.topic}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', background: 'rgba(59,130,246,.1)', color: 'var(--blue2)', padding: '3px 10px', borderRadius: 20, fontWeight: 700, textTransform: 'uppercase' }}>{currentExercise?.language}</span>
                </div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{currentExercise?.description}</div>
            </div>

            <div className="card" style={{ padding: '18px 20px' }}>
              <div className="ttu fs11 fw7 c-t4 ls-1 mono mb14">Test Cases</div>
              <div className="flex-col g10">
                {(currentExercise?.testCases || []).map((tc, i) => (
                  <div key={i} style={{ background: 'var(--layer)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', fontFamily: 'var(--mono)', marginBottom: 6 }}>{'Test ' + (i + 1) + ': ' + (tc.label || '')}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 10px', fontSize: 12, fontFamily: 'var(--mono)' }}>
                      <span style={{ color: 'var(--t4)' }}>Input:</span>
                      <span style={{ color: 'var(--blue2)' }}>{JSON.stringify(tc.input)}</span>
                      <span style={{ color: 'var(--t4)' }}>Expected:</span>
                      <span style={{ color: 'var(--green2)' }}>{JSON.stringify(tc.expected)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => setChallengeShowHints(!challengeShowHints)}
                style={{ width: '100%', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font)' }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)' }}>💡 Hints</span>
                <span style={{ fontSize: 12, color: 'var(--t4)', fontFamily: 'var(--mono)' }}>{challengeShowHints ? '▲ Hide' : '▼ Show'}</span>
              </button>
              {challengeShowHints && (
                <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(currentExercise?.hints || []).map((hint, hi) => (
                    <div key={hi} style={{ fontSize: 13, color: 'var(--t3)', padding: '10px 14px', background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.15)', borderRadius: 8, lineHeight: 1.6 }}>
                      <span style={{ color: '#fbbf24', fontWeight: 700, fontFamily: 'var(--mono)' }}>{'#' + (hi + 1) + ' '}</span>
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-col g14">
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="flex g6">
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f87171' }}></div>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24' }}></div>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--green2)' }}></div>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--t4)' }}>solution.js</span>
              </div>
              <textarea
                value={challengeCode}
                onChange={e => setChallengeCode(e.target.value)}
                spellCheck="false"
                autoCorrect="off"
                autoCapitalize="off"
                style={{
                  width: '100%', minHeight: 320, background: 'var(--layer)', border: 'none',
                  padding: 20, fontSize: 13, color: 'var(--t1)', fontFamily: 'var(--mono)',
                  lineHeight: 1.7, resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                  display: 'block', tabSize: 2
                }}
                onKeyDown={e => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    const s = e.target.selectionStart;
                    const en = e.target.selectionEnd;
                    const newVal = challengeCode.substring(0, s) + '  ' + challengeCode.substring(en);
                    setChallengeCode(newVal);
                    requestAnimationFrame(() => {
                      e.target.selectionStart = e.target.selectionEnd = s + 2;
                    });
                  }
                }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-p"
                onClick={onRunChallenge}
                disabled={challengeRunning || !challengeCode.trim()}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {!challengeRunning ? <span>▶ Run Code</span> : <span>⏳ Running…</span>}
              </button>
            </div>

            {challengeResult && (
              <div className="card" style={{ padding: '18px 20px' }}>
                {challengeResult?.error ? (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t4)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Output</div>
                    <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '12px 14px', fontSize: 13, fontFamily: 'var(--mono)', color: '#f87171', whiteSpace: 'pre-wrap' }}>{challengeResult?.compileOutput || challengeResult?.stderr || challengeResult?.error}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{ fontSize: 28 }}><i className={'ph ' + (challengeResult?.passed === challengeResult?.total && challengeResult?.total > 0 ? 'ph-celebrate' : 'ph-chart-bar')}></i></div>
                      <div>
                        <div style={{
                          fontSize: 16, fontWeight: 700,
                          color: challengeResult?.passed === challengeResult?.total && challengeResult?.total > 0 ? 'var(--green2)' : 'var(--orange2,#fb923c)'
                        }}>
                          {challengeResult?.passed === challengeResult?.total && challengeResult?.total > 0 ? 'All tests passed!' : challengeResult?.passed + '/' + challengeResult?.total + ' tests passed'}
                        </div>
                        {challengeResult?.time && <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--t4)' }}>{'Time: ' + challengeResult?.time + 's'}</div>}
                      </div>
                    </div>
                    <div className="flex-col g8">
                      {(challengeResult?.results || []).map((r, ri) => (
                        <div key={ri} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '10px 14px', borderRadius: 9,
                          ...(r.s === 'PASS'
                            ? { background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.18)' }
                            : r.s === 'ERROR'
                            ? { background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.18)' }
                            : { background: 'rgba(249,115,22,.06)', border: '1px solid rgba(249,115,22,.18)' }
                          )
                        }}>
                          <i className={'ph ' + (r.s === 'PASS' ? 'ph-check-circle' : (r.s === 'ERROR' ? 'ph-skull' : 'ph-x-circle'))} style={{ fontSize: 14, flexShrink: 0 }}></i>
                          <div style={{ fontSize: 12, fontFamily: 'var(--mono)', flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontWeight: 700, marginBottom: 3,
                              color: r.s === 'PASS' ? 'var(--green2)' : (r.s === 'ERROR' ? '#f87171' : 'var(--orange2,#fb923c)')
                            }}>
                              {'Test ' + r.t + (r.label ? ' — ' + r.label : '') + ': ' + r.s}
                            </div>
                            {r.s === 'ERROR' && <div style={{ color: '#f87171', opacity: 0.8 }}>{r.err}</div>}
                            {r.s === 'FAIL' && (
                              <div style={{ color: 'var(--t4)' }}>
                                <span>Got: </span><span style={{ color: 'var(--t2)' }}>{r.got}</span>
                                <span style={{ marginLeft: 8 }}>Expected: </span><span style={{ color: 'var(--green2)' }}>{r.exp}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {challengeHistory.length > 0 && !challengeGenerating && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 20 }}>
          <div className="flex aic jbs" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>Challenge History</div>
            <button onClick={onClearChallengeHistory} style={{ fontSize: 11, color: 'var(--t4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--mono)' }}>Clear</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'var(--mono)' }}>Date</th>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'var(--mono)' }}>Exercise</th>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'var(--mono)' }}>Topic</th>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'var(--mono)' }}>Difficulty</th>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'var(--mono)' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {challengeHistory.map((h, i) => (
                <tr key={i} style={i === challengeHistory.length - 1 ? {} : { borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{h.date}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--t2)', fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</td>
                  <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--t3)' }}>{h.topic}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      fontSize: 11, fontFamily: 'var(--mono)', padding: '2px 9px', borderRadius: 20,
                      fontWeight: 700, textTransform: 'capitalize',
                      ...(h.difficulty === 'easy'
                        ? { background: 'rgba(16,185,129,.12)', color: 'var(--green2)' }
                        : h.difficulty === 'hard'
                        ? { background: 'rgba(239,68,68,.12)', color: '#f87171' }
                        : { background: 'rgba(251,191,36,.12)', color: '#fbbf24' }
                      )
                    }}>{h.difficulty}</span>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)', color: h.passed ? 'var(--green2)' : '#f87171' }}>{h.passed ? '✓ Solved' : '✗ Failed'}</span>
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
