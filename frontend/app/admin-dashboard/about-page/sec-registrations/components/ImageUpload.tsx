"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, X, RefreshCw } from "lucide-react";

interface ImageUploadProps {
  existingImageUrl?: string;
  onFileSelect: (file: File | null) => void;
  onClearExisting?: () => void;
}

export default function ImageUpload({
  existingImageUrl,
  onFileSelect,
  onClearExisting,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup preview URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Validate type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid image format. Only JPG, JPEG, PNG, and WEBP are allowed.");
      return false;
    }

    // Validate size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image exceeds the 5 MB size limit.");
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      onFileSelect(file);
    } else {
      onFileSelect(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    onFileSelect(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (onClearExisting) {
      onClearExisting();
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  const hasImage = previewUrl || existingImageUrl;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label 
        id="image-upload-label"
        style={{ fontSize: "18px", fontWeight: 600, color: "var(--p-navy)" }}
      >
        Registration Image Certificate
      </label>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? "var(--p-blue)" : "var(--r-border-mid)"}`,
          borderRadius: "12px",
          padding: "24px",
          textAlign: "center",
          background: dragActive ? "rgba(30, 83, 142, 0.04)" : "var(--r-surface)",
          transition: "all 0.2s ease",
          position: "relative",
          minHeight: "160px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          outline: "none",
        }}
        className="focus-ring"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleInputChange}
          style={{ display: "none" }}
          id="sec-registration-file-input"
          aria-labelledby="image-upload-label"
        />

        {hasImage ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%" }}>
            <div style={{ position: "relative", width: "180px", height: "180px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--r-border)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl || existingImageUrl}
                alt="Registration Preview"
                style={{ width: "100%", height: "100%", objectFit: "contain", background: "#f9fafb" }}
              />
            </div>
            
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                type="button"
                onClick={triggerInput}
                className="focus-ring"
                style={{
                  height: "52px",
                  padding: "0 18px",
                  borderRadius: "10px",
                  fontSize: "18px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  border: "1px solid var(--r-border-mid)",
                  background: "var(--r-surface-2)",
                  color: "var(--r-text-mid)",
                }}
              >
                <RefreshCw size={18} />
                Replace Image
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="focus-ring"
                style={{
                  height: "52px",
                  padding: "0 18px",
                  borderRadius: "10px",
                  fontSize: "18px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  border: "none",
                  background: "var(--p-rose-pale)",
                  color: "var(--p-rose)",
                }}
              >
                <X size={18} />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div 
            style={{ cursor: "pointer", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
            onClick={triggerInput}
          >
            <div style={{ 
              width: "56px", 
              height: "56px", 
              borderRadius: "50%", 
              background: "rgba(30, 83, 142, 0.08)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "var(--p-blue)",
              marginBottom: "12px"
            }}>
              <Upload size={24} />
            </div>
            <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--p-navy)", margin: "0 0 4px 0" }}>
              Click to upload or drag image here
            </p>
            <p style={{ fontSize: "14px", color: "var(--r-text-muted)", margin: 0 }}>
              Supports JPG, JPEG, PNG, or WEBP (Max 5MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <span 
          style={{ 
            fontSize: "16px", 
            fontWeight: 500, 
            color: "var(--p-rose)", 
            display: "block", 
            marginTop: "4px" 
          }}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}
