import { useState, useRef, useCallback } from 'react';
import { SUBJECTS } from '../data/subjects';
import PlanGate from '../components/PlanGate';

const STEPS = { welcome: 0, upload_cv: 1, manual_selection: 2 };

export default function OnboardingWizard({ plan, onComplete }) {
  const [step, setStep] = useState('welcome');
  const [selected, setSelected] = useState([]);
  const [cvFile, setCvFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const fileRef = useRef(null);

  const stepIndex = STEPS[step];
  const totalSteps = plan === 'premium' ? 3 : 2;

  const steps = plan === 'premium'
    ? ['welcome', 'upload_cv', 'manual_selection']
    : ['welcome', 'manual_selection'];

  const nextStep = useCallback(() => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) {
      setStep(steps[idx + 1]);
    }
  }, [step, steps]);

  const prevStep = useCallback(() => {
    const idx = steps.indexOf(step);
    if (idx > 0) {
      setStep(steps[idx - 1]);
    }
  }, [step, steps]);

  const toggleSubject = useCallback((id) => {
    setSelected(prev => {
      const isSelected = prev.includes(id);
      if (isSelected) return prev.filter(s => s !== id);
      if (plan === 'free' && prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, [plan]);

  const finish = useCallback(() => {
    const subjects = selected.length > 0
      ? SUBJECTS.filter(s => selected.includes(s.id))
      : SUBJECTS;
    localStorage.setItem('studit_subjects', JSON.stringify(subjects));
    localStorage.setItem('studit_onboarding_done', 'true');
    onComplete?.();
  }, [selected, onComplete]);

  const handleCvDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && file.type === 'application/pdf') {
      setCvFile(file);
    }
  }, []);

  const handleCvClick = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUploadCv = useCallback(() => {
    if (plan !== 'premium') {
      setShowGate(true);
      return;
    }
    nextStep();
  }, [plan, nextStep]);

  const renderDot = (s, i) => {
    const idx = steps.indexOf(s);
    let cls = 'ow-dot';
    if (idx === stepIndex) cls += ' active';
    else if (idx < stepIndex) cls += ' done';
    return <div key={s} className={cls} />;
  };

  return (
    <div className="onboarding-wizard">
      {showGate && <PlanGate onClose={() => setShowGate(false)} />}
      <div className="ow-container">
        {totalSteps > 1 && (
          <div className="ow-step-dots">
            {steps.map((s, i) => renderDot(s, i))}
          </div>
        )}

        {step === 'welcome' && (
          <div className="ow-welcome">
            <h1 className="ow-brand">
              Stud<span>It</span>
            </h1>
            <p className="ow-sub">
              Your personal learning operating system — track subjects, generate AI study guides, and ace your exams.
            </p>
            <div className="ow-features">
              <div className="ow-feat">
                <div className="ow-feat-icon">📚</div>
                <div className="ow-feat-title">Track Progress</div>
                <div className="ow-feat-desc">Monitor chapter completion and study hours per subject</div>
              </div>
              <div className="ow-feat">
                <div className="ow-feat-icon">🤖</div>
                <div className="ow-feat-title">AI Guides</div>
                <div className="ow-feat-desc">Generate deep-dive study guides with quizzes for any chapter</div>
              </div>
              <div className="ow-feat">
                <div className="ow-feat-icon">⏱️</div>
                <div className="ow-feat-title">Pomodoro</div>
                <div className="ow-feat-desc">Stay focused with built-in timer and session tracking</div>
              </div>
            </div>
            <button className="ow-btn primary" onClick={nextStep}>
              Get Started
              <i className="ph ph-arrow-right"></i>
            </button>
          </div>
        )}

        {step === 'upload_cv' && (
          <div>
            <h2 className="ow-title">Upload Your CV</h2>
            <p className="ow-subtitle">
              We'll analyze your experience and recommend the best subjects for you.
            </p>

            {!cvFile ? (
              <div
                className={`ow-cv-dropzone${dragOver ? ' dragging' : ''}`}
                onClick={handleCvClick}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleCvDrop}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={handleCvDrop}
                />
                <div className="ow-cv-icon">
                  <i className="ph ph-file-pdf"></i>
                </div>
                <div className="ow-cv-text">Drop your CV here or click to browse</div>
                <div className="ow-cv-hint">PDF format only</div>
              </div>
            ) : (
              <div className="ow-cv-file">
                <i className="ph ph-file-pdf ow-cv-file-icon"></i>
                <div>
                  <div className="ow-cv-file-name">{cvFile.name}</div>
                  <div className="ow-cv-file-size">{formatSize(cvFile.size)}</div>
                </div>
                <button className="ow-cv-file-remove" onClick={() => setCvFile(null)}>
                  <i className="ph ph-x"></i>
                </button>
              </div>
            )}

            <div className="ow-btn-row">
              <button className="ow-btn ghost" onClick={nextStep}>
                Skip
              </button>
              <button className="ow-btn primary" onClick={handleUploadCv} disabled={!cvFile}>
                Continue
                <i className="ph ph-arrow-right"></i>
              </button>
            </div>
          </div>
        )}

        {step === 'manual_selection' && (
          <div>
            <h2 className="ow-title">Pick Your Subjects</h2>
            <p className="ow-subtitle">
              {plan === 'free'
                ? <>Choose up to <span>3 subjects</span> to get started</>
                : 'Select the subjects you want to study'}
            </p>

            <div className="ow-subject-grid">
              {SUBJECTS.map(s => {
                const isSelected = selected.includes(s.id);
                const isDisabled = !isSelected && plan === 'free' && selected.length >= 3;
                return (
                  <div
                    key={s.id}
                    className={`ow-subject-card${isSelected ? ' selected' : ''}${isDisabled ? ' disabled' : ''}`}
                    onClick={() => !isDisabled && toggleSubject(s.id)}
                  >
                    <div className={`ow-subject-icon ${s.color}`}>
                      <i className={`ph ph-${s.icon}`}></i>
                    </div>
                    <div>
                      <div className="ow-subject-name">{s.name}</div>
                      <div className="ow-subject-meta">{s.chapters || s.chapList.length + ' chapters'}</div>
                    </div>
                    <div className="ow-subject-check">
                      {isSelected && <i className="ph ph-check"></i>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="ow-btn-row">
              <button className="ow-btn ghost" onClick={prevStep}>
                <i className="ph ph-arrow-left"></i>
                Back
              </button>
              <button className="ow-btn primary" onClick={finish}>
                {selected.length > 0 ? `Start with ${selected.length} subjects` : 'Skip — use all subjects'}
                <i className="ph ph-arrow-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
