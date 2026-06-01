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

export default function ChartCard({ title, hint, data, height = 120, color = "#1e538e" }: ChartCardProps) {
  const width = 520;
  const padding = 8;
  const innerHeight = height - padding * 2;
  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value));
  const range = maxVal - minVal || 1;

  const points = data
    .map((point, i) => {
      const x = (i / (data.length - 1)) * width;
      const normalized = (point.value - minVal) / range;
      const y = padding + (innerHeight - normalized * innerHeight);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          {hint && <p className={styles.hint}>{hint}</p>}
        </div>
      </div>

      <svg className={styles.svg} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
        <rect x="0" y="0" width={width} height={height} fill="#f4f8fd" rx="8" />
        <polyline points={points} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((point, idx) => {
          const x = (idx / (data.length - 1)) * width;
          const normalized = (point.value - minVal) / range;
          const y = padding + (innerHeight - normalized * innerHeight);
          return <circle key={point.label} cx={x} cy={y} r={4} fill={color} />;
        })}
      </svg>

      <div className={styles.footer}>
        {data.map((d) => (
          <div key={d.label} className={styles.legendItem}>
            <span className={styles.legendLabel}>{d.label}</span>
            <span className={styles.legendValue}>{d.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
