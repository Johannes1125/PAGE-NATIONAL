import { api } from "../../lib/api-client";

export type AdminNotificationSource =
  | "overview"
  | "create-post"
  | "approve-post"
  | "manage-users"
  | "messages"
  | "applications";

export interface AdminNotificationItem {
  id: string;
  type: string;
  sourceId: string;
  title: string;
  body: string;
  source: AdminNotificationSource;
  href: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string; // raw ISO timestamp
}

export interface NotificationsApiResponse {
  success: boolean;
  data: AdminNotificationItem[];
  message: string;
}

/**
 * Fetches real aggregated notifications from the backend API.
 */
export async function fetchAllAdminNotifications(): Promise<AdminNotificationItem[]> {
  const res = await api.get<NotificationsApiResponse>("/notifications");
  if (res && res.success && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

/**
 * Marks a notification as read on the backend.
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    const res = await api.patch(`/notifications/${encodeURIComponent(id)}/read`, {});
    return !!res?.success;
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
    return false;
  }
}

/**
 * Permanently / soft-deletes a notification on the backend.
 */
export async function deleteNotificationItem(id: string): Promise<boolean> {
  try {
    const res = await api.delete(`/notifications/${encodeURIComponent(id)}`);
    return !!res?.success;
  } catch (err) {
    console.error("Failed to delete notification:", err);
    return false;
  }
}

/**
 * Batch deletes multiple notifications on the backend.
 */
export async function batchDeleteNotifications(ids: string[]): Promise<boolean> {
  try {
    const res = await api.post("/notifications/batch-delete", { ids });
    return !!res?.success;
  } catch (err) {
    console.error("Failed to batch delete notifications:", err);
    return false;
  }
}
