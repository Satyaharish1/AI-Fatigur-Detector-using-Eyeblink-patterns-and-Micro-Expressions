import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true
    },
    recordedAt: { type: Date, default: Date.now, index: true },
    metrics: {
      blinkRate: { type: Number, required: true },
      blinkDuration: { type: Number, required: true },
      prolongedBlinks: { type: Number, required: true },
      eyeAspectRatio: { type: Number, required: true },
      gazeVariance: { type: Number, required: true },
      browTension: { type: Number, required: true },
      microExpressionInstability: { type: Number, required: true },
      fixationDrift: { type: Number, required: true },
      yawnProbability: { type: Number, required: true }
    },
    analysis: {
      fatigueScore: { type: Number, required: true },
      fatigueRisk: { type: String, required: true },
      confidence: { type: Number, required: true },
      blinkCountEstimate: { type: Number, required: true },
      eyeStressScore: { type: Number, required: true },
      eyeStressLevel: { type: String, required: true },
      medicalSeverity: { type: String, required: true },
      drivers: { type: [String], default: [] },
      problems: { type: [String], default: [] },
      symptoms: { type: [String], default: [] },
      probableCauses: { type: [String], default: [] },
      warnings: { type: [String], default: [] },
      suggestedRemedies: { type: [String], default: [] },
      recommendations: {
        type: [
          {
            label: String,
            priority: String
          }
        ],
        default: []
      }
    }
  },
  { timestamps: true }
);

export const Telemetry = mongoose.model('Telemetry', telemetrySchema);
