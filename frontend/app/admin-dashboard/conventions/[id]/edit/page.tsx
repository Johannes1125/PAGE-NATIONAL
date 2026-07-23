"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Landmark } from "lucide-react";
import { gooeyToast } from "goey-toast";
import { toast } from "react-toastify";
import "goey-toast/styles.css";

import AdminSidebarLayout from "../../../components/AdminSidebarLayout";
import ConventionWizard from "../../components/ConventionWizard";
import "../../components/ConventionWizard.css";
import type { ConventionFull } from "../../types";
import { conventionsApi } from "../../../../lib/api-client";
import "../../conventions.css";

function useAdminAuth(router: ReturnType<typeof useRouter>) {
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

function showError(message: string) {
  try {
    gooeyToast.error(message);
  } catch {
    toast.error(message);
  }
}

export default function EditConventionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [conventionData, setConventionData] = useState<ConventionFull | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAdminAuth(router);

  const headerActionsBlock = (
    <button
      type="button"
      className="conv-btn conv-btn--secondary"
      onClick={() => router.push("/admin-dashboard/conventions")}
      style={{ minHeight: "52px", fontSize: "18px", fontWeight: 600, padding: "0 24px" }}
    >
      <ArrowLeft size={20} strokeWidth={2.5} aria-hidden="true" />
      <span>Back to Conventions</span>
    </button>
  );

  useEffect(() => {
    if (!id) return;

    const fetchConvention = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await conventionsApi.getFull(id);
        if (res?.success && res.data) {
          setConventionData(res.data);
        } else {
          setError("Convention not found.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load convention data.";
        setError(msg);
        showError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConvention();
  }, [id]);

  return (
    <AdminSidebarLayout
      pageClassName="conv-management-page"
      mainClassName="admin-main-content"
      eyebrow="CONVENTION MANAGEMENT"
      title={
        isLoading
          ? "Loading Convention…"
          : conventionData
            ? `Edit: ${conventionData.title}`
            : "Convention Not Found"
      }
      subtitle="Update convention information, program schedule, speakers, and attachments using the wizard."
      seniorFriendlyHeader={true}
      headerActions={headerActionsBlock}
      titleIcon={<Landmark size={28} strokeWidth={2.2} aria-hidden="true" />}
      premiumHeader={true}
    >
      {isLoading ? (
        <div className="wizard-auth-gate">
          <div
            className="wizard-spinner"
            style={{
              width: 40,
              height: 40,
              borderWidth: 4,
              borderColor: "rgba(30,58,95,0.2)",
              borderTopColor: "#1e3a5f",
            }}
          />
          <p style={{ fontSize: 20, color: "#64748b" }}>Loading convention data…</p>
        </div>
      ) : error ? (
        <div className="wizard-auth-gate">
          <p style={{ fontSize: 20, color: "#dc2626" }}>{error}</p>
          <button
            type="button"
            className="wizard-btn wizard-btn--secondary"
            onClick={() => router.push("/admin-dashboard/conventions")}
          >
            Back to Conventions
          </button>
        </div>
      ) : conventionData ? (
        <ConventionWizard
          mode="edit"
          conventionId={id}
          initialData={conventionData}
        />
      ) : null}
    </AdminSidebarLayout>
  );
}
