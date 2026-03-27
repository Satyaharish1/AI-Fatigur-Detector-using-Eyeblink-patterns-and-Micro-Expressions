import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import KpiCard from '../components/common/KpiCard';
import SessionTable from '../components/dashboard/SessionTable';
import PageShell from '../components/layout/PageShell';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    kpis: {
      totalSessions: 0,
      activeSessions: 0,
      criticalCount: 0,
      highCount: 0,
      avgScore: 0,
      avgEyeStress: 0,
      highEyeStressCount: 0
    },
    sessions: []
  });

  const loadOverview = async () => {
    try {
      setLoading(true);
      const response = await api.getOverview();
      setOverview(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDemo = async () => {
    await api.createDemoSession();
    await loadOverview();
  };

  const handleDeleteSession = async (sessionId) => {
    await api.deleteSession(sessionId);
    await loadOverview();
  };

  const handleClearAllSessions = async () => {
    await api.clearAllSessions();
    await loadOverview();
  };

  useEffect(() => {
    loadOverview();
  }, []);

  return (
    <PageShell>
      <section className="hero">
        <div className="hero-copy-block">
          <p className="eyebrow">AI Fatigue Intelligence</p>
          <h1>Human cognitive fatigue detector using eye micro expressions and blink patterns.</h1>
          <p className="subtitle">
            Monitor blink behavior, eye stress, visual fatigue warnings, and advanced eye-health guidance from one dashboard.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="primary-btn" to="/monitor">
            Open Live Monitor
          </Link>
          <button className="secondary-btn" onClick={handleCreateDemo}>
            Load Demo Session
          </button>
          <button className="ghost-btn" onClick={handleClearAllSessions}>
            Clear All Sessions
          </button>
        </div>
      </section>

      <section className="kpi-grid">
        <KpiCard label="Total Sessions" value={overview.kpis.totalSessions} hint="Overall recorded sessions" />
        <KpiCard label="Active Sessions" value={overview.kpis.activeSessions} hint="Currently active monitoring" />
        <KpiCard label="Average Score" value={overview.kpis.avgScore} hint="Overall fatigue average" />
        <KpiCard label="Critical Alerts" value={overview.kpis.criticalCount} hint="Immediate intervention cases" />
        <KpiCard label="Eye Stress Avg" value={overview.kpis.avgEyeStress} hint="Average ocular stress score" />
        <KpiCard label="High Eye Stress" value={overview.kpis.highEyeStressCount} hint="Sessions with elevated eye strain" />
      </section>

      <section className="panel">
        <div className="panel-head">
          <div className="section-copy">
            <p className="eyebrow">Monitoring History</p>
            <h2>Recent participant sessions</h2>
          </div>
          <button className="ghost-btn" onClick={loadOverview}>
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="empty-box">Loading analytics...</div>
        ) : (
          <SessionTable sessions={overview.sessions} onDelete={handleDeleteSession} />
        )}
      </section>

      <section className="panel">
        <p className="eyebrow">Eye Health Focus</p>
        <h2>What this project monitors</h2>
        <div className="notes-grid">
          <article className="note-card">
            <strong>Blink behavior</strong>
            <p>Per-minute blink count, blink duration, and prolonged eyelid closure patterns.</p>
          </article>
          <article className="note-card">
            <strong>Stress markers</strong>
            <p>Eye openness drop, gaze instability, brow tension, and micro-expression strain.</p>
          </article>
          <article className="note-card">
            <strong>Warnings</strong>
            <p>Dry-eye risk, digital eye strain, drowsiness risk, and focus instability.</p>
          </article>
          <article className="note-card">
            <strong>Care guidance</strong>
            <p>Actionable remedies like blink reset, glare reduction, hydration, and screen-rest routines.</p>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
