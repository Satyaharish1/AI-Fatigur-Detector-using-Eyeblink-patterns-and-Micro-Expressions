# API Overview

## Health

- `GET /api/health`

## Sessions

- `POST /api/sessions`
- `POST /api/sessions/demo`
- `GET /api/sessions/:id`
- `POST /api/sessions/:id/telemetry`

## Analytics

- `GET /api/analytics/overview`

## Telemetry Payload

```json
{
  "blinkRate": 28.5,
  "blinkDuration": 280,
  "prolongedBlinks": 4,
  "eyeAspectRatio": 0.21,
  "gazeVariance": 0.62,
  "browTension": 0.59,
  "microExpressionInstability": 0.71,
  "fixationDrift": 0.48,
  "yawnProbability": 0.32
}
```
