import { useNavigate } from "react-router-dom";
import "./DetailedAnalysisPage.css";

function ClickableCard({ to, state, children, bgImage }) {
  const navigate = useNavigate();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(to, { state })}
      onKeyDown={(e) => e.key === "Enter" && navigate(to, { state })}
      style={{
        cursor: "pointer",
        borderRadius: 20,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        background: `url(${bgImage}) center/cover no-repeat, linear-gradient(120deg,#222 50%,#444 100%)`,
        padding: 32,
        minWidth: 350,
        minHeight: 260,
        margin: 18,
        userSelect: "none",
        transition: "box-shadow 0.3s, background 0.3s",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 22,
        fontWeight: 700,
        boxSizing: "border-box",
        border: "2.5px solid #fff8",
        overflow: "hidden"
      }}
      onMouseOver={e => e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.25)"}
      onMouseOut={e => e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.18)"}
    >
      <div
        style={{
          background: "rgba(5,18,31,0.62)",
          padding: 18,
          borderRadius: 12,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function FloodCard({ stats }) {
  const riskPercent = (stats.risk || 0) * 100;
  return (
    <>
      <h3>💧 Flood Analysis</h3>
      <p>Risk: {riskPercent.toFixed(1)}%</p>
      <p>Average Rainfall: {stats.avgRainfall ?? "N/A"} mm</p>
      <p>Max Risk: {(stats.maxRisk * 100).toFixed(1)}%</p>
      <p>High-Risk Days: {stats.highRiskDays ?? "N/A"}</p>
    </>
  );
}

function EarthquakeCard({ stats }) {
  const riskPercent = (stats.risk || 0) * 100;
  return (
    <>
      <h3>🌎 Earthquake Analysis</h3>
      <p>Risk: {riskPercent.toFixed(1)}%</p>
      <p>Tremors: {stats.tremors ?? "N/A"}</p>
      <p>Max Magnitude: {stats.maxMagnitude ?? "N/A"}</p>
      <p>Avg Depth: {stats.avgDepth ?? "N/A"} km</p>
    </>
  );
}

function HurricaneCard({ stats }) {
  const riskPercent = (stats.risk || 0) * 100;
  return (
    <>
      <h3>🌪️ Hurricane Analysis</h3>
      <p>Risk: {riskPercent.toFixed(1)}%</p>
      <p>Max Wind Speed: {stats.maxWindSpeed ?? "N/A"} km/h</p>
      <p>Min Pressure: {stats.minPressure ?? "N/A"} hPa</p>
      <p>High-Risk Hours: {stats.highRiskHours ?? "N/A"}</p>
    </>
  );
}

export default function AnalysisPage() {
  const navigate = useNavigate();

  const currentLocation = "21.1458, 79.0882";

  const floodStats = {
    risk: 0.62,
    avgRainfall: 89.3,
    maxRisk: 0.85,
    highRiskDays: 5,
  };

  const earthquakeStats = {
    risk: 0.37,
    tremors: 12,
    maxMagnitude: 5.7,
    avgDepth: 56,
  };

  const hurricaneStats = {
    risk: 0.55,
    maxWindSpeed: 120,
    minPressure: 950,
    highRiskHours: 30,
  };

  return (
    <div style={{
      width: "100vw",
      minHeight: "100vh",
      background: "linear-gradient(120deg,#202b40 0%,#344c60 100%)",
      padding: "42px 0 100px",
      boxSizing: "border-box"
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          margin: "0 0 42px 42px",
          padding: "12px 30px",
          cursor: "pointer",
          backgroundColor: "#ecefff",
          color: "#334488",
          border: "none",
          borderRadius: 22,
          fontWeight: 700,
          fontSize: 20,
          boxShadow: "0 6px 20px rgba(51,68,136,0.15)",
          transition: "background-color 0.25s",
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#d0d9fb")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#ecefff")}
      >
        ← Back
      </button>
      <div style={{
        display: "flex",
        gap: 38,
        justifyContent: "center",
        alignItems: "flex-start",
        flexWrap: "wrap",
        padding: "0 24px"
      }}>
        <ClickableCard
          to="/detailed-analysis/flood"
          state={{ location: currentLocation }}
          bgImage={"/flood.png.jpg"}
        >
          <FloodCard stats={floodStats} />
        </ClickableCard>

        <ClickableCard
          to="/detailed-analysis/earthquake"
          state={{ location: currentLocation }}
          bgImage={"/earthquake.png.jpg"}
        >
          <EarthquakeCard stats={earthquakeStats} />
        </ClickableCard>

        <ClickableCard
          to="/detailed-analysis/hurricane"
          state={{ location: currentLocation }}
          bgImage={"/hurricane.png.jpg"}
        >
          <HurricaneCard stats={hurricaneStats} />
        </ClickableCard>
      </div>
    </div>
  );
}
