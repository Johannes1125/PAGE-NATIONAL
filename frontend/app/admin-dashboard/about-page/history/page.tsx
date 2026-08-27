"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import { api, PaginatedResponse, PaginationMeta } from "../../../lib/api-client";
import Pagination from "../components/Pagination";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import "../about-page.css";
import "../../admin-dashboard.css";

// ── Types ──────────────────────────────────────────────────────────────────

type ProgramType = "Initiative" | "Conference" | "Seminar" | "Convention" | "Other";

interface HistoricalRecord {
  id: string;
  title: string;
  yearStart: number;
  programType: ProgramType;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  title: string;
  yearStart: string;
  programType: ProgramType;
  description: string;
}

interface FormErrors {
  title?: string;
  yearStart?: string;
  programType?: string;
  description?: string;
}

const PROGRAM_TYPES: ProgramType[] = ["Initiative", "Conference", "Seminar", "Convention", "Other"];
const CURRENT_YEAR = new Date().getFullYear();

const EMPTY_FORM: FormState = {
  title: "",
  yearStart: "",
  programType: "Initiative",
  description: "",
};

// ── Validation ─────────────────────────────────────────────────────────────

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = "Title is required.";
  else if (form.title.length > 255) errors.title = "Title must not exceed 255 characters.";

  const year = parseInt(form.yearStart, 10);
  if (!form.yearStart.trim()) errors.yearStart = "Year is required.";
  else if (isNaN(year) || !Number.isInteger(year)) errors.yearStart = "Year must be a valid number.";
  else if (year < 1900) errors.yearStart = "Year must be 1900 or later.";
  else if (year > CURRENT_YEAR) errors.yearStart = `Year must not exceed the current year (${CURRENT_YEAR}).`;

  if (!PROGRAM_TYPES.includes(form.programType)) errors.programType = "Select a valid program type.";
  if (!form.description.trim()) errors.description = "Description is required.";
  else if (form.description.length < 10) errors.description = "Description must be at least 10 characters.";

  return errors;
}

// ── Icons ──────────────────────────────────────────────────────────────────

function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
function IconArchive() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
function Loader({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 1s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ── Program Type Badge ──────────────────────────────────────────────────────

const BADGE_COLORS: Record<ProgramType, { bg: string; color: string }> = {
  Initiative:  { bg: "rgba(30,83,142,0.1)",  color: "var(--p-blue)"    },
  Conference:  { bg: "rgba(5,150,105,0.1)",   color: "var(--p-emerald)" },
  Seminar:     { bg: "rgba(245,158,11,0.12)", color: "var(--p-amber)"   },
  Convention:  { bg: "rgba(139,92,246,0.1)",  color: "#7c3aed"          },
  Other:       { bg: "rgba(107,114,128,0.1)", color: "#6b7280"          },
};

function ProgramBadge({ type }: { type: string }) {
  const colors = BADGE_COLORS[type as ProgramType] ?? BADGE_COLORS.Other;
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 12px",
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 700,
      background: colors.bg,
      color: colors.color,
      letterSpacing: "0.3px",
      whiteSpace: "nowrap",
    }}>
      {type}
    </span>
  );
}

// ── Create / Edit Modal ─────────────────────────────────────────────────────

interface ModalProps {
  mode: "create" | "edit";
  initialData?: HistoricalRecord;
  onClose: () => void;
  onSaved: (record: HistoricalRecord) => void;
}

