"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Building2,
  Users,
  UserCheck,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  ClipboardList
} from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import { MembershipApplication } from "../../lib/membership-types";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import "./membership-applications.css";
import "../admin-dashboard.css";

// ── Initial Mock Data ────────────────────────────────────────────────────────

const INITIAL_MOCK_APPLICATIONS: MembershipApplication[] = [
  {
    id: "MOCK-2025-0042",
    applicantName: "Dr. Elizabeth Ramos",
    email: "elizabeth.ramos@ust.edu.ph",
    membershipType: "life",
    submittedAt: "06/09/2026",
    status: "pending",
    formData: {
      fullName: "Dr. Elizabeth Ramos",
      email: "elizabeth.ramos@ust.edu.ph",
      phone: "09179876543",
      institution: "University of Santo Tomas",
      address: "España Blvd, Sampaloc, Manila",
      membershipType: "life",
      documents: {
        "Valid ID": { name: "UST_Faculty_ID.pdf", size: 1024000 },
        "Proof of Membership History": { name: "PAGE_Certificates_2023_2025.pdf", size: 3500000 }
      }
    }
  },
  {
    id: "MOCK-2025-0043",
    applicantName: "Dr. Reynaldo Santos",
    email: "reynaldo.santos@dlsu.edu.ph",
    membershipType: "institutional",
    submittedAt: "06/08/2026",
    status: "under_review",
    formData: {
      fullName: "Dr. Reynaldo Santos",
      email: "reynaldo.santos@dlsu.edu.ph",
      phone: "09181234567",
      institution: "De La Salle University",
      address: "2401 Taft Ave, Malate, Manila",
      membershipType: "institutional",
      documents: {
        "DTI/SEC Certificate": { name: "SEC_DLSU_Incorporation.pdf", size: 4800000 },
        "Letter of Intent": { name: "DLSU_PAGE_Intent_Letter.pdf", size: 850000 }
      }
    }
  },
  {
    id: "MOCK-2025-0044",
    applicantName: "Prof. Maria Clara",
    email: "maria.clara@up.edu.ph",
    membershipType: "regular",
    submittedAt: "06/05/2026",
    status: "approved",
    formData: {
      fullName: "Prof. Maria Clara",
      email: "maria.clara@up.edu.ph",
      phone: "09205556666",
      institution: "University of the Philippines Diliman",
      address: "Quezon Hall, UP Diliman, Quezon City",
      membershipType: "regular",
      documents: {
        "Valid ID": { name: "UP_ID_Clara.png", size: 1200000 },
        "Proof of Affiliation": { name: "UP_Certificate_Of_Employment.pdf", size: 750000 }
      }
    }
  },
  {
    id: "MOCK-2025-0045",
    applicantName: "Dr. Jose Rizal",
    email: "jose.rizal@admu.edu.ph",
    membershipType: "associate",
    submittedAt: "06/04/2026",
    status: "rejected",
    formData: {
      fullName: "Dr. Jose Rizal",
      email: "jose.rizal@admu.edu.ph",
      phone: "09157778888",
      institution: "Ateneo de Manila University",
      address: "Katipunan Ave, Quezon City",
      membershipType: "associate",
      documents: {
        "Valid ID": { name: "Ateneo_Faculty_ID.jpg", size: 2100000 },
        "Endorsement Letter": { name: "Ateneo_Dean_Recommendation.pdf", size: 950000 }
      }
    },
    rejectionReason: "The submitted recommendation letter was missing the official signature of the Dean. Please upload a signed copy."
  },
  {
    id: "MOCK-2025-0046",
    applicantName: "Prof. Leonor Rivera",
    email: "leonor.rivera@tup.edu.ph",
    membershipType: "regular",
    submittedAt: "06/01/2026",
    status: "pending",
    formData: {
      fullName: "Prof. Leonor Rivera",
      email: "leonor.rivera@tup.edu.ph",
      phone: "09083334444",
      institution: "Technological University of the Philippines",
      address: "Ayala Blvd, Ermita, Manila",
      membershipType: "regular",
      documents: {
        "Valid ID": { name: "TUP_ID_Leonor.png", size: 1450000 },
        "Proof of Affiliation": { name: "TUP_Dean_Endorsement.pdf", size: 680000 }
      }
    }
  }
];

const categoryLabels: Record<string, string> = {
  life: "Life Member",
  institutional: "Institutional Member",
  associate: "Associate Member",
  regular: "Regular Member"
};

const categoryIcons: Record<string, React.ComponentType<any>> = {
  life: Users,
  institutional: Building2,
  associate: UserCheck,
  regular: UserPlus
};

// ── Drawer Animation Configuration ──────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring" as const, damping: 26, stiffness: 220 } },
  exit: { x: "100%", transition: { ease: "easeInOut" as const, duration: 0.2 } }
};

