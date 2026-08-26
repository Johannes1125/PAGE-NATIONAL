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
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FacebookIconHeader = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIconHeader = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const MailIconHeader = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

// ── Dropdown Items Configuration ──────────────────────────────────────────
const ABOUT_DROPDOWN_ITEMS = [
  { label: "About PAGE",                href: "/about" },
  { label: "Constitution and By-Laws",  href: "/about/cbl" },
  { label: "History of PAGE",           href: "/about/history" },
  { label: "PAGE Logo & Description",   href: "/about/logo" },
  { label: "PAGE National Officers",    href: "/about/officers" },
  { label: "SEC Registration",          href: "/about/sec" },
  { label: "BIR Certification",         href: "/about/bir" },
];

const MEMBERSHIP_DROPDOWN_ITEMS = [
  { label: "Membership Categories",   href: "/membership" },
  { label: "Apply Online",            href: "/membership/apply" },
  { label: "Regular Members",         href: "/membership?cat=regular#requirements" },
  { label: "Life Members",            href: "/membership?cat=life#requirements" },
  { label: "Membership Forms",        href: "/membership/apply" },
  { label: "Membership Requirements", href: "/membership#requirements" },
];

const RESOURCES_DROPDOWN_ITEMS = [
  { label: "Graduate Education Standards", href: "/library" },
  { label: "Policies & Advocacy",           href: "/library?tab=cmo" },
  { label: "Research & Journals",           href: "/journals" },
  { label: "Forms & Templates",             href: "/library?tab=other" },
  { label: "Member Directory",              href: "/membership" },
  { label: "Partnerships",                  href: "/partners" },
];

const NEWS_DROPDOWN_ITEMS = [
  { label: "All News & Announcements", href: "/news" },
  { label: "Press Releases",            href: "/news?cat=press" },
  { label: "Statements & Policy Briefs",href: "/news?cat=statements" },
];

const EVENTS_DROPDOWN_ITEMS = [
  { label: "All Events & Activities", href: "/activities" },
  { label: "Upcoming Webinars",       href: "/activities?timeframe=future" },
  { label: "National Conventions",   href: "/convention" },
];

const dropdownVariants: Variants = {
  hidden:  { opacity: 0, y: -4, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.15, ease: "easeOut" } },
  exit:    { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.1 } },
};

