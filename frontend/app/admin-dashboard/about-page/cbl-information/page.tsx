"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Globe,
  Plus,
  Trash,
  Edit,
  Upload,
  FileText,
  Check,
  Search,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Eye,
  X,
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Info,
} from "lucide-react";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import { api } from "../../../lib/api-client";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import "../about-page.css";
import "../../admin-dashboard.css";

// ── DESIGN TOKENS (Elder-friendly) ───────────────────────────────────────────
const T = {
  blue:       "var(--p-navy)",
  blueLight:  "var(--p-blue)",
  accent:     "var(--p-blue)",
  accentBg:   "var(--p-blue-pale)",
  red:        "var(--p-rose)",
  redBg:      "var(--p-rose-pale)",
  redBorder:  "var(--p-rose-pale)",
  green:      "var(--p-emerald)",
  slate50:    "var(--r-surface-2)",
  slate100:   "var(--r-bg)",
  slate200:   "var(--r-border-mid)",
  slate300:   "var(--r-border-mid)",
  slate500:   "var(--r-text-muted)",
  slate600:   "var(--r-text-mid)",
  slate700:   "var(--r-text)",
  slate900:   "var(--r-text)",
  white:      "var(--r-surface)",
  border:     "var(--r-border)",

  // Font sizes – bumped to follow PAGE Senior-Friendly Design Standards:
  // "Minimum text size 18px. Minimum heading size 24px."
  fs_xs:      18,
  fs_sm:      18,
  fs_base:    18,
  fs_md:      24,
  fs_lg:      24,
  fs_xl:      28,

  // Heights – larger touch targets
  inputH:     48,
  btnH:       48,
  btnHSm:     40,
  rowH:       56,
} as const;

// ── CUSTOM WYSIWYG RICH TEXT EDITOR ──────────────────────────────────────────

type RichTextEditorProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
};

