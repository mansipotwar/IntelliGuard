import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

// Single COLORS declaration for all charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4567"];

// Static data definitions (only once)
const kpiData = {
  totalHurricanes: 12,
  totalMajor: 5,
  highestWindSpeed: 250,
};

const monthlyTrendData = [
  { month: "Jan", hurricanes: 1 },
  { month: "Feb", hurricanes: 0 },
  { month: "Mar", hurricanes: 1 },
  { month: "Apr", hurricanes: 0 },
  { month: "May", hurricanes: 3 },
  { month: "Jun", hurricanes: 4 },
  { month: "Jul", hurricanes: 6 },
  { month: "Aug", hurricanes: 8 },
  { month: "Sep", hurricanes: 3 },
  { month: "Oct", hurricanes: 2 },
  { month: "Nov", hurricanes: 1 },
  { month: "Dec", hurricanes: 0 },
];

const categoryBreakdown = [
  { category: "Category 1", count: 3 },
  { category: "Category 2", count: 2 },
  { category: "Category 3", count: 2 },
  { category: "Category 4", count: 3 },
  { category: "Category 5", count: 2 },
];

const riskPopulation = [
  { riskZone: "High", population: 1200000 },
  { riskZone: "Medium", population: 600000 },
  { riskZone: "Low", population: 300000 },
];

const landfallData = [
  { region: "Florida", storms: 4 },
  { region: "Louisiana", storms: 3 },
  { region: "Texas", storms: 2 },
  { region: "North Carolina", storms: 1 },
  { region: "Other", storms: 2 },
];

const disruptionData = [
  { sector: "Energy", disruption: 50000 },
  { sector: "Transport", disruption: 30000 },
  { sector: "Water Supply", disruption: 20000 },
  { sector: "Communication", disruption: 15000 },
  { sector: "Healthcare", disruption: 10000 },
];

const economicLosses = [
  { sector: "Agriculture", value: 120 },
  { sector: "Energy", value: 90 },
  { sector: "Residential Homes", value: 200 },
  { sector: "Business", value: 80 },
];

const stormDurationImpact = [
  { durationDays: 1, areaAffected: 100, personsImpacted: 2000 },
  { durationDays: 2, areaAffected: 230, personsImpacted: 4500 },
  { durationDays: 3, areaAffected: 400, personsImpacted: 7000 },
  { durationDays: 4, areaAffected: 600, personsImpacted: 10000 },
];

const historicHurricanes = [
  { name: "Hurricane Katrina", category: 5, deaths: 1833, damageBillionUSD: 125 },
  { name: "Hurricane Harvey", category: 4, deaths: 100, damageBillionUSD: 125 },
  { name: "Hurricane Maria", category: 5, deaths: 2975, damageBillionUSD: 91 },
  { name: "Hurricane Ike", category: 4, deaths: 195, damageBillionUSD: 38 },
];

const demographicsAffected = [
  { group: "Children", count: 12000 },
  { group: "Adults", count: 45000 },
  { group: "Elderly", count: 7500 },
];

// KPI card component
function KPI({ label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        flex: 1,
        margin: "0 10px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      <h3 style={{ fontSize: 28, margin: 0, color: "#007acc" }}>{value}</h3>
      <p style={{ marginTop: 5, fontWeight: "600", fontSize: 16, color: "#555" }}>{label}</p>
    </div>
  );
}

