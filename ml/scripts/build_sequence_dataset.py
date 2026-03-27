import json
import os

import pandas as pd

from ml_utils import add_engineered_features, resolve_dataset_path


BASE_DIR = os.path.join(os.path.dirname(__file__), "..")
OUTPUT_PATH = os.path.join(BASE_DIR, "data", "fatigue_sequence_dataset.csv")
METADATA_PATH = os.path.join(BASE_DIR, "data", "fatigue_sequence_metadata.json")
SEQUENCE_LENGTH = 5


def main():
    dataset_path = resolve_dataset_path()
    dataframe = pd.read_csv(dataset_path)
    dataframe = add_engineered_features(dataframe)

    feature_columns = [column for column in dataframe.columns if column not in ["fatigue_score", "fatigue_label"]]
    rows = []

    for start_index in range(0, len(dataframe) - SEQUENCE_LENGTH + 1):
        window = dataframe.iloc[start_index : start_index + SEQUENCE_LENGTH]
        row = {}

        for time_step, (_, window_row) in enumerate(window.iterrows()):
            for column in feature_columns:
                row[f"t{time_step + 1}_{column}"] = window_row[column]

        row["sequence_target_score"] = float(window.iloc[-1]["fatigue_score"])
        row["sequence_target_label"] = window.iloc[-1]["fatigue_label"]
        row["sequence_mean_score"] = float(window["fatigue_score"].mean())
        row["sequence_score_delta"] = float(window.iloc[-1]["fatigue_score"] - window.iloc[0]["fatigue_score"])
        rows.append(row)

    sequence_df = pd.DataFrame(rows)
    sequence_df.to_csv(OUTPUT_PATH, index=False)

    metadata = {
        "source_dataset": os.path.abspath(dataset_path),
        "sequence_length": SEQUENCE_LENGTH,
        "sequence_rows": len(sequence_df),
        "feature_columns_per_timestep": feature_columns
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as file:
        json.dump(metadata, file, indent=2)

    print(f"Sequence dataset saved to {os.path.abspath(OUTPUT_PATH)}")
    print(f"Sequence metadata saved to {os.path.abspath(METADATA_PATH)}")


if __name__ == "__main__":
    main()
