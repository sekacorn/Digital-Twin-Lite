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
 * A single HUD data readout line — label + value with optional unit and color.
 */
export default function DataReadout({ label, value, unit = "", color = "var(--accent-cyan)", size = "normal" }) {
  const fontSize = size === "large" ? "1.6rem" : "1.1rem";
  const hex = resolveColor(color);

  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <div style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: "0.7rem",
        color: "var(--text-label)",
        letterSpacing: "1px",
        textTransform: "uppercase",
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize,
        color: hex,
        fontWeight: 600,
        animation: "data-flicker 4s infinite",
        textShadow: `0 0 10px ${hex}66`,
      }}>
        {value}
        {unit && <span style={{ fontSize: "0.7em", marginLeft: 4, color: "var(--text-dim)" }}>{unit}</span>}
      </div>
    </div>
  );
}
