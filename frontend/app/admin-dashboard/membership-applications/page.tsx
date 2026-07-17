"use client";

import { useState, useEffect } from "react";
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
  ClipboardList,
  Download,
  AlertTriangle
} from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import { MembershipApplication } from "../../lib/membership-types";
import {
  listMembershipApplications,
  updateMembershipApplicationStatus
} from "../../lib/membership-api";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import "./membership-applications.css";
import "../admin-dashboard.css";

// ── Constants ───────────────────────────────────────────────────────────────

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

const DOCUMENT_LABELS: Record<string, string> = {
  registrar_certification: "Registrar certification of enrolment",
  active_member_id: "Active-member ID or Certification",
  degree_proof: "Proof of Graduate Degree (Diploma/Transcript)",
  current_enrollment_proof: "Proof of Graduate Enrollment",
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
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  
  // Table filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Rejection panel open flow
  const [showRejectPanel, setShowRejectPanel] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [rejectionError, setRejectionError] = useState("");

  // Load applications from API
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const data = await listMembershipApplications();
      setApplications(data);
    } catch (err: any) {
      console.error(err);
      gooeyToast.error("Failed to load membership applications.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedApp = applications.find(app => app.id === selectedAppId) || null;

  // Filtered applications (skip draft status in the admin dashboard review queue)
  const filteredApps = applications
    .filter(app => app.status !== "draft")
    .filter(app => {
      const matchStatus = statusFilter === "all" || app.status === statusFilter;
      const matchType = typeFilter === "all" || app.membershipType.toLowerCase() === typeFilter;
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

  const handleApprove = async () => {
    if (!selectedApp) return;

    try {
      const updated = await updateMembershipApplicationStatus(selectedApp.id, "approved");
      setApplications(prev =>
        prev.map(app => app.id === selectedApp.id ? updated : app)
      );
      gooeyToast.success(`Application approved successfully.`);
      handleCloseReview();
    } catch (err: any) {
      console.error(err);
      gooeyToast.error(err.message || "Failed to approve application.");
    }
  };

  const handleRejectInit = () => {
    setShowRejectPanel(true);
    setRejectionReasonInput(selectedApp?.rejectionReason || "");
  };

  const handleRejectCancel = () => {
    setShowRejectPanel(false);
    setRejectionError("");
  };

  const handleConfirmReject = async () => {
    if (!selectedApp) return;
    if (!rejectionReasonInput.trim()) {
      setRejectionError("Rejection feedback is required.");
      gooeyToast.error("Rejection feedback is required.");
      return;
    }

    try {
      const updated = await updateMembershipApplicationStatus(
        selectedApp.id,
        "rejected",
        rejectionReasonInput
      );
      setApplications(prev =>
        prev.map(app => app.id === selectedApp.id ? updated : app)
      );
      gooeyToast.success(`Application rejected. Feedback has been sent.`);
      handleCloseReview();
    } catch (err: any) {
      console.error(err);
      gooeyToast.error(err.message || "Failed to reject application.");
    }
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
            {isLoading ? "Loading applications..." : (
              <>Showing <strong>{filteredApps.length}</strong> application{filteredApps.length !== 1 ? "s" : ""}</>
            )}
          </div>
          
          <div className="applications-filters" role="region" aria-label="Dashboard filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="applications-select"
              aria-label="Filter by Status"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
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
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "64px" }}>
              <div className="af-spinner" style={{ margin: "0 auto 16px" }} />
              <p>Loading application moderation queue...</p>
            </div>
          ) : (
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
                {filteredApps.map((app) => {
                  const profile = app.profileData || {};
                  const fullName = profile.fullName || "Unnamed Applicant";
                  const email = profile.email || "-";
                  const submittedDate = app.submittedAt 
                    ? new Date(app.submittedAt).toLocaleDateString()
                    : new Date(app.createdAt).toLocaleDateString();

                  return (
                    <tr
                      key={app.id}
                      onClick={() => handleOpenReview(app.id)}
                      className={selectedAppId === app.id ? "tr--selected" : ""}
                    >
                      <td style={{ fontWeight: 700, color: "var(--admin-navy)" }}>{fullName}</td>
                      <td>{email}</td>
                      <td style={{ textTransform: "capitalize" }}>{categoryLabels[app.membershipType.toLowerCase()] || app.membershipType}</td>
                      <td>{submittedDate}</td>
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
                            e.stopPropagation();
                            handleOpenReview(app.id);
                          }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}

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
          )}
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
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="detail-drawer__header">
                <div>
                  <span className={`status-badge status-badge--${selectedApp.status}`} style={{ marginBottom: "6px" }}>
                    {selectedApp.status.replace("_", " ")}
                  </span>
                  <h3 className="detail-drawer__title">
                    {selectedApp.profileData?.fullName || "Unnamed Applicant"}
                  </h3>
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
              <div className="detail-drawer__body" style={{ overflowY: "auto", height: "calc(100vh - 200px)" }}>
                
                {/* 1. Contact & Institutional Profile */}
                <section className="detail-section">
                  <div className="detail-section__title">Contact &amp; Personal Profile</div>
                  <div className="detail-grid">
                    <div className="detail-block">
                      <div className="detail-block__label">Full Name</div>
                      <div className="detail-block__value">{selectedApp.profileData?.fullName || "-"}</div>
                    </div>
                    <div className="detail-block">
                      <div className="detail-block__label">Email Address</div>
                      <div className="detail-block__value">{selectedApp.profileData?.email || "-"}</div>
                    </div>
                    <div className="detail-block">
                      <div className="detail-block__label">Mobile Phone</div>
                      <div className="detail-block__value">{selectedApp.profileData?.phone || "-"}</div>
                    </div>
                    <div className="detail-block">
                      <div className="detail-block__label">Region</div>
                      <div className="detail-block__value">{selectedApp.profileData?.region || "-"}</div>
                    </div>
                    <div className="detail-block" style={{ gridColumn: "span 2" }}>
                      <div className="detail-block__label">Home Address</div>
                      <div className="detail-block__value">{selectedApp.profileData?.homeAddress || "-"}</div>
                    </div>
                    
                    {selectedApp.membershipType.toLowerCase() === "institutional" && (
                      <div className="detail-block">
                        <div className="detail-block__label">Total Program Enrollee Count</div>
                        <div className="detail-block__value" style={{ fontWeight: "bold", color: "var(--admin-blue)" }}>
                          {selectedApp.profileData?.enrolleeCount || "0"}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* 2. Employment & Education details (Type Aware) */}
                <section className="detail-section">
                  <div className="detail-section__title">Employment &amp; Education Details</div>
                  <div className="detail-grid">
                    <div className="detail-block" style={{ gridColumn: "span 2" }}>
                      <div className="detail-block__label">Employing Institution / School</div>
                      <div className="detail-block__value">{selectedApp.educationJobData?.institution || "-"}</div>
                    </div>
                    <div className="detail-block" style={{ gridColumn: "span 2" }}>
                      <div className="detail-block__label">Business / Office Address</div>
                      <div className="detail-block__value">{selectedApp.educationJobData?.address || "-"}</div>
                    </div>
                    <div className="detail-block">
                      <div className="detail-block__label">Present Position / Title</div>
                      <div className="detail-block__value">{selectedApp.educationJobData?.presentPosition || "-"}</div>
                    </div>

                    {/* Life / Regular fields */}
                    {(selectedApp.membershipType.toLowerCase() === "life" || selectedApp.membershipType.toLowerCase() === "regular") && (
                      <>
                        <div className="detail-block">
                          <div className="detail-block__label">Highest Degree Obtained</div>
                          <div className="detail-block__value">{selectedApp.educationJobData?.degreeObtained || "-"}</div>
                        </div>
                        <div className="detail-block">
                          <div className="detail-block__label">Specialization</div>
                          <div className="detail-block__value">{selectedApp.educationJobData?.specialization || "-"}</div>
                        </div>
                        <div className="detail-block">
                          <div className="detail-block__label">Degree Granting Institution</div>
                          <div className="detail-block__value">{selectedApp.educationJobData?.degreeInstitution || "-"}</div>
                        </div>
                        <div className="detail-block">
                          <div className="detail-block__label">Year Obtained</div>
                          <div className="detail-block__value">{selectedApp.educationJobData?.yearObtained || "-"}</div>
                        </div>
                      </>
                    )}

                    {/* Associate fields */}
                    {selectedApp.membershipType.toLowerCase() === "associate" && (
                      <>
                        <div className="detail-block">
                          <div className="detail-block__label">Current Enrollment Status</div>
                          <div className="detail-block__value">{selectedApp.educationJobData?.currentEnrollmentStatus || "-"}</div>
                        </div>
                        <div className="detail-block">
                          <div className="detail-block__label">Expected Graduation Year</div>
                          <div className="detail-block__value">{selectedApp.educationJobData?.expectedGraduationYear || "-"}</div>
                        </div>
                      </>
                    )}

                    {/* Institutional fields */}
                    {selectedApp.membershipType.toLowerCase() === "institutional" && (
                      <div className="detail-block" style={{ gridColumn: "span 2" }}>
                        <div className="detail-block__label">Accreditation / Government Recognition</div>
                        <div className="detail-block__value">{selectedApp.educationJobData?.accreditationDetails || "-"}</div>
                      </div>
                    )}
                  </div>
                </section>

                {/* 3. Experience Details (Type Aware) */}
                {selectedApp.membershipType.toLowerCase() !== "institutional" && (
                  <section className="detail-section">
                    <div className="detail-section__title">Experience &amp; Milestones</div>
                    <div className="detail-grid">
                      {selectedApp.membershipType.toLowerCase() === "life" && (
                        <div className="detail-block" style={{ gridColumn: "span 2", background: "#fdf6e2", padding: "8px 12px", borderRadius: "6px", border: "1px solid #f5e0a3" }}>
                          <div className="detail-block__label" style={{ color: "#856404" }}>Years Active in PAGE Activities</div>
                          <div className="detail-block__value" style={{ fontWeight: 800, color: "#856404" }}>
                            {selectedApp.experienceData?.yearsActiveInPAGE || "0"} year(s)
                          </div>
                        </div>
                      )}
                      
                      {selectedApp.experienceData?.teachingExp && (
                        <div className="detail-block" style={{ gridColumn: "span 2" }}>
                          <div className="detail-block__label">Teaching History</div>
                          <div className="detail-block__value">
                            {selectedApp.experienceData.teachingExp} at {selectedApp.experienceData.teachingInst} ({selectedApp.experienceData.teachingFrom} - {selectedApp.experienceData.teachingTo})
                          </div>
                        </div>
                      )}

                      {selectedApp.experienceData?.adminExp && (
                        <div className="detail-block" style={{ gridColumn: "span 2" }}>
                          <div className="detail-block__label">Administrative Experience</div>
                          <div className="detail-block__value">
                            {selectedApp.experienceData.adminExp} at {selectedApp.experienceData.adminInst} ({selectedApp.experienceData.adminFrom} - {selectedApp.experienceData.adminTo})
                          </div>
                        </div>
                      )}

                      {selectedApp.experienceData?.pub1 && (
                        <div className="detail-block" style={{ gridColumn: "span 2" }}>
                          <div className="detail-block__label">Research &amp; Publications</div>
                          <div className="detail-block__value" style={{ fontStyle: "italic" }}>
                            1. {selectedApp.experienceData.pub1}<br />
                            {selectedApp.experienceData.pub2 && <>2. {selectedApp.experienceData.pub2}</>}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* 4. Endorsement References */}
                {selectedApp.membershipType.toLowerCase() !== "institutional" && (selectedApp.referencesData?.ref1Name || selectedApp.referencesData?.ref2Name) && (
                  <section className="detail-section">
                    <div className="detail-section__title">Endorsement References</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      {selectedApp.referencesData?.ref1Name && (
                        <div style={{ padding: "12px", background: "var(--af-cream)", borderRadius: "8px" }}>
                          <div style={{ fontWeight: "bold", fontSize: "14px" }}>{selectedApp.referencesData.ref1Name}</div>
                          <div style={{ fontSize: "12px", color: "var(--admin-muted)" }}>{selectedApp.referencesData.ref1Position}</div>
                          <div style={{ fontSize: "12px", color: "var(--admin-muted)", marginTop: "4px" }}>{selectedApp.referencesData.ref1Address}</div>
                        </div>
                      )}
                      {selectedApp.referencesData?.ref2Name && (
                        <div style={{ padding: "12px", background: "var(--af-cream)", borderRadius: "8px" }}>
                          <div style={{ fontWeight: "bold", fontSize: "14px" }}>{selectedApp.referencesData.ref2Name}</div>
                          <div style={{ fontSize: "12px", color: "var(--admin-muted)" }}>{selectedApp.referencesData.ref2Position}</div>
                          <div style={{ fontSize: "12px", color: "var(--admin-muted)", marginTop: "4px" }}>{selectedApp.referencesData.ref2Address}</div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* 5. Classification Details */}
                <section className="detail-section">
                  <div className="detail-section__title">Membership Selection &amp; Fee</div>
                  <div className="detail-grid">
                    <div className="detail-block">
                      <div className="detail-block__label">Classification</div>
                      <div className="detail-block__value" style={{ fontWeight: "bold" }}>
                        {categoryLabels[selectedApp.membershipType.toLowerCase()] || selectedApp.membershipType}
                      </div>
                    </div>
                    <div className="detail-block">
                      <div className="detail-block__label">Calculated Registration Fee</div>
                      <div className="detail-block__value" style={{ fontWeight: "bold", color: "var(--admin-navy)" }}>
                        ₱{Number(selectedApp.feeAmount).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 6. Uploaded Document Credentials */}
                <section className="detail-section">
                  <div className="detail-section__title">Uploaded Document Credentials</div>
                  <div>
                    {selectedApp.documents.length === 0 ? (
                      <p style={{ color: "var(--admin-muted)", fontStyle: "italic", fontSize: "13px" }}>No documents uploaded.</p>
                    ) : (
                      selectedApp.documents.map((doc) => (
                        <div key={doc.id} className="detail-doc-item" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "#fff", border: "1px solid var(--admin-border)", borderRadius: "8px", marginBottom: "8px" }}>
                          <FileText size={18} style={{ color: "var(--admin-blue)", flexShrink: 0 }} />
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "14px", fontWeight: "bold", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                              {DOCUMENT_LABELS[doc.documentType] || doc.documentType}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--admin-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                              {doc.fileName}
                            </div>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 12px",
                              fontSize: "13px",
                              color: "#fff",
                              background: "var(--admin-blue)",
                              borderRadius: "4px",
                              textDecoration: "none",
                              fontWeight: 600
                            }}
                          >
                            <Download size={12} /> View File
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Rejection Audit feedback log */}
                {selectedApp.status === "rejected" && selectedApp.rejectionReason && (
                  <section className="detail-section" style={{ background: "#fff1f1", border: "1px solid #fca5a5", padding: "16px", borderRadius: "8px" }}>
                    <div className="detail-block__label" style={{ color: "#991b1b", display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold" }}>
                      <AlertTriangle size={14} /> Rejection Reason Feedback
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "14px", lineHeight: "1.4", color: "#991b1b", fontWeight: 600 }}>
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
                        disabled={selectedApp.status === "approved"}
                      >
                        <CheckCircle size={16} /> Approve Application
                      </button>
                      <button
                        type="button"
                        className="decision-btn decision-btn--reject"
                        onClick={handleRejectInit}
                        disabled={selectedApp.status === "rejected"}
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
