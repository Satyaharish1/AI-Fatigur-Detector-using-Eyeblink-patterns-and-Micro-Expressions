import os

import joblib
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import ExtraTreesClassifier, ExtraTreesRegressor, RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report, mean_absolute_error, r2_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from ml_utils import MODELS_DIR, ensure_models_dir, get_feature_columns, load_training_frame, save_json


CLASSIFIER_BUNDLE_PATH = os.path.join(MODELS_DIR, "fatigue_classifier_bundle.joblib")
REGRESSOR_BUNDLE_PATH = os.path.join(MODELS_DIR, "fatigue_regressor_bundle.joblib")
LEGACY_CLASSIFIER_PATH = os.path.join(MODELS_DIR, "fatigue_classifier.joblib")
LEGACY_REGRESSOR_PATH = os.path.join(MODELS_DIR, "fatigue_regressor.joblib")
REPORT_PATH = os.path.join(MODELS_DIR, "training_report.json")
FEATURE_IMPORTANCE_PATH = os.path.join(MODELS_DIR, "feature_importance.json")


def build_preprocessor(feature_columns):
    return ColumnTransformer(
        transformers=[
            (
                "numeric",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                        ("scaler", StandardScaler())
                    ]
                ),
                feature_columns
            )
        ]
    )


def main():
    dataframe, dataset_path = load_training_frame()
    feature_columns = get_feature_columns(dataframe)

    x = dataframe[feature_columns]
    y_label = dataframe["fatigue_label"]
    y_score = dataframe["fatigue_score"]

    x_train, x_test, y_train_label, y_test_label, y_train_score, y_test_score = train_test_split(
        x,
        y_label,
        y_score,
        test_size=0.2,
        random_state=42,
        stratify=y_label
    )

    preprocessor = build_preprocessor(feature_columns)

    classifier_candidates = {
        "random_forest_classifier": RandomForestClassifier(n_estimators=300, max_depth=12, random_state=42),
        "extra_trees_classifier": ExtraTreesClassifier(n_estimators=300, max_depth=14, random_state=42)
    }
    regressor_candidates = {
        "random_forest_regressor": RandomForestRegressor(n_estimators=300, max_depth=12, random_state=42),
        "extra_trees_regressor": ExtraTreesRegressor(n_estimators=300, max_depth=14, random_state=42)
    }

    best_classifier_name = None
    best_classifier_score = -1
    best_classifier_pipeline = None

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for name, model in classifier_candidates.items():
        pipeline = Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("model", model)
            ]
        )
        cv_score = cross_val_score(pipeline, x_train, y_train_label, cv=skf, scoring="accuracy").mean()
        if cv_score > best_classifier_score:
            best_classifier_score = cv_score
            best_classifier_name = name
            best_classifier_pipeline = pipeline

    best_regressor_name = None
    best_regressor_score = float("inf")
    best_regressor_pipeline = None

    for name, model in regressor_candidates.items():
        pipeline = Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("model", model)
            ]
        )
        pipeline.fit(x_train, y_train_score)
        predicted = pipeline.predict(x_test)
        mae = mean_absolute_error(y_test_score, predicted)
        if mae < best_regressor_score:
            best_regressor_score = mae
            best_regressor_name = name
            best_regressor_pipeline = pipeline

    best_classifier_pipeline.fit(x_train, y_train_label)
    best_regressor_pipeline.fit(x_train, y_train_score)

    predicted_labels = best_classifier_pipeline.predict(x_test)
    predicted_scores = best_regressor_pipeline.predict(x_test)

    accuracy = accuracy_score(y_test_label, predicted_labels)
    mae = mean_absolute_error(y_test_score, predicted_scores)
    r2 = r2_score(y_test_score, predicted_scores)
    report = classification_report(y_test_label, predicted_labels, output_dict=True)

    classifier_model = best_classifier_pipeline.named_steps["model"]
    importances = getattr(classifier_model, "feature_importances_", None)
    feature_importance_payload = {}
    if importances is not None:
        feature_importance_payload = {
            column: float(score)
            for column, score in sorted(zip(feature_columns, importances), key=lambda item: item[1], reverse=True)
        }

    ensure_models_dir()
    classifier_bundle = {
        "pipeline": best_classifier_pipeline,
        "feature_columns": feature_columns,
        "best_model_name": best_classifier_name
    }
    regressor_bundle = {
        "pipeline": best_regressor_pipeline,
        "feature_columns": feature_columns,
        "best_model_name": best_regressor_name
    }

    joblib.dump(classifier_bundle, CLASSIFIER_BUNDLE_PATH)
    joblib.dump(regressor_bundle, REGRESSOR_BUNDLE_PATH)
    joblib.dump(best_classifier_pipeline, LEGACY_CLASSIFIER_PATH)
    joblib.dump(best_regressor_pipeline, LEGACY_REGRESSOR_PATH)

    save_json(
        REPORT_PATH,
        {
            "dataset_path": os.path.abspath(dataset_path),
            "feature_count": len(feature_columns),
            "best_classifier_model": best_classifier_name,
            "best_regressor_model": best_regressor_name,
            "classification_accuracy": round(float(accuracy), 4),
            "classification_cv_accuracy": round(float(best_classifier_score), 4),
            "regression_mae": round(float(mae), 4),
            "regression_r2": round(float(r2), 4),
            "classification_report": report
        }
    )
    save_json(FEATURE_IMPORTANCE_PATH, feature_importance_payload)

    print(f"Advanced classifier bundle saved to {os.path.abspath(CLASSIFIER_BUNDLE_PATH)}")
    print(f"Advanced regressor bundle saved to {os.path.abspath(REGRESSOR_BUNDLE_PATH)}")
    print(f"Best classifier: {best_classifier_name}")
    print(f"Best regressor: {best_regressor_name}")
    print(f"Classification accuracy: {accuracy:.4f}")
    print(f"Cross-validation accuracy: {best_classifier_score:.4f}")
    print(f"Regression MAE: {mae:.4f}")
    print(f"Regression R2: {r2:.4f}")


if __name__ == "__main__":
    main()
