"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, Globe, MoreVertical, Trash2, Building2, MapPin, Edit2, Calendar } from "lucide-react";
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
    hover: {
      y: -3,
      boxShadow: "0 10px 24px -6px rgba(20, 49, 82, 0.12)",
      transition: { duration: 0.18 },
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
      className="chapters-card-v2"
    >
      {/* ── Card body ──────────────────────────────────── */}
      <div className="chapters-card-v2__body">
        {/* Header: Icon + Title + Status */}
        <div className="chapters-card-v2__header">
          <div className="chapters-card-v2__info">
            <div className="chapters-card-v2__icon-box" aria-hidden="true">
              <Building2 size={20} strokeWidth={2.2} />
            </div>
            <div className="chapters-card-v2__title-block">
              <h3 className="chapters-card-v2__title" title={chapter.name}>
                {chapter.name}
              </h3>
              <span className="chapters-card-v2__date">
                <Calendar size={12} strokeWidth={2} className="text-slate-400" />
                Updated {formatDateShort(chapter.updatedAt)}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={chapter.status} size="sm" />
          </div>
        </div>

        {/* Chips Row: Island Group & Region Badges */}
        <div className="chapters-card-v2__chips">
          <span className={`chapters-chip text-[12px] px-2.5 py-0.5 font-semibold ${chapter.islandGroup === "Luzon" ? "chapters-chip--luzon" : chapter.islandGroup === "Visayas" ? "chapters-chip--visayas" : "chapters-chip--mindanao"}`}>
            {chapter.islandGroup}
          </span>
          <span className="chapters-chip chapters-chip--region text-[12px] px-2.5 py-0.5 font-semibold">
            <MapPin size={11} strokeWidth={2.2} />
            <span>{chapter.region}</span>
          </span>
        </div>

        {/* Description Box */}
        <div className="chapters-card-v2__desc-box">
          {chapter.description ? (
            <p className="chapters-card-v2__desc-text">{chapter.description}</p>
          ) : (
            <span className="chapters-card-v2__desc-empty">No description provided</span>
          )}
        </div>

        {/* Officers Row */}
        <div className="chapters-card-v2__officers-row">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {displayedOfficers.map((officer, idx) => (
                <img
                  key={officer.id}
                  src={getOfficerAvatar(officer.name)}
                  alt={officer.name}
                  title={`${officer.name} — ${officer.role}`}
                  className="w-7 h-7 rounded-full border-2 border-white object-cover bg-slate-100 shadow-xs"
                  style={{ zIndex: 10 - idx, marginLeft: idx > 0 ? -8 : 0 }}
                />
              ))}
              {remainingCount > 0 && (
                <button
                  type="button"
                  className="w-7 h-7 rounded-full border-2 border-white bg-blue-50 text-blue-700 text-[11px] font-bold flex items-center justify-center -ml-2 hover:bg-blue-100 transition-colors"
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
            </div>
            <span className="text-[12.5px] font-semibold text-slate-600">
              {chapter.officers.length} {chapter.officers.length === 1 ? "officer" : "officers"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Action Footer ──────────────────────────────────────── */}
      <footer className="chapters-card-v2__footer">
        <PillButton
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(chapter);
          }}
          icon={<Edit2 size={14} strokeWidth={2.2} aria-hidden="true" />}
          style={{ flex: 1, justifyContent: "center" }}
          aria-label={`Manage ${chapter.name}`}
        >
          Manage
        </PillButton>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <PillButton
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            icon={<MoreVertical size={15} strokeWidth={2.2} aria-hidden="true" />}
            style={{ paddingLeft: "10px", paddingRight: "10px" }}
            aria-label={`More actions for ${chapter.name}`}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          />

          {menuOpen && (
            <div
              className="chapters-card__dropdown"
              role="menu"
              aria-label={`Actions for ${chapter.name}`}
              style={{ bottom: "calc(100% + 6px)", right: 0 }}
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
                  <Eye size={15} aria-hidden="true" />
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
                      <EyeOff size={15} aria-hidden="true" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Globe size={15} aria-hidden="true" />
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
                  <Trash2 size={15} aria-hidden="true" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </footer>
    </motion.article>

  );
}


