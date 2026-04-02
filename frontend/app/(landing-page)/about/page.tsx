"use client";
import { useState, useEffect } from "react";
import "./about-page.css";

// ── Icon Components ────────────────────────────────────────────────────────
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6"  x2="21" y2="6" />
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

const EyeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const CompassIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const StarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LightbulbIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18" />
    <line x1="10" y1="22" x2="14" y2="22" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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

// ── Static Data ────────────────────────────────────────────────────────────
const NAV_LINKS = ["Home", "About", "News", "Contact"];

const TIMELINE_EVENTS = [
  {
    year: "2010",
    title: "Foundation Year",
    desc: "PAGE was officially established as a special project under the Commission on Higher Education (CHED), marking the beginning of a national movement to elevate graduate education standards across the Philippines.",
  },
  {
    year: "2012",
    title: "First National Conference",
    desc: "PAGE hosted its inaugural national conference, bringing together graduate school deans and faculty from over 80 universities across the Philippine archipelago to share research and best practices.",
  },
  {
    year: "2015",
    title: "International Partnerships",
    desc: "PAGE established formal partnerships with leading graduate education organizations in Asia, Europe, and North America, opening doors for international research collaboration and faculty exchange programs.",
  },
  {
    year: "2018",
    title: "Digital Research Repository",
    desc: "Launched the national digital repository for Philippine graduate research, providing open access to thousands of theses, dissertations, and peer-reviewed articles from member institutions.",
  },
  {
    year: "2021",
    title: "Virtual Learning Initiative",
    desc: "In response to the global pandemic, PAGE pioneered hybrid graduate education frameworks adopted by over 120 universities, ensuring continuity and quality in graduate programs nationwide.",
  },
  {
    year: "2024",
    title: "Excellence Awards Program",
    desc: "PAGE introduced the annual Graduate Education Excellence Awards, recognizing outstanding contributions by faculty, researchers, and graduate students across the Philippines.",
  },
];

const OFFICERS = [
  { name: "Dr. Juan Dela Cruz",    role: "President",           bio: "Leading PAGE with over 20 years of experience in graduate education and research administration." },
  { name: "Dr. Maria Santos",      role: "Vice President",      bio: "Championing research excellence and international collaborations across Philippine universities." },
  { name: "Dr. Ana Reyes",         role: "Secretary General",   bio: "Overseeing organizational operations and strategic planning for sustainable institutional growth." },
  { name: "Dr. Jose Bautista",     role: "Treasurer",           bio: "Managing financial resources and funding programs that support graduate education initiatives." },
  { name: "Dr. Clara Lim",         role: "PRO",                 bio: "Building bridges between PAGE and the academic community through communications and outreach." },
  { name: "Dr. Ramon Torres",      role: "Auditor",             bio: "Ensuring financial transparency and accountability in all PAGE programs and activities." },
  { name: "Dr. Elena Cruz",        role: "Board Member",        bio: "Contributing expertise in curriculum development and graduate program accreditation standards." },
  { name: "Dr. Miguel Aquino",     role: "Board Member",        bio: "Driving innovation in research methodologies and interdisciplinary graduate studies." },
];

const CORE_VALUES = [
  { icon: <StarIcon />,      title: "Excellence",       desc: "Committed to the highest standards in graduate education, research, and professional development." },
  { icon: <UsersIcon />,     title: "Collaboration",    desc: "Fostering partnerships among institutions, researchers, and professionals to advance shared goals." },
  { icon: <LightbulbIcon />, title: "Innovation",       desc: "Embracing new ideas, methodologies, and technologies to continuously improve graduate education." },
  { icon: <GlobeIcon />,     title: "Global Outlook",   desc: "Connecting Philippine graduate education to international standards and global academic communities." },
  { icon: <HeartIcon />,     title: "Integrity",        desc: "Upholding ethical conduct, transparency, and accountability in all organizational activities." },
  { icon: <CompassIcon />,   title: "Service",          desc: "Dedicating our efforts to the advancement of graduate education and national development." },
];

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES    = ["Journals", "Articles", "Upcoming Activities", "Contact Us"];
const FOOTER_CONTACT = [
  { icon: <MapPinIcon />,      text: "Manila, Philippines"  },
  { icon: <MailIconContact />, text: "page@gmail.edu.ph"    },
  { icon: <PhoneIcon />,       text: "+63 908 XXX XXXX"     },
];

