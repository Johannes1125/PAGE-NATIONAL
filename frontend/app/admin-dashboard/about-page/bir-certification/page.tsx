"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, ArrowLeft, AlertTriangle, FileText, Hash, Shield, Calendar, Edit, Trash2 } from "lucide-react";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import { api, PaginatedResponse, PaginationMeta } from "../../../lib/api-client";
import Pagination from "../components/Pagination";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";

import "./bir-certification.css";
import "../about-page.css";
import "../../admin-dashboard.css";

import BirCertificationModal from "./components/BirCertificationModal";
import BirCertificationForm from "./components/BirCertificationForm";

interface BirCertification {
  id: string;
  registrationName: string;
  tinNumber: string;
  certificationNumber: string;
  exemptionCategory: string;
  dateOfIssuance: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BirCertificationPage() {
  const router = useRouter();

  // Data State
  const [record, setRecord] = useState<BirCertification | null>(null);
  const [recordsList, setRecordsList] = useState<BirCertification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });

  // Modals state
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security role verification
  const verifySession = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; user: { role: string } }>("/me");
      if (!res.success || res.user.role !== "admin") {
        router.push("/admin-login");
      }
    } catch (err) {
      router.push("/admin-login");
    }
  }, [router]);

  // Fetch Records
  const fetchRecord = useCallback(async (page = currentPage, limit = itemsPerPage) => {
    try {
      setIsLoading(true);
      const response = await api.get<PaginatedResponse<BirCertification>>(`/bir-certifications?page=${page}&limit=${limit}`);
      if (response.success && response.data) {
        setRecordsList(response.data);
        setRecord(response.data.length > 0 ? response.data[0] : null);
        if (response.meta) setMeta(response.meta);
      } else {
        setRecord(null);
        setRecordsList([]);
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to load BIR certification.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchRecord(newPage, itemsPerPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    fetchRecord(1, newLimit);
  };

  // Check auth and fetch on mount
  useEffect(() => {
    const init = async () => {
      await verifySession();
      await fetchRecord(currentPage, itemsPerPage);
    };
    init();
  }, [verifySession, fetchRecord]);

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to determine if file is PDF
  const isPdf = (url: string | null | undefined): boolean => {
    if (!url) return false;
    const cleanUrl = url.split(/[?#]/)[0];
    return cleanUrl.toLowerCase().endsWith(".pdf");
  };

  // Handle Form Submission (Create or Edit)
  const handleFormSubmit = async (
    values: any,
    imageFile: File | null,
    clearImage: boolean
  ) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("registrationName", values.registrationName);
      formData.append("tinNumber", values.tinNumber);
      formData.append("certificationNumber", values.certificationNumber);
      formData.append("exemptionCategory", values.exemptionCategory);
      formData.append("dateOfIssuance", values.dateOfIssuance);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (modalMode === "create") {
        const res = await api.postMultipart<{ success: boolean }>("/bir-certifications", formData);
        if (res.success) {
          gooeyToast.success("BIR certification created successfully");
          setModalMode(null);
          fetchRecord();
        } else {
          gooeyToast.error("Failed to create record");
        }
      } else if (modalMode === "edit" && record) {
        const res = await api.patchMultipart<{ success: boolean }>(
          `/bir-certifications/${record.id}`,
          formData
        );
        if (res.success) {
          gooeyToast.success("BIR certification updated successfully");
          setModalMode(null);
          fetchRecord();
        } else {
          gooeyToast.error("Failed to update record");
        }
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || "Failed to save record";
      gooeyToast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!record) return;
    setIsDeleting(true);
    try {
      const res = await api.delete<{ success: boolean }>(`/bir-certifications/${record.id}`);
      if (res.success) {
        gooeyToast.success("BIR certification deleted successfully");
        setShowDeleteModal(false);
        setRecord(null);
      } else {
        gooeyToast.error("Failed to delete record");
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to delete record");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminSidebarLayout
      pageClassName="admin-dashboard"
      mainClassName="admin-main"
      title="BIR Certification"
      subtitle="Manage the official BIR tax exemption record and certification document"
      eyebrow="Content Manager"
      seniorFriendlyHeader={true}
    >
      <div className="admin-shell admin-shell--main bir-certification-container">
        
        {/* Navigation Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            className="about-btn about-btn--secondary"
            onClick={() => router.push("/admin-dashboard/about-page")}
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        {/* Content Display */}
        {isLoading ? (
          <div className="about-editor-card" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
            <Loader2 className="animate-spin" size={32} style={{ color: "var(--p-blue)" }} />
          </div>
        ) : record ? (
          /* Active Record Card Display */
          <div className="about-editor-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--r-border-mid)", paddingBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "rgba(30, 83, 142, 0.08)", padding: "8px", borderRadius: "10px", color: "var(--p-blue)" }}>
                  <Shield size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}>Active BIR Certification</h3>
                  <p style={{ fontSize: "13px", color: "var(--r-text-muted)", margin: "2px 0 0" }}>Currently synced with the website landing page.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalMode("edit")}
                  className="about-btn about-btn--primary"
                  style={{ height: "40px", padding: "0 16px" }}
                >
                  <Edit size={16} /> Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="about-btn about-btn--danger"
                  style={{ height: "40px", padding: "0 16px" }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>

            {/* Two-Column Grid layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
              
              {/* Left Column: Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--r-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>Registration Name</span>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--p-navy)", margin: "4px 0 0" }}>{record.registrationName}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--r-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>Tax Identification Number (TIN)</span>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--p-navy)", margin: "4px 0 0", fontFamily: "monospace" }}>{record.tinNumber}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--r-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>Certification Number</span>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--p-navy)", margin: "4px 0 0", fontFamily: "monospace" }}>{record.certificationNumber}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--r-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>Exemption Category</span>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--r-text-mid)", margin: "4px 0 0" }}>{record.exemptionCategory}</p>
                </div>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--r-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>Date of Issuance</span>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--r-text-mid)", margin: "4px 0 0" }}>{formatDate(record.dateOfIssuance)}</p>
                </div>
              </div>

              {/* Right Column: Certificate Preview */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--r-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px", alignSelf: "flex-start" }}>Certificate Document</span>
                {record.imageUrl ? (
                  <div style={{
                    width: "100%",
                    maxWidth: "260px",
                    height: "320px",
                    borderRadius: "10px",
                    border: "1px solid var(--r-border-mid)",
                    background: "#f8fafc",
                    overflow: "hidden",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px",
                    position: "relative"
                  }}>
                    {isPdf(record.imageUrl) ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                        <FileText size={52} style={{ color: "var(--p-rose)" }} />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--p-navy)" }}>PDF Certificate</span>
                        <a
                          href={record.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="about-btn about-btn--secondary"
                          style={{ height: "36px", padding: "0 14px", fontSize: "12px" }}
                        >
                          View File
                        </a>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={record.imageUrl}
                        alt="BIR Certificate Document"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    )}
                  </div>
                ) : (
                  <p style={{ color: "var(--r-text-muted)", fontStyle: "italic", fontSize: "14px" }}>No document uploaded.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Empty Placeholder State */
          <div className="about-editor-card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--p-navy)", marginBottom: "10px" }}>
              No BIR Certification record configured
            </h3>
            <p style={{ fontSize: "14px", color: "var(--r-text-muted)", marginBottom: "24px", maxWidth: "460px", marginLeft: "auto", marginRight: "auto" }}>
              Add the official tax exemption details to sync and display them on the website landing page.
            </p>
            <button
              type="button"
              onClick={() => setModalMode("create")}
              className="about-btn about-btn--primary"
              style={{ height: "42px", fontSize: "14px", padding: "0 20px", marginLeft: "auto", marginRight: "auto" }}
            >
              <Plus size={18} strokeWidth={2.5} /> Add BIR Certification
            </button>
          </div>
        )}

        {meta.totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={meta.totalPages}
            totalItems={meta.totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Create / Edit Form Modal */}
      <BirCertificationModal
        isOpen={modalMode !== null}
        onClose={() => {
          setModalMode(null);
        }}
        title={modalMode === "create" ? "Add BIR Certification" : "Edit BIR Certification"}
        subtitle={modalMode === "create" 
          ? "Fill in the details below to configure the tax exemption record." 
          : "Fill in the details below to update the tax exemption record."
        }
        contentPadding="0px"
        scrollable={false}
      >
        <BirCertificationForm
          initialValues={record && modalMode === "edit" ? {
            registrationName: record.registrationName,
            tinNumber: record.tinNumber,
            certificationNumber: record.certificationNumber,
            exemptionCategory: record.exemptionCategory,
            dateOfIssuance: record.dateOfIssuance,
            imageUrl: record.imageUrl || undefined,
          } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalMode(null);
          }}
          isSubmitting={isSubmitting}
        />
      </BirCertificationModal>

      {/* Delete Confirmation Modal */}
      <BirCertificationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        contentPadding="24px"
        scrollable={false}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ 
            background: "var(--p-rose-pale)", 
            border: "1px solid rgba(244,63,94,0.2)", 
            borderRadius: "10px", 
            padding: "14px 18px",
            display: "flex", 
            alignItems: "flex-start", 
            gap: "10px",
          }}>
            <AlertTriangle size={20} style={{ color: "var(--p-rose)", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--p-rose)", margin: "0 0 4px 0" }}>
                Warning: Permanent Action
              </h4>
              <p style={{ fontSize: "13px", color: "var(--p-rose)", margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to delete the active BIR certification record?
                This action is permanent and will delete the document file from storage.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="focus-ring"
              style={{
                height: "42px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--r-text-mid)",
                background: "var(--r-surface-2)",
                border: "1px solid var(--r-border-mid)",
                cursor: isDeleting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="focus-ring"
              style={{
                height: "42px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                background: isDeleting ? "#c85a70" : "var(--p-rose)",
                border: "none",
                cursor: isDeleting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {isDeleting && <Loader2 className="animate-spin" size={16} />}
              {isDeleting ? "Deleting..." : "Delete Record"}
            </button>
          </div>
        </div>
      </BirCertificationModal>
    </AdminSidebarLayout>
  );
}
