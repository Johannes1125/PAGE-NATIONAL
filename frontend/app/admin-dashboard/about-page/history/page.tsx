"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, Plus, Trash, AlertTriangle } from "lucide-react";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import { api } from "../../../lib/api-client";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import "../about-page.css";
import "../../admin-dashboard.css";

type TimelineEvent = {
  year: string;
  title: string;
  description: string;
  milestone_type: "founding" | "conference" | "partnership" | "initiative" | "program";
  list?: {
    title: string;
    items: string[];
  };
};

type Section = {
  id: string;
  section_key: string;
  title: string;
  content: string;
  status: "draft" | "published" | "archived";
  updated_at: string;
};

export default function HistoryManagement() {
  const router = useRouter();
  const [section, setSection] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("History of PAGE");
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  // ── Confirmation modal states ────────────────────────────────────────────
  const [removeConfirmIndex, setRemoveConfirmIndex] = useState<number | null>(null);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);

  const confirmCancelBtnRef = useRef<HTMLButtonElement>(null);

  const hasUnsavedChanges =
    title !== (section?.title || "") ||
    JSON.stringify(events) !== (section?.content || "[]");

  const isPublishButtonDisabled = (section?.status === "published") && !hasUnsavedChanges;

  // Add event form states
  const [newYear, setNewYear] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<"founding" | "conference" | "partnership" | "initiative" | "program">("initiative");
  
  // Optional list states
  const [newListTitle, setNewListTitle] = useState("");
  const [newListItems, setNewListItems] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/about-page/sections/history");
        if (res.success) {
          const s = res.data as Section;
          setSection(s);
          setTitle(s.title);
          setEvents(JSON.parse(s.content) || []);
        }
      } catch (err) {
        console.error(err);
        gooeyToast.error("Failed to load History data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // ── ESC key closes any open modal ─────────────────────────────────────────
  useEffect(() => {
    const isAnyModalOpen = removeConfirmIndex !== null || publishConfirmOpen;
    if (!isAnyModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRemoveConfirmIndex(null);
        setPublishConfirmOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [removeConfirmIndex, publishConfirmOpen]);

  // Focus the Cancel button when modal opens (focus trap entry point)
  useEffect(() => {
    if ((removeConfirmIndex !== null || publishConfirmOpen) && confirmCancelBtnRef.current) {
      confirmCancelBtnRef.current.focus();
    }
  }, [removeConfirmIndex, publishConfirmOpen]);

  const handleSave = async (status: "draft" | "published") => {
    setIsSaving(true);
    try {
      const res = await api.put("/about-page/sections/history", {
        title,
        content: JSON.stringify(events),
        status,
      });

      if (res.success) {
        setSection(res.data);
        gooeyToast.success("History timeline updated successfully!");
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to save History data.");
    } finally {
      setIsSaving(false);
      setPublishConfirmOpen(false);
    }
  };

  const handleAddEvent = () => {
    if (!newYear || !newTitle || !newDesc) {
      gooeyToast.error("Year, Title, and Description are required.");
      return;
    }

    const event: TimelineEvent = {
      year: newYear,
      title: newTitle,
      description: newDesc,
      milestone_type: newType,
    };

    if (newListTitle && newListItems) {
      event.list = {
        title: newListTitle,
        items: newListItems.split("\n").filter((item) => item.trim() !== ""),
      };
    }

    setEvents([...events, event]);

    // Reset inputs
    setNewYear("");
    setNewTitle("");
    setNewDesc("");
    setNewType("initiative");
    setNewListTitle("");
    setNewListItems("");
    gooeyToast.success("Timeline milestone added. Remember to Save Changes!");
  };

  // Opens confirmation modal instead of deleting immediately
  const handleRequestRemove = (index: number) => {
    setRemoveConfirmIndex(index);
  };

  // Executes after user confirms removal
  const handleConfirmRemove = () => {
    if (removeConfirmIndex === null) return;
    setEvents(events.filter((_, i) => i !== removeConfirmIndex));
    setRemoveConfirmIndex(null);
    gooeyToast.success("Milestone removed.");
  };

  if (isLoading) {
    return (
      <AdminSidebarLayout
        pageClassName="admin-dashboard"
        mainClassName="admin-main"
        title="PAGE History"
        subtitle="Loading History timeline..."
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout
      pageClassName="admin-dashboard"
      mainClassName="admin-main"
      title="PAGE HISTORY MANAGEMENT"
      subtitle="Edit the foundation milestones, regional expansion timeline, and digital transforms of PAGE."
      eyebrow="Section Editor"
    >
      <div className="admin-shell">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <button
            type="button"
            className="about-btn about-btn--secondary"
            onClick={() => router.push("/admin-dashboard/about-page")}
          >
            <ArrowLeft size={16} /> Back to dashboard
          </button>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="about-btn about-btn--primary"
              disabled={isSaving || isPublishButtonDisabled}
              onClick={() => setPublishConfirmOpen(true)}
              style={{
                opacity: (isSaving || isPublishButtonDisabled) ? 0.5 : 1,
                cursor: (isSaving || isPublishButtonDisabled) ? "not-allowed" : "pointer",
              }}
            >
              <Globe size={16} /> Publish Changes
            </button>
          </div>
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "start" }}>
          {/* Main events list */}
          <div className="about-editor-card">
            <h3 style={{ fontSize: "16px", color: "var(--p-navy)", marginBottom: "16px", fontWeight: 600 }}>
              Timeline Milestones
            </h3>

            <div className="about-form-group">
              <label className="about-form-label">Title Header</label>
              <input
                type="text"
                className="about-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <hr style={{ border: 0, borderTop: "1px solid var(--r-border)", margin: "20px 0" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {events.map((event, i) => (
                <div
                  key={i}
                  className="history-timeline-card"
                >
                  {/* ── Card content area ─────────────────────────────── */}
                  <div className="history-timeline-card__body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span
                        style={{
                          background: "var(--p-navy)",
                          color: "#fff",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontWeight: 600,
                          fontSize: "12px",
                        }}
                      >
                        {event.year}
                      </span>
                      <span
                        className="about-status-badge"
                        style={{ fontSize: "10px", background: "rgba(30, 83, 142, 0.08)", color: "var(--p-blue)" }}
                      >
                        {event.milestone_type}
                      </span>
                    </div>

                    <h4 style={{ fontWeight: 600, color: "var(--p-navy)", marginBottom: "6px" }}>{event.title}</h4>
                    <p style={{ fontSize: "13px", color: "var(--r-text-mid)", lineHeight: 1.5 }}>
                      {event.description}
                    </p>

                    {event.list && (
                      <div style={{ marginTop: "10px", paddingLeft: "12px", borderLeft: "2px solid var(--r-border-mid)" }}>
                        <span style={{ fontWeight: 600, fontSize: "12px", color: "var(--p-navy)" }}>
                          {event.list.title}
                        </span>
                        <ul style={{ fontSize: "12px", paddingLeft: "16px", marginTop: "4px", color: "var(--r-text-muted)" }}>
                          {event.list.items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* ── Footer action row — Remove button anchored here ── */}
                  <div className="history-timeline-card__footer">
                    <button
                      type="button"
                      className="about-btn about-btn--danger history-timeline-card__remove-btn"
                      onClick={() => handleRequestRemove(i)}
                    >
                      <Trash size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Milestone Form */}
          <div className="about-editor-card">
            <h3 style={{ fontSize: "15px", color: "var(--p-navy)", marginBottom: "16px", fontWeight: 600 }}>
              Add Milestone Event
            </h3>

            <div className="about-form-group">
              <label className="about-form-label">Year Tag</label>
              <input
                type="text"
                placeholder="e.g. 1962 or 1960s"
                className="about-input"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
              />
            </div>

            <div className="about-form-group">
              <label className="about-form-label">Milestone Title</label>
              <input
                type="text"
                placeholder="e.g. Founding of PAGE"
                className="about-input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="about-form-group">
              <label className="about-form-label">Milestone Category</label>
              <select
                className="about-input"
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
              >
                <option value="founding">founding</option>
                <option value="initiative">initiative</option>
                <option value="program">program</option>
                <option value="partnership">partnership</option>
                <option value="conference">conference</option>
              </select>
            </div>

            <div className="about-form-group">
              <label className="about-form-label">Description Narrative</label>
              <textarea
                rows={4}
                className="about-textarea"
                placeholder="Details about the timeline milestone event..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>

            <fieldset
              style={{
                border: "1px dashed var(--r-border)",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "16px",
              }}
            >
              <legend style={{ fontSize: "11px", fontWeight: 600, color: "var(--p-navy)", padding: "0 6px" }}>
                Optional Checklist (Nested List)
              </legend>
              <div className="about-form-group">
                <input
                  type="text"
                  placeholder="Checklist Header (e.g. Founding Members)"
                  className="about-input"
                  style={{ height: "36px" }}
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                />
              </div>
              <div className="about-form-group">
                <textarea
                  rows={3}
                  className="about-textarea"
                  placeholder="Items list (one item per line)..."
                  value={newListItems}
                  onChange={(e) => setNewListItems(e.target.value)}
                />
              </div>
            </fieldset>

            <button
              type="button"
              className="about-btn about-btn--primary"
              style={{ width: "100%" }}
              onClick={handleAddEvent}
            >
              <Plus size={14} /> Add Timeline Event
            </button>
          </div>
        </section>
      </div>

      {/* ── CONFIRMATION MODAL: Remove History Entry ──────────────────────── */}
      {removeConfirmIndex !== null && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setRemoveConfirmIndex(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 55,
            }}
            aria-hidden="true"
          />
          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-modal-title"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 440,
              background: "var(--r-surface)",
              border: "1.5px solid var(--r-border-mid)",
              borderRadius: 20,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              zIndex: 60,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "confirmModalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <style>{`
              @keyframes confirmModalIn {
                from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
                to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              }
            `}</style>

            {/* Header */}
            <div style={{ padding: "28px 28px 16px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "var(--p-rose-pale)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--p-rose)", marginBottom: 16,
                }}
              >
                <AlertTriangle size={26} />
              </div>
              <h3
                id="remove-modal-title"
                style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: "0 0 8px", fontFamily: "var(--font-body)" }}
              >
                Remove Timeline Entry
              </h3>
              <p style={{ fontSize: "14px", color: "var(--r-text-muted)", margin: 0, lineHeight: 1.6, fontFamily: "var(--font-body)" }}>
                You are about to remove{" "}
                <strong style={{ color: "var(--r-text)" }}>
                  {events[removeConfirmIndex]?.year} — {events[removeConfirmIndex]?.title}
                </strong>{" "}
                from the timeline.
              </p>
            </div>

            {/* Warning */}
            <div style={{ padding: "0 28px" }}>
              <div
                style={{
                  background: "var(--p-rose-pale)",
                  border: "1px solid rgba(244, 63, 94, 0.2)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex", alignItems: "flex-start", gap: 10,
                }}
              >
                <AlertTriangle size={15} color="var(--p-rose)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: "13px", color: "var(--p-rose)", margin: 0, lineHeight: 1.5, fontFamily: "var(--font-body)", fontWeight: 500 }}>
                  This will remove the entry from the local list. Click <strong>Save Changes</strong> or <strong>Publish</strong> to make it permanent.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                padding: "20px 28px 28px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <button
                ref={confirmCancelBtnRef}
                type="button"
                onClick={() => setRemoveConfirmIndex(null)}
                style={{
                  height: 52,
                  borderRadius: 12,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--r-text-mid)",
                  background: "var(--r-surface-2)",
                  border: "1px solid var(--r-border-mid)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-body)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                style={{
                  height: 52,
                  borderRadius: 12,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  background: "var(--p-rose)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "var(--font-body)",
                }}
              >
                <Trash size={15} /> Remove Entry
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── CONFIRMATION MODAL: Publish Changes ───────────────────────────── */}
      {publishConfirmOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => !isSaving && setPublishConfirmOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 55,
            }}
            aria-hidden="true"
          />
          {/* Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-modal-title"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 440,
              background: "var(--r-surface)",
              border: "1.5px solid var(--r-border-mid)",
              borderRadius: 20,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              zIndex: 60,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "confirmModalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Header */}
            <div style={{ padding: "28px 28px 16px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "var(--p-blue-pale)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--p-blue)", marginBottom: 16,
                }}
              >
                <Globe size={26} />
              </div>
              <h3
                id="publish-modal-title"
                style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: "0 0 8px", fontFamily: "var(--font-body)" }}
              >
                Publish Changes
              </h3>
              <p style={{ fontSize: "14px", color: "var(--r-text-muted)", margin: 0, lineHeight: 1.6, fontFamily: "var(--font-body)" }}>
                You are about to publish the <strong style={{ color: "var(--r-text)" }}>PAGE History</strong> timeline. All changes will be visible to the public.
              </p>
            </div>

            {/* Warning */}
            <div style={{ padding: "0 28px" }}>
              <div
                style={{
                  background: "var(--p-blue-pale)",
                  border: "1px solid rgba(30, 83, 142, 0.15)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex", alignItems: "flex-start", gap: 10,
                }}
              >
                <Globe size={15} color="var(--p-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: "13px", color: "var(--p-blue)", margin: 0, lineHeight: 1.5, fontFamily: "var(--font-body)", fontWeight: 500 }}>
                  Any unsaved form changes will be saved and published in one step. This will make the timeline publicly visible.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                padding: "20px 28px 28px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setPublishConfirmOpen(false)}
                style={{
                  height: 52,
                  borderRadius: 12,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--r-text-mid)",
                  background: "var(--r-surface-2)",
                  border: "1px solid var(--r-border-mid)",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-body)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave("published")}
                style={{
                  height: 52,
                  borderRadius: 12,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  background: isSaving ? "#4a7098" : "var(--p-blue)",
                  border: "none",
                  cursor: isSaving ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "var(--font-body)",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Globe size={15} />}
                {isSaving ? "Publishing..." : "Confirm Publish"}
              </button>
            </div>
          </div>
        </>
      )}
    </AdminSidebarLayout>
  );
}

// Simple loader helper
function Loader2(props: { className?: string; size?: number; color?: string }) {
  return (
    <svg
      className={props.className}
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color || "currentColor"}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
