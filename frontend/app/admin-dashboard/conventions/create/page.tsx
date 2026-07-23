"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Landmark } from "lucide-react";
import AdminSidebarLayout from "../../components/AdminSidebarLayout";
import ConventionWizard from "../components/ConventionWizard";
import "../conventions.css";
import "goey-toast/styles.css";

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

export default function CreateConventionPage() {
  const router = useRouter();
  useAdminAuth();

  const backButton = (
    <button
      type="button"
      className="conv-btn conv-btn--secondary"
      onClick={() => router.push("/admin-dashboard/conventions")}
      style={{ minHeight: "44px", fontSize: "15px", fontWeight: 600, padding: "0 20px" }}
    >
      <ArrowLeft size={18} strokeWidth={2.2} aria-hidden="true" />
      <span>Back to Conventions</span>
    </button>
  );

  return (
    <AdminSidebarLayout
      pageClassName="conv-management-page"
      mainClassName="admin-main-content"
      eyebrow="CONVENTION MANAGEMENT"
      title="Create New Convention"
      subtitle="Use the 4-step wizard to set up convention information, program schedule, speakers, and review before publishing."
      seniorFriendlyHeader={true}
      titleIcon={<Landmark size={28} strokeWidth={2.2} aria-hidden="true" />}
      premiumHeader={true}
      headerActions={backButton}
    >
      <ConventionWizard mode="create" />
    </AdminSidebarLayout>
  );
}
