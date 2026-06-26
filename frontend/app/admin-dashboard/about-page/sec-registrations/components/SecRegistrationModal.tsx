"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface SecRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function SecRegistrationModal({
  isOpen,
  onClose,
  title,
  children,
}: SecRegistrationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(20, 49, 82, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "24px",
      }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        style={{
          background: "var(--r-surface)",
          border: "1px solid var(--r-border)",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-xl)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          animation: "modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 32px",
          borderBottom: "1px solid var(--r-border-mid)",
        }}>
          <h2 
            id="modal-title"
            style={{ 
              fontSize: "24px", 
              fontWeight: 700, 
              color: "var(--p-navy)",
              margin: 0
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="focus-ring"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: "none",
              background: "var(--r-surface-2)",
              color: "var(--r-text-mid)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "32px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
