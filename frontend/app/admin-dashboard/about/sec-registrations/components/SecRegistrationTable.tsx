"use client";

import { Eye, Edit2, Trash2 } from "lucide-react";

interface SecRegistration {
  id: string;
  registrationName: string;
  registrationNumber: string;
  dateOfIncorporation: string;
  exemptionCategory: string;
  imageUrl?: string | null;
  createdAt: string;
}

interface SecRegistrationTableProps {
  records: SecRegistration[];
  onEdit: (record: SecRegistration) => void;
  onDelete: (record: SecRegistration) => void;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
}

export default function SecRegistrationTable({
  records,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}: SecRegistrationTableProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      <div style={{ overflowX: "auto", border: "1px solid var(--r-border)", borderRadius: "14px", background: "var(--r-surface)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px", textAlign: "left" }}>
          <thead>
            <tr style={{ 
              background: "var(--r-surface-2)", 
              borderBottom: "2px solid var(--r-border)",
              position: "sticky",
              top: 0,
              zIndex: 10
            }}>
              <th style={{ padding: "18px 24px", fontSize: "18px", fontWeight: 700, color: "var(--p-navy)" }}>Registration Name</th>
              <th style={{ padding: "18px 24px", fontSize: "18px", fontWeight: 700, color: "var(--p-navy)" }}>Registration Number</th>
              <th style={{ padding: "18px 24px", fontSize: "18px", fontWeight: 700, color: "var(--p-navy)" }}>Date of Incorporation</th>
              <th style={{ padding: "18px 24px", fontSize: "18px", fontWeight: 700, color: "var(--p-navy)" }}>Exemption Category</th>
              <th style={{ padding: "18px 24px", fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", textAlign: "center" }}>Certificate</th>
              <th style={{ padding: "18px 24px", fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((record) => (
                <tr 
                  key={record.id} 
                  style={{ 
                    borderBottom: "1px solid var(--r-border-mid)",
                    transition: "background 0.2s ease",
                  }}
                  className="table-row-hover"
                >
                  <td style={{ padding: "24px", fontSize: "18px", fontWeight: 600, color: "var(--r-text)", verticalAlign: "middle" }}>
                    {record.registrationName}
                  </td>
                  <td style={{ padding: "24px", fontSize: "18px", color: "var(--r-text-mid)", verticalAlign: "middle" }}>
                    <code style={{ background: "rgba(30, 83, 142, 0.06)", padding: "4px 8px", borderRadius: "6px", fontSize: "16px" }}>
                      {record.registrationNumber}
                    </code>
                  </td>
                  <td style={{ padding: "24px", fontSize: "18px", color: "var(--r-text-mid)", verticalAlign: "middle" }}>
                    {formatDate(record.dateOfIncorporation)}
                  </td>
                  <td style={{ padding: "24px", fontSize: "18px", color: "var(--r-text-mid)", verticalAlign: "middle" }}>
                    {record.exemptionCategory}
                  </td>
                  <td style={{ padding: "24px", textAlign: "center", verticalAlign: "middle" }}>
                    {record.imageUrl ? (
                      <a
                        href={record.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "56px",
                          height: "56px",
                          borderRadius: "10px",
                          border: "1px solid var(--r-border-mid)",
                          background: "#f9fafb",
                          overflow: "hidden",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={record.imageUrl}
                          alt="Certificate Thumbnail"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </a>
                    ) : (
                      <span style={{ fontSize: "18px", color: "var(--r-text-muted)", fontStyle: "italic" }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: "24px", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        className="focus-ring"
                        aria-label={`Edit record for ${record.registrationName}`}
                        style={{
                          height: "52px",
                          width: "52px",
                          borderRadius: "10px",
                          border: "1px solid var(--r-border-mid)",
                          background: "var(--r-surface-2)",
                          color: "var(--p-blue)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(record)}
                        className="focus-ring"
                        aria-label={`Delete record for ${record.registrationName}`}
                        style={{
                          height: "52px",
                          width: "52px",
                          borderRadius: "10px",
                          border: "none",
                          background: "var(--p-rose-pale)",
                          color: "var(--p-rose)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: "48px", textAlign: "center", fontSize: "18px", color: "var(--r-text-muted)" }}>
                  No SEC registration records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <span style={{ fontSize: "18px", fontWeight: 500, color: "var(--r-text-muted)" }}>
            Showing page {pagination.page} of {pagination.totalPages}
          </span>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="focus-ring"
              style={{
                height: "52px",
                padding: "0 24px",
                borderRadius: "10px",
                fontSize: "18px",
                fontWeight: 600,
                color: pagination.page <= 1 ? "var(--r-text-muted)" : "var(--r-text-mid)",
                background: "var(--r-surface-2)",
                border: "1px solid var(--r-border-mid)",
                cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                opacity: pagination.page <= 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="focus-ring"
              style={{
                height: "52px",
                padding: "0 24px",
                borderRadius: "10px",
                fontSize: "18px",
                fontWeight: 600,
                color: pagination.page >= pagination.totalPages ? "var(--r-text-muted)" : "var(--r-text-mid)",
                background: "var(--r-surface-2)",
                border: "1px solid var(--r-border-mid)",
                cursor: pagination.page >= pagination.totalPages ? "not-allowed" : "pointer",
                opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
