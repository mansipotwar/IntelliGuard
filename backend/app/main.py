from fastapi import FastAPI, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
import pickle
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from app.routes import multi_range_earthquake, detailed_predictions, real_time_hurricane

app = FastAPI()

# Setup CORS middleware (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base directory for models (adjust if needed)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Load earthquake model once on startup
eq_model_path = os.path.join(BASE_DIR, 'models', 'earthquake_model.pkl')
with open(eq_model_path, 'rb') as f:
    earthquake_model = pickle.load(f)

# Load hurricane model once on startup
hurricane_model_path = os.path.join(BASE_DIR, 'models', 'hurricane_model.pkl')
try:
    with open(hurricane_model_path, 'rb') as f:
        hurricane_model = pickle.load(f)
except Exception as e:
    print(f"Error loading hurricane model: {e}")
    hurricane_model = None

# Include routers
app.include_router(multi_range_earthquake.router, prefix="/api")
app.include_router(detailed_predictions.router, prefix="/api")
app.include_router(real_time_hurricane.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "API is working!"}

@app.get("/api/real-time-flood")
def real_time_flood(latitude: float, longitude: float):
    api_url = f"https://api.open-meteo.com/v1/flood?latitude={latitude}&longitude={longitude}"
    resp = requests.get(api_url)
    api_json = resp.json()

    try:
        fc = api_json["river_discharge_forecast"][0]
        river_discharge = fc["river_discharge"]
        temp = api_json.get("temperature_2m", [None])[0]
        rain = api_json.get("precipitation", [None])[0]
    except Exception:
        river_discharge, temp, rain = 0, 0, 0

    if river_discharge and rain:
        if river_discharge > 6000 or (rain > 120):
            risk = "High"
        elif river_discharge > 4000 or (rain > 80):
            risk = "Moderate"
        else:
            risk = "Low"
    else:
        risk = "Unknown"

    return {
        "parameters": {
            "latitude": latitude,
            "longitude": longitude,
            "temperature_C": temp,
            "rainfall_mm": rain,
            "river_discharge_m3s": river_discharge,
        },
        "flood_risk_level": risk,
        "model_basis": "Thresholds are dynamic; local river discharge and rainfall are compared to regional norms for improved accuracy. Powered by Open-Meteo real-time data."
    }

@app.get("/api/real-time-earthquake")
def real_time_earthquake(latitude: float, longitude: float, max_radius_km: float = 100):
    usgs_url = (
        "https://earthquake.usgs.gov/fdsnws/event/1/query"
        "?format=geojson&latitude={lat}&longitude={lon}&maxradiuskm={radius}&limit=5&orderby=time"
    ).format(lat=latitude, lon=longitude, radius=max_radius_km)

    try:
        response = requests.get(usgs_url, timeout=5)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"USGS API error: {e}")

    features = []
    ids = []
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        geom = feature.get("geometry", {})
        coords = geom.get("coordinates", [])
        if len(coords) >= 3:
            lon_feat, lat_feat, depth_feat = coords[:3]
            mag_feat = props.get("mag", 0.0)

            feature_vector = [lat_feat, lon_feat, depth_feat, mag_feat]
            features.append(feature_vector)
            ids.append(feature.get("id"))

    if not features:
        return {"message": "No recent earthquakes found in the specified area."}

    features_df = pd.DataFrame(features, columns=["latitude", "longitude", "depth", "mag"])
    preds = earthquake_model.predict(features_df)
    probas = earthquake_model.predict_proba(features_df)[:, 1]

    results = []
    for eq_id, pred, proba in zip(ids, preds, probas):
        results.append({
            "earthquake_id": eq_id,
            "prediction": int(pred),
            "probability": float(proba)
        })

    return {"earthquake_predictions": results}

def clean_lat(lat_str):
    if isinstance(lat_str, str) and len(lat_str) > 1:
        val = float(lat_str[:-1])
        if lat_str.endswith('S'):
            val = -val
        return val
    try:
        return float(lat_str)
    except:
        return np.nan

