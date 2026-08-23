"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

type ChapterPaginationProps = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (count: number) => void;
};

export default function ChapterPagination({
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: ChapterPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  // Compute page numbers to display cleanly
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const pages = getPageNumbers();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="chapters-pagination"
      aria-label="Chapter list pagination"
    >
      <div className="chapters-pagination__info">
        <p className="text-[14px] text-slate-600 font-medium">
          {totalItems === 0 ? "No chapters" : (
            <>
              Showing <strong>{start}</strong>-<strong>{end}</strong> of <strong>{totalItems}</strong> records
              <span className="ml-2 text-slate-400 font-normal">(Page {currentPage} of {totalPages})</span>
            </>
          )}
        </p>
      </div>


      <div className="chapters-pagination__controls">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="chapters-pagination__btn"
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
          <span className="chapters-pagination__nav-label">Prev</span>
        </button>

        {pages.map((page, idx) => {
          if (typeof page === "string") {
            return (
              <span key={`ellipsis-${idx}`} className="chapters-pagination__ellipsis">
                …
              </span>
            );
          }
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`chapters-pagination__btn ${
                currentPage === page ? "chapters-pagination__btn--active" : ""
              }`}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="chapters-pagination__btn"
          aria-label="Next page"
          title="Next page"
        >
          <span className="chapters-pagination__nav-label">Next</span>
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="chapters-pagination__per-page">
        <span aria-hidden="true">Per page:</span>
        <label htmlFor="rows-per-page-global" className="sr-only">
          Rows per page
        </label>
        <div className="chapters-toolbar__select-wrap">
          <select
            id="rows-per-page-global"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            title="Select items per page"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <ChevronDown size={16} strokeWidth={2.5} className="chapters-toolbar__chevron" aria-hidden="true" />
        </div>
      </div>
    </motion.footer>
  );
}

