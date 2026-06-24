"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FileText, LogOut, Menu, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import AdminNotifications from "./AdminNotifications";
import styles from "./AdminHeader.module.css";

type ProfileMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const profileMenuItems: ProfileMenuItem[] = [
  { label: "Edit Profile", href: "/admin-dashboard/manage-users", icon: UserRound },
  { label: "Terms of Use", href: "/about", icon: FileText },
  { label: "Privacy Policy", href: "/about", icon: ShieldCheck },
  { label: "Log Out", href: "/admin-login", icon: LogOut },
];

type AdminHeaderProps = {
  isSidebarCollapsed: boolean;
  isDesktopCollapsed: boolean;
  isMobileViewport: boolean;
  isMobileNavOpen: boolean;
  onSidebarToggle: () => void;
  onCloseMobileNav: () => void;
  title: string;
  subtitle: string;
  eyebrow?: string;
  seniorFriendlyHeader?: boolean;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function AdminHeader({
  isSidebarCollapsed,
  isDesktopCollapsed,
  isMobileViewport,
  isMobileNavOpen,
  onSidebarToggle,
  onCloseMobileNav,
  title,
  subtitle,
  eyebrow = "Admin panel",
  seniorFriendlyHeader = false,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [closeNotificationsSignal, setCloseNotificationsSignal] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const requestCloseNotifications = () => {
    setCloseNotificationsSignal((current) => current + 1);
  };

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;

      const target = event.target;
      if (!(target instanceof Node)) return;
      if (profileMenuRef.current.contains(target)) return;

      setIsProfileMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
        requestCloseNotifications();
        onCloseMobileNav();
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onCloseMobileNav]);

  useEffect(() => {
    setIsProfileMenuOpen(false);
    requestCloseNotifications();
  }, [pathname]);

  const handleProfileToggle = () => {
    setIsProfileMenuOpen((current) => {
      const next = !current;
      if (next) {
        requestCloseNotifications();
      }
      return next;
    });
  };

  return (
    <>
      <header
        className={joinClasses(
          styles.header,
          isDesktopCollapsed && styles.headerCollapsed,
          isMobileViewport && styles.headerMobile,
        )}
      >
        <div className={styles.bar}>
          <button
            type="button"
            className={styles.sidebarToggle}
            onClick={onSidebarToggle}
            aria-label={
              isMobileViewport
                ? isMobileNavOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
                : isSidebarCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
            }
            aria-expanded={isMobileViewport ? isMobileNavOpen : !isSidebarCollapsed}
            aria-controls="admin-navigation"
          >
            <Menu size={20} />
          </button>

          <div className={styles.brand}>
            <div className={styles.brandMark} aria-hidden="true">
              <img src="/PAGE-logo.jpg" alt="PAGE" className={styles.brandMarkImg} />
            </div>
            <div className={styles.brandCopy}>
              <span className={styles.brandName}>PAGE</span>
              <span className={styles.brandSubtitle}>Admin Dashboard</span>
            </div>
          </div>

          <div className={styles.actions}>
            <AdminNotifications
              compact
              closeSignal={closeNotificationsSignal}
              onOpenChange={(open) => {
                if (open) {
                  setIsProfileMenuOpen(false);
                }
              }}
            />

            <div
              className={joinClasses(styles.profileMenu, isProfileMenuOpen && styles.profileMenuOpen)}
              ref={profileMenuRef}
              data-admin-profile-menu
            >
              <button
                type="button"
                className={styles.profileButton}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={handleProfileToggle}
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
              >
                <div className={styles.profileAvatar} aria-hidden="true">
                  JD
                </div>
                <div className={styles.profileCopy}>
                  <span className={styles.profileName}>Dr. Juan Dela Cruz</span>
                  <span className={styles.profileRole}>Admin Panel</span>
                </div>
              </button>

              <div className={styles.profileDropdown} role="menu" aria-label="Account menu">
                {profileMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={joinClasses(
                      styles.profileMenuItem,
                      item.label === "Log Out" && styles.profileMenuItemDanger,
                    )}
                    role="menuitem"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <span className={styles.profileMenuIcon} aria-hidden="true">
                      <item.icon size={14} strokeWidth={2} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className={joinClasses(styles.intro, seniorFriendlyHeader && styles.introSeniorFriendly)}>
        <p className={joinClasses(styles.eyebrow, seniorFriendlyHeader && styles.eyebrowSeniorFriendly)}>{eyebrow}</p>
        <h1 className={joinClasses(styles.title, seniorFriendlyHeader && styles.titleSeniorFriendly)}>{title}</h1>
        <p className={joinClasses(styles.subtitle, seniorFriendlyHeader && styles.subtitleSeniorFriendly)}>{subtitle}</p>
      </section>
    </>
  );
}
