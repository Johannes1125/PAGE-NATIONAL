"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  ClipboardList,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  PlusCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import styles from "./AdminSidebar.module.css";

type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const adminNavItems: AdminNavItem[] = [
  { href: "/admin-dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin-dashboard/create-new-post", label: "Create New Post", icon: PlusCircle },
  { href: "/admin-dashboard/approve-post", label: "Approve Posts", icon: BadgeCheck },
  { href: "/admin-dashboard/audit-log", label: "Audit Log", icon: ClipboardList },
  { href: "/admin-dashboard/manage-users", label: "Manage Users", icon: Users },
  { href: "/admin-dashboard/view-messages", label: "Messages", icon: MessageSquareText },
];

type AdminSidebarProps = {
  isCollapsed: boolean;
  isMobileViewport: boolean;
  isMobileNavOpen: boolean;
  onCloseMobileNav: () => void;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function AdminSidebar({
  isCollapsed,
  isMobileViewport,
  isMobileNavOpen,
  onCloseMobileNav,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        className={joinClasses(
          styles.backdrop,
          isMobileViewport && styles.backdropMobile,
          isMobileViewport && isMobileNavOpen && styles.backdropVisible,
        )}
        aria-label="Close navigation menu"
        aria-hidden={!isMobileNavOpen}
        tabIndex={isMobileNavOpen ? 0 : -1}
        onClick={onCloseMobileNav}
      />

      <aside
        className={joinClasses(
          styles.navbar,
          isCollapsed && styles.navbarCollapsed,
          isMobileViewport && styles.navbarMobile,
          isMobileViewport && isMobileNavOpen && styles.navbarMobileOpen,
        )}
        aria-hidden={isMobileViewport ? !isMobileNavOpen : undefined}
      >
        <div className={styles.inner}>
          <div className={styles.brand}>
            <div className={styles.brandStart}>
              <div className={styles.avatar} aria-hidden="true">
                <span className={styles.avatarText}>JD</span>
              </div>

              <div className={styles.identity}>
                <div className={styles.brandName}>PAGE</div>
                <div className={styles.brandTagline}>Admin</div>
              </div>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={onCloseMobileNav}
              aria-label="Close navigation menu"
            >
              <Menu size={20} strokeWidth={2} />
            </button>
          </div>

          <nav className={styles.nav} id="admin-navigation">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={joinClasses(styles.navLink, isActive && styles.navLinkActive)}
                  aria-current={isActive ? "page" : undefined}
                  onClick={onCloseMobileNav}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <item.icon size={16} strokeWidth={1.9} />
                  </span>
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
