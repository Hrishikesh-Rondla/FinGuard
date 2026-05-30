"""
Pydantic schemas for the FinGuard Financial Stress Prediction API.
"""

from pydantic import BaseModel, Field
from typing import List, Dict


class FinancialInput(BaseModel):
    """Input schema for the /predict endpoint."""

    monthly_income: float = Field(..., description="Monthly income in currency units", ge=0)
    total_expenses: float = Field(..., description="Total monthly expenses", ge=0)
    total_savings: float = Field(..., description="Total savings balance", ge=0)
    discretionary_expenses: float = Field(
        ..., description="Discretionary (non-essential) monthly expenses", ge=0
    )
    essential_expenses: float = Field(
        ..., description="Essential monthly expenses (rent, food, utilities)", ge=0
    )
    monthly_debt_payments: float = Field(
        ..., description="Total monthly debt payments", ge=0
    )
    num_transactions: int = Field(
        ..., description="Number of transactions in the last month", ge=0
    )
    avg_transaction_value: float = Field(
        ..., description="Average value per transaction", ge=0
    )
    income_last_3_months: List[float] = Field(
        ...,
        description="Income for the last 3 months as a list of 3 floats",
        min_length=3,
        max_length=3,
    )
    avg_monthly_expenses: float = Field(
        ..., description="Average monthly expenses over recent months", ge=0
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "monthly_income": 5000.0,
                    "total_expenses": 3500.0,
                    "total_savings": 8000.0,
                    "discretionary_expenses": 1200.0,
                    "essential_expenses": 2300.0,
                    "monthly_debt_payments": 800.0,
                    "num_transactions": 45,
                    "avg_transaction_value": 77.78,
                    "income_last_3_months": [5000.0, 4800.0, 5200.0],
                    "avg_monthly_expenses": 3400.0,
                }
            ]
        }
    }


class PredictionResponse(BaseModel):
    """Response schema for the /predict endpoint."""

    stress_level: str = Field(
        ..., description="Predicted stress level: Low, Medium, or High"
    )
    stress_score: int = Field(
        ..., description="Numeric stress score: 0 (Low), 1 (Medium), 2 (High)"
    )
    probabilities: Dict[str, float] = Field(
        ...,
        description="Probability for each stress class",
    )
    recommendations: List[str] = Field(
        ..., description="Personalized financial recommendations"
    )
    top_risk_factors: List[str] = Field(
        ..., description="Top 3 risk factors for the user"
    )
    model_used: str = Field(..., description="Name of the ML model used for prediction")


class HealthResponse(BaseModel):
    """Response schema for the /health endpoint."""

    status: str
    model_loaded: bool
    version: str


class ModelInfoResponse(BaseModel):
    """Response schema for the /model-info endpoint."""

    model_name: str
    accuracy: float
    f1_score: float
    training_date: str
