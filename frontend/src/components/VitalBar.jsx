import React from "react";

const CSS_VAR_TO_HEX = {
  "var(--accent-cyan)": "#00f0ff",
  "var(--accent-green)": "#00ff88",
  "var(--accent-red)": "#ff3366",
  "var(--accent-yellow)": "#ffaa00",
  "var(--accent-purple)": "#aa44ff",
};

function resolveColor(color) {
  return CSS_VAR_TO_HEX[color] || color;
}

/**
 * Horizontal progress bar styled like a HUD vital sign.
 */
export default function VitalBar({ label, value, max = 100, color = "var(--accent-cyan)" }) {
  const safeMax = max > 0 ? max : 100;
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));
  const hex = resolveColor(color);

  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.7rem",
        color: "var(--text-label)",
        letterSpacing: "1px",
        textTransform: "uppercase",
        marginBottom: 3,
      }}>
        <span>{label}</span>
        <span style={{ fontFamily: "'Orbitron', monospace", color: "var(--text-primary)", fontSize: "0.65rem" }}>
          {typeof value === "number" && !isNaN(value) ? value.toFixed(1) : "0.0"}
        </span>
      </div>
      <div style={{
        height: 4,
        background: "rgba(255,255,255,0.05)",
        borderRadius: 2,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${hex}88, ${hex})`,
          borderRadius: 2,
          boxShadow: `0 0 8px ${hex}66`,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}
