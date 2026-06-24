"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import layoutStyles from "./AdminSidebarLayout.module.css";

export const ADMIN_MOBILE_BREAKPOINT_PX = 980;

type AdminSidebarLayoutProps = {
  pageClassName: string;
  mainClassName: string;
  title: string;
  subtitle: string;
  eyebrow?: string;
  children: ReactNode;
  seniorFriendlyHeader?: boolean;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function AdminSidebarLayout({
  pageClassName,
  mainClassName,
  title,
  subtitle,
  eyebrow = "Admin panel",
  children,
  seniorFriendlyHeader = false,
}: AdminSidebarLayoutProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  useEffect(() => {
    const collapsed = window.localStorage.getItem("admin-sidebar-collapsed") === "true";
    setIsSidebarCollapsed(collapsed);
    setHasLoadedConfig(true);
  }, []);

  useEffect(() => {
    if (hasLoadedConfig) {
      window.localStorage.setItem("admin-sidebar-collapsed", String(isSidebarCollapsed));
    }
  }, [isSidebarCollapsed, hasLoadedConfig]);

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
          seniorFriendlyHeader={seniorFriendlyHeader}
        />

        {children}
      </section>
    </main>
  );
}
