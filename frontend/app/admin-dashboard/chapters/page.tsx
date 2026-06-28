"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Download, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { gooeyToast } from "goey-toast";
import "goey-toast/styles.css";

import AdminSidebarLayout from "../components/AdminSidebarLayout";
import ChapterStats from "./components/ChapterStats";
import ChapterToolbar from "./components/ChapterToolbar";
import ChapterCard from "./components/ChapterCard";
import ChapterTable from "./components/ChapterTable";
import BulkActionBar from "./components/BulkActionBar";
import EmptyState from "./components/EmptyState";
import LoadingSkeleton from "./components/LoadingSkeleton";
import ChapterPagination from "./components/ChapterPagination";
import { Chapter } from "./types";
import "../admin-dashboard.css";
import "./chapters.css";

// 14 Beautifully Crafted Mock Chapters
const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: "ch-1",
    name: "Batangas Chapter",
    islandGroup: "Luzon",
    region: "CALABARZON",
    description: "A community of professionals and leaders from Batangas committed to growth, collaboration, and service.",
    status: "published",
    officers: [
      { id: "o-1-1", name: "Juan Dela Cruz", role: "President", term: "2024–2026" },
      { id: "o-1-2", name: "Maria Santos", role: "Vice President", term: "2024–2026" },
      { id: "o-1-3", name: "Pedro Reyes", role: "Secretary", term: "2024–2026" },
      { id: "o-1-4", name: "Elena Diaz", role: "Treasurer", term: "2024–2026" },
      { id: "o-1-5", name: "Carlo Tan", role: "Auditor", term: "2024–2026" },
    ],
    createdAt: "2025-05-10T08:00:00Z",
    updatedAt: "2026-06-25T14:30:00Z",
  },
  {
    id: "ch-2",
    name: "Cebu Chapter",
    islandGroup: "Visayas",
    region: "Central Visayas",
    description: "Empowering Cebuano professionals through networking, learning, and community impact.",
    status: "published",
    officers: [
      { id: "o-2-1", name: "Angela Garcia", role: "President", term: "2024–2026" },
      { id: "o-2-2", name: "Mark Anthony", role: "Treasurer", term: "2024–2026" },
      { id: "o-2-3", name: "Rhea Aquino", role: "Auditor", term: "2024–2026" },
      { id: "o-2-4", name: "Jose Ramos", role: "PRO", term: "2024–2026" },
    ],
    createdAt: "2025-05-12T09:15:00Z",
    updatedAt: "2026-06-24T11:20:00Z",
  },
  {
    id: "ch-3",
    name: "Davao Chapter",
    islandGroup: "Mindanao",
    region: "Davao Region",
    description: "Uniting leaders and change makers in Davao to drive innovation and progress.",
    status: "draft",
    officers: [
      { id: "o-3-1", name: "Jose Sarmiento", role: "President", term: "2024–2026" },
      { id: "o-3-2", name: "Leah Mercado", role: "Vice President", term: "2024–2026" },
      { id: "o-3-3", name: "Ronald Torres", role: "Secretary", term: "2024–2026" },
      { id: "o-3-4", name: "Rita Fernandez", role: "Treasurer", term: "2024–2026" },
      { id: "o-3-5", name: "Mark Villon", role: "PRO", term: "2024–2026" },
    ],
    createdAt: "2025-05-15T14:22:00Z",
    updatedAt: "2026-06-23T16:45:00Z",
  },
  {
    id: "ch-4",
    name: "Iloilo Chapter",
    islandGroup: "Visayas",
    region: "Western Visayas",
    description: "Building connections and opportunities for professionals in Iloilo and beyond.",
    status: "published",
    officers: [
      { id: "o-4-1", name: "Catherine Tan", role: "President", term: "2024–2026" },
      { id: "o-4-2", name: "Jomar Obispo", role: "Treasurer", term: "2024–2026" },
      { id: "o-4-3", name: "Nina Lopez", role: "PRO", term: "2024–2026" },
      { id: "o-4-4", name: "Richard Ganza", role: "Secretary", term: "2024–2026" },
      { id: "o-4-5", name: "Melissa Lim", role: "Auditor", term: "2024–2026" },
    ],
    createdAt: "2025-05-18T10:30:00Z",
    updatedAt: "2026-06-20T08:12:00Z",
  },
  {
    id: "ch-5",
    name: "Baguio Chapter",
    islandGroup: "Luzon",
    region: "CAR",
    description: "Fostering leadership and professional growth in the Cordillera region.",
    status: "draft",
    officers: [
      { id: "o-5-1", name: "Robert Lim", role: "President", term: "2024–2026" },
      { id: "o-5-2", name: "Sofia Vergara", role: "Secretary", term: "2024–2026" },
      { id: "o-5-3", name: "George Ramos", role: "Treasurer", term: "2024–2026" },
      { id: "o-5-4", name: "Jenny Valdez", role: "Auditor", term: "2024–2026" },
      { id: "o-5-5", name: "Michael Cruz", role: "PRO", term: "2024–2026" },
      { id: "o-5-6", name: "Dan Santos", role: "Director", term: "2024–2026" },
    ],
    createdAt: "2025-05-20T11:00:00Z",
    updatedAt: "2026-06-18T09:30:00Z",
  },
  {
    id: "ch-6",
    name: "Manila Chapter",
    islandGroup: "Luzon",
    region: "NCR",
    description: "Strengthening networks and leadership capabilities for educators and professionals in Metro Manila.",
    status: "published",
    officers: [
      { id: "o-6-1", name: "David Guerrero", role: "President", term: "2024–2026" },
      { id: "o-6-2", name: "Linda Co", role: "Vice President", term: "2024–2026" },
      { id: "o-6-3", name: "Patricia Santos", role: "Secretary", term: "2024–2026" },
    ],
    createdAt: "2025-05-22T08:45:00Z",
    updatedAt: "2026-06-15T15:20:00Z",
  },
  {
    id: "ch-7",
    name: "Cagayan Chapter",
    islandGroup: "Luzon",
    region: "Cagayan Valley",
    description: "Developing regional initiatives to improve local and academic community partnerships.",
    status: "published",
    officers: [
      { id: "o-7-1", name: "Manuel Perez", role: "President", term: "2024–2026" },
      { id: "o-7-2", name: "Grace Uy", role: "Secretary", term: "2024–2026" },
    ],
    createdAt: "2025-05-24T16:00:00Z",
    updatedAt: "2026-06-10T14:15:00Z",
  },
  {
    id: "ch-8",
    name: "Zamboanga Chapter",
    islandGroup: "Mindanao",
    region: "Zamboanga Peninsula",
    description: "Promoting educational governance and cooperative initiatives across the peninsula.",
    status: "archived",
    officers: [
      { id: "o-8-1", name: "Francis Climaco", role: "President", term: "2024–2026" },
      { id: "o-8-2", name: "Sarah Alih", role: "Vice President", term: "2024–2026" },
      { id: "o-8-3", name: "Amina Juani", role: "Auditor", term: "2024–2026" },
    ],
    createdAt: "2025-05-26T13:10:00Z",
    updatedAt: "2026-06-05T10:45:00Z",
  },
  {
    id: "ch-9",
    name: "Leyte Chapter",
    islandGroup: "Visayas",
    region: "Eastern Visayas",
    description: "Dedicated to academic excellence, leadership development, and post-disaster community building.",
    status: "published",
    officers: [
      { id: "o-9-1", name: "Benjamin Go", role: "President", term: "2024–2026" },
      { id: "o-9-2", name: "Teresa Martinez", role: "Secretary", term: "2024–2026" },
      { id: "o-9-3", name: "Paul Almeria", role: "Treasurer", term: "2024–2026" },
    ],
    createdAt: "2025-05-28T09:40:00Z",
    updatedAt: "2026-06-02T13:12:00Z",
  },
  {
    id: "ch-10",
    name: "Pampanga Chapter",
    islandGroup: "Luzon",
    region: "Central Luzon",
    description: "Innovating leadership and professional services in Pampanga and nearby provinces.",
    status: "draft",
    officers: [
      { id: "o-10-1", name: "Arthur Roman", role: "President", term: "2024–2026" },
      { id: "o-10-2", name: "Clara Ocampo", role: "Treasurer", term: "2024–2026" },
    ],
    createdAt: "2025-05-30T10:20:00Z",
    updatedAt: "2026-05-28T16:24:00Z",
  },
  {
    id: "ch-11",
    name: "Misamis Chapter",
    islandGroup: "Mindanao",
    region: "Northern Mindanao",
    description: "Building stronger ties with professional sectors to foster regional collaboration.",
    status: "published",
    officers: [
      { id: "o-11-1", name: "Gregory Roa", role: "President", term: "2024–2026" },
      { id: "o-11-2", name: "Helen Vega", role: "Secretary", term: "2024–2026" },
      { id: "o-11-3", name: "Arthur Neri", role: "Treasurer", term: "2024–2026" },
    ],
    createdAt: "2025-06-01T15:00:00Z",
    updatedAt: "2026-05-24T09:50:00Z",
  },
  {
    id: "ch-12",
    name: "General Santos Chapter",
    islandGroup: "Mindanao",
    region: "SOCCSKSARGEN",
    description: "Mobilizing local resources and members for regional development and growth.",
    status: "draft",
    officers: [
      { id: "o-12-1", name: "Albert Pacio", role: "President", term: "2024–2026" },
      { id: "o-12-2", name: "Vicky Ramos", role: "Vice President", term: "2024–2026" },
    ],
    createdAt: "2025-06-03T11:45:00Z",
    updatedAt: "2026-05-20T11:15:00Z",
  },
  {
    id: "ch-13",
    name: "Albay Chapter",
    islandGroup: "Luzon",
    region: "Bicol Region",
    description: "Fostering academic synergy and leadership programs under the volcanic peaks of Bicol.",
    status: "published",
    officers: [
      { id: "o-13-1", name: "John Albay", role: "President", term: "2024–2026" },
      { id: "o-13-2", name: "Sarah Bicol", role: "Treasurer", term: "2024–2026" },
    ],
    createdAt: "2025-06-05T09:12:00Z",
    updatedAt: "2026-05-15T14:30:00Z",
  },
  {
    id: "ch-14",
    name: "Palawan Chapter",
    islandGroup: "Luzon",
    region: "MIMAROPA",
    description: "Pioneering eco-professional governance and member connectivity in the last frontier.",
    status: "published",
    officers: [
      { id: "o-14-1", name: "Chris Palawan", role: "President", term: "2024–2026" },
      { id: "o-14-2", name: "Emily Puerto", role: "Vice President", term: "2024–2026" },
    ],
    createdAt: "2025-06-08T14:20:00Z",
    updatedAt: "2026-05-10T10:00:00Z",
  }
];

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>(INITIAL_CHAPTERS);
  
  // Dashboard management state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIslandGroup, setSelectedIslandGroup] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("updated-desc");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  
  // Selection and Paginations
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Loading Shimmer State
  const [isLoading, setIsLoading] = useState(true);

  // Simulate premium skeleton loading on mount
  useEffect(() => {
    simulateLoad();
  }, []);

  const simulateLoad = () => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  };

  // Reset pagination when search query or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedIslandGroup, selectedRegion, selectedStatus, sortBy]);

  // Real-time Search, Filter, and Sort logic
  const filteredChapters = useMemo(() => {
    return chapters
      .filter((chapter) => {
        // Keyword Search match (case insensitive)
        const matchQuery = searchQuery.trim().toLowerCase();
        if (matchQuery) {
          const matchName = chapter.name.toLowerCase().includes(matchQuery);
          const matchDesc = chapter.description.toLowerCase().includes(matchQuery);
          const matchRegion = chapter.region.toLowerCase().includes(matchQuery);
          const matchOfficer = chapter.officers.some(
            (o) => o.name.toLowerCase().includes(matchQuery) || o.role.toLowerCase().includes(matchQuery)
          );
          if (!matchName && !matchDesc && !matchRegion && !matchOfficer) {
            return false;
          }
        }

        // Island Group match
        if (selectedIslandGroup !== "All" && chapter.islandGroup !== selectedIslandGroup) {
          return false;
        }

        // Region match
        if (selectedRegion !== "All" && chapter.region !== selectedRegion) {
          return false;
        }

        // Publication Status match
        if (selectedStatus !== "All" && chapter.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sorts
        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "name-desc") {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === "updated-desc") {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === "officers-desc") {
          return b.officers.length - a.officers.length;
        }
        return 0;
      });
  }, [chapters, searchQuery, selectedIslandGroup, selectedRegion, selectedStatus, sortBy]);

  // Paginated Chapters
  const paginatedChapters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredChapters.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredChapters, currentPage, itemsPerPage]);

  // ── Actions Implementation ────────────────────────────────────────────────

  const handleCreateChapter = () => {
    gooeyToast.info("Create Chapter dialog simulation opened.");
  };

  const handleExportAll = () => {
    gooeyToast.success(`Exported all ${filteredChapters.length} chapters to Excel.`);
  };

  const handleEdit = (chapter: Chapter) => {
    gooeyToast.info(`Editing ${chapter.name} properties.`);
  };

  // Duplicate Action actually updates local state in real-time to wow the user
  const handleDuplicate = (chapter: Chapter) => {
    const duplicated: Chapter = {
      ...chapter,
      id: `ch-dup-${Date.now()}`,
      name: `${chapter.name} (Copy)`,
      status: "draft", // Copies start as drafts
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      officers: chapter.officers.map((o) => ({
        ...o,
        id: `o-dup-${Math.random().toString(36).substr(2, 9)}`,
      })),
    };
    setChapters((prev) => [duplicated, ...prev]);
    gooeyToast.success(`${chapter.name} duplicated successfully.`);
  };

  // Toggle Publication status in real-time
  const handleTogglePublish = (chapter: Chapter) => {
    const nextStatus = chapter.status === "published" ? "draft" : "published";
    setChapters((prev) =>
      prev.map((c) => (c.id === chapter.id ? { ...c, status: nextStatus, updatedAt: new Date().toISOString() } : c))
    );
    gooeyToast.success(
      `Chapter status updated! "${chapter.name}" is now ${nextStatus === "published" ? "Published" : "Draft"}.`
    );
  };

  // Delete Chapter in real-time
  const handleDelete = (chapter: Chapter) => {
    if (confirm(`Are you sure you want to delete the ${chapter.name}?`)) {
      setChapters((prev) => prev.filter((c) => c.id !== chapter.id));
      setSelectedChapters((prev) => prev.filter((id) => id !== chapter.id));
      gooeyToast.success(`${chapter.name} deleted successfully.`);
    }
  };

  // View all officers preview modal simulation
  const handleViewAllOfficers = (chapter: Chapter) => {
    gooeyToast.info(`Displaying full officer registry for ${chapter.name} (${chapter.officers.length} members).`);
  };

  // ── Checkbox Selection State Helpers ──────────────────────────────────────

  const handleSelectChapter = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedChapters((prev) => [...prev, id]);
    } else {
      setSelectedChapters((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAllChapters = (selected: boolean) => {
    if (selected) {
      // Select all chapters currently visible on the page
      const visibleIds = paginatedChapters.map((c) => c.id);
      setSelectedChapters((prev) => {
        const otherSelected = prev.filter((id) => !visibleIds.includes(id));
        return [...otherSelected, ...visibleIds];
      });
    } else {
      // Unselect all chapters currently visible on the page
      const visibleIds = paginatedChapters.map((c) => c.id);
      setSelectedChapters((prev) => prev.filter((id) => !visibleIds.includes(id)));
    }
  };

  // ── Bulk Actions Implementations ──────────────────────────────────────────

  const handleBulkPublish = () => {
    setChapters((prev) =>
      prev.map((c) =>
        selectedChapters.includes(c.id) ? { ...c, status: "published", updatedAt: new Date().toISOString() } : c
      )
    );
    gooeyToast.success(`Successfully published ${selectedChapters.length} chapters.`);
    setSelectedChapters([]);
  };

  const handleBulkUnpublish = () => {
    setChapters((prev) =>
      prev.map((c) =>
        selectedChapters.includes(c.id) ? { ...c, status: "draft", updatedAt: new Date().toISOString() } : c
      )
    );
    gooeyToast.success(`Moved ${selectedChapters.length} chapters to Draft status.`);
    setSelectedChapters([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete the ${selectedChapters.length} selected chapters?`)) {
      setChapters((prev) => prev.filter((c) => !selectedChapters.includes(c.id)));
      gooeyToast.success(`Deleted ${selectedChapters.length} chapters.`);
      setSelectedChapters([]);
    }
  };

  const handleBulkExport = () => {
    gooeyToast.success(`Generating CSV file export for ${selectedChapters.length} chapters.`);
  };

  // Clear filters function when search yields empty results
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedIslandGroup("All");
    setSelectedRegion("All");
    setSelectedStatus("All");
    setSortBy("updated-desc");
  };

  // Custom action buttons container on the right side of the main Page header
  const headerActionsBlock = (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={handleExportAll}
        className="chapters-btn chapters-btn--secondary"
        style={{ minHeight: "52px", fontSize: "18px", padding: "0 28px" }}
        aria-label="Export chapters metadata"
      >
        <Download size={22} strokeWidth={2.5} aria-hidden="true" />
        <span>Export</span>
      </button>

      <button
        type="button"
        onClick={handleCreateChapter}
        className="chapters-btn chapters-btn--primary"
        style={{ minHeight: "52px", fontSize: "18px", fontWeight: 600, padding: "0 28px", borderRadius: "8px" }}
        aria-label="Create new chapter entry"
      >
        <Plus size={24} strokeWidth={3} aria-hidden="true" />
        <span>Create Chapter</span>
      </button>
    </div>
  );

  return (
    <AdminSidebarLayout
      pageClassName="chapters-management-page"
      mainClassName="admin-main-content"
      eyebrow="CHAPTER MANAGEMENT"
      title="All Chapters"
      subtitle="Manage all PAGE regional chapters, officers, publication status, and organizational information from one centralized dashboard."
      seniorFriendlyHeader={true}
      headerActions={headerActionsBlock}
      titleIcon={<Building2 size={28} strokeWidth={2.2} aria-hidden="true" />}
    >
      <motion.div
        className="chapters-container pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {isLoading ? (
          <LoadingSkeleton type="stats" />
        ) : (
          <ChapterStats chapters={chapters} />
        )}

        {isLoading ? (
          <LoadingSkeleton type="toolbar" />
        ) : (
          <ChapterToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedIslandGroup={selectedIslandGroup}
            setSelectedIslandGroup={setSelectedIslandGroup}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        )}

        {isLoading ? (
          <LoadingSkeleton type={viewMode === "card" ? "cards" : "table"} />
        ) : filteredChapters.length === 0 ? (
          <EmptyState
            onCreateChapter={handleCreateChapter}
            isSearchActive={
              searchQuery !== "" ||
              selectedIslandGroup !== "All" ||
              selectedRegion !== "All" ||
              selectedStatus !== "All"
            }
            onClearFilters={handleClearFilters}
          />
        ) : viewMode === "card" ? (
          <section className="chapters-section" aria-label="Chapter cards">
            <h2 className="chapters-section__label">Chapters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-w-0">
              {paginatedChapters.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  onEdit={handleEdit}
                  onViewAllOfficers={handleViewAllOfficers}
                  onMoreActions={handleDelete}
                />
              ))}
            </div>
          </section>
        ) : (
          <ChapterTable
            chapters={paginatedChapters}
            selectedChapters={selectedChapters}
            onSelectChapter={handleSelectChapter}
            onSelectAllChapters={handleSelectAllChapters}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onTogglePublish={handleTogglePublish}
            onDelete={handleDelete}
          />
        )}

        {!isLoading && filteredChapters.length > 0 && (
          <div className="mt-4">
            <ChapterPagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredChapters.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(count) => {
                setItemsPerPage(count);
                setCurrentPage(1);
              }}
            />
          </div>
        )}

        <BulkActionBar
          selectedCount={selectedChapters.length}
          onPublish={handleBulkPublish}
          onUnpublish={handleBulkUnpublish}
          onDelete={handleBulkDelete}
          onExport={handleBulkExport}
          onCancel={() => setSelectedChapters([])}
        />

      </motion.div>
    </AdminSidebarLayout>
  );
}
