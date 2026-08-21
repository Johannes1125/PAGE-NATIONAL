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
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(71, 85, 105, 0.48)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
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
        <div style={{ padding: "20px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexShrink: 0 }}>
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 flex-shrink-0 shadow-xs">
              <Users size={22} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h2 id="officers-modal-title" className="text-[18px] font-bold text-slate-900 leading-snug truncate">
                Officer Registry
              </h2>
              <div className="flex items-center gap-2 mt-0.5 text-[13px] text-slate-500 font-medium truncate">
                <span className="font-semibold text-slate-700">{chapter.name}</span>
                <span>•</span>
                <span>{chapter.region} ({chapter.islandGroup})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[13px] font-bold">
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
          <div style={{ padding: "12px 24px", borderBottom: "1px solid #f1f5f9", background: "#ffffff", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search size={16} strokeWidth={2.2} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Search officer by name or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  height: "38px",
                  paddingLeft: "36px",
                  paddingRight: "16px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontSize: "13.5px",
                  color: "#1e293b",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        )}

        {/* Modal Body: Officers List */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "10px", background: "#ffffff", minHeight: "200px" }}>
          {officers.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center justify-center text-slate-500">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <Users size={24} />
              </div>
              <p className="font-semibold text-[15px] text-slate-700">No Officers Assigned</p>
              <p className="text-[13px] text-slate-500 mt-1">This chapter currently has no registered officers.</p>
            </div>
          ) : filteredOfficers.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="font-semibold text-[14px]">No officers matching &quot;{search}&quot;</p>
            </div>
          ) : (
            filteredOfficers.map((officer) => (
              <div
                key={officer.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-200 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={getOfficerAvatar(officer.name)}
                    alt={officer.name}
                    className="w-11 h-11 rounded-full border border-slate-200 object-cover bg-white shadow-xs shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-[15px] text-slate-900 truncate leading-snug">
                      {officer.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[13px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100 inline-flex items-center gap-1">
                        <Shield size={12} strokeWidth={2} />
                        {officer.role}
                      </span>
                    </div>
                  </div>
                </div>

                {officer.term && (
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 shrink-0">
                    <UserCheck size={14} className="text-emerald-600" />
                    <span>Term: {officer.term}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: "14px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "flex-end", flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-[14px] font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
