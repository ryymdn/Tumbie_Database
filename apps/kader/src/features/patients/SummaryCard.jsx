export default function SummaryCard({ label, value, note, noteKind, icon: Icon, tone }) {
  return (
    <div className="sum-card">
      <span className={`sum-icon ${tone}`}><Icon size={20} /></span>
      <div>
        <small>{label}</small>
        <div className="sum-value">
          <strong>{value}</strong>
          <span className={`sum-note ${noteKind}`}>{note}</span>
        </div>
      </div>
    </div>
  );
}
