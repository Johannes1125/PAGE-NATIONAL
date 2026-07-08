"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Building2,
  FileClock,
  Newspaper,
  Users,
  type LucideIcon,
} from "lucide-react";
import AdminSidebarLayout from "./components/AdminSidebarLayout";
import AdminTypewriterLoader from "../lib/admin-loader/AdminTypewriterLoader";
import ChartCard from "./components/ChartCard";
import "./admin-dashboard.css";
import { api } from "../lib/api-client";

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

type PeriodFilter = "day" | "month" | "year";

type Activity = {
  title: string;
  actor: string;
  time: string;
  state: "success" | "warning";
  stateLabel: string;
};

const periodOptions: PeriodFilter[] = ["day", "month", "year"];

// Fallback Mock Data for charts in case DB seeds are empty/just initialized
const defaultContentTrend: ContentPoint[] = [
  { month: "Jan", posts: 30 },
  { month: "Feb", posts: 38 },
  { month: "Mar", posts: 52 },
  { month: "Apr", posts: 46 },
  { month: "May", posts: 62 },
  { month: "Jun", posts: 71 },
];

const defaultUserGrowth: UserPoint[] = [
  { month: "Jan", users: 720 },
  { month: "Feb", users: 760 },
  { month: "Mar", users: 812 },
  { month: "Apr", users: 880 },
  { month: "May", users: 943 },
  { month: "Jun", users: 1104 },
];

const defaultActivities: Activity[] = [
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
];

