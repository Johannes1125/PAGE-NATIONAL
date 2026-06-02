"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";
<<<<<<< HEAD
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import layoutStyles from "./AdminSidebarLayout.module.css";
=======
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  BadgeCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  LogOut,
  PlusCircle,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import AdminNotifications from "./AdminNotifications";
>>>>>>> dev

export const ADMIN_MOBILE_BREAKPOINT_PX = 980;

type AdminSidebarLayoutProps = {
  pageClassName: string;
  mainClassName: string;
  title: string;
  subtitle: string;
  eyebrow?: string;
  children: ReactNode;
};

<<<<<<< HEAD
function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}
=======
type ProfileMenuItem = {
  label: string;
  href: string;
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

const profileMenuItems: ProfileMenuItem[] = [
  { label: "Edit Profile", href: "/admin-dashboard/manage-users", icon: UserRound },
  { label: "Terms of Use", href: "/about", icon: FileText },
  { label: "Privacy Policy", href: "/about", icon: ShieldCheck },
  { label: "Log Out", href: "/admin-login", icon: LogOut },
];
>>>>>>> dev

export default function AdminSidebarLayout({
  pageClassName,
  mainClassName,
  title,
  subtitle,
  eyebrow = "Admin panel",
  children,
}: AdminSidebarLayoutProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;

    return window.localStorage.getItem("admin-sidebar-collapsed") === "true";
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("admin-sidebar-collapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${ADMIN_MOBILE_BREAKPOINT_PX}px)`);

    const syncViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
      if (mediaQuery.matches) {
        setIsMobileNavOpen(false);
      }
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (!isMobileViewport || !isMobileNavOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileViewport, isMobileNavOpen]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  const isDesktopCollapsed = !isMobileViewport && isSidebarCollapsed;
  const desktopSidebarWidth = isDesktopCollapsed ? "88px" : "260px";

  const rootStyle = {
    ["--admin-sidebar-width" as never]: isMobileViewport ? "0px" : desktopSidebarWidth,
    ["--admin-sidebar-collapsed-width" as never]: "88px",
  } as CSSProperties;

  const shellClassName = joinClasses(
    pageClassName,
    layoutStyles.shell,
    isDesktopCollapsed && layoutStyles.shellCollapsed,
  );

  const handleSidebarToggle = () => {
    if (isMobileViewport) {
      setIsMobileNavOpen((current) => !current);
      return;
    }

    setIsSidebarCollapsed((current) => !current);
  };

  const closeMobileNav = () => {
    if (isMobileViewport) {
      setIsMobileNavOpen(false);
    }
  };

  return (
    <main className={shellClassName} style={rootStyle}>
      <AdminSidebar
        isCollapsed={isDesktopCollapsed}
        isMobileViewport={isMobileViewport}
        isMobileNavOpen={isMobileNavOpen}
        onCloseMobileNav={closeMobileNav}
      />

<<<<<<< HEAD
      <section
        className={joinClasses(mainClassName, layoutStyles.content)}
        style={{ paddingTop: "var(--admin-header-height)" }}
      >
        <AdminHeader
          isSidebarCollapsed={isSidebarCollapsed}
          isDesktopCollapsed={isDesktopCollapsed}
          isMobileViewport={isMobileViewport}
          isMobileNavOpen={isMobileNavOpen}
          onSidebarToggle={handleSidebarToggle}
          onCloseMobileNav={closeMobileNav}
          title={title}
          subtitle={subtitle}
          eyebrow={eyebrow}
        />
=======
            <div className="admin-brand__identity">
              <div className="admin-brand__name">PAGE</div>
              <div className="admin-brand__tagline">Admin</div>
            </div>
          </div>

          <nav className="admin-nav">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav__link${isActive ? " admin-nav__link--active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="admin-nav__icon" aria-hidden="true">
                    <item.icon size={16} strokeWidth={1.9} />
                  </span>
                  <span className="admin-nav__label">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <section className={mainClassName} style={{ paddingTop: 'var(--admin-header-height)' }}>
        <header className="admin-header">
          <div className="admin-header__bar">
            <button
              type="button"
              className="admin-sidebar-toggle admin-header__sidebar-toggle"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={isSidebarCollapsed}
            >
              <Menu size={20} />
            </button>

            <div className="admin-header__brand">
              <div className="admin-header__brand-mark" aria-hidden="true">
                <img src="/PAGE-logo.jpg" alt="PAGE" className="admin-header__brand-mark-img" />
              </div>
              <div className="admin-header__brand-copy">
                <span className="admin-header__brand-name">PAGE</span>
                <span className="admin-header__brand-subtitle">Admin Dashboard</span>
              </div>
            </div>

            <div className="admin-header__actions">
              <AdminNotifications compact />

              <div className={`admin-profile-menu${isProfileMenuOpen ? " admin-profile-menu--open" : ""}`} ref={profileMenuRef}>
                <button
                  type="button"
                  className="admin-profile"
                  onClick={() => setIsProfileMenuOpen((current) => !current)}
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  <div className="admin-profile__avatar" aria-hidden="true">
                    JD
                  </div>
                  <div className="admin-profile__copy">
                    <span className="admin-profile__name">Dr. Juan Dela Cruz</span>
                    <span className="admin-profile__role">Admin Panel</span>
                  </div>
                </button>

                <div className="admin-profile-menu__dropdown" role="menu" aria-label="Account menu">
                  {profileMenuItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`admin-profile-menu__item ${item.label === 'Log Out' ? 'admin-profile-menu__item--danger' : ''}`}
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span className="admin-profile-menu__icon" aria-hidden="true">
                        <item.icon size={14} strokeWidth={2} />
                      </span>
                      <span className="admin-profile-menu__label">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="admin-shell admin-shell--intro">
          <p className="admin-header__eyebrow">{eyebrow}</p>
          <h1 className="admin-header__title">{title}</h1>
          <p className="admin-header__subtitle">{subtitle}</p>
        </section>
>>>>>>> dev

        {children}
      </section>
    </main>
  );
}
