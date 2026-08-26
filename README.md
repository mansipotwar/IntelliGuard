# 🛡️ IntelliGuard

**IntelliGuard** is an intelligent disaster prediction and safety-support platform designed to analyze natural disaster risks such as **floods, earthquakes, and cyclones**.

The platform combines **machine learning, real-time environmental data, and interactive analytics** to provide data-driven predictions, risk insights, and disaster-specific safety recommendations.

## 🌍 Key Features

* 🌊 **Flood Prediction** — Uses ensemble machine learning models such as Random Forest and XGBoost to estimate flood risk.
* 🌪️ **Cyclone Analysis** — Evaluates cyclone-related conditions using meteorological parameters such as wind speed and atmospheric pressure.
* 🌎 **Earthquake Risk Evaluation** — Analyzes recent seismic activity and regional earthquake-related data.
* 🤖 **AI-Driven Safety Recommendations** — Provides disaster-specific safety suggestions based on prediction and risk results.
* 📊 **Interactive Analytics Dashboards** — Visualizes predictions, trends, risk levels, and analytical insights.
* 🧩 **Modular Architecture** — Designed to support the integration of additional disaster types and prediction modules in the future.

## 🏗️ System Architecture

IntelliGuard follows a modular architecture that separates the major components of the platform:

```text
IntelliGuard/
│
├── frontend/          # React-based user interface
│
├── backend/           # Flask API and backend services
│
├── models/            # Machine learning models
│
├── data/              # Datasets and processed data
│
└── README.md
```

This structure enables communication between the **frontend, backend, data-processing pipelines, and machine learning models**, making the system easier to develop, test, maintain, and extend.

## 🧠 Disaster Prediction Modules
IntelliGuard uses machine learning techniques to analyze disaster-related data and generate risk predictions.

### 🌊 Flood Prediction

* Random Forest
* XGBoost
* Ensemble-based prediction

### 🌎 Earthquake Risk Analysis

* Seismic activity analysis
* Regional earthquake data
* Risk classification

### 🌪️ Cyclone Prediction/Analysis
* Wind speed
* Atmospheric pressure
* Meteorological parameters

> **Note:** Prediction results are intended for research and decision-support purposes and should not be treated as a replacement for official disaster warnings or emergency services.

## 🛠️ Technology Stack

| Category           | Technologies              |
| ------------------ | ------------------------- |
| Frontend           | React, TailwindCSS        |
| Backend            | Flask, Python             |
| Machine Learning   | Scikit-learn, XGBoost     |
| Data Processing    | Pandas, NumPy             |
| Data Visualization | Interactive dashboards    |
| Architecture       | Modular full-stack system |

## 🔄 How It Works

```text
Environmental / Disaster Data
            ↓
     Data Processing
            ↓
    Feature Engineering
            ↓
    Machine Learning Models
            ↓
      Risk Prediction
            ↓
    Analytics & Visualization
            ↓
   Safety Recommendations
```

## 📊 Analytics & Visualization

### 📍 Location-Based Risk Analysis
![Home Page](./frontend/public/D.1.png)
Visualizes the selected location on an interactive map, helping users analyze disaster risks based on geographical and environmental data.

### ⚠️ Disaster Prediction Page
![Flood](./frontend/public/result.png)
Displays disaster risk predictions for a selected location based on the analyzed environmental and disaster-related data.

### 🌊 Flood Prediction Page
![Earthquake](./frontend/public/Screenshot%202025-08-11%20225422.png)
Displays the predicted flood risk for a selected location based on relevant environmental, weather, and historical disaster data.

### 📊 Disaster Analysis Page
![Hurricane](./frontend/public/2.png)
Provides an overview of analyzed disaster data, helping users understand disaster patterns, risk factors, and location-based insights.

### 🌊 Flood Analysis Dashboard
![Dashboard](./frontend/public/D.2.png)
Visualizes flood-related data through charts and graphs, providing insights into flood patterns, risk levels, affected locations, and other analyzed factors.

### 🌍 Earthquake Analysis Dashboard
![Dashboard](./frontend/public/D.3.png)
Visualizes earthquake-related data through charts and graphs, providing insights into earthquake patterns, magnitude, frequency, and affected locations.

### 🌀 Hurricane Analysis Dashboard
![Dashboard](./frontend/public/D.4.png)
Visualizes hurricane-related data through charts and graphs, providing insights into storm patterns, intensity, frequency, and affected locations.

### 🛡️ Safety Recommendations Page
![Analysis](./frontend/public/r4.png)
Provides safety recommendations and precautionary measures based on the identified disaster risks to help users take appropriate actions during emergencies.

## 🚀 Future Scope

The modular design of IntelliGuard allows additional capabilities to be integrated in future versions, including:

* Integration of additional disaster types such as landslides and wildfires
* Improved prediction models with larger and more diverse datasets
* Real-time data streaming
* Geospatial risk mapping
* Location-based alerts
* Improved model accuracy through continuous training
* Integration with official disaster warning systems

## ⚠️ Disclaimer

IntelliGuard is an academic/research-oriented project developed for **disaster risk analysis and decision-support purposes**.

Predictions generated by the system may contain inaccuracies and should not be considered official emergency warnings. Users should always follow guidance from relevant government authorities and emergency services during an actual disaster.

## 👩‍💻 Project

**Project Name:** IntelliGuard
**Domain:** Artificial Intelligence & Machine Learning
**Application Area:** Disaster Prediction & Safety Support

---

⭐ If you find this project useful, consider giving the repository a star!
