"""
IELTS Writing band-score "second opinion" predictor.

Trains a scikit-learn regressor on hand-crafted linguistic features
extracted from essay text (word/sentence stats, lexical diversity,
readability, error-proxy signals) to predict the Overall band score.

Note: the Kaggle mazlumi dataset's four sub-criteria columns
(Task_Response, Coherence_Cohesion, Lexical_Resource, Range_Accuracy)
are 100% empty in this file (0/1435 populated) — only `Overall` is
usable. So this trains a single overall-band regressor, not four
per-criterion ones.
"""

import re
import json
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import textstat
from spellchecker import SpellChecker

_SPELL = SpellChecker(distance=1)  # distance=1 keeps it fast over 1000s of essays
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

DATA_PATH = "/mnt/user-data/uploads/ielts_writing_dataset.csv"
OUT_DIR = Path("/home/claude/ai-tutor-ml")

# A small, dependency-free connector/discourse marker list used as a
# proxy signal for Coherence & Cohesion, since we have no C&C label
# to train against directly but it's still predictive of Overall.
CONNECTORS = [
    "however", "therefore", "moreover", "furthermore", "in addition",
    "on the other hand", "for example", "for instance", "in conclusion",
    "as a result", "consequently", "in contrast", "nevertheless",
    "in summary", "to sum up", "firstly", "secondly", "finally",
    "although", "despite", "in spite of", "whereas", "meanwhile",
    "thus", "hence", "additionally", "similarly", "likewise",
]

# Frequent misspellings / informal contractions seen in learner essays.
# Cheap proxy for error density without a full spellchecker dependency.
INFORMAL_MARKERS = ["don't", "can't", "won't", "isn't", "didn't", "gonna", "wanna", "i'm", "it's"]


def word_tokenize(text: str):
    return re.findall(r"[A-Za-z']+", text)


def sentence_split(text: str):
    sents = re.split(r"(?<=[.!?])\s+", text.strip())
    return [s for s in sents if s.strip()]


def extract_features(essay: str, question: str, task_type: int) -> dict:
    words = word_tokenize(essay)
    words_lower = [w.lower() for w in words]
    sentences = sentence_split(essay)
    paragraphs = [p for p in essay.split("\n") if p.strip()]

    n_words = max(len(words), 1)
    n_sents = max(len(sentences), 1)
    unique_words = set(words_lower)

    word_lengths = [len(w) for w in words] or [0]
    sent_lengths = [len(word_tokenize(s)) for s in sentences] or [0]

    long_words = sum(1 for w in words if len(w) >= 7)

    essay_lower = essay.lower()
    connector_count = sum(essay_lower.count(c) for c in CONNECTORS)
    informal_count = sum(essay_lower.count(m) for m in INFORMAL_MARKERS)

    # real spelling-error count (pure-Python pyspellchecker, no Java runtime)
    lower_words = [w.lower() for w in words if w.isalpha()]
    misspelled = _SPELL.unknown(lower_words) if lower_words else set()
    spelling_error_count = len(misspelled)
    spelling_error_rate = spelling_error_count / n_words

    # crude repeated-word proxy: how often the single most common word
    # (excluding function words) repeats relative to essay length
    from collections import Counter
    stop = {"the", "a", "an", "and", "or", "of", "to", "in", "is", "are", "was",
            "were", "be", "it", "that", "this", "for", "on", "as", "with", "at"}
    content_words = [w for w in words_lower if w not in stop]
    top_freq = Counter(content_words).most_common(1)
    top_word_ratio = (top_freq[0][1] / n_words) if top_freq else 0.0

    try:
        flesch = textstat.flesch_reading_ease(essay)
        fk_grade = textstat.flesch_kincaid_grade(essay)
    except Exception:
        flesch, fk_grade = 0.0, 0.0

    # crude keyword overlap between question prompt and essay, as a
    # weak Task-Response proxy (does the essay engage with the prompt?)
    q_words = set(w.lower() for w in word_tokenize(question or "") if len(w) > 4)
    overlap = len(q_words & unique_words) / max(len(q_words), 1)

    return {
        "task_type": int(task_type),
        "word_count": n_words,
        "sentence_count": n_sents,
        "paragraph_count": max(len(paragraphs), 1),
        "avg_sentence_length": np.mean(sent_lengths),
        "sentence_length_std": np.std(sent_lengths),
        "avg_word_length": np.mean(word_lengths),
        "long_word_ratio": long_words / n_words,
        "type_token_ratio": len(unique_words) / n_words,
        "unique_word_count": len(unique_words),
        "connector_count": connector_count,
        "connector_density": connector_count / n_sents,
        "informal_marker_count": informal_count,
        "spelling_error_count": spelling_error_count,
        "spelling_error_rate": spelling_error_rate,
        "top_word_ratio": top_word_ratio,
        "flesch_reading_ease": flesch,
        "flesch_kincaid_grade": fk_grade,
        "question_overlap": overlap,
    }


