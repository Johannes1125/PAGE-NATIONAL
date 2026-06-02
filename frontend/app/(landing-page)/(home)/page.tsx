"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "../../lib/api-client";
import "./home-page.css";
import Image from 'next/image';

// ── Icon Components ────────────────────────────────────────────────────────

const BookOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const JournalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const CalendarIconSm = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CalendarIconLg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

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

// ── Types & Data ───────────────────────────────────────────────────────────

type NavLink = "Home" | "About" | "News" | "Contact";

const getPath = (link: NavLink): string => {
  const map: Record<NavLink, string> = {
    Home: "/", About: "./about", News: "/news", Contact: "/contact",
  };
  return map[link];
};

// ── Static Data ────────────────────────────────────────────────────────────
const NAV_LINKS: NavLink[] = ["Home", "About", "News", "Contact"];

const RESOURCE_CARDS = [
  {
    icon: <BookOpenIcon />,
    num: "01",
    title: "Articles",
    desc: "Browse academic articles and research papers from leading scholars in graduate education.",
  },
  {
    icon: <JournalIcon />,
    num: "02",
    title: "Journals",
    desc: "Peer-reviewed journals advancing graduate education research across the Philippines.",
  },
  {
    icon: <CalendarIconLg />,
    num: "03",
    title: "Upcoming Activities",
    desc: "Conferences, workshops, and events organized for graduate education professionals.",
  },
  {
    icon: <UsersIcon />,
    num: "04",
    title: "Join PAGE",
    desc: "Become a member of our growing community of graduate education professionals.",
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
    excerpt: "Join us for the most anticipated event of the year as we explore cutting-edge innovations and best practices in graduate education.",
  },
  {
    date:    "February 28, 2026",
    author:  "Dr. Jose Reyes",
    title:   "New Research Grant Opportunities for Graduate Faculty",
    excerpt: "PAGE announces a new round of research grants supporting faculty members engaged in graduate-level research across Philippine universities.",
  },
  {
    date:    "February 10, 2026",
    author:  "Dr. Ana Lim",
    title:   "Guidelines Released for 2026 Graduate Program Accreditation",
    excerpt: "Updated guidelines for graduate program accreditation. Institutions are encouraged to review the new standards and prepare accordingly.",
  },
  {
    date:    "January 25, 2026",
    author:  "Dr. Ramon Cruz",
    title:   "International Collaboration Summit: Linking PH & Global Universities",
    excerpt: "PAGE facilitates a landmark collaboration summit connecting Philippine graduate schools with partner institutions across Asia, Europe, and North America.",
  },
  {
    date:    "January 14, 2026",
    author:  "Dr. Clara Bautista",
    title:   "Scholarship Program Opens for Graduate Students Nationwide",
    excerpt: "Applications are now open for PAGE's annual scholarship program supporting outstanding graduate students across the archipelago.",
  },
  {
    date:    "December 30, 2025",
    author:  "Dr. Noel Torres",
    title:   "Year in Review: Milestones in Philippine Graduate Education",
    excerpt: "As the year closes, we reflect on the remarkable achievements of the Philippine graduate education community and look ahead.",
  },
];

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES    = ["Journals", "Articles", "Upcoming Activities", "Contact Us"];
const FOOTER_CONTACT = [
  { icon: <MapPinIcon />,      text: "Manila, Philippines"  },
  { icon: <MailIconContact />, text: "page@gmail.edu.ph"    },
  { icon: <PhoneIcon />,       text: "+63 908 XXX XXXX"     },
];