export default function HurricaneAnalysisDashboard() {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "auto",
        padding: 24,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: 32,
          fontWeight: 900,
          color: "#004a99",
        }}
      >
        Hurricane Monitoring & Impact Dashboard
      </h1>

      {/* KPI Section */}
      <section style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
        <KPI label="Total Hurricanes" value={kpiData.totalHurricanes} />
        <KPI label="Total Major Hurricanes" value={kpiData.totalMajor} />
        <KPI label="Highest Wind Speed (km/h)" value={kpiData.highestWindSpeed} />
      </section>

      {/* Monthly Trend Bar Chart */}
      <section
        style={{
          marginBottom: 40,
          background: "#fff",
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginBottom: 16, color: "#007acc" }}>Monthly Hurricane Events Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hurricanes" fill="#007acc" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Category Breakdown & Landfall */}
      <section style={{ display: "flex", gap: 24, marginBottom: 40 }}>
        <div
          style={{
            flex: 1,
            background: "#fff",
            padding: 24,
            borderRadius: 16,
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ marginBottom: 16, color: "#007acc" }}>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryBreakdown} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#ff6600" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            flex: 1,
            background: "#fff",
            padding: 24,
            borderRadius: 16,
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ marginBottom: 16, color: "#007acc" }}>Monthly/Region-wise Landfall</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={landfallData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="storms" fill="#0066cc" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Population Affected Donut Chart */}
      <section
        style={{
          marginBottom: 40,
          padding: 24,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        <h3 style={{ marginBottom: 16, color: "#007acc", textAlign: "center" }}>
          Population Affected by Risk Zone
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={riskPopulation}
              dataKey="population"
              nameKey="riskZone"
              outerRadius={100}
              fill="#0088FE"
              label
            >
              {riskPopulation.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>

      {/* Disruption & Losses */}
      <section style={{ display: "flex", gap: 24, marginBottom: 40 }}>
        <div
          style={{
            flex: 1,
            background: "#fff",
            padding: 24,
            borderRadius: 16,
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ marginBottom: 16, color: "#007acc" }}>Disruption to Sectors</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={disruptionData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="sector" type="category" />
              <Tooltip />
              <Bar dataKey="disruption" fill="#cc3300" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            flex: 1,
            background: "#fff",
            padding: 24,
            borderRadius: 16,
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ marginBottom: 16, color: "#007acc" }}>Economic/Sectoral Losses (in $M)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={economicLosses}
                dataKey="value"
                nameKey="sector"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {economicLosses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Storm Duration vs Area & Persons Affected Table */}
      <section style={{ marginBottom: 40 }}>
        <h3 style={{ color: "#007acc", marginBottom: 16 }}>
          Storm Duration vs. Area and Persons Affected
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          <thead style={{ background: "#f0f8ff" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left" }}>Duration (Days)</th>
              <th style={{ padding: 12, textAlign: "left" }}>Area Affected (km²)</th>
              <th style={{ padding: 12, textAlign: "left" }}>Persons Impacted</th>
            </tr>
          </thead>
          <tbody>
            {stormDurationImpact.map(({ durationDays, areaAffected, personsImpacted }, i) => (
              <tr
                key={i}
                style={{ borderBottom: i < stormDurationImpact.length - 1 ? "1px solid #ddd" : "none" }}
              >
                <td style={{ padding: 12 }}>{durationDays}</td>
                <td style={{ padding: 12 }}>{areaAffected}</td>
                <td style={{ padding: 12 }}>{personsImpacted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Historic Major Hurricanes Table */}
      <section style={{ marginBottom: 40 }}>
        <h3 style={{ color: "#007acc", marginBottom: 16 }}>Historic Major Hurricanes</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          <thead style={{ background: "#f0f8ff" }}>
            <tr>
              <th style={{ padding: 12, textAlign: "left" }}>Name</th>
              <th style={{ padding: 12, textAlign: "left" }}>Category</th>
              <th style={{ padding: 12, textAlign: "left" }}>Deaths</th>
              <th style={{ padding: 12, textAlign: "left" }}>Damage ($ Billion)</th>
            </tr>
          </thead>
          <tbody>
            {historicHurricanes.map(({ name, category, deaths, damageBillionUSD }, i) => (
              <tr
                key={i}
                style={{ borderBottom: i < historicHurricanes.length - 1 ? "1px solid #ddd" : "none" }}
              >
                <td style={{ padding: 12 }}>{name}</td>
                <td style={{ padding: 12 }}>{category}</td>
                <td style={{ padding: 12 }}>{deaths}</td>
                <td style={{ padding: 12 }}>{damageBillionUSD}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Demographics Affected Bar Chart */}
      <section style={{ marginBottom: 40 }}>
        <h3 style={{ marginBottom: 16, color: "#007acc" }}>Demographics Affected</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            layout="vertical"
            data={demographicsAffected}
            margin={{ left: 80, right: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="group" />
            <Tooltip />
            <Bar dataKey="count" fill="#007acc" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
