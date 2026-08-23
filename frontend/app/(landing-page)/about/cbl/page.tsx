"use client";
import Navbar from "../../components/Navbar";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { type CBLData } from "./mock-data";
import { api } from "../../../lib/api-client";
import "./cbl.css";

// ── Icon Components ────────────────────────────────────────────────────────

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const ScalesIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18M3 7h18" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── About Page Header ──────────────────────────────────────────────────────
function AboutHero({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="cbl-hero">
      <div className="cbl-hero-container">
        <div className="cbl-breadcrumb">
          <Link href="/" className="cbl-breadcrumb-link">Home</Link>
          <span className="cbl-breadcrumb-sep">/</span>
          <Link href="/about" className="cbl-breadcrumb-link">About</Link>
          <span className="cbl-breadcrumb-sep">/</span>
          <span className="cbl-breadcrumb-current">Constitution & By-Laws</span>
        </div>
        
        <div className="cbl-hero-left">
          <div className="cbl-label">
            <span className="cbl-label-dot" />
            <span>GOVERNANCE FRAMEWORK</span>
          </div>
          <h1 className="cbl-hero-title">{title && title.trim().toLowerCase() !== "csa" ? title : "Constitution and By-Laws"}</h1>
          <div className="cbl-gold-line" />
          <p className="cbl-hero-subtitle">{subtitle || "The official governance framework, organizational principles, and rules guiding the operations of PAGE."}</p>
        </div>
      </div>
    </section>
  );
}

// ── Skeleton Placeholder ──
function CBLSkeleton() {
  return (
    <div className="cbl-content-grid">
      {/* Left side skeleton accordion */}
      <div className="cbl-articles-section">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-accordion-item skeleton-pulse" />
        ))}
      </div>
      
      {/* Right side skeleton info card */}
      <div className="skeleton-cbl-sidebar skeleton-pulse" />
    </div>
  );
}

// ── Framer Motion Page Transition & List Variants ──

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const leftSideVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const rightSideVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 } },
};

const accordionItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