// ── Admin Dashboard Component ───────────────────────────────────────────────

export default function MembershipApplicationsPage() {
  const [applications, setApplications] = useState<MembershipApplication[]>(INITIAL_MOCK_APPLICATIONS);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  
  // Table filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Rejection panel open flow
  const [showRejectPanel, setShowRejectPanel] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [rejectionError, setRejectionError] = useState("");

  const selectedApp = applications.find(app => app.id === selectedAppId) || null;

  // Filtered applications
  const filteredApps = applications.filter(app => {
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    const matchType = typeFilter === "all" || app.membershipType === typeFilter;
    return matchStatus && matchType;
  });

  const handleOpenReview = (appId: string) => {
    setSelectedAppId(appId);
    setShowRejectPanel(false);
    setRejectionReasonInput("");
    setRejectionError("");
  };

  const handleCloseReview = () => {
    setSelectedAppId(null);
    setShowRejectPanel(false);
    setRejectionReasonInput("");
    setRejectionError("");
  };

  // ── Approval Decision Logic ────────────────────────────────────────────────

  const handleApprove = () => {
    if (!selectedApp) return;

    // Optimistic state update
    setApplications(prev =>
      prev.map(app =>
        app.id === selectedApp.id
          ? { ...app, status: "approved" as const }
          : app
      )
    );

    gooeyToast.success(`Application for ${selectedApp.applicantName} approved successfully.`);
    handleCloseReview();
  };

  const handleRejectInit = () => {
    setShowRejectPanel(true);
    setRejectionReasonInput(selectedApp?.rejectionReason || "");
  };

  const handleRejectCancel = () => {
    setShowRejectPanel(false);
    setRejectionError("");
  };

  const handleConfirmReject = () => {
    if (!selectedApp) return;
    if (!rejectionReasonInput.trim()) {
      setRejectionError("Rejection feedback is required.");
      gooeyToast.error("Rejection feedback is required.");
      return;
    }

    // Optimistic state update
    setApplications(prev =>
      prev.map(app =>
        app.id === selectedApp.id
          ? { ...app, status: "rejected" as const, rejectionReason: rejectionReasonInput }
          : app
      )
    );

    gooeyToast.success(`Application for ${selectedApp.applicantName} rejected. Feedback has been sent.`);
    handleCloseReview();
  };

  // File size conversion helper
  const formatBytes = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb >= 1024) {
      return (kb / 1024).toFixed(2) + " MB";
    }
    return kb.toFixed(0) + " KB";
  };

  return (
    <AdminSidebarLayout
      pageClassName="applications-page"
      mainClassName="applications-main"
      title="Membership Applications"
      subtitle="Verify credentials and approve/reject registration submissions."
      eyebrow="Registrar Panel"
    >
      <div className="applications-content">
        {/* Toolbar & Filters */}
        <div className="applications-toolbar">
          <div className="applications-count">
            Showing <strong>{filteredApps.length}</strong> application{filteredApps.length !== 1 ? "s" : ""}
          </div>
          
          <div className="applications-filters" role="region" aria-label="Dashboard filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="applications-select"
              aria-label="Filter by Status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="applications-select"
              aria-label="Filter by Membership Classification"
            >
              <option value="all">All Classifications</option>
              <option value="life">Life Member</option>
              <option value="institutional">Institutional Member</option>
              <option value="associate">Associate Member</option>
              <option value="regular">Regular Member</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-container">
          <table className="applications-table" aria-label="Applications moderation queue">
            <thead>
              <tr>
                <th scope="col">Applicant Name</th>
                <th scope="col">Email Address</th>
                <th scope="col">Membership Type</th>
                <th scope="col">Submitted Date</th>
                <th scope="col">Status</th>
                <th scope="col" style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => handleOpenReview(app.id)}
                  className={selectedAppId === app.id ? "tr--selected" : ""}
                >
                  <td style={{ fontWeight: 700, color: "var(--admin-navy)" }}>{app.applicantName}</td>
                  <td>{app.email}</td>
                  <td style={{ textTransform: "capitalize" }}>{categoryLabels[app.membershipType]}</td>
                  <td>{app.submittedAt}</td>
                  <td>
                    <span className={`status-badge status-badge--${app.status}`}>
                      {app.status.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="row-review-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click event
                        handleOpenReview(app.id);
                      }}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}

              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "48px", color: "var(--admin-muted)" }}>
                    <ClipboardList size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                    <p>No membership applications found in the selected queue.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Drawer slide-in panel */}
      <AnimatePresence>
        {selectedAppId && selectedApp && (
          <motion.div
            className="detail-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleCloseReview}
          >
            <motion.aside
              className="detail-drawer"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking drawer content
            >
              {/* Header */}
              <div className="detail-drawer__header">
                <div>
                  <span className={`status-badge status-badge--${selectedApp.status}`} style={{ marginBottom: "6px" }}>
                    {selectedApp.status.replace("_", " ")}
                  </span>
                  <h3 className="detail-drawer__title">{selectedApp.applicantName}</h3>
                </div>
                <button
                  type="button"
                  className="detail-drawer__close"
                  onClick={handleCloseReview}
                  aria-label="Close drawer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="detail-drawer__body">
                {/* Personal Information */}
                <section className="detail-section">
                  <div className="detail-section__title">Contact &amp; Institutional Profile</div>
                  <div className="detail-grid">
                    <div className="detail-block">
                      <div className="detail-block__label">Full Name</div>
                      <div className="detail-block__value">{selectedApp.formData.fullName}</div>
                    </div>
                    <div className="detail-block">
                      <div className="detail-block__label">Email Address</div>
                      <div className="detail-block__value">{selectedApp.formData.email}</div>
                    </div>
                    <div className="detail-block">
                      <div className="detail-block__label">Mobile Phone</div>
                      <div className="detail-block__value">{selectedApp.formData.phone}</div>
                    </div>
                    <div className="detail-block">
                      <div className="detail-block__label">Employing Institution</div>
                      <div className="detail-block__value">{selectedApp.formData.institution}</div>
                    </div>
                    <div className="detail-block">
                      <div className="detail-block__label">Address</div>
                      <div className="detail-block__value">{selectedApp.formData.address}</div>
                    </div>
                  </div>
                </section>

                {/* Membership Selection */}
                <section className="detail-section">
                  <div className="detail-section__title">Membership Selection</div>
                  <div className="detail-grid">
                    <div className="detail-block">
                      <div className="detail-block__label">Classification</div>
                      <div className="detail-block__value">{categoryLabels[selectedApp.membershipType]}</div>
                    </div>
                  </div>
                </section>

                {/* Uploaded Documents */}
                <section className="detail-section">
                  <div className="detail-section__title">Uploaded Document Credentials</div>
                  <div>
                    {Object.entries(selectedApp.formData.documents).map(([slotName, fileObj]) => {
                      if (!fileObj) return null;
                      return (
                        <div key={slotName} className="detail-doc-item">
                          <FileText size={16} style={{ color: "var(--admin-blue)", flexShrink: 0 }} />
                          <div style={{ flexGrow: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            <strong style={{ color: "var(--admin-navy)" }}>{slotName}</strong>: {fileObj.name}
                          </div>
                          <span style={{ fontSize: "11px", color: "var(--admin-muted)" }}>
                            ({formatBytes(fileObj.size)})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Saved Rejection Reason */}
                {selectedApp.status === "rejected" && selectedApp.rejectionReason && (
                  <section className="detail-section" style={{ background: "#fff1f1", border: "1px solid #fca5a5", padding: "16px", borderRadius: "8px" }}>
                    <div className="detail-block__label" style={{ color: "#991b1b" }}>Audit Rejection Reason</div>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", lineHeight: "1.4", color: "#991b1b", fontWeight: 600 }}>
                      {selectedApp.rejectionReason}
                    </p>
                  </section>
                )}
              </div>

              {/* Actions Footer */}
              <div className="decision-block">
                <AnimatePresence mode="wait">
                  {!showRejectPanel ? (
                    <motion.div
                      key="actions"
                      className="decision-actions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <button
                        type="button"
                        className="decision-btn decision-btn--approve"
                        onClick={handleApprove}
                      >
                        <CheckCircle size={16} /> Approve Application
                      </button>
                      <button
                        type="button"
                        className="decision-btn decision-btn--reject"
                        onClick={handleRejectInit}
                      >
                        <XCircle size={16} /> Reject Application
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="reject-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <label htmlFor="rejection-reason" className="decision-reason-label">
                        Provide feedback / rejection reasons:
                      </label>
                      <textarea
                        id="rejection-reason"
                        className="decision-reason-textarea"
                        placeholder="Please detail the reason for rejecting this application (e.g. invalid document signature)."
                        value={rejectionReasonInput}
                        onChange={(e) => {
                          setRejectionReasonInput(e.target.value);
                          if (rejectionError) setRejectionError("");
                        }}
                      />
                      {rejectionError && (
                        <p style={{ color: "var(--badge-rejected-text)", fontSize: "12px", margin: "-8px 0 12px", fontWeight: 600 }}>
                          {rejectionError}
                        </p>
                      )}
                      
                      <div className="decision-actions">
                        <button
                          type="button"
                          className="decision-btn decision-btn--confirm-reject"
                          onClick={handleConfirmReject}
                        >
                          Confirm Rejection
                        </button>
                        <button
                          type="button"
                          className="decision-btn decision-btn--cancel"
                          onClick={handleRejectCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminSidebarLayout>
  );
}
