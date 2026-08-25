"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { api } from "../../../lib/api-client";
import "./history.css";

// ── API record shape ────────────────────────────────────────────────────────
type ProgramType = "Initiative" | "Conference" | "Seminar" | "Convention" | "Other";

interface HistoricalRecord {
  id: string;
  title: string;
  yearStart: number;
  programType: ProgramType;
  description: string;
}

// Default Fallback Records (ensures a rich 60-year timeline matching verified records)
const DEFAULT_HISTORICAL_RECORDS: HistoricalRecord[] = [
  {
    id: "hist-1",
    yearStart: 1962,
    programType: "Initiative",
    title: "Founding of PAGE",
    description: "PAGE was established on September 26, 1962, through the efforts of Dr. Jesus E. Perpiñan and Atty. Pablo T. Mateo Jr. to improve graduate education standards in the Philippines."
  },
  {
    id: "hist-2",
    yearStart: 1962,
    programType: "Conference",
    title: "First National Conference on Graduate Education",
    description: "PAGE held its first national conference at Philippine Women’s University with the theme 'Graduate Education Today.'"
  },
  {
    id: "hist-3",
    yearStart: 1963,
    programType: "Initiative",
    title: "Graduate Education Standards Advocacy",
    description: "PAGE contributed to the development of the first government regulations for graduate education through BPS Circular No. 4, Series of 1963."
  },
  {
    id: "hist-4",
    yearStart: 1964,
    programType: "Initiative",
    title: "Improved Graduate Education Policies",
    description: "PAGE recommendations influenced Department Order No. 15, Series of 1964, improving standards and procedures for graduate education."
  },
  {
    id: "hist-5",
    yearStart: 1969,
    programType: "Convention",
    title: "First Convention Outside Manila",
    description: "PAGE expanded beyond Metro Manila through its 8th Annual Convention in Cebu City."
  },
  {
    id: "hist-6",
    yearStart: 1974,
    programType: "Initiative",
    title: "Research-Oriented Graduate Education Reform",
    description: "PAGE recommendations influenced Circular No. 10, Series of 1974, emphasizing functional research and national development."
  },
  {
    id: "hist-7",
    yearStart: 1980,
    programType: "Convention",
    title: "First Mindanao Convention",
    description: "PAGE held its first annual convention in Mindanao at Zamboanga City."
  },
  {
    id: "hist-8",
    yearStart: 1984,
    programType: "Initiative",
    title: "SOTARE Research Project",
    description: "PAGE collaborated with PRODED to produce SOTARE I, a landmark review of educational research in the Philippines."
  },
  {
    id: "hist-9",
    yearStart: 1994,
    programType: "Initiative",
    title: "Partnership with Higher Education Reforms",
    description: "PAGE continued its role as consultant and critic following the creation of CHED through RA 7722."
  },
  {
    id: "hist-10",
    yearStart: 2000,
    programType: "Initiative",
    title: "Strategic Plan 2001–2006",
    description: "PAGE launched a strategic blueprint focusing on organizational development, quality assurance, innovation, and access."
  },
  {
    id: "hist-11",
    yearStart: 2003,
    programType: "Initiative",
    title: "Launch of PAGE Website",
    description: "Under Fr. José Antonio E. Aureada, PAGE established its first official website to strengthen communication and coordination nationwide."
  },
  {
    id: "hist-12",
    yearStart: 2005,
    programType: "Initiative",
    title: "Expansion of Membership Categories",
    description: "PAGE introduced Associate Membership through constitutional amendments."
  },
  {
    id: "hist-13",
    yearStart: 2012,
    programType: "Convention",
    title: "Golden Anniversary Celebration",
    description: "PAGE celebrated its 50th anniversary and reaffirmed its commitment to graduate education excellence."
  },
  {
    id: "hist-14",
    yearStart: 2012,
    programType: "Initiative",
    title: "Establishment of PAGE National Headquarters",
    description: "PAGE opened a permanent national headquarters in Manila."
  },
  {
    id: "hist-15",
    yearStart: 2015,
    programType: "Initiative",
    title: "Launch of Philippine Journal of Graduate Education",
    description: "PAGE transformed its journal into a refereed publication known as the Philippine Journal of Graduate Education (PJGE)."
  },
  {
    id: "hist-16",
    yearStart: 2017,
    programType: "Convention",
    title: "50th Annual National Convention",
    description: "PAGE hosted its Golden Convention featuring international plenary speakers, founding institution awards, and the launch of the PAGE National Anthem."
  },
  {
    id: "hist-17",
    yearStart: 2019,
    programType: "Convention",
    title: "Fourth Industrial Revolution Focus",
    description: "PAGE's 51st Convention addressed the opportunities and challenges of the Fourth Industrial Revolution for graduate education."
  },
  {
    id: "hist-18",
    yearStart: 2020,
    programType: "Convention",
    title: "52nd Annual Convention",
    description: "Dr. Lino C. Reynoso was elected President during the convention themed 'New Policies and Standards: Transforming the Landscape of Graduate Education.'"
  },
  {
    id: "hist-19",
    yearStart: 2022,
    programType: "Convention",
    title: "Post-Pandemic Graduate Education Transformation",
    description: "PAGE conducted its hybrid 53rd Annual Convention focused on resilience and responsiveness in graduate education after COVID-19."
  },
  {
    id: "hist-20",
    yearStart: 2023,
    programType: "Convention",
    title: "Graduate Education Reform Convention",
    description: "PAGE's 54th Annual Convention focused on implementing CHED CMO No. 15, Series of 2019."
  },
  {
    id: "hist-21",
    yearStart: 2024,
    programType: "Initiative",
    title: "SEC Re-registration and New Corporate Name",
    description: "PAGE successfully renewed its SEC registration and adopted the corporate name 'Philippine Association for Graduate Education Philippines, Inc. (PAGE).'"
  },
  {
    id: "hist-22",
    yearStart: 2024,
    programType: "Initiative",
    title: "Chapter Reactivation Program",
    description: "PAGE began reactivating regional chapters nationwide to strengthen organizational presence and support graduate education initiatives."
  }
];

