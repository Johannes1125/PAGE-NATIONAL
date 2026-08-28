"use client";

import { ArrowRight, Bell, CheckSquare, ChevronDown, RefreshCw, Square, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import { api } from "../../lib/api-client";
import {
  type AdminNotificationItem,
  fetchAllAdminNotifications,
  markNotificationAsRead,
  deleteNotificationItem,
  batchDeleteNotifications,
} from "../lib/adminNotifications";
import styles from "./AdminNotifications.module.css";

type AdminNotificationsProps = {
  compact?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeSignal?: number;
};

/**
 * Calculates a friendly relative time string from a raw ISO timestamp.
 */
function formatRelativeTime(isoString?: string): string {
  if (!isoString) return "just now";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "just now";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function showSuccessToast(msg: string) {
  try {
    gooeyToast.success(msg);
  } catch {
    // Graceful fallback
  }
}

function showErrorToast(msg: string) {
  try {
    gooeyToast.error(msg);
  } catch {
    // Graceful fallback
  }
}

export default function AdminNotifications({
  compact = false,
  onOpenChange,
  closeSignal = 0,
}: AdminNotificationsProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [mountedPanel, setMountedPanel] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const prevCloseSignalRef = useRef(closeSignal);
  const closePanelRef = useRef<() => void>(() => undefined);

  // Check admin session on mount
  useEffect(() => {
    let isMounted = true;
    async function checkRole() {
      try {
        const res = await api.get<{ success: boolean; user?: { role: string } }>("/me");
        if (isMounted) {
          setIsAdmin(res?.user?.role === "admin");
        }
      } catch {
        // Fallback to localStorage payload check if offline
        try {
          const raw = localStorage.getItem("page_user_payload");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (isMounted) setIsAdmin(parsed.role === "admin");
            return;
          }
        } catch {}
        if (isMounted) setIsAdmin(false);
      }
    }
    checkRole();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetchAllAdminNotifications();
      setItems(response);
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
      setErrorMessage(err?.message || "Failed to load live notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadNotifications();

      // Polling interval to keep notifications fresh (every 30 seconds)
      const interval = window.setInterval(() => {
        loadNotifications();
      }, 30000);

      return () => window.clearInterval(interval);
    }
  }, [isAdmin, loadNotifications]);

  const closePanel = useCallback(() => {
    if (!mountedPanel) return;

    setOpen(false);
    setIsClosing(true);
    onOpenChange?.(false);

    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setIsClosing(false);
      setMountedPanel(false);
      closeTimerRef.current = null;
    }, 180);
  }, [mountedPanel, onOpenChange]);

  closePanelRef.current = closePanel;

  useEffect(() => {
    if (closeSignal === prevCloseSignalRef.current) return;

    prevCloseSignalRef.current = closeSignal;
    closePanelRef.current();
  }, [closeSignal]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;

      const target = event.target;
      if (!(target instanceof Node)) return;
      if (containerRef.current.contains(target)) return;

      if (mountedPanel && open) {
        closePanel();
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [closePanel, mountedPanel, open]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Derived visible items and unread count from real server data
  const visibleItems = useMemo(() => items.filter((item) => !item.isDeleted), [items]);
  const unreadCount = useMemo(() => visibleItems.filter((item) => !item.isRead).length, [visibleItems]);

  const selectedCount = selectedIds.length;
  const allSelected = visibleItems.length > 0 && selectedCount === visibleItems.length;

  const handleMarkAllRead = async () => {
    const unreadItems = visibleItems.filter((i) => !i.isRead);
    if (unreadItems.length === 0) return;

    // Optimistically update UI
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));

    try {
      await Promise.all(unreadItems.map((item) => markNotificationAsRead(item.id)));
      showSuccessToast("All notifications marked as read");
    } catch {
      showErrorToast("Could not mark all notifications as read");
    }
  };

  const handleToggleItemSelection = (notificationId: string) => {
    setSelectedIds((current) =>
      current.includes(notificationId) ? current.filter((id) => id !== notificationId) : [...current, notificationId],
    );
  };

  const handleToggleExpand = async (item: AdminNotificationItem) => {
    const willExpand = !expandedIds.includes(item.id);
    setExpandedIds((current) =>
      current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id],
    );

    // If expanding an unread item, mark it as read on the backend
    if (willExpand && !item.isRead) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)),
      );
      await markNotificationAsRead(item.id);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const idsToDelete = [...selectedIds];
    const previousItems = [...items];

    // Optimistically update UI
    setItems((prev) => prev.filter((item) => !idsToDelete.includes(item.id)));
    setSelectedIds([]);
    setExpandedIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));

    const success = await batchDeleteNotifications(idsToDelete);
    if (success) {
      showSuccessToast(`${idsToDelete.length} notification${idsToDelete.length > 1 ? "s" : ""} deleted`);
    } else {
      setItems(previousItems);
      showErrorToast("Failed to delete selected notifications");
    }
  };

  const handleDeleteSingle = async (notificationId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();

    const previousItems = [...items];

    // Optimistically update UI
    setItems((prev) => prev.filter((item) => item.id !== notificationId));
    setSelectedIds((current) => current.filter((id) => id !== notificationId));
    setExpandedIds((current) => current.filter((id) => id !== notificationId));

    const success = await deleteNotificationItem(notificationId);
    if (success) {
      showSuccessToast("Notification dismissed");
    } else {
      setItems(previousItems);
      showErrorToast("Failed to delete notification");
    }
  };

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(visibleItems.map((item) => item.id));
  };

  const handleOpenItem = async (item: AdminNotificationItem) => {
    if (!item.isRead) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)),
      );
      await markNotificationAsRead(item.id);
    }
    closePanel();
    if (item.href) {
      router.push(item.href);
    }
  };

  const openPanel = () => {
    loadNotifications();
    if (!mountedPanel) setMountedPanel(true);
    setIsClosing(false);
    setOpen(true);
    onOpenChange?.(true);
  };

  function formatSourceLabel(src?: string) {
    if (!src) return "Activity / Articles";
    const map: Record<string, string> = {
      "approve-post": "Post Moderation",
      "create-post": "Post Creation",
      "manage-users": "Membership & Users",
      "messages": "Inquiries",
      "overview": "Activity / Articles",
      "applications": "Applications",
    };
    return map[src] ?? src.charAt(0).toUpperCase() + src.slice(1);
  }

  function getSourceBadgeClass(src?: string) {
    if (!src) return styles.sourceBadgeOverview;
    switch (src) {
      case "approve-post":
      case "create-post":
        return styles.sourceBadgeApprove;
      case "manage-users":
      case "applications":
        return styles.sourceBadgeUsers;
      case "messages":
        return styles.sourceBadgeMessages;
      default:
        return styles.sourceBadgeOverview;
    }
  }

  // Only render for admin users
  if (isAdmin === false) {
    return null;
  }

  return (
    <div className={styles.wrap} ref={containerRef} data-admin-notifications>
      <button
        type="button"
        className={`${styles.button} ${compact ? styles.buttonCompact : ""} ${open ? styles.buttonOpen : ""}`}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={() => {
          if (!mountedPanel) {
            openPanel();
            return;
          }
          if (open) {
            closePanel();
            return;
          }
          openPanel();
        }}
        aria-label={
          unreadCount > 0
            ? `Open admin notifications, ${unreadCount} unread`
            : "Open admin notifications"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className={styles.buttonIcon} aria-hidden="true">
          <Bell size={18} strokeWidth={2} />
        </span>
        {unreadCount > 0 && <span className={styles.count}>{unreadCount}</span>}
      </button>

      {mountedPanel && (
        <section
          className={`${styles.panel} ${isClosing ? styles.panelClosing || "" : ""}`}
          aria-label="Admin notifications menu"
        >
          <header className={styles.head}>
            <div>
              <p className={styles.title}>Notifications</p>
              <p className={styles.subtitle}>{visibleItems.length} updates</p>
            </div>
            <div className={styles.headActions}>
              <button
                type="button"
                className={styles.refreshButton}
                onClick={loadNotifications}
                title="Refresh notifications"
                aria-label="Refresh notifications"
              >
                <RefreshCw size={13} className={isLoading ? styles.spinning : ""} />
              </button>
              <button type="button" className={styles.markRead} onClick={handleMarkAllRead}>
                Mark all read
              </button>
            </div>
          </header>

          <div className={styles.toolbar}>
            <button type="button" className={styles.toolbarButton} onClick={handleToggleSelectAll}>
              <span className={styles.toolbarIcon} aria-hidden="true">
                {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
              </span>
              {allSelected ? "Clear selection" : "Select all"}
            </button>

            <button
              type="button"
              className={`${styles.toolbarButton} ${selectedCount === 0 ? styles.toolbarButtonDisabled : ""} ${
                styles["toolbarButton--danger"] || ""
              }`}
              onClick={handleDeleteSelected}
              disabled={selectedCount === 0}
              aria-label={selectedCount === 0 ? "Delete selected (disabled)" : `Delete ${selectedCount} selected`}
            >
              <span className={styles.toolbarIcon} aria-hidden="true">
                <Trash2 size={14} />
              </span>
              Delete ({selectedCount})
            </button>
          </div>

          <div className={styles.list}>
            {errorMessage && (
              <p className={styles.empty} style={{ color: "#d9364a" }}>
                {errorMessage}
              </p>
            )}

            {!errorMessage && visibleItems.length === 0 && (
              <p className={styles.empty}>
                {isLoading ? "Loading live notifications..." : "No notifications right now."}
              </p>
            )}

            {visibleItems.map((item) => {
              const isUnread = !item.isRead;
              const isSelected = selectedIds.includes(item.id);
              const isExpanded = expandedIds.includes(item.id);
              const relativeTime = formatRelativeTime(item.createdAt);

              return (
                <article
                  key={item.id}
                  className={`${styles.item} ${isUnread ? styles.itemUnread : ""} ${isSelected ? styles.itemSelected : ""}`}
                >
                  <div className={styles.itemRow}>
                    <button
                      type="button"
                      className={styles.checkbox}
                      aria-label={isSelected ? `Deselect ${item.title}` : `Select ${item.title}`}
                      aria-pressed={isSelected}
                      onClick={() => handleToggleItemSelection(item.id)}
                    >
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>

                    <button
                      type="button"
                      className={styles.itemMain}
                      onClick={() => handleToggleExpand(item)}
                      aria-expanded={isExpanded}
                    >
                      <div className={styles.itemTitleRow}>
                        <p className={styles.itemTitle}>{item.title}</p>
                        <span className={styles.expandIcon} aria-hidden="true">
                          <ChevronDown size={14} />
                        </span>
                      </div>
                      <p className={styles.itemDesc}>{item.body}</p>
                    </button>

                    <button
                      type="button"
                      className={styles.itemDeleteBtn}
                      onClick={(e) => handleDeleteSingle(item.id, e)}
                      title="Dismiss notification"
                      aria-label={`Dismiss notification ${item.title}`}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className={styles.expanded}>
                      <div className={styles.meta}>
                        <span className={`${styles.sourceBadge} ${getSourceBadgeClass(item.source)}`}>
                          {formatSourceLabel(item.source)}
                        </span>
                        <span>{relativeTime}</span>
                      </div>
                      <p className={styles.expandedText}>
                        <strong>{item.title}</strong> — {item.body}
                      </p>
                      <div className={styles.expandedActions}>
                        {item.href ? (
                          <button
                            type="button"
                            className={styles.actionButton}
                            onClick={() => handleOpenItem(item)}
                          >
                            <span>Go to details</span>
                            <span className={styles.actionIcon} aria-hidden="true">
                              <ArrowRight size={12} />
                            </span>
                          </button>
                        ) : (
                          <div />
                        )}
                        <button
                          type="button"
                          className={styles.deleteItemTextBtn}
                          onClick={(e) => handleDeleteSingle(item.id, e)}
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
