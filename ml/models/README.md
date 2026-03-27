# ML Models

This folder stores trained ML artifacts and evaluation outputs for the cognitive fatigue detector.

## Expected model files after training

- `fatigue_classifier_bundle.joblib`
- `fatigue_regressor_bundle.joblib`
- `fatigue_classifier.joblib`
- `fatigue_regressor.joblib`
- `training_report.json`
- `feature_importance.json`
- `fatigue_sequence_classifier.joblib`
- `fatigue_sequence_regressor.joblib`
- `sequence_training_report.json`

## Current status

- `sample_fatigue_dataset.csv` is provided in `ml/data/`
- model training script is available in `ml/scripts/train_model.py`
- prediction script is available in `ml/scripts/predict.py`
- evaluation script is available in `ml/scripts/evaluate_model.py`
- sequence dataset builder is available in `ml/scripts/build_sequence_dataset.py`
- sequence model trainer is available in `ml/scripts/train_sequence_model.py`

## Train locally

```bash
cd ml
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python scripts\generate_dataset.py
python scripts\train_model.py
python scripts\build_sequence_dataset.py
python scripts\train_sequence_model.py
```

## Predict locally

```bash
python scripts\predict.py
```

## Evaluate locally

```bash
python scripts\evaluate_model.py
```
