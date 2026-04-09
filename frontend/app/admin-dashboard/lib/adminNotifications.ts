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

const ADMIN_NOTIFICATIONS: AdminNotificationItem[] = [
  {
    id: "n-overview-1",
    title: "New organization account approved",
    description: "Admin Team completed organization verification.",
    source: "overview",
    timeLabel: "2m ago",
    href: "/admin-dashboard",
  },
  {
    id: "n-overview-2",
    title: "Pending post queue updated",
    description: "There are 26 posts waiting moderation review.",
    source: "overview",
    timeLabel: "9m ago",
    href: "/admin-dashboard",
  },
  {
    id: "n-create-1",
    title: "Draft saved",
    description: "A draft from Create New Post is available for publishing.",
    source: "create-post",
    timeLabel: "14m ago",
    href: "/admin-dashboard/create-new-post",
  },
  {
    id: "n-create-2",
    title: "Scheduled post reached publish time",
    description: "One scheduled article has been automatically published.",
    source: "create-post",
    timeLabel: "22m ago",
    href: "/admin-dashboard/create-new-post",
  },
  {
    id: "n-approve-1",
    title: "Post approved",
    description: "A pending submission was approved and organization notified.",
    source: "approve-post",
    timeLabel: "31m ago",
    href: "/admin-dashboard/approve-post",
  },
  {
    id: "n-approve-2",
    title: "Post rejected with feedback",
    description: "One submission was rejected and requires follow-up.",
    source: "approve-post",
    timeLabel: "47m ago",
    href: "/admin-dashboard/approve-post",
  },
  {
    id: "n-users-1",
    title: "User profile updated",
    description: "A role/status change was saved in Manage Users.",
    source: "manage-users",
    timeLabel: "1h ago",
    href: "/admin-dashboard/manage-users",
  },
  {
    id: "n-users-2",
    title: "Account deactivated",
    description: "An organization user was set to inactive.",
    source: "manage-users",
    timeLabel: "1h ago",
    href: "/admin-dashboard/manage-users",
  },
  {
    id: "n-messages-1",
    title: "Unread inbox message",
    description: "System Admin requested updates for monthly report entries.",
    source: "messages",
    timeLabel: "Just now",
    href: "/admin-dashboard/view-messages",
  },
];

export async function fetchAllAdminNotifications(): Promise<AdminNotificationItem[]> {
  return Promise.resolve(ADMIN_NOTIFICATIONS);
}
