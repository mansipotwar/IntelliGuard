import pandas as pd
import os

def get_flood_prediction_by_index(row_index: int):
    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ai_models/data/flood_data.csv'))
    try:
        df = pd.read_csv(csv_path)

        if row_index >= len(df) or row_index < 0:
            return {
                "error": f"Row index out of range! row_index={row_index}, max={len(df)-1}"
            }

        row = df.iloc[row_index]

        # Convert all pandas/numpy values to native Python primitives
        def py(v, as_type):
            try:
                if pd.isna(v): return None
                return as_type(v)
            except Exception:
                return str(v)
        parameters = {
            "latitude": py(row["latitude"], float),
            "longitude": py(row["longitude"], float),
            "elevation_m": py(row["elevation_m"], float),
            "rainfall_mm": py(row["rainfall_mm"], float),
            "river_discharge_m3s": py(row["river_discharge_m3s"], float),
            "population_density": py(row["population_density"], float),
            "temperature_C": py(row["temperature_C"], float),
            "water_level_m": py(row["water_level_m"], float),
            "land_cover": py(row["land_cover"], str),
            "soil_type": py(row["soil_type"], str),
            "season": py(row["season"], str),
            "flood_history_10yrs": py(row["flood_history_10yrs"], int),
        }

        prediction = py(row["flood_occurred"], int)

        return {
            "parameters": parameters,
            "flood_occurred": prediction,
            "model_basis": "Prediction based on all tabular flood parameters shown."
        }

    except Exception as e:
        return {"error": f"Internal error: {str(e)}"}