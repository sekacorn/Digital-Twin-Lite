import React, { useState, useId } from "react";
import HudPanel from "./HudPanel";

const inputStyle = {
  padding: "0.45rem 0.6rem",
  borderRadius: 3,
  border: "1px solid rgba(0, 240, 255, 0.13)",
  background: "rgba(0, 240, 255, 0.03)",
  color: "var(--text-primary)",
  fontFamily: "'Orbitron', monospace",
  fontSize: "0.85rem",
  width: "100%",
  outline: "none",
};

const labelStyle = {
  fontSize: "0.65rem",
  color: "var(--text-label)",
  letterSpacing: "1px",
  textTransform: "uppercase",
  marginBottom: 3,
  fontFamily: "'Rajdhani', sans-serif",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

function clampNumber(val, min, max, fallback) {
  const n = Number(val);
  if (isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export default function InputForm({ onSubmit, loading }) {
  const [calories, setCalories] = useState(2000);
  const [sleepHours, setSleepHours] = useState(7);
  const [exerciseMinutes, setExerciseMinutes] = useState(30);
  const [waterLiters, setWaterLiters] = useState(2.5);
  const [currentWeight, setCurrentWeight] = useState(80);
  const [periodDays, setPeriodDays] = useState(30);
  const formId = useId();

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
      calories: clampNumber(calories, 100, 10000, 2000),
      sleep_hours: clampNumber(sleepHours, 0, 24, 7),
      exercise_minutes: clampNumber(exerciseMinutes, 0, 1440, 30),
      water_liters: clampNumber(waterLiters, 0, 20, 2.5),
      current_weight: clampNumber(currentWeight, 31, 500, 80),
    };
    onSubmit(data, Number(periodDays));
  }

  return (
    <HudPanel title="Habit Input" accentColor="var(--accent-cyan)">
      <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div style={fieldStyle}>
          <label htmlFor={`${formId}-cal`} style={labelStyle}>Calories (kcal)</label>
          <input id={`${formId}-cal`} type="number" style={inputStyle} value={calories} onChange={(e) => setCalories(Number(e.target.value))} min={100} max={10000} />
        </div>
        <div style={fieldStyle}>
          <label htmlFor={`${formId}-sleep`} style={labelStyle}>Sleep (hours)</label>
          <input id={`${formId}-sleep`} type="number" style={inputStyle} value={sleepHours} onChange={(e) => setSleepHours(Number(e.target.value))} min={0} max={24} step={0.5} />
        </div>
        <div style={fieldStyle}>
          <label htmlFor={`${formId}-exercise`} style={labelStyle}>Exercise (min)</label>
          <input id={`${formId}-exercise`} type="number" style={inputStyle} value={exerciseMinutes} onChange={(e) => setExerciseMinutes(Number(e.target.value))} min={0} max={1440} />
        </div>
        <div style={fieldStyle}>
          <label htmlFor={`${formId}-water`} style={labelStyle}>Water (liters)</label>
          <input id={`${formId}-water`} type="number" style={inputStyle} value={waterLiters} onChange={(e) => setWaterLiters(Number(e.target.value))} min={0} max={20} step={0.1} />
        </div>
        <div style={fieldStyle}>
          <label htmlFor={`${formId}-weight`} style={labelStyle}>Weight (kg)</label>
          <input id={`${formId}-weight`} type="number" style={inputStyle} value={currentWeight} onChange={(e) => setCurrentWeight(Number(e.target.value))} min={31} max={500} step={0.1} />
        </div>
        <div style={fieldStyle}>
          <label htmlFor={`${formId}-period`} style={labelStyle}>Period</label>
          <select id={`${formId}-period`} style={inputStyle} value={periodDays} onChange={(e) => setPeriodDays(Number(e.target.value))}>
            <option value={7}>7 DAYS</option>
            <option value={30}>30 DAYS</option>
            <option value={90}>90 DAYS</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1", marginTop: "0.25rem" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.6rem",
              border: "1px solid rgba(0, 240, 255, 0.4)",
              borderRadius: 3,
              background: loading ? "rgba(0,240,255,0.05)" : "rgba(0,240,255,0.1)",
              color: "var(--accent-cyan)",
              fontFamily: "'Orbitron', monospace",
              fontSize: "0.75rem",
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: loading ? "wait" : "pointer",
              transition: "all 0.3s",
              boxShadow: loading ? "none" : "0 0 15px rgba(0,240,255,0.15)",
            }}
          >
            {loading ? "[ SIMULATING... ]" : "[ RUN SIMULATION ]"}
          </button>
        </div>
      </form>
    </HudPanel>
  );
}
