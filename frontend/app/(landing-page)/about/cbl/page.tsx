"use client";
import Navbar from "../../components/Navbar";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { CBL_DATA, type CBLData } from "./mock-data";
import { api } from "../../../lib/api-client";
import "./cbl.css";

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

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
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
function AboutHero({ cbl }: { cbl: CBLData }) {
  return (
    <section className="about-hero">
      <div className="container">
        <div className="about-hero__breadcrumb">
          <Link href="/" className="about-hero__breadcrumb-link">Home</Link>
          <span className="about-hero__breadcrumb-sep">/</span>
          <Link href="/about" className="about-hero__breadcrumb-link">About</Link>
          <span className="about-hero__breadcrumb-sep">/</span>
          <span className="about-hero__breadcrumb-current">CBL Information</span>
        </div>
        <h1 className="about-hero__title">{cbl.title}</h1>
        <div className="about-hero__divider" />
        <p className="about-hero__subtitle">{cbl.subtitle}</p>
      </div>
    </section>
  );
}

// ── Skeleton Placeholder ──
function CBLSkeleton() {
  return (
    <div className="cbl-grid">
      {/* Left side skeleton accordion */}
      <div className="accordion-list">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-accordion-item skeleton-pulse" />
        ))}
      </div>
      
      {/* Right side skeleton info card */}
      <div className="skeleton-cbl-info-card skeleton-pulse" />
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

// ── Framer Motion Page Transition & List Variants ──

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
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const rightSideVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const accordionItemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

// ── Main Page Component ────────────────────────────────────────────────────
export default function CBLInformationPage() {
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cbl, setCbl] = useState<CBLData>(CBL_DATA);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    
    const fetchCBL = async () => {
      try {
        const res = await api.get("/public/about-page/sections/cbl_information");
        if (res.success && res.data) {
          setCbl(JSON.parse(res.data.content));
        } else {
          setCbl(CBL_DATA);
        }
      } catch (err) {
        console.error(err);
        setCbl(CBL_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchCBL();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const toggleAccordion = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <>
      <Navbar scrolled={scrolled} />
      <main>
        <AboutHero cbl={cbl} />
        
        <section className="cbl-section">
          <div className="container">
            {loading ? (
              <CBLSkeleton />
            ) : (
              <motion.div
                className="cbl-grid"
                variants={pageVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Left Side: Custom Accordion List */}
                <motion.div className="accordion-list" variants={leftSideVariants}>
                  {cbl.articles.map(article => {
                    const isOpen = openId === article.id;
                    return (
                      <motion.div
                        key={article.id}
                        variants={accordionItemVariants}
                        className={`accordion-item${isOpen ? " accordion-item--open" : ""}`}
                      >
                        <button
                          className="accordion-trigger"
                          onClick={() => toggleAccordion(article.id)}
                          aria-expanded={isOpen}
                          aria-controls={`content-${article.id}`}
                        >
                          <div className="accordion-trigger__info">
                            <span className="accordion-trigger__num">{article.articleNumber}</span>
                            <span className="accordion-trigger__title">{article.title}</span>
                          </div>
                          <span className="accordion-trigger__icon">
                            <ChevronDownIcon />
                          </span>
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              id={`content-${article.id}`}
                              role="region"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{
                                height: "auto",
                                opacity: 1,
                                transition: {
                                  height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                                  opacity: { duration: 0.2, delay: 0.05 }
                                }
                              }}
                              exit={{
                                height: 0,
                                opacity: 0,
                                transition: {
                                  height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                                  opacity: { duration: 0.15 }
                                }
                              }}
                              className="accordion-content-outer"
                            >
                              <div className="accordion-content-inner">
                                {article.sections.map((sectionText, idx) => (
                                  <p key={idx} className="accordion-paragraph">
                                    {sectionText}
                                  </p>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}

                  {/* Adoption & Attestation Card */}
                  <div className="cbl-adoption-card">
                    <div className="cbl-resolution-block">
                      <h4 className="cbl-resolution-title">Resolution & Adoption</h4>
                      <p className="cbl-resolution-text">“{cbl.resolution}”</p>
                      <p className="cbl-adoption-date">{cbl.adoptionDate}</p>
                    </div>

                    <h4 className="cbl-signatories-title">Signatories</h4>
                    
                    {/* Corporate Secretary */}
                    <div className="cbl-secretary-wrapper">
                      <div className="signatory-card signatory-card--secretary">
                        <span className="signatory-card__badge">{cbl.secretary.signatureType}</span>
                        <div className="signatory-card__name">{cbl.secretary.name}</div>
                        <div className="signatory-card__role">{cbl.secretary.title}</div>
                      </div>
                    </div>

                    {/* Attested Board Members and Officers */}
                    <div className="cbl-signatories-grid">
                      {cbl.attestedBy.map((sig, idx) => (
                        <div key={idx} className="signatory-card">
                          <span className="signatory-card__badge">{sig.signatureType}</span>
                          <div className="signatory-card__name">{sig.name}</div>
                          <div className="signatory-card__role">{sig.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Right Side: Introduction & PDF Download Box */}
                <motion.div className="cbl-info-card" variants={rightSideVariants}>
                  <div>
                    <h3 className="accordion-trigger__title" style={{ marginBottom: "16px", color: "var(--ink)" }}>
                      Governance & By-Laws
                    </h3>
                    <p className="cbl-info-text">{cbl.introduction}</p>
                  </div>

                  <div className="cbl-download-box">
                    <h4 className="cbl-download-title">Download Official CBL</h4>
                    <p className="cbl-download-desc">
                      Access the full, official Constitution and By-Laws draft document in PDF format for offline reading and institutional reference.
                    </p>
                    <a
                      href={cbl.pdfUrl}
                      download="PAGE-CBL-Draft.pdf"
                      className="cbl-download-btn"
                    >
                      <DownloadIcon />
                      Download Draft PDF
                    </a>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
