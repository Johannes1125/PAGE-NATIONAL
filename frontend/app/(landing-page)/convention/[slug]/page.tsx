// The convention detail page slug template matching pattern:
// This page dynamically extracts the route parameter `slug` and looks up the
// corresponding convention object in CONVENTIONS_DATA from `../mock-data.ts`.
// If the convention exists, it is rendered via the detail template.
// If not found, a styled "Convention Not Found" error state is displayed.
// This allows a single reusable slug page structure to handle all conventions.

"use client";
import Navbar from "../../components/Navbar";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CONVENTIONS_DATA } from "../mock-data";
import { Convention } from "../types";
import Lightbox from "../../components/Lightbox";
import { Calendar, MapPin, ChevronDown, Download, AlertCircle, ArrowLeft, BookOpen, Mic, Activity, Layers, Image as ImageIcon } from "lucide-react";
import "./convention-detail.css";

// ── Icon Components ────────────────────────────────────────────────────────

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

const MapPinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
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


// ── Detail page entrance animations ─────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── Skeleton Loader Component ────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="conv-detail-skeleton" aria-busy="true">
      <div className="skeleton-hero animate-pulse" />
      <div className="skeleton-container container">
        <div className="skeleton-grid">
          <div className="skeleton-main">
            <div className="skeleton-card animate-pulse" style={{ height: "280px" }} />
            <div className="skeleton-card animate-pulse" style={{ height: "350px", marginTop: "32px" }} />
            <div className="skeleton-card animate-pulse" style={{ height: "300px", marginTop: "32px" }} />
          </div>
          <div className="skeleton-sidebar">
            <div className="skeleton-card animate-pulse" style={{ height: "380px" }} />
            <div className="skeleton-card animate-pulse" style={{ height: "240px", marginTop: "32px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Footer Component ────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__columns">
          {/* Brand */}
          <div>
            <div className="footer__brand-logo">
              <div className="footer__logo-mark">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/PAGE.jpg" alt="PAGE Logo" onError={(e) => { e.currentTarget.style.display="none"; }} />
              </div>
              <div>
                <div className="footer__logo-name">PAGE</div>
                <div className="footer__logo-sub">An academic towards to excellence</div>
              </div>
            </div>
            <p className="footer__brand-desc">
              Philippine Association for Graduate Education — advancing excellence through collaboration and research.
            </p>
            <div className="footer__socials">
              {[<FacebookIcon key="fb" />, <InstagramIcon key="ig" />, <MailIconSm key="mail" />].map((icon, i) => (
                <button key={i} className="footer__social-btn">{icon}</button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer__col-title">Quick Links</h4>
            <ul className="footer__links">
              {FOOTER_QUICK_LINKS.map(l => (
                <li key={l}><a href="#" className="footer__link">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="footer__col-title">Resources</h4>
            <ul className="footer__links">
              {FOOTER_RESOURCES.map(l => (
                <li key={l}><a href="#" className="footer__link">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer__col-title">Contact</h4>
            <div className="footer__contact-list">
              {FOOTER_CONTACT.map(item => (
                <div key={item.text} className="footer__contact-item">
                  <span className="footer__contact-icon">{item.icon}</span>
                  <span className="footer__contact-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © 2026 Philippine Association for Graduate Education. All rights reserved.
          </p>
          <div className="footer__legal">
            {["Privacy Policy", "Terms of Use"].map(l => (
              <a key={l} href="#" className="footer__legal-link">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Page Template ──────────────────────────────────────────────────────
export default function ConventionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [convention, setConvention] = useState<Convention | null>(null);

  // States
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [expandedJournal, setExpandedJournal] = useState<string | null>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch / find convention mock data
  useEffect(() => {
    const t1 = setTimeout(() => {
      setLoading(true);
    }, 0);

    const t2 = setTimeout(() => {
      const found = CONVENTIONS_DATA.find((c) => c.slug === slug) ?? null;
      setConvention(found);
      setLoading(false);
    }, 650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [slug]);

  if (!loading && !convention) {
    return (
      <>
        <Navbar scrolled={scrolled} />
        <main className="convention-detail-error container">
          <div className="conv-error">
            <div className="conv-error__icon"><AlertCircle /></div>
            <h1 className="conv-error__title">Convention Not Found</h1>
            <p className="conv-error__desc">
              The convention archive you are requesting could not be found or has not been uploaded yet.
            </p>
            <Link href="/convention" className="btn-back-archive">
              <ArrowLeft size={14} /> Back to Convention Archives
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleOpenLightbox = (index: number) => {
    setLightboxStart(index);
    setLightboxOpen(true);
  };

  const activityLabels: Record<string, string> = {
    workshop: "Workshop",
    forum: "Forum",
    competition: "Competition",
    cultural: "Cultural",
    other: "Other Event"
  };

  return (
    <>
      <Navbar scrolled={scrolled} />

      {/* Hero Breadcrumb and Action Section */}
      <section className="convention-detail-hero-bar">
        <div className="container convention-detail-hero-bar__inner">
          <div className="convention-detail-hero-bar__breadcrumb">
            <Link href="/" className="convention-detail-hero-bar__link">Home</Link>
            <span className="convention-detail-hero-bar__sep">/</span>
            <Link href="/convention" className="convention-detail-hero-bar__link">Convention</Link>
            <span className="convention-detail-hero-bar__sep">/</span>
            <span className="convention-detail-hero-bar__current">
              {convention ? `${convention.convention_number} — ${convention.year}` : ""}
            </span>
          </div>
          <Link href="/convention" className="convention-detail-hero-bar__back">
            &larr; Back to Archives
          </Link>
        </div>
      </section>

      <main style={{ paddingBottom: "100px" }}>
        {loading || !convention ? (
          <DetailSkeleton />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* ── SECTION 1: Convention Hero ── */}
            <motion.section className="conv-hero" variants={sectionVariants}>
              <div className="container">
                <div className="conv-hero__card">
                  {/* Visual representation */}
                  <div className="conv-hero__visual">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={convention.cover_image_url} alt={`${convention.convention_number} Cover`} className="conv-hero__img" />
                    <div className="conv-hero__badge">{convention.year}</div>
                  </div>

                  {/* Content */}
                  <div className="conv-hero__content">
                    <span className="conv-hero__edition">{convention.convention_number} National Convention</span>
                    <h1 className="conv-hero__title">{convention.theme}</h1>
                    
                    <div className="conv-hero__stats">
                      <div className="conv-hero__stat-pill">
                        <MapPin size={14} />
                        <span>{convention.location}</span>
                      </div>
                      <div className="conv-hero__stat-pill">
                        <Calendar size={14} />
                        <span>{convention.date_range}</span>
                      </div>
                    </div>

                    <p className="conv-hero__intro">{convention.intro_paragraph}</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Layout Grid */}
            <div className="container conv-layout">
              {/* Main Column */}
              <div className="conv-layout__main">
                
                {/* ── SECTION 2: Program Schedule ── */}
                <motion.section className="conv-section card-container" variants={sectionVariants}>
                  <div className="conv-section__header-row">
                    <div className="conv-section__title-group">
                      <Layers className="section-icon" />
                      <h2 className="conv-section__title">Program Schedule</h2>
                    </div>

                    {/* Day selector with sliding indicator layoutId */}
                    <div className="day-selector" role="tablist" aria-label="Filter schedule days">
                      {convention.program_schedule.map((day) => {
                        const isActive = selectedDay === day.day_number;
                        return (
                          <button
                            key={day.day_number}
                            role="tab"
                            aria-selected={isActive}
                            className={`day-selector__btn${isActive ? " day-selector__btn--active" : ""}`}
                            onClick={() => setSelectedDay(day.day_number)}
                          >
                            Day {day.day_number}
                            {isActive && (
                              <motion.div
                                layoutId="active-day-pill"
                                className="day-selector__active-indicator"
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="schedule-date-label">
                    Schedule for {convention.program_schedule.find(d => d.day_number === selectedDay)?.date}
                  </p>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedDay}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.22 }}
                      className="conv-timeline"
                    >
                      {convention.program_schedule
                        .find((d) => d.day_number === selectedDay)
                        ?.sessions.map((session, index) => (
                          <div key={index} className="timeline-item">
                            <div className="timeline-time">{session.time}</div>
                            <div className="timeline-marker">
                              <span className="timeline-dot" />
                              <span className="timeline-line" />
                            </div>
                            <div className="timeline-content">
                              <div className="timeline-header-row">
                                <span className={`session-badge session-badge--${session.session_type}`}>
                                  {session.session_type}
                                </span>
                                <span className="session-venue">
                                  <MapPin size={12} /> {session.room_or_venue}
                                </span>
                              </div>
                              <h4 className="session-title">{session.session_title}</h4>
                            </div>
                          </div>
                        ))}
                    </motion.div>
                  </AnimatePresence>
                </motion.section>

                {/* ── SECTION 3: Speakers ── */}
                <motion.section className="conv-section card-container" variants={sectionVariants}>
                  <div className="conv-section__title-group" style={{ marginBottom: "24px" }}>
                    <Mic className="section-icon" />
                    <h2 className="conv-section__title">Distinguished Speakers</h2>
                  </div>

                  <div className="speakers-grid">
                    {convention.speakers.map((speaker, idx) => (
                      <div key={idx} className="speaker-card">
                        <div className="speaker-card__image-container">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={speaker.photo_url}
                            alt={`${speaker.name} portrait`}
                            className="speaker-card__img"
                          />
                          {/* Hover overlay with Framer Motion */}
                          <div className="speaker-card__overlay">
                            <div className="speaker-card__overlay-content">
                              <span className="speaker-card__overlay-label">Presentation Topic</span>
                              <p className="speaker-card__overlay-text">&ldquo;{speaker.topic}&rdquo;</p>
                            </div>
                          </div>
                        </div>

                        <div className="speaker-card__body">
                          <h4 className="speaker-card__name">{speaker.name}</h4>
                          <span className="speaker-card__title">{speaker.title}</span>
                          <span className="speaker-card__org">{speaker.organization}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* ── SECTION 4: Activities Conducted ── */}
                <motion.section className="conv-section card-container" variants={sectionVariants}>
                  <div className="conv-section__title-group" style={{ marginBottom: "24px" }}>
                    <Activity className="section-icon" />
                    <h2 className="conv-section__title">Activities Conducted</h2>
                  </div>

                  <div className="activities-list">
                    {convention.activities.map((act) => {
                      const isExpanded = expandedActivity === act.title;
                      return (
                        <div key={act.title} className="activity-item">
                          <div
                            className="activity-item__header"
                            onClick={() => setExpandedActivity(isExpanded ? null : act.title)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                setExpandedActivity(isExpanded ? null : act.title);
                              }
                            }}
                          >
                            <div className="activity-item__title-col">
                              <span className={`activity-badge activity-badge--${act.type}`}>
                                {activityLabels[act.type]}
                              </span>
                              <h3 className="activity-item__title">{act.title}</h3>
                            </div>
                            <div className="activity-item__trigger">
                              <span className={`trigger-chevron${isExpanded ? " trigger-chevron--rotated" : ""}`}>
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
                                <div className="activity-item__body">
                                  <div className="activity-item__meta">
                                    <div className="activity-meta-p">
                                      <Calendar size={13} />
                                      <span>{act.date}</span>
                                    </div>
                                    <div className="activity-meta-p">
                                      <MapPin size={13} />
                                      <span>{act.venue}</span>
                                    </div>
                                  </div>
                                  <p className="activity-item__desc">{act.description}</p>
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

              {/* Sidebar Column */}
              <div className="conv-layout__sidebar">
                
                {/* ── SECTION 5: Journals ── */}
                <motion.section className="conv-sidebar-section card-container" variants={sectionVariants}>
                  <div className="conv-section__title-group" style={{ marginBottom: "20px" }}>
                    <BookOpen className="sidebar-section-icon" />
                    <h3 className="conv-sidebar-section__title">Published Journals</h3>
                  </div>

                  <div className="journals-list">
                    {convention.journals.map((journal, index) => {
                      const isExpanded = expandedJournal === journal.title;
                      return (
                        <div key={index} className="journal-row">
                          <div className="journal-row__header">
                            <h4 className="journal-title" title={journal.title}>{journal.title}</h4>
                            <span className="journal-meta">
                              {journal.volume} • {journal.issue}
                            </span>
                            <p className="journal-authors">
                              By: {journal.authors.join(", ")}
                            </p>
                          </div>

                          <div className="journal-actions">
                            <button 
                              className="btn-toggle-abstract" 
                              onClick={() => setExpandedJournal(isExpanded ? null : journal.title)}
                            >
                              {isExpanded ? "Hide Abstract" : "View Abstract"}
                            </button>
                            {/* Real <a> tag with download attribute as requested */}
                            <a
                              href={journal.download_url}
                              download={`PAGE-${convention.year}-${journal.title.slice(0, 15)}.pdf`}
                              className="btn-download-journal"
                              aria-label={`Download journal ${journal.title}`}
                            >
                              <Download size={13} /> Download
                            </a>
                          </div>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.24 }}
                                style={{ overflow: "hidden" }}
                              >
                                <div className="journal-abstract">
                                  <strong>Abstract Excerpt:</strong>
                                  <p>{journal.abstract_excerpt}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>

                {/* ── SECTION 6: Photo Gallery ── */}
                <motion.section className="conv-sidebar-section card-container" variants={sectionVariants}>
                  <div className="conv-section__title-group" style={{ marginBottom: "20px" }}>
                    <ImageIcon className="sidebar-section-icon" />
                    <h3 className="conv-sidebar-section__title">Photo Gallery</h3>
                  </div>

                  <div className="gallery-grid">
                    {convention.gallery.map((item, idx) => (
                      <div
                        key={idx}
                        className="gallery-item"
                        onClick={() => handleOpenLightbox(idx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleOpenLightbox(idx);
                          }
                        }}
                        aria-label={`Open gallery image ${idx + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image_url} alt={item.caption} className="gallery-img" />
                        <div className="gallery-overlay">
                          <span className="gallery-caption">{item.caption}</span>
                        </div>
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
                  images={convention.gallery.map(g => g.image_url)}
                  startIndex={lightboxStart}
                  onClose={() => setLightboxOpen(false)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
      <Footer />
    </>
  );
}
