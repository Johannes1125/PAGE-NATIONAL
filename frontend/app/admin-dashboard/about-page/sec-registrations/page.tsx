"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import { api } from "../../../lib/api-client";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";

import "../about-page.css";
import "../../admin-dashboard.css";

import SecRegistrationTable from "./components/SecRegistrationTable";
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
  const [records, setRecords] = useState<SecRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Search Filters
  const [searchName, setSearchName] = useState("");
  const [searchNumber, setSearchNumber] = useState("");

  // Modals state
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SecRegistration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<SecRegistration | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Records
  const fetchRecords = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("page", String(page));
      queryParams.append("limit", "10");
      if (searchName.trim()) queryParams.append("name", searchName);
      if (searchNumber.trim()) queryParams.append("number", searchNumber);

      const response = await api.get<{
        success: boolean;
        data: SecRegistration[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>(`/sec-registrations?${queryParams.toString()}`);

      if (response.success) {
        setRecords(response.data || []);
        setPagination({
          total: response.meta.total,
          page: response.meta.page,
          limit: response.meta.limit,
          totalPages: response.meta.totalPages,
        });
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to load SEC registrations.");
    } finally {
      setIsLoading(false);
    }
  }, [searchName, searchNumber]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRecords(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchName, searchNumber, fetchRecords]);

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
            gooeyToast.error("Image exceeds 5 MB");
          } else if (errText.includes("format") || errText.includes("only")) {
            gooeyToast.error("Invalid image format");
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
          fetchRecords(1);
        } else {
          gooeyToast.error("Failed to create record");
        }
      } else if (modalMode === "edit" && selectedRecord) {
        const res = await api.put(`/sec-registrations/${selectedRecord.id}`, payload);
        if (res.success) {
          gooeyToast.success("SEC registration updated successfully");
          setModalMode(null);
          setSelectedRecord(null);
          fetchRecords(pagination.page);
        } else {
          gooeyToast.error("Failed to update record");
        }
      }
    } catch (err: any) {
      console.error(err);
      if (modalMode === "create") {
        gooeyToast.error("Failed to create record");
      } else {
        gooeyToast.error("Failed to update record");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingRecord) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/sec-registrations/${deletingRecord.id}`);
      if (res.success) {
        gooeyToast.success("SEC registration deleted successfully");
        setDeletingRecord(null);
        fetchRecords(1);
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
      subtitle="Manage official SEC registration records and certificate documents"
      eyebrow="Content Manager"
      seniorFriendlyHeader={true}
    >
      <div className="admin-shell admin-shell--main">
        
        {/* Back and Add Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <button
            type="button"
            className="about-btn about-btn--secondary"
            onClick={() => router.push("/admin-dashboard/about-page")}
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          <button
            type="button"
            onClick={() => {
              setSelectedRecord(null);
              setModalMode("create");
            }}
            className="about-btn about-btn--primary"
          >
            <Plus size={20} strokeWidth={2.5} />
            Add SEC Registration
          </button>
        </div>

        {/* Search & Filters */}
        <div 
          className="about-editor-card"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          <div className="about-form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="searchName" className="about-form-label">
              Search by Registration Name
            </label>
            <div style={{ position: "relative" }}>
              <Search 
                size={18} 
                style={{ 
                  position: "absolute", 
                  left: "16px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "var(--r-text-muted)" 
                }} 
              />
              <input
                id="searchName"
                type="text"
                placeholder="Enter registration name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="about-input focus-ring"
                style={{
                  paddingLeft: "44px",
                }}
              />
            </div>
          </div>

          <div className="about-form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="searchNumber" className="about-form-label">
              Search by Registration Number
            </label>
            <div style={{ position: "relative" }}>
              <Search 
                size={18} 
                style={{ 
                  position: "absolute", 
                  left: "16px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "var(--r-text-muted)" 
                }} 
              />
              <input
                id="searchNumber"
                type="text"
                placeholder="Enter registration number..."
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                className="about-input focus-ring"
                style={{
                  paddingLeft: "44px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Content Table Card */}
        <div className="about-editor-card" style={{ padding: 0, overflow: "hidden" }}>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "80px 0" }}>
              <Loader2 className="animate-spin" size={40} style={{ color: "var(--p-blue)" }} />
            </div>
          ) : (
            <SecRegistrationTable
              records={records}
              onEdit={(record) => {
                setSelectedRecord(record);
                setModalMode("edit");
              }}
              onDelete={(record) => {
                setDeletingRecord(record);
              }}
              pagination={pagination}
              onPageChange={(page) => fetchRecords(page)}
            />
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <SecRegistrationModal
        isOpen={modalMode !== null}
        onClose={() => {
          setModalMode(null);
          setSelectedRecord(null);
        }}
        title={modalMode === "create" ? "Add SEC Registration Record" : "Edit SEC Registration Record"}
        subtitle={modalMode === "create" 
          ? "Fill in the details below to add a new SEC registration record." 
          : "Fill in the details below to update the SEC registration record."
        }
        contentPadding="0px"
        scrollable={false}
      >
        <SecRegistrationForm
          initialValues={selectedRecord ? {
            registrationName: selectedRecord.registrationName,
            registrationNumber: selectedRecord.registrationNumber,
            dateOfIncorporation: selectedRecord.dateOfIncorporation,
            exemptionCategory: selectedRecord.exemptionCategory,
            imageUrl: selectedRecord.imageUrl || undefined,
          } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalMode(null);
            setSelectedRecord(null);
          }}
          isSubmitting={isSubmitting}
        />
      </SecRegistrationModal>

      {/* Delete Confirmation Modal */}
      <SecRegistrationModal
        isOpen={deletingRecord !== null}
        onClose={() => setDeletingRecord(null)}
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
                Are you sure you want to delete the SEC registration for <strong>{deletingRecord?.registrationName}</strong>?
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <button
              type="button"
              onClick={() => setDeletingRecord(null)}
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
