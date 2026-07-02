"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import type { Convention, ConventionFormData, ConventionFormErrors } from "../types";

type ConventionFormModalProps = {
  open: boolean;
  convention: Convention | null; // null = create mode
  onClose: () => void;
  onSubmit: (data: ConventionFormData) => Promise<void>;
};

const EMPTY_FORM: ConventionFormData = {
  convention_number: "",
  title: "",
  location: "",
  convention_date: "",
  description: "",
  banner: null,
  existing_banner_url: null,
};

function validate(data: ConventionFormData): ConventionFormErrors {
  const errors: ConventionFormErrors = {};

  if (!data.convention_number.trim()) {
    errors.convention_number = "Convention number is required.";
  }
  if (!data.title.trim()) {
    errors.title = "Title is required.";
  }
  if (!data.location.trim()) {
    errors.location = "Location is required.";
  }
  if (!data.convention_date) {
    errors.convention_date = "Convention date is required.";
  }

  return errors;
}

export default function ConventionFormModal({
  open,
  convention,
  onClose,
  onSubmit,
}: ConventionFormModalProps) {
  const isEditMode = convention !== null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ConventionFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<ConventionFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Reset form when opening
  useEffect(() => {
    if (!open) return;

    if (convention) {
      setForm({
        convention_number: convention.convention_number,
        title: convention.title,
        location: convention.location,
        convention_date: convention.convention_date.split("T")[0],
        description: convention.description ?? "",
        banner: null,
        existing_banner_url: convention.banner_url,
      });
      setBannerPreview(convention.banner_url);
    } else {
      setForm(EMPTY_FORM);
      setBannerPreview(null);
    }
    setErrors({});
    setIsSubmitting(false);
  }, [open, convention]);

  // Handle Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleChange = useCallback(
    (field: keyof ConventionFormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      // Clear error on change
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setForm((prev) => ({ ...prev, banner: file }));

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBannerPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="conv-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conv-form-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="conv-modal">
        {/* Header */}
        <div className="conv-modal__header">
          <h2 id="conv-form-title" className="conv-modal__title">
            {isEditMode ? "Edit Convention" : "Create New Convention"}
          </h2>
          <button
            type="button"
            className="conv-modal__close"
            onClick={onClose}
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="conv-form" noValidate>
          {/* Convention Number */}
          <div className="conv-form__field">
            <label htmlFor="conv-number" className="conv-form__label conv-form__label--required">
              Convention Number
            </label>
            <input
              id="conv-number"
              type="text"
              value={form.convention_number}
              onChange={(e) => handleChange("convention_number", e.target.value)}
              className={`conv-form__input ${errors.convention_number ? "conv-form__input--error" : ""}`}
              placeholder="e.g. 57th"
              autoFocus
            />
            {errors.convention_number && (
              <span className="conv-form__error">{errors.convention_number}</span>
            )}
          </div>

          {/* Title */}
          <div className="conv-form__field">
            <label htmlFor="conv-title" className="conv-form__label conv-form__label--required">
              Title
            </label>
            <input
              id="conv-title"
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`conv-form__input ${errors.title ? "conv-form__input--error" : ""}`}
              placeholder="e.g. PAGE International Convention & General Assembly"
            />
            {errors.title && (
              <span className="conv-form__error">{errors.title}</span>
            )}
          </div>

          {/* Location */}
          <div className="conv-form__field">
            <label htmlFor="conv-location" className="conv-form__label conv-form__label--required">
              Location
            </label>
            <input
              id="conv-location"
              type="text"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className={`conv-form__input ${errors.location ? "conv-form__input--error" : ""}`}
              placeholder="e.g. SMX Convention Center, Pasay City"
            />
            {errors.location && (
              <span className="conv-form__error">{errors.location}</span>
            )}
          </div>

          {/* Convention Date */}
          <div className="conv-form__field">
            <label htmlFor="conv-date" className="conv-form__label conv-form__label--required">
              Convention Date
            </label>
            <input
              id="conv-date"
              type="date"
              value={form.convention_date}
              onChange={(e) => handleChange("convention_date", e.target.value)}
              className={`conv-form__date ${errors.convention_date ? "conv-form__date--error" : ""}`}
            />
            {errors.convention_date && (
              <span className="conv-form__error">{errors.convention_date}</span>
            )}
          </div>

          {/* Description */}
          <div className="conv-form__field">
            <label htmlFor="conv-desc" className="conv-form__label">
              Description
            </label>
            <textarea
              id="conv-desc"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="conv-form__textarea"
              rows={4}
              placeholder="Optional description..."
            />
          </div>

          {/* Banner Upload */}
          <div className="conv-form__field">
            <label className="conv-form__label">Banner Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="sr-only"
              id="conv-banner-input"
              aria-label="Upload banner image"
            />
            <div
              className="conv-form__banner-area"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Click to upload banner image"
            >
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="conv-form__banner-preview"
                />
              ) : (
                <>
                  <ImageIcon size={32} className="text-slate-400" />
                  <span className="conv-form__banner-text">
                    Click to upload a banner image (JPG, PNG, WebP — max 5MB)
                  </span>
                </>
              )}
            </div>
            {bannerPreview && (
              <button
                type="button"
                className="conv-btn conv-btn--secondary mt-2"
                style={{ minHeight: "40px", fontSize: "14px", alignSelf: "flex-start" }}
                onClick={() => {
                  setForm((prev) => ({ ...prev, banner: null, existing_banner_url: null }));
                  setBannerPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Remove Image
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="conv-form__actions">
            <button
              type="button"
              className="conv-btn conv-btn--secondary"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ minHeight: "48px", padding: "0 28px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="conv-btn conv-btn--primary"
              disabled={isSubmitting}
              style={{ minHeight: "48px", padding: "0 28px" }}
            >
              {isSubmitting
                ? "Saving…"
                : isEditMode
                  ? "Update Convention"
                  : "Create Convention"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