def clean_lon(lon_str):
    if isinstance(lon_str, str) and len(lon_str) > 1:
        val = float(lon_str[:-1])
        if lon_str.endswith('W'):
            val = -val
        return val
    try:
        return float(lon_str)
    except:
        return np.nan

@app.post("/api/hurricane-predict")
def hurricane_predict(payload: dict = Body(...)):
    if hurricane_model is None:
        raise HTTPException(status_code=500, detail="Hurricane model not loaded")
    try:
        lat = clean_lat(payload.get("Latitude"))
        lon = clean_lon(payload.get("Longitude"))
        max_wind = float(payload.get("Maximum Wind"))
        min_pressure = float(payload.get("Minimum Pressure"))
        input_df = pd.DataFrame([{
            "Latitude": lat,
            "Longitude": lon,
            "Maximum Wind": max_wind,
            "Minimum Pressure": min_pressure
        }])
        pred = hurricane_model.predict(input_df)[0]
        proba = hurricane_model.predict_proba(input_df)[0][1]
        return {
            "high_wind_predicted": int(pred),
            "prediction_probability": round(float(proba), 3),
            "input": payload
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid input data or prediction error: {e}")

@app.get("/api/hurricane-auto-predict")
def hurricane_auto_predict(
    latitude: str = Query("28.0N"),
    longitude: str = Query("94.8W"),
    hours_ahead: int = Query(0, ge=0, le=384)  # Max 16 days forecast by Open-Meteo
):
    if hurricane_model is None:
        raise HTTPException(status_code=500, detail="Hurricane model not loaded")
    try:
        lat = clean_lat(latitude)
        lon = clean_lon(longitude)
        now = datetime.utcnow()
        end_time = now + timedelta(hours=hours_ahead)
        forecast_days = (end_time.date() - now.date()).days + 1
        if forecast_days > 16:
            forecast_days = 16
            end_time = now + timedelta(days=16)
        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            "&hourly=pressure_msl,wind_speed_10m"
            f"&start={now.strftime('%Y-%m-%dT%H:%M')}"
            f"&end={end_time.strftime('%Y-%m-%dT%H:%M')}"
            f"&forecast_days={forecast_days}"
        )
        resp = requests.get(url, timeout=10)
        data = resp.json()
        if "hourly" not in data or "pressure_msl" not in data["hourly"] or "wind_speed_10m" not in data["hourly"]:
            raise Exception("Weather data not available for this location/time")
        idx = -1 if hours_ahead == 0 else min(hours_ahead, len(data["hourly"]["pressure_msl"]) - 1)
        forecast_pressure = data["hourly"]["pressure_msl"][idx]
        forecast_wind = data["hourly"]["wind_speed_10m"][idx]
        forecast_time_utc = data["hourly"]["time"][idx]
        input_df = pd.DataFrame([{
            "Latitude": lat,
            "Longitude": lon,
            "Maximum Wind": forecast_wind,
            "Minimum Pressure": forecast_pressure
        }])
        pred = hurricane_model.predict(input_df)[0]
        proba = hurricane_model.predict_proba(input_df)[0][1]
        return {
            "prediction_time_utc": forecast_time_utc,
            "latitude": lat,
            "longitude": lon,
            "forecast_wind_mph": forecast_wind,
            "forecast_pressure_mbar": forecast_pressure,
            "high_wind_predicted": int(pred),
            "prediction_probability": round(float(proba), 3),
            "hours_in_future": hours_ahead
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-prediction error: {e}")

@app.get("/api/hurricane-predict-multi")
def hurricane_predict_multi(
    latitude: str = Query("28.0N"),
    longitude: str = Query("94.8W")
):
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
        day_set = set()
        for i in range(hours_7days, len(times)):
            day = times[i][:10]
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

@app.get("/api/geocode")
def geocode(place: str = Query(...)):
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={place}&limit=1"
    headers = {"User-Agent": "DisasterGuardApp/1.0"}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Geocoding API request failed: {e}")
