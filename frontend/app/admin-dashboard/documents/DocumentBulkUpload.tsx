"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  CloudUpload,
  FileText,
  Plus,
  RotateCw,
  X,
} from "lucide-react";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";
import AdminSidebarLayout from "../components/AdminSidebarLayout";
import PillButton from "../components/PillButton";
import {
  publishLibraryDocuments,
  type PublishedLibraryDocument,
} from "./document-library-state";
import styles from "./DocumentBulkUpload.module.css";

type PublicationType = PublishedLibraryDocument["type"];
type UploadStatus = "uploaded" | "uploading" | "failed";

type BatchFile = {
  id: string;
  filename: string;
  sizeMb: number;
  title: string;
  author: string;
  type: PublicationType | "";
  year: string;
  status: UploadStatus;
  progress: number;
};

const MAX_FILE_SIZE_MB = 50;
const MAX_BATCH_FILES = 20;
const FILES_PER_PAGE = 5;

const publicationTypes: PublicationType[] = [
  "Journal",
  "Research paper",
  "Report",
  "Conference paper",
];

const initialBatch: BatchFile[] = [
  {
    id: "batch-environmental-studies",
    filename: "environmental-studies-vol19.pdf",
    sizeMb: 4.8,
    title: "Journal of Environmental Studies, Vol. 19",
    author: "R. Chen et al.",
    type: "Journal",
    year: "2026",
    status: "uploaded",
    progress: 100,
  },
  {
    id: "batch-machine-learning-healthcare",
    filename: "machine-learning-healthcare.pdf",
    sizeMb: 4.1,
    title: "Machine Learning in Healthcare",
    author: "Dr. Maya Patel",
    type: "Research paper",
    year: "2026",
    status: "uploaded",
    progress: 100,
  },
  {
    id: "batch-coastal-resilience",
    filename: "coastal-resilience-report.pdf",
    sizeMb: 8.2,
    title: "Coastal Resilience Report",
    author: "Coastal Research Institute",
    type: "Report",
    year: "2026",
    status: "uploading",
    progress: 64,
  },
  {
    id: "batch-education-policy",
    filename: "education-policy-review.pdf",
    sizeMb: 1.6,
    title: "Education Policy Review",
    author: "S. Williams",
    type: "Research paper",
    year: "2025",
    status: "failed",
    progress: 0,
  },
  {
    id: "batch-urban-mobility",
    filename: "urban-mobility-study.pdf",
    sizeMb: 3.6,
    title: "Urban Mobility & Sustainable Cities",
    author: "James Wilson",
    type: "Research paper",
    year: "2026",
    status: "uploaded",
    progress: 100,
  },
  {
    id: "batch-renewable-energy",
    filename: "renewable-energy-outlook.pdf",
    sizeMb: 6.4,
    title: "Renewable Energy Outlook 2026",
    author: "Institute for Energy Policy",
    type: "Report",
    year: "2026",
    status: "uploaded",
    progress: 100,
  },
  {
    id: "batch-materials-science",
    filename: "materials-science-advances.pdf",
    sizeMb: 1.9,
    title: "Advances in Materials Science",
    author: "Prof. Elena Rossi",
    type: "Conference paper",
    year: "2026",
    status: "uploaded",
    progress: 100,
  },
  {
    id: "batch-digital-literacy",
    filename: "digital-literacy-higher-ed.pdf",
    sizeMb: 2.3,
    title: "Digital Literacy in Higher Education",
    author: "A. Thompson & S. Lee",
    type: "Research paper",
    year: "2025",
    status: "uploaded",
    progress: 100,
  },
];

function formatFileSize(sizeMb: number) {
  return `${sizeMb.toFixed(1)} MB`;
}

function formatTransferredSize(sizeMb: number, progress: number) {
  return `${((sizeMb * progress) / 100).toFixed(1)} of ${sizeMb.toFixed(1)} MB`;
}

