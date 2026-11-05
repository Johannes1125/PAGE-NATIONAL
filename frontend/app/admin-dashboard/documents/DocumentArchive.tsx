"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  LockKeyhole,
  MoreHorizontal,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import {
  getDocumentLibraryState,
  restoreDefaultArchiveDocuments,
  saveArchivedDocumentIds,
  type DocumentLibraryState,
  type PublishedLibraryDocument,
} from "./document-library-state";
import { documents as libraryDocuments } from "./DocumentLibrary";
import styles from "./DocumentArchive.module.css";

type DocumentType = PublishedLibraryDocument["type"];
type ArchiveRecord = PublishedLibraryDocument & {
  archivedBy: string;
  archivedAt: string;
  isInitialRecord?: boolean;
};

const initialArchiveRecords: ArchiveRecord[] = [
  {
    id: "archive-journal-applied-sciences",
    title: "Journal of Applied Sciences, Vol. 12",
    author: "Science Research Association",
    size: "4.6 MB",
    pages: 94,
    type: "Journal",
    year: "2026",
    uploaded: "Oct 25, 2026",
    uploadedIso: "2026-10-25",
    archivedBy: "Alex Morgan",
    archivedAt: "Oct 25, 2026",
    isInitialRecord: true,
  },
  {
    id: "archive-remote-learning",
    title: "Remote Learning: A Longitudinal Study",
    author: "Dr. Sarah Mitchell",
    size: "2.4 MB",
    pages: 36,
    type: "Research paper",
    year: "2026",
    uploaded: "Oct 24, 2026",
    uploadedIso: "2026-10-24",
    archivedBy: "Alex Morgan",
    archivedAt: "Oct 24, 2026",
    isInitialRecord: true,
  },
  {
    id: "archive-economic-review",
    title: "Annual Economic Review 2024",
    author: "Centre for Economic Research",
    size: "7.2 MB",
    pages: 128,
    type: "Report",
    year: "2024",
    uploaded: "Oct 22, 2026",
    uploadedIso: "2026-10-22",
    archivedBy: "Alex Morgan",
    archivedAt: "Oct 22, 2026",
    isInitialRecord: true,
  },
  {
    id: "archive-biodiversity",
    title: "Biodiversity & Habitat Conservation",
    author: "L. Garcia et al.",
    size: "3.8 MB",
    pages: 74,
    type: "Research paper",
    year: "2026",
    uploaded: "Oct 20, 2026",
    uploadedIso: "2026-10-20",
    archivedBy: "Alex Morgan",
    archivedAt: "Oct 20, 2026",
    isInitialRecord: true,
  },
  {
    id: "archive-social-policy",
    title: "Journal of Social Policy, Vol. 8",
    author: "Policy Studies Institute",
    size: "5.3 MB",
    pages: 102,
    type: "Journal",
    year: "2026",
    uploaded: "Oct 18, 2026",
    uploadedIso: "2026-10-18",
    archivedBy: "Alex Morgan",
    archivedAt: "Oct 18, 2026",
    isInitialRecord: true,
  },
  {
    id: "archive-hci-proceedings",
    title: "Human-Computer Interaction Proceedings",
    author: "International HCI Forum",
    size: "8.1 MB",
    pages: 164,
    type: "Conference paper",
    year: "2026",
    uploaded: "Oct 15, 2026",
    uploadedIso: "2026-10-15",
    archivedBy: "Alex Morgan",
    archivedAt: "Oct 15, 2026",
    isInitialRecord: true,
  },
];

const publicationTypes: DocumentType[] = [
  "Journal",
  "Research paper",
  "Report",
  "Conference paper",
];

const archiveHeaderAction = (
  <Link href="/admin-dashboard/documents/library" className={styles.backButton}>
    <ChevronLeft size={16} aria-hidden="true" />
    Back to library
  </Link>
);

