# AI Based Human Cognitive Fatigue Detector

A MEAN-style fatigue monitoring project for estimating cognitive fatigue from eye-related signals such as blink rate, blink duration, eye aspect ratio, gaze instability, and micro-expression strain. The current web app includes a live monitor, session dashboard, local MongoDB storage, PDF report saving, and a Python ML module for future model training.

## Stack

- MongoDB
- Express.js
- React.js frontend
- Node.js
- Python ML scripts

## Current Project Modules

- `client/` React web app
- `server/` Express API, fatigue scoring, PDF report generation
- `ml/` dataset generation, model training, evaluation, prediction
- `reports/` saved PDF reports

## Current Features

- Login and registration
- Dashboard with session overview
- Live fatigue monitor
- Blink rate, blink count, blink duration, and EAR display
- Eye stress scoring and medical-style warning sections
- Webcam preview with permission prompt
- Demo fallback when camera access is blocked
- Pause stream and voice alert support
- PDF report saving into the local `reports/` folder
- Local MongoDB session and telemetry storage
- ML scripts for dataset generation, classical model training, and sequence modeling

## Folder Structure

```text
fatigue detector/
|-- client/
|-- server/
|-- ml/
|-- reports/
|-- package.json
|-- README.md
```

## Requirements

- Node.js and npm
- MongoDB running locally on your laptop
- Python 3 for the `ml/` folder

## Local MongoDB Configuration

Create this file:

`server/.env`

Use values like:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cognitive_fatigue_detector
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=super-secret-fatigue-key
```

## Install

From the project root:

```bash
npm run install:all
```

## Run The Project

Start the backend:

```bash
npm run dev:server
```

Start the frontend in another terminal:

```bash
npm run dev:client
```

Open:

- Frontend: `http://localhost:5173`
- Auth page: `http://localhost:5173/auth`
- API health check: `http://localhost:5000/api/health`

## How The Website Works

1. Register or log in from `/auth`
2. Open the dashboard to view saved sessions
3. Open the monitor page to start a fatigue session
4. Use `Open Camera` to request webcam access
5. If camera access is denied, continue with demo mode
6. Start the session and monitor blink and eye-stress metrics
7. Pause the stream when needed
8. Export a PDF report, which is saved in the local `reports/` folder

## Webcam Note

The current monitor page includes:

- webcam preview
- browser camera permission request
- fallback demo mode if permission is denied

Real eye landmark extraction is not fully integrated yet. The current fatigue metrics are still driven by a simulator designed for demo use. The webcam block is ready for future MediaPipe or OpenCV integration.

## Eye Metrics Used

- Blink rate
- Blink count per minute
- Blink duration
- Eye Aspect Ratio (EAR)
- Prolonged blinks
- Gaze variance
- Brow tension
- Micro-expression instability
- Fixation drift
- Yawn probability

## PDF Reports

When `Export PDF` is used on the monitor page, the report is saved here:

`reports/`

The report includes:

- participant details
- session ID
- current eye metrics
- fatigue risk
- eye stress summary
- warnings
- symptoms
- probable causes
- suggested remedies

## ML Module

The `ml/` folder includes:

- synthetic dataset generation
- feature engineering
- model training
- sequence dataset preparation
- prediction scripts
- evaluation scripts

Example ML run flow:

```bash
cd ml
py -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python scripts\generate_dataset.py
python scripts\train_model.py
python scripts\build_sequence_dataset.py
python scripts\train_sequence_model.py
python scripts\evaluate_model.py
python scripts\predict.py
```

## Important Notes

- This project currently uses simulated eye metrics for analysis logic.
- Camera preview is real, but real-time eye landmark fatigue extraction is not fully wired yet.
- MongoDB must be running locally before starting the backend.
- If port `5000` is already in use, stop the old server process before starting again.

## Future Upgrade Path

- MediaPipe FaceMesh integration
- Real blink detection from webcam frames
- Real EAR computation from eye landmarks
- Real micro-expression tracking
- ML model inference directly from live webcam features
