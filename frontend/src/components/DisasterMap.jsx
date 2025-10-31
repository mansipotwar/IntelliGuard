import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

function FocusMap({ lat, lon }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lon) {
      map.flyTo([lat, lon], 8, { duration: 2 });
    }
  }, [lat, lon, map]);

  return null;
}

export default function DisasterMap({ selectedDisaster }) {
  const coords = selectedDisaster ? [selectedDisaster.lat, selectedDisaster.lon] : [21.1458, 79.0882];

  return (
    <MapContainer
      center={coords}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {selectedDisaster && (
        <Marker position={coords}>
          <Popup>
            {selectedDisaster.type} - Risk: {selectedDisaster.risk}
          </Popup>
        </Marker>
      )}
      <FocusMap lat={selectedDisaster?.lat} lon={selectedDisaster?.lon} />
    </MapContainer>
  );
}