export default function AdminDashboardPage() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Dashboard States from Backend API
  const [totalUsers, setTotalUsers] = useState(1104);
  const [totalOrgs, setTotalOrgs] = useState(124);
  const [pendingPostsCount, setPendingPostsCount] = useState(26);
  const [publishedPostsCount, setPublishedPostsCount] = useState(412);
  const [activities, setActivities] = useState<Activity[]>(defaultActivities);
  
  const [contentTrend, setContentTrend] = useState<ContentPoint[]>(defaultContentTrend);
  const [userGrowth, setUserGrowth] = useState<UserPoint[]>(defaultUserGrowth);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const response = await api.get('/admin/metrics');
        if (response.success) {
          const { metrics, recentActivities, trends, growth } = response;
          
          setTotalUsers(metrics.totalUsers ?? 0);
          setTotalOrgs(metrics.totalOrgs ?? 0);
          setPendingPostsCount(metrics.pendingPosts ?? 0);
          setPublishedPostsCount(metrics.publishedPosts ?? 0);

          if (recentActivities && recentActivities.length > 0) {
            setActivities(
              recentActivities.map((act: any) => ({
                title: act.action,
                actor: `${act.userName} (${act.role})`,
                time: act.timestamp,
                state: act.role === 'Admin' || act.role === 'System' ? 'success' : 'warning',
                stateLabel: act.role === 'Admin' || act.role === 'System' ? 'System' : 'Activity',
              }))
            );
          }

          if (trends && trends.length > 0) {
            setContentTrend(
              trends.map((t: any) => ({
                month: t.month,
                posts: t.submissions ?? 0
              }))
            );
          }

          if (growth && growth.length > 0) {
            setUserGrowth(
              growth.map((g: any) => ({
                month: g.month,
                users: g.users ?? 0
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to load live dashboard statistics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardMetrics();
  }, []);

  // Compute metrics list dynamically
  const metrics: Metric[] = useMemo(() => [
    {
      label: "Total Users",
      value: totalUsers,
      meta: `${totalUsers - totalOrgs} members + ${totalOrgs} org accounts`,
      tone: "blue",
      icon: Users,
    },
    {
      label: "Organizations",
      value: totalOrgs,
      meta: "Verified organization profiles",
      tone: "green",
      icon: Building2,
    },
    {
      label: "Pending Posts",
      value: pendingPostsCount,
      meta: "Awaiting moderation review",
      tone: "gold",
      icon: FileClock,
    },
    {
      label: "Published Content",
      value: publishedPostsCount,
      meta: "Live posts, journals, and updates",
      tone: "red",
      icon: Newspaper,
    },
  ], [totalUsers, totalOrgs, pendingPostsCount, publishedPostsCount]);

  const periodHint = useMemo(() => {
    switch (periodFilter) {
      case "day":
        return "Daily";
      case "year":
        return "Yearly";
      case "month":
      default:
        return "Monthly";
    }
  }, [periodFilter]);

  // Adjust Trend and Growth points based on selected PeriodFilter (simulated filter options)
  const filteredContentTrend = useMemo(() => {
    if (periodFilter === "day") {
      return contentTrend.map(point => ({ ...point, posts: Math.round(point.posts / 30) }));
    }
    if (periodFilter === "year") {
      return contentTrend.map(point => ({ ...point, posts: point.posts * 12 }));
    }
    return contentTrend;
  }, [contentTrend, periodFilter]);

  const filteredUserGrowth = useMemo(() => {
    if (periodFilter === "day") {
      return userGrowth.map(point => ({ ...point, users: Math.round(point.users / 30) }));
    }
    if (periodFilter === "year") {
      return userGrowth.map(point => ({ ...point, users: point.users * 10 }));
    }
    return userGrowth;
  }, [userGrowth, periodFilter]);

  const contentMax = useMemo(() => {
    return filteredContentTrend.reduce((max, point) => (point.posts > max ? point.posts : max), 1);
  }, [filteredContentTrend]);

  if (isLoading) {
    return (
      <AdminSidebarLayout
        pageClassName="admin-dashboard"
        mainClassName="admin-main"
        title="Dashboard Overview"
        subtitle="View platform metrics, monitor activity, and track approval workflow status in one place."
      >
        <AdminTypewriterLoader label="Loading Dashboard Overview..." />
      </AdminSidebarLayout>
    );
  }

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
            <article key={metric.label} className={`admin-hero-card admin-hero-card--${metric.tone}`}>
              <div className="admin-hero-card__top">
                <div className="admin-hero-card__icon" aria-hidden="true">
                  <metric.icon size={16} strokeWidth={2} />
                </div>
                <p className="admin-hero-card__title">{metric.label}</p>
              </div>
              <p className="admin-hero-card__value">{metric.value.toLocaleString()}</p>
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
                <p className="admin-panel__hint">Registrations, submissions, and messages</p>
              </div>

              <div className="activity-feed">
                {activities.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No recent activity logged.</p>
                ) : (
                  activities.map((activity, index) => (
                    <article key={index} className="activity-item">
                      <div className="activity-item__main">
                        <p className="activity-item__title">{activity.title}</p>
                        <p className="activity-item__actor">{activity.actor}</p>
                      </div>
                      <div className="activity-item__time">{activity.time}</div>
                    </article>
                  ))
                )}
              </div>
            </article>

            {/* Analytics panel */}
            <article className="admin-panel admin-panel--analytics">
              {/* Period filter */}
              <div className="analytics-period-filter" role="tablist" aria-label="Analytics period filter">
                {periodOptions.map((option) => {
                  const isActive = option === periodFilter;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`analytics-period-filter__button${isActive ? " analytics-period-filter__button--active" : ""}`}
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
                  <p className="admin-panel__hint">{periodHint} submissions</p>
                </div>

                <div className="trend-chart">
                  <div className="trend-bars">
                    {filteredContentTrend.map((point) => {
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

              {/* User growth */}
              <div className="analytics-block">
                <ChartCard
                  title="User Growth"
                  hint={`${periodHint} new accounts`}
                  data={filteredUserGrowth.map((p) => ({
                    label: p.month,
                    value: p.users,
                  }))}
                  color="#1E538E"
                />
              </div>
            </article>
          </section>
        </section>
      </section>
    </AdminSidebarLayout>
  );
}