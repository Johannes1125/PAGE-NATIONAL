"use client";

import { useEffect, type ReactNode } from "react";
import { useAdminLayout } from "./AdminLayoutContext";

export const ADMIN_MOBILE_BREAKPOINT_PX = 980;

type AdminSidebarLayoutProps = {
  pageClassName: string;
  mainClassName: string;
  title: string;
  subtitle: string;
  eyebrow?: string;
  children: ReactNode;
  seniorFriendlyHeader?: boolean;
  headerActions?: ReactNode;
  titleIcon?: ReactNode;
  premiumHeader?: boolean;
};

export default function AdminSidebarLayout({
  pageClassName,
  mainClassName,
  title,
  subtitle,
  eyebrow = "Admin panel",
  children,
  seniorFriendlyHeader = false,
  headerActions,
  titleIcon,
  premiumHeader = false,
}: AdminSidebarLayoutProps) {
  const { setHeaderConfig } = useAdminLayout();

  useEffect(() => {
    setHeaderConfig({
      title,
      subtitle,
      eyebrow,
      seniorFriendlyHeader,
      headerActions,
      titleIcon,
      premiumHeader,
      pageClassName,
      mainClassName,
    });
  }, [
    title,
    subtitle,
    eyebrow,
    seniorFriendlyHeader,
    headerActions,
    titleIcon,
    premiumHeader,
    pageClassName,
    mainClassName,
    setHeaderConfig,
  ]);

  return <>{children}</>;
}
