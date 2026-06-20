"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe, Plus, Trash, Edit, Check } from "lucide-react";
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

    // Insert sorted or append
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

  const handleDeleteEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
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
              className="about-btn about-btn--secondary"
              disabled={isSaving}
              onClick={() => handleSave("draft")}
            >
              <Save size={16} /> Save as Draft
            </button>
            <button
              type="button"
              className="about-btn about-btn--primary"
              disabled={isSaving}
              onClick={() => handleSave("published")}
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
                  style={{
                    background: "var(--r-surface-2)",
                    border: "1px solid var(--r-border)",
                    borderRadius: "12px",
                    padding: "16px",
                    position: "relative",
                  }}
                >
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

                  <button
                    type="button"
                    className="about-btn about-btn--danger"
                    style={{ position: "absolute", bottom: "16px", right: "16px", height: "30px", padding: "0 10px" }}
                    onClick={() => handleDeleteEvent(i)}
                  >
                    <Trash size={12} /> Remove
                  </button>
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
