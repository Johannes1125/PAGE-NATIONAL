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
  Home
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import { ApplicationStatus } from "../../../../lib/membership-types";
import "./track.css";

// ── Mock Initializer ────────────────────────────────────────────────────────

const getMockStatus = (id: string): ApplicationStatus => {
  // Format today's date
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
    currentStage: 1, // 0-indexed, so 1 means stage 2 is active ("Under Review")
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
  
  const applicationId = searchParams.get("id") || "MOCK-2025-0042";
  const [status, setStatus] = useState<ApplicationStatus | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setStatus(getMockStatus(applicationId));
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
              <div className="track-detail-item__value">{status.membershipType}</div>
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

          {/* Bottom return CTA */}
          <div className="track-btn-wrap">
            <Link href="/" className="track-home-btn">
              <Home size={16} /> Return to Homepage
            </Link>
          </div>
        </motion.div>
      </main>
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
