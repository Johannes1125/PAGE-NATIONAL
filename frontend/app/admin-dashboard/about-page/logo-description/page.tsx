"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe, Upload, Trash, Eye } from "lucide-react";
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

export default function LogoDescriptionManagement() {
  const router = useRouter();
  const [section, setSection] = useState<Section | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState("PAGE Logo & Description");
  const [content, setContent] = useState("");

  const hasUnsavedChanges =
    title !== (section?.title || "") ||
    content !== (section?.content || "");

  const isPublishButtonDisabled = (section?.status === "published") && !hasUnsavedChanges;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [secRes, docRes] = await Promise.all([
          api.get("/about-page/sections/logo_description"),
          api.get("/about-page/documents/logo_description"),
        ]);

        if (secRes.success) {
          setSection(secRes.data);
          setTitle(secRes.data.title);
          setContent(secRes.data.content);
        }
        if (docRes.success) {
          setDocuments(docRes.data);
        }
      } catch (err) {
        console.error(err);
        gooeyToast.error("Failed to load branding data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (status: "draft" | "published") => {
    setIsSaving(true);
    try {
      const res = await api.put("/about-page/sections/logo_description", {
        title,
        content,
        status,
      });

      if (res.success) {
        setSection(res.data);
        gooeyToast.success("Branding details updated successfully!");
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to save branding details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await api.postMultipart("/about-page/documents/logo_description", formData);
      if (res.success) {
        setDocuments([...documents, res.data]);
        gooeyToast.success("Official logo uploaded successfully!");
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to upload logo image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this logo asset?")) return;

    try {
      const res = await api.delete(`/about-page/documents/${id}`);
      if (res.success) {
        setDocuments(documents.filter((d) => d.id !== id));
        gooeyToast.success("Logo asset deleted successfully.");
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to delete asset.");
    }
  };

  if (isLoading) {
    return (
      <AdminSidebarLayout
        pageClassName="admin-dashboard"
        mainClassName="admin-main"
        title="Branding Assets"
        subtitle="Loading branding configurations..."
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AdminSidebarLayout>
    );
  }

  const latestLogoUrl = documents[documents.length - 1]?.file_url || "/PAGE.jpg";

  return (
    <AdminSidebarLayout
      pageClassName="admin-dashboard"
      mainClassName="admin-main"
      title="PAGE LOGO & DESCRIPTION"
      subtitle="Upload official high-resolution logos, and edit the icon description metadata."
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

        <section style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "start" }}>
          {/* Text Editor */}
          <div className="about-editor-card">
            <h3 style={{ fontSize: "16px", color: "var(--p-navy)", marginBottom: "16px", fontWeight: 600 }}>
              Branding Metadata
            </h3>

            <div className="about-form-group">
              <label className="about-form-label">Title</label>
              <input
                type="text"
                className="about-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="about-form-group">
              <label className="about-form-label">Logo Emblem Narrative</label>
              <textarea
                rows={10}
                className="about-textarea"
                placeholder="Describe what the PAGE shield, founding year 1962, and lettering symbolize..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          {/* Logo Upload & Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="about-editor-card">
              <h3 style={{ fontSize: "15px", color: "var(--p-navy)", marginBottom: "16px", fontWeight: 600 }}>
                Logo Preview
              </h3>

              <div
                style={{
                  background: "var(--r-surface-2)",
                  border: "1px solid var(--r-border)",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "grid",
                  placeItems: "center",
                  minHeight: "200px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <img
                  src={latestLogoUrl}
                  alt="Official PAGE Logo"
                  style={{
                    maxWidth: "150px",
                    height: "auto",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = "/PAGE.jpg";
                  }}
                />
              </div>
            </div>

            <div className="about-editor-card">
              <h3 style={{ fontSize: "15px", color: "var(--p-navy)", marginBottom: "16px", fontWeight: 600 }}>
                Upload New Logo File
              </h3>

              <label className="about-upload-zone" style={{ display: "block" }}>
                {isUploading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <Loader2 className="animate-spin" size={24} />
                    <span style={{ fontSize: "12.5px", color: "var(--r-text-muted)" }}>Uploading asset...</span>
                  </div>
                ) : (
                  <>
                    <Upload size={24} style={{ color: "var(--p-blue)", marginBottom: "8px" }} />
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--p-navy)" }}>
                      Choose file or drag logo here
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--r-text-muted)", marginTop: "4px" }}>
                      Supports PNG, JPG, JPEG, or WEBP (Max 2MB)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>

              {/* Uploaded History List */}
              <div style={{ marginTop: "20px" }}>
                <h4 style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--p-navy)", marginBottom: "10px" }}>
                  Logo Upload Trail
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        background: "var(--r-surface-2)",
                        border: "1px solid var(--r-border)",
                        borderRadius: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "150px",
                        }}
                        title={doc.file_name}
                      >
                        {doc.file_name}
                      </span>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="about-btn about-btn--secondary"
                          style={{ height: "26px", padding: "0 8px" }}
                        >
                          <Eye size={12} />
                        </a>
                        <button
                          type="button"
                          className="about-btn about-btn--danger"
                          style={{ height: "26px", padding: "0 8px" }}
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
