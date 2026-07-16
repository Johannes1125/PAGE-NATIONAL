"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import layoutStyles from "./components/AdminSidebarLayout.module.css";
import { ADMIN_MOBILE_BREAKPOINT_PX } from "./components/AdminSidebarLayout";
import { AdminLayoutProvider, useAdminLayout } from "./components/AdminLayoutContext";
import AdminTypewriterLoader from "../lib/admin-loader/AdminTypewriterLoader";
import "./admin-dashboard.css"; // Ensure CSS variables are loaded

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function AdminSidebarLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { headerConfig } = useAdminLayout();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);
  const [disableTransition, setDisableTransition] = useState(true);

  const [isAuthVerified, setIsAuthVerified] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("page_user_payload");
    if (!userStr) {
      window.location.href = "/admin-login";
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== "admin") {
        window.location.href = "/admin-login";
        return;
      }
      setIsAuthVerified(true);
    } catch (e) {
      window.location.href = "/admin-login";
    }
  }, [pathname]);

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
    if (hasLoadedConfig) {
      const timer = setTimeout(() => {
        setDisableTransition(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [hasLoadedConfig]);

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
    headerConfig.pageClassName,
    layoutStyles.shell,
    isDesktopCollapsed && layoutStyles.shellCollapsed,
    disableTransition && layoutStyles.noTransition,
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

  if (!isAuthVerified) {
    return <AdminTypewriterLoader label="Verifying admin session..." />;
  }

  return (
    <main className={shellClassName} style={rootStyle}>
      <AdminSidebar
        isCollapsed={isDesktopCollapsed}
        isMobileViewport={isMobileViewport}
        isMobileNavOpen={isMobileNavOpen}
        onCloseMobileNav={closeMobileNav}
      />

      <section
        className={joinClasses(headerConfig.mainClassName, layoutStyles.content)}
        style={{ paddingTop: "var(--admin-header-height)" }}
      >
        <AdminHeader
          isSidebarCollapsed={isSidebarCollapsed}
          isDesktopCollapsed={isDesktopCollapsed}
          isMobileViewport={isMobileViewport}
          isMobileNavOpen={isMobileNavOpen}
          onSidebarToggle={handleSidebarToggle}
          onCloseMobileNav={closeMobileNav}
          title={headerConfig.title}
          subtitle={headerConfig.subtitle}
          eyebrow={headerConfig.eyebrow}
          seniorFriendlyHeader={headerConfig.seniorFriendlyHeader}
          headerActions={headerConfig.headerActions}
          titleIcon={headerConfig.titleIcon}
          premiumHeader={headerConfig.premiumHeader}
        />

        {children}
      </section>
    </main>
  );
}

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayoutProvider>
      <AdminSidebarLayoutShell>{children}</AdminSidebarLayoutShell>
    </AdminLayoutProvider>
  );
}
