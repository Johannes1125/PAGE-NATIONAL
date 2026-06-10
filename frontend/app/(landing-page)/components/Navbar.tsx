"use client";
import "./navbar.css";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
  { label: "About PAGE",                href: "/about" },
  { label: "Constitution and By-Laws",  href: "/about/cbl" },
  { label: "History of PAGE",           href: "/about/history" },
  { label: "PAGE Logo & Description",   href: "/about/logo" },
  { label: "PAGE National Officers",    href: "/about/officers" },
  { label: "SEC Registration",          href: "/about/sec" },
  { label: "BIR Certification",         href: "/about/bir" },
];

const ACTIVITY_DROPDOWN_ITEMS = [
  { label: "Latest Activities",  timeframe: "latest" },
  { label: "Future Activities",  timeframe: "future" },
];

const CONVENTIONS_DROPDOWN_ITEMS = [
  { label: "All Conventions",   href: "/convention" },
  { label: "53rd Convention",   href: "/convention/53rd-national-convention" },
  { label: "54th Convention",   href: "/convention/54th-national-convention" },
  { label: "55th Convention",   href: "/convention/55th-national-convention" },
  { label: "56th Convention",   href: "/convention/56th-national-convention" },
];

const JOURNALS_DROPDOWN_ITEMS = [
  { label: "All Journals",                  href: "/journals" },
  { label: "Submission Guidelines",         href: "/journals/guidelines" },
  { label: "Education",                     href: "/journals?discipline=Education" },
  { label: "Humanities & Social Sciences",  href: "/journals?discipline=Humanities and Social Sciences" },
  { label: "Engineering & Technology",      href: "/journals?discipline=Engineering and Technology" },
  { label: "Health & Sciences",             href: "/journals?discipline=Health and Sciences" },
  { label: "Business Education",            href: "/journals?discipline=Business Education" },
  { label: "Public Administration",         href: "/journals?discipline=Public Administration" },
  { label: "Other Disciplines",             href: "/journals?discipline=Other Disciplines" },
];

const MEMBERSHIP_DROPDOWN_ITEMS = [
  { label: "Membership Categories",   href: "/membership" },
  { label: "Apply Online",            href: "/membership/apply" },
  { label: "Life Members",            href: "/membership?cat=life#requirements" },
  { label: "Regular Members",           href: "/membership?cat=regular#requirements" },
  { label: "Membership Forms",        href: "/membership/apply" },
  { label: "Membership Requirements", href: "/membership#requirements" },
];

const PARTNERS_DROPDOWN_ITEMS = [
  { label: "MOU/MOA with Phil. Universities", href: "/partners?tab=phil" },
  { label: "MOU/MOA with Foreign Universities", href: "/partners?tab=foreign" },
  { label: "MOU/MOA with Industries",          href: "/partners?tab=industries" },
];

const LIBRARY_DROPDOWN_ITEMS = [
  { label: "CMO 15",      href: "/library?tab=cmo15" },
  { label: "CMO 21",      href: "/library?tab=cmo21" },
  { label: "Other CMOs",  href: "/library?tab=other" },
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
  hidden:  { opacity: 0, y: -4, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.15, ease: "easeOut" } },
  exit:    { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.1 } },
};

