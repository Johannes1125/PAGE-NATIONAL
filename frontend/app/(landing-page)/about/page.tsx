"use client";
import Navbar from "../components/Navbar";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import "./about-page.css";

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

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const CompassIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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

const LightbulbIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18" />
    <line x1="10" y1="22" x2="14" y2="22" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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

// ── Data ───────────────────────────────────────────────────────────────────

type NavLink = "Home" | "About" | "News" | "Contact";

const getPath = (link: NavLink): string => {
  const map: Record<NavLink, string> = {
    Home: "/", About: "/about", News: "/news", Contact: "/contact",
  };
  return map[link];
};

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
  // National Officers
  { name: "Dr. Lino C. Reynoso", role: "President", category: "National Officers", bio: "Leading PAGE with a vision for excellence in graduate education and research administration." },
  { name: "Dr. Alper V. Pineda", role: "Vice President for Luzon", category: "National Officers", bio: "Championing graduate education initiatives and regional collaborations across Luzon." },
  { name: "Dr. Remedios C. Bacus", role: "Vice President for Visayas", category: "National Officers", bio: "Fostering research excellence and institutional partnerships throughout the Visayas region." },
  { name: "Dr. Judith C. Chavez", role: "Vice President for Mindanao", category: "National Officers", bio: "Advancing graduate programs and academic networking across universities in Mindanao." },
  { name: "Dr. Arnel D. Bravo", role: "Secretary", category: "National Officers", bio: "Overseeing organizational records, communications, and strategic administrative operations." },
  { name: "Dr. Ma. Kathleen C. Tiglao", role: "Treasurer", category: "National Officers", bio: "Managing financial resources to sustain and grow PAGE’s national education programs." },
  { name: "Dr. Rowena R. Abrea", role: "Auditor", category: "National Officers", bio: "Ensuring transparency, accountability, and integrity in all financial undertakings." },
  { name: "Dr. Dolores T. Quambo", role: "Press Relations Officer", category: "National Officers", bio: "Building strong bridges between PAGE and the public through effective communication." },

  // Board of Directors
  { name: "Dr. Caridad Q. Abian", role: "Board of Director", category: "Board of Directors", bio: "Contributing strategic insights to shape national graduate education policies." },
  { name: "Dr. Ramir Austria", role: "Board of Director", category: "Board of Directors", bio: "Guiding institutional collaborations and advanced research methodologies." },
  { name: "Dr. Sonia A. Pajaron", role: "Board of Director", category: "Board of Directors", bio: "Advocating for curriculum innovation and global competitiveness in graduate studies." },
  { name: "Dr. Joseph G. Recio", role: "Board of Director", category: "Board of Directors", bio: "Supporting the continuous professional development of graduate faculty." },
  { name: "Dr. Ruy Reyes", role: "Board of Director", category: "Board of Directors", bio: "Driving interdisciplinary research and academic excellence across member institutions." },
  { name: "Dr. Yolanda C. Sayson", role: "Board of Director", category: "Board of Directors", bio: "Ensuring graduate programs align with national development goals." },
  { name: "Dr. Imelda P. Soriano", role: "Board of Director", category: "Board of Directors", bio: "Fostering inclusive and sustainable growth in higher education frameworks." },
];

const CORE_VALUES = [
  { icon: <StarIcon />,      num: "01", title: "Excellence",     desc: "Committed to the highest standards in graduate education, research, and professional development." },
  { icon: <UsersIcon />,     num: "02", title: "Collaboration",  desc: "Fostering partnerships among institutions, researchers, and professionals to advance shared goals." },
  { icon: <LightbulbIcon />, num: "03", title: "Innovation",     desc: "Embracing new ideas, methodologies, and technologies to continuously improve graduate education." },
  { icon: <GlobeIcon />,     num: "04", title: "Global Outlook", desc: "Connecting Philippine graduate education to international standards and global academic communities." },
  { icon: <HeartIcon />,     num: "05", title: "Integrity",      desc: "Upholding ethical conduct, transparency, and accountability in all organizational activities." },
  { icon: <CompassIcon />,   num: "06", title: "Service",        desc: "Dedicating our efforts to the advancement of graduate education and national development." },
];

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES    = ["Journals", "Articles", "Upcoming Activities", "Contact Us"];
const FOOTER_CONTACT = [
  { icon: <MapPinIcon />,      text: "Manila, Philippines" },
  { icon: <MailIconContact />, text: "page@gmail.edu.ph"   },
  { icon: <PhoneIcon />,       text: "+63 908 XXX XXXX"    },
];

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

const dropdownVariants: Variants = {
  hidden:  { opacity: 0, y: -8, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.18, ease: "easeOut" } },
  exit:    { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.13 } },
};

// ── Navbar ─────────────────────────────────────────────────────────────────


