"use client";

import React from "react";
import { FileText, CheckCircle, Trash2 } from "lucide-react";
import { PageSeal } from "../../components/PageSeal";

interface DocumentUploadProps {
  draftId: string;
  slotName: string;
  label: string;
  file: { name: string; size?: number; url?: string } | null;
  error?: string | null;
  isUploading: boolean;
  onFileChange: (slotName: string, file: File | null) => void;
  required?: boolean;
}

const formatBytes = (bytes?: number): string => {
  if (!bytes) return "";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const isImageFile = (name: string) => /\.(jpg|jpeg|png|webp)$/i.test(name);

export function DocumentUpload({
  slotName,
  label,
  file,
  error,
  isUploading,
  onFileChange,
  required = false,
}: DocumentUploadProps) {
  const fileInputId = `file-${slotName}`;
  const hasFile = Boolean(file);
  const hasImagePreview = file?.url && isImageFile(file.name);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileChange(slotName, dropped);
  };

  const handleClick = () => {
    if (!isUploading) document.getElementById(fileInputId)?.click();
  };

  return (
    <div className="af-field" style={{ marginBottom: "16px" }}>
      {label && (
        <label
          className="af-label"
          style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", display: "block" }}
        >
          {label}{" "}
          {required && <span className="af-req">*</span>}
        </label>
      )}

      {/* Upload zone */}
      <div
        className={[
          "af-upload",
          hasFile ? "af-upload--success" : "",
          error ? "af-upload--error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ cursor: isUploading ? "not-allowed" : "pointer" }}
        role="button"
        tabIndex={0}
        aria-label={`${hasFile ? "Replace" : "Upload"} ${label}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          type="file"
          id={fileInputId}
          accept={slotName === "photo_1x1" ? ".jpg,.jpeg,.png" : ".pdf,.jpg,.jpeg,.png"}
          style={{ display: "none" }}
          disabled={isUploading}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            onFileChange(slotName, f);
          }}
        />

        {isUploading ? (
          /* ── Uploading state ── */
          <div style={{ textAlign: "center" }}>
            <div className="af-spinner" style={{ width: "24px", height: "24px", margin: "0 auto 10px" }} />
            <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--af-navy)", fontStyle: "italic" }}>
              Depositing document…
            </span>
          </div>
        ) : hasFile ? (
          /* ── Success state: seal motif ── */
          hasImagePreview ? (
            <div style={{ textAlign: "center" }}>
              <img
                src={file!.url}
                alt={`${label} preview`}
                style={{
                  width: "88px",
                  height: "88px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  border: "2px solid rgba(26,92,59,0.4)",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  marginBottom: "10px",
                  display: "block",
                  margin: "0 auto 10px",
                }}
              />
              <span className="af-upload__text" style={{ fontSize: "13px", color: "var(--af-success)" }}>
                Portrait lodged — click to replace
              </span>
            </div>
          ) : (
            <div className="af-upload__seal-confirm">
              <PageSeal size={36} variant="full" />
              <span className="af-upload__seal-confirm-label">Document lodged</span>
              <span className="af-upload__text" style={{ fontSize: "12px", color: "var(--af-ink-60, rgba(12,26,46,0.6))" }}>
                Click to replace
              </span>
            </div>
          )
        ) : (
          /* ── Empty state: document-register feel ── */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div className="af-upload__icon-wrap">
              <FileText size={26} />
            </div>
            <span className="af-upload__text">
              Attach {label}
            </span>
            <span className="af-upload__hint">
              {slotName === "photo_1x1"
                ? "JPG · PNG — max 5 MB"
                : "PDF · JPG · PNG — max 5 MB"}
            </span>
            <span style={{ fontSize: "11px", color: "var(--af-ink-30, rgba(12,26,46,0.3))", marginTop: "2px" }}>
              drag and drop or click to browse
            </span>
          </div>
        )}

        {/* File confirmation chip (shown after upload, doesn't block click-to-replace) */}
        {hasFile && !isUploading && (
          <div
            className="af-upload__file"
            onClick={(e) => e.stopPropagation()}
            style={{ marginTop: "14px" }}
          >
            <CheckCircle size={14} style={{ color: "var(--af-success)", flexShrink: 0 }} />
            <span
              className="af-upload__file-name"
              title={file!.name}
            >
              {file!.name}
            </span>
            {file!.size && (
              <span style={{ fontSize: "11px", color: "var(--af-ink-60, rgba(12,26,46,0.55))", flexShrink: 0 }}>
                {formatBytes(file!.size)}
              </span>
            )}
            <button
              type="button"
              className="af-upload__file-clear"
              onClick={() => onFileChange(slotName, null)}
              aria-label={`Remove ${label}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <span
          style={{
            color: "var(--af-error)",
            fontSize: "13px",
            marginTop: "6px",
            display: "block",
            fontWeight: 500,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
