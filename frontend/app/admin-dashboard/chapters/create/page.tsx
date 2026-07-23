"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import ChapterWizard from "../components/ChapterWizard";
import "../chapters.css";

/** Reads auth state from localStorage — same pattern as the rest of the admin dashboard. */
function useAdminAuth() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("page_user_token");
    const payloadRaw = localStorage.getItem("page_user_payload");
    if (!token) {
      router.replace("/admin-login");
      return;
    }
    if (payloadRaw) {
      try {
        const payload = JSON.parse(payloadRaw);
        if (payload?.role !== "admin") {
          router.replace("/admin-login");
        }
      } catch {
        router.replace("/admin-login");
      }
    }
  }, [router]);
}

export default function CreateChapterPage() {
  const router = useRouter();
  useAdminAuth();

  const backButton = (
    <button
      type="button"
      className="chapters-btn chapters-btn--secondary"
      onClick={() => router.push("/admin-dashboard/chapters")}
      style={{ minHeight: "44px", fontSize: "15px", fontWeight: 600, padding: "0 20px" }}
    >
      <ArrowLeft size={18} strokeWidth={2.2} aria-hidden="true" />
      <span>Back to Chapters</span>
    </button>
  );

  return (
    <AdminSidebarLayout
      pageClassName="chapters-management-page"
      mainClassName="admin-main-content"
      eyebrow="CHAPTER MANAGEMENT"
      title="Create Chapter"
      subtitle="Use the 5-step wizard to create a new PAGE regional chapter with all required information, officers, and documents."
      seniorFriendlyHeader={true}
      titleIcon={<Building2 size={28} strokeWidth={2.2} aria-hidden="true" />}
      premiumHeader={true}
      headerActions={backButton}
    >
      <ChapterWizard mode="create" />
    </AdminSidebarLayout>
  );
}
