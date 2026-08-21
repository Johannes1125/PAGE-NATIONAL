"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  Edit2,
  AlertTriangle,
  Loader2,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import { api } from "../../lib/api-client";
import { gooeyToast } from "goey-toast";
import { NationalOfficer } from "./types";

import "goey-toast/styles.css";
import "./national-officers.css";
import "../admin-dashboard.css";

// Helper to extract initials from name, ignoring common titles
function getInitials(name: string): string {
  const cleaned = name.replace(/^(Dr\.|Atty\.|Prof\.|Engr\.)\s+/i, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "JD";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Helpers for category labels and badges
function getCategoryLabel(category: string): string {
  if (category === "National Officers") return "NATIONAL OFFICERS";
  if (category === "Board of Directors") return "BOARD OF DIRECTORS";
  return category.toUpperCase();
}

function getCategoryClass(category: string): string {
  if (category === "National Officers") return "badge-national-officers";
  if (category === "Board of Directors") return "badge-board-directors";
  return "badge-generic";
}

export default function NationalOfficersManagement() {
  const router = useRouter();

  // Data State
  const [officers, setOfficers] = useState<NationalOfficer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState("");
  const [positionCategory, setPositionCategory] = useState("National Officers");
  const [role, setRole] = useState("President");
  const [description, setDescription] = useState("");

  // Validation State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Delete Confirmation State
  const [deletingRecord, setDeletingRecord] = useState<NationalOfficer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // ── Authentication Check ──
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

    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/national-officers");
      if (res.success) {
        setOfficers(res.data);
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to load officer records.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!memberName.trim()) {
      errors.memberName = "Member name is required.";
    } else if (memberName.length > 255) {
      errors.memberName = "Member name must not exceed 255 characters.";
    }

    if (!positionCategory) {
      errors.positionCategory = "Position category is required.";
    } else if (!["National Officers", "Board of Directors"].includes(positionCategory)) {
      errors.positionCategory = "Invalid position category selected.";
    }

    if (!role) {
      errors.role = "Role selection is required.";
    } else if (!["President", "Vice President", "Secretary", "Treasurer", "Auditor", "Other"].includes(role)) {
      errors.role = "Invalid role selected.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const payload = {
      memberName: memberName.trim(),
      positionCategory,
      role,
      description: description.trim() || undefined,
    };

    try {
      if (editingId) {
        // Update mode
        const res = await api.patch(`/national-officers/${editingId}`, payload);
        if (res.success) {
          gooeyToast.success("Officer updated successfully.");
          resetForm();
          setIsFormModalOpen(false);
          fetchOfficers(); // Refresh list to get correct role hierarchy ordering
        } else {
          gooeyToast.error("Failed to save officer record.");
        }
      } else {
        // Create mode
        const res = await api.post("/national-officers", payload);
        if (res.success) {
          gooeyToast.success("Officer created successfully.");
          resetForm();
          setIsFormModalOpen(false);
          fetchOfficers(); // Refresh list to get correct role hierarchy ordering
        } else {
          gooeyToast.error("Failed to save officer record.");
        }
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to save officer record.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (officer: NationalOfficer) => {
    setEditingId(officer.id);
    setMemberName(officer.memberName);
    setPositionCategory(officer.positionCategory);
    setRole(officer.role);
    setDescription(officer.description || "");
    setValidationErrors({});
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (officer: NationalOfficer) => {
    setDeletingRecord(officer);
  };

  const confirmDelete = async () => {
    if (!deletingRecord) return;
    setIsDeleting(true);

    try {
      const res = await api.delete(`/national-officers/${deletingRecord.id}`);
      if (res.success) {
        setOfficers((prev) => prev.filter((o) => o.id !== deletingRecord.id));
        gooeyToast.success("Officer deleted successfully.");
        setDeletingRecord(null);
      } else {
        gooeyToast.error("Failed to delete officer record.");
      }
    } catch (err) {
      console.error(err);
      gooeyToast.error("Failed to delete officer record.");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setMemberName("");
    setPositionCategory("National Officers");
    setRole("President");
    setDescription("");
    setValidationErrors({});
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Search Filter
  const filteredOfficers = officers.filter((off) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      off.memberName.toLowerCase().includes(q) ||
      off.role.toLowerCase().includes(q) ||
      off.positionCategory.toLowerCase().includes(q) ||
      (off.description && off.description.toLowerCase().includes(q))
    );
    const matchesCategory = categoryFilter === "all" || off.positionCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <AdminSidebarLayout
        pageClassName="admin-dashboard"
        mainClassName="admin-main"
        title="National Officers & Board"
        subtitle="Loading roster registry..."
        eyebrow="Content Manager"
        seniorFriendlyHeader={true}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "100px" }}>
          <Loader2 className="animate-spin" size={48} color="var(--p-blue)" />
        </div>
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout
      pageClassName="admin-dashboard"
      mainClassName="admin-main"
      title="National Officers & Board"
      subtitle="Executive officers and board directors content management"
      eyebrow="Content Manager"
      seniorFriendlyHeader={true}
    >
      <div className="officers-container">
        {/* Back Button */}
        <div className="back-btn-wrapper">
          <button
            type="button"
            className="btn-accessible btn-accessible-secondary"
            onClick={() => router.push("/admin-dashboard/about-page")}
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        <div className="officers-layout-grid">
          {/* Table Card Roster */}
          <div className="officers-card">
            <div className="registry-header-row">
              <div>
                <h3 className="card-title-lg" style={{ marginBottom: "4px" }}>
                  Current Registry
                </h3>
                <span className="registry-subtitle">
                  Showing {filteredOfficers.length} of {officers.length} members
                </span>
              </div>
              <div className="registry-actions-header">
                <div className="search-bar-wrapper">
                  <Search size={18} className="search-icon-inside" />
                  <input
                    type="text"
                    placeholder="Search name, role, or category"
                    className="search-input-field"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  aria-label="Filter officers by category"
                  className="category-filter-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="National Officers">National Officers</option>
                  <option value="Board of Directors">Board of Directors</option>
                </select>
                <button
                  type="button"
                  className="btn-accessible btn-accessible-primary add-officer-btn"
                  onClick={() => {
                    resetForm();
                    setIsFormModalOpen(true);
                  }}
                >
                  + Add Officer
                </button>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="officers-table">
                <thead>
                  <tr>
                    <th>Member Name</th>
                    <th>Category</th>
                    <th>Role</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOfficers.map((off) => (
                    <tr key={off.id}>
                      <td data-label="Member Name">
                        <div className="name-cell-inner">
                          <div className="avatar-circle">
                            {getInitials(off.memberName)}
                          </div>
                          <span className="name-cell-text">{off.memberName}</span>
                        </div>
                      </td>
                      <td data-label="Category">
                        <span className={`role-badge ${getCategoryClass(off.positionCategory)}`}>
                          {getCategoryLabel(off.positionCategory)}
                        </span>
                      </td>
                      <td data-label="Role">
                        <span className="member-role-text">{off.role}</span>
                      </td>
                      <td data-label="Description">
                        <p className="description-text" title={off.description || ""}>
                          {off.description || "—"}
                        </p>
                      </td>
                      <td data-label="Created">{formatDate(off.createdAt)}</td>
                      <td data-label="Actions">
                        <div className="member-actions-col">
                          <button
                            type="button"
                            className="action-btn-circle edit-btn"
                            onClick={() => handleEditClick(off)}
                            aria-label={`Edit ${off.memberName}`}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            className="action-btn-circle delete-btn"
                            onClick={() => handleDeleteClick(off)}
                            aria-label={`Delete ${off.memberName}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOfficers.length === 0 && (
                    <tr className="empty-row">
                      <td colSpan={6} className="empty-state-cell">
                        No leadership records found. Register a new officer using the form.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── REGISTER / EDIT OFFICER MODAL ── */}
      {isFormModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="form-modal-backdrop"
            onClick={() => !isSaving && setIsFormModalOpen(false)}
            aria-hidden="true"
          />
          {/* Dialog Modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-modal-title"
            className="form-modal-dialog"
          >
            <div className="form-modal-header">
              <div>
                <span className="form-eyebrow">
                  {editingId ? "EDIT ENTRY" : "NEW ENTRY"}
                </span>
                <h3 id="form-modal-title" className="modal-title-accessible" style={{ marginTop: "4px" }}>
                  {editingId ? "Edit Officer Details" : "Register Officer or Board Member"}
                </h3>
              </div>
              <button
                type="button"
                className="form-modal-close-btn"
                onClick={() => !isSaving && setIsFormModalOpen(false)}
                aria-label="Close form modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="officers-form" noValidate>
              {/* Member Name */}
              <div className="form-group-accessible">
                <label htmlFor="memberName" className="label-accessible">
                  Member Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  id="memberName"
                  type="text"
                  placeholder="e.g. Dr. Lino C. Reynoso"
                  className="input-accessible"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  disabled={isSaving}
                  required
                />
                {validationErrors.memberName && (
                  <span className="validation-error-text" role="alert">
                    {validationErrors.memberName}
                  </span>
                )}
              </div>

              {/* Position Category + Role, side by side on wide screens */}
              <div className="form-row-2col">
                <div className="form-group-accessible">
                  <label htmlFor="positionCategory" className="label-accessible">
                    Position Category <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div className="select-wrapper-accessible">
                    <select
                      id="positionCategory"
                      className="select-accessible"
                      value={positionCategory}
                      onChange={(e) => setPositionCategory(e.target.value)}
                      disabled={isSaving}
                      required
                    >
                      <option value="National Officers">National Officers</option>
                      <option value="Board of Directors">Board of Directors</option>
                    </select>
                    <ChevronDown size={18} className="select-chevron-icon" />
                  </div>
                  {validationErrors.positionCategory && (
                    <span className="validation-error-text" role="alert">
                      {validationErrors.positionCategory}
                    </span>
                  )}
                </div>

                <div className="form-group-accessible">
                  <label htmlFor="role" className="label-accessible">
                    Role <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div className="select-wrapper-accessible">
                    <select
                      id="role"
                      className="select-accessible"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={isSaving}
                      required
                    >
                      <option value="President">President</option>
                      <option value="Vice President">Vice President</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Treasurer">Treasurer</option>
                      <option value="Auditor">Auditor</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown size={18} className="select-chevron-icon" />
                  </div>
                  {validationErrors.role && (
                    <span className="validation-error-text" role="alert">
                      {validationErrors.role}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="form-group-accessible">
                <div className="form-group-header">
                  <label htmlFor="description" className="label-accessible">
                    Description / Bio
                  </label>
                  <span className="label-optional">Optional</span>
                </div>
                <textarea
                  id="description"
                  placeholder="Provide background context or institutional association..."
                  className="textarea-accessible"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSaving}
                />
                {validationErrors.description && (
                  <span className="validation-error-text" role="alert">
                    {validationErrors.description}
                  </span>
                )}
              </div>

              {/* Form Buttons */}
              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn-accessible btn-accessible-secondary"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-accessible btn-accessible-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Save Changes"
                  ) : (
                    "+ Add to Roster"
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deletingRecord && (
        <>
          {/* Backdrop */}
          <div
            className="modal-backdrop-accessible"
            onClick={() => !isDeleting && setDeletingRecord(null)}
            aria-hidden="true"
          />
          {/* Modal Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="modal-dialog-accessible"
          >
            <div className="modal-header-container">
              <div className="modal-icon-danger">
                <AlertTriangle size={32} />
              </div>
              <h3 id="delete-modal-title" className="modal-title-accessible">
                Confirm Deletion
              </h3>
            </div>

            <p className="modal-body-accessible">
              Are you sure you want to delete this officer record?
              <br />
              <strong style={{ color: "var(--p-navy)" }}>{deletingRecord.memberName}</strong>
              {` as `}
              <strong style={{ color: "var(--p-blue)" }}>{deletingRecord.role}</strong>
              {` will be permanently removed.`}
            </p>

            <div className="modal-actions-accessible">
              <button
                type="button"
                className="btn-accessible btn-accessible-secondary"
                disabled={isDeleting}
                onClick={() => setDeletingRecord(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-accessible btn-accessible-primary"
                style={{ backgroundColor: "var(--p-rose, #e11d48)" }}
                disabled={isDeleting}
                onClick={confirmDelete}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </AdminSidebarLayout>
  );
}