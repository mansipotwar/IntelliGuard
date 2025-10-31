import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Dummy earthquake data with enriched fields
const earthquakeEvents = [
  { id: 1, date: "2023-09-10", year: 2023, place: "Japan", magnitude: 6.8, deaths: 120, tsunami: true },
  { id: 2, date: "2022-08-25", year: 2022, place: "Indonesia", magnitude: 7.4, deaths: 200, tsunami: false },
  { id: 3, date: "2021-05-12", year: 2021, place: "Nepal", magnitude: 7.1, deaths: 150, tsunami: false },
  { id: 4, date: "2020-01-07", year: 2020, place: "Turkey", magnitude: 6.2, deaths: 70, tsunami: false },
  { id: 5, date: "2019-03-14", year: 2019, place: "Chile", magnitude: 7.5, deaths: 300, tsunami: true },
  { id: 6, date: "2018-11-20", year: 2018, place: "California", magnitude: 5.8, deaths: 8, tsunami: false },
];

// Magnitude buckets for distribution
const magnitudeBuckets = [
  { label: "Minor (<4.0)", range: [0, 3.9] },
  { label: "Light (4.0-4.9)", range: [4.0, 4.9] },
  { label: "Moderate (5.0-5.9)", range: [5.0, 5.9] },
  { label: "Strong (6.0-6.9)", range: [6.0, 6.9] },
  { label: "Major (7.0+)", range: [7.0, 10.0] },
];

// Unique places for filter dropdown
const uniquePlaces = Array.from(new Set(earthquakeEvents.map((e) => e.place))).sort();

