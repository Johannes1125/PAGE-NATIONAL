"use client";

import Navbar from "../components/Navbar";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Search, X, LayoutGrid, List, Download, ChevronDown, ChevronUp, BookOpen, ArrowLeft, Users, Share2, Twitter, Link as LinkIcon } from "lucide-react";
import { MOCK_JOURNALS } from "./mock-data";
import { Journal } from "./types";
import "./journals.css";

// ── Icons for Footer ───────────────────────────────────────────────────────
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

// ── Static/Constant Data ────────────────────────────────────────────────────
const DISCIPLINES = ["All", "Humanities", "Social Sciences", "Technology", "Others"];

const CONVENTIONS = [
  { label: "All Conventions", slug: "all" },
  { label: "54th Convention 2024", slug: "54th-national-convention" },
  { label: "53rd Convention 2023", slug: "53rd-national-convention" },
  { label: "52nd Convention 2022", slug: "52nd-national-convention" },
  { label: "51st Convention 2021", slug: "51st-national-convention" },
];

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES = ["Journals", "Articles", "National Activities", "Contact Us"];
const FOOTER_CONTACT = [
  { icon: <MapPinIcon />,      text: "Manila, Philippines" },
  { icon: <MailIconContact />, text: "page@gmail.edu.ph"   },
  { icon: <PhoneIconSm />,     text: "+63 908 XXX XXXX"    },
];

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
    y: 18,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// ── Skeleton Grid Loader Component ──────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="journals-skeleton-grid" aria-busy="true" aria-label="Loading journals">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="journals-skeleton-card">
          <div className="journals-skeleton-card__badge journals-skeleton-shimmer" />
          <div className="journals-skeleton-card__title journals-skeleton-shimmer" />
          <div className="journals-skeleton-card__title-2 journals-skeleton-shimmer" />
          <div className="journals-skeleton-card__author journals-skeleton-shimmer" />
          <div className="journals-skeleton-card__divider" />
          <div className="journals-skeleton-card__line-1 journals-skeleton-shimmer" />
          <div className="journals-skeleton-card__line-2 journals-skeleton-shimmer" />
          <div className="journals-skeleton-card__line-3 journals-skeleton-shimmer" />
          <div className="journals-skeleton-card__footer">
            <div className="journals-skeleton-card__action-1 journals-skeleton-shimmer" />
            <div className="journals-skeleton-card__action-2 journals-skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Individual Journal Item Component (Handles Grid/List & Expansion) ────────
function JournalItem({
  journal,
  viewMode,
  index,
  onCardClick,
}: {
  journal: Journal;
  viewMode: "grid" | "list";
  index: number;
  onCardClick?: (j: Journal) => void;
}) {
  const getDisciplineClass = (discipline: string) => {
    switch (discipline) {
      case "Humanities": return "discipline-badge--humanities";
      case "Social Sciences": return "discipline-badge--social-sciences";
      case "Technology": return "discipline-badge--technology";
      default: return "discipline-badge--others";
    }
  };

  if (viewMode === "grid") {
    return (
      <motion.div
        className="journal-card"
        variants={cardVariants}
        layout="position"
        onClick={() => onCardClick?.(journal)}
        style={{ cursor: "pointer" }}
      >
        <div className="journal-card__cover-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={journal.cover_image}
            alt={journal.title}
            className="journal-card__cover-img"
          />
        </div>
        <div className="journal-card__content">
          <div className="journal-card__badge-row">
            <span className={`discipline-badge ${getDisciplineClass(journal.discipline)}`}>
              {journal.discipline}
            </span>
            <span className="journal-card__issn">ISSN: {journal.issn}</span>
          </div>
          <h3 className="journal-card__title" title={journal.title}>
            {journal.title}
          </h3>
          <p className="journal-card__description line-clamp-3">
            {journal.description}
          </p>
        </div>
      </motion.div>
    );
  }

  // Horizontal list row layout matching Screenshot 1 exactly
  return (
    <motion.div
      className="journal-list-row"
      variants={cardVariants}
      layout="position"
      onClick={() => onCardClick?.(journal)}
      style={{ cursor: "pointer" }}
    >
      <div className="journal-list-row__left">
        <p className="journal-list-row__text">
          <strong className="journal-list-row__title">
            {journal.title}.
          </strong>{" "}
          {journal.description}
        </p>
      </div>
      <div className="journal-list-row__right">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={journal.cover_image}
          alt={journal.title}
          className="journal-list-row__cover-img"
        />
      </div>
    </motion.div>
  );
}

