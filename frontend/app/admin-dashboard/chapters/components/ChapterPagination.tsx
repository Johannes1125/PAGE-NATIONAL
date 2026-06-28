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

  return (
    <motion.footer
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="chapters-pagination"
      aria-label="Chapter list pagination"
    >
      <div className="chapters-pagination__info">
        <p>
          Showing <strong>{start}</strong>–<strong>{end}</strong> of{" "}
          <strong>{totalItems}</strong> chapters
        </p>
        <p className="chapters-pagination__page-of">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </p>
      </div>

      <div className="chapters-pagination__controls">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="chapters-pagination__btn"
          aria-label="Previous page"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
        ))}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="chapters-pagination__btn"
          aria-label="Next page"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="chapters-pagination__per-page">
        <label htmlFor="rows-per-page-global" className="sr-only">
          Rows per page
        </label>
        <select
          id="rows-per-page-global"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
        <ChevronDown size={18} className="chapters-toolbar__chevron" aria-hidden="true" />
      </div>
    </motion.footer>
  );
}
