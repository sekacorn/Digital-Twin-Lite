import React, { Suspense, lazy, useMemo, useState } from "react";
import HumanBody from "./components/HumanBody";
import HudPanel from "./components/HudPanel";
import DataReadout from "./components/DataReadout";
import VitalBar from "./components/VitalBar";
import TimeSlider from "./components/TimeSlider";
import InputForm from "./components/InputForm";
import { submitInput, runSimulation } from "./api";

const MiniChart = lazy(() => import("./components/MiniChart"));

export default function App() {
  const [simData, setSimData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [inputWeight, setInputWeight] = useState(80);

  async function handleSubmit(habits, periodDays) {
    setLoading(true);
    setError(null);
    try {
      const inputRes = await submitInput(habits);
      const simRes = await runSimulation(inputRes.id, periodDays);
      setSimData(simRes);
      setInputWeight(habits.current_weight);
      setCurrentDay(1); // Start at day 1 so user can scrub forward
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Current day's data point
  const dayData = useMemo(() => {
    if (!simData || currentDay <= 0) return null;
    const idx = Math.min(currentDay, simData.results.length) - 1;
    return simData.results[idx];
  }, [simData, currentDay]);

  // Weight factor for body morphing
  const weightFactor = useMemo(() => {
    if (!dayData || !inputWeight || inputWeight === 0) return 1;
    return dayData.predicted_weight / inputWeight;
  }, [dayData, inputWeight]);

  const energyScore = dayData?.energy_score ?? 50;

  // Pre-compute weight delta to avoid repeating
  const weightDelta = dayData ? dayData.predicted_weight - inputWeight : 0;
  const weightDeltaStr = `${weightDelta >= 0 ? "+" : ""}${weightDelta.toFixed(2)}`;
  const weightDeltaColor = weightDelta < 0 ? "var(--accent-green)" : "var(--accent-red)";
  const energyColor = energyScore > 70 ? "var(--accent-green)" : energyScore > 40 ? "var(--accent-cyan)" : "var(--accent-red)";

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 1.5rem",
        borderBottom: "1px solid rgba(0,240,255,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 8, height: 8,
            background: "var(--accent-green)",
            boxShadow: "0 0 8px var(--accent-green)",
            animation: "pulse-glow 2s infinite",
          }} />
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.85rem", letterSpacing: "3px" }}>
            DIGITAL TWIN LITE
          </h1>
        </div>
        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: "0.6rem",
          color: "var(--text-dim)",
          letterSpacing: "1px",
        }}>
          SYS.STATUS: <span style={{ color: "var(--accent-green)" }}>ONLINE</span>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          v0.1.0
        </div>
      </div>

      {/* Main layout: responsive 3-column on desktop, stacked on mobile */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr 280px",
        gap: "1rem",
        padding: "1rem 1.5rem",
        minHeight: "calc(100vh - 52px)",
      }}
        className="main-grid"
      >

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <InputForm onSubmit={handleSubmit} loading={loading} />

          {error && (
            <HudPanel title="Error" accentColor="var(--accent-red)">
              <div style={{ color: "#ff3366", fontSize: "0.8rem", fontFamily: "'Rajdhani', sans-serif" }}>
                {error}
              </div>
            </HudPanel>
          )}

          <HudPanel title="System Info" accentColor="var(--accent-purple)">
            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", lineHeight: 1.6 }}>
              <div>Engine: Rule-Based v1</div>
              <div>Model: Deterministic</div>
              <div>Precision: Directional</div>
              <div style={{ marginTop: 8, fontSize: "0.65rem", color: "var(--text-label)" }}>
                For educational purposes only.
                Not medical advice.
              </div>
            </div>
          </HudPanel>
        </div>

        {/* CENTER COLUMN - Body */}
        <div style={{ display: "flex", alignItems: "stretch", gap: "0.5rem" }}>
          {/* Time slider */}
          {simData && (
            <div style={{ width: 50 }}>
              <TimeSlider
                currentDay={currentDay}
                maxDays={simData.period_days}
                onChange={setCurrentDay}
              />
            </div>
          )}

          {/* Body visualization */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}>
            {/* Top HUD identifier */}
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "0.55rem",
              color: "var(--text-dim)",
              letterSpacing: "3px",
              marginBottom: "0.5rem",
              textAlign: "center",
            }}>
              {loading
                ? "SIMULATING..."
                : simData
                  ? `PROJECTION: DAY ${currentDay} / ${simData.period_days}`
                  : "AWAITING INPUT"}
            </div>

            <HumanBody
              weightFactor={weightFactor}
              energyScore={energyScore}
              isProjection={simData !== null}
            />

            {/* Bottom status */}
            {simData && dayData && (
              <div style={{
                display: "flex",
                gap: "2rem",
                justifyContent: "center",
                marginTop: "0.5rem",
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.2rem", color: "var(--accent-cyan)" }}>
                    {dayData.predicted_weight} <span style={{ fontSize: "0.6em", color: "var(--text-dim)" }}>kg</span>
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-label)", letterSpacing: "1px" }}>WEIGHT</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: "1.2rem",
                    color: energyColor,
                  }}>
                    {dayData.energy_score} <span style={{ fontSize: "0.6em", color: "var(--text-dim)" }}>/100</span>
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-label)", letterSpacing: "1px" }}>ENERGY</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Vital signs */}
          <HudPanel title="Vital Projections" accentColor="var(--accent-green)">
            {simData && dayData ? (
              <>
                <DataReadout
                  label="Predicted Weight"
                  value={dayData.predicted_weight}
                  unit="kg"
                  color="var(--accent-cyan)"
                />
                <DataReadout
                  label="Weight Delta"
                  value={weightDeltaStr}
                  unit="kg"
                  color={weightDeltaColor}
                />
                <DataReadout
                  label="Energy Score"
                  value={dayData.energy_score}
                  unit="/100"
                  color={energyColor}
                />
              </>
            ) : (
              <div style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
                Run a simulation to see projections
              </div>
            )}
          </HudPanel>

          {/* Bio metrics bars */}
          <HudPanel title="Bio Metrics" accentColor="var(--accent-yellow)">
            {simData && dayData ? (
              <>
                <VitalBar label="Energy" value={dayData.energy_score} max={100} color="var(--accent-green)" />
                <VitalBar label="Weight Stability" value={Math.max(0, 100 - Math.abs(weightDelta) * 10)} max={100} color="var(--accent-cyan)" />
                <VitalBar label="Projection Confidence" value={currentDay <= 30 ? 85 : currentDay <= 60 ? 70 : 55} max={100} color="var(--accent-purple)" />
              </>
            ) : (
              <div style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>
                No data yet
              </div>
            )}
          </HudPanel>

          {/* Sparkline charts */}
          {simData && (
            <>
              <HudPanel title="Weight Trend" accentColor="var(--accent-cyan)">
                <Suspense fallback={<div style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>Loading chart...</div>}>
                  <MiniChart data={simData.results} dataKey="predicted_weight" color="#00f0ff" height={60} />
                </Suspense>
              </HudPanel>
              <HudPanel title="Energy Trend" accentColor="var(--accent-green)">
                <Suspense fallback={<div style={{ color: "var(--text-dim)", fontSize: "0.75rem" }}>Loading chart...</div>}>
                  <MiniChart data={simData.results} dataKey="energy_score" color="#00ff88" height={60} />
                </Suspense>
              </HudPanel>
            </>
          )}

          {/* Summary */}
          {simData && (
            <HudPanel title="Simulation Summary" accentColor="var(--accent-cyan)">
              <DataReadout label="Final Weight" value={simData.summary.final_weight} unit="kg" color="var(--accent-cyan)" />
              <DataReadout label="Avg Energy" value={simData.summary.avg_energy} unit="/100" color="var(--accent-green)" />
              <DataReadout
                label="Net Change"
                value={`${simData.summary.weight_change >= 0 ? "+" : ""}${simData.summary.weight_change}`}
                unit="kg"
                color={simData.summary.weight_change < 0 ? "var(--accent-green)" : "var(--accent-red)"}
              />
            </HudPanel>
          )}
        </div>
      </div>

      {/* Bottom disclaimer bar */}
      <div style={{
        textAlign: "center",
        padding: "0.5rem",
        fontSize: "0.6rem",
        color: "var(--text-dim)",
        borderTop: "1px solid rgba(0,240,255,0.05)",
        letterSpacing: "1px",
      }}>
        FOR EDUCATIONAL AND WELLNESS PURPOSES ONLY — NOT MEDICAL ADVICE
      </div>
    </div>
  );
}
