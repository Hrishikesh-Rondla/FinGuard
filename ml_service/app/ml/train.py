"""
Training pipeline for FinGuard Financial Stress Prediction.
Loads dataset, engineers features, trains multiple models, evaluates them,
and serializes the best model along with supporting artifacts.
"""

import sys
import warnings
from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, label_binarize
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # ml_service/
DATA_PATH = BASE_DIR / "data" / "cs-training.csv"
ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)


def load_and_clean(path: Path) -> pd.DataFrame:
    """Load CSV and perform basic cleaning."""
    print(f"\n{'='*60}")
    print("STEP 1: Loading dataset")
    print(f"{'='*60}")
    df = pd.read_csv(path)
    print(f"  Raw dataset shape: {df.shape}")

    # Drop the unnamed index column if present
    if "Unnamed: 0" in df.columns:
        df = df.drop(columns=["Unnamed: 0"])

    # Drop rows with missing MonthlyIncome or NumberOfDependents
    initial_len = len(df)
    df = df.dropna(subset=["MonthlyIncome", "NumberOfDependents"])
    print(f"  Dropped {initial_len - len(df)} rows with missing values")
    print(f"  Cleaned dataset shape: {df.shape}")

    # Cap outliers
    df["RevolvingUtilizationOfUnsecuredLines"] = df[
        "RevolvingUtilizationOfUnsecuredLines"
    ].clip(upper=1.0)

    debt_ratio_99 = df["DebtRatio"].quantile(0.99)
    df["DebtRatio"] = df["DebtRatio"].clip(upper=debt_ratio_99)
    print(f"  Capped RevolvingUtilization at 1.0")
    print(f"  Capped DebtRatio at 99th percentile ({debt_ratio_99:.4f})")

    return df


def create_stress_labels(df: pd.DataFrame) -> pd.Series:
    """Create 3-class stress labels from raw columns."""
    print(f"\n{'='*60}")
    print("STEP 2: Engineering stress labels")
    print(f"{'='*60}")

    labels = pd.Series(0, index=df.index, dtype=int)

    # Medium (1)
    medium_mask = (
        ((df["DebtRatio"] >= 0.35) & (df["DebtRatio"] <= 0.5))
        | (
            (df["RevolvingUtilizationOfUnsecuredLines"] >= 0.85)
            & (df["RevolvingUtilizationOfUnsecuredLines"] <= 0.95)
        )
        | (df["NumberOfTime30-59DaysPastDueNotWorse"] > 0)
    )
    labels[medium_mask] = 1

    # High (2) — overrides Medium
    high_mask = (
        (df["DebtRatio"] > 0.50)
        | (df["RevolvingUtilizationOfUnsecuredLines"] > 0.95)
        | ((df["SeriousDlqin2yrs"] == 1) & (df["DebtRatio"] > 0.4))
    )
    labels[high_mask] = 2

    for level, name in [(0, "Low"), (1, "Medium"), (2, "High")]:
        print(f"  {name} ({level}): {(labels == level).sum():,}")

    return labels


