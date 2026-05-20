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

const helperStyle = {
  fontSize: "0.62rem",
  color: "var(--text-dim)",
  lineHeight: 1.25,
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "var(--text-label)",
  fontFamily: "'Orbitron', monospace",
  fontSize: "0.65rem",
  letterSpacing: "1px",
  textTransform: "uppercase",
};

const warningListStyle = {
  gridColumn: "1 / -1",
  border: "1px solid rgba(255, 170, 0, 0.35)",
  borderRadius: 4,
  padding: "0.65rem 0.75rem",
  background: "rgba(255, 170, 0, 0.06)",
  color: "var(--text-dim)",
  fontSize: "0.72rem",
  lineHeight: 1.45,
};

function clampNumber(val, min, max, fallback) {
  const n = Number(val);
  if (isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function getInputWarnings(values, prefix = "") {
  const label = prefix ? `${prefix}: ` : "";
  const warnings = [];

  if (values.calories < 1200) {
    warnings.push(`${label}Very low calorie intake can be unsafe for many people.`);
  }
  if (values.calories > 4500) {
    warnings.push(`${label}Very high calorie intake may make projections less representative.`);
  }
  if (values.maintenance_calories < 1400) {
    warnings.push(`${label}Maintenance calories look unusually low. Check the estimate.`);
  }
  if (values.maintenance_calories > 3500) {
    warnings.push(`${label}Maintenance calories look unusually high. Check the estimate.`);
  }
  if (values.sleep_hours < 5) {
    warnings.push(`${label}Low sleep may reduce energy projections and recovery.`);
  }
  if (values.exercise_minutes > 180) {
    warnings.push(`${label}Very high daily exercise may make projections less representative.`);
  }
  if (values.water_liters < 1) {
    warnings.push(`${label}Low hydration can reduce the projected energy score.`);
  }
  if (values.water_liters > 6) {
    warnings.push(`${label}Very high water intake may be unusual. Check the value.`);
  }

  return warnings;
}

export default function InputForm({ onSubmit, loading }) {
  const [calories, setCalories] = useState(2000);
  const [maintenanceCalories, setMaintenanceCalories] = useState(2000);
  const [sleepHours, setSleepHours] = useState(7);
  const [exerciseMinutes, setExerciseMinutes] = useState(30);
  const [waterLiters, setWaterLiters] = useState(2.5);
  const [currentWeight, setCurrentWeight] = useState(80);
  const [periodDays, setPeriodDays] = useState(30);
  const [customEnabled, setCustomEnabled] = useState(false);
  const [customLabel, setCustomLabel] = useState("Custom Plan");
  const [customCalories, setCustomCalories] = useState(1800);
  const [customMaintenanceCalories, setCustomMaintenanceCalories] = useState(2000);
  const [customSleepHours, setCustomSleepHours] = useState(8);
  const [customExerciseMinutes, setCustomExerciseMinutes] = useState(45);
  const [customWaterLiters, setCustomWaterLiters] = useState(3);
  const formId = useId();
  const basePreview = {
    calories,
    maintenance_calories: maintenanceCalories,
    sleep_hours: sleepHours,
    exercise_minutes: exerciseMinutes,
    water_liters: waterLiters,
  };
  const customPreview = {
    calories: customCalories,
    maintenance_calories: customMaintenanceCalories,
    sleep_hours: customSleepHours,
    exercise_minutes: customExerciseMinutes,
    water_liters: customWaterLiters,
  };
  const warnings = [
    ...getInputWarnings(basePreview),
    ...(customEnabled ? getInputWarnings(customPreview, customLabel.trim() || "Custom Plan") : []),
  ];

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
      calories: clampNumber(calories, 100, 10000, 2000),
      maintenance_calories: clampNumber(maintenanceCalories, 800, 6000, 2000),
      sleep_hours: clampNumber(sleepHours, 0, 24, 7),
      exercise_minutes: clampNumber(exerciseMinutes, 0, 1440, 30),
      water_liters: clampNumber(waterLiters, 0, 20, 2.5),
      current_weight: clampNumber(currentWeight, 31, 500, 80),
    };
    const customScenario = customEnabled
      ? {
          label: customLabel.trim() || "Custom Plan",
          habits: {
            calories: clampNumber(customCalories, 100, 10000, data.calories),
            maintenance_calories: clampNumber(customMaintenanceCalories, 800, 6000, data.maintenance_calories),
            sleep_hours: clampNumber(customSleepHours, 0, 24, data.sleep_hours),
            exercise_minutes: clampNumber(customExerciseMinutes, 0, 1440, data.exercise_minutes),
            water_liters: clampNumber(customWaterLiters, 0, 20, data.water_liters),
            current_weight: data.current_weight,
          },
        }
      : null;
    onSubmit(data, Number(periodDays), customScenario);
  }

  return (
    <HudPanel title="Habit Input" accentColor="var(--accent-cyan)">
      <form aria-label="Habit simulation input" onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div style={fieldStyle}>
          <label htmlFor={`${formId}-cal`} style={labelStyle}>Calories Eaten</label>
          <input id={`${formId}-cal`} type="number" style={inputStyle} value={calories} onChange={(e) => setCalories(Number(e.target.value))} min={100} max={10000} />
        </div>
        <div style={fieldStyle}>
          <label htmlFor={`${formId}-maintenance`} style={labelStyle}>Maintenance Calories</label>
          <input id={`${formId}-maintenance`} type="number" style={inputStyle} value={maintenanceCalories} onChange={(e) => setMaintenanceCalories(Number(e.target.value))} min={800} max={6000} aria-describedby={`${formId}-maintenance-help`} />
          <div id={`${formId}-maintenance-help`} style={helperStyle}>Calories needed to maintain weight before logged exercise.</div>
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
            <option value={14}>14 DAYS</option>
            <option value={30}>30 DAYS</option>
            <option value={90}>90 DAYS</option>
            <option value={120}>120 DAYS</option>
            <option value={180}>180 DAYS</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1", borderTop: "1px solid rgba(0, 240, 255, 0.1)", paddingTop: "0.75rem" }}>
          <label htmlFor={`${formId}-custom-enabled`} style={checkboxLabelStyle}>
            <input
              id={`${formId}-custom-enabled`}
              type="checkbox"
              checked={customEnabled}
              onChange={(e) => setCustomEnabled(e.target.checked)}
              style={{ accentColor: "var(--accent-cyan)" }}
            />
            Add Custom Scenario
          </label>
          <div style={{ ...helperStyle, marginTop: 4 }}>
            Compare your own alternate plan against the presets.
          </div>
        </div>

        {customEnabled && (
          <fieldset style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", border: 0, padding: 0, minWidth: 0 }}>
            <legend style={{ ...labelStyle, gridColumn: "1 / -1" }}>Custom Scenario Details</legend>
            <div style={fieldStyle}>
              <label htmlFor={`${formId}-custom-label`} style={labelStyle}>Scenario Name</label>
              <input id={`${formId}-custom-label`} type="text" style={inputStyle} value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} maxLength={40} />
            </div>
            <div style={fieldStyle}>
              <label htmlFor={`${formId}-custom-cal`} style={labelStyle}>Custom Calories</label>
              <input id={`${formId}-custom-cal`} type="number" style={inputStyle} value={customCalories} onChange={(e) => setCustomCalories(Number(e.target.value))} min={100} max={10000} />
            </div>
            <div style={fieldStyle}>
              <label htmlFor={`${formId}-custom-maintenance`} style={labelStyle}>Custom Maintenance</label>
              <input id={`${formId}-custom-maintenance`} type="number" style={inputStyle} value={customMaintenanceCalories} onChange={(e) => setCustomMaintenanceCalories(Number(e.target.value))} min={800} max={6000} />
            </div>
            <div style={fieldStyle}>
              <label htmlFor={`${formId}-custom-sleep`} style={labelStyle}>Custom Sleep</label>
              <input id={`${formId}-custom-sleep`} type="number" style={inputStyle} value={customSleepHours} onChange={(e) => setCustomSleepHours(Number(e.target.value))} min={0} max={24} step={0.5} />
            </div>
            <div style={fieldStyle}>
              <label htmlFor={`${formId}-custom-exercise`} style={labelStyle}>Custom Exercise</label>
              <input id={`${formId}-custom-exercise`} type="number" style={inputStyle} value={customExerciseMinutes} onChange={(e) => setCustomExerciseMinutes(Number(e.target.value))} min={0} max={1440} />
            </div>
            <div style={fieldStyle}>
              <label htmlFor={`${formId}-custom-water`} style={labelStyle}>Custom Water</label>
              <input id={`${formId}-custom-water`} type="number" style={inputStyle} value={customWaterLiters} onChange={(e) => setCustomWaterLiters(Number(e.target.value))} min={0} max={20} step={0.1} />
            </div>
          </fieldset>
        )}
        {warnings.length > 0 && (
          <div role="status" aria-live="polite" style={warningListStyle}>
            <div style={{ color: "var(--accent-yellow)", fontFamily: "'Orbitron', monospace", fontSize: "0.65rem", letterSpacing: "1px", marginBottom: 4 }}>
              Input Cautions
            </div>
            <ul style={{ marginLeft: "1rem" }}>
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
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
