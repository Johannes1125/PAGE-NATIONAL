"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import AdminHeroMetricCard from "../components/AdminHeroMetricCard";
import {
  getDocumentLibraryState,
  saveArchivedDocumentIds,
  type DocumentLibraryState,
} from "./document-library-state";
import styles from "./[slug]/documents.module.css";

type DocumentType = "Journal" | "Research paper" | "Report" | "Conference paper";

export type LibraryDocument = {
  id: string;
  title: string;
  author: string;
  size: string;
  pages?: number;
  type: DocumentType;
  uploaded: string;
  uploadedIso: string;
};

type DialogState =
  | { type: "archive"; ids: string[]; count: number }
  | { type: "viewer" | "details" | "metadata"; document: LibraryDocument };

export const documents: LibraryDocument[] = [
  {
    id: "doc-environmental-studies",
    title: "Journal of Environmental Studies, Vol. 18",
    author: "R. Chen et al.",
    size: "4.2 MB",
    pages: 86,
    type: "Journal",
    uploaded: "Oct 24, 2026",
    uploadedIso: "2026-10-24",
  },
  {
    id: "doc-clinical-decision",
    title: "AI in Clinical Decision-Making",
    author: "Dr. Maya Patel",
    size: "2.8 MB",
    pages: 24,
    type: "Research paper",
    uploaded: "Oct 23, 2026",
    uploadedIso: "2026-10-23",
  },
  {
    id: "doc-urban-mobility",
    title: "Urban Mobility & Sustainable Cities",
    author: "James Wilson",
    size: "3.6 MB",
    pages: 42,
    type: "Research paper",
    uploaded: "Oct 22, 2026",
    uploadedIso: "2026-10-22",
  },
  {
    id: "doc-public-health",
    title: "Quarterly Review of Public Health",
    author: "Health Research Council",
    size: "5.1 MB",
    pages: 112,
    type: "Journal",
    uploaded: "Oct 21, 2026",
    uploadedIso: "2026-10-21",
  },
  {
    id: "doc-energy-outlook",
    title: "Renewable Energy Outlook 2026",
    author: "Institute for Energy Policy",
    size: "6.4 MB",
    pages: 68,
    type: "Report",
    uploaded: "Oct 20, 2026",
    uploadedIso: "2026-10-20",
  },
  {
    id: "doc-materials-science",
    title: "Advances in Materials Science",
    author: "Prof. Elena Rossi",
    size: "1.9 MB",
    pages: 18,
    type: "Conference paper",
    uploaded: "Oct 19, 2026",
    uploadedIso: "2026-10-19",
  },
  {
    id: "doc-digital-literacy",
    title: "Digital Literacy in Higher Education",
    author: "A. Thompson & S. Lee",
    size: "2.3 MB",
    pages: 32,
    type: "Research paper",
    uploaded: "Oct 18, 2026",
    uploadedIso: "2026-10-18",
  },
];

const documentTypes: DocumentType[] = [
  "Journal",
  "Research paper",
  "Report",
  "Conference paper",
];

const pageTitle = "Document library";
const pageSubtitle =
  "A curated repository of peer-reviewed journals, research papers, and institutional reports. Readers can access published documents in a secure view-only environment.";

const uploadHeaderAction = (
  <Link href="/admin-dashboard/documents/bulk-upload" className={styles.uploadButton}>
    <Plus size={16} aria-hidden="true" />
    Upload documents
  </Link>
);

function getArchiveConfirmationText(count: number) {
  return `Archive ${count} ${count === 1 ? "document" : "documents"}? They will be hidden from the library and reader access. You can restore them anytime from Archive.`;
}

