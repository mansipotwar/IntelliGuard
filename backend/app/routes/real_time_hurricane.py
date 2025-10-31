from fastapi import APIRouter, HTTPException, Query
import requests
import pandas as pd
import numpy as np
import os
import pickle
from datetime import datetime, timedelta

router = APIRouter()

# Load hurricane model from backend/models/hurricane_model.pkl
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'models'))
model_path = os.path.join(BASE_DIR, 'hurricane_model.pkl')

try:
    print("Loading hurricane model from:", model_path)
    with open(model_path, 'rb') as f:
        hurricane_model = pickle.load(f)
except Exception as e:
    print(f"Error loading hurricane model: {e}")
    hurricane_model = None

def clean_lat(lat):
    if isinstance(lat, str) and lat[-1] in "NS":
        val = float(lat[:-1])
        if lat[-1] == "S":
            val = -val
        return val
    return float(lat)

def clean_lon(lon):
    if isinstance(lon, str) and lon[-1] in "EW":
        val = float(lon[:-1])
        if lon[-1] == "W":
            val = -val
        return val
    return float(lon)

@router.get("/hurricane-predict-multi")
def hurricane_predict_multi(
    latitude: str = Query("28.0N"),
    longitude: str = Query("94.8W")
):
    """
    Predict hurricane risk hourly for 7 days, then daily for next 9 days (total 16 days).
    """
    if hurricane_model is None:
        raise HTTPException(status_code=500, detail="Hurricane model not loaded")

    try:
        lat = clean_lat(latitude)
        lon = clean_lon(longitude)

        now = datetime.utcnow()
        end_time = now + timedelta(days=16)

        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            "&hourly=pressure_msl,wind_speed_10m"
            f"&start={now.strftime('%Y-%m-%dT%H:%M')}"
            f"&end={end_time.strftime('%Y-%m-%dT%H:%M')}"
            "&forecast_days=16"
        )

        resp = requests.get(url, timeout=15)
        data = resp.json()

        if "hourly" not in data or \
           "pressure_msl" not in data["hourly"] or \
           "wind_speed_10m" not in data["hourly"]:
            raise Exception("Weather data not available for this location/time")

        times = data["hourly"]["time"]
        pressures = data["hourly"]["pressure_msl"]
        winds = data["hourly"]["wind_speed_10m"]

        hourly_predictions = []
        daily_predictions = []

        # Predict hourly for first 7 days (7*24=168 hours)
        hours_7days = 7 * 24
        for i in range(min(hours_7days, len(times))):
            input_df = pd.DataFrame([{
                "Latitude": lat,
                "Longitude": lon,
                "Maximum Wind": winds[i],
                "Minimum Pressure": pressures[i]
            }])
            pred = hurricane_model.predict(input_df)[0]
            proba = hurricane_model.predict_proba(input_df)[0][1]

            hourly_predictions.append({
                "time_utc": times[i],
                "prediction": int(pred),
                "probability": round(proba, 3),
                "wind_speed": winds[i],
                "pressure": pressures[i]
            })

        # Predict daily for days 8-16 (one sample per day, roughly noon UTC)
        day_set = set()
        for i in range(hours_7days, len(times)):
            day = times[i][:10]  # YYYY-MM-DD
            if day not in day_set and len(day_set) < 9:
                day_set.add(day)
                day_indices = [j for j, t in enumerate(times) if t.startswith(day)]
                noon_idx = min(day_indices, key=lambda x: abs(int(times[x][11:13]) - 12))

                input_df = pd.DataFrame([{
                    "Latitude": lat,
                    "Longitude": lon,
                    "Maximum Wind": winds[noon_idx],
                    "Minimum Pressure": pressures[noon_idx]
                }])
                pred = hurricane_model.predict(input_df)[0]
                proba = hurricane_model.predict_proba(input_df)[0][1]

                daily_predictions.append({
                    "date": day,
                    "prediction": int(pred),
                    "probability": round(proba, 3),
                    "wind_speed": winds[noon_idx],
                    "pressure": pressures[noon_idx],
                    "forecast_time": times[noon_idx]
                })

        return {
            "hourly_predictions_next_7_days": hourly_predictions,
            "daily_predictions_next_9_days": daily_predictions
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
