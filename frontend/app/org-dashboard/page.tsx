"use client";

import Link from "next/link";
import { BadgeCheck, Clock3, FileCheck2, FileX2, FileClock, ListChecks, UserPlus } from "lucide-react";
import "./org-dashboard.css";

import { useState, useEffect } from "react";
import { api } from "../lib/api-client";

type PostStats = {
  pending: number;
  approved: number;
  rejected: number;
};

type ActiveReview = {
  id: string;
  title: string;
  reviewer: string;
  dueDate: string;
  status: "in-review" | "revision";
};

type MembershipRequest = {
  id: string;
  name: string;
  role: string;
  submittedAt: string;
};

type ActivityLog = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

type OrganizationDataLog = {
  id: string;
  entry: string;
  source: string;
  time: string;
};

export default function OrgDashboardPage() {
  const [orgName, setOrgName] = useState("Gordon College Graduate Council");
  const [postStats, setPostStats] = useState<PostStats>({ pending: 0, approved: 0, rejected: 0 });
  const [activeReviews, setActiveReviews] = useState<ActiveReview[]>([]);
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [organizationDataLogs, setOrganizationDataLogs] = useState<OrganizationDataLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const payloadStr = localStorage.getItem("page_user_payload");
      if (payloadStr) {
        const payload = JSON.parse(payloadStr);
        setOrgName(payload.name || payload.university || "Gordon College Graduate Council");
      }
    }

    const fetchOrgMetrics = async () => {
      try {
        const data = await api.get('/org/metrics');
        
        setPostStats({
          pending: data.metrics.pendingPosts,
          approved: data.metrics.approvedPosts,
          rejected: data.metrics.rejectedPosts,
        });

        // Map dynamic timeline activity logs
        const formattedLogs: ActivityLog[] = data.recentActivities.map((act: any) => ({
          id: act.id.toString(),
          title: act.action,
          detail: "Authorized Action",
          time: act.timestamp,
        }));
        setActivityLogs(formattedLogs);

        // Map active reviews
        if (data.activeReviewsList) {
          const reviews = data.activeReviewsList.map((rev: any) => ({
            id: rev.id,
            title: rev.title,
            reviewer: rev.reviewer,
            dueDate: rev.dueDate,
            status: rev.status,
          }));
          setActiveReviews(reviews);
        }

        // Map membership requests
        if (data.membershipRequests) {
          const reqs = data.membershipRequests.map((req: any) => ({
            id: req.id,
            name: req.name,
            role: req.role,
            submittedAt: req.submittedAt,
          }));
          setMembershipRequests(reqs);
        }

        // Map organization data logs
        if (data.organizationDataLogs) {
          const logs = data.organizationDataLogs.map((log: any) => ({
            id: log.id,
            entry: log.entry,
            source: log.source,
            time: log.time,
          }));
          setOrganizationDataLogs(logs);
        }

      } catch (err) {
        console.error("Failed to fetch organization dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgMetrics();
  }, []);

  if (isLoading) {
    return (
      <main className="org-dashboard" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f4f8fd", color: "#1e538e" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1.25rem", fontWeight: 600 }}>Syncing Organization Workspace...</p>
          <p style={{ fontSize: "0.875rem", opacity: 0.7, marginTop: "0.25rem" }}>Fetching live metrics and activity timeline from Supabase</p>
        </div>
      </main>
    );
  }

  return (
    <main className="org-dashboard">
      <aside className="org-sidebar">
        <div className="org-sidebar__inner">
          <div className="org-brand">
            <div className="org-brand__badge">P</div>
            <div>
              <div className="org-brand__eyebrow">PAGE</div>
              <div className="org-brand__title">Org Dashboard</div>
              <div className="org-brand__subtitle">Organization Member Workspace</div>
            </div>
          </div>

          <nav className="org-nav">
            <Link href="/" className="org-nav__link">Main Page</Link>
            <Link href="/org-dashboard" className="org-nav__link org-nav__link--active">Overview</Link>
            <Link href="/org-dashboard/create-post" className="org-nav__link">Create Post for Approval</Link>
            <Link href="/org-dashboard/article-submission" className="org-nav__link">Article Submission</Link>
            <Link href="/org-dashboard/reviewer-assignment" className="org-nav__link">Reviewer Assignment</Link>
            <Link href="/org-dashboard/certificate-generation" className="org-nav__link">Certificate Generation</Link>
            <Link href="/org-dashboard/membership-request" className="org-nav__link">Membership Request</Link>
            <Link href="/org-dashboard/proof-of-payment" className="org-nav__link">Proof of Payment</Link>
            <Link href="/org-dashboard/messaging" className="org-nav__link">Messaging Page</Link>
          </nav>
        </div>
      </aside>

      <section className="org-main">
        <section className="org-hero">
          <div className="org-hero__inner">
            <h1 className="org-hero__title">Organization Dashboard</h1>
            <p className="org-hero__subtitle">
              Track post progress, monitor reviews, and manage organization requests in one place.
            </p>
            <p className="org-hero__organization">{orgName}</p>

            <section className="org-quick-actions">
              <Link href="/org-dashboard/create-post"><button type="button" className="org-action-btn"><FileCheck2 size={14} /> Create Post</button></Link>
              <Link href="/org-dashboard/article-submission"><button type="button" className="org-action-btn"><ListChecks size={14} /> View Reviews</button></Link>
              <Link href="/org-dashboard/membership-request"><button type="button" className="org-action-btn"><UserPlus size={14} /> Manage Requests</button></Link>
            </section>

            <section className="org-metrics">
              <article className="org-metric-card org-metric-card--pending">
                <div className="org-metric-card__icon"><FileClock size={15} /></div>
                <p className="org-metric-card__label">Pending Posts</p>
                <p className="org-metric-card__value">{postStats.pending}</p>
              </article>
              <article className="org-metric-card org-metric-card--approved">
                <div className="org-metric-card__icon"><BadgeCheck size={15} /></div>
                <p className="org-metric-card__label">Approved Posts</p>
                <p className="org-metric-card__value">{postStats.approved}</p>
              </article>
              <article className="org-metric-card org-metric-card--rejected">
                <div className="org-metric-card__icon"><FileX2 size={15} /></div>
                <p className="org-metric-card__label">Rejected Posts</p>
                <p className="org-metric-card__value">{postStats.rejected}</p>
              </article>
            </section>
          </div>
          <svg className="org-hero__wave" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,50 C220,95 420,12 720,55 C980,92 1185,22 1440,58 L1440,120 L0,120 Z" fill="#eef3f9" />
          </svg>
        </section>

        <section className="org-content">
          <section className="org-grid">
            <article className="org-panel">
              <div className="org-panel__head">
                <h2>Active Reviews & Assigned Reviewers</h2>
              </div>
              <div className="org-review-list">
                {activeReviews.map((review) => (
                  <article key={review.id} className="org-review-card">
                    <p className="org-review-card__title">{review.title}</p>
                    <p className="org-review-card__meta">
                      Reviewer: {review.reviewer} • Due: {review.dueDate}
                    </p>
                    <span className={`org-pill ${review.status === "in-review" ? "org-pill--blue" : "org-pill--gold"}`}>
                      {review.status === "in-review" ? "In Review" : "Needs Revision"}
                    </span>
                  </article>
                ))}
              </div>
            </article>

            <article className="org-panel">
              <div className="org-panel__head">
                <h2>Pending Membership Requests</h2>
              </div>
              <div className="org-request-list">
                {membershipRequests.map((request) => (
                  <article key={request.id} className="org-request-item">
                    <p className="org-request-item__name">{request.name}</p>
                    <p className="org-request-item__meta">{request.role} • {request.submittedAt}</p>
                  </article>
                ))}
              </div>
            </article>
          </section>

          <section className="org-grid org-grid--activity">
            <article className="org-panel">
              <div className="org-panel__head">
                <h2>Recent Activity Timeline</h2>
              </div>
              <div className="org-timeline">
                {activityLogs.map((activity) => (
                  <article key={activity.id} className="org-timeline-item">
                    <div className="org-timeline-item__dot" aria-hidden="true" />
                    <div>
                      <p className="org-timeline-item__title">{activity.title}</p>
                      <p className="org-timeline-item__detail">{activity.detail}</p>
                      <p className="org-timeline-item__time"><Clock3 size={12} /> {activity.time}</p>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <article className="org-panel">
              <div className="org-panel__head">
                <h2>Organization Activity Logs</h2>
              </div>
              <div className="org-data-log-list">
                {organizationDataLogs.map((log) => (
                  <article key={log.id} className="org-data-log-item">
                    <p className="org-data-log-item__entry">{log.entry}</p>
                    <p className="org-data-log-item__meta">{log.source}</p>
                    <p className="org-data-log-item__time"><Clock3 size={12} /> {log.time}</p>
                  </article>
                ))}
              </div>
            </article>
          </section>
        </section>
      </section>
    </main>
  );
}
