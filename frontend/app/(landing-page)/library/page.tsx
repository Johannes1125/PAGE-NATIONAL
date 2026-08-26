"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  Search,
  BookOpen,
  CheckCircle2
} from "lucide-react";
import { gooeyToast } from "goey-toast";
import "./library.css";

// ── Static Mock Data ────────────────────────────────────────────────────────

type CMODocument = {
  id: string;
  number: string;
  title: string;
  category: "cmo15" | "cmo21" | "other";
  dateIssued: string;
  description: string;
  provisions: string[];
  downloadUrl: string;
};

const MOCK_DOCS: CMODocument[] = [
  {
    id: "c1",
    number: "CMO No. 15, Series of 2019",
    title: "Policies, Standards and Guidelines for Graduate Programs",
    category: "cmo15",
    dateIssued: "August 15, 2019",
    description: "The official policies, standards, and guidelines for graduate education in the Philippines. It rationalizes graduate level educational processes to ensure responsiveness to national needs and international academic frameworks.",
    provisions: [
      "Categorization of Master's degrees into Academic (Thesis-track) and Professional (Non-thesis/Project-track).",
      "Mandatory earned Doctorate degree for Graduate School professors instructing doctorates.",
      "Definition of minimum credit units (30 coursework units + 6 thesis units for Master's).",
      "Required publication of graduate research in a refereed or indexed journal prior to graduation."
    ],
    downloadUrl: "/documents/cmo-15-2019.pdf"
  },
  {
    id: "c2",
    number: "CMO No. 21, Series of 2021",
    title: "Guidelines for Flexible Learning Implementation in Graduate Programs",
    category: "cmo21",
    dateIssued: "November 12, 2021",
    description: "Administrative guidelines and instructional standards for implementing flexible learning modalities in graduate courses, outlining hybrid seminars, remote thesis defense, and virtual resource access.",
    provisions: [
      "Approved delivery models including fully online synchronous/asynchronous and blended hybrid formats.",
      "Institutional LMS and technical helpdesk infrastructure standards for Higher Education Institutions (HEIs).",
      "Formal protocols for conducting remote thesis and doctoral dissertation defense sessions.",
      "Access standards for electronic journals, databases, and digital research libraries."
    ],
    downloadUrl: "/documents/cmo-21-2021.pdf"
  },
  {
    id: "c3",
    number: "CMO No. 46, Series of 2012",
    title: "Outcomes-Based & Typology-Based Quality Assurance in Higher Education",
    category: "other",
    dateIssued: "December 11, 2012",
    description: "Policy framework designed to implement outcomes-based education (OBE) and typology-based quality assurance assessments across public and private Higher Education Institutions.",
    provisions: [
      "Mandatory integration of Outcomes-Based Education (OBE) course structures.",
      "Structural typological classifications: Professional Institution, College, or University.",
      "External institutional quality audit requirements and accreditation alignment."
    ],
    downloadUrl: "/documents/cmo-46-2012.pdf"
  },
  {
    id: "c4",
    number: "CMO No. 15, Series of 2023",
    title: "Amendments to Specific Provisions of Graduate Program Guidelines",
    category: "other",
    dateIssued: "June 05, 2023",
    description: "Updates to specific articles from the 2019 guidelines, revising criteria for doctoral panel members, joint degree advisor sharing, and institutional digital repository setups.",
    provisions: [
      "Revised credential definitions for research co-advisors and external evaluators.",
      "Establishment of institutional open-access repository guidelines.",
      "Standardization of credit transfers and dual-degree co-tutelle arrangements."
    ],
    downloadUrl: "/documents/cmo-15-2023.pdf"
  },
  {
    id: "c5",
    number: "CMO No. 36, Series of 1998",
    title: "Policies and Standards on Graduate Education",
    category: "other",
    dateIssued: "July 24, 1998",
    description: "Historical foundational guidelines establishing initial quality controls, administrative standards, and thesis defense protocols for Philippine graduate schools.",
    provisions: [
      "Establishment of separate graduate school offices and dean administrative setups.",
      "Foundational faculty definitions and tenure standards.",
      "Thesis committee nomination guidelines and oral defense frameworks."
    ],
    downloadUrl: "/documents/cmo-36-1998.pdf"
  }
];

