"use client";

import React from "react";

/**
 * PageSeal — Wax Seal Medallion
 *
 * Signature motif for the PAGE credentialing design system.
 * Used in exactly three contexts:
 *   1. Membership tier cards (ghost watermark on most; gold badge on Life Member)
 *   2. Completed step indicator in the application wizard
 *   3. Review screen header watermark
 *
 * Variants:
 *   "full"  — crimson/seal-red fill (formal, in-context seals)
 *   "gold"  — PAGE gold fill (completed steps, Life Member badge)
 *   "ghost" — transparent with subtle ink stroke (card watermarks)
 */

interface PageSealProps {
  size?: number;
  variant?: "full" | "ghost" | "gold" | "navy" | "navy-outline";
  className?: string;
  style?: React.CSSProperties;
}

const RIDGE_COUNT = 16;

export function PageSeal({
  size = 64,
  variant = "full",
  className,
  style,
}: PageSealProps) {
  const cx = 32;
  const cy = 32;
  const outerR = 29.5;
  const innerR = 21.5;
  const ridgeInnerR = 13;
  const ridgeOuterR = 28.5;

  const ridges = Array.from({ length: RIDGE_COUNT }, (_, i) => {
    const rad = ((i * 360) / RIDGE_COUNT) * (Math.PI / 180);
    return {
      x1: +(cx + ridgeInnerR * Math.cos(rad)).toFixed(3),
      y1: +(cy + ridgeInnerR * Math.sin(rad)).toFixed(3),
      x2: +(cx + ridgeOuterR * Math.cos(rad)).toFixed(3),
      y2: +(cy + ridgeOuterR * Math.sin(rad)).toFixed(3),
    };
  });

  const theme = {
    full: {
      fill: "#8B1A1A",
      outerStroke: "#6B1212",
      ridgeColor: "rgba(255,255,255,0.20)",
      innerFill: "rgba(255,255,255,0.06)",
      innerStroke: "rgba(255,255,255,0.35)",
      textFill: "#F5F0E8",
      strokeWidth: 1.5,
    },
    gold: {
      fill: "#A8850A",
      outerStroke: "#8A6C07",
      ridgeColor: "rgba(255,255,255,0.22)",
      innerFill: "rgba(255,255,255,0.07)",
      innerStroke: "rgba(255,255,255,0.38)",
      textFill: "#FDFAF5",
      strokeWidth: 1.5,
    },
    navy: {
      fill: "#143152",
      outerStroke: "#0C1A2E",
      ridgeColor: "rgba(255,255,255,0.22)",
      innerFill: "rgba(255,255,255,0.08)",
      innerStroke: "rgba(255,255,255,0.38)",
      textFill: "#FDFAF5",
      strokeWidth: 1.5,
    },
    "navy-outline": {
      fill: "#F5F0E8",
      outerStroke: "#143152",
      ridgeColor: "rgba(20,49,82,0.25)",
      innerFill: "rgba(20,49,82,0.06)",
      innerStroke: "rgba(20,49,82,0.45)",
      textFill: "#143152",
      strokeWidth: 1.5,
    },
    ghost: {
      fill: "none",
      outerStroke: "rgba(12,26,46,0.30)",
      ridgeColor: "rgba(12,26,46,0.15)",
      innerFill: "none",
      innerStroke: "rgba(12,26,46,0.25)",
      textFill: "rgba(12,26,46,0.50)",
      strokeWidth: 1,
    },
  }[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {/* Outer disc fill (solid variants only) */}
      {variant !== "ghost" && (
        <circle cx={cx} cy={cy} r={outerR} fill={theme.fill} />
      )}

      {/* Outer ring stroke */}
      <circle
        cx={cx}
        cy={cy}
        r={outerR}
        fill="none"
        stroke={theme.outerStroke}
        strokeWidth={theme.strokeWidth}
      />

      {/* Radial ridges */}
      {ridges.map((r, i) => (
        <line
          key={i}
          x1={r.x1}
          y1={r.y1}
          x2={r.x2}
          y2={r.y2}
          stroke={theme.ridgeColor}
          strokeWidth="0.75"
        />
      ))}

      {/* Inner ring */}
      <circle
        cx={cx}
        cy={cy}
        r={innerR}
        fill={theme.innerFill}
        stroke={theme.innerStroke}
        strokeWidth="0.75"
      />

      {/* "PAGE" centrepiece */}
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontFamily="var(--font-poppins), 'Poppins', sans-serif"
        fontSize="11"
        fontWeight="bold"
        fill={theme.textFill}
        letterSpacing="2.5"
      >
        PAGE
      </text>
    </svg>
  );
}
