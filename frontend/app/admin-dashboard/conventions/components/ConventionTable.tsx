"use client";

import { Pencil, SendHorizonal } from "lucide-react";
import type { Convention } from "../types";
import StatusBadge from "./StatusBadge";

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
                <td style={{ fontSize: "16px", fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>
                  {formatDate(convention.updated_at)}
                </td>

                {/* Actions */}
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <div className="conv-table__actions">
                    <button
                      type="button"
                      className="conv-btn conv-btn--primary"
                      style={{ minHeight: "40px", padding: "0 16px", fontSize: "15px" }}
                      onClick={() => onEdit(convention)}
                      aria-label={`Edit ${convention.title}`}
                    >
                      <Pencil size={14} strokeWidth={2.5} aria-hidden="true" />
                      Edit
                    </button>

                    <button
                      type="button"
                      className={`conv-btn ${convention.status === "published" ? "conv-btn--secondary" : "conv-btn--primary"}`}
                      style={{ minHeight: "40px", padding: "0 16px", fontSize: "15px" }}
                      onClick={() => onTogglePublish(convention)}
                      aria-label={
                        convention.status === "published"
                          ? `Unpublish ${convention.title}`
                          : `Publish ${convention.title}`
                      }
                    >
                      <SendHorizonal size={14} strokeWidth={2.5} aria-hidden="true" />
                      {convention.status === "published"
                        ? "Unpublish"
                        : "Publish"}
                    </button>

                    <button
                      type="button"
                      className="conv-btn conv-btn--danger"
                      style={{ minHeight: "40px", padding: "0 16px", fontSize: "15px" }}
                      onClick={() => onDelete(convention)}
                      aria-label={`Delete ${convention.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

