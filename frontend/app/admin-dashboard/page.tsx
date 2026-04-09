"use client";

import Link from "next/link";
import { Building2, FileClock, Newspaper, Users, type LucideIcon } from "lucide-react";
import "./admin-dashboard.css";

type Metric = {
  label: string;
  value: number;
  meta: string;
  tone: "blue" | "gold" | "red" | "green";
  icon: LucideIcon;
};

type ContentPoint = {
  month: string;
  posts: number;
};

type UserPoint = {
  month: string;
  users: number;
};

type Activity = {
  title: string;
  actor: string;
  time: string;
  state: "success" | "warning";
  stateLabel: string;
};

const usersByType = {
  members: 980,
  orgAccounts: 124,
};

const contentSnapshot = {
  pendingPosts: 26,
  publishedContent: 412,
};

const contentTrend: ContentPoint[] = [
  { month: "Jan", posts: 30 },
  { month: "Feb", posts: 38 },
  { month: "Mar", posts: 52 },
  { month: "Apr", posts: 46 },
  { month: "May", posts: 62 },
  { month: "Jun", posts: 71 },
];

const userGrowth: UserPoint[] = [
  { month: "Jan", users: 720 },
  { month: "Feb", users: 760 },
  { month: "Mar", users: 812 },
  { month: "Apr", users: 880 },
  { month: "May", users: 943 },
  { month: "Jun", users: 1104 },
];

const recentActivityLogs: Activity[] = [
  {
    title: "New organization account approved",
    actor: "Admin Team",
    time: "2 minutes ago",
    state: "success",
    stateLabel: "Completed",
  },
  {
    title: "Article submitted for review",
    actor: "Dr. Angela Reyes",
    time: "9 minutes ago",
    state: "warning",
    stateLabel: "Pending",
  },
  {
    title: "Member registration verified",
    actor: "System",
    time: "24 minutes ago",
    state: "success",
    stateLabel: "Completed",
  },
  {
    title: "Message received from contact form",
    actor: "Contact Center",
    time: "1 hour ago",
    state: "warning",
    stateLabel: "Needs Reply",
  },
  {
    title: "Research post published",
    actor: "Editorial Board",
    time: "2 hours ago",
    state: "success",
    stateLabel: "Published",
  },
];

function aggregateSystemMetrics(): Metric[] {
  const totalUsers = usersByType.members + usersByType.orgAccounts;
  const totalOrganizations = usersByType.orgAccounts;

  return [
    {
      label: "Total Users",
      value: totalUsers,
      meta: `${usersByType.members} members + ${usersByType.orgAccounts} org accounts`,
      tone: "blue",
      icon: Users,
    },
    {
      label: "Organizations",
      value: totalOrganizations,
      meta: "Verified organization profiles",
      tone: "green",
      icon: Building2,
    },
    {
      label: "Pending Posts",
      value: contentSnapshot.pendingPosts,
      meta: "Awaiting moderation review",
      tone: "gold",
      icon: FileClock,
    },
    {
      label: "Published Content",
      value: contentSnapshot.publishedContent,
      meta: "Live posts, journals, and updates",
      tone: "red",
      icon: Newspaper,
    },
  ];
}

function fetchRecentActivityLogs(): Activity[] {
  return recentActivityLogs;
}

function maxContentValue(points: ContentPoint[]): number {
  return points.reduce((max, point) => (point.posts > max ? point.posts : max), 0);
}

