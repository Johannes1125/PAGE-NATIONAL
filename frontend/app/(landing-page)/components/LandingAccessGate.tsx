"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function getRedirectPath(role?: string) {
  if (role === "admin") {
    return "/admin-dashboard";
  }

  if (role === "organization") {
    return "/org-dashboard";
  }

  return "/member-login";
}

export default function LandingAccessGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const payloadStr = localStorage.getItem("page_user_payload");

    if (!payloadStr) {
      return;
    }

    try {
      const payload = JSON.parse(payloadStr);
      router.replace(getRedirectPath(payload?.role));
      return;
    } catch (error) {
      console.error(error);
      localStorage.removeItem("page_user_token");
      localStorage.removeItem("page_user_payload");
    }
  }, [router]);

  return children;
}