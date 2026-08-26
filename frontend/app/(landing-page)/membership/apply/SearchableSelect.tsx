"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, X, AlertTriangle } from "lucide-react";
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
    <div className="af-field" style={{ position: "relative" }} ref={containerRef}>
      {label && (
        <label className="af-label">
          <span>{label}</span>
          {required && <span className="af-req">*</span>}
        </label>
      )}

      {/* Select trigger button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`af-input ${error ? "af-input--error" : ""}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
          borderColor: isOpen ? "var(--af-navy, #081734)" : undefined,
          boxShadow: isOpen ? "0 0 0 3.5px rgba(8, 23, 52, 0.12)" : undefined,
        }}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span style={{ color: value ? "var(--af-ink, #081734)" : "#94a3b8", fontSize: "15px", fontWeight: value ? 500 : 400 }}>
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
              style={{ border: "none", background: "none", cursor: "pointer", padding: 2, color: "#64748b" }}
              aria-label="Clear selection"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown
            size={18}
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              color: "#64748b",
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
              marginTop: "6px",
              background: "#ffffff",
              border: "1.5px solid #cbd5e1",
              borderRadius: "8px",
              boxShadow: "0 10px 25px -5px rgba(8, 23, 52, 0.12), 0 8px 10px -6px rgba(8, 23, 52, 0.08)",
              maxHeight: "300px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Search Input bar */}
            <div style={{ padding: "10px 12px", borderBottom: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc" }}>
              <Search size={16} style={{ color: "#64748b", flexShrink: 0 }} />
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
                  background: "transparent",
                  color: "#081734",
                }}
                autoFocus
              />
            </div>

            {/* List options */}
            <div style={{ overflowY: "auto", flex: 1, padding: "6px" }} role="listbox">
              {filteredOptions.length === 0 ? (
                <div style={{ padding: "14px 16px", color: "#64748b", fontSize: "14px", textAlign: "center" }}>
                  No regions found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option === value;
                  return (
                    <div
                      key={option}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      style={{
                        padding: "10px 14px",
                        fontSize: "14.5px",
                        cursor: "pointer",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: isSelected ? "rgba(8, 23, 52, 0.06)" : "transparent",
                        color: isSelected ? "#081734" : "#1e293b",
                        fontWeight: isSelected ? 700 : 500,
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "#f1f5f9";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      <span>{option}</span>
                      {isSelected && <Check size={16} style={{ color: "#081734" }} />}
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
        >
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </motion.span>
      )}
    </div>
  );
}
