const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalize = (value, min, max) => clamp((value - min) / (max - min), 0, 1);
const EAR_BLINK_THRESHOLD = 0.21;
const EAR_SEVERE_THRESHOLD = 0.18;

function getRisk(score) {
  if (score >= 85) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 40) return 'moderate';
  return 'low';
}

function getEyeStressLevel(score) {
  if (score >= 80) return 'severe';
  if (score >= 60) return 'high';
  if (score >= 35) return 'moderate';
  return 'low';
}

function getMedicalSeverity(fatigueScore, eyeStressScore) {
  const merged = Math.round((fatigueScore * 0.55) + (eyeStressScore * 0.45));
  if (merged >= 85) return 'critical';
  if (merged >= 65) return 'high';
  if (merged >= 40) return 'moderate';
  return 'mild';
}

function buildMedicalSummary(problems, metrics, fatigueScore, eyeStressScore) {
  const symptoms = [];
  const probableCauses = [];
  const warnings = [];
  const suggestedRemedies = [];

  if (problems.includes('dry_eye_risk')) {
    symptoms.push('Reduced blink efficiency');
    symptoms.push('Possible dryness or irritation');
    probableCauses.push('Low blink frequency or prolonged screen fixation');
    warnings.push('Blink frequency appears lower than the normal comfort range.');
    suggestedRemedies.push('Follow the 20-20-20 rule and increase conscious blinking');
    suggestedRemedies.push('Use lubricating eye drops only if advised by a clinician.');
  }
  if (problems.includes('digital_eye_strain')) {
    symptoms.push('Visual strain during screen exposure');
    probableCauses.push('Extended display time and unstable gaze focus');
    warnings.push('Digital eye strain pattern is elevated.');
    suggestedRemedies.push('Reduce screen brightness and increase viewing distance');
    suggestedRemedies.push('Switch focus to a distant object for 20 seconds every 20 minutes.');
  }
  if (problems.includes('drowsiness_risk')) {
    symptoms.push('Slow blink recovery and alertness drop');
    probableCauses.push('Sleep debt, fatigue accumulation, or heavy cognitive load');
    warnings.push('Drowsiness markers are high for the current monitoring window.');
    suggestedRemedies.push('Stop high-risk work temporarily and take a recovery break');
  }
  if (problems.includes('stress_load_signature')) {
    symptoms.push('Tension around the eye and brow region');
    probableCauses.push('Mental stress or ergonomic strain');
    warnings.push('Stress-related eye tension signature is present.');
    suggestedRemedies.push('Relax posture, hydrate, and reduce task pressure');
  }
  if (problems.includes('focus_instability')) {
    symptoms.push('Irregular focus and unstable attention pattern');
    probableCauses.push('Visual fatigue or concentration loss');
    warnings.push('Focus instability suggests reduced sustained attention.');
    suggestedRemedies.push('Use a short visual reset before continuing concentration-heavy tasks');
  }

  if (!symptoms.length && fatigueScore < 40 && eyeStressScore < 35) {
    symptoms.push('No significant eye-fatigue symptoms detected');
    probableCauses.push('Current monitoring window appears stable');
    warnings.push('No major eye-health warning is active right now.');
    suggestedRemedies.push('Maintain normal work-rest balance');
  }

  if (metrics.blinkDuration >= 320 && !symptoms.includes('Frequent long eyelid closure')) {
    symptoms.push('Frequent long eyelid closure');
    warnings.push('Long blink duration may indicate growing fatigue or drowsiness.');
  }

  if (metrics.blinkRate < 12) {
    warnings.push('Blink rate is below the typical relaxed range of 12-20 blinks per minute.');
  }
  if (metrics.blinkRate > 24) {
    warnings.push('Blink rate is above the typical relaxed range and may reflect strain or fatigue.');
  }
  if (metrics.eyeAspectRatio <= EAR_BLINK_THRESHOLD) {
    warnings.push('Eye openness is significantly reduced in the current reading.');
  }

  return {
    symptoms: Array.from(new Set(symptoms)),
    probableCauses: Array.from(new Set(probableCauses)),
    warnings: Array.from(new Set(warnings)),
    suggestedRemedies: Array.from(new Set(suggestedRemedies))
  };
}

function getRecommendations(score, drivers, problems) {
  const recommendations = [];

  if (score >= 40) {
    recommendations.push({
      label: 'Take a short 3 minute visual break and reduce workload intensity',
      priority: 'warning'
    });
  }
  if (drivers.includes('prolonged_blinks')) {
    recommendations.push({
      label: 'Pause precision tasks and confirm alertness before resuming',
      priority: 'urgent'
    });
  }
  if (drivers.includes('micro_expression_strain')) {
    recommendations.push({
      label: 'Check stress level, screen brightness, and ergonomic posture',
      priority: 'info'
    });
  }
  if (drivers.includes('gaze_drift')) {
    recommendations.push({
      label: 'Run a quick focus recalibration prompt on screen',
      priority: 'info'
    });
  }
  if (problems.includes('dry_eye_risk')) {
    recommendations.push({
      label: 'Encourage blinking exercises and check for dry-eye strain symptoms',
      priority: 'info'
    });
  }
  if (problems.includes('digital_eye_strain')) {
    recommendations.push({
      label: 'Reduce blue-light exposure and increase viewing distance from the screen',
      priority: 'warning'
    });
  }
  if (problems.includes('drowsiness_risk')) {
    recommendations.push({
      label: 'High drowsiness signature detected. Stop safety-critical work temporarily',
      priority: 'urgent'
    });
  }

  return recommendations;
}

