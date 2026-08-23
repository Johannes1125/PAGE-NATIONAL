"use client";

import { useEffect, useState, useRef } from "react";
import { X, Users, Search, UserCheck, Shield } from "lucide-react";
import { Chapter } from "../types";
import { getOfficerAvatar } from "./OfficerPreview";

type OfficerModalProps = {
  open: boolean;
  chapter: Chapter | null;
  onClose: () => void;
};

export default function OfficerModal({ open, chapter, onClose }: OfficerModalProps) {
  const [search, setSearch] = useState("");
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      closeBtnRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !chapter) return null;

  const officers = chapter.officers || [];
  const filteredOfficers = officers.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      o.role.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="officers-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="officer-modal-backdrop" /* 🆕 added, no existing className was here */
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(14, 35, 64, 0.5)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* 🆕 mobile-only overrides — kept separate from your inline styles, uses !important since class rules can't beat inline style specificity otherwise */}
      <style>{`
        @media (max-width: 640px) {
          .officer-modal-backdrop {
            align-items: flex-end !important;
            padding: 0 !important;
          }
          .officer-modal-panel {
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 20px 20px 0 0 !important;
            max-height: 88dvh !important;
          }
          .officer-modal-header {
            padding: 16px !important;
            flex-wrap: wrap !important;
            row-gap: 10px !important;
          }
          .officer-modal-icon-box {
            width: 40px !important;
            height: 40px !important;
            border-radius: 12px !important;
          }
          .officer-modal-eyebrow {
            font-size: 10.5px !important;
          }
          .officer-modal-title {
            font-size: 16px !important;
          }
          .officer-modal-meta {
            font-size: 12px !important;
          }
          .officer-modal-count-badge {
            font-size: 12px !important;
            padding: 4px 10px !important;
          }
          .officer-modal-search-wrap {
            padding: 12px 16px !important;
          }
          .officer-modal-search-input {
            height: 40px !important;
            font-size: 16px !important; /* prevents iOS auto-zoom on focus */
          }
          .officer-modal-body {
            padding: 16px !important;
            gap: 8px !important;
          }
          .officer-modal-row {
            padding: 12px !important;
            flex-wrap: wrap !important;
          }
          .officer-modal-avatar {
            width: 36px !important;
            height: 36px !important;
          }
          .officer-modal-term {
            margin-left: 48px !important;
          }
          .officer-modal-footer {
            padding: 12px 16px !important;
          }
          .officer-modal-close-btn {
            padding: 0 16px !important;
            height: 38px !important;
            font-size: 13px !important;
          }
        }
      `}</style>

      <div
        className="officer-modal-panel" /* 🆕 added, no existing className was here */
        style={{
          background: "#ffffff",
          border: "1.5px solid #e2e8f0",
          borderRadius: "20px",
          boxShadow: "0 24px 64px -12px rgba(15, 23, 42, 0.24), 0 8px 20px -6px rgba(15, 23, 42, 0.12)",
          width: "100%",
          maxWidth: "560px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="officer-modal-header" /* 🆕 added */
          style={{
            padding: "24px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            flexShrink: 0,
          }}
        >
          <div className="flex items-start gap-3.5 min-w-0">
            <div
              className="officer-modal-icon-box flex items-center justify-center flex-shrink-0" /* 🆕 added officer-modal-icon-box */
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "#eff6ff",
                border: "1.5px solid #bfdbfe",
                color: "var(--p-blue, #1e538e)",
                boxShadow: "0 2px 8px rgba(30, 83, 142, 0.12)",
              }}
            >
              <Users size={22} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <span
                className="officer-modal-eyebrow" /* 🆕 added */
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--p-blue, #1e538e)",
                  marginBottom: "4px",
                }}
              >
                Officer Registry
              </span>
              <h2
                id="officers-modal-title"
                className="officer-modal-title text-[18px] font-bold text-slate-900 leading-snug truncate" /* 🆕 added officer-modal-title */
              >
                {chapter.name}
              </h2>
              <div className="officer-modal-meta flex items-center gap-2 mt-1 text-[13px] text-slate-500 font-medium truncate"> {/* 🆕 added officer-modal-meta */}
                <span>{chapter.region} ({chapter.islandGroup})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span
              className="officer-modal-count-badge" /* 🆕 added */
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 14px",
                borderRadius: "999px",
                background: "#eff6ff",
                color: "var(--p-blue, #1e538e)",
                border: "1.5px solid #bfdbfe",
                fontSize: "13px",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {officers.length} {officers.length === 1 ? "Officer" : "Officers"}
            </span>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Search Bar (if officers exist) */}
        {officers.length > 0 && (
          <div className="officer-modal-search-wrap" style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", background: "#ffffff", flexShrink: 0 }}> {/* 🆕 added officer-modal-search-wrap */}
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                strokeWidth={2.2}
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }}
              />
              <input
                type="text"
                placeholder="Search officer by name or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="officer-modal-search-input" /* 🆕 added */
                style={{
                  width: "100%",
                  height: "42px",
                  paddingLeft: "40px",
                  paddingRight: "16px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  fontSize: "14px",
                  color: "#1e293b",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--p-blue, #1e538e)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30, 83, 142, 0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>
        )}

        {/* Modal Body: Officers List */}
        <div
          className="officer-modal-body" /* 🆕 added */
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "#ffffff",
            minHeight: 0, /* 🆕 changed from "200px" to 0 — required for the scroll to actually work; a flex child needs min-height:0 to shrink and scroll instead of forcing the modal to grow */
            WebkitOverflowScrolling: "touch", /* 🆕 added — momentum scroll on iOS */
            overscrollBehavior: "contain", /* 🆕 added — stops scroll from leaking to the page behind the modal */
          }}
        >
          {officers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                <Users size={24} />
              </div>
              <p className="font-bold text-[15px] text-slate-700">No Officers Assigned</p>
              <p className="text-[13px] text-slate-500 mt-1.5 max-w-[280px]">
                This chapter currently has no registered officers.
              </p>
            </div>
          ) : filteredOfficers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                <Search size={22} />
              </div>
              <p className="font-bold text-[14px] text-slate-700">No officers matching &quot;{search}&quot;</p>
            </div>
          ) : (
            filteredOfficers.map((officer) => (
              <div
                key={officer.id}
                className="officer-modal-row rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-200 transition-all flex items-center justify-between gap-4 group" /* 🆕 added officer-modal-row */
                style={{ padding: "14px 16px" }}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={officer.avatarUrl || "/images/officer-placeholder.png"}
                    alt={officer.name}
                    className="officer-modal-avatar rounded-full border-2 border-white object-cover bg-white shrink-0" /* 🆕 added officer-modal-avatar */
                    style={{ width: "44px", height: "44px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-[15px] text-slate-900 truncate leading-snug">
                      {officer.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[12.5px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 inline-flex items-center gap-1.5">
                        <Shield size={12} strokeWidth={2} />
                        {officer.role}
                      </span>
                    </div>
                  </div>
                </div>

                {officer.term && (
                  <div className="officer-modal-term flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shrink-0"> {/* 🆕 added officer-modal-term */}
                    <UserCheck size={14} className="text-emerald-600" />
                    <span>Term: {officer.term}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="officer-modal-footer" /* 🆕 added */
          style={{
            padding: "16px 24px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexShrink: 0,
          }}
        >
          <span className="text-[13px] text-slate-500 font-medium">
            {officers.length > 0 && search.trim()
              ? `Showing ${filteredOfficers.length} of ${officers.length}`
              : ""}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="officer-modal-close-btn" /* 🆕 added */
            style={{
              padding: "0 22px",
              height: "42px",
              borderRadius: "10px",
              background: "var(--p-blue, #1e538e)",
              color: "#ffffff",
              border: "1.5px solid var(--p-blue, #1e538e)",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--p-navy, #143152)";
              e.currentTarget.style.borderColor = "var(--p-navy, #143152)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--p-blue, #1e538e)";
              e.currentTarget.style.borderColor = "var(--p-blue, #1e538e)";
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}