function NavbarContent({ scrolled }: { scrolled: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const payloadStr = localStorage.getItem("page_user_payload");
      if (payloadStr) {
        try {
          setUser(JSON.parse(payloadStr));
        } catch (e) {
          console.error(e);
        }
      } else {
        setUser(null);
      }
    }
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem("page_user_token");
    localStorage.removeItem("page_user_payload");
    setUser(null);
    window.location.href = "/";
  };

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
    return pathname === href;
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [membershipOpen, setMembershipOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);

  const aboutRef = useRef<HTMLDivElement>(null);
  const membershipRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  const closeAll = () => {
    setAboutOpen(false);
    setMembershipOpen(false);
    setResourcesOpen(false);
    setNewsOpen(false);
    setEventsOpen(false);
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
      if (aboutRef.current && !aboutRef.current.contains(target)) setAboutOpen(false);
      if (membershipRef.current && !membershipRef.current.contains(target)) setMembershipOpen(false);
      if (resourcesRef.current && !resourcesRef.current.contains(target)) setResourcesOpen(false);
      if (newsRef.current && !newsRef.current.contains(target)) setNewsOpen(false);
      if (eventsRef.current && !eventsRef.current.contains(target)) setEventsOpen(false);
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
    const onResize = () => { if (window.innerWidth > 1100) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isHomeActive = pathname === "/";
  const isAboutActive = pathname?.startsWith("/about");
  const isMembershipActive = pathname?.startsWith("/membership");
  const isChaptersActive = pathname?.startsWith("/chapters");
  const isResourcesActive = pathname?.startsWith("/library") || pathname?.startsWith("/journals") || pathname?.startsWith("/partners");
  const isNewsActive = pathname?.startsWith("/news");
  const isEventsActive = pathname?.startsWith("/activities") || pathname?.startsWith("/convention");
  const isContactActive = pathname?.startsWith("/contact");

  return (
    <div className="navbar-wrapper">


      {/* Main Header / Navbar */}
      <header className={`navbar${scrolled ? " navbar--scrolled" : ""}${menuOpen ? " navbar--open" : ""}`}>
        <nav className="navbar__inner">
          {/* Logo */}
          <Link href="/" className="navbar__logo">
            <div className="navbar__logo-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/PAGE-favicon.png"
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
              <span className="navbar__logo-name">PHILIPPINE ASSOCIATION</span>
              <span className="navbar__logo-name">FOR GRADUATE EDUCATION</span>
              <span className="navbar__logo-badge">National</span>
              {/* <span className="navbar__logo-badge">PAGE National</span> */}
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="navbar__links">
            {/* Home */}
            <Link href="/" className={`navbar__link${isHomeActive ? " navbar__link--active" : ""}`}>
              Home
            </Link>

            {/* About PAGE Dropdown */}
            <div
              className="navbar__dropdown-wrap"
              ref={aboutRef}
              onMouseEnter={() => setAboutOpen(true)}
              onMouseLeave={() => setAboutOpen(false)}
            >
              <button
                className={`navbar__dropdown-trigger${aboutOpen ? " navbar__dropdown-trigger--open" : ""}${isAboutActive ? " navbar__dropdown-trigger--active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setAboutOpen(prev => !prev);
                }}
                aria-haspopup="true"
                aria-expanded={aboutOpen}
              >
                About PAGE
                <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
              </button>
              <AnimatePresence>
                {aboutOpen && (
                  <motion.div role="menu" className="navbar__dropdown"
                    variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                    {ABOUT_DROPDOWN_ITEMS.map((item, i) => (
                      <Link key={item.href}
                        href={item.href}
                        role="menuitem"
                        className={`navbar__dropdown-item${i === 0 ? " navbar__dropdown-item--all" : ""}${isDropdownItemActive(item.href) ? " navbar__dropdown-item--active" : ""}`}
                        onClick={() => setAboutOpen(false)}>
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
              onMouseEnter={() => setMembershipOpen(true)}
              onMouseLeave={() => setMembershipOpen(false)}
            >
              <button
                className={`navbar__dropdown-trigger${membershipOpen ? " navbar__dropdown-trigger--open" : ""}${isMembershipActive ? " navbar__dropdown-trigger--active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setMembershipOpen(prev => !prev);
                }}
                aria-haspopup="true"
                aria-expanded={membershipOpen}
              >
                Membership
                <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
              </button>
              <AnimatePresence>
                {membershipOpen && (
                  <motion.div role="menu" className="navbar__dropdown"
                    variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                    {MEMBERSHIP_DROPDOWN_ITEMS.map((item, i) => (
                      <Link key={item.label}
                        href={item.href}
                        role="menuitem"
                        className={`navbar__dropdown-item${i === 0 ? " navbar__dropdown-item--all" : ""}${isDropdownItemActive(item.href) ? " navbar__dropdown-item--active" : ""}`}
                        onClick={() => setMembershipOpen(false)}>
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chapters Standalone Link */}
            <Link href="/chapters" className={`navbar__link${isChaptersActive ? " navbar__link--active" : ""}`}>
              Chapters
            </Link>

            {/* Resources Dropdown */}
            <div
              className="navbar__dropdown-wrap"
              ref={resourcesRef}
              onMouseEnter={() => setResourcesOpen(true)}
              onMouseLeave={() => setResourcesOpen(false)}
            >
              <button
                className={`navbar__dropdown-trigger${resourcesOpen ? " navbar__dropdown-trigger--open" : ""}${isResourcesActive ? " navbar__dropdown-trigger--active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setResourcesOpen(prev => !prev);
                }}
                aria-haspopup="true"
                aria-expanded={resourcesOpen}
              >
                Resources
                <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
              </button>
              <AnimatePresence>
                {resourcesOpen && (
                  <motion.div role="menu" className="navbar__dropdown"
                    variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                    {RESOURCES_DROPDOWN_ITEMS.map((item) => (
                      <Link key={item.label}
                        href={item.href}
                        role="menuitem"
                        className={`navbar__dropdown-item${isDropdownItemActive(item.href) ? " navbar__dropdown-item--active" : ""}`}
                        onClick={() => setResourcesOpen(false)}>
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* News Dropdown */}
            <div
              className="navbar__dropdown-wrap"
              ref={newsRef}
              onMouseEnter={() => setNewsOpen(true)}
              onMouseLeave={() => setNewsOpen(false)}
            >
              <button
                className={`navbar__dropdown-trigger${newsOpen ? " navbar__dropdown-trigger--open" : ""}${isNewsActive ? " navbar__dropdown-trigger--active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setNewsOpen(prev => !prev);
                }}
                aria-haspopup="true"
                aria-expanded={newsOpen}
              >
                News
                <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
              </button>
              <AnimatePresence>
                {newsOpen && (
                  <motion.div role="menu" className="navbar__dropdown"
                    variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                    {NEWS_DROPDOWN_ITEMS.map((item) => (
                      <Link key={item.label}
                        href={item.href}
                        role="menuitem"
                        className={`navbar__dropdown-item${isDropdownItemActive(item.href) ? " navbar__dropdown-item--active" : ""}`}
                        onClick={() => setNewsOpen(false)}>
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Events Dropdown */}
            <div
              className="navbar__dropdown-wrap"
              ref={eventsRef}
              onMouseEnter={() => setEventsOpen(true)}
              onMouseLeave={() => setEventsOpen(false)}
            >
              <button
                className={`navbar__dropdown-trigger${eventsOpen ? " navbar__dropdown-trigger--open" : ""}${isEventsActive ? " navbar__dropdown-trigger--active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  setEventsOpen(prev => !prev);
                }}
                aria-haspopup="true"
                aria-expanded={eventsOpen}
              >
                Events
                <span className="navbar__dropdown-chevron"><ChevronDownIcon /></span>
              </button>
              <AnimatePresence>
                {eventsOpen && (
                  <motion.div role="menu" className="navbar__dropdown"
                    variants={dropdownVariants} initial="hidden" animate="visible" exit="exit">
                    {EVENTS_DROPDOWN_ITEMS.map((item) => (
                      <Link key={item.label}
                        href={item.href}
                        role="menuitem"
                        className={`navbar__dropdown-item${isDropdownItemActive(item.href) ? " navbar__dropdown-item--active" : ""}`}
                        onClick={() => setEventsOpen(false)}>
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
          </div>

          {/* Right Action Menu */}
          <div className="navbar__actions">
            {user && (
              <div className="navbar__user-menu">
                {user.role === 'admin' && (
                  <Link href="/admin-dashboard" className="navbar__dashboard-btn">Dashboard</Link>
                )}
                {user.role === 'organization' && (
                  <Link href="/org-dashboard" className="navbar__dashboard-btn">Dashboard</Link>
                )}
                <button onClick={handleSignOut} className="navbar__signout-btn">Sign Out</button>
              </div>
            )}

            <button className="navbar__hamburger" onClick={() => setMenuOpen(p => !p)} aria-label="Toggle menu">
              {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`navbar__mobile-menu${menuOpen ? " navbar__mobile-menu--open" : ""}`}>
          <Link href="/" className={`navbar__mobile-link${isHomeActive ? " navbar__mobile-link--active" : ""}`} onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          {/* About PAGE mobile */}
          <span className="navbar__mobile-dropdown-label">About PAGE</span>
          {ABOUT_DROPDOWN_ITEMS.map(item => (
            <Link key={item.href} href={item.href} className={`navbar__mobile-sublink${isDropdownItemActive(item.href) ? " navbar__mobile-sublink--active" : ""}`} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}

          {/* Membership mobile */}
          <span className="navbar__mobile-dropdown-label">Membership</span>
          {MEMBERSHIP_DROPDOWN_ITEMS.map(item => (
            <Link key={item.label} href={item.href} className={`navbar__mobile-sublink${isDropdownItemActive(item.href) ? " navbar__mobile-sublink--active" : ""}`} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}

          {/* Chapters mobile */}
          <Link href="/chapters" className={`navbar__mobile-link${isChaptersActive ? " navbar__mobile-link--active" : ""}`} onClick={() => setMenuOpen(false)}>
            Chapters
          </Link>

          {/* Resources mobile */}
          <span className="navbar__mobile-dropdown-label">Resources</span>
          {RESOURCES_DROPDOWN_ITEMS.map(item => (
            <Link key={item.label} href={item.href} className={`navbar__mobile-sublink${isDropdownItemActive(item.href) ? " navbar__mobile-sublink--active" : ""}`} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}

          {/* News mobile */}
          <span className="navbar__mobile-dropdown-label">News</span>
          {NEWS_DROPDOWN_ITEMS.map(item => (
            <Link key={item.label} href={item.href} className={`navbar__mobile-sublink${isDropdownItemActive(item.href) ? " navbar__mobile-sublink--active" : ""}`} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}

          {/* Events mobile */}
          <span className="navbar__mobile-dropdown-label">Events</span>
          {EVENTS_DROPDOWN_ITEMS.map(item => (
            <Link key={item.label} href={item.href} className={`navbar__mobile-sublink${isDropdownItemActive(item.href) ? " navbar__mobile-sublink--active" : ""}`} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}

          <Link href="/contact" className={`navbar__mobile-link${isContactActive ? " navbar__mobile-link--active" : ""}`} onClick={() => setMenuOpen(false)}>
            Contact
          </Link>

          {user && (
            <div className="navbar__mobile-user-menu">
              <div className="navbar__mobile-user-info">
                <span className="navbar__mobile-user-name">{user.name}</span>
                <span className="navbar__mobile-user-role">{user.role}</span>
              </div>
              {user.role === 'admin' && (
                <Link href="/admin-dashboard" className="navbar__mobile-dashboard" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
              )}
              {user.role === 'organization' && (
                <Link href="/org-dashboard" className="navbar__mobile-dashboard" onClick={() => setMenuOpen(false)}>Organization Dashboard</Link>
              )}
              <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="navbar__mobile-signout">Sign Out</button>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default function Navbar(props: { scrolled: boolean }) {
  return (
    <Suspense fallback={
      <header className={`navbar${props.scrolled ? " navbar--scrolled" : ""}`}>
        <nav className="navbar__inner">
          <div className="navbar__logo">
            <div className="navbar__logo-mark">
              <img src="/PAGE-favicon.png" width={50} height={50} alt="PAGE Logo" />
            </div>
          </div>
          <div className="navbar__links" style={{ opacity: 0.7 }}>
            <span className="navbar__link">Home</span>
            <span className="navbar__link">About PAGE</span>
            <span className="navbar__link">Membership</span>
            <span className="navbar__link">Chapters</span>
            <span className="navbar__link">Resources</span>
            <span className="navbar__link">News</span>
            <span className="navbar__link">Events</span>
            <span className="navbar__link">Contact</span>
          </div>
        </nav>
      </header>
    }>
      <NavbarContent {...props} />
    </Suspense>
  );
}
