import os
import random
import pandas as pd


OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "fatigue_dataset.csv")


def clamp(value, min_value, max_value):
    return max(min_value, min(value, max_value))


def generate_row(index):
    fatigue_level = random.choice(["low", "moderate", "high", "critical"])
    fatigue_score_map = {
        "low": random.randint(10, 35),
        "moderate": random.randint(40, 60),
        "high": random.randint(65, 84),
        "critical": random.randint(85, 98),
    }
    score = fatigue_score_map[fatigue_level]
    severity = score / 100

    return {
        "blink_rate": round(14 + severity * 25 + random.uniform(-2, 2), 2),
        "blink_duration": round(170 + severity * 240 + random.uniform(-18, 18), 2),
        "prolonged_blinks": int(clamp(severity * 10 + random.uniform(-1, 1), 0, 10)),
        "eye_aspect_ratio": round(clamp(0.34 - severity * 0.16 + random.uniform(-0.02, 0.02), 0.14, 0.34), 3),
        "gaze_variance": round(clamp(0.12 + severity * 0.82 + random.uniform(-0.05, 0.05), 0.1, 1), 3),
        "brow_tension": round(clamp(0.14 + severity * 0.75 + random.uniform(-0.05, 0.05), 0.1, 1), 3),
        "micro_expression_instability": round(
            clamp(0.12 + severity * 0.8 + random.uniform(-0.05, 0.05), 0.1, 1), 3
        ),
        "fixation_drift": round(clamp(0.08 + severity * 0.78 + random.uniform(-0.05, 0.05), 0.05, 1), 3),
        "yawn_probability": round(clamp(severity * 0.85 + random.uniform(-0.08, 0.08), 0, 1), 3),
        "fatigue_score": score,
        "fatigue_label": fatigue_level,
    }


def main():
    rows = [generate_row(index) for index in range(1200)]
    df = pd.DataFrame(rows)
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Dataset created at {os.path.abspath(OUTPUT_PATH)} with {len(df)} rows")


if __name__ == "__main__":
    main()
