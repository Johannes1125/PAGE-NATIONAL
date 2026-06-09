"use client";
import "./navbar.css";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";

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

// ── Navigation Menu Data ──────────────────────────────────────────────────
const ABOUT_DROPDOWN_ITEMS = [
  { label: "Constitution and By-Laws", href: "/about/cbl" },
  { label: "History of PAGE",          href: "/about/history" },
  { label: "PAGE Logo & Description",  href: "/about/logo" },
  { label: "PAGE National Officers",   href: "/about/officers" },
  { label: "SEC Registration",         href: "/about/sec" },
  { label: "BIR Certification",        href: "/about/bir" },
];

const ACTIVITY_DROPDOWN_ITEMS = [
  { label: "Latest Activities", timeframe: "latest" },
  { label: "Future Activities", timeframe: "future" },
];

const CONVENTIONS_DROPDOWN_ITEMS = [
  { label: "53rd Convention", href: "/convention/53rd-national-convention" },
  { label: "54th Convention", href: "/convention/54th-national-convention" },
  { label: "55th Convention", href: "/convention/55th-national-convention" },
  { label: "56th Convention", href: "/convention/56th-national-convention" },
];

const JOURNALS_DROPDOWN_ITEMS = [
  { label: "Submission Guidelines",       href: "/journals/guidelines" },
  { label: "Education",                   href: "/journals?discipline=Education" },
  { label: "Humanities & Social Sciences", href: "/journals?discipline=Humanities and Social Sciences" },
  { label: "Engineering & Technology",    href: "/journals?discipline=Engineering and Technology" },
  { label: "Health & Sciences",           href: "/journals?discipline=Health and Sciences" },
  { label: "Business Education",          href: "/journals?discipline=Business Education" },
  { label: "Public Administration",       href: "/journals?discipline=Public Administration" },
  { label: "Other Disciplines",           href: "/journals?discipline=Other Disciplines" },
];

const LUZON_CHAPTERS = [
  { short: "PAGE NCR", slug: "ncr" },
  { short: "PAGE CAR", slug: "car" },
  { short: "PAGE I", slug: "region-1" },
  { short: "PAGE II", slug: "region-2" },
  { short: "PAGE III", slug: "region-3" },
  { short: "PAGE IV-A", slug: "region-4a" },
  { short: "PAGE IV-B", slug: "region-4b" },
  { short: "PAGE V", slug: "region-5" },
];

const VISAYAS_CHAPTERS = [
  { short: "PAGE VI", slug: "region-6" },
  { short: "PAGE VII", slug: "region-7" },
  { short: "PAGE VIII", slug: "region-8" },
  { short: "PAGE XVIII- NIR", slug: "nir" },
];

const MINDANAO_CHAPTERS = [
  { short: "PAGE IX", slug: "region-9" },
  { short: "PAGE X", slug: "region-10" },
  { short: "PAGE XI", slug: "region-11" },
  { short: "PAGE XII", slug: "region-12" },
  { short: "PAGE XIII", slug: "region-13" },
  { short: "PAGE CARAGA", slug: "caraga" },
];

const dropdownVariants: Variants = {
  hidden:  { opacity: 0, y: -8, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.18, ease: "easeOut" } },
  exit:    { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.13 } },
};

