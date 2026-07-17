"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchableSelectProps {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  error?: string | null;
  required?: boolean;
}

export default function SearchableSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  error,
  required,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="af-field" style={{ marginBottom: "16px", position: "relative" }} ref={containerRef}>
      {label && (
        <label className="af-label" style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", display: "block" }}>
          {label} {required && <span className="af-req" style={{ color: "var(--af-error)" }}>*</span>}
        </label>
      )}

      {/* Select trigger button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`af-input ${error ? "af-input--error" : ""}`}
        style={{
          minHeight: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          cursor: "pointer",
          background: "#fff",
          userSelect: "none",
          border: isOpen ? "1px solid var(--af-navy)" : "1px solid var(--af-border-light)",
        }}
      >
        <span style={{ color: value ? "var(--af-text)" : "var(--af-text-muted)", fontSize: "16px" }}>
          {value || placeholder}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              style={{ border: "none", background: "none", cursor: "pointer", padding: 0, color: "var(--af-text-muted)" }}
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown
            size={18}
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              color: "var(--af-text-muted)",
            }}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 50,
              marginTop: "4px",
              background: "#fff",
              border: "1px solid var(--af-border-light)",
              borderRadius: "8px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              maxHeight: "300px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Search Input bar */}
            <div style={{ padding: "8px", borderBottom: "1px solid var(--af-border-light)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Search size={16} style={{ color: "var(--af-text-muted)" }} />
              <input
                type="text"
                placeholder="Search region..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: "14px",
                  padding: "4px",
                }}
              />
            </div>

            {/* List options */}
            <div style={{ overflowY: "auto", flex: 1, padding: "4px" }}>
              {filteredOptions.length === 0 ? (
                <div style={{ padding: "12px 16px", color: "var(--af-text-muted)", fontSize: "14px", textAlign: "center" }}>
                  No regions found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option === value;
                  return (
                    <div
                      key={option}
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      style={{
                        padding: "10px 16px",
                        fontSize: "15px",
                        cursor: "pointer",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: isSelected ? "var(--af-cream)" : "transparent",
                        color: isSelected ? "var(--af-navy)" : "var(--af-text)",
                        fontWeight: isSelected ? 600 : 400,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "#f3f4f6";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      <span>{option}</span>
                      {isSelected && <Check size={16} style={{ color: "var(--af-navy)" }} />}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="af-error"
          style={{ color: "var(--af-error)", fontSize: "14px", marginTop: "4px", display: "block" }}
        >
          {error}
        </motion.span>
      )}
    </div>
  );
}
