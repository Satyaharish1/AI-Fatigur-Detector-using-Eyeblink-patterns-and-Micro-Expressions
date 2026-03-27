import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import KpiCard from '../components/common/KpiCard';
import PageShell from '../components/layout/PageShell';
import LiveChart from '../components/monitor/LiveChart';
import RecommendationList from '../components/monitor/RecommendationList';
import { useSyntheticFatigueStream } from '../hooks/useSyntheticFatigueStream';
import { integrationNotes } from '../data/integrationNotes';

const EAR_BLINK_THRESHOLD = 0.21;
const EAR_SEVERE_THRESHOLD = 0.18;

function generateParticipantId() {
  return `PT-${Math.floor(1000 + Math.random() * 9000)}`;
}

function calculateClientAnalysis(metrics) {
  const score = Math.round(
    Math.min(
      100,
      metrics.blinkRate * 0.9 +
        metrics.prolongedBlinks * 4 +
        metrics.gazeVariance * 14 +
        metrics.microExpressionInstability * 20 +
        metrics.fixationDrift * 12
    )
  );

  let fatigueRisk = 'low';
  if (score >= 85) fatigueRisk = 'critical';
  else if (score >= 65) fatigueRisk = 'high';
  else if (score >= 40) fatigueRisk = 'moderate';

  const recommendations = [];
  if (score >= 40) {
    recommendations.push({
      label: 'Take a short screen break and reduce attention-heavy work',
      priority: 'warning'
    });
  }
  if (metrics.prolongedBlinks >= 4) {
    recommendations.push({
      label: 'Pause fine-grained task execution and recover alertness',
      priority: 'urgent'
    });
  }

  const eyeStressScore = Math.round(
    Math.min(
      100,
      metrics.blinkDuration * 0.08 +
        metrics.prolongedBlinks * 5 +
        (1 - metrics.eyeAspectRatio) * 45 +
        metrics.gazeVariance * 18 +
        metrics.browTension * 14
    )
  );
  const blinkCountEstimate = Math.round(metrics.blinkRate);
  const blinkPatternStatus =
    metrics.blinkRate < 12 ? 'Low blink rate' :
    metrics.blinkRate > 24 ? 'High blink rate' :
    'Normal blink range';
  const problems = [];
  if (metrics.blinkRate <= 12 || metrics.blinkDuration >= 290) problems.push('Dry eye risk');
  if (metrics.gazeVariance >= 0.6 || metrics.fixationDrift >= 0.5 || eyeStressScore >= 55) problems.push('Digital eye strain');
  if (metrics.prolongedBlinks >= 5 || metrics.yawnProbability >= 0.45 || score >= 75) problems.push('Drowsiness risk');
  if (metrics.microExpressionInstability >= 0.62 || metrics.browTension >= 0.7) problems.push('Stress load signature');
  if (metrics.blinkRate >= 30 && metrics.gazeVariance >= 0.58) problems.push('Focus instability');
  const medicalSeverity =
    score >= 85 || eyeStressScore >= 80 ? 'critical' :
    score >= 65 || eyeStressScore >= 60 ? 'high' :
    score >= 40 || eyeStressScore >= 35 ? 'moderate' : 'mild';
  const symptoms = [];
  const probableCauses = [];
  const warnings = [];
  const suggestedRemedies = [];
  if (problems.includes('Dry eye risk')) {
    symptoms.push('Reduced blink efficiency');
    probableCauses.push('Low blink frequency or prolonged visual fixation');
    warnings.push('Blink frequency is below the normal comfort range.');
    suggestedRemedies.push('Blink consciously and follow the 20-20-20 rule');
    suggestedRemedies.push('Consider a short hydration break and reduce air-flow directly toward the eyes');
  }
  if (problems.includes('Digital eye strain')) {
    symptoms.push('Visual strain during prolonged screen viewing');
    probableCauses.push('Extended screen time and unstable focus');
    warnings.push('Screen-related eye strain markers are elevated.');
    suggestedRemedies.push('Reduce brightness and increase viewing distance');
    suggestedRemedies.push('Use larger text size and reduce glare on the display');
  }
  if (problems.includes('Drowsiness risk')) {
    symptoms.push('Slow eyelid recovery and alertness drop');
    probableCauses.push('Sleep loss or fatigue accumulation');
    warnings.push('Drowsiness pattern is present and may affect sustained attention.');
    suggestedRemedies.push('Take a rest break before continuing');
    suggestedRemedies.push('Avoid driving or safety-critical tasks until alertness improves');
  }
  if (problems.includes('Stress load signature')) {
    symptoms.push('Tension around the brow and eye area');
    probableCauses.push('Mental stress or prolonged concentration');
    warnings.push('Stress-related eye tension is elevated.');
    suggestedRemedies.push('Relax posture and lower task intensity');
  }
  if (problems.includes('Focus instability')) {
    symptoms.push('Fluctuating visual attention');
    probableCauses.push('Cognitive fatigue or screen overload');
    warnings.push('Focus instability may reduce task accuracy.');
    suggestedRemedies.push('Use a short focus reset exercise');
  }
  if (!symptoms.length) {
    symptoms.push('No major eye-fatigue symptoms detected');
    probableCauses.push('Current eye behavior appears stable');
    warnings.push('No major eye-health warning is active right now.');
    suggestedRemedies.push('Maintain normal work-rest balance');
  }
  if (metrics.blinkRate < 12) warnings.push('Blink rate is below the typical 12-20 blinks/minute range.');
  if (metrics.blinkRate > 24) warnings.push('Blink rate is above the typical relaxed range and may indicate strain.');
  if (metrics.eyeAspectRatio <= EAR_BLINK_THRESHOLD) warnings.push('Eye openness is below the blink threshold in the current sample.');

  return {
    fatigueScore: score,
    fatigueRisk,
    recommendations,
    eyeStressScore,
    blinkCountEstimate,
    blinkPatternStatus,
    problems,
    medicalSeverity,
    symptoms,
    probableCauses,
    warnings,
    suggestedRemedies
  };
}