// ── Hero Section (CBL Dark Navy Gradient, NO top pill label) ─────────────────
function LibraryHero() {
  return (
    <section className="cbl-hero">
      <div className="cbl-hero-container">
        <div className="cbl-breadcrumb">
          <Link href="/" className="cbl-breadcrumb-link">Home</Link>
          <span className="cbl-breadcrumb-sep">/</span>
          <span className="cbl-breadcrumb-current">Library</span>
        </div>
        
        <div className="cbl-hero-left">
          <h1 className="cbl-hero-title">CHED Memorandum Orders</h1>
          <div className="cbl-gold-line" />
          <p className="cbl-hero-subtitle">
            Access official issuances, regulatory standards, and policies governing graduate education under the Commission on Higher Education.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Framer Motion Variants ──────────────────────────────────────────────────
const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

// ── Library Content Component ───────────────────────────────────────────────
function LibraryContent() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (!cleanQuery) return MOCK_DOCS;
    
    return MOCK_DOCS.filter((doc) => {
      return (
        doc.title.toLowerCase().includes(cleanQuery) ||
        doc.number.toLowerCase().includes(cleanQuery) ||
        doc.description.toLowerCase().includes(cleanQuery) ||
        doc.provisions.some((p) => p.toLowerCase().includes(cleanQuery))
      );
    });
  }, [searchQuery]);

  const handleDownload = (docName: string) => {
    gooeyToast.success(`Downloading ${docName} PDF...`);
    setTimeout(() => {
      gooeyToast.success(`Download complete: ${docName}`);
    }, 1200);
  };

  return (
    <main className="library-main">
      <LibraryHero />

      <section className="cbl-content-section">
        <div className="cbl-container">
          <motion.div
            className="library-body-wrapper"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Section Header Card with Search Input */}
            <div className="cbl-section-header library-section-header">
              <div className="library-header-left">
                <BookOpen size={32} />
                <div>
                  <h2 className="cbl-section-title">
                    CHED Regulatory Frameworks &amp; Issuances
                  </h2>
                  <p className="cbl-section-subtitle">
                    Showing {filteredDocs.length} official {filteredDocs.length === 1 ? "issuance" : "issuances"} governing graduate education
                  </p>
                </div>
              </div>

              <div className="library-search-box">
                <Search size={16} className="library-search-icon" />
                <input
                  type="text"
                  placeholder="Search document title, provisions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search CHED Memorandum Orders"
                />
              </div>
            </div>

            {/* Document Cards Grid */}
            <div className="library-grid">
              {filteredDocs.length === 0 ? (
                <div className="cbl-empty-state library-empty-state">
                  <FileText size={48} />
                  <h3>No Documents Found</h3>
                  <p>No CHED memorandum orders match your search criteria. Try clearing the search query.</p>
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <motion.article
                    key={doc.id}
                    variants={cardItemVariants}
                    className="library-card"
                  >
                    <div className="library-card__header">
                      <div className="library-card__icon-wrap">
                        <FileText size={22} />
                      </div>
                      <span className="library-card__badge">
                        CHED ISSUANCE
                      </span>
                    </div>

                    <h3 className="library-card__number">{doc.number}</h3>
                    <h4 className="library-card__title">{doc.title}</h4>

                    <div className="library-card__date">
                      <Calendar size={13} />
                      <span>Issued: {doc.dateIssued}</span>
                    </div>

                    <p className="library-card__desc">{doc.description}</p>

                    {/* Key Provisions */}
                    <div className="library-card__provisions">
                      <div className="library-card__provisions-header">
                        <CheckCircle2 size={14} />
                        <span>Key Provisions</span>
                      </div>
                      <ul className="library-card__provision-list">
                        {doc.provisions.map((provision, pIdx) => (
                          <li key={pIdx} className="library-card__provision-item">
                            {provision}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="library-card__footer">
                      <button
                        className="library-download-btn"
                        onClick={() => handleDownload(doc.number)}
                      >
                        <Download size={14} />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

// ── Main Export with Suspense ──────────────────────────────────────────────
export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-sans)', color: '#081734' }}>
          <h3>Loading Library Page...</h3>
        </div>
      }
    >
      <LibraryContent />
    </Suspense>
  );
}

