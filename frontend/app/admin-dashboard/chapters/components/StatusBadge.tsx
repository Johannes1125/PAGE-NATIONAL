"use client";

import { Chapter } from "../types";

type Status = Chapter["status"];

const STATUS_CONFIG: Record<
  Status,
  { label: string; className: string }
> = {
  published: {
    label: "Published",
    className: "chapters-badge chapters-badge--published",
  },
  draft: {
    label: "Draft",
    className: "chapters-badge chapters-badge--draft",
  },
  archived: {
    label: "Archived",
    className: "chapters-badge chapters-badge--archived",
  },
};

type StatusBadgeProps = {
  status: Status;
  size?: "sm" | "md";
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;

  return (
    <span className={`${config.className} ${size === "sm" ? "chapters-badge--sm" : ""}`}>
      {config.label}
    </span>
  );
}
