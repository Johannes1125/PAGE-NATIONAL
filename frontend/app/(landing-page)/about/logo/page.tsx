"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { api } from "../../../lib/api-client";
import "./logo.css";

// ── Default Fallback Content (Ensures a rich page even when API is empty) ──

const DEFAULT_SYMBOL_BREAKDOWN = [
  {
    element: "The Academic Laurel",
    meaning: "Symbolizes scholarly excellence, high standards in graduate education, and over 60 years of institutional leadership across Philippine universities."
  },
  {
    element: "The Torch of Knowledge",
    meaning: "Represents continuous academic research, intellectual enlightenment, and the pursuit of graduate education advancement."
  },
  {
    element: "The Heraldic Shield",
    meaning: "Embodying organizational governance, SEC corporate accreditation, and legal integrity in higher education administration."
  },
  {
    element: "The Gold & Navy Outer Ring",
    meaning: "Signifies unity and collaboration among our 17 regional chapters and graduate institution members across Luzon, Visayas, and Mindanao."
  }
];

const DEFAULT_COLOR_PALETTE = [
  {
    color_name: "PAGE Navy Blue",
    hex: "#081734",
    significance: "Represents institutional dignity, academic governance, authority, and steadfast commitment to higher education quality."
  },
  {
    color_name: "Heritage Gold",
    hex: "#D4A053",
    significance: "Symbolizes excellence, honor, and high standards in graduate research and professional development."
  },
  {
    color_name: "Academic Royal Blue",
    hex: "#1B2A4A",
    significance: "Reflects intellectual depth, research clarity, and inter-university consortium collaboration."
  },
  {
    color_name: "Pristine White",
    hex: "#FFFFFF",
    significance: "Emphasizes transparency, ethical integrity, and purity of purpose in educational leadership."
  }
];

const DEFAULT_DESIGN_PHILOSOPHY = 
  "The official emblem of the Philippine Association for Graduate Education (PAGE) embodies over six decades of academic leadership, scholarly research, and institutional unity. Every line, heraldic symbol, and color palette element reflects our enduring mission to elevate Philippine graduate education to international standards of excellence.";

// ── Framer Motion Entrance Variants ───────────────────────────────────────

const showcaseVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── Hero Section ────────────────────────────────────────────────────────────
function LogoHero({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="logo-hero">
      <div className="logo-hero-container">
        <div className="logo-breadcrumb">
          <Link href="/" className="logo-breadcrumb-link">Home</Link>
          <span className="logo-breadcrumb-sep">/</span>
          <Link href="/about" className="logo-breadcrumb-link">About</Link>
          <span className="logo-breadcrumb-sep">/</span>
          <span className="logo-breadcrumb-current">Logo Symbolism</span>
        </div>
        
        <div className="logo-hero-left">
          <h1 className="logo-hero-title">{title || "Official Seal & Identity"}</h1>
          <div className="logo-gold-line" />
          <p className="logo-hero-subtitle">
            {subtitle || "Discover the heraldic symbolism, design philosophy, and official color palette of the Philippine Association for Graduate Education emblem."}
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Skeleton Loader ────────────────────────────────────────────────────────
function LogoSkeleton() {
  return (
    <div>
      <div className="logo-showcase-grid">
        <div className="skeleton-pulse" style={{ height: "400px", borderRadius: "20px" }} />
        <div className="breakdown-list">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-pulse" style={{ height: "100px", borderRadius: "16px" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function LogoDescriptionPage() {
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("Official Seal & Brand Symbolism");
  const [logoDescription, setLogoDescription] = useState("");
  const [designPhilosophy, setDesignPhilosophy] = useState(DEFAULT_DESIGN_PHILOSOPHY);
  const [symbolBreakdown, setSymbolBreakdown] = useState<any[]>(DEFAULT_SYMBOL_BREAKDOWN);
  const [colorPalette, setColorPalette] = useState<any[]>(DEFAULT_COLOR_PALETTE);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const descRes = await api.get("/public/about-page/sections/logo_description");
        if (descRes.success && descRes.data) {
          if (descRes.data.title) setSectionTitle(descRes.data.title);
          
          try {
            const parsed = JSON.parse(descRes.data.content);
            if (parsed && typeof parsed === "object") {
              if (parsed.description) setLogoDescription(parsed.description);
              if (parsed.design_philosophy) setDesignPhilosophy(parsed.design_philosophy);
              if (parsed.symbol_breakdown && Array.isArray(parsed.symbol_breakdown) && parsed.symbol_breakdown.length > 0) {
                setSymbolBreakdown(parsed.symbol_breakdown);
              }
              if (parsed.color_palette && Array.isArray(parsed.color_palette) && parsed.color_palette.length > 0) {
                setColorPalette(parsed.color_palette);
              }
            } else if (typeof descRes.data.content === "string") {
              setLogoDescription(descRes.data.content);
            }
          } catch {
            if (typeof descRes.data.content === "string") {
              setLogoDescription(descRes.data.content);
            }
          }
        }
      } catch (err) {
        console.error("Using default logo description content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="logo-main">
      <LogoHero title={sectionTitle} subtitle={logoDescription || undefined} />

      <section className="logo-section">
        <div className="logo-container">
          {loading ? (
            <LogoSkeleton />
          ) : (
            <motion.div
              variants={showcaseVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Top Row: Official Seal Card + Symbol Breakdown */}
              <div className="logo-showcase-grid">
                {/* Seal Display Card */}
                <motion.div className="logo-display-card" variants={itemVariants}>
                  <div className="logo-display-img-wrap">
                    <img src="/PAGE-favicon.png" alt="PAGE Official Seal" />
                  </div>
                  <span className="logo-display-tag">Official Seal • Est. 1962</span>
                  <h3 className="logo-display-name">National PAGE Emblem</h3>
                  <p className="logo-display-desc">
                    The official registered trademark of the Philippine Association for Graduate Education, Inc.
                  </p>
                </motion.div>

                {/* Breakdown List */}
                <div>
                  <h2 className="breakdown-section-title">Symbol Breakdown</h2>
                  <div className="breakdown-list">
                    {symbolBreakdown.map((item, idx) => (
                      <motion.div
                        key={item.element + "_" + idx}
                        className="breakdown-item"
                        variants={itemVariants}
                      >
                        <div className="breakdown-item__num">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <h3 className="breakdown-item__title">{item.element}</h3>
                          <p className="breakdown-item__desc">{item.meaning}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Color Palette & Design Philosophy */}
              <div className="logo-details-grid">
                {/* Color Palette */}
                <motion.div variants={itemVariants}>
                  <h2 className="logo-details__section-title">Official Color Palette</h2>
                  <div className="swatches">
                    {colorPalette.map((swatch, idx) => (
                      <div key={swatch.hex + "_" + idx} className="swatch-item">
                        <div
                          className="swatch-item__color-box"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <div>
                          <h3 className="swatch-item__name">
                            <span>{swatch.color_name}</span>
                            <span className="swatch-item__hex">{swatch.hex}</span>
                          </h3>
                          <p className="swatch-item__desc">{swatch.significance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Design Philosophy */}
                <motion.div variants={itemVariants}>
                  <h2 className="logo-details__section-title">Design Philosophy</h2>
                  <div className="philosophy-card">
                    <p className="philosophy-text" style={{ whiteSpace: "pre-line" }}>
                      {designPhilosophy}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
