"use client";

import { Eye, Edit2, Trash2, FileText } from "lucide-react";

interface BirCertification {
  id: string;
  registrationName: string;
  tinNumber: string;
  certificationNumber: string;
  exemptionCategory: string;
  dateOfIssuance: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BirCertificationTableProps {
  records: BirCertification[];
  onEdit: (record: BirCertification) => void;
  onDelete: (record: BirCertification) => void;
}

export default function BirCertificationTable({
  records,
  onEdit,
  onDelete,
}: BirCertificationTableProps) {
  const isPdf = (url: string | null | undefined): boolean => {
    if (!url) return false;
    const cleanUrl = url.split(/[?#]/)[0];
    return cleanUrl.toLowerCase().endsWith(".pdf");
  };

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
      <div style={{ overflowX: "auto" }}>
        <table className="bir-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px", textAlign: "left" }}>
          <thead>
            <tr>
              <th style={{ whiteSpace: "nowrap" }}>Registration Name</th>
              <th style={{ whiteSpace: "nowrap" }}>TIN Number</th>
              <th style={{ whiteSpace: "nowrap" }}>Certification Number</th>
              <th style={{ whiteSpace: "nowrap" }}>Exemption Category</th>
              <th style={{ whiteSpace: "nowrap" }}>Date of Issuance</th>
              <th style={{ whiteSpace: "nowrap", textAlign: "center" }}>Image</th>
              <th style={{ whiteSpace: "nowrap", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((record) => (
                <tr key={record.id}>
                  <td style={{ fontWeight: 600, color: "var(--r-text)" }}>
                    {record.registrationName}
                  </td>
                  <td>
                    <code style={{ background: "rgba(30, 83, 142, 0.06)", padding: "4px 8px", borderRadius: "6px", fontSize: "16px" }}>
                      {record.tinNumber}
                    </code>
                  </td>
                  <td style={{ color: "var(--r-text-mid)" }}>
                    {record.certificationNumber}
                  </td>
                  <td style={{ color: "var(--r-text-mid)" }}>
                    {record.exemptionCategory}
                  </td>
                  <td style={{ color: "var(--r-text-mid)" }}>
                    {formatDate(record.dateOfIssuance)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {record.imageUrl ? (
                      <a
                        href={record.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring bir-thumbnail-container"
                      >
                        {isPdf(record.imageUrl) ? (
                          <FileText size={22} style={{ color: "var(--p-rose)" }} />
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={record.imageUrl}
                            alt="Certificate Thumbnail"
                          />
                        )}
                      </a>
                    ) : (
                      <span style={{ fontSize: "15px", color: "var(--r-text-muted)", fontStyle: "italic" }}>None</span>
                    )}
                  </td>
                  <td>
                    <div className="bir-actions-cell">
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        className="focus-ring"
                        aria-label={`Edit record for ${record.registrationName}`}
                        style={{
                          height: "40px",
                          width: "40px",
                          borderRadius: "8px",
                          border: "1px solid var(--r-border-mid)",
                          background: "var(--r-surface-2)",
                          color: "var(--p-blue)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(record)}
                        className="focus-ring"
                        aria-label={`Delete record for ${record.registrationName}`}
                        style={{
                          height: "40px",
                          width: "40px",
                          borderRadius: "8px",
                          border: "none",
                          background: "var(--p-rose-pale)",
                          color: "var(--p-rose)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: "60px 32px", textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--p-navy)", marginBottom: "8px" }}>
                    No BIR certifications found
                  </h3>
                  <p style={{ fontSize: "16px", color: "var(--r-text-muted)", margin: 0 }}>
                    Add the first BIR certification record to get started.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
