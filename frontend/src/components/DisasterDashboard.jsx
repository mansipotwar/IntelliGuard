import { useState } from "react";
import DisasterDetails from "./DisasterDetails";
import DisasterGlobe from "./DisasterGlobe";
import DisasterMap from "./DisasterMap";

export default function DisasterDashboard() {
  const [selectedDisaster, setSelectedDisaster] = useState(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* 3D Globe */}
      <div style={{ flex: 1 }}>
        <DisasterGlobe onSelectDisaster={setSelectedDisaster} />
      </div>

      {/* 2D Map and Details */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>
          <DisasterMap selectedDisaster={selectedDisaster} />
        </div>
        <div
          style={{
            flexShrink: 0,
            padding: 10,
            borderTop: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
            minHeight: 180,
          }}
        >
          <DisasterDetails disaster={selectedDisaster} />
        </div>
      </div>
    </div>
  );
}
