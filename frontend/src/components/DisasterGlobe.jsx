import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

// Small set of dummy disaster points for testing
const dummyDisasters = [
  {
    id: "quake1",
    lat: 35.6895,
    lon: 139.6917,
    type: "earthquake",
    risk: "High",
    info: "Magnitude 6.5 earthquake near Tokyo.",
    locationName: "Tokyo, Japan",
  },
  {
    id: "flood1",
    lat: 29.9511,
    lon: -90.0715,
    type: "flood",
    risk: "Moderate",
    info: "Flood warnings in New Orleans.",
    locationName: "New Orleans, USA",
  },
  {
    id: "hurricane1",
    lat: 25.7617,
    lon: -80.1918,
    type: "hurricane",
    risk: "High",
    info: "Category 3 hurricane near Miami.",
    locationName: "Miami, USA",
  },
];

export default function DisasterGlobe({ onSelectDisaster }) {
  const [points, setPoints] = useState([]);
  const globeEl = useRef();

  useEffect(() => {
    // Load dummy data for the globe
    setPoints(dummyDisasters);
  }, []);

  return (
    <Globe
      ref={globeEl}
      globeImageUrl="/low-res-earth.png" // Local low-res globe texture in public folder
      pointsData={points}
      pointLat="lat"
      pointLng="lon"
      pointColor={(d) => {
        switch (d.type) {
          case "flood":
            return "blue";
          case "earthquake":
            return "red";
          case "hurricane":
            return "orange";
          default:
            return "gray";
        }
      }}
      pointAltitude={0.01}
      pointRadius={0.3} // Smaller point radius for performance
      width={600}       // Fixed width and height for low resource usage
      height={600}
      onPointClick={onSelectDisaster}
    />
  );
}
