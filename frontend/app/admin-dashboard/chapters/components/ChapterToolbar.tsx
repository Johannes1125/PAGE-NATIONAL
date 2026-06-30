"use client";

import { motion } from "framer-motion";
import { Search, ChevronDown, X } from "lucide-react";
import { useMemo } from "react";

type ChapterToolbarProps = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedIslandGroup: string;
  setSelectedIslandGroup: (ig: string) => void;
  selectedRegion: string;
  setSelectedRegion: (r: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
};

const REGIONS_MAP: Record<string, string[]> = {
  Luzon: [
    "NCR",
    "CAR",
    "Ilocos Region",
    "Cagayan Valley",
    "Central Luzon",
    "CALABARZON",
    "MIMAROPA",
    "Bicol Region",
  ],
  Visayas: ["Western Visayas", "Central Visayas", "Eastern Visayas"],
  Mindanao: [
    "Zamboanga Peninsula",
    "Northern Mindanao",
    "Davao Region",
    "SOCCSKSARGEN",
    "Caraga",
    "BARMM",
  ],
};

/** Visible-label filter select — label is promoted above the control */
function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="chapters-toolbar__field-group chapters-toolbar__filter">
      <label htmlFor={id} className="chapters-toolbar__field-label">
        {label}
      </label>
      <div className="chapters-toolbar__select-wrap">
        <select
          id={id}
          className="chapters-toolbar__control"
          value={value}
          onChange={onChange}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2.5}
          className="chapters-toolbar__chevron"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default function ChapterToolbar({
  searchQuery,
  setSearchQuery,
  selectedIslandGroup,
  setSelectedIslandGroup,
  selectedRegion,
  setSelectedRegion,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
}: ChapterToolbarProps) {
  const regions = useMemo(() => {
    if (selectedIslandGroup && selectedIslandGroup !== "All") {
      return REGIONS_MAP[selectedIslandGroup] || [];
    }
    return Object.values(REGIONS_MAP).flat();
  }, [selectedIslandGroup]);

  const handleIslandGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIslandGroup(e.target.value);
    setSelectedRegion("All");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut", delay: 0.08 }}
      className="chapters-section"
      aria-label="Search and filters"
    >
      <h2 className="chapters-section__label">Search &amp; Filters</h2>
      <div className="chapters-toolbar-panel">
        <div className="chapters-toolbar-layout">

          {/* ── Row 1: Search ──────────────────────────────────── */}
          <div className="chapters-toolbar__field-group chapters-toolbar__search-group">
            <label htmlFor="search-chapters" className="chapters-toolbar__field-label">
              Search Chapters
            </label>
            <div className="relative w-full min-w-0">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <Search size={20} strokeWidth={2.5} aria-hidden="true" />
              </div>
              <input
                id="search-chapters"
                type="text"
                className="chapters-toolbar__search-input"
                style={{
                  paddingLeft: "52px",
                  paddingRight: searchQuery ? "52px" : "16px",
                }}
                placeholder="Search by name, region, or officer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search chapters by name, region, or officer"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center px-1 text-slate-400 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                  aria-label="Clear search"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>

          {/* ── Row 2: Filter selects ──────────────────────────── */}
          <div className="chapters-toolbar__filter-row">
            <FilterSelect
              id="filter-island-group"
              label="Island Group"
              value={selectedIslandGroup}
              onChange={handleIslandGroupChange}
            >
              <option value="All">All Island Groups</option>
              <option value="Luzon">Luzon</option>
              <option value="Visayas">Visayas</option>
              <option value="Mindanao">Mindanao</option>
            </FilterSelect>

            <FilterSelect
              id="filter-region"
              label="Region"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="All">All Regions</option>
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              id="filter-status"
              label="Publication Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </FilterSelect>

            <FilterSelect
              id="filter-sort"
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="updated-desc">Recently Updated</option>
              <option value="updated-asc">Oldest Updated</option>
              <option value="name-asc">Alphabetical (A–Z)</option>
              <option value="name-desc">Alphabetical (Z–A)</option>
              <option value="island-asc">Island Group (A–Z)</option>
              <option value="island-desc">Island Group (Z–A)</option>
              <option value="region-asc">Region (A–Z)</option>
              <option value="region-desc">Region (Z–A)</option>
              <option value="officers-desc">Officer Count (High–Low)</option>
              <option value="officers-asc">Officer Count (Low–High)</option>
              <option value="status-asc">Status (A–Z)</option>
              <option value="status-desc">Status (Z–A)</option>
            </FilterSelect>
          </div>

        </div>
      </div>
    </motion.section>
  );
}
