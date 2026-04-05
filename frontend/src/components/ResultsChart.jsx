import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const chartContainer = {
  background: "var(--bg-panel)",
  borderRadius: 12,
  padding: "1.5rem",
  marginBottom: "1rem",
};

export default function ResultsChart({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div>
      <div style={chartContainer}>
        <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Weight Trend (kg)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={results}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#94a3b8" label={{ value: "Day", position: "insideBottom", offset: -5, fill: "#94a3b8" }} />
            <YAxis stroke="#94a3b8" domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="predicted_weight" stroke="#3b82f6" strokeWidth={2} dot={false} name="Weight (kg)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={chartContainer}>
        <h3 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Energy Score</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={results}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#94a3b8" label={{ value: "Day", position: "insideBottom", offset: -5, fill: "#94a3b8" }} />
            <YAxis stroke="#94a3b8" domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="energy_score" stroke="#22c55e" strokeWidth={2} dot={false} name="Energy (0-100)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
