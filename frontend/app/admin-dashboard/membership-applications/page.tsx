"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"; // 🆕 useReducedMotion
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
  AlertTriangle,
  FolderOpen,
  Printer
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
  photo_1x1: "1x1 Photo",
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const prefersReducedMotion = useReducedMotion(); // 🆕 skip/shorten motion for users who've asked the OS to reduce it

  // Load applications from API
  useEffect(() => {
    fetchApplications();
  }, []);

  // 🆕 Close the review drawer with Escape, matching how any dialog-like panel should behave for keyboard users
  useEffect(() => {
    if (!selectedAppId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseReview();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAppId]);

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

  // Infographic summary counts (based on full non-draft queue, not the filtered view)
  const queueStats = {
    total: applications.filter(a => a.status !== "draft").length,
    submitted: applications.filter(a => a.status === "submitted").length,
    underReview: applications.filter(a => a.status === "under_review").length,
    approved: applications.filter(a => a.status === "approved").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

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

  const handlePrintAcroform = async (app: any) => {
    try {
      setIsGeneratingPdf(true);
      const { generateAcroform } = await import("../../lib/acroform-helper");
      await generateAcroform(app);
      gooeyToast.success("Official PDF form generated and downloaded successfully!");
    } catch (err: any) {
      console.error(err);
      gooeyToast.error(err.message || "Failed to generate official PDF form.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // ── Approval Decision Logic ────────────────────────────────────────────────

  const handleApprove = async () => {
    if (!selectedApp) return;

    try {
      const updated = await updateMembershipApplicationStatus(selectedApp.id, "approved");
      setApplications(prev =>
        prev.map(app => app.id === selectedApp.id ? { ...app, ...updated } : app) // 🆕 merge instead of replace — if the API response omits a field (e.g. documents), the existing value is kept instead of becoming undefined
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
        prev.map(app => app.id === selectedApp.id ? { ...app, ...updated } : app) // 🆕 same merge fix as approve, so rejecting can't drop fields either
      );
      gooeyToast.success(`Application rejected. Feedback has been sent.`);
      handleCloseReview();
    } catch (err: any) {
      console.error(err);
      gooeyToast.error(err.message || "Failed to reject application.");
    }
  };

  // ── Status Stepper (derived from selectedApp) ───────────────────────────────

  const renderStatusStepper = (status: string) => {
    const isRejected = status === "rejected";
    const steps = [
      { key: "submitted", label: "Submitted", icon: FileText },
      { key: "under_review", label: "Review", icon: Eye },
      { key: isRejected ? "rejected" : "approved", label: isRejected ? "Rejected" : "Approved", icon: isRejected ? XCircle : CheckCircle },
    ];
    const order = ["submitted", "under_review", isRejected ? "rejected" : "approved"];
    const currentIndex = order.indexOf(status);

    return (
      <div className="status-stepper">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentIndex;
          const isComplete = idx < currentIndex;
          return (
            <div
              key={step.key}
              className={`status-step ${isActive ? (step.key === "rejected" ? "status-step--rejected" : "status-step--active") : ""} ${isComplete ? "status-step--complete" : ""}`}
            >
              <div className="status-step__icon"><Icon size={15} /></div>
              <span className="status-step__label">{step.label}</span>
            </div>
          );
        })}
      </div>
    );
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
        {/* Infographic Stats Bar */}
        <div className="stats-grid">
          <div className="stat-card stat-card--total">
            <div className="stat-card__icon"><FileText size={18} /></div>
            <div className="stat-card__info">
              <strong>{queueStats.total}</strong>
              <span>Total</span>
            </div>
          </div>
          <div className="stat-card stat-card--pending">
            <div className="stat-card__icon"><Clock size={18} /></div>
            <div className="stat-card__info">
              <strong>{queueStats.submitted}</strong>
              <span>Submitted</span>
            </div>
          </div>
          <div className="stat-card stat-card--review">
            <div className="stat-card__icon"><Eye size={18} /></div>
            <div className="stat-card__info">
              <strong>{queueStats.underReview}</strong>
              <span>Under Review</span>
            </div>
          </div>
          <div className="stat-card stat-card--approved">
            <div className="stat-card__icon"><CheckCircle size={18} /></div>
            <div className="stat-card__info">
              <strong>{queueStats.approved}</strong>
              <span>Approved</span>
            </div>
          </div>
          <div className="stat-card stat-card--rejected">
            <div className="stat-card__icon"><XCircle size={18} /></div>
            <div className="stat-card__info">
              <strong>{queueStats.rejected}</strong>
              <span>Rejected</span>
            </div>
          </div>
        </div>

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
                  const fullName = profile.fullName || profile.name || profile.collegeUniversityName || "Unnamed Applicant";
                  const email = profile.email || profile.emailAddress || "-";
                  const submittedDate = app.submittedAt
                    ? new Date(app.submittedAt).toLocaleDateString()
                    : new Date(app.createdAt).toLocaleDateString();

                  return (
                    <tr
                      key={app.id}
                      onClick={() => handleOpenReview(app.id)}
                      className={selectedAppId === app.id ? "tr--selected" : ""}
                      tabIndex={0} // 🆕 row is keyboard-focusable to match its clickable behavior
                      role="button" // 🆕
                      aria-label={`Review application from ${fullName}`} // 🆕
                      onKeyDown={(e) => { // 🆕 Enter/Space opens the review drawer, same as a click
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleOpenReview(app.id);
                        }
                      }}
                    >
                      <td data-label="Applicant" style={{ fontWeight: 700, color: "var(--admin-navy)" }}>{fullName}</td>
                      <td data-label="Email">{email}</td>
                      <td data-label="Type" style={{ textTransform: "capitalize" }}>{categoryLabels[app.membershipType.toLowerCase()] || app.membershipType}</td>
                      <td data-label="Date">{submittedDate}</td>
                      <td data-label="Status">
                        <span className={`status-badge status-badge--${app.status}`}>
                          {app.status.replace("_", " ")}
                        </span>
                      </td>
                      <td data-label="" className="table-actions-cell" style={{ textAlign: "right" }}>
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
            transition={prefersReducedMotion ? { duration: 0 } : undefined} // 🆕
            onClick={handleCloseReview}
          >
            <motion.aside
              className="detail-drawer"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={prefersReducedMotion ? { duration: 0 } : undefined} // 🆕
              role="dialog" // 🆕 the drawer is a modal dialog for assistive tech
              aria-modal="true" // 🆕
              aria-labelledby="detail-drawer-title" // 🆕
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="detail-drawer__header">
                <div>
                  <span className={`status-badge status-badge--${selectedApp.status}`} style={{ marginBottom: "6px" }}>
                    {selectedApp.status.replace("_", " ")}
                  </span>
                  <h3 className="detail-drawer__title" id="detail-drawer-title"> {/* 🆕 id target for aria-labelledby */}
                    {selectedApp.profileData?.fullName || selectedApp.profileData?.name || selectedApp.profileData?.collegeUniversityName || "Unnamed Applicant"}
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

              {/* Visual Status Stepper */}
              {renderStatusStepper(selectedApp.status)}

              {/* Drawer Body */}
              <div className="detail-drawer__body">

                {/* 1. Contact Information (icon rows) */}
                <section className="detail-section">
                  <div className="detail-section__title">
                    <Mail size={13} /> Contact Information
                  </div>
                  <div className="contact-row-list">
                    <div className="contact-row">
                      <Mail size={15} />
                      <span>{selectedApp.profileData?.email || selectedApp.profileData?.emailAddress || "-"}</span>
                    </div>
                    <div className="contact-row">
                      <Phone size={15} />
                      <span>
                        <strong>Mobile:</strong> {
                          (selectedApp.membershipType?.toLowerCase() === "institutional"
                            ? selectedApp.profileData?.phone
                            : (selectedApp.profileData?.telMobileNo || selectedApp.profileData?.phone)) || "-"
                        }
                      </span>
                    </div>
                    <div className="contact-row">
                      <Phone size={15} />
                      <span>
                        <strong>Tel:</strong> {
                          (selectedApp.membershipType?.toLowerCase() === "institutional"
                            ? selectedApp.profileData?.telMobileNo
                            : selectedApp.profileData?.telephoneNo) || "-"
                        }
                      </span>
                    </div>
                    <div className="contact-row">
                      <MapPin size={15} />
                      <span>{selectedApp.profileData?.homeAddress || selectedApp.profileData?.institutionAddress || "-"}</span>
                      {selectedApp.profileData?.region && (
                        <span className="contact-row__region">{selectedApp.profileData.region}</span>
                      )}
                    </div>
                  </div>

                  {selectedApp.membershipType.toLowerCase() === "institutional" && (
                    <div className="detail-block" style={{ marginTop: "12px" }}>
                      <div className="detail-block__label">Total Program Enrollee Count</div>
                      <div className="detail-block__value" style={{ fontWeight: "bold", color: "var(--admin-blue)" }}>
                        {selectedApp.profileData?.enrolleeCount || "0"}
                      </div>
                    </div>
                  )}
                </section>

                {/* 2. Employment & Education details (Type Aware) */}
                <section className="detail-section">
                  <div className="detail-section__title">
                    <Building2 size={13} />
                    {selectedApp.membershipType.toLowerCase() === "associate" ? "Graduate Program & Academic Details" : "Employment & Education Details"}
                  </div>
                  <div className="detail-grid">
                    {selectedApp.membershipType.toLowerCase() !== "associate" && (
                      <>
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
                      </>
                    )}

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
                        <div className="detail-block" style={{ gridColumn: "span 2" }}>
                          <div className="detail-block__label">Current Graduate School</div>
                          <div className="detail-block__value">{selectedApp.educationJobData?.currentGraduateSchool || "-"}</div>
                        </div>
                        <div className="detail-block" style={{ gridColumn: "span 2" }}>
                          <div className="detail-block__label">Degree Program</div>
                          <div className="detail-block__value">{selectedApp.educationJobData?.degreeProgram || "-"}</div>
                        </div>
                        <div className="detail-block">
                          <div className="detail-block__label">Undergraduate Institution</div>
                          <div className="detail-block__value">{selectedApp.educationJobData?.institution || "-"}</div>
                        </div>
                        <div className="detail-block">
                          <div className="detail-block__label">Expected Graduation Year</div>
                          <div className="detail-block__value">{selectedApp.educationJobData?.expectedGraduationYear || "-"}</div>
                        </div>
                        <div className="detail-block">
                          <div className="detail-block__label">Current Academic Status</div>
                          <div className="detail-block__value" style={{ textTransform: "capitalize" }}>
                            {selectedApp.educationJobData?.currentAcademicStatus === "enrolled" ? "Currently Enrolled" : selectedApp.educationJobData?.currentAcademicStatus === "on_leave" ? "On Leave / LOA" : selectedApp.educationJobData?.currentAcademicStatus === "thesis_writing" ? "Thesis/Dissertation Writing" : selectedApp.educationJobData?.currentAcademicStatus || "-"}
                          </div>
                        </div>
                        <div className="detail-block" style={{ gridColumn: "span 2" }}>
                          <div className="detail-block__label">Research Interests</div>
                          <div className="detail-block__value" style={{ whiteSpace: "pre-wrap" }}>{selectedApp.educationJobData?.researchInterests || "-"}</div>
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
                    <div className="detail-section__title">Experience &amp; Activities</div>
                    <div className="detail-grid">
                      {selectedApp.membershipType.toLowerCase() === "life" && (
                        <div className="detail-block" style={{ gridColumn: "span 2", background: "#fdf6e2", padding: "8px 12px", borderRadius: "6px", border: "1px solid #f5e0a3" }}>
                          <div className="detail-block__label" style={{ color: "#856404" }}>Years Active in PAGE Activities</div>
                          <div className="detail-block__value" style={{ fontWeight: 800, color: "#856404" }}>
                            {selectedApp.experienceData?.yearsActiveInPAGE || "0"} year(s)
                          </div>
                        </div>
                      )}

                      {selectedApp.membershipType.toLowerCase() === "associate" && selectedApp.experienceData?.relevantActivities && (
                        <div className="detail-block" style={{ gridColumn: "span 2" }}>
                          <div className="detail-block__label">Relevant Academic/Extracurricular Activities</div>
                          <div className="detail-block__value" style={{ fontStyle: "italic", whiteSpace: "pre-wrap" }}>
                            {selectedApp.experienceData.relevantActivities}
                          </div>
                        </div>
                      )}

                      {(selectedApp.membershipType.toLowerCase() === "life" || selectedApp.membershipType.toLowerCase() === "regular") && (
                        <>
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
                        </>
                      )}
                    </div>
                  </section>
                )}

                {/* 4. Endorsement References */}
                {(selectedApp.membershipType.toLowerCase() === "life" || selectedApp.membershipType.toLowerCase() === "regular" || selectedApp.membershipType.toLowerCase() === "associate") ? (
                  (selectedApp.referencesData?.characterReferences || selectedApp.referencesData?.regionalChapterBoardReference) && (
                    <section className="detail-section">
                      <div className="detail-section__title">Endorsement References</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        {selectedApp.referencesData?.characterReferences?.map((r: any, idx: number) => (
                          <div key={idx} style={{ padding: "12px", background: "var(--af-cream)", borderRadius: "8px" }}>
                            <div style={{ fontWeight: "bold", fontSize: "14px" }}>Character Reference #{idx + 1}: {r.name}</div>
                            {r.position && <div style={{ fontSize: "12px", color: "var(--admin-muted)" }}>Position: {r.position}</div>}
                            <div style={{ fontSize: "12px", color: "var(--admin-muted)", marginTop: "4px" }}>Address: {r.address}</div>
                          </div>
                        ))}
                      </div>
                      {selectedApp.referencesData?.regionalChapterBoardReference && (
                        <div style={{ padding: "12px", background: "var(--af-cream)", borderRadius: "8px" }}>
                          <div style={{ fontWeight: "bold", fontSize: "14px" }}>Regional Chapter Board Endorsement</div>
                          <div style={{ fontSize: "12px", color: "var(--admin-muted)" }}>Name: {selectedApp.referencesData.regionalChapterBoardReference.name}</div>
                          <div style={{ fontSize: "12px", color: "var(--admin-muted)", marginTop: "4px" }}>Address: {selectedApp.referencesData.regionalChapterBoardReference.address}</div>
                        </div>
                      )}
                    </section>
                  )
                ) : (
                  selectedApp.membershipType.toLowerCase() !== "institutional" && (selectedApp.referencesData?.ref1Name || selectedApp.referencesData?.ref2Name) && (
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
                  )
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
                  <div className="detail-section__title">
                    <FolderOpen size={13} /> Uploaded Documents
                  </div>
                  <div>
                    {(selectedApp.documents || []).length === 0 ? ( // 🆕 fall back to [] so a partial API response can't crash the render
                      <p style={{ color: "var(--admin-muted)", fontStyle: "italic", fontSize: "13px" }}>No documents uploaded.</p>
                    ) : (
                      (selectedApp.documents || []).map((doc) => ( // 🆕 same fallback here
                        <div key={doc.id} className="detail-doc-item">
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
                            className="detail-doc-item__link"
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
                  <section className="detail-section rejection-note">
                    <div className="detail-block__label rejection-note__label">
                      <AlertTriangle size={14} /> Rejection Reason Feedback
                    </div>
                    <p className="rejection-note__text">
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
                      transition={prefersReducedMotion ? { duration: 0 } : undefined} // 🆕
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
                        className="decision-btn decision-btn--print"
                        onClick={() => handlePrintAcroform(selectedApp)}
                        disabled={isGeneratingPdf}
                      >
                        <Printer size={16} /> {isGeneratingPdf ? "Generating..." : "Download Official Form"}
                      </button>
                      <button
                        type="button"
                        className="decision-btn decision-btn--reject"
                        onClick={handleRejectInit}
                        disabled={selectedApp.status === "rejected"}
                      >
                        <XCircle size={16} /> Decline Application
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="reject-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={prefersReducedMotion ? { duration: 0 } : undefined} // 🆕
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
                        <p className="decision-error">
                          {rejectionError}
                        </p>
                      )}

                      <div className="decision-actions">
                        <button
                          type="button"
                          className="decision-btn decision-btn--confirm-reject"
                          onClick={handleConfirmReject}
                        >
                          Confirm Decline
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