"use client";

import React, { useState } from "react";
import ImageUpload from "./ImageUpload";
import { Loader2 } from "lucide-react";

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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }} noValidate>
      {/* Registration Name */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label 
          htmlFor="registrationName" 
          style={{ fontSize: "18px", fontWeight: 600, color: "var(--p-navy)" }}
        >
          Registration Name
        </label>
        <input
          id="registrationName"
          type="text"
          value={registrationName}
          onChange={(e) => setRegistrationName(e.target.value)}
          aria-invalid={!!errors.registrationName}
          aria-describedby={errors.registrationName ? "registrationName-error" : undefined}
          style={{
            height: "52px",
            fontSize: "18px",
            padding: "0 16px",
            borderRadius: "10px",
            border: `1px solid ${errors.registrationName ? "var(--p-rose)" : "var(--r-border-mid)"}`,
            background: "var(--r-bg)",
            color: "var(--r-text)",
            outline: "none",
          }}
          className="focus-ring"
        />
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
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label 
          htmlFor="registrationNumber" 
          style={{ fontSize: "18px", fontWeight: 600, color: "var(--p-navy)" }}
        >
          Registration Number
        </label>
        <input
          id="registrationNumber"
          type="text"
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
          aria-invalid={!!errors.registrationNumber}
          aria-describedby={errors.registrationNumber ? "registrationNumber-error" : undefined}
          style={{
            height: "52px",
            fontSize: "18px",
            padding: "0 16px",
            borderRadius: "10px",
            border: `1px solid ${errors.registrationNumber ? "var(--p-rose)" : "var(--r-border-mid)"}`,
            background: "var(--r-bg)",
            color: "var(--r-text)",
            outline: "none",
          }}
          className="focus-ring"
        />
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

      {/* Date of Incorporation */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label 
          htmlFor="dateOfIncorporation" 
          style={{ fontSize: "18px", fontWeight: 600, color: "var(--p-navy)" }}
        >
          Date of Incorporation
        </label>
        <input
          id="dateOfIncorporation"
          type="date"
          value={dateOfIncorporation}
          onChange={(e) => setDateOfIncorporation(e.target.value)}
          aria-invalid={!!errors.dateOfIncorporation}
          aria-describedby={errors.dateOfIncorporation ? "dateOfIncorporation-error" : undefined}
          style={{
            height: "52px",
            fontSize: "18px",
            padding: "0 16px",
            borderRadius: "10px",
            border: `1px solid ${errors.dateOfIncorporation ? "var(--p-rose)" : "var(--r-border-mid)"}`,
            background: "var(--r-bg)",
            color: "var(--r-text)",
            outline: "none",
            width: "100%",
          }}
          className="focus-ring"
        />
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
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label 
          htmlFor="exemptionCategory" 
          style={{ fontSize: "18px", fontWeight: 600, color: "var(--p-navy)" }}
        >
          Exemption Category
        </label>
        <input
          id="exemptionCategory"
          type="text"
          value={exemptionCategory}
          onChange={(e) => setExemptionCategory(e.target.value)}
          aria-invalid={!!errors.exemptionCategory}
          aria-describedby={errors.exemptionCategory ? "exemptionCategory-error" : undefined}
          style={{
            height: "52px",
            fontSize: "18px",
            padding: "0 16px",
            borderRadius: "10px",
            border: `1px solid ${errors.exemptionCategory ? "var(--p-rose)" : "var(--r-border-mid)"}`,
            background: "var(--r-bg)",
            color: "var(--r-text)",
            outline: "none",
          }}
          className="focus-ring"
        />
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

      {/* Registration Image */}
      <ImageUpload
        existingImageUrl={imageUrl}
        onFileSelect={handleFileSelect}
        onClearExisting={handleClearExisting}
      />

      {/* Form Buttons */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "16px", 
        marginTop: "16px",
        borderTop: "1px solid var(--r-border-mid)",
        paddingTop: "24px"
      }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="focus-ring"
          style={{
            height: "52px",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--r-text-mid)",
            background: "var(--r-surface-2)",
            border: "1px solid var(--r-border-mid)",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-body)",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring"
          style={{
            height: "52px",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: 600,
            color: "#fff",
            background: "var(--p-blue)",
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontFamily: "var(--font-body)",
          }}
        >
          {isSubmitting && <Loader2 className="animate-spin" size={18} />}
          {isSubmitting ? "Saving..." : initialValues ? "Save Changes" : "Create Record"}
        </button>
      </div>
    </form>
  );
}
