"use client";

import { LayoutGrid, List } from "lucide-react";

type ViewToggleProps = {
  viewMode: "card" | "list";
  onChange: (mode: "card" | "list") => void;
};

export default function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="chapters-view-toggle" role="radiogroup" aria-label="View layout mode">
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === "card"}
        onClick={() => onChange("card")}
        className={`chapters-view-toggle__btn ${viewMode === "card" ? "chapters-view-toggle__btn--active" : ""}`}
        title="Switch to Card view layout"
      >
        <LayoutGrid size={18} strokeWidth={2.2} aria-hidden="true" />
        <span>Card View</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === "list"}
        onClick={() => onChange("list")}
        className={`chapters-view-toggle__btn ${viewMode === "list" ? "chapters-view-toggle__btn--active" : ""}`}
        title="Switch to List view layout"
      >
        <List size={18} strokeWidth={2.2} aria-hidden="true" />
        <span>List View</span>
      </button>
    </div>
  );
}

