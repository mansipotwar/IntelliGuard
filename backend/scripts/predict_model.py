import pandas as pd
import joblib
import numpy as np
import os

# Paths to saved artifacts
MODEL_PATH = r"D:\DisasterGuard-X\backend\ai_models\models\flood_model.pkl"
IMPUTER_PATH = r"D:\DisasterGuard-X\backend\ai_models\models\imputer.pkl"
SCALER_PATH = r"D:\DisasterGuard-X\backend\ai_models\models\scaler.pkl"
FEATURES_PATH = r"D:\DisasterGuard-X\backend\ai_models\models\selected_features.pkl"

def load_artifacts():
    """Load model and preprocessing artifacts."""
    model = joblib.load(MODEL_PATH)
    imputer = joblib.load(IMPUTER_PATH)
    scaler = joblib.load(SCALER_PATH)
    selected_features = joblib.load(FEATURES_PATH)
    return model, imputer, scaler, selected_features

def preprocess_input(new_data: pd.DataFrame):
    """
    Preprocess new input data to match training pipeline:
    - Convert to dummies
    - Impute missing values
    - Scale
    - Select features
    """
    # Load artifacts
    _, imputer, scaler, selected_features = load_artifacts()

    # One-hot encode input
    new_data_encoded = pd.get_dummies(new_data, drop_first=True)

    # Ensure same columns as training
    for col in selected_features:
        if col not in new_data_encoded.columns:
            new_data_encoded[col] = 0

    # Keep only selected features (ordered)
    new_data_encoded = new_data_encoded[selected_features]

    # Impute missing
    data_imputed = imputer.transform(new_data_encoded)

    # Scale
    data_scaled = scaler.transform(data_imputed)

    return data_scaled

def predict(new_data: pd.DataFrame):
    """Make prediction for new input data."""
    model, _, _, _ = load_artifacts()
    processed = preprocess_input(new_data)
    prediction = model.predict(processed)
    proba = model.predict_proba(processed)[:, 1]  # Probability of flood
    return prediction, proba

if __name__ == "__main__":
    # Example usage
    # Replace this dict with real data (must match training features)
    example_data = {
        "rainfall": [250],
        "soil_moisture": [0.45],
        "river_level": [6.2],
        "temperature": [28],
        # Add other features your dataset has...
    }

    df = pd.DataFrame(example_data)
    pred, prob = predict(df)
    print(f"Prediction: {pred}")
    print(f"Probability of flood: {prob}")