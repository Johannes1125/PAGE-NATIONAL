"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MessageSquareText,
  Newspaper,
  PlusCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import AdminNotifications from "./AdminNotifications";

type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type AdminSidebarLayoutProps = {
  pageClassName: string;
  mainClassName: string;
  title: string;
  subtitle: string;
  eyebrow?: string;
  children: ReactNode;
};

type ProfileMenuItem = {
  label: string;
  href: string;
};

const adminNavItems: AdminNavItem[] = [
  { href: "/admin-dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin-dashboard/create-new-post", label: "Create New Post", icon: PlusCircle },
  { href: "/admin-dashboard/approve-post", label: "Approve Posts", icon: BadgeCheck },
  { href: "/admin-dashboard/manage-users", label: "Manage Users", icon: Users },
  { href: "/admin-dashboard/view-messages", label: "Messages", icon: MessageSquareText },
  { href: "/", label: "Main Page", icon: Newspaper },
];

const profileMenuItems: ProfileMenuItem[] = [
  { label: "Edit Profile", href: "/admin-dashboard/manage-users" },
  { label: "Terms of Use", href: "/about" },
  { label: "Privacy Policy", href: "/about" },
  { label: "Log Out", href: "/admin-login" },
];

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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.localStorage.setItem("admin-sidebar-collapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;

      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [pathname]);

  const rootStyle = {
    ["--admin-sidebar-width" as never]: isSidebarCollapsed ? "88px" : "260px",
    ["--admin-sidebar-collapsed-width" as never]: "88px",
  } as CSSProperties;

  return (
    <main className={`${pageClassName}${isSidebarCollapsed ? " admin-shell--sidebar-collapsed" : ""}`} style={rootStyle}>
      <aside className="admin-navbar">
        <div className="admin-navbar__inner">
          <div className="admin-brand">
            <div className="admin-brand__avatar" aria-hidden="true">
              <span className="admin-brand__avatar-text">JD</span>
            </div>

            <div className="admin-brand__identity">
              <div className="admin-brand__eyebrow">Admin panel</div>
              <div className="admin-brand__name">PAGE Admin</div>
              <div className="admin-brand__tagline">Portal controls and moderation tools</div>
            </div>

            <button
              type="button"
              className="admin-sidebar-toggle"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={isSidebarCollapsed}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
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

      <section className={mainClassName}>
        <header className="admin-header">
          <div className="admin-header__bar">
            <div className="admin-header__brand">
              <div className="admin-header__brand-mark" aria-hidden="true">
                <span className="admin-header__brand-mark-text">P</span>
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
                      className="admin-profile-menu__item"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      {item.label}
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

        {children}
      </section>
    </main>
  );
}