export default function PlanGate({ onClose }) {
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
        <div className="plan-gate-btn-row">
          <button className="ow-btn premium" onClick={() => alert('🚧 Payment flow coming soon')}>
            <i className="ph ph-crown"></i>
            Go Premium
          </button>
          <button className="plan-gate-skip" onClick={onClose}>Maybe later</button>
        </div>
      </div>
    </div>
  );
}