export default function Navbar({ scrolled }: { scrolled: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activitiesDropdownOpen, setActivitiesDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [chaptersDropdownOpen, setChaptersDropdownOpen] = useState(false);
  const [conventionDropdownOpen, setConventionDropdownOpen] = useState(false);
  const [journalsDropdownOpen, setJournalsDropdownOpen] = useState(false);

  const activitiesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const conventionRef = useRef<HTMLDivElement>(null);
  const journalsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivitiesDropdownOpen(false);
        setAboutDropdownOpen(false);
        setChaptersDropdownOpen(false);
        setConventionDropdownOpen(false);
        setJournalsDropdownOpen(false);
        setMenuOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (activitiesRef.current && !activitiesRef.current.contains(target)) {
        setActivitiesDropdownOpen(false);
      }
      if (aboutRef.current && !aboutRef.current.contains(target)) {
        setAboutDropdownOpen(false);
      }
      if (chaptersRef.current && !chaptersRef.current.contains(target)) {
        setChaptersDropdownOpen(false);
      }
      if (conventionRef.current && !conventionRef.current.contains(target)) {
        setConventionDropdownOpen(false);
      }
      if (journalsRef.current && !journalsRef.current.contains(target)) {
        setJournalsDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 1200) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isHomeActive = pathname === "/";
  const isAboutActive = pathname?.startsWith("/about");
  const isNewsActive = pathname?.startsWith("/news");
  const isActivitiesActive = pathname?.startsWith("/activities");
  const isChaptersActive = pathname?.startsWith("/chapters");
  const isConventionActive = pathname?.startsWith("/convention");
  const isJournalsActive = pathname?.startsWith("/journals");
  const isContactActive = pathname?.startsWith("/contact");

  return (
    <header className={`navbar${scrolled ? " navbar--scrolled" : ""}${menuOpen ? " navbar--open" : ""}`}>
      <nav className="navbar__inner">
        <div className="navbar__logo">
          <div className="navbar__logo-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/PAGE.jpg"
              width={50}
              height={50}
              alt="PAGE Logo"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <span className="navbar__logo-mark-fallback" style={{ display: "none" }}>PAGE</span>
          </div>
          <div className="navbar__logo-text">
            <div className="navbar__logo-name">PAGE</div>
            <div className="navbar__logo-sub">Philippine Association for Graduate Education</div>
          </div>
        </div>

        <div className="navbar__links">
          {/* Home Link */}
          <Link href="/" className={`navbar__link${isHomeActive ? " navbar__link--active" : ""}`}>
            Home
          </Link>

          {/* About Dropdown */}
          <div 
            className="navbar__dropdown-wrap" 
            ref={aboutRef}
            onMouseEnter={() => setAboutDropdownOpen(true)}
            onMouseLeave={() => setAboutDropdownOpen(false)}
          >
            <Link
              id="about-dropdown-btn"
              href="/about"
              className={`navbar__dropdown-trigger${aboutDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isAboutActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={() => setAboutDropdownOpen(false)}
              aria-haspopup="true"
              aria-expanded={aboutDropdownOpen}
            >
              About
              <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
            </Link>
            <AnimatePresence>
              {aboutDropdownOpen && (
                <motion.div role="menu" className="navbar__dropdown"
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                  {ABOUT_DROPDOWN_ITEMS.map((item, i) => (
                    <Link key={item.href}
                      href={item.href}
                      role="menuitem"
                      className={`navbar__dropdown-item${i === 0 ? " navbar__dropdown-item--all" : ""}`}
                      onClick={() => setAboutDropdownOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chapters Dropdown */}
          <div 
            className="navbar__dropdown-wrap" 
            ref={chaptersRef}
            onMouseEnter={() => setChaptersDropdownOpen(true)}
            onMouseLeave={() => setChaptersDropdownOpen(false)}
          >
            <Link
              id="chapters-dropdown-btn"
              href="/chapters"
              className={`navbar__dropdown-trigger${chaptersDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isChaptersActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={() => setChaptersDropdownOpen(false)}
              aria-haspopup="true"
              aria-expanded={chaptersDropdownOpen}
            >
              Chapters
              <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
            </Link>
            <AnimatePresence>
              {chaptersDropdownOpen && (
                <motion.div role="menu" className="navbar__dropdown navbar__dropdown--chapters"
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                  <div className="navbar__chapters-columns">
                    {/* Luzon Column */}
                    <div className="navbar__chapters-col">
                      <div className="navbar__chapters-col-header">Luzon</div>
                      <div className="navbar__chapters-col-grid">
                        {LUZON_CHAPTERS.map((item) => (
                          <Link key={item.slug}
                            href={`/chapters/${item.slug}`}
                            role="menuitem"
                            className="navbar__dropdown-item navbar__dropdown-item--chapter"
                            onClick={() => setChaptersDropdownOpen(false)}>
                            {item.short}
                          </Link>
                        ))}
                      </div>
                    </div>
                    {/* Visayas Column */}
                    <div className="navbar__chapters-col">
                      <div className="navbar__chapters-col-header">Visayas</div>
                      <div className="navbar__chapters-col-grid">
                        {VISAYAS_CHAPTERS.map((item) => (
                          <Link key={item.slug}
                            href={`/chapters/${item.slug}`}
                            role="menuitem"
                            className="navbar__dropdown-item navbar__dropdown-item--chapter"
                            onClick={() => setChaptersDropdownOpen(false)}>
                            {item.short}
                          </Link>
                        ))}
                      </div>
                    </div>
                    {/* Mindanao Column */}
                    <div className="navbar__chapters-col">
                      <div className="navbar__chapters-col-header">Mindanao</div>
                      <div className="navbar__chapters-col-grid">
                        {MINDANAO_CHAPTERS.map((item) => (
                          <Link key={item.slug}
                            href={`/chapters/${item.slug}`}
                            role="menuitem"
                            className="navbar__dropdown-item navbar__dropdown-item--chapter"
                            onClick={() => setChaptersDropdownOpen(false)}>
                            {item.short}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Convention Dropdown */}
          <div 
            className="navbar__dropdown-wrap" 
            ref={conventionRef}
            onMouseEnter={() => setConventionDropdownOpen(true)}
            onMouseLeave={() => setConventionDropdownOpen(false)}
          >
            <Link
              id="convention-dropdown-btn"
              href="/convention"
              className={`navbar__dropdown-trigger${conventionDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isConventionActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={() => setConventionDropdownOpen(false)}
              aria-haspopup="true"
              aria-expanded={conventionDropdownOpen}
            >
              Convention
              <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
            </Link>
            <AnimatePresence>
              {conventionDropdownOpen && (
                <motion.div role="menu" className="navbar__dropdown"
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                  {CONVENTIONS_DROPDOWN_ITEMS.map((item) => (
                    <Link key={item.href}
                      href={item.href}
                      role="menuitem"
                      className="navbar__dropdown-item"
                      onClick={() => setConventionDropdownOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Research Journals Dropdown */}
          <div 
            className="navbar__dropdown-wrap" 
            ref={journalsRef}
            onMouseEnter={() => setJournalsDropdownOpen(true)}
            onMouseLeave={() => setJournalsDropdownOpen(false)}
          >
            <Link
              id="journals-dropdown-btn"
              href="/journals"
              className={`navbar__dropdown-trigger${journalsDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isJournalsActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={() => setJournalsDropdownOpen(false)}
              aria-haspopup="true"
              aria-expanded={journalsDropdownOpen}
            >
              Research Journals
              <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
            </Link>
            <AnimatePresence>
              {journalsDropdownOpen && (
                <motion.div role="menu" className="navbar__dropdown"
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                  {JOURNALS_DROPDOWN_ITEMS.map((item, i) => (
                    <Link key={item.href}
                      href={item.href}
                      role="menuitem"
                      className={`navbar__dropdown-item${i === 0 ? " navbar__dropdown-item--all" : ""}`}
                      onClick={() => setJournalsDropdownOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* News Link */}
          <Link href="/news" className={`navbar__link${isNewsActive ? " navbar__link--active" : ""}`}>
            News
          </Link>

          {/* Activities Dropdown */}
          <div 
            className="navbar__dropdown-wrap" 
            ref={activitiesRef}
            onMouseEnter={() => setActivitiesDropdownOpen(true)}
            onMouseLeave={() => setActivitiesDropdownOpen(false)}
          >
            <Link
              id="activities-dropdown-btn"
              href="/activities"
              className={`navbar__dropdown-trigger${activitiesDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isActivitiesActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={() => setActivitiesDropdownOpen(false)}
              aria-haspopup="true"
              aria-expanded={activitiesDropdownOpen}
            >
              National Activities
              <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
            </Link>
            <AnimatePresence>
              {activitiesDropdownOpen && (
                <motion.div role="menu" className="navbar__dropdown"
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                  {ACTIVITY_DROPDOWN_ITEMS.map((item) => (
                    <Link key={item.timeframe}
                      href={`/activities?timeframe=${item.timeframe}`}
                      role="menuitem"
                      className="navbar__dropdown-item"
                      onClick={() => setActivitiesDropdownOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Contact Link */}
          <Link href="/contact" className={`navbar__link${isContactActive ? " navbar__link--active" : ""}`}>
            Contact
          </Link>

          <Link href="/member-login" className="navbar__signin">Sign In</Link>
        </div>

        <button className="navbar__hamburger" onClick={() => setMenuOpen(p => !p)} aria-label="Toggle menu">
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`navbar__mobile-menu${menuOpen ? " navbar__mobile-menu--open" : ""}`}>
        <Link href="/" className={`navbar__mobile-link${isHomeActive ? " navbar__mobile-link--active" : ""}`} onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        
        {/* About PAGE mobile */}
        <Link href="/about" className="navbar__mobile-dropdown-label navbar__mobile-dropdown-label--link" onClick={() => setMenuOpen(false)}>
          About PAGE
        </Link>
        {ABOUT_DROPDOWN_ITEMS.map(item => (
          <Link key={item.href} href={item.href} className="navbar__mobile-sublink" onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}

        {/* Chapters mobile */}
        <Link href="/chapters" className="navbar__mobile-dropdown-label navbar__mobile-dropdown-label--link" onClick={() => setMenuOpen(false)}>
          Chapters - Luzon
        </Link>
        <div className="navbar__mobile-chapters-grid">
          {LUZON_CHAPTERS.map(item => (
            <Link key={item.slug} href={`/chapters/${item.slug}`} className="navbar__mobile-chapter-link" onClick={() => setMenuOpen(false)}>
              {item.short}
            </Link>
          ))}
        </div>
        <Link href="/chapters" className="navbar__mobile-dropdown-label navbar__mobile-dropdown-label--link" onClick={() => setMenuOpen(false)}>
          Chapters - Visayas
        </Link>
        <div className="navbar__mobile-chapters-grid">
          {VISAYAS_CHAPTERS.map(item => (
            <Link key={item.slug} href={`/chapters/${item.slug}`} className="navbar__mobile-chapter-link" onClick={() => setMenuOpen(false)}>
              {item.short}
            </Link>
          ))}
        </div>
        <Link href="/chapters" className="navbar__mobile-dropdown-label navbar__mobile-dropdown-label--link" onClick={() => setMenuOpen(false)}>
          Chapters - Mindanao
        </Link>
        <div className="navbar__mobile-chapters-grid">
          {MINDANAO_CHAPTERS.map(item => (
            <Link key={item.slug} href={`/chapters/${item.slug}`} className="navbar__mobile-chapter-link" onClick={() => setMenuOpen(false)}>
              {item.short}
            </Link>
          ))}
        </div>

        {/* Convention mobile */}
        <Link href="/convention" className="navbar__mobile-dropdown-label navbar__mobile-dropdown-label--link" onClick={() => setMenuOpen(false)}>
          Convention
        </Link>
        {CONVENTIONS_DROPDOWN_ITEMS.map(item => (
          <Link key={item.href} href={item.href} className="navbar__mobile-sublink" onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}

        {/* Research Journals mobile */}
        <Link href="/journals" className="navbar__mobile-dropdown-label navbar__mobile-dropdown-label--link" onClick={() => setMenuOpen(false)}>
          Research Journals
        </Link>
        {JOURNALS_DROPDOWN_ITEMS.map(item => (
          <Link key={item.href} href={item.href} className="navbar__mobile-sublink" onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}

        <Link href="/news" className={`navbar__mobile-link${isNewsActive ? " navbar__mobile-link--active" : ""}`} onClick={() => setMenuOpen(false)}>
          News
        </Link>

        {/* Activities mobile */}
        <Link href="/activities" className="navbar__mobile-dropdown-label navbar__mobile-dropdown-label--link" onClick={() => setMenuOpen(false)}>
          National Activities
        </Link>
        {ACTIVITY_DROPDOWN_ITEMS.map(item => (
          <Link key={item.timeframe} href={`/activities?timeframe=${item.timeframe}`} className="navbar__mobile-sublink" onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}

        <Link href="/contact" className={`navbar__mobile-link${isContactActive ? " navbar__mobile-link--active" : ""}`} onClick={() => setMenuOpen(false)}>
          Contact
        </Link>
        <Link href="/member-login" className="navbar__mobile-signin" onClick={() => setMenuOpen(false)}>Sign In</Link>
      </div>
    </header>
  );
}
