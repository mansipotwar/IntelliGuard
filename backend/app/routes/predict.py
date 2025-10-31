from fastapi import APIRouter, HTTPException
import joblib
import numpy as np
import os

router = APIRouter()

# === Model path (update if folder moves) ===
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "flood_model.pkl")

# Load pipeline model
try:
    model_pipeline = joblib.load(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Error loading model: {e}")

# === Feature names (order must match training) ===
FEATURE_NAMES = [
    "latitude", "longitude", "elevation_m", "rainfall_mm",
    "river_discharge_m3s", "population_density", "temperature_C",
    "water_level_m", "flood_history_10yrs", "land_cover", "soil_type", "season"
]

@router.post("/predict_flood")
def predict_flood(data: dict):
    """
    Predict flood risk using trained model pipeline.
    """
    try:
        # 1. Validate input fields
        missing = [f for f in FEATURE_NAMES if f not in data]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing fields: {', '.join(missing)}")

        # 2. Convert to 2D array
        features = np.array([data[f] for f in FEATURE_NAMES]).reshape(1, -1)

        # 3. Predict flood risk
        prediction = model_pipeline.predict(features)[0]
        probability = model_pipeline.predict_proba(features)[0][1] * 100

        return {
            "flood_risk": "Flood" if prediction == 1 else "No Flood",
            "probability_percent": round(probability, 2),
            "input_data": data
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))