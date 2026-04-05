import React, { useCallback } from "react";

/**
 * Vertical time slider like the "Now -> +5 years" from the Healthcheck app.
 * Shows current day position within the simulation period.
 */
export default function TimeSlider({ currentDay, maxDays, onChange }) {
  const pct = maxDays > 0 ? (currentDay / maxDays) * 100 : 0;

  const handleInteraction = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const ratio = 1 - (y / rect.height);
    const day = Math.max(1, Math.min(maxDays, Math.round(ratio * maxDays)));
    onChange(day);
  }, [maxDays, onChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      onChange(Math.min(maxDays, currentDay + 1));
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(Math.max(1, currentDay - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(1);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(maxDays);
    }
  }, [maxDays, currentDay, onChange]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: "100%",
      minHeight: 300,
      padding: "1rem 0",
      gap: 8,
    }}>
      <span style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: "0.6rem",
        color: "var(--accent-green)",
        letterSpacing: "1px",
      }}>
        +{maxDays}d
      </span>

      {/* Track */}
      <div
        role="slider"
        tabIndex={0}
        aria-label="Projection day"
        aria-valuemin={1}
        aria-valuemax={maxDays}
        aria-valuenow={currentDay}
        onClick={handleInteraction}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          width: 6,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 3,
          position: "relative",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {/* Gradient fill */}
        <div style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: `${pct}%`,
          background: "linear-gradient(to top, var(--accent-cyan), var(--accent-green))",
          borderRadius: 3,
          boxShadow: "0 0 10px rgba(0, 240, 255, 0.27)",
          transition: "height 0.3s ease",
        }} />

        {/* Thumb indicator */}
        <div style={{
          position: "absolute",
          bottom: `calc(${pct}% - 8px)`,
          left: "50%",
          transform: "translateX(-50%)",
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: "2px solid var(--accent-cyan)",
          background: "var(--bg-primary)",
          boxShadow: "0 0 12px rgba(0, 240, 255, 0.53)",
          transition: "bottom 0.3s ease",
          pointerEvents: "none",
        }} />
      </div>

      <span style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: "0.6rem",
        color: "var(--accent-cyan)",
        letterSpacing: "1px",
      }}>
        NOW
      </span>

      {/* Day counter */}
      <div style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: "0.8rem",
        color: "var(--text-primary)",
        textAlign: "center",
        marginTop: 4,
      }}>
        DAY {currentDay}
      </div>
    </div>
  );
}
