"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, ArrowLeft, AlertTriangle, FileText, Shield, Edit, Archive } from "lucide-react";
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
  status?: string;
  createdAt: string;
}

export default function SecRegistrationsPage() {
  const router = useRouter();

  // Data State
  const [record, setRecord] = useState<SecRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
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

  // Handle Archive Confirmation
  const handleArchiveConfirm = async () => {
    if (!record) return;
    setIsArchiving(true);
    try {
      const res = await api.patch(`/sec-registrations/${record.id}/archive`, {});
      if (res.success) {
        gooeyToast.success("SEC registration archived successfully");
        setShowArchiveModal(false);
        setRecord(null);
      } else {
        gooeyToast.error("Failed to archive record");
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to archive record");
    } finally {
      setIsArchiving(false);
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
      <div className="admin-shell admin-shell--main" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Back and Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
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
            <div className="sec-record-header">
              <div className="sec-record-header-info">
                <div style={{ background: "rgba(30, 83, 142, 0.08)", padding: "8px", borderRadius: "10px", color: "var(--p-blue)" }}>
                  <Shield size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--p-navy)", margin: 0 }}>Active SEC Registration</h3>
                  <p style={{ fontSize: "13px", color: "var(--r-text-muted)", margin: "2px 0 0" }}>Currently synced with the website landing page.</p>
                </div>
              </div>
              <div className="sec-record-header-actions">
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
                  onClick={() => setShowArchiveModal(true)}
                  className="about-btn about-btn--danger"
                  style={{ height: "40px", padding: "0 16px", background: "var(--p-gold-bg, #fef3c7)", color: "var(--p-gold-text, #92400e)", borderColor: "var(--p-gold-border, #fcd34d)" }}
                >
                  <Archive size={16} /> Archive
                </button>
              </div>
            </div>

            {/* Certificate Preview Display */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "center", width: "100%" }}>
              <div className="sec-doc-header-row">
                <span style={{ fontSize: "12px", color: "var(--r-text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>Official SEC Certificate Document</span>
                {record.imageUrl && (
                  <a
                    href={record.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-btn about-btn--secondary"
                    style={{ height: "32px", padding: "0 12px", fontSize: "12px" }}
                  >
                    Open Full Document ↗
                  </a>
                )}
              </div>
              {record.imageUrl ? (
                <div className="sec-cert-preview">
                  {isPdf(record.imageUrl) ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
                      <FileText size={64} style={{ color: "var(--p-rose)" }} />
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--p-navy)" }}>SEC Certificate PDF Document</span>
                      <a
                        href={record.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="about-btn about-btn--primary"
                        style={{ height: "40px", padding: "0 18px", fontSize: "13px" }}
                      >
                        View & Download PDF
                      </a>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={record.imageUrl}
                      alt="SEC Certificate Document"
                      style={{ width: "100%", height: "100%", maxHeight: "480px", objectFit: "contain", borderRadius: "8px" }}
                    />
                  )}
                </div>
              ) : (
                <p style={{ color: "var(--r-text-muted)", fontStyle: "italic", fontSize: "14px", padding: "30px 0" }}>No document uploaded.</p>
              )}
            </div>
          </div>
        ) : (
          /* Empty Placeholder State */
          <div className="about-editor-card" style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--p-navy)", marginBottom: "10px" }}>
              No SEC Registration record configured
            </h3>
            <p style={{ fontSize: "14px", color: "var(--r-text-muted)", marginBottom: "24px", maxWidth: "460px", marginLeft: "auto", marginRight: "auto" }}>
              Add the official SEC incorporation details to sync and display them on the website landing page.
            </p>
            <button
              type="button"
              onClick={() => setModalMode("create")}
              className="about-btn about-btn--primary"
              style={{ height: "42px", fontSize: "14px", padding: "0 20px", marginLeft: "auto", marginRight: "auto" }}
            >
              <Plus size={18} strokeWidth={2.5} /> Add SEC Registration
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
            imageUrl: record.imageUrl || undefined,
          } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalMode(null);
          }}
          isSubmitting={isSubmitting}
        />
      </SecRegistrationModal>

      {/* Archive Confirmation Modal */}
      <SecRegistrationModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        title="Confirm Archive"
        contentPadding="24px"
        scrollable={false}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: "10px",
            padding: "14px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}>
            <Archive size={20} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#92400e", margin: "0 0 4px 0" }}>
                Archive SEC Registration
              </h4>
              <p style={{ fontSize: "13px", color: "#78350f", margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to archive the active SEC registration record?
                This will move it to the System Archives and remove it from the public landing page. You can restore it anytime.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <button
              type="button"
              onClick={() => setShowArchiveModal(false)}
              disabled={isArchiving}
              className="focus-ring"
              style={{
                height: "42px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--r-text-mid)",
                background: "var(--r-surface-2)",
                border: "1px solid var(--r-border-mid)",
                cursor: isArchiving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleArchiveConfirm}
              disabled={isArchiving}
              className="focus-ring"
              style={{
                height: "42px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                background: isArchiving ? "#92400e" : "#d97706",
                border: "none",
                cursor: isArchiving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {isArchiving && <Loader2 className="animate-spin" size={16} />}
              {isArchiving ? "Archiving..." : "Archive Record"}
            </button>
          </div>
        </div>
      </SecRegistrationModal>
    </AdminSidebarLayout>
  );
}