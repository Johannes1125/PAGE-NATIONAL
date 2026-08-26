"use client";

import { useState, useEffect, useMemo, useCallback, type KeyboardEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { chaptersApi } from "../../lib/api-client";
import {
  Search,
  Calendar,
  GraduationCap,
  ArrowRight,
  FileText,
  Globe2,
  ChevronDown,
  Compass,
  Building2,
  X,
} from "lucide-react";
import type { PublishedChapter, IslandGroup } from "./types";
import "./chapters.css";

// ── Hero Section (CBL Dark Navy Gradient) ────────────────────────────────────
function ChaptersHero() {
  return (
    <section className="cbl-hero">
      <div className="cbl-hero-container">
        <div className="cbl-breadcrumb">
          <Link href="/" className="cbl-breadcrumb-link">Home</Link>
          <span className="cbl-breadcrumb-sep">/</span>
          <span className="cbl-breadcrumb-current">Chapters</span>
        </div>

        <div className="cbl-hero-left">
          <h1 className="cbl-hero-title">Regional Chapters</h1>
          <div className="cbl-gold-line" />
          <p className="cbl-hero-subtitle">
            Discover PAGE&apos;s regional chapters across the Philippines. Explore their local leadership, academic initiatives, and research collaborations.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Skeleton Grid Loader Component ──────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="chapters-grid" aria-busy="true" aria-label="Loading chapters">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="chapters-card-skeleton">
          <div className="chapters-card-skeleton__cover" />
          <div className="chapters-card-skeleton__body">
            <div className="chapters-card-skeleton__pill" />
            <div className="chapters-card-skeleton__title" />
            <div className="chapters-card-skeleton__line" />
            <div className="chapters-card-skeleton__line" style={{ width: "80%" }} />
            <div className="chapters-card-skeleton__footer" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Framer Motion Stagger Variants ──────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

type ActiveRegionFilter = "All" | IslandGroup;

interface RegionTabOption {
  id: ActiveRegionFilter;
  label: string;
  shortLabel: string;
  description: string;
}

const REGION_OPTIONS: RegionTabOption[] = [
  {
    id: "All",
    label: "All Regions",
    shortLabel: "Nationwide",
    description: "Browse all regional chapters across the Philippine archipelago.",
  },
  {
    id: "Luzon",
    label: "Luzon Chapters",
    shortLabel: "Luzon",
    description: "Chapters spanning the National Capital Region, Northern, Central, and Southern Luzon.",
  },
  {
    id: "Visayas",
    label: "Visayas Chapters",
    shortLabel: "Visayas",
    description: "Chapters serving Western, Central, and Eastern Visayas academic communities.",
  },
  {
    id: "Mindanao",
    label: "Mindanao Chapters",
    shortLabel: "Mindanao",
    description: "Chapters representing Northern Mindanao, Davao, SOCCSKSARGEN, Caraga, and BARMM.",
  },
];

// ── Main Chapters Page Component ────────────────────────────────────────────
export default function ChaptersPage() {
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState<ActiveRegionFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [chapters, setChapters] = useState<PublishedChapter[]>([]);

  useEffect(() => {
    async function fetchChapters() {
      try {
        setLoading(true);
        const res = await chaptersApi.list({ status: "published" });
        if (res && res.success && Array.isArray(res.data)) {
          setChapters(res.data as PublishedChapter[]);
        }
      } catch (err) {
        console.error("Failed to fetch chapters:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChapters();
  }, []);

  // Compute counts per region
  const regionCounts = useMemo(() => {
    const counts: Record<ActiveRegionFilter, number> = {
      All: chapters.length,
      Luzon: 0,
      Visayas: 0,
      Mindanao: 0,
    };
    chapters.forEach((c) => {
      if (c.island_group && c.island_group in counts) {
        counts[c.island_group as IslandGroup]++;
      }
    });
    return counts;
  }, [chapters]);

  // Handle region selection / accordion toggle
  const handleSelectRegion = useCallback((regionId: ActiveRegionFilter) => {
    setActiveRegion(regionId);
  }, []);

  // Keyboard navigation for region triggers
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, regionId: ActiveRegionFilter) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelectRegion(regionId);
      }
    },
    [handleSelectRegion]
  );

  // Filter chapters based on active region & search query
  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return chapters.filter((chapter) => {
      const matchesRegion = activeRegion === "All" ? true : chapter.island_group === activeRegion;
      if (!matchesRegion) return false;
      if (!q) return true;

      const titleMatch = chapter.title?.toLowerCase().includes(q) ?? false;
      const regionMatch = chapter.region?.toLowerCase().includes(q) ?? false;
      const descMatch = chapter.short_description?.toLowerCase().includes(q) ?? false;

      return titleMatch || regionMatch || descMatch;
    });
  }, [chapters, activeRegion, searchQuery]);

  // Total chapters in the selected region (before applying search filter)
  const totalInSelectedRegion = regionCounts[activeRegion];

  return (
    <main className="chapters-main">
      <ChaptersHero />

      <section className="cbl-content-section" aria-label="Regional Chapters Directory">
        <div className="cbl-container">
          <div className="chapters-body-wrapper">

            {/* Region-Click Accordion Selector Bar */}
            <nav
              className="chapters-tabs-bar"
              role="tablist"
              aria-label="Select region to reveal chapters"
            >
              {REGION_OPTIONS.map((opt) => {
                const isSelected = activeRegion === opt.id;
                const count = regionCounts[opt.id];

                return (
                  <button
                    key={opt.id}
                    id={`region-tab-${opt.id.toLowerCase()}`}
                    role="tab"
                    aria-selected={isSelected}
                    aria-expanded={isSelected}
                    aria-controls="region-chapters-panel"
                    tabIndex={0}
                    className={`chapters-tab-btn ${isSelected ? "chapters-tab-btn--active" : ""}`}
                    onClick={() => handleSelectRegion(opt.id)}
                    onKeyDown={(e) => handleKeyDown(e, opt.id)}
                  >
                    <span className="chapters-tab-btn__label-group">
                      <span className="chapters-tab-btn__label">{opt.label}</span>
                      <span className="chapters-tab-count" aria-label={`${count} chapters`}>
                        {count}
                      </span>
                    </span>

                    <ChevronDown
                      size={16}
                      className={`chapters-tab-chevron ${isSelected ? "chapters-tab-chevron--open" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </nav>

            {/* Section Header Card with Dynamic Region Info & Search Input */}
            <div className="cbl-section-header chapters-section-header">
              <div className="chapters-header-left">
                <div className="chapters-header-icon-wrap" aria-hidden="true">
                  {activeRegion === "All" ? (
                    <Globe2 size={28} />
                  ) : (
                    <Compass size={28} />
                  )}
                </div>
                <div>
                  <h2 className="cbl-section-title">
                    {activeRegion === "All"
                      ? "Nationwide Regional Network"
                      : `${activeRegion} Regional Chapters`}
                  </h2>
                  <p className="cbl-section-subtitle">
                    {activeRegion === "All"
                      ? `Showing ${filteredChapters.length} of ${chapters.length} chapters nationwide`
                      : `Showing ${filteredChapters.length} of ${totalInSelectedRegion} chapters in ${activeRegion}`}
                  </p>
                </div>
              </div>

              {/* Search Box */}
              <div className="chapters-search-box">
                <Search size={16} className="chapters-search-icon" aria-hidden="true" />
                <input
                  id="chapters-search-input"
                  type="text"
                  placeholder={
                    activeRegion === "All"
                      ? "Search chapter name, region..."
                      : `Search in ${activeRegion} chapters...`
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label={`Search chapters in ${activeRegion === "All" ? "all regions" : activeRegion}`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="chapters-search-clear"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Expandable / Revealed Chapter Content Panel */}
            <div
              id="region-chapters-panel"
              role="tabpanel"
              aria-labelledby={`region-tab-${activeRegion.toLowerCase()}`}
              className="chapters-reveal-panel"
            >
              {loading ? (
                <SkeletonGrid />
              ) : totalInSelectedRegion === 0 ? (
                /* Empty state when the chosen region has 0 chapters */
                <motion.div
                  key={`empty-region-${activeRegion}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="cbl-empty-state chapters-empty-region"
                >
                  <div className="chapters-empty-icon-box">
                    <Building2 size={40} />
                  </div>
                  <h3>No Chapters Established in {activeRegion} Yet</h3>
                  <p>
                    PAGE is actively coordinating with graduate institutions and academic leaders to establish regional chapters in {activeRegion}.
                  </p>
                  <div className="chapters-empty-actions">
                    <button
                      type="button"
                      className="chapters-empty-btn"
                      onClick={() => handleSelectRegion("All")}
                    >
                      Browse All Regions
                    </button>
                  </div>
                </motion.div>
              ) : filteredChapters.length === 0 ? (
                /* Empty state when search query matches nothing */
                <motion.div
                  key="empty-search"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="cbl-empty-state chapters-empty-search"
                >
                  <div className="chapters-empty-icon-box">
                    <FileText size={40} />
                  </div>
                  <h3>No Chapters Match &quot;{searchQuery}&quot;</h3>
                  <p>
                    {activeRegion === "All"
                      ? "No regional chapters match your search criteria. Try a different keyword or clear the search filter."
                      : `No chapters in ${activeRegion} match your search. Try searching across all regions or clear the search.`}
                  </p>
                  <div className="chapters-empty-actions">
                    <button
                      type="button"
                      className="chapters-empty-btn"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear Search
                    </button>
                    {activeRegion !== "All" && (
                      <button
                        type="button"
                        className="chapters-empty-btn chapters-empty-btn--secondary"
                        onClick={() => {
                          setActiveRegion("All");
                        }}
                      >
                        Search All Regions
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* Card Grid for the selected region */
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeRegion}-${searchQuery}`}
                    className="chapters-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {filteredChapters.map((chapter) => {
                      const coverImageUrl = chapter.images?.[0]?.file_url || "/about-bg.jpg";
                      const establishedYear = new Date(chapter.created_at || new Date()).getFullYear();
                      const taglineText = chapter.short_description || "Empowering graduate education and research.";
                      const officersCount = chapter.officers?.length || 0;

                      return (
                        <motion.article
                          key={chapter.slug}
                          className="chapters-card"
                          variants={cardVariants}
                          layout
                        >
                          {/* Cover Photo & Badge */}
                          <div className="chapters-card__cover">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={coverImageUrl}
                              alt={`${chapter.title} Cover`}
                              className="chapters-card__img"
                              loading="lazy"
                            />
                            <span className="chapters-card__badge">{chapter.region}</span>
                          </div>

                          {/* Content Body */}
                          <div className="chapters-card__body">
                            <h3 className="chapters-card__title">{chapter.title}</h3>

                            <div className="chapters-card__meta">
                              <div className="chapters-card__meta-item">
                                <Calendar size={13} aria-hidden="true" />
                                <span>Est. {establishedYear}</span>
                              </div>
                              <div className="chapters-card__meta-item">
                                <GraduationCap size={13} aria-hidden="true" />
                                <span>{officersCount || 10} Officers</span>
                              </div>
                            </div>

                            <p className="chapters-card__tagline">{taglineText}</p>

                            <div className="chapters-card__footer">
                              <Link
                                href={`/chapters/${chapter.slug}`}
                                className="chapters-card__cta"
                                aria-label={`View chapter details for ${chapter.title}`}
                              >
                                <span>View Chapter</span>
                                <ArrowRight size={14} aria-hidden="true" />
                              </Link>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

