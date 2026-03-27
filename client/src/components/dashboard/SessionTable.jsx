function RiskBadge({ risk }) {
  return <span className={`risk-badge risk-${risk}`}>{risk}</span>;
}

export default function SessionTable({ sessions, onDelete }) {
  if (!sessions.length) {
    return <div className="empty-box">No sessions yet. Create a demo session or start live monitoring.</div>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Participant</th>
            <th>Occupation</th>
            <th>Score</th>
            <th>Risk</th>
            <th>Peak</th>
            <th>Avg Blink</th>
            <th>Eye Stress</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session._id}>
              <td>{session.participantName}</td>
              <td>{session.occupation}</td>
              <td>{session.currentScore}</td>
              <td>
                <RiskBadge risk={session.currentRisk} />
              </td>
              <td>{session.summary?.peakScore || 0}</td>
              <td>{session.summary?.avgBlinkRate || 0}/min</td>
              <td>{session.summary?.avgEyeStressScore || 0}</td>
              <td>
                <button className="ghost-btn table-btn" onClick={() => onDelete(session._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
