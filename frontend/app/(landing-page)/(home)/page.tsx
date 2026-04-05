"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import "./home-page.css";

// ── Icon Components ────────────────────────────────────────────────────────
const BookOpenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const JournalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="13" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CalendarIconLg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const MailIconSm = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MailIconContact = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
  </svg>
);

const NewsPlaceholderIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
  </svg>
);

type NavLink = "Home" | "About" | "News" | "Contact";

const getPath = (link: NavLink) => {
  switch (link) {
    case "Home":
      return "/";
    case "About":
      return "./about";
    case "News":
      return "/news";
    case "Contact":
      return "/contact";
    default:
      return "/"; // this line is technically unreachable now
  }
};

// ── Static Data ────────────────────────────────────────────────────────────
const NAV_LINKS = ["Home", "About", "News", "Contact"];

const RESOURCE_CARDS = [
  {
    icon: <BookOpenIcon />,
    title: "Articles",
    desc: "Browse our collection of academic articles and research papers from leading scholars in graduate education.",
  },
  {
    icon: <JournalIcon />,
    title: "Journals",
    desc: "Access peer-reviewed journals dedicated to advancing graduate education research across the Philippines.",
  },
  {
    icon: <CalendarIconLg />,
    title: "Upcoming Activities",
    desc: "Stay updated on conferences, workshops, and events organized for graduate education professionals.",
  },
  {
    icon: <UsersIcon />,
    title: "Join PAGE",
    desc: "Become a member of our growing community of graduate education professionals and researchers.",
  },
];

const HERO_STATS = [
  { label: "Member Institutions", value: "120+" },
  { label: "Published Journals",  value: "340+" },
  { label: "Annual Events",       value: "28"   },
];

const NEWS_CARDS = [
  {
    date:    "March 12, 2026",
    author:  "Dr. Maria Santos",
    title:   "PAGE Annual Conference 2026: Innovation in Graduate Education",
    excerpt: "Join us for the most anticipated event of the year as we explore cutting-edge innovations and best practices in graduate education. This three-day conference brings together...",
  },
  {
    date:    "February 28, 2026",
    author:  "Dr. Jose Reyes",
    title:   "New Research Grant Opportunities for Graduate Faculty",
    excerpt: "PAGE announces a new round of research grants aimed at supporting faculty members engaged in graduate-level research across Philippine universities...",
  },
  {
    date:    "February 10, 2026",
    author:  "Dr. Ana Lim",
    title:   "Guidelines Released for 2026 Graduate Program Accreditation",
    excerpt: "The commission has released updated guidelines for graduate program accreditation. Institutions are encouraged to review the new standards and prepare accordingly...",
  },
  {
    date:    "January 25, 2026",
    author:  "Dr. Ramon Cruz",
    title:   "International Collaboration Summit: Linking PH & Global Universities",
    excerpt: "PAGE facilitates a landmark collaboration summit connecting Philippine graduate schools with partner institutions in Asia, Europe, and North America...",
  },
  {
    date:    "January 14, 2026",
    author:  "Dr. Clara Bautista",
    title:   "Scholarship Program Opens for Graduate Students Nationwide",
    excerpt: "Applications are now open for PAGE's annual scholarship program supporting outstanding graduate students from across the archipelago...",
  },
  {
    date:    "December 30, 2025",
    author:  "Dr. Noel Torres",
    title:   "Year in Review: Milestones in Philippine Graduate Education",
    excerpt: "As the year closes, we reflect on the remarkable achievements of the Philippine graduate education community and look forward to what lies ahead...",
  },
];

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES    = ["Journals", "Articles", "Upcoming Activities", "Contact Us"];

const FOOTER_CONTACT = [
  { icon: <MapPinIcon />,      text: "Manila, Philippines"  },
  { icon: <MailIconContact />, text: "page@gmail.edu.ph"    },
  { icon: <PhoneIcon />,       text: "+63 908 XXX XXXX"     },
];

// ── Hamburger Icon ─────────────────────────────────────────────────────────
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6"  />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6"  x2="6"  y2="18" />
    <line x1="6"  y1="6"  x2="18" y2="18" />
  </svg>
);

