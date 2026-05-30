"""
FastAPI application entry point for FinGuard ML Service.
"""

import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import HealthResponse, ModelInfoResponse
from app.ml.predict import artifacts_exist, load_model, is_model_loaded, get_model_metadata
from app.routes.predict import router as predict_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    On startup: check for model artifacts; if missing, run training pipeline.
    """
    print("\n[*] FinGuard ML Service starting up...")

    if not artifacts_exist():
        print("[!] Model artifacts not found. Running training pipeline...")
        try:
            from app.ml.train import train_and_evaluate
            train_and_evaluate()
            print("[OK] Training pipeline completed successfully.")
        except Exception as e:
            print(f"[ERROR] Training failed: {e}")
            traceback.print_exc()
    else:
        print("[OK] Model artifacts found.")

    # Load model into memory
    success = load_model()
    if success:
        metadata = get_model_metadata()
        print(f"[OK] Model loaded: {metadata.get('name', 'Unknown')}")
        print(f"     Accuracy: {metadata.get('accuracy', 'N/A')}")
        print(f"     F1 Score: {metadata.get('f1', 'N/A')}")
    else:
        print("[!] Could not load model artifacts.")

    print("[*] FinGuard ML Service is ready!\n")

    yield  # App runs here

    print("\n[*] FinGuard ML Service shutting down...")


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="FinGuard — Financial Stress Prediction API",
    description=(
        "ML-powered API that predicts financial stress levels and provides "
        "personalized recommendations based on user financial data."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(predict_router, tags=["Prediction"])


# ── Health & Info ──────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Check service health and model availability."""
    return HealthResponse(
        status="healthy",
        model_loaded=is_model_loaded(),
        version="1.0.0",
    )


@app.get("/model-info", response_model=ModelInfoResponse, tags=["Health"])
async def model_info():
    """Return metadata about the loaded ML model."""
    metadata = get_model_metadata()
    if metadata is None:
        return ModelInfoResponse(
            model_name="Not loaded",
            accuracy=0.0,
            f1_score=0.0,
            training_date="N/A",
        )
    return ModelInfoResponse(
        model_name=metadata.get("name", "Unknown"),
        accuracy=metadata.get("accuracy", 0.0),
        f1_score=metadata.get("f1", 0.0),
        training_date=metadata.get("training_date", "N/A"),
    )
