"use client";

import { motion } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import { useMemo } from "react";
import ViewToggle from "./ViewToggle";

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
  viewMode: "card" | "list";
  setViewMode: (m: "card" | "list") => void;
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
    <div className="chapters-toolbar__filter">
      <div className="chapters-toolbar__select-wrap">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <select
          id={id}
          className="chapters-toolbar__control"
          value={value}
          onChange={onChange}
          aria-label={label}
        >
          {children}
        </select>
        <ChevronDown size={16} strokeWidth={2.5} className="chapters-toolbar__chevron" aria-hidden="true" />
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
  viewMode,
  setViewMode,
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
        <div className="chapters-toolbar">
          <div className="chapters-toolbar__search">
            <div className="relative w-full min-w-0">
              <label htmlFor="search-chapters" className="sr-only">
                Search chapters
              </label>
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <Search size={20} strokeWidth={2.5} aria-hidden="true" />
              </div>
              <input
                id="search-chapters"
                type="text"
                className="chapters-toolbar__search-input"
                style={{ paddingLeft: "52px" }}
                placeholder="Search by name, region, or officer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="chapters-toolbar__filters">
            <FilterSelect
              id="filter-island-group"
              label="Filter by Island Group"
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
              label="Filter by Region"
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
              label="Filter by Publication Status"
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
              label="Sort chapters list"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="updated-desc">Recently Updated</option>
              <option value="name-asc">Alphabetical (A-Z)</option>
              <option value="name-desc">Alphabetical (Z-A)</option>
              <option value="officers-desc">Officer Count</option>
            </FilterSelect>
          </div>

          <div className="chapters-toolbar__view">
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
