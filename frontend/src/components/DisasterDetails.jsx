export default function DisasterDetails({ disaster }) {
  if (!disaster) {
    return <div>Select a disaster event on the globe or map to see details.</div>;
  }

  return (
    <div style={{ padding: 12 }}>
      <h3>{disaster.type?.toUpperCase() || "DISASTER"} Alert</h3>
      <p><strong>Location:</strong> {disaster.locationName || `${disaster.lat.toFixed(4)}, ${disaster.lon.toFixed(4)}`}</p>
      <p><strong>Risk Level:</strong> {disaster.risk || "Unknown"}</p>
      <p><strong>Details:</strong> {disaster.info || "No further information"}</p>
      {/* Add any additional fields, safety links, timestamps, etc. */}
    </div>
  );
}
