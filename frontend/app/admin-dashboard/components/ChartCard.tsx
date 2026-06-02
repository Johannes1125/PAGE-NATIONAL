"use client";

import React from "react";
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

export default function ChartCard({ title, hint, data, height = 200, color = "#1e538e" }: ChartCardProps) {
  const width = 600;
  const padding = { top: 25, bottom: 40, left: 45, right: 20 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  
  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value));
  // Add some padding to the top of the chart for better visibility
  const range = (maxVal - minVal) * 1.1 || 1;
  const adjustedMax = minVal + range;

  const getYCoordinate = (value: number) => {
    const normalized = (value - minVal) / range;
    return padding.top + (innerHeight - normalized * innerHeight);
  };

  const getXCoordinate = (index: number) => {
    return padding.left + (index / (data.length - 1)) * innerWidth;
  };

  const points = data
    .map((point, i) => {
      const x = getXCoordinate(i);
      const y = getYCoordinate(point.value);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  // Calculate Y-axis ticks with better formatting
  const yTicks = 5;
  const yValues = [];
  for (let i = 0; i <= yTicks; i++) {
    const value = minVal + (range / yTicks) * i;
    yValues.push(Math.round(value));
  }

  // Format Y-axis labels for better readability
  const formatYLabel = (value: number) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'k';
    }
    return value.toString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          {hint && <p className={styles.hint}>{hint}</p>}
        </div>
      </div>

      <div className={styles.chartContainer}>
        <svg 
          className={styles.svg} 
          viewBox={`0 0 ${width} ${height}`} 
          role="img" 
          aria-label={title} 
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background */}
          <rect x="0" y="0" width={width} height={height} fill="#fafcff" rx="8" />
          
          {/* Y-axis grid lines and labels */}
          {yValues.map((value, idx) => {
            const y = padding.top + (innerHeight / yTicks) * idx;
            return (
              <g key={`grid-${idx}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#e8edf2"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x={padding.left - 12}
                  y={y}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fontSize="11"
                  fill="#5a6e8c"
                  fontWeight="600"
                >
                  {formatYLabel(value)}
                </text>
              </g>
            );
          })}
          
          {/* X-axis labels */}
          {data.map((point, idx) => {
            const x = getXCoordinate(idx);
            return (
              <text
                key={`label-${idx}`}
                x={x}
                y={height - padding.bottom + 15}
                textAnchor="middle"
                fontSize="11"
                fill="#5a6e8c"
                fontWeight="600"
              >
                {point.label}
              </text>
            );
          })}
          
          {/* X-axis line */}
          <line
            x1={padding.left}
            y1={height - padding.bottom + 2}
            x2={padding.left + innerWidth}
            y2={height - padding.bottom + 2}
            stroke="#dce3e9"
            strokeWidth="1.5"
          />
          
          {/* Y-axis line */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom + 2}
            stroke="#dce3e9"
            strokeWidth="1.5"
          />
          
          {/* Chart line */}
          <polyline 
            points={points} 
            fill="none" 
            stroke={color} 
            strokeWidth={3} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Area under the line */}
          <polygon
            points={`${padding.left},${height - padding.bottom} ${points} ${padding.left + innerWidth},${height - padding.bottom}`}
            fill={`${color}10`}
          />
          
          {/* Data points */}
          {data.map((point, idx) => {
            const x = getXCoordinate(idx);
            const y = getYCoordinate(point.value);
            return (
              <g key={point.label}>
                <circle 
                  cx={x} 
                  cy={y} 
                  r={4.5} 
                  fill={color} 
                  stroke="#fff" 
                  strokeWidth={2.5}
                  style={{ cursor: 'pointer' }}
                />
                {/* Add value tooltip on hover */}
                <title>{`${point.label}: ${point.value}`}</title>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.footer}>
        {data.map((d) => (
          <div key={d.label} className={styles.legendItem}>
            <span className={styles.legendLabel}>{d.label}</span>
            <span className={styles.legendValue}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}