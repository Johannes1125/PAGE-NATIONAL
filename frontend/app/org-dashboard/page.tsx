"use client";

import Link from "next/link";
import { BadgeCheck, Clock3, FileCheck2, FileX2, FileClock, ListChecks, UserPlus } from "lucide-react";
import "./org-dashboard.css";

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

type OrganizationDashboardData = {
  organizationName: string;
  postStats: PostStats;
  activeReviews: ActiveReview[];
  membershipRequests: MembershipRequest[];
};

function fetchOrganizationDashboardData(): OrganizationDashboardData {
  return {
    organizationName: "Gordon College Graduate Council",
    postStats: {
      pending: 7,
      approved: 18,
      rejected: 3,
    },
    activeReviews: [
      {
        id: "r-1",
        title: "AI-Assisted Literature Mapping for Thesis Writing",
        reviewer: "Dr. Angela Reyes",
        dueDate: "Apr 15, 2026",
        status: "in-review",
      },
      {
        id: "r-2",
        title: "Hybrid Capstone Outcomes Across Departments",
        reviewer: "Prof. Marianne Dela Cruz",
        dueDate: "Apr 19, 2026",
        status: "revision",
      },
      {
        id: "r-3",
        title: "Graduate Advising Load and Student Well-Being",
        reviewer: "Dr. Jose Miguel Santos",
        dueDate: "Apr 22, 2026",
        status: "in-review",
      },
    ],
    membershipRequests: [
      {
        id: "m-1",
        name: "Carla Mendoza",
        role: "Contributor",
        submittedAt: "Today, 9:12 AM",
      },
      {
        id: "m-2",
        name: "Paolo Rivera",
        role: "Peer Reviewer",
        submittedAt: "Today, 10:31 AM",
      },
      {
        id: "m-3",
        name: "Aileen Cruz",
        role: "Content Manager",
        submittedAt: "Yesterday, 4:40 PM",
      },
    ],
  };
}

function retrieveActivityLogs(): ActivityLog[] {
  return [
    {
      id: "a-1",
      title: "Post submitted for admin approval",
      detail: "AI-Assisted Literature Mapping for Thesis Writing",
      time: "12 minutes ago",
    },
    {
      id: "a-2",
      title: "Reviewer assigned",
      detail: "Dr. Angela Reyes assigned to a new submission",
      time: "29 minutes ago",
    },
    {
      id: "a-3",
      title: "Membership request received",
      detail: "New organization member application from Carla Mendoza",
      time: "1 hour ago",
    },
    {
      id: "a-4",
      title: "Revision requested",
      detail: "Hybrid Capstone Outcomes requires citation updates",
      time: "2 hours ago",
    },
  ];
}

function retrieveOrganizationDataLogs(): OrganizationDataLog[] {
  return [
    {
      id: "d-1",
      entry: "Post statistics refreshed (pending/approved/rejected)",
      source: "Organization Posts",
      time: "5 minutes ago",
    },
    {
      id: "d-2",
      entry: "Assigned reviewer list synchronized",
      source: "Review Assignments",
      time: "18 minutes ago",
    },
    {
      id: "d-3",
      entry: "Membership requests queue updated",
      source: "Member Management",
      time: "42 minutes ago",
    },
    {
      id: "d-4",
      entry: "Activity timeline cache regenerated",
      source: "Activity Service",
      time: "1 hour ago",
    },
  ];
}

export default function OrgDashboardPage() {
  const dashboardData = fetchOrganizationDashboardData();
  const activityLogs = retrieveActivityLogs();
  const organizationDataLogs = retrieveOrganizationDataLogs();

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
            <p className="org-hero__organization">{dashboardData.organizationName}</p>

            <section className="org-quick-actions">
              <button type="button" className="org-action-btn"><FileCheck2 size={14} /> Create Post</button>
              <button type="button" className="org-action-btn"><ListChecks size={14} /> View Reviews</button>
              <button type="button" className="org-action-btn"><UserPlus size={14} /> Manage Requests</button>
            </section>

            <section className="org-metrics">
              <article className="org-metric-card org-metric-card--pending">
                <div className="org-metric-card__icon"><FileClock size={15} /></div>
                <p className="org-metric-card__label">Pending Posts</p>
                <p className="org-metric-card__value">{dashboardData.postStats.pending}</p>
              </article>
              <article className="org-metric-card org-metric-card--approved">
                <div className="org-metric-card__icon"><BadgeCheck size={15} /></div>
                <p className="org-metric-card__label">Approved Posts</p>
                <p className="org-metric-card__value">{dashboardData.postStats.approved}</p>
              </article>
              <article className="org-metric-card org-metric-card--rejected">
                <div className="org-metric-card__icon"><FileX2 size={15} /></div>
                <p className="org-metric-card__label">Rejected Posts</p>
                <p className="org-metric-card__value">{dashboardData.postStats.rejected}</p>
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
                {dashboardData.activeReviews.map((review) => (
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
                {dashboardData.membershipRequests.map((request) => (
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
