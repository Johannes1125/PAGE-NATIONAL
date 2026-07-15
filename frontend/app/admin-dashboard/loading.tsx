"use client";

import AdminSidebarLayout from "./components/AdminSidebarLayout";
import AdminTypewriterLoader from "../lib/admin-loader/AdminTypewriterLoader";

export default function Loading() {
  return (
    <AdminSidebarLayout
      pageClassName="admin-dashboard-loading"
      mainClassName="admin-main-loading"
      title="Loading..."
      subtitle="Please wait while we prepare the dashboard view."
    >
      <AdminTypewriterLoader label="Loading admin dashboard..." />
    </AdminSidebarLayout>
  );
}
