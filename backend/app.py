import os
import json
import logging
from contextlib import asynccontextmanager

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.schemas import PredictRequest, PredictResponse
from backend.features import build_input_row


logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
log = logging.getLogger(__name__)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODELS_DIR, "sales_model.pkl")
META_PATH = os.path.join(MODELS_DIR, "model_meta.json")

_model = None
_meta = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _model, _meta

    if not os.path.exists(MODEL_PATH):
        log.warning("Model file not found. Run `python train.py` first.")
    else:
        _model = joblib.load(MODEL_PATH)
        log.info("Model loaded from disk")

    if os.path.exists(META_PATH):
        with open(META_PATH) as f:
            _meta = json.load(f)
        log.info(f"Model meta loaded — test R² = {_meta.get('test_r2')}")

    yield


app = FastAPI(
    title="Sales Revenue Predictor API",
    description=(
        "ML-powered API that predicts order revenue. "
        "Continuation of the sales_analysis_project EDA."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def root():
    model_ready = _model is not None
    return {
        "status": "running",
        "model_ready": model_ready,
        "message": "Sales Predictor API" if model_ready else "Model not loaded - run train.py",
    }


@app.get("/model-info", tags=["Meta"])
def get_model_info():
    """Returns training metrics and what options are available for inputs."""
    if _meta is None:
        raise HTTPException(status_code=503, detail="Model metadata not found")
    return _meta


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
def predict_sales(req: PredictRequest):
    if _model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Run `python train.py` from the backend folder."
        )

    try:
        row = build_input_row(
            quantity=req.quantity,
            price=req.price_each,
            msrp=req.msrp,
            product_line=req.product_line,
            deal_size=req.deal_size,
            order_date=req.order_date,
        )

        input_df = pd.DataFrame([row])
        # log.info(f"Input row: {row}")

        prediction = float(_model.predict(input_df)[0])
        prediction = round(prediction, 2)

        low = round(prediction * 0.88, 2)
        high = round(prediction * 1.12, 2)

        log.info(f"Predicted ${prediction:,.2f} for {req.product_line} | qty={req.quantity}")

        return PredictResponse(
            predicted_sales=prediction,
            confidence_band_low=low,
            confidence_band_high=high,
            model_note=f"GradientBoosting — Test R²={_meta.get('test_r2', 'N/A')}, MAE=${_meta.get('test_mae', 'N/A'):,}",
            features_used=row,
        )

    except Exception as e:
        log.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")