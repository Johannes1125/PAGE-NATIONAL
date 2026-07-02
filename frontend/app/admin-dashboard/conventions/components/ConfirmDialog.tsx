"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when opened
  useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
    }
  }, [open]);

  // Handle Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="conv-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="conv-modal conv-confirm">
        <div className="conv-confirm__icon">
          <AlertTriangle size={28} strokeWidth={2} />
        </div>

        <h2 id="confirm-dialog-title" className="conv-confirm__title">
          {title}
        </h2>

        <p className="conv-confirm__message">{message}</p>

        <div className="conv-confirm__actions">
          <button
            ref={cancelRef}
            type="button"
            className="conv-btn conv-btn--secondary"
            onClick={onCancel}
            style={{ minHeight: "48px", padding: "0 28px" }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="conv-btn conv-btn--danger"
            onClick={onConfirm}
            style={{ minHeight: "48px", padding: "0 28px" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
