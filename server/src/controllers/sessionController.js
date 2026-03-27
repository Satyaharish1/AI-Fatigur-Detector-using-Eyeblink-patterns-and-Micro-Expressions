import { Session } from '../models/Session.js';
import { Telemetry } from '../models/Telemetry.js';
import { buildSummary } from '../services/analyticsService.js';
import { evaluateFatigue } from '../services/fatigueEngine.js';
import { createDemoStream } from '../utils/demoData.js';

export async function createSession(req, res) {
  const session = await Session.create({
    participantId: req.body.participantId,
    participantName: req.body.participantName,
    occupation: req.body.occupation,
    age: req.body.age,
    gender: req.body.gender,
    environment: req.body.environment || {}
  });

  res.status(201).json({ success: true, data: session });
}

export async function addTelemetry(req, res) {
  const session = await Session.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  const analysis = evaluateFatigue(req.body);
  const telemetry = await Telemetry.create({
    sessionId: session._id,
    metrics: req.body,
    analysis
  });

  const recentRecords = await Telemetry.find({ sessionId: session._id }).sort({ recordedAt: -1 }).limit(120).lean();
  const summary = buildSummary(recentRecords);

  session.currentScore = analysis.fatigueScore;
  session.currentRisk = analysis.fatigueRisk;
  session.summary = summary;
  await session.save();

  res.status(201).json({
    success: true,
    data: {
      telemetry,
      session: {
        currentScore: session.currentScore,
        currentRisk: session.currentRisk,
        summary: session.summary
      }
    }
  });
}

export async function getSessionDetails(req, res) {
  const session = await Session.findById(req.params.id).lean();
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  const telemetry = await Telemetry.find({ sessionId: session._id }).sort({ recordedAt: -1 }).limit(20).lean();

  res.json({
    success: true,
    data: {
      session,
      telemetry: telemetry.reverse()
    }
  });
}

export async function createDemoSession(req, res) {
  const session = await Session.create({
    participantId: `DEMO-${Date.now()}`,
    participantName: 'Demo User',
    occupation: 'Research Engineer',
    age: 27,
    gender: 'Not specified',
    environment: {
      lighting: 'dim',
      workHours: 6,
      caffeineMg: 140
    }
  });

  const records = createDemoStream().map((metrics) => ({
    sessionId: session._id,
    metrics,
    analysis: evaluateFatigue(metrics)
  }));

  await Telemetry.insertMany(records);
  const inserted = await Telemetry.find({ sessionId: session._id }).lean();
  session.summary = buildSummary(inserted);
  session.currentScore = session.summary.peakScore;
  session.currentRisk = session.summary.dominantRisk;
  await session.save();

  res.status(201).json({ success: true, data: { sessionId: session._id } });
}

export async function deleteSession(req, res) {
  const session = await Session.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  await Telemetry.deleteMany({ sessionId: session._id });
  await Session.deleteOne({ _id: session._id });

  res.json({
    success: true,
    message: 'Session deleted successfully'
  });
}

export async function clearAllSessions(req, res) {
  const deletedTelemetry = await Telemetry.deleteMany({});
  const deletedSessions = await Session.deleteMany({});

  res.json({
    success: true,
    message: 'All sessions cleared successfully',
    data: {
      deletedSessions: deletedSessions.deletedCount || 0,
      deletedTelemetry: deletedTelemetry.deletedCount || 0
    }
  });
}
