// This chapter detail page derives its data by matching the dynamic route 'slug'
// against the shared chapters mock data defined in '../mock-data.ts'.
// This avoids duplicating mock data structures while keeping chapters dynamic.

"use client";
import Navbar from "../../components/Navbar";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CHAPTERS_DATA } from "../mock-data";
import { Chapter } from "../types";
import Lightbox from "../../components/Lightbox";
import { FileText, FileImage, Presentation, Download, Info, Calendar, MapPin, ChevronDown, Award, Users, BookOpen, AlertCircle } from "lucide-react";
import "./chapter-detail.css";

// ── Shared Navbar Component ─────────────────────────────────────────────────


// ── Detail page animations ──────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── Detail Skeleton Loader ──────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="chapter-detail-skeleton" aria-busy="true">
      <div className="skeleton-hero animate-pulse" />
      <div className="skeleton-container container">
        <div className="skeleton-row">
          <div className="skeleton-main-col">
            <div className="skeleton-card animate-pulse" style={{ height: "240px" }} />
            <div className="skeleton-card animate-pulse" style={{ height: "300px", marginTop: "32px" }} />
          </div>
          <div className="skeleton-sidebar">
            <div className="skeleton-card animate-pulse" style={{ height: "400px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Template ──────────────────────────────────────────────────────
export default function ChapterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  
  // States for Officers tab switcher
  const [selectedTerm, setSelectedTerm] = useState("2024-2026");
  
  // Expanded IDs states
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch / find chapter mock data
  useEffect(() => {
    setLoading(true);
    const found = CHAPTERS_DATA.find((c) => c.slug === slug) ?? null;
    setChapter(found);
    
    // Simulate brief API loading state
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, [slug]);

  if (!loading && !chapter) {
    return (
      <>
        <Navbar scrolled={scrolled} />
        <main className="chapter-detail-error container">
          <div className="acts-error" style={{ padding: "120px 0", textAlign: "center" }}>
            <div className="acts-error__icon" style={{ display: "inline-block", color: "var(--accent)", marginBottom: 16 }}><AlertCircle /></div>
            <h1 className="acts-error__title" style={{ fontFamily: "var(--serif)", fontSize: 32, marginBottom: 12 }}>Chapter Not Found</h1>
            <p className="acts-error__desc" style={{ color: "var(--ink-60)", marginBottom: 24 }}>
              The regional chapter you are looking for does not exist or has been moved.
            </p>
            <Link href="/chapters" className="navbar__signin" style={{ marginLeft: 0 }}>
              Back to Chapters Directory
            </Link>
          </div>
        </main>
      </>
    );
  }

  // Format activity date
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="doc-icon doc-icon--pdf" />;
      case "docx": return <FileText className="doc-icon doc-icon--docx" />;
      case "pptx": return <Presentation className="doc-icon doc-icon--pptx" />;
      case "image": return <FileImage className="doc-icon doc-icon--image" />;
      default: return <FileText className="doc-icon" />;
    }
  };

  const currentOfficers = chapter
    ? chapter.officers.filter((o) => o.term === selectedTerm)
    : [];

  const activityLabels: Record<string, string> = {
    conference: "Conference",
    seminar: "Seminar",
    workshop: "Workshop",
    other: "Other Event",
  };

  const handleTermChange = (term: string) => {
    if (term === selectedTerm) return;
    setSelectedTerm(term);
  };

  const handleOpenLightbox = (index: number) => {
    setLightboxStart(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <Navbar scrolled={scrolled} />

      {/* Access Control Placeholder Guest Banner */}
      <div className="guest-banner">
        <div className="container guest-banner__inner">
          <span className="guest-banner__icon"><Info size={14} /></span>
          <p className="guest-banner__text">
            <strong>Viewing as Guest</strong>. You are currently viewing public information. Editing capabilities are reserved for Chapter PIOs.
          </p>
        </div>
      </div>

      {/* Hero Breadcrumb and Action Section */}
      <section className="chapter-detail-hero-bar">
        <div className="container chapter-detail-hero-bar__inner">
          <div className="chapter-detail-hero-bar__breadcrumb">
            <Link href="/" className="chapter-detail-hero-bar__link">Home</Link>
            <span className="chapter-detail-hero-bar__sep">/</span>
            <Link href="/chapters" className="chapter-detail-hero-bar__link">Chapters</Link>
            <span className="chapter-detail-hero-bar__sep">/</span>
            <span className="chapter-detail-hero-bar__current">{chapter?.chapter_name}</span>
          </div>
          <Link href="/chapters" className="chapter-detail-hero-bar__back">
            &larr; Back to Directory
          </Link>
        </div>
      </section>

      <main style={{ paddingBottom: "100px" }}>
        {loading || !chapter ? (
          <DetailSkeleton />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* ── SECTION 1: Chapter Hero ── */}
            <motion.section className="ch-hero" variants={sectionVariants}>
              <div className="container">
                <div className="ch-hero__card">
                  {/* Left Column: Visual representation */}
                  <div className="ch-hero__visual">
                    <img src={chapter.cover_image_url} alt={chapter.chapter_name} className="ch-hero__img" />
                    <div className="ch-hero__badge">{chapter.region} Region</div>
                  </div>

                  {/* Right Column: Key Details */}
                  <div className="ch-hero__content">
                    <h1 className="ch-hero__title">{chapter.chapter_name}</h1>
                    <p className="ch-hero__tagline">"{chapter.tagline}"</p>
                    <div className="ch-hero__stats">
                      <div className="ch-hero__stat-pill">
                        <Award size={15} />
                        <span>Established {chapter.established_year}</span>
                      </div>
                      <div className="ch-hero__stat-pill">
                        <Users size={15} />
                        <span>{chapter.member_institutions_count} Member Universities</span>
                      </div>
                      <div className="ch-hero__stat-pill">
                        <BookOpen size={15} />
                        <span>{chapter.activities.length} Regional Activities</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Main detail layout */}
            <div className="container chapter-layout">
              {/* ── Main Column ── */}
              <div className="chapter-layout__main">
                {/* ── SECTION 2: About the Chapter ── */}
                <motion.section className="ch-section card-container" variants={sectionVariants}>
                  <h2 className="ch-section__title">About the Chapter</h2>
                  <p className="ch-section__desc">{chapter.description}</p>
                  
                  <div className="ch-mv-grid">
                    <div className="ch-mv-block">
                      <h3 className="ch-mv-block__title">Our Mission</h3>
                      <p className="ch-mv-block__text">{chapter.mission}</p>
                    </div>
                    <div className="ch-mv-block">
                      <h3 className="ch-mv-block__title">Our Vision</h3>
                      <p className="ch-mv-block__text">{chapter.vision}</p>
                    </div>
                  </div>
                </motion.section>

                {/* ── SECTION 3: Chapter Officers ── */}
                <motion.section className="ch-section card-container" variants={sectionVariants}>
                  <div className="ch-section__header-row">
                    <h2 className="ch-section__title">Chapter Officers</h2>
                    
                    {/* Term switcher using layoutId sliding pill */}
                    <div className="term-selector" role="tablist" aria-label="Filter terms">
                      {["2024-2026", "2022-2024"].map((term) => {
                        const isActive = selectedTerm === term;
                        return (
                          <button
                            key={term}
                            role="tab"
                            aria-selected={isActive}
                            className={`term-selector__btn${isActive ? " term-selector__btn--active" : ""}`}
                            onClick={() => handleTermChange(term)}
                          >
                            {term}
                            {isActive && (
                              <motion.div
                                layoutId="active-term-pill"
                                className="term-selector__active-indicator"
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedTerm}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="ch-officers-grid"
                    >
                      {currentOfficers.map((officer) => (
                        <div key={officer.name} className="ch-officer-card">
                          <div className="ch-officer-card__avatar">
                            <Image
                              src={officer.photo_url}
                              width={80}
                              height={80}
                              alt={`${officer.name} profile photo`}
                              unoptimized
                            />
                          </div>
                          <div className="ch-officer-card__info">
                            <span className="ch-officer-card__role">{officer.position}</span>
                            <h4 className="ch-officer-card__name">{officer.name}</h4>
                            <p className="ch-officer-card__uni">{officer.university}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </motion.section>

                {/* ── SECTION 4: Chapter Activities ── */}
                <motion.section className="ch-section card-container" variants={sectionVariants}>
                  <h2 className="ch-section__title">Chapter Activities</h2>
                  <div className="ch-activities-list">
                    {chapter.activities.map((act) => {
                      const isExpanded = expandedActivity === act.title;
                      return (
                        <div key={act.title} className="ch-activity-item">
                          <div
                            className="ch-activity-item__header"
                            onClick={() => setExpandedActivity(isExpanded ? null : act.title)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedActivity(isExpanded ? null : act.title); }}
                          >
                            <div className="ch-activity-item__title-col">
                              <span className={`ch-activity-badge ch-activity-badge--${act.type}`}>
                                {activityLabels[act.type]}
                              </span>
                              <h3 className="ch-activity-item__title">{act.title}</h3>
                            </div>
                            <div className="ch-activity-item__trigger">
                              <span className={`ch-trigger-chevron${isExpanded ? " ch-trigger-chevron--rotated" : ""}`}>
                                <ChevronDown size={18} />
                              </span>
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                              >
                                <div className="ch-activity-item__body">
                                  <div className="ch-activity-item__meta">
                                    <div className="ch-activity-meta-p">
                                      <Calendar size={13} />
                                      <span>{formatDate(act.date)}</span>
                                    </div>
                                    <div className="ch-activity-meta-p">
                                      <MapPin size={13} />
                                      <span>{act.venue}</span>
                                    </div>
                                  </div>
                                  <p className="ch-activity-item__desc">{act.description}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>

                {/* ── SECTION 5: Announcements ── */}
                <motion.section className="ch-section card-container" variants={sectionVariants}>
                  <h2 className="ch-section__title">Recent Announcements</h2>
                  <div className="ch-announcements-list">
                    {chapter.announcements.map((ann) => {
                      const isExpanded = expandedAnnouncement === ann.title;
                      return (
                        <div key={ann.title} className="ch-ann-item">
                          <div
                            className="ch-ann-item__header"
                            onClick={() => setExpandedAnnouncement(isExpanded ? null : ann.title)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedAnnouncement(isExpanded ? null : ann.title); }}
                          >
                            <div>
                              <h3 className="ch-ann-item__title">{ann.title}</h3>
                              <span className="ch-ann-item__date">{formatDate(ann.date)}</span>
                            </div>
                            <div className="ch-ann-item__trigger">
                              <span className={`ch-trigger-chevron${isExpanded ? " ch-trigger-chevron--rotated" : ""}`}>
                                <ChevronDown size={18} />
                              </span>
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                              >
                                <div className="ch-ann-item__body">
                                  <p className="ch-ann-item__text">{ann.body}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              </div>

              {/* ── Sidebar Column ── */}
              <div className="chapter-layout__sidebar">
                {/* ── SECTION 6: Gallery ── */}
                <motion.section className="ch-sidebar-section card-container" variants={sectionVariants}>
                  <h3 className="ch-sidebar-section__title">Photo Gallery</h3>
                  <div className="ch-gallery-grid">
                    {chapter.gallery.map((item, idx) => (
                      <div
                        key={idx}
                        className="ch-gallery-item"
                        onClick={() => handleOpenLightbox(idx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleOpenLightbox(idx); }}
                        aria-label={`Open gallery image ${idx + 1}`}
                      >
                        <img src={item.image_url} alt={item.caption} className="ch-gallery-img" />
                        <div className="ch-gallery-overlay">
                          <span className="ch-gallery-caption">{item.caption}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* ── SECTION 7: Document Repository ── */}
                <motion.section className="ch-sidebar-section card-container" variants={sectionVariants}>
                  <h3 className="ch-sidebar-section__title">Document Repository</h3>
                  <div className="ch-docs-list">
                    {chapter.documents.map((doc) => (
                      <div key={doc.file_name} className="ch-doc-row">
                        <div className="ch-doc-row__info">
                          {getDocIcon(doc.file_type)}
                          <div style={{ minWidth: 0 }}>
                            <p className="ch-doc-filename" title={doc.file_name}>{doc.file_name}</p>
                            <span className="ch-doc-date">Uploaded: {new Date(doc.upload_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <a
                          href={doc.download_url}
                          download={doc.file_name}
                          className="ch-doc-download"
                          aria-label={`Download ${doc.file_name}`}
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </div>
            </div>

            {/* Shared Lightbox Overlay */}
            <AnimatePresence>
              {lightboxOpen && (
                <Lightbox
                  images={chapter.gallery.map(g => g.image_url)}
                  startIndex={lightboxStart}
                  onClose={() => setLightboxOpen(false)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </>
  );
}
