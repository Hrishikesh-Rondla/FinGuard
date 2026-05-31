"""
Inference module for FinGuard.
Loads serialized model artifacts and performs predictions on new data.
"""

from pathlib import Path
from typing import Dict, List, Optional, Any

import joblib
import numpy as np

import pandas as pd

# Paths to artifacts
ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"

# Module-level cache for loaded artifacts
_model = None
_scaler = None
_feature_names: Optional[List[str]] = None
_metadata: Optional[Dict[str, Any]] = None

LABEL_MAP = {0: "Low", 1: "Medium", 2: "High"}


def _load_artifacts() -> bool:
    """
    Load model artifacts from disk into module-level cache.
    Returns True if all artifacts loaded successfully.
    """
    global _model, _scaler, _feature_names, _metadata

    required_files = [
        "best_model.joblib",
        "scaler.joblib",
        "feature_names.joblib",
        "model_metadata.joblib",
    ]
    for f in required_files:
        if not (ARTIFACTS_DIR / f).exists():
            return False

    _model = joblib.load(ARTIFACTS_DIR / "best_model.joblib")
    _scaler = joblib.load(ARTIFACTS_DIR / "scaler.joblib")
    _feature_names = joblib.load(ARTIFACTS_DIR / "feature_names.joblib")
    _metadata = joblib.load(ARTIFACTS_DIR / "model_metadata.joblib")

    return True


def is_model_loaded() -> bool:
    """Check whether the model artifacts are loaded in memory."""
    return _model is not None and _scaler is not None


def load_model() -> bool:
    """
    Public interface to load model. Returns True on success.
    """
    if is_model_loaded():
        return True
    return _load_artifacts()


def get_model_metadata() -> Optional[Dict[str, Any]]:
    """Return metadata about the currently loaded model."""
    if _metadata is None:
        load_model()
    return _metadata


def artifacts_exist() -> bool:
    """Check if all required artifact files exist on disk."""
    required = [
        "best_model.joblib",
        "scaler.joblib",
        "feature_names.joblib",
        "model_metadata.joblib",
    ]
    return all((ARTIFACTS_DIR / f).exists() for f in required)


def predict(features: Dict[str, float]) -> Dict[str, Any]:
    """
    Run inference on a single sample.

    Args:
        features: Dictionary of engineered feature name → value.

    Returns:
        Dictionary with stress_level, stress_score, probabilities, and model_used.
    """
    if not is_model_loaded():
        success = load_model()
        if not success:
            raise RuntimeError(
                "Model artifacts not found. Please run the training pipeline first."
            )

    # Build feature vector in the correct order (as DataFrame for sklearn compatibility)
    feature_vector = pd.DataFrame(
        [[features.get(name, 0.0) for name in _feature_names]],
        columns=_feature_names,
    )
    print("API DataFrame:", feature_vector.iloc[0].to_dict())

    # Scale
    feature_vector_scaled = _scaler.transform(feature_vector)

    # Predict
    prediction = int(_model.predict(feature_vector_scaled)[0])
    probabilities = _model.predict_proba(feature_vector_scaled)[0]

    return {
        "stress_level": LABEL_MAP.get(prediction, "Unknown"),
        "stress_score": prediction,
        "probabilities": {
            "Low": round(float(probabilities[0]), 4),
            "Medium": round(float(probabilities[1]), 4),
            "High": round(float(probabilities[2]), 4),
        },
        "model_used": _metadata.get("name", "Unknown") if _metadata else "Unknown",
    }
