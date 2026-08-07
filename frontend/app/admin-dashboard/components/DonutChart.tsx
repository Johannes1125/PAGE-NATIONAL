"use client";

import React, { useState } from "react";

type Segment = {
  name: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  title?: string;
  centerLabel?: string;
  centerValue?: string | number;
};

export default function DonutChart({
  segments,
  size = 180,
  strokeWidth = 28,
  title,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let cumulative = 0;
  const arcs = segments.map((seg, i) => {
    const percent = total > 0 ? seg.value / total : 0;
    const dashLength = percent * circumference;
    const dashOffset = cumulative * circumference;
    cumulative += percent;
    return {
      ...seg,
      percent,
      dashLength,
      dashOffset,
      index: i,
    };
  });

  return (
    <div className="donut-chart">
      {title && <h3 className="donut-chart__title">{title}</h3>}

      <div className="donut-chart__visual">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="donut-chart__svg"
        >
          {/* Background ring */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#f0f4f8"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {arcs.map((arc) => (
            <circle
              key={arc.name}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={
                hoveredIdx === arc.index
                  ? strokeWidth + 4
                  : strokeWidth
              }
              strokeDasharray={`${arc.dashLength} ${circumference - arc.dashLength}`}
              strokeDashoffset={-arc.dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{
                transition: "stroke-width 0.2s ease, opacity 0.2s ease",
                opacity: hoveredIdx !== null && hoveredIdx !== arc.index ? 0.5 : 1,
                cursor: "pointer",
              }}
              onMouseEnter={() => setHoveredIdx(arc.index)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
          {/* Center text */}
          {(centerLabel || centerValue) && (
            <g>
              {centerValue !== undefined && (
                <text
                  x={cx}
                  y={centerLabel ? cy - 4 : cy + 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    fill: "#143152",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {centerValue}
                </text>
              )}
              {centerLabel && (
                <text
                  x={cx}
                  y={cy + 16}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    fill: "#6b87a4",
                    fontFamily: "Poppins, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {centerLabel}
                </text>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="donut-chart__legend">
        {arcs.map((arc) => (
          <div
            key={arc.name}
            className={`donut-chart__legend-item ${
              hoveredIdx === arc.index ? "donut-chart__legend-item--active" : ""
            }`}
            onMouseEnter={() => setHoveredIdx(arc.index)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span
              className="donut-chart__legend-dot"
              style={{ background: arc.color }}
            />
            <span className="donut-chart__legend-label">{arc.name}</span>
            <span className="donut-chart__legend-value">
              {arc.value}{" "}
              <span className="donut-chart__legend-pct">
                ({(arc.percent * 100).toFixed(0)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
