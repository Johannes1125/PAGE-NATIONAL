"use client";

import React, { useState } from "react";
import styles from "./ChartCard.module.css";

type Point = {
  label: string;
  value: number;
};

type ChartCardProps = {
  title: string;
  hint?: string;
  data: Point[];
  height?: number;
  color?: string;
};

export default function ChartCard({
  title,
  hint,
  data,
  height = 180,
  color = "#1E538E",
}: ChartCardProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 600;
  const padding = { top: 28, bottom: 36, left: 48, right: 24 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = (maxVal - minVal) || 1;
  const paddedMin = minVal - range * 0.1;
  const paddedMax = maxVal + range * 0.15;
  const paddedRange = paddedMax - paddedMin;

  const getY = (value: number) =>
    padding.top + innerHeight - ((value - paddedMin) / paddedRange) * innerHeight;

  const getX = (index: number) =>
    padding.left + (index / (data.length - 1)) * innerWidth;

  const linePath = data
    .map((point, i) => {
      const x = getX(i).toFixed(2);
      const y = getY(point.value).toFixed(2);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  // Smooth area fill
  const areaPath =
    linePath +
    ` L${getX(data.length - 1).toFixed(2)},${(padding.top + innerHeight).toFixed(2)}` +
    ` L${padding.left},${(padding.top + innerHeight).toFixed(2)} Z`;

  // Y-axis ticks (4 lines)
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const ratio = i / tickCount;
    return paddedMin + paddedRange * ratio;
  });

  const formatLabel = (v: number) => {
    if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
    if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(0) + "k";
    return Math.round(v).toString();
  };

  const totalValue = values.reduce((a, b) => a + b, 0);
  const avgValue = totalValue / values.length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h3 className={styles.title}>{title}</h3>
          {hint && <p className={styles.hint}>{hint}</p>}
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Avg</span>
            <span className={styles.statValue}>{formatLabel(avgValue)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total</span>
            <span className={styles.statValue}>{formatLabel(totalValue)}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartWrap}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={title}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.12" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
            <clipPath id="chartClip">
              <rect
                x={padding.left}
                y={padding.top}
                width={innerWidth}
                height={innerHeight}
              />
            </clipPath>
          </defs>

          {/* Horizontal grid lines */}
          {yTicks.map((tick, i) => {
            const y = getY(tick);
            return (
              <g key={`tick-${i}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#E8EDF4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#8B9FB8"
                  fontFamily="Poppins, sans-serif"
                  fontWeight="500"
                  letterSpacing="0.3"
                >
                  {formatLabel(tick)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGrad)" clipPath="url(#chartClip)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath="url(#chartClip)"
          />

          {/* X-axis labels */}
          {data.map((point, idx) => (
            <text
              key={`xlabel-${idx}`}
              x={getX(idx)}
              y={height - 6}
              textAnchor="middle"
              fontSize="10"
              fill={hoveredIdx === idx ? color : "#8B9FB8"}
              fontFamily="Poppins, sans-serif"
              fontWeight={hoveredIdx === idx ? "600" : "500"}
              style={{ transition: "fill 0.15s ease" }}
            >
              {point.label}
            </text>
          ))}

          {/* Hover areas + dots */}
          {data.map((point, idx) => {
            const x = getX(idx);
            const y = getY(point.value);
            const isHovered = hoveredIdx === idx;
            return (
              <g key={`pt-${idx}`}>
                {/* Invisible hover hit area */}
                <rect
                  x={x - 18}
                  y={padding.top}
                  width={36}
                  height={innerHeight}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />

                {/* Vertical hover indicator */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + innerHeight}
                    stroke={color}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.4"
                  />
                )}

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={Math.min(x - 28, width - 72)}
                      y={y - 30}
                      width={56}
                      height={20}
                      rx="4"
                      fill="#143152"
                    />
                    <text
                      x={Math.min(x, width - 44)}
                      y={y - 16}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#FDFDFD"
                      fontFamily="Poppins, sans-serif"
                      fontWeight="600"
                    >
                      {point.value.toLocaleString()}
                    </text>
                  </g>
                )}

                {/* Data dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? "#FDFDFD" : color}
                  stroke={color}
                  strokeWidth={isHovered ? 2 : 0}
                  style={{ transition: "r 0.1s ease" }}
                  pointerEvents="none"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer sparkline legend */}
      <div className={styles.footer}>
        {data.map((d, i) => {
          const isMax = d.value === maxVal;
          const isMin = d.value === minVal;
          return (
            <div
              key={d.label}
              className={`${styles.legendItem} ${hoveredIdx === i ? styles.legendItemActive : ""}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span className={styles.legendLabel}>{d.label}</span>
              <span
                className={`${styles.legendValue} ${isMax ? styles.legendMax : ""} ${isMin ? styles.legendMin : ""}`}
              >
                {d.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}