// ── Navbar ─────────────────────────────────────────────────────────────────
function Navbar({ scrolled }: { scrolled: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <div className="navbar__logo-mark">
              <Image
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

        {/* Desktop links */}
        <div className="navbar__links">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link}
              href={getPath(link as NavLink)}
              className={`navbar__link${i === 0 ? " navbar__link--active" : ""}`}
            >
              {link}
            </Link>
          ))}
          <Link href="/member-login" className="navbar__signin">Sign In</Link>
        </div>

        {/* Hamburger */}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`navbar__mobile-menu${menuOpen ? " navbar__mobile-menu--open" : ""}`}>
        {NAV_LINKS.map((link, i) => (
          <Link
            key={link}
            href={getPath(link as NavLink)}
            className={`navbar__mobile-link${i === 0 ? " navbar__mobile-link--active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {link}
          </Link>
        ))}
        <Link href="/member-login" className="navbar__mobile-signin" onClick={() => setMenuOpen(false)}>
          Sign In
        </Link>
      </div>
    </header>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────
function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="hero">
      {/* Spiral dark background layers */}
      <div className="hero__spiral-base" />
      <div className="hero__spiral-1" />
      <div className="hero__spiral-2" />
      <div className="hero__spiral-3" />
      <div className="hero__nucleus" />
      <div className="hero__stars" />
      <div className="hero__rule-left" />
      <div className="hero__rule-right" />

      <div className={`hero__content${visible ? " hero__content--visible" : ""}`}>
        <div className="hero__eyebrow">
          <span className="hero__eyebrow-dot" />
          Est. in the Philippines
          <span className="hero__eyebrow-dot" />
        </div>

        <h1 className="hero__title">
          Philippine Association<br />
          for <em>Graduate Education</em>
        </h1>

        <p className="hero__subtitle">
          Advancing excellence in graduate education through collaboration,
          research, and professional development across the Philippines.
        </p>

        <div className="hero__cta-group">
          <button className="btn-primary">Get Started</button>
          <button className="btn-ghost">Learn More</button>
        </div>
      </div>

      {/* Stats strip */}
      <div className={`hero__stats${visible ? " hero__stats--visible" : ""}`}>
        {HERO_STATS.map(s => (
          <div key={s.label} className="hero__stat-card">
            <div className="hero__stat-value">{s.value}</div>
            <div className="hero__stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Resources ──────────────────────────────────────────────────────────────
function ResourcesSection() {
  return (
    <section className="resources">
      <div className="container">
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
              <div className="resource-card__num">{card.num}</div>
              <div className="resource-card__icon">{card.icon}</div>
              <h3 className="resource-card__title">{card.title}</h3>
              <p className="resource-card__desc">{card.desc}</p>
              <a href="#" className="resource-card__link">
                Explore <ArrowIcon />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── News ───────────────────────────────────────────────────────────────────
type NewsCardType = {
  date: string;
  author: string;
  title: string;
  excerpt: string;
};

function NewsCard({ card }: { card: NewsCardType }) {
  return (
    <div className="news-card">
      <div className="news-card__image">
        <span className="news-card__image-label">Research</span>
      </div>
      <div className="news-card__body">
        <div className="news-card__meta">
          <span className="news-card__date">{card.date}</span>
          <span className="news-card__dot">·</span>
          <span className="news-card__author">{card.author}</span>
        </div>
        <h4 className="news-card__title">{card.title}</h4>
        <p className="news-card__excerpt">{card.excerpt}</p>
        <a href="#" className="news-card__link">
          Read More <ArrowIcon />
        </a>
      </div>
    </div>
  );
}

// ── News Section ───────────────────────────────────────────────────────────
function NewsSection() {
  const [posts, setPosts] = useState<NewsCardType[]>([]);

  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        const response = await api.get('/public/posts');
        const mapped = response.posts.map((post: any) => ({
          date: new Date(post.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          }),
          author: post.author || "PAGE National",
          title: post.title,
          excerpt: post.excerpt || "Browse full content within our publications portal.",
        }));
        if (mapped.length > 0) {
          setPosts(mapped);
        } else {
          setPosts(NEWS_CARDS);
        }
      } catch (err) {
        console.error("Failed to fetch public posts", err);
        setPosts(NEWS_CARDS);
      }
    };
    fetchPublicPosts();
  }, []);

  return (
    <section className="news">
      <div className="container">
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
          {posts.map((card) => (
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
              <div className="footer__logo-mark">
                <span className="navbar__logo-mark-fallback" style={{ display: "none" }}>PAGE</span>
              </div>
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
                <li key={l}><a href="#" className="footer__link">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="footer__col-title">Resources</h4>
            <ul className="footer__links">
              {FOOTER_RESOURCES.map(l => (
                <li key={l}><a href="#" className="footer__link">{l}</a></li>
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