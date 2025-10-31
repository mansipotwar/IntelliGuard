from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timedelta
import pandas as pd
import httpx

from app.model_loader import earthquake_model

router = APIRouter()

USGS_API_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"

def fetch_real_time_eq_data(start_time, end_time, latitude, longitude, max_radius_km=100):
    params = {
        "format": "geojson",
        "starttime": start_time.isoformat(),
        "endtime": end_time.isoformat(),
        "latitude": latitude,
        "longitude": longitude,
        "maxradiuskm": max_radius_km,
        "minmagnitude": 1.0
    }
    response = httpx.get(USGS_API_URL, params=params)
    response.raise_for_status()
    data = response.json()
    events = data.get("features", [])
    features = []
    for e in events:
        props = e["properties"]
        geom = e["geometry"]
        depth = geom["coordinates"][2] if geom and "coordinates" in geom else None
        mag = props.get("mag", None)
        lat = geom["coordinates"][1] if geom and "coordinates" in geom else None
        lon = geom["coordinates"][0] if geom and "coordinates" in geom else None
        if all(v is not None for v in [lat, lon, mag, depth]):
            features.append({
                "latitude": lat,
                "longitude": lon,
                "depth": depth,
                "mag": mag
            })
    return pd.DataFrame(features) if features else pd.DataFrame(columns=["latitude", "longitude", "depth", "mag"])


@router.get("/multi-range-earthquake-predictions")
def multi_range_earthquake_predictions(
    latitude: float = Query(...),
    longitude: float = Query(...),
    start_date: str = Query(None),
):
    try:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime.utcnow()
        results = {}

        intervals = {
            "1day_hourly": {'delta': timedelta(hours=1), 'count': 24},
            "7days_daily": {'delta': timedelta(days=1), 'count': 7},
            "1month_weekly": {'delta': timedelta(weeks=1), 'count': 4},
        }

        for key, meta in intervals.items():
            timestamps = [start_dt + i * meta['delta'] for i in range(meta['count'])]
            predictions = []

            for ts in timestamps:
                # Define interval window around timestamp, e.g. extract events +/- delta/2 time range
                start_window = ts - meta['delta'] / 2
                end_window = ts + meta['delta'] / 2

                df_real_time = fetch_real_time_eq_data(start_window, end_window, latitude, longitude)

                if df_real_time.empty:
                    # No events: default features for prediction (or zero risk)
                    df_features = pd.DataFrame([{
                        "latitude": latitude,
                        "longitude": longitude,
                        "depth": 10.0,
                        "mag": 0.0
                    }])
                else:
                    df_features = df_real_time

                pred = earthquake_model.predict(df_features)
                proba = earthquake_model.predict_proba(df_features)[:, 1]

                # Take max probability for the interval to indicate highest risk in that slot
                max_proba = max(proba) if len(proba) > 0 else 0.0
                risk_percent = round(max_proba * 100, 2)

                predictions.append({
                    "timestamp": ts.isoformat(),
                    "earthquake_risk": int(pred.max()),  # max prediction in case of multiple rows
                    "probability_percent": risk_percent
                })

            results[key] = predictions

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