def build_dataset():
    df = pd.read_csv(DATA_PATH)
    before = len(df)
    df = df.drop_duplicates(subset=["Essay"]).reset_index(drop=True)
    print(f"Loaded {before} rows, {len(df)} after de-duplicating essays.")

    feats = []
    for _, row in df.iterrows():
        feats.append(extract_features(row["Essay"], row["Question"], row["Task_Type"]))
    feat_df = pd.DataFrame(feats)
    feat_df["Overall"] = df["Overall"].values
    return feat_df


def main():
    feat_df = build_dataset()
    feature_cols = [c for c in feat_df.columns if c != "Overall"]
    X = feat_df[feature_cols]
    y = feat_df["Overall"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    candidates = {
        "ridge": Pipeline([("scale", StandardScaler()), ("model", Ridge(alpha=2.0))]),
        "random_forest": RandomForestRegressor(
            n_estimators=300, max_depth=8, min_samples_leaf=3, random_state=42
        ),
        "gradient_boosting": GradientBoostingRegressor(
            n_estimators=300, max_depth=3, learning_rate=0.05, random_state=42
        ),
    }

    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    results = {}
    for name, model in candidates.items():
        scores = cross_val_score(model, X_train, y_train, cv=kf, scoring="neg_mean_absolute_error")
        results[name] = -scores.mean()
        print(f"{name:>18s}  CV MAE = {-scores.mean():.3f} (+/- {scores.std():.3f})")

    best_name = min(results, key=results.get)
    print(f"\nBest model: {best_name}")
    best_model = candidates[best_name]
    best_model.fit(X_train, y_train)

    preds = best_model.predict(X_test)
    # IELTS bands are on a 0.5 grid — round predictions to match
    preds_rounded = np.round(preds * 2) / 2

    mae = mean_absolute_error(y_test, preds_rounded)
    rmse = np.sqrt(mean_squared_error(y_test, preds_rounded))
    r2 = r2_score(y_test, preds_rounded)
    within_half_band = np.mean(np.abs(preds_rounded - y_test) <= 0.5)

    print(f"\nHeld-out test set (n={len(y_test)}):")
    print(f"  MAE:  {mae:.3f} bands")
    print(f"  RMSE: {rmse:.3f} bands")
    print(f"  R^2:  {r2:.3f}")
    print(f"  Within +/-0.5 band: {within_half_band*100:.1f}%")

    if hasattr(best_model, "feature_importances_"):
        importances = sorted(
            zip(feature_cols, best_model.feature_importances_), key=lambda x: -x[1]
        )
        print("\nTop features:")
        for f, imp in importances[:8]:
            print(f"  {f:>22s}  {imp:.3f}")

    # Retrain best model on ALL data for the shipped artifact
    final_model = candidates[best_name]
    final_model.fit(X, y)

    model_path = OUT_DIR / "band_predictor_model.joblib"
    joblib.dump(final_model, model_path)

    meta = {
        "model_type": best_name,
        "feature_columns": feature_cols,
        "held_out_mae": round(mae, 3),
        "held_out_rmse": round(rmse, 3),
        "held_out_r2": round(r2, 3),
        "within_half_band_pct": round(within_half_band * 100, 1),
        "n_train_rows": len(feat_df),
        "note": "Trained only on Overall band — sub-criteria columns in source CSV were empty.",
    }
    with open(OUT_DIR / "band_predictor_meta.json", "w") as f:
        json.dump(meta, f, indent=2)

    print(f"\nSaved model -> {model_path}")
    print(f"Saved metadata -> {OUT_DIR / 'band_predictor_meta.json'}")


if __name__ == "__main__":
    main()
