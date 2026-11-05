const STORAGE_KEY = "page-admin-document-library-state";
export const DOCUMENT_LIBRARY_STATE_EVENT = "page-admin-document-library-state-change";

const INITIAL_LIBRARY_COUNT = 128;
const INITIAL_ARCHIVE_COUNT = 24;

export type PublishedLibraryDocument = {
  id: string;
  title: string;
  author: string;
  size: string;
  pages?: number;
  type: "Journal" | "Research paper" | "Report" | "Conference paper";
  year?: string;
  uploaded: string;
  uploadedIso: string;
  archivedAt?: string;
  archivedBy?: string;
};

export type DocumentLibraryState = {
  archivedIds: string[];
  archivedCountDelta: number;
  libraryCountDelta: number;
  publishedDocuments: PublishedLibraryDocument[];
  restoredArchiveIds: string[];
  libraryCount: number;
  archiveCount: number;
};

const emptyState = (): DocumentLibraryState => ({
  archivedIds: [],
  archivedCountDelta: 0,
  libraryCountDelta: 0,
  publishedDocuments: [],
  restoredArchiveIds: [],
  libraryCount: INITIAL_LIBRARY_COUNT,
  archiveCount: INITIAL_ARCHIVE_COUNT,
});

export function getDocumentLibraryState(): DocumentLibraryState {
  if (typeof window === "undefined") {
    return emptyState();
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return emptyState();
  }

  const parsed: unknown = JSON.parse(saved);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("archivedIds" in parsed) ||
    !Array.isArray(parsed.archivedIds) ||
    !parsed.archivedIds.every((id) => typeof id === "string") ||
    ("archivedCountDelta" in parsed && typeof parsed.archivedCountDelta !== "number") ||
    ("libraryCountDelta" in parsed && typeof parsed.libraryCountDelta !== "number") ||
    ("publishedDocuments" in parsed &&
      (!Array.isArray(parsed.publishedDocuments) ||
        !parsed.publishedDocuments.every(isPublishedLibraryDocument))) ||
    ("restoredArchiveIds" in parsed &&
      (!Array.isArray(parsed.restoredArchiveIds) ||
        !parsed.restoredArchiveIds.every((id) => typeof id === "string")))
  ) {
    throw new Error("Saved document library state is invalid.");
  }

  const archivedIds = [...new Set(parsed.archivedIds)];
  const publishedDocuments =
    "publishedDocuments" in parsed
      ? parsed.publishedDocuments as PublishedLibraryDocument[]
      : [];
  const archivedCountDelta =
    "archivedCountDelta" in parsed
      ? parsed.archivedCountDelta as number
      : archivedIds.length;
  const libraryCountDelta =
    "libraryCountDelta" in parsed
      ? parsed.libraryCountDelta as number
      : publishedDocuments.length - archivedCountDelta;
  const restoredArchiveIds =
    "restoredArchiveIds" in parsed
      ? [...new Set(parsed.restoredArchiveIds)]
      : [];
  return {
    archivedIds,
    archivedCountDelta,
    libraryCountDelta,
    publishedDocuments,
    restoredArchiveIds,
    libraryCount: Math.max(0, INITIAL_LIBRARY_COUNT + libraryCountDelta),
    archiveCount: INITIAL_ARCHIVE_COUNT + archivedCountDelta,
  };
}

function isPublishedLibraryDocument(value: unknown): value is PublishedLibraryDocument {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const document = value as Record<string, unknown>;
  return (
    typeof document.id === "string" &&
    typeof document.title === "string" &&
    typeof document.author === "string" &&
    typeof document.size === "string" &&
    (document.pages === undefined || typeof document.pages === "number") &&
    (document.type === "Journal" ||
      document.type === "Research paper" ||
      document.type === "Report" ||
      document.type === "Conference paper") &&
    (document.year === undefined || typeof document.year === "string") &&
    typeof document.uploaded === "string" &&
    typeof document.uploadedIso === "string" &&
    (document.archivedAt === undefined || typeof document.archivedAt === "string") &&
    (document.archivedBy === undefined || typeof document.archivedBy === "string")
  );
}

