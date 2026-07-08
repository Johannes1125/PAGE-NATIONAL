"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Pencil, Search, X, Loader2 } from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import AdminTypewriterLoader from "../../lib/admin-loader/AdminTypewriterLoader";
import { api } from "../../lib/api-client";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import "./manage-users.css";
import "../admin-dashboard.css";

type UserStatus = "active" | "inactive";

type ManagedUser = {
  id: string;
  name: string;
  role: string;
  university: string;
  position: string;
  joinDate: string;
  status: UserStatus;
};

type UserActivity = {
  id: string;
  timestamp: string;
  action: string;
};

type ActivePanel = "stats" | "edit" | "history";

export default function ManageUsersPage() {
  const [usersState, setUsersState] = useState<ManagedUser[]>([]);
  const [activityByUserId, setActivityByUserId] = useState<Record<string, UserActivity[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Right sidebar details state
  const [activePanel, setActivePanel] = useState<ActivePanel>("stats");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("Organization");
  const [editStatus, setEditStatus] = useState<UserStatus>("active");
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      const mapped: ManagedUser[] = response.users.map((u: any) => ({
        id: u.id.toString(),
        name: u.name,
        role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
        university: u.university || "N/A",
        position: u.position || "N/A",
        joinDate: new Date(u.created_at).toLocaleDateString(),
        status: u.status as UserStatus,
      }));
      setUsersState(mapped);
    } catch (err) {
      console.error("Failed to fetch users", err);
      gooeyToast.error("Failed to sync member directories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return usersState.filter((user) => {
      const matchesQuery =
        query.length === 0 ||
        user.name.toLowerCase().includes(query) ||
        user.university.toLowerCase().includes(query) ||
        user.position.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase();
      return matchesQuery && matchesRole;
    });
  }, [roleFilter, searchQuery, usersState]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, usersState]);

  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginationItems = useMemo<(number | string)[]>(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = Array.from(new Set([1, currentPage, totalPages])).sort((a, b) => a - b);
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

  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const selectedUser = useMemo(
    () => usersState.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, usersState],
  );

  const historyActivities = selectedUser ? activityByUserId[selectedUser.id] ?? [] : [];

  const handleOpenHistory = async (user: ManagedUser) => {
    setSelectedUserId(user.id);
    setActivePanel("history");
    setIsSidebarLoading(true);
    try {
      const response = await api.get(`/admin/users/${user.id}/activities`);
      const mappedActs: UserActivity[] = response.activities.map((act: any) => ({
        id: act.id.toString(),
        timestamp: new Date(act.timestamp).toLocaleString(),
        action: act.action,
      }));
      setActivityByUserId((current) => ({
        ...current,
        [user.id]: mappedActs,
      }));
    } catch (err) {
      console.error("Failed to load user activities", err);
      gooeyToast.error("Failed to fetch activity history.");
    } finally {
      setIsSidebarLoading(false);
    }
  };

  const handleOpenEdit = (user: ManagedUser) => {
    setSelectedUserId(user.id);
    setActivePanel("edit");
    setEditRole(user.role);
    setEditStatus(user.status);
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      await api.patch(`/admin/users/${selectedUser.id}`, {
        role: editRole.toLowerCase(),
        status: editStatus,
      });

      setUsersState((current) =>
        current.map((u) =>
          u.id === selectedUser.id ? { ...u, role: editRole, status: editStatus } : u
        )
      );
      gooeyToast.success(`Successfully updated ${selectedUser.name}'s profile.`);
      
      // Return to stats panel
      setSelectedUserId(null);
      setActivePanel("stats");
    } catch (err) {
      console.error("Failed to save user role update", err);
      gooeyToast.error("Failed to update user profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (user: ManagedUser) => {
    if (user.status === "inactive") return;
    try {
      setIsLoading(true);
      await api.delete(`/admin/users/${user.id}`);
      
      setUsersState((current) =>
        current.map((u) =>
          u.id === user.id ? { ...u, status: "inactive" as UserStatus } : u
        )
      );
      gooeyToast.success(`Deactivated ${user.name} successfully.`);
      
      // If we are currently editing/viewing this deactivated user, update stats panel
      if (selectedUserId === user.id) {
        setEditStatus("inactive");
      }
    } catch (err) {
      console.error("Failed to deactivate user", err);
      gooeyToast.error("Failed to deactivate user account.");
    } finally {
      setIsLoading(false);
    }
  };

  // Compute Stats for sidebar
  const stats = useMemo(() => {
    const total = usersState.length;
    const active = usersState.filter((u) => u.status === "active").length;
    const inactive = total - active;
    const admins = usersState.filter((u) => u.role.toLowerCase() === "admin").length;
    const reviewers = usersState.filter((u) => u.role.toLowerCase() === "reviewer").length;
    const orgs = usersState.filter((u) => u.role.toLowerCase() === "organization").length;
    const members = usersState.filter((u) => u.role.toLowerCase() === "member").length;

    return { total, active, inactive, admins, reviewers, orgs, members };
  }, [usersState]);

  if (isLoading && usersState.length === 0) {
    return (
      <AdminSidebarLayout
        pageClassName="manage-page"
        mainClassName="manage-main"
        title="User Management"
        subtitle="Manage general users and organization members"
      >
        <AdminTypewriterLoader label="Syncing Member Directories..." />
      </AdminSidebarLayout>
    );
  }

  return (
    <AdminSidebarLayout
      pageClassName="manage-page"
      mainClassName="manage-main"
      title="User Management"
      subtitle="Manage general users and organization members"
    >
      <section className="manage-content">
        <section className="manage-layout">
          {/* Left Column (Table) */}
          <article className="manage-card">
            <div className="manage-toolbar">
              <label className="manage-search" aria-label="Search users">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search Customers..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </label>

              <select
                className="manage-role-filter"
                value={roleFilter}
                aria-label="Role filter"
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="organization">Organization</option>
                <option value="member">Member</option>
                <option value="reviewer">Reviewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="manage-table-wrap">
              <table className="manage-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>University</th>
                    <th>Position</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((user) => (
                    <tr key={user.id} className={selectedUserId === user.id ? "manage-row-selected" : ""}>
                      <td>{user.name}</td>
                      <td>
                        <span className="manage-chip">{user.role}</span>
                      </td>
                      <td>{user.university}</td>
                      <td>{user.position}</td>
                      <td>{user.joinDate}</td>
                      <td>
                        <span className={`manage-status manage-status--${user.status}`}>{user.status}</span>
                      </td>
                      <td>
                        <div className="manage-actions">
                          <button
                            type="button"
                            className={`manage-icon-btn ${selectedUserId === user.id && activePanel === "edit" ? "manage-icon-btn--active" : ""}`}
                            aria-label={`Edit ${user.name}`}
                            onClick={() => handleOpenEdit(user)}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            className={`manage-icon-btn manage-icon-btn--history ${selectedUserId === user.id && activePanel === "history" ? "manage-icon-btn--active" : ""}`}
                            aria-label={`View ${user.name} activity history`}
                            onClick={() => handleOpenHistory(user)}
                          >
                            <Clock3 size={13} />
                          </button>
                          <button
                            type="button"
                            className="manage-icon-btn manage-icon-btn--danger"
                            aria-label={`Deactivate ${user.name}`}
                            onClick={() => handleDeactivate(user)}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="manage-empty-cell">No users match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="manage-table-footer">
                <div className="manage-table-footer__meta">
                  <div className="manage-page-size">
                    <span>Rows per page</span>
                    <select
                      className="manage-page-size__select"
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setCurrentPage(1);
                      }}
                      aria-label="Rows per page"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <p className="manage-table-footer__summary" aria-live="polite">
                    {totalItems === 0
                      ? "No users to display"
                      : `Showing ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalItems)} of ${totalItems}`}
                  </p>
                </div>

                <nav className="pagination" role="navigation" aria-label="User list pagination">
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
              </div>
            </div>
          </article>

          {/* Right Column (Sidebar Panel) */}
          <aside className="manage-side">
            {activePanel === "stats" && (
              <>
                <section className="manage-side-block">
                  <h3>Overview Statistics</h3>
                  <div className="manage-stats-grid">
                    <div className="manage-stat-box">
                      <span>Total Accounts</span>
                      <strong>{stats.total}</strong>
                    </div>
                    <div className="manage-stat-box">
                      <span>Active Members</span>
                      <strong className="text-emerald-600">{stats.active}</strong>
                    </div>
                  </div>
                </section>

                <section className="manage-side-block">
                  <h3>Roles Breakdown</h3>
                  <div className="manage-records">
                    <div className="manage-record-item flex justify-between items-center">
                      <p>Administrators</p>
                      <span className="font-bold text-slate-800 text-[13px]">{stats.admins}</span>
                    </div>
                    <div className="manage-record-item flex justify-between items-center">
                      <p>Reviewer Committee</p>
                      <span className="font-bold text-slate-800 text-[13px]">{stats.reviewers}</span>
                    </div>
                    <div className="manage-record-item flex justify-between items-center">
                      <p>Institutional Orgs</p>
                      <span className="font-bold text-slate-800 text-[13px]">{stats.orgs}</span>
                    </div>
                    <div className="manage-record-item flex justify-between items-center">
                      <p>General Members</p>
                      <span className="font-bold text-slate-800 text-[13px]">{stats.members}</span>
                    </div>
                  </div>
                </section>

                <section className="manage-side-block manage-side-block--info">
                  <h3>Quick Admin Guide</h3>
                  <p>1. Roles update takes effect instantly on the user session.</p>
                  <p>2. Deactivating a user revokes login privileges from the system.</p>
                  <p>3. Audit trails can be checked by clicking the activity timeline.</p>
                </section>
              </>
            )}

            {activePanel === "edit" && selectedUser && (
              <section className="manage-side-block">
                <div className="flex justify-between items-center border-b pb-2 mb-3">
                  <h3>Edit Profile</h3>
                  <button
                    type="button"
                    className="manage-close-btn"
                    onClick={() => {
                      setSelectedUserId(null);
                      setActivePanel("stats");
                    }}
                    aria-label="Back to stats"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-bold mb-4">{selectedUser.name}</p>

                <div className="manage-form">
                  <label className="manage-field">
                    <span>Role</span>
                    <select value={editRole} onChange={(event) => setEditRole(event.target.value)}>
                      <option value="Organization">Organization</option>
                      <option value="Member">Member</option>
                      <option value="Reviewer">Reviewer</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </label>

                  <label className="manage-field">
                    <span>Status</span>
                    <select value={editStatus} onChange={(event) => setEditStatus(event.target.value as UserStatus)}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      className="manage-btn manage-btn--primary flex-1"
                      onClick={handleSaveChanges}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="manage-btn manage-btn--secondary"
                      onClick={() => {
                        setSelectedUserId(null);
                        setActivePanel("stats");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activePanel === "history" && selectedUser && (
              <section className="manage-side-block">
                <div className="flex justify-between items-center border-b pb-2 mb-3">
                  <h3>User History</h3>
                  <button
                    type="button"
                    className="manage-close-btn"
                    onClick={() => {
                      setSelectedUserId(null);
                      setActivePanel("stats");
                    }}
                    aria-label="Back to stats"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-bold mb-4">{selectedUser.name}</p>

                {isSidebarLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="animate-spin text-slate-400" size={24} />
                  </div>
                ) : historyActivities.length > 0 ? (
                  <ul className="manage-history">
                    {historyActivities.map((activity) => (
                      <li key={activity.id}>
                        <p>{activity.action}</p>
                        <span>{activity.timestamp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="manage-panel__empty">No recorded activity yet for this user.</p>
                )}
              </section>
            )}
          </aside>
        </section>
      </section>
    </AdminSidebarLayout>
  );
}
