"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { gooeyToast } from "goey-toast";
import { toast } from "react-toastify";
import "goey-toast/styles.css";
import {
  Upload,
  FileText,
  Plus,
  Trash2,
  Pencil,
  CheckCircle,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

import { conventionsApi } from "../../../lib/api-client";
import type {
  ConventionFull,
  WizardFormData,
  WizardStep1,
  WizardScheduleEntry,
  WizardSpeakerEntry,
  WizardPendingFile,
  ConventionAttachment,
} from "../types";
import { CONVENTION_EVENT_TYPES } from "../types";
import "./ConventionWizard.css";

// ── Helpers ───────────────────────────────────────────────────────────────────

let _keyCounter = 0;
const uniqueKey = () => `k-${Date.now()}-${++_keyCounter}`;

const STEPS = [
  { number: 1, label: "Info" },
  { number: 2, label: "Schedule" },
  { number: 3, label: "Speakers" },
  { number: 4, label: "Review" },
];

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

function showSuccess(message: string) {
  try {
    gooeyToast.success(message);
  } catch {
    toast.success(message);
  }
}

function showError(message: string) {
  try {
    gooeyToast.error(message);
  } catch {
    toast.error(message);
  }
}

function deriveConventionNumber(startDate: string, existing?: string): string {
  if (existing) return existing;
  const year = new Date(startDate).getFullYear();
  return `${year}th Convention`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(start: string, end: string): string {
  const s = formatDate(start);
  const e = formatDate(end);
  return s === e ? s : `${s} – ${e}`;
}

function toDateInputValue(dateStr: string): string {
  return dateStr.split("T")[0];
}

const defaultStep1 = (): WizardStep1 => ({
  title: "",
  description: "",
  location: "",
  start_date: "",
  end_date: "",
  attachments: [],
  pendingImages: [],
  pendingPdfs: [],
});

function conventionFullToWizardData(data: ConventionFull): WizardFormData {
  return {
    step1: {
      title: data.title,
      description: data.description,
      location: data.location,
      start_date: toDateInputValue(data.start_date),
      end_date: toDateInputValue(data.end_date),
      attachments: data.attachments ?? [],
      pendingImages: [],
      pendingPdfs: [],
    },
    schedules: (data.schedules ?? []).map((s) => ({
      _key: uniqueKey(),
      id: s.id,
      schedule_date: toDateInputValue(s.schedule_date),
      title: s.title,
      event_type: s.event_type,
      start_time: s.start_time ?? "",
      end_time: s.end_time ?? "",
      location: s.location,
    })),
    speakers: (data.speakers ?? []).map((sp) => ({
      _key: uniqueKey(),
      id: sp.id,
      name: sp.name,
      role_position: sp.role_position,
      institution: sp.institution,
      presentation_topic: sp.presentation_topic,
    })),
  };
}

function validateStep1(data: WizardStep1): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.title.trim()) errors.title = "Title is required.";
  if (!data.description.trim()) errors.description = "Short description is required.";
  if (!data.location.trim()) errors.location = "Location is required.";
  if (!data.start_date) errors.start_date = "Start date is required.";
  if (!data.end_date) errors.end_date = "End date is required.";
  if (data.start_date && data.end_date && data.end_date < data.start_date) {
    errors.end_date = "End date must not precede start date.";
  }
  return errors;
}

function isStep1Valid(data: WizardStep1): boolean {
  return Object.keys(validateStep1(data)).length === 0;
}

