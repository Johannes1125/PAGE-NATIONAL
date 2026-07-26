"use client";

import Navbar from "../components/Navbar";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CHAPTERS_DATA } from "./mock-data";
import { MapPin, Search, Calendar, GraduationCap, ArrowRight, FileText, Globe2 } from "lucide-react";
import "./chapters.css";

// ── Hero Section (CBL Dark Navy Gradient, NO top pill label) ─────────────────
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
            Discover PAGE&apos;s 18 regional chapters across the Philippines. Explore their local leadership, academic initiatives, and research collaborations.
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
      {Array.from({ length: 6 }).map((_, i) => (
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
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// ── Main Chapters Page Component ────────────────────────────────────────────
export default function ChaptersPage() {
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"All" | "Luzon" | "Visayas" | "Mindanao">("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    
    const timer = setTimeout(() => setLoading(false), 400);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleFilterChange = (filter: "All" | "Luzon" | "Visayas" | "Mindanao") => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
    
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  };

  const filteredChapters = useMemo(() => {
    return CHAPTERS_DATA.filter((chapter) => {
      const matchesRegion = activeFilter === "All" ? true : chapter.region === activeFilter;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesRegion;

      const matchesSearch =
        chapter.chapter_name.toLowerCase().includes(q) ||
        chapter.region.toLowerCase().includes(q) ||
        chapter.tagline.toLowerCase().includes(q) ||
        (chapter.description && chapter.description.toLowerCase().includes(q));
      return matchesRegion && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const filterOptions: Array<{ id: "All" | "Luzon" | "Visayas" | "Mindanao"; label: string }> = [
    { id: "All", label: "All Regions" },
    { id: "Luzon", label: "Luzon Chapters" },
    { id: "Visayas", label: "Visayas Chapters" },
    { id: "Mindanao", label: "Mindanao Chapters" },
  ];

  return (
    <main className="chapters-main">
      <Navbar scrolled={scrolled} />
      <ChaptersHero />

      <section className="cbl-content-section">
        <div className="cbl-container">
          <div className="chapters-body-wrapper">
            
            {/* Filter Pills Bar */}
            <div className="chapters-tabs-bar" role="tablist" aria-label="Filter chapters by region">
              {filterOptions.map((opt) => {
                const isActive = activeFilter === opt.id;
                const count = CHAPTERS_DATA.filter(c => opt.id === "All" ? true : c.region === opt.id).length;
                return (
                  <button
                    key={opt.id}
                    role="tab"
                    aria-selected={isActive}
                    className={`chapters-tab-btn ${isActive ? "chapters-tab-btn--active" : ""}`}
                    onClick={() => handleFilterChange(opt.id)}
                  >
                    <span>{opt.label}</span>
                    <span className="chapters-tab-count">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Section Header Card with Search Input */}
            <div className="cbl-section-header chapters-section-header">
              <div className="chapters-header-left">
                <Globe2 size={32} />
                <div>
                  <h2 className="cbl-section-title">
                    {activeFilter === "All"
                      ? "Nationwide Regional Network"
                      : `${activeFilter} Regional Chapters`}
                  </h2>
                  <p className="cbl-section-subtitle">
                    Showing {filteredChapters.length} {filteredChapters.length === 1 ? "chapter" : "chapters"} across the Philippines
                  </p>
                </div>
              </div>

              <div className="chapters-search-box">
                <Search size={16} className="chapters-search-icon" />
                <input
                  type="text"
                  placeholder="Search chapter name, region..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search regional chapters"
                />
              </div>
            </div>

            {/* Chapter Cards Grid */}
            {loading ? (
              <SkeletonGrid />
            ) : filteredChapters.length === 0 ? (
              <div className="cbl-empty-state">
                <FileText size={48} />
                <h3>No Chapters Found</h3>
                <p>No regional chapters match your search criteria. Try clearing the search query.</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFilter}
                  className="chapters-grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredChapters.map((chapter) => (
                    <motion.article
                      key={chapter.slug}
                      className="chapters-card"
                      variants={cardVariants}
                    >
                      {/* Cover Photo & Badge */}
                      <div className="chapters-card__cover">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={chapter.cover_image_url}
                          alt={`${chapter.chapter_name} Cover`}
                          className="chapters-card__img"
                        />
                        <span className="chapters-card__badge">{chapter.region}</span>
                      </div>

                      {/* Content Body */}
                      <div className="chapters-card__body">
                        <h3 className="chapters-card__title">{chapter.chapter_name}</h3>

                        <div className="chapters-card__meta">
                          <div className="chapters-card__meta-item">
                            <Calendar size={13} />
                            <span>Est. {chapter.established_year}</span>
                          </div>
                          <div className="chapters-card__meta-item">
                            <GraduationCap size={13} />
                            <span>{chapter.member_institutions_count} Institutions</span>
                          </div>
                        </div>

                        <p className="chapters-card__tagline">{chapter.tagline}</p>

                        <div className="chapters-card__footer">
                          <Link href={`/chapters/${chapter.slug}`} className="chapters-card__cta">
                            <span>View Chapter</span>
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

