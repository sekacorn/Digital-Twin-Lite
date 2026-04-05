import React from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

/**
 * Tiny sparkline chart for HUD panels.
 */
export default function MiniChart({ data, dataKey, color = "#00f0ff", height = 50 }) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <YAxis domain={["auto", "auto"]} hide />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
