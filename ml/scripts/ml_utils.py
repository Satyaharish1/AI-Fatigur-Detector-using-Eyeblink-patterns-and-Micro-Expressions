import json
import os
from typing import Dict, Tuple

import pandas as pd


BASE_DIR = os.path.join(os.path.dirname(__file__), "..")
DEFAULT_DATASET_PATH = os.path.join(BASE_DIR, "data", "fatigue_dataset.csv")
FALLBACK_DATASET_PATH = os.path.join(BASE_DIR, "data", "sample_fatigue_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")

RAW_FEATURES = [
    "blink_rate",
    "blink_duration",
    "prolonged_blinks",
    "eye_aspect_ratio",
    "gaze_variance",
    "brow_tension",
    "micro_expression_instability",
    "fixation_drift",
    "yawn_probability",
]


def resolve_dataset_path() -> str:
    if os.path.exists(DEFAULT_DATASET_PATH):
        return DEFAULT_DATASET_PATH
    if os.path.exists(FALLBACK_DATASET_PATH):
        return FALLBACK_DATASET_PATH
    raise FileNotFoundError("No dataset found in ml/data. Run generate_dataset.py first.")


def add_engineered_features(dataframe: pd.DataFrame) -> pd.DataFrame:
    df = dataframe.copy()

    df["blink_load_index"] = df["blink_rate"] * df["blink_duration"] / 100.0
    df["closure_strain_index"] = df["prolonged_blinks"] * (1 - df["eye_aspect_ratio"])
    df["instability_tension_ratio"] = df["micro_expression_instability"] / (df["brow_tension"] + 1e-6)
    df["visual_fatigue_index"] = (
        df["gaze_variance"] * 0.35
        + df["micro_expression_instability"] * 0.30
        + df["fixation_drift"] * 0.20
        + df["yawn_probability"] * 0.15
    )
    df["blink_yawn_interaction"] = df["blink_rate"] * df["yawn_probability"]
    df["focus_loss_index"] = df["gaze_variance"] + df["fixation_drift"]
    df["eye_closure_pressure"] = (1 - df["eye_aspect_ratio"]) * df["blink_duration"]

    return df


def get_feature_columns(dataframe: pd.DataFrame):
    return [column for column in dataframe.columns if column not in ["fatigue_score", "fatigue_label"]]


def load_training_frame() -> Tuple[pd.DataFrame, str]:
    dataset_path = resolve_dataset_path()
    dataframe = pd.read_csv(dataset_path)
    dataframe = add_engineered_features(dataframe)
    return dataframe, dataset_path


def ensure_models_dir() -> None:
    os.makedirs(MODELS_DIR, exist_ok=True)


def save_json(path: str, payload: Dict) -> None:
    with open(path, "w", encoding="utf-8") as file:
        json.dump(payload, file, indent=2)
