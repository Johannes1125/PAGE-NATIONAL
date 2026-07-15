"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type AdminHeaderConfig = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  seniorFriendlyHeader?: boolean;
  headerActions?: ReactNode;
  titleIcon?: ReactNode;
  premiumHeader?: boolean;
  pageClassName?: string;
  mainClassName?: string;
};

type AdminLayoutContextType = {
  headerConfig: AdminHeaderConfig;
  setHeaderConfig: (config: AdminHeaderConfig) => void;
};

const defaultHeaderConfig: AdminHeaderConfig = {
  title: "Admin Dashboard",
  subtitle: "PAGE National Administration Portal",
  eyebrow: "Admin panel",
  pageClassName: "",
  mainClassName: "",
};

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
  const [headerConfig, setHeaderState] = useState<AdminHeaderConfig>(defaultHeaderConfig);

  const setHeaderConfig = useCallback((config: AdminHeaderConfig) => {
    setHeaderState(config);
  }, []);

  return (
    <AdminLayoutContext.Provider value={{ headerConfig, setHeaderConfig }}>
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error("useAdminLayout must be used within an AdminLayoutProvider");
  }
  return context;
}