// ── Main Page Component ────────────────────────────────────────────────────
export default function CBLInformationPage() {
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cbl, setCbl] = useState<CBLData | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    
    const fetchCBL = async () => {
      try {
        const res = await api.get("/public/about-page/sections/cbl_information");
        if (res.success && res.data && res.data.content) {
          setCbl(JSON.parse(res.data.content));
        } else {
          setCbl(null);
        }
      } catch (err) {
        console.error(err);
        setCbl(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCBL();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const toggleAccordion = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <main className="cbl-main">
      <AboutHero title={cbl?.title} subtitle={cbl?.subtitle} />
      
      <section className="cbl-content-section">
          <div className="cbl-container">
            {loading ? (
              <CBLSkeleton />
            ) : !cbl ? (
              <div className="cbl-empty-state">
                <BookOpenIcon />
                <h3>No Constitution & By-Laws Available</h3>
                <p>The governance framework information will be displayed here once available.</p>
              </div>
            ) : (
              <motion.div
                className="cbl-content-grid"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Left Side: Articles Accordion */}
                <motion.div className="cbl-articles-section" variants={leftSideVariants}>
                  <div className="cbl-section-header">
                    <ScalesIcon />
                    <div>
                      <h2 className="cbl-section-title">Articles & Sections</h2>
                      <p className="cbl-section-subtitle">Click on any article to expand and read the full content</p>
                    </div>
                  </div>

                  <div className="cbl-accordion-list">
                    {cbl.articles.map((article, index) => {
                      const isOpen = openId === article.id;
                      return (
                        <motion.div
                          key={article.id}
                          variants={accordionItemVariants}
                          className={`cbl-accordion-item${isOpen ? " cbl-accordion-item--open" : ""}`}
                        >
                          <button
                            className="cbl-accordion-trigger"
                            onClick={() => toggleAccordion(article.id)}
                            aria-expanded={isOpen}
                            aria-controls={`content-${article.id}`}
                          >
                            <div className="cbl-accordion-info">
                              <span className="cbl-accordion-number">Article {String(index + 1).padStart(2, '0')}</span>
                              <span className="cbl-accordion-title">{article.title}</span>
                            </div>
                            <span className="cbl-accordion-icon">
                              <ChevronDownIcon />
                            </span>
                          </button>
                          
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                id={`content-${article.id}`}
                                role="region"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{
                                  height: "auto",
                                  opacity: 1,
                                  transition: {
                                    height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                                    opacity: { duration: 0.2, delay: 0.05 }
                                  }
                                }}
                                exit={{
                                  height: 0,
                                  opacity: 0,
                                  transition: {
                                    height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                                    opacity: { duration: 0.15 }
                                  }
                                }}
                                className="cbl-accordion-content-wrapper"
                              >
                                <div className="cbl-accordion-content">
                                  {article.sections.map((sectionText, idx) => (
                                    <div key={idx} className="cbl-accordion-paragraph">
                                      <CheckIcon />
                                      <p>{sectionText}</p>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Adoption & Signatories Card */}
                  <div className="cbl-adoption-card">
                    <div className="cbl-resolution-section">
                      <h3 className="cbl-resolution-title">Resolution & Adoption</h3>
                      <p className="cbl-resolution-text">&ldquo;{cbl.resolution}&rdquo;</p>
                      <p className="cbl-adoption-date">{cbl.adoptionDate}</p>
                    </div>

                    <div className="cbl-signatories-section">
                      <h3 className="cbl-signatories-title">Signatories</h3>
                      
                      {/* Corporate Secretary */}
                      <div className="cbl-secretary-card">
                        <span className="signatory-badge signatory-badge--primary">{cbl.secretary.signatureType}</span>
                        <div className="signatory-name">{cbl.secretary.name}</div>
                        <div className="signatory-role">{cbl.secretary.title}</div>
                      </div>

                      {/* Attested Board Members and Officers */}
                      <div className="cbl-signatories-grid">
                        {cbl.attestedBy.map((sig, idx) => (
                          <div key={idx} className="signatory-card">
                            <span className="signatory-badge">{sig.signatureType}</span>
                            <div className="signatory-name">{sig.name}</div>
                            <div className="signatory-role">{sig.title}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Side: Sidebar */}
                <motion.div className="cbl-sidebar" variants={rightSideVariants}>
                  {/* Introduction Card */}
                  <div className="cbl-sidebar-card">
                    <h3 className="cbl-sidebar-title">About This Document</h3>
                    <p className="cbl-sidebar-text">{cbl.introduction}</p>
                  </div>

                  {/* Download Card */}
                  <div className="cbl-download-card">
                    <div className="cbl-download-header">
                      <h3 className="cbl-download-title">Download Official Document</h3>
                      <p className="cbl-download-description">
                        Access the complete Constitution and By-Laws in PDF format for offline reading and reference.
                      </p>
                    </div>
                    <a
                      href={cbl.pdfUrl}
                      download="PAGE-CBL-Draft.pdf"
                      className="cbl-download-button"
                    >
                      <DownloadIcon />
                      <span>Download PDF</span>
                    </a>
                  </div>

                  {/* Quick Info Card */}
                  <div className="cbl-info-card">
                    <h4 className="cbl-info-title">Document Information</h4>
                    <div className="cbl-info-list">
                      <div className="cbl-info-item">
                        <span className="cbl-info-label">Total Articles</span>
                        <span className="cbl-info-value">{cbl.articles.length}</span>
                      </div>
                      <div className="cbl-info-item">
                        <span className="cbl-info-label">Last Updated</span>
                        <span className="cbl-info-value">{cbl.adoptionDate}</span>
                      </div>
                      <div className="cbl-info-item">
                        <span className="cbl-info-label">Status</span>
                        <span className="cbl-info-badge">Active</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </section>
      </main>
  );
}
