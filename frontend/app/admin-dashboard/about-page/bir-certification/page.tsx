"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe, Upload, Trash, Eye, FileText } from "lucide-react";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import { api } from "../../../lib/api-client";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import "../about-page.css";
import "../../admin-dashboard.css";

type Document = {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
};

type Section = {
  id: string;
  section_key: string;
  title: string;
  content: string;
  status: "draft" | "published" | "archived";
  updated_at: string;
};

export default function BirCertificationManagement() {
  const router = useRouter();
  const [section, setSection] = useState<Section | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState("BIR Certification");
  const [content, setContent] = useState("");

  const hasUnsavedChanges =
    title !== (section?.title || "") ||
    content !== (section?.content || "");

  const isPublishButtonDisabled = (section?.status === "published") && !hasUnsavedChanges;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [birRes, docRes] = await Promise.all([
        api.get("/about-page/sections/bir_certification"),
        api.get("/about-page/documents/bir_certification"),
      ]);

      if (birRes.success) {
        setSection(birRes.data);
        setTitle(birRes.data.title);
        setContent(birRes.data.content);
      }
      if (docRes.success) {
        setDocuments(docRes.data);
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to load BIR Certification data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (status: "draft" | "published") => {
    setIsSaving(true);
    try {
      const res = await api.put("/about-page/sections/bir_certification", {
        title,
        content,
        status,
      });

      if (res.success) {
        setSection(res.data);
        gooeyToast.success("BIR certification text updated successfully!");
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to save BIR certification text.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, replaceId?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      if (replaceId) {
        await api.delete(`/about-page/documents/${replaceId}`);
      }

      const res = await api.postMultipart("/about-page/documents/bir_certification", formData);
      if (res.success) {
        if (replaceId) {
          setDocuments((prev) => prev.filter((d) => d.id !== replaceId).concat(res.data));
          gooeyToast.success("BIR Document replaced successfully!");
        } else {
          setDocuments((prev) => [...prev, res.data]);
          gooeyToast.success("BIR Document uploaded successfully!");
        }
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to upload BIR Document.");
    } finally {
      setIsUploading(false);
      fetchData();
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await api.delete(`/about-page/documents/${id}`);
      if (res.success) {
        setDocuments(documents.filter((d) => d.id !== id));
        gooeyToast.success("Document deleted successfully.");
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to delete document.");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  if (isLoading) {
    return (
      <AdminSidebarLayout
        pageClassName="admin-dashboard"
        mainClassName="admin-main"
        title="BIR Certification"
        subtitle="Loading BIR configurations..."
        eyebrow="Content Manager"
        seniorFriendlyHeader={true}
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
      title="BIR Certification"
      subtitle="Official Bureau of Internal Revenue (BIR) tax exemption content management"
      eyebrow="Content Manager"
      seniorFriendlyHeader={true}
    >
      <div className="admin-shell">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <button
            type="button"
            className="about-btn about-btn--secondary"
            onClick={() => router.push("/admin-dashboard/about-page")}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="about-btn about-btn--primary"
              disabled={isSaving || isPublishButtonDisabled}
              onClick={() => handleSave("published")}
              style={{
                opacity: (isSaving || isPublishButtonDisabled) ? 0.5 : 1,
                cursor: (isSaving || isPublishButtonDisabled) ? "not-allowed" : "pointer",
              }}
            >
              <Globe size={16} /> Publish Changes
            </button>
          </div>
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* Main descriptions editor */}
          <div className="about-editor-card">
            <h3 style={{ fontSize: "16px", color: "var(--p-navy)", marginBottom: "16px", fontWeight: 600 }}>
              TIN & Tax Status Details
            </h3>

            <div className="about-form-group">
              <label className="about-form-label">Section Title</label>
              <input
                type="text"
                className="about-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="about-form-group">
              <label className="about-form-label">Tax Exemption Description</label>
              <textarea
                rows={10}
                className="about-textarea"
                placeholder="Details of the tax exemption and TIN registration..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          {/* BIR Upload list */}
          <div className="about-editor-card">
            <h3 style={{ fontSize: "16px", color: "var(--p-navy)", marginBottom: "16px", fontWeight: 600 }}>
              BIR Certification Certificate
            </h3>

            <label className="about-upload-zone" style={{ display: "block" }}>
              {isUploading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <Loader2 className="animate-spin" size={24} />
                  <span style={{ fontSize: "12.5px", color: "var(--r-text-muted)" }}>Uploading document...</span>
                </div>
              ) : (
                <>
                  <Upload size={24} style={{ color: "var(--p-blue)", marginBottom: "8px" }} />
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--p-navy)" }}>
                    Choose Certificate file or drag here
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--r-text-muted)", marginTop: "4px" }}>
                    PDF, PNG, JPG, or WEBP (Max 4MB)
                  </p>
                </>
              )}
              <input
                type="file"
                accept="application/pdf,image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileUpload(e)}
                disabled={isUploading}
              />
            </label>

            {/* Document table list */}
            <div style={{ marginTop: "24px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--p-navy)", marginBottom: "12px" }}>
                Active Documents List
              </h4>

              <table className="about-doc-table" style={{ fontSize: "12.5px" }}>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Uploaded At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td style={{ fontWeight: 500 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FileText size={14} color="var(--p-blue)" />
                          <span
                            title={doc.file_name}
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "180px",
                            }}
                          >
                            {doc.file_name}
                          </span>
                        </div>
                      </td>
                      <td>{formatDate(doc.created_at)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="about-btn about-btn--secondary"
                            style={{ height: "28px", width: "28px", padding: 0 }}
                          >
                            <Eye size={12} />
                          </a>
                          
                          {/* Replace Action */}
                          <label
                            className="about-btn about-btn--secondary"
                            style={{ height: "28px", width: "28px", padding: 0, display: "inline-flex", cursor: "pointer" }}
                          >
                            <Upload size={12} />
                            <input
                              type="file"
                              accept="application/pdf,image/*"
                              style={{ display: "none" }}
                              onChange={(e) => handleFileUpload(e, doc.id)}
                            />
                          </label>

                          <button
                            type="button"
                            className="about-btn about-btn--danger"
                            style={{ height: "28px", width: "28px", padding: 0 }}
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {documents.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>
                        No files uploaded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
