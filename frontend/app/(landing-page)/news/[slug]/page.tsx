// app/news/[slug]/page.tsx
// ── NEWS DETAIL PAGE ──────────────────────────────────────────────────────
// Matches Image 1 layout: large hero image, rich body, sidebar (related + share)

"use client";
import Navbar from "../../components/Navbar";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import "./news-slug.css";

// ── Icons ──────────────────────────────────────────────────────────────────
const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const UserIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const TwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>
);
const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

// Footer icons
const FacebookIconSm = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>);
const InstagramIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>);
const MailIconSm = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>);
const MapPinIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>);
const MailIconContact = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>);
const PhoneIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" /></svg>);

// ── Static data — swap for dynamic fetch in production ──────────────────────
const NEWS_ARTICLE = {
  slug: "page-annual-conference-2026",
  category: "Events",
  date: "March 12, 2026",
  author: "Dr. Maria Santos",
  organization: "University of the Philippines",
  title: "PAGE Annual Conference 2026: Innovation in Graduate Education",
  tags: ["Graduate Education", "Innovation", "CHED", "Research"],
  body: [
    {
      heading: "Opening the Door to Graduate Innovation",
      paragraphs: [
        "The Philippine Association for Graduate Education (PAGE) is proud to announce the much-anticipated 2026 Annual National Conference themed 'Innovation in Graduate Education.' Scheduled for April 14–16, 2026, at the SMX Convention Center in Pasay City, Metro Manila, this landmark event will bring together graduate school administrators, faculty, researchers, and students from over 120 member institutions across the Philippines.",
        "The conference serves as the premier gathering for the Philippine graduate education community, offering a dynamic platform for sharing groundbreaking research, best practices in curriculum design, and new approaches to mentoring and thesis advising. Attendees can expect an action-packed three days of plenary sessions, concurrent workshops, and special forums tailored to every stakeholder in graduate education.",
      ],
    },
    {
      heading: "Keynotes and Special Sessions",
      paragraphs: [
        "This year's lineup features distinguished keynote speakers from academia, government, and international organizations. Dr. Lino C. Reynoso, PAGE National President, will deliver the opening address, followed by a keynote on 'Reimagining Research Infrastructure in Philippine HEIs' by an invited CHED commissioner.",
        "Special breakout sessions will cover topics including artificial intelligence in graduate research, internationalization strategies for Philippine universities, and mental health and wellness support systems for doctoral students. A dedicated graduate student forum will provide an open space for emerging researchers to present their work and receive peer and expert feedback.",
      ],
    },
    {
      heading: "Registration and Logistics",
      paragraphs: [
        "Early registration is now open for individual delegates, institutional clusters, and graduate students. Participants from member institutions enjoy reduced registration fees and priority access to limited-capacity workshops. Online attendance will be available via the PAGE virtual hub for those who cannot travel to Manila.",
        "To register or learn more about the full program schedule, visit the PAGE official website or contact the national secretariat at page@gmail.edu.ph. Room blocks have been arranged at partner hotels near the venue for delegates requiring accommodation.",
      ],
    },
  ],
};

const RELATED_NEWS = [
  { id: 1, title: "PAGE Launches 2026 Graduate Research Grant Program", date: "Feb 28, 2026" },
  { id: 2, title: "New Guidelines for Thesis and Dissertation Defense Under CHED Memo", date: "Feb 15, 2026" },
  { id: 3, title: "PAGE Regional Clusters Hold Pre-Conference Workshops Nationwide", date: "Jan 30, 2026" },
];

const NAV_LINKS = ["Home", "About", "News", "Contact"];

