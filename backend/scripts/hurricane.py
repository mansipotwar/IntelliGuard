import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import os

# Debug: show current working directory
import os
print("Current working directory:", os.getcwd())

# Load hurricane dataset
df = pd.read_csv("../ai_models/data/hurricane.csv")

# Fix Latitude and Longitude string values (e.g. '28.0N', '94.8W')
def clean_lat(lat_str):
    if isinstance(lat_str, str) and len(lat_str) > 1:
        val = float(lat_str[:-1])
        if lat_str.endswith('S'):
            val = -val
        return val
    return np.nan

def clean_lon(lon_str):
    if isinstance(lon_str, str) and len(lon_str) > 1:
        val = float(lon_str[:-1])
        if lon_str.endswith('W'):
            val = -val
        return val
    return np.nan

df['Latitude'] = df['Latitude'].apply(clean_lat)
df['Longitude'] = df['Longitude'].apply(clean_lon)

# Create target label (example: binary high wind - over 74 mph)
df['high_wind'] = (df['Maximum Wind'] > 74).astype(int)

# Select features and target
features = [
    "Latitude",
    "Longitude",
    "Maximum Wind",
    "Minimum Pressure"
]
X = df[features]
y = df["high_wind"]

# Preprocessing pipeline
numeric_transformer = Pipeline([
    ("imputer", SimpleImputer(strategy="mean")),
    ("scaler", StandardScaler())
])

preprocessor = ColumnTransformer([
    ("num", numeric_transformer, features)
])

# Stacking models
rf = RandomForestClassifier(n_estimators=200, random_state=42)
xgb = XGBClassifier(n_estimators=300, learning_rate=0.1, max_depth=6, random_state=42)
final_estimator = LogisticRegression()

stacked_model = StackingClassifier(
    estimators=[("rf", rf), ("xgb", xgb)],
    final_estimator=final_estimator,
    passthrough=True
)

# Full pipeline
model_pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", stacked_model)
])

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("Training hurricane prediction stacked model...")
model_pipeline.fit(X_train, y_train)

# Evaluation
y_pred = model_pipeline.predict(X_test)
print("\nTest Accuracy:", round(accuracy_score(y_test, y_pred), 4))
print("\nClassification Report:\n", classification_report(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))

# Save model
os.makedirs("../models", exist_ok=True)
with open("../models/hurricane_model.pkl", "wb") as f:
    pickle.dump(model_pipeline, f)
print("Stacked hurricane prediction model saved to ../models/hurricane_model.pkl")
