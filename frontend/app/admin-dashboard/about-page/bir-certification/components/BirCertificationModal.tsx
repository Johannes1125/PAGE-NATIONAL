"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BirCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  contentPadding?: string;
  scrollable?: boolean;
}

export default function BirCertificationModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  contentPadding = "0px",
  scrollable = false,
}: BirCertificationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Capture active element to restore focus on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    }
    return () => {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen]);

  // Lock body and html scrollbars on open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Trap focus inside modal
  useEffect(() => {
    if (!isOpen || !mounted) return;

    const modalElement = modalRef.current;
    if (!modalElement) return;

    const getFocusableElements = () => {
      return modalElement.querySelectorAll<HTMLElement>(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
      );
    };

    const timer = setTimeout(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }, 100);

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const elements = getFocusableElements();
      if (elements.length === 0) {
        e.preventDefault();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleTabKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleTabKey);
    };
  }, [isOpen, mounted]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="bir-modal-overlay" 
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-subtitle"
            className="bir-modal-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 380 }}
          >
            {/* Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "24px 32px",
              borderBottom: "1px solid var(--r-border-mid)",
              flexShrink: 0,
              background: "var(--r-surface)",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
                <h2 
                  id="modal-title"
                  style={{ 
                    fontSize: "32px", 
                    fontWeight: 700, 
                    color: "var(--p-navy)",
                    margin: 0,
                    lineHeight: "1.2"
                  }}
                >
                  {title}
                </h2>
                {subtitle && (
                  <p id="modal-subtitle" style={{ fontSize: "16px", color: "var(--r-text-muted)", margin: 0 }}>
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="focus-ring"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "none",
                  background: "var(--r-surface-2)",
                  color: "var(--r-text-mid)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{ 
              padding: contentPadding, 
              overflowY: scrollable ? "auto" : "hidden", 
              flex: 1,
              display: "flex",
              flexDirection: "column"
            }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
