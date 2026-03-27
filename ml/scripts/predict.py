import os
import joblib
import pandas as pd

from ml_utils import add_engineered_features


BASE_DIR = os.path.join(os.path.dirname(__file__), "..")
CLASSIFIER_PATH = os.path.join(BASE_DIR, "models", "fatigue_classifier_bundle.joblib")
REGRESSOR_PATH = os.path.join(BASE_DIR, "models", "fatigue_regressor_bundle.joblib")


sample = {
    "blink_rate": 31.0,
    "blink_duration": 315.0,
    "prolonged_blinks": 5,
    "eye_aspect_ratio": 0.19,
    "gaze_variance": 0.66,
    "brow_tension": 0.58,
    "micro_expression_instability": 0.71,
    "fixation_drift": 0.54,
    "yawn_probability": 0.48,
}


def main():
    if not os.path.exists(CLASSIFIER_PATH) or not os.path.exists(REGRESSOR_PATH):
        raise FileNotFoundError("Model files not found. Run train_model.py first.")

    classifier_bundle = joblib.load(CLASSIFIER_PATH)
    regressor_bundle = joblib.load(REGRESSOR_PATH)

    dataframe = pd.DataFrame([sample])
    dataframe = add_engineered_features(dataframe)
    feature_columns = classifier_bundle["feature_columns"]
    dataframe = dataframe[feature_columns]

    predicted_label = classifier_bundle["pipeline"].predict(dataframe)[0]
    predicted_score = float(regressor_bundle["pipeline"].predict(dataframe)[0])

    print("Prediction sample")
    print(sample)
    print(f"Predicted label: {predicted_label}")
    print(f"Predicted fatigue score: {predicted_score:.2f}")


if __name__ == "__main__":
    main()
