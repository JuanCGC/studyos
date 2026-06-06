export default function Toggle({ checked, onChange, label, sublabel }) {
  return (
    <div className="setting-item">
      {(label || sublabel) && (
        <div>
          {label && <div className="setting-label">{label}</div>}
          {sublabel && <div className="setting-sub">{sublabel}</div>}
        </div>
      )}
      <button
        className={'toggle ' + (checked ? 'on' : 'off')}
        onClick={() => onChange(!checked)}
        aria-checked={checked}
        role="switch"
      />
    </div>
  );
}
