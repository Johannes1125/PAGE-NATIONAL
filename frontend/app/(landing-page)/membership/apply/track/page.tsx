"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Home,
  Download
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import { ApplicationStatus, ApplicationFormState } from "../../../../lib/membership-types";
import "./track.css";
import "../apply.css";

// ── Printable Form Component (matching the application form print styles) ────

function PrintableForm({ state }: { state: ApplicationFormState }) {
  const isLifeOrRegular = state.membershipType === "life" || state.membershipType === "regular";
  
  const displayName = isLifeOrRegular ? state.name : state.fullName;
  const displayPhone = isLifeOrRegular ? state.telMobileNo : state.phone;
  const displayEmail = isLifeOrRegular ? state.emailAddress : state.email;
  const displayWhereEmployed = isLifeOrRegular ? state.whereEmployed : (state.whereEmployed || state.institution);
  const displayBusinessAddress = isLifeOrRegular ? state.businessAddress : (state.businessAddress || state.address);
  const displayDegreeInstitution = isLifeOrRegular ? state.institution : state.degreeInstitution;

  // Experiences mapping
  let teachingRole = "N/A";
  let teachingInst = "N/A";
  let teachingFrom = "N/A";
  let teachingTo = "N/A";
  
  if (isLifeOrRegular) {
    const tExp = state.teachingExperience?.[0];
    if (tExp) {
      teachingRole = "Teaching Faculty";
      teachingInst = tExp.institution;
      teachingFrom = tExp.fromYear;
      teachingTo = tExp.toYear;
    }
  } else {
    teachingRole = state.teachingExp || "N/A";
    teachingInst = state.teachingInst || "N/A";
    teachingFrom = state.teachingFrom || "N/A";
    teachingTo = state.teachingTo || "N/A";
  }

  let adminRole = "N/A";
  let adminInst = "N/A";
  let adminFrom = "N/A";
  let adminTo = "N/A";

  if (isLifeOrRegular) {
    const aExp = state.administrativeExperience?.[0];
    if (aExp) {
      adminRole = "Administrative Officer";
      adminInst = aExp.institution;
      adminFrom = aExp.fromYear;
      adminTo = aExp.toYear;
    }
  } else {
    adminRole = state.adminExp || "N/A";
    adminInst = state.adminInst || "N/A";
    adminFrom = state.adminFrom || "N/A";
    adminTo = state.adminTo || "N/A";
  }

  // Publications mapping
  const pub1 = isLifeOrRegular ? (state.recentPublications?.[0] || "N/A") : (state.pub1 || "N/A");
  const pub2 = isLifeOrRegular ? (state.recentPublications?.[1] || "N/A") : (state.pub2 || "N/A");
  const pub3 = isLifeOrRegular ? (state.recentPublications?.[2] || "N/A") : (state.pub3 || "N/A");
  const pub4 = isLifeOrRegular ? (state.recentPublications?.[3] || "N/A") : (state.pub4 || "N/A");

  // Associations mapping
  const assoc1 = isLifeOrRegular ? (state.professionalMemberships?.[0] || "N/A") : (state.assoc1 || "N/A");
  const assoc2 = isLifeOrRegular ? (state.professionalMemberships?.[1] || "N/A") : (state.assoc2 || "N/A");
  const assoc3 = isLifeOrRegular ? (state.professionalMemberships?.[2] || "N/A") : (state.assoc3 || "N/A");

  // References mapping
  const ref1Name = isLifeOrRegular ? (state.characterReferences?.[0]?.name || "(Not Specified)") : (state.ref1Name || "(Not Specified)");
  const ref1Position = isLifeOrRegular ? (state.characterReferences?.[0]?.position || "(Not Specified)") : (state.ref1Position || "(Not Specified)");
  const ref1Address = isLifeOrRegular ? (state.characterReferences?.[0]?.address || "(Not Specified)") : (state.ref1Address || "(Not Specified)");

  const ref2Name = isLifeOrRegular ? (state.regionalChapterBoardReference?.name || "(Not Specified)") : (state.ref2Name || "(Not Specified)");
  const ref2Position = isLifeOrRegular ? "Regional Chapter Board Member" : (state.ref2Position || "(Not Specified)");
  const ref2Address = isLifeOrRegular ? (state.regionalChapterBoardReference?.address || "(Not Specified)") : (state.ref2Address || "(Not Specified)");

  return (
    <div className="print-only-form">
      <div className="pf-header">
        <div className="pf-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/PAGE-favicon.png" alt="PAGE Logo" />
        </div>
        <div className="pf-title-block">
          <h2>PHILIPPINE ASSOCIATION FOR GRADUATE EDUCATION</h2>
          <h3>(PAGE), Inc., Manila</h3>
        </div>
        <div className="pf-photo-box">
          PASTE / STAPLE<br />YOUR 1x1<br />PICTURE HERE
        </div>
      </div>

      <div className="pf-membership-type">
        Application for &nbsp;&nbsp;&nbsp;&nbsp;
        <strong>( {state.membershipType === "regular" ? "X" : "  "} ) REGULAR</strong> &nbsp;&nbsp;&nbsp;&nbsp;
        <strong>( {state.membershipType === "life" ? "X" : "  "} ) LIFETIME</strong> &nbsp;&nbsp;&nbsp;&nbsp;
        <strong>( {state.membershipType === "associate" ? "X" : "  "} ) ASSOCIATE</strong> &nbsp;&nbsp;&nbsp;&nbsp;
        <strong>( {state.membershipType === "institutional" ? "X" : "  "} ) INSTITUTIONAL</strong> Membership
      </div>

      <div className="pf-box">
        <div className="pf-row">
          <div className="pf-col pf-flex-3">Name: <span className="pf-val">{displayName || "(Not Specified)"}</span></div>
          <div className="pf-col pf-flex-1">Region: <span className="pf-val">{state.region || "(Not Specified)"}</span></div>
        </div>
        <div className="pf-row">
          <div className="pf-col">Home Address: <span className="pf-val">{state.homeAddress || "(Not Specified)"}</span></div>
        </div>
        <div className="pf-row">
          <div className="pf-col pf-flex-1">Tel No(s)./ Mobile No: <span className="pf-val">{displayPhone || "(Not Specified)"}</span></div>
          <div className="pf-col pf-flex-1">Email Address: <span className="pf-val">{displayEmail || "(Not Specified)"}</span></div>
        </div>
        <div className="pf-row">
          <div className="pf-col">Where Employed: <span className="pf-val">{displayWhereEmployed || "(Not Specified)"}</span></div>
        </div>
        <div className="pf-row">
          <div className="pf-col">Business Address: <span className="pf-val">{displayBusinessAddress || "(Not Specified)"}</span></div>
        </div>
        <div className="pf-row">
          <div className="pf-col pf-flex-1">Present Position: <span className="pf-val">{state.presentPosition || "(Not Specified)"}</span></div>
          <div className="pf-col pf-flex-1">Degree Obtained: <span className="pf-val">{state.degreeObtained || "(Not Specified)"}</span></div>
        </div>
        <div className="pf-row">
          <div className="pf-col pf-flex-1">Specialization: <span className="pf-val">{state.specialization || "(Not Specified)"}</span></div>
          <div className="pf-col pf-flex-1">Institution: <span className="pf-val">{displayDegreeInstitution || "(Not Specified)"}</span></div>
          <div className="pf-col pf-flex-1">Year Obtained: <span className="pf-val">{state.yearObtained || "(Not Specified)"}</span></div>
        </div>
      </div>

      <div className="pf-section-title">Academic/ Administrative Experiences (past five (5) years)</div>
      <div className="pf-experience-block">
        <div className="pf-row pf-no-border">
          <div className="pf-col pf-flex-2">Teaching: <span className="pf-val">{teachingRole}</span></div>
          <div className="pf-col pf-flex-2">Institution: <span className="pf-val">{teachingInst}</span></div>
          <div className="pf-col pf-flex-1">(from: <span className="pf-val">{teachingFrom}</span> to: <span className="pf-val">{teachingTo}</span>)</div>
        </div>
        <div className="pf-row pf-no-border" style={{ marginTop: "6px" }}>
          <div className="pf-col pf-flex-2">Administrative: <span className="pf-val">{adminRole}</span></div>
          <div className="pf-col pf-flex-2">Institution: <span className="pf-val">{adminInst}</span></div>
          <div className="pf-col pf-flex-1">(from: <span className="pf-val">{adminFrom}</span> to: <span className="pf-val">{adminTo}</span>)</div>
        </div>
      </div>

      <div className="pf-section-title">Title of recent articles, researches, books written (past five (5) years)</div>
      <div className="pf-publications">
        <div className="pf-pub-line">1. <span className="pf-val">{pub1}</span></div>
        <div className="pf-pub-line">2. <span className="pf-val">{pub2}</span></div>
        <div className="pf-pub-line">3. <span className="pf-val">{pub3}</span></div>
        <div className="pf-pub-line">4. <span className="pf-val">{pub4}</span></div>
      </div>

      <div className="pf-section-title">Membership/ officership in other recognized Professional/ Cultural Associations (past five (5) years)</div>
      <div className="pf-associations">
        <div className="pf-pub-line">1. <span className="pf-val">{assoc1}</span></div>
        <div className="pf-pub-line">2. <span className="pf-val">{assoc2}</span></div>
        <div className="pf-pub-line">3. <span className="pf-val">{assoc3}</span></div>
      </div>

      <div className="pf-section-title">Two (2) references and their addresses one of whom is the current Regional Chapter Board Member</div>
      <div className="pf-references">
        <div className="pf-ref-col">
          <div>1. Name: <span className="pf-val">{ref1Name}</span></div>
          <div>Position: <span className="pf-val">{ref1Position}</span></div>
          <div>Address: <span className="pf-val">{ref1Address}</span></div>
        </div>
        <div className="pf-ref-col">
          <div>2. Name: <span className="pf-val">{ref2Name}</span></div>
          <div>Position: <span className="pf-val">{ref2Position}</span></div>
          <div>Address: <span className="pf-val">{ref2Address}</span></div>
        </div>
      </div>

      <div className="pf-consent">
        By signing this document, I agree that I have read the Privacy Policy, understood its contents and
        consent to it. I also understand that my consent does not preclude the existence of other criteria for lawful
        processing of personal data, such as our legitimate interests, and does not waive any of my rights under the
        Data Privacy Act of 2012 and other applicable laws and regulations.
      </div>

      <div className="pf-signatures">
        <div className="pf-sig-col">
          <div style={{ fontSize: "10px", fontWeight: "bold" }}>Recommended by:</div>
          <br /><br />
          <div className="pf-sig-line"></div>
          <div className="pf-sig-label">(Signature over Printed Name)</div>
        </div>
        <div className="pf-sig-col">
          <br /><br />
          <div className="pf-sig-line pf-center-text"><span style={{ fontFamily: "sans-serif", fontSize: "11px" }}>{displayName}</span></div>
          <div className="pf-sig-label">(Signature of Applicant over Printed Name)</div>
          <div className="pf-date-line">Date: <span className="pf-val">{new Date().toLocaleDateString()}</span></div>
          <div className="pf-committee-label">PAGE REGIONAL CHAPTER MEMBERSHIP COMMITTEE</div>
        </div>
      </div>
    </div>
  );
}