// ── Navbar ─────────────────────────────────────────────────────────────────
function Navbar({ scrolled }: { scrolled: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on resize back to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className={`navbar${scrolled ? " navbar--scrolled" : ""}${menuOpen ? " navbar--open" : ""}`}>
      <nav className="navbar__inner">

        {/* Logo */}
        <div className="navbar__logo">
          <div className="navbar__logo-icon"></div>
          <div>
            <div className="navbar__logo-name">PAGE</div>
            <div className="navbar__logo-tagline">An academic towards to excellence</div>
          </div>
        </div>

        {/* Desktop links */}
        <div className="navbar__links">
  {NAV_LINKS.map((link, i) => (
    <Link
      key={link}
      href={getPath(link)}
      className={`navbar__link${i === 0 ? " navbar__link--active" : ""}`}
    >
      {link}
    </Link>
  ))}
  <Link href="/member-login" className="navbar__signin">Sign In</Link>
</div>

        {/* Hamburger button (mobile only) */}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>

      </nav>

      {/* Mobile dropdown menu */}
      <div className={`navbar__mobile-menu${menuOpen ? " navbar__mobile-menu--open" : ""}`}>
        {NAV_LINKS.map((link, i) => (
          <Link
            key={link}
            href={getPath(link)}
            className={`navbar__mobile-link${i === 0 ? " navbar__mobile-link--active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {link}
          </Link>
        ))}
        <Link
          href="/login"
          className="navbar__mobile-signin"
          onClick={() => setMenuOpen(false)}
        >
          Sign In
        </Link>
      </div>

    </header>
  );
}

// ── Hero Section ───────────────────────────────────────────────────────────
function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="hero">
      {/* Decorative backgrounds */}
      <div className="hero__grid-overlay" />
      <div className="hero__orb hero__orb--left" />
      <div className="hero__orb hero__orb--right" />

      {/* Main content */}
      <div className={`hero__content${visible ? " hero__content--visible" : ""}`}>
        <span className="hero__badge">Est. in the Philippines</span>

        <h1 className="hero__title">
          Philippine Association for<br />
          <span className="hero__title-accent">Graduate Education</span>
        </h1>

        <p className="hero__subtitle">
          Advancing excellence in graduate education through collaboration, research,
          and professional development across the Philippines.
        </p>

        <div className="hero__cta-group">
          <button className="btn-primary">Get Started</button>
          <button className="btn-outline">Learn More</button>
        </div>
      </div>

      {/* Stats */}
      <div className={`hero__stats${visible ? " hero__stats--visible" : ""}`}>
        {HERO_STATS.map(s => (
          <div key={s.label} className="hero__stat-card">
            <div className="hero__stat-value">{s.value}</div>
            <div className="hero__stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom wave */}
      <div className="hero__wave">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60V30C240 0 480 60 720 30C960 0 1200 60 1440 30V60H0Z" fill="#FAF9F6" />
        </svg>
      </div>
    </section>
  );
}

// ── Resources Section ──────────────────────────────────────────────────────
function ResourcesSection() {
  return (
    <section className="resources">
      <div className="resources__inner">

        <div className="section-header">
          <span className="section-label">What We Offer</span>
          <h2 className="section-title">Explore Our Resources</h2>
          <p className="section-subtitle">
            Discover opportunities and resources designed for graduate education
            professionals across the Philippines.
          </p>
        </div>

        <div className="resources__grid">
          {RESOURCE_CARDS.map(card => (
            <div key={card.title} className="resource-card">
              <div className="resource-card__icon">{card.icon}</div>
              <h3 className="resource-card__title">{card.title}</h3>
              <p className="resource-card__desc">{card.desc}</p>
              <a href="#" className="resource-card__link">Explore →</a>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────
type NewsCardType = {
  date:    string;
  author:  string;
  title:   string;
  excerpt: string;
};

// ── News Card ──────────────────────────────────────────────────────────────
function NewsCard({ card }: { card: NewsCardType }) {
  return (
    <div className="news-card">
      <div className="news-card__image">
        <div className="news-card__image-placeholder">
          <NewsPlaceholderIcon />
        </div>
      </div>

      <div className="news-card__body">
        <div className="news-card__meta">
          <CalendarIcon />
          <span className="news-card__meta-text">{card.date}</span>
          <span className="news-card__meta-dot">•</span>
          <span className="news-card__meta-text">{card.author}</span>
        </div>
        <h4 className="news-card__title">{card.title}</h4>
        <p className="news-card__excerpt">{card.excerpt}</p>
        <a href="#" className="news-card__link">Read More →</a>
      </div>
    </div>
  );
}

// ── News Section ───────────────────────────────────────────────────────────
function NewsSection() {
  return (
    <section className="news">
      <div className="news__inner">

        <div className="news__header">
          <div className="news__header-text">
            <span className="section-label">Latest Updates</span>
            <h2 className="news__title">News &amp; Announcements</h2>
            <p className="news__subtitle">
              Stay informed with the latest developments in Philippine graduate education.
            </p>
          </div>
          <button className="btn-dark">View All News</button>
        </div>

        <div className="news__grid">
          {NEWS_CARDS.map(card => (
            <NewsCard key={card.title} card={card} />
          ))}
        </div>

      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">

        <div className="footer__columns">

          {/* Brand */}
          <div>
            <div className="footer__brand-logo">
              <div className="footer__logo-icon">PAGE</div>
              <div>
                <div className="footer__logo-name">PAGE</div>
                <div className="footer__logo-tagline">An academic towards to excellence</div>
              </div>
            </div>
            <p className="footer__brand-desc">
              Philippine Association for Graduate Education — Advancing excellence
              in graduate education through collaboration and research.
            </p>
            <div className="footer__socials">
              {[<FacebookIcon />, <InstagramIcon />, <MailIconSm />].map((icon, i) => (
                <button key={i} className="footer__social-btn">{icon}</button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer__col-title">Quick Links</h4>
            <ul className="footer__links">
              {FOOTER_QUICK_LINKS.map(l => (
                <li key={l}>
                  <a href="#" className="footer__link">&rsaquo; {l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="footer__col-title">Resources</h4>
            <ul className="footer__links">
              {FOOTER_RESOURCES.map(l => (
                <li key={l}>
                  <a href="#" className="footer__link">&rsaquo; {l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
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

        {/* Bottom bar */}
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

// ── Main Page ──────────────────────────────────────────────────────────────
export default function PAGELandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Navbar scrolled={scrolled} />
      <main>
        <HeroSection />
        <ResourcesSection />
        <NewsSection />
      </main>
      <Footer />
    </>
  );
}