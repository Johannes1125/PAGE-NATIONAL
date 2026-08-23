"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe, Upload, Trash, Eye, Plus } from "lucide-react";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import { api, PaginatedResponse, PaginationMeta } from "../../../lib/api-client";
import Pagination from "../components/Pagination";
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

  // Branding Details state
  const [section, setSection] = useState<Section | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("PAGE Logo & Description");
  const [description, setDescription] = useState("");
  const [designPhilosophy, setDesignPhilosophy] = useState("");

  // Dynamic Elements state
  const [symbolBreakdown, setSymbolBreakdown] = useState<any[]>([]);
  const [colorPalette, setColorPalette] = useState<any[]>([]);

  // Symbol Modal handlers state
  const [isSymbolFormOpen, setIsSymbolFormOpen] = useState(false);
  const [editingSymbolIndex, setEditingSymbolIndex] = useState<number | null>(null);
  const [symbolFormName, setSymbolFormName] = useState("");
  const [symbolFormMeaning, setSymbolFormMeaning] = useState("");
  const [isDeleteSymbolOpen, setIsDeleteSymbolOpen] = useState(false);
  const [deleteSymbolIndex, setDeleteSymbolIndex] = useState<number | null>(null);

  // Color Modal handlers state
  const [isColorFormOpen, setIsColorFormOpen] = useState(false);
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
  const [colorFormName, setColorFormName] = useState("");
  const [colorFormHex, setColorFormHex] = useState("#000000");
  const [colorFormSignificance, setColorFormSignificance] = useState("");
  const [isDeleteColorOpen, setIsDeleteColorOpen] = useState(false);
  const [deleteColorIndex, setDeleteColorIndex] = useState<number | null>(null);

  const hasUnsavedChanges = useMemo(() => {
    if (!section) return false;
    let initialDescription = "";
    let initialPhilosophy = "";
    let initialSymbols: any[] = [];
    let initialColors: any[] = [];

    try {
      const parsed = JSON.parse(section.content);
      if (parsed && typeof parsed === "object") {
        initialDescription = parsed.description || "";
        initialPhilosophy = parsed.design_philosophy || "";
        initialSymbols = parsed.symbol_breakdown || [];
        initialColors = parsed.color_palette || [];
      } else {
        initialDescription = section.content || "";
        initialPhilosophy = "";
      }
    } catch (e) {
      initialDescription = section.content || "";
      initialPhilosophy = "";
    }

    return (
      title !== section.title ||
      description !== initialDescription ||
      designPhilosophy !== initialPhilosophy ||
      JSON.stringify(symbolBreakdown) !== JSON.stringify(initialSymbols) ||
      JSON.stringify(colorPalette) !== JSON.stringify(initialColors)
    );
  }, [title, description, designPhilosophy, symbolBreakdown, colorPalette, section]);

  const isPublishButtonDisabled = (section?.status === "published") && !hasUnsavedChanges;

  useEffect(() => {
    // Basic Admin Role Authorization Guard
    const userStr = localStorage.getItem("page_user_payload");
    if (!userStr) {
      window.location.href = "/admin-login";
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== "admin") {
        window.location.href = "/admin-login";
        return;
      }
    } catch (e) {
      window.location.href = "/admin-login";
      return;
    }

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

          try {
            const parsed = JSON.parse(secRes.data.content);
            if (parsed && typeof parsed === "object") {
              setDescription(parsed.description || "");
              setDesignPhilosophy(parsed.design_philosophy || "");
              setSymbolBreakdown(parsed.symbol_breakdown || []);
              setColorPalette(parsed.color_palette || []);
            } else {
              setDescription(secRes.data.content);
              setDesignPhilosophy("");
              setSymbolBreakdown([]);
              setColorPalette([]);
            }
          } catch (e) {
            setDescription(secRes.data.content);
            setDesignPhilosophy("");
            setSymbolBreakdown([]);
            setColorPalette([]);
          }
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

  // Symbol Modal handlers
  const handleAddSymbolClick = () => {
    setEditingSymbolIndex(null);
    setSymbolFormName("");
    setSymbolFormMeaning("");
    setIsSymbolFormOpen(true);
  };

  const handleEditSymbolClick = (idx: number) => {
    const symbol = symbolBreakdown[idx];
    if (!symbol) return;
    setEditingSymbolIndex(idx);
    setSymbolFormName(symbol.element);
    setSymbolFormMeaning(symbol.meaning);
    setIsSymbolFormOpen(true);
  };

  const handleSaveSymbolForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbolFormName.trim() || !symbolFormMeaning.trim()) {
      gooeyToast.error("Please fill in all symbol fields.");
      return;
    }
    const updated = [...symbolBreakdown];
    const newSymbol = { element: symbolFormName.trim(), meaning: symbolFormMeaning.trim() };
    if (editingSymbolIndex === null) {
      updated.push(newSymbol);
    } else {
      updated[editingSymbolIndex] = newSymbol;
    }
    setSymbolBreakdown(updated);
    setIsSymbolFormOpen(false);
    gooeyToast.success("Symbol item saved. Publish changes to save to database.");
  };

  const handleDeleteSymbolClick = (idx: number) => {
    setDeleteSymbolIndex(idx);
    setIsDeleteSymbolOpen(true);
  };

  const handleConfirmDeleteSymbol = () => {
    if (deleteSymbolIndex === null) return;
    const updated = symbolBreakdown.filter((_, i) => i !== deleteSymbolIndex);
    setSymbolBreakdown(updated);
    setIsDeleteSymbolOpen(false);
    setDeleteSymbolIndex(null);
    gooeyToast.success("Symbol item removed from current list. Publish changes to persist.");
  };

  // Color Modal handlers
  const handleAddColorClick = () => {
    setEditingColorIndex(null);
    setColorFormName("");
    setColorFormHex("#000000");
    setColorFormSignificance("");
    setIsColorFormOpen(true);
  };

  const handleEditColorClick = (idx: number) => {
    const color = colorPalette[idx];
    if (!color) return;
    setEditingColorIndex(idx);
    setColorFormName(color.color_name);
    setColorFormHex(color.hex);
    setColorFormSignificance(color.significance);
    setIsColorFormOpen(true);
  };

  const handleSaveColorForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorFormName.trim() || !colorFormSignificance.trim()) {
      gooeyToast.error("Please fill in all color fields.");
      return;
    }
    const updated = [...colorPalette];
    const newColor = {
      color_name: colorFormName.trim(),
      hex: colorFormHex,
      significance: colorFormSignificance.trim()
    };
    if (editingColorIndex === null) {
      updated.push(newColor);
    } else {
      updated[editingColorIndex] = newColor;
    }
    setColorPalette(updated);
    setIsColorFormOpen(false);
    gooeyToast.success("Color item saved. Publish changes to save to database.");
  };

  const handleDeleteColorClick = (idx: number) => {
    setDeleteColorIndex(idx);
    setIsDeleteColorOpen(true);
  };

  const handleConfirmDeleteColor = () => {
    if (deleteColorIndex === null) return;
    const updated = colorPalette.filter((_, i) => i !== deleteColorIndex);
    setColorPalette(updated);
    setIsDeleteColorOpen(false);
    setDeleteColorIndex(null);
    gooeyToast.success("Color item removed from current list. Publish changes to persist.");
  };

  // Save changes to branding description and dynamic details
  const handleSave = async (status: "draft" | "published") => {
    setIsSaving(true);
    try {
      const serializedContent = JSON.stringify({
        description: description,
        design_philosophy: designPhilosophy,
        symbol_breakdown: symbolBreakdown,
        color_palette: colorPalette,
      });

      const res = await api.put("/about-page/sections/logo_description", {
        title,
        content: serializedContent,
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

  // Upload branding official logo file
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

  // Delete official logo document asset
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
        title="Logo & Description"
        subtitle="Loading Logo & Description configurations..."
        eyebrow="Content Manager"
        seniorFriendlyHeader={true}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      </AdminSidebarLayout>
    );
  }

  const latestLogoUrl = documents[documents.length - 1]?.file_url || "/PAGE-favicon.png";

  return (
    <AdminSidebarLayout
      pageClassName="admin-dashboard"
      mainClassName="admin-main"
      title="Logo & Description"
      subtitle="Official branding logo and organization description content management"
      eyebrow="Content Manager"
      seniorFriendlyHeader={true}
    >
      <div className="admin-shell">
        <div className="logo-desc-toolbar">
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

        <section className="logo-desc-layout">
          {/* Text & Dynamic Editors Column */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Main Narrative Editor */}
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
                <label className="about-form-label">Logo Emblem Narrative (Short Description)</label>
                <textarea
                  rows={4}
                  className="about-textarea"
                  placeholder="A short overview of the logo (e.g., used on the landing page header subtitle)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="about-form-group" style={{ marginBottom: 0 }}>
                <label className="about-form-label">Design Philosophy (Detailed Branding Essay)</label>
                <textarea
                  rows={6}
                  className="about-textarea"
                  placeholder="Detailed explanation of the design choices, shapes, and branding philosophy..."
                  value={designPhilosophy}
                  onChange={(e) => setDesignPhilosophy(e.target.value)}
                />
              </div>
            </div>

            {/* Symbol Breakdown Section */}
            <div className="about-editor-card" style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                <h3 style={{ fontSize: "16px", color: "var(--p-navy)", margin: 0, fontWeight: 600 }}>
                  Logo Symbols & Meanings
                </h3>
                <button
                  type="button"
                  className="about-btn about-btn--primary"
                  onClick={handleAddSymbolClick}
                  style={{ height: "36px", padding: "0 12px", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Plus size={14} /> Add Symbol
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {symbolBreakdown.map((symbol, idx) => (
                  <div key={idx} className="logo-desc-item-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--p-navy)", margin: "0 0 4px" }}>
                        {idx + 1}. {symbol.element}
                      </h4>
                      <p style={{ fontSize: "13.5px", color: "var(--r-text-muted)", margin: 0, lineHeight: 1.5 }}>
                        {symbol.meaning}
                      </p>
                    </div>

                    <div className="logo-desc-item-actions">
                      <button
                        type="button"
                        className="about-btn about-btn--secondary"
                        style={{ height: "36px", padding: "0 12px", fontSize: "13px" }}
                        onClick={() => handleEditSymbolClick(idx)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="about-btn about-btn--danger"
                        style={{ height: "36px", padding: "0 12px", fontSize: "13px" }}
                        onClick={() => handleDeleteSymbolClick(idx)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {symbolBreakdown.length === 0 && (
                  <p style={{ fontSize: "14px", color: "var(--r-text-muted)", margin: 0, textAlign: "center", padding: "16px 0" }}>
                    No symbol breakdown items configured. Click 'Add Symbol' to register one.
                  </p>
                )}
              </div>
            </div>

            {/* Color Palette Section */}
            <div className="about-editor-card" style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                <h3 style={{ fontSize: "16px", color: "var(--p-navy)", margin: 0, fontWeight: 600 }}>
                  Logo Color Palette
                </h3>
                <button
                  type="button"
                  className="about-btn about-btn--primary"
                  onClick={handleAddColorClick}
                  style={{ height: "36px", padding: "0 12px", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Plus size={14} /> Add Color
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {colorPalette.map((color, idx) => (
                  <div key={idx} className="logo-desc-item-row">
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: color.hex,
                          border: "1px solid var(--r-border)",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--p-navy)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          {color.color_name}
                          <span style={{ fontSize: "12px", color: "var(--r-text-muted)", fontWeight: 500 }}>
                            {color.hex}
                          </span>
                        </h4>
                        <p style={{ fontSize: "13.5px", color: "var(--r-text-muted)", margin: 0, lineHeight: 1.5 }}>
                          {color.significance}
                        </p>
                      </div>
                    </div>

                    <div className="logo-desc-item-actions">
                      <button
                        type="button"
                        className="about-btn about-btn--secondary"
                        style={{ height: "36px", padding: "0 12px", fontSize: "13px" }}
                        onClick={() => handleEditColorClick(idx)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="about-btn about-btn--danger"
                        style={{ height: "36px", padding: "0 12px", fontSize: "13px" }}
                        onClick={() => handleDeleteColorClick(idx)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {colorPalette.length === 0 && (
                  <p style={{ fontSize: "14px", color: "var(--r-text-muted)", margin: 0, textAlign: "center", padding: "16px 0" }}>
                    No color palette items configured. Click 'Add Color' to register one.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Logo Upload & Preview Column */}
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
                    target.src = "/PAGE-favicon.png";
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
                    <Loader2 className="animate-spin" size={24} color="var(--p-blue)" />
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
                        flexWrap: "wrap",
                        gap: "6px",
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

      {/* ── MODAL: Add/Edit Symbol ────────────────────────────────────────── */}
      {isSymbolFormOpen && (
        <>
          <div
            onClick={() => setIsSymbolFormOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 90,
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 520,
              background: "var(--r-surface)",
              border: "1.5px solid var(--r-border-mid)",
              borderRadius: 20,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <style>{`
              @keyframes modalIn {
                from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
                to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              }
            `}</style>

            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--r-border-mid)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}>
                {editingSymbolIndex === null ? "Add Symbol Breakdown" : "Edit Symbol Breakdown"}
              </h3>
              <button
                type="button"
                onClick={() => setIsSymbolFormOpen(false)}
                style={{ border: "none", background: "none", cursor: "pointer", color: "var(--r-text-muted)", fontSize: "20px", display: "flex", alignItems: "center" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSymbolForm} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="about-form-group">
                <label className="about-form-label">Symbol / Element Name</label>
                <input
                  type="text"
                  className="about-input"
                  placeholder="e.g. The Outer Ring"
                  value={symbolFormName}
                  onChange={(e) => setSymbolFormName(e.target.value)}
                  required
                />
              </div>

              <div className="about-form-group">
                <label className="about-form-label">Symbol Meaning</label>
                <textarea
                  rows={4}
                  className="about-textarea"
                  placeholder="Describe what this element symbolizes in the organization crest..."
                  value={symbolFormMeaning}
                  onChange={(e) => setSymbolFormMeaning(e.target.value)}
                  required
                />
              </div>

              <div className="cbl-modal-actions" style={{ marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsSymbolFormOpen(false)}
                  style={{
                    height: 48,
                    borderRadius: 12,
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--r-text-mid)",
                    background: "var(--r-surface-2)",
                    border: "1px solid var(--r-border-mid)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    height: 48,
                    borderRadius: 12,
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    background: "var(--p-blue)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Save Symbol
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── MODAL: Delete Symbol Confirmation ──────────────────────────────── */}
      {isDeleteSymbolOpen && (
        <>
          <div
            onClick={() => setIsDeleteSymbolOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 90,
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 420,
              background: "var(--r-surface)",
              border: "1.5px solid var(--r-border-mid)",
              borderRadius: 20,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              padding: "24px",
              textAlign: "center",
              animation: "modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: "0 0 12px" }}>
              Delete Symbol Breakdown
            </h3>
            <p style={{ fontSize: "14.5px", color: "var(--r-text-muted)", margin: "0 0 20px", lineHeight: 1.5 }}>
              Are you sure you want to delete this symbol element from the logo breakdown list?
            </p>
            <div className="cbl-modal-actions">
              <button
                type="button"
                onClick={() => setIsDeleteSymbolOpen(false)}
                style={{
                  height: 46,
                  borderRadius: 10,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--r-text-mid)",
                  background: "var(--r-surface-2)",
                  border: "1px solid var(--r-border-mid)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSymbol}
                style={{
                  height: 46,
                  borderRadius: 10,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  background: "var(--p-rose)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── MODAL: Add/Edit Color ─────────────────────────────────────────── */}
      {isColorFormOpen && (
        <>
          <div
            onClick={() => setIsColorFormOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 90,
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 520,
              background: "var(--r-surface)",
              border: "1.5px solid var(--r-border-mid)",
              borderRadius: 20,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--r-border-mid)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}>
                {editingColorIndex === null ? "Add Brand Color" : "Edit Brand Color"}
              </h3>
              <button
                type="button"
                onClick={() => setIsColorFormOpen(false)}
                style={{ border: "none", background: "none", cursor: "pointer", color: "var(--r-text-muted)", fontSize: "20px", display: "flex", alignItems: "center" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveColorForm} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="logo-desc-color-fields">
                <div className="about-form-group" style={{ marginBottom: 0 }}>
                  <label className="about-form-label">Color Name</label>
                  <input
                    type="text"
                    className="about-input"
                    placeholder="e.g. Academic Deep Blue"
                    value={colorFormName}
                    onChange={(e) => setColorFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="about-form-group" style={{ marginBottom: 0 }}>
                  <label className="about-form-label">HEX Code</label>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      type="color"
                      value={colorFormHex && colorFormHex.startsWith("#") && colorFormHex.length === 7 ? colorFormHex : "#000000"}
                      onChange={(e) => setColorFormHex(e.target.value)}
                      style={{
                        width: "36px",
                        height: "44px",
                        padding: 0,
                        border: "1px solid var(--r-border-mid)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        background: "transparent",
                        flexShrink: 0,
                      }}
                    />
                    <input
                      type="text"
                      className="about-input"
                      style={{ height: "44px", padding: "0 8px", width: "100%", minWidth: 0 }}
                      placeholder="#1a4b8c"
                      value={colorFormHex}
                      onChange={(e) => setColorFormHex(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="about-form-group">
                <label className="about-form-label">Color Significance / Meaning</label>
                <textarea
                  rows={3}
                  className="about-textarea"
                  placeholder="Describe what this color signifies in the brand or organization identity..."
                  value={colorFormSignificance}
                  onChange={(e) => setColorFormSignificance(e.target.value)}
                  required
                />
              </div>

              <div className="cbl-modal-actions" style={{ marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setIsColorFormOpen(false)}
                  style={{
                    height: 48,
                    borderRadius: 12,
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--r-text-mid)",
                    background: "var(--r-surface-2)",
                    border: "1px solid var(--r-border-mid)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    height: 48,
                    borderRadius: 12,
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    background: "var(--p-blue)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Save Color
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── MODAL: Delete Color Confirmation ───────────────────────────────── */}
      {isDeleteColorOpen && (
        <>
          <div
            onClick={() => setIsDeleteColorOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 90,
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 420,
              background: "var(--r-surface)",
              border: "1.5px solid var(--r-border-mid)",
              borderRadius: 20,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              padding: "24px",
              textAlign: "center",
              animation: "modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: "0 0 12px" }}>
              Delete Brand Color
            </h3>
            <p style={{ fontSize: "14.5px", color: "var(--r-text-muted)", margin: "0 0 20px", lineHeight: 1.5 }}>
              Are you sure you want to delete this color from the brand palette list?
            </p>
            <div className="cbl-modal-actions">
              <button
                type="button"
                onClick={() => setIsDeleteColorOpen(false)}
                style={{
                  height: 46,
                  borderRadius: 10,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--r-text-mid)",
                  background: "var(--r-surface-2)",
                  border: "1px solid var(--r-border-mid)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteColor}
                style={{
                  height: 46,
                  borderRadius: 10,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  background: "var(--p-rose)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Delete
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