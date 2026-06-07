import { useState } from 'react';

export default function PlanGate({ onClose, onCheckout }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!onCheckout) return;
    setError('');
    setLoading(true);
    try {
      await onCheckout('pro');
    } catch (e) {
      setError(e.message || 'Could not start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="plan-gate-overlay" onClick={onClose}>
      <div className="plan-gate-modal" onClick={e => e.stopPropagation()}>
        <div className="plan-gate-icon">⚡</div>
        <h2 className="plan-gate-title">Unlock Premium</h2>
        <p className="plan-gate-desc">
          Get CV analysis, unlimited subjects, AI study plans, and more.
        </p>
        <div className="plan-gate-features">
          <div className="plan-gate-feat">
            <i className="ph ph-check-circle"></i>
            AI-powered CV analysis & subject matching
          </div>
          <div className="plan-gate-feat">
            <i className="ph ph-check-circle"></i>
            Unlimited subjects — no cap
          </div>
          <div className="plan-gate-feat">
            <i className="ph ph-check-circle"></i>
            Personalized learning roadmaps
          </div>
          <div className="plan-gate-feat">
            <i className="ph ph-check-circle"></i>
            Priority AI guide generation
          </div>
        </div>
        <div className="plan-gate-price">
          $19 <span>/mo</span>
        </div>
        <div className="plan-gate-period">Cancel anytime</div>
        {error && (
          <p style={{ color: '#f87171', fontSize: 13, fontFamily: 'var(--mono)', marginBottom: 12 }}>
            {error}
          </p>
        )}
        <div className="plan-gate-btn-row">
          <button className="ow-btn premium" onClick={handleCheckout} disabled={loading}>
            <i className="ph ph-crown"></i>
            {loading ? 'Redirecting…' : 'Go Premium'}
          </button>
          <button className="plan-gate-skip" onClick={onClose} disabled={loading}>Maybe later</button>
        </div>
      </div>
    </div>
  );
}
