"use client";

import { motion } from "framer-motion";
import { Building2, Plus } from "lucide-react";

type EmptyStateProps = {
  onCreateChapter?: () => void;
  isSearchActive?: boolean;
  onClearFilters?: () => void;
};

export default function EmptyState({
  onCreateChapter,
  isSearchActive = false,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="chapters-empty"
      role="status"
      aria-label="No chapters found"
    >
      <div className="chapters-empty__illustration" aria-hidden="true">
        <div className="chapters-empty__icon-ring">
          <Building2 size={52} strokeWidth={1.5} />
        </div>
        <div className="chapters-empty__icon-badge">
          <Plus size={18} strokeWidth={3} />
        </div>
      </div>

      <h3 className="chapters-empty__title">
        {isSearchActive ? "No Chapters Match Your Search" : "No Chapters Yet"}
      </h3>

      <p className="chapters-empty__subtitle">
        {isSearchActive
          ? "We couldn't find any regional chapters matching your search or filters. Try adjusting your criteria or clearing filters."
          : "Create your first regional chapter to begin managing officers, leadership structures, and publication status."}
      </p>

      <div className="chapters-empty__actions">
        {isSearchActive && onClearFilters ? (
          <button type="button" onClick={onClearFilters} className="chapters-btn chapters-btn--secondary">
            Clear Filters
          </button>
        ) : (
          onCreateChapter && (
            <button type="button" onClick={onCreateChapter} className="chapters-btn chapters-btn--primary">
              <Plus size={22} strokeWidth={2.5} aria-hidden="true" />
              Create First Chapter
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}
