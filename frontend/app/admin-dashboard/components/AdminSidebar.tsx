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
import {
  DOCUMENT_LIBRARY_STATE_EVENT,
  getDocumentLibraryState,
} from "../documents/document-library-state";

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

type SidebarDropdownItem = {
  href: string;
  label: string;
  badgeCount?: number;
};

type SidebarDropdownProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: SidebarDropdownItem[];
  pathname: string;
  isExpanded: boolean;
  isActive: boolean;
  shouldShowDetails: boolean;
  arrowNavigation?: boolean;
  onToggle: () => void;
  onCloseMobileNav: () => void;
};

function SidebarDropdown({
  id,
  label,
  icon: Icon,
  items,
  pathname,
  isExpanded,
  isActive,
  shouldShowDetails,
  arrowNavigation = false,
  onToggle,
  onCloseMobileNav,
}: SidebarDropdownProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!arrowNavigation || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) {
      return;
    }

    const group = event.currentTarget;
    const focusableItems = Array.from(group.querySelectorAll<HTMLElement>("button, a[href]"));
    const activeItem = event.target instanceof HTMLElement
      ? event.target.closest<HTMLElement>("button, a[href]")
      : null;
    const currentIndex = activeItem
      ? focusableItems.indexOf(activeItem)
      : -1;

    if (event.key === "ArrowDown" && !isExpanded && currentIndex === 0) {
      event.preventDefault();
      onToggle();
      window.requestAnimationFrame(() => {
        group.querySelector<HTMLElement>(`#${id} a[href]`)?.focus();
      });
      return;
    }

    if (currentIndex < 0 || focusableItems.length < 2) {
      return;
    }

    event.preventDefault();
    const nextIndex =
      event.key === "ArrowDown"
        ? (currentIndex + 1) % focusableItems.length
        : (currentIndex - 1 + focusableItems.length) % focusableItems.length;
    focusableItems[nextIndex].focus();
  };

  return (
    <div
      className={joinClasses(styles.groupRow, isExpanded && styles.groupRowExpanded)}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        className={joinClasses(
          styles.navLink,
          styles.groupTrigger,
          isActive && styles.navLinkActive,
        )}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={id}
        aria-current={isActive ? "page" : undefined}
        aria-label={label}
      >
        <span className={styles.navIcon} aria-hidden="true">
          <Icon size={16} strokeWidth={1.9} />
        </span>
        <span className={styles.navLabel}>{label}</span>
        {shouldShowDetails ? (
          <span className={styles.groupChevron} aria-hidden="true">
            <ChevronDown size={16} strokeWidth={2} />
          </span>
        ) : null}
      </button>

      {isExpanded ? (
        <div id={id} className={styles.subItems}>
          {items.map((subItem) => {
            const subIsActive = pathname.startsWith(subItem.href);

            return (
              <Link
                key={subItem.href}
                href={subItem.href}
                className={joinClasses(
                  styles.navLink,
                  styles.subItemLink,
                  styles.subItemIndented,
                  subIsActive && styles.navLinkActive,
                )}
                aria-current={subIsActive ? "page" : undefined}
                onClick={onCloseMobileNav}
              >
                <span className={styles.subItemBullet} aria-hidden="true" />
                <span className={styles.navLabel}>{subItem.label}</span>
                {subItem.badgeCount !== undefined ? (
                  <span className={styles.subItemBadge}>{subItem.badgeCount}</span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

const documentMenuItems: SidebarDropdownItem[] = [
  {
    href: "/admin-dashboard/documents/library",
    label: "Document Library",
    badgeCount: 128,
  },
  {
    href: "/admin-dashboard/documents/bulk-upload",
    label: "Bulk Upload",
  },
  {
    href: "/admin-dashboard/documents/archive",
    label: "Archive",
    badgeCount: 24,
  },
];

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
      { href: "#documents", label: "Documents", icon: BookOpen },
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
  const [isDocumentsExpanded, setIsDocumentsExpanded] = useState(false);
  const [documentCounts, setDocumentCounts] = useState({ libraryCount: 128, archiveCount: 24 });

  const currentVersion = VERSION_UPDATES[0]?.version || "v0.3.0-dev";
  const currentVersionShort = currentVersion.split("-")[0] || "v0.3.0";

  const isCreatePostsRoute =
    pathname.startsWith("/admin-dashboard/create-new-post") ||
    pathname.startsWith("/admin-dashboard/about-page") ||
    pathname.startsWith("/admin-dashboard/chapters") ||
    pathname.startsWith("/admin-dashboard/conventions");
  const isCreatePostsActive = isCreatePostsRoute;
  const isDocumentsRoute = documentMenuItems.some((item) => pathname.startsWith(item.href));

  useEffect(() => {
    if (isCreatePostsRoute) {
      setIsContentExpanded(true);
    }
  }, [isCreatePostsRoute]);

  useEffect(() => {
    if (isDocumentsRoute) {
      setIsDocumentsExpanded(true);
    }
  }, [isDocumentsRoute]);

  useEffect(() => {
    const syncCounts = () => {
      const { libraryCount, archiveCount } = getDocumentLibraryState();
      setDocumentCounts({ libraryCount, archiveCount });
    };

    syncCounts();
    window.addEventListener("storage", syncCounts);
    window.addEventListener(DOCUMENT_LIBRARY_STATE_EVENT, syncCounts);
    return () => {
      window.removeEventListener("storage", syncCounts);
      window.removeEventListener(DOCUMENT_LIBRARY_STATE_EVENT, syncCounts);
    };
  }, []);

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
                        const createPostsItems = section.items
                          .filter((subItem) => subItem.isIndented)
                          .map(({ href, label }) => ({ href, label }));

                        return (
                          <SidebarDropdown
                            key={item.label}
                            id="content-subitems"
                            label={item.label}
                            icon={item.icon}
                            items={createPostsItems}
                            pathname={pathname}
                            isExpanded={isExpanded}
                            isActive={isCreatePostsActive}
                            shouldShowDetails={shouldShowDetails}
                            onToggle={() => setIsContentExpanded((current) => !current)}
                            onCloseMobileNav={onCloseMobileNav}
                          />
                        );
                      }

                      if (item.href === "#documents") {
                        return (
                          <SidebarDropdown
                            key={item.label}
                            id="documents-subitems"
                            label={item.label}
                            icon={item.icon}
                            items={documentMenuItems.map((menuItem) => ({
                              ...menuItem,
                              badgeCount:
                                menuItem.href.endsWith("/library")
                                  ? documentCounts.libraryCount
                                  : documentCounts.archiveCount,
                            }))}
                            pathname={pathname}
                            isExpanded={isDocumentsExpanded}
                            isActive={isDocumentsRoute}
                            shouldShowDetails={shouldShowDetails}
                            arrowNavigation
                            onToggle={() => setIsDocumentsExpanded((current) => !current)}
                            onCloseMobileNav={onCloseMobileNav}
                          />
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
