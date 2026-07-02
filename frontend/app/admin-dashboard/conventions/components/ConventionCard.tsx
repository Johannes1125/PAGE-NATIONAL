"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Pencil, Send, SendHorizonal, Landmark } from "lucide-react";
import type { Convention } from "../types";
import StatusBadge from "./StatusBadge";

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

export default function ConventionCard({
  convention,
  onEdit,
  onDelete,
  onTogglePublish,
}: ConventionCardProps) {
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
            <span>{formatDate(convention.convention_date)}</span>
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
      <footer className="conv-card__footer-actions">
        <button
          type="button"
          className="conv-btn conv-btn--primary"
          onClick={() => onEdit(convention)}
          style={{ flex: 1 }}
          aria-label={`Edit ${convention.title}`}
        >
          <Pencil size={16} strokeWidth={2.5} aria-hidden="true" />
          Edit
        </button>

        <button
          type="button"
          className={`conv-btn ${convention.status === "published" ? "conv-btn--secondary" : "conv-btn--primary"}`}
          onClick={() => onTogglePublish(convention)}
          aria-label={
            convention.status === "published"
              ? `Unpublish ${convention.title}`
              : `Publish ${convention.title}`
          }
        >
          <SendHorizonal size={16} strokeWidth={2.5} aria-hidden="true" />
          {convention.status === "published" ? "Unpublish" : "Publish"}
        </button>

        <button
          type="button"
          className="conv-btn conv-btn--danger"
          onClick={() => onDelete(convention)}
          aria-label={`Delete ${convention.title}`}
        >
          Delete
        </button>
      </footer>
    </motion.article>
  );
}

