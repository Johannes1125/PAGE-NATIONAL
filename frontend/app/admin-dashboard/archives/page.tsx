"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Archive,
  BookOpen,
  Calendar,
  RotateCcw,
  Search,
  Shield,
  User,
  Image as ImageIcon,
  Loader2,
  Clock,
  CheckCircle2,
  Layers,
  FileCheck,
  Building,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import StatCard from "../components/StatCard";
import AdminTypewriterLoader from "../../lib/admin-loader/AdminTypewriterLoader";
import { api } from "../../lib/api-client";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import "./archives.css";
import "../about-page/about-page.css";
import "../admin-dashboard.css";

export type ArchiveModuleCategory =
  | "all"
  | "cbl"
  | "history"
  | "officers"
  | "logos"
  | "compliance";

export interface UnifiedArchivedItem {
  id: string;
  title: string;
  subtitle?: string;
  category: ArchiveModuleCategory;
  categoryLabel: string;
  archivedAt?: string;
  description?: string;
  imageUrl?: string | null;
  endpoint: string; // e.g. /about-page/cbl/articles/123/unarchive
}

export default function ArchivesPage() {
  const [items, setItems] = useState<UnifiedArchivedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ArchiveModuleCategory>("all");
  const [unarchivingId, setUnarchivingId] = useState<string | null>(null);

  // Fetch archived items from all modules
  const fetchArchives = useCallback(async () => {
    try {
      setIsLoading(true);
      const unified: UnifiedArchivedItem[] = [];

      // 1. CBL Articles
      try {
        const cblRes = await api.get<{ success: boolean; data: any[] }>("/about-page/cbl/articles/archived");
        if (cblRes.success && Array.isArray(cblRes.data)) {
          cblRes.data.forEach((art) => {
            unified.push({
              id: `cbl-${art.id}`,
              title: `${art.article_number || "Article"}: ${art.article_name || "Untitled"}`,
              subtitle: "Constitution and By-Laws",
              category: "cbl",
              categoryLabel: "CBL Article",
              archivedAt: art.updated_at || art.created_at,
              description: art.article_description?.replace(/<[^>]*>/g, "").slice(0, 150) + (art.article_description?.length > 150 ? "..." : ""),
              endpoint: `/about-page/cbl/articles/${art.id}/unarchive`,
            });
          });
        }
      } catch (e) {
        console.warn("Could not fetch archived CBL articles", e);
      }

      // 2. Historical Records
      try {
        const histRes = await api.get<{ success: boolean; data: any[] }>("/historical-records/archived");
        if (histRes.success && Array.isArray(histRes.data)) {
          histRes.data.forEach((h) => {
            unified.push({
              id: `hist-${h.id}`,
              title: `${h.yearStart || ""} — ${h.title}`,
              subtitle: `Program: ${h.programType || "Milestone"}`,
              category: "history",
              categoryLabel: "Historical Record",
              archivedAt: h.updatedAt || h.createdAt,
              description: h.description,
              endpoint: `/historical-records/${h.id}/unarchive`,
            });
          });
        }
      } catch (e) {
        console.warn("Could not fetch archived history", e);
      }

      // 3. Page Logos
      try {
        const logoRes = await api.get<{ success: boolean; data: any[] }>("/page-logo/archived");
        if (logoRes.success && Array.isArray(logoRes.data)) {
          logoRes.data.forEach((l) => {
            unified.push({
              id: `logo-${l.id}`,
              title: `${l.sequenceNumber || "Logo"} — ${l.title}`,
              subtitle: "Official Branding Emblem",
              category: "logos",
              categoryLabel: "PAGE Logo",
              archivedAt: l.updatedAt || l.createdAt,
              description: l.description,
              imageUrl: l.imageUrl,
              endpoint: `/page-logo/${l.id}/unarchive`,
            });
          });
        }
      } catch (e) {
        console.warn("Could not fetch archived logos", e);
      }

      // 4. National Officers
      try {
        const offRes = await api.get<{ success: boolean; data: any[] }>("/national-officers/archived");
        if (offRes.success && Array.isArray(offRes.data)) {
          offRes.data.forEach((off) => {
            unified.push({
              id: `off-${off.id}`,
              title: off.memberName,
              subtitle: `${off.role} (${off.positionCategory || "Officer"})`,
              category: "officers",
              categoryLabel: "National Officer",
              archivedAt: off.updatedAt || off.createdAt,
              description: off.description,
              imageUrl: off.imageUrl,
              endpoint: `/national-officers/${off.id}/unarchive`,
            });
          });
        }
      } catch (e) {
        console.warn("Could not fetch archived national officers", e);
      }

      // 5. About Page Officers
      try {
        const aboutOffRes = await api.get<{ success: boolean; data: any[] }>("/about-page/officers/archived");
        if (aboutOffRes.success && Array.isArray(aboutOffRes.data)) {
          aboutOffRes.data.forEach((off) => {
            unified.push({
              id: `about-off-${off.id}`,
              title: off.name,
              subtitle: `${off.position} ${off.chapter ? `(${off.chapter})` : ""}`,
              category: "officers",
              categoryLabel: "National Officer",
              archivedAt: off.updated_at || off.created_at,
              description: off.term_start ? `Term: ${off.term_start} - ${off.term_end || "Present"}` : undefined,
              imageUrl: off.photo_url,
              endpoint: `/about-page/officers/${off.id}/unarchive`,
            });
          });
        }
      } catch (e) {
        console.warn("Could not fetch archived about page officers", e);
      }

      // 6. SEC Registrations
      try {
        const secRes = await api.get<{ success: boolean; data: any[] }>("/sec-registrations/archived");
        if (secRes.success && Array.isArray(secRes.data)) {
          secRes.data.forEach((s) => {
            unified.push({
              id: `sec-${s.id}`,
              title: s.registrationName || "SEC Registration",
              subtitle: `Reg #: ${s.registrationNumber || "N/A"}`,
              category: "compliance",
              categoryLabel: "SEC Document",
              archivedAt: s.updatedAt || s.createdAt,
              description: `Classification: ${s.exemptionCategory || "Non-Stock Organization"}`,
              imageUrl: s.imageUrl,
              endpoint: `/sec-registrations/${s.id}/unarchive`,
            });
          });
        }
      } catch (e) {
        console.warn("Could not fetch archived SEC registrations", e);
      }

      // 7. BIR Certifications
      try {
        const birRes = await api.get<{ success: boolean; data: any[] }>("/bir-certifications/archived");
        if (birRes.success && Array.isArray(birRes.data)) {
          birRes.data.forEach((b) => {
            unified.push({
              id: `bir-${b.id}`,
              title: b.registrationName || "BIR Certification",
              subtitle: `Cert #: ${b.certificationNumber || "N/A"}`,
              category: "compliance",
              categoryLabel: "BIR Certificate",
              archivedAt: b.updatedAt || b.createdAt,
              description: `TIN: ${b.tinNumber || "N/A"} | Category: ${b.exemptionCategory || "Tax-Exempt"}`,
              imageUrl: b.imageUrl,
              endpoint: `/bir-certifications/${b.id}/unarchive`,
            });
          });
        }
      } catch (e) {
        console.warn("Could not fetch archived BIR certifications", e);
      }

      // Sort by newest archived first
      unified.sort((a, b) => {
        const dateA = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
        const dateB = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
        return dateB - dateA;
      });

      setItems(unified);
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to load archive repository.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  // Handle Unarchive / Restore
  const handleUnarchive = async (item: UnifiedArchivedItem) => {
    setUnarchivingId(item.id);
    try {
      const res = await api.patch<{ success: boolean; message?: string }>(item.endpoint, {});
      if (res.success) {
        gooeyToast.success(`Restored "${item.title}" successfully!`);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      } else {
        gooeyToast.error("Failed to restore item.");
      }
    } catch (err: any) {
      console.error(err);
      gooeyToast.error(err.message || "Failed to restore record.");
    } finally {
      setUnarchivingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [items, searchQuery, selectedCategory]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Archived";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getCategoryIcon = (category: ArchiveModuleCategory) => {
    switch (category) {
      case "cbl":
        return BookOpen;
      case "history":
        return Clock;
      case "officers":
        return User;
      case "logos":
        return ImageIcon;
      case "compliance":
        return Shield;
      default:
        return Archive;
    }
  };

  const countsByCategory = useMemo(() => {
    return {
      all: items.length,
      cbl: items.filter((i) => i.category === "cbl").length,
      history: items.filter((i) => i.category === "history").length,
      officers: items.filter((i) => i.category === "officers").length,
      logos: items.filter((i) => i.category === "logos").length,
      compliance: items.filter((i) => i.category === "compliance").length,
    };
  }, [items]);

  return (
    <AdminSidebarLayout
      pageClassName="about-page-container"
      mainClassName="admin-main"
      title="System Archives"
      subtitle="Safely store, review, and restore archived governance records, milestones, officers, logos, and legal compliance filings."
      eyebrow="Organization Repository"
      seniorFriendlyHeader={true}
    >
      <motion.div
        className="admin-shell admin-shell--main archives-page-container"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Summary Stat Cards Row */}
        <section className="archives-stats-row admin-summary-grid">
          <StatCard
            label="Total Archived"
            value={items.length}
            valueUnit="Records"
            icon={Archive}
            accent="navy"
            delay={0.05}
          />
          <StatCard
            label="Governance & History"
            value={countsByCategory.cbl + countsByCategory.history}
            valueUnit="Items"
            icon={BookOpen}
            accent="amber"
            delay={0.1}
          />
          <StatCard
            label="Officers & Compliance"
            value={countsByCategory.officers + countsByCategory.logos + countsByCategory.compliance}
            valueUnit="Assets"
            icon={Shield}
            accent="blue"
            delay={0.15}
          />
        </section>

        {/* Toolbar: Search and Filter Tabs */}
        <div className="archives-toolbar">
          <div className="archives-search-wrapper">
            <Search size={16} className="archives-search-icon" />
            <input
              type="text"
              placeholder="Search archives by keyword, title, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="archives-search-input"
            />
          </div>

          <div className="archives-filters">
            {(
              [
                { key: "all", label: "All Items", count: countsByCategory.all },
                { key: "cbl", label: "CBL", count: countsByCategory.cbl },
                { key: "history", label: "History", count: countsByCategory.history },
                { key: "officers", label: "Officers", count: countsByCategory.officers },
                { key: "logos", label: "Logos", count: countsByCategory.logos },
                { key: "compliance", label: "SEC & BIR", count: countsByCategory.compliance },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`archives-filter-btn ${selectedCategory === tab.key ? "archives-filter-btn--active" : ""}`}
                onClick={() => setSelectedCategory(tab.key)}
              >
                <span>{tab.label}</span>
                <span className="archives-filter-count">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Archives Cards Grid */}
        {isLoading ? (
          <AdminTypewriterLoader label="Loading archived records..." />
        ) : filteredItems.length === 0 ? (
          <div className="archives-empty-state">
            <div className="archives-empty-icon">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="archives-empty-title">No archived records found</h3>
            <p className="archives-empty-desc">
              {searchQuery
                ? `No archived items matched your search "${searchQuery}". Try a different keyword or category.`
                : "When articles, milestones, officers, or compliance certificates are archived from the About Page modules, they will safely appear here for review or instant restoration."}
            </p>
          </div>
        ) : (
          <div className="archives-cards-grid">
            <AnimatePresence>
              {filteredItems.map((item, idx) => {
                const IconComponent = getCategoryIcon(item.category);

                return (
                  <motion.article
                    key={item.id}
                    className="archive-card"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.3 }}
                    whileHover={{
                      y: -3,
                      boxShadow: "0 10px 28px rgba(30, 83, 142, 0.08)",
                      borderColor: "#1e538e",
                    }}
                  >
                    <div className="archive-card-top">
                      <div className="archive-card-header">
                        <div className="archive-icon-wrapper">
                          <IconComponent size={22} />
                        </div>
                        <span className="archive-badge-archived">
                          <Archive size={12} />
                          <span>Archived</span>
                        </span>
                      </div>

                      <div>
                        <h3 className="archive-card-title">{item.title}</h3>
                        {item.subtitle && (
                          <p className="archive-card-subtitle" style={{ marginTop: 4 }}>
                            {item.subtitle}
                          </p>
                        )}
                      </div>

                      {item.imageUrl && (
                        <div className="archive-thumbnail-container">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="archive-thumbnail-img"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {item.description && (
                        <p className="archive-card-desc">{item.description}</p>
                      )}
                    </div>

                    <div className="archive-card-middle">
                      <div className="archive-meta-item">
                        <span className="archive-meta-label">Category:</span>
                        <span className="archive-meta-value">{item.categoryLabel}</span>
                      </div>
                      <div className="archive-meta-item">
                        <Calendar size={13} className="text-slate-400" />
                        <span className="archive-meta-value">{formatDate(item.archivedAt)}</span>
                      </div>
                    </div>

                    <div className="archive-card-bottom">
                      <button
                        type="button"
                        className="archive-restore-btn"
                        onClick={() => handleUnarchive(item)}
                        disabled={unarchivingId === item.id}
                        title={`Restore ${item.title} back to active module`}
                      >
                        {unarchivingId === item.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <RotateCcw size={16} />
                        )}
                        <span>
                          {unarchivingId === item.id ? "Restoring..." : "Restore to Active"}
                        </span>
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </AdminSidebarLayout>
  );
}
