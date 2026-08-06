"use client";

import React, { useState } from "react";
import ImageUpload from "./ImageUpload";
import { Loader2, Save, FileCheck } from "lucide-react";

interface SecRegistrationFormValues {
  imageUrl?: string;
}

interface SecRegistrationFormProps {
  initialValues?: SecRegistrationFormValues;
  onSubmit: (values: SecRegistrationFormValues, imageFile: File | null, clearImage: boolean) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function SecRegistrationForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: SecRegistrationFormProps) {
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!imageFile && (!imageUrl || clearImage)) {
      setError("Please select a PDF or photo of the SEC Registration document.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(
      {
        imageUrl: clearImage ? "" : imageUrl,
      },
      imageFile,
      clearImage
    );
  };

  const handleClearExisting = () => {
    setImageUrl("");
    setClearImage(true);
  };

  const handleFileSelect = (file: File | null) => {
    setImageFile(file);
    if (file) {
      setClearImage(false);
      setError(null);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        flex: 1, 
        overflow: "hidden" 
      }} 
      noValidate
    >
      <div 
        style={{ 
          padding: "32px", 
          overflowY: "auto", 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          gap: "20px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <FileCheck size={24} style={{ color: "var(--p-blue)" }} />
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}>SEC Certificate Document</h3>
            <p style={{ fontSize: "13px", color: "var(--r-text-muted)", margin: "2px 0 0" }}>Upload the official SEC incorporation certificate (PDF or Photo).</p>
          </div>
        </div>

        {/* SEC Image / PDF Upload */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <ImageUpload
            existingImageUrl={imageUrl}
            onFileSelect={handleFileSelect}
            onClearExisting={handleClearExisting}
          />
          {error && (
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--p-rose)", marginTop: "4px" }}>
              {error}
            </span>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div style={{ 
        display: "flex", 
        justifyContent: "flex-end", 
        gap: "16px", 
        background: "var(--r-surface)",
        borderTop: "1px solid var(--r-border-mid)",
        padding: "16px 32px",
        flexShrink: 0
      }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="focus-ring"
          style={{
            height: "40px",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--p-navy)",
            background: "#fff",
            border: "1.5px solid var(--r-border-mid)",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.625rem 1rem"
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring"
          style={{
            height: "40px",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#fff",
            background: isSubmitting ? "var(--p-blue-light)" : "var(--p-blue)",
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "0.625rem 1rem"
          }}
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {isSubmitting ? "Saving..." : initialValues?.imageUrl ? "Save Changes" : "Upload Certificate"}
        </button>
      </div>
    </form>
  );
}
