"""
Drop-in "second opinion" band predictor for the AI Tutor grading node.

Usage in engine.py:

    from band_predictor import BandPredictor

    _predictor = BandPredictor()  # load once at module import, not per-request

    def grading_node(state):
        ...
        ml_result = _predictor.predict(
            essay=state["essay_text"],
            question=state["prompt_text"],
            task_type=state["task_type"],  # 1 or 2
        )
        # ml_result = {"predicted_band": 6.5, "confidence_note": "...", "flag": False}
        ...

Ships with the trained model + feature list bundled in this folder
(band_predictor_model.joblib, band_predictor_meta.json) so no
retraining is needed at request time. Everything runs locally —
no network calls, no paid API.
"""

import json
import re
from collections import Counter
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import textstat
from spellchecker import SpellChecker

_SPELL = SpellChecker(distance=1)

_DIR = Path(__file__).parent
_MODEL_PATH = _DIR / "band_predictor_model.joblib"
_META_PATH = _DIR / "band_predictor_meta.json"

CONNECTORS = [
    "however", "therefore", "moreover", "furthermore", "in addition",
    "on the other hand", "for example", "for instance", "in conclusion",
    "as a result", "consequently", "in contrast", "nevertheless",
    "in summary", "to sum up", "firstly", "secondly", "finally",
    "although", "despite", "in spite of", "whereas", "meanwhile",
    "thus", "hence", "additionally", "similarly", "likewise",
]
INFORMAL_MARKERS = ["don't", "can't", "won't", "isn't", "didn't", "gonna", "wanna", "i'm", "it's"]
STOP = {"the", "a", "an", "and", "or", "of", "to", "in", "is", "are", "was",
        "were", "be", "it", "that", "this", "for", "on", "as", "with", "at"}


def _word_tokenize(text: str):
    return re.findall(r"[A-Za-z']+", text)


def _sentence_split(text: str):
    sents = re.split(r"(?<=[.!?])\s+", text.strip())
    return [s for s in sents if s.strip()]


def _extract_features(essay: str, question: str, task_type: int) -> dict:
    words = _word_tokenize(essay)
    words_lower = [w.lower() for w in words]
    sentences = _sentence_split(essay)
    paragraphs = [p for p in essay.split("\n") if p.strip()]

    n_words = max(len(words), 1)
    n_sents = max(len(sentences), 1)
    unique_words = set(words_lower)

    word_lengths = [len(w) for w in words] or [0]
    sent_lengths = [len(_word_tokenize(s)) for s in sentences] or [0]
    long_words = sum(1 for w in words if len(w) >= 7)

    essay_lower = essay.lower()
    connector_count = sum(essay_lower.count(c) for c in CONNECTORS)
    informal_count = sum(essay_lower.count(m) for m in INFORMAL_MARKERS)

    lower_words = [w.lower() for w in words if w.isalpha()]
    misspelled = _SPELL.unknown(lower_words) if lower_words else set()
    spelling_error_count = len(misspelled)
    spelling_error_rate = spelling_error_count / n_words

    content_words = [w for w in words_lower if w not in STOP]
    top_freq = Counter(content_words).most_common(1)
    top_word_ratio = (top_freq[0][1] / n_words) if top_freq else 0.0

    try:
        flesch = textstat.flesch_reading_ease(essay)
        fk_grade = textstat.flesch_kincaid_grade(essay)
    except Exception:
        flesch, fk_grade = 0.0, 0.0

    q_words = set(w.lower() for w in _word_tokenize(question or "") if len(w) > 4)
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


class BandPredictor:
    def __init__(self, model_path: Path = _MODEL_PATH, meta_path: Path = _META_PATH):
        self.model = joblib.load(model_path)
        with open(meta_path) as f:
            self.meta = json.load(f)
        self.feature_columns = self.meta["feature_columns"]

    def predict(self, essay: str, question: str = "", task_type: int = 2) -> dict:
        if not essay or len(essay.strip()) < 20:
            return {
                "predicted_band": None,
                "flag": True,
                "reason": "essay too short to score reliably",
            }

        feats = _extract_features(essay, question, task_type)
        x = pd.DataFrame([[feats[c] for c in self.feature_columns]], columns=self.feature_columns)
        raw_pred = float(self.model.predict(x)[0])
        pred = round(raw_pred * 2) / 2  # snap to IELTS 0.5 grid
        pred = min(max(pred, 1.0), 9.0)  # clip to valid band range

        return {
            "predicted_band": pred,
            "raw_prediction": round(raw_pred, 2),
            "flag": False,
            "model_type": self.meta["model_type"],
            "expected_error_bands": self.meta["held_out_mae"],
        }

    def compare_with_llm(self, llm_band: float, essay: str, question: str = "",
                          task_type: int = 2, disagreement_threshold: float = 1.0) -> dict:
        """Convenience wrapper for the grading node: runs the ML model and
        flags cases where it disagrees with the LLM's score by more than
        `disagreement_threshold` bands, so those can be surfaced for review
        or reasoning cross-check rather than silently trusted either way."""
        ml_result = self.predict(essay, question, task_type)
        if ml_result["predicted_band"] is None:
            return {**ml_result, "llm_band": llm_band, "disagreement": None}

        diff = abs(ml_result["predicted_band"] - llm_band)
        return {
            **ml_result,
            "llm_band": llm_band,
            "disagreement": round(diff, 2),
            "significant_disagreement": diff >= disagreement_threshold,
        }


if __name__ == "__main__":
    predictor = BandPredictor()
    sample_essay = (
        "In recent years, many countries have faced a significant increase in traffic "
        "congestion. This essay will discuss the main causes of this problem and suggest "
        "possible solutions. Firstly, the rapid growth of urban populations has led to more "
        "vehicles on the road. Furthermore, insufficient public transport options force people "
        "to rely on private cars. As a result, cities experience longer commute times. "
        "In conclusion, governments should invest in public transport and encourage carpooling "
        "to reduce congestion effectively."
    )
    result = predictor.predict(sample_essay, "Discuss the causes of traffic congestion.", task_type=2)
    print(json.dumps(result, indent=2))
