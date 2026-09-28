export function PrototypeBadge({ children }) {
  return (
    <span className="prototype-badge">
      <i className="fas fa-flask" aria-hidden="true" />
      {children || "نموذج أولي / تجريبي"}
    </span>
  );
}
