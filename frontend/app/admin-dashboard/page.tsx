"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Building2,
  FileClock,
  Newspaper,
  Users,
  Shield,
  Activity,
  BarChart3,
  TrendingUp,
  Globe,
  AlertTriangle,
  UserCheck,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import AdminSidebarLayout from "./components/AdminSidebarLayout";
import AdminTypewriterLoader from "../lib/admin-loader/AdminTypewriterLoader";
import ChartCard from "./components/ChartCard";
import AnalyticsSection from "./components/AnalyticsSection";
import DonutChart from "./components/DonutChart";
import SecurityGauge from "./components/SecurityGauge";
import ActivityHeatMap from "./components/ActivityHeatMap";
import MiniBarChart from "./components/MiniBarChart";
import "./admin-dashboard.css";
import { api } from "../lib/api-client";

/* ── Types ─────────────────────────────────────────────────────────────────── */

type Metric = {
  label: string;
  value: number;
  meta: string;
  tone: "blue" | "gold" | "red" | "green" | "cyan" | "violet";
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

type Activity_ = {
  title: string;
  actor: string;
  time: string;
  state: "success" | "warning";
  stateLabel: string;
};

type CategoryItem = { name: string; count: number };
type StatusItem = { name: string; count: number };
type RoleItem = { role: string; count: number };
type TopUser = {
  userId: string;
  name: string;
  role: string;
  email: string;
  activityCount: number;
};
type SecurityEvent = {
  id: string;
  action: string;
  ip: string;
  user: string;
  time: string;
};

const periodOptions: PeriodFilter[] = ["day", "month", "year"];

/* ── Donut Colors ──────────────────────────────────────────────────────────── */

const CATEGORY_COLORS = [
  "#1E538E", "#0ea5c9", "#10b981", "#f59e0b", "#f43f5e",
  "#7c3aed", "#143152", "#64748b", "#06b6d4", "#8b5cf6",
];

const STATUS_COLORS: Record<string, string> = {
  draft: "#64748b",
  pending: "#f59e0b",
  published: "#10b981",
  rejected: "#f43f5e",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "#7c3aed",
  organization: "#0ea5c9",
  member: "#1E538E",
};

/* ── Default Fallback Data ─────────────────────────────────────────────────── */

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

const defaultActivities: Activity_[] = [
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

const defaultHeatMap = Array.from({ length: 7 }, () => Array(24).fill(0));

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");
  const [isLoading, setIsLoading] = useState(true);

  // Core metrics
  const [totalUsers, setTotalUsers] = useState(1104);
  const [totalOrgs, setTotalOrgs] = useState(124);
  const [pendingPostsCount, setPendingPostsCount] = useState(26);
  const [publishedPostsCount, setPublishedPostsCount] = useState(412);
  const [activities, setActivities] = useState<Activity_[]>(defaultActivities);
  const [contentTrend, setContentTrend] = useState<ContentPoint[]>(defaultContentTrend);
  const [userGrowth, setUserGrowth] = useState<UserPoint[]>(defaultUserGrowth);

  // Content analytics
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryItem[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusItem[]>([]);

  // User activity analytics
  const [activeSessions, setActiveSessions] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [heatMapData, setHeatMapData] = useState<number[][]>(defaultHeatMap);
  const [topActiveUsers, setTopActiveUsers] = useState<TopUser[]>([]);
  const [totalActivitiesLast7Days, setTotalActivitiesLast7Days] = useState(0);

  // User growth analytics
  const [roleDistribution, setRoleDistribution] = useState<RoleItem[]>([]);
  const [membershipStats, setMembershipStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [newUsersLast30Days, setNewUsersLast30Days] = useState(0);

  // System & Security
  const [securityScore, setSecurityScore] = useState(85);
  const [failedLogins, setFailedLogins] = useState(0);
  const [uniqueIPs, setUniqueIPs] = useState(0);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const response = await api.get("/admin/metrics");
        if (response.success) {
          const {
            metrics,
            recentActivities,
            trends,
            growth,
            contentAnalytics,
            userActivityAnalytics,
            userGrowthAnalytics,
            systemAnalytics,
          } = response;

          // Core metrics
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
                state:
                  act.role === "Admin" || act.role === "System"
                    ? "success"
                    : "warning",
                stateLabel:
                  act.role === "Admin" || act.role === "System"
                    ? "System"
                    : "Activity",
              })),
            );
          }

          if (trends && trends.length > 0) {
            setContentTrend(
              trends.map((t: any) => ({
                month: t.month,
                posts: t.submissions ?? 0,
              })),
            );
          }

          if (growth && growth.length > 0) {
            setUserGrowth(
              growth.map((g: any) => ({
                month: g.month,
                users: g.users ?? 0,
              })),
            );
          }

          // Content analytics
          if (contentAnalytics) {
            if (contentAnalytics.categoryBreakdown)
              setCategoryBreakdown(contentAnalytics.categoryBreakdown);
            if (contentAnalytics.statusBreakdown)
              setStatusBreakdown(contentAnalytics.statusBreakdown);
          }

          // User activity analytics
          if (userActivityAnalytics) {
            setActiveSessions(userActivityAnalytics.activeSessions ?? 0);
            setTotalSessions(userActivityAnalytics.totalSessions ?? 0);
            if (userActivityAnalytics.heatMapData)
              setHeatMapData(userActivityAnalytics.heatMapData);
            if (userActivityAnalytics.topActiveUsers)
              setTopActiveUsers(userActivityAnalytics.topActiveUsers);
            setTotalActivitiesLast7Days(
              userActivityAnalytics.totalActivitiesLast7Days ?? 0,
            );
          }

          // User growth analytics
          if (userGrowthAnalytics) {
            if (userGrowthAnalytics.roleDistribution)
              setRoleDistribution(userGrowthAnalytics.roleDistribution);
            if (userGrowthAnalytics.membershipStats)
              setMembershipStats(userGrowthAnalytics.membershipStats);
            setNewUsersLast30Days(
              userGrowthAnalytics.totalNewUsersLast30Days ?? 0,
            );
          }

          // System & Security
          if (systemAnalytics) {
            setSecurityScore(systemAnalytics.securityScore ?? 85);
            setFailedLogins(systemAnalytics.failedLoginsLast7Days ?? 0);
            setUniqueIPs(systemAnalytics.uniqueIPsLast7Days ?? 0);
            if (systemAnalytics.recentSecurityEvents)
              setSecurityEvents(systemAnalytics.recentSecurityEvents);
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

  /* ── Derived Metric Cards ────────────────────────────────────────────────── */

  const metrics: Metric[] = useMemo(
    () => [
      {
        label: "Total Users",
        value: totalUsers,
        meta: `${totalUsers - totalOrgs} members + ${totalOrgs} org accounts`,
        tone: "blue" as const,
        icon: Users,
      },
      {
        label: "Organizations",
        value: totalOrgs,
        meta: "Verified organization profiles",
        tone: "green" as const,
        icon: Building2,
      },
      {
        label: "Pending Posts",
        value: pendingPostsCount,
        meta: "Awaiting moderation review",
        tone: "gold" as const,
        icon: FileClock,
      },
      {
        label: "Published Content",
        value: publishedPostsCount,
        meta: "Live posts, journals, and updates",
        tone: "red" as const,
        icon: Newspaper,
      },
      {
        label: "Active Sessions",
        value: activeSessions,
        meta: `${totalSessions} total sessions tracked`,
        tone: "cyan" as const,
        icon: Wifi,
      },
      {
        label: "Security Score",
        value: securityScore,
        meta:
          securityScore >= 85
            ? "Platform security is excellent"
            : securityScore >= 70
              ? "Platform security is good"
              : "Security needs attention",
        tone: "violet" as const,
        icon: Shield,
      },
    ],
    [
      totalUsers,
      totalOrgs,
      pendingPostsCount,
      publishedPostsCount,
      activeSessions,
      totalSessions,
      securityScore,
    ],
  );

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

  /* ── Filtered Chart Data ─────────────────────────────────────────────────── */

  const filteredContentTrend = useMemo(() => {
    if (periodFilter === "day") {
      return contentTrend.map((point) => ({
        ...point,
        posts: Math.round(point.posts / 30),
      }));
    }
    if (periodFilter === "year") {
      return contentTrend.map((point) => ({
        ...point,
        posts: point.posts * 12,
      }));
    }
    return contentTrend;
  }, [contentTrend, periodFilter]);

  const filteredUserGrowth = useMemo(() => {
    if (periodFilter === "day") {
      return userGrowth.map((point) => ({
        ...point,
        users: Math.round(point.users / 30),
      }));
    }
    if (periodFilter === "year") {
      return userGrowth.map((point) => ({
        ...point,
        users: point.users * 10,
      }));
    }
    return userGrowth;
  }, [userGrowth, periodFilter]);

  const contentMax = useMemo(() => {
    return filteredContentTrend.reduce(
      (max, point) => (point.posts > max ? point.posts : max),
      1,
    );
  }, [filteredContentTrend]);

  /* ── Donut Segments ──────────────────────────────────────────────────────── */

  const categorySegments = useMemo(
    () =>
      categoryBreakdown.map((c, i) => ({
        name: c.name.charAt(0).toUpperCase() + c.name.slice(1),
        value: c.count,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      })),
    [categoryBreakdown],
  );

  const statusSegments = useMemo(
    () =>
      statusBreakdown.map((s) => ({
        name: s.name.charAt(0).toUpperCase() + s.name.slice(1),
        value: s.count,
        color: STATUS_COLORS[s.name] || "#64748b",
      })),
    [statusBreakdown],
  );

  const roleSegments = useMemo(
    () =>
      roleDistribution.map((r) => ({
        name: r.role.charAt(0).toUpperCase() + r.role.slice(1),
        value: r.count,
        color: ROLE_COLORS[r.role] || "#64748b",
      })),
    [roleDistribution],
  );

  /* ── Loading state ───────────────────────────────────────────────────────── */

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
        {/* ═══════════════════════════════════════════════════════════════════
            Section 1 — Hero Metric Cards (6 cards)
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="admin-hero-metrics admin-summary-grid--6">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className={`admin-hero-card admin-hero-card--${metric.tone} admin-hero-card--animated`}
            >
              <div className="admin-hero-card__top">
                <div className="admin-hero-card__icon" aria-hidden="true">
                  <metric.icon size={16} strokeWidth={2} />
                </div>
                <p className="admin-hero-card__title">{metric.label}</p>
              </div>
              <p className="admin-hero-card__value">
                {metric.value.toLocaleString()}
                {metric.label === "Security Score" && (
                  <span className="admin-hero-card__unit">/ 100</span>
                )}
              </p>
              <p className="admin-hero-card__meta">{metric.meta}</p>
            </article>
          ))}
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            Section 2 — Content Publishing Analytics
            ═══════════════════════════════════════════════════════════════════ */}
        <AnalyticsSection
          title="Content Publishing Analytics"
          subtitle="Monthly trends, category breakdown, and content status overview"
          icon={BarChart3}
          className="analytics-section--content"
          actions={
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
          }
        >
          <div className="analytics-content-grid">
            {/* Bar chart — Content Trends */}
            <div className="analytics-block analytics-block--chart">
              <div className="admin-panel__head">
                <div className="admin-panel__head-left">
                  <span className="panel-icon" aria-hidden="true">
                    <TrendingUp size={16} />
                  </span>
                  <h3 className="admin-panel__title">Publishing Trend</h3>
                </div>
                <p className="admin-panel__hint">
                  {periodHint} submissions
                </p>
              </div>
              <div className="trend-chart">
                <div className="trend-bars">
                  {filteredContentTrend.map((point) => {
                    const heightPercent = Math.max(
                      18,
                      Math.round((point.posts / contentMax) * 100),
                    );
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

            {/* Donut — Category Breakdown */}
            <div className="analytics-block analytics-block--donut">
              {categorySegments.length > 0 ? (
                <DonutChart
                  segments={categorySegments}
                  title="By Category"
                  centerValue={categorySegments.reduce(
                    (s, c) => s + c.value,
                    0,
                  )}
                  centerLabel="Total"
                  size={160}
                  strokeWidth={24}
                />
              ) : (
                <div className="analytics-empty-state">
                  <Newspaper size={32} />
                  <p>No category data yet</p>
                </div>
              )}
            </div>

            {/* Mini Bar — Status Breakdown */}
            <div className="analytics-block analytics-block--status">
              {statusSegments.length > 0 ? (
                <MiniBarChart
                  items={statusSegments.map((s) => ({
                    label: s.name,
                    value: s.value,
                    color: s.color,
                  }))}
                  title="Content Status"
                />
              ) : (
                <div className="analytics-empty-state">
                  <FileClock size={32} />
                  <p>No status data yet</p>
                </div>
              )}
            </div>
          </div>
        </AnalyticsSection>

        {/* ═══════════════════════════════════════════════════════════════════
            Section 3 — User Analytics (Growth + Activity)
            ═══════════════════════════════════════════════════════════════════ */}
        <AnalyticsSection
          title="User Analytics"
          subtitle="Growth trends, active users, and activity patterns"
          icon={Users}
          className="analytics-section--users"
        >
          <div className="analytics-user-grid">
            {/* User Growth Chart */}
            <div className="analytics-block analytics-block--growth">
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

            {/* Activity Heat Map */}
            <div className="analytics-block analytics-block--heatmap">
              <div className="admin-panel__head">
                <div className="admin-panel__head-left">
                  <span className="panel-icon panel-icon--cyan" aria-hidden="true">
                    <Activity size={16} />
                  </span>
                  <h3 className="admin-panel__title">
                    Activity Patterns{" "}
                    <span className="admin-panel__badge">7 days</span>
                  </h3>
                </div>
                <p className="admin-panel__hint">
                  {totalActivitiesLast7Days.toLocaleString()} total activities
                </p>
              </div>
              <ActivityHeatMap data={heatMapData} />
            </div>

            {/* Role Distribution Donut */}
            <div className="analytics-block analytics-block--roles">
              {roleSegments.length > 0 ? (
                <DonutChart
                  segments={roleSegments}
                  title="User Roles"
                  centerValue={totalUsers}
                  centerLabel="Users"
                  size={150}
                  strokeWidth={22}
                />
              ) : (
                <div className="analytics-empty-state">
                  <Users size={32} />
                  <p>No role data yet</p>
                </div>
              )}
            </div>

            {/* Top Active Users */}
            <div className="analytics-block analytics-block--top-users">
              <div className="admin-panel__head">
                <div className="admin-panel__head-left">
                  <span className="panel-icon panel-icon--emerald" aria-hidden="true">
                    <UserCheck size={16} />
                  </span>
                  <h3 className="admin-panel__title">Most Active Users</h3>
                </div>
                <p className="admin-panel__hint">Last 30 days</p>
              </div>
              <div className="top-users-list">
                {topActiveUsers.length === 0 ? (
                  <p className="analytics-empty-text">
                    No user activity recorded yet.
                  </p>
                ) : (
                  topActiveUsers.map((user, i) => (
                    <div key={user.userId} className="top-user-row">
                      <span className="top-user-rank">#{i + 1}</span>
                      <div className="top-user-info">
                        <span className="top-user-name">{user.name}</span>
                        <span className="top-user-role">
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </div>
                      <span className="top-user-count">
                        {user.activityCount}
                        <small> actions</small>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="analytics-block analytics-block--quick-stats">
              <h4 className="quick-stats-title">Quick Stats</h4>
              <div className="quick-stats-grid">
                <div className="quick-stat">
                  <span className="quick-stat__value">
                    {newUsersLast30Days}
                  </span>
                  <span className="quick-stat__label">New Users (30d)</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat__value">
                    {membershipStats.total}
                  </span>
                  <span className="quick-stat__label">
                    Membership Apps
                  </span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat__value">
                    {membershipStats.pending}
                  </span>
                  <span className="quick-stat__label">Pending Apps</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat__value">
                    {membershipStats.approved}
                  </span>
                  <span className="quick-stat__label">Approved Apps</span>
                </div>
              </div>
            </div>
          </div>
        </AnalyticsSection>

        {/* ═══════════════════════════════════════════════════════════════════
            Section 4 — System & Security Analytics
            ═══════════════════════════════════════════════════════════════════ */}
        <AnalyticsSection
          title="System & Security"
          subtitle="Monitor platform health, session activity, and security posture"
          icon={Shield}
          className="analytics-section--security"
        >
          <div className="analytics-security-grid">
            {/* Security Gauge */}
            <div className="analytics-block analytics-block--gauge">
              <SecurityGauge score={securityScore} size={170} />
            </div>

            {/* Security Stats */}
            <div className="analytics-block analytics-block--sec-stats">
              <h4 className="mini-bar-chart__title">Security Overview</h4>
              <div className="security-stats-grid">
                <div className="security-stat">
                  <div className="security-stat__icon security-stat__icon--green">
                    <Wifi size={18} />
                  </div>
                  <div className="security-stat__info">
                    <span className="security-stat__value">
                      {activeSessions}
                    </span>
                    <span className="security-stat__label">
                      Active Sessions
                    </span>
                  </div>
                </div>
                <div className="security-stat">
                  <div className="security-stat__icon security-stat__icon--amber">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="security-stat__info">
                    <span className="security-stat__value">
                      {failedLogins}
                    </span>
                    <span className="security-stat__label">
                      Failed Logins (7d)
                    </span>
                  </div>
                </div>
                <div className="security-stat">
                  <div className="security-stat__icon security-stat__icon--blue">
                    <Globe size={18} />
                  </div>
                  <div className="security-stat__info">
                    <span className="security-stat__value">{uniqueIPs}</span>
                    <span className="security-stat__label">
                      Unique IPs (7d)
                    </span>
                  </div>
                </div>
                <div className="security-stat">
                  <div className="security-stat__icon security-stat__icon--violet">
                    <Shield size={18} />
                  </div>
                  <div className="security-stat__info">
                    <span className="security-stat__value">
                      {totalSessions}
                    </span>
                    <span className="security-stat__label">
                      Total Sessions
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Events Feed */}
            <div className="analytics-block analytics-block--events">
              <div className="admin-panel__head">
                <div className="admin-panel__head-left">
                  <span className="panel-icon panel-icon--rose" aria-hidden="true">
                    <AlertTriangle size={16} />
                  </span>
                  <h3 className="admin-panel__title">Security Events</h3>
                </div>
                <p className="admin-panel__hint">Last 7 days</p>
              </div>
              <div className="security-events-list">
                {securityEvents.length === 0 ? (
                  <div className="security-events-empty">
                    <Shield size={28} />
                    <p>No security incidents detected</p>
                    <span>All systems operating normally</span>
                  </div>
                ) : (
                  securityEvents.map((evt) => (
                    <div key={evt.id} className="security-event-row">
                      <div className="security-event-row__icon">
                        <AlertTriangle size={14} />
                      </div>
                      <div className="security-event-row__info">
                        <span className="security-event-row__action">
                          {evt.action}
                        </span>
                        <span className="security-event-row__meta">
                          {evt.user} · {evt.ip} · {evt.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </AnalyticsSection>

        {/* ═══════════════════════════════════════════════════════════════════
            Section 5 — Recent Activity Feed
            ═══════════════════════════════════════════════════════════════════ */}
        <AnalyticsSection
          title="Recent Activity"
          subtitle="Registrations, submissions, and system events"
          icon={FileClock}
          className="analytics-section--activity"
        >
          <div className="activity-feed">
            {activities.length === 0 ? (
              <p className="analytics-empty-text">No recent activity logged.</p>
            ) : (
              activities.map((activity, index) => (
                <article key={index} className="activity-item">
                  <div className="activity-item__main">
                    <p className="activity-item__title">{activity.title}</p>
                    <p className="activity-item__actor">{activity.actor}</p>
                  </div>
                  <div className="activity-item__right">
                    <span
                      className={`activity-pill activity-pill--${activity.state}`}
                    >
                      {activity.stateLabel}
                    </span>
                    <span className="activity-item__time">{activity.time}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </AnalyticsSection>
      </section>
    </AdminSidebarLayout>
  );
}