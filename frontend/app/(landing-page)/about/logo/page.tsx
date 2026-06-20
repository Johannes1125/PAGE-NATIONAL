"use client";
import Navbar from "../../components/Navbar";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { LOGO_DATA } from "./mock-data";
import { api } from "../../../lib/api-client";
import "./logo.css";

// ── Icon Components ────────────────────────────────────────────────────────

const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6"  x2="6"  y2="18" />
    <line x1="6"  y1="6"  x2="18" y2="18" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const MailIconSm = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MailIconContact = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
  </svg>
);

// ── Shared Data ────────────────────────────────────────────────────────────

const ABOUT_DROPDOWN_ITEMS = [
  { label: "About PAGE",        href: "/about" },
  { label: "PAGE History",      href: "/about/history" },
  { label: "Set of Officers",   href: "/about/officers" },
  { label: "Logo Description",  href: "/about/logo" },
  { label: "CBL Information",   href: "/about/cbl" },
];

const ACTIVITY_DROPDOWN_ITEMS = [
  { label: "All Activities",  type: "all"        },
  { label: "Conferences",     type: "conference" },
  { label: "Seminars",        type: "seminar"    },
  { label: "Workshops",       type: "workshop"   },
  { label: "Other Events",    type: "other"      },
];

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES    = ["Journals", "Articles", "Upcoming Activities", "Contact Us"];
const FOOTER_CONTACT = [
  { icon: <MapPinIcon />,      text: "Manila, Philippines" },
  { icon: <MailIconContact />, text: "page.org.ph@gmail.com" },
  { icon: <PhoneIcon />,       text: "+63 908 XXX XXXX"    },
];

const dropdownVariants: Variants = {
  hidden:  { opacity: 0, y: -8, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.18, ease: "easeOut" } },
  exit:    { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.13 } },
};

// ── Navbar ─────────────────────────────────────────────────────────────────


// ── About Page Header ──────────────────────────────────────────────────────
function AboutHero({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="about-hero">
      <div className="container">
        <div className="about-hero__breadcrumb">
          <Link href="/" className="about-hero__breadcrumb-link">Home</Link>
          <span className="about-hero__breadcrumb-sep">/</span>
          <Link href="/about" className="about-hero__breadcrumb-link">About</Link>
          <span className="about-hero__breadcrumb-sep">/</span>
          <span className="about-hero__breadcrumb-current">Logo Description</span>
        </div>
        <h1 className="about-hero__title">{title || LOGO_DATA.title}</h1>
        <div className="about-hero__divider" />
        <p className="about-hero__subtitle">{subtitle || LOGO_DATA.subtitle}</p>
      </div>
    </section>
  );
}