function groupSchedulesByDate(schedules: WizardScheduleEntry[]): Map<string, WizardScheduleEntry[]> {
  const map = new Map<string, WizardScheduleEntry[]>();
  const sorted = [...schedules].sort((a, b) => {
    const d = a.schedule_date.localeCompare(b.schedule_date);
    if (d !== 0) return d;
    return a.start_time.localeCompare(b.start_time);
  });
  for (const s of sorted) {
    const list = map.get(s.schedule_date) ?? [];
    list.push(s);
    map.set(s.schedule_date, list);
  }
  return map;
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ConventionWizardProps {
  mode: "create" | "edit";
  conventionId?: string;
  initialData?: ConventionFull;
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════

export default function ConventionWizard({ mode, conventionId: initialConventionId, initialData }: ConventionWizardProps) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [conventionId, setConventionId] = useState<string | undefined>(initialConventionId);
  const [conventionNumber, setConventionNumber] = useState<string | undefined>(initialData?.convention_number);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => {
    if (mode === "edit" && initialData) return new Set([1, 2, 3]);
    return new Set();
  });

  const [formData, setFormData] = useState<WizardFormData>(() =>
    initialData
      ? conventionFullToWizardData(initialData)
      : { step1: defaultStep1(), schedules: [], speakers: [] },
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const goTo = useCallback((next: number) => {
    setDirection(next > step ? 1 : -1);
    setErrors({});
    setStepError(null);
    setStep(next);
  }, [step]);

  const saveStep1 = async (): Promise<string> => {
    const s1 = formData.step1;
    const payload = {
      convention_number: deriveConventionNumber(s1.start_date, conventionNumber),
      title: s1.title.trim(),
      description: s1.description.trim(),
      location: s1.location.trim(),
      start_date: s1.start_date,
      end_date: s1.end_date,
      status: "draft" as const,
    };

    let id = conventionId;
    if (!id) {
      const res = await conventionsApi.create(payload);
      if (!res?.success || !res.data?.id) {
        throw new Error(res?.message ?? "Failed to create convention.");
      }
      id = res.data.id;
      setConventionId(id);
      setConventionNumber(res.data.convention_number);
    } else {
      const res = await conventionsApi.update(id, payload);
      if (!res?.success) {
        throw new Error(res?.message ?? "Failed to update convention.");
      }
    }

    const newAttachments: ConventionAttachment[] = [...s1.attachments];

    for (const img of s1.pendingImages) {
      const res = await conventionsApi.addAttachment(id, img.file);
      if (res?.success && res.data) {
        newAttachments.push(res.data);
      } else {
        throw new Error(res?.message ?? `Failed to upload image "${img.file.name}".`);
      }
    }

    for (const pdf of s1.pendingPdfs) {
      const res = await conventionsApi.addAttachment(id, pdf.file);
      if (res?.success && res.data) {
        newAttachments.push(res.data);
      } else {
        throw new Error(res?.message ?? `Failed to upload PDF "${pdf.file.name}".`);
      }
    }

    setFormData((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        attachments: newAttachments,
        pendingImages: [],
        pendingPdfs: [],
      },
    }));

    return id;
  };

  const handleNext = async () => {
    if (step === 1) {
      const validationErrors = validateStep1(formData.step1);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSaving(true);
      setStepError(null);
      try {
        await saveStep1();
        setCompletedSteps((prev) => new Set(prev).add(1));
        goTo(2);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to save convention information.";
        setStepError(msg);
        showError(msg);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (step === 2 || step === 3) {
      setCompletedSteps((prev) => new Set(prev).add(step));
    }

    goTo(step + 1);
  };

  const handleBack = () => goTo(step - 1);

  const handleStepClick = (targetStep: number) => {
    if (step === 4 && completedSteps.has(targetStep) && targetStep !== step) {
      goTo(targetStep);
    }
  };

  const handleSaveDraft = async () => {
    if (!conventionId) return;
    setIsSaving(true);
    setStepError(null);
    try {
      if (step === 1 || !isStep1Valid(formData.step1)) {
        const validationErrors = validateStep1(formData.step1);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setStepError("Please fix convention information before saving.");
          return;
        }
      }
      await saveStep1();
      showSuccess("Convention saved as draft.");
      router.push("/admin-dashboard/conventions");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save draft.";
      setStepError(msg);
      showError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!conventionId) return;
    setIsSaving(true);
    setStepError(null);
    try {
      await saveStep1();
      const res = await conventionsApi.publish(conventionId);
      if (!res?.success) {
        throw new Error(res?.message ?? "Failed to publish convention.");
      }
      showSuccess(`"${formData.step1.title}" published successfully.`);
      router.push("/admin-dashboard/conventions");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish convention.";
      setStepError(msg);
      showError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSchedules = (schedules: WizardScheduleEntry[]) => {
    setFormData((prev) => ({ ...prev, schedules }));
  };

  const updateSpeakers = (speakers: WizardSpeakerEntry[]) => {
    setFormData((prev) => ({ ...prev, speakers }));
  };

  return (
    <div className="conv-wizard chapter-wizard">
      <StepIndicator
        currentStep={step}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
        allowJump={step === 4}
      />

      {stepError && (
        <div className="wizard-error-banner" role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <span>{stepError}</span>
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {step === 1 && (
            <Step1Info
              data={formData.step1}
              errors={errors}
              conventionId={conventionId}
              isSaving={isSaving}
              onChange={(step1) => setFormData((prev) => ({ ...prev, step1 }))}
            />
          )}
          {step === 2 && (
            <Step2Schedule
              schedules={formData.schedules}
              startDate={formData.step1.start_date}
              endDate={formData.step1.end_date}
              conventionId={conventionId!}
              onChange={updateSchedules}
            />
          )}
          {step === 3 && (
            <Step3Speakers
              speakers={formData.speakers}
              conventionId={conventionId!}
              onChange={updateSpeakers}
            />
          )}
          {step === 4 && (
            <Step4Review
              data={formData}
              onEditStep={goTo}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="wizard-nav">
        <span className="wizard-step-badge">Step {step} of {STEPS.length}</span>
        <div className="wizard-nav__right">
          {step > 1 && (
            <button
              type="button"
              className="wizard-btn wizard-btn--secondary"
              onClick={handleBack}
              disabled={isSaving}
            >
              Back
            </button>
          )}

          {step < 4 && (
            <button
              type="button"
              className="wizard-btn wizard-btn--primary"
              onClick={handleNext}
              disabled={isSaving || (step === 1 && !isStep1Valid(formData.step1))}
            >
              {isSaving ? <Loader2 size={20} className="wizard-spin-icon" aria-hidden="true" /> : null}
              {isSaving && step === 1 ? "Saving…" : "Next"}
            </button>
          )}

          {step === 4 && (
            <>
              <button
                type="button"
                className="wizard-btn wizard-btn--secondary"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 size={20} className="wizard-spin-icon" aria-hidden="true" /> : null}
                Save as Draft
              </button>
              <button
                type="button"
                className="wizard-btn wizard-btn--success"
                onClick={handlePublish}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 size={20} className="wizard-spin-icon" aria-hidden="true" /> : null}
                Publish Convention
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step Indicator
// ═════════════════════════════════════════════════════════════════════════════

function StepIndicator({
  currentStep,
  completedSteps,
  onStepClick,
  allowJump,
}: {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
  allowJump: boolean;
}) {
  return (
    <div className="wizard-stepper" role="list" aria-label="Wizard progress">
      {STEPS.map((s) => {
        const isActive = s.number === currentStep;
        const isCompleted = completedSteps.has(s.number) || s.number < currentStep;
        const canJump = allowJump && isCompleted && !isActive;

        const content = (
          <>
            <div className="wizard-stepper__circle">
              {isCompleted && !isActive ? (
                <CheckCircle size={22} strokeWidth={2.5} aria-hidden="true" />
              ) : (
                s.number
              )}
            </div>
            <span className="wizard-stepper__label">{s.label}</span>
          </>
        );

        return (
          <div
            key={s.number}
            className={`wizard-stepper__step${isActive ? " wizard-stepper__step--active" : ""}${isCompleted ? " wizard-stepper__step--completed" : ""}`}
            role="listitem"
            aria-current={isActive ? "step" : undefined}
          >
            {canJump ? (
              <button
                type="button"
                className="conv-stepper-btn"
                onClick={() => onStepClick(s.number)}
                aria-label={`Go to step ${s.number}: ${s.label}`}
              >
                {content}
              </button>
            ) : (
              content
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step 1 — Convention Information
// ═════════════════════════════════════════════════════════════════════════════

function Step1Info({
  data,
  errors,
  conventionId,
  isSaving,
  onChange,
}: {
  data: WizardStep1;
  errors: Record<string, string>;
  conventionId?: string;
  isSaving: boolean;
  onChange: (d: WizardStep1) => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleField = (field: keyof Omit<WizardStep1, "attachments" | "pendingImages" | "pendingPdfs">, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const addPendingImages = (files: FileList | null) => {
    if (!files?.length) return;
    const newItems: WizardPendingFile[] = [];
    for (const file of Array.from(files)) {
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
        showError(`"${file.name}" is not a supported image format.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError(`"${file.name}" exceeds the 5MB limit.`);
        continue;
      }
      const entry: WizardPendingFile = { _key: uniqueKey(), file, previewUrl: URL.createObjectURL(file) };
      newItems.push(entry);
    }
    if (newItems.length) {
      onChange({ ...data, pendingImages: [...data.pendingImages, ...newItems] });
    }
  };

  const addPendingPdfs = (files: FileList | null) => {
    if (!files?.length) return;
    const newItems: WizardPendingFile[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.includes("pdf")) {
        showError(`"${file.name}" is not a PDF file.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        showError(`"${file.name}" exceeds the 10MB limit.`);
        continue;
      }
      newItems.push({ _key: uniqueKey(), file });
    }
    if (newItems.length) {
      onChange({ ...data, pendingPdfs: [...data.pendingPdfs, ...newItems] });
    }
  };

  const removePendingImage = (key: string) => {
    onChange({ ...data, pendingImages: data.pendingImages.filter((p) => p._key !== key) });
  };

  const removePendingPdf = (key: string) => {
    onChange({ ...data, pendingPdfs: data.pendingPdfs.filter((p) => p._key !== key) });
  };

  const removeSavedAttachment = async (attachment: ConventionAttachment) => {
    if (!conventionId) {
      onChange({ ...data, attachments: data.attachments.filter((a) => a.id !== attachment.id) });
      return;
    }
    try {
      await conventionsApi.removeAttachment(conventionId, attachment.id);
      onChange({ ...data, attachments: data.attachments.filter((a) => a.id !== attachment.id) });
      showSuccess(`"${attachment.file_name}" removed.`);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Failed to remove attachment.");
    }
  };

  const savedImages = data.attachments.filter((a) => a.file_type === "image");
  const savedPdfs = data.attachments.filter((a) => a.file_type === "pdf");

  return (
    <div className="wizard-panel">
      <div>
        <h2 className="wizard-panel__title">Convention Information</h2>
        <p className="wizard-panel__subtitle">
          Enter the basic details for this convention. Required fields are marked with an asterisk.
        </p>
      </div>

      <div className="wizard-section">
        <div className="wizard-field">
          <label htmlFor="conv-title" className="wizard-field__label">
            Title <span className="wizard-field__required">*</span>
          </label>
          <input
            id="conv-title"
            type="text"
            className={`wizard-field__input${errors.title ? " wizard-field__input--error" : ""}`}
            value={data.title}
            onChange={(e) => handleField("title", e.target.value)}
            placeholder="e.g. PAGE International Convention & General Assembly"
            disabled={isSaving}
          />
          {errors.title && <span className="wizard-field__error">{errors.title}</span>}
        </div>

        <div className="wizard-field">
          <label htmlFor="conv-desc" className="wizard-field__label">
            Short Description <span className="wizard-field__required">*</span>
          </label>
          <textarea
            id="conv-desc"
            className={`wizard-field__input${errors.description ? " wizard-field__input--error" : ""}`}
            value={data.description}
            onChange={(e) => handleField("description", e.target.value)}
            placeholder="Brief summary of this convention…"
            rows={4}
            disabled={isSaving}
          />
          {errors.description && <span className="wizard-field__error">{errors.description}</span>}
        </div>

        <div className="wizard-field">
          <label htmlFor="conv-location" className="wizard-field__label">
            Location <span className="wizard-field__required">*</span>
          </label>
          <input
            id="conv-location"
            type="text"
            className={`wizard-field__input${errors.location ? " wizard-field__input--error" : ""}`}
            value={data.location}
            onChange={(e) => handleField("location", e.target.value)}
            placeholder="e.g. SMX Convention Center, Pasay City"
            disabled={isSaving}
          />
          {errors.location && <span className="wizard-field__error">{errors.location}</span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="wizard-field">
            <label htmlFor="conv-start" className="wizard-field__label">
              Start Date <span className="wizard-field__required">*</span>
            </label>
            <input
              id="conv-start"
              type="date"
              className={`wizard-field__input${errors.start_date ? " wizard-field__input--error" : ""}`}
              value={data.start_date}
              onChange={(e) => handleField("start_date", e.target.value)}
              disabled={isSaving}
            />
            {errors.start_date && <span className="wizard-field__error">{errors.start_date}</span>}
          </div>

          <div className="wizard-field">
            <label htmlFor="conv-end" className="wizard-field__label">
              End Date <span className="wizard-field__required">*</span>
            </label>
            <input
              id="conv-end"
              type="date"
              className={`wizard-field__input${errors.end_date ? " wizard-field__input--error" : ""}`}
              value={data.end_date}
              min={data.start_date || undefined}
              onChange={(e) => handleField("end_date", e.target.value)}
              disabled={isSaving}
            />
            {errors.end_date && <span className="wizard-field__error">{errors.end_date}</span>}
          </div>
        </div>
      </div>

      <div className="wizard-section">
        <h3 className="wizard-section__title">Images <span style={{ fontWeight: 400, fontSize: 16, color: "#64748b" }}>(Optional)</span></h3>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="sr-only"
          id="conv-images-input"
          onChange={(e) => {
            addPendingImages(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="wizard-add-btn conv-upload-dropzone"
          onClick={() => imageInputRef.current?.click()}
          disabled={isSaving}
        >
          <Upload size={20} strokeWidth={2.5} aria-hidden="true" />
          <span>Upload Images</span>
          <small>JPG, PNG, or WEBP</small>
        </button>

        {(savedImages.length > 0 || data.pendingImages.length > 0) && (
          <div className="conv-upload-grid" aria-label="Image previews">
            {savedImages.map((img) => (
              <div key={img.id} className="conv-upload-thumb">
                <img src={img.file_url} alt={img.file_name} />
                <button
                  type="button"
                  className="conv-upload-thumb__remove"
                  aria-label={`Remove ${img.file_name}`}
                  onClick={() => removeSavedAttachment(img)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {data.pendingImages.map((img) => (
              <div key={img._key} className="conv-upload-thumb">
                {img.previewUrl ? (
                  <img src={img.previewUrl} alt={img.file.name} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <ImageIcon size={32} color="#94a3b8" />
                  </div>
                )}
                <button
                  type="button"
                  className="conv-upload-thumb__remove"
                  aria-label={`Remove ${img.file.name}`}
                  onClick={() => removePendingImage(img._key)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="wizard-section">
        <h3 className="wizard-section__title">PDF Documents <span style={{ fontWeight: 400, fontSize: 16, color: "#64748b" }}>(Optional)</span></h3>
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="sr-only"
          id="conv-pdfs-input"
          onChange={(e) => {
            addPendingPdfs(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="wizard-add-btn conv-upload-dropzone"
          onClick={() => pdfInputRef.current?.click()}
          disabled={isSaving}
        >
          <FileText size={20} strokeWidth={2.5} aria-hidden="true" />
          <span>Upload PDFs</span>
          <small>PDF files only</small>
        </button>

        {(savedPdfs.length > 0 || data.pendingPdfs.length > 0) && (
          <div className="conv-pdf-list">
            {savedPdfs.map((pdf) => (
              <div key={pdf.id} className="conv-pdf-item">
                <span><FileText size={20} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} aria-hidden="true" />{pdf.file_name}</span>
                <button
                  type="button"
                  className="wizard-row__delete"
                  aria-label={`Remove ${pdf.file_name}`}
                  onClick={() => removeSavedAttachment(pdf)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {data.pendingPdfs.map((pdf) => (
              <div key={pdf._key} className="conv-pdf-item">
                <span><FileText size={20} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} aria-hidden="true" />{pdf.file.name}</span>
                <button
                  type="button"
                  className="wizard-row__delete"
                  aria-label={`Remove ${pdf.file.name}`}
                  onClick={() => removePendingPdf(pdf._key)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step 2 — Program Schedule
// ═════════════════════════════════════════════════════════════════════════════

const EMPTY_SCHEDULE = (): Omit<WizardScheduleEntry, "_key"> => ({
  schedule_date: "",
  title: "",
  event_type: CONVENTION_EVENT_TYPES[0],
  start_time: "",
  end_time: "",
  location: "",
});

function Step2Schedule({
  schedules,
  startDate,
  endDate,
  conventionId,
  onChange,
}: {
  schedules: WizardScheduleEntry[];
  startDate: string;
  endDate: string;
  conventionId: string;
  onChange: (schedules: WizardScheduleEntry[]) => void;
}) {
  const [form, setForm] = useState<Omit<WizardScheduleEntry, "_key">>(EMPTY_SCHEDULE());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.schedule_date) e.schedule_date = "Schedule date is required.";
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.event_type) e.event_type = "Event type is required.";
    if (!form.start_time) e.start_time = "Start time is required.";
    if (!form.end_time) e.end_time = "End time is required.";
    if (!form.location.trim()) e.location = "Location is required.";
    if (form.schedule_date && startDate && endDate) {
      if (form.schedule_date < startDate || form.schedule_date > endDate) {
        e.schedule_date = "Date must fall within the convention date range.";
      }
    }
    return e;
  };

  const resetForm = () => {
    setForm(EMPTY_SCHEDULE());
    setEditingKey(null);
    setFormErrors({});
  };

  const handleSaveSchedule = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        schedule_date: form.schedule_date,
        title: form.title.trim(),
        event_type: form.event_type,
        start_time: form.start_time,
        end_time: form.end_time,
        location: form.location.trim(),
      };

      if (editingKey) {
        const existing = schedules.find((s) => s._key === editingKey);
        if (existing?.id) {
          const res = await conventionsApi.updateSchedule(conventionId, existing.id, payload);
          if (!res?.success || !res.data) throw new Error(res?.message ?? "Failed to update schedule.");
          onChange(
            schedules.map((s) =>
              s._key === editingKey
                ? { ...s, ...form, id: res.data.id }
                : s,
            ),
          );
          showSuccess("Schedule updated.");
        }
      } else {
        const res = await conventionsApi.addSchedule(conventionId, payload);
        if (!res?.success || !res.data) throw new Error(res?.message ?? "Failed to add schedule.");
        onChange([
          ...schedules,
          { _key: uniqueKey(), id: res.data.id, ...form },
        ]);
        showSuccess("Schedule added.");
      }
      resetForm();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Failed to save schedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entry: WizardScheduleEntry) => {
    setForm({
      schedule_date: entry.schedule_date,
      title: entry.title,
      event_type: entry.event_type,
      start_time: entry.start_time,
      end_time: entry.end_time,
      location: entry.location,
    });
    setEditingKey(entry._key);
    setFormErrors({});
  };

  const handleDelete = async (entry: WizardScheduleEntry) => {
    if (entry.id) {
      try {
        await conventionsApi.removeSchedule(conventionId, entry.id);
        showSuccess("Schedule removed.");
      } catch (err: unknown) {
        showError(err instanceof Error ? err.message : "Failed to remove schedule.");
        return;
      }
    }
    onChange(schedules.filter((s) => s._key !== entry._key));
    if (editingKey === entry._key) resetForm();
  };

  const grouped = groupSchedulesByDate(schedules);

  return (
    <div className="wizard-panel">
      <div>
        <h2 className="wizard-panel__title">Program Schedule</h2>
        <p className="wizard-panel__subtitle">
          Add sessions between {formatDateRange(startDate, endDate)}. Dates outside this range are not allowed.
        </p>
      </div>

      <div className="wizard-section">
        <h3 className="wizard-section__title">{editingKey ? "Edit Schedule" : "Add Schedule"}</h3>

        <div className="wizard-field">
          <label htmlFor="sched-date" className="wizard-field__label">Schedule Date <span className="wizard-field__required">*</span></label>
          <input
            id="sched-date"
            type="date"
            className={`wizard-field__input${formErrors.schedule_date ? " wizard-field__input--error" : ""}`}
            value={form.schedule_date}
            min={startDate}
            max={endDate}
            onChange={(e) => setForm((f) => ({ ...f, schedule_date: e.target.value }))}
            disabled={isSubmitting}
          />
          {formErrors.schedule_date && <span className="wizard-field__error">{formErrors.schedule_date}</span>}
        </div>

        <div className="wizard-field">
          <label htmlFor="sched-title" className="wizard-field__label">Title <span className="wizard-field__required">*</span></label>
          <input
            id="sched-title"
            type="text"
            className={`wizard-field__input${formErrors.title ? " wizard-field__input--error" : ""}`}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Opening Plenary"
            disabled={isSubmitting}
          />
          {formErrors.title && <span className="wizard-field__error">{formErrors.title}</span>}
        </div>

        <div className="wizard-field">
          <label htmlFor="sched-type" className="wizard-field__label">Event Type <span className="wizard-field__required">*</span></label>
          <select
            id="sched-type"
            className={`wizard-field__input${formErrors.event_type ? " wizard-field__input--error" : ""}`}
            value={form.event_type}
            onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value }))}
            disabled={isSubmitting}
          >
            {CONVENTION_EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {formErrors.event_type && <span className="wizard-field__error">{formErrors.event_type}</span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="wizard-field">
            <label htmlFor="sched-start" className="wizard-field__label">Start Time <span className="wizard-field__required">*</span></label>
            <input
              id="sched-start"
              type="time"
              className={`wizard-field__input${formErrors.start_time ? " wizard-field__input--error" : ""}`}
              value={form.start_time}
              onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
              disabled={isSubmitting}
            />
            {formErrors.start_time && <span className="wizard-field__error">{formErrors.start_time}</span>}
          </div>
          <div className="wizard-field">
            <label htmlFor="sched-end" className="wizard-field__label">End Time <span className="wizard-field__required">*</span></label>
            <input
              id="sched-end"
              type="time"
              className={`wizard-field__input${formErrors.end_time ? " wizard-field__input--error" : ""}`}
              value={form.end_time}
              onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
              disabled={isSubmitting}
            />
            {formErrors.end_time && <span className="wizard-field__error">{formErrors.end_time}</span>}
          </div>
        </div>

        <div className="wizard-field">
          <label htmlFor="sched-location" className="wizard-field__label">Location <span className="wizard-field__required">*</span></label>
          <input
            id="sched-location"
            type="text"
            className={`wizard-field__input${formErrors.location ? " wizard-field__input--error" : ""}`}
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="e.g. Main Hall"
            disabled={isSubmitting}
          />
          {formErrors.location && <span className="wizard-field__error">{formErrors.location}</span>}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            className="wizard-btn wizard-btn--primary"
            onClick={handleSaveSchedule}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 size={20} className="wizard-spin-icon" aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}
            {editingKey ? "Save Schedule" : "Add Schedule"}
          </button>
          {editingKey && (
            <button type="button" className="wizard-btn wizard-btn--secondary" onClick={resetForm} disabled={isSubmitting}>
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="wizard-section">
        <h3 className="wizard-section__title">Added Schedules</h3>
        {schedules.length === 0 ? (
          <p style={{ fontSize: 18, color: "#94a3b8", fontStyle: "italic" }}>No schedules added yet.</p>
        ) : (
          Array.from(grouped.entries()).map(([date, items]) => (
            <div key={date} className="conv-schedule-group">
              <h4 className="conv-schedule-group__date">{formatDate(date)}</h4>
              {items.map((entry) => (
                <div key={entry._key} className="conv-entry-card">
                  <div className="conv-entry-card__header">
                    <div>
                      <h5 className="conv-entry-card__title">{entry.title}</h5>
                      <p className="conv-entry-card__meta">
                        {entry.event_type} · {entry.start_time} – {entry.end_time} · {entry.location}
                      </p>
                    </div>
                    <div className="conv-entry-card__actions">
                      <button type="button" className="wizard-btn wizard-btn--secondary" style={{ minHeight: 48, padding: "0 16px", fontSize: 16 }} onClick={() => handleEdit(entry)}>
                        <Pencil size={16} aria-hidden="true" /> Edit
                      </button>
                      <button type="button" className="wizard-btn wizard-btn--danger" style={{ minHeight: 48, padding: "0 16px", fontSize: 16 }} onClick={() => handleDelete(entry)}>
                        <Trash2 size={16} aria-hidden="true" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step 3 — Speakers
// ═════════════════════════════════════════════════════════════════════════════

const EMPTY_SPEAKER = (): Omit<WizardSpeakerEntry, "_key"> => ({
  name: "",
  role_position: "",
  institution: "",
  presentation_topic: "",
});

function Step3Speakers({
  speakers,
  conventionId,
  onChange,
}: {
  speakers: WizardSpeakerEntry[];
  conventionId: string;
  onChange: (speakers: WizardSpeakerEntry[]) => void;
}) {
  const [form, setForm] = useState<Omit<WizardSpeakerEntry, "_key">>(EMPTY_SPEAKER());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.role_position.trim()) e.role_position = "Role/position is required.";
    if (!form.institution.trim()) e.institution = "School/institution is required.";
    if (!form.presentation_topic.trim()) e.presentation_topic = "Presentation topic is required.";
    return e;
  };

  const resetForm = () => {
    setForm(EMPTY_SPEAKER());
    setEditingKey(null);
    setFormErrors({});
  };

  const handleSaveSpeaker = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        role_position: form.role_position.trim(),
        institution: form.institution.trim(),
        presentation_topic: form.presentation_topic.trim(),
      };

      if (editingKey) {
        const existing = speakers.find((s) => s._key === editingKey);
        if (existing?.id) {
          const res = await conventionsApi.updateSpeaker(conventionId, existing.id, payload);
          if (!res?.success || !res.data) throw new Error(res?.message ?? "Failed to update speaker.");
          onChange(
            speakers.map((s) =>
              s._key === editingKey ? { ...s, ...form, id: res.data.id } : s,
            ),
          );
          showSuccess("Speaker updated.");
        }
      } else {
        const res = await conventionsApi.addSpeaker(conventionId, payload);
        if (!res?.success || !res.data) throw new Error(res?.message ?? "Failed to add speaker.");
        onChange([...speakers, { _key: uniqueKey(), id: res.data.id, ...form }]);
        showSuccess("Speaker added.");
      }
      resetForm();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Failed to save speaker.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entry: WizardSpeakerEntry) => {
    setForm({
      name: entry.name,
      role_position: entry.role_position,
      institution: entry.institution,
      presentation_topic: entry.presentation_topic,
    });
    setEditingKey(entry._key);
    setFormErrors({});
  };

  const handleDelete = async (entry: WizardSpeakerEntry) => {
    if (entry.id) {
      try {
        await conventionsApi.removeSpeaker(conventionId, entry.id);
        showSuccess("Speaker removed.");
      } catch (err: unknown) {
        showError(err instanceof Error ? err.message : "Failed to remove speaker.");
        return;
      }
    }
    onChange(speakers.filter((s) => s._key !== entry._key));
    if (editingKey === entry._key) resetForm();
  };

  return (
    <div className="wizard-panel">
      <div>
        <h2 className="wizard-panel__title">Speakers</h2>
        <p className="wizard-panel__subtitle">Add speakers and their presentation details for this convention.</p>
      </div>

      <div className="wizard-section">
        <h3 className="wizard-section__title">{editingKey ? "Edit Speaker" : "Add Speaker"}</h3>

        {(["name", "role_position", "institution", "presentation_topic"] as const).map((field) => {
          const labels: Record<typeof field, string> = {
            name: "Name",
            role_position: "Role/Position",
            institution: "School/Institution",
            presentation_topic: "Presentation Topic",
          };
          return (
            <div key={field} className="wizard-field">
              <label htmlFor={`speaker-${field}`} className="wizard-field__label">
                {labels[field]} <span className="wizard-field__required">*</span>
              </label>
              <input
                id={`speaker-${field}`}
                type="text"
                className={`wizard-field__input${formErrors[field] ? " wizard-field__input--error" : ""}`}
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                disabled={isSubmitting}
              />
              {formErrors[field] && <span className="wizard-field__error">{formErrors[field]}</span>}
            </div>
          );
        })}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="button" className="wizard-btn wizard-btn--primary" onClick={handleSaveSpeaker} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={20} className="wizard-spin-icon" aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}
            {editingKey ? "Save Speaker" : "Add Speaker"}
          </button>
          {editingKey && (
            <button type="button" className="wizard-btn wizard-btn--secondary" onClick={resetForm} disabled={isSubmitting}>
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className="wizard-section">
        <h3 className="wizard-section__title">Added Speakers</h3>
        {speakers.length === 0 ? (
          <p style={{ fontSize: 18, color: "#94a3b8", fontStyle: "italic" }}>No speakers added yet.</p>
        ) : (
          speakers.map((entry) => (
            <div key={entry._key} className="conv-entry-card">
              <div className="conv-entry-card__header">
                <div>
                  <h5 className="conv-entry-card__title">{entry.name}</h5>
                  <p className="conv-entry-card__meta">
                    {entry.role_position} · {entry.institution}
                  </p>
                  <p className="conv-entry-card__meta" style={{ marginTop: 4 }}>
                    Topic: {entry.presentation_topic}
                  </p>
                </div>
                <div className="conv-entry-card__actions">
                  <button type="button" className="wizard-btn wizard-btn--secondary" style={{ minHeight: 48, padding: "0 16px", fontSize: 16 }} onClick={() => handleEdit(entry)}>
                    <Pencil size={16} aria-hidden="true" /> Edit
                  </button>
                  <button type="button" className="wizard-btn wizard-btn--danger" style={{ minHeight: 48, padding: "0 16px", fontSize: 16 }} onClick={() => handleDelete(entry)}>
                    <Trash2 size={16} aria-hidden="true" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step 4 — Review & Submission
// ═════════════════════════════════════════════════════════════════════════════

function Step4Review({
  data,
  onEditStep,
}: {
  data: WizardFormData;
  onEditStep: (step: number) => void;
}) {
  const { step1, schedules, speakers } = data;
  const images = step1.attachments.filter((a) => a.file_type === "image");
  const pdfs = step1.attachments.filter((a) => a.file_type === "pdf");
  const pendingImageCount = step1.pendingImages.length;
  const pendingPdfCount = step1.pendingPdfs.length;
  const grouped = groupSchedulesByDate(schedules);

  return (
    <div className="wizard-panel">
      <div>
        <h2 className="wizard-panel__title">Review & Submission</h2>
        <p className="wizard-panel__subtitle">
          Review all convention details before saving as draft or publishing.
        </p>
      </div>

      <div className="conv-review-section">
        <div className="conv-review-section__header">
          <h3 className="conv-review-section__title">Convention Information</h3>
          <button type="button" className="conv-review-edit-link" onClick={() => onEditStep(1)}>Edit</button>
        </div>
        <p className="conv-review-row"><strong>Title:</strong> {step1.title}</p>
        <p className="conv-review-row"><strong>Description:</strong> {step1.description}</p>
        <p className="conv-review-row"><strong>Location:</strong> {step1.location}</p>
        <p className="conv-review-row"><strong>Dates:</strong> {formatDateRange(step1.start_date, step1.end_date)}</p>
        {(images.length > 0 || pdfs.length > 0 || pendingImageCount > 0 || pendingPdfCount > 0) && (
          <div style={{ marginTop: 8 }}>
            {images.length > 0 && (
              <div className="conv-upload-grid" style={{ marginBottom: 16 }}>
                {images.map((img) => (
                  <div key={img.id} className="conv-upload-thumb">
                    <img src={img.file_url} alt={img.file_name} />
                  </div>
                ))}
              </div>
            )}
            {pdfs.length > 0 && (
              <div className="conv-pdf-list">
                {pdfs.map((pdf) => (
                  <div key={pdf.id} className="conv-pdf-item">
                    <span><FileText size={20} style={{ display: "inline", marginRight: 8 }} aria-hidden="true" />{pdf.file_name}</span>
                  </div>
                ))}
              </div>
            )}
            {(pendingImageCount > 0 || pendingPdfCount > 0) && (
              <p className="conv-review-row" style={{ color: "#b45309", marginTop: 8 }}>
                {pendingImageCount + pendingPdfCount} file(s) pending upload — go back to Step 1 and click Next to upload.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="conv-review-section">
        <div className="conv-review-section__header">
          <h3 className="conv-review-section__title">Program Schedule ({schedules.length})</h3>
          <button type="button" className="conv-review-edit-link" onClick={() => onEditStep(2)}>Edit</button>
        </div>
        {schedules.length === 0 ? (
          <p className="conv-review-row" style={{ color: "#94a3b8", fontStyle: "italic" }}>No schedules added.</p>
        ) : (
          Array.from(grouped.entries()).map(([date, items]) => (
            <div key={date} style={{ marginBottom: 16 }}>
              <p className="conv-review-row"><strong>{formatDate(date)}</strong></p>
              {items.map((s) => (
                <p key={s._key} className="conv-review-row" style={{ paddingLeft: 16 }}>
                  {s.title} — {s.event_type}, {s.start_time}–{s.end_time}, {s.location}
                </p>
              ))}
            </div>
          ))
        )}
      </div>

      <div className="conv-review-section">
        <div className="conv-review-section__header">
          <h3 className="conv-review-section__title">Speakers ({speakers.length})</h3>
          <button type="button" className="conv-review-edit-link" onClick={() => onEditStep(3)}>Edit</button>
        </div>
        {speakers.length === 0 ? (
          <p className="conv-review-row" style={{ color: "#94a3b8", fontStyle: "italic" }}>No speakers added.</p>
        ) : (
          speakers.map((s) => (
            <div key={s._key} className="conv-review-row" style={{ marginBottom: 12 }}>
              <strong>{s.name}</strong> — {s.role_position}, {s.institution}<br />
              <span style={{ color: "#64748b" }}>Topic: {s.presentation_topic}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