// ── Types ──────────────────────────────────────────────────────────────────
type OfficerType = {
  name: string;
  role: string;
  bio:  string;
};

type TimelineEventType = {
  year:  string;
  title: string;
  desc:  string;
};

type CoreValueType = {
  icon:  React.ReactNode;
  title: string;
  desc:  string;
};

// ── Navbar (Light variant) ─────────────────────────────────────────────────
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll  = () => setScrolled(window.scrollY > 10);
    const onResize  = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <header className={`about-navbar${scrolled ? " about-navbar--scrolled" : ""}${menuOpen ? " about-navbar--open" : ""}`}>
      <nav className="about-navbar__inner">

        {/* Logo */}
        <div className="about-navbar__logo">
          <div className="about-navbar__logo-icon">PAGE</div>
          <div>
            <div className="about-navbar__logo-name">PAGE</div>
            <div className="about-navbar__logo-tagline">An academic towards to excellence</div>
          </div>
        </div>

        {/* Desktop links */}
        <div className="about-navbar__links">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={link === "Home" ? "/" : `/${link.toLowerCase()}`}
              className={`about-navbar__link${link === "About" ? " about-navbar__link--active" : ""}`}
            >
              {link}
            </a>
          ))}
          <button className="about-navbar__signin">Sign In</button>
        </div>

        {/* Hamburger */}
        <button
          className="about-navbar__hamburger"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div className={`about-navbar__mobile-menu${menuOpen ? " about-navbar__mobile-menu--open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href={link === "Home" ? "/" : `/${link.toLowerCase()}`}
            className={`about-navbar__mobile-link${link === "About" ? " about-navbar__mobile-link--active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {link}
          </a>
        ))}
        <button className="about-navbar__mobile-signin" onClick={() => setMenuOpen(false)}>
          Sign In
        </button>
      </div>
    </header>
  );
}

// ── Page Hero ─────────────────────────────────────────────────────────────
function AboutHero() {
  return (
    <section className="about-hero">
      <div className="about-hero__inner">
        <div className="about-hero__breadcrumb">
          <a href="/" className="about-hero__breadcrumb-link">Home</a>
          <span className="about-hero__breadcrumb-sep">/</span>
          <span className="about-hero__breadcrumb-current">About</span>
        </div>
        <h1 className="about-hero__title">About PAGE</h1>
        <div className="about-hero__divider" />
        <p className="about-hero__subtitle">
          Philippine Association for Graduate Education — Advancing excellence through
          collaboration, research, and innovation under the CHED Program.
        </p>
      </div>
    </section>
  );
}