export default function MonitorPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [history, setHistory] = useState([]);
  const [streamResetKey, setStreamResetKey] = useState(0);
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(true);
  const [alertMessage, setAlertMessage] = useState('Voice alerts are enabled for high-risk eye-fatigue states.');
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [cameraMessage, setCameraMessage] = useState('Open camera to preview the participant before starting analysis.');
  const [participant, setParticipant] = useState({
    participantId: generateParticipantId(),
    participantName: 'Hari',
    occupation: 'Developer',
    age: 24,
    gender: 'Male',
    lighting: 'normal',
    workHours: 4,
    caffeineMg: 80
  });

  const metrics = useSyntheticFatigueStream(isRunning, streamResetKey);
  const analysis = useMemo(() => calculateClientAnalysis(metrics), [metrics]);
  const lastSpokenRiskRef = useRef('low');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const requestCameraAccess = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unsupported');
      setCameraMessage('Camera API is not available in this browser. You can continue in demo mode.');
      return false;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 960 },
          height: { ideal: 540 }
        },
        audio: false
      });

      stopCameraStream();
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraStatus('granted');
      setCameraMessage('Camera is active. Live webcam preview is ready for future eye-landmark integration.');
      return true;
    } catch (error) {
      setCameraStatus('denied');
      setCameraMessage('Camera access was blocked. Please allow camera permission, or continue with demo mode.');
      return false;
    }
  };

  const startMonitoring = async () => {
    const response = await api.createSession({
      participantId: participant.participantId,
      participantName: participant.participantName,
      occupation: participant.occupation,
      age: Number(participant.age),
      gender: participant.gender,
      environment: {
        lighting: participant.lighting,
        workHours: Number(participant.workHours),
        caffeineMg: Number(participant.caffeineMg)
      }
    });

    setSessionId(response.data._id);
    setHistory([]);
    setStreamResetKey((value) => value + 1);
    setIsRunning(true);
    setAlertMessage('Monitoring started. Live eye-fatigue analysis is running.');
  };

  const pushTelemetry = async () => {
    if (!sessionId) return;

    const payload = {
      blinkRate: metrics.blinkRate,
      blinkDuration: metrics.blinkDuration,
      prolongedBlinks: metrics.prolongedBlinks,
      eyeAspectRatio: metrics.eyeAspectRatio,
      gazeVariance: metrics.gazeVariance,
      browTension: metrics.browTension,
      microExpressionInstability: metrics.microExpressionInstability,
      fixationDrift: metrics.fixationDrift,
      yawnProbability: metrics.yawnProbability
    };

    await api.sendTelemetry(sessionId, payload);
    setHistory((previous) => [...previous.slice(-13), payload]);
  };

  const handleStart = async () => {
    await requestCameraAccess();
    await startMonitoring();
  };

  const handleStop = () => {
    setIsRunning(false);
    stopCameraStream();
    setCameraStatus((current) => (current === 'denied' || current === 'unsupported' ? current : 'idle'));
    setCameraMessage('Camera preview stopped. Open camera again when you are ready for another session.');
    window.speechSynthesis?.cancel();
    setAlertMessage('Stream paused. Telemetry and voice alerts have stopped.');
  };

  const handleGenerateId = () => {
    setParticipant((current) => ({ ...current, participantId: generateParticipantId() }));
  };

  const handleDownloadReport = () => {
    api.saveMonitorPdf({
      generatedAt: new Date().toISOString(),
      participant,
      sessionId,
      currentMetrics: metrics,
      currentAnalysis: analysis,
      recentHistory: history
    })
      .then((response) => {
        setAlertMessage(`PDF saved to ${response.data.fullPath}`);
      })
      .catch((error) => {
        setAlertMessage(error.message);
      });
  };

  useEffect(() => {
    if (!isRunning || !sessionId) return;
    pushTelemetry().catch((error) => console.error(error));
  }, [metrics, isRunning, sessionId]);

  useEffect(() => {
    if (!voiceAlertsEnabled || !isRunning) return;
    if (!window.speechSynthesis) return;
    if (!['high', 'critical'].includes(analysis.fatigueRisk)) return;
    if (lastSpokenRiskRef.current === analysis.fatigueRisk) return;

    const message =
      analysis.fatigueRisk === 'critical'
        ? 'Critical eye fatigue warning. Stop visual work and take an immediate recovery break.'
        : 'High eye fatigue warning. Please reduce screen load and take a short break.';

    lastSpokenRiskRef.current = analysis.fatigueRisk;
    setAlertMessage(message);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [analysis.fatigueRisk, isRunning, voiceAlertsEnabled]);

  useEffect(() => {
    if (!['high', 'critical'].includes(analysis.fatigueRisk)) {
      lastSpokenRiskRef.current = 'low';
    }
  }, [analysis.fatigueRisk]);

  useEffect(() => () => {
    stopCameraStream();
    window.speechSynthesis?.cancel();
  }, []);

  return (
    <PageShell>
      <section className="hero compact-hero">
        <div className="hero-copy-block">
          <p className="eyebrow">Live Monitoring Lab</p>
          <h1>Real-time cognitive fatigue session runner.</h1>
          <p className="subtitle">
            The current demo uses a more realistic blink-range simulator and can later be replaced with MediaPipe landmark input.
          </p>
        </div>
        <div className="hero-actions">
          <button className="primary-btn" onClick={handleStart}>
            Start Session
          </button>
          <button className="secondary-btn" onClick={handleStop}>
            Pause Stream
          </button>
          <button className="ghost-btn" onClick={handleDownloadReport}>
            Export PDF
          </button>
          <Link className="ghost-btn" to="/">
            Back Dashboard
          </Link>
        </div>
      </section>

      <section className="monitor-layout">
        <section className="panel form-panel">
          <p className="eyebrow">Participant Input</p>
          <h2>Session setup</h2>
          <div className="form-grid">
            <label>
              Participant ID
              <div className="inline-field">
                <input
                  value={participant.participantId}
                  onChange={(event) => setParticipant({ ...participant, participantId: event.target.value })}
                />
                <button type="button" className="ghost-btn inline-btn" onClick={handleGenerateId}>
                  Auto ID
                </button>
              </div>
            </label>
            <label>
              Name
              <input
                value={participant.participantName}
                onChange={(event) => setParticipant({ ...participant, participantName: event.target.value })}
              />
            </label>
            <label>
              Occupation
              <input
                value={participant.occupation}
                onChange={(event) => setParticipant({ ...participant, occupation: event.target.value })}
              />
            </label>
            <label>
              Age
              <input value={participant.age} onChange={(event) => setParticipant({ ...participant, age: event.target.value })} />
            </label>
            <label>
              Gender
              <input value={participant.gender} onChange={(event) => setParticipant({ ...participant, gender: event.target.value })} />
            </label>
            <label>
              Lighting
              <select
                value={participant.lighting}
                onChange={(event) => setParticipant({ ...participant, lighting: event.target.value })}
              >
                <option value="dim">Dim</option>
                <option value="normal">Normal</option>
                <option value="bright">Bright</option>
              </select>
            </label>
          </div>
          <p className="session-id-text">{sessionId ? `Active Session ID: ${sessionId}` : 'No session has been started yet.'}</p>
          <div className="info-strip">
            <span>{alertMessage}</span>
            <button
              type="button"
              className="ghost-btn inline-btn"
              onClick={() => {
                const nextValue = !voiceAlertsEnabled;
                setVoiceAlertsEnabled(nextValue);
                if (!nextValue) {
                  window.speechSynthesis?.cancel();
                  setAlertMessage('Voice alerts are turned off.');
                } else {
                  setAlertMessage('Voice alerts are enabled for high-risk eye-fatigue states.');
                }
              }}
            >
              {voiceAlertsEnabled ? 'Voice Alert On' : 'Voice Alert Off'}
            </button>
          </div>
        </section>

        <section className="panel">
          <p className="eyebrow">Camera Preview</p>
          <h2>Webcam access</h2>
          <div className="camera-card">
            <video ref={videoRef} className="camera-preview" autoPlay muted playsInline />
            <div className="camera-status-box">
              <strong>
                {cameraStatus === 'granted' ? 'Camera Connected' :
                 cameraStatus === 'denied' ? 'Permission Needed' :
                 cameraStatus === 'unsupported' ? 'Camera Not Supported' :
                 'Camera Not Opened'}
              </strong>
              <p>{cameraMessage}</p>
              <div className="hero-actions">
                <button type="button" className="secondary-btn" onClick={requestCameraAccess}>
                  Open Camera
                </button>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    stopCameraStream();
                    setCameraStatus('fallback');
                    setCameraMessage('Camera preview is off. The monitor will continue with simulated eye metrics.');
                  }}
                >
                  Continue Demo Mode
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="kpi-grid monitor-kpis">
          <KpiCard label="Blink Rate" value={`${metrics.blinkRate}/min`} hint="Current eye blink frequency" />
          <KpiCard label="Blink Count" value={analysis.blinkCountEstimate} hint="Estimated blinks per minute" />
          <KpiCard label="Blink Pattern" value={analysis.blinkPatternStatus} hint="Normal range is about 12-20 blinks/min" />
          <KpiCard label="Blink Duration" value={`${metrics.blinkDuration} ms`} hint="Average blink duration" />
          <KpiCard
            label="EAR"
            value={metrics.eyeAspectRatio}
            hint={`Blink threshold ${EAR_BLINK_THRESHOLD}, severe below ${EAR_SEVERE_THRESHOLD}`}
          />
          <KpiCard label="Risk" value={analysis.fatigueRisk} hint={`Current score ${analysis.fatigueScore}`} />
          <KpiCard label="Eye Stress" value={analysis.eyeStressScore} hint="Estimated ocular stress score" />
        </section>
      </section>

      <LiveChart history={history.length ? history : [metrics]} />
      <RecommendationList analysis={analysis} />

      <section className="panel">
        <p className="eyebrow">Eye Problem Signals</p>
        <h2>Detected eye-related issues</h2>
        {!analysis.problems.length ? (
          <div className="empty-box">No major eye-stress problems detected in the current window.</div>
        ) : (
          <div className="recommendation-list">
            {analysis.problems.map((problem) => (
              <article className="recommendation-card" key={problem}>
                <strong>FLAG</strong>
                <p>{problem}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <p className="eyebrow">Medical Style Summary</p>
        <h2>Eye-related assessment</h2>
        <div className="notes-grid">
          <article className="note-card">
            <strong>Severity</strong>
            <p>{analysis.medicalSeverity}</p>
          </article>
          <article className="note-card">
            <strong>Symptoms</strong>
            <p>{analysis.symptoms.join(', ')}</p>
          </article>
          <article className="note-card">
            <strong>Probable Causes</strong>
            <p>{analysis.probableCauses.join(', ')}</p>
          </article>
          <article className="note-card">
            <strong>Suggested Remedy</strong>
            <p>{analysis.suggestedRemedies.join(', ')}</p>
          </article>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Warnings and Care Plan</p>
        <h2>Advanced eye-health guidance</h2>
        <div className="notes-grid">
          <article className="note-card">
            <strong>Warnings</strong>
            <p>{analysis.warnings.join(', ')}</p>
          </article>
          <article className="note-card">
            <strong>Care Actions</strong>
            <p>
              Reduce glare, maintain a comfortable viewing distance, blink fully, hydrate regularly, and take short
              visual recovery breaks.
            </p>
          </article>
          <article className="note-card">
            <strong>Escalation Advice</strong>
            <p>
              If high eye stress persists across multiple sessions, consider reducing screen workload and seeking
              professional medical advice.
            </p>
          </article>
          <article className="note-card">
            <strong>Healthy Blink Target</strong>
            <p>
              A comfortable relaxed blink pattern is often around 12-20 blinks per minute with complete eyelid
              closure and low strain.
            </p>
          </article>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">ML / CV Integration</p>
        <h2>Real deployment guide</h2>
        <div className="notes-grid">
          {integrationNotes.map((note) => (
            <article className="note-card" key={note}>
              {note}
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
