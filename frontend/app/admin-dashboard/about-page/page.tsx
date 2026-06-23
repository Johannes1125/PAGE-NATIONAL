"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  History,
  Image as ImageIcon,
  Users,
  Shield,
  FileCheck,
  Search,
  Edit,
  Globe,
  Loader2,
  LayoutGrid,
  FilePen,
  Clock,
  ArrowLeft,
  Archive,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import { api } from "../../lib/api-client";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import "./about-page.css";
import "../admin-dashboard.css";

type Section = {
  id: string;
  section_key: string;
  title: string;
  content: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  published_at?: string;
};

type SectionMeta = {
  icon: any;
  route: string;
  description: string;
  contentCountLabel: string;
};

const SECTION_METAS: Record<string, SectionMeta> = {
  cbl_information: {
    icon: BookOpen,
    route: "/admin-dashboard/about-page/cbl-information",
    description: "Manage organization constitution, articles, and bylaws.",
    contentCountLabel: "Articles",
  },
  history: {
    icon: History,
    route: "/admin-dashboard/about-page/history",
    description: "Manage historical milestones and foundation timeline events.",
    contentCountLabel: "Milestones",
  },
  logo_description: {
    icon: ImageIcon,
    route: "/admin-dashboard/about-page/logo-description",
    description: "Manage official PAGE logos and branding descriptions.",
    contentCountLabel: "Branding Assets",
  },
  national_officers: {
    icon: Users,
    route: "/admin-dashboard/about-page/national-officers",
    description: "Manage executive officers, board directors, and roles.",
    contentCountLabel: "Officers Listed",
  },
  sec_registration: {
    icon: Shield,
    route: "/admin-dashboard/about-page/sec-registration",
    description: "Manage official SEC incorporation certificates and PDFs.",
    contentCountLabel: "Documents",
  },
  bir_certification: {
    icon: FileCheck,
    route: "/admin-dashboard/about-page/bir-certification",
    description: "Manage official tax exemption files and TIN papers.",
    contentCountLabel: "Documents",
  },

};