// ── About the Organization ────────────────────────────────────────────────
function AboutOrganization() {
  return (
    <section className="about-org">
      <div className="about-org__inner">

        {/* Text side */}
        <div className="about-org__text">
          <span className="section-label-dark">Who We Are</span>
          <h2 className="about-org__heading">About the Organization</h2>
          <p className="about-org__body">
            The Philippine Association for Graduate Education (PAGE) is a distinguished
            national organization operating as a special project under the Commission on
            Higher Education (CHED) Program. Established to promote and enhance the quality
            of graduate education across the Philippines, PAGE serves as a vital bridge
            connecting graduate schools, researchers, and education professionals nationwide.
          </p>
          <p className="about-org__body">
            Our mission is to foster excellence in graduate education through collaborative
            research, professional development, and the dissemination of scholarly knowledge.
            We work closely with universities, research institutions, and government agencies
            to ensure that graduate programs meet international standards.
          </p>
          <p className="about-org__body">
            PAGE is committed to supporting graduate students, faculty members, and
            administrators through various initiatives including conferences, workshops,
            publications, and networking opportunities.
          </p>
        </div>

        {/* Image/visual side */}
        <div className="about-org__visual">
          <div className="about-org__image-card">
            <div className="about-org__image-placeholder">
              <div className="about-org__image-inner">
                <div className="about-org__image-icon">
                  <CompassIcon />
                </div>
                <p className="about-org__image-label">Philippine Association<br />for Graduate Education</p>
                <p className="about-org__image-sub">Est. 2010 · Under CHED</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Mission & Vision ──────────────────────────────────────────────────────
function MissionVision() {
  return (
    <section className="mv">
      <div className="mv__inner">
        <div className="mv__header">
          <span className="section-label-light">Our Direction</span>
          <h2 className="mv__title">Mission &amp; Vision Goals</h2>
        </div>

        <div className="mv__cards">
          {/* Vision */}
          <div className="mv-card">
            <div className="mv-card__icon-wrap">
              <EyeIcon />
            </div>
            <h3 className="mv-card__title">Our Vision</h3>
            <p className="mv-card__text">
              To be the leading organization in the Philippines that champions excellence,
              innovation, and global competitiveness in graduate education, producing
              world-class researchers and professionals who contribute significantly to
              national development and international scholarship.
            </p>
          </div>

          {/* Mission */}
          <div className="mv-card">
            <div className="mv-card__icon-wrap">
              <CompassIcon />
            </div>
            <h3 className="mv-card__title">Our Mission</h3>
            <p className="mv-card__text">
              To advance the quality and relevance of graduate education in the Philippines
              by fostering collaborative research, promoting professional development,
              facilitating knowledge exchange, and advocating for policies that strengthen
              graduate programs across all disciplines and institutions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Our History Timeline ──────────────────────────────────────────────────
function OurHistory() {
  return (
    <section className="history">
      <div className="history__inner">
        <div className="history__header">
          <span className="section-label-dark">Timeline</span>
          <h2 className="history__title">Our History</h2>
          <p className="history__subtitle">
            A journey of excellence and continuous growth in advancing graduate education
            across the Philippines.
          </p>
        </div>

        <div className="history__timeline">
          {/* Center line */}
          <div className="history__line" />

          {TIMELINE_EVENTS.map((event, i) => (
            <div
              key={event.year}
              className={`history__item${i % 2 === 0 ? " history__item--left" : " history__item--right"}`}
            >
              <div className="history__card">
                <span className="history__year">{event.year}</span>
                <h3 className="history__event-title">{event.title}</h3>
                <p className="history__event-desc">{event.desc}</p>
              </div>
              <div className="history__dot">
                <div className="history__dot-inner" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Officer Card ──────────────────────────────────────────────────────────
function OfficerCard({ officer }: { officer: OfficerType }) {
  return (
    <div className="officer-card">
      <div className="officer-card__image">
        <div className="officer-card__avatar">
          {officer.name.split(" ").slice(-1)[0][0]}
        </div>
      </div>
      <div className="officer-card__body">
        <h4 className="officer-card__name">{officer.name}</h4>
        <span className="officer-card__role">{officer.role}</span>
        <p className="officer-card__bio">{officer.bio}</p>
      </div>
    </div>
  );
}

// ── Our Officers ──────────────────────────────────────────────────────────
function OurOfficers() {
  return (
    <section className="officers">
      <div className="officers__inner">
        <div className="officers__header">
          <span className="section-label-light">Leadership</span>
          <h2 className="officers__title">Our Officers</h2>
          <p className="officers__subtitle">
            Meet the dedicated leaders guiding PAGE towards excellence in graduate education.
          </p>
        </div>

        <div className="officers__grid">
          {OFFICERS.map(officer => (
            <OfficerCard key={officer.name} officer={officer} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Core Values ───────────────────────────────────────────────────────────
function CoreValues() {
  return (
    <section className="values">
      <div className="values__inner">
        <div className="values__header">
          <span className="section-label-dark">What Drives Us</span>
          <h2 className="values__title">Our Core Values</h2>
          <p className="values__subtitle">
            The principles that guide our work and define our commitment to excellence.
          </p>
        </div>

        <div className="values__grid">
          {CORE_VALUES.map(v => (
            <div key={v.title} className="value-card">
              <div className="value-card__icon">{v.icon}</div>
              <h3 className="value-card__title">{v.title}</h3>
              <p className="value-card__desc">{v.desc}</p>
            </div>
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
              {([<FacebookIcon />, <InstagramIcon />, <MailIconSm />] as React.ReactNode[]).map((icon, i) => (
                <button key={i} className="footer__social-btn">{icon}</button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer__col-title">Quick Links</h4>
            <ul className="footer__links">
              {FOOTER_QUICK_LINKS.map(l => (
                <li key={l}><a href="#" className="footer__link">&rsaquo; {l}</a></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="footer__col-title">Resources</h4>
            <ul className="footer__links">
              {FOOTER_RESOURCES.map(l => (
                <li key={l}><a href="#" className="footer__link">&rsaquo; {l}</a></li>
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
export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="about-main">
        <AboutHero />
        <AboutOrganization />
        <MissionVision />
        <OurHistory />
        <OurOfficers />
        <CoreValues />
      </main>
      <Footer />
    </>
  );
}