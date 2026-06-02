"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, Pencil, Search, X } from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import { api } from "../../lib/api-client";
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

export default function ManageUsersPage() {
  const [usersState, setUsersState] = useState<ManagedUser[]>([]);
  const [activityByUserId, setActivityByUserId] = useState<Record<string, UserActivity[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editRole, setEditRole] = useState("Organization");
  const [editStatus, setEditStatus] = useState<UserStatus>("active");
  const [roleModalUserId, setRoleModalUserId] = useState<string | null>(null);
  const [historyModalUserId, setHistoryModalUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const roleModalUser = useMemo(
    () => usersState.find((user) => user.id === roleModalUserId) ?? null,
    [roleModalUserId, usersState],
  );

  const historyModalUser = useMemo(
    () => usersState.find((user) => user.id === historyModalUserId) ?? null,
    [historyModalUserId, usersState],
  );

  const historyModalActivities = historyModalUser ? activityByUserId[historyModalUser.id] ?? [] : [];

  const handleOpenHistoryModal = async (user: ManagedUser) => {
    setHistoryModalUserId(user.id);
    try {
      const response = await api.get(`/admin/users/${user.id}/activities`);
      const mappedActs: UserActivity[] = response.activities.map((act: any) => ({
        id: act.id.toString(),
        timestamp: act.timestamp,
        action: act.action,
      }));
      setActivityByUserId((current) => ({
        ...current,
        [user.id]: mappedActs,
      }));
    } catch (err) {
      console.error("Failed to load user activities", err);
    }
  };

  const handleOpenRoleModal = (user: ManagedUser) => {
    setRoleModalUserId(user.id);
    setEditRole(user.role);
    setEditStatus(user.status);
  };

  const handleSaveChanges = async () => {
    if (!roleModalUser) return;

    try {
      setIsLoading(true);
      await api.patch(`/admin/users/${roleModalUser.id}`, {
        role: editRole.toLowerCase(),
        status: editStatus,
      });

      setUsersState((current) =>
        current.map((u) =>
          u.id === roleModalUser.id ? { ...u, role: editRole, status: editStatus } : u
        )
      );
      setRoleModalUserId(null);
    } catch (err) {
      console.error("Failed to save user role update", err);
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
    } catch (err) {
      console.error("Failed to deactivate user", err);
    } finally {
      setIsLoading(false);
    }
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
                {filteredUsers.map((user) => (
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
                          onClick={() => handleOpenHistoryModal(user)}
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
