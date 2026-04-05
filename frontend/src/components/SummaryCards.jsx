import React from "react";

const cardStyle = {
  background: "#1e293b",
  borderRadius: 12,
  padding: "1.25rem",
  textAlign: "center",
};

const valueStyle = {
  fontSize: "1.8rem",
  fontWeight: 700,
  color: "#f1f5f9",
};

const labelStyle = {
  fontSize: "0.8rem",
  color: "#94a3b8",
  marginTop: 4,
};

export default function SummaryCards({ summary, periodDays }) {
  if (!summary) return null;
  const weightColor = summary.weight_change < 0 ? "#22c55e" : summary.weight_change > 0 ? "#ef4444" : "#94a3b8";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1rem",
        margin: "1.5rem 0",
      }}
    >
      <div style={cardStyle}>
        <div style={valueStyle}>{summary.final_weight} kg</div>
        <div style={labelStyle}>Predicted Weight (Day {periodDays})</div>
      </div>

      <div style={cardStyle}>
        <div style={{ ...valueStyle, color: weightColor }}>
          {summary.weight_change > 0 ? "+" : ""}
          {summary.weight_change} kg
        </div>
        <div style={labelStyle}>Weight Change</div>
      </div>

      <div style={cardStyle}>
        <div style={{ ...valueStyle, color: "#3b82f6" }}>{summary.avg_energy}</div>
        <div style={labelStyle}>Avg Energy Score</div>
      </div>
    </div>
  );
}
