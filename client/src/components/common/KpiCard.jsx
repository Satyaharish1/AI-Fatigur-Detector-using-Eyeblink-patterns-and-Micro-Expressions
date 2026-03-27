export default function KpiCard({ label, value, hint }) {
  return (
    <article className="kpi-card">
      <p className="kpi-label">{label}</p>
      <h3>{value}</h3>
      <span className="kpi-hint">{hint}</span>
    </article>
  );
}
