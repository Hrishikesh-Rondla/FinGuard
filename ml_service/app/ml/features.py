"""
Feature engineering module for FinGuard.
Computes derived financial features from raw user input.
"""

import numpy as np
from typing import Dict, List


def engineer_features(input_data: dict) -> dict:
    """
    Compute derived features from raw financial input data.

    Args:
        input_data: Dictionary containing raw financial metrics.

    Returns:
        Dictionary of 12 engineered features ready for model input.
    """
    monthly_income = input_data["monthly_income"]
    total_expenses = input_data["total_expenses"]
    total_savings = input_data["total_savings"]
    discretionary_expenses = input_data["discretionary_expenses"]
    essential_expenses = input_data["essential_expenses"]
    monthly_debt_payments = input_data["monthly_debt_payments"]
    num_transactions = input_data["num_transactions"]
    avg_transaction_value = input_data["avg_transaction_value"]
    income_last_3_months = input_data["income_last_3_months"]
    avg_monthly_expenses = input_data["avg_monthly_expenses"]

    # Derived ratios
    savings_rate = (
        total_savings / monthly_income if monthly_income > 0 else 0.0
    )
    expense_to_income_ratio = (
        total_expenses / monthly_income if monthly_income > 0 else 1.0
    )
    discretionary_spending_ratio = (
        discretionary_expenses / total_expenses if total_expenses > 0 else 0.0
    )
    essential_spending_ratio = (
        essential_expenses / total_expenses if total_expenses > 0 else 0.0
    )
    debt_to_income_ratio = (
        monthly_debt_payments / monthly_income if monthly_income > 0 else 1.0
    )

    # Income volatility: coefficient of variation over last 3 months
    income_arr = np.array(income_last_3_months, dtype=float)
    mean_income = np.mean(income_arr)
    income_volatility = (
        float(np.std(income_arr) / mean_income) if mean_income > 0 else 0.0
    )

    # Emergency fund: how many months of expenses can savings cover
    months_of_emergency_fund = (
        total_savings / avg_monthly_expenses if avg_monthly_expenses > 0 else 0.0
    )

    return {
        "monthly_income": float(monthly_income),
        "total_expenses": float(total_expenses),
        "total_savings": float(total_savings),
        "savings_rate": float(savings_rate),
        "expense_to_income_ratio": float(expense_to_income_ratio),
        "discretionary_spending_ratio": float(discretionary_spending_ratio),
        "essential_spending_ratio": float(essential_spending_ratio),
        "debt_to_income_ratio": float(debt_to_income_ratio),
        "num_transactions": int(num_transactions),
        "avg_transaction_value": float(avg_transaction_value),
        "income_volatility": float(income_volatility),
        "months_of_emergency_fund": float(months_of_emergency_fund),
    }


# Ordered list of feature names — must match training order
FEATURE_NAMES: List[str] = [
    "monthly_income",
    "total_expenses",
    "total_savings",
    "savings_rate",
    "expense_to_income_ratio",
    "discretionary_spending_ratio",
    "essential_spending_ratio",
    "debt_to_income_ratio",
    "num_transactions",
    "avg_transaction_value",
    "income_volatility",
    "months_of_emergency_fund",
]
