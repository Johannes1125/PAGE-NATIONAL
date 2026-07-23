"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Loader2 } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers array to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (safeTotalPages <= maxVisible + 2) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(safeTotalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= safeTotalPages - 2) {
        start = safeTotalPages - 3;
        end = safeTotalPages - 1;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < safeTotalPages - 1) {
        pages.push("...");
      }

      pages.push(safeTotalPages);
    }

    return pages;
  };

  const handlePrev = () => {
    if (currentPage > 1 && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < safeTotalPages && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        background: "var(--r-surface)",
        border: "1px solid var(--r-border)",
        borderRadius: "12px",
        marginTop: "20px",
        flexWrap: "wrap",
        gap: "16px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Information text */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {isLoading && (
          <Loader2
            className="animate-spin"
            size={18}
            style={{ color: "var(--p-blue)" }}
          />
        )}
        <span
          style={{
            fontSize: "15px",
            color: "var(--r-text-mid)",
            fontWeight: 500,
            fontFamily: "var(--font-body)",
          }}
        >
          Showing <strong style={{ color: "var(--p-navy)" }}>{startItem}</strong>–
          <strong style={{ color: "var(--p-navy)" }}>{endItem}</strong> of{" "}
          <strong style={{ color: "var(--p-navy)" }}>{totalItems}</strong> records
          (Page <strong style={{ color: "var(--p-navy)" }}>{currentPage}</strong> of{" "}
          <strong style={{ color: "var(--p-navy)" }}>{safeTotalPages}</strong>)
        </span>
      </div>

      {/* Pagination buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1 || isLoading}
          style={{
            height: "38px",
            padding: "0 12px",
            borderRadius: "8px",
            border: "1px solid var(--r-border-mid)",
            background: currentPage <= 1 || isLoading ? "var(--r-surface-2)" : "var(--r-surface)",
            color: currentPage <= 1 || isLoading ? "var(--r-text-muted)" : "var(--r-text)",
            cursor: currentPage <= 1 || isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 0.15s ease",
          }}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: "0 8px",
                  color: "var(--r-text-muted)",
                  fontSize: "14px",
                  userSelect: "none",
                }}
              >
                ...
              </span>
            );
          }

          const isCurrent = p === currentPage;

          return (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => !isLoading && onPageChange(Number(p))}
              disabled={isLoading}
              style={{
                minWidth: "36px",
                height: "38px",
                padding: "0 10px",
                borderRadius: "8px",
                border: isCurrent
                  ? "1px solid var(--p-navy)"
                  : "1px solid var(--r-border-mid)",
                background: isCurrent ? "var(--p-navy)" : "var(--r-surface)",
                color: isCurrent ? "#ffffff" : "var(--r-text)",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: isCurrent ? 700 : 600,
                transition: "all 0.15s ease",
              }}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= safeTotalPages || isLoading}
          style={{
            height: "38px",
            padding: "0 12px",
            borderRadius: "8px",
            border: "1px solid var(--r-border-mid)",
            background: currentPage >= safeTotalPages || isLoading ? "var(--r-surface-2)" : "var(--r-surface)",
            color: currentPage >= safeTotalPages || isLoading ? "var(--r-text-muted)" : "var(--r-text)",
            cursor: currentPage >= safeTotalPages || isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 0.15s ease",
          }}
          aria-label="Next Page"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Items per page selector */}
      {onItemsPerPageChange && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label
            htmlFor="pagination-limit-select"
            style={{ fontSize: "14px", color: "var(--r-text-mid)", fontWeight: 500 }}
          >
            Per page:
          </label>
          <div style={{ position: "relative", display: "inline-block" }}>
            <select
              id="pagination-limit-select"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              disabled={isLoading}
              style={{
                height: "36px",
                padding: "0 28px 0 10px",
                borderRadius: "8px",
                border: "1px solid var(--r-border-mid)",
                background: "var(--r-surface)",
                color: "var(--r-text)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                appearance: "none",
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--r-text-muted)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
