"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import {
  Upload,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  ChapterFull,
  WizardFormData,
  WizardStep1,
  WizardStep2,
  WizardStep3,
  WizardStep4,
  WizardImageEntry,
  WizardDocumentEntry,
  WizardOfficerEntry,
  WizardActivityEntry,
  WizardAnnouncementEntry,
} from "../types";
import { chaptersApi } from "../../../lib/api-client";
import { getOfficerAvatar } from "./OfficerPreview";
import "./ChapterWizard.css";

// ── REGIONS_MAP — canonical source, matches ChapterToolbar.tsx ───────────────
export const REGIONS_MAP: Record<string, string[]> = {
  Luzon: [
    "NCR",
    "CAR",
    "Ilocos Region",
    "Cagayan Valley",
    "Central Luzon",
    "CALABARZON",
    "MIMAROPA",
    "Bicol Region",
  ],
  Visayas: ["Western Visayas", "Central Visayas", "Eastern Visayas"],
  Mindanao: [
    "Zamboanga Peninsula",
    "Northern Mindanao",
    "Davao Region",
    "SOCCSKSARGEN",
    "Caraga",
    "BARMM",
  ],
};

// ── Helper: unique key ────────────────────────────────────────────────────────
let _keyCounter = 0;
const uniqueKey = () => `k-${Date.now()}-${++_keyCounter}`;

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { number: 1, label: "Basic Info" },
  { number: 2, label: "Overview" },
  { number: 3, label: "Officers" },
  { number: 4, label: "Activities" },
  { number: 5, label: "Review" },
];

// ── Default form state ────────────────────────────────────────────────────────
const defaultStep1 = (): WizardStep1 => ({
  title: "",
  short_description: "",
  island_group: "",
  region: "",
  images: [],
  documents: [],
});

const defaultStep2 = (): WizardStep2 => ({ overview: "", mission: "", vision: "" });
const defaultStep3 = (): WizardStep3 => ({ officers: [] });
const defaultStep4 = (): WizardStep4 => ({ activities: [], announcements: [] });

// ── Map ChapterFull → WizardFormData (edit mode pre-fill) ────────────────────
function chapterToWizardData(ch: ChapterFull): WizardFormData {
  return {
    step1: {
      title: ch.title,
      short_description: ch.short_description,
      island_group: ch.island_group,
      region: ch.region,
      images: ch.images.map((img) => ({
        file_url: img.file_url,
        file_name: img.file_name,
        sort_order: img.sort_order,
        previewUrl: img.file_url,
      })),
      documents: ch.documents.map((doc) => ({
        file_url: doc.file_url,
        file_name: doc.file_name,
        file_type: doc.file_type,
      })),
    },
    step2: {
      overview: ch.overview,
      mission: ch.mission ?? "",
      vision: ch.vision ?? "",
    },
    step3: {
      officers: ch.officers.map((o) => ({
        _key: uniqueKey(),
        name: o.name,
        category_type: o.category_type,
        year_joined: o.year_joined,
        sort_order: o.sort_order,
        image_url: o.image_url,
      })),
    },
    step4: {
      activities: ch.activities.map((a) => ({
        _key: uniqueKey(),
        title: a.title,
        description: a.description,
        date: a.date.slice(0, 10),
        image_url: a.image_url ?? "",
      })),
      announcements: ch.announcements.map((a) => ({
        _key: uniqueKey(),
        title: a.title,
        content: a.content,
        date: a.date.slice(0, 10),
      })),
    },
  };
}

// ── Map WizardFormData → API payload ─────────────────────────────────────────
function wizardToPayload(data: WizardFormData, targetStatus: "draft" | "published") {
  return {
    title: data.step1.title,
    short_description: data.step1.short_description,
    island_group: data.step1.island_group,
    region: data.step1.region,
    overview: data.step2.overview,
    mission: data.step2.mission || undefined,
    vision: data.step2.vision || undefined,
    status: targetStatus,
    images: data.step1.images.map((img, idx) => ({
      file_url: img.file_url,
      file_name: img.file_name,
      sort_order: idx,
    })),
    documents: data.step1.documents.map((doc) => ({
      file_url: doc.file_url,
      file_name: doc.file_name,
      file_type: doc.file_type,
    })),
    officers: data.step3.officers.map((o, idx) => ({
      name: o.name,
      category_type: o.category_type,
      year_joined: Number(o.year_joined),
      sort_order: idx,
      image_url: o.image_url || null,
    })),
    activities: data.step4.activities.map((a) => ({
      title: a.title,
      description: a.description,
      date: a.date,
      image_url: a.image_url || undefined,
    })),
    announcements: data.step4.announcements.map((a) => ({
      title: a.title,
      content: a.content,
      date: a.date,
    })),
  };
}

// ── Step transition variants ──────────────────────────────────────────────────
const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

