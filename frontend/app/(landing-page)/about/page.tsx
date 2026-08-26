"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "../../lib/api-client";
import "./about-page.css";

// ── Icon Components ────────────────────────────────────────────────────────

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const CompassIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LightbulbIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18" />
    <line x1="10" y1="22" x2="14" y2="22" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const LandmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="22" x2="22" y2="22" />
    <polyline points="12 2 20 7 4 7 12 2" />
    <rect x="5" y="11" width="3" height="11" />
    <rect x="10" y="11" width="4" height="11" />
    <rect x="15" y="11" width="3" height="11" />
    <line x1="4" y1="11" x2="20" y2="11" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const FileCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);

const AwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

// ── Data ───────────────────────────────────────────────────────────────────

const CORE_VALUES = [
  { icon: <StarIcon />,      num: "01", title: "Excellence",     desc: "Committed to the highest standards in graduate education, research, and professional development." },
  { icon: <UsersIcon />,     num: "02", title: "Collaboration",  desc: "Fostering partnerships among institutions, researchers, and professionals to advance shared goals." },
  { icon: <LightbulbIcon />, num: "03", title: "Innovation",     desc: "Embracing new ideas, methodologies, and technologies to continuously improve graduate education." },
  { icon: <GlobeIcon />,     num: "04", title: "Global Outlook", desc: "Connecting Philippine graduate education to international standards and global academic communities." },
  { icon: <HeartIcon />,     num: "05", title: "Integrity",      desc: "Upholding ethical conduct, transparency, and accountability in all organizational activities." },
  { icon: <CompassIcon />,   num: "06", title: "Service",        desc: "Dedicating our efforts to the advancement of graduate education and national development." },
];

const ABOUT_SUBPAGES = [
  {
    title: "History of PAGE",
    badge: "60+ Years Legacy",
    href: "/about/history",
    desc: "Tracing our journey from foundation in 1962 by graduate school deans to leading nationwide higher education reforms and digital transformation.",
    cta: "Explore Timeline",
    icon: <LandmarkIcon />,
  },
  {
    title: "Set of Officers",
    badge: "Leadership Directory",
    href: "/about/officers",
    desc: "Meet our dedicated National Officers, Regional Vice Presidents for Luzon, Visayas, & Mindanao, and Board of Directors.",
    cta: "View Directory",
    icon: <UsersIcon />,
  },
  {
    title: "Logo Description",
    badge: "Brand Symbolism",
    href: "/about/logo",
    desc: "Discover the heraldic symbolism, colors, and design elements of the official PAGE national emblem.",
    cta: "Explore Emblem",
    icon: <ShieldIcon />,
  },
  {
    title: "Constitution & By-Laws",
    badge: "Governance Framework",
    href: "/about/cbl",
    desc: "Read our official constitution, organizational bylaws, membership classifications, and institutional regulations.",
    cta: "Read Constitution",
    icon: <BookIcon />,
  },
  {
    title: "SEC Registration",
    badge: "Legal Standing",
    href: "/about/sec",
    desc: "Official Securities and Exchange Commission (SEC) registration status and corporate incorporation details.",
    cta: "View SEC Info",
    icon: <FileCheckIcon />,
  },
  {
    title: "BIR Certification",
    badge: "Tax Accreditation",
    href: "/about/bir",
    desc: "Bureau of Internal Revenue (BIR) tax accreditation, official TIN details, and tax-exempt certification.",
    cta: "View BIR Info",
    icon: <AwardIcon />,
  },
];

const normalizeLogoDescription = (content: unknown): string => {
  if (typeof content === "string") {
    const trimmed = content.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed) as { description?: string } | { content?: string };
        if (parsed && typeof parsed === "object") {
          if (typeof (parsed as { description?: string }).description === "string") {
            return (parsed as { description?: string }).description as string;
          }
          if (typeof (parsed as { content?: string }).content === "string") {
            return (parsed as { content?: string }).content as string;
          }
        }
      } catch {
        return content;
      }
    }
    return content;
  }
  if (content && typeof content === "object") {
    const record = content as { description?: unknown; content?: unknown; text?: unknown };
    if (typeof record.description === "string") return record.description;
    if (typeof record.content === "string") return record.content;
    if (typeof record.text === "string") return record.text;
  }
  return "";
};

