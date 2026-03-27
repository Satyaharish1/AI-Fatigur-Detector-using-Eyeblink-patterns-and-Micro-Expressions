import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    priority: { type: String, enum: ['info', 'warning', 'urgent'], default: 'info' }
  },
  { _id: false }
);

const sessionSummarySchema = new mongoose.Schema(
  {
    averageScore: { type: Number, default: 0 },
    peakScore: { type: Number, default: 0 },
    avgBlinkRate: { type: Number, default: 0 },
    avgBlinkDuration: { type: Number, default: 0 },
    avgEyeStressScore: { type: Number, default: 0 },
    estimatedBlinkCount: { type: Number, default: 0 },
    instability: { type: Number, default: 0 },
    dominantRisk: { type: String, default: 'low' },
    commonProblems: { type: [String], default: [] },
    commonSymptoms: { type: [String], default: [] },
    recommendations: { type: [recommendationSchema], default: [] }
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    participantId: { type: String, required: true, index: true },
    participantName: { type: String, required: true },
    occupation: { type: String, default: 'Operator' },
    age: { type: Number, default: 0 },
    gender: { type: String, default: 'Not specified' },
    environment: {
      lighting: { type: String, default: 'normal' },
      workHours: { type: Number, default: 0 },
      caffeineMg: { type: Number, default: 0 }
    },
    currentScore: { type: Number, default: 0 },
    currentRisk: { type: String, default: 'low' },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active'
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    summary: { type: sessionSummarySchema, default: () => ({}) }
  },
  { timestamps: true }
);

export const Session = mongoose.model('Session', sessionSchema);
