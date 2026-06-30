"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";

import AdminSidebarLayout from "../components/AdminSidebarLayout";
import ChapterStats from "./components/ChapterStats";
import ChapterToolbar from "./components/ChapterToolbar";
import ChapterCard from "./components/ChapterCard";
import ChapterTable from "./components/ChapterTable";
import ViewToggle from "./components/ViewToggle";
import EmptyState from "./components/EmptyState";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ChapterPagination from "./components/ChapterPagination";
import { Chapter, ChapterStatsData, mapApiChapterToChapter } from "./types";
import { chaptersApi } from "../../lib/api-client";
import "../admin-dashboard.css";
import "./chapters.css";

const ITEMS_PER_PAGE = 10;

export default function ChaptersPage() {
  const router = useRouter();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [stats, setStats] = useState<ChapterStatsData | undefined>();
  const [totalItems, setTotalItems] = useState(0);

  // ── Filter / sort state (mirrors toolbar props) ─────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIslandGroup, setSelectedIslandGroup] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("updated-desc");
  const [viewMode, setViewMode] = useState<"card" | "list">("list");

  // ── Pagination ──────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

  // ── Loading states ──────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Fetch chapters from API ─────────────────────────────────────────────────
  const fetchChapters = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await chaptersApi.list({
        search: searchQuery.trim() || undefined,
        island_group: selectedIslandGroup !== "All" ? selectedIslandGroup : undefined,
        region: selectedRegion !== "All" ? selectedRegion : undefined,
        status: selectedStatus !== "All" ? selectedStatus : undefined,
        sort: sortBy,
        page: currentPage,
        limit: itemsPerPage,
      });

      if (res?.success && Array.isArray(res.data)) {
        setChapters(res.data.map(mapApiChapterToChapter));
        setTotalItems(res.meta?.total ?? res.data.length);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load chapters.";
      gooeyToast.error(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, selectedIslandGroup, selectedRegion, selectedStatus, sortBy, currentPage, itemsPerPage]);

  // ── Fetch stats from API ────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await chaptersApi.stats();
      if (res?.success && res.data) setStats(res.data);
    } catch {
      // stats are non-critical; silently ignore
    }
  }, []);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchChapters(true);
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-fetch when filters / pagination change ───────────────────────────────
  useEffect(() => {
    fetchChapters(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedIslandGroup, selectedRegion, selectedStatus, sortBy, currentPage, itemsPerPage]);

  // ── Reset to page 1 when filters change ────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedIslandGroup, selectedRegion, selectedStatus, sortBy]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleCreateChapter = () => {
    router.push("/admin-dashboard/chapters/create");
  };

  const handleExportAll = () => {
    gooeyToast.success(`Exported all ${totalItems} chapters to Excel.`);
  };

  const handleEdit = (chapter: Chapter) => {
    router.push(`/admin-dashboard/chapters/${chapter.id}/edit`);
  };

  const handleTogglePublish = async (chapter: Chapter) => {
    const nextStatus = chapter.status === "published" ? "draft" : "published";
    try {
      await chaptersApi.updateStatus(chapter.id, nextStatus);
      gooeyToast.success(
        `"${chapter.name}" is now ${nextStatus === "published" ? "Published ✓" : "set to Draft"}.`
      );
      // Optimistic UI update
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapter.id ? { ...c, status: nextStatus, updatedAt: new Date().toISOString() } : c
        )
      );
      fetchStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status.";
      gooeyToast.error(msg);
    }
  };

  const handleDelete = async (chapter: Chapter) => {
    if (!confirm(`Are you sure you want to delete "${chapter.name}"? This action cannot be undone.`)) return;
    try {
      await chaptersApi.delete(chapter.id);
      gooeyToast.success(`"${chapter.name}" deleted successfully.`);
      setChapters((prev) => prev.filter((c) => c.id !== chapter.id));
      setTotalItems((t) => Math.max(0, t - 1));
      fetchStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete chapter.";
      gooeyToast.error(msg);
    }
  };

  const handleViewAllOfficers = (chapter: Chapter) => {
    gooeyToast.info(`Displaying full officer registry for ${chapter.name} (${chapter.officers.length} members).`);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedIslandGroup("All");
    setSelectedRegion("All");
    setSelectedStatus("All");
    setSortBy("updated-desc");
  };

  // ── Header actions ─────────────────────────────────────────────────────────
  const headerActionsBlock = (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={handleExportAll}
        className="chapters-btn chapters-btn--secondary"
        style={{ minHeight: "52px", fontSize: "18px", padding: "0 28px" }}
        aria-label="Export chapters metadata"
      >
        <Download size={22} strokeWidth={2.5} aria-hidden="true" />
        <span>Export</span>
      </button>

      <button
        type="button"
        onClick={handleCreateChapter}
        className="chapters-btn chapters-btn--primary"
        style={{ minHeight: "52px", fontSize: "18px", fontWeight: 600, padding: "0 28px", borderRadius: "8px" }}
        aria-label="Create new chapter entry"
      >
        <Plus size={24} strokeWidth={3} aria-hidden="true" />
        <span>Create Chapter</span>
      </button>
    </div>
  );

  return (
    <>
    <AdminSidebarLayout
      pageClassName="chapters-management-page"
      mainClassName="admin-main-content"
      eyebrow="CHAPTER MANAGEMENT"
      title="All Chapters"
      subtitle="Manage all PAGE regional chapters, officers, publication status, and organizational information from one centralized dashboard."
      seniorFriendlyHeader={true}
      headerActions={headerActionsBlock}
      titleIcon={<Building2 size={28} strokeWidth={2.2} aria-hidden="true" />}
      premiumHeader={true}
    >
      <motion.div
        className="chapters-container pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {isLoading ? (
          <LoadingSkeleton type="stats" />
        ) : (
          <ChapterStats chapters={chapters} stats={stats} />
        )}

        {isLoading ? (
          <LoadingSkeleton type="toolbar" />
        ) : (
          <ChapterToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedIslandGroup={selectedIslandGroup}
            setSelectedIslandGroup={setSelectedIslandGroup}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        )}

        {isLoading ? (
          <LoadingSkeleton type={viewMode === "card" ? "cards" : "table"} />
        ) : chapters.length === 0 ? (
          <EmptyState
            onCreateChapter={handleCreateChapter}
            isSearchActive={
              searchQuery !== "" ||
              selectedIslandGroup !== "All" ||
              selectedRegion !== "All" ||
              selectedStatus !== "All"
            }
            onClearFilters={handleClearFilters}
          />
        ) : (
          <section className="chapters-section" aria-label="Chapters list">
            <div className="flex items-center justify-between gap-4">
              <h2 className="chapters-section__label">
                All Chapters
                {isRefreshing && (
                  <span className="ml-3 text-slate-400 text-[16px] font-normal animate-pulse">
                    Refreshing…
                  </span>
                )}
              </h2>
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            </div>
            <AnimatePresence mode="wait">
              {viewMode === "card" ? (
                <motion.div
                  key="card-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 min-w-0"
                >
                  {chapters.map((chapter) => (
                    <ChapterCard
                      key={chapter.id}
                      chapter={chapter}
                      onEdit={handleEdit}
                      onTogglePublish={handleTogglePublish}
                      onViewAllOfficers={handleViewAllOfficers}
                      onDelete={handleDelete}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <ChapterTable
                    chapters={chapters}
                    onEdit={handleEdit}
                    onTogglePublish={handleTogglePublish}
                    onDelete={handleDelete}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {!isLoading && totalItems > 0 && (
          <div className="mt-4">
            <ChapterPagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(count) => {
                setItemsPerPage(count);
                setCurrentPage(1);
              }}
            />
          </div>
        )}

      </motion.div>
    </AdminSidebarLayout>
    </>
  );
}
