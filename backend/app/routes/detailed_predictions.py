from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import requests
import joblib
import os

router = APIRouter()

# ---- Model loading (adjust paths as needed) ----
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

# Load flood model
FLOOD_MODEL_PATH = os.path.join(BASE_DIR, "models", "flood_model.pkl")
try:
    model_pipeline = joblib.load(FLOOD_MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Error loading flood model: {e}")

# Load earthquake model
EQ_MODEL_PATH = os.path.join(BASE_DIR, "models", "earthquake_model.pkl")
try:
    earthquake_model = joblib.load(EQ_MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Error loading earthquake model: {e}")

FEATURE_NAMES = [
    "latitude", "longitude", "elevation_m", "rainfall_mm",
    "river_discharge_m3s", "population_density", "temperature_C",
    "water_level_m", "flood_history_10yrs", "land_cover", "soil_type", "season"
]

def generate_timestamps(start_dt, range_key):
    intervals = {
        "7days": {'delta': timedelta(hours=1), 'count': 7*24},
        "1month": {'delta': timedelta(hours=4), 'count': 30*6},
        "3months": {'delta': timedelta(days=1), 'count': 90},
        "6months": {'delta': timedelta(weeks=1), 'count': 26}
    }
    meta = intervals.get(range_key)
    if not meta:
        raise ValueError("Invalid time_range")
    return [start_dt + i * meta['delta'] for i in range(meta['count'])]

def fetch_forecast_data(lat, lon, timestamps):
    base_url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": "temperature_2m,precipitation,river_discharge",
        "start_date": timestamps[0].strftime("%Y-%m-%d"),
        "end_date": timestamps[-1].strftime("%Y-%m-%d"),
        "timezone": "auto"
    }
    try:
        resp = requests.get(base_url, params=params, timeout=5)
        resp.raise_for_status()
        forecast = resp.json()
        hourly = forecast.get("hourly", {})
        time_strs = hourly.get("time", [])
        lookup = {
            "temperature_2m": dict(zip(time_strs, hourly.get("temperature_2m", []))),
            "precipitation": dict(zip(time_strs, hourly.get("precipitation", []))),
            "river_discharge": dict(zip(time_strs, hourly.get("river_discharge", [])))
        }
        return lookup
    except Exception as ex:
        print("Open-Meteo fetch failed:", ex)
        return None

def make_feature_row(ts, latitude, longitude, forecast_data):
    ts_str = ts.strftime('%Y-%m-%dT%H:%M')
    if forecast_data:
        rainfall_mm = forecast_data['precipitation'].get(ts_str)
        temperature_C = forecast_data['temperature_2m'].get(ts_str)
        river_discharge_m3s = forecast_data['river_discharge'].get(ts_str)
    else:
        rainfall_mm = temperature_C = river_discharge_m3s = None

    if rainfall_mm is None:
        rainfall_mm = float(np.random.uniform(10, 70))
    if temperature_C is None:
        temperature_C = float(np.random.uniform(18, 35))
    if river_discharge_m3s is None:
        river_discharge_m3s = float(np.random.uniform(100, 1000))

    season = "summer" if ts.month in [6,7,8] else "winter" if ts.month in [12,1,2] else "spring/fall"

    return dict(
        latitude=latitude,
        longitude=longitude,
        elevation_m=120,  # or use GIS data if available
        rainfall_mm=rainfall_mm,
        river_discharge_m3s=river_discharge_m3s,
        population_density=1500,  # example static
        temperature_C=temperature_C,
        water_level_m=float(np.random.uniform(0, 5)),
        flood_history_10yrs=0,
        land_cover="urban",
        soil_type="clay",
        season=season
    )

@router.get("/detailed-flood-predictions")
def detailed_flood_predictions(
    latitude: float = Query(...),
    longitude: float = Query(...),
    start_date: str = Query(None, description="YYYY-MM-DD"),
    time_range: str = Query("7days")
):
    try:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime.utcnow()
        timestamps = generate_timestamps(start_dt, time_range)
        forecast_data = fetch_forecast_data(latitude, longitude, timestamps)

        feature_rows = []
        for ts in timestamps:
            row = make_feature_row(ts, latitude, longitude, forecast_data)
            feature_rows.append(row)
        df = pd.DataFrame(feature_rows, columns=FEATURE_NAMES)

        preds = model_pipeline.predict(df)
        probas = model_pipeline.predict_proba(df)[:, 1]

        results = []
        for i, ts in enumerate(timestamps):
            row = feature_rows[i]
            entry = {
                "timestamp": ts.isoformat(),
                "rainfall_mm": float(row["rainfall_mm"]),
                "temperature_C": float(row["temperature_C"]),
                "river_discharge_m3s": float(row["river_discharge_m3s"]),
                "water_level_m": float(row["water_level_m"]),
                "flood_risk": float(probas[i]),
                "flood_prediction": int(preds[i])
            }
            results.append(entry)

        return {time_range: results}

    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Error processing prediction: {ex}")

@router.post("/predict-earthquake")
def predict_earthquake(data: dict):
    try:
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        depth = float(data['depth'])
        mag = float(data.get('mag', 0))
    except (KeyError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid input or missing fields")

    features = np.array([[latitude, longitude, depth, mag]])
    prediction = earthquake_model.predict(features)
    probability = earthquake_model.predict_proba(features).max()

    return {
        "prediction": int(prediction[0]),
        "probability": float(probability),
        "message": "1 means earthquake predicted, 0 means no earthquake predicted"
    }
