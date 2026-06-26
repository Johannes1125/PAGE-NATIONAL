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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      setSelectedFile(null);
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
    setSelectedFile(null);
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
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      <style>{`
        .sec-upload-card {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          border: 1.5px dashed var(--p-blue-light);
          border-radius: 12px;
          background: rgba(30, 83, 142, 0.02);
          padding: 24px 32px;
          gap: 20px;
          transition: all 0.2s ease;
        }

        .sec-upload-left {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 20px;
        }

        @media (max-width: 720px) {
          .sec-upload-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 24px 16px;
          }
          .sec-upload-left {
            flex-direction: column;
            align-items: center;
          }
          .sec-upload-text-container {
            text-align: center !important;
          }
        }
      `}</style>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className="focus-ring"
        style={{
          width: "100%",
          borderRadius: "12px",
          outline: "none",
          background: dragActive ? "var(--p-blue-xpale)" : "transparent",
          transition: "background 0.2s ease",
        }}
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
          <div 
            style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              gap: "16px", 
              width: "100%", 
              padding: "24px",
              border: "1.5px dashed var(--p-blue-light)",
              borderRadius: "12px",
              background: "rgba(30, 83, 142, 0.02)"
            }}
          >
            <div style={{ 
              position: "relative", 
              width: "200px", 
              height: "200px", 
              borderRadius: "12px", 
              overflow: "hidden", 
              border: "1px solid var(--r-border-mid)", 
              background: "#f8fafc",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)"
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl || existingImageUrl}
                alt="Registration Preview"
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8px" }}
              />
            </div>
            
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" }}>
              <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--p-navy)", margin: 0, wordBreak: "break-all" }}>
                {selectedFile ? selectedFile.name : "Current Certificate Image"}
              </p>
              {selectedFile && (
                <p style={{ fontSize: "14px", color: "var(--r-text-muted)", margin: 0 }}>
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", width: "100%", maxWidth: "340px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={triggerInput}
                className="about-btn about-btn--secondary focus-ring"
                style={{ 
                  height: "48px", 
                  fontSize: "16px", 
                  borderRadius: "10px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "8px" 
                }}
              >
                <RefreshCw size={18} />
                Replace
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="about-btn about-btn--danger focus-ring"
                style={{ 
                  height: "48px", 
                  fontSize: "16px", 
                  borderRadius: "10px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "8px" 
                }}
              >
                <X size={18} />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="sec-upload-card">
            {/* Left Section */}
            <div className="sec-upload-left">
              {/* Cloud Icon */}
              <div 
                style={{ 
                  width: "64px", 
                  height: "64px", 
                  borderRadius: "12px", 
                  background: "rgba(30, 83, 142, 0.08)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "var(--p-blue)",
                  flexShrink: 0
                }}
              >
                <Upload size={28} />
              </div>
              
              {/* Upload Texts */}
              <div className="sec-upload-text-container" style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}>
                  Upload certificate image
                </p>
                <p style={{ fontSize: "15px", color: "var(--r-text-mid)", margin: 0 }}>
                  Drag and drop your file here, or <span onClick={triggerInput} style={{ color: "var(--p-blue)", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>click to browse</span>
                </p>
                <p style={{ fontSize: "13px", color: "var(--r-text-muted)", margin: 0 }}>
                  Supported formats: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>
            </div>

            {/* Right Section / Choose File Button */}
            <button
              type="button"
              onClick={triggerInput}
              className="focus-ring"
              style={{
                background: "#fff",
                border: "1.5px solid var(--p-blue)",
                borderRadius: "10px",
                height: "48px",
                padding: "0 24px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--p-blue)",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.2s ease"
              }}
            >
              <Upload size={18} />
              Choose File
            </button>
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
