import React, { useMemo, useId } from "react";

/**
 * SVG Human Body that morphs based on weight change and energy score.
 * - Weight change scales the body horizontally (wider = heavier)
 * - Energy score changes the glow color (green = high, red = low)
 * - The body has a wireframe/holographic look with scan lines
 */

const NODE_POINTS = [
  [150, 60], [150, 170], [125, 175], [175, 175],
  [150, 230], [150, 290], [125, 410], [175, 410],
  [50, 330], [250, 330],
];

export default function HumanBody({ weightFactor = 1, energyScore = 50, isProjection = false }) {
  const svgId = useId().replace(/:/g, "");

  // weightFactor: 1 = baseline, >1 = heavier, <1 = thinner
  // clamp between 0.7 and 1.5
  const wf = Math.max(0.7, Math.min(1.5, weightFactor));

  const glowColor = useMemo(() => {
    const norm = energyScore / 100;
    if (norm > 0.7) return "#00ff88";
    if (norm > 0.4) return "#00f0ff";
    return "#ff3366";
  }, [energyScore]);

  const bodyOpacity = isProjection ? 0.85 : 1;

  // Unique IDs for SVG defs to avoid collisions
  const gradId = `${svgId}-grad`;
  const neonId = `${svgId}-neon`;
  const innerId = `${svgId}-inner`;
  const gridId = `${svgId}-grid`;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Scan line effect */}
      <div style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        opacity: 0.15,
      }}>
        <div style={{
          position: "absolute",
          width: "100%",
          height: "3px",
          background: `linear-gradient(transparent, ${glowColor}, transparent)`,
          animation: "scan-line 3s linear infinite",
        }} />
      </div>

      <svg
        viewBox="0 0 300 600"
        width="100%"
        height="100%"
        style={{ maxHeight: "70vh", opacity: bodyOpacity, filter: `drop-shadow(0 0 20px ${glowColor}40)` }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.8" />
            <stop offset="50%" stopColor={glowColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0.8" />
          </linearGradient>
          <filter id={neonId}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={innerId}>
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="blur" in2="SourceGraphic" operator="in" />
          </filter>
          {/* Grid pattern for wireframe effect */}
          <pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke={glowColor} strokeWidth="0.3" opacity="0.3" />
          </pattern>
        </defs>

        {/* Center transform group for body scaling */}
        <g transform={`translate(150, 0) scale(${wf}, 1) translate(-150, 0)`}>
          {/* Inner body glow */}
          <g filter={`url(#${innerId})`} opacity="0.3">
            <ellipse cx="150" cy="260" rx="55" ry="70" fill={glowColor} />
            <ellipse cx="150" cy="180" rx="30" ry="30" fill={glowColor} />
          </g>

          {/* Main body outline - wireframe style */}
          <g fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" filter={`url(#${neonId})`}>
            {/* Head */}
            <ellipse cx="150" cy="60" rx="28" ry="35" />
            {/* Inner face lines */}
            <line x1="140" y1="50" x2="140" y2="52" strokeWidth="2" />
            <line x1="160" y1="50" x2="160" y2="52" strokeWidth="2" />
            <path d="M 143 65 Q 150 70 157 65" strokeWidth="1" />

            {/* Neck */}
            <line x1="140" y1="95" x2="140" y2="115" />
            <line x1="160" y1="95" x2="160" y2="115" />

            {/* Shoulders & Torso */}
            <path d="M 140 115 L 95 130 L 80 140" />
            <path d="M 160 115 L 205 130 L 220 140" />

            {/* Torso outline */}
            <path d="M 95 130 L 90 200 L 95 280 Q 110 300 150 305 Q 190 300 205 280 L 210 200 L 205 130" />

            {/* Torso center line */}
            <line x1="150" y1="115" x2="150" y2="305" strokeWidth="0.5" opacity="0.4" />
            {/* Rib lines */}
            <path d="M 120 160 Q 150 155 180 160" strokeWidth="0.5" opacity="0.4" />
            <path d="M 115 180 Q 150 175 185 180" strokeWidth="0.5" opacity="0.4" />
            <path d="M 112 200 Q 150 195 188 200" strokeWidth="0.5" opacity="0.4" />
            {/* Abs hint */}
            <path d="M 130 230 Q 150 225 170 230" strokeWidth="0.5" opacity="0.3" />
            <path d="M 125 255 Q 150 250 175 255" strokeWidth="0.5" opacity="0.3" />

            {/* Left arm */}
            <path d="M 80 140 L 60 220 L 50 300 L 45 320" />
            <path d="M 80 140 L 68 220 L 60 300 L 55 320" />
            {/* Left hand */}
            <ellipse cx="50" cy="330" rx="10" ry="15" />

            {/* Right arm */}
            <path d="M 220 140 L 240 220 L 250 300 L 255 320" />
            <path d="M 220 140 L 232 220 L 240 300 L 245 320" />
            {/* Right hand */}
            <ellipse cx="250" cy="330" rx="10" ry="15" />

            {/* Pelvis */}
            <path d="M 110 290 Q 150 320 190 290" />

            {/* Left leg */}
            <path d="M 120 305 L 115 400 L 112 480 L 110 540" />
            <path d="M 140 305 L 135 400 L 132 480 L 130 540" />
            {/* Left knee */}
            <ellipse cx="125" cy="410" rx="12" ry="8" strokeWidth="0.5" opacity="0.4" />
            {/* Left foot */}
            <path d="M 108 540 L 100 560 L 95 570 L 135 570 L 132 560 L 130 540" />

            {/* Right leg */}
            <path d="M 160 305 L 165 400 L 168 480 L 170 540" />
            <path d="M 180 305 L 185 400 L 188 480 L 190 540" />
            {/* Right knee */}
            <ellipse cx="175" cy="410" rx="12" ry="8" strokeWidth="0.5" opacity="0.4" />
            {/* Right foot */}
            <path d="M 170 540 L 168 560 L 165 570 L 195 570 L 200 560 L 192 540" />
          </g>

          {/* Wireframe grid overlay on torso */}
          <rect x="90" y="130" width="120" height="175" fill={`url(#${gridId})`} opacity="0.2" rx="5" />

          {/* Organ highlights */}
          <g opacity="0.25">
            {/* Heart */}
            <ellipse cx="160" cy="170" rx="12" ry="10" fill="#ff3366" />
            {/* Lungs */}
            <ellipse cx="125" cy="175" rx="18" ry="25" fill="#00aaff" />
            <ellipse cx="175" cy="175" rx="18" ry="25" fill="#00aaff" />
            {/* Stomach */}
            <ellipse cx="155" cy="230" rx="20" ry="15" fill="#ffaa00" />
          </g>

          {/* Node points - data collection points */}
          {NODE_POINTS.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="3" fill={glowColor} opacity="0.8">
                <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy={y} r="6" fill="none" stroke={glowColor} strokeWidth="0.5" opacity="0.4">
                <animate attributeName="r" values="6;10;6" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </g>

        {/* Corner brackets - HUD frame */}
        <g stroke={glowColor} strokeWidth="1.5" fill="none" opacity="0.5">
          <path d="M 20 20 L 20 50 M 20 20 L 50 20" />
          <path d="M 280 20 L 280 50 M 280 20 L 250 20" />
          <path d="M 20 580 L 20 550 M 20 580 L 50 580" />
          <path d="M 280 580 L 280 550 M 280 580 L 250 580" />
        </g>
      </svg>
    </div>
  );
}
