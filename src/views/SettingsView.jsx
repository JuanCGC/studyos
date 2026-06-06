export default function SettingsView({
  pomoSettings, setPomoSettings, weekGoal, setWeekGoal,
  pomosGoal, setPomosGoal, profileName, setProfileName,
  currentWeek, setCurrentWeek, settings, setSettings,
  onSaveProfile, profileSaving, profileSaved,
  cvFile, cvFilename, cvAnalyzing, cvAnalysis, cvError,
  onCvFileChange, onAnalyzeCv, onClearCv
}) {
  const applyPomoSettings = () => {
    if (typeof setPomoSettings === 'function') {
      setPomoSettings({ ...pomoSettings });
    }
  };

  return (
    <div className="view">
      <div className="sh mb20"><span className="st">Settings</span></div>
      <div className="settings-grid">
        <div className="card">
          <div className="txt-sm fw7" style={{ marginBottom: 14 }}><i className="ph ph-timer"></i> Pomodoro</div>
          <div className="setting-item" style={{ marginBottom: 10, background: 'transparent', border: 'none', padding: 0, display: 'block' }}>
            <div className="flex aic jbs mb6"><span>Focus Duration</span><span className="mono">{pomoSettings.work} min</span></div>
            <input
              type="range" className="srange" min="15" max="60" step="5"
              value={pomoSettings.work}
              onChange={e => { setPomoSettings({ ...pomoSettings, work: Number(e.target.value) }); }}
              style={{ width: '100%' }}
            />
          </div>
          <div className="setting-item" style={{ background: 'transparent', border: 'none', padding: 0, display: 'block' }}>
            <div className="flex aic jbs mb6"><span>Short Break</span><span className="mono">{pomoSettings.short} min</span></div>
            <input
              type="range" className="srange" min="3" max="15" step="1"
              value={pomoSettings.short}
              onChange={e => { setPomoSettings({ ...pomoSettings, short: Number(e.target.value) }); }}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <div className="card">
          <div className="txt-sm fw7" style={{ marginBottom: 14 }}><i className="ph ph-crosshair"></i> Goals</div>
          <div className="flex-col g12">
            <div>
              <div className="txt-sm c-t4" style={{ marginBottom: 5 }}>Weekly hours goal</div>
              <input className="sinput" type="number" value={weekGoal} onChange={e => setWeekGoal(Number(e.target.value))} min="1" max="80" />
            </div>
            <div>
              <div className="txt-sm c-t4" style={{ marginBottom: 5 }}>Daily pomodoro goal</div>
              <input className="sinput" type="number" value={pomosGoal} onChange={e => setPomosGoal(Number(e.target.value))} min="1" max="20" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="txt-sm fw7" style={{ marginBottom: 14 }}>👤 Profile</div>
          <div className="flex-col g10" style={{ alignItems: 'stretch' }}>
            <div>
              <div className="txt-sm c-t4" style={{ marginBottom: 5 }}>Name</div>
              <input className="sinput" type="text" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Your name" onKeyDown={e => { if (e.key === 'Enter') onSaveProfile(); }} />
            </div>
            <div>
              <div className="txt-sm c-t4" style={{ marginBottom: 5 }}>Current week</div>
              <input className="sinput" type="number" value={currentWeek} onChange={e => setCurrentWeek(Number(e.target.value))} min="1" max="20" />
            </div>
            <button
              className="btn-p"
              onClick={onSaveProfile}
              disabled={profileSaving}
              style={profileSaved && !profileSaving ? { background: 'var(--green)', color: '#fff', alignSelf: 'flex-start', marginTop: 4 } : { alignSelf: 'flex-start', marginTop: 4 }}
            >{profileSaving ? 'Saving...' : (profileSaved ? '✓ Saved' : 'Save Profile')}</button>
          </div>
        </div>
        <div className="card">
          <div className="txt-sm fw7" style={{ marginBottom: 14 }}>🔔 Notifications</div>
          <div className="flex-col g10">
            <div className="setting-item">
              <div><div className="setting-label">Pomodoro Alarm</div><div className="setting-sub">Sound when session ends</div></div>
              <button className={'toggle ' + (settings.alarmOn ? 'on' : 'off')} onClick={() => setSettings({ ...settings, alarmOn: !settings.alarmOn })}></button>
            </div>
            <div className="setting-item">
              <div><div className="setting-label">Focus Mode</div><div className="setting-sub">Hide distractions</div></div>
              <button className={'toggle ' + (settings.focusMode ? 'on' : 'off')} onClick={() => setSettings({ ...settings, focusMode: !settings.focusMode })}></button>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📄</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>CV — AI Analysis</div>
            <div style={{ fontSize: 12, color: 'var(--t4)', fontFamily: 'var(--mono)' }}>Powered by Gemini</div>
          </div>
        </div>
        {!cvAnalysis ? (
          <div className="flex-col g14">
            <div style={{ fontSize: 14, color: 'var(--t3)', lineHeight: 1.7 }}>Upload your CV so Gemini can analyze your stack, detect gaps, and recommend personalized subjects.</div>
            <label className="cv-upload-label">
              <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={onCvFileChange} />
              <span>{cvFilename || 'Select PDF...'}</span>
              <span className="cv-upload-btn">Choose file</span>
            </label>
            {cvError && <div style={{ color: '#f87171', fontSize: 13, fontFamily: 'var(--mono)' }}>{cvError}</div>}
            <button
              className="btn-primary"
              style={{ alignSelf: 'flex-start' }}
              onClick={onAnalyzeCv}
              disabled={!cvFile || cvAnalyzing}
            >{cvAnalyzing ? '⏳ Analyzing...' : '✧ Analyze with Gemini'}</button>
          </div>
        ) : (
          <>
            <div className="flex aic jbs mb24" style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div className="flex aic g8">
                <span style={{ fontSize: 13, color: 'var(--t4)' }}>📎</span>
                <span style={{ fontSize: 13, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{cvFilename}</span>
              </div>
              <button className="btn-s" onClick={onClearCv} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12 }}>↺ Change CV</button>
            </div>
            <div style={{ marginBottom: 28 }}>
              <div className="ttu fs11 fw7 c-t4 ls-1 mono mb10">Summary</div>
              <div style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.75, padding: '16px 18px', background: 'rgba(59,130,246,.04)', borderLeft: '3px solid rgba(59,130,246,.3)', borderRadius: '0 10px 10px 0' }}>{cvAnalysis?.experience_summary}</div>
            </div>
            <div style={{ marginBottom: 28 }}>
              <div className="ttu fs11 fw7 c-t4 ls-1 mono mb12">Detected Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {(cvAnalysis?.skills || []).map((sk, i) => (
                  <span key={i} style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--t2)', background: 'var(--layer)', border: '1px solid var(--border2)', padding: '4px 10px', borderRadius: 6, lineHeight: 1.4 }}>{sk}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="ttu fs11 fw7 c-t4 ls-1 mono mb14">Frequent Interview Questions</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(cvAnalysis?.interview_questions || []).map((q, i) => (
                  <div
                    key={i}
                    style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0', cursor: 'pointer', transition: 'all .15s', borderBottom: '1px solid var(--border)', ...(i === 0 ? { borderTop: '1px solid var(--border)' } : {}) }}
                    onClick={() => {/* startInterviewWithQuestion(q) */}}
                    onMouseOver={e => e.currentTarget.style.paddingLeft = '8px'}
                    onMouseOut={e => e.currentTarget.style.paddingLeft = '0'}
                  >
                    <div style={{ minWidth: 26, height: 26, borderRadius: '50%', background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--blue2)', fontFamily: 'var(--mono)', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <span style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.6 }}>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
