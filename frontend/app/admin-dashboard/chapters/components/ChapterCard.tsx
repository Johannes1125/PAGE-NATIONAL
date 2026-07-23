"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, Globe, MoreVertical, Trash2, Building2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Chapter } from "../types";
import StatusBadge from "./StatusBadge";
import { getOfficerAvatar } from "./OfficerPreview";
import { formatDateShort } from "../utils/formatters";
import PillButton from "../../components/PillButton";

type ChapterCardProps = {
  chapter: Chapter;
  onEdit?: (chapter: Chapter) => void;
  onTogglePublish?: (chapter: Chapter) => void;
  onViewAllOfficers?: (chapter: Chapter) => void;
  onDelete?: (chapter: Chapter) => void;
};

export default function ChapterCard({
  chapter,
  onEdit,
  onTogglePublish,
  onViewAllOfficers,
  onDelete,
}: ChapterCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" as const } },
    hover: {
      y: -4,
      boxShadow: "0 12px 28px -8px rgba(20, 49, 82, 0.12)",
      transition: { duration: 0.2 },
    },
  };

  const DISPLAY_AVATARS = 3;
  const displayedOfficers = chapter.officers.slice(0, DISPLAY_AVATARS);
  const remainingCount = chapter.officers.length - DISPLAY_AVATARS;

  return (
    <motion.article
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      className="chapters-card group"
    >
      {/* ── Card body ──────────────────────────────────── */}
      <div className="chapters-card__body">
        <div className="about-card-top">
          <div className="about-card-header">
            <div className="about-card-icon-wrapper">
              <Building2 size={24} />
            </div>
            <div className="chapters-card__badge-wrap">
              <StatusBadge status={chapter.status} />
            </div>
          </div>
          <h3 className="about-card-title" title={chapter.name}>
            {chapter.name}
          </h3>
        </div>

        <div className="chapters-card__chips" style={{ marginTop: "12px", marginBottom: "8px" }}>
          <span className="chapters-chip">{chapter.islandGroup}</span>
          <span className="chapters-chip chapters-chip--region">{chapter.region}</span>
        </div>

        <div className="chapters-card__description-wrap" style={{ marginTop: "8px", marginBottom: "16px", minHeight: "auto" }}>
          <p className="chapters-card__description select-text" style={{ fontSize: "16px", lineHeight: "1.5" }}>{chapter.description}</p>
        </div>

        {/* Officers list avatars */}
        <div className="chapters-card__officers" style={{ marginTop: "0", marginBottom: "20px" }}>
          <div className="chapters-card__avatars">
            {displayedOfficers.map((officer, idx) => (
              <img
                key={officer.id}
                src={getOfficerAvatar(officer.name)}
                alt={officer.name}
                title={`${officer.name} — ${officer.role}`}
                className="chapters-card__avatar"
                style={{ zIndex: 10 - idx, marginLeft: idx > 0 ? -10 : 0 }}
              />
            ))}
            {remainingCount > 0 && (
              <button
                type="button"
                className="chapters-card__avatar-more"
                style={{ marginLeft: -10 }}
                title={`${remainingCount} more officer${remainingCount > 1 ? "s" : ""}`}
                aria-label={`View ${remainingCount} more officers for ${chapter.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAllOfficers?.(chapter);
                }}
              >
                +{remainingCount}
              </button>
            )}
            {chapter.officers.length === 0 && (
              <span className="text-[14px] text-slate-400 italic">No officers assigned</span>
            )}
          </div>
        </div>

        {/* About PAGE module-style stat row */}
        <div className="about-card-middle" style={{ marginTop: "auto", marginBottom: "0" }}>
          <div className="about-card-stat-block">
            <span className="about-card-stat-label">Officers</span>
            <span className="about-card-stat-value">{chapter.officers.length}</span>
          </div>
          <div className="about-card-stat-block">
            <span className="about-card-stat-label">Updated</span>
            <span className="about-card-stat-value">{formatDateShort(chapter.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="chapters-card__footer" style={{ marginTop: "20px" }}>
        {/* Action row — Manage (primary) + Actions dropdown (secondary) */}
        <div className="chapters-card__footer-action-row" style={{ display: "flex", gap: "12px", width: "100%", padding: "14px 16px" }}>
          {/* Primary: Manage (Edit Module style) */}
          <PillButton
            variant="primary"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(chapter);
            }}
            style={{ flex: 1 }}
            aria-label={`Manage ${chapter.name}`}
          >
            ✏ Manage
          </PillButton>

          {/* Secondary: Actions overflow dropdown */}
          <div className="relative" ref={menuRef} style={{ flexShrink: 0 }}>
            <PillButton
              variant="outline"
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((open) => !open);
              }}
              icon={<MoreVertical size={18} strokeWidth={2.2} aria-hidden="true" />}
              aria-label={`More actions for ${chapter.name}`}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              Actions
            </PillButton>

            {menuOpen && (
              <div
                className="chapters-card__dropdown"
                role="menu"
                aria-label={`Actions for ${chapter.name}`}
                style={{ bottom: "calc(100% + 8px)", right: 0 }}
              >
                {onViewAllOfficers && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewAllOfficers(chapter);
                      setMenuOpen(false);
                    }}
                    className="chapters-card__dropdown-item"
                  >
                    <Eye size={16} aria-hidden="true" />
                    View Officers
                  </button>
                )}
                {onTogglePublish && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePublish(chapter);
                      setMenuOpen(false);
                    }}
                    className="chapters-card__dropdown-item"
                    aria-label={
                      chapter.status === "published"
                        ? `Unpublish ${chapter.name}`
                        : `Publish ${chapter.name}`
                    }
                  >
                    {chapter.status === "published" ? (
                      <>
                        <EyeOff size={16} aria-hidden="true" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Globe size={16} aria-hidden="true" />
                        Publish
                      </>
                    )}
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(chapter);
                      setMenuOpen(false);
                    }}
                    className="chapters-card__dropdown-item chapters-card__dropdown-item--danger"
                    aria-label={`Delete ${chapter.name}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </footer>
    </motion.article>
  );
}
