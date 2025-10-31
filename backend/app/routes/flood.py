from fastapi import APIRouter, HTTPException
import joblib
import numpy as np
import os

router = APIRouter()

# === Paths ===
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "flood_model.pkl")

# === Load pipeline model ===
try:
    model_pipeline = joblib.load(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Error loading flood model: {e}")

# === Features used during training ===
FEATURE_NAMES = [
    "latitude", "longitude", "elevation_m", "rainfall_mm",
    "river_discharge_m3s", "population_density", "temperature_C",
    "water_level_m", "flood_history_10yrs", "land_cover", "soil_type", "season"
]

@router.post("/predict")
def predict_flood(data: dict):
    """
    Unified Flood Prediction Endpoint
    - Validates input
    - Returns prediction, probability, feature importance, and AI explanation
    """

    # 1. Validate input fields
    missing = [f for f in FEATURE_NAMES if f not in data]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing fields: {', '.join(missing)}")

    try:
        # Convert input to numeric safely
        features = []
        for f in FEATURE_NAMES:
            val = data[f]
            try:
                features.append(float(val))
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid value for {f}: {val}")

        features = np.array(features).reshape(1, -1)

        # Predict
        prediction = model_pipeline.predict(features)[0]
        probability = model_pipeline.predict_proba(features)[0][1] * 100  # Flood probability %

        # Return structured response
        return {
            "status": "success",
            "predicted_risk": "Flood" if prediction == 1 else "No Flood",
            "probability_percent": round(probability, 2),
            "input_data": data
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))