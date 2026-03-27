export function createDemoStream() {
  return Array.from({ length: 15 }, (_, index) => ({
    blinkRate: Number((16 + index * 1.4).toFixed(1)),
    blinkDuration: 180 + index * 11,
    prolongedBlinks: Math.min(index, 8),
    eyeAspectRatio: Number((0.31 - index * 0.009).toFixed(2)),
    gazeVariance: Number((0.2 + index * 0.045).toFixed(2)),
    browTension: Number((0.18 + index * 0.04).toFixed(2)),
    microExpressionInstability: Number((0.16 + index * 0.05).toFixed(2)),
    fixationDrift: Number((0.1 + index * 0.05).toFixed(2)),
    yawnProbability: Number(Math.min(index * 0.06, 0.92).toFixed(2))
  }));
}
