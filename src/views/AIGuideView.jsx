import { useState } from 'react';
import Toggle from '../components/Toggle';
import HttpCheatSheetSidebar from '../components/HttpCheatSheetSidebar';

export default function AIGuideView({ aiGuide, onRegenerateGuide, onSubmitQuiz, onNavigate, onChangeLanguage, showDeepDiveComments, onToggleDeepDive }) {
  const [isCheatSheetOpen, setCheatSheetOpen] = useState(false);
  return (
    <div style={{ padding: '24px 28px 80px' }}>
      <div className="view">
        <div className="detail-header" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          <button className="btn-s" onClick={() => onNavigate('subject-' + (aiGuide.subject?.id || ''))}>← Back</button>
          <div className="flex aic g8" style={{ flex: 1, minWidth: 0 }}>
            {aiGuide.quizOnly && (
              <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--blue2)', background: 'rgba(59,130,246,.1)', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.08em' }}><i className="ph ph-note-pencil"></i> Quiz</span>
            )}
            {!aiGuide.quizOnly && (
              <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--blue2)', background: 'rgba(59,130,246,.1)', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.08em' }}>✦ AI Guide</span>
            )}
            <div className="detail-title" style={{ fontSize: 18 }}>{aiGuide.chapter?.name}</div>
          </div>
            <div className="flex aic g8" style={{ flexWrap: 'wrap' }}>
              {aiGuide.content && !aiGuide.quizOnly && (
                <button
                  onClick={onRegenerateGuide}
                  style={{
                    fontSize: 11, padding: '5px 12px', borderRadius: 7,
                    border: '1px solid rgba(251,191,36,.25)', background: 'rgba(251,191,36,.08)',
                    color: '#fbbf24', cursor: 'pointer', fontFamily: 'var(--mono)',
                    fontWeight: 600, transition: 'all .15s', whiteSpace: 'nowrap'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(251,191,36,.15)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(251,191,36,.08)'}
                >↻ Regenerate</button>
              )}
              <label style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontFamily: 'var(--mono)', color: showDeepDiveComments ? 'var(--blue2)' : 'var(--t4)',
                cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap'
              }}>
                <input
                  type="checkbox"
                  checked={!!showDeepDiveComments}
                  onChange={onToggleDeepDive}
                  style={{ accentColor: 'var(--blue)', cursor: 'pointer' }}
                />
                💡 Deep-Dive
              </label>
              <select
                value={aiGuide.language}
                onChange={e => onChangeLanguage && onChangeLanguage(e.target.value)}
                style={{
                  fontSize: 11, padding: '4px 8px', borderRadius: 7,
                  border: '1px solid rgba(255,255,255,.12)', background: 'var(--layer)',
                  color: 'var(--t2)', fontFamily: 'var(--mono)', cursor: 'pointer', outline: 'none'
                }}
              >
                <option value="JavaScript">JavaScript</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Java">Java</option>
                <option value="Python">Python</option>
                <option value="C#">C#</option>
                <option value="Apex">Apex</option>
                <option value="YAML">YAML</option>
                <option value="Go">Go</option>
              </select>
              <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--t4)' }}>{aiGuide.subject?.name}</span>
            </div>
        </div>

        {aiGuide.loading && (
          <div style={{ padding: '60px 0' }}>
            <div className="sk-el" style={{ height: 52, marginBottom: 24, borderRadius: '0 10px 10px 0' }}></div>
            <div className="sk-card">
              <div className="sk-el" style={{ height: 16, width: '40%', marginBottom: 16 }}></div>
              <div className="sk-el" style={{ height: 12, width: '100%', marginBottom: 8 }}></div>
              <div className="sk-el" style={{ height: 12, width: '88%', marginBottom: 8 }}></div>
              <div className="sk-el" style={{ height: 12, width: '72%' }}></div>
            </div>
            <div className="sk-card">
              <div className="sk-el" style={{ height: 16, width: '35%', marginBottom: 16 }}></div>
              <div className="sk-el" style={{ height: 12, width: '100%', marginBottom: 8 }}></div>
              <div className="sk-el" style={{ height: 12, width: '92%' }}></div>
            </div>
            <div className="sk-card">
              <div className="sk-el" style={{ height: 16, width: '28%', marginBottom: 12 }}></div>
              <div className="sk-el" style={{ height: 100, width: '100%' }}></div>
            </div>
          </div>
        )}

        {aiGuide.error && !aiGuide.loading && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '14px 16px', color: '#f87171', fontSize: 13, fontFamily: 'var(--mono)' }}>
            {'Error: ' + aiGuide.error}
          </div>
        )}

        {!aiGuide.content && !aiGuide.loading && !aiGuide.error && !aiGuide.quizOnly && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center', gap: 24 }}>
            <div style={{ fontSize: 14, color: 'var(--t4)', fontFamily: 'var(--mono)', fontWeight: 600, letterSpacing: '.03em' }}>
              Ready to study <span style={{ color: 'var(--t1)' }}>{aiGuide.chapter?.name}</span>?
            </div>
            <button
              onClick={onRegenerateGuide}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                fontSize: 14, padding: '14px 36px', borderRadius: 10,
                border: '1px solid rgba(99,102,241,.3)', background: 'rgba(99,102,241,.12)',
                color: '#818cf8', cursor: 'pointer', fontFamily: 'var(--mono)',
                fontWeight: 700, transition: 'all .15s', letterSpacing: '.02em'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,.22)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,.12)'}
            >
              <i className="ph ph-sparkle" style={{ fontSize: 18 }}></i>
              Generate Guide
            </button>
            <div style={{ fontSize: 12, color: 'var(--t4)', fontFamily: 'var(--mono)', maxWidth: 380 }}>
              An AI study guide with code examples, lab exercises, and a quiz will be generated for this chapter.
            </div>
          </div>
        )}

        {aiGuide.keyConcept && (
          <div className="mb-8" style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)', borderRadius: 12, padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}><i className="ph ph-crosshair"></i></span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--mono)' }}>Key Concept</span>
              </div>
              <button
                onClick={() => setCheatSheetOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-md transition-colors font-mono font-medium flex items-center gap-1.5 shrink-0"
              >
                <i className="ph ph-book-open text-sm"></i>
                Open Cheat Sheet
              </button>
            </div>
            {aiGuide.content?.summary && (
              <p className="text-slate-300 text-base leading-relaxed mb-4">{aiGuide.content?.summary}</p>
            )}
            <hr className="border-slate-800 my-3" />
            <div style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.7 }}>{aiGuide.keyConcept}</div>
          </div>
        )}

        {aiGuide.labExpress && (
          <div className="mb-8" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.2)', borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>🧪</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--mono)' }}>Lab Express</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--orange2)', marginBottom: 10 }}>{aiGuide.labExpress?.title}</div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiGuide.labExpress?.body}</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>📂</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--mono)' }}>Project Evolution</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--green2)', marginBottom: 10 }}>{aiGuide.projectEvolution?.title}</div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiGuide.projectEvolution?.body}</div>
            </div>
          </div>
        )}

        {aiGuide.content && !aiGuide.loading && (
          <>
            {(aiGuide.content?.sections || []).map((sec, si) => (
              <div key={si} style={{ marginBottom: 24 }}>
                {sec.type === 'text' && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span style={{ color: 'var(--blue2)', fontSize: 16 }}>◈</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--mono)' }}>{sec.title}</span>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{sec.content}</div>
                  </div>
                )}
                {sec.type === 'code' && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'var(--green2)', fontSize: 14 }}>{ }</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', fontFamily: 'var(--mono)' }}>{sec.title}</span>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--blue2)', background: 'rgba(59,130,246,.12)', padding: '2px 10px', borderRadius: 20 }}>{sec.language}</span>
                    </div>
                    {sec.what && (
                      <div style={{ padding: '10px 20px', background: 'rgba(16,185,129,.06)', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--green2)', fontFamily: 'var(--mono)' }}>
                        {'→ ' + sec.what}
                      </div>
                    )}
                    <pre style={{ margin: 0, padding: 20, overflowX: 'auto', fontSize: 13, color: 'var(--t2)', lineHeight: 1.7, fontFamily: 'var(--mono)', background: 'var(--layer)' }}>
                      <code>{sec.content}</code>
                    </pre>
                  </div>
                )}
                {sec.type === 'list' && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <span style={{ color: 'var(--green2)', fontSize: 16 }}>✓</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--mono)' }}>{sec.title}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(sec.items || []).map((item, ii) => (
                        <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <span style={{ minWidth: 22, height: 22, background: 'var(--blue3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'var(--mono)', flexShrink: 0 }}>{ii + 1}</span>
                          <span style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.6, paddingTop: 2 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {aiGuide.quiz && (
          <div style={aiGuide.quizOnly ? { marginTop: 24 } : { marginTop: 48, borderTop: '2px solid var(--border)', paddingTop: 40 }}>
            <div className="quiz-card">
              <div className="quiz-hdr">
                <div className="quiz-icon">🧠</div>
                <div>
                  <div className="quiz-title">Test Your Knowledge</div>
                  <div className="quiz-sub">Answer 2 out of 3 correctly to complete this chapter</div>
                </div>
              </div>

              {aiGuide.quiz && aiGuide.quiz.loading && (
                <div style={{ padding: 28, background: 'var(--layer)', borderRadius: 12, border: '1px solid rgba(255,255,255,.08)' }}>
                  <div className="flex-col g20">
                    {[0, 1, 2].map(qi => (
                      <div key={qi}>
                        <div className="sk-el" style={{ height: 16, width: ['55%', '50%', '45%'][qi], marginBottom: 16, borderRadius: 6 }}></div>
                        <div className="flex-col g8">
                          {[0, 1, 2, 3].map(oi => (
                            <div key={oi} className="sk-el" style={{ height: 40, width: ['100%', '100%', '65%', '80%'][oi] || '100%', borderRadius: 8 }}></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiGuide.quiz && !aiGuide.quiz.loading && aiGuide.quiz.error && !aiGuide.quiz.questions?.length && (
                <div style={{ padding: 28, textAlign: 'center', background: 'rgba(239,68,68,.06)', borderRadius: 12, border: '1px solid rgba(239,68,68,.2)' }}>
                  <div style={{ color: '#f87171', fontSize: 14 }}>Could not generate the quiz. Check your connection and try again.</div>
                </div>
              )}

              {aiGuide.quiz && !aiGuide.quiz.loading && !aiGuide.quiz.submitted && (
                <>
                  {(aiGuide.quiz?.questions || []).map((q, qi) => (
                    <div key={qi} className={qi === 0 ? 'quiz-q-first' : 'quiz-q'}>
                      <div className="quiz-q-hdr">
                        <div className="quiz-q-num">{qi + 1}</div>
                        <div className="quiz-q-text">{q.q}</div>
                      </div>
                      <div className="quiz-opts">
                        {q.options.map((opt, oi) => (
                          <button
                            key={oi}
                            onClick={() => {
                              const answers = [...(aiGuide.quiz.answers || [])];
                              answers[qi] = oi;
                              aiGuide.quiz.answers = answers;
                              if (onSubmitQuiz) onSubmitQuiz(aiGuide);
                            }}
                            className={'quiz-opt' + ((aiGuide.quiz.answers || [])[qi] === oi ? ' quiz-opt-sel' : '')}
                          >
                            <div className="quiz-opt-dot">{['A', 'B', 'C', 'D'][oi]}</div>
                            <span className="quiz-opt-label">{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="quiz-bar">
                    <div className="quiz-dots">
                      {(aiGuide.quiz?.questions || []).map((q, qi) => (
                        <div key={qi} className={'quiz-dot' + ((aiGuide.quiz?.answers || [])[qi] !== null && (aiGuide.quiz?.answers || [])[qi] !== undefined ? ' quiz-dot-done' : '')}></div>
                      ))}
                    </div>
                    <button
                      className="quiz-submit"
                      onClick={() => {
                        if (onSubmitQuiz) onSubmitQuiz(aiGuide);
                      }}
                      disabled={(aiGuide.quiz?.answers || []).some(a => a === null || a === undefined)}
                    >
                      Check answers →
                    </button>
                  </div>
                </>
              )}

              {aiGuide.quiz && aiGuide.quiz.submitted && (
                <div style={{ animation: 'fadeUp .3s ease both' }}>
                  <div className={'quiz-result-card' + ((aiGuide.quiz?.score || 0) >= 2 ? ' quiz-result-pass' : ' quiz-result-fail')}>
                    <i className={'ph ' + ((aiGuide.quiz?.score || 0) >= 2 ? 'ph-celebrate' : 'ph-book-open')} style={{ fontSize: 36 }}></i>
                    <div className="quiz-result-title">{(aiGuide.quiz?.score || 0) >= 2 ? 'Chapter completed!' : 'Review needed'}</div>
                    <div className="quiz-result-score">{(aiGuide.quiz?.score || 0) + '/3 correct'}</div>
                  </div>
                  <div className="quiz-feedback">
                    {(aiGuide.quiz?.questions || []).map((q, qi) => (
                      <div key={qi} className={'quiz-fb-item' + ((aiGuide.quiz?.answers || [])[qi] === q.correct ? ' quiz-fb-correct' : ' quiz-fb-wrong')}>
                        <div className={'quiz-fb-icon ' + ((aiGuide.quiz?.answers || [])[qi] === q.correct ? 'quiz-fb-icon-pass' : 'quiz-fb-icon-fail')}>
                          {(aiGuide.quiz?.answers || [])[qi] === q.correct ? '✓' : '✗'}
                        </div>
                        <div>
                          <div className="quiz-fb-q">{q.q}</div>
                          <div className={'quiz-fb-answer ' + ((aiGuide.quiz?.answers || [])[qi] === q.correct ? 'quiz-fb-answer-pass' : 'quiz-fb-answer-fail')}>
                            {q.options[(aiGuide.quiz?.answers || [])[qi] ?? 0]}
                          </div>
                          {(aiGuide.quiz?.answers || [])[qi] !== q.correct && (
                            <div className="quiz-fb-correct-answer">{'✓ Correct: ' + q.options[q.correct]}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="quiz-actions">
                    {(aiGuide.quiz?.score || 0) >= 2 && (
                      <button className="quiz-btn-back" onClick={() => onNavigate('subject-' + (aiGuide.subject?.id || ''))}>
                        ← Back to subject
                      </button>
                    )}
                    {(aiGuide.quiz?.score || 0) < 2 && (
                      <button
                        className="quiz-btn-retry"
                        onClick={() => {
                          aiGuide.quiz.submitted = false;
                          aiGuide.quiz.answers = Array(aiGuide.quiz.questions?.length || 3).fill(null);
                          if (onSubmitQuiz) onSubmitQuiz(aiGuide);
                        }}
                      >
                        Try again
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <HttpCheatSheetSidebar isOpen={isCheatSheetOpen} onClose={() => setCheatSheetOpen(false)} />
    </div>
  );
}
