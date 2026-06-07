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
  { label: "About PAGE",        href: "/about" },
  { label: "PAGE History",      href: "/about/history" },
  { label: "Set of Officers",   href: "/about/officers" },
  { label: "Logo Description",  href: "/about/logo" },
  { label: "CBL Information",   href: "/about/cbl" },
];

const ACTIVITY_DROPDOWN_ITEMS = [
  { label: "All Activities",  type: "all" },
  { label: "Conferences",     type: "conference" },
  { label: "Seminars",        type: "seminar" },
  { label: "Workshops",       type: "workshop" },
  { label: "Other Events",    type: "other" },
];

const CHAPTERS_MENU_ITEMS = [
  { short: "NCR", slug: "ncr" },
  { short: "CAR", slug: "car" },
  { short: "Region I", slug: "region-1" },
  { short: "Region II", slug: "region-2" },
  { short: "Region III", slug: "region-3" },
  { short: "Region IV-A", slug: "region-4a" },
  { short: "Region IV-B", slug: "region-4b" },
  { short: "Region V", slug: "region-5" },
  { short: "Region VI", slug: "region-6" },
  { short: "Region VII", slug: "region-7" },
  { short: "Region VIII", slug: "region-8" },
  { short: "Negros", slug: "nir" },
  { short: "Region IX", slug: "region-9" },
  { short: "Region X", slug: "region-10" },
  { short: "Region XI", slug: "region-11" },
  { short: "Region XII", slug: "region-12" },
  { short: "Region XIII", slug: "region-13" },
  { short: "BARMM", slug: "barmm" },
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

  const activitiesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const conventionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivitiesDropdownOpen(false);
        setAboutDropdownOpen(false);
        setChaptersDropdownOpen(false);
        setConventionDropdownOpen(false);
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
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isHomeActive = pathname === "/";
  const isAboutActive = pathname?.startsWith("/about");
  const isNewsActive = pathname?.startsWith("/news");
  const isActivitiesActive = pathname?.startsWith("/activities");
  const isChaptersActive = pathname?.startsWith("/chapters");
  const isConventionActive = pathname?.startsWith("/convention");
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
          <div className="navbar__dropdown-wrap" ref={aboutRef}>
            <button
              id="about-dropdown-btn"
              className={`navbar__dropdown-trigger${aboutDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isAboutActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={() => {
                setAboutDropdownOpen(p => !p);
                setActivitiesDropdownOpen(false);
                setChaptersDropdownOpen(false);
                setConventionDropdownOpen(false);
              }}
              aria-haspopup="true"
              aria-expanded={aboutDropdownOpen}
            >
              About
              <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
            </button>
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
          <div className="navbar__dropdown-wrap" ref={chaptersRef}>
            <button
              id="chapters-dropdown-btn"
              className={`navbar__dropdown-trigger${chaptersDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isChaptersActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={() => {
                setChaptersDropdownOpen(p => !p);
                setAboutDropdownOpen(false);
                setActivitiesDropdownOpen(false);
                setConventionDropdownOpen(false);
              }}
              aria-haspopup="true"
              aria-expanded={chaptersDropdownOpen}
            >
              Chapters
              <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
            </button>
            <AnimatePresence>
              {chaptersDropdownOpen && (
                <motion.div role="menu" className="navbar__dropdown navbar__dropdown--chapters"
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                  <div className="navbar__chapters-grid">
                    {CHAPTERS_MENU_ITEMS.map((item) => (
                      <Link key={item.slug}
                        href={`/chapters/${item.slug}`}
                        role="menuitem"
                        className="navbar__dropdown-item navbar__dropdown-item--chapter"
                        onClick={() => setChaptersDropdownOpen(false)}>
                        {item.short}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Convention Dropdown */}
          <div className="navbar__dropdown-wrap" ref={conventionRef}>
            <button
              id="convention-dropdown-btn"
              className={`navbar__dropdown-trigger${conventionDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isConventionActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={() => {
                setConventionDropdownOpen(p => !p);
                setAboutDropdownOpen(false);
                setActivitiesDropdownOpen(false);
                setChaptersDropdownOpen(false);
              }}
              aria-haspopup="true"
              aria-expanded={conventionDropdownOpen}
            >
              Convention
              <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
            </button>
            <AnimatePresence>
              {conventionDropdownOpen && (
                <motion.div role="menu" className="navbar__dropdown"
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                  <Link href="/convention" role="menuitem" className="navbar__dropdown-item" onClick={() => setConventionDropdownOpen(false)}>
                    Convention Archives
                  </Link>
                  <Link href="/convention/54th-national-convention" role="menuitem" className="navbar__dropdown-item" onClick={() => setConventionDropdownOpen(false)}>
                    Latest Convention
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* News Link */}
          <Link href="/news" className={`navbar__link${isNewsActive ? " navbar__link--active" : ""}`}>
            News
          </Link>

          {/* Activities Dropdown */}
          <div className="navbar__dropdown-wrap" ref={activitiesRef}>
            <button
              id="activities-dropdown-btn"
              className={`navbar__dropdown-trigger${activitiesDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isActivitiesActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={() => {
                setActivitiesDropdownOpen(p => !p);
                setAboutDropdownOpen(false);
                setChaptersDropdownOpen(false);
                setConventionDropdownOpen(false);
              }}
              aria-haspopup="true"
              aria-expanded={activitiesDropdownOpen}
            >
              National Activities
              <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
            </button>
            <AnimatePresence>
              {activitiesDropdownOpen && (
                <motion.div role="menu" className="navbar__dropdown"
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                  {ACTIVITY_DROPDOWN_ITEMS.map((item, i) => (
                    <Link key={item.type}
                      href={item.type === "all" ? "/activities" : `/activities?type=${item.type}`}
                      role="menuitem"
                      className={`navbar__dropdown-item${i === 0 ? " navbar__dropdown-item--all" : ""}`}
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
        <div className="navbar__mobile-dropdown-label">About PAGE</div>
        {ABOUT_DROPDOWN_ITEMS.map(item => (
          <Link key={item.href} href={item.href} className="navbar__mobile-sublink" onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}

        {/* Chapters mobile */}
        <div className="navbar__mobile-dropdown-label">Chapters</div>
        <div className="navbar__mobile-chapters-grid">
          {CHAPTERS_MENU_ITEMS.map(item => (
            <Link key={item.slug} href={`/chapters/${item.slug}`} className="navbar__mobile-chapter-link" onClick={() => setMenuOpen(false)}>
              {item.short}
            </Link>
          ))}
        </div>

        {/* Convention mobile */}
        <div className="navbar__mobile-dropdown-label">Convention</div>
        <Link href="/convention" className="navbar__mobile-sublink" onClick={() => setMenuOpen(false)}>
          Convention Archives
        </Link>
        <Link href="/convention/54th-national-convention" className="navbar__mobile-sublink" onClick={() => setMenuOpen(false)}>
          Latest Convention
        </Link>

        <Link href="/news" className={`navbar__mobile-link${isNewsActive ? " navbar__mobile-link--active" : ""}`} onClick={() => setMenuOpen(false)}>
          News
        </Link>

        {/* Activities mobile */}
        <div className="navbar__mobile-dropdown-label">National Activities</div>
        {ACTIVITY_DROPDOWN_ITEMS.map(item => (
          <Link key={item.type} href={item.type === "all" ? "/activities" : `/activities?type=${item.type}`} className="navbar__mobile-sublink" onClick={() => setMenuOpen(false)}>
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
