"use client";

// Link intentionally removed: expanded info shows descriptive text
import { Bell, CheckSquare, ChevronDown, Square, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type AdminNotificationItem, fetchAllAdminNotifications } from "../lib/adminNotifications";
import styles from "./AdminNotifications.module.css";

const READ_KEY = "admin-notification-read-ids";
const DELETED_KEY = "admin-notification-deleted-ids";

type AdminNotificationsProps = {
  compact?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeSignal?: number;
};

function getReadIds(): string[] {
  const raw = window.localStorage.getItem(READ_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getDeletedIds(): string[] {
  const raw = window.localStorage.getItem(DELETED_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AdminNotifications({
  compact = false,
  onOpenChange,
  closeSignal = 0,
}: AdminNotificationsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [mountedPanel, setMountedPanel] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const prevCloseSignalRef = useRef(closeSignal);
  const closePanelRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    fetchAllAdminNotifications().then((response) => setItems(response));
    setReadIds(getReadIds());
    setDeletedIds(getDeletedIds());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(READ_KEY, JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    window.localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
  }, [deletedIds]);

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

  const unreadCount = useMemo(
    () => items.filter((item) => !readIds.includes(item.id) && !deletedIds.includes(item.id)).length,
    [deletedIds, items, readIds],
  );

  const visibleItems = useMemo(
    () => items.filter((item) => !deletedIds.includes(item.id)),
    [deletedIds, items],
  );

  const selectedCount = selectedIds.length;
  const allSelected = visibleItems.length > 0 && selectedCount === visibleItems.length;

  const handleMarkAllRead = () => {
    setReadIds(visibleItems.map((item) => item.id));
  };

  const handleToggleItemSelection = (notificationId: string) => {
    setSelectedIds((current) =>
      current.includes(notificationId) ? current.filter((id) => id !== notificationId) : [...current, notificationId],
    );
  };

  const handleToggleExpand = (notificationId: string) => {
    setExpandedIds((current) =>
      current.includes(notificationId) ? current.filter((id) => id !== notificationId) : [...current, notificationId],
    );
    setReadIds((current) => (current.includes(notificationId) ? current : [...current, notificationId]));
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    setDeletedIds((current) => Array.from(new Set([...current, ...selectedIds])));
    setSelectedIds([]);
    setExpandedIds((current) => current.filter((id) => !selectedIds.includes(id)));
    setReadIds((current) => current.filter((id) => !selectedIds.includes(id)));
  };

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(visibleItems.map((item) => item.id));
  };

  const handleOpenItem = (notificationId: string) => {
    setReadIds((current) => (current.includes(notificationId) ? current : [...current, notificationId]));
    if (mountedPanel && open) {
      closePanel();
    }
  };

  const openPanel = () => {
    if (!mountedPanel) setMountedPanel(true);
    setIsClosing(false);
    setOpen(true);
    onOpenChange?.(true);
  };

  function formatSourceLabel(src?: string) {
    if (!src) return "System";
    const map: Record<string, string> = {
      posts: "Post service",
      users: "User service",
      auth: "Authentication",
    };
    return map[src] ?? src.charAt(0).toUpperCase() + src.slice(1);
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
        <section className={`${styles.panel} ${isClosing ? styles['panelClosing'] || styles['panel--closing'] || '' : ''}`} aria-label="Admin notifications menu">
          <header className={styles.head}>
            <div>
              <p className={styles.title}>Notifications</p>
              <p className={styles.subtitle}>{visibleItems.length} updates</p>
            </div>
            <button type="button" className={styles.markRead} onClick={handleMarkAllRead}>
              Mark all as read
            </button>
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
              className={`${styles.toolbarButton} ${selectedCount === 0 ? styles.toolbarButtonDisabled : ""} ${styles['toolbarButton--danger'] || ""}`}
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
            {visibleItems.length === 0 && <p className={styles.empty}>No notifications yet.</p>}

            {visibleItems.map((item) => {
              const isUnread = !readIds.includes(item.id);
              const isSelected = selectedIds.includes(item.id);
              const isExpanded = expandedIds.includes(item.id);
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
                      onClick={() => handleToggleExpand(item.id)}
                      aria-expanded={isExpanded}
                    >
                      <div className={styles.itemTitleRow}>
                        <p className={styles.itemTitle}>{item.title}</p>
                        <span className={styles.expandIcon} aria-hidden="true">
                          <ChevronDown size={14} />
                        </span>
                      </div>
                      <p className={styles.itemDesc}>{item.description}</p>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className={styles.expanded}>
                      <div className={styles.meta}>
                        <span>{formatSourceLabel(item.source)}</span>
                        <span>{item.timeLabel}</span>
                      </div>
                      <p className={styles.expandedText}>
                        <strong>{item.title}</strong> — {item.description}
                      </p>
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