export default function DocumentLibrary() {
  const [libraryState, setLibraryState] = useState<DocumentLibraryState>({
    archivedIds: [],
    archivedCountDelta: 0,
    libraryCountDelta: 0,
    publishedDocuments: [],
    restoredArchiveIds: [],
    libraryCount: 128,
    archiveCount: 24,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAllDocumentsSelected, setIsAllDocumentsSelected] = useState(false);
  const [excludedFromAllIds, setExcludedFromAllIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<DocumentType | "all">("all");
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
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

  const availableDocuments = useMemo(
    () =>
      [...libraryState.publishedDocuments, ...documents].filter(
        (document) => !libraryState.archivedIds.includes(document.id),
      ),
    [libraryState.archivedIds, libraryState.publishedDocuments],
  );
  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return availableDocuments.filter((document) => {
      const matchesSearch =
        !normalizedSearch ||
        `${document.title} ${document.author} ${document.type}`
          .toLocaleLowerCase()
          .includes(normalizedSearch);
      const matchesType = selectedType === "all" || document.type === selectedType;
      const matchesDate = !dateFilter || document.uploadedIso === dateFilter;
      return matchesSearch && matchesType && matchesDate;
    });
  }, [availableDocuments, dateFilter, search, selectedType]);

  const isDocumentSelected = (id: string) =>
    isAllDocumentsSelected ? !excludedFromAllIds.includes(id) : selectedIds.includes(id);
  const visibleSelectedIds = filteredDocuments
    .filter((document) => isDocumentSelected(document.id))
    .map((document) => document.id);
  const allVisibleSelected =
    filteredDocuments.length > 0 && visibleSelectedIds.length === filteredDocuments.length;

  useEffect(() => {
    const isIndeterminate = visibleSelectedIds.length > 0 && !allVisibleSelected;
    if (headerCheckboxRef.current) headerCheckboxRef.current.indeterminate = isIndeterminate;
    if (selectionCheckboxRef.current) selectionCheckboxRef.current.indeterminate = isIndeterminate;
  }, [allVisibleSelected, visibleSelectedIds.length]);

  const updateSelection = (id: string, checked: boolean) => {
    if (isAllDocumentsSelected) {
      setExcludedFromAllIds((current) =>
        checked
          ? current.filter((excludedId) => excludedId !== id)
          : [...new Set([...current, id])],
      );
      return;
    }
    setSelectedIds((current) =>
      checked ? [...new Set([...current, id])] : current.filter((selectedId) => selectedId !== id),
    );
  };

  const toggleVisibleSelection = () => {
    const visibleIds = filteredDocuments.map((document) => document.id);
    if (isAllDocumentsSelected) {
      setExcludedFromAllIds((current) =>
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

  const archiveDocuments = () => {
    if (!dialog || dialog.type !== "archive") {
      return;
    }
    const nextState = saveArchivedDocumentIds(
      [...libraryState.archivedIds, ...dialog.ids],
    );
    setLibraryState(nextState);
    setSelectedIds((current) => current.filter((id) => !dialog.ids.includes(id)));
    setIsAllDocumentsSelected(false);
    setExcludedFromAllIds([]);
    setDialog(null);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedType("all");
    setDateFilter("");
    setPage(1);
  };

  const resultStart = filteredDocuments.length === 0 ? 0 : (page - 1) * 7 + 1;
  const resultEnd = filteredDocuments.length === 0
    ? 0
    : Math.min(resultStart + filteredDocuments.length - 1, libraryState.libraryCount);
  const pageCount = Math.max(1, Math.ceil(libraryState.libraryCount / 7));
  const selectedCount = isAllDocumentsSelected
    ? Math.max(0, libraryState.libraryCount - excludedFromAllIds.length)
    : selectedIds.length;
  const selectedDocumentIds = isAllDocumentsSelected
    ? availableDocuments
      .filter((document) => !excludedFromAllIds.includes(document.id))
      .map((document) => document.id)
    : selectedIds;

  return (
    <AdminSidebarLayout
      pageClassName=""
      mainClassName=""
      title={pageTitle}
      subtitle={pageSubtitle}
      eyebrow="Content"
      headerActions={uploadHeaderAction}
      centerHeaderActions
    >
      <main className={`admin-shell admin-shell--main ${styles.page}`}>
        <section className={`admin-hero-metrics ${styles.stats}`} aria-label="Document statistics">
          <AdminHeroMetricCard
            label="Published documents"
            value={libraryState.libraryCount}
            meta="Available to readers"
            tone="blue"
            icon={BookOpen}
          />
          <AdminHeroMetricCard
            label="Added this month"
            value={16}
            meta="Across 4 publication types"
            tone="green"
            icon={Plus}
            delay={0.05}
          />
          <AdminHeroMetricCard
            label="Archived documents"
            value={libraryState.archiveCount}
            meta="Hidden from the library"
            tone="gold"
            icon={Archive}
            delay={0.1}
          />
        </section>

        <aside className={styles.infoBanner}>
          <span className={styles.infoIcon} aria-hidden="true">
            <LockKeyhole size={18} />
          </span>
          <div>
            <h2>All published files are view only</h2>
            <p>
              Readers can open documents in the secure viewer. Download, print and edit
              permissions are disabled.
            </p>
          </div>
        </aside>

        <section className={styles.libraryCard} aria-label="Published documents">
          <div className={styles.toolbar}>
            <label className={styles.searchBox}>
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search by title, author or keyword..."
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
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
                {typeMenuOpen ? (
                  <div className={styles.popover} role="group" aria-label="Filter by type">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType("all");
                        setPage(1);
                        setTypeMenuOpen(false);
                      }}
                    >
                      All types
                    </button>
                    {documentTypes.map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => {
                          setSelectedType(type);
                          setPage(1);
                          setTypeMenuOpen(false);
                        }}
                      >
                        {type}
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
                  <CalendarDays size={15} aria-hidden="true" />
                  {dateFilter ? new Date(`${dateFilter}T00:00:00`).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }) : "Date uploaded"}
                </button>
                {dateMenuOpen ? (
                  <div className={styles.popover} role="group" aria-label="Filter by upload date">
                    <label className={styles.dateLabel} htmlFor="document-upload-date">
                      Uploaded on
                    </label>
                    <input
                      id="document-upload-date"
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
                          setPage(1);
                          setDateMenuOpen(false);
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
                <SlidersHorizontal size={15} aria-hidden="true" />
                Filters
              </button>
            </div>
          </div>

          {filtersOpen ? (
            <div className={styles.filterSummary}>
              <span>
                {selectedType === "all" ? "All publication types" : selectedType}
                {dateFilter
                  ? ` · Uploaded ${new Date(`${dateFilter}T00:00:00`).toLocaleDateString("en-US")}`
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
                  aria-label="Select visible documents"
                />
                <strong>{selectedCount} documents selected</strong>
                <button
                  type="button"
                  onClick={() => {
                    setIsAllDocumentsSelected(true);
                    setSelectedIds([]);
                    setExcludedFromAllIds([]);
                  }}
                >
                  Select all {libraryState.libraryCount}
                </button>
              </div>
              <div className={styles.selectionActions}>
                <button
                  type="button"
                  className={styles.clearSelection}
                  onClick={() => {
                    setSelectedIds([]);
                    setIsAllDocumentsSelected(false);
                    setExcludedFromAllIds([]);
                  }}
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  className={styles.archiveButton}
                  onClick={() =>
                    setDialog({
                      type: "archive",
                      ids: selectedDocumentIds,
                      count: selectedCount,
                    })
                  }
                >
                  <Archive size={15} aria-hidden="true" />
                  Archive selected ({selectedCount})
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
                      aria-label="Select all visible documents"
                    />
                  </th>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Reader access</th>
                  <th>Uploaded</th>
                  <th className={styles.actionColumn}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((document) => (
                  <tr
                    key={document.id}
                    className={isDocumentSelected(document.id) ? styles.selectedRow : undefined}
                  >
                    <td className={styles.checkboxColumn}>
                      <input
                        type="checkbox"
                        checked={isDocumentSelected(document.id)}
                        onChange={(event) => updateSelection(document.id, event.target.checked)}
                        aria-label={`Select ${document.title}`}
                      />
                    </td>
                    <td>
                      <div className={styles.documentCell}>
                        <span className={styles.pdfIcon} aria-hidden="true">
                          <FileText size={18} />
                          <small>PDF</small>
                        </span>
                        <span className={styles.documentDescription}>
                          <strong>{document.title}</strong>
                          <span>
                            {document.author} · {document.size}
                            {document.pages ? ` · ${document.pages} pages` : ""}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td><span className={styles.typeBadge}>{document.type}</span></td>
                    <td>
                      <span className={styles.accessStatus}>
                        <LockKeyhole size={14} aria-hidden="true" />
                        View only
                      </span>
                    </td>
                    <td className={styles.uploadedDate}>{document.uploaded}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          aria-label={`Open ${document.title} in secure viewer`}
                          onClick={() => setDialog({ type: "viewer", document })}
                        >
                          <Eye size={17} />
                        </button>
                        <div className={styles.popoverWrap}>
                          <button
                            type="button"
                            className={styles.iconButton}
                            aria-label={`Actions for ${document.title}`}
                            aria-expanded={actionMenuId === document.id}
                            onClick={() =>
                              setActionMenuId((current) => current === document.id ? null : document.id)
                            }
                          >
                            <MoreHorizontal size={19} />
                          </button>
                          {actionMenuId === document.id ? (
                            <div className={styles.actionMenu} role="menu">
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setDialog({ type: "details", document });
                                  setActionMenuId(null);
                                }}
                              >
                                View details
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setDialog({ type: "metadata", document });
                                  setActionMenuId(null);
                                }}
                              >
                                Edit metadata
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setDialog({ type: "archive", ids: [document.id], count: 1 });
                                  setActionMenuId(null);
                                }}
                              >
                                Archive
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
                      No documents match these filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <footer className={styles.tableFooter}>
            <span>
              Showing {resultStart}-{resultEnd} of {libraryState.libraryCount} documents
            </span>
            <nav className={styles.pagination} aria-label="Document pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft size={15} />
                Previous
              </button>
              {[1, 2, 3].map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={page === pageNumber ? styles.currentPage : undefined}
                  aria-current={page === pageNumber ? "page" : undefined}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <span className={styles.pageEllipsis}>…</span>
              <button type="button" onClick={() => setPage(pageCount)}>{pageCount}</button>
              <button
                type="button"
                disabled={page >= pageCount}
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              >
                Next
                <ChevronRight size={15} />
              </button>
            </nav>
          </footer>
        </section>

        <p className={styles.archiveNote}>
          Archiving removes documents from reader access. You can restore them anytime from{" "}
          <Link href="/admin-dashboard/documents/archive">Archive</Link>.
        </p>
      </main>

      {dialog ? (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDialog(null);
        }}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-dialog-title"
          >
            <button
              type="button"
              className={styles.modalClose}
              aria-label="Close dialog"
              onClick={() => setDialog(null)}
            >
              <X size={18} />
            </button>
            {dialog.type === "archive" ? (
              <>
                <span className={`${styles.modalIcon} ${styles.modalIconWarning}`}>
                  <Archive size={20} />
                </span>
                <h2 id="document-dialog-title">Archive documents</h2>
                <p>{getArchiveConfirmationText(dialog.count)}</p>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelButton} onClick={() => setDialog(null)}>
                    Cancel
                  </button>
                  <button type="button" className={styles.archiveButton} onClick={archiveDocuments}>
                    Archive {dialog.count === 1 ? "document" : "documents"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className={styles.modalIcon}>
                  {dialog.type === "viewer" ? <Eye size={20} /> : <FileText size={20} />}
                </span>
                <h2 id="document-dialog-title">
                  {dialog.type === "viewer"
                    ? "Secure document viewer"
                    : dialog.type === "metadata"
                      ? "Document metadata"
                      : "Document details"}
                </h2>
                <p className={styles.modalDocumentTitle}>{dialog.document.title}</p>
                <dl className={styles.detailList}>
                  <div><dt>Author</dt><dd>{dialog.document.author}</dd></div>
                  <div><dt>Type</dt><dd>{dialog.document.type}</dd></div>
                  <div><dt>Uploaded</dt><dd>{dialog.document.uploaded}</dd></div>
                  <div><dt>File</dt><dd>{dialog.document.size} · {dialog.document.pages} pages</dd></div>
                  <div><dt>Reader access</dt><dd>View only — download, print and edit disabled</dd></div>
                </dl>
                {dialog.type === "metadata" ? (
                  <p className={styles.metadataNote}>
                    Metadata editing will be available when document management is connected.
                  </p>
                ) : null}
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelButton} onClick={() => setDialog(null)}>
                    Close
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </AdminSidebarLayout>
  );
}
