"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  Building2,
  Globe,
  Handshake,
  Calendar,
  MapPin,
  Search,
  Download,
  ShieldCheck,
  FileText,
  CheckCircle2
} from "lucide-react";
import Navbar from "../components/Navbar";
import "./partners.css";

// ── Types ──────────────────────────────────────────────────────────────────

type PartnerRecord = {
  id: string;
  name: string;
  category: "phil" | "foreign" | "industries";
  type: "MOU" | "MOA";
  institution: string;
  details: string;
  dateSigned: string;
  scopes: string[];
};

// ── Static Mock Data ────────────────────────────────────────────────────────

const MOCK_PARTNERS: PartnerRecord[] = [
  {
    id: "p1",
    name: "University of Santo Tomas",
    category: "phil",
    type: "MOU",
    institution: "Manila, Philippines",
    details: "Partnership focusing on joint research colloquia, exchange of graduate faculty resources, and collaborative publications in graduate level education journals.",
    dateSigned: "May 14, 2025",
    scopes: ["Faculty Exchange", "Joint Research", "Journal Publications"]
  },
  {
    id: "p2",
    name: "De La Salle University",
    category: "phil",
    type: "MOA",
    institution: "Manila, Philippines",
    details: "Formal memorandum of agreement regarding credit-sharing policies in engineering and computer science doctorates and co-sponsorship of the annual national thesis colloquium.",
    dateSigned: "November 20, 2025",
    scopes: ["Credit Sharing", "Thesis Colloquium", "STEM Doctorates"]
  },
  {
    id: "p3",
    name: "Ateneo de Manila University",
    category: "phil",
    type: "MOU",
    institution: "Quezon City, Philippines",
    details: "Academic agreement enabling graduate research fellowships and collaborative research modules covering humanities and development studies.",
    dateSigned: "January 10, 2026",
    scopes: ["Research Fellowships", "Humanities", "Development Studies"]
  },
  {
    id: "p4",
    name: "National University of Singapore",
    category: "foreign",
    type: "MOU",
    institution: "Kent Ridge, Singapore",
    details: "International cooperation covering visiting professor series, joint research projects on graduate pedagogy, and co-advising opportunities for PhD scholars.",
    dateSigned: "February 18, 2025",
    scopes: ["Visiting Professors", "PhD Co-Advising", "Pedagogy Research"]
  },
  {
    id: "p5",
    name: "University of Melbourne",
    category: "foreign",
    type: "MOA",
    institution: "Melbourne, Australia",
    details: "Bilateral agreement establishing institutional research funding matching and reciprocal digital resource library access for graduate students of both nations.",
    dateSigned: "September 05, 2025",
    scopes: ["Research Matching", "Library Resource Sharing", "Bilateral Grant"]
  },
  {
    id: "p6",
    name: "Kyoto University",
    category: "foreign",
    type: "MOU",
    institution: "Kyoto, Japan",
    details: "Academic collaboration enabling technology exchange seminars, short-term graduate study programs, and joint engineering curriculum evaluations.",
    dateSigned: "April 22, 2026",
    scopes: ["Tech Exchange", "Short-term Study", "Curriculum Audit"]
  },
  {
    id: "p7",
    name: "Smart Communications, Inc.",
    category: "industries",
    type: "MOA",
    institution: "Makati City, Philippines",
    details: "Industry alliance funding five annual graduate research grants in telecommunications, cybersecurity, and advanced computing technologies.",
    dateSigned: "October 12, 2025",
    scopes: ["Research Grants", "Cybersecurity", "Telecom Innovation"]
  },
  {
    id: "p8",
    name: "Ayala Corporation",
    category: "industries",
    type: "MOU",
    institution: "Makati City, Philippines",
    details: "Strategic cooperation establishing corporate internship placement criteria for executive MBA candidates and funding research on regional sustainability.",
    dateSigned: "March 15, 2026",
    scopes: ["Executive Internships", "MBA Pathways", "Regional Sustainability"]
  },
  {
    id: "p9",
    name: "Globe Telecom",
    category: "industries",
    type: "MOA",
    institution: "Taguig City, Philippines",
    details: "Educational agreement for integrating industry curriculum reviews, data analytics seminars, and scholarship pathways for data science graduate courses.",
    dateSigned: "May 02, 2026",
    scopes: ["Curriculum Review", "Data Analytics", "Graduate Scholarships"]
  }
];

// ── Framer Motion Variants (Matching CBL Page) ──────────────────────────────

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

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

// ── Hero Section (Matching CBL Hero Design) ─────────────────────────────────

