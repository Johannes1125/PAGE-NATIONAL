"use client";

import Link from "next/link";
import { Bell, CheckSquare, ChevronDown, Square, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { type AdminNotificationItem, fetchAllAdminNotifications } from "../lib/adminNotifications";
import styles from "./AdminNotifications.module.css";

const READ_KEY = "admin-notification-read-ids";
const DELETED_KEY = "admin-notification-deleted-ids";

type AdminNotificationsProps = {
  compact?: boolean;
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

export default function AdminNotifications({ compact = false }: AdminNotificationsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

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

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (event.target instanceof Node && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
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
    setOpen(false);
  };

  return (
    <div className={styles.wrap} ref={containerRef}>
      <button
        type="button"
        className={`${styles.button} ${compact ? styles.buttonCompact : ""}`}
        onClick={() => setOpen((current) => !current)}
        aria-label="Open admin notifications"
      >
        <span className={styles.buttonLabel} aria-hidden={compact}>
          <Bell size={14} />
          <span className={compact ? styles.buttonLabelHidden : ""}>Notifications</span>
        </span>
        {unreadCount > 0 && <span className={styles.count}>{unreadCount}</span>}
      </button>

      {open && (
        <section className={styles.panel} aria-label="Admin notifications menu">
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
              className={`${styles.toolbarButton} ${selectedCount === 0 ? styles.toolbarButtonDisabled : ""}`}
              onClick={handleDeleteSelected}
              disabled={selectedCount === 0}
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
                        <span>{item.source}</span>
                        <span>{item.timeLabel}</span>
                      </div>
                      <p className={styles.expandedText}>
                        Related page: <Link href={item.href} onClick={() => handleOpenItem(item.id)}>{item.href}</Link>
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
