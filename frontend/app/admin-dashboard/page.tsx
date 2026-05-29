"use client";

import {
  Building2,
  FileClock,
  Newspaper,
  Users,
  type LucideIcon,
} from "lucide-react";
import AdminSidebarLayout from "./components/AdminSidebarLayout";
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
    <AdminSidebarLayout
      pageClassName="admin-dashboard"
      mainClassName="admin-main"
      title="Dashboard Overview"
      subtitle="View platform metrics, monitor activity, and track approval workflow status in one place."
    >
      <section className="admin-shell admin-shell--main">
          <section className="admin-hero-metrics admin-summary-grid">
            {metrics.map((metric) => (
              <article key={metric.label} className={`admin-hero-card admin-hero-card--${metric.tone}`}>
                <div className="admin-hero-card__top">
                  <div className="admin-hero-card__icon" aria-hidden="true">
                    <metric.icon size={15} strokeWidth={2.1} />
                  </div>
                  <p className="admin-hero-card__title">{metric.label}</p>
                </div>
                <p className="admin-hero-card__value">{metric.value.toLocaleString()}</p>
                <p className="admin-hero-card__meta">{metric.meta}</p>
              </article>
            ))}
          </section>

          <section className="admin-grid">
            <section className="admin-dual-layout">
              <article className="admin-panel activity-panel">
                <div className="admin-panel__head">
                  <div className="admin-panel__head-left">
                    <span className="panel-icon" aria-hidden="true">
                      <FileClock size={16} />
                    </span>
                    <h2 className="admin-panel__title">Recent Activity</h2>
                  </div>
                  <p className="admin-panel__hint">Registrations, submissions, and messages</p>
                </div>

                <div className="activity-feed">
                  {activityFeed.map((activity) => (
                    <article key={`${activity.title}-${activity.time}`} className="activity-item">
                      <div className="activity-item__main">
                        <p className="activity-item__title">{activity.title}</p>
                        <p className="activity-item__actor">{activity.actor}</p>
                      </div>
                      <div className="activity-item__time">{activity.time}</div>
                    </article>
                  ))}
                </div>
              </article>

              <article className="admin-panel admin-panel--analytics">
                <div className="analytics-block">
                  <div className="admin-panel__head">
                    <div className="admin-panel__head-left">
                      <span className="panel-icon" aria-hidden="true">
                        <Newspaper size={16} />
                      </span>
                      <h2 className="admin-panel__title">Content Trends</h2>
                    </div>
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
                  <div className="admin-panel__head-left">
                    <span className="panel-icon" aria-hidden="true">
                      <Users size={16} />
                    </span>
                    <h2 className="admin-panel__title">User Growth</h2>
                  </div>
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
    </AdminSidebarLayout>
  );
}
