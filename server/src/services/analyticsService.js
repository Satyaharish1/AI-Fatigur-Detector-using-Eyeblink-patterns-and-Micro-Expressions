export function buildSummary(records) {
  if (!records.length) {
    return {
      averageScore: 0,
      peakScore: 0,
      avgBlinkRate: 0,
      avgBlinkDuration: 0,
      avgEyeStressScore: 0,
      estimatedBlinkCount: 0,
      instability: 0,
      dominantRisk: 'low',
      commonProblems: [],
      commonSymptoms: [],
      recommendations: []
    };
  }

  const aggregate = records.reduce(
    (accumulator, record) => {
      accumulator.totalScore += record.analysis.fatigueScore;
      accumulator.peakScore = Math.max(accumulator.peakScore, record.analysis.fatigueScore);
      accumulator.totalBlinkRate += record.metrics.blinkRate;
      accumulator.totalBlinkDuration += record.metrics.blinkDuration;
      accumulator.totalEyeStress += record.analysis.eyeStressScore;
      accumulator.totalBlinkCount += record.analysis.blinkCountEstimate;
      accumulator.totalInstability += record.metrics.microExpressionInstability;
      accumulator.riskCount[record.analysis.fatigueRisk] =
        (accumulator.riskCount[record.analysis.fatigueRisk] || 0) + 1;
      record.analysis.problems.forEach((problem) => {
        accumulator.problemCount[problem] = (accumulator.problemCount[problem] || 0) + 1;
      });
      (record.analysis.symptoms || []).forEach((symptom) => {
        accumulator.symptomCount[symptom] = (accumulator.symptomCount[symptom] || 0) + 1;
      });

      record.analysis.recommendations.forEach((item) => {
        accumulator.recommendations.set(item.label, item);
      });

      return accumulator;
    },
    {
      totalScore: 0,
      peakScore: 0,
      totalBlinkRate: 0,
      totalBlinkDuration: 0,
      totalEyeStress: 0,
      totalBlinkCount: 0,
      totalInstability: 0,
      riskCount: {},
      problemCount: {},
      symptomCount: {},
      recommendations: new Map()
    }
  );

  const dominantRisk =
    Object.entries(aggregate.riskCount).sort((left, right) => right[1] - left[1])[0]?.[0] || 'low';
  const commonProblems = Object.entries(aggregate.problemCount)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([problem]) => problem);
  const commonSymptoms = Object.entries(aggregate.symptomCount)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([symptom]) => symptom);

  return {
    averageScore: Math.round(aggregate.totalScore / records.length),
    peakScore: aggregate.peakScore,
    avgBlinkRate: Number((aggregate.totalBlinkRate / records.length).toFixed(1)),
    avgBlinkDuration: Number((aggregate.totalBlinkDuration / records.length).toFixed(1)),
    avgEyeStressScore: Number((aggregate.totalEyeStress / records.length).toFixed(1)),
    estimatedBlinkCount: Math.round(aggregate.totalBlinkCount),
    instability: Number((aggregate.totalInstability / records.length).toFixed(2)),
    dominantRisk,
    commonProblems,
    commonSymptoms,
    recommendations: Array.from(aggregate.recommendations.values()).slice(0, 5)
  };
}