// ── About Page Header ──────────────────────────────────────────────────────
function AboutHero() {
  return (
    <section className="about-hero">
      <div className="container">
        <div className="about-hero__breadcrumb">
          <Link href="/" className="about-hero__breadcrumb-link">Home</Link>
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

// ── About Organization ─────────────────────────────────────────────────────
function AboutOrganization() {
  return (
    <section className="about-org">
      <div className="container">
        <div className="about-org__inner">
          <div className="about-org__text">
            <span className="section-label">Who We Are</span>
            <h2 className="section-title" style={{ textAlign: "left", margin: "0 0 24px" }}>
              About the Organization
            </h2>
            <p className="about-org__body">
              The Philippine Association for Graduate Education (PAGE) anchors its organizational identity on driving academic excellence and research innovation across higher education institutions in the Philippines.
            </p>
            <p className="about-org__body">
              Our mission is to foster excellence in graduate education through collaborative
              research, professional development, and the dissemination of scholarly knowledge.
              We work closely with universities, research institutions, and government agencies
              to ensure that graduate programs meet international standards.
            </p>
            <p className="about-org__body">
              PAGE is committed to supporting graduate students, faculty members, and
              administrators through conferences, workshops, publications, and networking
              opportunities that drive meaningful change.
            </p>
          </div>

          <div className="about-org__visual">
            <div className="about-org__image-card">
              <div className="about-org__image-top">
                <div className="about-org__image-icon">
                  <CompassIcon />
                </div>
                <p className="about-org__image-label">Philippine Association<br />for Graduate Education</p>
                <p className="about-org__image-sub">Est. 2010 · Under CHED</p>
              </div>
              <div className="about-org__image-stats">
                <div className="about-org__image-stat">
                  <span className="about-org__image-stat-val">120+</span>
                  <span className="about-org__image-stat-lbl">Institutions</span>
                </div>
                <div className="about-org__image-stat">
                  <span className="about-org__image-stat-val">340+</span>
                  <span className="about-org__image-stat-lbl">Journals</span>
                </div>
                <div className="about-org__image-stat">
                  <span className="about-org__image-stat-val">28</span>
                  <span className="about-org__image-stat-lbl">Events/yr</span>
                </div>
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
      <div className="container">
        <div className="section-header">
          <span className="section-label">Our Direction</span>
          <h2 className="section-title">Mission &amp; Vision Goals</h2>
          <p className="section-subtitle">
            The guiding principles that shape our approach to advancing graduate education
            across the Philippines and beyond.
          </p>
        </div>

        <div className="mv__cards">
          <div className="mv-card">
            <div className="mv-card__num">01</div>
            <div className="mv-card__icon-wrap">
              <EyeIcon />
            </div>
            <h3 className="mv-card__title">Our Vision</h3>
            <p className="mv-card__text">
              To be a premier and globally recognized association of professionals and institutions dedicated to the continuous advancement, internationalization, and transformation of graduate education in the Philippines
            </p>
            <a href="#" className="mv-card__link">
              Learn more <ArrowIcon />
            </a>
          </div>

          <div className="mv-card">
            <div className="mv-card__num">02</div>
            <div className="mv-card__icon-wrap">
              <CompassIcon />
            </div>
            <h3 className="mv-card__title">Our Mission</h3>
            <p className="mv-card__text">
              To foster an empowering environment for academic leaders, faculty, and graduate students through impactful research, capacity building, and policy advocacy. PAGE is explicitly committed to partnering with regulatory bodies like the Commission on Higher Education (CHED) to elevate Philippine scholarly publications and educational standards to par with global trends
            </p>
            <a href="#" className="mv-card__link">
              Learn more <ArrowIcon />
            </a>
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
      <div className="container">
        <div className="section-header">
          <span className="section-label">Timeline</span>
          <h2 className="section-title">Our History</h2>
          <p className="section-subtitle">
            A journey of excellence and continuous growth in advancing graduate education
            across the Philippines.
          </p>
        </div>

        <div className="history__timeline">
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

// ── Our Officers ──────────────────────────────────────────────────────────
// ── Our Officers ──────────────────────────────────────────────────────────
function OurOfficers() {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "National Officers", "Board of Directors"];

  // Filter logic based on the selected category
  const filteredOfficers = OFFICERS.filter(officer =>
    activeFilter === "All" ? true : officer.category === activeFilter
  );

  return (
    <section className="officers">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Leadership</span>
          <h2 className="section-title">Our Officers</h2>
          <p className="section-subtitle">
            Meet the dedicated leaders guiding PAGE towards excellence in graduate education.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="officers__filters">
          {filters.map(filter => (
            <button
              key={filter}
              className={`officers__filter-btn ${activeFilter === filter ? "officers__filter-btn--active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="officers__grid">
          {filteredOfficers.map((officer, index) => (
            <div key={officer.name} className="officer-card">
              <div className="officer-card__image">
{/*                 <div className="officer-card__avatar">
                  {officer.name.split(" ").slice(-1)[0][0]}
                </div> */}
              </div>
              <div className="officer-card__body">
                <div className="officer-card__num">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h4 className="officer-card__name">{officer.name}</h4>
                <span className="officer-card__role">{officer.role}</span>
                <p className="officer-card__bio">{officer.bio}</p>
              </div>
            </div>
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
      <div className="container">
        <div className="section-header">
          <span className="section-label">What Drives Us</span>
          <h2 className="section-title">Our Core Values</h2>
          <p className="section-subtitle">
            The principles that guide our work and define our commitment to excellence
            in graduate education.
          </p>
        </div>

        <div className="values__grid">
          {CORE_VALUES.map(v => (
            <div key={v.title} className="value-card">
              <div className="value-card__num">{v.num}</div>
              <div className="value-card__icon">{v.icon}</div>
              <h3 className="value-card__title">{v.title}</h3>
              <p className="value-card__desc">{v.desc}</p>
              <a href="#" className="value-card__link">
                Explore <ArrowIcon />
              </a>
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
          <div>
            <div className="footer__brand-logo">
              <div className="footer__logo-mark">
                <img
                  src="/PAGE.jpg"
                  alt="PAGE Logo"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
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

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AboutPage() {
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