import { getMembershipApplication } from "../../../../lib/membership-api";

const categoryLabels: Record<string, string> = {
  life: "Life Member",
  institutional: "Institutional Member",
  associate: "Associate Member",
  regular: "Regular Member"
};

const getMockStatus = (id: string): ApplicationStatus => {
  const today = new Date();
  const formattedToday = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return {
    id: id || "MOCK-2025-0042",
    submittedAt: formattedToday,
    membershipType: "Life Member",
    currentStage: 1, 
    stages: [
      {
        label: "Submitted",
        description: "Your application has been received and is successfully queued in our system.",
        timestamp: `${formattedToday}, 09:30 AM`
      },
      {
        label: "Under Review",
        description: "Our academic board is reviewing your submitted credentials and qualifications.",
        timestamp: `${formattedToday}, 02:15 PM`
      },
      {
        label: "Documents Verified",
        description: "Uploaded document attachments are validated for completeness and authenticity.",
        timestamp: null
      },
      {
        label: "Approved / Rejected",
        description: "Final evaluation is released. Approved members will receive billing details via email.",
        timestamp: null
      }
    ]
  };
};

// ── Tracking Content Component ──────────────────────────────────────────────

function TrackContent() {
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState<ApplicationFormState | null>(null);
  
  const applicationId = searchParams.get("id") || "MOCK-2025-0042";
  const [status, setStatus] = useState<ApplicationStatus | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    async function fetchApp() {
      if (applicationId && !applicationId.startsWith("MOCK")) {
        try {
          const app = await getMembershipApplication(applicationId);
          const formattedToday = new Date(app.submittedAt || app.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          });
          
          let currentStage = 0;
          if (app.status === "under_review") currentStage = 1;
          else if (app.status === "approved" || app.status === "rejected") currentStage = 3;
          else currentStage = 2; // e.g. submitted / doc check

          setStatus({
            id: app.id,
            submittedAt: formattedToday,
            membershipType: categoryLabels[app.membershipType.toLowerCase()] || app.membershipType,
            currentStage,
            stages: [
              {
                label: "Submitted",
                description: "Your application has been received and is successfully queued in our system.",
                timestamp: formattedToday
              },
              {
                label: "Under Review",
                description: "Our academic board is reviewing your submitted credentials and qualifications.",
                timestamp: app.status !== "submitted" ? formattedToday : null
              },
              {
                label: "Documents Verified",
                description: "Uploaded document attachments are validated for completeness and authenticity.",
                timestamp: (app.status === "approved" || app.status === "rejected") ? formattedToday : null
              },
              {
                label: "Approved / Rejected",
                description: app.status === "rejected" 
                  ? `Application rejected: ${app.rejectionReason}`
                  : "Final evaluation is released. Approved members will receive billing details via email.",
                timestamp: (app.status === "approved" || app.status === "rejected") ? formattedToday : null
              }
            ]
          });

          // Also populate formState for print layout from the database JSON
          const profile = app.profileData || {};
          const eduJob = app.educationJobData || {};
          const exp = app.experienceData || {};
          const refs = app.referencesData || {};

          setFormData({
            fullName: profile.fullName || profile.name || "",
            email: profile.email || profile.emailAddress || "",
            phone: profile.phone || profile.telMobileNo || "",
            region: profile.region || "",
            homeAddress: profile.homeAddress || "",
            institution: eduJob.whereEmployed ? (eduJob.institution || "") : (eduJob.degreeInstitution || ""),
            address: eduJob.address || eduJob.businessAddress || "",
            presentPosition: eduJob.presentPosition || "",
            membershipType: app.membershipType.toLowerCase() as any,
            documents: {},
            
            // Life & Regular fields
            name: profile.name || profile.fullName || "",
            emailAddress: profile.emailAddress || profile.email || "",
            telMobileNo: profile.telMobileNo || profile.phone || "",
            whereEmployed: eduJob.whereEmployed || eduJob.institution || "",
            businessAddress: eduJob.businessAddress || eduJob.address || "",
            degreeObtained: eduJob.degreeObtained || "",
            specialization: eduJob.specialization || "",
            yearObtained: eduJob.yearObtained || "",
            yearsActiveInPAGE: exp.yearsActiveInPAGE,
            teachingExperience: Array.isArray(exp.teachingExperience) ? exp.teachingExperience : [],
            administrativeExperience: Array.isArray(exp.administrativeExperience) ? exp.administrativeExperience : [],
            recentPublications: Array.isArray(exp.recentPublications) ? exp.recentPublications : [],
            professionalMemberships: Array.isArray(exp.professionalMemberships) ? exp.professionalMemberships : [],
            characterReferences: Array.isArray(refs.characterReferences) && refs.characterReferences.length === 2
              ? refs.characterReferences
              : [
                  { name: refs.ref1Name || "", position: refs.ref1Position || "", address: refs.ref1Address || "" },
                  { name: refs.ref2Name || "", position: refs.ref2Position || "", address: refs.ref2Address || "" },
                ],
            regionalChapterBoardReference: refs.regionalChapterBoardReference || { name: "", address: "" },

            // map exp / ref fields so they can print for associate
            teachingExp: exp.teachingExp,
            teachingInst: exp.teachingInst,
            teachingFrom: exp.teachingFrom,
            teachingTo: exp.teachingTo,
            adminExp: exp.adminExp,
            adminInst: exp.adminInst,
            adminFrom: exp.adminFrom,
            adminTo: exp.adminTo,
            pub1: exp.pub1,
            pub2: exp.pub2,
            pub3: exp.pub3,
            pub4: exp.pub4,
            ref1Name: refs.ref1Name,
            ref1Position: refs.ref1Position,
            ref1Address: refs.ref1Address,
            ref2Name: refs.ref2Name,
            ref2Position: refs.ref2Position,
            ref2Address: refs.ref2Address,
          } as any);

        } catch (err) {
          console.error("Error loading application status:", err);
          setStatus(getMockStatus(applicationId));
        }
      } else {
        setStatus(getMockStatus(applicationId));
        const saved = localStorage.getItem("page_membership_application_data");
        if (saved) {
          try {
            setFormData(JSON.parse(saved));
          } catch (err) {
            console.error("Failed to parse saved application data:", err);
          }
        }
      }
    }
    
    fetchApp();
  }, [applicationId]);

  if (!status) return null;

  return (
    <div className="track-page">
      <Navbar scrolled={scrolled} />

      <main className="track-container">
        <motion.h1
          className="track-title"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Application Status
        </motion.h1>
        <motion.p
          className="track-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Monitor the progression of your PAGE membership application.
        </motion.p>

        <motion.div
          className="track-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Metadata details strip */}
          <div className="track-details-strip">
            <div className="track-detail-item">
              <div className="track-detail-item__label">Application ID</div>
              <div className="track-detail-item__value" style={{ fontFamily: "monospace", letterSpacing: "0.5px" }}>
                {status.id}
              </div>
            </div>
            <div className="track-detail-item">
              <div className="track-detail-item__label">Submission Date</div>
              <div className="track-detail-item__value">{status.submittedAt}</div>
            </div>
            <div className="track-detail-item">
              <div className="track-detail-item__label">Category Applied</div>
              <div className="track-detail-item__value">{formData?.membershipType ? (
                formData.membershipType.charAt(0).toUpperCase() + formData.membershipType.slice(1) + " Member"
              ) : status.membershipType}</div>
            </div>
            <div className="track-detail-item">
              <div className="track-detail-item__label">Current Status</div>
              <div className="track-detail-item__value" style={{ color: "var(--track-accent)" }}>
                {status.stages[status.currentStage].label}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="track-timeline">
            {status.stages.map((stage, index) => {
              const isCompleted = index < status.currentStage;
              const isActive = index === status.currentStage;
              
              let nodeClasses = "track-timeline-node";
              if (isCompleted) nodeClasses += " track-timeline-node--completed";
              if (isActive) nodeClasses += " track-timeline-node--active";

              return (
                <div key={stage.label} className={nodeClasses}>
                  <div className="track-timeline-dot" aria-hidden="true">
                    <div className="track-timeline-dot__inner" />
                  </div>
                  
                  <div className="track-timeline-content">
                    <div className="track-timeline-label">{stage.label}</div>
                    <p className="track-timeline-desc">{stage.description}</p>
                    {stage.timestamp && (
                      <span className="track-timeline-time">
                        <Clock size={11} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
                        {stage.timestamp}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footnote instruction */}
          <div className="track-footnote">
            <strong>Notification Update:</strong> You will be notified via email automatically when your application status is verified or if additional document attachments are required.
          </div>

          {/* Bottom actions CTA */}
          <div className="track-btn-wrap">
            {formData && (
              <button
                type="button"
                onClick={() => window.print()}
                className="track-download-btn"
              >
                <Download size={16} /> Download PDF Form
              </button>
            )}
            <Link href="/" className="track-home-btn">
              <Home size={16} /> Return to Homepage
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Hidden printable form content loaded from storage */}
      {formData && <PrintableForm state={formData} />}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-sans)', color: '#143152' }}>
        <h3>Loading Application Status...</h3>
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
