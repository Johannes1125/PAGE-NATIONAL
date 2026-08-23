"use client";

import React, { useState } from "react";
import ImageUpload from "./ImageUpload";
import { Loader2, Save, FileCheck, Receipt } from "lucide-react";

interface BirCertificationFormValues {
  imageUrl?: string;
  receiptUrl?: string;
}

interface BirCertificationFormProps {
  initialValues?: BirCertificationFormValues;
  onSubmit: (
    values: BirCertificationFormValues,
    certFile: File | null,
    clearCert: boolean,
    receiptFile: File | null,
    clearReceipt: boolean
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function BirCertificationForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: BirCertificationFormProps) {
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || "");
  const [certFile, setCertFile] = useState<File | null>(null);
  const [clearCert, setClearCert] = useState(false);

  const [receiptUrl, setReceiptUrl] = useState(initialValues?.receiptUrl || "");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [clearReceipt, setClearReceipt] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!certFile && (!imageUrl || clearCert) && !receiptFile && (!receiptUrl || clearReceipt)) {
      setError("Please select at least a BIR Certificate or BIR Receipt file (PDF or Photo).");
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
        imageUrl: clearCert ? "" : imageUrl,
        receiptUrl: clearReceipt ? "" : receiptUrl,
      },
      certFile,
      clearCert,
      receiptFile,
      clearReceipt
    );
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
      {/* Scrollable Form Content */}
      <div 
        style={{ 
          padding: "24px 32px", 
          overflowY: "auto", 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          gap: "24px"
        }}
      >
        {/* BIR Certification Document Upload */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <FileCheck size={20} style={{ color: "var(--p-blue)" }} />
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--p-navy)" }}>
              BIR Certification Document (Photo, PDF)
            </span>
          </div>
          <ImageUpload
            existingImageUrl={imageUrl}
            onFileSelect={(file) => {
              setCertFile(file);
              if (file) setClearCert(false);
            }}
            onClearExisting={() => {
              setImageUrl("");
              setClearCert(true);
            }}
          />
        </div>

        {/* BIR Receipt Document Upload */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Receipt size={20} style={{ color: "var(--p-rose)" }} />
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--p-navy)" }}>
              BIR Official Receipt Input (Photo, PDF)
            </span>
          </div>
          <ImageUpload
            existingImageUrl={receiptUrl}
            onFileSelect={(file) => {
              setReceiptFile(file);
              if (file) setClearReceipt(false);
            }}
            onClearExisting={() => {
              setReceiptUrl("");
              setClearReceipt(true);
            }}
          />
        </div>

        {error && (
          <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--p-rose)" }}>
            {error}
          </span>
        )}
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
          {isSubmitting ? "Saving..." : (initialValues?.imageUrl || initialValues?.receiptUrl) ? "Save Changes" : "Upload Documents"}
        </button>
      </div>
    </form>
  );
}
