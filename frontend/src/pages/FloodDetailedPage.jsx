import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TABS = [
  "7days",
  "1month",
  "3months",
  "6months",
  "summaryInsights",
  "userNotes",
  "lastUpdated",
  "forecastAccuracy",
];

function groupByDay(predictions) {
  const map = {};
  for (const p of predictions) {
    const day = p.timestamp.split("T")[0];
    if (!map[day]) map[day] = [];
    map[day].push(p);
  }
  return Object.entries(map).map(([date, hourly]) => ({ date, hourly }));
}

export default function FloodDetailedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { location: locString } = location.state || {};
  const [selectedTab, setSelectedTab] = useState("7days");
  const [predictionData, setPredictionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    if (!locString) return;

    const [latStr, lonStr] = locString.split(",").map((s) => s.trim());
    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lonStr);

    if (isNaN(latitude) || isNaN(longitude)) {
      setError("Invalid coordinates provided.");
      setPredictionData([]);
      setLoading(false);
      return;
    } else {
      setError("");
    }

    const startDate = new Date().toISOString().slice(0, 10);
    setLoading(true);
    setExpandedDay(null);

    fetch(
      `/api/detailed-flood-predictions?latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(
        longitude
      )}&start_date=${encodeURIComponent(startDate)}&time_range=${encodeURIComponent(
        selectedTab
      )}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        const grouped = groupByDay(json[selectedTab] || []);
        setPredictionData(grouped);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch predictions: " + err.message);
        setPredictionData([]);
        setLoading(false);
      });
  }, [selectedTab, locString]);

  const toggleExpand = (date) => {
    setExpandedDay(expandedDay === date ? null : date);
  };

  return (
    <div
      style={{
        display: "flex",
        maxWidth: 1100,
        margin: "20px auto",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 10px rgb(0 0 0 / 0.1)",
        minHeight: 600,
        padding: 0,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#222",
      }}
    >
      {/* Sidebar Tabs */}
      <aside
        style={{
          width: 200,
          padding: "18px 12px 18px 18px",
          borderRight: "1px solid #eee",
          background: "#f5f8fa",
          borderRadius: "8px 0 0 8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "#e3e9fb",
            border: "none",
            borderRadius: 20,
            color: "#3558d4",
            padding: "8px 20px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px #22315a15",
            marginBottom: 24,
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#d8def2")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#e3e9fb")}
        >
          ← Back
        </button>
        {TABS.map((tab) => (
          <div
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              marginBottom: 12,
              width: "100%",
              padding: "10px 0 10px 16px",
              borderRadius: 23,
              backgroundColor: selectedTab === tab ? "#007acc" : "#dde7f2",
              color: selectedTab === tab ? "#fff" : "#205080",
              fontWeight: selectedTab === tab ? 700 : 500,
              cursor: "pointer",
              userSelect: "none",
              fontSize: 16,
              boxShadow: selectedTab === tab ? "0 2px 6px #207acc22" : "none",
              transition: "background-color .2s, color .2s, box-shadow .2s",
            }}
            tabIndex={0}
            role="button"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, " $1")}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        <h2 style={{ marginBottom: 20, fontWeight: 700, color: "#007acc" }}>
          {selectedTab.charAt(0).toUpperCase() +
            selectedTab.slice(1).replace(/([A-Z])/g, " $1")}{" "}
          Flood Predictions
        </h2>

        {error && (
          <p
            style={{
              color: "#d32f2f",
              backgroundColor: "#fddede",
              padding: 16,
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {error}
          </p>
        )}

        {loading ? (
          <p style={{ fontSize: 16, fontWeight: 600 }}>Loading flood data...</p>
        ) : predictionData.length ? (
          <div>
            {predictionData.map((dayObj) => {
              const avgRisk =
                dayObj.hourly.reduce((acc, h) => acc + (h.flood_risk || 0), 0) /
                dayObj.hourly.length;
              const avgRainfall =
                dayObj.hourly.reduce((acc, h) => acc + (h.rainfall_mm || 0), 0) /
                dayObj.hourly.length;

              return (
                <div
                  key={dayObj.date}
                  style={{
                    marginBottom: 20,
                    backgroundColor: "#f9f9f9",
                    borderRadius: 8,
                    boxShadow: "0 1px 5px rgb(0 0 0 / 0.05)",
                    padding: 16,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    onClick={() => toggleExpand(dayObj.date)}
                  >
                    <div style={{ fontWeight: 700, fontSize: 17 }}>{dayObj.date}</div>
                    <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
                      <div>Avg Flood Risk: {(avgRisk * 100).toFixed(1)}%</div>
                      <div>Avg Rainfall: {avgRainfall.toFixed(1)} mm</div>
                      <button
                        style={{
                          background: "#007acc",
                          color: "white",
                          border: "none",
                          borderRadius: 14,
                          padding: "6px 18px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {expandedDay === dayObj.date ? "Less ▲" : "More ▼"}
                      </button>
                    </div>
                  </div>

                  {expandedDay === dayObj.date && (
                    <div
                      style={{
                        marginTop: 16,
                        paddingLeft: 10,
                        background: "#eef6fd",
                        borderRadius: 7,
                        boxShadow: "0 1px 3px #cce3ff33",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#0097cc",
                          fontSize: 14,
                          padding: "6px 0",
                          marginBottom: 8,
                        }}
                      >
                        Hourly Predictions
                      </div>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: 14,
                        }}
                      >
                        <thead>
                          <tr style={{ background: "#cceaff" }}>
                            <th style={{ padding: "6px" }}>Hour</th>
                            <th>Risk (%)</th>
                            <th>Rainfall (mm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dayObj.hourly.map((h, idx) => (
                            <tr
                              key={idx}
                              style={{
                                background: idx % 2 === 0 ? "#fafcfe" : "#e1eefa",
                              }}
                            >
                              <td style={{ padding: "8px" }}>{h.timestamp.split("T")[1]}</td>
                              <td>{(h.flood_risk * 100).toFixed(1)}</td>
                              <td>{h.rainfall_mm}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontStyle: "italic", opacity: 0.7 }}>No data available.</p>
        )}
      </div>
    </div>
  );
}
