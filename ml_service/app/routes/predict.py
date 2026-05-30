"""
API routes for the /predict endpoint.
"""

from fastapi import APIRouter, HTTPException

from app.models.schemas import FinancialInput, PredictionResponse
from app.ml.features import engineer_features
from app.ml.predict import predict as ml_predict, is_model_loaded
from app.ml.recommend import generate_recommendations, identify_risk_factors

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict(input_data: FinancialInput):
    """
    Predict financial stress level from user financial data.

    Accepts raw financial metrics, engineers features, runs the ML model,
    and returns stress level, probabilities, recommendations, and risk factors.
    """
    if not is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please wait for training to complete or restart the server.",
        )

    try:
        # 1. Convert Pydantic model to dict
        raw_input = input_data.model_dump()

        # 2. Engineer features
        features = engineer_features(raw_input)

        # 3. Run ML prediction
        prediction = ml_predict(features)

        # 4. Generate recommendations
        recommendations = generate_recommendations(features)

        # 5. Identify risk factors
        top_risk_factors = identify_risk_factors(features)

        # 6. Build response
        return PredictionResponse(
            stress_level=prediction["stress_level"],
            stress_score=prediction["stress_score"],
            probabilities=prediction["probabilities"],
            recommendations=recommendations,
            top_risk_factors=top_risk_factors,
            model_used=prediction["model_used"],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
