"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";
import AdminSidebarLayout from "../../../components/AdminSidebarLayout";
import ChapterWizard from "../../components/ChapterWizard";
import { ChapterFull } from "../../types";
import { chaptersApi } from "../../../../lib/api-client";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import "../../chapters.css";

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

export default function EditChapterPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [chapterData, setChapterData] = useState<ChapterFull | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAdminAuth(router);

  useEffect(() => {
    if (!id) return;

    const fetchChapter = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await chaptersApi.get(id);
        if (res?.success && res.data) {
          setChapterData(res.data as ChapterFull);
        } else {
          setError("Chapter not found.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load chapter data.";
        setError(msg);
        gooeyToast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapter();
  }, [id]);

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
      title={isLoading ? "Loading Chapter…" : chapterData ? `Edit: ${chapterData.title}` : "Chapter Not Found"}
      subtitle="Use the 5-step wizard to update chapter information, officers, and documents."
      seniorFriendlyHeader={true}
      titleIcon={<Building2 size={28} strokeWidth={2.2} aria-hidden="true" />}
      premiumHeader={true}
      headerActions={backButton}
    >
      {isLoading ? (
        <div className="wizard-auth-gate">
          <div className="wizard-spinner" style={{ width: 40, height: 40, borderWidth: 4, borderColor: "rgba(30,58,95,0.2)", borderTopColor: "#1e3a5f" }} />
          <p style={{ fontSize: 20, color: "#64748b" }}>Loading chapter data…</p>
        </div>
      ) : error ? (
        <div className="wizard-auth-gate">
          <p style={{ fontSize: 20, color: "#dc2626" }}>{error}</p>
          <button
            type="button"
            className="wizard-btn wizard-btn--secondary"
            onClick={() => router.push("/admin-dashboard/chapters")}
          >
            ← Back to Chapters
          </button>
        </div>
      ) : chapterData ? (
        <ChapterWizard
          mode="edit"
          chapterId={id}
          initialData={chapterData}
        />
      ) : null}
    </AdminSidebarLayout>
  );
}
