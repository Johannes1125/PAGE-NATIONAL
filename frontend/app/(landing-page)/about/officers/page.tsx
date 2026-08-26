"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CATEGORIES, type Officer, type OfficerCategory } from "./mock-data";
import { api } from "../../../lib/api-client";
import "./officers.css";

// ── Default Fallback Officers (Verified PAGE Leadership) ────────────────────

const DEFAULT_OFFICERS: Officer[] = [
  {
    name: "Dr. Lino C. Reynoso",
    position: "President",
    category: "National Officers",
    bio: "Elected PAGE National President leading organizational reforms, hybrid learning transitions, and academic excellence.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Lino%20Reynoso&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Alper V. Pineda",
    position: "Vice President for Luzon",
    category: "National Officers",
    bio: "Leading regional chapters and inter-institutional graduate research collaboration across Luzon.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Alper%20Pineda&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Remedios C. Bacus",
    position: "Vice President for Visayas",
    category: "National Officers",
    bio: "Advancing graduate school partnerships, research conventions, and chapter initiatives throughout the Visayas.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Remedios%20Bacus&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Judith C. Chavez",
    position: "Vice President for Mindanao",
    category: "National Officers",
    bio: "Coordinating graduate education standards advocacy and regional university symposia across Mindanao.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Judith%20Chavez&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Arnel D. Bravo",
    position: "Secretary",
    category: "National Officers",
    bio: "Managing institutional records, corporate governance documentations, and national secretariat communications.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Arnel%20Bravo&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Ma. Kathleen C. Tiglao",
    position: "Treasurer",
    category: "National Officers",
    bio: "Directing financial stewardship, membership funds administration, and institutional compliance.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Kathleen%20Tiglao&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Rowena R. Abrea",
    position: "Auditor",
    category: "National Officers",
    bio: "Overseeing internal auditing, financial integrity, and governance compliance standards.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Rowena%20Abrea&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Dolores T. Quambo",
    position: "Press Relations Officer",
    category: "National Officers",
    bio: "Directing public information, external media relations, and official institutional announcements.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Dolores%20Quambo&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Rev. Dr. Jose Antonio E. Aureada, OP",
    position: "Director & Foundation Convener",
    category: "Board of Directors",
    bio: "Convener for PAGE 50th Foundation Anniversary and long-standing academic leader in graduate education quality.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Jose%20Antonio%20Aureada&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Reynaldo C. Cruz",
    position: "Director",
    category: "Board of Directors",
    bio: "Former Acting President and Director guiding national graduate curriculum standards.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Reynaldo%20Cruz&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Juliana M. Laraya",
    position: "Corporate Secretary & Director",
    category: "Board of Directors",
    bio: "Corporate Secretary and Director for institutional governance and Constitution & By-Laws adoption.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Juliana%20Laraya&backgroundColor=081734&textColor=ffffff"
  },
  {
    name: "Dr. Benjamin C. Dayrit",
    position: "Director",
    category: "Board of Directors",
    bio: "Director advising on higher education policy reforms and graduate research excellence.",
    photo_url: "https://api.dicebear.com/7.x/initials/svg?seed=Benjamin%20Dayrit&backgroundColor=081734&textColor=ffffff"
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
        let res = await api.get<{ success: boolean; data: any[] }>("/national-officers");
        if (!res.success || !res.data || res.data.length === 0) {
          res = await api.get<{ success: boolean; data: any[] }>("/public/about-page/officers");
        }
        if (res.success && res.data && res.data.length > 0) {
          const mapped: Officer[] = res.data.map((off: any) => {
            const memberName = off.memberName || off.name;
            const role = off.role || off.position;
            const category = (off.positionCategory === "Board of Directors" || off.chapter === "Board of Directors")
              ? "Board of Directors"
              : "National Officers";
            const photoUrl = off.imageUrl || off.photoUrl || off.photo_url || off.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(memberName)}&backgroundColor=081734&textColor=ffffff`;
            return {
              name: memberName,
              position: role,
              category: category as "National Officers" | "Board of Directors",
              bio: off.description || `${role} of PAGE National.`,
              photo_url: photoUrl,
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
                        <img
                          src={officer.photo_url}
                          alt={`${officer.name} profile photo`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(officer.name)}&backgroundColor=081734&textColor=ffffff`;
                          }}
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
