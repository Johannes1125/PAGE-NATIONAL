"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Pencil, Search, X } from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
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

const users: ManagedUser[] = [
  {
    id: "u-1",
    name: "Juan Dela Cruz",
    role: "Organization",
    university: "Gordon College",
    position: "President",
    joinDate: "February 29, 2026",
    status: "active",
  },
  {
    id: "u-2",
    name: "Maria Santos",
    role: "Organization",
    university: "Gordon College",
    position: "Secretary",
    joinDate: "March 2, 2026",
    status: "active",
  },
  {
    id: "u-3",
    name: "Jose Reyes",
    role: "Organization",
    university: "Gordon College",
    position: "Treasurer",
    joinDate: "March 3, 2026",
    status: "inactive",
  },
  {
    id: "u-4",
    name: "Ana Lim",
    role: "Organization",
    university: "Gordon College",
    position: "Vice President",
    joinDate: "March 5, 2026",
    status: "active",
  },
];

const initialActivityByUserId: Record<string, UserActivity[]> = {
  "u-1": [
    { id: "a-1", timestamp: "April 8, 2026 10:21 AM", action: "User account created" },
    { id: "a-2", timestamp: "April 8, 2026 11:03 AM", action: "Role updated to Organization" },
  ],
  "u-2": [{ id: "a-3", timestamp: "April 8, 2026 09:48 AM", action: "User account created" }],
  "u-3": [{ id: "a-4", timestamp: "April 8, 2026 08:12 AM", action: "Status set to Inactive" }],
  "u-4": [{ id: "a-5", timestamp: "April 8, 2026 12:06 PM", action: "User account created" }],
};

function getNowTimestamp(): string {
  return new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ManageUsersPage() {
  const [usersState, setUsersState] = useState<ManagedUser[]>(users);
  const [activityByUserId, setActivityByUserId] = useState<Record<string, UserActivity[]>>(initialActivityByUserId);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editRole, setEditRole] = useState("Organization");
  const [editStatus, setEditStatus] = useState<UserStatus>("active");
  const [roleModalUserId, setRoleModalUserId] = useState<string | null>(null);
  const [historyModalUserId, setHistoryModalUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return usersState.filter((user) => {
      const matchesQuery =
        query.length === 0 ||
        user.name.toLowerCase().includes(query) ||
        user.university.toLowerCase().includes(query) ||
        user.position.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [roleFilter, searchQuery, usersState]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, usersState]);

  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const roleModalUser = useMemo(
    () => usersState.find((user) => user.id === roleModalUserId) ?? null,
    [roleModalUserId, usersState],
  );

  const historyModalUser = useMemo(
    () => usersState.find((user) => user.id === historyModalUserId) ?? null,
    [historyModalUserId, usersState],
  );

  const historyModalActivities = historyModalUser ? activityByUserId[historyModalUser.id] ?? [] : [];

  const appendActivity = (userId: string, action: string) => {
    const entry: UserActivity = {
      id: `${userId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: getNowTimestamp(),
      action,
    };

    setActivityByUserId((current) => ({
      ...current,
      [userId]: [entry, ...(current[userId] ?? [])],
    }));
  };

  const updateUser = (userId: string, updates: Partial<ManagedUser>, logAction: string) => {
    setUsersState((current) => current.map((user) => (user.id === userId ? { ...user, ...updates } : user)));
    appendActivity(userId, logAction);
  };

  const handleOpenRoleModal = (user: ManagedUser) => {
    setRoleModalUserId(user.id);
    setEditRole(user.role);
    setEditStatus(user.status);
    appendActivity(user.id, "Opened profile for editing");
  };

  const handleSaveChanges = () => {
    if (!roleModalUser) return;

    const roleChanged = roleModalUser.role !== editRole;
    const statusChanged = roleModalUser.status !== editStatus;

    if (!roleChanged && !statusChanged) {
      appendActivity(roleModalUser.id, "Profile reviewed (no changes)");
      setRoleModalUserId(null);
      return;
    }

    updateUser(
      roleModalUser.id,
      { role: editRole, status: editStatus },
      `Updated role to ${editRole} and status to ${editStatus}`,
    );
    setRoleModalUserId(null);
  };

  const handleDeactivate = (user: ManagedUser) => {
    if (user.status === "inactive") return;
    updateUser(user.id, { status: "inactive" }, "Account deactivated by admin");
  };

  return (
    <AdminSidebarLayout
      pageClassName="manage-page"
      mainClassName="manage-main"
      title="User Management"
      subtitle="Manage general users and organization members"
    >
      <section className="admin-shell admin-shell--main">
        <section className="manage-toolbar">
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
        </section>

        <section className="manage-table-wrap">
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
                  <tr key={user.id}>
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
                          className="manage-icon-btn"
                          aria-label={`Edit ${user.name}`}
                          onClick={() => handleOpenRoleModal(user)}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          className="manage-icon-btn manage-icon-btn--history"
                          aria-label={`View ${user.name} activity history`}
                          onClick={() => setHistoryModalUserId(user.id)}
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
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    const isVisible =
                      totalPages <= 6 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;

                    if (!isVisible) {
                      if (page === 2 && currentPage > 4) {
                        return (
                          <li key="dots-start" className="pagination__item pagination__item--dots" aria-hidden="true">
                            …
                          </li>
                        );
                      }

                      if (page === totalPages - 1 && currentPage < totalPages - 3) {
                        return (
                          <li key="dots-end" className="pagination__item pagination__item--dots" aria-hidden="true">
                            …
                          </li>
                        );
                      }

                      return null;
                    }

                    return (
                      <li key={page} className="pagination__item">
                        <button
                          type="button"
                          className={`pagination__link ${page === currentPage ? "pagination__link--active" : ""}`}
                          onClick={() => setCurrentPage(page)}
                          aria-current={page === currentPage ? "page" : undefined}
                        >
                          {page}
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
          </section>
      </section>

      {roleModalUser && (
          <section className="manage-modal-backdrop" role="dialog" aria-modal="true" aria-label="Update user role and status">
            <article className="manage-modal">
              <div className="manage-modal__head">
                <h2>Update Role and Status</h2>
                <button type="button" className="manage-modal__close" onClick={() => setRoleModalUserId(null)} aria-label="Close update modal">
                  <X size={16} />
                </button>
              </div>
              <p className="manage-modal__subhead">{roleModalUser.name}</p>

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

                <button type="button" className="manage-save-btn" onClick={handleSaveChanges}>
                  Save Changes
                </button>
              </div>
            </article>
          </section>
      )}

      {historyModalUser && (
          <section className="manage-modal-backdrop" role="dialog" aria-modal="true" aria-label="User activity history">
            <article className="manage-modal">
              <div className="manage-modal__head">
                <h2>User Activity History</h2>
                <button type="button" className="manage-modal__close" onClick={() => setHistoryModalUserId(null)} aria-label="Close history modal">
                  <X size={16} />
                </button>
              </div>
              <p className="manage-modal__subhead">{historyModalUser.name}</p>

              {historyModalActivities.length > 0 ? (
                <ul className="manage-history">
                  {historyModalActivities.map((activity) => (
                    <li key={activity.id}>
                      <p>{activity.action}</p>
                      <span>{activity.timestamp}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="manage-panel__empty">No recorded activity yet for this user.</p>
              )}
            </article>
          </section>
      )}
    </AdminSidebarLayout>
  );
}
