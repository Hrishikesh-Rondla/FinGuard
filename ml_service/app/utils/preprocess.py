"""
Utility functions for data preprocessing.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any


def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """
    Drop rows where MonthlyIncome or NumberOfDependents is NaN.
    """
    initial_len = len(df)
    df = df.dropna(subset=["MonthlyIncome", "NumberOfDependents"])
    dropped = initial_len - len(df)
    print(f"  Dropped {dropped} rows with missing MonthlyIncome or NumberOfDependents")
    return df


def cap_outliers(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cap outliers:
      - RevolvingUtilizationOfUnsecuredLines capped at 1.0
      - DebtRatio capped at 99th percentile
    """
    df["RevolvingUtilizationOfUnsecuredLines"] = df[
        "RevolvingUtilizationOfUnsecuredLines"
    ].clip(upper=1.0)

    debt_ratio_99 = df["DebtRatio"].quantile(0.99)
    df["DebtRatio"] = df["DebtRatio"].clip(upper=debt_ratio_99)
    print(f"  Capped RevolvingUtilization at 1.0, DebtRatio at {debt_ratio_99:.4f}")

    return df


def create_stress_labels(df: pd.DataFrame) -> pd.Series:
    """
    Engineer a 3-class stress label:
      - High (2): SeriousDlqin2yrs == 1 OR DebtRatio > 0.5 OR RevolvingUtilization > 0.9
      - Medium (1): DebtRatio 0.35-0.5 OR RevolvingUtilization 0.6-0.9 OR any 30-59 day late flags
      - Low (0): everything else
    """
    labels = pd.Series(0, index=df.index, dtype=int)

    # Medium conditions (applied first, then High overwrites)
    medium_mask = (
        ((df["DebtRatio"] >= 0.35) & (df["DebtRatio"] <= 0.5))
        | (
            (df["RevolvingUtilizationOfUnsecuredLines"] >= 0.6)
            & (df["RevolvingUtilizationOfUnsecuredLines"] <= 0.9)
        )
        | (df["NumberOfTime30-59DaysPastDueNotWorse"] > 0)
    )
    labels[medium_mask] = 1

    # High conditions (override Medium)
    high_mask = (
        (df["SeriousDlqin2yrs"] == 1)
        | (df["DebtRatio"] > 0.5)
        | (df["RevolvingUtilizationOfUnsecuredLines"] > 0.9)
    )
    labels[high_mask] = 2

    print(f"  Stress label distribution:")
    print(f"    Low (0):    {(labels == 0).sum()}")
    print(f"    Medium (1): {(labels == 1).sum()}")
    print(f"    High (2):   {(labels == 2).sum()}")

    return labels


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Safe division that returns a default value when denominator is zero."""
    if denominator == 0 or np.isnan(denominator):
        return default
    result = numerator / denominator
    if np.isnan(result) or np.isinf(result):
        return default
    return result