// Map API programType to icon & theme class
function programTypeToMilestone(pt: ProgramType): string {
  const map: Record<ProgramType, string> = {
    Initiative:  "initiative",
    Conference:  "conference",
    Seminar:     "seminar",
    Convention:  "convention",
    Other:       "initiative",
  };
  return map[pt] ?? "initiative";
}

// ── Icons ─────────────────────────────────────────────────────────────────

const ClockIcon = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const LandmarkIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="22" x2="22" y2="22" />
    <polyline points="12 2 20 7 4 7 12 2" />
    <rect x="5" y="11" width="3" height="11" />
    <rect x="10" y="11" width="4" height="11" />
    <rect x="15" y="11" width="3" height="11" />
    <line x1="4" y1="11" x2="20" y2="11" />
  </svg>
);

const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LightbulbIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const GraduationCapIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function getMilestoneIcon(type: string) {
  switch (type) {
    case "founding":
      return <LandmarkIcon />;
    case "conference":
    case "convention":
      return <UsersIcon />;
    case "seminar":
      return <GraduationCapIcon />;
    case "initiative":
    default:
      return <LightbulbIcon />;
  }
}

// ── Hero Section ────────────────────────────────────────────────────────────
function HistoryHero() {
  return (
    <section className="history-hero">
      <div className="history-hero-container">
        <div className="history-breadcrumb">
          <Link href="/" className="history-breadcrumb-link">Home</Link>
          <span className="history-breadcrumb-sep">/</span>
          <Link href="/about" className="history-breadcrumb-link">About</Link>
          <span className="history-breadcrumb-sep">/</span>
          <span className="history-breadcrumb-current">History</span>
        </div>
        
        <div className="history-hero-left">
          <h1 className="history-hero-title">History of PAGE</h1>
          <div className="history-gold-line" />
          <p className="history-hero-subtitle">
            Tracing our journey from foundation in 1962 to leading nationwide higher education reforms, research innovation, and academic leadership across the Philippines.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Stat Strip ─────────────────────────────────────────────────────────────
function StatStrip() {
  return (
    <section className="history-stats-strip">
      <div className="history-container">
        <div className="history-stats-grid">
          <div className="history-stat-card">
            <div className="history-stat-number">1962</div>
            <div className="history-stat-label">Founding Year</div>
          </div>
          <div className="history-stat-card">
            <div className="history-stat-number">60+</div>
            <div className="history-stat-label">Years of Impact</div>
          </div>
          <div className="history-stat-card">
            <div className="history-stat-number">17</div>
            <div className="history-stat-label">Regional Chapters</div>
          </div>
          <div className="history-stat-card">
            <div className="history-stat-number">1,000+</div>
            <div className="history-stat-label">Graduate Educators</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Timeline Skeleton ──────────────────────────────────────────────────────
function TimelineSkeleton() {
  return (
    <div className="history-timeline-wrapper">
      <div className="history-timeline-spine" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`history-timeline-row ${i % 2 === 0 ? "timeline-left" : "timeline-right"}`}>
          <div className="history-timeline-node">
            <div className="history-node-inner" />
          </div>
          <div className="history-timeline-card-wrapper">
            <div className="history-card">
              <div className="skeleton-pulse" style={{ width: "120px", height: "32px", marginBottom: "16px" }} />
              <div className="skeleton-pulse" style={{ width: "70%", height: "24px", marginBottom: "12px" }} />
              <div className="skeleton-pulse" style={{ width: "100%", height: "16px", marginBottom: "8px" }} />
              <div className="skeleton-pulse" style={{ width: "85%", height: "16px" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Framer Motion Variants ─────────────────────────────────────────────────
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

// ── Main Component ─────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<HistoricalRecord[]>(DEFAULT_HISTORICAL_RECORDS);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get<{ success: boolean; data: HistoricalRecord[] }>("/public/historical-records");
        if (res.success && res.data && res.data.length > 0) {
          // Sort by yearStart ascending
          const sorted = [...res.data].sort((a, b) => a.yearStart - b.yearStart);
          setRecords(sorted);
        } else {
          setRecords(DEFAULT_HISTORICAL_RECORDS);
        }
      } catch (err) {
        console.error("Using default history records due to API error:", err);
        setRecords(DEFAULT_HISTORICAL_RECORDS);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Filter records based on selected tab
  const filteredRecords = records.filter(rec => {
    if (activeFilter === "all") return true;
    if (activeFilter === "founding") return rec.yearStart < 1980;
    if (activeFilter === "expansion") return rec.yearStart >= 1980 && rec.yearStart < 2000;
    if (activeFilter === "modern") return rec.yearStart >= 2000;
    return rec.programType.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div className="history-main">
      <HistoryHero />
      <StatStrip />

      <section className="history-content-section">
        <div className="history-container">
          {/* Intro Card */}
          <div className="history-intro-section">
            <div className="history-intro-card">
              <div className="history-intro-icon-wrap">
                <CalendarIcon />
              </div>
              <div>
                <h2 className="history-intro-title">A Living Legacy of Academic Leadership</h2>
                <p className="history-intro-text">
                  Since 1962, PAGE has served as the nationwide backbone for graduate education in the Philippines. 
                  Explore key historical milestones that have defined our institutional growth, policy contributions, and commitment to research excellence.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="history-filter-bar">
            <button
              className={`history-filter-btn ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All Milestones
            </button>
            <button
              className={`history-filter-btn ${activeFilter === "founding" ? "active" : ""}`}
              onClick={() => setActiveFilter("founding")}
            >
              Founding Era (1962-1979)
            </button>
            <button
              className={`history-filter-btn ${activeFilter === "expansion" ? "active" : ""}`}
              onClick={() => setActiveFilter("expansion")}
            >
              Expansion (1980-1999)
            </button>
            <button
              className={`history-filter-btn ${activeFilter === "modern" ? "active" : ""}`}
              onClick={() => setActiveFilter("modern")}
            >
              Modern Era (2000-Present)
            </button>
            {(["Initiative", "Conference", "Seminar", "Convention", "Other"] as ProgramType[]).map((programType) => (
              <button
                key={programType}
                className={`history-filter-btn ${activeFilter === programType.toLowerCase() ? "active" : ""}`}
                onClick={() => setActiveFilter(programType.toLowerCase())}
              >
                {programType}
              </button>
            ))}
          </div>

          {/* Timeline Section */}
          {loading ? (
            <TimelineSkeleton />
          ) : filteredRecords.length === 0 ? (
            <div className="history-empty-state">
              <ClockIcon />
              <h3>No Historical Milestones Found</h3>
              <p>No records match the selected era filter. Try selecting "All Milestones" to view full timeline.</p>
            </div>
          ) : (
            <div className="history-timeline-wrapper">
              <div className="history-timeline-spine" />

              <AnimatePresence mode="popLayout">
                {filteredRecords.map((record, index) => {
                  const milestoneType = programTypeToMilestone(record.programType);
                  const isLeft = index % 2 === 0;

                  return (
                    <motion.div
                      key={record.id}
                      className={`history-timeline-row ${isLeft ? "timeline-left" : "timeline-right"}`}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      {/* Central Spine Node */}
                      <div className="history-timeline-node" title={`${record.yearStart} Milestone`}>
                        <div className="history-node-inner" />
                      </div>

                      {/* Card Content */}
                      <div className="history-timeline-card-wrapper">
                        <div className="history-card">
                          <div className="history-card-header">
                            <span className="history-card-badge">{record.programType}</span>
                            <span className="history-card-year">{record.yearStart}</span>
                          </div>

                          <h3 className="history-card-title">{record.title}</h3>
                          <p className="history-card-desc">{record.description}</p>

                          <div className="history-card-footer">
                            {getMilestoneIcon(milestoneType)}
                            <span>Historical Milestone</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* End Marker */}
              <div className="history-timeline-end">
                <div className="history-timeline-end-pill">
                  <div className="history-timeline-end-dot" />
                  <span>Present Day · Empowering Future Educators</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
