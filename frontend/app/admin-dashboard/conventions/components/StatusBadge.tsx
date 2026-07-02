"use client";

import type { Convention } from "../types";

type StatusBadgeProps = {
  status: Convention["status"];
  size?: "sm" | "md";
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const label = status === "published" ? "Published" : "Draft";
  const className = `conv-badge conv-badge--${status} ${size === "sm" ? "conv-badge--sm" : ""}`;

  return (
    <span className={className}>
      <span className="conv-badge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
