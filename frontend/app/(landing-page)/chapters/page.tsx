"use client";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CHAPTERS_DATA } from "./mock-data";
import { Chapter } from "./types";
import "./chapters.css";

// ── Icon Components ────────────────────────────────────────────────────────

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const SchoolIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
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

const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
  </svg>
);

// ── Shared Data ────────────────────────────────────────────────────────────

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES    = ["Journals", "Articles", "Upcoming Activities", "Contact Us"];
const FOOTER_CONTACT = [
  { icon: <MapPinIcon />,      text: "Manila, Philippines" },
  { icon: <MailIconContact />, text: "page@gmail.edu.ph"   },
  { icon: <PhoneIcon />,       text: "+63 908 XXX XXXX"    },
];


// ── Chapters Hero Component ─────────────────────────────────────────────────
function ChaptersHero() {
  return (
    <section className="chapters-hero">
      <div className="container">
        <div className="chapters-hero__breadcrumb">
          <Link href="/" className="chapters-hero__breadcrumb-link">Home</Link>
          <span className="chapters-hero__breadcrumb-sep">/</span>
          <span className="chapters-hero__breadcrumb-current">Chapters</span>
        </div>
        <h1 className="chapters-hero__title">
          Regional Chapters
        </h1>
        <div className="chapters-hero__divider" />
        <p className="chapters-hero__subtitle">
          Discover PAGE's 18 regional chapters across the Philippines. Explore their local leadership, academic initiatives, and research collaborations.
        </p>
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

// ── Footer Component ────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__columns">
          <div>
            <div className="footer__brand-logo">
              <div className="footer__logo-mark">
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

          <div>
            <h4 className="footer__col-title">Quick Links</h4>
            <ul className="footer__links">
              {FOOTER_QUICK_LINKS.map(l => (
                <li key={l}><a href="#" className="footer__link">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer__col-title">Resources</h4>
            <ul className="footer__links">
              {FOOTER_RESOURCES.map(l => (
                <li key={l}><a href="#" className="footer__link">{l}</a></li>
              ))}
            </ul>
          </div>

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

// ── Framer Motion Stagger Variants ──────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
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

// ── Main Directory Page Component ────────────────────────────────────────────
export default function ChaptersPage() {
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"All" | "Luzon" | "Visayas" | "Mindanao">("All");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    
    // Simulate loading for loading state presentation
    const timer = setTimeout(() => setLoading(false), 550);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleFilterChange = (filter: "All" | "Luzon" | "Visayas" | "Mindanao") => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
    
    // Brief loading animation toggle to recreate stagger layout transition nicely
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  };

  const filteredChapters = CHAPTERS_DATA.filter((chapter) =>
    activeFilter === "All" ? true : chapter.region === activeFilter
  );

  const filterOptions: Array<"All" | "Luzon" | "Visayas" | "Mindanao"> = ["All", "Luzon", "Visayas", "Mindanao"];

  return (
    <>
      <Navbar scrolled={scrolled} />
      <main>
        <ChaptersHero />
        
        <section className="chapters-section">
          <div className="container">
            {/* Filter pills */}
            <div className="chapters-filters" role="tablist" aria-label="Filter chapters by region">
              {filterOptions.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    role="tab"
                    aria-selected={isActive}
                    className={`chapters-filter-btn${isActive ? " chapters-filter-btn--active" : ""}`}
                    onClick={() => handleFilterChange(filter)}
                  >
                    {filter}
                    {isActive && (
                      <motion.div
                        layoutId="active-region-pill"
                        className="chapters-filter-active-indicator"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <SkeletonGrid />
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
                    <motion.div
                      key={chapter.slug}
                      className="chapters-card"
                      variants={cardVariants}
                    >
                      {/* Cover Photo */}
                      <div className="chapters-card__cover">
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
                            <CalendarIcon />
                            <span>Est. {chapter.established_year}</span>
                          </div>
                          <div className="chapters-card__meta-item">
                            <SchoolIcon />
                            <span>{chapter.member_institutions_count} Institutions</span>
                          </div>
                        </div>

                        <p className="chapters-card__tagline">{chapter.tagline}</p>
                        
                        <div className="chapters-card__footer">
                          <Link href={`/chapters/${chapter.slug}`} className="chapters-card__cta">
                            View Chapter <ArrowRightIcon />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
