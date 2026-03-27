import { Session } from '../models/Session.js';
import { Telemetry } from '../models/Telemetry.js';
import { getMlReports } from '../services/mlReportService.js';

export async function getOverview(req, res) {
  const sessions = await Session.find().sort({ updatedAt: -1 }).limit(25).lean();

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter((item) => item.status === 'active').length;
  const criticalCount = sessions.filter((item) => item.currentRisk === 'critical').length;
  const highCount = sessions.filter((item) => item.currentRisk === 'high').length;
  const highEyeStressCount = sessions.filter((item) => (item.summary?.avgEyeStressScore || 0) >= 60).length;
  const avgScore = totalSessions
    ? Math.round(sessions.reduce((sum, item) => sum + (item.currentScore || 0), 0) / totalSessions)
    : 0;
  const avgEyeStress = totalSessions
    ? Math.round(sessions.reduce((sum, item) => sum + (item.summary?.avgEyeStressScore || 0), 0) / totalSessions)
    : 0;

  res.json({
    success: true,
    data: {
      kpis: {
        totalSessions,
        activeSessions,
        criticalCount,
        highCount,
        avgScore,
        avgEyeStress,
        highEyeStressCount
      },
      sessions
    }
  });
}

export async function getAdminInsights(req, res) {
  const sessions = await Session.find().sort({ updatedAt: -1 }).limit(50).lean();
  const telemetry = await Telemetry.find().sort({ recordedAt: -1 }).limit(200).lean();

  const riskDistribution = sessions.reduce(
    (accumulator, session) => {
      accumulator[session.currentRisk] = (accumulator[session.currentRisk] || 0) + 1;
      return accumulator;
    },
    { low: 0, moderate: 0, high: 0, critical: 0 }
  );

  const timeline = telemetry.slice(-12).map((item) => ({
    recordedAt: item.recordedAt,
    fatigueScore: item.analysis.fatigueScore,
    fatigueRisk: item.analysis.fatigueRisk
  }));

  const highRiskSessions = sessions
    .filter((session) => ['high', 'critical'].includes(session.currentRisk))
    .map((session) => ({
      participantName: session.participantName,
      occupation: session.occupation,
      currentScore: session.currentScore,
      currentRisk: session.currentRisk,
      avgEyeStressScore: session.summary?.avgEyeStressScore || 0,
      commonProblems: session.summary?.commonProblems || [],
      commonSymptoms: session.summary?.commonSymptoms || []
    }));

  const problemDistribution = telemetry.reduce((accumulator, item) => {
    (item.analysis?.problems || []).forEach((problem) => {
      accumulator[problem] = (accumulator[problem] || 0) + 1;
    });
    return accumulator;
  }, {});

  res.json({
    success: true,
    data: {
      riskDistribution,
      timeline,
      highRiskSessions,
      problemDistribution,
      mlReports: getMlReports()
    }
  });
}
