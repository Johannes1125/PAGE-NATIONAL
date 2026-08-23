import { api } from "../../lib/api-client";

export type AdminNotificationSource =
  | "overview"
  | "create-post"
  | "approve-post"
  | "manage-users"
  | "messages";

export type AdminNotificationItem = {
  id: string;
  title: string;
  description: string;
  source: AdminNotificationSource;
  timeLabel: string;
  href: string;
};

export async function fetchAllAdminNotifications(): Promise<AdminNotificationItem[]> {
  try {
    const res = await api.get("/admin/notifications");
    if (res && res.success && Array.isArray(res.data)) {
      return res.data;
    }
  } catch (err) {
    console.error("Could not fetch real admin notifications, using local state", err);
  }
  return [];
}
