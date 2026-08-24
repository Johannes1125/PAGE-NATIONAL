"use client";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { api } from "../../lib/api-client";
import "./convention.css";

// ── Icon Components ────────────────────────────────────────────────────────

const MapPinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const MailIconSm = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MailIconContact = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIconSm = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
  </svg>
);

// ── Shared Data ────────────────────────────────────────────────────────────

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES    = ["Journals", "Articles", "National Activities", "Contact Us"];
const FOOTER_CONTACT = [
  { icon: <MapPinIcon />,      text: "Manila, Philippines" },
  { icon: <MailIconContact />, text: "page@gmail.edu.ph"   },
  { icon: <PhoneIconSm />,     text: "+63 908 XXX XXXX"    },
];

// ── Shared Navbar Component ─────────────────────────────────────────────────


// ── Convention Hero Component ───────────────────────────────────────────────
function ConventionHero() {
  return (
    <section className="cbl-hero">
      <div className="cbl-hero-container">
        <div className="cbl-breadcrumb">
          <Link href="/" className="cbl-breadcrumb-link">Home</Link>
          <span className="cbl-breadcrumb-sep">/</span>
          <span className="cbl-breadcrumb-current">Convention Archives</span>
        </div>

        <div className="cbl-hero-left">
          <h1 className="cbl-hero-title">National Conventions</h1>
          <div className="cbl-gold-line" />
          <p className="cbl-hero-subtitle">
            Browse our archives of past PAGE National Conventions. Explore themes, program schedules, speakers, academic journals, and photo galleries of graduate education leadership.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Skeleton Grid Loader Component ──────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="convention-grid" aria-busy="true" aria-label="Loading conventions">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="convention-card-skeleton animate-pulse">
          <div className="convention-card-skeleton__cover" />
          <div className="convention-card-skeleton__body">
            <div className="convention-card-skeleton__pill" />
            <div className="convention-card-skeleton__title" />
            <div className="convention-card-skeleton__line" />
            <div className="convention-card-skeleton__line" style={{ width: "80%" }} />
            <div className="convention-card-skeleton__footer" />
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
      staggerChildren: 0.06,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
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

export default function ConventionArchivesPage() {
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conventions, setConventions] = useState<any[]>([]);

  // Filter states
  const [selectedNum, setSelectedNum] = useState<string>("All");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);

    async function loadConventions() {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; data?: any[] }>("/conventions/public");
        if (res.success && Array.isArray(res.data)) {
          const mapped = res.data.map((c: any) => {
            const coverImage = c.attachments?.find((a: any) => a.file_type === "image")?.file_url || 
              "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop";
            
            const startDate = new Date(c.start_date);
            const endDate = new Date(c.end_date);
            const year = startDate.getFullYear();
            
            const formatDateShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const dateRange = formatDateShort(startDate) === formatDateShort(endDate) 
              ? formatDateShort(startDate) 
              : `${formatDateShort(startDate)} – ${formatDateShort(endDate)}`;

            const cleanNum = (c.convention_number || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            const slug = `${cleanNum}-national-convention`;

            return {
              ...c,
              slug,
              theme: c.title,
              year,
              date_range: dateRange,
              cover_image_url: coverImage,
            };
          });
          setConventions(mapped);
        } else {
          setConventions([]);
        }
      } catch (err) {
        console.error("Failed to load conventions:", err);
        setConventions([]);
      } finally {
        setLoading(false);
      }
    }

    loadConventions();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Compute unique values for filter controls
  const conventionNumbers = ["All", ...Array.from(new Set(conventions.map(c => c.convention_number || c.year || "Annual")))];

  const handleNumChange = (num: string) => {
    if (num === selectedNum) return;
    setSelectedNum(num);
  };

  const resetFilters = () => {
    setSelectedNum("All");
  };

  // Filter logic
  const filteredConventions = conventions.filter((c) => {
    const num = c.convention_number || c.year || "Annual";
    return selectedNum === "All" || num === selectedNum;
  });

  const hasFiltersActive = selectedNum !== "All";

  return (
    <>
      <Navbar scrolled={scrolled} />
      <main>
        <ConventionHero />

        <section className="convention-section">
          <div className="container">
            {/* Filters panel */}
            <div className="convention-filters-container">
              <div className="convention-filter-group">
                <span className="convention-filter-label">Convention Edition</span>
                <div className="convention-filter-pills" role="tablist" aria-label="Filter by edition">
                  {conventionNumbers.map((num) => {
                    const isActive = selectedNum === num;
                    return (
                      <button
                        key={num}
                        role="tab"
                        aria-selected={isActive}
                        className={`convention-filter-btn${isActive ? " convention-filter-btn--active" : ""}`}
                        onClick={() => handleNumChange(num)}
                      >
                        {num === "All" ? "All Editions" : num}
                        {isActive && (
                          <motion.div
                            layoutId="active-num-pill"
                            className="convention-filter-active-indicator"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {hasFiltersActive && (
                <div className="convention-filter-reset">
                  <button className="btn-reset" onClick={resetFilters}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <SkeletonGrid />
            ) : (
              <AnimatePresence mode="wait">
                {filteredConventions.length === 0 ? (
                  <motion.div
                    key="empty"
                    className="convention-empty-state"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <h3>No conventions found</h3>
                    <p>No past archives match your selected filter criteria. Try resetting the filters.</p>
                    <button className="btn-reset" onClick={resetFilters}>
                      Reset Filters
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedNum}
                    className="convention-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredConventions.map((c) => (
                      <motion.div
                        key={c.slug}
                        className="convention-card"
                        variants={cardVariants}
                      >
                        {/* Cover Image */}
                        <div className="convention-card__cover">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.cover_image_url}
                            alt={`${c.convention_number} PAGE Convention Cover`}
                            className="convention-card__img"
                          />
                          <div className="convention-card__year-badge">{c.year}</div>
                        </div>

                        {/* Content */}
                        <div className="convention-card__body">
                          <span className="convention-card__edition">{c.convention_number} National Convention</span>
                          <h3 className="convention-card__title" title={c.theme}>{c.theme}</h3>

                          <div className="convention-card__meta">
                            <div className="convention-card__meta-item">
                              <MapPinIcon />
                              <span>{c.location}</span>
                            </div>
                            <div className="convention-card__meta-item">
                              <CalendarIcon />
                              <span>{c.date_range}</span>
                            </div>
                          </div>

                          <div className="convention-card__footer">
                            <Link href={`/convention/${c.slug}`} className="convention-card__cta">
                              View Convention Archives <ArrowRightIcon />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
