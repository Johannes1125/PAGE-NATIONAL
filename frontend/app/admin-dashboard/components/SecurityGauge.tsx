"use client";

import React from "react";

type SecurityGaugeProps = {
  score: number; // 0 - 100
  size?: number;
  label?: string;
};

export default function SecurityGauge({
  score,
  size = 160,
  label = "Security Score",
}: SecurityGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  // SVG arc parameters
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // We draw an arc from 135° to 405° (270° sweep)
  const startAngle = 135;
  const sweepAngle = 270;
  const endAngle = startAngle + sweepAngle;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startDeg: number,
    endDeg: number,
  ) => {
    const startRad = toRad(startDeg);
    const endRad = toRad(endDeg);
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const progressAngle = startAngle + (clampedScore / 100) * sweepAngle;

  // Color based on score
  let color = "#10b981"; // green
  let bgGlow = "rgba(16, 185, 129, 0.15)";
  let statusText = "Excellent";
  if (clampedScore < 50) {
    color = "#f43f5e";
    bgGlow = "rgba(244, 63, 94, 0.15)";
    statusText = "Critical";
  } else if (clampedScore < 70) {
    color = "#f59e0b";
    bgGlow = "rgba(245, 158, 11, 0.15)";
    statusText = "Needs Attention";
  } else if (clampedScore < 85) {
    color = "#0ea5c9";
    bgGlow = "rgba(14, 165, 201, 0.15)";
    statusText = "Good";
  }

  return (
    <div className="security-gauge">
      <div className="security-gauge__visual" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background glow */}
          <circle
            cx={cx}
            cy={cy}
            r={radius - 10}
            fill={bgGlow}
            style={{ transition: "fill 0.4s ease" }}
          />

          {/* Track */}
          <path
            d={describeArc(cx, cy, radius, startAngle, endAngle)}
            fill="none"
            stroke="#e8edf4"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress */}
          {clampedScore > 0 && (
            <path
              d={describeArc(cx, cy, radius, startAngle, progressAngle)}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{
                transition: "stroke 0.4s ease",
                filter: `drop-shadow(0 0 6px ${color}40)`,
              }}
            />
          )}

          {/* Score text */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: "32px",
              fontWeight: 800,
              fill: "#143152",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            {clampedScore}
          </text>
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              fill: color,
              fontFamily: "Poppins, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              transition: "fill 0.4s ease",
            }}
          >
            {statusText}
          </text>
        </svg>
      </div>
      <p className="security-gauge__label">{label}</p>
    </div>
  );
}
