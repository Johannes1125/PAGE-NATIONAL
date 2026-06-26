"use client";

import React, { useState } from "react";
import ImageUpload from "./ImageUpload";
import { Loader2, FileText, Hash, Calendar, Shield, ChevronDown, Save } from "lucide-react";

interface SecRegistrationFormValues {
  registrationName: string;
  registrationNumber: string;
  dateOfIncorporation: string;
  exemptionCategory: string;
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
  const [registrationName, setRegistrationName] = useState(initialValues?.registrationName || "");
  const [registrationNumber, setRegistrationNumber] = useState(initialValues?.registrationNumber || "");
  const [dateOfIncorporation, setDateOfIncorporation] = useState(
    initialValues?.dateOfIncorporation 
      ? new Date(initialValues.dateOfIncorporation).toISOString().split("T")[0]
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
    if (!registrationNumber.trim()) {
      newErrors.registrationNumber = "Registration Number is required.";
    }
    if (!dateOfIncorporation) {
      newErrors.dateOfIncorporation = "Date of Incorporation is required.";
    }
    if (!exemptionCategory.trim()) {
      newErrors.exemptionCategory = "Exemption Category is required.";
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
        registrationNumber,
        dateOfIncorporation,
        exemptionCategory,
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
        .sec-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 600px) {
          .sec-form-row {
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
        {/* Name and Number Row */}
        <div className="sec-form-row">
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
                  height: "52px",
                  fontSize: "18px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--r-border-mid)",
                  padding: "0 18px 0 48px",
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
                style={{ fontSize: "16px", fontWeight: 500, color: "var(--p-rose)" }}
                role="alert"
              >
                {errors.registrationName}
              </span>
            )}
          </div>

          {/* Registration Number */}
          <div className="about-form-group" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: 0 }}>
            <label 
              htmlFor="registrationNumber" 
              className="about-form-label"
              style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}
            >
              Registration Number <span style={{ color: "var(--p-rose)" }}>*</span>
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
                id="registrationNumber"
                type="text"
                placeholder="Enter registration number"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                aria-invalid={!!errors.registrationNumber}
                aria-describedby={errors.registrationNumber ? "registrationNumber-error" : undefined}
                className="about-input focus-ring"
                style={{
                  height: "52px",
                  fontSize: "18px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--r-border-mid)",
                  padding: "0 18px 0 48px",
                  background: "#fff",
                  color: "var(--r-text)",
                  fontFamily: "var(--font-body)",
                  width: "100%",
                  ...(errors.registrationNumber ? { borderColor: "var(--p-rose)" } : {})
                }}
              />
            </div>
            {errors.registrationNumber && (
              <span 
                id="registrationNumber-error" 
                style={{ fontSize: "16px", fontWeight: 500, color: "var(--p-rose)" }}
                role="alert"
              >
                {errors.registrationNumber}
              </span>
            )}
          </div>
        </div>

        {/* Date of Incorporation */}
        <div className="about-form-group" style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: 0 }}>
          <label 
            htmlFor="dateOfIncorporation" 
            className="about-form-label"
            style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}
          >
            Date of Incorporation <span style={{ color: "var(--p-rose)" }}>*</span>
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
                pointerEvents: "none"
              }} 
            />
            <input
              id="dateOfIncorporation"
              type="date"
              value={dateOfIncorporation}
              onChange={(e) => setDateOfIncorporation(e.target.value)}
              aria-invalid={!!errors.dateOfIncorporation}
              aria-describedby={errors.dateOfIncorporation ? "dateOfIncorporation-error" : undefined}
              className="about-input focus-ring"
              style={{
                height: "52px",
                fontSize: "18px",
                borderRadius: "10px",
                border: "1.5px solid var(--r-border-mid)",
                padding: "0 18px 0 48px",
                background: "#fff",
                color: "var(--r-text)",
                fontFamily: "var(--font-body)",
                width: "100%",
                cursor: "pointer",
                ...(errors.dateOfIncorporation ? { borderColor: "var(--p-rose)" } : {})
              }}
            />
          </div>
          {errors.dateOfIncorporation && (
            <span 
              id="dateOfIncorporation-error" 
              style={{ fontSize: "16px", fontWeight: 500, color: "var(--p-rose)" }}
              role="alert"
            >
              {errors.dateOfIncorporation}
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
                height: "52px",
                fontSize: "18px",
                borderRadius: "10px",
                border: "1.5px solid var(--r-border-mid)",
                padding: "0 48px",
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
              <option value="Non-stock, Non-profit Association">Non-stock, Non-profit Association</option>
              <option value="Educational Institution">Educational Institution</option>
              <option value="Foundation / Charitable Institution">Foundation / Charitable Institution</option>
              <option value="Other">Other</option>
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
              style={{ fontSize: "16px", fontWeight: 500, color: "var(--p-rose)" }}
              role="alert"
            >
              {errors.exemptionCategory}
            </span>
          )}
        </div>

        {/* Registration Image Certificate */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label 
            className="about-form-label"
            style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}
          >
            Registration Image Certificate <span style={{ color: "var(--p-rose)" }}>*</span>
          </label>
          <ImageUpload
            existingImageUrl={imageUrl}
            onFileSelect={handleFileSelect}
            onClearExisting={handleClearExisting}
          />
        </div>
      </div>

      {/* Sticky Footer */}
      <div style={{ 
        display: "flex", 
        justifyContent: "flex-end", 
        gap: "16px", 
        background: "var(--r-surface)",
        borderTop: "1px solid var(--r-border-mid)",
        padding: "24px 32px",
        flexShrink: 0
      }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="focus-ring"
          style={{
            height: "48px",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--p-navy)",
            background: "#fff",
            border: "1.5px solid var(--r-border-mid)",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px"
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring"
          style={{
            height: "48px",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: 600,
            color: "#fff",
            background: isSubmitting ? "var(--p-blue-light)" : "var(--p-blue)",
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "0 24px"
          }}
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {isSubmitting ? "Saving..." : initialValues ? "Save Changes" : "Create Record"}
        </button>
      </div>
    </form>
  );
}
