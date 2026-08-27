"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Archive,
  BadgeCheck,
  Building2,
  ChevronDown,
  ClipboardList,
  Landmark,
  LayoutDashboard,
  MessageSquareText,
  PlusCircle,
  Users,
  UserCheck,
  BookOpen,
  X,
  type LucideIcon,
} from "lucide-react";
import styles from "./AdminSidebar.module.css";
import { VERSION_UPDATES } from "../../lib/version-updates";

type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type AdminSidebarItem = AdminNavItem & {
  isIndented?: boolean;
};

type AdminSidebarSection = {
  title: string;
  items: AdminSidebarItem[];
};

const adminSections: AdminSidebarSection[] = [
  {
    title: "Dashboard",
    items: [{ href: "/admin-dashboard", label: "Overview", icon: LayoutDashboard }],
  },
  {
    title: "Content",
    items: [
      { href: "#create-posts", label: "Create Posts", icon: PlusCircle },
      { href: "/admin-dashboard/create-new-post", label: "Create News", icon: PlusCircle, isIndented: true },
      { href: "/admin-dashboard/about-page", label: "About PAGE", icon: BookOpen, isIndented: true },
      { href: "/admin-dashboard/chapters", label: "Chapters", icon: Building2, isIndented: true },
      { href: "/admin-dashboard/conventions", label: "Conventions", icon: Landmark, isIndented: true },
      { href: "/admin-dashboard/approve-post", label: "Approve Posts", icon: BadgeCheck },
    ],
  },
  {
    title: "Membership",
    items: [
      { href: "/admin-dashboard/membership-applications", label: "Membership Applications", icon: UserCheck },
      { href: "/admin-dashboard/manage-users", label: "Manage Users", icon: Users },
    ],
  },
  {
    title: "Communication",
    items: [
      { href: "/admin-dashboard/view-messages", label: "Messages", icon: MessageSquareText },
      { href: "/admin-dashboard/recent-activity", label: "Recent Activity", icon: Activity },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin-dashboard/audit-log", label: "Audit Log", icon: ClipboardList },
      { href: "/admin-dashboard/archives", label: "Archives", icon: Archive },
    ],
  },
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
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  const currentVersion = VERSION_UPDATES[0]?.version || "v0.3.0-dev";
  const currentVersionShort = currentVersion.split("-")[0] || "v0.3.0";

  const isCreatePostsRoute =
    pathname.startsWith("/admin-dashboard/create-new-post") ||
    pathname.startsWith("/admin-dashboard/about-page") ||
    pathname.startsWith("/admin-dashboard/chapters") ||
    pathname.startsWith("/admin-dashboard/conventions");
  const isCreatePostsActive = isCreatePostsRoute;

  useEffect(() => {
    if (isCreatePostsRoute) {
      setIsContentExpanded(true);
    }
  }, [isCreatePostsRoute]);

  const shouldShowDetails = !isCollapsed || isMobileViewport;

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
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <nav className={styles.nav} id="admin-navigation" aria-label="Admin navigation">
            {adminSections.map((section) => {
              const isContentSection = section.title === "Content";
              const isExpanded = !isContentSection || isContentExpanded;

              return (
                <section key={section.title} className={styles.section}>
                  <div className={styles.sectionLabel}>{section.title}</div>

                  <div className={styles.sectionItems}>
                    {section.items.map((item) => {
                      const isActive = item.href === "/admin-dashboard"
                        ? pathname === "/admin-dashboard"
                        : item.href !== "#create-posts" && pathname.startsWith(item.href);

                      if (item.href === "#create-posts") {
                        return (
                          <div
                            key={item.label}
                            className={joinClasses(styles.groupRow, isExpanded && styles.groupRowExpanded)}
                          >
                            <button
                              type="button"
                              className={joinClasses(
                                styles.navLink,
                                styles.groupTrigger,
                                isCreatePostsActive && styles.navLinkActive,
                              )}
                              onClick={() => setIsContentExpanded((current) => !current)}
                              aria-expanded={isExpanded}
                              aria-controls="content-subitems"
                              aria-current={isCreatePostsActive ? "page" : undefined}
                            >
                              <span className={styles.navIcon} aria-hidden="true">
                                <item.icon size={16} strokeWidth={1.9} />
                              </span>
                              <span className={styles.navLabel}>{item.label}</span>
                              {shouldShowDetails ? (
                                <span className={styles.groupChevron} aria-hidden="true">
                                  <ChevronDown size={16} strokeWidth={2} />
                                </span>
                              ) : null}
                            </button>

                            {isExpanded ? (
                              <div id="content-subitems" className={styles.subItems}>
                                {section.items
                                  .filter((subItem) => subItem.isIndented)
                                  .map((subItem) => {
                                    const subIsActive = pathname.startsWith(subItem.href);

                                    return (
                                      <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        className={joinClasses(
                                          styles.navLink,
                                          styles.subItemLink,
                                          subItem.isIndented && styles.subItemIndented,
                                          subIsActive && styles.navLinkActive,
                                        )}
                                        aria-current={subIsActive ? "page" : undefined}
                                        onClick={onCloseMobileNav}
                                      >
                                        <span className={styles.subItemBullet} aria-hidden="true" />
                                        <span className={styles.navLabel}>{subItem.label}</span>
                                      </Link>
                                    );
                                  })}
                              </div>
                            ) : null}
                          </div>
                        );
                      }

                      if (item.isIndented) {
                        return null;
                      }

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
                  </div>
                </section>
              );
            })}
          </nav>

          <div className={styles.footer} aria-label="System version">
            <span className={styles.versionText}>
              {isCollapsed ? currentVersionShort : `Version ${currentVersion}`}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
