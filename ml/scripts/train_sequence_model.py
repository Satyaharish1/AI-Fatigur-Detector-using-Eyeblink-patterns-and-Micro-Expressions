import os

import joblib
import pandas as pd
from sklearn.ensemble import ExtraTreesClassifier, ExtraTreesRegressor
from sklearn.metrics import accuracy_score, classification_report, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from ml_utils import MODELS_DIR, ensure_models_dir, save_json


BASE_DIR = os.path.join(os.path.dirname(__file__), "..")
SEQUENCE_DATASET_PATH = os.path.join(BASE_DIR, "data", "fatigue_sequence_dataset.csv")
SEQUENCE_CLASSIFIER_PATH = os.path.join(MODELS_DIR, "fatigue_sequence_classifier.joblib")
SEQUENCE_REGRESSOR_PATH = os.path.join(MODELS_DIR, "fatigue_sequence_regressor.joblib")
SEQUENCE_REPORT_PATH = os.path.join(MODELS_DIR, "sequence_training_report.json")


def main():
    if not os.path.exists(SEQUENCE_DATASET_PATH):
        raise FileNotFoundError("Sequence dataset not found. Run build_sequence_dataset.py first.")

    dataframe = pd.read_csv(SEQUENCE_DATASET_PATH)
    x = dataframe.drop(columns=["sequence_target_score", "sequence_target_label"])
    y_label = dataframe["sequence_target_label"]
    y_score = dataframe["sequence_target_score"]

    x_train, x_test, y_train_label, y_test_label, y_train_score, y_test_score = train_test_split(
        x,
        y_label,
        y_score,
        test_size=0.2,
        random_state=42,
        stratify=y_label
    )

    classifier = ExtraTreesClassifier(n_estimators=350, max_depth=18, random_state=42)
    regressor = ExtraTreesRegressor(n_estimators=350, max_depth=18, random_state=42)

    classifier.fit(x_train, y_train_label)
    regressor.fit(x_train, y_train_score)

    predicted_labels = classifier.predict(x_test)
    predicted_scores = regressor.predict(x_test)

    accuracy = accuracy_score(y_test_label, predicted_labels)
    mae = mean_absolute_error(y_test_score, predicted_scores)
    r2 = r2_score(y_test_score, predicted_scores)

    ensure_models_dir()
    joblib.dump({"model": classifier, "feature_columns": x.columns.tolist()}, SEQUENCE_CLASSIFIER_PATH)
    joblib.dump({"model": regressor, "feature_columns": x.columns.tolist()}, SEQUENCE_REGRESSOR_PATH)

    save_json(
        SEQUENCE_REPORT_PATH,
        {
          "sequence_dataset_path": os.path.abspath(SEQUENCE_DATASET_PATH),
          "sequence_feature_count": len(x.columns),
          "classification_accuracy": round(float(accuracy), 4),
          "regression_mae": round(float(mae), 4),
          "regression_r2": round(float(r2), 4),
          "classification_report": classification_report(y_test_label, predicted_labels, output_dict=True)
        }
    )

    print(f"Sequence classifier saved to {os.path.abspath(SEQUENCE_CLASSIFIER_PATH)}")
    print(f"Sequence regressor saved to {os.path.abspath(SEQUENCE_REGRESSOR_PATH)}")
    print(f"Sequence classification accuracy: {accuracy:.4f}")
    print(f"Sequence regression MAE: {mae:.4f}")
    print(f"Sequence regression R2: {r2:.4f}")


if __name__ == "__main__":
    main()
