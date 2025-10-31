import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import os

# Load dataset
print("Loading dataset...")
df = pd.read_csv("../ai_models/data/flood_data.csv")

# Features & target
X = df.drop("flood_occurred", axis=1)
y = df["flood_occurred"]

# Preprocessing
numeric_features = [
    "latitude", "longitude", "elevation_m", "rainfall_mm",
    "river_discharge_m3s", "population_density", "temperature_C",
    "water_level_m", "flood_history_10yrs"
]
categorical_features = ["land_cover", "soil_type", "season"]

numeric_transformer = Pipeline(steps=[("scaler", StandardScaler())])
categorical_transformer = Pipeline(steps=[("encoder", OneHotEncoder(handle_unknown="ignore"))])

preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_transformer, numeric_features),
        ("cat", categorical_transformer, categorical_features)
    ]
)

# Models
rf = RandomForestClassifier(n_estimators=200, random_state=42)
xgb = XGBClassifier(n_estimators=300, learning_rate=0.1, max_depth=6, random_state=42)
final_estimator = LogisticRegression()

stacked_model = StackingClassifier(
    estimators=[("rf", rf), ("xgb", xgb)],
    final_estimator=final_estimator,
    passthrough=True
)

# Pipeline
model_pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("classifier", stacked_model)
])

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Train
print("Training stacked model...")
model_pipeline.fit(X_train, y_train)

# Evaluate
y_pred = model_pipeline.predict(X_test)
print("\nFinal Test Accuracy:", round(accuracy_score(y_test, y_pred), 4))
print("\nClassification Report:\n", classification_report(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))

# Save model
os.makedirs("../models", exist_ok=True)
with open("../models/flood_model.pkl", "wb") as f:
    pickle.dump(model_pipeline, f)
print("Optimized stacked model saved to ../models/flood_model.pkl")