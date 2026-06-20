"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash,
  Edit,
  ArrowUp,
  ArrowDown,
  Upload,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import { api } from "../../../lib/api-client";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import "../about-page.css";
import "../../admin-dashboard.css";

type Officer = {
  id: string;
  name: string;
  position: string;
  chapter?: string;
  photo_url?: string;
  term_start?: string;
  term_end?: string;
  status: "active" | "inactive";
  sort_order: number;
};

export default function NationalOfficersManagement() {
  const router = useRouter();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  // Form states (Add / Edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [chapter, setChapter] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [termStart, setTermStart] = useState("");
  const [termEnd, setTermEnd] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/about-page/officers");
      if (res.success) {
        setOfficers(res.data);
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to load officers.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !position) {
      gooeyToast.error("Name and Position are required.");
      return;
    }

    setIsSaving(true);
    const payload = {
      name,
      position,
      chapter: chapter || undefined,
      photo_url: photoUrl || undefined,
      term_start: termStart || undefined,
      term_end: termEnd || undefined,
      status,
    };

    try {
      if (editingId) {
        // Edit Mode
        const res = await api.put(`/about-page/officers/${editingId}`, payload);
        if (res.success) {
          setOfficers((prev) =>
            prev.map((off) => (off.id === editingId ? res.data : off))
          );
          gooeyToast.success("Officer updated successfully!");
          resetForm();
        }
      } else {
        // Add Mode
        const res = await api.post("/about-page/officers", payload);
        if (res.success) {
          setOfficers((prev) => [...prev, res.data]);
          gooeyToast.success("Officer added successfully!");
          resetForm();
        }
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to save officer data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (officer: Officer) => {
    setEditingId(officer.id);
    setName(officer.name);
    setPosition(officer.position);
    setChapter(officer.chapter || "");
    setPhotoUrl(officer.photo_url || "");
    setTermStart(officer.term_start || "");
    setTermEnd(officer.term_end || "");
    setStatus(officer.status);
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this officer?")) return;

    try {
      const res = await api.delete(`/about-page/officers/${id}`);
      if (res.success) {
        setOfficers((prev) => prev.filter((off) => off.id !== id));
        gooeyToast.success("Officer removed successfully.");
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to delete officer.");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsPhotoUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      // Upload using logo_description route (generic image container)
      const res = await api.postMultipart("/about-page/documents/logo_description", formData);
      if (res.success) {
        setPhotoUrl(res.data.file_url);
        gooeyToast.success("Officer photo uploaded successfully!");
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Photo upload failed.");
    } finally {
      setIsPhotoUploading(false);
    }
  };

  const moveOfficer = async (index: number, direction: "up" | "down") => {
    const newOfficers = [...officers];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOfficers.length) return;

    // Swap
    const temp = newOfficers[index];
    newOfficers[index] = newOfficers[targetIndex];
    newOfficers[targetIndex] = temp;

    setOfficers(newOfficers);

    try {
      // Sync reorder to backend
      const ids = newOfficers.map((off) => off.id);
      await api.post("/about-page/officers/reorder", { ids });
      gooeyToast.success("List order updated.");
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to save new list order.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPosition("");
    setChapter("");
    setPhotoUrl("");
    setTermStart("");
    setTermEnd("");
    setStatus("active");
  };

  if (isLoading) {
    return (
      <AdminSidebarLayout
        pageClassName="admin-dashboard"
        mainClassName="admin-main"
        title="National Officers"
        subtitle="Loading Officers roster..."
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
      title="PAGE OFFICERS MANAGEMENT"
      subtitle="Manage, reorder, and update profiles of National Officers and Board Directors."
      eyebrow="Roster Registry"
    >
      <div className="admin-shell">
        <div style={{ marginBottom: "20px" }}>
          <button
            type="button"
            className="about-btn about-btn--secondary"
            onClick={() => router.push("/admin-dashboard/about-page")}
          >
            <ArrowLeft size={16} /> Back to dashboard
          </button>
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "24px", alignItems: "start" }}>
          {/* Officers Table List */}
          <div className="about-editor-card">
            <h3 style={{ fontSize: "16px", color: "var(--p-navy)", marginBottom: "16px", fontWeight: 600 }}>
              Officers & Directors Directory
            </h3>

            <table className="about-doc-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name / Role</th>
                  <th>Chapter</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((off, index) => (
                  <tr key={off.id}>
                    <td style={{ width: "60px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "#e5e7eb",
                          display: "grid",
                          placeItems: "center",
                          overflow: "hidden",
                        }}
                      >
                        {off.photo_url ? (
                          <img
                            src={off.photo_url}
                            alt={off.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <User size={18} color="#9ca3af" />
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--p-navy)" }}>{off.name}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--r-text-muted)" }}>{off.position}</div>
                      {off.term_start && (
                        <div style={{ fontSize: "10px", color: "var(--p-blue)", marginTop: "2px" }}>
                          Term: {off.term_start} - {off.term_end || "Present"}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: "13px" }}>{off.chapter || "National"}</td>
                    <td>
                      <span
                        className={`about-status-badge about-status-badge--${off.status === "active" ? "active" : "draft"}`}
                        style={{ fontSize: "10px" }}
                      >
                        {off.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "2px" }}>
                        <button
                          type="button"
                          className="about-btn about-btn--secondary"
                          style={{ height: "26px", width: "26px", padding: 0 }}
                          disabled={index === 0}
                          onClick={() => moveOfficer(index, "up")}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          className="about-btn about-btn--secondary"
                          style={{ height: "26px", width: "26px", padding: 0 }}
                          disabled={index === officers.length - 1}
                          onClick={() => moveOfficer(index, "down")}
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          type="button"
                          className="about-btn about-btn--secondary"
                          style={{ height: "28px", width: "28px", padding: 0 }}
                          onClick={() => handleEditClick(off)}
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          type="button"
                          className="about-btn about-btn--danger"
                          style={{ height: "28px", width: "28px", padding: 0 }}
                          onClick={() => handleDeleteClick(off.id)}
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {officers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#6b7280", padding: "30px" }}>
                      No officers registered in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add / Edit Form */}
          <div className="about-editor-card">
            <h3 style={{ fontSize: "15px", color: "var(--p-navy)", marginBottom: "16px", fontWeight: 600 }}>
              {editingId ? "Edit Officer Profile" : "Register New Officer"}
            </h3>

            <form onSubmit={handleSave}>
              <div className="about-form-group">
                <label className="about-form-label">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Lino Reynoso"
                  className="about-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="about-form-group">
                <label className="about-form-label">Officer Position</label>
                <input
                  type="text"
                  placeholder="e.g. Vice President for Luzon"
                  className="about-input"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                />
              </div>

              <div className="about-form-group">
                <label className="about-form-label">Regional Chapter</label>
                <input
                  type="text"
                  placeholder="e.g. Luzon, Visayas, CAR"
                  className="about-input"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                />
              </div>

              <div className="about-form-group">
                <label className="about-form-label">Term Duration</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Start Year"
                    className="about-input"
                    value={termStart}
                    onChange={(e) => setTermStart(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="End Year"
                    className="about-input"
                    value={termEnd}
                    onChange={(e) => setTermEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="about-form-group">
                <label className="about-form-label">Emblem Status</label>
                <select
                  className="about-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="about-form-group">
                <label className="about-form-label">Photo Upload</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <label
                    className="about-btn about-btn--secondary"
                    style={{ height: "38px", cursor: "pointer", display: "inline-flex", gap: "6px" }}
                  >
                    {isPhotoUploading ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <Upload size={14} />
                    )}
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handlePhotoUpload}
                      disabled={isPhotoUploading}
                    />
                  </label>
                  {photoUrl && (
                    <span style={{ fontSize: "11px", color: "var(--p-emerald)", fontWeight: 600 }}>
                      ✔ Photo linked
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "24px" }}>
                {editingId && (
                  <button
                    type="button"
                    className="about-btn about-btn--secondary"
                    style={{ flex: 1 }}
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="about-btn about-btn--primary"
                  style={{ flex: 2 }}
                  disabled={isSaving}
                >
                  {editingId ? "Save Profile" : "Register Officer"}
                </button>
              </div>
            </form>
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