// ── Props ─────────────────────────────────────────────────────────────────────
export interface ChapterWizardProps {
  mode: "create" | "edit";
  chapterId?: string;
  initialData?: ChapterFull;
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════
export default function ChapterWizard({ mode, chapterId, initialData }: ChapterWizardProps) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState<WizardFormData>(() =>
    initialData ? chapterToWizardData(initialData) : {
      step1: defaultStep1(),
      step2: defaultStep2(),
      step3: defaultStep3(),
      step4: defaultStep4(),
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Navigation helpers ────────────────────────────────────────────────────

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setErrors({});
    setStep(next);
  };

  const validateStep1 = (): Record<string, string> => {
    const e: Record<string, string> = {};
    const s = formData.step1;
    if (!s.title.trim()) e.title = "Chapter title is required.";
    if (!s.short_description.trim()) e.short_description = "Short description is required.";
    if (!s.island_group) e.island_group = "Island group is required.";
    if (!s.region) e.region = "Region is required.";
    if (s.images.length === 0) e.images = "At least one image is required.";
    if (s.documents.length === 0) e.documents = "At least one document is required.";
    return e;
  };

  const validateStep2 = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!formData.step2.overview.trim()) e.overview = "Overview is required.";
    return e;
  };

  const validateStep3 = (): Record<string, string> => {
    const e: Record<string, string> = {};
    formData.step3.officers.forEach((o, i) => {
      if (!o.name.trim()) e[`officer_name_${i}`] = "Name is required.";
      if (!o.category_type.trim()) e[`officer_cat_${i}`] = "Category/role is required.";
      if (!o.year_joined || Number(o.year_joined) < 1900) e[`officer_year_${i}`] = "Valid year is required.";
    });
    return e;
  };

  const handleNext = () => {
    let errs: Record<string, string> = {};
    if (step === 1) errs = validateStep1();
    if (step === 2) errs = validateStep2();
    if (step === 3) errs = validateStep3();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    goTo(step + 1);
  };

  const handleBack = () => goTo(step - 1);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (targetStatus: "draft" | "published") => {
    setIsSubmitting(true);
    try {
      const payload = wizardToPayload(formData, targetStatus) as Record<string, unknown>;

      let result;
      if (mode === "create") {
        result = await chaptersApi.create(payload);
      } else {
        result = await chaptersApi.update(chapterId!, payload);
        // If publishing, also set status
        if (targetStatus === "published" && initialData?.status !== "published") {
          await chaptersApi.updateStatus(chapterId!, "published");
        }
      }

      if (result?.success) {
        const verb = mode === "create" ? "created" : "updated";
        const statusLabel = targetStatus === "published" ? "published" : "saved as draft";
        gooeyToast.success(`Chapter ${verb} and ${statusLabel} successfully! ✓`);
        router.push("/admin-dashboard/chapters");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      gooeyToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="chapter-wizard">
      {/* Step Indicator */}
      <StepIndicator currentStep={step} />

      {/* Step Content */}
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
            <Step1
              data={formData.step1}
              errors={errors}
              onChange={(s1) => setFormData((f) => ({ ...f, step1: s1 }))}
            />
          )}
          {step === 2 && (
            <Step2
              data={formData.step2}
              errors={errors}
              onChange={(s2) => setFormData((f) => ({ ...f, step2: s2 }))}
            />
          )}
          {step === 3 && (
            <Step3
              data={formData.step3}
              errors={errors}
              onChange={(s3) => setFormData((f) => ({ ...f, step3: s3 }))}
            />
          )}
          {step === 4 && (
            <Step4
              data={formData.step4}
              errors={errors}
              onChange={(s4) => setFormData((f) => ({ ...f, step4: s4 }))}
            />
          )}
          {step === 5 && (
            <Step5 data={formData} onEditStep={goTo} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="wizard-nav">
        <span className="wizard-step-badge">Step {step} of {STEPS.length}</span>

        <div className="wizard-nav__right">
          {step > 1 && (
            <button
              type="button"
              className="wizard-btn wizard-btn--secondary"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              ← Back
            </button>
          )}

          {step < 5 && (
            <button
              type="button"
              className="wizard-btn wizard-btn--primary"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Next →
            </button>
          )}

          {step === 5 && (
            <>
              <button
                type="button"
                className="wizard-btn wizard-btn--secondary"
                onClick={() => handleSubmit("draft")}
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className="wizard-spinner" /> : null}
                Save as Draft
              </button>
              <button
                type="button"
                className="wizard-btn wizard-btn--success"
                onClick={() => handleSubmit("published")}
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className="wizard-spinner" /> : null}
                {mode === "create" ? "Publish Chapter" : "Save & Publish"}
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
function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="wizard-stepper" role="list" aria-label="Wizard progress">
      {STEPS.map((s) => {
        const isActive = s.number === currentStep;
        const isCompleted = s.number < currentStep;
        return (
          <div
            key={s.number}
            className={`wizard-stepper__step${isActive ? " wizard-stepper__step--active" : ""}${isCompleted ? " wizard-stepper__step--completed" : ""}`}
            role="listitem"
            aria-current={isActive ? "step" : undefined}
          >
            <div className="wizard-stepper__circle">
              {isCompleted ? <CheckCircle size={22} strokeWidth={2.5} /> : s.number}
            </div>
            <span className="wizard-stepper__label">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step 1 — Basic Information
// ═════════════════════════════════════════════════════════════════════════════
function Step1({
  data,
  errors,
  onChange,
}: {
  data: WizardStep1;
  errors: Record<string, string>;
  onChange: (d: WizardStep1) => void;
}) {
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [uploadingDocs, setUploadingDocs] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const regions = data.island_group ? REGIONS_MAP[data.island_group] ?? [] : [];

  const set = (patch: Partial<WizardStep1>) => onChange({ ...data, ...patch });

  // ── Image upload ────────────────────────────────────────────────────────
  const handleImageFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    for (const file of arr) {
      const id = uniqueKey();
      setUploadingImages((prev) => [...prev, id]);
      // Generate local preview
      const previewUrl = await new Promise<string>((res) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result as string);
        fr.readAsDataURL(file);
      });
      try {
        const result = await chaptersApi.uploadImage(file);
        if (result?.success && result.data?.url) {
          const entry: WizardImageEntry = {
            file_url: result.data.url,
            file_name: result.data.fileName ?? file.name,
            sort_order: data.images.length,
            previewUrl,
          };
          onChange({ ...data, images: [...data.images, entry] });
          gooeyToast.success(`Image "${file.name}" uploaded.`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Image upload failed.";
        gooeyToast.error(msg);
      } finally {
        setUploadingImages((prev) => prev.filter((k) => k !== id));
      }
    }
  };

  // ── Document upload ──────────────────────────────────────────────────────
  const handleDocFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    for (const file of arr) {
      const id = uniqueKey();
      setUploadingDocs((prev) => [...prev, id]);
      try {
        const result = await chaptersApi.uploadDocument(file);
        if (result?.success && result.data?.url) {
          const entry: WizardDocumentEntry = {
            file_url: result.data.url,
            file_name: result.data.fileName ?? file.name,
            file_type: file.type,
          };
          onChange({ ...data, documents: [...data.documents, entry] });
          gooeyToast.success(`Document "${file.name}" uploaded.`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Document upload failed.";
        gooeyToast.error(msg);
      } finally {
        setUploadingDocs((prev) => prev.filter((k) => k !== id));
      }
    }
  };

  return (
    <div className="wizard-panel">
      <div>
        <h2 className="wizard-panel__title">Basic Information</h2>
        <p className="wizard-panel__subtitle">Enter the chapter&apos;s core details, location, and upload required files.</p>
      </div>

      {/* Title */}
      <div className="wizard-field">
        <label className="wizard-field__label" htmlFor="wiz-title">
          Chapter Title <span className="wizard-field__required">*</span>
        </label>
        <input
          id="wiz-title"
          type="text"
          className={`wizard-field__input${errors.title ? " wizard-field__input--error" : ""}`}
          placeholder="e.g. Batangas Chapter"
          value={data.title}
          onChange={(e) => set({ title: e.target.value })}
        />
        {errors.title && <p className="wizard-field__error"><AlertCircle size={15} style={{display:"inline",marginRight:4}}/>{errors.title}</p>}
      </div>

      {/* Short Description */}
      <div className="wizard-field">
        <label className="wizard-field__label" htmlFor="wiz-desc">
          Short Description <span className="wizard-field__required">*</span>
        </label>
        <textarea
          id="wiz-desc"
          className={`wizard-field__textarea${errors.short_description ? " wizard-field__textarea--error" : ""}`}
          placeholder="A brief summary of the chapter (shown on cards)…"
          value={data.short_description}
          onChange={(e) => set({ short_description: e.target.value })}
          rows={3}
        />
        {errors.short_description && <p className="wizard-field__error"><AlertCircle size={15} style={{display:"inline",marginRight:4}}/>{errors.short_description}</p>}
      </div>

      {/* Island Group + Region */}
      <div className="wizard-grid-2">
        <div className="wizard-field">
          <label className="wizard-field__label" htmlFor="wiz-island">
            Island Group <span className="wizard-field__required">*</span>
          </label>
          <div className="wizard-field__select-wrap">
            <select
              id="wiz-island"
              className={`wizard-field__select${errors.island_group ? " wizard-field__select--error" : ""}`}
              value={data.island_group}
              onChange={(e) => set({ island_group: e.target.value as WizardStep1["island_group"], region: "" })}
            >
              <option value="">Select Island Group…</option>
              <option value="Luzon">Luzon</option>
              <option value="Visayas">Visayas</option>
              <option value="Mindanao">Mindanao</option>
            </select>
            <ChevronDown size={16} className="wizard-field__select-chevron" aria-hidden="true" />
          </div>
          {errors.island_group && <p className="wizard-field__error"><AlertCircle size={15} style={{display:"inline",marginRight:4}}/>{errors.island_group}</p>}
        </div>

        <div className="wizard-field">
          <label className="wizard-field__label" htmlFor="wiz-region">
            Region <span className="wizard-field__required">*</span>
          </label>
          <div className="wizard-field__select-wrap">
            <select
              id="wiz-region"
              className={`wizard-field__select${errors.region ? " wizard-field__select--error" : ""}`}
              value={data.region}
              onChange={(e) => set({ region: e.target.value })}
              disabled={!data.island_group}
            >
              <option value="">{data.island_group ? "Select Region…" : "Select Island Group first"}</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={16} className="wizard-field__select-chevron" aria-hidden="true" />
          </div>
          {errors.region && <p className="wizard-field__error"><AlertCircle size={15} style={{display:"inline",marginRight:4}}/>{errors.region}</p>}
        </div>
      </div>

      {/* Images */}
      <div className="wizard-section">
        <h3 className="wizard-section__title">Chapter Images <span className="wizard-field__required">*</span></h3>
        <div
          className="wizard-upload-zone"
          onClick={() => imageInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleImageFiles(e.dataTransfer.files); }}
          role="button"
          tabIndex={0}
          aria-label="Upload chapter images"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") imageInputRef.current?.click(); }}
        >
          <div className="wizard-upload-zone__icon"><Upload size={36} strokeWidth={1.5} /></div>
          <p className="wizard-upload-zone__label">Click or drag images here</p>
          <p className="wizard-upload-zone__hint">JPG, PNG, WEBP up to 10 MB each. Min 1 required.</p>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) => handleImageFiles(e.target.files)}
          />
        </div>
        {errors.images && <p className="wizard-field__error"><AlertCircle size={15} style={{display:"inline",marginRight:4}}/>{errors.images}</p>}
        {uploadingImages.length > 0 && (
          <p className="wizard-upload-progress"><Loader2 size={16} style={{display:"inline",marginRight:6,animation:"wizard-spin 0.7s linear infinite"}}/>Uploading {uploadingImages.length} image(s)…</p>
        )}
        {data.images.length > 0 && (
          <div className="wizard-preview-grid">
            {data.images.map((img, idx) => (
              <div key={idx} className="wizard-preview-item">
                <img src={img.previewUrl ?? img.file_url} alt={img.file_name} className="wizard-preview-item__img" />
                <button
                  type="button"
                  className="wizard-preview-item__remove"
                  aria-label={`Remove image ${img.file_name}`}
                  onClick={() => set({ images: data.images.filter((_, i) => i !== idx) })}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="wizard-section">
        <h3 className="wizard-section__title">Chapter Documents <span className="wizard-field__required">*</span></h3>
        <div
          className="wizard-upload-zone"
          onClick={() => docInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleDocFiles(e.dataTransfer.files); }}
          role="button"
          tabIndex={0}
          aria-label="Upload chapter documents"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") docInputRef.current?.click(); }}
        >
          <div className="wizard-upload-zone__icon"><FileText size={36} strokeWidth={1.5} /></div>
          <p className="wizard-upload-zone__label">Click or drag documents here</p>
          <p className="wizard-upload-zone__hint">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX up to 20 MB. Min 1 required.</p>
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple
            onChange={(e) => handleDocFiles(e.target.files)}
          />
        </div>
        {errors.documents && <p className="wizard-field__error"><AlertCircle size={15} style={{display:"inline",marginRight:4}}/>{errors.documents}</p>}
        {uploadingDocs.length > 0 && (
          <p className="wizard-upload-progress"><Loader2 size={16} style={{display:"inline",marginRight:6,animation:"wizard-spin 0.7s linear infinite"}}/>Uploading {uploadingDocs.length} document(s)…</p>
        )}
        {data.documents.length > 0 && (
          <div className="wizard-preview-grid">
            {data.documents.map((doc, idx) => (
              <div key={idx} className="wizard-preview-item">
                <div className="wizard-preview-item__doc">
                  <FileText size={22} color="#2563eb" />
                  <span className="wizard-preview-item__doc-name">{doc.file_name}</span>
                </div>
                <button
                  type="button"
                  className="wizard-preview-item__remove"
                  aria-label={`Remove document ${doc.file_name}`}
                  onClick={() => set({ documents: data.documents.filter((_, i) => i !== idx) })}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step 2 — Overview
// ═════════════════════════════════════════════════════════════════════════════
function Step2({
  data,
  errors,
  onChange,
}: {
  data: WizardStep2;
  errors: Record<string, string>;
  onChange: (d: WizardStep2) => void;
}) {
  const set = (patch: Partial<WizardStep2>) => onChange({ ...data, ...patch });

  return (
    <div className="wizard-panel">
      <div>
        <h2 className="wizard-panel__title">Overview</h2>
        <p className="wizard-panel__subtitle">Describe the chapter&apos;s purpose, mission, and vision.</p>
      </div>

      <div className="wizard-field">
        <label className="wizard-field__label" htmlFor="wiz-overview">
          Chapter Overview <span className="wizard-field__required">*</span>
        </label>
        <textarea
          id="wiz-overview"
          className={`wizard-field__textarea${errors.overview ? " wizard-field__textarea--error" : ""}`}
          placeholder="A comprehensive description of this chapter's goals, scope, and activities…"
          value={data.overview}
          onChange={(e) => set({ overview: e.target.value })}
          rows={6}
        />
        {errors.overview && <p className="wizard-field__error"><AlertCircle size={15} style={{display:"inline",marginRight:4}}/>{errors.overview}</p>}
      </div>

      <div className="wizard-field">
        <label className="wizard-field__label" htmlFor="wiz-mission">
          Mission <span style={{fontWeight:400,color:"#64748b",fontSize:"16px"}}>(Optional)</span>
        </label>
        <textarea
          id="wiz-mission"
          className="wizard-field__textarea"
          placeholder="The chapter's mission statement…"
          value={data.mission}
          onChange={(e) => set({ mission: e.target.value })}
          rows={4}
        />
      </div>

      <div className="wizard-field">
        <label className="wizard-field__label" htmlFor="wiz-vision">
          Vision <span style={{fontWeight:400,color:"#64748b",fontSize:"16px"}}>(Optional)</span>
        </label>
        <textarea
          id="wiz-vision"
          className="wizard-field__textarea"
          placeholder="The chapter's vision statement…"
          value={data.vision}
          onChange={(e) => set({ vision: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step 3 — Officers
// ═════════════════════════════════════════════════════════════════════════════
function Step3({
  data,
  errors,
  onChange,
}: {
  data: WizardStep3;
  errors: Record<string, string>;
  onChange: (d: WizardStep3) => void;
}) {
  const [uploadingAvatars, setUploadingAvatars] = useState<Record<number, boolean>>({});

  const addOfficer = () => {
    const entry: WizardOfficerEntry = {
      _key: uniqueKey(),
      name: "",
      category_type: "",
      year_joined: "",
      sort_order: data.officers.length,
    };
    onChange({ officers: [...data.officers, entry] });
  };

  const updateOfficer = (idx: number, patch: Partial<WizardOfficerEntry>) => {
    const updated = data.officers.map((o, i) => (i === idx ? { ...o, ...patch } : o));
    onChange({ officers: updated });
  };

  const removeOfficer = (idx: number) => {
    onChange({ officers: data.officers.filter((_, i) => i !== idx) });
  };

  const handleOfficerAvatarUpload = async (idx: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      setUploadingAvatars((prev) => ({ ...prev, [idx]: true }));
      const result = await chaptersApi.uploadImage(file);
      if (result?.success && result.data?.url) {
        updateOfficer(idx, { image_url: result.data.url });
        gooeyToast.success(`Avatar for "${data.officers[idx].name || "officer"}" uploaded.`);
      }
    } catch (err: any) {
      gooeyToast.error(err.message || "Avatar upload failed.");
    } finally {
      setUploadingAvatars((prev) => ({ ...prev, [idx]: false }));
    }
  };

  return (
    <div className="wizard-panel">
      <div>
        <h2 className="wizard-panel__title">Chapter Officers</h2>
        <p className="wizard-panel__subtitle">Add the officers and their roles in this chapter. You can add more later.</p>
      </div>

      <div className="wizard-repeatable">
        {data.officers.length === 0 && (
          <p style={{fontSize:"18px",color:"#94a3b8",fontStyle:"italic"}}>No officers added yet. Click below to add one.</p>
        )}
        {data.officers.map((officer, idx) => (
          <div key={officer._key} className="wizard-row" style={{alignItems:"center"}}>
            {/* Real avatar upload button */}
            <div style={{flexShrink:0, position:"relative"}}>
              <input
                id={`off-avatar-file-${idx}`}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleOfficerAvatarUpload(idx, e.target.files)}
              />
              <button
                type="button"
                onClick={() => document.getElementById(`off-avatar-file-${idx}`)?.click()}
                disabled={uploadingAvatars[idx]}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  padding: 0,
                  border: officer.image_url ? "2px solid #e2e8f0" : "2px dashed #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  cursor: "pointer",
                  background: "#f8fafc",
                  position: "relative",
                  transition: "all 0.2s ease"
                }}
                className="officer-avatar-upload-btn"
                title="Click to upload profile picture"
              >
                {uploadingAvatars[idx] ? (
                  <Loader2 className="animate-spin" size={16} style={{ color: "#94a3b8" }} />
                ) : officer.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={officer.image_url}
                    alt={officer.name || "Officer avatar"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                ) : (
                  <Upload size={16} style={{ color: "#94a3b8" }} />
                )}
              </button>
            </div>
            <div className="wizard-row__field">
              <label className="wizard-row__label" htmlFor={`off-name-${idx}`}>Name <span style={{color:"#dc2626"}}>*</span></label>
              <input
                id={`off-name-${idx}`}
                type="text"
                className={`wizard-row__input${errors[`officer_name_${idx}`] ? " wizard-row__input--error" : ""}`}
                placeholder="Full name"
                value={officer.name}
                onChange={(e) => updateOfficer(idx, { name: e.target.value })}
              />
              {errors[`officer_name_${idx}`] && <p className="wizard-row__error">{errors[`officer_name_${idx}`]}</p>}
            </div>
            <div className="wizard-row__field">
              <label className="wizard-row__label" htmlFor={`off-cat-${idx}`}>Role / Category <span style={{color:"#dc2626"}}>*</span></label>
              <input
                id={`off-cat-${idx}`}
                type="text"
                className={`wizard-row__input${errors[`officer_cat_${idx}`] ? " wizard-row__input--error" : ""}`}
                placeholder="e.g. President, Treasurer"
                value={officer.category_type}
                onChange={(e) => updateOfficer(idx, { category_type: e.target.value })}
              />
              {errors[`officer_cat_${idx}`] && <p className="wizard-row__error">{errors[`officer_cat_${idx}`]}</p>}
            </div>
            <div className="wizard-row__field" style={{maxWidth:140}}>
              <label className="wizard-row__label" htmlFor={`off-year-${idx}`}>Year Joined <span style={{color:"#dc2626"}}>*</span></label>
              <input
                id={`off-year-${idx}`}
                type="number"
                className={`wizard-row__input${errors[`officer_year_${idx}`] ? " wizard-row__input--error" : ""}`}
                placeholder="2024"
                value={officer.year_joined}
                min={1900}
                max={new Date().getFullYear()}
                onChange={(e) => updateOfficer(idx, { year_joined: e.target.value === "" ? "" : parseInt(e.target.value, 10) })}
              />
              {errors[`officer_year_${idx}`] && <p className="wizard-row__error">{errors[`officer_year_${idx}`]}</p>}
            </div>
            <button
              type="button"
              className="wizard-row__delete"
              aria-label={`Remove officer ${officer.name || idx + 1}`}
              onClick={() => removeOfficer(idx)}
            >
              <Trash2 size={18} strokeWidth={2.2} />
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="wizard-add-btn" onClick={addOfficer}>
        <Plus size={20} strokeWidth={2.5} /> Add Officer
      </button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step 4 — Activities & Announcements
// ═════════════════════════════════════════════════════════════════════════════
function Step4({
  data,
  errors,
  onChange,
}: {
  data: WizardStep4;
  errors: Record<string, string>;
  onChange: (d: WizardStep4) => void;
}) {
  const [uploadingActivity, setUploadingActivity] = useState<string | null>(null);

  const addActivity = () => {
    const entry: WizardActivityEntry = { _key: uniqueKey(), title: "", description: "", date: "", image_url: "" };
    onChange({ ...data, activities: [...data.activities, entry] });
  };

  const updateActivity = (idx: number, patch: Partial<WizardActivityEntry>) => {
    onChange({ ...data, activities: data.activities.map((a, i) => (i === idx ? { ...a, ...patch } : a)) });
  };

  const removeActivity = (idx: number) => onChange({ ...data, activities: data.activities.filter((_, i) => i !== idx) });

  const handleActivityImage = async (idx: number, file: File) => {
    setUploadingActivity(data.activities[idx]._key);
    try {
      const result = await chaptersApi.uploadImage(file);
      if (result?.success && result.data?.url) {
        updateActivity(idx, { image_url: result.data.url });
        gooeyToast.success("Activity image uploaded.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      gooeyToast.error(msg);
    } finally {
      setUploadingActivity(null);
    }
  };

  const addAnnouncement = () => {
    const entry: WizardAnnouncementEntry = { _key: uniqueKey(), title: "", content: "", date: "" };
    onChange({ ...data, announcements: [...data.announcements, entry] });
  };

  const updateAnnouncement = (idx: number, patch: Partial<WizardAnnouncementEntry>) => {
    onChange({ ...data, announcements: data.announcements.map((a, i) => (i === idx ? { ...a, ...patch } : a)) });
  };

  const removeAnnouncement = (idx: number) => onChange({ ...data, announcements: data.announcements.filter((_, i) => i !== idx) });

  return (
    <div className="wizard-panel">
      <div>
        <h2 className="wizard-panel__title">Activities &amp; Announcements</h2>
        <p className="wizard-panel__subtitle">Both sections are optional. Add as many entries as needed.</p>
      </div>

      {/* Activities */}
      <div className="wizard-section">
        <h3 className="wizard-section__title">Chapter Activities</h3>
        <div className="wizard-repeatable">
          {data.activities.length === 0 && (
            <p style={{fontSize:"18px",color:"#94a3b8",fontStyle:"italic"}}>No activities added yet.</p>
          )}
          {data.activities.map((act, idx) => (
            <div key={act._key} className="wizard-row" style={{flexDirection:"column",alignItems:"stretch"}}>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
                <div className="wizard-row__field" style={{flex:2,minWidth:160}}>
                  <label className="wizard-row__label" htmlFor={`act-title-${idx}`}>Title <span style={{color:"#dc2626"}}>*</span></label>
                  <input
                    id={`act-title-${idx}`}
                    type="text"
                    className="wizard-row__input"
                    placeholder="Activity title"
                    value={act.title}
                    onChange={(e) => updateActivity(idx, { title: e.target.value })}
                  />
                </div>
                <div className="wizard-row__field" style={{maxWidth:160}}>
                  <label className="wizard-row__label" htmlFor={`act-date-${idx}`}>Date <span style={{color:"#dc2626"}}>*</span></label>
                  <input
                    id={`act-date-${idx}`}
                    type="date"
                    className="wizard-row__input"
                    value={act.date}
                    onChange={(e) => updateActivity(idx, { date: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="wizard-row__delete"
                  aria-label={`Remove activity ${idx + 1}`}
                  onClick={() => removeActivity(idx)}
                >
                  <Trash2 size={18} strokeWidth={2.2} />
                </button>
              </div>
              <div className="wizard-row__field">
                <label className="wizard-row__label" htmlFor={`act-desc-${idx}`}>Description <span style={{color:"#dc2626"}}>*</span></label>
                <textarea
                  id={`act-desc-${idx}`}
                  className="wizard-row__input"
                  placeholder="Describe this activity…"
                  value={act.description}
                  rows={2}
                  style={{resize:"vertical"}}
                  onChange={(e) => updateActivity(idx, { description: e.target.value })}
                />
              </div>
              <div className="wizard-row__field">
                <label className="wizard-row__label" htmlFor={`act-img-${idx}`}>Activity Image <span style={{fontWeight:400,color:"#64748b",fontSize:"16px"}}>(Optional)</span></label>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  {act.image_url ? (
                    <>
                      <img src={act.image_url} alt="activity" style={{width:64,height:48,objectFit:"cover",borderRadius:6,border:"1.5px solid #e2e8f0"}}/>
                      <button type="button" style={{fontSize:16,color:"#dc2626",background:"none",border:"none",cursor:"pointer"}} onClick={() => updateActivity(idx, { image_url: "" })}>Remove</button>
                    </>
                  ) : (
                    <label style={{cursor:"pointer",fontSize:16,color:"#2563eb",fontWeight:600}}>
                      {uploadingActivity === act._key ? <Loader2 size={16} style={{display:"inline",marginRight:4,animation:"wizard-spin 0.7s linear infinite"}}/> : <Upload size={16} style={{display:"inline",marginRight:4}}/>}
                      Upload Image
                      <input
                        id={`act-img-${idx}`}
                        type="file"
                        accept="image/*"
                        style={{display:"none"}}
                        onChange={(e) => { if (e.target.files?.[0]) handleActivityImage(idx, e.target.files[0]); }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="wizard-add-btn" onClick={addActivity}>
          <Plus size={20} strokeWidth={2.5} /> Add Activity
        </button>
      </div>

      {/* Announcements */}
      <div className="wizard-section">
        <h3 className="wizard-section__title">Chapter Announcements</h3>
        <div className="wizard-repeatable">
          {data.announcements.length === 0 && (
            <p style={{fontSize:"18px",color:"#94a3b8",fontStyle:"italic"}}>No announcements added yet.</p>
          )}
          {data.announcements.map((ann, idx) => (
            <div key={ann._key} className="wizard-row" style={{flexDirection:"column",alignItems:"stretch"}}>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
                <div className="wizard-row__field" style={{flex:2,minWidth:160}}>
                  <label className="wizard-row__label" htmlFor={`ann-title-${idx}`}>Title <span style={{color:"#dc2626"}}>*</span></label>
                  <input
                    id={`ann-title-${idx}`}
                    type="text"
                    className="wizard-row__input"
                    placeholder="Announcement title"
                    value={ann.title}
                    onChange={(e) => updateAnnouncement(idx, { title: e.target.value })}
                  />
                </div>
                <div className="wizard-row__field" style={{maxWidth:160}}>
                  <label className="wizard-row__label" htmlFor={`ann-date-${idx}`}>Date <span style={{color:"#dc2626"}}>*</span></label>
                  <input
                    id={`ann-date-${idx}`}
                    type="date"
                    className="wizard-row__input"
                    value={ann.date}
                    onChange={(e) => updateAnnouncement(idx, { date: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="wizard-row__delete"
                  aria-label={`Remove announcement ${idx + 1}`}
                  onClick={() => removeAnnouncement(idx)}
                >
                  <Trash2 size={18} strokeWidth={2.2} />
                </button>
              </div>
              <div className="wizard-row__field">
                <label className="wizard-row__label" htmlFor={`ann-content-${idx}`}>Content <span style={{color:"#dc2626"}}>*</span></label>
                <textarea
                  id={`ann-content-${idx}`}
                  className="wizard-row__input"
                  placeholder="Announcement content…"
                  value={ann.content}
                  rows={3}
                  style={{resize:"vertical"}}
                  onChange={(e) => updateAnnouncement(idx, { content: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="wizard-add-btn" onClick={addAnnouncement}>
          <Plus size={20} strokeWidth={2.5} /> Add Announcement
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Step 5 — Review & Submission
// ═════════════════════════════════════════════════════════════════════════════
function Step5({
  data,
  onEditStep,
}: {
  data: WizardFormData;
  onEditStep: (step: number) => void;
}) {
  return (
    <div className="wizard-panel">
      <div>
        <h2 className="wizard-panel__title">Review &amp; Submit</h2>
        <p className="wizard-panel__subtitle">Review all details before saving. Click Edit to go back to any section.</p>
      </div>

      <div className="wizard-review">
        {/* Step 1 review */}
        <div className="wizard-review__section">
          <div className="wizard-review__section-header">
            <span className="wizard-review__section-title">Basic Information</span>
            <button type="button" className="wizard-review__edit-btn" onClick={() => onEditStep(1)}>Edit</button>
          </div>
          <div className="wizard-review__body">
            <div className="wizard-review__row">
              <span className="wizard-review__key">Chapter Title</span>
              <span className="wizard-review__value">{data.step1.title || <em>—</em>}</span>
            </div>
            <div className="wizard-review__row">
              <span className="wizard-review__key">Short Description</span>
              <span className="wizard-review__value">{data.step1.short_description || <em>—</em>}</span>
            </div>
            <div className="wizard-review__row">
              <span className="wizard-review__key">Location</span>
              <span className="wizard-review__value">
                {data.step1.island_group && <span className="wizard-review__tag">{data.step1.island_group}</span>}
                {data.step1.region && <span className="wizard-review__tag">{data.step1.region}</span>}
              </span>
            </div>
            <div className="wizard-review__row">
              <span className="wizard-review__key">Images ({data.step1.images.length})</span>
              {data.step1.images.length > 0 && (
                <div className="wizard-review__image-grid">
                  {data.step1.images.map((img, i) => (
                    <img key={i} src={img.previewUrl ?? img.file_url} alt={img.file_name} className="wizard-review__thumb" />
                  ))}
                </div>
              )}
            </div>
            <div className="wizard-review__row">
              <span className="wizard-review__key">Documents ({data.step1.documents.length})</span>
              <span className="wizard-review__value">
                {data.step1.documents.map((d, i) => (
                  <span key={i} className="wizard-review__tag"><FileText size={13} style={{display:"inline",marginRight:4}}/>{d.file_name}</span>
                ))}
              </span>
            </div>
          </div>
        </div>

        {/* Step 2 review */}
        <div className="wizard-review__section">
          <div className="wizard-review__section-header">
            <span className="wizard-review__section-title">Overview</span>
            <button type="button" className="wizard-review__edit-btn" onClick={() => onEditStep(2)}>Edit</button>
          </div>
          <div className="wizard-review__body">
            <div className="wizard-review__row">
              <span className="wizard-review__key">Overview</span>
              <span className="wizard-review__value" style={{whiteSpace:"pre-wrap"}}>{data.step2.overview || <em>—</em>}</span>
            </div>
            {data.step2.mission && (
              <div className="wizard-review__row">
                <span className="wizard-review__key">Mission</span>
                <span className="wizard-review__value" style={{whiteSpace:"pre-wrap"}}>{data.step2.mission}</span>
              </div>
            )}
            {data.step2.vision && (
              <div className="wizard-review__row">
                <span className="wizard-review__key">Vision</span>
                <span className="wizard-review__value" style={{whiteSpace:"pre-wrap"}}>{data.step2.vision}</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 review */}
        <div className="wizard-review__section">
          <div className="wizard-review__section-header">
            <span className="wizard-review__section-title">Officers ({data.step3.officers.length})</span>
            <button type="button" className="wizard-review__edit-btn" onClick={() => onEditStep(3)}>Edit</button>
          </div>
          <div className="wizard-review__body">
            {data.step3.officers.length === 0 ? (
              <span className="wizard-review__value" style={{color:"#94a3b8",fontStyle:"italic"}}>No officers added.</span>
            ) : (
              <div className="wizard-review__officer-list">
                {data.step3.officers.map((o, i) => (
                  <div key={i} className="wizard-review__officer-item" style={{display:"flex",alignItems:"center",gap:12}}>
                    <img
                      src={o.image_url || "/images/officer-placeholder.png"}
                      alt={o.name}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #e2e8f0",
                        flexShrink: 0,
                      }}
                    />
                    <span><strong>{o.name}</strong> — {o.category_type} (Joined {o.year_joined})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 4 review */}
        <div className="wizard-review__section">
          <div className="wizard-review__section-header">
            <span className="wizard-review__section-title">
              Activities ({data.step4.activities.length}) &amp; Announcements ({data.step4.announcements.length})
            </span>
            <button type="button" className="wizard-review__edit-btn" onClick={() => onEditStep(4)}>Edit</button>
          </div>
          <div className="wizard-review__body">
            {data.step4.activities.length > 0 && (
              <div className="wizard-review__row">
                <span className="wizard-review__key">Activities</span>
                <div className="wizard-review__activity-list">
                  {data.step4.activities.map((a, i) => (
                    <div key={i} className="wizard-review__officer-item">
                      <strong>{a.title}</strong> — {a.date}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.step4.announcements.length > 0 && (
              <div className="wizard-review__row">
                <span className="wizard-review__key">Announcements</span>
                <div className="wizard-review__announcement-list">
                  {data.step4.announcements.map((a, i) => (
                    <div key={i} className="wizard-review__officer-item">
                      <strong>{a.title}</strong> — {a.date}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.step4.activities.length === 0 && data.step4.announcements.length === 0 && (
              <span className="wizard-review__value" style={{color:"#94a3b8",fontStyle:"italic"}}>None added.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
