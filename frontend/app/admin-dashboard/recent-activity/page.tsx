"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Building2, ShieldCheck, User, UserCog, Zap } from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import AdminTypewriterLoader from "../../lib/admin-loader/AdminTypewriterLoader";
import { api } from "../../lib/api-client";
import "./recent-activity.css";

type ActivityFilter = "all" | "system" | "activity" | "admin" | "organization" | "member";

type RecentActivityItem = {
  id: string;
  title: string;
  actor: string;
  role: string;
  timestamp: string;
  rawDate: string | null;
  source: "system" | "activity";
};

const FILTERS: { key: ActivityFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "system", label: "System" },
  { key: "activity", label: "Activity" },
  { key: "admin", label: "Admin" },
  { key: "organization", label: "Organization" },
  { key: "member", label: "Member" },
];

export default function RecentActivityPage() {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<ActivityFilter>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        const response = await api.get("/admin/metrics");
        const recentActivities = Array.isArray(response?.recentActivities)
          ? response.recentActivities
          : [];

        const mappedActivities: RecentActivityItem[] = [...recentActivities]
          .sort((a: any, b: any) => {
            const aTime = a?.rawDate || a?.created_at || a?.timestamp || "1970-01-01T00:00:00.000Z";
            const bTime = b?.rawDate || b?.created_at || b?.timestamp || "1970-01-01T00:00:00.000Z";
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          })
          .map((act: any, index: number) => {
            const role = String(act?.role || act?.userRole || "System");
            const normalizedRole = role.toLowerCase();
            const source: "system" | "activity" =
              normalizedRole === "system" || normalizedRole === "admin" ? "system" : "activity";

            return {
              id: String(act?.id ?? `${role}-${index}`),
              title: act?.action || "System event",
              actor: act?.userName || "System",
              role,
              timestamp: act?.timestamp || "just now",
              rawDate: act?.rawDate || act?.created_at || null,
              source,
            };
          });

        setActivities(mappedActivities);
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentActivities();
  }, []);

  const summary = useMemo(() => {
    const systemCount = activities.filter((item) => item.source === "system").length;
    const activityCount = activities.filter((item) => item.source === "activity").length;
    const adminCount = activities.filter((item) => item.role.toLowerCase() === "admin").length;
    const organizationCount = activities.filter((item) => item.role.toLowerCase() === "organization").length;
    const memberCount = activities.filter((item) => item.role.toLowerCase() === "member").length;

    return {
      total: activities.length,
      system: systemCount,
      activity: activityCount,
      admin: adminCount,
      organization: organizationCount,
      member: memberCount,
    };
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (selectedFilter === "all") {
      return activities;
    }

    if (selectedFilter === "system") {
      return activities.filter((item) => item.source === "system");
    }

    if (selectedFilter === "activity") {
      return activities.filter((item) => item.source === "activity");
    }

    return activities.filter((item) => item.role.toLowerCase() === selectedFilter.toLowerCase());
  }, [activities, selectedFilter]);

  const pageSize = 6;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, activities]);

  const totalItems = filteredActivities.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const pagedActivities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredActivities.slice(start, start + pageSize);
  }, [filteredActivities, currentPage]);

  const paginationItems = useMemo<(number | string)[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = Array.from(
      new Set(
        [1, 2, currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
          (page) => page >= 1 && page <= totalPages,
        ),
      ),
    ).sort((a, b) => a - b);

    const items: (number | string)[] = [];

    pages.forEach((page, index) => {
      const prev = pages[index - 1];
      if (typeof prev === "number" && page - prev > 1) {
        items.push(`dots-${prev}-${page}`);
      }
      items.push(page);
    });

    return items;
  }, [currentPage, totalPages]);

  if (isLoading) {
    return (
      <AdminSidebarLayout
        pageClassName="manage-page"
        mainClassName="manage-main"
        title="Recent Activity"
        subtitle="Live platform and system events surfaced in one place"
        eyebrow="Monitoring"
      >
        <AdminTypewriterLoader label="Loading Recent Activity..." />
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout
      // 🆕 same shell classes as ManageUsersPage (manage-page / manage-main),
      // so both admin pages share identical container width and padding.
      pageClassName="manage-page"
      mainClassName="manage-main"
      title="Recent Activity"
      subtitle="Live platform and system events surfaced in one place"
      eyebrow="Monitoring"
    >
      {/* 🆕 wrapped in the same manage-content shell used by Manage Users */}
      <section className="manage-content">
        <div className="recent-activity-page">
          <div className="recent-activity-header-shell">
            <div className="recent-activity-filter-bar">
              <div className="recent-activity-filter-list">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    className={selectedFilter === filter.key ? "active" : ""}
                    onClick={() => setSelectedFilter(filter.key)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 🆕 one metric card per filter (6 total) — each always renders
                from the summary counts, including zero, so none are hidden */}
            <div className="recent-activity-metrics">
              <div className="admin-hero-card admin-hero-card--navy">
                <div className="admin-hero-card__top">
                  <div className="admin-hero-card__icon">
                    <Activity size={22} />
                  </div>
                  <span className="admin-hero-card__title">Total</span>
                </div>
                <div>
                  <div className="admin-hero-card__value">{summary.total}</div>
                  <p className="admin-hero-card__meta">
                    {summary.system} system · {summary.activity} activity
                  </p>
                </div>
              </div>

              <div className="admin-hero-card admin-hero-card--green">
                <div className="admin-hero-card__top">
                  <div className="admin-hero-card__icon">
                    <ShieldCheck size={22} />
                  </div>
                  <span className="admin-hero-card__title">System</span>
                </div>
                <div>
                  <div className="admin-hero-card__value">{summary.system}</div>
                  <p className="admin-hero-card__meta">Automated platform events</p>
                </div>
              </div>

              <div className="admin-hero-card admin-hero-card--gold">
                <div className="admin-hero-card__top">
                  <div className="admin-hero-card__icon">
                    <Zap size={22} />
                  </div>
                  <span className="admin-hero-card__title">Activity</span>
                </div>
                <div>
                  <div className="admin-hero-card__value">{summary.activity}</div>
                  <p className="admin-hero-card__meta">Member &amp; organization actions</p>
                </div>
              </div>

              <div className="admin-hero-card admin-hero-card--violet">
                <div className="admin-hero-card__top">
                  <div className="admin-hero-card__icon">
                    <UserCog size={22} />
                  </div>
                  <span className="admin-hero-card__title">Admin</span>
                </div>
                <div>
                  <div className="admin-hero-card__value">{summary.admin}</div>
                  <p className="admin-hero-card__meta">Administrator actions</p>
                </div>
              </div>

              <div className="admin-hero-card admin-hero-card--blue">
                <div className="admin-hero-card__top">
                  <div className="admin-hero-card__icon">
                    <Building2 size={22} />
                  </div>
                  <span className="admin-hero-card__title">Organization</span>
                </div>
                <div>
                  <div className="admin-hero-card__value">{summary.organization}</div>
                  <p className="admin-hero-card__meta">Institutional org actions</p>
                </div>
              </div>

              <div className="admin-hero-card admin-hero-card--cyan">
                <div className="admin-hero-card__top">
                  <div className="admin-hero-card__icon">
                    <User size={22} />
                  </div>
                  <span className="admin-hero-card__title">Member</span>
                </div>
                <div>
                  <div className="admin-hero-card__value">{summary.member}</div>
                  <p className="admin-hero-card__meta">General member actions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="recent-activity-feed">
            {isLoading ? (
              <div className="recent-activity-state">Loading recent activity...</div>
            ) : filteredActivities.length === 0 ? (
              <div className="recent-activity-state">No activities match the selected filter.</div>
            ) : (
              pagedActivities.map((activity) => (
                <article key={activity.id} className="recent-activity-item">
                  <div className="recent-activity-item__main">
                    <div
                      className={`recent-activity-item__dot recent-activity-item__dot--${activity.source}`}
                      aria-hidden="true"
                    />
                    <div className="recent-activity-item__text-wrap">
                      <h3>{activity.title}</h3>
                      <p>
                        {activity.actor} ({activity.role})
                      </p>
                    </div>
                  </div>

                  <div className="recent-activity-item__meta">
                    <span
                      className={`recent-activity-pill recent-activity-pill--${activity.source}`}
                    >
                      {activity.source === "system" ? "System" : "Activity"}
                    </span>
                    <span className="recent-activity-time">
                      <Zap size={12} />
                      {activity.timestamp}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>

          {!isLoading && totalItems > 0 && (
            <nav className="pagination" role="navigation" aria-label="Recent activity pagination">
              <button
                type="button"
                className="pagination__nav"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                ‹
              </button>

              <ul className="pagination__list">
                {paginationItems.map((item) => {
                  if (typeof item === "string") {
                    return (
                      <li key={item} className="pagination__item pagination__item--dots" aria-hidden="true">
                        …
                      </li>
                    );
                  }

                  return (
                    <li key={item} className="pagination__item">
                      <button
                        type="button"
                        className={`pagination__link ${item === currentPage ? "pagination__link--active" : ""}`}
                        onClick={() => setCurrentPage(item)}
                        aria-current={item === currentPage ? "page" : undefined}
                      >
                        {item}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                className="pagination__nav"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                ›
              </button>
            </nav>
          )}
        </div>
      </section>
    </AdminSidebarLayout>
  );
}