function initialState(): DocumentLibraryState {
  return {
    archivedIds: [],
    archivedCountDelta: 0,
    libraryCountDelta: 0,
    publishedDocuments: [],
    restoredArchiveIds: [],
    libraryCount: 128,
    archiveCount: 24,
  };
}

export default function DocumentArchive() {
  const [libraryState, setLibraryState] = useState(initialState);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<DocumentType | "all">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [restoreDialogIds, setRestoreDialogIds] = useState<string[] | null>(null);
  const [restoreDialogCount, setRestoreDialogCount] = useState(0);
  const [detailsRecord, setDetailsRecord] = useState<ArchiveRecord | null>(null);
  const [page, setPage] = useState(1);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const selectionCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLibraryState(getDocumentLibraryState());
    const syncState = () => setLibraryState(getDocumentLibraryState());
    window.addEventListener("storage", syncState);
    window.addEventListener("page-admin-document-library-state-change", syncState);
    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener("page-admin-document-library-state-change", syncState);
    };
  }, []);

  const archiveRecords = useMemo<ArchiveRecord[]>(() => {
    const restoredIds = new Set(libraryState.restoredArchiveIds);
    const initialRecords = initialArchiveRecords.filter((record) => !restoredIds.has(record.id));
    const dynamicallyArchived = [...libraryState.publishedDocuments, ...libraryDocuments]
      .filter((document) => libraryState.archivedIds.includes(document.id))
      .map((document) => ({
        ...document,
        archivedBy: document.archivedBy || "Alex Morgan",
        archivedAt: document.archivedAt || document.uploaded,
      }));
    return [...initialRecords, ...dynamicallyArchived];
  }, [
    libraryState.archivedIds,
    libraryState.publishedDocuments,
    libraryState.restoredArchiveIds,
  ]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return archiveRecords.filter((record) => {
      const matchesSearch =
        !normalizedSearch ||
        `${record.title} ${record.author} ${record.archivedBy} ${record.type}`
          .toLocaleLowerCase()
          .includes(normalizedSearch);
      const matchesType = selectedType === "all" || record.type === selectedType;
      const matchesDate = !dateFilter || record.uploadedIso === dateFilter;
      return matchesSearch && matchesType && matchesDate;
    });
  }, [archiveRecords, dateFilter, search, selectedType]);

  const isSelected = (id: string) =>
    isAllSelected ? !excludedIds.includes(id) : selectedIds.includes(id);
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(libraryState.archiveCount / pageSize));
  const currentPageRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);
  const selectedVisibleIds = currentPageRecords
    .filter((record) => isSelected(record.id))
    .map((record) => record.id);
  const allVisibleSelected =
    currentPageRecords.length > 0 && selectedVisibleIds.length === currentPageRecords.length;

  useEffect(() => {
    const isIndeterminate = selectedVisibleIds.length > 0 && !allVisibleSelected;
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
    if (selectionCheckboxRef.current) {
      selectionCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [allVisibleSelected, selectedVisibleIds.length]);

  const selectedCount = isAllSelected
    ? Math.max(0, libraryState.archiveCount - excludedIds.length)
    : selectedIds.length;
  const selectedRecordIds = isAllSelected
    ? archiveRecords
        .filter((record) => !excludedIds.includes(record.id))
        .map((record) => record.id)
    : selectedIds;

  const toggleVisibleSelection = () => {
    const visibleIds = currentPageRecords.map((record) => record.id);
    if (isAllSelected) {
      setExcludedIds((current) =>
        allVisibleSelected
          ? [...new Set([...current, ...visibleIds])]
          : current.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  };

  const confirmRestore = () => {
    if (!restoreDialogIds?.length) {
      return;
    }

    const selected = archiveRecords.filter((record) => restoreDialogIds.includes(record.id));
    const initialRecords = selected.filter((record) => record.isInitialRecord);
    const dynamicIds = selected
      .filter((record) => !record.isInitialRecord)
      .map((record) => record.id);

    let nextState = libraryState;
    if (dynamicIds.length > 0) {
      nextState = saveArchivedDocumentIds(
        nextState.archivedIds.filter((id) => !dynamicIds.includes(id)),
      );
    }
    if (initialRecords.length > 0) {
      nextState = restoreDefaultArchiveDocuments(initialRecords);
    }
    const additionalCount = Math.max(
      0,
      restoreDialogCount - dynamicIds.length - initialRecords.length,
    );
    if (additionalCount > 0) {
      nextState = restoreDefaultArchiveDocuments([], additionalCount);
    }

    setLibraryState(nextState);
    setSelectedIds((current) => current.filter((id) => !restoreDialogIds.includes(id)));
    setIsAllSelected(false);
    setExcludedIds([]);
    setRestoreDialogIds(null);
    setRestoreDialogCount(0);
    setPage(1);
    gooeyToast.success(
      `${restoreDialogCount} ${restoreDialogCount === 1 ? "document" : "documents"} restored to the library.`,
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedType("all");
    setDateFilter("");
    setPage(1);
  };

  const displayedStart = currentPageRecords.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const displayedEnd = currentPageRecords.length === 0
    ? 0
    : Math.min(displayedStart + currentPageRecords.length - 1, libraryState.archiveCount);

  return (
    <AdminSidebarLayout
      pageClassName=""
      mainClassName=""
      title="Archive"
      subtitle="Review archived publications and restore them to the document library."
      eyebrow="Content"
      headerActions={archiveHeaderAction}
      centerHeaderActions
    >
      <main className={`admin-shell admin-shell--main ${styles.page}`}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <span>Content</span>
          <span aria-hidden="true">&gt;</span>
          <Link href="/admin-dashboard/documents/library">Documents</Link>
          <span aria-hidden="true">&gt;</span>
          <span aria-current="page">Archive</span>
        </nav>

        <section className={styles.summaryCard} aria-label="Archive summary">
          <div className={styles.summaryLeft}>
            <span className={styles.summaryIcon} aria-hidden="true">
              <Archive size={21} />
            </span>
            <div>
              <strong className={styles.summaryCount}>{libraryState.archiveCount} documents</strong>
              <span className={styles.summaryMuted}>Stored securely in your archive</span>
            </div>
          </div>
          <div className={styles.summaryRight}>
            <strong>Not visible to readers</strong>
            <span>Original files and metadata are retained. Nothing is permanently deleted.</span>
          </div>
        </section>

        <aside className={styles.infoBanner}>
          <span className={styles.infoIcon} aria-hidden="true">
            <LockKeyhole size={17} />
          </span>
          <div>
            <h2>Restore without changing reader permissions</h2>
            <p>
              Restored documents return to the library as view only. Download, print and edit
              permissions remain disabled.
            </p>
          </div>
        </aside>

        <section className={styles.archiveCard} aria-label="Archived documents">
          <div className={styles.toolbar}>
            <label className={styles.searchBox}>
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search archived documents..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </label>

            <div className={styles.toolbarActions}>
              <div className={styles.popoverWrap}>
                <button
                  type="button"
                  className={styles.filterButton}
                  aria-expanded={typeMenuOpen}
                  onClick={() => setTypeMenuOpen((open) => !open)}
                >
                  {selectedType === "all" ? "All types" : selectedType}
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
                {typeMenuOpen ? (
                  <div className={styles.popover} role="group" aria-label="Filter by type">
                    {(["all", ...publicationTypes] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => {
                          setSelectedType(type);
                          setTypeMenuOpen(false);
                          setPage(1);
                        }}
                      >
                        {type === "all" ? "All types" : type}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className={styles.popoverWrap}>
                <button
                  type="button"
                  className={styles.filterButton}
                  aria-expanded={dateMenuOpen}
                  onClick={() => setDateMenuOpen((open) => !open)}
                >
                  <CalendarDays size={14} aria-hidden="true" />
                  {dateFilter
                    ? new Date(`${dateFilter}T00:00:00`).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Date archived"}
                </button>
                {dateMenuOpen ? (
                  <div className={styles.popover} role="group" aria-label="Filter by date archived">
                    <label htmlFor="archive-date-filter">Archived on</label>
                    <input
                      id="archive-date-filter"
                      type="date"
                      value={dateFilter}
                      onChange={(event) => {
                        setDateFilter(event.target.value);
                        setPage(1);
                      }}
                    />
                    {dateFilter ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDateFilter("");
                          setDateMenuOpen(false);
                          setPage(1);
                        }}
                      >
                        Clear date
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                className={styles.filterButton}
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen((open) => !open)}
              >
                <SlidersHorizontal size={14} aria-hidden="true" />
                Filters
              </button>
            </div>
          </div>

          {filtersOpen ? (
            <div className={styles.filterSummary}>
              <span>
                {selectedType === "all" ? "All publication types" : selectedType}
                {dateFilter
                  ? ` · Archived ${new Date(`${dateFilter}T00:00:00`).toLocaleDateString("en-US")}`
                  : ""}
              </span>
              <button type="button" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : null}

          {selectedCount > 0 ? (
            <div className={styles.selectionBar}>
              <div className={styles.selectionSummary}>
                <input
                  ref={selectionCheckboxRef}
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleVisibleSelection}
                  aria-label="Select visible archived documents"
                />
                <strong>{selectedCount} documents selected</strong>
                <button
                  type="button"
                  onClick={() => {
                    setIsAllSelected(true);
                    setSelectedIds([]);
                    setExcludedIds([]);
                  }}
                >
                  Select all {libraryState.archiveCount}
                </button>
              </div>
              <div className={styles.selectionActions}>
                <button
                  type="button"
                  className={styles.clearSelection}
                  onClick={() => {
                    setSelectedIds([]);
                    setIsAllSelected(false);
                    setExcludedIds([]);
                  }}
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  className={styles.restoreSelected}
                  onClick={() => {
                    setRestoreDialogIds(selectedRecordIds);
                    setRestoreDialogCount(selectedCount);
                  }}
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  Restore selected ({selectedCount})
                </button>
              </div>
            </div>
          ) : null}

          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.checkboxColumn}>
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleVisibleSelection}
                      aria-label="Select all visible archived documents"
                    />
                  </th>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Archived by</th>
                  <th>Date archived</th>
                  <th className={styles.actionColumn}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentPageRecords.map((record) => (
                  <tr
                    key={record.id}
                    className={isSelected(record.id) ? styles.selectedRow : undefined}
                  >
                    <td className={styles.checkboxColumn}>
                      <input
                        type="checkbox"
                        checked={isSelected(record.id)}
                        onChange={(event) =>
                          isAllSelected
                            ? setExcludedIds((current) =>
                                event.target.checked
                                  ? current.filter((id) => id !== record.id)
                                  : [...new Set([...current, record.id])],
                              )
                            : setSelectedIds((current) =>
                                event.target.checked
                                  ? [...new Set([...current, record.id])]
                                  : current.filter((id) => id !== record.id),
                              )
                        }
                        aria-label={`Select ${record.title}`}
                      />
                    </td>
                    <td>
                      <div className={styles.documentCell}>
                        <span className={styles.pdfIcon} aria-hidden="true">
                          <FileText size={17} />
                          <small>PDF</small>
                        </span>
                        <span className={styles.documentDescription}>
                          <strong>{record.title}</strong>
                          <span>
                            {record.author} · {record.size}
                            {record.pages ? ` · ${record.pages} pages` : ""}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td><span className={styles.typeBadge}>{record.type}</span></td>
                    <td className={styles.archivedBy}>{record.archivedBy}</td>
                    <td className={styles.archivedDate}>{record.archivedAt}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.restoreIconButton}
                          title="Restore to library"
                          aria-label={`Restore ${record.title} to library`}
                          onClick={() => {
                            setRestoreDialogIds([record.id]);
                            setRestoreDialogCount(1);
                          }}
                        >
                          <RotateCcw size={16} />
                        </button>
                        <div className={styles.popoverWrap}>
                          <button
                            type="button"
                            className={styles.moreButton}
                            aria-label={`More actions for ${record.title}`}
                            aria-expanded={actionMenuId === record.id}
                            onClick={() =>
                              setActionMenuId((current) => current === record.id ? null : record.id)
                            }
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          {actionMenuId === record.id ? (
                            <div className={styles.actionMenu} role="menu">
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setDetailsRecord(record);
                                  setActionMenuId(null);
                                }}
                              >
                                View details
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setRestoreDialogIds([record.id]);
                                  setRestoreDialogCount(1);
                                  setActionMenuId(null);
                                }}
                              >
                                Restore to library
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentPageRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
                      No archived documents match these filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <footer className={styles.tableFooter}>
            <span>
              Showing {displayedStart}-{displayedEnd} of {libraryState.archiveCount} documents
            </span>
            <nav className={styles.pagination} aria-label="Archive pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              {Array.from({ length: Math.min(pageCount, 3) }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    type="button"
                    key={pageNumber}
                    className={page === pageNumber ? styles.currentPage : undefined}
                    aria-current={page === pageNumber ? "page" : undefined}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              {pageCount > 3 ? <span className={styles.pageEllipsis}>…</span> : null}
              {pageCount > 3 ? (
                <button
                  type="button"
                  className={page === pageCount ? styles.currentPage : undefined}
                  aria-current={page === pageCount ? "page" : undefined}
                  onClick={() => setPage(pageCount)}
                >
                  {pageCount}
                </button>
              ) : null}
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </nav>
          </footer>
        </section>

        <p className={styles.archiveNote}>
          <Info size={15} aria-hidden="true" />
          <span>Select documents to restore in bulk, or use the restore icon on an individual record.</span>
        </p>
      </main>

      {restoreDialogIds ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setRestoreDialogIds(null);
              setRestoreDialogCount(0);
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="restore-dialog-title"
          >
            <button
              type="button"
              className={styles.modalClose}
              aria-label="Close dialog"
              onClick={() => {
                setRestoreDialogIds(null);
                setRestoreDialogCount(0);
              }}
            >
              <X size={18} />
            </button>
            <span className={styles.modalIcon}><RotateCcw size={20} /></span>
            <h2 id="restore-dialog-title">Restore documents?</h2>
            <p>
              {restoreDialogCount} {restoreDialogCount === 1 ? "document will" : "documents will"} return
              to the library as view only. Download, print and edit permissions remain disabled.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setRestoreDialogIds(null);
                  setRestoreDialogCount(0);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.restoreSelected}
                onClick={confirmRestore}
              >
                <RotateCcw size={14} />
                Restore {restoreDialogCount === 1 ? "document" : "documents"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {detailsRecord ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailsRecord(null);
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-details-title"
          >
            <button
              type="button"
              className={styles.modalClose}
              aria-label="Close dialog"
              onClick={() => setDetailsRecord(null)}
            >
              <X size={18} />
            </button>
            <span className={styles.modalIcon}><FileText size={20} /></span>
            <h2 id="archive-details-title">{detailsRecord.title}</h2>
            <dl className={styles.detailList}>
              <div><dt>Author</dt><dd>{detailsRecord.author}</dd></div>
              <div><dt>Type</dt><dd>{detailsRecord.type}</dd></div>
              <div><dt>File</dt><dd>{detailsRecord.size} · {detailsRecord.pages} pages</dd></div>
              <div><dt>Archived by</dt><dd>{detailsRecord.archivedBy}</dd></div>
              <div><dt>Date archived</dt><dd>{detailsRecord.archivedAt}</dd></div>
              <div><dt>Reader access</dt><dd>Hidden while archived; view only when restored</dd></div>
            </dl>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setDetailsRecord(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </AdminSidebarLayout>
  );
}
