import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import './SafetyDetailsPage.css'; // import the CSS

export default function SafetyDetailsPage({
  risk = 'High',
  alerts = [],
  notes = ["Check emergency kit", "Fill water bottles"],
  onBack
}) {
  // Panel selection
  const [activePanel, setActivePanel] = useState('evacuation');
  const mapRef = useRef(null);
  // For route info
  const [routeStats, setRouteStats] = useState(null);

  // Checklist state
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Check emergency kit', done: false },
    { id: 2, label: 'Fill water bottles', done: false },
    { id: 3, label: 'Review evacuation plan', done: false }
  ]);
  const toggleChecklist = idx => {
    setChecklist(list =>
      list.map((item, i) =>
        i === idx ? { ...item, done: !item.done } : item
      )
    );
  };

  // Map initialization for "Safe Evacuation" panel
  useEffect(() => {
    if (activePanel === 'evacuation' && mapRef.current && !mapRef.current._leaflet_map_init) {
      const map = L.map(mapRef.current).setView([28.6, 77.2], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(28.6, 77.2),     // User Location
          L.latLng(28.65, 77.25),   // Junction
          L.latLng(28.7, 77.3)      // Shelter A
        ],
        show: false,
        addWaypoints: false,
        routeWhileDragging: false,
        fitSelectedRoutes: true,
        lineOptions: { styles: [{ color: 'lime', weight: 6 }] }
      }).addTo(map);

      // Get route info below map
      routingControl.on('routesfound', function(e) {
        const summary = e.routes[0].summary;
        setRouteStats({
          distance: (summary.totalDistance / 1000).toFixed(2),
          time: Math.ceil(summary.totalTime / 60)
        });
      });

      L.circle([28.63, 77.24], { radius: 300, color: 'red', fillOpacity: 0.3 })
        .addTo(map).bindPopup('Obstacle (Flooded Area)');
      L.marker([28.6, 77.2]).addTo(map).bindPopup('User Location').openPopup();
      L.marker([28.7, 77.3]).addTo(map).bindPopup('Shelter A');
      L.marker([28.55, 77.1]).addTo(map).bindPopup('Shelter B');

      mapRef.current._leaflet_map_init = true;
    }
    // Clear route info if leaving evacuation view
    if (activePanel !== 'evacuation') setRouteStats(null);
  }, [activePanel]);

  // Main panel: Renders the currently selected section
  function renderPanel() {
    if (activePanel === 'evacuation') {
      return (
        <div>
          <div ref={mapRef} className="sdp-map-container" />
          {routeStats && (
            <div className="sdp-route-info">
              Distance: {routeStats.distance} km &nbsp;&nbsp; | &nbsp;
              Est. Time: {routeStats.time} min
            </div>
          )}
          <div className="sdp-evacuation-advice">
            <h3>Evacuation Advice</h3>
            <ul>
              <li>Follow the marked route to shelter.</li>
              <li>Avoid flooded or blocked areas.</li>
              <li>Keep emergency kit ready.</li>
            </ul>
          </div>
        </div>
      );
    } else if (activePanel === 'tips') {
      return (
        <div className="sdp-content-box">
          <h2>Preparation Tips</h2>
          <ul>
            <li>Store extra drinking water</li>
            <li>Charge devices and power banks</li>
            <li>Keep emergency kit ready</li>
            <li>Monitor weather and alerts</li>
          </ul>
        </div>
      );
    } else if (activePanel === 'contacts') {
      return (
        <div className="sdp-content-box">
          <h2>Emergency Contacts</h2>
          <ul>
            <li>Fire: 101</li>
            <li>Police: 100</li>
            <li>Shelter: 1800-123-456</li>
          </ul>
        </div>
      );
    } else if (activePanel === 'shelters') {
      return (
        <div className="sdp-content-box">
          <h2>Shelter Locations</h2>
          <ul>
            <li>Shelter A — Sector 10</li>
            <li>Shelter B — Lake Road</li>
          </ul>
        </div>
      );
    } else if (activePanel === 'checklist') {
      return (
        <div className="sdp-content-box sdp-checklist">
          <h2>Preparation Checklist</h2>
          <ul>
            {checklist.map((item, idx) => (
              <li key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleChecklist(idx)}
                    style={{ marginRight: 7 }}
                  />
                  {item.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      );
    } else if (activePanel === 'notes') {
      return (
        <div className="sdp-content-box">
          <h2>User Notes</h2>
          <div className="sdp-notes-container">
            {notes && notes.length > 0 ? (
              notes.map((note, idx) => (
                <div key={idx} className="sdp-note-item">{note}</div>
              ))
            ) : (
              <div className="sdp-no-notes">No notes yet.</div>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="sdp-container">
      {/* Sidebar: Menu only */}
      <aside className="sdp-sidebar">
        <div className="sdp-sidebar-content">
          <button
            type="button"
            onClick={onBack}
            className="sdp-back-button"
          >← Back</button>
          <h2 className="sdp-menu-title">Menu</h2>
          <nav className="sdp-menu-nav">
            <button
              onClick={() => setActivePanel('evacuation')}
              className={`sdp-menu-button ${activePanel === 'evacuation' ? 'active' : ''}`}
            >
              Safe Evacuation
            </button>
            <button
              onClick={() => setActivePanel('tips')}
              className={`sdp-menu-button ${activePanel === 'tips' ? 'active' : ''}`}
            >
              Preparation Tips
            </button>
            <button
              onClick={() => setActivePanel('contacts')}
              className={`sdp-menu-button ${activePanel === 'contacts' ? 'active' : ''}`}
            >
              Emergency Contacts
            </button>
            <button
              onClick={() => setActivePanel('shelters')}
              className={`sdp-menu-button ${activePanel === 'shelters' ? 'active' : ''}`}
            >
              Shelter Locations
            </button>
            <button
              onClick={() => setActivePanel('checklist')}
              className={`sdp-menu-button ${activePanel === 'checklist' ? 'active' : ''}`}
            >
              Preparation Checklist
            </button>
            <button
              onClick={() => setActivePanel('notes')}
              className={`sdp-menu-button ${activePanel === 'notes' ? 'active' : ''}`}
            >
              User Notes
            </button>
          </nav>
        </div>
        {/* Flood Risk Info always at bottom */}
        <div className="sdp-flood-risk">
          <h3>Flood Risk</h3>
          <div>
            Current flood risk is{' '}
            <span className={risk === 'High' ? 'risk-high' : 'risk-normal'}>
              {risk || 'unknown'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main panel (data for selected option) */}
      <main className="sdp-main-panel">
        {alerts && alerts.length > 0 && (
          <div className="sdp-alerts">
            {alerts.map((alert, idx) => <div key={idx}>{alert}</div>)}
          </div>
        )}
        {renderPanel()}
      </main>
    </div>
  );
}