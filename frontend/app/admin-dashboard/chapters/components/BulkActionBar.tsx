"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Globe, EyeOff, Trash2, Download, X } from "lucide-react";

type BulkActionBarProps = {
  selectedCount: number;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  onExport: () => void;
  onCancel: () => void;
};

export default function BulkActionBar({
  selectedCount,
  onPublish,
  onUnpublish,
  onDelete,
  onExport,
  onCancel,
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 48, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 48, x: "-50%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed bottom-6 left-1/2 z-50 bg-[#1e293b] text-white rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 w-[calc(100%-32px)] max-w-[680px] min-h-[64px] select-none"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.25)", borderRadius: "16px" }}
          role="toolbar"
          aria-label="Bulk actions toolbar"
        >
          {/* Selected count info */}
          <div className="flex items-center gap-3 pl-2">
            <div className="min-w-[32px] min-h-[32px] rounded-full bg-blue-600 flex items-center justify-center font-bold text-[16px] text-white">
              {selectedCount}
            </div>
            <span className="text-[18px] font-medium text-white">
              Chapters selected
            </span>
          </div>

          {/* Action buttons list */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full md:w-auto">
            {/* Publish button */}
            <button
              type="button"
              onClick={onPublish}
              className="min-h-[44px] px-4 rounded-lg bg-[#16a34a] hover:bg-green-500 active:scale-95 text-white text-[16px] font-semibold flex items-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Globe size={18} />
              <span>Publish</span>
            </button>

            {/* Unpublish button */}
            <button
              type="button"
              onClick={onUnpublish}
              className="min-h-[44px] px-4 rounded-lg bg-[#d97706] hover:bg-amber-500 active:scale-95 text-white text-[16px] font-semibold flex items-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <EyeOff size={18} />
              <span>Unpublish</span>
            </button>

            {/* Export button */}
            <button
              type="button"
              onClick={onExport}
              className="min-h-[44px] px-4 rounded-lg bg-[#374151] hover:bg-slate-600 active:scale-95 text-white text-[16px] font-semibold flex items-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              <Download size={18} />
              <span>Export</span>
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={onDelete}
              className="min-h-[44px] px-4 rounded-lg bg-[#dc2626] hover:bg-red-500 active:scale-95 text-white text-[16px] font-semibold flex items-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </button>

            {/* Vertical separator */}
            <div className="hidden sm:block border-l border-slate-600 h-6 mx-1" />

            {/* Cancel/Dismiss */}
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[44px] px-4 rounded-lg bg-transparent border border-white hover:bg-white/10 active:scale-95 text-white text-[16px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              aria-label="Cancel selection"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