export default function EarthquakeAnalysisPage() {
  const navigate = useNavigate();

  // Filters state
  const [yearRange, setYearRange] = useState([2018, 2023]);
  const [selectedPlace, setSelectedPlace] = useState("");
  const [tsunamiFilter, setTsunamiFilter] = useState("all"); // all, yes, no
  const [magRange, setMagRange] = useState([0, 10]);

  const filteredEvents = useMemo(() => {
    return earthquakeEvents.filter((ev) => {
      const inYearRange = ev.year >= yearRange[0] && ev.year <= yearRange[1];
      const inPlace = selectedPlace === "" || ev.place === selectedPlace;
      const tsunamiMatch =
        tsunamiFilter === "all" ||
        (tsunamiFilter === "yes" && ev.tsunami) ||
        (tsunamiFilter === "no" && !ev.tsunami);
      const magMatch = ev.magnitude >= magRange[0] && ev.magnitude <= magRange[1];
      return inYearRange && inPlace && tsunamiMatch && magMatch;
    });
  }, [yearRange, selectedPlace, tsunamiFilter, magRange]);

  // Aggregate deaths by magnitude bucket
  const deathsByMagnitude = useMemo(() => {
    return magnitudeBuckets.map(({ label, range }) => {
      const deaths = filteredEvents.reduce((sum, ev) => {
        if (ev.magnitude >= range[0] && ev.magnitude <= range[1]) {
          return sum + ev.deaths;
        }
        return sum;
      }, 0);
      return { label, deaths };
    });
  }, [filteredEvents]);

  // Aggregate deaths by country/place (top 5)
  const deathsByCountry = useMemo(() => {
    const map = {};
    filteredEvents.forEach((ev) => {
      map[ev.place] = (map[ev.place] || 0) + ev.deaths;
    });
    return Object.entries(map)
      .map(([place, deaths]) => ({ place, deaths }))
      .sort((a, b) => b.deaths - a.deaths)
      .slice(0, 5);
  }, [filteredEvents]);

  // Trend data: count per year
  const trendData = useMemo(() => {
    const years = Array.from({ length: yearRange[1] - yearRange[0] + 1 }, (_, i) => yearRange[0] + i);
    return years.map((year) => ({
      year,
      count: filteredEvents.filter((ev) => ev.year === year).length,
    }));
  }, [filteredEvents, yearRange]);

  // Key stats
  const totalQuakes = filteredEvents.length;
  const totalDeaths = filteredEvents.reduce((sum, ev) => sum + ev.deaths, 0);
  const avgMagnitude =
    filteredEvents.length > 0
      ? (filteredEvents.reduce((sum, ev) => sum + ev.magnitude, 0) / filteredEvents.length).toFixed(2)
      : 0;

  // Filter handlers
  const handleYearChange = (e, bound) => {
    const val = Number(e.target.value);
    setYearRange((r) =>
      bound === "min" ? [Math.min(val, r[1]), r[1]] : [r[0], Math.max(val, r[0])]
    );
  };
  const handleMagChange = (e, bound) => {
    const val = Number(e.target.value);
    setMagRange((r) =>
      bound === "min" ? [Math.min(val, r[1]), r[1]] : [r[0], Math.max(val, r[0])]
    );
  };

  return (
    <div style={{ fontFamily: "Segoe UI, Arial, sans-serif", background: "#fff", color: "#222", minHeight: "100vh", maxWidth: 1240, margin: "0 auto", padding: "20px 24px 40px" }}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "#eceffe",
          border: "none",
          borderRadius: 20,
          color: "#314489",
          padding: "10px 32px",
          fontSize: 16,
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: 20,
          boxShadow: "0 3px 10px rgba(49, 74, 156, 0.15)",
          transition: "background-color 0.25s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#d5ddfb")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#eceffe")}
      >
        ← Back
      </button>

      {/* Header */}
      <div style={{ borderBottom: "1.5px solid #222", paddingBottom: 8, marginBottom: 12 }}>
        <h1 style={{ fontWeight: "900", fontSize: "2.1rem", margin: 0, letterSpacing: 1 }}>#Earthquake Detailed Analysis</h1>
        <span style={{ fontSize: 14, color: "#7683a1", letterSpacing: 2, marginTop: 4, display: "inline-block" }}>
          OVERVIEW & FILTERS
        </span>
      </div>

      {/* Filters */}
      <section style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 28, fontSize: 14, fontWeight: 600 }}>
        <div>
          <label>Year Range:</label>
          <br />
          <input type="number" min={1900} max={yearRange[1]} value={yearRange[0]} onChange={(e) => handleYearChange(e, "min")} style={{ width: 70, marginRight: 6 }} />
          -
          <input type="number" min={yearRange[0]} max={new Date().getFullYear()} value={yearRange[1]} onChange={(e) => handleYearChange(e, "max")} style={{ width: 70, marginLeft: 6 }} />
        </div>

        <div>
          <label>Region:</label>
          <br />
          <select value={selectedPlace} onChange={(e) => setSelectedPlace(e.target.value)} style={{ padding: "4px 8px" }}>
            <option value="">All</option>
            {uniquePlaces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Tsunami:</label>
          <br />
          <select value={tsunamiFilter} onChange={(e) => setTsunamiFilter(e.target.value)} style={{ padding: "4px 8px" }}>
            <option value="all">All</option>
            <option value="yes">Has Tsunami</option>
            <option value="no">No Tsunami</option>
          </select>
        </div>

        <div style={{ minWidth: 160 }}>
          <label>Magnitude Range:</label>
          <br />
          <input type="number" min={0} max={magRange[1]} step="0.1" value={magRange[0]} onChange={(e) => handleMagChange(e, "min")} style={{ width: 70, marginRight: 6 }} />
          -
          <input type="number" min={magRange[0]} max={10} step="0.1" value={magRange[1]} onChange={(e) => handleMagChange(e, "max")} style={{ width: 70, marginLeft: 6 }} />
        </div>
      </section>

      {/* Metrics */}
      <section style={{ display: "flex", gap: 38, flexWrap: "wrap", marginBottom: 18 }}>
        <Metric label="Total Earthquakes" value={totalQuakes} />
        <Metric label="Avg Magnitude (Filtered)" value={avgMagnitude} />
        <Metric label="Total Deaths (Filtered)" value={totalDeaths} />
      </section>

      {/* Charts & Table */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 30, marginTop: 18, marginBottom: 40 }}>
        <Card title="Deaths by Earthquake Magnitude">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deathsByMagnitude} margin={{ top: 10, right: 30, bottom: 5, left: 0 }}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="deaths" fill="#f39c12" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Deaths by Country (Top 5)">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deathsByCountry} margin={{ top: 10, right: 30, bottom: 5, left: 0 }}>
              <XAxis dataKey="place" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="deaths" fill="#27ae60" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Earthquake Trend Over Years">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData} margin={{ top: 10, right: 30, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#e74c3c" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top 5 Deadliest Earthquake Events (Bubble Chart)">
          <p style={{ textAlign: "center", paddingTop: 80, color: "#888" }}>
            Bubble chart placeholder - implement using recharts ScatterChart or other lib.
          </p>
        </Card>
      </section>

      <Card title="Major Earthquakes Timeline" span={2}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: 8 }}>Date</th>
              <th style={{ padding: 8 }}>Location</th>
              <th style={{ padding: 8 }}>Magnitude</th>
              <th style={{ padding: 8 }}>Deaths</th>
              <th style={{ padding: 8 }}>Tsunami</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((ev) => (
              <tr key={ev.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: 8 }}>{ev.date}</td>
                <td style={{ padding: 8 }}>{ev.place}</td>
                <td style={{ padding: 8 }}>{ev.magnitude.toFixed(1)}</td>
                <td style={{ padding: 8 }}>{ev.deaths}</td>
                <td style={{ padding: 8 }}>{ev.tsunami ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ minWidth: 140 }}>
      <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 1, lineHeight: 1, color: "#15497a" }}>
        {value}
      </div>
      <div style={{ opacity: 0.75, fontSize: 14, marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Card({ title, children, span }) {
  return (
    <div
      style={{
        gridColumn: span ? `span ${span}` : "span 1",
        background: "#f7fbff",
        borderRadius: 14,
        padding: 24,
        boxShadow: "0 6px 15px rgb(15 46 81 / 0.1)",
        minHeight: 160,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        marginTop: 16,
      }}
    >
      <div style={{ fontWeight: "700", fontSize: 18, marginBottom: 16, color: "#11457e" }}>{title}</div>
      {children}
    </div>
  );
}
