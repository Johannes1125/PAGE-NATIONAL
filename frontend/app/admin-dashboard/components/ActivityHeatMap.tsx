"use client";

import React, { useState } from "react";

type ActivityHeatMapProps = {
  /** 7 rows (days, oldest first) × 24 columns (hours 0–23) */
  data: number[][];
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_LABELS = [
  "12a", "", "2a", "", "4a", "", "6a", "", "8a", "", "10a", "",
  "12p", "", "2p", "", "4p", "", "6p", "", "8p", "", "10p", "",
];

export default function ActivityHeatMap({ data }: ActivityHeatMapProps) {
  const [tooltip, setTooltip] = useState<{
    day: number;
    hour: number;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  // Find max for color scaling
  const flatValues = data.flat();
  const maxVal = Math.max(...flatValues, 1);

  const getColor = (value: number) => {
    if (value === 0) return "#f0f4f8";
    const intensity = Math.min(value / maxVal, 1);
    // Gradient from pale blue to deep navy
    if (intensity < 0.25) return "#dbeafe";
    if (intensity < 0.5) return "#93c5fd";
    if (intensity < 0.75) return "#3b82f6";
    return "#1e3a5f";
  };

  const cellSize = 18;
  const gap = 3;
  const labelPadLeft = 36;
  const labelPadTop = 20;
  const svgWidth = labelPadLeft + 24 * (cellSize + gap);
  const svgHeight = labelPadTop + 7 * (cellSize + gap);

  // Compute day labels based on today's day of week
  const today = new Date();
  const dayIndex = (today.getDay() + 6) % 7; // Monday = 0
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const idx = (dayIndex - 6 + i + 7) % 7;
    return DAY_LABELS[idx];
  });

  return (
    <div className="activity-heatmap">
      <div className="activity-heatmap__container">
        <svg
          width="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="activity-heatmap__svg"
        >
          {/* Hour labels */}
          {HOUR_LABELS.map((label, h) =>
            label ? (
              <text
                key={`h-${h}`}
                x={labelPadLeft + h * (cellSize + gap) + cellSize / 2}
                y={12}
                textAnchor="middle"
                style={{
                  fontSize: "8px",
                  fill: "#8b9fb8",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                }}
              >
                {label}
              </text>
            ) : null,
          )}

          {/* Day labels + cells */}
          {data.map((row, d) => (
            <g key={`row-${d}`}>
              <text
                x={0}
                y={labelPadTop + d * (cellSize + gap) + cellSize / 2 + 3}
                style={{
                  fontSize: "9px",
                  fill: "#8b9fb8",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                }}
              >
                {dayLabels[d]}
              </text>
              {row.map((val, h) => (
                <rect
                  key={`cell-${d}-${h}`}
                  x={labelPadLeft + h * (cellSize + gap)}
                  y={labelPadTop + d * (cellSize + gap)}
                  width={cellSize}
                  height={cellSize}
                  rx={4}
                  fill={getColor(val)}
                  style={{
                    transition: "fill 0.15s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    setTooltip({
                      day: d,
                      hour: h,
                      value: val,
                      x: rect.x + rect.width / 2,
                      y: rect.y,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="activity-heatmap__tooltip"
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y - 36,
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
          <strong>{tooltip.value}</strong> activities
          <br />
          <span>
            {dayLabels[tooltip.day]} {tooltip.hour}:00
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="activity-heatmap__legend">
        <span className="activity-heatmap__legend-label">Less</span>
        {["#f0f4f8", "#dbeafe", "#93c5fd", "#3b82f6", "#1e3a5f"].map(
          (color, i) => (
            <span
              key={i}
              className="activity-heatmap__legend-cell"
              style={{ background: color }}
            />
          ),
        )}
        <span className="activity-heatmap__legend-label">More</span>
      </div>
    </div>
  );
}
