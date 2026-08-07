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
  ChevronLeft,
  Cloud,
  AlertTriangle,
  Calendar,
  Info,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import { api, PaginatedResponse, PaginationMeta } from "../../../lib/api-client";
import Pagination from "../components/Pagination";
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

  // Font sizes & heights standardized to PAGE Admin Design System:
  fs_xs:      12,
  fs_sm:      13,
  fs_base:    14,
  fs_md:      16,
  fs_lg:      18,
  fs_xl:      20,

  // Heights – standard control targets
  inputH:     42,
  btnH:       42,
  btnHSm:     36,
  rowH:       48,
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

  const getToolBtnClass = (cmd?: string): string => {
    const active = cmd ? activeFormats[cmd] : false;
    return `cbl-editor-btn ${active ? "cbl-editor-btn--active" : ""}`;
  };

  const separatorStyle: React.CSSProperties = {
    width: 1, height: 24, background: "#e2e8f0", margin: "0 6px",
  };

  const cleanText = (value || "").replace(/<[^>]*>/g, "");
  const charCount = cleanText.length;
  const wordCount = cleanText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        overflow: "hidden",
        background: "var(--r-surface)",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "6px 10px",
          background: "var(--r-surface-2)",
          borderBottom: "1px solid #e2e8f0",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          {/* Undo / Redo */}
          <button type="button" onMouseDown={preventBlur} onClick={() => handleCommand("undo")} className={getToolBtnClass()} title="Undo (Ctrl+Z)">
            <Undo2 size={15} />
          </button>
          <button type="button" onMouseDown={preventBlur} onClick={() => handleCommand("redo")} className={getToolBtnClass()} title="Redo (Ctrl+Y)">
            <Redo2 size={15} />
          </button>
          <div style={separatorStyle} />
          {/* Formatting */}
          <button type="button" onMouseDown={preventBlur} onClick={() => handleCommand("bold")} className={getToolBtnClass("bold")} title="Bold (Ctrl+B)">
            <Bold size={15} />
          </button>
          <button type="button" onMouseDown={preventBlur} onClick={() => handleCommand("italic")} className={getToolBtnClass("italic")} title="Italic (Ctrl+I)">
            <Italic size={15} />
          </button>
          <button type="button" onMouseDown={preventBlur} onClick={() => handleCommand("underline")} className={getToolBtnClass("underline")} title="Underline (Ctrl+U)">
            <Underline size={15} />
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
          padding: "12px 14px",
          outline: "none",
          fontSize: "14px",
          color: "var(--r-text)",
          lineHeight: 1.6,
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
          gap: 6,
          padding: "8px 12px",
          background: "var(--r-surface-2)",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontSize: "12px", color: "#94a3b8", fontFamily: "var(--font-body)", fontWeight: 500 }}>
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <span style={{ fontSize: "12px", color: charCount > 2000 ? "var(--p-rose)" : "#94a3b8", fontFamily: "var(--font-body)", fontWeight: charCount > 2000 ? 700 : 500 }}>
            {charCount} / 2000 characters {charCount > 2000 && "(Exceeds limit)"}
          </span>
        </div>
        <div style={{ width: "100%", background: "#e2e8f0", height: 3, borderRadius: 2, overflow: "hidden" }}>
          <div
            style={{
              width: `${Math.min((charCount / 2000) * 100, 100)}%`,
              background: charCount > 2000 ? "var(--p-rose)" : "#1e3a5f",
              height: "100%",
              borderRadius: 2,
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
  const [articlePage, setArticlePage] = useState(1);
  const [articleLimit, setArticleLimit] = useState(10);
  const [articleMeta, setArticleMeta] = useState<PaginationMeta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });

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

  const fetchAllData = async (page = articlePage, limit = articleLimit) => {
    try {
      setIsLoading(true);
      const [secRes, govRes, artRes] = await Promise.all([
        api.get("/about-page/sections/cbl_information"),
        api.get("/about-page/cbl/governance"),
        api.get<PaginatedResponse<CBLArticle>>(`/about-page/cbl/articles?page=${page}&limit=${limit}`),
      ]);
      if (secRes.success && secRes.data) setSection(secRes.data as Section);
      if (govRes.success && govRes.data) {
        const doc = govRes.data as GovernanceDoc;
        setGovernanceDoc(doc);
        setTitle(doc.title && doc.title.trim().toLowerCase() !== "csa" ? doc.title : "Constitution and By-Laws");
        setGeneralDescription(doc.general_description);
      }
      if (artRes.success && artRes.data) {
        setArticles(artRes.data as CBLArticle[]);
        if (artRes.meta) setArticleMeta(artRes.meta);
      }
    } catch (err) {
      console.error("Failed to load CBL data:", err);
      gooeyToast.error("Failed to load Constitution and By-Laws data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticlePageChange = (newPage: number) => {
    setArticlePage(newPage);
    fetchAllData(newPage, articleLimit);
  };

  const handleArticleLimitChange = (newLimit: number) => {
    setArticleLimit(newLimit);
    setArticlePage(1);
    fetchAllData(1, newLimit);
  };

  useEffect(() => { fetchAllData(articlePage, articleLimit); }, []);

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
      <AdminSidebarLayout
        pageClassName="admin-dashboard"
        mainClassName="admin-main"
        title="CBL Information"
        subtitle="Loading CBL configurations..."
        eyebrow="Content Manager"
        seniorFriendlyHeader={true}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 0" }}>
          <Loader2 className="animate-spin" size={40} style={{ color: T.blue }} />
        </div>
      </AdminSidebarLayout>
    );
  }

  // ── SHARED STYLE HELPERS ─────────────────────────────────────────────────

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: 6,
    letterSpacing: "0.01em",
    fontFamily: "var(--font-body)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: T.inputH,
    padding: "0 12px",
    border: "1px solid var(--r-border-mid)",
    borderRadius: 10,
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
    padding: "0 16px",
    borderRadius: 10,
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
    padding: "0 14px",
    borderRadius: 10,
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
    padding: "0 14px",
    borderRadius: 10,
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
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
  };

  const cardHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "14px",
    marginBottom: "16px",
    borderBottom: "1px solid #f1f5f9",
    background: "transparent",
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: "17px",
    fontWeight: 700,
    color: "#0f172a",
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
      seniorFriendlyHeader={true}
    >
      {/* ── NAVIGATION & ACTION CARD ─────────────────────────────────────────── */}
      <div className="cbl-nav-card shadow-md">
        <div className="cbl-nav-row">
          <div className="cbl-nav-left">
            <button
              type="button"
              className="cbl-back-btn cbl-focus-ring"
              onClick={() => router.push("/admin-dashboard/about-page")}
            >
              <ChevronLeft size={20} /> Back
            </button>
            <div className="cbl-divider" />
            <div className="cbl-tabs-track">
              {(["process", "governance"] as const).map((tab) => {
                const labels = { process: "Process Info", governance: "Governance Doc" };
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`cbl-tab-btn cbl-focus-ring ${isActive ? "cbl-tab-btn--active" : "text-slate-500 hover:text-slate-700 bg-transparent"}`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="cbl-nav-right">
            {/* Status Information */}
            <div className="cbl-status-group flex items-center gap-3">
              {hasUnsavedGeneralInfoChanges ? (
                <span className="cbl-status-badge cbl-status-badge--unsaved">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                  Unsaved Changes
                </span>
              ) : section?.status === "published" ? (
                <span className="cbl-status-badge cbl-status-badge--published">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                  Published
                </span>
              ) : (
                <span className="cbl-status-badge cbl-status-badge--draft">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                  Draft
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={isPublishButtonDisabled}
              onClick={() => setShowPublishModal(true)}
              className="cbl-publish-btn cbl-focus-ring"
            >
              <Cloud size={20} /> Publish Changes
            </button>
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ padding: "20px 20px 60px" }}>
        {/* Wrap process tab content in Framer Motion transition */}
        {activeTab === "process" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-5"
          >
            {/* SECTION 1 — General Information */}
            <div className="cbl-section-card" style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="w-9 h-9 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText size={18} style={{ color: "#1e3a5f" }} />
                  </div>
                  <h3 style={cardTitleStyle}>General Information</h3>
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    fontSize: "13px",
                    fontWeight: 600,
                    backgroundColor: "#dcfce7",
                    color: "#15803d",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                  Preamble
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* CBL Title */}
                <div>
                  <label style={labelStyle}>CBL Title <span style={{ color: T.red }}>*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Constitution and By-Laws"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full min-h-[42px] rounded-lg border border-[#cbd5e1] px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] bg-white transition-all cbl-focus-ring"
                  />
                </div>

                {/* General Description */}
                <div>
                  <label style={labelStyle}>General Description <span style={{ color: T.red }}>*</span></label>
                  <RichTextEditor
                    value={generalDescription}
                    onChange={(val) => setGeneralDescription(val)}
                    placeholder="Write the preamble narrative details..."
                    minHeight="120px"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2 — Articles Registry */}
            <div className="cbl-section-card" style={cardStyle}>
              {/* Card Title Header */}
              <div style={cardHeaderStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="w-9 h-9 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText size={18} style={{ color: "#1e3a5f" }} />
                  </div>
                  <div>
                    <h3 style={{ ...cardTitleStyle, margin: 0 }}>Articles</h3>
                    <span style={{ fontSize: "13px", color: "var(--r-text-muted)", fontWeight: 500 }}>
                      {filteredArticles.length} of {articles.length} article{articles.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                {/* Search + Sort + Filter + New Article */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  {/* Search input */}
                  <div
                    className="flex items-center gap-2 px-3 border border-slate-300 rounded-lg bg-white transition-all focus-within:ring-2 focus-within:ring-[#1e3a5f] focus-within:border-[#1e3a5f]"
                    style={{
                      height: 40,
                      width: 240,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    }}
                  >
                    <Search size={16} className="text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQueryTable}
                      onChange={(e) => setSearchQueryTable(e.target.value)}
                      className="w-full text-[14px] text-slate-800 border-none outline-none bg-transparent placeholder-slate-400"
                      style={{
                        fontFamily: "var(--font-body)",
                      }}
                    />
                    {searchQueryTable && (
                      <button
                        type="button"
                        onClick={() => setSearchQueryTable("")}
                        className="bg-transparent border-none cursor-pointer p-0.5 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenCreateDrawer}
                    className="bg-[#1e3a5f] hover:bg-[#152943] text-white font-semibold px-4 rounded-lg flex items-center justify-center gap-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2 cursor-pointer text-[14px]"
                    style={{ height: 40 }}
                  >
                    <Plus size={16} /> New Article
                  </button>
                </div>
              </div>

              {/* Article Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      {[
                        { label: "Article Number", w: "22%" },
                        { label: "Article Name", w: "auto" },
                        { label: "Updated", w: "18%" },
                        { label: "Actions", w: "14%", right: true },
                      ].map((col) => (
                        <th
                          key={col.label}
                          style={{
                            padding: "12px 18px",
                            textAlign: col.right ? "right" : "left",
                            fontWeight: 700,
                            color: "#64748b",
                            fontSize: "12px",
                            width: col.w,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.map((art, idx) => {
                      return (
                        <tr
                          key={art.id}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            background: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                            fontSize: "14px",
                            color: "#0f172a",
                            height: 48,
                          }}
                        >
                          {/* Number + Badge */}
                          <td style={{ padding: "12px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{
                                width: 28, height: 28, borderRadius: "50%",
                                background: "#1e3a5f", color: "#ffffff",
                                fontSize: "12px", fontWeight: 700,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                              }}>
                                {idx + 1}
                              </span>
                              <span style={{ fontWeight: 700, color: "#1e3a5f", fontSize: "14px" }}>{art.article_number}</span>
                            </div>
                          </td>
                          {/* Name */}
                          <td style={{ padding: "12px 18px", color: "var(--r-text)", fontWeight: 600, fontSize: "14px" }}>
                            {art.article_name}
                          </td>
                          {/* Updated */}
                          <td style={{ padding: "12px 18px", color: "var(--r-text-muted)", fontSize: "13px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <Calendar size={15} className="text-slate-400" />
                              {formatDate(art.updated_at)}
                            </div>
                          </td>
                          {/* Actions */}
                          <td style={{ padding: "12px 18px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              {/* View */}
                              <button
                                type="button"
                                onClick={() => setPreviewArticle(art)}
                                className="cbl-focus-ring flex items-center gap-1.5 text-[#334155] hover:bg-[#f1f5f9] rounded-md transition-all cursor-pointer"
                                style={{
                                  border: "1px solid #e2e8f0",
                                  height: 34,
                                  padding: "0 12px",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  background: "white",
                                }}
                              >
                                <Eye size={14} /> View
                              </button>
                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditDrawer(art)}
                                className="cbl-focus-ring flex items-center gap-1.5 text-[#1e3a5f] hover:bg-[#f1f5f9] rounded-md transition-all cursor-pointer"
                                style={{
                                  border: "1px solid #e2e8f0",
                                  height: 34,
                                  padding: "0 12px",
                                  fontSize: "13px",
                                  fontWeight: 600,
                                  background: "white",
                                }}
                              >
                                <Edit size={14} /> Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredArticles.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: "48px 24px", textAlign: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--p-blue-pale)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--p-blue)" }}>
                              <FileText size={26} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: "0 0 4px" }}>
                                {searchQueryTable ? "No matching articles found" : "No articles registered yet"}
                              </h4>
                              <p style={{ fontSize: "13px", color: "var(--r-text-muted)", margin: 0, maxWidth: 360, marginInline: "auto" }}>
                                {searchQueryTable 
                                  ? `We couldn't find any articles matching "${searchQueryTable}". Try adjusting your keywords.` 
                                  : "Get started by adding the first article of your Constitution & By-Laws."}
                              </p>
                            </div>
                            {!searchQueryTable && (
                              <button
                                type="button"
                                onClick={handleOpenCreateDrawer}
                                className="cbl-focus-ring min-h-[40px] px-4 bg-[#1e3a5f] hover:bg-[#152943] text-white font-semibold text-[14px] rounded-lg flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
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

              <Pagination
                currentPage={articlePage}
                totalPages={articleMeta.totalPages}
                totalItems={articleMeta.totalItems}
                itemsPerPage={articleLimit}
                onPageChange={handleArticlePageChange}
                onItemsPerPageChange={handleArticleLimitChange}
                isLoading={isLoading}
              />
            </div>
          </motion.div>
        )}

        {/* ── GOVERNANCE DOCUMENT TAB ───────────────────────────────────────── */}
        {activeTab === "governance" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-6"
          >
            {/* Preamble Preview */}
            <div className="cbl-section-card" style={{ ...cardStyle, background: "#f8fafc" }}>
              <div style={cardHeaderStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="w-11 h-11 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText size={22} style={{ color: "#1e3a5f" }} />
                  </div>
                  <h3 style={cardTitleStyle}>Preamble Sync Preview</h3>
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    fontStyle: "italic",
                    fontWeight: 500,
                  }}
                >
                  Read-only preview
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-body)", display: "block" }}>CBL Title</span>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "4px 0 0", fontFamily: "var(--font-body)" }}>{title || "—"}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-body)", display: "block" }}>General Description</span>
                  <div
                    style={{
                      fontSize: "14px", color: "#1e293b", marginTop: 6,
                      border: "1px solid #e2e8f0", background: "white",
                      borderRadius: 10, padding: "14px", maxHeight: 160, overflowY: "auto", lineHeight: 1.6,
                      fontFamily: "var(--font-body)",
                    }}
                    dangerouslySetInnerHTML={{ __html: generalDescription || "Preamble content empty." }}
                  />
                </div>
              </div>
            </div>

            {/* Governance PDF */}
            <div className="cbl-section-card" style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="w-9 h-9 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText size={18} style={{ color: "#1e3a5f" }} />
                  </div>
                  <h3 style={cardTitleStyle}>Governance PDF Document</h3>
                </div>
                <Info size={18} className="text-slate-400" />
              </div>
              <div style={{ padding: "0 4px" }}>
                {isUploading ? (
                  <div
                    style={{
                      border: "2px dashed var(--r-border-mid)",
                      borderRadius: 12, padding: "40px 20px",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", textAlign: "center",
                      background: "var(--r-surface-2)",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                      <Loader2 className="animate-spin" size={32} style={{ color: "var(--p-blue)" }} />
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--r-text-mid)", margin: 0, fontFamily: "var(--font-body)" }}>Uploading file, please wait...</p>
                    </div>
                  </div>
                ) : !governanceDoc?.file_url ? (
                  <label
                    style={{
                      border: "2px dashed var(--r-border-mid)",
                      borderRadius: 12, padding: "40px 20px",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", cursor: "pointer", textAlign: "center",
                      background: "var(--r-surface-2)",
                    }}
                    className="hover:bg-slate-50/50 transition-all cbl-focus-ring"
                  >
                    <div style={{ width: 48, height: 48, background: "var(--p-blue-pale)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                      <Upload size={22} color="var(--p-blue)" />
                    </div>
                    <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--p-navy)", margin: "0 0 4px", fontFamily: "var(--font-body)" }}>Drop PDF here or click to upload</p>
                    <p style={{ fontSize: "13px", color: "var(--r-text-muted)", margin: "0 0 16px", fontFamily: "var(--font-body)" }}>Only PDF documents are supported. Maximum size: 10 MB.</p>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "0 16px", height: 40,
                      background: "var(--p-blue)", color: "var(--p-white)",
                      borderRadius: 10, fontSize: "14px", fontWeight: 600,
                      fontFamily: "var(--font-body)",
                      pointerEvents: "none",
                    }}>
                      <Upload size={15} /> Choose PDF file
                    </span>
                    <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                ) : (
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", background: "#f8fafc" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 42, height: 42, background: "#fee2e2", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <FileText size={20} color="#dc2626" />
                        </div>
                        <div>
                          <p style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0, fontFamily: "var(--font-body)" }}>{governanceDoc.file_name}</p>
                          <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0", fontFamily: "var(--font-body)" }}>
                            {formatFileSize(governanceDoc.file_size)} · Uploaded {formatDate(governanceDoc.created_at)}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <a
                          href={governanceDoc.file_url} target="_blank" rel="noreferrer"
                          className="cbl-focus-ring border border-[#cbd5e1] hover:bg-slate-50 text-[#334155] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          style={{ textDecoration: "none", fontSize: "13px", height: 38, padding: "0 14px", fontFamily: "var(--font-body)" }}
                        >
                          Preview File
                        </a>
                        <label className="cbl-focus-ring border border-[#cbd5e1] hover:bg-slate-50 text-[#334155] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer" style={{ fontSize: "13px", height: 38, padding: "0 14px", fontFamily: "var(--font-body)" }}>
                          Replace
                          <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileUpload} disabled={isUploading} />
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowDeletePDFModal(true)}
                          disabled={isUploading}
                          className="cbl-focus-ring hover:bg-rose-50/50 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          style={{
                            fontSize: "13px",
                            height: 38,
                            padding: "0 14px",
                            fontFamily: "var(--font-body)",
                            border: "1px solid #fca5a5",
                            color: "#dc2626",
                            background: "white",
                          }}
                        >
                          <Trash size={15} /> Remove File
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, marginTop: 18, paddingTop: 18, borderTop: "1px solid #e2e8f0" }}>
                      {[
                        { label: "Uploaded By", value: governanceDoc.uploaded_by || "—" },
                        { label: "Upload Date", value: formatDate(governanceDoc.created_at) },
                        { label: "Last Modified", value: formatDate(governanceDoc.updated_at) },
                        { label: "Link Status", value: "Active PDF", icon: <CheckCircle size={15} style={{ color: "#16a34a" }} /> },
                      ].map((meta) => (
                        <div key={meta.label}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", fontFamily: "var(--font-body)" }}>
                            {meta.label}
                          </span>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontFamily: "var(--font-body)" }}>
                            {meta.icon} {meta.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
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
          width: "100%", maxWidth: 600,
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
            padding: "0 20px", height: 60,
            borderBottom: `1px solid ${T.slate100}`,
            background: T.slate50, flexShrink: 0,
          }}
        >
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e3a5f", margin: 0 }}>
              {selectedArticleId ? "Edit Article" : "New Article"}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--r-text-muted)", margin: "2px 0 0" }}>
              Fill in the constitutional article details
            </p>
          </div>
          <button
            type="button" onClick={handleCloseDrawer}
            className="cbl-focus-ring"
            style={{
              width: 34, height: 34, borderRadius: 8,
              border: `1.5px solid ${T.slate200}`,
              background: T.white, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: T.slate500,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Form */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

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
                    className="w-full min-h-[42px] rounded-lg border border-slate-300 px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] bg-white transition-all cbl-focus-ring"
                    style={{ fontFamily: "var(--font-body)" }}
                  />
                  <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--r-text-muted)", lineHeight: 1.4 }}>
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
                    className="w-full min-h-[42px] rounded-lg border border-slate-300 px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] bg-white transition-all cbl-focus-ring"
                    style={{
                      fontWeight: 600,
                      color: "#1e3a5f",
                      fontFamily: "var(--font-body)",
                    }}
                  />
                  <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--r-text-muted)", lineHeight: 1.4 }}>
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
                className="w-full min-h-[42px] rounded-lg border border-slate-300 px-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] bg-white transition-all cbl-focus-ring"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>

            {/* Article Description */}
            <div>
              <label style={labelStyle}>Article Description <span style={{ color: T.red }}>*</span></label>
              <RichTextEditor
                value={articleDescription}
                onChange={(val) => setArticleDescription(val)}
                placeholder="Type the items, sections, and descriptions of this article..."
                minHeight="220px"
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
            gap: 10, flexWrap: "wrap",
          }}
        >
          {/* Left: Delete */}
          <div>
            {selectedArticleId && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setShowDeleteArticleModal(selectedArticleId)}
                className="cbl-focus-ring min-h-[40px] px-4 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100/70 font-semibold text-[14px] rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash size={16} /> Delete Article
              </button>
            )}
          </div>

          {/* Right: Cancel + Save */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="cbl-focus-ring min-h-[40px] px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-[14px] rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveArticle}
              disabled={isSaving}
              className="cbl-focus-ring min-h-[40px] px-4 bg-[#1e3a5f] hover:bg-[#152943] text-white font-semibold text-[14px] rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
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