export default function AboutPageManagement() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [officerCount, setOfficerCount] = useState(0);
  const [secDocCount, setSecDocCount] = useState(0);
  const [birDocCount, setBirDocCount] = useState(0);
  const [logoDocCount, setLogoDocCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Publish/Unpublish confirmation modal ──────────────────────────────────
  const [publishConfirm, setPublishConfirm] = useState<{
    section: Section;
    action: "publish" | "unpublish";
  } | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // ESC closes the confirmation modal
  useEffect(() => {
    if (!publishConfirm) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isToggling) setPublishConfirm(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [publishConfirm, isToggling]);

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
        const [secRes, offRes, secDocRes, birDocRes, logoDocRes] = await Promise.all([
          api.get("/about-page/sections"),
          api.get("/about-page/officers"),
          api.get("/about-page/documents/sec_registration"),
          api.get("/about-page/documents/bir_certification"),
          api.get("/about-page/documents/logo_description"),
        ]);

        if (secRes.success) {
          setSections(secRes.data);
        }
        if (offRes.success) setOfficerCount(offRes.data.length);
        if (secDocRes.success) setSecDocCount(secDocRes.data.length);
        if (birDocRes.success) setBirDocCount(birDocRes.data.length);
        if (logoDocRes.success) setLogoDocCount(logoDocRes.data.length);


      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        gooeyToast.error("Failed to load About PAGE database records.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const total = 6; // Fixed 6 modules
    const published = sections.filter((s) => s.status === "published").length;
    const draft = sections.filter((s) => s.status === "draft").length;
    
    // Find last updated
    let lastUpdatedTitle = "—";
    if (sections.length > 0) {
      const sorted = [...sections].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      lastUpdatedTitle = sorted[0].title;
    }

    return { total, published, draft, lastUpdatedTitle };
  }, [sections]);

  // Compute dynamic counts per card
  const getContentCount = (key: string, content: string) => {
    try {
      if (key === "national_officers") return officerCount;
      if (key === "sec_registration") return secDocCount;
      if (key === "bir_certification") return birDocCount;
      if (key === "logo_description") return logoDocCount;


      const parsed = JSON.parse(content);
      if (key === "cbl_information") return parsed.articles?.length || 0;
      if (key === "history") return parsed.length || 0;
      return 0;
    } catch (e) {
      // Content is plain string or undefined
      if (content) {
        return content.split(/\s+/).filter(Boolean).length; // Word count
      }
      return 0;
    }
  };

  // Publish/Unpublish toggle handlers
  const handlePublishToggle = async (section: Section) => {
    const isPublished = section.status === "published";
    const endpoint = `/about-page/sections/${section.section_key}/${isPublished ? "unpublish" : "publish"}`;
    setIsToggling(true);
    try {
      const res = await api.post(endpoint, {});
      if (res.success) {
        setSections((prev) =>
          prev.map((s) => (s.section_key === section.section_key ? res.data : s))
        );
        gooeyToast.success(`${section.title} status updated successfully.`);
        setPublishConfirm(null);
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to update section publication status.");
    } finally {
      setIsToggling(false);
    }
  };

  // Search & Filter sections list
  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && s.status === "published") ||
        (statusFilter === "draft" && s.status === "draft") ||
        (statusFilter === "archived" && s.status === "archived");
      return matchesSearch && matchesStatus;
    });
  }, [sections, searchQuery, statusFilter]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  return (
    <>
    <AdminSidebarLayout
      pageClassName="admin-dashboard"
      mainClassName="admin-main"
      title="ABOUT PAGE MANAGEMENT"
      subtitle="Manage organization information, certifications, leadership profiles, branding assets, and history."
      eyebrow="Content Command Center"
    >
      <section className="admin-shell admin-shell--main">
      {/* Statistics Summary Row */}
        <section className="about-stats-row admin-summary-grid">
          <article className="admin-hero-card admin-hero-card--navy">
            <div className="admin-hero-card__icon"><LayoutGrid size={24} /></div>
            <div>
              <p className="admin-hero-card__title">Total Content</p>
              <p className="admin-hero-card__value">{stats.total}</p>
            </div>
            <p className="admin-hero-card__meta">Modules</p>
          </article>

          <article className="admin-hero-card admin-hero-card--green">
            <div className="admin-hero-card__icon"><Globe size={24} /></div>
            <div>
              <p className="admin-hero-card__title">Published</p>
              <p className="admin-hero-card__value">{stats.published}</p>
            </div>
            <p className="admin-hero-card__meta">Live</p>
          </article>

          <article className="admin-hero-card admin-hero-card--gold">
            <div className="admin-hero-card__icon"><FilePen size={24} /></div>
            <div>
              <p className="admin-hero-card__title">Draft</p>
              <p className="admin-hero-card__value">{stats.draft}</p>
            </div>
            <p className="admin-hero-card__meta">Pending</p>
          </article>

          <article className="admin-hero-card admin-hero-card--blue">
            <div className="admin-hero-card__icon"><Clock size={24} /></div>
            <div>
              <p className="admin-hero-card__title">Recently Updated</p>
              <p className="admin-hero-card__value" style={{ fontSize: "clamp(14px, 1.4vw, 18px)", fontWeight: 700, letterSpacing: 0 }}>
                {stats.lastUpdatedTitle}
              </p>
            </div>
            <p className="admin-hero-card__meta">Last Change</p>
          </article>
        </section>

        {/* Action Bar */}
        <div className="about-action-bar">
          <button
            type="button"
            className="about-action-pill about-action-pill--ghost"
            onClick={() => router.push("/admin-dashboard")}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>

        {/* Toolbar: Search and Status Filters */}
        <section className="about-toolbar">
          <div className="about-search-wrapper">
            <Search size={16} className="about-search-icon" />
            <input
              type="text"
              placeholder="Search About PAGE sections..."
              className="about-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="about-filters">
            {["all", "published", "draft"].map((filter) => (
              <button
                key={filter}
                type="button"
                className={`about-filter-btn ${statusFilter === filter ? "about-filter-btn--active" : ""}`}
                onClick={() => setStatusFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* 6 Cards Grid */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
            <Loader2 className="animate-spin" size={36} color="var(--p-blue)" />
          </div>
        ) : (
          <section className="about-cards-grid">
            {filteredSections.map((section) => {
              const meta = SECTION_METAS[section.section_key] || {
                icon: BookOpen,
                route: "/admin-dashboard/about-page",
                description: "PAGE Info",
                contentCountLabel: "Entries",
              };
              const IconComponent = meta.icon;
              const count = getContentCount(section.section_key, section.content);

              return (
                <article key={section.id} className="about-section-card">
                  <div>
                    <div className="about-card-header">
                      <div className="about-card-icon-wrapper">
                        <IconComponent size={20} />
                      </div>
                      <span className={`about-status-badge about-status-badge--${section.status}`}>
                        {section.status === "published" && <CheckCircle2 size={11} />}
                        {section.status === "draft" && <FilePen size={11} />}
                        {section.status === "archived" && <Archive size={11} />}
                        {section.status}
                      </span>
                    </div>

                    <h3 className="about-card-title">{section.title}</h3>

                    <div className="about-card-meta">
                      <div className="about-meta-row">
                        <span className="about-meta-label">{meta.contentCountLabel}:</span>
                        <span className="about-meta-value">{count}</span>
                      </div>
                      <div className="about-meta-row">
                        <span className="about-meta-label" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} /> Updated:
                        </span>
                        <span className="about-meta-value">{formatDate(section.updated_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="about-card-actions">
                    <button
                      type="button"
                      className="about-btn about-btn--secondary"
                      onClick={() => router.push(meta.route)}
                    >
                      <Edit size={13} /> Edit
                    </button>
                    {section.section_key !== "page_logo" && (
                      <button
                        type="button"
                        className={`about-btn ${section.status === "published" ? "about-btn--danger" : "about-btn--primary"}`}
                        onClick={() =>
                          setPublishConfirm({
                            section,
                            action: section.status === "published" ? "unpublish" : "publish",
                          })
                        }
                      >
                        <Globe size={13} /> {section.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>
    </AdminSidebarLayout>

      {/* ── CONFIRMATION MODAL: Publish / Unpublish Section ─────────────── */}
      {publishConfirm && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => !isToggling && setPublishConfirm(null)}
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
            aria-labelledby="section-publish-modal-title"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 460,
              background: "var(--r-surface)",
              border: "1.5px solid var(--r-border-mid)",
              borderRadius: 20,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              zIndex: 60,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "sectionModalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <style>{`
              @keyframes sectionModalIn {
                from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
                to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              }
            `}</style>

            {/* Header */}
            <div style={{ padding: "28px 28px 16px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: publishConfirm.action === "publish" ? "var(--p-blue-pale)" : "var(--p-rose-pale)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: publishConfirm.action === "publish" ? "var(--p-blue)" : "var(--p-rose)",
                  marginBottom: 16,
                }}
              >
                {publishConfirm.action === "publish"
                  ? <Globe size={26} />
                  : <AlertTriangle size={26} />}
              </div>
              <h3
                id="section-publish-modal-title"
                style={{
                  fontSize: "18px", fontWeight: 700,
                  color: "var(--p-navy)", margin: "0 0 8px",
                  fontFamily: "var(--font-body)",
                }}
              >
                {publishConfirm.action === "publish" ? "Publish Section" : "Unpublish Section"}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--r-text-muted)", margin: 0, lineHeight: 1.6, fontFamily: "var(--font-body)" }}>
                You are about to{" "}
                <strong style={{ color: "var(--r-text)" }}>
                  {publishConfirm.action === "publish" ? "publish" : "unpublish"}
                </strong>{" "}
                <strong style={{ color: "var(--p-navy)" }}>
                  {publishConfirm.section.title}
                </strong>.
              </p>
            </div>

            {/* Warning */}
            <div style={{ padding: "0 28px" }}>
              <div
                style={{
                  background: publishConfirm.action === "publish" ? "var(--p-blue-pale)" : "var(--p-rose-pale)",
                  border: `1px solid ${publishConfirm.action === "publish" ? "rgba(30,83,142,0.15)" : "rgba(244,63,94,0.2)"}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex", alignItems: "flex-start", gap: 10,
                }}
              >
                <AlertTriangle
                  size={15}
                  color={publishConfirm.action === "publish" ? "var(--p-blue)" : "var(--p-rose)"}
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <p
                  style={{
                    fontSize: "13px",
                    color: publishConfirm.action === "publish" ? "var(--p-blue)" : "var(--p-rose)",
                    margin: 0, lineHeight: 1.5,
                    fontFamily: "var(--font-body)", fontWeight: 500,
                  }}
                >
                  {publishConfirm.action === "publish"
                    ? "This section will become publicly visible on the PAGE website immediately after confirmation."
                    : "This section will be hidden from the public and moved back to draft status."}
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
                disabled={isToggling}
                onClick={() => setPublishConfirm(null)}
                style={{
                  height: 52,
                  borderRadius: 12,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--r-text-mid)",
                  background: "var(--r-surface-2)",
                  border: "1px solid var(--r-border-mid)",
                  cursor: isToggling ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-body)",
                  opacity: isToggling ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isToggling}
                onClick={() => handlePublishToggle(publishConfirm.section)}
                style={{
                  height: 52,
                  borderRadius: 12,
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  background: isToggling
                    ? "#4a7098"
                    : publishConfirm.action === "publish"
                    ? "var(--p-blue)"
                    : "var(--p-rose)",
                  border: "none",
                  cursor: isToggling ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: "var(--font-body)",
                  opacity: isToggling ? 0.7 : 1,
                  transition: "background 0.18s ease",
                }}
              >
                {isToggling ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Globe size={15} />
                )}
                {isToggling
                  ? "Updating..."
                  : publishConfirm.action === "publish"
                  ? "Confirm Publish"
                  : "Confirm Unpublish"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
