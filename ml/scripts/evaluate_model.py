import os

import joblib
import pandas as pd
from sklearn.metrics import classification_report, mean_absolute_error, r2_score

from ml_utils import MODELS_DIR, add_engineered_features, get_feature_columns, resolve_dataset_path


CLASSIFIER_BUNDLE_PATH = os.path.join(MODELS_DIR, "fatigue_classifier_bundle.joblib")
REGRESSOR_BUNDLE_PATH = os.path.join(MODELS_DIR, "fatigue_regressor_bundle.joblib")


def main():
    if not os.path.exists(CLASSIFIER_BUNDLE_PATH) or not os.path.exists(REGRESSOR_BUNDLE_PATH):
        raise FileNotFoundError("Train the advanced ML models first.")

    classifier_bundle = joblib.load(CLASSIFIER_BUNDLE_PATH)
    regressor_bundle = joblib.load(REGRESSOR_BUNDLE_PATH)

    dataset_path = resolve_dataset_path()
    dataframe = pd.read_csv(dataset_path)
    dataframe = add_engineered_features(dataframe)
    feature_columns = get_feature_columns(dataframe)

    x = dataframe[feature_columns]
    y_label = dataframe["fatigue_label"]
    y_score = dataframe["fatigue_score"]

    predicted_labels = classifier_bundle["pipeline"].predict(x)
    predicted_scores = regressor_bundle["pipeline"].predict(x)

    print("Advanced classifier report")
    print(classification_report(y_label, predicted_labels))
    print(f"Advanced regressor MAE: {mean_absolute_error(y_score, predicted_scores):.4f}")
    print(f"Advanced regressor R2: {r2_score(y_score, predicted_scores):.4f}")


if __name__ == "__main__":
    main()
