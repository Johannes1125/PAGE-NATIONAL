"use client";

import { Landmark, Plus } from "lucide-react";

type EmptyStateProps = {
  onCreateConvention: () => void;
};

export default function EmptyState({ onCreateConvention }: EmptyStateProps) {
  return (
    <div className="conv-empty" role="status">
      <div className="conv-empty__illustration">
        <div className="conv-empty__icon-ring">
          <Landmark size={48} strokeWidth={1.6} />
        </div>
        <div className="conv-empty__icon-badge">
          <Plus size={18} strokeWidth={3} />
        </div>
      </div>

      <h3 className="conv-empty__title">No Conventions Yet</h3>

      <p className="conv-empty__subtitle">
        Start by creating your first convention record. You can manage all
        convention details, publish status, and more from this dashboard.
      </p>

      <div className="conv-empty__actions">
        <button
          type="button"
          className="conv-btn conv-btn--primary"
          onClick={onCreateConvention}
          style={{ minHeight: "52px", fontSize: "18px", padding: "0 28px" }}
        >
          <Plus size={22} strokeWidth={2.5} aria-hidden="true" />
          Create First Convention
        </button>
      </div>
    </div>
  );
}