function RichTextEditor({ value, onChange, placeholder, minHeight = "140px" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      isUpdatingRef.current = true;
      editorRef.current.innerHTML = value || "";
      isUpdatingRef.current = false;
    }
  }, [value]);

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  };

  const handleCommand = (command: string) => {
    document.execCommand(command, false, "");
    updateActiveFormats();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (isUpdatingRef.current) return;
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleKeyUp = () => updateActiveFormats();
  const handleMouseUp = () => updateActiveFormats();

  // Prevent the editor from losing focus/selection when a toolbar button is clicked
  const preventBlur = (e: React.MouseEvent) => e.preventDefault();

  const toolBtn = (cmd?: string): React.CSSProperties => {
    const active = cmd ? activeFormats[cmd] : false;
    return {
      width: 48,
      height: 48,
      borderRadius: 10,
      border: active ? `2px solid var(--p-blue)` : "1px solid var(--r-border-mid)",
      background: active ? "var(--p-blue-pale)" : "var(--r-surface)",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: active ? "var(--p-blue)" : "var(--r-text-mid)",
      flexShrink: 0,
      transition: "background 0.15s, border 0.15s, color 0.15s",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    };
  };

  const separatorStyle: React.CSSProperties = {
    width: 1, height: 28, background: "var(--r-border-mid)", margin: "0 6px",
  };

  const cleanText = (value || "").replace(/<[^>]*>/g, "");
  const charCount = cleanText.length;
  const wordCount = cleanText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      style={{
        border: "1px solid var(--r-border-mid)",
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--r-surface)",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px",
          background: "var(--r-surface-2)",
          borderBottom: "1px solid var(--r-border-mid)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {/* Undo / Redo */}
          <button type="button" onMouseDown={preventBlur} onClick={() => handleCommand("undo")} style={toolBtn()} title="Undo (Ctrl+Z)">
            <Undo2 size={18} />
          </button>
          <button type="button" onMouseDown={preventBlur} onClick={() => handleCommand("redo")} style={toolBtn()} title="Redo (Ctrl+Y)">
            <Redo2 size={18} />
          </button>
          <div style={separatorStyle} />
          {/* Formatting */}
          <button type="button" onMouseDown={preventBlur} onClick={() => handleCommand("bold")} style={toolBtn("bold")} title="Bold (Ctrl+B)">
            <Bold size={18} />
          </button>
          <button type="button" onMouseDown={preventBlur} onClick={() => handleCommand("italic")} style={toolBtn("italic")} title="Italic (Ctrl+I)">
            <Italic size={18} />
          </button>
          <button type="button" onMouseDown={preventBlur} onClick={() => handleCommand("underline")} style={toolBtn("underline")} title="Underline (Ctrl+U)">
            <Underline size={18} />
          </button>
        </div>
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        style={{
          padding: "14px 16px",
          outline: "none",
          fontSize: T.fs_base,
          color: "var(--r-text)",
          lineHeight: 1.75,
          minHeight,
          overflowY: "auto",
          fontFamily: "var(--font-body)",
        }}
        data-placeholder={placeholder}
      />
      {/* Footer count & Progress bar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "10px 16px",
          background: "var(--r-surface-2)",
          borderTop: "1px solid var(--r-border-mid)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontSize: T.fs_xs, color: "var(--r-text-muted)", fontFamily: "var(--font-body)", fontWeight: 500 }}>
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <span style={{ fontSize: T.fs_xs, color: charCount > 2000 ? "var(--p-rose)" : "var(--r-text-muted)", fontFamily: "var(--font-body)", fontWeight: charCount > 2000 ? 700 : 500 }}>
            {charCount} / 2000 characters {charCount > 2000 && "(Exceeds recommended limit)"}
          </span>
        </div>
        <div style={{ width: "100%", background: "var(--r-border-mid)", height: 8, borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              width: `${Math.min((charCount / 2000) * 100, 100)}%`,
              background: charCount > 2000 ? "var(--p-rose)" : "var(--p-blue)",
              height: "100%",
              borderRadius: 4,
              transition: "width 0.2s ease, background-color 0.2s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── TYPES ───────────────────────────────────────────────────────────────────

type CBLArticle = {
  id: string;
  article_number: string;
  article_name: string;
  article_description: string;
  sort_order: number;
  updated_at: string;
};

type GovernanceDoc = {
  id: string;
  title: string;
  general_description: string;
  file_name?: string;
  file_url?: string;
  file_size?: number;
  uploaded_by?: string;
  updated_at: string;
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

// ── COMPONENT ────────────────────────────────────────────────────────────────

export default function CblInformationManagement() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"process" | "governance">("process");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [section, setSection] = useState<Section | null>(null);
  const [governanceDoc, setGovernanceDoc] = useState<GovernanceDoc | null>(null);
  const [articles, setArticles] = useState<CBLArticle[]>([]);

  const [title, setTitle] = useState("");
  const [generalDescription, setGeneralDescription] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const [articleNumber, setArticleNumber] = useState("");
  const [articleName, setArticleName] = useState("");
  const [articleDescription, setArticleDescription] = useState("");

  const [previewArticle, setPreviewArticle] = useState<CBLArticle | null>(null);
  const [searchQueryTable, setSearchQueryTable] = useState("");
  const [showDeletePDFModal, setShowDeletePDFModal] = useState(false);
  const [showDeleteArticleModal, setShowDeleteArticleModal] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<string>("number-asc");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({});
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const hasUnsavedGeneralInfoChanges =
    title !== (governanceDoc?.title || "") ||
    generalDescription !== (governanceDoc?.general_description || "");

  const isPublishButtonDisabled = (section?.status === "published") && !hasUnsavedGeneralInfoChanges;


  // ── DATA LOADING ─────────────────────────────────────────────────────────

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [secRes, govRes, artRes] = await Promise.all([
        api.get("/about-page/sections/cbl_information"),
        api.get("/about-page/cbl/governance"),
        api.get("/about-page/cbl/articles"),
      ]);
      if (secRes.success && secRes.data) setSection(secRes.data as Section);
      if (govRes.success && govRes.data) {
        const doc = govRes.data as GovernanceDoc;
        setGovernanceDoc(doc);
        setTitle(doc.title);
        setGeneralDescription(doc.general_description);
      }
      if (artRes.success && artRes.data) setArticles(artRes.data as CBLArticle[]);
    } catch (err) {
      console.error("Failed to load CBL data:", err);
      gooeyToast.error("Failed to load Constitution and By-Laws data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const isOverlayOpen =
    isDrawerOpen ||
    !!previewArticle ||
    !!showDeleteArticleModal ||
    showDeletePDFModal ||
    showBulkDeleteModal ||
    showPublishModal;

  useEffect(() => {
    if (!isOverlayOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOverlayOpen]);

  // ── GENERAL INFO SAVE ────────────────────────────────────────────────────

  const handleSaveGeneralInfo = async () => {
    try {
      setIsSaving(true);
      if (governanceDoc?.id) {
        const res = await api.patch(`/about-page/cbl/governance/${governanceDoc.id}`, {
          title, general_description: generalDescription,
        });
        if (res.success) {
          setGovernanceDoc(res.data);
          gooeyToast.success("General information saved successfully!");
        }
      } else {
        const res = await api.post("/about-page/cbl/governance", {
          title: title || "Constitution and By-Laws",
          general_description: generalDescription || "",
        });
        if (res.success) {
          setGovernanceDoc(res.data);
          gooeyToast.success("General information saved successfully!");
        }
      }
    } catch (err) {
      console.error("Save general info failed:", err);
      gooeyToast.error("Failed to save general information.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── ARTICLE OPERATIONS ───────────────────────────────────────────────────

  const handleOpenCreateDrawer = () => {
    setSelectedArticleId(null);
    setArticleNumber(""); setArticleName(""); setArticleDescription("");
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (art: CBLArticle) => {
    setSelectedArticleId(art.id);
    setArticleNumber(art.article_number); setArticleName(art.article_name);
    setArticleDescription(art.article_description);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => setIsDrawerOpen(false);


  const handleSaveArticle = async () => {
    if (!articleNumber.trim() || !articleName.trim() || !articleDescription.replace(/<[^>]*>/g, "").trim()) {
      gooeyToast.error("Article Number, Name, and Description are required.");
      return;
    }
    try {
      setIsSaving(true);
      if (selectedArticleId) {
        const res = await api.patch(`/about-page/cbl/articles/${selectedArticleId}`, {
          article_number: articleNumber, article_name: articleName, article_description: articleDescription,
        });
        if (res.success) {
          setArticles((prev) => prev.map((a) => a.id === selectedArticleId ? res.data : a).sort((a, b) => a.sort_order - b.sort_order));
          gooeyToast.success("Article updated successfully!");
          handleCloseDrawer();
        }
      } else {
        const res = await api.post("/about-page/cbl/articles", {
          article_number: articleNumber, article_name: articleName, article_description: articleDescription,
        });
        if (res.success) {
          setArticles((prev) => [...prev, res.data].sort((a, b) => a.sort_order - b.sort_order));
          gooeyToast.success("Article created successfully!");
          handleCloseDrawer();
        }
      }
    } catch (err: any) {
      gooeyToast.error(err.message || "Failed to save article.");
    } finally { setIsSaving(false); }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      setIsSaving(true);
      const res = await api.delete(`/about-page/cbl/articles/${id}`);
      if (res.success) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        if (selectedArticleId === id) handleCloseDrawer();
        setShowDeleteArticleModal(null);
        gooeyToast.success("Article deleted successfully!");
      }
    } catch (err: any) {
      gooeyToast.error("Failed to delete article.");
    } finally { setIsSaving(false); }
  };

  // ── PDF OPERATIONS ───────────────────────────────────────────────────────

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const file = files[0];
    if (file.type !== "application/pdf") { gooeyToast.error("Only PDF files are allowed."); return; }
    if (file.size > 10 * 1024 * 1024) { gooeyToast.error("File size exceeds 10MB."); return; }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      let res;
      if (governanceDoc?.id) {
        res = await api.patchMultipart(`/about-page/cbl/governance/${governanceDoc.id}`, formData);
      } else {
        formData.append("title", title || "Constitution and By-Laws");
        formData.append("general_description", generalDescription || "");
        res = await api.postMultipart("/about-page/cbl/governance", formData);
      }
      if (res.success) { setGovernanceDoc(res.data); gooeyToast.success("Governance PDF linked successfully!"); }
    } catch (err: any) {
      gooeyToast.error("Failed to upload governance document PDF.");
    } finally { setIsUploading(false); }
  };

  const handleDeletePDF = async () => {
    if (!governanceDoc?.id) return;
    try {
      setIsUploading(true);
      const res = await api.patch(`/about-page/cbl/governance/${governanceDoc.id}`, { removeFile: true });
      if (res.success) {
        setGovernanceDoc(res.data);
        gooeyToast.success("PDF removed.");
        setShowDeletePDFModal(false);
      }
    } catch {
      gooeyToast.error("Failed to remove PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  // ── PUBLISH ──────────────────────────────────────────────────────────────

  const handlePublishToggle = async (publish: boolean) => {
    setIsSaving(true);
    try {
      if (title.trim() === "" || generalDescription.replace(/<[^>]*>/g, "").trim() === "") {
        gooeyToast.error("CBL Title and General Description are required.");
        setIsSaving(false);
        return;
      }

      if (hasUnsavedGeneralInfoChanges) {
        let res;
        if (governanceDoc?.id) {
          res = await api.patch(`/about-page/cbl/governance/${governanceDoc.id}`, {
            title, general_description: generalDescription,
          });
        } else {
          res = await api.post("/about-page/cbl/governance", {
            title: title || "Constitution and By-Laws",
            general_description: generalDescription || "",
          });
        }
        if (!res.success) {
          throw new Error("Failed to save general information.");
        }
        setGovernanceDoc(res.data);
      }

      const endpoint = `/about-page/sections/cbl_information/${publish ? "publish" : "unpublish"}`;
      const res = await api.post(endpoint, {});
      if (res.success) {
        setSection(res.data);
        gooeyToast.success(publish ? "CBL content published!" : "Saved as draft.");
        router.push("/admin-dashboard/about-page");
      }
    } catch (err: any) {
      console.error("Failed to update status:", err);
      gooeyToast.error(err.message || "Failed to update publication status.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── HELPERS ──────────────────────────────────────────────────────────────

  const formatFileSize = (bytes?: number) => !bytes ? "—" : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  const formatDate = (dateStr?: string) => !dateStr ? "—" :
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  const getArticleVersion = (art: CBLArticle) => {
    const date = new Date(art.updated_at);
    const major = 1;
    const minor = (date.getMonth() + date.getDate()) % 10;
    return `v${major}.${minor}`;
  };

  const filteredArticles = articles
    .filter((a) => {
      const matchSearch =
        a.article_number.toLowerCase().includes(searchQueryTable.toLowerCase()) ||
        a.article_name.toLowerCase().includes(searchQueryTable.toLowerCase());

      if (!matchSearch) return false;

      if (filterBy === "recent") {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return new Date(a.updated_at).getTime() > thirtyDaysAgo;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "number-asc") {
        return a.sort_order - b.sort_order;
      }
      if (sortBy === "number-desc") {
        return b.sort_order - a.sort_order;
      }
      if (sortBy === "name-asc") {
        return a.article_name.localeCompare(b.article_name);
      }
      if (sortBy === "updated-desc") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      return 0;
    });

  // ── LOADING ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <AdminSidebarLayout pageClassName="admin-dashboard" mainClassName="admin-main"
        title="Constitution & By-Laws" subtitle="Loading CBL Configurations...">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 0" }}>
          <Loader2 className="animate-spin" size={40} style={{ color: T.blue }} />
        </div>
      </AdminSidebarLayout>
    );
  }

  // ── SHARED STYLE HELPERS ─────────────────────────────────────────────────

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: T.fs_sm,
    fontWeight: 600,
    color: "var(--r-text-mid)",
    marginBottom: 7,
    letterSpacing: "0.01em",
    fontFamily: "var(--font-body)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: T.inputH,
    padding: "0 14px",
    border: "1px solid var(--r-border-mid)",
    borderRadius: 12,
    fontSize: T.fs_base,
    color: "var(--r-text)",
    outline: "none",
    boxSizing: "border-box",
    background: "var(--r-surface)",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "var(--font-body)",
  };

  const primaryBtn: React.CSSProperties = {
    height: T.btnH,
    padding: "0 22px",
    borderRadius: 12,
    fontSize: T.fs_base,
    fontWeight: 600,
    color: "var(--p-white)",
    background: "var(--p-blue)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    whiteSpace: "nowrap",
    letterSpacing: "0.01em",
    fontFamily: "var(--font-body)",
  };

  const secondaryBtn: React.CSSProperties = {
    height: T.btnH,
    padding: "0 18px",
    borderRadius: 12,
    fontSize: T.fs_base,
    fontWeight: 600,
    color: "var(--r-text-mid)",
    background: "var(--r-surface-2)",
    border: "1px solid var(--r-border-mid)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    whiteSpace: "nowrap",
    fontFamily: "var(--font-body)",
  };

  const dangerBtn: React.CSSProperties = {
    height: T.btnH,
    padding: "0 18px",
    borderRadius: 12,
    fontSize: T.fs_base,
    fontWeight: 600,
    color: "var(--p-rose)",
    background: "var(--p-rose-pale)",
    border: "1px solid var(--p-rose-pale)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    whiteSpace: "nowrap",
    fontFamily: "var(--font-body)",
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--r-surface)",
    border: "1px solid var(--r-border)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(20, 49, 82, 0.02)",
  };

  const cardHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 24px",
    borderBottom: "1px solid var(--r-border)",
    background: "var(--r-surface)",
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: T.fs_md,
    fontWeight: 600,
    color: "var(--p-navy)",
    margin: 0,
    fontFamily: "var(--font-body)",
  };

  // ── MAIN RENDER ──────────────────────────────────────────────────────────

  return (
    <AdminSidebarLayout
      pageClassName="admin-dashboard"
      mainClassName="admin-main"
      title="CBL Information"
      subtitle="Constitution & By-Laws content management"
      eyebrow="Content Manager"
    >
      {/* ── STICKY HEADER ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "#ffffff",
          borderBottom: `1px solid ${T.slate200}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            padding: "10px 20px",
            minHeight: 56,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12, flexWrap: "wrap",
          }}
        >
          {/* Back + Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", rowGap: 8 }}>
            <button
              type="button"
              onClick={() => router.push("/admin-dashboard/about-page")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                color: T.slate500, fontSize: T.fs_sm, fontWeight: 600,
                background: "none", border: "none", cursor: "pointer",
                padding: "8px 4px", minHeight: 44, /* touch target */
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>

            {/* Compact Tabs */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap",
                background: "var(--r-surface-2)",
                border: "1px solid var(--r-border)",
                borderRadius: 12, padding: 4,
              }}
            >
              {(["process", "governance"] as const).map((tab) => {
                const labels = { process: "Process Info", governance: "Governance Doc" };
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      height: 44, /* ≥44px touch target */
                      padding: "0 16px",
                      borderRadius: 9,
                      fontSize: T.fs_sm,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--p-navy)" : "var(--r-text-muted)",
                      background: isActive ? "var(--r-surface)" : "transparent",
                      border: isActive ? "1px solid var(--r-border-mid)" : "1px solid transparent",
                      cursor: "pointer",
                      boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                      fontFamily: "var(--font-body)",
                      transition: "all 0.15s", whiteSpace: "nowrap",
                    }}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={isSaving || isPublishButtonDisabled}
              onClick={() => setShowPublishModal(true)}
              style={{
                ...primaryBtn,
                height: T.btnH, /* use full btnH = 48px for touch target compliance */
                fontSize: T.fs_sm,
                padding: "0 18px",
                borderRadius: 8,
                background: (isSaving || isPublishButtonDisabled) ? "#4a7098" : T.blue,
                opacity: (isSaving || isPublishButtonDisabled) ? 0.5 : 1,
                cursor: (isSaving || isPublishButtonDisabled) ? "not-allowed" : "pointer",
              }}
            >
              <Globe size={15} /> Publish Changes
            </button>
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ─────────────────────────────────────────────────── */}
      <div style={{ padding: "28px 28px 80px" }}>



        {/* ── PROCESS INFORMATION TAB ──────────────────────────────────────── */}
        {activeTab === "process" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* SECTION 1 — General Information */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: T.accentBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FileText size={16} color={T.accent} />
                  </div>
                  <h3 style={cardTitleStyle}>General Information</h3>
                </div>
                <span
                  style={{
                    fontSize: T.fs_xs,
                    fontWeight: 600,
                    color: T.accent,
                    background: T.accentBg,
                    padding: "4px 10px",
                    borderRadius: 20,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "flex", alignItems: "center", gap: 5,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, display: "inline-block" }} />
                  Preamble
                </span>
              </div>

              <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* CBL Title */}
                <div>
                  <label style={labelStyle}>CBL Title <span style={{ color: T.red }}>*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Constitution and By-Laws"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* General Description */}
                <div>
                  <label style={labelStyle}>General Description <span style={{ color: T.red }}>*</span></label>
                  <RichTextEditor
                    value={generalDescription}
                    onChange={(val) => setGeneralDescription(val)}
                    placeholder="Write the preamble narrative details..."
                    minHeight="130px"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2 — Articles Registry */}
            <div style={cardStyle}>
              {/* Card Title Header */}
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "18px 24px 14px",
                  borderBottom: `1px solid ${T.slate100}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FileText size={16} color={T.accent} />
                  </div>
                  <div>
                    <h3 style={{ ...cardTitleStyle, margin: 0 }}>Articles</h3>
                    <span style={{ fontSize: T.fs_xs, color: T.slate500 }}>
                      {filteredArticles.length} of {articles.length} article{articles.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                {/* Search + Sort + Filter + New Article */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  {/* Search input */}
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      height: 48,
                      padding: "0 14px",
                      border: `1.5px solid ${T.slate200}`,
                      borderRadius: 10,
                      background: T.white,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    }}
                  >
                    <Search size={16} color={T.slate500} />
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQueryTable}
                      onChange={(e) => setSearchQueryTable(e.target.value)}
                      style={{
                        width: 180, fontSize: T.fs_base,
                        color: T.slate900, border: "none", outline: "none", background: "transparent",
                        fontFamily: "var(--font-body)",
                      }}
                    />
                    {searchQueryTable && (
                      <button
                        type="button"
                        onClick={() => setSearchQueryTable("")}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: T.slate500, borderRadius: 4 }}
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Filter select */}
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    style={{
                      height: 48,
                      padding: "0 12px",
                      borderRadius: 10,
                      border: `1.5px solid ${T.slate200}`,
                      background: T.white,
                      fontSize: T.fs_sm,
                      color: T.slate700,
                      fontWeight: 600,
                      fontFamily: "var(--font-body)",
                      cursor: "pointer",
                      outline: "none",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    }}
                  >
                    <option value="all">All Articles</option>
                    <option value="recent">Updated (Last 30 Days)</option>
                  </select>

                  {/* Sort select */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      height: 48,
                      padding: "0 12px",
                      borderRadius: 10,
                      border: `1.5px solid ${T.slate200}`,
                      background: T.white,
                      fontSize: T.fs_sm,
                      color: T.slate700,
                      fontWeight: 600,
                      fontFamily: "var(--font-body)",
                      cursor: "pointer",
                      outline: "none",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    }}
                  >
                    <option value="number-asc">Article Number (Asc)</option>
                    <option value="number-desc">Article Number (Desc)</option>
                    <option value="name-asc">Article Name (A-Z)</option>
                    <option value="updated-desc">Recently Updated</option>
                  </select>

                  <button type="button" onClick={handleOpenCreateDrawer} style={{ ...primaryBtn, height: 48 }}>
                    <Plus size={18} /> New Article
                  </button>
                </div>
              </div>

              {/* Article Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f4f7fb", borderBottom: `1px solid ${T.slate100}` }}>
                      {/* Checkbox Header */}
                      <th style={{ width: "5%", padding: "13px 24px" }}>
                        <input
                          type="checkbox"
                          style={{ width: 24, height: 24, cursor: "pointer" }}
                          checked={filteredArticles.length > 0 && selectedArticleIds.length === filteredArticles.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedArticleIds(filteredArticles.map(a => a.id));
                            } else {
                              setSelectedArticleIds([]);
                            }
                          }}
                        />
                      </th>
                      {[
                        { label: "Article Number", w: "22%" },
                        { label: "Article Name", w: "auto" },
                        { label: "Updated", w: "18%" },
                        { label: "Actions", w: "14%", right: true },
                      ].map((col) => (
                        <th
                          key={col.label}
                          style={{
                            padding: "13px 24px",
                            textAlign: col.right ? "right" : "left",
                            fontWeight: 600,
                            color: T.slate600,
                            fontSize: T.fs_sm,
                            width: col.w,
                            letterSpacing: "0.01em",
                          }}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.map((art, idx) => {
                      const isExpanded = !!expandedArticles[art.id];
                      const isSelected = selectedArticleIds.includes(art.id);
                      return (
                        <>
                          <tr
                            key={art.id}
                            onClick={(e) => {
                              const target = e.target as HTMLElement;
                              if (target.closest("button") || target.closest("input[type='checkbox']") || target.closest("a")) {
                                return;
                              }
                              setExpandedArticles(prev => ({ ...prev, [art.id]: !prev[art.id] }));
                            }}
                            style={{
                              borderBottom: `1px solid ${T.slate100}`,
                              background: isSelected ? "var(--p-blue-pale)" : idx % 2 === 0 ? T.white : "#fafcff",
                              transition: "background 0.12s",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                (e.currentTarget as HTMLTableRowElement).style.background = "#eef4fb";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? T.white : "#fafcff";
                              }
                            }}
                          >
                            {/* Checkbox cell */}
                            <td style={{ padding: "14px 24px" }}>
                              <input
                                type="checkbox"
                                style={{ width: 24, height: 24, cursor: "pointer" }}
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedArticleIds(prev => [...prev, art.id]);
                                  } else {
                                    setSelectedArticleIds(prev => prev.filter(id => id !== art.id));
                                  }
                                }}
                              />
                            </td>
                            {/* Number + Badge */}
                            <td style={{ padding: "14px 24px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{
                                  width: 26, height: 26, borderRadius: "50%",
                                  background: T.accentBg, color: T.accent,
                                  fontSize: T.fs_xs, fontWeight: 600,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  flexShrink: 0,
                                }}>
                                  {idx + 1}
                                </span>
                                <span style={{ fontWeight: 600, color: T.blue, fontSize: T.fs_base }}>{art.article_number}</span>
                                <span
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "var(--p-blue)",
                                    background: "var(--p-blue-pale)",
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    marginLeft: 6,
                                  }}
                                >
                                  {getArticleVersion(art)}
                                </span>
                              </div>
                            </td>
                            {/* Name */}
                            <td style={{ padding: "14px 24px", color: T.slate700, fontWeight: 600, fontSize: T.fs_base }}>
                              {art.article_name}
                            </td>
                            {/* Updated */}
                            <td style={{ padding: "14px 24px", color: T.slate500, fontSize: T.fs_sm }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <Calendar size={13} color={T.slate500} />
                                {formatDate(art.updated_at)}
                              </div>
                            </td>
                            {/* Actions */}
                            <td style={{ padding: "12px 20px", textAlign: "right" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                {/* Expand preview */}
                                <button
                                  type="button"
                                  title={isExpanded ? "Collapse inline preview" : "Expand inline preview"}
                                  onClick={() => setExpandedArticles(prev => ({ ...prev, [art.id]: !prev[art.id] }))}
                                  style={{
                                    width: 44, height: 44, borderRadius: 8,
                                    border: `1.5px solid ${T.slate200}`,
                                    background: isExpanded ? "var(--p-blue-pale)" : T.white,
                                    cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: isExpanded ? "var(--p-blue)" : T.slate500, flexShrink: 0,
                                  }}
                                >
                                  <Info size={16} />
                                </button>
                                {/* View */}
                                <button
                                  type="button" title="View article"
                                  onClick={() => setPreviewArticle(art)}
                                  style={{
                                    width: 44, height: 44, borderRadius: 8,
                                    border: `1.5px solid ${T.slate200}`,
                                    background: T.white, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: T.slate500, flexShrink: 0,
                                  }}
                                >
                                  <Eye size={16} />
                                </button>
                                {/* Edit */}
                                <button
                                  type="button" title="Edit article"
                                  onClick={() => handleOpenEditDrawer(art)}
                                  style={{
                                    width: 44, height: 44, borderRadius: 8,
                                    border: `1.5px solid #bfdbfe`,
                                    background: "#eff6ff", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: T.accent, flexShrink: 0,
                                  }}
                                >
                                  <Edit size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {/* Expanded inline preview row */}
                          {isExpanded && (
                            <tr style={{ background: "var(--r-surface-2)" }}>
                              <td colSpan={5} style={{ padding: "16px 24px", borderBottom: `1px solid ${T.slate100}` }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  <span style={{ fontSize: T.fs_xs, fontWeight: 700, color: "var(--p-blue)" }}>
                                    INLINE PREVIEW:
                                  </span>
                                  <div
                                    style={{
                                      fontSize: T.fs_sm,
                                      color: "var(--r-text-mid)",
                                      lineHeight: 1.7,
                                      background: "var(--r-surface)",
                                      border: "1px solid var(--r-border-mid)",
                                      borderRadius: 12,
                                      padding: "16px 20px",
                                      fontFamily: "var(--font-body)",
                                      maxHeight: 200,
                                      overflowY: "auto",
                                    }}
                                    dangerouslySetInnerHTML={{ __html: art.article_description }}
                                  />
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                    {filteredArticles.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: "64px 24px", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
                            <div style={{ width: 64, height: 64, borderRadius: "50%", background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent }}>
                              <FileText size={32} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: T.fs_md, fontWeight: 700, color: "var(--p-navy)", margin: "0 0 6px" }}>
                                {searchQueryTable ? "No matching articles found" : "No articles registered yet"}
                              </h4>
                              <p style={{ fontSize: T.fs_sm, color: "var(--r-text-muted)", margin: 0, maxWidth: 360, marginInline: "auto" }}>
                                {searchQueryTable 
                                  ? `We couldn't find any articles matching "${searchQueryTable}". Try adjusting your keywords.` 
                                  : "Get started by adding the first article of your Constitution & By-Laws."}
                              </p>
                            </div>
                            {!searchQueryTable && (
                              <button
                                type="button"
                                onClick={handleOpenCreateDrawer}
                                style={{ ...primaryBtn, height: 48, padding: "0 18px", fontSize: T.fs_sm }}
                              >
                                <Plus size={16} /> Add First Article
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer count */}
              {filteredArticles.length > 0 && (
                <div
                  style={{
                    padding: "10px 24px",
                    borderTop: `1px solid ${T.slate100}`,
                    fontSize: T.fs_sm,
                    color: T.slate500,
                    background: T.slate50,
                  }}
                >
                  Showing {filteredArticles.length} of {articles.length} article{articles.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── GOVERNANCE DOCUMENT TAB ───────────────────────────────────────── */}
        {activeTab === "governance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Preamble Preview */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 12,
                    background: "var(--p-blue-pale)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FileText size={16} color="var(--p-blue)" />
                  </div>
                  <h3 style={cardTitleStyle}>Preamble Sync Preview</h3>
                </div>
              </div>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <span style={{ fontSize: T.fs_xs, fontWeight: 500, color: "var(--r-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-body)" }}>CBL Title</span>
                  <p style={{ fontSize: T.fs_base, fontWeight: 600, color: "var(--r-text)", margin: "6px 0 0", fontFamily: "var(--font-body)" }}>{title || "—"}</p>
                </div>
                <div>
                  <span style={{ fontSize: T.fs_xs, fontWeight: 500, color: "var(--r-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-body)" }}>General Description</span>
                  <div
                    style={{
                      fontSize: T.fs_base, color: "var(--r-text-mid)", marginTop: 8,
                      border: "1px solid var(--r-border-mid)", background: "var(--r-surface-2)",
                      borderRadius: 12, padding: "12px 16px", maxHeight: 180, overflowY: "auto", lineHeight: 1.7,
                      fontFamily: "var(--font-body)",
                    }}
                    dangerouslySetInnerHTML={{ __html: generalDescription || "Preamble content empty." }}
                  />
                </div>
              </div>
            </div>

            {/* Governance PDF */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 12,
                    background: "var(--p-blue-pale)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FileText size={16} color="var(--p-blue)" />
                  </div>
                  <h3 style={cardTitleStyle}>Governance PDF Document</h3>
                </div>
                <Info size={17} color="var(--r-text-muted)" />
              </div>
              <div style={{ padding: "24px" }}>
                {!governanceDoc?.file_url ? (
                  <label
                    style={{
                      border: "2px dashed var(--r-border-mid)",
                      borderRadius: 16, padding: "50px 24px",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", cursor: "pointer", textAlign: "center",
                      background: "var(--r-surface-2)",
                    }}
                  >
                    {isUploading ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <Loader2 className="animate-spin" size={32} style={{ color: "var(--p-blue)" }} />
                        <p style={{ fontSize: T.fs_base, fontWeight: 600, color: "var(--r-text-mid)", margin: 0, fontFamily: "var(--font-body)" }}>Uploading file, please wait...</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ width: 56, height: 56, background: "var(--p-blue-pale)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                          <Upload size={24} color="var(--p-blue)" />
                        </div>
                        <p style={{ fontSize: T.fs_lg, fontWeight: 600, color: "var(--p-navy)", margin: "0 0 6px", fontFamily: "var(--font-body)" }}>Drop PDF here or click to upload</p>
                        <p style={{ fontSize: T.fs_sm, color: "var(--r-text-muted)", margin: "0 0 16px", fontFamily: "var(--font-body)" }}>Only PDF documents are supported. Maximum size: 10 MB.</p>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 7,
                          padding: "0 18px", height: T.btnHSm,
                          background: "var(--p-blue)", color: "var(--p-white)",
                          borderRadius: 12, fontSize: T.fs_sm, fontWeight: 600,
                          fontFamily: "var(--font-body)",
                          pointerEvents: "none",
                        }}>
                          <Upload size={14} /> Choose PDF file
                        </span>
                      </>
                    )}
                    <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                ) : (
                  <div style={{ border: "1px solid var(--r-border-mid)", borderRadius: 12, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 52, height: 52, background: "var(--p-rose-pale)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <FileText size={24} color="var(--p-rose)" />
                        </div>
                        <div>
                          <p style={{ fontSize: T.fs_base, fontWeight: 600, color: "var(--r-text)", margin: 0, fontFamily: "var(--font-body)" }}>{governanceDoc.file_name}</p>
                          <p style={{ fontSize: T.fs_sm, color: "var(--r-text-muted)", margin: "3px 0 0", fontFamily: "var(--font-body)" }}>
                            {formatFileSize(governanceDoc.file_size)} · Uploaded {formatDate(governanceDoc.created_at)}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <a
                          href={governanceDoc.file_url} target="_blank" rel="noreferrer"
                          style={{ ...secondaryBtn, textDecoration: "none", height: T.btnHSm, fontSize: T.fs_sm }}
                        >
                          Preview File
                        </a>
                        <label style={{ ...secondaryBtn, height: T.btnHSm, fontSize: T.fs_sm, cursor: "pointer" }}>
                          Replace
                          <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileUpload} disabled={isUploading} />
                        </label>
                        <button type="button" onClick={() => setShowDeletePDFModal(true)} disabled={isUploading}
                          style={{ ...dangerBtn, height: T.btnHSm, fontSize: T.fs_sm }}>
                          <Trash size={15} /> Remove
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14, marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--r-border)" }}>
                      {[
                        { label: "Uploaded By", value: governanceDoc.uploaded_by || "—" },
                        { label: "Upload Date", value: formatDate(governanceDoc.created_at) },
                        { label: "Last Modified", value: formatDate(governanceDoc.updated_at) },
                        { label: "Link Status", value: "Active PDF", icon: <Check size={13} color="var(--p-emerald)" /> },
                      ].map((meta) => (
                        <div key={meta.label}>
                          <span style={{ fontSize: T.fs_xs, fontWeight: 500, color: "var(--r-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", fontFamily: "var(--font-body)" }}>
                            {meta.label}
                          </span>
                          <span style={{ fontSize: T.fs_sm, fontWeight: 600, color: "var(--r-text-mid)", display: "flex", alignItems: "center", gap: 4, marginTop: 5, fontFamily: "var(--font-body)" }}>
                            {meta.icon} {meta.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SLIDE-OVER DRAWER ─────────────────────────────────────────────── */}

      {isDrawerOpen && (
        <div
          onClick={handleCloseDrawer}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
            zIndex: 40,
          }}
        />
      )}

      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "100%", maxWidth: 650,
          background: T.white,
          boxShadow: "-6px 0 40px rgba(0,0,0,0.14)",
          zIndex: 50,
          display: "flex", flexDirection: "column",
          transform: isDrawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "0 24px", height: 68,
            borderBottom: `1px solid ${T.slate100}`,
            background: T.slate50, flexShrink: 0,
          }}
        >
          <div>
            <h3 style={{ fontSize: T.fs_lg, fontWeight: 600, color: T.blue, margin: 0 }}>
              {selectedArticleId ? "Edit Article" : "New Article"}
            </h3>
            <p style={{ fontSize: T.fs_sm, color: T.slate500, margin: "3px 0 0" }}>
              Fill in the constitutional article details
            </p>
          </div>
          <button
            type="button" onClick={handleCloseDrawer}
            style={{
              width: 38, height: 38, borderRadius: 8,
              border: `1.5px solid ${T.slate200}`,
              background: T.white, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: T.slate500,
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Drawer Form */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            {/* Article Number */}
            <div>
              <label style={labelStyle}>
                Article Number <span style={{ color: T.red }}>*</span>
              </label>
              {!selectedArticleId ? (
                /* ── CREATE MODE: plain text input ── */
                <>
                  <input
                    type="text"
                    placeholder="e.g. Article I, Article V, Article XII..."
                    value={articleNumber}
                    onChange={(e) => setArticleNumber(e.target.value)}
                    autoFocus
                    style={inputStyle}
                  />
                  <p style={{ margin: "7px 0 0", fontSize: T.fs_xs, color: T.slate500, lineHeight: 1.5 }}>
                    Enter a unique article identifier. Use Roman numerals or a custom label (e.g. Article I, Article II).
                  </p>
                </>
              ) : (
                /* ── EDIT MODE: editable input showing current number ── */
                <>
                  <input
                    type="text"
                    value={articleNumber}
                    onChange={(e) => setArticleNumber(e.target.value)}
                    style={{
                      ...inputStyle,
                      background: "var(--r-surface-2)",
                      fontWeight: 600,
                      color: T.blue,
                    }}
                  />
                  <p style={{ margin: "7px 0 0", fontSize: T.fs_xs, color: T.slate500, lineHeight: 1.5 }}>
                    You may rename the article number. Changes take effect when you save.
                  </p>
                </>
              )}
            </div>

            {/* Article Name */}
            <div>
              <label style={labelStyle}>Article Name <span style={{ color: T.red }}>*</span></label>
              <input
                type="text"
                placeholder="e.g. Purposes and Objectives"
                value={articleName}
                onChange={(e) => setArticleName(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Article Description */}
            <div>
              <label style={labelStyle}>Article Description <span style={{ color: T.red }}>*</span></label>
              <RichTextEditor
                value={articleDescription}
                onChange={(val) => setArticleDescription(val)}
                placeholder="Type the items, sections, and descriptions of this article..."
                minHeight="280px"
              />
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: `1px solid ${T.slate100}`,
            background: T.slate50, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 10, flexWrap: "wrap", rowGap: 10,
          }}
        >
          {/* Left: Delete */}
          <div>
            {selectedArticleId && (
              <button type="button" disabled={isSaving}
                onClick={() => setShowDeleteArticleModal(selectedArticleId)}
                style={dangerBtn}
              >
                <Trash size={16} /> Delete Article
              </button>
            )}
          </div>

          {/* Right: Cancel + Save */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={handleCloseDrawer} style={secondaryBtn}>
              Cancel
            </button>
            <button type="button" onClick={handleSaveArticle} disabled={isSaving}
              style={{ ...primaryBtn, background: isSaving ? "#4a7098" : T.blue }}>
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              Save Article
            </button>
          </div>
        </div>
      </div>

      {/* ── READ-ONLY PREVIEW MODAL ───────────────────────────────────────── */}

      {previewArticle && (
        <>
          <div
            onClick={() => setPreviewArticle(null)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(3px)",
              zIndex: 55,
            }}
          />
          <div
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              width: "92%", maxWidth: 560,
              background: T.white,
              border: `1px solid ${T.slate200}`,
              borderRadius: 16,
              boxShadow: "0 24px 70px rgba(0,0,0,0.18)",
              zIndex: 60,
              display: "flex", flexDirection: "column",
              maxHeight: "82vh", overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "18px 24px",
                borderBottom: `1px solid ${T.slate100}`,
                background: T.slate50,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: T.fs_xs, fontWeight: 600, color: T.slate500,
                    background: T.slate200, padding: "3px 8px", borderRadius: 4,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    display: "inline-block", marginBottom: 6,
                  }}
                >
                  Article Preview
                </span>
                <h3 style={{ fontSize: T.fs_lg, fontWeight: 600, color: T.blue, margin: 0 }}>
                  {previewArticle.article_number}: {previewArticle.article_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewArticle(null)}
                style={{
                  width: 38, height: 38, borderRadius: 8,
                  border: `1.5px solid ${T.slate200}`,
                  background: T.white, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", color: T.slate500,
                }}
              >
                <X size={17} />
              </button>
            </div>
            <div
              style={{ padding: "22px 24px", overflowY: "auto", fontSize: T.fs_base, lineHeight: 1.8, color: T.slate700 }}
              dangerouslySetInnerHTML={{ __html: previewArticle.article_description }}
            />
            <div
              style={{
                padding: "14px 24px",
                borderTop: `1px solid ${T.slate100}`,
                background: T.slate50,
                display: "flex", justifyContent: "flex-end", gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => { setPreviewArticle(null); handleOpenEditDrawer(previewArticle); }}
                style={{ ...secondaryBtn, color: T.accent, border: `1.5px solid #bfdbfe`, background: T.accentBg }}
              >
                <Edit size={16} /> Edit Article
              </button>
              <button type="button" onClick={() => setPreviewArticle(null)} style={secondaryBtn}>
                Close
              </button>
            </div>
          </div>
        </>
      )}
      {/* ── CUSTOM CONFIRM DELETE ARTICLE MODAL ──────────────────────────────── */}
      {showDeleteArticleModal && (
        <>
          <div
            onClick={() => !isSaving && setShowDeleteArticleModal(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 55,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "90%",
              maxWidth: 440,
              background: T.white,
              border: `1.5px solid ${T.slate200}`,
              borderRadius: 20,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              zIndex: 60,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div style={{ padding: "28px 28px 16px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--p-rose-pale)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--p-rose)",
                  marginBottom: 16,
                }}
              >
                <AlertTriangle size={26} />
              </div>
              <h3 style={{ fontSize: T.fs_lg, fontWeight: 600, color: "var(--p-navy)", margin: "0 0 8px", fontFamily: "var(--font-body)" }}>
                Remove CBL Article
              </h3>
              <p style={{ fontSize: T.fs_base, color: "var(--r-text-muted)", margin: 0, lineHeight: 1.5, fontFamily: "var(--font-body)" }}>
                Are you sure you want to delete this article? This action cannot be undone.
              </p>
            </div>

            {(() => {
              const art = articles.find((a) => a.id === showDeleteArticleModal);
              if (!art) return null;
              return (
                <div style={{ padding: "0 28px" }}>
                  <div
                    style={{
                      background: "var(--r-surface-2)",
                      border: "1px solid var(--r-border-mid)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <FileText size={20} color="var(--p-rose)" style={{ flexShrink: 0 }} />
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>
                      <div style={{ fontSize: T.fs_sm, fontWeight: 600, color: "var(--r-text)", fontFamily: "var(--font-body)" }}>
                        {art.article_number}
                      </div>
                      <div style={{ fontSize: T.fs_xs, color: "var(--r-text-muted)", marginTop: 2, fontFamily: "var(--font-body)" }}>
                        {art.article_name}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div
              style={{
                padding: "24px 28px 28px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={() => setShowDeleteArticleModal(null)}
                disabled={isSaving}
                style={{
                  ...secondaryBtn,
                  justifyContent: "center",
                  height: 44,
                  fontSize: T.fs_base,
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteArticle(showDeleteArticleModal)}
                disabled={isSaving}
                style={{
                  ...dangerBtn,
                  justifyContent: "center",
                  height: 44,
                  fontSize: T.fs_base,
                  fontWeight: 600,
                  background: isSaving ? "var(--p-rose-pale)" : "var(--p-rose)",
                  color: "var(--p-white)",
                  border: "none",
                }}
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : "Remove Article"}
              </button>
            </div>
          </div>
        </>
      )}


      {/* ── CUSTOM CONFIRM DELETE PDF MODAL ─────────────────────────────────── */}
      {showDeletePDFModal && (
        <>
          <div
            onClick={() => !isUploading && setShowDeletePDFModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 55,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: "90%",
              maxWidth: 440,
              background: "var(--r-surface)",
              border: "1px solid var(--r-border-mid)",
              borderRadius: 20,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              zIndex: 60,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <style>{`
              @keyframes modalFadeIn {
                from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              }
            `}</style>
            
            <div style={{ padding: "28px 28px 16px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--p-rose-pale)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--p-rose)",
                  marginBottom: 16,
                }}
              >
                <AlertTriangle size={26} />
              </div>
              <h3 style={{ fontSize: T.fs_lg, fontWeight: 600, color: "var(--p-navy)", margin: "0 0 8px", fontFamily: "var(--font-body)" }}>
                Remove Governance PDF
              </h3>
              <p style={{ fontSize: T.fs_base, color: "var(--r-text-muted)", margin: 0, lineHeight: 1.5, fontFamily: "var(--font-body)" }}>
                Are you sure you want to remove the governance document PDF? This action cannot be undone.
              </p>
            </div>

            {governanceDoc?.file_name && (
              <div style={{ padding: "0 28px" }}>
                <div
                  style={{
                    background: "var(--r-surface-2)",
                    border: "1px solid var(--r-border-mid)",
                    borderRadius: 12,
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <FileText size={20} color="var(--p-rose)" style={{ flexShrink: 0 }} />
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: T.fs_sm, fontWeight: 600, color: "var(--r-text)", fontFamily: "var(--font-body)" }}>
                      {governanceDoc.file_name}
                    </div>
                    <div style={{ fontSize: T.fs_xs, color: "var(--r-text-muted)", marginTop: 2, fontFamily: "var(--font-body)" }}>
                      {formatFileSize(governanceDoc.file_size)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              style={{
                padding: "24px 28px 28px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={() => setShowDeletePDFModal(false)}
                disabled={isUploading}
                style={{
                  ...secondaryBtn,
                  justifyContent: "center",
                  height: 44,
                  fontSize: T.fs_base,
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePDF}
                disabled={isUploading}
                style={{
                  ...dangerBtn,
                  justifyContent: "center",
                  height: 44,
                  fontSize: T.fs_base,
                  fontWeight: 600,
                  background: isUploading ? "var(--p-rose-pale)" : "var(--p-rose)",
                  color: "var(--p-white)",
                  border: "none",
                }}
              >
                {isUploading ? <Loader2 className="animate-spin" size={16} /> : "Remove PDF"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── FLOATING BULK ACTIONS TOOLBAR ─────────────────────────────────── */}
      {selectedArticleIds.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--p-navy)",
            color: "#ffffff",
            padding: "16px 28px",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            gap: 20,
            boxShadow: "0 10px 40px rgba(15, 23, 42, 0.35)",
            zIndex: 100,
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <style>{`
            @keyframes slideUp {
              from { transform: translate(-50%, 100px); opacity: 0; }
              to { transform: translate(-50%, 0); opacity: 1; }
            }
          `}</style>
          <span style={{ fontSize: T.fs_sm, fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap" }}>
            {selectedArticleIds.length} Article{selectedArticleIds.length > 1 ? "s" : ""} Selected
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              style={{
                ...dangerBtn,
                height: 44,
                padding: "0 18px",
                fontSize: T.fs_sm,
                background: "var(--p-rose)",
                color: "#ffffff",
                border: "none",
              }}
            >
              <Trash size={16} /> Delete Selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedArticleIds([])}
              style={{
                ...secondaryBtn,
                height: 44,
                padding: "0 18px",
                fontSize: T.fs_sm,
                color: "#ffffff",
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── BULK DELETE CONFIRMATION MODAL ────────────────────────────────── */}
      {showBulkDeleteModal && (
        <>
          <div
            onClick={() => !isSaving && setShowBulkDeleteModal(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
              zIndex: 110,
            }}
          />
          <div
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              width: "90%", maxWidth: 460,
              background: T.white, border: `1.5px solid ${T.slate200}`,
              borderRadius: 20, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              zIndex: 120, display: "flex", flexDirection: "column", overflow: "hidden",
              animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div style={{ padding: "28px 28px 16px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--p-rose-pale)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--p-rose)", marginBottom: 16 }}>
                <AlertTriangle size={26} />
              </div>
              <h3 style={{ fontSize: T.fs_lg, fontWeight: 700, color: "var(--p-navy)", margin: "0 0 8px", fontFamily: "var(--font-body)" }}>
                Delete Multiple Articles
              </h3>
              <p style={{ fontSize: T.fs_base, color: "var(--r-text-muted)", margin: 0, lineHeight: 1.5, fontFamily: "var(--font-body)" }}>
                Are you sure you want to delete the <strong>{selectedArticleIds.length}</strong> selected articles? This action is permanent and cannot be undone.
              </p>
            </div>

            <div style={{ padding: "24px 28px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isSaving}
                style={{ ...secondaryBtn, justifyContent: "center", height: 48, fontSize: T.fs_base, fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsSaving(true);
                    await Promise.all(selectedArticleIds.map(id => api.delete(`/about-page/cbl/articles/${id}`)));
                    setArticles(prev => prev.filter(art => !selectedArticleIds.includes(art.id)));
                    setSelectedArticleIds([]);
                    setShowBulkDeleteModal(false);
                    gooeyToast.success("Selected articles deleted successfully!");
                  } catch (err) {
                    gooeyToast.error("Failed to delete some articles.");
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                style={{
                  ...dangerBtn,
                  justifyContent: "center", height: 48, fontSize: T.fs_base, fontWeight: 600,
                  background: isSaving ? "var(--p-rose-pale)" : "var(--p-rose)", color: "var(--p-white)", border: "none",
                }}
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : "Delete Articles"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── PUBLISH CONFIRMATION MODAL ────────────────────────────────────── */}
      {showPublishModal && (
        <>
          <div
            onClick={() => !isSaving && setShowPublishModal(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
              zIndex: 110,
            }}
          />
          <div
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              width: "92%", maxWidth: 500,
              background: T.white, border: `1.5px solid ${T.slate200}`,
              borderRadius: 20, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              zIndex: 120, display: "flex", flexDirection: "column", overflow: "hidden",
              animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div style={{ padding: "28px 28px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent }}>
                  <Globe size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: T.fs_lg, fontWeight: 700, color: "var(--p-navy)", margin: 0, fontFamily: "var(--font-body)" }}>
                    Publish CBL Changes
                  </h3>
                  <p style={{ fontSize: T.fs_sm, color: "var(--r-text-muted)", margin: "3px 0 0", fontFamily: "var(--font-body)" }}>
                    Review a summary of changes before publishing to the public site.
                  </p>
                </div>
              </div>

              {/* Diff summary box */}
              <div
                style={{
                  border: "1px solid var(--r-border-mid)",
                  borderRadius: 12,
                  background: "var(--r-surface-2)",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: T.fs_sm }}>
                  <span style={{ color: "var(--r-text-mid)", fontWeight: 600 }}>CBL Title:</span>
                  {title !== (governanceDoc?.title || "") ? (
                    <span style={{ color: "var(--p-blue)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      Modified
                    </span>
                  ) : (
                    <span style={{ color: "var(--r-text-muted)" }}>No changes</span>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: T.fs_sm }}>
                  <span style={{ color: "var(--r-text-mid)", fontWeight: 600 }}>Preamble Narrative:</span>
                  {generalDescription !== (governanceDoc?.general_description || "") ? (
                    <span style={{ color: "var(--p-blue)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      Modified
                    </span>
                  ) : (
                    <span style={{ color: "var(--r-text-muted)" }}>No changes</span>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: T.fs_sm }}>
                  <span style={{ color: "var(--r-text-mid)", fontWeight: 600 }}>Total Articles Count:</span>
                  <span style={{ color: "var(--p-navy)", fontWeight: 700 }}>
                    {articles.length} article(s)
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: T.fs_sm }}>
                  <span style={{ color: "var(--r-text-mid)", fontWeight: 600 }}>Linked PDF Document:</span>
                  {governanceDoc?.file_name ? (
                    <span style={{ color: "var(--p-emerald)", fontWeight: 700 }}>
                      {governanceDoc.file_name} ({formatFileSize(governanceDoc.file_size)})
                    </span>
                  ) : (
                    <span style={{ color: "var(--p-rose)", fontWeight: 700 }}>
                      None uploaded
                    </span>
                  )}
                </div>
              </div>

              <p style={{ fontSize: T.fs_sm, color: "var(--r-text-muted)", margin: 0, lineHeight: 1.5, fontFamily: "var(--font-body)" }}>
                Publishing these changes makes them immediately live and visible to the public on the PAGE website.
              </p>
            </div>

            <div style={{ padding: "20px 28px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: T.slate50 }}>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                disabled={isSaving}
                style={{ ...secondaryBtn, justifyContent: "center", height: 48, fontSize: T.fs_base, fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsSaving(true);
                    if (hasUnsavedGeneralInfoChanges) {
                      let res;
                      if (governanceDoc?.id) {
                        res = await api.patch(`/about-page/cbl/governance/${governanceDoc.id}`, {
                          title, general_description: generalDescription,
                        });
                      } else {
                        res = await api.post("/about-page/cbl/governance", {
                          title: title || "Constitution and By-Laws",
                          general_description: generalDescription || "",
                        });
                      }
                      if (!res.success) throw new Error("Failed to save general information.");
                      setGovernanceDoc(res.data);
                    }

                    const endpoint = `/about-page/sections/cbl_information/publish`;
                    const res = await api.post(endpoint, {});
                    if (res.success) {
                      setSection(res.data);
                      gooeyToast.success("Constitution & By-Laws published successfully!");
                      setShowPublishModal(false);
                      router.push("/admin-dashboard/about-page");
                    }
                  } catch (err: any) {
                    console.error("Failed to publish content:", err);
                    gooeyToast.error(err.message || "Failed to publish content.");
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                style={{
                  ...primaryBtn,
                  justifyContent: "center", height: 48, fontSize: T.fs_base, fontWeight: 600,
                  background: isSaving ? "#4a7098" : T.blue, border: "none",
                }}
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : "Publish Now"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── FLOATING UNSAVED CHANGES BANNER ────────────────────────────────── */}
      {hasUnsavedGeneralInfoChanges && !selectedArticleIds.length && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "var(--p-blue-pale)",
            border: "2px solid var(--p-blue)",
            color: "var(--p-navy)",
            padding: "16px 24px",
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(30, 83, 142, 0.15)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: 16,
            animation: "slideUpRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <style>{`
            @keyframes slideUpRight {
              from { transform: translateY(100px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: T.fs_base, fontWeight: 700, color: "var(--p-navy)" }}>Unsaved Preamble Changes</span>
            <span style={{ fontSize: T.fs_xs, color: "var(--r-text-mid)" }}>General Description or Title has been modified.</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={handleSaveGeneralInfo}
              disabled={isSaving}
              style={{ ...primaryBtn, height: 40, padding: "0 16px", fontSize: T.fs_sm }}
            >
              {isSaving ? <Loader2 className="animate-spin" size={14} style={{ marginRight: 4 }} /> : null} Save
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle(governanceDoc?.title || "");
                setGeneralDescription(governanceDoc?.general_description || "");
              }}
              style={{ ...secondaryBtn, height: 40, padding: "0 16px", fontSize: T.fs_sm }}
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </AdminSidebarLayout>
  );
}

// Loader icon
function Loader2({ className, size = 24, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: "spin 1s linear infinite", ...style }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
