import { useState } from "react";

export default function HurricanePrediction() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [maxWind, setMaxWind] = useState("");
  const [minPressure, setMinPressure] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      Latitude: latitude,
      Longitude: longitude,
      "Maximum Wind": Number(maxWind),
      "Minimum Pressure": Number(minPressure),
    };

    try {
      const response = await fetch("http://localhost:8000/api/hurricane-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Error fetching prediction");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Hurricane Real-Time Prediction</h2>
      <input
        type="text"
        placeholder="Latitude (e.g. 28.0N)"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />
      <input
        type="text"
        placeholder="Longitude (e.g. 94.8W)"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />
      <input
        type="number"
        placeholder="Maximum Wind (mph)"
        value={maxWind}
        onChange={(e) => setMaxWind(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />
      <input
        type="number"
        placeholder="Minimum Pressure (mb)"
        value={minPressure}
        onChange={(e) => setMinPressure(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />
      <button onClick={handlePredict} disabled={loading} style={{ width: "100%", padding: 10 }}>
        {loading ? "Predicting..." : "Get Prediction"}
      </button>

      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 20, padding: 10, border: "1px solid #ccc" }}>
          <div>
            <strong>High Wind Predicted:</strong> {result.high_wind_predicted ? "Yes" : "No"}
          </div>
          <div>
            <strong>Prediction Probability:</strong> {(result.prediction_probability * 100).toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
}
