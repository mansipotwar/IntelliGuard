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

# Load earthquake dataset
print("Loading earthquake dataset...")
df = pd.read_csv("../ai_models/data/earthquake.csv")  # Update path if needed

# Example target: Earthquake occurrence based on magnitude threshold > 3
df['earthquake_occurred'] = (df['mag'] > 3).astype(int)

# Features & target
features = ["latitude", "longitude", "depth", "mag"]
X = df[features]
y = df["earthquake_occurred"]

# Preprocessing for numeric features only with imputation and scaling
numeric_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy="mean")),  # Impute missing values with mean
    ("scaler", StandardScaler())
])

preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_transformer, features)
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
print("Training earthquake prediction stacked model...")
model_pipeline.fit(X_train, y_train)

# Evaluate
y_pred = model_pipeline.predict(X_test)
print("\nTest Accuracy:", round(accuracy_score(y_test, y_pred), 4))
print("\nClassification Report:\n", classification_report(y_test, y_pred))
print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))

# Save model
os.makedirs("../models", exist_ok=True)
with open("../models/earthquake_model.pkl", "wb") as f:
    pickle.dump(model_pipeline, f)
print("Stacked earthquake prediction model saved to ../models/earthquake_model.pkl")
