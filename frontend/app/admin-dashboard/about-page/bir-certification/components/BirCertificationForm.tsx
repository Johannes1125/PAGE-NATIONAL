"use client";

import React, { useState } from "react";
import ImageUpload from "./ImageUpload";
import { Loader2, FileText, Hash, Calendar, Shield, ChevronDown, Save, FileCheck } from "lucide-react";

interface BirCertificationFormValues {
  registrationName: string;
  tinNumber: string;
  certificationNumber: string;
  exemptionCategory: string;
  dateOfIssuance: string;
  imageUrl?: string;
}

interface BirCertificationFormProps {
  initialValues?: BirCertificationFormValues;
  onSubmit: (values: BirCertificationFormValues, imageFile: File | null, clearImage: boolean) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function BirCertificationForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: BirCertificationFormProps) {
  const [registrationName, setRegistrationName] = useState(initialValues?.registrationName || "");
  const [tinNumber, setTinNumber] = useState(initialValues?.tinNumber || "");
  const [certificationNumber, setCertificationNumber] = useState(initialValues?.certificationNumber || "");
  const [dateOfIssuance, setDateOfIssuance] = useState(
    initialValues?.dateOfIssuance 
      ? new Date(initialValues.dateOfIssuance).toISOString().split("T")[0]
      : ""
  );
  const [exemptionCategory, setExemptionCategory] = useState(initialValues?.exemptionCategory || "");
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [clearImage, setClearImage] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!registrationName.trim()) {
      newErrors.registrationName = "Registration Name is required.";
    }
    if (!tinNumber.trim()) {
      newErrors.tinNumber = "TIN Number is required.";
    }
    if (!certificationNumber.trim()) {
      newErrors.certificationNumber = "Certification Number is required.";
    }
    if (!dateOfIssuance) {
      newErrors.dateOfIssuance = "Date of Issuance is required.";
    }
    if (!exemptionCategory.trim()) {
      newErrors.exemptionCategory = "Exemption Category is required.";
    }
    if (!imageFile && !imageUrl) {
      newErrors.image = "Certification Image is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(
      {
        registrationName,
        tinNumber,
        certificationNumber,
        exemptionCategory,
        dateOfIssuance,
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
      <style>{`
        .bir-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 600px) {
          .bir-form-row {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>

      {/* Scrollable Form Content */}
      <div 
        style={{ 
          padding: "32px 32px 12px 32px", 
          overflowY: "auto", 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          gap: "24px"
        }}
      >
        {/* Name and TIN Row */}
        <div className="bir-form-row">
          {/* Registration Name */}
          <div className="about-form-group" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: 0 }}>
            <label 
              htmlFor="registrationName" 
              className="about-form-label"
              style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}
            >
              Registration Name <span style={{ color: "var(--p-rose)" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <FileText 
                size={20} 
                style={{ 
                  position: "absolute", 
                  left: "16px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "var(--r-text-muted)",
                  pointerEvents: "none"
                }} 
              />
              <input
                id="registrationName"
                type="text"
                placeholder="Enter registration name"
                value={registrationName}
                onChange={(e) => setRegistrationName(e.target.value)}
                aria-invalid={!!errors.registrationName}
                aria-describedby={errors.registrationName ? "registrationName-error" : undefined}
                className="about-input focus-ring"
                style={{
                  height: "40px",
                  fontSize: "0.875rem",
                  borderRadius: "8px",
                  border: "1.5px solid var(--r-border-mid)",
                  padding: "0 0.875rem 0 2.375rem",
                  background: "#fff",
                  color: "var(--r-text)",
                  fontFamily: "var(--font-body)",
                  width: "100%",
                  ...(errors.registrationName ? { borderColor: "var(--p-rose)" } : {})
                }}
              />
            </div>
            {errors.registrationName && (
              <span 
                id="registrationName-error" 
                className="form-error-text"
                role="alert"
              >
                {errors.registrationName}
              </span>
            )}
          </div>

          {/* TIN Number */}
          <div className="about-form-group" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: 0 }}>
            <label 
              htmlFor="tinNumber" 
              className="about-form-label"
              style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}
            >
              TIN Number <span style={{ color: "var(--p-rose)" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <Hash 
                size={20} 
                style={{ 
                  position: "absolute", 
                  left: "16px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "var(--r-text-muted)",
                  pointerEvents: "none"
                }} 
              />
              <input
                id="tinNumber"
                type="text"
                placeholder="Enter TIN number"
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value)}
                aria-invalid={!!errors.tinNumber}
                aria-describedby={errors.tinNumber ? "tinNumber-error" : undefined}
                className="about-input focus-ring"
                style={{
                  height: "40px",
                  fontSize: "0.875rem",
                  borderRadius: "8px",
                  border: "1.5px solid var(--r-border-mid)",
                  padding: "0 0.875rem 0 2.375rem",
                  background: "#fff",
                  color: "var(--r-text)",
                  fontFamily: "var(--font-body)",
                  width: "100%",
                  ...(errors.tinNumber ? { borderColor: "var(--p-rose)" } : {})
                }}
              />
            </div>
            {errors.tinNumber && (
              <span 
                id="tinNumber-error" 
                className="form-error-text"
                role="alert"
              >
                {errors.tinNumber}
              </span>
            )}
          </div>
        </div>

        {/* Certification Number and Exemption Category Row */}
        <div className="bir-form-row">
          {/* Certification Number */}
          <div className="about-form-group" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: 0 }}>
            <label 
              htmlFor="certificationNumber" 
              className="about-form-label"
              style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}
            >
              Certification Number <span style={{ color: "var(--p-rose)" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <FileCheck 
                size={20} 
                style={{ 
                  position: "absolute", 
                  left: "16px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "var(--r-text-muted)",
                  pointerEvents: "none"
                }} 
              />
              <input
                id="certificationNumber"
                type="text"
                placeholder="Enter certification number"
                value={certificationNumber}
                onChange={(e) => setCertificationNumber(e.target.value)}
                aria-invalid={!!errors.certificationNumber}
                aria-describedby={errors.certificationNumber ? "certificationNumber-error" : undefined}
                className="about-input focus-ring"
                style={{
                  height: "40px",
                  fontSize: "0.875rem",
                  borderRadius: "8px",
                  border: "1.5px solid var(--r-border-mid)",
                  padding: "0 0.875rem 0 2.375rem",
                  background: "#fff",
                  color: "var(--r-text)",
                  fontFamily: "var(--font-body)",
                  width: "100%",
                  ...(errors.certificationNumber ? { borderColor: "var(--p-rose)" } : {})
                }}
              />
            </div>
            {errors.certificationNumber && (
              <span 
                id="certificationNumber-error" 
                className="form-error-text"
                role="alert"
              >
                {errors.certificationNumber}
              </span>
            )}
          </div>

          {/* Exemption Category */}
          <div className="about-form-group" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: 0 }}>
            <label 
              htmlFor="exemptionCategory" 
              className="about-form-label"
              style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}
            >
              Exemption Category <span style={{ color: "var(--p-rose)" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <Shield 
                size={20} 
                style={{ 
                  position: "absolute", 
                  left: "16px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "var(--r-text-muted)",
                  pointerEvents: "none"
                }} 
              />
              <select
                id="exemptionCategory"
                value={exemptionCategory}
                onChange={(e) => setExemptionCategory(e.target.value)}
                aria-invalid={!!errors.exemptionCategory}
                aria-describedby={errors.exemptionCategory ? "exemptionCategory-error" : undefined}
                className="about-input focus-ring"
                style={{
                  height: "40px",
                  fontSize: "0.875rem",
                  borderRadius: "8px",
                  border: "1.5px solid var(--r-border-mid)",
                  padding: "0 2.375rem",
                  background: "#fff",
                  color: exemptionCategory ? "var(--r-text)" : "var(--r-text-muted)",
                  fontFamily: "var(--font-body)",
                  width: "100%",
                  cursor: "pointer",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  ...(errors.exemptionCategory ? { borderColor: "var(--p-rose)" } : {})
                }}
              >
                <option value="" disabled>Select exemption category</option>
                <option value="Non-stock, Non-profit Educational Institution">Non-stock, Non-profit Educational Institution</option>
                <option value="Non-stock, Non-profit Association">Non-stock, Non-profit Association</option>
                <option value="Charitable / Scientific / Cultural Association">Charitable / Scientific / Cultural Association</option>
                <option value="Other Exemption Category">Other Exemption Category</option>
              </select>
              <ChevronDown 
                size={20} 
                style={{ 
                  position: "absolute", 
                  right: "16px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "var(--r-text-muted)",
                  pointerEvents: "none"
                }} 
              />
            </div>
            {errors.exemptionCategory && (
              <span 
                id="exemptionCategory-error" 
                className="form-error-text"
                role="alert"
              >
                {errors.exemptionCategory}
              </span>
            )}
          </div>
        </div>

        {/* Date of Issuance (Native input type=date styled min-height 40px) */}
        <div className="about-form-group" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: 0 }}>
          <label 
            htmlFor="dateOfIssuance" 
            className="about-form-label"
            style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}
          >
            Date of Issuance <span style={{ color: "var(--p-rose)" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <Calendar 
              size={20} 
              style={{ 
                position: "absolute", 
                left: "16px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                color: "var(--r-text-muted)",
                pointerEvents: "none",
                zIndex: 1
              }} 
            />
            <input
              id="dateOfIssuance"
              type="date"
              value={dateOfIssuance}
              onChange={(e) => setDateOfIssuance(e.target.value)}
              aria-invalid={!!errors.dateOfIssuance}
              aria-describedby={errors.dateOfIssuance ? "dateOfIssuance-error" : undefined}
              className="bir-date-input focus-ring"
              style={{
                ...(errors.dateOfIssuance ? { borderColor: "var(--p-rose)" } : {})
              }}
            />
          </div>
          {errors.dateOfIssuance && (
            <span 
              id="dateOfIssuance-error" 
              className="form-error-text"
              role="alert"
            >
              {errors.dateOfIssuance}
            </span>
          )}
        </div>

        {/* Registration Image Certificate */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label 
            className="about-form-label"
            style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}
          >
            Certification Image <span style={{ color: "var(--p-rose)" }}>*</span>
          </label>
          <ImageUpload
            existingImageUrl={imageUrl}
            onFileSelect={handleFileSelect}
            onClearExisting={handleClearExisting}
          />
          {errors.image && (
            <span 
              className="form-error-text"
              role="alert"
            >
              {errors.image}
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
          {isSubmitting ? "Saving..." : initialValues ? "Save Changes" : "Create Record"}
        </button>
      </div>
    </form>
  );
}
