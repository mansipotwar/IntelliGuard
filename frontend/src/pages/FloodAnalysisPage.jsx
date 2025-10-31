import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function Card({ children, title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02 }}
      style={{
        background: "white",
        borderRadius: 16,
        boxShadow: "0 6px 20px rgba(34, 51, 84, 0.12)",
        padding: 24,
        color: "#252b42",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {title && (
        <h3
          style={{
            marginBottom: 16,
            fontWeight: "bold",
            color: "#151a35",
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  );
}

export default function FloodAnalysisPage({ onBack }) {
  const [rainData, setRainData] = useState([]);
  const [riskIndex, setRiskIndex] = useState(0);
  const [alertDays, setAlertDays] = useState([]);

  // Demo river discharge data
  const riverData = [
    { day: "Monday", level: 2.2 },
    { day: "Tuesday", level: 2.7 },
    { day: "Wednesday", level: 3.1 },
    { day: "Thursday", level: 3.6 },
    { day: "Friday", level: 3.9 },
  ];

  // Relief centers
  const reliefCenters = [
    { name: "Relief Center A", location: "T. Nagar", capacity: 550 },
    { name: "Relief Center B", location: "Velachery", capacity: 310 },
    { name: "Relief Center C", location: "Anna Nagar", capacity: 640 },
  ];

  // Fetch rainfall forecast
  useEffect(() => {
    async function fetchRainfall() {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=13.0827&longitude=80.2707&hourly=precipitation&forecast_days=7"
        );
        const data = await response.json();

        if (data.hourly) {
          const hourly = data.hourly;
          const formatted = hourly.time.map((t, i) => ({
            datetime: t,
            time: t.slice(11, 16),
            date: t.slice(0, 10),
            rainfall: hourly.precipitation[i],
          }));
          setRainData(formatted);

          // Flood risk index
          const today = formatted.filter((d) => d.date === formatted[0].date);
          const avgRainfall =
            today.reduce((acc, curr) => acc + curr.rainfall, 0) / today.length;
          setRiskIndex(Math.min(100, Math.round(avgRainfall * 15)));

          // Alert days
          const groupedDays = {};
          formatted.forEach((d) => {
            groupedDays[d.date] = (groupedDays[d.date] || 0) + d.rainfall;
          });
          const alerts = Object.entries(groupedDays)
            .filter(([_, rain]) => rain > 10)
            .map(([date]) => date);
          setAlertDays(alerts);
        }
      } catch (error) {
        console.error("Failed to fetch rainfall data:", error);
      }
    }
    fetchRainfall();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        margin: "0 auto",
        padding: "24px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f4f6f9",
      }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#151a35",
          color: "white",
          border: "none",
          borderRadius: 8,
          padding: "8px 16px",
          cursor: "pointer",
          marginBottom: "20px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: "center",
          marginBottom: 32,
          fontWeight: "bold",
          fontSize: 28,
          color: "#151a35",
        }}
      >
        🌊 Chennai Flood Analysis Dashboard
      </motion.h1>

      {/* Responsive Grid for Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Flood Risk Index */}
        <Card title="Flood Risk Index">
          <progress
            max={100}
            value={riskIndex}
            style={{ width: "100%", height: 20, borderRadius: 12 }}
          />
          <p
            style={{
              fontWeight: "600",
              fontSize: 18,
              marginTop: 12,
              color:
                riskIndex > 70
                  ? "#d9534f"
                  : riskIndex > 40
                  ? "#f0ad4e"
                  : "#5cb85c",
            }}
          >
            Current flood risk is {riskIndex}%
          </p>
        </Card>

        {/* Rainfall Forecast */}
        <Card title="7-Day Rainfall Forecast (hourly)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={rainData.slice(0, 48)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" minTickGap={10} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rainfall" fill="#3399ff" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* River Discharge */}
        <Card title="River Discharge Level (Demo Data)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={riverData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="level" stroke="#1f8ceb" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Alerts Calendar */}
        <Card title="Rainfall Alert Calendar">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 8,
              textAlign: "center",
            }}
          >
            {[...new Set(rainData.map((d) => d.date))].map((date) => (
              <motion.div
                key={date}
                whileHover={{ scale: 1.1 }}
                style={{
                  backgroundColor: alertDays.includes(date)
                    ? "#ff6b6b"
                    : "#dbe9ff",
                  color: alertDays.includes(date) ? "#fff" : "#3a4a6f",
                  padding: 10,
                  borderRadius: 12,
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {date}
              </motion.div>
            ))}
          </div>
          <p
            style={{
              marginTop: 12,
              fontSize: 14,
              color: "#666",
              fontStyle: "italic",
            }}
          >
            Dates highlighted in red indicate high rainfall alert days (over
            10mm).
          </p>
        </Card>

        {/* Relief Centers */}
        <Card title="Nearby Relief Centers">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
              marginTop: 12,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#e6f0ff" }}>
                <th
                  style={{
                    padding: 10,
                    borderBottom: "2px solid #a1b5ff",
                    textAlign: "left",
                  }}
                >
                  Center Name
                </th>
                <th
                  style={{
                    padding: 10,
                    borderBottom: "2px solid #a1b5ff",
                    textAlign: "left",
                  }}
                >
                  Location
                </th>
                <th
                  style={{
                    padding: 10,
                    borderBottom: "2px solid #a1b5ff",
                    textAlign: "right",
                  }}
                >
                  Capacity
                </th>
              </tr>
            </thead>
            <tbody>
              {reliefCenters.map(({ name, location, capacity }, i) => (
                <motion.tr
                  key={i}
                  whileHover={{ backgroundColor: "#f0f6ff" }}
                  style={{ borderBottom: "1px solid #c0c7ff" }}
                >
                  <td style={{ padding: 12 }}>{name}</td>
                  <td style={{ padding: 12 }}>{location}</td>
                  <td style={{ padding: 12, textAlign: "right" }}>{capacity}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Safety Tips */}
        <Card title="Safety Tips">
          <ul style={{ lineHeight: "1.8" }}>
            <li>Avoid travel through flooded or low-lying areas during rain.</li>
            <li>Prepare emergency supplies (water, food, first-aid).</li>
            <li>Stay informed on official updates.</li>
            <li>Follow evacuation orders immediately if issued.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
