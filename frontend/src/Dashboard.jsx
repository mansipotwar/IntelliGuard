import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import './dashboard.css';

const DEFAULT_COORDS = { lat: 21.1458, lng: 79.0882 };

export default function Dashboard({
  location,
  risk,
  data,
  loading,
  setLocation,
  searchLocation,
  onShowDetailedAnalysis,
  onShowPredictionDetails,
  onShowSafetyDetails,
}) {
  const [searchCity, setSearchCity] = useState('');
  const [markerLabel, setMarkerLabel] = useState('Selected Location');
  const [userLocErr, setUserLocErr] = useState('');
  const mapRef = useRef(null);
  const coords = location ?? DEFAULT_COORDS;

  useEffect(() => {
    if (coords && coords.lat && coords.lng) {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
      )
        .then(res => res.json())
        .then(info => {
          setMarkerLabel(
            info.address?.city ||
            info.address?.town ||
            info.address?.village ||
            info.address?.county ||
            info.display_name?.split(',')[0] ||
            "Selected Location"
          );
        })
        .catch(() => setMarkerLabel("Selected Location"));
    }
  }, [coords.lat, coords.lng]);

  async function handleCitySearch(city) {
    if (!city) return;
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json`
      );
      const arr = await resp.json();
      if (arr && arr[0]) {
        const lat = parseFloat(arr[0].lat);
        const lng = parseFloat(arr[0].lon);
        searchLocation(lat, lng);
        if (mapRef.current && mapRef.current.flyTo) {
          mapRef.current.flyTo([lat, lng], 13);
        }
        setMarkerLabel(arr[0].display_name?.split(",")[0] || city);
      } else {
        setMarkerLabel(city);
      }
    } catch {
      setMarkerLabel(city);
    }
  }

  return (
    <div className="dashboard-container">
      {/* Map Area */}
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={13}
        scrollWheelZoom
        ref={mapRef}
        className="dashboard-map"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />
        <Marker position={[coords.lat, coords.lng]}>
          <Popup>
            <strong>{markerLabel}</strong><br />
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </Popup>
        </Marker>
      </MapContainer>

      {/* Left Sidebar */}
      <aside className="dashboard-sidebar-left">
        <div className="title">DisasterguardX</div>
        {/* Search Bar */}
        <div className="dashboard-search-bar">
          <input
            placeholder="Search city..."
            value={searchCity}
            onChange={e => setSearchCity(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') await handleCitySearch(searchCity);
            }}
          />
          <button onClick={() => handleCitySearch(searchCity)}>🔎</button>
        </div>
        {userLocErr && (
          <div className="user-location-error">{userLocErr}</div>
        )}
        {/* Current location info */}
        <div className="location-info">
          Location:&nbsp;
          <span className="coordinates">
            {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
          </span>
          <br />
          <span className="marker-label">{markerLabel}</span>
        </div>
        {/* Flood/Risk Info */}
        <div className="flood-info">
          <h4>Flood Information</h4>
          {loading ? (
            <div>Loading data…</div>
          ) : !data ? (
            <div style={{ color: '#D34F4A' }}>No data</div>
          ) : (
            <>
              <div>
                Risk:{" "}
                <span className={risk === 'High' ? 'risk-high' : 'risk-low'}>
                  {risk}
                </span>
              </div>
              <div>
                Rainfall:{" "}
                <span className="rainfall">{data.parameters?.rainfall_mm ?? '-'}</span>{" "}
                mm
              </div>
              <div>River Level: {data.parameters?.river_discharge_m3s ?? '-'} m³/s</div>
              <div>Temperature: {data.parameters?.temperature_C ?? '-'} °C</div>
              <div>
                Evacuation:{" "}
                <span className={risk === 'High' ? 'risk-high' : 'risk-low'}>
                  {risk === 'High' ? "Required" : "Safe"}
                </span>
              </div>
              <div className="flood-description">{data.model_basis ?? ""}</div>
            </>
          )}
        </div>
      </aside>

      {/* Right Sidebar */}
      <aside className="dashboard-sidebar-right">
        <h2>Menu</h2>
        <button onClick={onShowDetailedAnalysis}>Analysis</button>
        <button onClick={onShowPredictionDetails}>Prediction</button>
        <button onClick={onShowSafetyDetails}>Safety</button>
      </aside>
    </div>
  );
}