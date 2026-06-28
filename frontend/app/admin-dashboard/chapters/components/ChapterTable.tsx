"use client";

import { useState, useEffect, useRef } from "react";
import {
  Edit2,
  Copy,
  MoreVertical,
  Eye,
  EyeOff,
  Globe,
  Trash2,
} from "lucide-react";
import { Chapter } from "../types";
import StatusBadge from "./StatusBadge";
import { getOfficerAvatar } from "./OfficerPreview";

type ChapterTableProps = {
  chapters: Chapter[];
  selectedChapters: string[];
  onSelectChapter: (id: string, selected: boolean) => void;
  onSelectAllChapters: (selected: boolean) => void;
  onEdit?: (chapter: Chapter) => void;
  onDuplicate?: (chapter: Chapter) => void;
  onTogglePublish?: (chapter: Chapter) => void;
  onDelete?: (chapter: Chapter) => void;
};

export default function ChapterTable({
  chapters,
  selectedChapters,
  onSelectChapter,
  onSelectAllChapters,
  onEdit,
  onDuplicate,
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
    if (activeMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuId]);

  const isAllSelected = chapters.length > 0 && chapters.every((c) => selectedChapters.includes(c.id));
  const isSomeSelected =
    chapters.length > 0 && chapters.some((c) => selectedChapters.includes(c.id)) && !isAllSelected;

  const handleRowClick = (e: React.MouseEvent, chapterId: string) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("select") || target.closest("input") || target.closest("a")) {
      return;
    }
    const isSelected = selectedChapters.includes(chapterId);
    onSelectChapter(chapterId, !isSelected);
  };

  return (
    <section className="chapters-section" aria-label="Chapters list">
      <h2 className="chapters-section__label">All Chapters</h2>
      <div className="chapters-table-wrap">
        <div className="chapters-table-scroll">
          <table className="chapters-table">
            <thead>
              <tr>
                <th scope="col" className="chapters-table__checkbox-cell">
                  <label htmlFor="select-all-chapters" className="sr-only">Select all chapters</label>
                  <input
                    id="select-all-chapters"
                    type="checkbox"
                    className="chapters-table__checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => onSelectAllChapters(e.target.checked)}
                  />
                </th>
                <th scope="col">Chapter</th>
                <th scope="col">Island Group</th>
                <th scope="col">Region</th>
                <th scope="col">Officers</th>
                <th scope="col">Status</th>
                <th scope="col">Last Updated</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((chapter) => {
                const isSelected = selectedChapters.includes(chapter.id);

                return (
                  <tr
                    key={chapter.id}
                    onClick={(e) => handleRowClick(e, chapter.id)}
                    className={`cursor-pointer ${isSelected ? "chapters-table__row--selected" : ""}`}
                  >
                    <td className="chapters-table__checkbox-cell">
                      <label htmlFor={`select-chapter-${chapter.id}`} className="sr-only">Select {chapter.name}</label>
                      <input
                        id={`select-chapter-${chapter.id}`}
                        type="checkbox"
                        className="chapters-table__checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectChapter(chapter.id, e.target.checked)}
                      />
                    </td>

                    <td>
                      <div className="min-w-[200px]">
                        <div className="chapters-table__chapter-name">{chapter.name}</div>
                        <div className="chapters-table__chapter-desc">{chapter.description}</div>
                      </div>
                    </td>

                    <td>
                      <span className="chapters-chip">{chapter.islandGroup}</span>
                    </td>

                    <td>
                      <span className="chapters-chip chapters-chip--region">{chapter.region}</span>
                    </td>

                    <td>
                      <div className="flex items-center gap-3">
                        {chapter.officers.length > 0 ? (
                          <div className="flex items-center">
                            {chapter.officers.slice(0, 3).map((off, idx) => (
                              <img
                                key={off.id}
                                src={getOfficerAvatar(off.name)}
                                alt={off.name}
                                title={`${off.name} (${off.role})`}
                                className="chapters-card__avatar"
                                style={{ zIndex: 10 - idx, marginLeft: idx > 0 ? -8 : 0, width: 32, height: 32 }}
                              />
                            ))}
                            {chapter.officers.length > 3 && (
                              <div className="chapters-card__avatar-more" style={{ marginLeft: -8, width: 32, height: 32 }}>
                                +{chapter.officers.length - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[16px] text-slate-400 italic">None</span>
                        )}
                        <span className="text-[16px] font-semibold text-slate-600 whitespace-nowrap">
                          {chapter.officers.length}
                        </span>
                      </div>
                    </td>

                    <td>
                      <StatusBadge status={chapter.status} size="sm" />
                    </td>

                    <td className="text-[16px] font-semibold text-slate-500 whitespace-nowrap">
                      {new Date(chapter.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td>
                      <div className="chapters-table__actions">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(chapter)}
                            className="chapters-icon-btn"
                            title="Edit chapter"
                            aria-label={`Edit ${chapter.name}`}
                          >
                            <Edit2 size={20} strokeWidth={2.2} />
                          </button>
                        )}

                        {onDuplicate && (
                          <button
                            type="button"
                            onClick={() => onDuplicate(chapter)}
                            className="chapters-icon-btn"
                            title="Duplicate chapter"
                            aria-label={`Duplicate ${chapter.name}`}
                          >
                            <Copy size={20} strokeWidth={2.2} />
                          </button>
                        )}

                        <div className="relative" ref={activeMenuId === chapter.id ? menuRef : null}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === chapter.id ? null : chapter.id);
                            }}
                            className="chapters-icon-btn"
                            aria-label="More actions"
                            aria-expanded={activeMenuId === chapter.id}
                            aria-haspopup="true"
                          >
                            <MoreVertical size={20} strokeWidth={2.2} />
                          </button>

                          {activeMenuId === chapter.id && (
                            <div className="absolute right-0 bottom-[calc(100%+8px)] min-w-[180px] bg-white border border-slate-200 rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-1.5 z-40 flex flex-col">
                                {onTogglePublish && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onTogglePublish(chapter);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-5 py-3.5 text-[18px] font-semibold text-[#0e2340] hover:bg-[#f3f4f6] flex items-center gap-2"
                                    aria-label={chapter.status === "published" ? `Unpublish ${chapter.name}` : `Publish ${chapter.name}`}
                                  >
                                    {chapter.status === "published" ? (
                                      <>
                                        <EyeOff size={18} />
                                        Unpublish
                                      </>
                                    ) : (
                                      <>
                                        <Globe size={18} />
                                        Publish
                                      </>
                                    )}
                                  </button>
                                )}
                                {onDelete && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDelete(chapter);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-5 py-3.5 text-[18px] font-semibold text-[#dc2626] hover:bg-[#f3f4f6] flex items-center gap-2 border-t border-slate-200"
                                    aria-label={`Delete ${chapter.name}`}
                                  >
                                    <Trash2 size={18} />
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
    </section>
  );
}
