"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, ArrowLeft, AlertTriangle, FileText, Shield, Edit, Trash2 } from "lucide-react";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import { api } from "../../../lib/api-client";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";

import "../about-page.css";
import "../../admin-dashboard.css";

import SecRegistrationModal from "./components/SecRegistrationModal";
import SecRegistrationForm from "./components/SecRegistrationForm";

interface SecRegistration {
  id: string;
  registrationName: string;
  registrationNumber: string;
  dateOfIncorporation: string;
  exemptionCategory: string;
  imageUrl?: string | null;
  createdAt: string;
}

export default function SecRegistrationsPage() {
  const router = useRouter();
  
  // Data State
  const [record, setRecord] = useState<SecRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch single active record (first item of list)
  const fetchRecord = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{
        success: boolean;
        data: SecRegistration[];
      }>("/sec-registrations?limit=1");

      if (response.success && response.data && response.data.length > 0) {
        setRecord(response.data[0]);
      } else {
        setRecord(null);
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to load SEC registration.");
    } finally {
      setIsLoading(false);
    }
  }, []);

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

    fetchRecord();
  }, [fetchRecord]);

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

  // Handle Create or Update Submission
  const handleFormSubmit = async (
    values: any,
    imageFile: File | null,
    clearImage: boolean
  ) => {
    setIsSubmitting(true);
    try {
      let finalImageUrl = values.imageUrl;

      // Handle Image Upload if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        try {
          const uploadRes = await api.postMultipart<{ success: boolean; imageUrl: string }>(
            "/sec-registrations/upload",
            formData
          );
          if (uploadRes.success) {
            finalImageUrl = uploadRes.imageUrl;
          } else {
            throw new Error("Upload failed");
          }
        } catch (uploadErr: any) {
          console.error(uploadErr);
          const errText = uploadErr.message || "";
          if (errText.includes("exceeds") || errText.includes("5MB")) {
            gooeyToast.error("File exceeds 5 MB");
          } else if (errText.includes("format") || errText.includes("only")) {
            gooeyToast.error("Invalid file format. Only JPG, JPEG, PNG, WEBP, and PDF are allowed.");
          } else {
            gooeyToast.error("Upload failed");
          }
          setIsSubmitting(false);
          return;
        }
      } else if (clearImage) {
        finalImageUrl = null;
      }

      const payload = {
        ...values,
        imageUrl: finalImageUrl,
      };

      if (modalMode === "create") {
        const res = await api.post("/sec-registrations", payload);
        if (res.success) {
          gooeyToast.success("SEC registration created successfully");
          setModalMode(null);
          fetchRecord();
        } else {
          gooeyToast.error("Failed to create record");
        }
      } else if (modalMode === "edit" && record) {
        const res = await api.put(`/sec-registrations/${record.id}`, payload);
        if (res.success) {
          gooeyToast.success("SEC registration updated successfully");
          setModalMode(null);
          fetchRecord();
        } else {
          gooeyToast.error("Failed to update record");
        }
      }
    } catch (err: any) {
      console.error(err);
      gooeyToast.error("Failed to save record");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!record) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/sec-registrations/${record.id}`);
      if (res.success) {
        gooeyToast.success("SEC registration deleted successfully");
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
      title="SEC Registration"
      subtitle="Manage the official SEC registration record and certificate document"
      eyebrow="Content Manager"
      seniorFriendlyHeader={true}
    >
      <div className="admin-shell admin-shell--main" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Back and Action Bar */}
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
          <div className="about-editor-card" style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 0" }}>
            <Loader2 className="animate-spin" size={40} style={{ color: "var(--p-blue)" }} />
          </div>
        ) : record ? (
          /* Active Record Card Display */
          <div className="about-editor-card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--r-border-mid)", paddingBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "rgba(30, 83, 142, 0.08)", padding: "10px", borderRadius: "10px", color: "var(--p-blue)" }}>
                  <Shield size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}>Active SEC Registration</h3>
                  <p style={{ fontSize: "14px", color: "var(--r-text-muted)", margin: "4px 0 0" }}>Currently synced with the website landing page.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setModalMode("edit")}
                  className="about-btn about-btn--primary"
                  style={{ height: "46px", padding: "0 20px" }}
                >
                  <Edit size={16} /> Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="about-btn about-btn--danger"
                  style={{ height: "46px", padding: "0 20px" }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>

            {/* Grid Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
              
              {/* Left Column: Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <span style={{ fontSize: "13px", color: "var(--r-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>Registration Name</span>
                  <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--p-navy)", margin: "6px 0 0" }}>{record.registrationName}</p>
                </div>
                <div>
                  <span style={{ fontSize: "13px", color: "var(--r-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>Registration Number</span>
                  <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--p-navy)", margin: "6px 0 0", fontFamily: "monospace" }}>{record.registrationNumber}</p>
                </div>
                <div>
                  <span style={{ fontSize: "13px", color: "var(--r-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>Date of Incorporation</span>
                  <p style={{ fontSize: "18px", fontWeight: 600, color: "var(--p-navy)", margin: "6px 0 0" }}>{formatDate(record.dateOfIncorporation)}</p>
                </div>
                <div>
                  <span style={{ fontSize: "13px", color: "var(--r-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>Corporation Type</span>
                  <p style={{ fontSize: "17px", fontWeight: 500, color: "var(--r-text-mid)", margin: "6px 0 0" }}>{record.exemptionCategory}</p>
                </div>
              </div>

              {/* Right Column: Certificate Preview */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--r-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px", alignSelf: "flex-start" }}>Certificate Document</span>
                {record.imageUrl ? (
                  <div style={{
                    width: "100%",
                    maxWidth: "280px",
                    height: "360px",
                    borderRadius: "12px",
                    border: "1px solid var(--r-border-mid)",
                    background: "#f8fafc",
                    overflow: "hidden",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "16px",
                    position: "relative"
                  }}>
                    {isPdf(record.imageUrl) ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                        <FileText size={64} style={{ color: "var(--p-rose)" }} />
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--p-navy)" }}>PDF Certificate</span>
                        <a
                          href={record.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="about-btn about-btn--secondary"
                          style={{ height: "38px", padding: "0 16px", fontSize: "13px" }}
                        >
                          View File
                        </a>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={record.imageUrl}
                        alt="SEC Certificate Document"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    )}
                  </div>
                ) : (
                  <p style={{ color: "var(--r-text-muted)", fontStyle: "italic", fontSize: "15px" }}>No document uploaded.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Empty Placeholder State */
          <div className="about-editor-card" style={{ padding: "60px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📄</div>
            <h3 style={{ fontSize: "24px", fontWeight: 700, color: "var(--p-navy)", marginBottom: "12px" }}>
              No SEC Registration record configured
            </h3>
            <p style={{ fontSize: "16px", color: "var(--r-text-muted)", marginBottom: "28px", maxWidth: "480px", marginLeft: "auto", marginRight: "auto" }}>
              Add the official SEC incorporation details to sync and display them on the website landing page.
            </p>
            <button
              type="button"
              onClick={() => setModalMode("create")}
              className="about-btn about-btn--primary"
              style={{ height: "52px", fontSize: "16px", padding: "0 28px", marginLeft: "auto", marginRight: "auto" }}
            >
              <Plus size={20} strokeWidth={2.5} /> Add SEC Registration
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      <SecRegistrationModal
        isOpen={modalMode !== null}
        onClose={() => {
          setModalMode(null);
        }}
        title={modalMode === "create" ? "Add SEC Registration Record" : "Edit SEC Registration Record"}
        subtitle={modalMode === "create" 
          ? "Fill in the details below to configure the SEC registration record." 
          : "Fill in the details below to update the SEC registration record."
        }
        contentPadding="0px"
        scrollable={false}
      >
        <SecRegistrationForm
          initialValues={record && modalMode === "edit" ? {
            registrationName: record.registrationName,
            registrationNumber: record.registrationNumber,
            dateOfIncorporation: record.dateOfIncorporation,
            exemptionCategory: record.exemptionCategory,
            imageUrl: record.imageUrl || undefined,
          } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalMode(null);
          }}
          isSubmitting={isSubmitting}
        />
      </SecRegistrationModal>

      {/* Delete Confirmation Modal */}
      <SecRegistrationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        contentPadding="32px"
        scrollable={false}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ 
            background: "var(--p-rose-pale)", 
            border: "1px solid rgba(244,63,94,0.2)", 
            borderRadius: "12px", 
            padding: "16px 24px",
            display: "flex", 
            alignItems: "flex-start", 
            gap: "12px",
          }}>
            <AlertTriangle size={24} style={{ color: "var(--p-rose)", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-rose)", margin: "0 0 6px 0" }}>
                Warning: Permanent Action
              </h4>
              <p style={{ fontSize: "16px", color: "var(--p-rose)", margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to delete the active SEC registration record?
                This action is permanent and will delete the document file from storage.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="focus-ring"
              style={{
                height: "52px",
                borderRadius: "12px",
                fontSize: "18px",
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
                height: "52px",
                borderRadius: "12px",
                fontSize: "18px",
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
              {isDeleting && <Loader2 className="animate-spin" size={18} />}
              {isDeleting ? "Deleting..." : "Delete Record"}
            </button>
          </div>
        </div>
      </SecRegistrationModal>
    </AdminSidebarLayout>
  );
}
