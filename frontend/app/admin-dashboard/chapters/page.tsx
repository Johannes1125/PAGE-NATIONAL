"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, Building2, EyeOff, Globe, Trash2 } from "lucide-react";
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
import ConfirmDialog from "../conventions/components/ConfirmDialog";
import OfficerModal from "./components/OfficerModal";
import { Chapter, ChapterStatsData, mapApiChapterToChapter } from "./types";
import { chaptersApi } from "../../lib/api-client";
import "../admin-dashboard.css";
import "../conventions/conventions.css";
import "./chapters.css";

const ITEMS_PER_PAGE = 10;

export default function ChaptersPage() {
  const router = useRouter();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [stats, setStats] = useState<ChapterStatsData | undefined>();
  const [totalItems, setTotalItems] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);
  const [publishTarget, setPublishTarget] = useState<Chapter | null>(null);
  const [viewOfficersTarget, setViewOfficersTarget] = useState<Chapter | null>(null);

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

  const handleTogglePublishRequest = (chapter: Chapter) => {
    setPublishTarget(chapter);
  };

  const handlePublishConfirm = async () => {
    if (!publishTarget) return;
    const nextStatus = publishTarget.status === "published" ? "draft" : "published";
    try {
      await chaptersApi.updateStatus(publishTarget.id, nextStatus);
      gooeyToast.success(
        `"${publishTarget.name}" is now ${nextStatus === "published" ? "Published ✓" : "set to Draft"}.`
      );
      setChapters((prev) =>
        prev.map((c) =>
          c.id === publishTarget.id ? { ...c, status: nextStatus, updatedAt: new Date().toISOString() } : c
        )
      );
      fetchStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status.";
      gooeyToast.error(msg);
    } finally {
      setPublishTarget(null);
    }
  };

  const handleDeleteRequest = (chapter: Chapter) => {
    setDeleteTarget(chapter);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await chaptersApi.delete(deleteTarget.id);
      gooeyToast.success(`"${deleteTarget.name}" deleted successfully.`);
      setChapters((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setTotalItems((t) => Math.max(0, t - 1));
      fetchStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete chapter.";
      gooeyToast.error(msg);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleViewAllOfficers = (chapter: Chapter) => {
    setViewOfficersTarget(chapter);
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
        style={{ minHeight: "52px", fontSize: "18px", padding: "0 28px" }}
        aria-label="Create new regional chapter"
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
        subtitle="Manage all PAGE regional chapters — review profiles, update officer rosters, toggle publication status, and create new chapters."
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
          {/* Top KPI stats cards */}
          <section className="mb-8" aria-label="Chapter Statistics">
            {isLoading ? (
              <LoadingSkeleton type="stats" />
            ) : (
              <ChapterStats chapters={chapters} stats={stats} />
            )}
          </section>

          {/* Search, Filter, & Sort Controls */}
          <section className="mb-6" aria-label="Controls and filters">
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
                onClearFilters={handleClearFilters}
              />
            )}
          </section>

          {/* Main Content Area */}
          {isLoading ? (
            <LoadingSkeleton type={viewMode === "card" ? "cards" : "table"} />
          ) : chapters.length === 0 ? (
            <EmptyState
              onCreateChapter={handleCreateChapter}
              isSearchActive={
                Boolean(searchQuery) ||
                selectedIslandGroup !== "All" ||
                selectedRegion !== "All" ||
                selectedStatus !== "All"
              }
              onClearFilters={handleClearFilters}
            />
          ) : (
            <section className="chapters-section" aria-label="Chapters list">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="chapters-section__label">All Chapters</h2>
                  <span className="chapters-count-chip">
                    {totalItems} {totalItems === 1 ? "chapter" : "chapters"}
                  </span>
                  {isRefreshing && (
                    <span className="text-slate-400 text-[15px] font-normal animate-pulse flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block" />
                      Updating…
                    </span>
                  )}
                </div>
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
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 min-w-0"

                  >
                    {chapters.map((chapter) => (
                      <ChapterCard
                        key={chapter.id}
                        chapter={chapter}
                        onEdit={handleEdit}
                        onTogglePublish={handleTogglePublishRequest}
                        onViewAllOfficers={handleViewAllOfficers}
                        onDelete={handleDeleteRequest}
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
                      onTogglePublish={handleTogglePublishRequest}
                      onDelete={handleDeleteRequest}
                      onViewOfficers={handleViewAllOfficers}
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

    {/* Officers Registry Modal */}
    <OfficerModal
      open={Boolean(viewOfficersTarget)}
      chapter={viewOfficersTarget}
      onClose={() => setViewOfficersTarget(null)}
    />

    {/* Unpublish / Publish Confirmation Dialog */}
    <ConfirmDialog
      open={Boolean(publishTarget)}
      title={publishTarget?.status === "published" ? "Unpublish Chapter" : "Publish Chapter"}
      message={
        publishTarget?.status === "published"
          ? `Are you sure you want to unpublish "${publishTarget?.name}"? It will be hidden from the public website.`
          : `Are you sure you want to publish "${publishTarget?.name}"? It will become visible on the public website.`
      }
      confirmLabel={publishTarget?.status === "published" ? "Unpublish Chapter" : "Publish Chapter"}
      cancelLabel="Cancel"
      variant={publishTarget?.status === "published" ? "danger" : "primary"}
      icon={publishTarget?.status === "published" ? <EyeOff size={28} strokeWidth={2} /> : <Globe size={28} strokeWidth={2} />}
      onConfirm={handlePublishConfirm}
      onCancel={() => setPublishTarget(null)}
    />

    {/* Delete Confirmation Dialog */}
    <ConfirmDialog
      open={Boolean(deleteTarget)}
      title="Delete Chapter"
      message={`Are you sure you want to delete "${deleteTarget?.name}"? This action will permanently remove the chapter, its officers, activities, and documents.`}
      confirmLabel="Delete Chapter"
      cancelLabel="Cancel"
      variant="danger"
      icon={<Trash2 size={28} strokeWidth={2} />}
      onConfirm={handleDeleteConfirm}
      onCancel={() => setDeleteTarget(null)}
    />
    </>
  );
}

