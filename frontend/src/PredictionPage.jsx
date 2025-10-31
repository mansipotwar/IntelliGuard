import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PredictionDetailsPage.css";


const disasterTypes = [
  { id: "all", label: "All" },
  { id: "flood", label: "Flood" },
  { id: "earthquake", label: "Earthquake" },
  { id: "hurricane", label: "Hurricane" },
];


// Use backend proxy instead of direct Nominatim call
async function geocodePlace(placeName) {
  const resp = await fetch(`/api/geocode?place=${encodeURIComponent(placeName)}`);
  if (!resp.ok) throw new Error("Geocoding proxy failed");
  const data = await resp.json();
  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  } else {
    throw new Error("No coordinates found for place");
  }
}


function DisasterCard({ type, data, onClick }) {
  const riskValue =
    type === "flood"
      ? data?.flood_risk * 100
      : type === "earthquake"
      ? data?.earthquake_probability * 100
      : type === "hurricane"
      ? data?.hurricane_risk * 100
      : 0;


  const riskLevel =
    riskValue >= 70
      ? { label: "High Risk 🔴", color: "#E55353" }
      : riskValue >= 30
      ? { label: "Medium Risk 🟡", color: "#F3C13A" }
      : { label: "Safe 🟢", color: "#5ECC7A" };


  const icon =
    type === "flood" ? "💧" : type === "earthquake" ? "🌍" : "🌀";


  return (
    <div
      onClick={() => onClick(type)}
      style={{
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderRadius: 12,
        padding: 20,
        background:
          type === "flood"
            ? "linear-gradient(135deg, #89D4CF, #6E8B3D)"
            : type === "earthquake"
            ? "linear-gradient(135deg, #F7971E, #FFD200)"
            : "linear-gradient(135deg, #00C6FF, #0072FF)",
        color: "white",
        flex: 1,
        margin: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontSize: 32 }}>{icon}</div>
      <h3>{type.charAt(0).toUpperCase() + type.slice(1)} Prediction</h3>
      <div>Location: {data?.location || "..."}</div>
      <div style={{ marginTop: 10, fontSize: 24, fontWeight: "bold" }}>
        Today's Risk: {riskLevel.label} ({Math.round(riskValue)}%)
      </div>
      <small>Last updated: {data?.lastUpdated || "N/A"}</small>
    </div>
  );
}


export default function PredictionPage() {
  const [location, setLocation] = useState("");
  const [disasterType, setDisasterType] = useState("all");
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const onSearch = async () => {
    setError("");
    setLoading(true);


    if (!location) {
      setError("Please enter a location.");
      setLoading(false);
      return;
    }


    try {
      let latitude, longitude;


      if (location.includes(",")) {
        const [latStr, lonStr] = location.split(",").map(s => s.trim());
        latitude = parseFloat(latStr);
        longitude = parseFloat(lonStr);


        if (isNaN(latitude) || isNaN(longitude)) {
          throw new Error("Invalid lat/lon format");
        }
      } else {
        const geoResult = await geocodePlace(location);
        latitude = geoResult.lat;
        longitude = geoResult.lon;
      }


      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        isNaN(latitude) ||
        isNaN(longitude)
      ) {
        throw new Error("Coordinates undefined or invalid (NaN).");
      }


      const floodPromise =
        disasterType === "all" || disasterType === "flood"
          ? fetch(
              `/api/real-time-flood?latitude=${encodeURIComponent(
                latitude
              )}&longitude=${encodeURIComponent(longitude)}`
            ).then(r => r.json())
          : Promise.resolve(null);


      const earthquakePromise =
        disasterType === "all" || disasterType === "earthquake"
          ? fetch(
              `/api/multi-range-earthquake-predictions?latitude=${encodeURIComponent(
                latitude
              )}&longitude=${encodeURIComponent(longitude)}`
            ).then(r => r.json())
          : Promise.resolve(null);


      const hurricanePromise =
        disasterType === "all" || disasterType === "hurricane"
          ? fetch(
              `/api/hurricane-predict-multi?latitude=${encodeURIComponent(
                latitude
              )}&longitude=${encodeURIComponent(longitude)}`
            ).then(r => r.json())
          : Promise.resolve(null);


      const [floodData, earthquakeData, hurricaneData] = await Promise.all([
        floodPromise,
        earthquakePromise,
        hurricanePromise,
      ]);


      setSearchResults({
  location: `${latitude},${longitude}`,
  flood: {
    flood_risk: floodData?.flood_risk_level
      ? floodData.flood_risk_level === "Unknown"
        ? 0
        : floodData.flood_risk_level === "High"
        ? 0.9
        : floodData.flood_risk_level === "Moderate"
        ? 0.6
        : 0.3
      : 0,
    lastUpdated: new Date().toLocaleString(),
    details: floodData,
  },
  earthquake: {
    earthquake_probability: (() => {
      const dailyPredictions = earthquakeData?.["7days_daily"];
      if (dailyPredictions && dailyPredictions.length > 0) {
        return dailyPredictions[0].probability_percent / 100;
      }
      return 0;
    })(),
    lastUpdated: new Date().toLocaleString(),
    details: earthquakeData,
  },
  hurricane: {
    hurricane_risk:
      hurricaneData?.hourly_predictions_next_7_days?.length > 0
        ? Math.max(
            ...hurricaneData.hourly_predictions_next_7_days.map(
              p => p.probability
            )
          )
        : 0,
    lastUpdated: new Date().toLocaleString(),
    details: hurricaneData,
  },
});

    } catch (ex) {
      setError("Error fetching data: " + ex.message);
    } finally {
      setLoading(false);
    }
  };


  const onCardClick = type => {
    if (type === "flood")
      navigate("/predict/flood", {
        state: { data: searchResults?.flood, location: searchResults?.location },
      });
    else if (type === "earthquake")
      navigate("/predict/earthquake", {
        state: { data: searchResults?.earthquake, location: searchResults?.location },
      });
    else if (type === "hurricane")
      navigate("/predict/hurricane", {
        state: { data: searchResults?.hurricane, location: searchResults?.location },
      });
  };


  return (
    <div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <h1>Disaster Predictions</h1>
      <div style={{ marginBottom: 20, display: "flex", gap: 16 }}>
        <input
          type="text"
          style={{ flexGrow: 1, fontSize: 16, padding: 8 }}
          placeholder="Enter location (name or lat,lon)"
          value={location}
          onChange={e => setLocation(e.target.value)}
          disabled={loading}
        />
        <select
          value={disasterType}
          onChange={e => setDisasterType(e.target.value)}
          style={{ fontSize: 16, padding: 8 }}
          disabled={loading}
        >
          {disasterTypes.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <button onClick={onSearch} disabled={loading} style={{ fontSize: 16, padding: "8px 16px" }}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>
      {error && (
        <div style={{ color: "red", marginBottom: 16 }}>
          {error}
        </div>
      )}
      <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
        {(disasterType === "all" || disasterType === "flood") &&
          searchResults?.flood && (
            <DisasterCard type="flood" data={searchResults.flood} onClick={onCardClick} />
          )}
        {(disasterType === "all" || disasterType === "earthquake") &&
          searchResults?.earthquake && (
            <DisasterCard type="earthquake" data={searchResults.earthquake} onClick={onCardClick} />
          )}
        {(disasterType === "all" || disasterType === "hurricane") &&
          searchResults?.hurricane && (
            <DisasterCard type="hurricane" data={searchResults.hurricane} onClick={onCardClick} />
          )}
      </div>
    </div>
  );
}