export function evaluateFatigue(metrics) {
  const blinkRateScore = normalize(metrics.blinkRate, 15, 42);
  const blinkDurationScore = normalize(metrics.blinkDuration, 170, 420);
  const prolongedScore = normalize(metrics.prolongedBlinks, 0, 10);
  const earDropScore = 1 - normalize(metrics.eyeAspectRatio, 0.16, 0.34);
  const gazeScore = normalize(metrics.gazeVariance, 0.1, 1);
  const browScore = normalize(metrics.browTension, 0.1, 1);
  const instabilityScore = normalize(metrics.microExpressionInstability, 0.1, 1);
  const fixationScore = normalize(metrics.fixationDrift, 0.05, 1);
  const yawnScore = normalize(metrics.yawnProbability, 0, 1);
  const blinkCountEstimate = Math.round(metrics.blinkRate);
  const eyeStressWeighted =
    blinkDurationScore * 0.22 +
    prolongedScore * 0.2 +
    earDropScore * 0.15 +
    gazeScore * 0.14 +
    browScore * 0.1 +
    instabilityScore * 0.1 +
    fixationScore * 0.05 +
    yawnScore * 0.04;

  const weightedScore =
    blinkRateScore * 0.13 +
    blinkDurationScore * 0.15 +
    prolongedScore * 0.16 +
    earDropScore * 0.11 +
    gazeScore * 0.1 +
    browScore * 0.08 +
    instabilityScore * 0.12 +
    fixationScore * 0.08 +
    yawnScore * 0.07;

  const fatigueScore = Math.round(clamp(weightedScore * 100, 0, 100));
  const eyeStressScore = Math.round(clamp(eyeStressWeighted * 100, 0, 100));
  const eyeStressLevel = getEyeStressLevel(eyeStressScore);
  const medicalSeverity = getMedicalSeverity(fatigueScore, eyeStressScore);
  const drivers = [];
  const problems = [];

  if (metrics.prolongedBlinks >= 4 || metrics.blinkDuration >= 300) {
    drivers.push('prolonged_blinks');
  }
  if (metrics.microExpressionInstability >= 0.55 || metrics.browTension >= 0.65) {
    drivers.push('micro_expression_strain');
  }
  if (metrics.gazeVariance >= 0.55 || metrics.fixationDrift >= 0.5) {
    drivers.push('gaze_drift');
  }
  if (metrics.eyeAspectRatio <= EAR_BLINK_THRESHOLD) {
    drivers.push('eye_openness_drop');
  }
  if (metrics.blinkRate <= 12 || metrics.blinkDuration >= 290) {
    problems.push('dry_eye_risk');
  }
  if (metrics.gazeVariance >= 0.6 || metrics.fixationDrift >= 0.52 || eyeStressScore >= 55) {
    problems.push('digital_eye_strain');
  }
  if (metrics.prolongedBlinks >= 5 || metrics.yawnProbability >= 0.45 || fatigueScore >= 75) {
    problems.push('drowsiness_risk');
  }
  if (metrics.microExpressionInstability >= 0.62 || metrics.browTension >= 0.7) {
    problems.push('stress_load_signature');
  }
  if (metrics.blinkRate >= 30 && metrics.gazeVariance >= 0.58) {
    problems.push('focus_instability');
  }

  const fatigueRisk = getRisk(fatigueScore);
  const medicalSummary = buildMedicalSummary(problems, metrics, fatigueScore, eyeStressScore);
  const confidence = Number(
    clamp(0.56 + drivers.length * 0.08 + instabilityScore * 0.1 + prolongedScore * 0.1, 0.56, 0.98).toFixed(2)
  );

  return {
    fatigueScore,
    fatigueRisk,
    confidence,
    blinkCountEstimate,
    eyeStressScore,
    eyeStressLevel,
    earBlinkThreshold: EAR_BLINK_THRESHOLD,
    earSevereThreshold: EAR_SEVERE_THRESHOLD,
    medicalSeverity,
    drivers,
    problems,
    symptoms: medicalSummary.symptoms,
    probableCauses: medicalSummary.probableCauses,
    warnings: medicalSummary.warnings,
    suggestedRemedies: medicalSummary.suggestedRemedies,
    recommendations: getRecommendations(fatigueScore, drivers, problems)
  };
}