// ── Journal Detail View (Screenshot 2 UPD-Style Portal) ───────────────────────
// ── Journal Detail View (Branded Single Column Portal) ───────────────────────
function JournalDetailView({
  journal,
  onBack,
}: {
  journal: Journal;
  onBack: () => void;
}) {
  return (
    <div className="portal-container">
      {/* Portal Content area */}
      <div className="portal-body">
        <div className="portal-layout">
          
          {/* Main Panel */}
          <main className="portal-main">
            <button className="portal-back-btn" onClick={onBack} aria-label="Back to journals listing">
              <ArrowLeft size={16} /> Back to Journals
            </button>
            
            {/* Journal Info Header Card */}
            <div className="portal-journal-card">
              <div className="portal-journal-card__cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={journal.cover_image} 
                  alt={journal.title} 
                  className="portal-journal-cover-img" 
                />
              </div>
              <div className="portal-journal-card__details">
                <h2 className="portal-journal-title">{journal.title}</h2>
                <div className="portal-journal-meta">
                  <p><strong>Published by:</strong> {journal.publisher}</p>
                  <p><strong>Disciplinary:</strong> {journal.discipline}</p>
                  <p><strong>ISSN:</strong> {journal.issn}</p>
                </div>
                <div className="portal-journal-description">
                  <strong>Description:</strong> {journal.description}
                </div>
              </div>
            </div>

            {/* Articles Section list */}
            <div className="portal-articles-section">
              <h3 className="portal-articles-header">
                Articles - {journal.volume} {journal.issue} {journal.year}
              </h3>
              
              <div className="portal-articles-list">
                {journal.articles.map((article, idx) => (
                  <div key={article.id} className="portal-article-card">
                    <h4 className="portal-article-title">
                      {idx === 0 ? article.title : `${idx}. ${article.title}`}
                    </h4>
                    <p className="portal-article-authors">
                      <strong>Author(s):</strong> {article.authors.join(", ")}
                    </p>
                    <a
                      href={article.download_url}
                      download
                      className="portal-read-btn"
                      onClick={(e) => {
                        alert(`Downloading PDF for "${article.title}"...`);
                      }}
                    >
                      Read Article
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}



// ── Interactive Section Component (Handles States & Filters) ────────────────
function JournalsSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL State values
  const selectedDiscipline = searchParams.get("discipline") || "All";
  const searchQuery = searchParams.get("q") || "";
  const selectedJournalId = searchParams.get("id");

  // Local state for search query to support debouncing
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  // Simulated initial mount delay (600ms)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Sync search input if URL search query changes externally (e.g., clear, back button)
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Debounced URL updates for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput) {
        params.set("q", searchInput);
      } else {
        params.delete("q");
      }
      const currentQs = searchParams.get("q") || "";
      if (currentQs !== searchInput) {
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, pathname, router, searchParams]);

  // Handle immediate URL state changes for pills & selection
  const handleDisciplineChange = (disc: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (disc === "All") {
      params.delete("discipline");
    } else {
      params.set("discipline", disc);
    }
    params.delete("id");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCardClick = (journal: Journal) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", journal.id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  // Filter journals dynamically
  const filteredJournals = MOCK_JOURNALS.filter((journal) => {
    const matchDiscipline = selectedDiscipline === "All" || journal.discipline === selectedDiscipline;
    
    const lowerQuery = searchQuery.toLowerCase();
    const matchSearch = !searchQuery || 
      journal.title.toLowerCase().includes(lowerQuery) ||
      journal.description.toLowerCase().includes(lowerQuery) ||
      journal.articles.some(article => 
        article.title.toLowerCase().includes(lowerQuery) ||
        article.authors.some(author => author.toLowerCase().includes(lowerQuery))
      );

    return matchDiscipline && matchSearch;
  });

  const selectedJournal = selectedJournalId
    ? MOCK_JOURNALS.find(j => j.id === selectedJournalId)
    : null;

  if (selectedJournal) {
    return (
      <JournalDetailView
        journal={selectedJournal}
        onBack={() => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("id");
          router.push(`${pathname}?${params.toString()}`);
        }}
      />
    );
  }

  const hasActiveFilters = selectedDiscipline !== "All" || searchQuery !== "";

  return (
    <>
      {/* Hero section */}
      <section className="journals-hero">
        <div className="journals-container">
          <div className="journals-hero__breadcrumb">
            <Link href="/" className="journals-hero__breadcrumb-link">Home</Link>
            <span className="journals-hero__breadcrumb-sep">/</span>
            <span className="journals-hero__breadcrumb-current">Journals</span>
          </div>
          
          <h1 className="journals-hero__title">
            Journals
          </h1>
          
          <div className="journals-hero__search-wrap">
            <span className="journals-hero__search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="journals-hero__search-input"
              placeholder="Search journals by title or author name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search journals"
            />
            {searchInput && (
              <button
                className="journals-hero__search-clear"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main listing section */}
      <section className="journals-section">
        <div className="journals-container">
          
          {/* Category Header from Screenshot 1 */}
          <div className="journals-category-header">
            <h2 className="journals-category-title">PAGE Refereed Journals.</h2>
            <p className="journals-category-desc">
              The Philippine Association for Graduate Education (PAGE) publishes peer-reviewed refereed journals showcasing outstanding research papers, academic studies, and administrative reviews. These publications promote research excellence and leadership across higher education institutions in the Philippines.
            </p>
          </div>
          
          {/* Toolbar with filters */}
          <div className="journals-toolbar">
            <div className="journals-toolbar__left">
              {/* Discipline pills */}
              <div className="journals-pills" role="tablist" aria-label="Filter by discipline">
                {DISCIPLINES.map((disc) => {
                  const isActive = selectedDiscipline === disc;
                  return (
                    <button
                      key={disc}
                      role="tab"
                      aria-selected={isActive}
                      className={`journals-pill${isActive ? " journals-pill--active" : ""}`}
                      onClick={() => handleDisciplineChange(disc)}
                    >
                      {disc}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="journals-toolbar__right">
              {/* Layout view toggle */}
              <div className="journals-layout-toggle" role="group" aria-label="Adjust view mode">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`journals-toggle-btn${viewMode === "grid" ? " journals-toggle-btn--active" : ""}`}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`journals-toggle-btn${viewMode === "list" ? " journals-toggle-btn--active" : ""}`}
                  title="List View"
                  aria-label="List View"
                >
                  <List size={16} />
                </button>
              </div>

              {/* Reset button */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="journals-reset-btn"
                  aria-label="Clear all filters"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Results meta bar */}
          <div className="journals-meta-row">
            <span className="journals-count">
              {!loading && (
                `Showing ${filteredJournals.length} of ${MOCK_JOURNALS.length} journals`
              )}
              {loading && "Loading publications..."}
            </span>
          </div>

          {/* Loading, Empty and Result Cards */}
          {loading ? (
            <SkeletonGrid />
          ) : (
            <AnimatePresence mode="wait">
              {filteredJournals.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="journals-empty">
                    <div className="journals-empty__icon-wrap">
                      <BookOpen size={28} />
                    </div>
                    <h3 className="journals-empty__title">No Journals Found</h3>
                    <p className="journals-empty__desc">
                      We couldn't find any publications matching your current filters and search query. Try clearing your filters to see more results.
                    </p>
                    <button
                      className="journals-reset-btn"
                      onClick={handleClearFilters}
                      style={{ margin: "0 auto" }}
                    >
                      Clear All Filters
                    </button>
                  </div>
                </motion.div>
              ) : (
                viewMode === "grid" ? (
                  <motion.div
                    key={`${selectedDiscipline}-${searchQuery}-grid`}
                    className="journals-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredJournals.map((journal, index) => (
                      <JournalItem
                        key={journal.id}
                        journal={journal}
                        viewMode="grid"
                        index={index}
                        onCardClick={handleCardClick}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`${selectedDiscipline}-${searchQuery}-list`}
                    className="journals-list"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredJournals.map((journal, index) => (
                      <JournalItem
                        key={journal.id}
                        journal={journal}
                        viewMode="list"
                        index={index}
                        onCardClick={handleCardClick}
                      />
                    ))}
                  </motion.div>
                )
              )}
            </AnimatePresence>
          )}

        </div>
      </section>
    </>
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
                <img
                  src="/PAGE.jpg"
                  alt="PAGE Logo"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
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
              {FOOTER_QUICK_LINKS.map((l) => (
                <li key={l}><a href="#" className="footer__link">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="footer__col-title">Resources</h4>
            <ul className="footer__links">
              {FOOTER_RESOURCES.map((l) => (
                <li key={l}><a href="#" className="footer__link">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer__col-title">Contact</h4>
            <div className="footer__contact-list">
              {FOOTER_CONTACT.map((item) => (
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
            {["Privacy Policy", "Terms of Use"].map((l) => (
              <a key={l} href="#" className="footer__legal-link">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Page Component Wrapper (Handles Scroll Status) ──────────────────────
export default function ResearchJournalsPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Navbar scrolled={scrolled} />
      <main>
        <Suspense fallback={
          <>
            <section className="journals-hero">
              <div className="journals-container">
                <div className="journals-hero__breadcrumb">
                  <span className="journals-hero__breadcrumb-link">Home</span>
                  <span className="journals-hero__breadcrumb-sep">/</span>
                  <span className="journals-hero__breadcrumb-current">Research Journals</span>
                </div>
                <h1 className="journals-hero__title">Research <em>Journals</em></h1>
                <div className="journals-hero__divider" />
                <p className="journals-hero__subtitle">Loading publications...</p>
              </div>
            </section>
            <section className="journals-section">
              <div className="journals-container">
                <SkeletonGrid />
              </div>
            </section>
          </>
        }>
          <JournalsSection />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
