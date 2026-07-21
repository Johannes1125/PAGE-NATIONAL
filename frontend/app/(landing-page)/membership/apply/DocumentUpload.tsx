import React from "react";
import { Upload, CheckCircle, FileCheck, Trash2 } from "lucide-react";

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

export function DocumentUpload({
  draftId,
  slotName,
  label,
  file,
  error,
  isUploading,
  onFileChange,
  required = false,
}: DocumentUploadProps) {
  const fileInputId = `file-${slotName}`;

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading) return;
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileChange(slotName, droppedFile);
    }
  };

  const isImageFile = (filename: string) => {
    return /\.(jpg|jpeg|png|webp)$/i.test(filename);
  };

  return (
    <div className="af-field" style={{ marginBottom: "16px" }}>
      {label && (
        <label
          className="af-label"
          style={{
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "8px",
            display: "block",
            color: "var(--af-navy)",
          }}
        >
          {label} {required && <span className="af-req" style={{ color: "var(--af-error)" }}>*</span>}
        </label>
      )}

      <div
        className={`af-upload ${file ? "af-upload--success" : ""} ${
          error ? "af-upload--error" : ""
        }`}
        onClick={() => !isUploading && document.getElementById(fileInputId)?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          minHeight: "140px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          cursor: isUploading ? "not-allowed" : "pointer",
          border: error ? "2px dashed var(--af-error)" : "2px dashed var(--af-border)",
          borderRadius: "12px",
          padding: "20px",
          background: "var(--af-surface)",
          transition: "all 0.2s ease",
        }}
      >
        <input
          type="file"
          id={fileInputId}
          accept={slotName === "photo_1x1" ? ".jpg,.jpeg,.png" : ".pdf,.jpg,.jpeg,.png"}
          style={{ display: "none" }}
          disabled={isUploading}
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null;
            onFileChange(slotName, selectedFile);
          }}
        />

        {isUploading ? (
          <div style={{ textAlign: "center" }}>
            <div className="af-spinner" style={{ width: "28px", height: "28px", margin: "0 auto 12px auto" }} />
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--af-navy)" }}>
              Uploading file to server...
            </span>
          </div>
        ) : (
          <>
            {file && file.url && isImageFile(file.name) ? (
              <div style={{ marginBottom: "12px" }}>
                <img
                  src={file.url}
                  alt={`${label} Preview`}
                  style={{
                    width: "96px",
                    height: "96px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid #27ae60",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  }}
                />
              </div>
            ) : (
              <div className="af-upload__icon-wrap" style={{ marginBottom: "8px", color: file ? "#27ae60" : "var(--af-text-muted)" }}>
                {file ? <CheckCircle size={28} /> : <Upload size={28} />}
              </div>
            )}

            <span className="af-upload__text" style={{ fontSize: "16px", fontWeight: 600, color: "var(--af-navy)", textAlign: "center" }}>
              {file ? "File uploaded - Click to replace" : `Upload ${label}`}
            </span>
            <span className="af-upload__hint" style={{ fontSize: "13px", color: "var(--af-text-muted)", marginTop: "4px" }}>
              {slotName === "photo_1x1" ? "JPG, PNG - Max 5MB" : "PDF, JPG, PNG - Max 5MB"}
            </span>
          </>
        )}

        {file && !isUploading && (
          <div
            className="af-upload__file"
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: "12px",
              background: "rgba(39, 174, 96, 0.08)",
              border: "1px solid #27ae60",
              padding: "8px 16px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FileCheck size={16} style={{ color: "#27ae60" }} />
            <span
              className="af-upload__file-name"
              title={file.name}
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--af-navy)",
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "default",
              }}
            >
              {file.name}
            </span>
            {file.size && (
              <span style={{ fontSize: "12px", color: "var(--af-text-muted)" }}>
                ({formatBytes(file.size)})
              </span>
            )}
            <button
              type="button"
              className="af-upload__file-clear"
              onClick={() => onFileChange(slotName, null)}
              style={{
                border: "none",
                background: "none",
                color: "var(--af-error)",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
                marginLeft: "8px",
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <span
          style={{
            color: "var(--af-error)",
            fontSize: "14px",
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