function RecordModal({ mode, initialData, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState<FormState>(
    initialData
      ? {
          title: initialData.title,
          yearStart: String(initialData.yearStart),
          programType: initialData.programType,
          description: initialData.description,
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        yearStart: parseInt(form.yearStart, 10),
        programType: form.programType,
        description: form.description.trim(),
      };

      let res: any;
      if (mode === "create") {
        res = await api.post("/historical-records", payload);
      } else {
        res = await api.patch(`/historical-records/${initialData!.id}`, payload);
      }

      if (res.success) {
        gooeyToast.success(mode === "create" ? "Historical record created!" : "Historical record updated!");
        onSaved(res.data);
      }
    } catch (err: any) {
      const msg = err?.message || "An error occurred. Please try again.";
      gooeyToast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = (hasError: boolean): React.CSSProperties => ({
    height: 44,
    background: "var(--r-surface-2)",
    border: `1px solid ${hasError ? "var(--p-rose)" : "var(--r-border)"}`,
    borderRadius: 8,
    padding: "0 14px",
    color: "var(--r-text)",
    fontFamily: "var(--font-body)",
    fontSize: 14,
    width: "100%",
    outline: "none",
    boxSizing: "border-box" as const,
  });

  const errorStyle: React.CSSProperties = {
    fontSize: 13,
    color: "var(--p-rose)",
    marginTop: 4,
    fontWeight: 500,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", zIndex: 55 }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-modal-title"
        className="history-modal"
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "90%", maxWidth: 560,
          background: "var(--r-surface)",
          border: "1.5px solid var(--r-border-mid)",
          borderRadius: 20,
          boxShadow: "0 25px 60px -12px rgba(0,0,0,0.3)",
          zIndex: 60,
          overflow: "hidden",
          animation: "confirmModalIn 0.2s cubic-bezier(0.16,1,0.3,1)",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
      >
        <style>{`
          @keyframes confirmModalIn {
            from { opacity:0; transform:translate(-50%,-48%) scale(0.96); }
            to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
          }
        `}</style>

        {/* Header */}
        <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid var(--r-border)" }}>
          <h2 id="record-modal-title" style={{ fontSize: 18, fontWeight: 700, color: "var(--p-navy)", margin: 0, fontFamily: "var(--font-body)" }}>
            {mode === "create" ? "Add Historical Record" : "Edit Historical Record"}
          </h2>
          <p style={{ fontSize: 13, color: "var(--r-text-muted)", margin: "3px 0 0", fontFamily: "var(--font-body)" }}>
            {mode === "create" ? "Create a new organizational milestone." : "Update the selected milestone record."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ padding: "16px 24px" }}>

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--p-navy)", marginBottom: 6, fontFamily: "var(--font-body)" }}>
                Title <span style={{ color: "var(--p-rose)" }}>*</span>
              </label>
              <input
                ref={firstInputRef}
                id="modal-title"
                type="text"
                placeholder="e.g. National Convention Established"
                value={form.title}
                onChange={e => handleChange("title", e.target.value)}
                style={fieldStyle(!!errors.title)}
                maxLength={255}
              />
              {errors.title && <p style={errorStyle}>{errors.title}</p>}
            </div>

            {/* Year Start */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--p-navy)", marginBottom: 6, fontFamily: "var(--font-body)" }}>
                Year Start <span style={{ color: "var(--p-rose)" }}>*</span>
              </label>
              <select
                id="modal-year"
                value={form.yearStart}
                onChange={e => handleChange("yearStart", e.target.value)}
                style={{ ...fieldStyle(!!errors.yearStart), cursor: "pointer" }}
              >
                <option value="" disabled>Select Year</option>
                {Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => CURRENT_YEAR - i).map(y => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
              {errors.yearStart && <p style={errorStyle}>{errors.yearStart}</p>}
            </div>

            {/* Program Type */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--p-navy)", marginBottom: 6, fontFamily: "var(--font-body)" }}>
                Program Type <span style={{ color: "var(--p-rose)" }}>*</span>
              </label>
              <select
                id="modal-program-type"
                value={form.programType}
                onChange={e => handleChange("programType", e.target.value)}
                style={{ ...fieldStyle(!!errors.programType), cursor: "pointer" }}
              >
                {PROGRAM_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.programType && <p style={errorStyle}>{errors.programType}</p>}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--p-navy)", marginBottom: 6, fontFamily: "var(--font-body)" }}>
                Description <span style={{ color: "var(--p-rose)" }}>*</span>
              </label>
              <textarea
                id="modal-description"
                rows={5}
                placeholder="Provide a detailed description of this historical milestone (at least 10 characters)..."
                value={form.description}
                onChange={e => handleChange("description", e.target.value)}
                style={{
                  background: "var(--r-surface-2)",
                  border: `1px solid ${errors.description ? "var(--p-rose)" : "var(--r-border)"}`,
                  borderRadius: 8,
                  padding: "12px",
                  color: "var(--r-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  width: "100%",
                  resize: "vertical",
                  minHeight: 100,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {errors.description && <p style={errorStyle}>{errors.description}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="history-modal-actions" style={{ padding: "14px 24px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, borderTop: "1px solid var(--r-border)" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                height: 42, borderRadius: 10, fontSize: 14, fontWeight: 600,
                color: "var(--r-text-mid)", background: "var(--r-surface-2)",
                border: "1px solid var(--r-border-mid)", cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="modal-submit-btn"
              disabled={saving}
              style={{
                height: 42, borderRadius: 10, fontSize: 14, fontWeight: 600,
                color: "#fff",
                background: saving ? "#4a7098" : "var(--p-blue)",
                border: "none", cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: saving ? 0.8 : 1,
              }}
            >
              {saving ? <Loader size={16} /> : null}
              {saving ? "Saving..." : mode === "create" ? "Create Record" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Archive Confirm Modal ───────────────────────────────────────────────────

interface DeleteModalProps {
  record: HistoricalRecord;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

function DeleteModal({ record, onClose, onDeleted }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.patch(`/historical-records/${record.id}/archive`, {});
      gooeyToast.success("Historical record archived successfully.");
      onDeleted(record.id);
    } catch (err: any) {
      gooeyToast.error(err?.message || "Failed to archive record.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)", zIndex: 55 }}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="history-modal"
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "90%", maxWidth: 440,
          background: "var(--r-surface)",
          border: "1.5px solid var(--r-border-mid)",
          borderRadius: 20,
          boxShadow: "0 25px 60px -12px rgba(0,0,0,0.3)",
          zIndex: 60,
          overflow: "hidden",
          animation: "confirmModalIn 0.2s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "28px 28px 16px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(245, 158, 11, 0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#d97706", marginBottom: 16,
          }}>
            <IconArchive />
          </div>
          <h3 id="delete-modal-title" style={{ fontSize: 20, fontWeight: 700, color: "var(--p-navy)", margin: "0 0 8px", fontFamily: "var(--font-body)" }}>
            Archive Historical Record?
          </h3>
          <p style={{ fontSize: 15, color: "var(--r-text-muted)", margin: 0, lineHeight: 1.6, fontFamily: "var(--font-body)" }}>
            You are about to archive{" "}
            <strong style={{ color: "var(--r-text)" }}>"{record.title}"</strong>
            {" "}({record.yearStart}). This will move it to the System Archives and remove it from public pages. You can restore it anytime.
          </p>
        </div>

        {/* Actions */}
        <div className="history-modal-actions" style={{ padding: "16px 24px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={deleting}
            style={{
              height: 42, borderRadius: 10, fontSize: 14, fontWeight: 600,
              color: "var(--r-text-mid)", background: "var(--r-surface-2)",
              border: "1px solid var(--r-border-mid)", cursor: deleting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-body)",
            }}
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              height: 42, borderRadius: 10, fontSize: 14, fontWeight: 600,
              color: "#fff", background: deleting ? "#92400e" : "#d97706",
              border: "none", cursor: deleting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "var(--font-body)", opacity: deleting ? 0.8 : 1,
            }}
          >
            {deleting ? <Loader size={16} /> : <IconArchive />}
            {deleting ? "Archiving..." : "Archive Record"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function HistoryManagement() {
  const router = useRouter();
  const [records, setRecords] = useState<HistoricalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingRecord, setEditingRecord] = useState<HistoricalRecord | undefined>(undefined);
  const [deletingRecord, setDeletingRecord] = useState<HistoricalRecord | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  const [programTypeFilter, setProgramTypeFilter] = useState("all");

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchRecords = useCallback(async (page = currentPage, limit = itemsPerPage, programType = programTypeFilter) => {
    try {
      setIsLoading(true);
      const programTypeQuery = programType !== "all" ? `&programType=${encodeURIComponent(programType)}` : "";
      const res = await api.get<PaginatedResponse<HistoricalRecord>>(`/historical-records?page=${page}&limit=${limit}${programTypeQuery}`);
      if (res.success) {
        setRecords(res.data ?? []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      gooeyToast.error("Failed to load historical records.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, programTypeFilter]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchRecords(newPage, itemsPerPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    fetchRecords(1, newLimit);
  };

  const handleProgramTypeChange = (programType: string) => {
    setProgramTypeFilter(programType);
    setCurrentPage(1);
    fetchRecords(1, itemsPerPage, programType);
  };

  useEffect(() => { fetchRecords(currentPage, itemsPerPage); }, [fetchRecords]);

  // ── Filtered records ─────────────────────────────────────────────────────
  const filtered = records.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSaved = (record: HistoricalRecord) => {
    fetchRecords(currentPage, itemsPerPage);
    setModalMode(null);
    setEditingRecord(undefined);
  };

  const handleDeleted = (id: string) => {
    fetchRecords(currentPage, itemsPerPage);
    setDeletingRecord(null);
  };

  const openEdit = (record: HistoricalRecord) => {
    setEditingRecord(record);
    setModalMode("edit");
  };

  const openCreate = () => {
    setEditingRecord(undefined);
    setModalMode("create");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingRecord(undefined);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminSidebarLayout
      pageClassName="admin-dashboard"
      mainClassName="admin-main"
      title="History"
      subtitle="Milestones and foundation timeline content management"
      eyebrow="Content Manager"
      seniorFriendlyHeader={true}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div className="admin-shell">
        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div className="history-header-actions">
          <button
            id="back-to-dashboard-btn"
            type="button"
            className="about-btn about-btn--secondary"
            onClick={() => router.push("/admin-dashboard/about-page")}
          >
            <IconBack /> Back
          </button>

          <button
            id="create-record-btn"
            type="button"
            className="about-btn about-btn--primary"
            onClick={openCreate}
          >
            <IconPlus /> Add Historical Record
          </button>
        </div>

        {/* ── Search Bar ───────────────────────────────────────────────────── */}
        <div className="about-toolbar" style={{ marginBottom: 24 }}>
          <div className="about-search-wrapper">
            <span className="about-search-icon"><IconSearch /></span>
            <input
              id="search-records-input"
              type="text"
              placeholder="Search by title..."
              className="about-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <select
              aria-label="Filter history by program type"
              className="about-input"
              value={programTypeFilter}
              onChange={e => handleProgramTypeChange(e.target.value)}
              style={{ width: "auto", minWidth: 160, height: 40 }}
            >
              <option value="all">All Program Types</option>
              <option value="Initiative">Initiative</option>
              <option value="Conference">Conference</option>
              <option value="Seminar">Seminar</option>
              <option value="Convention">Convention</option>
              <option value="Other">Other</option>
            </select>
            <div style={{ fontSize: 15, color: "var(--r-text-muted)", whiteSpace: "nowrap", fontWeight: 500 }}>
              {meta.totalItems} record{meta.totalItems !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* ── Records ──────────────────────────────────────────────────────── */}
        <div className="about-editor-card" style={{ padding: 0, overflow: "hidden" }}>
          {isLoading ? (
            /* Loading skeleton */
            <div style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "var(--r-text-muted)" }}>
              <Loader size={32} />
              <p style={{ fontSize: 18, margin: 0, fontFamily: "var(--font-body)" }}>Loading historical records...</p>
            </div>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <div style={{ padding: "60px 32px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏛️</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--p-navy)", marginBottom: 8, fontFamily: "var(--font-body)" }}>
                {searchQuery ? "No records found" : "No historical records yet"}
              </h3>
              <p style={{ fontSize: 18, color: "var(--r-text-muted)", marginBottom: 24, fontFamily: "var(--font-body)" }}>
                {searchQuery
                  ? `No records match "${searchQuery}". Try a different search.`
                  : "Add the first historical milestone to get started."}
              </p>
              {!searchQuery && (
                <button type="button" className="about-btn about-btn--primary" onClick={openCreate} id="empty-state-create-btn">
                  <IconPlus /> Add First Record
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table (tablet / desktop) */}
              <div className="history-table-view" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                  <thead>
                    <tr style={{ background: "var(--r-surface-2)", borderBottom: "2px solid var(--r-border)" }}>
                      {["Year", "Title", "Program Type", "Description", "Actions"].map(h => (
                        <th key={h} style={{
                          padding: "12px 14px", textAlign: "left",
                          fontSize: 12, fontWeight: 700, color: "var(--p-navy)",
                          textTransform: "uppercase", letterSpacing: "0.5px",
                          whiteSpace: "nowrap",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((record, i) => (
                      <tr
                        key={record.id}
                        style={{
                          borderBottom: i < filtered.length - 1 ? "1px solid var(--r-border)" : "none",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "var(--r-surface-2)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* Year */}
                        <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                          <span style={{
                            display: "inline-block",
                            background: "var(--p-navy)",
                            color: "#fff",
                            padding: "3px 10px",
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 13,
                            whiteSpace: "nowrap",
                          }}>
                            {record.yearStart}
                          </span>
                        </td>
                        {/* Title */}
                        <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--p-navy)", fontFamily: "var(--font-body)" }}>
                            {record.title}
                          </span>
                        </td>
                        {/* Program Type */}
                        <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                          <ProgramBadge type={record.programType} />
                        </td>
                        {/* Description (truncated) */}
                        <td style={{ padding: "12px 14px", verticalAlign: "top", maxWidth: 300 }}>
                          <span style={{
                            fontSize: 13,
                            color: "var(--r-text-muted)",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical" as const,
                            overflow: "hidden",
                            lineHeight: 1.5,
                          }}>
                            {record.description}
                          </span>
                        </td>
                        {/* Actions */}
                        <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "nowrap" }}>
                            <button
                              id={`edit-record-${record.id}`}
                              type="button"
                              onClick={() => openEdit(record)}
                              title="Edit record"
                              style={{
                                height: 40, padding: "0 14px",
                                borderRadius: 8, fontSize: 14, fontWeight: 600,
                                display: "flex", alignItems: "center", gap: 6,
                                background: "var(--p-blue-pale)", color: "var(--p-blue)",
                                border: "none", cursor: "pointer", whiteSpace: "nowrap",
                              }}
                            >
                              <IconEdit /> Edit
                            </button>
                            <button
                              id={`delete-record-${record.id}`}
                              type="button"
                              onClick={() => setDeletingRecord(record)}
                              title="Archive record"
                              style={{
                                height: 40, padding: "0 14px",
                                borderRadius: 8, fontSize: 14, fontWeight: 600,
                                display: "flex", alignItems: "center", gap: 6,
                                background: "rgba(245, 158, 11, 0.12)", color: "#92400e",
                                border: "none", cursor: "pointer", whiteSpace: "nowrap",
                              }}
                            >
                              <IconArchive /> Archive
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card list (mobile) */}
              <div className="history-card-view">
                {filtered.map((record) => (
                  <div key={record.id} className="history-record-card">
                    <div className="history-record-card__top">
                      <span style={{
                        display: "inline-block",
                        background: "var(--p-navy)",
                        color: "#fff",
                        padding: "3px 10px",
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      }}>
                        {record.yearStart}
                      </span>
                      <ProgramBadge type={record.programType} />
                    </div>

                    <p className="history-record-card__title">{record.title}</p>
                    <p className="history-record-card__desc">{record.description}</p>

                    <div className="history-record-card__footer">
                      <button
                        id={`edit-record-mobile-${record.id}`}
                        type="button"
                        className="history-record-card__action-btn"
                        onClick={() => openEdit(record)}
                        style={{ background: "var(--p-blue-pale)", color: "var(--p-blue)" }}
                      >
                        <IconEdit /> Edit
                      </button>
                      <button
                        id={`delete-record-mobile-${record.id}`}
                        type="button"
                        className="history-record-card__action-btn"
                        onClick={() => setDeletingRecord(record)}
                        style={{ background: "rgba(245, 158, 11, 0.12)", color: "#92400e" }}
                      >
                        <IconArchive /> Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={meta.totalPages}
            totalItems={meta.totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      {modalMode && (
        <RecordModal
          mode={modalMode}
          initialData={editingRecord}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────────── */}
      {deletingRecord && (
        <DeleteModal
          record={deletingRecord}
          onClose={() => setDeletingRecord(null)}
          onDeleted={handleDeleted}
        />
      )}
    </AdminSidebarLayout>
  );
}