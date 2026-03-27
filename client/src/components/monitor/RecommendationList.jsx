export default function RecommendationList({ analysis }) {
  const recommendations = analysis?.recommendations || [];

  return (
    <section className="panel">
      <p className="eyebrow">Recommendations</p>
      <h2>Intervention actions</h2>
      {!recommendations.length ? (
        <div className="empty-box">Current fatigue state is low. No immediate action is required.</div>
      ) : (
        <div className="recommendation-list">
          {recommendations.map((item) => (
            <article className="recommendation-card" key={item.label}>
              <strong>{item.priority.toUpperCase()}</strong>
              <p>{item.label}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
