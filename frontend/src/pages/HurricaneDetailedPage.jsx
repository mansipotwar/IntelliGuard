import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TABS = [
  { id: "hourly", label: "Next 7 Days (Hourly)" },
  { id: "daily", label: "Following 9 Days (Daily)" },
];

function groupByDay(predictions) {
  const map = {};
  predictions.forEach(p => {
    const day = p.time_utc ? p.time_utc.split("T")[0] : p.date?.split("T")[0];
    if (!map[day]) map[day] = [];
    map[day].push(p);
  });
  return Object.entries(map).map(([date, hourly]) => ({ date, hourly }));
}

export default function HurricaneDetailedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryLocation = location.state?.location || "";
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({ hourly: [], daily: [] });
  const [expandedDay, setExpandedDay] = useState(null);
  const [selectedTab, setSelectedTab] = useState("daily");

  useEffect(() => {
    if (!queryLocation) return;
    try {
      const [latStr, lonStr] = queryLocation.split(",").map(s => s.trim());
      const latNum = parseFloat(latStr);
      const lonNum = parseFloat(lonStr);
      if (isNaN(latNum) || isNaN(lonNum)) throw new Error("Invalid lat/lon format");
      const lat = latNum;
      const lon = lonNum;
      setCoords({ lat, lon });
      setError("");
    } catch (e) {
      setError("Error parsing coordinates: " + e.message);
      setCoords({ lat: null, lon: null });
    }
  }, [queryLocation]);

  useEffect(() => {
    if (!coords.lat || !coords.lon) return;
    const fetchPredictions = async () => {
      setLoading(true);
      setError("");
      setData({ hourly: [], daily: [] });
      setExpandedDay(null);
      try {
        const url = `/api/hurricane-predict-multi?latitude=${coords.lat}&longitude=${coords.lon}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();
        setData({
          hourly: json.hourly_predictions_next_7_days || [],
          daily: json.daily_predictions_next_9_days || [],
        });
      } catch (e) {
        setError("Error fetching hurricane predictions: " + e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, [coords]);

  const toggleExpand = date => {
    setExpandedDay(expandedDay === date ? null : date);
  };

  const dailyGrouped = groupByDay(data.daily);

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva", maxWidth: 900, margin: "auto", padding: 24 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 20, padding: "8px 16px", cursor: "pointer" }}>
        ← Back
      </button>
      <h1 style={{ color: "#007acc" }}>🌪️ Hurricane Prediction Dashboard</h1>
      <p><strong>Location:</strong> {queryLocation}</p>

      <div style={{ marginBottom: 16 }}>
        {["daily", "hourly"].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              padding: "8px 16px",
              marginRight: 12,
              fontWeight: selectedTab === tab ? "bold" : "normal",
              backgroundColor: selectedTab === tab ? "#007acc" : "#eee",
              color: selectedTab === tab ? "white" : "black",
              border: "none",
              borderRadius: 16,
              cursor: "pointer",
            }}
          >
            {tab === "daily" ? "Following 9 Days (Daily)" : "Next 7 Days (Hourly)"}
          </button>
        ))}
      </div>

      {loading && <p>Loading predictions...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && selectedTab === "daily" && (
        <>
          {dailyGrouped.length === 0 && <p>No daily prediction data.</p>}
          {dailyGrouped.map(day => (
            <div key={day.date} style={{ marginBottom: 20, border: "1px solid #ccc", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", cursor: "pointer" }} onClick={() => toggleExpand(day.date)}>
                <div>
                  <h3>{day.date}</h3>
                  <p>Prediction: {day.hourly[0]?.prediction === 1 ? "Hurricane Risk" : "No Risk"}</p>
                  <p>Probability: {(day.hourly[0]?.probability * 100).toFixed(2)}%</p>
                  <p>Wind Speed: {day.hourly[0]?.wind_speed} km/h | Pressure: {day.hourly[0]?.pressure} hPa</p>
                </div>
                <button style={{ background: "none", border: "none", color: "#007acc", cursor: "pointer" }}>
                  {expandedDay === day.date ? "Hide Hourly ▲" : "View Hourly ▼"}
                </button>
              </div>
              {expandedDay === day.date && (
                <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#e0f0ff" }}>
                      <th style={{ padding: 8 }}>Time (UTC)</th>
                      <th style={{ padding: 8 }}>Prediction</th>
                      <th style={{ padding: 8 }}>Probability</th>
                      <th style={{ padding: 8 }}>Wind (km/h)</th>
                      <th style={{ padding: 8 }}>Pressure (hPa)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.hourly.map((hour, idx) => (
                      <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#fafafa" : "white" }}>
                        <td style={{ padding: 8 }}>{hour.time_utc}</td>
                        <td>{hour.prediction === 1 ? "Hurricane Risk" : "No Risk"}</td>
                        <td>{(hour.probability * 100).toFixed(2)}%</td>
                        <td>{hour.wind_speed}</td>
                        <td>{hour.pressure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </>
      )}

      {!loading && !error && selectedTab === "hourly" && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#e0f0ff" }}>
              <th style={{ padding: 8 }}>Time (UTC)</th>
              <th style={{ padding: 8 }}>Prediction</th>
              <th style={{ padding: 8 }}>Probability</th>
              <th style={{ padding: 8 }}>Wind Speed (km/h)</th>
              <th style={{ padding: 8 }}>Pressure (hPa)</th>
            </tr>
          </thead>
          <tbody>
            {data.hourly.map((item, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#fafafa" : "white" }}>
                <td style={{ padding: 8 }}>{item.time_utc}</td>
                <td>{item.prediction === 1 ? "Hurricane Risk" : "No Risk"}</td>
                <td>{(item.probability * 100).toFixed(2)}%</td>
                <td>{item.wind_speed}</td>
                <td>{item.pressure}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
