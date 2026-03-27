export default function LiveChart({ history }) {
  return (
    <div className="chart-card">
      <div className="section-copy">
        <p className="eyebrow">Live Trend</p>
        <h2>Blink pattern drift</h2>
      </div>
      <div className="bars">
        {history.map((item, index) => (
          <span
            key={`${item.blinkRate}-${index}`}
            className="bar"
            style={{ height: `${Math.max(18, item.blinkRate * 2.2)}px` }}
            title={`Blink rate ${item.blinkRate}`}
          />
        ))}
      </div>
    </div>
  );
}