function PartnersHero() {
  return (
    <section className="cbl-hero">
      <div className="cbl-hero-container">
        <div className="cbl-breadcrumb">
          <Link href="/" className="cbl-breadcrumb-link">Home</Link>
          <span className="cbl-breadcrumb-sep">/</span>
          <span className="cbl-breadcrumb-current">Partnerships</span>
        </div>
        
        <div className="cbl-hero-left">
          <h1 className="cbl-hero-title">Academic &amp; Industry Alliances</h1>
          <div className="cbl-gold-line" />
          <p className="cbl-hero-subtitle">
            Explore PAGE&apos;s official Memoranda of Understanding (MOUs) and Memoranda of Agreement (MOAs) signed with leading Philippine universities, international institutions, and corporate leaders.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Partnerships Inner Content ──────────────────────────────────────────────

function PartnershipsContent() {
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<"phil" | "foreign" | "industries">("phil");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["phil", "foreign", "industries"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  const philCount = useMemo(() => MOCK_PARTNERS.filter(p => p.category === "phil").length, []);
  const foreignCount = useMemo(() => MOCK_PARTNERS.filter(p => p.category === "foreign").length, []);
  const industryCount = useMemo(() => MOCK_PARTNERS.filter(p => p.category === "industries").length, []);

  const filteredPartners = useMemo(() => {
    return MOCK_PARTNERS.filter((partner) => {
      const matchesCategory = partner.category === activeTab;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesSearch =
        partner.name.toLowerCase().includes(q) ||
        partner.institution.toLowerCase().includes(q) ||
        partner.details.toLowerCase().includes(q) ||
        partner.scopes.some(s => s.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const categoryTabs = [
    { id: "phil", label: "Philippine Universities", icon: Building2, count: philCount },
    { id: "foreign", label: "Foreign Universities", icon: Globe, count: foreignCount },
    { id: "industries", label: "Industry Partners", icon: Handshake, count: industryCount }
  ] as const;

  const ActiveHeaderIcon = activeTab === "phil" ? Building2 : activeTab === "foreign" ? Globe : Handshake;

  return (
    <main className="partners-main">
      <Navbar scrolled={scrolled} />
      <PartnersHero />

      <section className="cbl-content-section">
        <div className="cbl-container">
          <motion.div
            className="partners-body-wrapper"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Category Filter Tabs (Horizontal Full Width) */}
            <div className="partners-tabs-bar" role="tablist" aria-label="Alliance Classifications">
              {categoryTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    id={`tab-${tab.id}`}
                    className={`partners-tab-btn ${isActive ? "partners-tab-btn--active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                    <span className="partners-tab-count">{tab.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Section Header Card with Embedded Search */}
            <div className="cbl-section-header partners-section-header">
              <div className="partners-header-left">
                <ActiveHeaderIcon size={32} />
                <div>
                  <h2 className="cbl-section-title">
                    {activeTab === "phil"
                      ? "Philippine Academic Network"
                      : activeTab === "foreign"
                      ? "International Academic Linkages"
                      : "Corporate & Industry Alliances"}
                  </h2>
                  <p className="cbl-section-subtitle">
                    Showing {filteredPartners.length} active {filteredPartners.length === 1 ? "agreement" : "agreements"} under this category
                  </p>
                </div>
              </div>

              <div className="partners-search-box">
                <Search size={16} className="partners-search-icon" />
                <input
                  type="text"
                  placeholder="Search partners, location, scope..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search partner agreements"
                />
              </div>
            </div>

            {/* Full-width Multi-column Cards Grid */}
            <div className="partners-grid">
              {filteredPartners.length === 0 ? (
                <div className="cbl-empty-state partners-empty-state">
                  <FileText size={48} />
                  <h3>No Partner Agreements Found</h3>
                  <p>No active agreements match your search criteria. Try clearing the search query.</p>
                </div>
              ) : (
                filteredPartners.map((partner) => {
                  const CardIcon = activeTab === "phil" ? Building2 : activeTab === "foreign" ? Globe : Handshake;
                  const isMou = partner.type === "MOU";

                  return (
                    <motion.article
                      key={partner.id}
                      variants={cardItemVariants}
                      className="partner-card"
                    >
                      <div className="partner-card-header">
                        <div className="partner-avatar-box">
                          <CardIcon size={24} />
                        </div>
                        
                        <div className="partner-header-info">
                          <h3 className="partner-card-title">{partner.name}</h3>
                          <div className="partner-location">
                            <MapPin size={13} />
                            <span>{partner.institution}</span>
                          </div>
                        </div>

                        <span className={`partner-badge ${isMou ? "partner-badge--mou" : "partner-badge--moa"}`}>
                          {partner.type}
                        </span>
                      </div>

                      <p className="partner-card-details">{partner.details}</p>

                      <div className="partner-scopes-wrapper">
                        <span className="partner-scopes-label">Scope of Agreement:</span>
                        <div className="partner-scopes-list">
                          {partner.scopes.map((scope, idx) => (
                            <span key={idx} className="partner-scope-tag">
                              {scope}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="partner-card-footer">
                        <div className="partner-status">
                          <CheckCircle2 size={14} />
                          <span>Agreement Active</span>
                        </div>

                        <div className="partner-signed-date">
                          <Calendar size={13} />
                          <span>Signed: {partner.dateSigned}</span>
                        </div>
                      </div>
                    </motion.article>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

// ── Main Page Export with Suspense ─────────────────────────────────────────

export default function PartnershipsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-sans)', color: '#081734' }}>
          <h3>Loading Partnerships Page...</h3>
        </div>
      }
    >
      <PartnershipsContent />
    </Suspense>
  );
}
