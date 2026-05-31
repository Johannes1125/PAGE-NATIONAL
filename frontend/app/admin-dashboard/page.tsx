"use client";

import {
  Building2,
  FileClock,
  Newspaper,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import AdminSidebarLayout from "./components/AdminSidebarLayout";
import ChartCard from "./components/ChartCard";
import "./admin-dashboard.css";

type Metric = {
  label: string;
  value: number;
  meta: string;
  tone: "blue" | "gold" | "red" | "green";
  icon: LucideIcon;
};

type ContentPoint = {
  label: string;
  posts: number;
};

type UserPoint = {
  label: string;
  users: number;
};

type PeriodFilter = "day" | "month" | "year";

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

const periodOptions: PeriodFilter[] = ["day", "month", "year"];

const contentTrendByPeriod: Record<PeriodFilter, ContentPoint[]> = {
  day: [
    { label: "Mon", posts: 8 },
    { label: "Tue", posts: 11 },
    { label: "Wed", posts: 14 },
    { label: "Thu", posts: 12 },
    { label: "Fri", posts: 16 },
    { label: "Sat", posts: 9 },
    { label: "Sun", posts: 7 },
  ],
  month: [
    { label: "Jan", posts: 30 },
    { label: "Feb", posts: 38 },
    { label: "Mar", posts: 52 },
    { label: "Apr", posts: 46 },
    { label: "May", posts: 62 },
    { label: "Jun", posts: 71 },
  ],
  year: [
    { label: "2021", posts: 380 },
    { label: "2022", posts: 442 },
    { label: "2023", posts: 501 },
    { label: "2024", posts: 546 },
    { label: "2025", posts: 611 },
    { label: "2026", posts: 668 },
  ],
};

const userGrowthByPeriod: Record<PeriodFilter, UserPoint[]> = {
  day: [
    { label: "Mon", users: 1090 },
    { label: "Tue", users: 1092 },
    { label: "Wed", users: 1095 },
    { label: "Thu", users: 1098 },
    { label: "Fri", users: 1101 },
    { label: "Sat", users: 1103 },
    { label: "Sun", users: 1104 },
  ],
  month: [
    { label: "Jan", users: 720 },
    { label: "Feb", users: 760 },
    { label: "Mar", users: 812 },
    { label: "Apr", users: 880 },
    { label: "May", users: 943 },
    { label: "Jun", users: 1104 },
  ],
  year: [
    { label: "2021", users: 4310 },
    { label: "2022", users: 5195 },
    { label: "2023", users: 6620 },
    { label: "2024", users: 8128 },
    { label: "2025", users: 9714 },
    { label: "2026", users: 11040 },
  ],
};

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
  return points.reduce(
    (max, point) => (point.posts > max ? point.posts : max),
    0
  );
}

export default function AdminDashboardPage() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");
  const metrics = aggregateSystemMetrics();
  const activityFeed = fetchRecentActivityLogs();
  const contentTrend = useMemo(
    () => contentTrendByPeriod[periodFilter],
    [periodFilter]
  );
  const userGrowth = useMemo(
    () => userGrowthByPeriod[periodFilter],
    [periodFilter]
  );
  const contentMax = maxContentValue(contentTrend);

  const periodHint =
    periodFilter === "day"
      ? "Daily"
      : periodFilter === "month"
        ? "Monthly"
        : "Yearly";

  return (
    <AdminSidebarLayout
      pageClassName="admin-dashboard"
      mainClassName="admin-main"
      title="Dashboard Overview"
      subtitle="View platform metrics, monitor activity, and track approval workflow status in one place."
    >
      <section className="admin-shell admin-shell--main">

        {/* ── Metric cards ── */}
        <section className="admin-hero-metrics admin-summary-grid">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className={`admin-hero-card admin-hero-card--${metric.tone}`}
            >
              <div className="admin-hero-card__top">
                <div
                  className="admin-hero-card__icon"
                  aria-hidden="true"
                >
                  <metric.icon size={16} strokeWidth={2} />
                </div>
                <p className="admin-hero-card__title">{metric.label}</p>
              </div>
              <p className="admin-hero-card__value">
                {metric.value.toLocaleString()}
              </p>
              <p className="admin-hero-card__meta">{metric.meta}</p>
            </article>
          ))}
        </section>

        {/* ── Main panels ── */}
        <section className="admin-grid">
          <section className="admin-dual-layout">

            {/* Activity feed */}
            <article className="admin-panel activity-panel">
              <div className="admin-panel__head">
                <div className="admin-panel__head-left">
                  <span className="panel-icon" aria-hidden="true">
                    <FileClock size={16} />
                  </span>
                  <h2 className="admin-panel__title">Recent Activity</h2>
                </div>
                <p className="admin-panel__hint">
                  Registrations, submissions, and messages
                </p>
              </div>

              <div className="activity-feed">
                {activityFeed.map((activity) => (
                  <article
                    key={`${activity.title}-${activity.time}`}
                    className="activity-item"
                  >
                    <div className="activity-item__main">
                      <p className="activity-item__title">{activity.title}</p>
                      <p className="activity-item__actor">{activity.actor}</p>
                    </div>
                    <div className="activity-item__time">{activity.time}</div>
                  </article>
                ))}
              </div>
            </article>

            {/* Analytics panel */}
            <article className="admin-panel admin-panel--analytics">
              {/* Period filter */}
              <div
                className="analytics-period-filter"
                role="tablist"
                aria-label="Analytics period filter"
              >
                {periodOptions.map((option) => {
                  const isActive = option === periodFilter;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`analytics-period-filter__button${
                        isActive
                          ? " analytics-period-filter__button--active"
                          : ""
                      }`}
                      onClick={() => setPeriodFilter(option)}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  );
                })}
              </div>

              {/* Content trends */}
              <div className="analytics-block">
                <div className="admin-panel__head">
                  <div className="admin-panel__head-left">
                    <span className="panel-icon" aria-hidden="true">
                      <Newspaper size={16} />
                    </span>
                    <h2 className="admin-panel__title">Content Trends</h2>
                  </div>
                  <p className="admin-panel__hint">
                    {periodHint} submissions
                  </p>
                </div>

                <div className="trend-chart">
                  <div className="trend-bars">
                    {contentTrend.map((point) => {
                      const heightPercent = Math.max(
                        18,
                        Math.round((point.posts / contentMax) * 100)
                      );
                      return (
                        <div
                          key={point.label}
                          className="trend-bar"
                          data-label={point.label}
                          style={{ height: `${heightPercent}%` }}
                          title={`${point.posts} posts`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* User growth */}
              <div className="analytics-block">
                <div className="admin-panel__head">
                  <div className="admin-panel__head-left">
                    <span className="panel-icon" aria-hidden="true">
                      <Users size={16} />
                    </span>
                    <h2 className="admin-panel__title">User Growth</h2>
                  </div>
                  <p className="admin-panel__hint">
                    {periodHint} account growth
                  </p>
                </div>

                {/* Reusable chart component */}
                <div>
                  {/* @ts-ignore Server component can import client ChartCard safely */}
                  <ChartCard
                    title="User Growth"
                    hint={`${periodHint} new accounts`}
                    data={userGrowth.map((p) => ({
                      label: p.label,
                      value: p.users,
                    }))}
                    color="#1E538E"
                  />
                </div>
              </div>
            </article>

          </section>
        </section>

      </section>
    </AdminSidebarLayout>
  );
}