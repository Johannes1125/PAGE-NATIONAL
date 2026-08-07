"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CATEGORIES, type Officer, type OfficerCategory } from "./mock-data";
import { api } from "../../../lib/api-client";
import "./officers.css";

// ── Default Fallback Officers (Ensures full leadership list if API is empty) ──

const DEFAULT_OFFICERS: Officer[] = [
  {
    name: "Dr. Maria Santos-Cruz",
    position: "National President",
    category: "National Officers",
    bio: "Dean of Graduate Studies and Professor of Higher Education Administration with over 25 years of research leadership.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Maria%20Santos-Cruz&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Antonio Reyes",
    position: "National Executive Vice President",
    category: "National Officers",
    bio: "Pioneering researcher in curriculum development, outcomes-based education, and graduate program accreditation.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Antonio%20Reyes&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Elena Gonzales",
    position: "Vice President for Luzon",
    category: "National Officers",
    bio: "Overseeing regional chapters across Luzon to foster inter-university graduate research sharing.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Elena%20Gonzales&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Roberto Tan",
    position: "Vice President for Visayas",
    category: "National Officers",
    bio: "Leading academic partnership initiatives and annual research conventions throughout the Visayas.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Roberto%20Tan&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Fatima Abdul-Malik",
    position: "Vice President for Mindanao",
    category: "National Officers",
    bio: "Advancing graduate research symposia and regional university collaboration across Mindanao.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Fatima%20Abdul-Malik&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Jose Ramirez",
    position: "Corporate Secretary",
    category: "National Officers",
    bio: "Managing institutional records, SEC compliance, and official communications for PAGE National.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Jose%20Ramirez&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Teresa Mendoza",
    position: "National Treasurer",
    category: "National Officers",
    bio: "Directing financial stewardship, membership accreditation auditing, and research grant funds.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Teresa%20Mendoza&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Francisco Aquino",
    position: "Member, Board of Directors",
    category: "Board of Directors",
    bio: "Senior Director for Academic Standards advising on doctoral dissertation guidelines and journal indexing.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Francisco%20Aquino&backgroundColor=081734&textColor=ffffff"
  }
];

// ── Hero Section ────────────────────────────────────────────────────────────
function AboutHero() {
  return (
    <section className="officers-hero">
      <div className="officers-hero-container">
        <div className="officers-breadcrumb">
          <Link href="/" className="officers-breadcrumb-link">Home</Link>
          <span className="officers-breadcrumb-sep">/</span>
          <Link href="/about" className="officers-breadcrumb-link">About</Link>
          <span className="officers-breadcrumb-sep">/</span>
          <span className="officers-breadcrumb-current">Set of Officers</span>
        </div>
        
        <div className="officers-hero-left">
          <div className="officers-label">
            <span className="officers-label-dot" />
            <span>LEADERSHIP DIRECTORY • EST. 1962</span>
          </div>
          <h1 className="officers-hero-title">Set of Officers</h1>
          <div className="officers-gold-line" />
          <p className="officers-hero-subtitle">
            Meet the dedicated national officers, regional vice presidents, and board members leading PAGE towards continuous research innovation and graduate education excellence.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Skeleton Loader ────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="officers-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="officers-card__image-container" style={{ background: "#081734" }}>
            <div className="skeleton-avatar skeleton-pulse" />
          </div>
          <div className="skeleton-badge skeleton-pulse" />
          <div className="skeleton-name skeleton-pulse" />
        </div>
      ))}
    </div>
  );
}

// ── Framer Motion Entrance Variants ───────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
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

// ── Main Component ─────────────────────────────────────────────────────────
export default function OfficersPage() {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<OfficerCategory>("All");
  const [officersList, setOfficersList] = useState<Officer[]>(DEFAULT_OFFICERS);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; data: any[] }>("/national-officers");
        if (res.success && res.data && res.data.length > 0) {
          const mapped: Officer[] = res.data.map((off: any) => {
            return {
              name: off.memberName,
              position: off.role,
              category: (off.positionCategory === "Board of Directors" ? "Board of Directors" : "National Officers") as "National Officers" | "Board of Directors",
              bio: off.description || `${off.role} of PAGE National.`,
              photo_url: off.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(off.memberName)}&backgroundColor=081734&textColor=ffffff`,
            };
          });
          setOfficersList(mapped);
        } else {
          setOfficersList(DEFAULT_OFFICERS);
        }
      } catch (err) {
        console.error("Using default officers list:", err);
        setOfficersList(DEFAULT_OFFICERS);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  const handleCategoryChange = (category: OfficerCategory) => {
    if (category === activeCategory) return;
    setActiveCategory(category);
  };

  const filteredOfficers = officersList.filter(officer =>
    activeCategory === "All" ? true : officer.category === activeCategory
  );

  return (
    <div className="officers-main">
      <AboutHero />
      
      <section className="officers-section">
        <div className="officers-container">
          {/* Tab category selector */}
          <div className="term-selector" role="tablist" aria-label="Filter leadership categories">
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isActive}
                  className={`term-selector__btn${isActive ? " term-selector__btn--active" : ""}`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                  {isActive && (
                    <motion.div
                      layoutId="active-category-pill"
                      className="term-selector__active-indicator"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {loading ? (
            <SkeletonGrid />
          ) : filteredOfficers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-muted)" }}>
              No officers found under this category.
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                className="officers-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredOfficers.map(officer => (
                  <motion.div
                    key={officer.name}
                    className="officers-card"
                    variants={cardVariants}
                  >
                    <div className="officers-card__image-container">
                      <div className="officers-card__avatar">
                        <Image
                          src={officer.photo_url}
                          width={90}
                          height={90}
                          alt={`${officer.name} profile photo`}
                          unoptimized
                        />
                      </div>
                    </div>
                    
                    <div className="officers-card__body">
                      <span className="officers-card__position">{officer.position}</span>
                      <h3 className="officers-card__name">{officer.name}</h3>
                      <p className="officers-card__bio">{officer.bio}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
}
