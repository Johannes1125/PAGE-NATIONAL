"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Pencil, MoreVertical, EyeOff, Globe, Trash2, Landmark } from "lucide-react";
import type { Convention } from "../types";
import StatusBadge from "./StatusBadge";
import PillButton from "../../components/PillButton";

type ConventionCardProps = {
  convention: Convention;
  onEdit: (convention: Convention) => void;
  onDelete: (convention: Convention) => void;
  onTogglePublish: (convention: Convention) => void;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(startStr: string, endStr: string): string {
  const start = formatDate(startStr);
  const end = formatDate(endStr);
  return start === end ? start : `${start} – ${end}`;
}

export default function ConventionCard({
  convention,
  onEdit,
  onDelete,
  onTogglePublish,
}: ConventionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
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
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.22, ease: "easeOut" as const },
    },
    hover: {
      y: -4,
      boxShadow: "0 12px 28px -8px rgba(20, 49, 82, 0.12)",
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.article
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      className="conv-card group"
    >
      {/* ── Card body ──────────────────────────────── */}
      <div className="conv-card__body">
        <div className="about-card-top">
          <div className="about-card-header">
            <div className="about-card-icon-wrapper">
              <Landmark size={24} />
            </div>
            <div style={{ flexShrink: 0 }}>
              <StatusBadge status={convention.status} />
            </div>
          </div>

          {/* Convention number chip */}
          <div style={{ marginTop: "10px" }}>
            <span className="conv-card__number">
              #{convention.convention_number}
            </span>
          </div>

          <h3 className="about-card-title" title={convention.title}>
            {convention.title}
          </h3>
        </div>

        {/* Meta info */}
        <div className="conv-card__meta">
          <div className="conv-card__meta-item">
            <MapPin size={16} strokeWidth={2} />
            <span>{convention.location}</span>
          </div>
          <div className="conv-card__meta-item">
            <Calendar size={16} strokeWidth={2} />
            <span>{formatDateRange(convention.start_date, convention.end_date)}</span>
          </div>
        </div>

        {/* Description preview */}
        {convention.description && (
          <p className="conv-card__description">{convention.description}</p>
        )}

        {/* Footer stats */}
        <div className="about-card-middle" style={{ marginTop: "auto", marginBottom: "0" }}>
          <div className="about-card-stat-block">
            <span className="about-card-stat-label">Status</span>
            <span className="about-card-stat-value" style={{ textTransform: "capitalize" }}>
              {convention.status}
            </span>
          </div>
          <div className="about-card-stat-block">
            <span className="about-card-stat-label">Updated</span>
            <span className="about-card-stat-value">
              {formatDate(convention.updated_at)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer actions ──────────────────────────── */}
      <footer className="conv-card__footer-actions" style={{ display: "flex", gap: "10px", padding: "14px 16px" }}>
        <PillButton
          variant="primary"
          size="sm"
          onClick={() => onEdit(convention)}
          style={{ flex: 1 }}
          icon={<Pencil size={15} strokeWidth={2.2} aria-hidden="true" />}
          aria-label={`Edit ${convention.title}`}
        >
          Edit
        </PillButton>

        <div className="relative" ref={menuRef} style={{ flexShrink: 0 }}>
          <PillButton
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            icon={<MoreVertical size={16} strokeWidth={2.2} aria-hidden="true" />}
            aria-label={`Actions for ${convention.title}`}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          />

          {menuOpen && (
            <div
              className="conv-card__dropdown conv-card__dropdown--up"
              role="menu"
              aria-label={`Actions for ${convention.title}`}
              style={{ bottom: "calc(100% + 8px)", right: 0 }}
            >
              {onTogglePublish && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePublish(convention);
                    setMenuOpen(false);
                  }}
                  className="conv-card__dropdown-item"
                  aria-label={
                    convention.status === "published"
                      ? `Unpublish ${convention.title}`
                      : `Publish ${convention.title}`
                  }
                >
                  {convention.status === "published" ? (
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
                    onDelete(convention);
                    setMenuOpen(false);
                  }}
                  className="conv-card__dropdown-item conv-card__dropdown-item--danger"
                  aria-label={`Delete ${convention.title}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
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