// ── About Page Header ──────────────────────────────────────────────────────
// ── About Page Header ──────────────────────────────────────────────────────
function AboutHero() {
  return (
    <section className="about-hero">
      <div className="about-hero-bg-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/about-bg.jpg" alt="About PAGE Facade" className="about-hero-bg-img" />
        <div className="about-hero-bg-overlay" />
      </div>

      <div className="container">
        <div className="about-hero__breadcrumb">
          <Link href="/" className="about-hero__breadcrumb-link">Home</Link>
          <span className="about-hero__breadcrumb-sep">/</span>
          <span className="about-hero__breadcrumb-current">About</span>
        </div>
        <h1 className="about-hero__title">About PAGE</h1>
        <div className="about-hero__divider" />
        <p className="about-hero__subtitle">
          Philippine Association for Graduate Education Philippines, Inc. (PAGE) — Advancing excellence through
          collaboration, research, and academic leadership since 1962.
        </p>
      </div>
    </section>
  );
}

// ── About Organization ─────────────────────────────────────────────────────
function AboutOrganization({ description, logoUrl }: { description?: string; logoUrl?: string }) {
  return (
    <section className="about-org">
      <div className="container">
        <div className="about-org__inner">
          <div className="about-org__text">
            <h2 className="section-title" style={{ textAlign: "left", margin: "0 0 24px" }}>
              About the Organization
            </h2>
            <p className="about-org__body" style={{ whiteSpace: "pre-line" }}>
              {description || "The Philippine Association for Graduate Education Philippines, Inc. (PAGE) anchors its organizational identity on driving academic excellence and research innovation across higher education institutions in the Philippines."}
            </p>
            <p className="about-org__body">
              Our mission is to foster excellence in graduate education through collaborative
              research, professional development, and the dissemination of scholarly knowledge.
              We work closely with universities, research institutions, and government agencies
              to ensure that graduate programs meet international standards.
            </p>
            <p className="about-org__body">
              PAGE is committed to supporting graduate students, faculty members, and
              administrators through conferences, workshops, publications, and networking
              opportunities that drive meaningful change.
            </p>
          </div>

          <div className="about-org__visual">
            <div className="about-org__image-card">
              <div className="about-org__image-top">
                <div className="about-org__image-icon">
                  <img src="/PAGE-favicon.png" alt="PAGE Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <p className="about-org__image-label">Philippine Association<br />for Graduate Education</p>
                <p className="about-org__image-sub">Est. 1962 · SEC Registered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Mission & Vision ──────────────────────────────────────────────────────
function MissionVision() {
  return (
    <section className="mv">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Mission &amp; Vision Goals</h2>
          <p className="section-subtitle">
            The guiding principles that shape our approach to advancing graduate education
            across the Philippines and beyond.
          </p>
        </div>

        <div className="mv__cards">
          <div className="mv-card">
            <div className="mv-card__icon-wrap">
              <EyeIcon />
            </div>
            <h3 className="mv-card__title">Our Vision</h3>
            <p className="mv-card__text">
              The Philippine Association for Graduate Education Philippines, Inc. (PAGE) envisions herself as
              an association of accredited graduate institutions offering diverse, relevant programs which are
              globally recognized and administered by highly qualified and socially responsible graduate
              educators.
            </p>
          </div>

          <div className="mv-card">
            <div className="mv-card__icon-wrap">
              <CompassIcon />
            </div>
            <h3 className="mv-card__title">Our Mission</h3>
            <p className="mv-card__text">
              Being the national organization that has concerned itself with achieving quality graduate
              education for 62 years (1962-2024), the Philippine Association for Graduate Education Philippines
              (PAGE), Inc. shall continue to assist in the task of enhancing the quality of Filipino professionals and
              leaders as active participants in the attainment of national and international goals for sustained
              human development.
            </p>
          </div>

          <div className="mv-card">
            <div className="mv-card__icon-wrap">
              <StarIcon />
            </div>
            <h3 className="mv-card__title">Goals &amp; Objectives</h3>
            <p className="mv-card__text" style={{ fontSize: "13px" }}>
              PAGE supports national development goals through these institutional objectives:
            </p>
            <ul style={{ listStyleType: "none", padding: 0, marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "var(--ink-60)" }}>
              <li style={{ display: "flex", gap: "6px" }}>
                <span>🡆</span> <span>Encourage the production and dissemination of basic and functional research.</span>
              </li>
              <li style={{ display: "flex", gap: "6px" }}>
                <span>🡆</span> <span>Promote scholarship, professional growth, and administrative competence.</span>
              </li>
              <li style={{ display: "flex", gap: "6px" }}>
                <span>🡆</span> <span>Make library and research resources reciprocally available via consortium arrangements.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── History Preview ───────────────────────────────────────────────────────
function HistoryPreviewSection() {
  const MILESTONES_PREVIEW = [
    { year: "1962", title: "Foundation of PAGE", desc: "Established on September 26, 1962 by nine pioneering higher education institutions to improve graduate education quality." },
    { year: "1994", title: "Antedating CHED", desc: "Pre-dating CHED by 32 years, actively collaborating as a key consultant and constructive policy advocate." },
    { year: "2012", title: "Golden Anniversary", desc: "Marked 50 years of excellence with international plenary assemblies and launching the PAGE National Anthem." },
    { year: "2024", title: "SEC Re-registration", desc: "Renewed corporate identity under PAGE Philippines, Inc., reactivating regional chapters nationwide." },
  ];

  return (
    <section className="about-history-preview">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Over 60 Years of Academic Excellence</h2>
          <p className="section-subtitle">
            From humble beginnings in 1962 to a nationwide network driving higher education reforms and research leadership.
          </p>
        </div>

        <div className="history-preview-grid">
          {MILESTONES_PREVIEW.map((item) => (
            <div key={item.year} className="history-preview-card">
              <div className="history-preview-year">{item.year}</div>
              <h3 className="history-preview-title">{item.title}</h3>
              <p className="history-preview-desc">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="history-preview-cta">
          <Link href="/about/history" className="history-preview-btn">
            <span>Explore Full Interactive History Timeline</span>
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Subpages Hub ──────────────────────────────────────────────────────────
function SubpagesHub() {
  return (
    <section className="subpages-hub">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Explore PAGE Sub-pages</h2>
          <p className="section-subtitle">
            Access detailed pages covering our rich history, leadership directory, logo symbolism, governance bylaws, and compliance documentation.
          </p>
        </div>

        <div className="subpages-hub__grid">
          {ABOUT_SUBPAGES.map((sub) => (
            <div key={sub.href} className="subpage-card">
              <div className="subpage-card__header">
                <div className="subpage-card__icon">{sub.icon}</div>
                <span className="subpage-card__badge">{sub.badge}</span>
              </div>
              <h3 className="subpage-card__title">{sub.title}</h3>
              <p className="subpage-card__desc">{sub.desc}</p>
              <Link href={sub.href} className="subpage-card__link">
                <span>{sub.cta}</span>
                <ArrowIcon />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Core Values ───────────────────────────────────────────────────────────
function CoreValues() {
  return (
    <section className="values">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Our Core Values</h2>
          <p className="section-subtitle">
            The principles that guide our work and define our commitment to excellence
            in graduate education.
          </p>
        </div>

        <div className="values__grid">
          {CORE_VALUES.map(v => (
            <div key={v.title} className="value-card">
              <div className="value-card__icon">{v.icon}</div>
              <h3 className="value-card__title">{v.title}</h3>
              <p className="value-card__desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AboutPage() {
  const [logoDescription, setLogoDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch logo & description section
        const descRes = await api.get("/public/about-page/sections/logo_description");
        if (descRes.success && descRes.data) {
          setLogoDescription(normalizeLogoDescription(descRes.data.content));
        }

        // Fetch logo document
        const docRes = await api.get("/public/about-page/documents/logo_description");
        if (docRes.success && docRes.data && docRes.data.length > 0) {
          const imageDoc = docRes.data.find((d: any) => d.file_type === "image" || d.file_name.match(/\.(jpg|jpeg|png|webp|svg)$/i));
          if (imageDoc) {
            setLogoUrl(imageDoc.file_url);
          } else {
            setLogoUrl(docRes.data[0].file_url);
          }
        }
      } catch (err) {
        console.error("Error loading dynamic about page content:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="about-main">
      <AboutHero />
      <AboutOrganization description={logoDescription} logoUrl={logoUrl} />
      <MissionVision />
      <HistoryPreviewSection />
      <SubpagesHub />
      <CoreValues />
    </div>
  );
}