function createUserGrowthPath(points: UserPoint[]): string {
  const width = 520;
  const height = 110;
  const xStep = width / (points.length - 1);
  const minUsers = Math.min(...points.map((point) => point.users));
  const maxUsers = Math.max(...points.map((point) => point.users));
  const range = maxUsers - minUsers || 1;

  return points
    .map((point, index) => {
      const x = index * xStep;
      const normalized = (point.users - minUsers) / range;
      const y = height - normalized * (height - 8) - 4;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function AdminDashboardPage() {
  const metrics = aggregateSystemMetrics();
  const activityFeed = fetchRecentActivityLogs();
  const contentMax = maxContentValue(contentTrend);
  const growthPath = createUserGrowthPath(userGrowth);

  return (
    <main className="admin-dashboard">
      <aside className="admin-navbar">
        <div className="admin-navbar__inner">
          <div className="admin-brand">
            <div className="admin-brand__badge" aria-hidden="true">
              <span className="admin-brand__badge-text">P</span>
            </div>
            <div className="admin-brand__identity">
              <div className="admin-brand__eyebrow">PAGE</div>
              <div className="admin-brand__name">Admin Dashboard</div>
              <div className="admin-brand__tagline">Philippine Association for Graduate Education</div>
            </div>
          </div>

          <nav className="admin-nav">
            <Link href="/" className="admin-nav__link">Main Page</Link>
            <Link href="/admin-dashboard" className="admin-nav__link admin-nav__link--active">Overview</Link>
            <Link href="/admin-dashboard/create-new-post" className="admin-nav__link">Create New Post</Link>
            <Link href="/admin-dashboard/approve-post" className="admin-nav__link">Approve Posts</Link>
            <Link href="/admin-dashboard/manage-users" className="admin-nav__link">Manage Users</Link>
            <Link href="/admin-dashboard/view-messages" className="admin-nav__link">Messages</Link>
          </nav>
        </div>
      </aside>

      <section className="admin-hero-band">
        <div className="admin-shell">
          <section className="admin-hero">
            <header className="admin-hero-header">
              <h1 className="admin-hero-title">Admin Dashboard Overview</h1>
              <p className="admin-hero-subtitle">
                View platform metrics, monitor activity, and track approval workflow status in one place.
              </p>
            </header>

            <section className="admin-hero-metrics">
              {metrics.map((metric) => (
                <article key={metric.label} className={`admin-hero-card admin-hero-card--${metric.tone}`}>
                  <div className="admin-hero-card__icon" aria-hidden="true">
                    <metric.icon size={15} strokeWidth={2.1} />
                  </div>
                  <p className="admin-hero-card__title">{metric.label}</p>
                  <p className="admin-hero-card__value">{metric.value.toLocaleString()}</p>
                </article>
              ))}
            </section>
          </section>
        </div>

        <svg className="admin-hero-divider" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,50 C220,95 420,12 720,55 C980,92 1185,22 1440,58 L1440,120 L0,120 Z" fill="#eef3f9" />
        </svg>
      </section>

      <section className="admin-content">
      <section className="admin-shell">

        <section className="admin-grid">
          <section className="admin-dual-layout">
            <article className="admin-panel">
            <div className="admin-panel__head">
              <h2 className="admin-panel__title">Recent Activity Feed</h2>
              <p className="admin-panel__hint">Registrations, submissions, and messages</p>
            </div>

            <div className="activity-feed">
              {activityFeed.map((activity) => (
                <article key={`${activity.title}-${activity.time}`} className="activity-item">
                  <p className="activity-item__title">
                    {activity.title}
                    <span
                      className={`activity-pill ${activity.state === "success" ? "activity-pill--success" : "activity-pill--warning"}`}
                    >
                      {activity.stateLabel}
                    </span>
                  </p>
                  <p className="activity-item__meta">
                    {activity.actor} • {activity.time}
                  </p>
                </article>
              ))}
            </div>
            </article>

            <article className="admin-panel admin-panel--analytics">
              <div className="analytics-block">
                <div className="admin-panel__head">
                  <h2 className="admin-panel__title">Content Trends</h2>
                  <p className="admin-panel__hint">Monthly submissions</p>
                </div>

                <div className="trend-chart">
                  <div className="trend-bars">
                    {contentTrend.map((point) => {
                      const heightPercent = Math.max(18, Math.round((point.posts / contentMax) * 100));

                      return (
                        <div
                          key={point.month}
                          className="trend-bar"
                          data-label={point.month}
                          style={{ height: `${heightPercent}%` }}
                          title={`${point.posts} posts`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="analytics-block">
                <div className="admin-panel__head">
                  <h2 className="admin-panel__title">User Growth</h2>
                  <p className="admin-panel__hint">New accounts over time</p>
                </div>

                <svg className="user-line" viewBox="0 0 520 130" role="img" aria-label="User growth chart">
                  <rect x="0" y="0" width="520" height="130" fill="#f4f8fd" />
                  <polyline
                    points={growthPath}
                    fill="none"
                    stroke="#1e538e"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {userGrowth.map((point, index) => {
                    const x = (520 / (userGrowth.length - 1)) * index;
                    const minUsers = Math.min(...userGrowth.map((item) => item.users));
                    const maxUsers = Math.max(...userGrowth.map((item) => item.users));
                    const range = maxUsers - minUsers || 1;
                    const normalized = (point.users - minUsers) / range;
                    const y = 110 - normalized * (110 - 8) - 4;

                    return <circle key={point.month} cx={x} cy={y} r="4" fill="#2a6bb5" />;
                  })}
                </svg>
              </div>
            </article>
          </section>
        </section>
      </section>
      </section>
    </main>
  );
}
