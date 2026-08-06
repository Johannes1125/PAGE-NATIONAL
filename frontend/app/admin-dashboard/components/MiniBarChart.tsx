"use client";

import React from "react";

type BarItem = {
  label: string;
  value: number;
  color: string;
};

type MiniBarChartProps = {
  items: BarItem[];
  title?: string;
  maxBarWidth?: number;
};

export default function MiniBarChart({
  items,
  title,
  maxBarWidth = 100,
}: MiniBarChartProps) {
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="mini-bar-chart">
      {title && <h4 className="mini-bar-chart__title">{title}</h4>}
      <div className="mini-bar-chart__bars">
        {items.map((item) => {
          const widthPercent = (item.value / maxValue) * maxBarWidth;
          return (
            <div key={item.label} className="mini-bar-chart__row">
              <span className="mini-bar-chart__label">{item.label}</span>
              <div className="mini-bar-chart__track">
                <div
                  className="mini-bar-chart__fill"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <span className="mini-bar-chart__value">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
