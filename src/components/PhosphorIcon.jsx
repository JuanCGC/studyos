export function PhosphorIcon({ name, size, className, style }) {
  return <i className={`ph ph-${name} ${className || ''}`} style={{ fontSize: size, ...style }} />;
}
