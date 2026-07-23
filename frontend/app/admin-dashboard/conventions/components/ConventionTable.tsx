"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Pencil, MoreVertical, EyeOff, Globe, Trash2 } from "lucide-react";
import type { Convention } from "../types";
import StatusBadge from "./StatusBadge";
import PillButton from "../../components/PillButton";

type ConventionTableProps = {
  conventions: Convention[];
  onEdit: (convention: Convention) => void;
  onDelete: (convention: Convention) => void;
  onTogglePublish: (convention: Convention) => void;
};

function formatDateRange(startStr: string, endStr: string): string {
  const fmt = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const start = fmt(startStr);
  const end = fmt(endStr);
  return start === end ? start : `${start} – ${end}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ConventionTable({
  conventions,
  onEdit,
  onDelete,
  onTogglePublish,
}: ConventionTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const computeMenuPos = (el: HTMLDivElement) => {
    const rect = el.getBoundingClientRect();
    const dropdownHeight = 110;
    const spaceBelow = window.innerHeight - rect.bottom;

    if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
      return {
        top: Math.max(10, rect.top - dropdownHeight - 6),
        right: Math.max(10, window.innerWidth - rect.right),
      };
    }
    return {
      top: rect.bottom + 6,
      right: Math.max(10, window.innerWidth - rect.right),
    };
  };

  const handleToggleMenu = (conventionId: string) => {
    if (activeMenuId === conventionId) {
      setActiveMenuId(null);
      setMenuPos(null);
    } else {
      const el = buttonRefs.current[conventionId];
      if (el) {
        setMenuPos(computeMenuPos(el));
        setActiveMenuId(conventionId);
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        activeMenuId &&
        buttonRefs.current[activeMenuId] &&
        !buttonRefs.current[activeMenuId]?.contains(event.target as Node)
      ) {
        setActiveMenuId(null);
        setMenuPos(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveMenuId(null);
        setMenuPos(null);
      }
    }

    function handleScrollOrResize() {
      if (activeMenuId && buttonRefs.current[activeMenuId]) {
        setMenuPos(computeMenuPos(buttonRefs.current[activeMenuId]!));
      }
    }

    if (activeMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [activeMenuId]);

  const activeConvention = conventions.find((c) => c.id === activeMenuId);

  return (
    <div className="conv-table-wrap">
      <div className="conv-table-scroll">
        <table className="conv-table">
          <thead>
            <tr>
              <th scope="col">Convention #</th>
              <th scope="col">Title</th>
              <th scope="col">Location</th>
              <th scope="col">Dates</th>
              <th scope="col">Status</th>
              <th scope="col">Last Updated</th>
              <th scope="col" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {conventions.map((convention) => (
              <tr key={convention.id}>
                {/* Convention # */}
                <td>
                  <span
                    className="conv-card__number"
                    style={{ fontSize: "13px" }}
                  >
                    #{convention.convention_number}
                  </span>
                </td>

                {/* Title */}
                <td>
                  <div className="conv-table__title-cell">
                    {convention.title}
                  </div>
                </td>

                {/* Location */}
                <td style={{ whiteSpace: "nowrap" }}>{convention.location}</td>

                {/* Convention Date */}
                <td style={{ whiteSpace: "nowrap" }}>
                  {formatDateRange(convention.start_date, convention.end_date)}
                </td>

                {/* Status */}
                <td>
                  <StatusBadge status={convention.status} size="sm" />
                </td>

                {/* Last Updated */}
                <td style={{ fontSize: "15px", fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>
                  {formatDate(convention.updated_at)}
                </td>

                {/* Actions: Edit (primary) + ⋯ Actions dropdown */}
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <div className="conv-table__actions">
                    <PillButton
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(convention);
                      }}
                      icon={<Pencil size={15} strokeWidth={2.2} aria-hidden="true" />}
                      aria-label={`Edit ${convention.title}`}
                    >
                      Edit
                    </PillButton>

                    <div
                      className="inline-block relative"
                      ref={(el) => {
                        buttonRefs.current[convention.id] = el;
                      }}
                    >
                      <PillButton
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMenu(convention.id);
                        }}
                        icon={<MoreVertical size={16} strokeWidth={2.2} aria-hidden="true" />}
                        aria-label={`Actions for ${convention.title}`}
                        aria-expanded={activeMenuId === convention.id}
                        aria-haspopup="true"
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Fixed Portal Dropdown Menu ── */}
      {mounted && activeMenuId && menuPos && activeConvention && typeof window !== "undefined" && createPortal(
        <div
          ref={menuRef}
          className="conv-card__dropdown"
          style={{
            position: "fixed",
            top: `${menuPos.top}px`,
            right: `${menuPos.right}px`,
            bottom: "auto",
            left: "auto",
            background: "#ffffff",
            zIndex: 99999,
            minWidth: "180px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)",
          }}
          role="menu"
          aria-label={`Actions for ${activeConvention.title}`}
        >
          {onTogglePublish && (
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePublish(activeConvention);
                setActiveMenuId(null);
                setMenuPos(null);
              }}
              className="conv-card__dropdown-item"
              aria-label={
                activeConvention.status === "published"
                  ? `Unpublish ${activeConvention.title}`
                  : `Publish ${activeConvention.title}`
              }
            >
              {activeConvention.status === "published" ? (
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
                onDelete(activeConvention);
                setActiveMenuId(null);
                setMenuPos(null);
              }}
              className="conv-card__dropdown-item conv-card__dropdown-item--danger"
              aria-label={`Delete ${activeConvention.title}`}
            >
              <Trash2 size={16} aria-hidden="true" />
              Delete
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