function titleFromFilename(filename: string) {
  return filename
    .replace(/\.pdf$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusSummary(batch: BatchFile[]) {
  return {
    uploaded: batch.filter((file) => file.status === "uploaded").length,
    uploading: batch.filter((file) => file.status === "uploading").length,
    failed: batch.filter((file) => file.status === "failed").length,
  };
}

function getReadyFiles(batch: BatchFile[]) {
  return batch.filter(
    (file) =>
      file.status === "uploaded" &&
      file.title.trim() !== "" &&
      file.author.trim() !== "" &&
      file.type !== "",
  );
}

export default function DocumentBulkUpload() {
  const [batch, setBatch] = useState(initialBatch);
  const [isDragging, setIsDragging] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [page, setPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFocusRef = useRef<string | null>(null);

  const statusSummary = useMemo(() => getStatusSummary(batch), [batch]);
  const readyFiles = useMemo(() => getReadyFiles(batch), [batch]);
  const totalSize = batch.reduce((total, file) => total + file.sizeMb, 0);
  const pageCount = Math.max(1, Math.ceil(batch.length / FILES_PER_PAGE));
  const visibleBatch = batch.slice((page - 1) * FILES_PER_PAGE, page * FILES_PER_PAGE);
  const firstVisible = batch.length === 0 ? 0 : (page - 1) * FILES_PER_PAGE + 1;
  const lastVisible = Math.min(page * FILES_PER_PAGE, batch.length);
  const invalidFiles = showValidation ? batch.filter(
    (file) =>
      file.status === "uploaded" &&
      (!file.title.trim() || !file.author.trim() || !file.type),
  ) : [];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBatch((current) =>
        current.map((file) => {
          if (file.status !== "uploading") {
            return file;
          }
          const progress = Math.min(file.progress + 18, 100);
          return {
            ...file,
            progress,
            status: progress === 100 ? "uploaded" : "uploading",
          };
        }),
      );
    }, 450);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  useEffect(() => {
    if (!pendingFocusRef.current) {
      return;
    }
    document.getElementById(pendingFocusRef.current)?.focus();
    pendingFocusRef.current = null;
  }, [page]);

  const addFiles = (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const errors: string[] = [];
    const newFiles: BatchFile[] = [];
    let remainingSlots = MAX_BATCH_FILES - batch.length;
    const existingNames = new Set(batch.map((file) => file.filename.toLocaleLowerCase()));

    for (const file of fileList) {
      if (!file.name.toLocaleLowerCase().endsWith(".pdf") || file.type !== "application/pdf") {
        errors.push(`${file.name} was not added. Only PDF files are allowed.`);
        continue;
      }

      const sizeMb = file.size / (1024 * 1024);
      if (sizeMb > MAX_FILE_SIZE_MB) {
        errors.push(`${file.name} is larger than 50 MB and was not added.`);
        continue;
      }

      const normalizedName = file.name.toLocaleLowerCase();
      if (existingNames.has(normalizedName)) {
        errors.push(`${file.name} was skipped because a file with that name is already in the batch.`);
        continue;
      }

      if (remainingSlots <= 0) {
        errors.push(`Only ${MAX_BATCH_FILES} files are allowed per batch.`);
        continue;
      }

      newFiles.push({
        id: `upload-${crypto.randomUUID()}`,
        filename: file.name,
        sizeMb,
        title: titleFromFilename(file.name),
        author: "",
        type: "",
        year: String(new Date().getFullYear()),
        status: "uploading",
        progress: 0,
      });
      existingNames.add(normalizedName);
      remainingSlots -= 1;
    }

    if (newFiles.length > 0) {
      setBatch((current) => [...current, ...newFiles]);
    }
    setFileErrors(errors);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) {
      addFiles(event.currentTarget.files);
    }
    event.currentTarget.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const updateFile = (id: string, updates: Partial<BatchFile>) => {
    setBatch((current) =>
      current.map((file) => (file.id === id ? { ...file, ...updates } : file)),
    );
  };

  const removeFile = (id: string) => {
    setBatch((current) => current.filter((file) => file.id !== id));
  };

  const retryFile = (id: string) => {
    updateFile(id, { status: "uploading", progress: 0 });
  };

  const publishReadyFiles = () => {
    setShowValidation(true);
    if (isPublishing) {
      return;
    }

    const firstInvalid = batch.find(
      (file) =>
        file.status === "uploaded" &&
        (!file.title.trim() || !file.author.trim() || !file.type),
    );
    if (firstInvalid) {
      const field = !firstInvalid.title.trim()
        ? "title"
        : !firstInvalid.author.trim()
          ? "author"
          : "type";
      pendingFocusRef.current = `${firstInvalid.id}-${field}`;
      const targetPage =
        Math.floor(batch.findIndex((file) => file.id === firstInvalid.id) / FILES_PER_PAGE) + 1;
      setPage(targetPage);
      if (targetPage === page) {
        window.setTimeout(() => {
          document.getElementById(pendingFocusRef.current ?? "")?.focus();
          pendingFocusRef.current = null;
        }, 0);
      }
      return;
    }

    if (readyFiles.length === 0) {
      return;
    }

    setIsPublishing(true);
    try {
      const today = new Date();
      const uploaded = today.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      const uploadedIso = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");
      const publishedDocuments: PublishedLibraryDocument[] = readyFiles.map((file) => ({
        id: file.id,
        title: file.title.trim(),
        author: file.author.trim(),
        size: formatFileSize(file.sizeMb),
        type: file.type as PublicationType,
        year: file.year,
        uploaded,
        uploadedIso,
      }));

      publishLibraryDocuments(publishedDocuments);
      const publishedIds = new Set(readyFiles.map((file) => file.id));
      setBatch((current) => current.filter((file) => !publishedIds.has(file.id)));
      setShowValidation(false);
      gooeyToast.success(
        `${publishedDocuments.length} ${publishedDocuments.length === 1 ? "document" : "documents"} published to the library.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not publish documents.";
      gooeyToast.error(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const backAction = (
    <Link
      href="/admin-dashboard/documents/library"
      className={styles.backButton}
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Back to library
    </Link>
  );

  const missingRequired = (file: BatchFile, field: "title" | "author" | "type") =>
    showValidation &&
    file.status === "uploaded" &&
    (field === "type" ? !file.type : !file[field].trim());

  const cancelBatch = () => {
    if (batch.length > 0 && !window.confirm("Clear all files from this batch?")) {
      return;
    }
    setBatch([]);
    setPage(1);
    setShowValidation(false);
    setFileErrors([]);
  };

  return (
    <AdminSidebarLayout
      pageClassName=""
      mainClassName=""
      title="Bulk upload"
      subtitle="Add multiple publications, review their metadata, then publish to the library."
      eyebrow="Content"
      headerActions={backAction}
      centerHeaderActions
    >
      <main className={`admin-shell admin-shell--main ${styles.page}`}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <span>Content</span>
          <span aria-hidden="true">&gt;</span>
          <Link href="/admin-dashboard/documents/library">Documents</Link>
          <span aria-hidden="true">&gt;</span>
          <span aria-current="page">Bulk Upload</span>
        </nav>

        <ol className={styles.stepper} aria-label="Upload steps">
          <li className={styles.stepComplete}>
            <span className={styles.stepNumber}><Check size={14} /></span>
            <span>Add files</span>
          </li>
          <li className={styles.stepCurrent} aria-current="step">
            <span className={styles.stepNumber}>2</span>
            <span>Review metadata</span>
          </li>
          <li>
            <span className={styles.stepNumber}>3</span>
            <span>Publish as view only</span>
          </li>
        </ol>

        <section
          className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            const relatedTarget = event.relatedTarget;
            if (
              !(relatedTarget instanceof Node) ||
              !event.currentTarget.contains(relatedTarget)
            ) {
              setIsDragging(false);
            }
          }}
          onDrop={handleDrop}
          aria-label="Upload PDF files"
        >
          <span className={styles.dropIcon} aria-hidden="true">
            <CloudUpload size={23} />
          </span>
          <strong>Drag and drop your PDF files here</strong>
          <span className={styles.dropGuidance}>
            PDF files only · Up to 50 MB per file · Up to 20 files per batch
          </span>
          <PillButton
            type="button"
            variant="outline"
            size="sm"
            icon={<Plus size={15} aria-hidden="true" />}
            className={styles.browseButton}
            onClick={() => fileInputRef.current?.click()}
          >
            Browse files
          </PillButton>
          <input
            ref={fileInputRef}
            className={styles.hiddenInput}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            onChange={handleFileInput}
            aria-label="Choose PDF files"
          />
        </section>
        {fileErrors.length > 0 ? (
          <div className={styles.fileError} role="alert">
            <AlertCircle size={16} aria-hidden="true" />
            <ul>
              {fileErrors.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}
            </ul>
            <button type="button" aria-label="Dismiss file errors" onClick={() => setFileErrors([])}>
              <X size={15} />
            </button>
          </div>
        ) : null}

        <section className={styles.batchCard} aria-label="Files in this batch">
          <header className={styles.batchHeader}>
            <div>
              <h2>Files in this batch</h2>
              <p>{batch.length} files · {totalSize.toFixed(1)} MB</p>
            </div>
            <div className={styles.statusSummary} aria-live="polite">
              <span className={styles.summaryUploaded}>{statusSummary.uploaded} uploaded</span>
              <span aria-hidden="true">·</span>
              <span className={styles.summaryUploading}>{statusSummary.uploading} uploading</span>
              <span aria-hidden="true">·</span>
              <span className={styles.summaryFailed}>{statusSummary.failed} failed</span>
            </div>
          </header>

          <div className={styles.tableScroll}>
            <table className={styles.batchTable}>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Title &amp; Author <span>*</span></th>
                  <th>Type / Year <span>*</span></th>
                  <th>Upload status</th>
                  <th><span className={styles.srOnly}>Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {visibleBatch.map((file) => (
                  <tr key={file.id}>
                    <td>
                      <div className={styles.fileCell}>
                        <span className={styles.pdfIcon} aria-hidden="true">
                          <FileText size={17} />
                        </span>
                        <span className={styles.fileMeta}>
                          <strong>PDF · {formatFileSize(file.sizeMb)}</strong>
                          <span title={file.filename}>{file.filename}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.metadataFields}>
                        <label className={styles.srOnly} htmlFor={`${file.id}-title`}>Title</label>
                        <input
                          id={`${file.id}-title`}
                          className={missingRequired(file, "title") ? styles.inputInvalid : ""}
                          value={file.title}
                          onChange={(event) => updateFile(file.id, { title: event.target.value })}
                          onBlur={() => setShowValidation(true)}
                          placeholder="Document title"
                          aria-invalid={missingRequired(file, "title")}
                        />
                        {missingRequired(file, "title") ? (
                          <span className={styles.fieldError}>Title is required.</span>
                        ) : null}
                        <label className={styles.srOnly} htmlFor={`${file.id}-author`}>Author</label>
                        <input
                          id={`${file.id}-author`}
                          className={missingRequired(file, "author") ? styles.inputInvalid : ""}
                          value={file.author}
                          onChange={(event) => updateFile(file.id, { author: event.target.value })}
                          onBlur={() => setShowValidation(true)}
                          placeholder="Author or institution"
                          aria-invalid={missingRequired(file, "author")}
                        />
                        {missingRequired(file, "author") ? (
                          <span className={styles.fieldError}>Author is required.</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className={styles.typeYearFields}>
                        <label className={styles.srOnly} htmlFor={`${file.id}-type`}>Publication type</label>
                        <select
                          id={`${file.id}-type`}
                          className={missingRequired(file, "type") ? styles.inputInvalid : ""}
                          value={file.type}
                          onChange={(event) =>
                            updateFile(file.id, { type: event.target.value as PublicationType | "" })
                          }
                          onBlur={() => setShowValidation(true)}
                          aria-invalid={missingRequired(file, "type")}
                        >
                          <option value="">Select type</option>
                          {publicationTypes.map((type) => <option key={type}>{type}</option>)}
                        </select>
                        <label className={styles.srOnly} htmlFor={`${file.id}-year`}>Publication year</label>
                        <input
                          id={`${file.id}-year`}
                          type="number"
                          min="1000"
                          max="9999"
                          value={file.year}
                          onChange={(event) => updateFile(file.id, { year: event.target.value })}
                          aria-label={`Publication year for ${file.filename}`}
                        />
                        {missingRequired(file, "type") ? (
                          <span className={styles.fieldError}>Type is required.</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      {file.status === "uploaded" ? (
                        <div className={styles.uploadedStatus}>
                          <span><CheckCircle2 size={16} /> Uploaded</span>
                          <small>Ready to publish</small>
                        </div>
                      ) : file.status === "uploading" ? (
                        <div className={styles.uploadingStatus}>
                          <span className={styles.uploadingTitle}>
                            <span className={styles.spinner} aria-hidden="true" />
                            Uploading · {file.progress}%
                          </span>
                          <span
                            className={styles.progressTrack}
                            role="progressbar"
                            aria-label={`Uploading ${file.filename}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={file.progress}
                          >
                            <span style={{ width: `${file.progress}%` }} />
                          </span>
                          <small>{formatTransferredSize(file.sizeMb, file.progress)}</small>
                        </div>
                      ) : (
                        <div className={styles.failedStatus}>
                          <span><AlertCircle size={16} /> Upload failed</span>
                          <small>Connection interrupted</small>
                          <button type="button" onClick={() => retryFile(file.id)}>
                            <RotateCw size={12} />
                            Retry upload
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.removeButton}
                        aria-label={`Remove ${file.filename} from batch`}
                        onClick={() => removeFile(file.id)}
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {batch.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyBatch}>
                      No files in this batch. Browse or drop PDF files to get started.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <p className={styles.footnote}>
            * Title, author and publication type are required for each file. You can edit metadata before publishing.
          </p>
        </section>
        <div className={styles.batchActionsCard}>
          {batch.length > FILES_PER_PAGE ? (
            <div className={styles.paginationRow}>
              <span className={styles.paginationSummary} aria-live="polite">
                Showing {firstVisible}-{lastVisible} of {batch.length} files
              </span>
              <nav className={`pagination ${styles.pagination}`} aria-label="Batch pagination">
                <button
                  type="button"
                  className={`pagination__link ${styles.paginationNav}`}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <ul className="pagination__list">
                  {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => {
                    const hasPageError = batch
                      .slice((pageNumber - 1) * FILES_PER_PAGE, pageNumber * FILES_PER_PAGE)
                      .some((file) => invalidFiles.some((invalid) => invalid.id === file.id));
                    return (
                      <li key={pageNumber}>
                        <button
                          type="button"
                          className={`pagination__link ${page === pageNumber ? "pagination__link--active" : ""} ${styles.pageNumber}`}
                          onClick={() => setPage(pageNumber)}
                          aria-current={page === pageNumber ? "page" : undefined}
                          aria-label={`Page ${pageNumber}${hasPageError ? ", contains validation errors" : ""}`}
                        >
                          {pageNumber}
                          {hasPageError ? <span className={styles.pageErrorDot} aria-hidden="true" /> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button
                  type="button"
                  className={`pagination__link ${styles.paginationNav}`}
                  onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                  disabled={page === pageCount}
                >
                  Next
                </button>
              </nav>
            </div>
          ) : null}
          <footer className={styles.footerBar}>
            <div className={styles.footerActions}>
              <PillButton type="button" variant="outline" size="sm" onClick={cancelBatch}>
                Clear
              </PillButton>
              <PillButton
                type="button"
                variant="primary"
                size="sm"
                disabled={readyFiles.length === 0 || isPublishing}
                onClick={publishReadyFiles}
              >
                Submit
              </PillButton>
            </div>
          </footer>
        </div>
      </main>
    </AdminSidebarLayout>
  );
}