// ── Skeleton Placeholder ──
function LogoSkeleton() {
  return (
    <div>
      <div className="logo-showcase">
        <div className="skeleton-logo-card skeleton-pulse" />
        <div className="breakdown-list">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-breakdown-item skeleton-pulse" />
          ))}
        </div>
      </div>
      
      <div className="logo-details">
        <div>
          <div className="skeleton-pulse" style={{ height: "28px", width: "220px", marginBottom: "32px" }} />
          <div className="swatches">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="swatch-item">
                <div className="skeleton-swatch-box skeleton-pulse" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton-swatch-text skeleton-pulse" />
                  <div className="skeleton-swatch-desc skeleton-pulse" />
                  <div className="skeleton-swatch-desc skeleton-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="skeleton-pulse" style={{ height: "28px", width: "220px", marginBottom: "32px" }} />
          <div className="skeleton-philosophy-card skeleton-pulse" />
        </div>
      </div>
    </div>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__columns">
          <div>
            <div className="footer__brand-logo">
              <div className="footer__logo-mark" />
              <div>
                <div className="footer__logo-name">PAGE</div>
                <div className="footer__logo-sub">An academic towards to excellence</div>
              </div>
            </div>
            <p className="footer__brand-desc">
              Philippine Association for Graduate Education — advancing excellence
              through collaboration and research.
            </p>
            <div className="footer__socials">
              {[<FacebookIcon key="fb" />, <InstagramIcon key="ig" />, <MailIconSm key="mail" />].map((icon, i) => (
                <button key={i} className="footer__social-btn">{icon}</button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="footer__col-title">Quick Links</h4>
            <ul className="footer__links">
              {FOOTER_QUICK_LINKS.map(l => (
                <li key={l}><a href="#" className="footer__link">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer__col-title">Resources</h4>
            <ul className="footer__links">
              {FOOTER_RESOURCES.map(l => (
                <li key={l}><a href="#" className="footer__link">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer__col-title">Contact</h4>
            <div className="footer__contact-list">
              {FOOTER_CONTACT.map(item => (
                <div key={item.text} className="footer__contact-item">
                  <span className="footer__contact-icon">{item.icon}</span>
                  <span className="footer__contact-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © 2026 Philippine Association for Graduate Education. All rights reserved.
          </p>
          <div className="footer__legal">
            {["Privacy Policy", "Terms of Use"].map(l => (
              <a key={l} href="#" className="footer__legal-link">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Framer Motion Entrance Variants ──

const showcaseVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
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
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── Main Page Component ────────────────────────────────────────────────────
export default function LogoDescriptionPage() {
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("");
  const [logoDescription, setLogoDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch logo & description section
        const descRes = await api.get("/public/about-page/sections/logo_description");
        if (descRes.success && descRes.data) {
          setSectionTitle(descRes.data.title);
          setLogoDescription(descRes.data.content);
        }

        // Fetch logo documents
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
        console.error("Error loading logo description page:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <Navbar scrolled={scrolled} />
      <main>
        <AboutHero title={sectionTitle} />
        
        <section className="logo-section">
          <div className="container">
            {loading ? (
              <LogoSkeleton />
            ) : (
              <motion.div
                variants={showcaseVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Showcase + Breakdown Row */}
                <div className="logo-showcase">
                  {/* Left Side: Logo card display */}
                  <motion.div className="logo-card" variants={itemVariants}>
                    <div className="logo-card__image-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img
                        src={logoUrl || "/PAGE-logo.jpg"}
                        alt="PAGE official logo"
                        style={{ width: "100%", maxHeight: "180px", objectFit: "contain", borderRadius: "8px" }}
                      />
                    </div>
                    <span className="logo-card__label">Official Mark</span>
                  </motion.div>
                  
                  {/* Right Side: Symbol meaning breakdown */}
                  <div className="breakdown-list">
                    {LOGO_DATA.symbol_breakdown.map((item, idx) => (
                      <motion.div
                        key={item.element}
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
                
                {/* Details Row (Color + Philosophy) */}
                <div className="logo-details">
                  {/* Color Swatches */}
                  <motion.div className="logo-details__color-palette" variants={itemVariants}>
                    <h2 className="logo-details__section-title">Color Palette</h2>
                    <div className="swatches">
                      {LOGO_DATA.color_palette.map(swatch => (
                        <div key={swatch.hex} className="swatch-item">
                          <div
                            className="swatch-item__color-box"
                            style={{ backgroundColor: swatch.hex }}
                          />
                          <div>
                            <h3 className="swatch-item__name">
                              {swatch.color_name}
                              <span className="swatch-item__hex">{swatch.hex}</span>
                            </h3>
                            <p className="swatch-item__desc">{swatch.significance}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Design Philosophy */}
                  <motion.div className="logo-details__philosophy" variants={itemVariants}>
                    <h2 className="logo-details__section-title">Design Philosophy</h2>
                    <div className="philosophy-card">
                      <p className="philosophy-text" style={{ whiteSpace: "pre-line" }}>
                        {logoDescription || LOGO_DATA.design_philosophy}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
