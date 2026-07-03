"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Landmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";

import AdminSidebarLayout from "../components/AdminSidebarLayout";
import ConventionCard from "./components/ConventionCard";
import ConventionTable from "./components/ConventionTable";
import ViewToggle from "./components/ViewToggle";
import EmptyState from "./components/EmptyState";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ConfirmDialog from "./components/ConfirmDialog";
import type { Convention } from "./types";
import { conventionsApi } from "../../lib/api-client";
import "../admin-dashboard.css";
import "./conventions.css";

export default function ConventionsPage() {
  const router = useRouter();

  const [conventions, setConventions] = useState<Convention[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Convention | null>(null);

  const fetchConventions = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setIsLoading(true);
    setError(null);

    try {
      const res = await conventionsApi.list();
      if (res?.success && Array.isArray(res.data)) {
        setConventions(res.data);
      } else if (res?.success && res.data) {
        setConventions(Array.isArray(res.data) ? res.data : [res.data]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load conventions.";
      setError(msg);
      gooeyToast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConventions(true);
  }, [fetchConventions]);

  const handleOpenCreate = () => {
    router.push("/admin-dashboard/conventions/create");
  };

  const handleOpenEdit = (convention: Convention) => {
    router.push(`/admin-dashboard/conventions/${convention.id}/edit`);
  };

  const handleTogglePublish = async (convention: Convention) => {
    const isPublished = convention.status === "published";
    try {
      const res = isPublished
        ? await conventionsApi.unpublish(convention.id)
        : await conventionsApi.publish(convention.id);

      if (res?.success && res.data) {
        setConventions((prev) =>
          prev.map((c) => (c.id === convention.id ? res.data : c)),
        );
        gooeyToast.success(
          isPublished
            ? `"${convention.title}" set to Draft.`
            : `"${convention.title}" Published ✓`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status.";
      gooeyToast.error(msg);
    }
  };

  const handleDeleteRequest = (convention: Convention) => {
    setDeleteTarget(convention);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await conventionsApi.delete(deleteTarget.id);
      setConventions((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      gooeyToast.success(`"${deleteTarget.title}" deleted successfully.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete convention.";
      gooeyToast.error(msg);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  const headerActionsBlock = (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={handleOpenCreate}
        className="conv-btn conv-btn--primary"
        style={{ minHeight: "52px", fontSize: "18px", fontWeight: 600, padding: "0 28px", borderRadius: "8px" }}
        aria-label="Create new convention"
      >
        <Plus size={24} strokeWidth={3} aria-hidden="true" />
        <span>Create New Convention</span>
      </button>
    </div>
  );

  return (
    <>
      <AdminSidebarLayout
        pageClassName="conv-management-page"
        mainClassName="admin-main-content"
        eyebrow="CONVENTION MANAGEMENT"
        title="All Conventions"
        subtitle="Manage all PAGE conventions — create, edit, publish, and track convention records from one centralized dashboard."
        seniorFriendlyHeader={true}
        headerActions={headerActionsBlock}
        titleIcon={<Landmark size={28} strokeWidth={2.2} aria-hidden="true" />}
        premiumHeader={true}
      >
        <motion.div
          className="conv-container pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {isLoading ? (
            <LoadingSkeleton type={viewMode === "card" ? "cards" : "table"} />
          ) : error ? (
            <div className="conv-empty">
              <h3 className="conv-empty__title">Failed to Load</h3>
              <p className="conv-empty__subtitle">{error}</p>
              <div className="conv-empty__actions">
                <button
                  type="button"
                  className="conv-btn conv-btn--primary"
                  onClick={() => fetchConventions(true)}
                  style={{ minHeight: "52px", fontSize: "18px", padding: "0 28px" }}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : conventions.length === 0 ? (
            <EmptyState onCreateConvention={handleOpenCreate} />
          ) : (
            <section className="conv-section" aria-label="Conventions list">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="conv-section__label">
                  All Conventions
                  <span className="ml-3 text-slate-400 text-[16px] font-normal">
                    ({conventions.length})
                  </span>
                </h2>
                <ViewToggle viewMode={viewMode} onChange={setViewMode} />
              </div>

              <AnimatePresence mode="wait">
                {viewMode === "card" ? (
                  <motion.div
                    key="card-view"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="conv-grid"
                  >
                    {conventions.map((convention) => (
                      <ConventionCard
                        key={convention.id}
                        convention={convention}
                        onEdit={handleOpenEdit}
                        onDelete={handleDeleteRequest}
                        onTogglePublish={handleTogglePublish}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list-view"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <ConventionTable
                      conventions={conventions}
                      onEdit={handleOpenEdit}
                      onDelete={handleDeleteRequest}
                      onTogglePublish={handleTogglePublish}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          )}
        </motion.div>
      </AdminSidebarLayout>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Convention?"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
