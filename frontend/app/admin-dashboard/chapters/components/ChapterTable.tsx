"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Edit2,
  MoreVertical,
  EyeOff,
  Globe,
  Trash2,
  Building2,
  MapPin,
  ShieldCheck,
  Calendar,
  SlidersHorizontal,
  Compass,
  Users,
  Eye,
} from "lucide-react";
import { Chapter } from "../types";
import StatusBadge from "./StatusBadge";
import PillButton from "../../components/PillButton";

type ChapterTableProps = {
  chapters: Chapter[];
  onEdit?: (chapter: Chapter) => void;
  onTogglePublish?: (chapter: Chapter) => void;
  onDelete?: (chapter: Chapter) => void;
  onViewOfficers?: (chapter: Chapter) => void;
};


function getIslandChipClass(islandGroup: string) {
  switch (islandGroup) {
    case "Luzon":
      return "chapters-chip chapters-chip--luzon";
    case "Visayas":
      return "chapters-chip chapters-chip--visayas";
    case "Mindanao":
      return "chapters-chip chapters-chip--mindanao";
    default:
      return "chapters-chip";
  }
}

export default function ChapterTable({
  chapters,
  onEdit,
  onTogglePublish,
  onDelete,
}: ChapterTableProps) {
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

  const handleToggleMenu = (chapterId: string) => {
    if (activeMenuId === chapterId) {
      setActiveMenuId(null);
      setMenuPos(null);
    } else {
      const el = buttonRefs.current[chapterId];
      if (el) {
        setMenuPos(computeMenuPos(el));
        setActiveMenuId(chapterId);
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

  const activeChapter = chapters.find((c) => c.id === activeMenuId);

  return (
    <div className="chapters-table-wrap">
      <div className="chapters-table-scroll">
        <table className="chapters-table">
          <thead>
            <tr>
              <th scope="col">
                <span className="flex items-center gap-2">
                  <Building2 size={16} strokeWidth={2.2} className="text-slate-400" />
                  Chapter
                </span>
              </th>
              <th scope="col">
                <span className="flex items-center gap-2">
                  <Compass size={16} strokeWidth={2.2} className="text-slate-400" />
                  Island Group
                </span>
              </th>
              <th scope="col">
                <span className="flex items-center gap-2">
                  <MapPin size={16} strokeWidth={2.2} className="text-slate-400" />
                  Region
                </span>
              </th>
              <th scope="col">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={16} strokeWidth={2.2} className="text-slate-400" />
                  Status
                </span>
              </th>
              <th scope="col">
                <span className="flex items-center gap-2">
                  <Calendar size={16} strokeWidth={2.2} className="text-slate-400" />
                  Last Updated
                </span>
              </th>
              <th scope="col" className="text-right whitespace-nowrap">
                <span className="inline-flex items-center gap-2 justify-end">
                  <SlidersHorizontal size={16} strokeWidth={2.2} className="text-slate-400" />
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((chapter) => {
              return (
                <tr key={chapter.id} className="chapters-table__row">
                  {/* ── Chapter name & Avatar icon ── */}
                  <td>
                    <div className="flex items-center gap-3.5 min-w-[240px]">
                      <div className="chapters-table__chapter-avatar" aria-hidden="true">
                        <Building2 size={20} strokeWidth={2.2} />
                      </div>
                      <div>
                        <div className="chapters-table__chapter-name">{chapter.name}</div>
                        {chapter.description && (
                          <div className="chapters-table__chapter-desc">{chapter.description}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* ── Island Group ── */}
                  <td>
                    <span className={getIslandChipClass(chapter.islandGroup)}>
                      {chapter.islandGroup}
                    </span>
                  </td>

                  {/* ── Region ── */}
                  <td>
                    <span className="chapters-chip chapters-chip--region">
                      <MapPin size={13} strokeWidth={2.2} aria-hidden="true" />
                      <span>{chapter.region}</span>
                    </span>
                  </td>

                  {/* ── Status badge ── */}
                  <td>
                    <StatusBadge status={chapter.status} size="sm" />
                  </td>

                  {/* ── Last Updated ── */}
                  <td className="text-[15px] font-semibold text-slate-600 whitespace-nowrap">
                    {new Date(chapter.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  {/* ── Actions: Manage (primary) + ⋯ Actions dropdown ── */}
                  <td className="text-right whitespace-nowrap">
                    <div className="chapters-table__actions">
                      {onEdit && (
                        <PillButton
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(chapter);
                          }}
                          icon={<Edit2 size={15} strokeWidth={2.2} aria-hidden="true" />}
                          aria-label={`Manage ${chapter.name}`}
                        >
                          Manage
                        </PillButton>
                      )}

                      <div
                        className="inline-block relative"
                        ref={(el) => {
                          buttonRefs.current[chapter.id] = el;
                        }}
                      >
                        <PillButton
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleMenu(chapter.id);
                          }}
                          icon={<MoreVertical size={16} strokeWidth={2.2} aria-hidden="true" />}
                          aria-label={`Actions for ${chapter.name}`}
                          aria-expanded={activeMenuId === chapter.id}
                          aria-haspopup="true"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Fixed Portal Dropdown Menu ── */}
      {mounted && activeMenuId && menuPos && activeChapter && typeof window !== "undefined" && createPortal(
        <div
          ref={menuRef}
          className="chapters-card__dropdown"
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
          aria-label={`Actions for ${activeChapter.name}`}
        >
          {onViewOfficers && (
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                onViewOfficers(activeChapter);
                setActiveMenuId(null);
                setMenuPos(null);
              }}
              className="chapters-card__dropdown-item"
              aria-label={`View Officers for ${activeChapter.name}`}
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
                onTogglePublish(activeChapter);
                setActiveMenuId(null);
                setMenuPos(null);
              }}
              className="chapters-card__dropdown-item"
              aria-label={
                activeChapter.status === "published"
                  ? `Unpublish ${activeChapter.name}`
                  : `Publish ${activeChapter.name}`
              }
            >
              {activeChapter.status === "published" ? (
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
                onDelete(activeChapter);
                setActiveMenuId(null);
                setMenuPos(null);
              }}
              className="chapters-card__dropdown-item chapters-card__dropdown-item--danger"
              aria-label={`Delete ${activeChapter.name}`}
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