function NavbarContent({ scrolled }: { scrolled: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDropdownItemActive = (href: string) => {
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      if (pathname !== path) return false;
      const targetParams = new URLSearchParams(query);
      for (const [key, value] of targetParams.entries()) {
        if (searchParams.get(key) !== value) return false;
      }
      return true;
    }
    if (pathname === href) {
      if (href === "/activities" && searchParams.has("timeframe")) return false;
      if (href === "/journals" && searchParams.has("discipline")) return false;
      return true;
    }
    return false;
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [activitiesDropdownOpen, setActivitiesDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [chaptersDropdownOpen, setChaptersDropdownOpen] = useState(false);
  const [conventionDropdownOpen, setConventionDropdownOpen] = useState(false);
  const [journalsDropdownOpen, setJournalsDropdownOpen] = useState(false);
  const [membershipDropdownOpen, setMembershipDropdownOpen] = useState(false);
  const [partnersDropdownOpen, setPartnersDropdownOpen] = useState(false);
  const [libraryDropdownOpen, setLibraryDropdownOpen] = useState(false);

  const activitiesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const conventionRef = useRef<HTMLDivElement>(null);
  const journalsRef = useRef<HTMLDivElement>(null);
  const membershipRef = useRef<HTMLDivElement>(null);
  const partnersRef = useRef<HTMLDivElement>(null);
  const libraryRef = useRef<HTMLDivElement>(null);

  // Close all dropdowns
  const closeAll = () => {
    setActivitiesDropdownOpen(false);
    setAboutDropdownOpen(false);
    setChaptersDropdownOpen(false);
    setConventionDropdownOpen(false);
    setJournalsDropdownOpen(false);
    setMembershipDropdownOpen(false);
    setPartnersDropdownOpen(false);
    setLibraryDropdownOpen(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAll();
        setMenuOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (activitiesRef.current && !activitiesRef.current.contains(target)) setActivitiesDropdownOpen(false);
      if (aboutRef.current && !aboutRef.current.contains(target)) setAboutDropdownOpen(false);
      if (chaptersRef.current && !chaptersRef.current.contains(target)) setChaptersDropdownOpen(false);
      if (conventionRef.current && !conventionRef.current.contains(target)) setConventionDropdownOpen(false);
      if (journalsRef.current && !journalsRef.current.contains(target)) setJournalsDropdownOpen(false);
      if (membershipRef.current && !membershipRef.current.contains(target)) setMembershipDropdownOpen(false);
      if (partnersRef.current && !partnersRef.current.contains(target)) setPartnersDropdownOpen(false);
      if (libraryRef.current && !libraryRef.current.contains(target)) setLibraryDropdownOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    closeAll();
    setMenuOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 1240) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isHomeActive = pathname === "/";
  const isAboutActive = pathname?.startsWith("/about");
  const isMembershipActive = pathname?.startsWith("/membership");
  const isPartnersActive = pathname?.startsWith("/partners");
  const isLibraryActive = pathname?.startsWith("/library");
  const isNewsActive = pathname?.startsWith("/news");
  const isActivitiesActive = pathname?.startsWith("/activities");
  const isChaptersActive = pathname?.startsWith("/chapters");
  const isConventionActive = pathname?.startsWith("/convention");
  const isJournalsActive = pathname?.startsWith("/journals");
  const isContactActive = pathname?.startsWith("/contact");

  return (
    <header className={`navbar${scrolled ? " navbar--scrolled" : ""}${menuOpen ? " navbar--open" : ""}`}>
      <nav className="navbar__inner">
        <Link href="/" className="navbar__logo">
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
        </Link>

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
            <button
              id="about-dropdown-btn"
              className={`navbar__dropdown-trigger${aboutDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isAboutActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setAboutDropdownOpen(prev => !prev);
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
                      className={`navbar__dropdown-item${i === 0 ? " navbar__dropdown-item--all" : ""}${isDropdownItemActive(item.href) ? " navbar__dropdown-item--active" : ""}`}
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
            <button
              id="chapters-dropdown-btn"
              className={`navbar__dropdown-trigger${chaptersDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isChaptersActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setChaptersDropdownOpen(prev => !prev);
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
                  <Link href="/chapters" className={`navbar__dropdown-item navbar__dropdown-item--all${isDropdownItemActive("/chapters") ? " navbar__dropdown-item--active" : ""}`}
                    onClick={() => setChaptersDropdownOpen(false)}>
                    View All Chapters
                  </Link>
                  <div className="navbar__chapters-columns">
                    {/* Luzon Column */}
                    <div className="navbar__chapters-col">
                      <div className="navbar__chapters-col-header">Luzon</div>
                      <div className="navbar__chapters-col-grid">
                        {LUZON_CHAPTERS.map((item) => {
                          const href = `/chapters/${item.slug}`;
                          return (
                            <Link key={item.slug}
                              href={href}
                              role="menuitem"
                              className={`navbar__dropdown-item navbar__dropdown-item--chapter${isDropdownItemActive(href) ? " navbar__dropdown-item--chapter-active" : ""}`}
                              onClick={() => setChaptersDropdownOpen(false)}>
                              {item.short}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                    {/* Visayas Column */}
                    <div className="navbar__chapters-col">
                      <div className="navbar__chapters-col-header">Visayas</div>
                      <div className="navbar__chapters-col-grid">
                        {VISAYAS_CHAPTERS.map((item) => {
                          const href = `/chapters/${item.slug}`;
                          return (
                            <Link key={item.slug}
                              href={href}
                              role="menuitem"
                              className={`navbar__dropdown-item navbar__dropdown-item--chapter${isDropdownItemActive(href) ? " navbar__dropdown-item--chapter-active" : ""}`}
                              onClick={() => setChaptersDropdownOpen(false)}>
                              {item.short}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                    {/* Mindanao Column */}
                    <div className="navbar__chapters-col">
                      <div className="navbar__chapters-col-header">Mindanao</div>
                      <div className="navbar__chapters-col-grid">
                        {MINDANAO_CHAPTERS.map((item) => {
                          const href = `/chapters/${item.slug}`;
                          return (
                            <Link key={item.slug}
                              href={href}
                              role="menuitem"
                              className={`navbar__dropdown-item navbar__dropdown-item--chapter${isDropdownItemActive(href) ? " navbar__dropdown-item--chapter-active" : ""}`}
                              onClick={() => setChaptersDropdownOpen(false)}>
                              {item.short}
                            </Link>
                          );
                        })}
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
            <button
              id="convention-dropdown-btn"
              className={`navbar__dropdown-trigger${conventionDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isConventionActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setConventionDropdownOpen(prev => !prev);
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
                  {CONVENTIONS_DROPDOWN_ITEMS.map((item, i) => (
                    <Link key={item.href}
                      href={item.href}
                      role="menuitem"
                      className={`navbar__dropdown-item${i === 0 ? " navbar__dropdown-item--all" : ""}${isDropdownItemActive(item.href) ? " navbar__dropdown-item--active" : ""}`}
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
            <button
              id="journals-dropdown-btn"
              className={`navbar__dropdown-trigger${journalsDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isJournalsActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setJournalsDropdownOpen(prev => !prev);
              }}
              aria-haspopup="true"
              aria-expanded={journalsDropdownOpen}
            >
              Research Journals
              <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
            </button>
            <AnimatePresence>
              {journalsDropdownOpen && (
                <motion.div role="menu" className="navbar__dropdown"
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                  {JOURNALS_DROPDOWN_ITEMS.map((item, i) => (
                    <Link key={item.href}
                      href={item.href}
                      role="menuitem"
                      className={`navbar__dropdown-item${i === 0 ? " navbar__dropdown-item--all" : ""}${isDropdownItemActive(item.href) ? " navbar__dropdown-item--active" : ""}`}
                      onClick={() => setJournalsDropdownOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Membership Dropdown */}
          <div
            className="navbar__dropdown-wrap"
            ref={membershipRef}
            onMouseEnter={() => setMembershipDropdownOpen(true)}
            onMouseLeave={() => setMembershipDropdownOpen(false)}
          >
            <button
              id="membership-dropdown-btn"
              className={`navbar__dropdown-trigger${membershipDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isMembershipActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setMembershipDropdownOpen(prev => !prev);
              }}
              aria-haspopup="true"
              aria-expanded={membershipDropdownOpen}
            >
              Membership
              <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
            </button>
            <AnimatePresence>
              {membershipDropdownOpen && (
                <motion.div role="menu" className="navbar__dropdown"
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                  {MEMBERSHIP_DROPDOWN_ITEMS.map((item, i) => (
                    <Link key={item.label}
                      href={item.href}
                      role="menuitem"
                      className={`navbar__dropdown-item${i === 0 ? " navbar__dropdown-item--all" : ""}${isDropdownItemActive(item.href) ? " navbar__dropdown-item--active" : ""}`}
                      onClick={() => setMembershipDropdownOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PAGE Partners Dropdown */}
          <div
            className="navbar__dropdown-wrap"
            ref={partnersRef}
            onMouseEnter={() => setPartnersDropdownOpen(true)}
            onMouseLeave={() => setPartnersDropdownOpen(false)}
          >
            <button
              id="partners-dropdown-btn"
              className={`navbar__dropdown-trigger${partnersDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isPartnersActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setPartnersDropdownOpen(prev => !prev);
              }}
              aria-haspopup="true"
              aria-expanded={partnersDropdownOpen}
            >
              Partnerships
              <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
            </button>
            <AnimatePresence>
              {partnersDropdownOpen && (
                <motion.div role="menu" className="navbar__dropdown"
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                  {PARTNERS_DROPDOWN_ITEMS.map((item) => (
                    <Link key={item.label}
                      href={item.href}
                      role="menuitem"
                      className={`navbar__dropdown-item${isDropdownItemActive(item.href) ? " navbar__dropdown-item--active" : ""}`}
                      onClick={() => setPartnersDropdownOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PAGE Library Dropdown */}
          <div
            className="navbar__dropdown-wrap"
            ref={libraryRef}
            onMouseEnter={() => setLibraryDropdownOpen(true)}
            onMouseLeave={() => setLibraryDropdownOpen(false)}
          >
            <button
              id="library-dropdown-btn"
              className={`navbar__dropdown-trigger${libraryDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isLibraryActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setLibraryDropdownOpen(prev => !prev);
              }}
              aria-haspopup="true"
              aria-expanded={libraryDropdownOpen}
            >
              Library
              <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
            </button>
            <AnimatePresence>
              {libraryDropdownOpen && (
                <motion.div role="menu" className="navbar__dropdown"
                  variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                  {LIBRARY_DROPDOWN_ITEMS.map((item) => (
                    <Link key={item.label}
                      href={item.href}
                      role="menuitem"
                      className={`navbar__dropdown-item${isDropdownItemActive(item.href) ? " navbar__dropdown-item--active" : ""}`}
                      onClick={() => setLibraryDropdownOpen(false)}>
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
            <button
              id="activities-dropdown-btn"
              className={`navbar__dropdown-trigger${activitiesDropdownOpen ? " navbar__dropdown-trigger--open" : ""}${isActivitiesActive ? " navbar__dropdown-trigger--active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setActivitiesDropdownOpen(prev => !prev);
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
                  <Link href="/activities"
                    role="menuitem"
                    className={`navbar__dropdown-item navbar__dropdown-item--all${isDropdownItemActive("/activities") ? " navbar__dropdown-item--active" : ""}`}
                    onClick={() => setActivitiesDropdownOpen(false)}>
                    All Activities
                  </Link>
                  {ACTIVITY_DROPDOWN_ITEMS.map((item) => {
                    const href = `/activities?timeframe=${item.timeframe}`;
                    return (
                      <Link key={item.timeframe}
                        href={href}
                        role="menuitem"
                        className={`navbar__dropdown-item${isDropdownItemActive(href) ? " navbar__dropdown-item--active" : ""}`}
                        onClick={() => setActivitiesDropdownOpen(false)}>
                        {item.label}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Contact Link */}
          <Link href="/contact" className={`navbar__link${isContactActive ? " navbar__link--active" : ""}`}>
            Contact
          </Link>
        </div>

        <Link href="/member-login" className="navbar__signin">Sign In</Link>

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
        {ABOUT_DROPDOWN_ITEMS.slice(1).map(item => (
          <Link key={item.href} href={item.href} className={`navbar__mobile-sublink${isDropdownItemActive(item.href) ? " navbar__mobile-sublink--active" : ""}`} onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}

        {/* Chapters mobile */}
        <Link href="/chapters" className="navbar__mobile-dropdown-label navbar__mobile-dropdown-label--link" onClick={() => setMenuOpen(false)}>
          Chapters - Luzon
        </Link>
        <div className="navbar__mobile-chapters-grid">
          {LUZON_CHAPTERS.map(item => {
            const href = `/chapters/${item.slug}`;
            return (
              <Link key={item.slug} href={href} className={`navbar__mobile-chapter-link${isDropdownItemActive(href) ? " navbar__mobile-chapter-link--active" : ""}`} onClick={() => setMenuOpen(false)}>
                {item.short}
              </Link>
            );
          })}
        </div>
        <Link href="/chapters" className="navbar__mobile-dropdown-label navbar__mobile-dropdown-label--link" onClick={() => setMenuOpen(false)}>
          Chapters - Visayas
        </Link>
        <div className="navbar__mobile-chapters-grid">
          {VISAYAS_CHAPTERS.map(item => {
            const href = `/chapters/${item.slug}`;
            return (
              <Link key={item.slug} href={href} className={`navbar__mobile-chapter-link${isDropdownItemActive(href) ? " navbar__mobile-chapter-link--active" : ""}`} onClick={() => setMenuOpen(false)}>
                {item.short}
              </Link>
            );
          })}
        </div>
        <Link href="/chapters" className="navbar__mobile-dropdown-label navbar__mobile-dropdown-label--link" onClick={() => setMenuOpen(false)}>
          Chapters - Mindanao
        </Link>
        <div className="navbar__mobile-chapters-grid">
          {MINDANAO_CHAPTERS.map(item => {
            const href = `/chapters/${item.slug}`;
            return (
              <Link key={item.slug} href={href} className={`navbar__mobile-chapter-link${isDropdownItemActive(href) ? " navbar__mobile-chapter-link--active" : ""}`} onClick={() => setMenuOpen(false)}>
                {item.short}
              </Link>
            );
          })}
        </div>

        {/* Convention mobile */}
        <Link href="/convention" className="navbar__mobile-dropdown-label navbar__mobile-dropdown-label--link" onClick={() => setMenuOpen(false)}>
          Convention
        </Link>
        {CONVENTIONS_DROPDOWN_ITEMS.slice(1).map(item => (
          <Link key={item.href} href={item.href} className={`navbar__mobile-sublink${isDropdownItemActive(item.href) ? " navbar__mobile-sublink--active" : ""}`} onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}

        {/* Research Journals mobile */}
        <Link href="/journals" className="navbar__mobile-dropdown-label navbar__mobile-dropdown-label--link" onClick={() => setMenuOpen(false)}>
          Research Journals
        </Link>
        {JOURNALS_DROPDOWN_ITEMS.slice(1).map(item => (
          <Link key={item.href} href={item.href} className={`navbar__mobile-sublink${isDropdownItemActive(item.href) ? " navbar__mobile-sublink--active" : ""}`} onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}

        {/* Membership mobile */}
        <Link href="/membership" className="navbar__mobile-dropdown-label navbar__mobile-dropdown-label--link" onClick={() => setMenuOpen(false)}>
          Membership
        </Link>
        {MEMBERSHIP_DROPDOWN_ITEMS.map(item => (
          <Link key={item.label} href={item.href} className={`navbar__mobile-sublink${isDropdownItemActive(item.href) ? " navbar__mobile-sublink--active" : ""}`} onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}

        {/* PAGE Partners mobile */}
        <span className="navbar__mobile-dropdown-label">
          Partnerships
        </span>
        {PARTNERS_DROPDOWN_ITEMS.map(item => (
          <Link key={item.label} href={item.href} className={`navbar__mobile-sublink${isDropdownItemActive(item.href) ? " navbar__mobile-sublink--active" : ""}`} onClick={() => setMenuOpen(false)}>
            {item.label}
          </Link>
        ))}

        {/* PAGE Library mobile */}
        <span className="navbar__mobile-dropdown-label">
          Library
        </span>
        {LIBRARY_DROPDOWN_ITEMS.map(item => (
          <Link key={item.label} href={item.href} className={`navbar__mobile-sublink${isDropdownItemActive(item.href) ? " navbar__mobile-sublink--active" : ""}`} onClick={() => setMenuOpen(false)}>
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
        {ACTIVITY_DROPDOWN_ITEMS.map(item => {
          const href = `/activities?timeframe=${item.timeframe}`;
          return (
            <Link key={item.timeframe} href={href} className={`navbar__mobile-sublink${isDropdownItemActive(href) ? " navbar__mobile-sublink--active" : ""}`} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          );
        })}

        <Link href="/contact" className={`navbar__mobile-link${isContactActive ? " navbar__mobile-link--active" : ""}`} onClick={() => setMenuOpen(false)}>
          Contact
        </Link>
        <Link href="/member-login" className="navbar__mobile-signin" onClick={() => setMenuOpen(false)}>Sign In</Link>
      </div>
    </header>
  );
}

export default function Navbar(props: { scrolled: boolean }) {
  return (
    <Suspense fallback={
      <header className={`navbar${props.scrolled ? " navbar--scrolled" : ""}`}>
        <nav className="navbar__inner">
          <div className="navbar__logo">
            <div className="navbar__logo-mark">
              <img src="/PAGE.jpg" width={50} height={50} alt="PAGE Logo" />
            </div>
            <div className="navbar__logo-text">
              <div className="navbar__logo-name">PAGE</div>
              <div className="navbar__logo-sub">Philippine Association for Graduate Education</div>
            </div>
          </div>
          <div className="navbar__links" style={{ opacity: 0.7 }}>
            <span className="navbar__link">Home</span>
            <span className="navbar__link">About</span>
            <span className="navbar__link">Chapters</span>
            <span className="navbar__link">Convention</span>
            <span className="navbar__link">Research Journals</span>
            <span className="navbar__link">Membership</span>
            <span className="navbar__link">Partnerships</span>
            <span className="navbar__link">Library</span>
            <span className="navbar__link">News</span>
            <span className="navbar__link">National Activities</span>
            <span className="navbar__link">Contact</span>
          </div>
          <div className="navbar__signin" style={{ opacity: 0.7 }}>Sign In</div>
        </nav>
      </header>
    }>
      <NavbarContent {...props} />
    </Suspense>
  );
}