export function saveArchivedDocumentIds(archivedIds: string[]): DocumentLibraryState {
  const previousState = getDocumentLibraryState();
  const uniqueIds = [...new Set(archivedIds)];
  const previousIds = new Set(previousState.archivedIds);
  const nextIds = new Set(uniqueIds);
  const newlyArchived = uniqueIds.filter((id) => !previousIds.has(id)).length;
  const newlyRestored = previousState.archivedIds.filter((id) => !nextIds.has(id)).length;
  const countChange = newlyArchived - newlyRestored;
  const archivedCountDelta = previousState.archivedCountDelta + countChange;
  const libraryCountDelta = previousState.libraryCountDelta - countChange;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      archivedIds: uniqueIds,
      archivedCountDelta,
      libraryCountDelta,
      publishedDocuments: previousState.publishedDocuments,
      restoredArchiveIds: previousState.restoredArchiveIds,
    }),
  );

  const state = {
    archivedIds: uniqueIds,
    archivedCountDelta,
    libraryCountDelta,
    publishedDocuments: previousState.publishedDocuments,
    restoredArchiveIds: previousState.restoredArchiveIds,
    libraryCount: Math.max(0, INITIAL_LIBRARY_COUNT + libraryCountDelta),
    archiveCount: INITIAL_ARCHIVE_COUNT + archivedCountDelta,
  };
  window.dispatchEvent(new Event(DOCUMENT_LIBRARY_STATE_EVENT));
  return state;
}

export function publishLibraryDocuments(
  documents: PublishedLibraryDocument[],
): DocumentLibraryState {
  const previousState = getDocumentLibraryState();
  const existingIds = new Set(previousState.publishedDocuments.map((document) => document.id));
  const newDocuments = documents.filter((document) => !existingIds.has(document.id));
  const publishedDocuments = [...previousState.publishedDocuments, ...newDocuments];
  const libraryCountDelta = previousState.libraryCountDelta + newDocuments.length;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      archivedIds: previousState.archivedIds,
      archivedCountDelta: previousState.archivedCountDelta,
      libraryCountDelta,
      publishedDocuments,
      restoredArchiveIds: previousState.restoredArchiveIds,
    }),
  );

  const state = {
    ...previousState,
    publishedDocuments,
    libraryCountDelta,
    libraryCount: Math.max(0, INITIAL_LIBRARY_COUNT + libraryCountDelta),
  };
  window.dispatchEvent(new Event(DOCUMENT_LIBRARY_STATE_EVENT));
  return state;
}

export function restoreDefaultArchiveDocuments(
  documents: PublishedLibraryDocument[],
  additionalCount = 0,
): DocumentLibraryState {
  const previousState = getDocumentLibraryState();
  const restoredIds = new Set(previousState.restoredArchiveIds);
  const newlyRestored = documents.filter((document) => !restoredIds.has(document.id));
  const nextRestoredIds = [
    ...previousState.restoredArchiveIds,
    ...newlyRestored.map((document) => document.id),
  ];
  const existingPublishedIds = new Set(
    previousState.publishedDocuments.map((document) => document.id),
  );
  const nextPublishedDocuments = [
    ...previousState.publishedDocuments,
    ...newlyRestored.filter((document) => !existingPublishedIds.has(document.id)),
  ];
  const restoreCount = newlyRestored.length + additionalCount;
  const libraryCountDelta = previousState.libraryCountDelta + restoreCount;
  const archivedCountDelta = previousState.archivedCountDelta - restoreCount;
  const archivedIds = previousState.archivedIds.filter(
    (id) => !newlyRestored.some((document) => document.id === id),
  );
  const state = {
    archivedIds,
    archivedCountDelta,
    libraryCountDelta,
    publishedDocuments: nextPublishedDocuments,
    restoredArchiveIds: nextRestoredIds,
    libraryCount: Math.max(0, INITIAL_LIBRARY_COUNT + libraryCountDelta),
    archiveCount: INITIAL_ARCHIVE_COUNT + archivedCountDelta,
  };
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      archivedIds: state.archivedIds,
      archivedCountDelta: state.archivedCountDelta,
      libraryCountDelta: state.libraryCountDelta,
      publishedDocuments: state.publishedDocuments,
      restoredArchiveIds: state.restoredArchiveIds,
    }),
  );
  window.dispatchEvent(new Event(DOCUMENT_LIBRARY_STATE_EVENT));
  return state;
}
