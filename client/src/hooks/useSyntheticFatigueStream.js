import { useEffect, useRef, useState } from 'react';

function createMetrics(tick, startTime) {
  const elapsedMinutes = (Date.now() - startTime) / 60000;
  const fatigueGrowth = Math.min(elapsedMinutes / 10, 1);
  const wave = Math.sin(tick / 2) * 0.5 + 0.5;

  return {
    blinkRate: Number((12 + fatigueGrowth * 8 + wave * 5).toFixed(1)),
    blinkDuration: Math.round(170 + fatigueGrowth * 120 + wave * 28),
    prolongedBlinks: Math.min(Math.round(fatigueGrowth * 4 + wave * 3), 7),
    eyeAspectRatio: Number((0.31 - fatigueGrowth * 0.07 - wave * 0.03).toFixed(2)),
    gazeVariance: Number((0.16 + fatigueGrowth * 0.3 + wave * 0.2).toFixed(2)),
    browTension: Number((0.18 + fatigueGrowth * 0.24 + wave * 0.18).toFixed(2)),
    microExpressionInstability: Number((0.14 + fatigueGrowth * 0.32 + wave * 0.18).toFixed(2)),
    fixationDrift: Number((0.08 + fatigueGrowth * 0.28 + wave * 0.18).toFixed(2)),
    yawnProbability: Number((fatigueGrowth * 0.4 + wave * 0.24).toFixed(2))
  };
}

export function useSyntheticFatigueStream(isRunning, resetKey = 0) {
  const [metrics, setMetrics] = useState(() => createMetrics(0, Date.now()));
  const tickRef = useRef(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    tickRef.current = 0;
    startRef.current = Date.now();
    setMetrics(createMetrics(0, Date.now()));
  }, [resetKey]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const intervalId = window.setInterval(() => {
      tickRef.current += 1;
      setMetrics(createMetrics(tickRef.current, startRef.current));
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  return metrics;
}
