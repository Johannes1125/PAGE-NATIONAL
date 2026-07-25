"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Globe,
  Handshake,
  Calendar,
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  ArrowUpRight
} from "lucide-react";
import Navbar from "../components/Navbar";
import "./partners.css";

// ── Static Mock Data ────────────────────────────────────────────────────────

type PartnerRecord = {
  id: string;
  name: string;
  category: "phil" | "foreign" | "industries";
  type: "MOU" | "MOA";
  institution: string;
  details: string;
  dateSigned: string;
};

const MOCK_PARTNERS: PartnerRecord[] = [
  {
    id: "p1",
    name: "University of Santo Tomas",
    category: "phil",
    type: "MOU",
    institution: "Manila, Philippines",
    details: "Partnership focusing on joint research colloquia, exchange of graduate faculty resources, and collaborative publications in graduate level education journals.",
    dateSigned: "May 14, 2025"
  },
  {
    id: "p2",
    name: "De La Salle University",
    category: "phil",
    type: "MOA",
    institution: "Manila, Philippines",
    details: "Formal memorandum of agreement regarding credit-sharing policies in engineering and computer science doctorates and co-sponsorship of the annual national thesis colloquium.",
    dateSigned: "November 20, 2025"
  },
  {
    id: "p3",
    name: "Ateneo de Manila University",
    category: "phil",
    type: "MOU",
    institution: "Quezon City, Philippines",
    details: "Academic agreement enabling graduate research fellowships and collaborative research modules covering humanities and development studies.",
    dateSigned: "January 10, 2026"
  },
  {
    id: "p4",
    name: "National University of Singapore",
    category: "foreign",
    type: "MOU",
    institution: "Kent Ridge, Singapore",
    details: "International cooperation covering visiting professor series, joint research projects on graduate pedagogy, and co-advising opportunities for PhD scholars.",
    dateSigned: "February 18, 2025"
  },
  {
    id: "p5",
    name: "University of Melbourne",
    category: "foreign",
    type: "MOA",
    institution: "Melbourne, Australia",
    details: "Bilateral agreement establishing institutional research funding matching and reciprocal digital resource library access for graduate students of both nations.",
    dateSigned: "September 05, 2025"
  },
  {
    id: "p6",
    name: "Kyoto University",
    category: "foreign",
    type: "MOU",
    institution: "Kyoto, Japan",
    details: "Academic collaboration enabling technology exchange seminars, short-term graduate study programs, and joint engineering curriculum evaluations.",
    dateSigned: "April 22, 2026"
  },
  {
    id: "p7",
    name: "Smart Communications, Inc.",
    category: "industries",
    type: "MOA",
    institution: "Makati City, Philippines",
    details: "Industry alliance funding five annual graduate research grants in telecommunications, cybersecurity, and advanced computing technologies.",
    dateSigned: "October 12, 2025"
  },
  {
    id: "p8",
    name: "Ayala Corporation",
    category: "industries",
    type: "MOU",
    institution: "Makati City, Philippines",
    details: "Strategic cooperation establishing corporate internship placement criteria for executive MBA candidates and funding research on regional sustainability.",
    dateSigned: "March 15, 2026"
  },
  {
    id: "p9",
    name: "Globe Telecom",
    category: "industries",
    type: "MOA",
    institution: "Taguig City, Philippines",
    details: "Educational agreement for integrating industry curriculum reviews, data analytics seminars, and scholarship pathways for data science graduate courses.",
    dateSigned: "May 02, 2026"
  }
];

const tabs = [
  { id: "phil", label: "Philippine Universities", icon: Building2 },
  { id: "foreign", label: "Foreign Universities", icon: Globe },
  { id: "industries", label: "Industry Partners", icon: Handshake }
] as const;

// ── Partnerships Content Component ──────────────────────────────────────────

function PartnershipsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"phil" | "foreign" | "industries">("phil");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync state with url parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["phil", "foreign", "industries"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  const filteredPartners = MOCK_PARTNERS.filter(p => p.category === activeTab);

  return (
    <div className="partners-page">
      <Navbar scrolled={scrolled} />

      {/* Hero Section */}
      <section className="partners-hero">
        <div className="partners-hero__pattern" />
        <div className="partners-container">
          <div className="partners-hero__breadcrumbs">
            <Link href="/" className="partners-hero__breadcrumb-link">Home</Link>
            <span className="partners-hero__breadcrumb-sep">/</span>
            <span className="partners-hero__breadcrumb-current">Partnerships</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Academic &amp; Industry Alliances
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Explore our formal linkages, MOUs, and MOAs signed with local, foreign universities and forward-thinking corporate leaders.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="partners-section partners-container">
        <div className="partners-tabs" role="tablist" aria-label="Alliance Classifications">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                className={`partners-tab-btn ${activeTab === tab.id ? "partners-tab-btn--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Icon size={16} /> {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <motion.div
          key={activeTab}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="partners-grid"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {filteredPartners.map((partner, idx) => {
            const Icon = activeTab === "phil" ? Building2 : activeTab === "foreign" ? Globe : Handshake;
            return (
              <motion.article
                key={partner.id}
                className="partner-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <div className="partner-card__header">
                  <div className="partner-card__avatar">
                    <Icon size={22} />
                  </div>
                  <span className={`partner-card__type partner-card__type--${partner.type.toLowerCase()}`}>
                    {partner.type}
                  </span>
                </div>
                
                <h3 className="partner-card__name">{partner.name}</h3>
                <div className="partner-card__institution">
                  <MapPin size={12} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
                  {partner.institution}
                </div>
                
                <p className="partner-card__details">{partner.details}</p>
                
                <div className="partner-card__footer">
                  <span className="partner-card__date-label">Agreement Active</span>
                  <span className="partner-card__date-value">
                    <Calendar size={13} /> {partner.dateSigned}
                  </span>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </section>

    </div>
  );
}

export default function PartnershipsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-sans)', color: '#143152' }}>
        <h3>Loading Partnerships Page...</h3>
      </div>
    }>
      <PartnershipsContent />
    </Suspense>
  );
}
