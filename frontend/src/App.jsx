import { useEffect, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";
import Dashboard from "./Dashboard";
import DetailedAnalysisPage from "./DetailedAnalysisPage";
import EarthquakeAnalysisPage from "./pages/EarthquakeAnalysisPage";
import EarthquakeDetailedPage from "./pages/EarthquakeDetailedPage";
import FloodAnalysisPage from "./pages/FloodAnalysisPage";
import FloodDetailedPage from "./pages/FloodDetailedPage";
import HurricaneAnalysisPage from "./pages/HurricaneAnalysisPage"; // <-- Added for hurricane
import HurricaneDetailedPage from "./pages/HurricaneDetailedPage";
import PredictionPage from "./PredictionPage";
import SafetyDetailsPage from "./SafetyDetailsPage";

const DEFAULT_COORDS = { lat: 21.1458, lng: 79.0882 }; // Central India

function AppContainer() {
  const [location, setLocation] = useState(null);
  const [risk, setRisk] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedLocation = localStorage.getItem("location");
    if (savedLocation) {
      const parsedLoc = JSON.parse(savedLocation);
      setLocation(parsedLoc);
      fetchData(parsedLoc.lat, parsedLoc.lng);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ lat, lng });
          fetchData(lat, lng);
          localStorage.setItem("location", JSON.stringify({ lat, lng }));
        },
        () => {
          setLocation(DEFAULT_COORDS);
          fetchData(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
          setRisk("");
          setLoading(false);
          localStorage.setItem("location", JSON.stringify(DEFAULT_COORDS));
        }
      );
    }
  }, []);

  const updateLocation = (lat, lng) => {
    const newLoc = { lat, lng };
    setLocation(newLoc);
    localStorage.setItem("location", JSON.stringify(newLoc));
    fetchData(lat, lng);
  };

  const fetchData = (lat, lng) => {
    setLoading(true);
    fetch(
      `/api/real-time-flood?latitude=${encodeURIComponent(
        lat
      )}&longitude=${encodeURIComponent(lng)}`
    )
      .then((res) => res.json())
      .then((fetchedData) => {
        setData(fetchedData);
        setRisk(fetchedData.flood_occurred ? "High" : "Low");
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setRisk("");
        setLoading(false);
      });
  };

  const searchLocation = (lat, lng) => {
    updateLocation(lat, lng);
    navigate("/prediction");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Dashboard
            location={location}
            risk={risk}
            data={data}
            loading={loading}
            setLocation={updateLocation}
            searchLocation={searchLocation}
            onShowDetailedAnalysis={() => navigate("/detailed-analysis")}
            onShowPredictionDetails={() => navigate("/prediction")}
            onShowSafetyDetails={() => navigate("/safety-details")}
          />
        }
      />
      <Route
        path="/detailed-analysis"
        element={
          !location || !data || !data.parameters ? (
            <NoLocationSelected />
          ) : (
            <DetailedAnalysisPage location={location} onBack={() => navigate("/")} />
          )
        }
      />
      <Route path="/detailed-analysis/flood" element={<FloodAnalysisPage />} />
      <Route path="/detailed-analysis/earthquake" element={<EarthquakeAnalysisPage />} />
      <Route path="/detailed-analysis/hurricane" element={<HurricaneAnalysisPage />} />
      <Route
        path="/prediction"
        element={
          !location ? <NoLocationSelected /> : <PredictionPage location={location} />
        }
      />
      <Route
        path="/predict/flood"
        element={
          !location ? (
            <NoLocationSelected />
          ) : (
            <FloodDetailedPage location={location} onBack={() => navigate("/prediction")} />
          )
        }
      />
      <Route
        path="/predict/earthquake"
        element={
          !location ? (
            <NoLocationSelected />
          ) : (
            <EarthquakeDetailedPage
              location={location}
              onBack={() => navigate("/prediction")}
            />
          )
        }
      />
      <Route
        path="/predict/hurricane"
        element={
          !location ? (
            <NoLocationSelected />
          ) : (
            <HurricaneDetailedPage
              location={location}
              onBack={() => navigate("/prediction")}
            />
          )
        }
      />
      <Route
        path="/safety-details"
        element={
          !location || !data || !data.parameters ? (
            <NoLocationSelected />
          ) : (
            <SafetyDetailsPage data={data} risk={risk} onBack={() => navigate("/")} />
          )
        }
      />
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
}

function NoLocationSelected() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24, color: "red" }}>
      No location selected.
      <br />
      <button onClick={() => navigate("/")} style={{ marginTop: 16 }}>
        Go Back
      </button>
    </div>
  );
}

function NoPage() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      Page not found.
      <br />
      <button onClick={() => navigate("/")} style={{ marginTop: 16 }}>
        Go Home
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContainer />
    </Router>
  );
}
