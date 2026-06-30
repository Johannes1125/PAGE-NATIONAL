"use client";

import { useState, useEffect, useRef } from "react";
import {
  Edit2,
  MoreVertical,
  EyeOff,
  Globe,
  Trash2,
} from "lucide-react";
import { Chapter } from "../types";
import StatusBadge from "./StatusBadge";
import PillButton from "../../components/PillButton";

type ChapterTableProps = {
  chapters: Chapter[];
  onEdit?: (chapter: Chapter) => void;
  onTogglePublish?: (chapter: Chapter) => void;
  onDelete?: (chapter: Chapter) => void;
};

export default function ChapterTable({
  chapters,
  onEdit,
  onTogglePublish,
  onDelete,
}: ChapterTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveMenuId(null);
    }
    if (activeMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [activeMenuId]);

  return (
    <div className="chapters-table-wrap">
      <div className="chapters-table-scroll">
        <table className="chapters-table">
          <thead>
            <tr>
              <th scope="col">Chapter</th>
              <th scope="col">Island Group</th>
              <th scope="col">Region</th>
              <th scope="col">Status</th>
              <th scope="col">Last Updated</th>
              <th scope="col" className="text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((chapter) => {
              return (
                <tr key={chapter.id}>

                  {/* ── Chapter name ── */}
                  <td>
                    <div className="min-w-[220px]">
                      <div className="chapters-table__chapter-name">{chapter.name}</div>
                    </div>
                  </td>

                  {/* ── Island Group ── */}
                  <td>
                    <span className="chapters-chip">{chapter.islandGroup}</span>
                  </td>

                  {/* ── Region ── */}
                  <td>
                    <span className="chapters-chip chapters-chip--region">{chapter.region}</span>
                  </td>

                  {/* ── Status badge ── */}
                  <td>
                    <StatusBadge status={chapter.status} size="sm" />
                  </td>

                  {/* ── Last Updated ── */}
                  <td className="text-[18px] font-semibold text-slate-500 whitespace-nowrap">
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
                          icon={<Edit2 size={16} strokeWidth={2.2} aria-hidden="true" />}
                          aria-label={`Manage ${chapter.name}`}
                        >
                          Manage
                        </PillButton>
                      )}

                      <div
                        className="relative"
                        ref={activeMenuId === chapter.id ? menuRef : null}
                      >
                        <PillButton
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === chapter.id ? null : chapter.id);
                          }}
                          icon={<MoreVertical size={16} strokeWidth={2.2} aria-hidden="true" />}
                          aria-label={`Actions for ${chapter.name}`}
                          aria-expanded={activeMenuId === chapter.id}
                          aria-haspopup="true"
                        />

                        {activeMenuId === chapter.id && (
                          <div
                            className="chapters-card__dropdown chapters-card__dropdown--down"
                            role="menu"
                            aria-label={`Actions for ${chapter.name}`}
                          >
                            {onTogglePublish && (
                              <button
                                type="button"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTogglePublish(chapter);
                                  setActiveMenuId(null);
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
                                  setActiveMenuId(null);
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
