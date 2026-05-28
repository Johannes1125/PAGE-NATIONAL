"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { type AdminNotificationItem, fetchAllAdminNotifications } from "../lib/adminNotifications";
import styles from "./AdminNotifications.module.css";

const READ_KEY = "admin-notification-read-ids";

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

export default function AdminNotifications({ compact = false }: AdminNotificationsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    fetchAllAdminNotifications().then((response) => setItems(response));
    setReadIds(getReadIds());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(READ_KEY, JSON.stringify(readIds));
  }, [readIds]);

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
    () => items.filter((item) => !readIds.includes(item.id)).length,
    [items, readIds],
  );

  const handleMarkAllRead = () => {
    setReadIds(items.map((item) => item.id));
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
            <p className={styles.title}>Admin Notifications</p>
            <button type="button" className={styles.markRead} onClick={handleMarkAllRead}>
              Mark all as read
            </button>
          </header>

          <div className={styles.list}>
            {items.length === 0 && <p className={styles.empty}>No notifications yet.</p>}

            {items.map((item) => {
              const isUnread = !readIds.includes(item.id);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`${styles.item} ${isUnread ? styles.itemUnread : ""}`}
                  onClick={() => handleOpenItem(item.id)}
                >
                  <p className={styles.itemTitle}>{item.title}</p>
                  <p className={styles.itemDesc}>{item.description}</p>
                  <div className={styles.meta}>
                    <span>{item.source}</span>
                    <span>{item.timeLabel}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
