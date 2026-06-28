"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Edit2, Eye, MoreVertical, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Chapter } from "../types";
import StatusBadge from "./StatusBadge";
import { getOfficerAvatar } from "./OfficerPreview";
import { formatDateShort, formatRelativeTime } from "../utils/formatters";

type ChapterCardProps = {
  chapter: Chapter;
  onEdit?: (chapter: Chapter) => void;
  onDuplicate?: (chapter: Chapter) => void;
  onTogglePublish?: (chapter: Chapter) => void;
  onMoreActions?: (chapter: Chapter) => void;
  onViewAllOfficers?: (chapter: Chapter) => void;
};

export default function ChapterCard({
  chapter,
  onEdit,
  onViewAllOfficers,
  onMoreActions,
}: ChapterCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
      <div className="chapters-card__body">
        <header className="chapters-card__header">
          <h3 className="chapters-card__title" title={chapter.name}>
            {chapter.name}
          </h3>
          <div className="chapters-card__badge-wrap">
            <StatusBadge status={chapter.status} />
          </div>
        </header>

        <div className="chapters-card__chips">
          <span className="chapters-chip">{chapter.islandGroup}</span>
          <span className="chapters-chip chapters-chip--region">{chapter.region}</span>
        </div>

        <div className="chapters-card__description-wrap">
          <p className="chapters-card__description select-text">{chapter.description}</p>
        </div>

        <div className="chapters-card__officers">
          <h4 className="chapters-card__officers-label">Officers ({chapter.officers.length})</h4>
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
              <div
                className="chapters-card__avatar-more"
                title={`${remainingCount} more officer${remainingCount > 1 ? "s" : ""}`}
              >
                +{remainingCount}
              </div>
            )}
            {chapter.officers.length === 0 && (
              <span className="text-[16px] text-slate-400 italic">No officers assigned</span>
            )}
          </div>
        </div>
      </div>

      <footer className="chapters-card__footer">
        <div className="chapters-card__footer-meta-row">
          <div className="chapters-card__meta">
            <div className="chapters-card__meta-block">
              <div className="chapters-card__meta-heading">
                <Clock size={16} aria-hidden="true" />
                Updated
              </div>
              <span className="chapters-card__meta-value">{formatRelativeTime(chapter.updatedAt)}</span>
            </div>
            <div className="chapters-card__meta-block">
              <div className="chapters-card__meta-heading">
                <Calendar size={16} aria-hidden="true" />
                Created
              </div>
              <span className="chapters-card__meta-value">{formatDateShort(chapter.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="chapters-card__footer-action-row">
          <div className="chapters-card__actions">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(chapter);
                }}
                className="chapters-icon-btn"
                title="Edit chapter"
                aria-label={`Edit ${chapter.name}`}
              >
                <Edit2 size={20} strokeWidth={2.2} />
              </button>
            )}
            {onViewAllOfficers && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAllOfficers(chapter);
                }}
                className="chapters-icon-btn"
                title="View officers"
                aria-label={`View officers for ${chapter.name}`}
              >
                <Eye size={20} strokeWidth={2.2} />
              </button>
            )}
            {onMoreActions && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((open) => !open);
                  }}
                  className="chapters-icon-btn"
                  title="More actions"
                  aria-label={`More actions for ${chapter.name}`}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                >
                  <MoreVertical size={20} strokeWidth={2.2} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 bottom-[calc(100%+8px)] min-w-[180px] bg-white border border-slate-200 rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-1.5 z-40 flex flex-col">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoreActions(chapter);
                        setMenuOpen(false);
                      }}
                      className="w-full px-5 py-3.5 text-[18px] font-semibold text-[#dc2626] hover:bg-[#f3f4f6] text-left flex items-center gap-2"
                      aria-label={`Delete ${chapter.name}`}
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </footer>
    </motion.article>
  );
}
