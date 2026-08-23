"use client";
import Navbar from "../../components/Navbar";
import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { chaptersApi } from "../../../lib/api-client";
import Lightbox from "../../components/Lightbox";
import { FileText, FileImage, Presentation, Download, Info, Calendar, MapPin, ChevronDown, Award, Users, BookOpen, AlertCircle } from "lucide-react";
import "./chapter-detail.css";

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
  const [chapter, setChapter] = useState<any | null>(null);
  
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

  // Fetch chapter data from NestJS API by slug
  useEffect(() => {
    async function fetchChapter() {
      try {
        setLoading(true);
        const res = await chaptersApi.get(slug);
        if (res.success && res.data) {
          setChapter(res.data);
        } else {
          setChapter(null);
        }
      } catch (err) {
        console.error("Failed to load chapter:", err);
        setChapter(null);
      } finally {
        setLoading(false);
      }
    }
    fetchChapter();
  }, [slug]);

  // Dynamically extract and group officers' terms from the database
  const terms = useMemo(() => {
    if (!chapter || !chapter.officers || chapter.officers.length === 0) return [];
    const years = Array.from(new Set(chapter.officers.map((o: any) => o.year_joined || 2024))) as number[];
    return years.sort((a, b) => b - a); // latest years first
  }, [chapter]);

  // Selected term year (e.g. 2024 represents "2024-2026")
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    if (terms.length > 0 && selectedYear === null) {
      setSelectedYear(terms[0]);
    }
  }, [terms, selectedYear]);

  const currentOfficers = useMemo(() => {
    if (!chapter || !chapter.officers || selectedYear === null) return [];
    return chapter.officers.filter((o: any) => o.year_joined === selectedYear);
  }, [chapter, selectedYear]);

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
    const t = String(type || "").toLowerCase();
    if (t.includes("pdf")) return <FileText className="doc-icon doc-icon--pdf" />;
    if (t.includes("doc")) return <FileText className="doc-icon doc-icon--docx" />;
    if (t.includes("ppt")) return <Presentation className="doc-icon doc-icon--pptx" />;
    if (t.includes("png") || t.includes("jpg") || t.includes("jpeg") || t.includes("image")) {
      return <FileImage className="doc-icon doc-icon--image" />;
    }
    return <FileText className="doc-icon" />;
  };

  const handleOpenLightbox = (index: number) => {
    setLightboxStart(index);
    setLightboxOpen(true);
  };

  // Mapped values
  const coverImageUrl = chapter?.images?.[0]?.file_url || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='100%' height='100%' fill='%23143152'/><rect width='90%' height='90%' x='5%' y='5%' fill='none' stroke='%23ffffff' stroke-width='2' stroke-opacity='0.1'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-weight='bold' font-size='36' fill='%23ffffff'>PAGE</text></svg>";
  const establishedYear = chapter ? new Date(chapter.created_at).getFullYear() : 2010;
  const taglineText = chapter?.short_description || "Empowering graduate education and research.";
  const overviewText = chapter?.overview || "";
  const missionText = chapter?.mission || "";
  const visionText = chapter?.vision || "";

  return (
    <>
      <Navbar scrolled={scrolled} />

      {/* Hero Breadcrumb and Action Section */}
      <section className="chapter-detail-hero-bar">
        <div className="container chapter-detail-hero-bar__inner">
          <div className="chapter-detail-hero-bar__breadcrumb">
            <Link href="/" className="chapter-detail-hero-bar__link">Home</Link>
            <span className="chapter-detail-hero-bar__sep">/</span>
            <Link href="/chapters" className="chapter-detail-hero-bar__link">Chapters</Link>
            <span className="chapter-detail-hero-bar__sep">/</span>
            <span className="chapter-detail-hero-bar__current">{chapter?.title}</span>
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
                    <img src={coverImageUrl} alt={chapter.title} className="ch-hero__img" />
                    <div className="ch-hero__badge">{chapter.region} Region</div>
                  </div>

                  {/* Right Column: Key Details */}
                  <div className="ch-hero__content">
                    <h1 className="ch-hero__title">{chapter.title}</h1>
                    <p className="ch-hero__tagline">"{taglineText}"</p>
                    <div className="ch-hero__stats">
                      <div className="ch-hero__stat-pill">
                        <Award size={15} />
                        <span>Established {establishedYear}</span>
                      </div>
                      <div className="ch-hero__stat-pill">
                        <Users size={15} />
                        <span>{chapter.officers?.length || 10} Chapter Officers</span>
                      </div>
                      <div className="ch-hero__stat-pill">
                        <BookOpen size={15} />
                        <span>{chapter.activities?.length || 0} Regional Activities</span>
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
                  <p className="ch-section__desc">{overviewText}</p>
                  
                  {(missionText || visionText) && (
                    <div className="ch-mv-grid">
                      {missionText && (
                        <div className="ch-mv-block">
                          <h3 className="ch-mv-block__title">Our Mission</h3>
                          <p className="ch-mv-block__text">{missionText}</p>
                        </div>
                      )}
                      {visionText && (
                        <div className="ch-mv-block">
                          <h3 className="ch-mv-block__title">Our Vision</h3>
                          <p className="ch-mv-block__text">{visionText}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.section>

                {/* ── SECTION 3: Chapter Officers ── */}
                <motion.section className="ch-section card-container" variants={sectionVariants}>
                  <div className="ch-section__header-row">
                    <h2 className="ch-section__title">Chapter Officers</h2>
                    
                    {/* Term switcher using dynamic terms */}
                    {terms.length > 0 && (
                      <div className="term-selector" role="tablist" aria-label="Filter terms">
                        {terms.map((year) => {
                          const label = `${year}-${year + 2}`;
                          const isActive = selectedYear === year;
                          return (
                            <button
                              key={year}
                              role="tab"
                              aria-selected={isActive}
                              className={`term-selector__btn${isActive ? " term-selector__btn--active" : ""}`}
                              onClick={() => setSelectedYear(year)}
                            >
                              {label}
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
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {currentOfficers.length === 0 ? (
                      <p style={{ color: "var(--af-text-muted)", fontSize: "14px" }}>No officers configured for this term.</p>
                    ) : (
                      <motion.div
                        key={selectedYear}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25 }}
                        className="ch-officers-grid"
                      >
                        {currentOfficers.map((officer: any) => (
                          <div key={officer.id} className="ch-officer-card">
                            <div className="ch-officer-card__avatar">
                              <img
                                src={officer.image_url || "/images/officer-placeholder.png"}
                                width={80}
                                height={80}
                                alt={`${officer.name} profile photo`}
                                style={{ objectFit: "cover", borderRadius: "50%", width: "100%", height: "100%" }}
                              />
                            </div>
                            <div className="ch-officer-card__info">
                              <span className="ch-officer-card__role">{officer.category_type}</span>
                              <h4 className="ch-officer-card__name">{officer.name}</h4>
                              <p className="ch-officer-card__uni">Member University</p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.section>

                {/* ── SECTION 4: Chapter Activities ── */}
                <motion.section className="ch-section card-container" variants={sectionVariants}>
                  <h2 className="ch-section__title">Chapter Activities</h2>
                  {(!chapter.activities || chapter.activities.length === 0) ? (
                    <p style={{ color: "var(--af-text-muted)", fontSize: "14px" }}>No recent activities listed.</p>
                  ) : (
                    <div className="ch-activities-list">
                      {chapter.activities.map((act: any) => {
                        const isExpanded = expandedActivity === act.id;
                        return (
                          <div key={act.id} className="ch-activity-item">
                            <div
                              className="ch-activity-item__header"
                              onClick={() => setExpandedActivity(isExpanded ? null : act.id)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedActivity(isExpanded ? null : act.id); }}
                            >
                              <div className="ch-activity-item__title-col">
                                <span className="ch-activity-badge ch-activity-badge--conference">
                                  Event
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
                                    </div>
                                    <p className="ch-activity-item__desc">{act.description}</p>
                                    {act.image_url && (
                                      <img src={act.image_url} alt={act.title} className="ch-activity-img" style={{ marginTop: "12px", maxWidth: "100%", borderRadius: "8px" }} />
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.section>

                {/* ── SECTION 5: Announcements ── */}
                <motion.section className="ch-section card-container" variants={sectionVariants}>
                  <h2 className="ch-section__title">Recent Announcements</h2>
                  {(!chapter.announcements || chapter.announcements.length === 0) ? (
                    <p style={{ color: "var(--af-text-muted)", fontSize: "14px" }}>No recent announcements.</p>
                  ) : (
                    <div className="ch-announcements-list">
                      {chapter.announcements.map((ann: any) => {
                        const isExpanded = expandedAnnouncement === ann.id;
                        return (
                          <div key={ann.id} className="ch-ann-item">
                            <div
                              className="ch-ann-item__header"
                              onClick={() => setExpandedAnnouncement(isExpanded ? null : ann.id)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandedAnnouncement(isExpanded ? null : ann.id); }}
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
                                    <p className="ch-ann-item__text">{ann.content}</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.section>
              </div>

              {/* ── Sidebar Column ── */}
              <div className="chapter-layout__sidebar">
                {/* ── SECTION 6: Gallery ── */}
                <motion.section className="ch-sidebar-section card-container" variants={sectionVariants}>
                  <h3 className="ch-sidebar-section__title">Photo Gallery</h3>
                  {(!chapter.images || chapter.images.length === 0) ? (
                    <p style={{ color: "var(--af-text-muted)", fontSize: "14px", margin: 0 }}>No photos uploaded yet.</p>
                  ) : (
                    <div className="ch-gallery-grid">
                      {chapter.images.map((item: any, idx: number) => (
                        <div
                          key={item.id}
                          className="ch-gallery-item"
                          onClick={() => handleOpenLightbox(idx)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleOpenLightbox(idx); }}
                          aria-label={`Open gallery image ${idx + 1}`}
                        >
                          <img src={item.file_url} alt={item.file_name} className="ch-gallery-img" />
                          <div className="ch-gallery-overlay">
                            <span className="ch-gallery-caption">{item.file_name || "Gallery Image"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.section>

                {/* ── SECTION 7: Document Repository ── */}
                <motion.section className="ch-sidebar-section card-container" variants={sectionVariants}>
                  <h3 className="ch-sidebar-section__title">Document Repository</h3>
                  {(!chapter.documents || chapter.documents.length === 0) ? (
                    <p style={{ color: "var(--af-text-muted)", fontSize: "14px", margin: 0 }}>No documents available.</p>
                  ) : (
                    <div className="ch-docs-list">
                      {chapter.documents.map((doc: any) => (
                        <div key={doc.id} className="ch-doc-row">
                          <div className="ch-doc-row__info">
                            {getDocIcon(doc.file_type)}
                            <div style={{ minWidth: 0 }}>
                              <p className="ch-doc-filename" title={doc.file_name}>{doc.file_name}</p>
                              <span className="ch-doc-date">Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <a
                            href={doc.file_url}
                            download={doc.file_name}
                            className="ch-doc-download"
                            aria-label={`Download ${doc.file_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.section>
              </div>
            </div>

            {/* Shared Lightbox Overlay */}
            <AnimatePresence>
              {lightboxOpen && chapter.images && (
                <Lightbox
                  images={chapter.images.map((g: any) => g.file_url)}
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
