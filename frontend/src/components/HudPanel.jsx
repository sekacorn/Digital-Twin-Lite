import React, { useMemo } from "react";

/**
 * Map CSS variable names to their hex values for use in opacity concatenation.
 */
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
 * Reusable HUD-style panel with glowing border and title.
 */
export default function HudPanel({ title, children, style = {}, accentColor = "var(--accent-cyan)" }) {
  const hex = useMemo(() => resolveColor(accentColor), [accentColor]);

  return (
    <div
      style={{
        background: "var(--bg-panel)",
        border: `1px solid ${hex}33`,
        borderRadius: 4,
        padding: "1rem",
        position: "relative",
        backdropFilter: "blur(10px)",
        ...style,
      }}
    >
      {/* Top-left corner accent */}
      <div style={{
        position: "absolute",
        top: -1,
        left: -1,
        width: 20,
        height: 20,
        borderTop: `2px solid ${hex}`,
        borderLeft: `2px solid ${hex}`,
        borderRadius: "4px 0 0 0",
      }} />
      {/* Bottom-right corner accent */}
      <div style={{
        position: "absolute",
        bottom: -1,
        right: -1,
        width: 20,
        height: 20,
        borderBottom: `2px solid ${hex}`,
        borderRight: `2px solid ${hex}`,
        borderRadius: "0 0 4px 0",
      }} />

      {title && (
        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: "0.65rem",
          color: hex,
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{
            width: 6,
            height: 6,
            background: hex,
            display: "inline-block",
            animation: "pulse-glow 2s infinite",
          }} />
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
