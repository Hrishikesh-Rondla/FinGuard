"""
Recommendation engine for FinGuard.
Generates personalized, rule-based financial advice and identifies top risk factors.
"""

from typing import Dict, List, Tuple


def generate_recommendations(features: dict) -> List[str]:
    """
    Generate 3-5 personalized financial recommendations based on computed features.

    Args:
        features: Dictionary of engineered financial features.

    Returns:
        List of recommendation strings.
    """
    recommendations: List[str] = []

    savings_rate = features.get("savings_rate", 0)
    expense_to_income_ratio = features.get("expense_to_income_ratio", 0)
    discretionary_spending_ratio = features.get("discretionary_spending_ratio", 0)
    debt_to_income_ratio = features.get("debt_to_income_ratio", 0)
    months_of_emergency_fund = features.get("months_of_emergency_fund", 0)
    income_volatility = features.get("income_volatility", 0)

    # --- Warning recommendations ---

    if savings_rate < 0.1:
        recommendations.append(
            "Your savings rate is critically low. Try automating a fixed transfer "
            "of at least 10% of your income to savings on payday."
        )

    if expense_to_income_ratio > 0.8:
        recommendations.append(
            "Your expenses consume over 80% of your income. Review your top 3 "
            "expense categories and identify one to cut by 15%."
        )

    if discretionary_spending_ratio > 0.35:
        recommendations.append(
            "Over a third of your spending is discretionary. Consider the "
            "48-hour rule before non-essential purchases."
        )

    if debt_to_income_ratio > 0.3:
        recommendations.append(
            "Your debt obligations are high. Prioritize paying off high-interest "
            "debt using the avalanche method."
        )

    if months_of_emergency_fund < 3:
        recommendations.append(
            "You have less than 3 months of emergency savings. Build this buffer "
            "before increasing discretionary spending."
        )

    if income_volatility > 0.15:
        recommendations.append(
            "Your income has been volatile recently. Consider building a larger "
            "emergency fund and diversifying income sources."
        )

    # --- Positive reinforcement ---

    if savings_rate > 0.2:
        recommendations.append(
            "Great job! Your savings rate exceeds 20%. Consider investing the "
            "surplus in a diversified index fund for long-term growth."
        )

    if debt_to_income_ratio < 0.15 and debt_to_income_ratio >= 0:
        recommendations.append(
            "Your debt-to-income ratio is healthy. Keep it below 20% to maintain "
            "strong financial flexibility."
        )

    if months_of_emergency_fund > 6:
        recommendations.append(
            "Excellent! You have over 6 months of emergency savings. You're well "
            "positioned for unexpected expenses."
        )

    if expense_to_income_ratio < 0.5:
        recommendations.append(
            "You're living well within your means. Consider allocating the extra "
            "funds towards retirement or investment goals."
        )

    # Ensure we return at least 3 and at most 5 recommendations
    if len(recommendations) < 3:
        defaults = [
            "Track your daily expenses for a month to gain visibility into spending patterns.",
            "Set specific, measurable financial goals for the next 6 months.",
            "Review and cancel any unused subscriptions or memberships.",
        ]
        for d in defaults:
            if len(recommendations) < 3 and d not in recommendations:
                recommendations.append(d)

    return recommendations[:5]


def identify_risk_factors(features: dict) -> List[str]:
    """
    Identify the top 3 risk factors based on feature thresholds.

    Args:
        features: Dictionary of engineered financial features.

    Returns:
        List of top 3 risk factor descriptions, ordered by severity.
    """
    risk_scores: List[Tuple[float, str]] = []

    savings_rate = features.get("savings_rate", 0)
    expense_to_income_ratio = features.get("expense_to_income_ratio", 0)
    discretionary_spending_ratio = features.get("discretionary_spending_ratio", 0)
    debt_to_income_ratio = features.get("debt_to_income_ratio", 0)
    months_of_emergency_fund = features.get("months_of_emergency_fund", 0)
    income_volatility = features.get("income_volatility", 0)

    # Score each risk factor — higher score = more risky
    if savings_rate < 0.1:
        severity = (0.1 - savings_rate) / 0.1  # 0..1 scale
        risk_scores.append(
            (severity, f"Low savings rate ({savings_rate:.1%})")
        )

    if expense_to_income_ratio > 0.7:
        severity = min((expense_to_income_ratio - 0.7) / 0.3, 1.0)
        risk_scores.append(
            (severity, f"High expense-to-income ratio ({expense_to_income_ratio:.1%})")
        )

    if debt_to_income_ratio > 0.2:
        severity = min((debt_to_income_ratio - 0.2) / 0.3, 1.0)
        risk_scores.append(
            (severity, f"Elevated debt-to-income ratio ({debt_to_income_ratio:.1%})")
        )

    if discretionary_spending_ratio > 0.3:
        severity = min((discretionary_spending_ratio - 0.3) / 0.2, 1.0)
        risk_scores.append(
            (
                severity,
                f"High discretionary spending ({discretionary_spending_ratio:.1%})",
            )
        )

    if months_of_emergency_fund < 3:
        severity = (3 - months_of_emergency_fund) / 3
        risk_scores.append(
            (
                severity,
                f"Insufficient emergency fund ({months_of_emergency_fund:.1f} months)",
            )
        )

    if income_volatility > 0.1:
        severity = min(income_volatility / 0.3, 1.0)
        risk_scores.append(
            (severity, f"Income volatility ({income_volatility:.1%})")
        )

    # Sort by severity descending and return top 3
    risk_scores.sort(key=lambda x: x[0], reverse=True)
    top_risks = [desc for _, desc in risk_scores[:3]]

    # Pad with generic factors if fewer than 3
    if len(top_risks) < 3:
        generic = [
            "Overall financial health appears stable",
            "No significant risk factors detected",
            "Financial metrics within healthy ranges",
        ]
        for g in generic:
            if len(top_risks) < 3:
                top_risks.append(g)

    return top_risks[:3]