def engineer_training_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create the 12 model features from raw dataset columns."""
    print(f"\n{'='*60}")
    print("STEP 3: Engineering features")
    print(f"{'='*60}")

    np.random.seed(42)
    n = len(df)

    monthly_income = df["MonthlyIncome"].values
    debt_ratio = df["DebtRatio"].values
    revolving_util = df["RevolvingUtilizationOfUnsecuredLines"].values

    total_expenses = monthly_income * debt_ratio
    total_savings = monthly_income * (1 - debt_ratio) * 0.3
    total_savings = np.maximum(total_savings, 0)  # no negative savings

    savings_rate = np.where(monthly_income > 0, total_savings / monthly_income, 0)
    expense_to_income_ratio = revolving_util

    # Discretionary spending ratio: proxy from revolving utilization
    discretionary_spending_ratio = np.clip(revolving_util * 0.5, 0, 1)
    essential_spending_ratio = 1 - discretionary_spending_ratio

    num_transactions = np.random.randint(10, 101, size=n)
    avg_transaction_value = np.where(
        num_transactions > 0, total_expenses / num_transactions, 0
    )

    income_volatility = np.random.uniform(0, 0.2, size=n)

    months_of_emergency_fund = np.where(
        total_expenses > 0, total_savings / (total_expenses / 12), 0
    )
    months_of_emergency_fund = np.clip(months_of_emergency_fund, 0, 100)

    features_df = pd.DataFrame(
        {
            "monthly_income": monthly_income,
            "total_expenses": total_expenses,
            "total_savings": total_savings,
            "savings_rate": savings_rate,
            "expense_to_income_ratio": expense_to_income_ratio,
            "discretionary_spending_ratio": discretionary_spending_ratio,
            "essential_spending_ratio": essential_spending_ratio,
            "debt_to_income_ratio": debt_ratio,
            "num_transactions": num_transactions,
            "avg_transaction_value": avg_transaction_value,
            "income_volatility": income_volatility,
            "months_of_emergency_fund": months_of_emergency_fund,
        }
    )

    # Replace any inf/nan with 0
    features_df = features_df.replace([np.inf, -np.inf], 0).fillna(0)

    print(f"  Created {len(features_df.columns)} features:")
    for col in features_df.columns:
        print(f"    - {col}")

    return features_df


def train_and_evaluate():
    """Main training pipeline."""
    print("\n" + "=" * 60)
    print("  FinGuard — Financial Stress Prediction Training Pipeline")
    print("=" * 60)

    # ── 1. Load & clean ────────────────────────────────────────────────
    if not DATA_PATH.exists():
        print(f"\n  ERROR: Dataset not found at {DATA_PATH}")
        print("  Please place cs-training.csv in ml_service/data/")
        sys.exit(1)

    df = load_and_clean(DATA_PATH)

    # ── 2. Labels ──────────────────────────────────────────────────────
    y = create_stress_labels(df)

    # ── 3. Features ────────────────────────────────────────────────────
    X = engineer_training_features(df)
    feature_names = list(X.columns)

    # ── 4. Train / test split ──────────────────────────────────────────
    print(f"\n{'='*60}")
    print("STEP 4: Train/test split + SMOTE")
    print(f"{'='*60}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  Train: {X_train.shape[0]:,}  |  Test: {X_test.shape[0]:,}")

    # ── 5. Scale ───────────────────────────────────────────────────────
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # ── 6. SMOTE ───────────────────────────────────────────────────────
    smote = SMOTE(random_state=42)
    X_train_res, y_train_res = smote.fit_resample(X_train_scaled, y_train)
    print(f"  After SMOTE — Train: {X_train_res.shape[0]:,}")
    for level, name in [(0, "Low"), (1, "Medium"), (2, "High")]:
        print(f"    {name}: {(y_train_res == level).sum():,}")

    # ── 7. Train models ───────────────────────────────────────────────
    print(f"\n{'='*60}")
    print("STEP 5: Training models")
    print(f"{'='*60}")

    models = {
        "LogisticRegression": LogisticRegression(
            max_iter=1000, random_state=42
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=200, max_depth=10, random_state=42, n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            eval_metric="mlogloss",
            random_state=42,
            n_jobs=-1,
        ),
    }

    results = {}
    for name, model in models.items():
        print(f"\n  Training {name}...")
        model.fit(X_train_res, y_train_res)
        y_pred = model.predict(X_test_scaled)
        y_proba = model.predict_proba(X_test_scaled)

        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average="weighted")

        # ROC-AUC (one-vs-rest)
        y_test_bin = label_binarize(y_test, classes=[0, 1, 2])
        try:
            roc = roc_auc_score(y_test_bin, y_proba, multi_class="ovr", average="weighted")
        except ValueError:
            roc = 0.0

        results[name] = {
            "model": model,
            "accuracy": acc,
            "f1": f1,
            "roc_auc": roc,
            "y_pred": y_pred,
        }

        print(f"  {name} Results:")
        print(f"    Accuracy:  {acc:.4f}")
        print(f"    F1 Score:  {f1:.4f}")
        print(f"    ROC-AUC:   {roc:.4f}")
        print(f"    Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")
        print(f"    Classification Report:\n{classification_report(y_test, y_pred, target_names=['Low', 'Medium', 'High'])}")

    # ── 8. Select best model ──────────────────────────────────────────
    print(f"\n{'='*60}")
    print("STEP 6: Selecting best model")
    print(f"{'='*60}")

    best_name = max(results, key=lambda k: results[k]["f1"])
    best = results[best_name]
    print(f"  Best model: {best_name}")
    print(f"    Accuracy: {best['accuracy']:.4f}")
    print(f"    F1 Score: {best['f1']:.4f}")
    print(f"    ROC-AUC:  {best['roc_auc']:.4f}")

    # ── 9. Save artifacts ─────────────────────────────────────────────
    print(f"\n{'='*60}")
    print("STEP 7: Saving artifacts")
    print(f"{'='*60}")

    joblib.dump(best["model"], ARTIFACTS_DIR / "best_model.joblib")
    print(f"  Saved best_model.joblib")

    joblib.dump(scaler, ARTIFACTS_DIR / "scaler.joblib")
    print(f"  Saved scaler.joblib")

    joblib.dump(feature_names, ARTIFACTS_DIR / "feature_names.joblib")
    print(f"  Saved feature_names.joblib")

    metadata = {
        "name": best_name,
        "accuracy": round(best["accuracy"], 4),
        "f1": round(best["f1"], 4),
        "roc_auc": round(best["roc_auc"], 4),
        "training_date": datetime.now().isoformat(),
    }
    joblib.dump(metadata, ARTIFACTS_DIR / "model_metadata.joblib")
    print(f"  Saved model_metadata.joblib")

    print(f"\n{'='*60}")
    print("  Training complete!")
    print(f"{'='*60}\n")

    return metadata


if __name__ == "__main__":
    train_and_evaluate()
