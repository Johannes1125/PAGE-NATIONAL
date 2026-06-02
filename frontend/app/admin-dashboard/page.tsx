"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  FileClock,
  Newspaper,
  Users,
  type LucideIcon,
} from "lucide-react";
import AdminSidebarLayout from "./components/AdminSidebarLayout";
import { api } from "../lib/api-client";
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

function createUserGrowthPath(points: UserPoint[]): string {
  const width = 520;
  const height = 110;
  if (points.length <= 1) {
    return `0,${height} ${width},${height}`;
  }
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
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [activityFeed, setActivityFeed] = useState<Activity[]>([]);
  const [contentTrend, setContentTrend] = useState<ContentPoint[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.get('/admin/metrics');
        
        // Map dynamic metrics counters
        const formattedMetrics: Metric[] = [
          {
            label: "Total Users",
            value: data.metrics.totalUsers,
            meta: "Active platform accounts",
            tone: "blue",
            icon: Users,
          },
          {
            label: "Organizations",
            value: data.metrics.totalOrgs,
            meta: "Verified institutional member profiles",
            tone: "green",
            icon: Building2,
          },
          {
            label: "Pending Posts",
            value: data.metrics.pendingPosts,
            meta: "Awaiting moderation review",
            tone: "gold",
            icon: FileClock,
          },
          {
            label: "Published Content",
            value: data.metrics.publishedPosts,
            meta: "Live posts, announcements, and journals",
            tone: "red",
            icon: Newspaper,
          },
        ];
        
        setMetrics(formattedMetrics);
        
        // Map activities
        const formattedActivities: Activity[] = data.recentActivities.map((act: any) => ({
          title: act.action,
          actor: `${act.userName} (${act.role})`,
          time: act.timestamp,
          state: "success",
          stateLabel: "Completed",
        }));
        
        setActivityFeed(formattedActivities);
        
        // Map trends
        const formattedTrends: ContentPoint[] = data.trends.map((t: any) => ({
          month: t.month,
          posts: t.submissions,
        }));
        
        setContentTrend(formattedTrends.length > 0 ? formattedTrends : [
          { month: "Jan", posts: 0 }
        ]);

        // Map growth
        const formattedGrowth: UserPoint[] = data.growth.map((g: any) => ({
          month: g.month,
          users: g.users,
        }));
        
        setUserGrowth(formattedGrowth.length > 0 ? formattedGrowth : [
          { month: "Jan", users: 0 }
        ]);
        
      } catch (err) {
        console.error("Failed to load admin metrics", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <AdminSidebarLayout
        pageClassName="admin-dashboard"
        mainClassName="admin-main"
        title="Dashboard Overview"
        subtitle="View platform metrics, monitor activity, and track approval workflow status in one place."
      >
        <section className="admin-shell admin-shell--main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ color: '#1e538e', textAlign: 'center' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>Syncing Admin Portal Metrics...</p>
            <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.25rem' }}>Fetching live data from Supabase DB</p>
          </div>
        </section>
      </AdminSidebarLayout>
    );
  }

  const contentMax = Math.max(...contentTrend.map(point => point.posts), 1);
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
                  {activityFeed.length === 0 ? (
                    <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No recent activity logged.</p>
                  ) : (
                    activityFeed.map((activity, index) => (
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
                      const x = (520 / Math.max(1, userGrowth.length - 1)) * index;
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
