"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  Search,
  X,
  BookOpen,
  ArrowUpRight,
  Info,
  MapPin,
  Mail,
  Phone
} from "lucide-react";
import Navbar from "../components/Navbar";
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

const tabs = [
  { id: "cmo15", label: "CMO 15", icon: BookOpen },
  { id: "cmo21", label: "CMO 21", icon: FileText },
  { id: "other", label: "Other CMOs", icon: Info }
] as const;

// ── Library Content Component ───────────────────────────────────────────────

function LibraryContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"cmo15" | "cmo21" | "other">("cmo15");
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync state with URL parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["cmo15", "cmo21", "other"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // Filter documents based on active tab and search query
  const filteredDocs = MOCK_DOCS.filter((doc) => {
    const matchesTab = doc.category === activeTab;
    const cleanQuery = searchQuery.trim().toLowerCase();
    
    if (!cleanQuery) return matchesTab;
    
    const matchesQuery =
      doc.title.toLowerCase().includes(cleanQuery) ||
      doc.number.toLowerCase().includes(cleanQuery) ||
      doc.description.toLowerCase().includes(cleanQuery) ||
      doc.provisions.some((p) => p.toLowerCase().includes(cleanQuery));

    return matchesTab && matchesQuery;
  });

  const handleDownload = (docName: string) => {
    gooeyToast.success(`Downloading ${docName} PDF...`);
    
    // Simulate real file download
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = "#"; // simulated link
      link.setAttribute("download", `${docName.replace(/[\s,]+/g, "-")}.pdf`);
      document.body.appendChild(link);
      // We don't click it since it's mock, but we log execution
      document.body.removeChild(link);
      gooeyToast.success(`Download complete: ${docName}`);
    }, 1200);
  };

  return (
    <div className="library-page">
      <Navbar scrolled={scrolled} />

      {/* Hero Section */}
      <section className="library-hero">
        <div className="library-hero__pattern" />
        <div className="library-container">
          <div className="library-hero__breadcrumbs">
            <Link href="/" className="library-hero__breadcrumb-link">Home</Link>
            <span className="library-hero__breadcrumb-sep">/</span>
            <span className="library-hero__breadcrumb-current">Library</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            CHED Memorandum Orders
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Access official issuances, regulatory standards, and policies governing graduate education under the Commission on Higher Education.
          </motion.p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="library-section library-container">
        
        {/* Interactive Search Bar */}
        <div className="library-search-container">
          <Search size={18} className="library-search-icon" />
          <input
            type="text"
            className="library-search-input"
            placeholder="Search documents, guidelines, or specific provisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="library-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Tab Selection Row */}
        <div className="library-tabs" role="tablist" aria-label="Library Categories">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                className={`library-tab-btn ${activeTab === tab.id ? "library-tab-btn--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Icon size={16} /> {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Document Cards Grid */}
        <motion.div
          key={activeTab}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="library-grid"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc, idx) => (
              <motion.article
                key={doc.id}
                className="library-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <div className="library-card__header">
                  <div className="library-card__icon-wrap">
                    <FileText size={22} />
                  </div>
                  <span className="library-card__badge">
                    CHED Issuance
                  </span>
                </div>

                <h3 className="library-card__title">{doc.number}</h3>
                
                <div className="library-card__date">
                  <Calendar size={13} /> Published: {doc.dateIssued}
                </div>

                <p className="library-card__desc">{doc.title}</p>
                <p style={{ fontSize: "13px", color: "var(--lib-text-muted)", lineHeight: "1.5", marginBottom: "20px" }}>
                  {doc.description}
                </p>

                {/* Key Provisions */}
                <div className="library-card__provisions">
                  <div className="library-card__provisions-header">Key Provisions</div>
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
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              </motion.article>
            ))
          ) : (
            <div className="library-empty-state" style={{ gridColumn: "1 / -1" }}>
              <div className="library-empty-state__icon">
                <Search size={48} strokeWidth={1.5} style={{ margin: "0 auto" }} />
              </div>
              <h3>No Documents Found</h3>
              <p>
                We couldn't find any results matching "{searchQuery}" under this tab. Try checking spelling or switching tabs.
              </p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__columns">
            <div>
              <div className="footer__brand-logo">
                <div className="footer__logo-mark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/PAGE.jpg" alt="PAGE Logo" />
                </div>
                <div>
                  <div className="footer__logo-name">PAGE</div>
                  <div className="footer__logo-sub">An academic towards to excellence</div>
                </div>
              </div>
              <p className="footer__brand-desc">
                Philippine Association for Graduate Education — advancing excellence through collaboration, research, and innovation under the CHED Program.
              </p>
            </div>

            <div>
              <h4 className="footer__col-title">Quick Links</h4>
              <ul className="footer__links">
                <li><Link href="/about" className="footer__link">About PAGE</Link></li>
                <li><Link href="/about/history" className="footer__link">History</Link></li>
                <li><Link href="/about/officers" className="footer__link">Officers</Link></li>
                <li><Link href="/news" className="footer__link">News &amp; Announcements</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="footer__col-title">Resources</h4>
              <ul className="footer__links">
                <li><Link href="/journals" className="footer__link">Journals</Link></li>
                <li><Link href="/convention" className="footer__link">Conventions</Link></li>
                <li><Link href="/activities" className="footer__link">Activities</Link></li>
                <li><Link href="/contact" className="footer__link">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="footer__col-title">Contact</h4>
              <div className="footer__contact-list">
                <div className="footer__contact-item">
                  <span className="footer__contact-icon"><MapPin size={15} /></span>
                  <span className="footer__contact-text">Manila, Philippines</span>
                </div>
                <div className="footer__contact-item">
                  <span className="footer__contact-icon"><Mail size={15} /></span>
                  <span className="footer__contact-text">page@gmail.edu.ph</span>
                </div>
                <div className="footer__contact-item">
                  <span className="footer__contact-icon"><Phone size={15} /></span>
                  <span className="footer__contact-text">+63 908 XXX XXXX</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer__bottom">
            <p className="footer__copyright">
              © 2026 Philippine Association for Graduate Education. All rights reserved.
            </p>
            <div className="footer__legal">
              <a href="#" className="footer__legal-link">Privacy Policy</a>
              <a href="#" className="footer__legal-link">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-sans)', color: '#143152' }}>
        <h3>Loading Library...</h3>
      </div>
    }>
      <LibraryContent />
    </Suspense>
  );
}
