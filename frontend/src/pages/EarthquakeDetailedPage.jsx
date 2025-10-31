import PublicIcon from "@mui/icons-material/Public";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

const tabDataTemplate = [
  { label: "7 Days Hourly", icon: <PublicIcon /> },
  { label: "7 Days Daily", icon: <ShowChartIcon /> },
];

// Styled TabPanel for tab content
const TabPanel = ({ children, value, index }) => {
  return value === index ? (
    <Paper
      elevation={3}
      sx={{ p: 3, width: "100%", borderRadius: "12px" }}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </Paper>
  ) : null;
};

export default function VerticalEarthquakeTabs({ latitude = 13.0827, longitude = 80.2707 }) {
  const [value, setValue] = React.useState(0);
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [error, setError] = useState("");
  const [noEarthquakes, setNoEarthquakes] = useState(false);

  const handleChange = (_event, newValue) => setValue(newValue);

  useEffect(() => {
    async function fetchEarthquakeData() {
      try {
        const resp = await fetch(
          `/api/real-time-earthquake?latitude=${latitude}&longitude=${longitude}`
        );
        if (!resp.ok) throw new Error(`API error ${resp.status}`);
        const json = await resp.json();

        if (
          json.earthquake_predictions &&
          json.earthquake_predictions.length > 0
        ) {
          setNoEarthquakes(false);
          setHourlyData(json.earthquake_predictions.slice(0, 5));
          setDailyData(json.earthquake_predictions.slice(0, 5));
          setError("");
        } else {
          // No recent earthquakes for location
          setNoEarthquakes(true);
          setHourlyData([]);
          setDailyData([]);
          setError("");
        }
      } catch (err) {
        setNoEarthquakes(false);
        setHourlyData([]);
        setDailyData([]);
        setError(err.message);
      }
    }
    fetchEarthquakeData();
  }, [latitude, longitude]);

  const regionalRiskLabel = noEarthquakes
    ? "Low Risk (No recent activity)"
    : hourlyData.length > 0
    ? "Seismic activity detected"
    : "";

  const regionalRiskColor = noEarthquakes ? "#5ECC7A" : "#f3c13a";

  return (
    <Box
      sx={{
        display: "flex",
        maxWidth: 1200,
        margin: "auto",
        padding: 4,
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Tabs Sidebar */}
      <Tabs
        orientation="vertical"
        value={value}
        onChange={handleChange}
        sx={{
          borderRight: 1,
          borderColor: "divider",
          minWidth: 180,
        }}
        aria-label="Earthquake data time ranges"
      >
        {tabDataTemplate.map((tab, i) => (
          <Tab
            key={i}
            icon={tab.icon}
            iconPosition="start"
            label={tab.label}
            sx={{
              alignItems: "flex-start",
              textTransform: "none",
              fontWeight: value === i ? "bold" : "normal",
              padding: "18px 24px",
              fontSize: "16px",
            }}
            id={`vertical-tab-${i}`}
            aria-controls={`vertical-tabpanel-${i}`}
          />
        ))}
      </Tabs>

      {/* Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          paddingLeft: { md: 4, xs: 0 },
          marginTop: { xs: 2, md: 0 },
        }}
      >
        {error ? (
          <Typography color="error" sx={{ p: 3 }}>
            Error: {error}
          </Typography>
        ) : noEarthquakes ? (
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 2,
              textAlign: "center",
              background: "#f5f7fa",
              borderRadius: "12px",
              border: "1.5px solid #e1e7ef",
              maxWidth: 590,
              margin: "auto",
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 56, color: "#5ECC7A", mb: 1 }} />
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "#4caf50", mt: 1 }}
            >
              No Recent Earthquakes Detected
            </Typography>
            <Typography sx={{ color: "#667", fontSize: 17, mt: 1, mb: 2 }}>
              There have been no recent earthquakes detected in the specified area.
            </Typography>
            <Typography sx={{ color: "#888", fontSize: 15 }}>
              Try adjusting your search area or check out these preparation tips:
            </Typography>
            <Box sx={{ mt: 3, textAlign: "left" }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 1, color: "#4c6283" }}
              >
                Earthquake Safety Tips:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 24, textAlign: "left" }}>
                <li>Secure heavy furniture and objects.</li>
                <li>Prepare an emergency kit with essentials.</li>
                <li>Plan safe exits and meeting spots.</li>
              </ul>
            </Box>
          </Paper>
        ) : (
          <>
            {/* Regional Risk Summary */}
            <Typography
              variant="h6"
              sx={{ mb: 2, color: regionalRiskColor, fontWeight: "bold" }}
            >
              {regionalRiskLabel}
            </Typography>
            {/* Tab Panels */}
            {tabDataTemplate.map((tab, i) => (
              <TabPanel key={i} value={value} index={i}>
                <Typography variant="h5" gutterBottom>
                  {tab.label}
                </Typography>
                {(i === 0 ? hourlyData : dailyData).map((eq, ix) => (
                  <Box
                    key={ix}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: "1px solid #ccc",
                      borderRadius: 2,
                    }}
                  >
                    <Typography>
                      <b>ID:</b> {eq.earthquake_id}
                    </Typography>
                    <Typography>
                      <b>Prediction:</b> {eq.prediction}
                    </Typography>
                    <Typography>
                      <b>Probability:</b> {(eq.probability * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                ))}
                {(i === 0 ? hourlyData : dailyData).length === 0 && (
                  <Typography>No earthquake data available.</Typography>
                )}
              </TabPanel>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
}