const ABOUT_DROPDOWN_ITEMS = [
  { label: "About PAGE",        href: "/about" },
  { label: "PAGE History",      href: "/about/history" },
  { label: "Set of Officers",   href: "/about/officers" },
  { label: "Logo Description",  href: "/about/logo" },
  { label: "CBL Information",   href: "/about/cbl" },
];
type NavLink = "Home" | "About" | "News" | "Contact";
const getPath = (link: NavLink) => ({ Home: "/", About: "/about", News: "/news", Contact: "/contact" }[link]);

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES    = ["Journals", "Articles", "Upcoming Activities", "Contact Us"];
const FOOTER_CONTACT = [
  { icon: <MapPinIcon />, text: "Manila, Philippines" },
  { icon: <MailIconContact />, text: "page@gmail.edu.ph" },
  { icon: <PhoneIcon />, text: "+63 908 XXX XXXX" },
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




// ── Main Page ──────────────────────────────────────────────────────────────
export default function NewsDetailPage() {
  const [scrolled, setScrolled] = useState(false);
  const article = NEWS_ARTICLE;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Navbar scrolled={scrolled} />
      <main>
        {/* Hero / breadcrumb bar */}
        <div className="detail-hero">
          <div className="container">
            <div className="detail-hero__bar">
              <div className="detail-hero__breadcrumb">
                <Link href="/" className="detail-hero__breadcrumb-link">Home</Link>
                <span className="detail-hero__breadcrumb-sep">/</span>
                <Link href="/news" className="detail-hero__breadcrumb-link">News</Link>
                <span className="detail-hero__breadcrumb-sep">/</span>
                <span className="detail-hero__breadcrumb-current">{article.title}</span>
              </div>
              <Link href="/news" className="detail-hero__back-btn">
                <ArrowLeftIcon /> Back to News
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <section className="news-detail">
          <div className="container">
            <div className="news-detail__layout">
              {/* Main article */}
              <article className="news-detail__article">
                <div className="news-detail__image">
                  <span className="news-detail__badge">{article.category}</span>
                </div>
                <div className="news-detail__body">
                  <div className="news-detail__meta">
                    <span className="news-detail__date"><CalendarIcon />&nbsp;{article.date}</span>
                    <span className="news-detail__dot" />
                    <span className="news-detail__author-chip"><UserIcon />&nbsp;{article.author}</span>
                    <span className="news-detail__dot" />
                    <span className="news-detail__org">{article.organization}</span>
                  </div>
                  <h1 className="news-detail__title article-title">{article.title}</h1>
                  <div className="news-detail__divider" />

                  <div className="news-detail__content article-body">
                    {article.body.map((section) => (
                      <div key={section.heading}>
                        <h2>{section.heading}</h2>
                        {section.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                      </div>
                    ))}
                  </div>

                  <div className="news-detail__tags">
                    {article.tags.map(tag => <span key={tag} className="news-detail__tag">{tag}</span>)}
                  </div>
                </div>
              </article>

              {/* Sidebar */}
              <aside className="news-detail__sidebar">
                {/* Related articles */}
                <div className="news-sidebar-card">
                  <div className="news-sidebar-card__header">
                    <span className="news-sidebar-card__title">Related Articles</span>
                  </div>
                  {RELATED_NEWS.map(item => (
                    <Link key={item.id} href={`/news/${item.id}`} className="news-sidebar-related__item">
                      <div className="news-sidebar-related__thumb" />
                      <div>
                        <p className="news-sidebar-related__title">{item.title}</p>
                        <p className="news-sidebar-related__date">{item.date}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Share */}
                <div className="news-sidebar-card">
                  <div className="news-sidebar-card__header">
                    <span className="news-sidebar-card__title">Share This Article</span>
                  </div>
                  <div className="news-sidebar-share__list">
                    {[
                      { icon: <FacebookIcon />, label: "Share on Facebook" },
                      { icon: <TwitterIcon />, label: "Share on Twitter / X" },
                      { icon: <MailIcon />, label: "Send via Email" },
                      { icon: <LinkIcon />, label: "Copy Link" },
                    ].map(s => (
                      <button key={s.label} className="news-sidebar-share__btn">
                        <span className="news-sidebar-share__icon">{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}