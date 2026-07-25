"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "./home-page.css";

// ── Icons ─────────────────────────────────────────────────────────

const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const BookIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const GradCapIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const UsersIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MonitorIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ShieldGradIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#081734" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M6 11l6-3 6 3-6 3z" />
    <path d="M9 12.5v2.5c1.5 1.5 4.5 1.5 6 0v-2.5" />
  </svg>
);

const EyeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ScalesIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18M3 7h18" />
  </svg>
);

const NetworkingIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const PresentationIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="20" height="12" rx="1" />
    <line x1="12" y1="15" x2="12" y2="21" />
    <line x1="7" y1="21" x2="17" y2="21" />
  </svg>
);

const ResourceIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15l2 2 4-4" />
  </svg>
);

const MegaphoneIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 11l18-5v12L3 13v-2z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);

const AwardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4A2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const MailLargeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

// ── Components ────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-bg-container">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-bg.jpg" alt="Neoclassical Building Facade" className="hero-bg-img" />
        <div className="hero-bg-overlay" />
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            United in Purpose.<br />
            Elevating Graduate<br />
            Education in the Philippines.
          </h1>
          <div className="hero-gold-line" />
          <p className="hero-description">
            PAGE National is the collective voice of Philippine graduate schools, committed to advancing quality, ethics, and innovation in graduate education for national development.
          </p>
          <div className="hero-buttons">
            <Link href="/about" className="btn-primary">
              About PAGE <ArrowRightIcon />
            </Link>
            <Link href="/membership" className="btn-secondary">
              Join Our Community <ArrowRightIcon />
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-seal-card">
            <div className="hero-seal-outer-ring">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/PAGE-favicon.png" alt="PAGE National Seal" className="hero-seal-img" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-content">
          <div className="section-label">ABOUT PAGE</div>
          <h2 className="section-title">Who We Are</h2>

          <div className="about-card">
            <div className="about-icon">
              <ShieldGradIcon />
            </div>
            <p className="about-text">
              The Philippine Association for Graduate Education (PAGE) is a non-stock, non-profit organization of schools, colleges, and universities in the Philippines offering graduate programs. Founded in 1976, PAGE commits to promote excellence in graduate education, research, and public service.
            </p>
            <Link href="/about" className="about-link">
              Learn more about PAGE <ArrowRightIcon />
            </Link>
          </div>
        </div>

        <div className="about-features">
          <div className="feature-item">
            <div className="feature-icon">
              <UsersIcon />
            </div>
            <div>
              <h3 className="feature-title">Our Mission</h3>
              <p className="feature-description">
                To advance quality graduate education and research in support of national development.
              </p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <EyeIcon />
            </div>
            <div>
              <h3 className="feature-title">Our Vision</h3>
              <p className="feature-description">
                A leading community of graduate institutions shaping a better future for the Philippines.
              </p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <ScalesIcon />
            </div>
            <div>
              <h3 className="feature-title">Our Values</h3>
              <p className="feature-description">
                Excellence, Collaboration, Integrity, Inclusivity, and Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResourcesSection() {
  return (
    <section className="resources-section">
      <div className="resources-container">
        <div className="section-label">ACADEMIC RESOURCES</div>
        <h2 className="section-title">Tools and References for Graduate Excellence</h2>

        <div className="resources-grid">
          <Link href="/library" className="resource-card">
            <div className="resource-icon">
              <BookIcon />
            </div>
            <h3 className="resource-title">Graduate Education Standards</h3>
            <p className="resource-description">
              Access CHED-recognized standards and best practices for graduate programs.
            </p>
            <span className="resource-link">Explore <ArrowRightIcon /></span>
          </Link>

          <Link href="/library" className="resource-card">
            <div className="resource-icon">
              <DocumentIcon />
            </div>
            <h3 className="resource-title">Policy and Advocacy</h3>
            <p className="resource-description">
              Read PAGE position papers and policy briefs on key issues in higher education.
            </p>
            <span className="resource-link">Explore <ArrowRightIcon /></span>
          </Link>

          <Link href="/journals" className="resource-card">
            <div className="resource-icon">
              <GradCapIcon />
            </div>
            <h3 className="resource-title">Research and Publications</h3>
            <p className="resource-description">
              Browse research outputs, publications, and resource materials.
            </p>
            <span className="resource-link">Explore <ArrowRightIcon /></span>
          </Link>

          <Link href="/membership" className="resource-card">
            <div className="resource-icon">
              <UsersIcon />
            </div>
            <h3 className="resource-title">Member Directory</h3>
            <p className="resource-description">
              Connect with graduate institutions and programs across the country.
            </p>
            <span className="resource-link">Explore <ArrowRightIcon /></span>
          </Link>

          <Link href="/library" className="resource-card">
            <div className="resource-icon">
              <MonitorIcon />
            </div>
            <h3 className="resource-title">Forms and Templates</h3>
            <p className="resource-description">
              Download templates and guides for academic and administrative use.
            </p>
            <span className="resource-link">Explore <ArrowRightIcon /></span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function MembershipSection() {
  return (
    <section className="home-membership-section">
      <div className="home-membership-container">
        <div className="home-membership-content">
          <div className="section-label-light">MEMBERSHIP BENEFITS</div>
          <h2 className="home-membership-title">Stronger Together</h2>
          <p className="home-membership-description">
            PAGE brings together graduate institutions to collaborate, share knowledge, and create impact.
          </p>
          <Link href="/membership" className="home-membership-link">
            Become a Member <ArrowRightIcon />
          </Link>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon-wrapper">
              <NetworkingIcon />
            </div>
            <h3 className="benefit-title">Networking Opportunities</h3>
            <p className="benefit-description">Connect with graduate education leaders across the Philippines</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrapper">
              <PresentationIcon />
            </div>
            <h3 className="benefit-title">Professional Development</h3>
            <p className="benefit-description">Access exclusive workshops, seminars, and training programs</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrapper">
              <ResourceIcon />
            </div>
            <h3 className="benefit-title">Resource Access</h3>
            <p className="benefit-description">Utilize research materials, templates, and best practices</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrapper">
              <MegaphoneIcon />
            </div>
            <h3 className="benefit-title">Advocacy and Representation</h3>
            <p className="benefit-description">Amplify your voice in national education policy discussions</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon-wrapper">
              <AwardIcon />
            </div>
            <h3 className="benefit-title">Recognition and Visibility</h3>
            <p className="benefit-description">Gain recognition and showcase your institution's excellence</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsEventsSection() {
  return (
    <section className="news-events-section">
      <div className="news-events-container">
        {/* News Column */}
        <div className="news-column">
          <div className="column-header">
            <h3 className="column-title">NEWS & ANNOUNCEMENTS</h3>
            <Link href="/news" className="view-all-link">
              View all news <ArrowRightIcon />
            </Link>
          </div>

          <div className="news-list">
            <article className="news-item">
              <div className="news-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/PAGE-favicon.png" alt="PAGE Conference" />
              </div>
              <div className="news-content">
                <h4 className="news-title">PAGE National Annual Conference 2025</h4>
                <p className="news-excerpt">
                  Call for papers is now open! Join us this November 6–7, 2025 at De La Salle University, Manila.
                </p>
                <time className="news-date">May 20, 2025</time>
              </div>
            </article>

            <article className="news-item">
              <div className="news-image news-image-placeholder">
                <svg viewBox="0 0 100 80">
                  <rect width="100" height="80" fill="#1b2a4a" />
                  <rect x="20" y="45" width="60" height="15" fill="#3a4f7c" rx="3" />
                  <circle cx="35" cy="35" r="8" fill="#627da9" />
                  <circle cx="50" cy="30" r="8" fill="#627da9" />
                  <circle cx="65" cy="35" r="8" fill="#627da9" />
                </svg>
              </div>
              <div className="news-content">
                <h4 className="news-title">CHED, PAGE Push for Stronger Graduate Education</h4>
                <p className="news-excerpt">
                  Highlights from the recent CHED-PAGE dialogue on policy reforms and graduate education.
                </p>
                <time className="news-date">April 30, 2025</time>
              </div>
            </article>

            <article className="news-item">
              <div className="news-image news-image-shield">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div className="news-content">
                <h4 className="news-title">PAGE Statement on Academic Integrity</h4>
                <p className="news-excerpt">
                  Upholding integrity and ethics in graduate education and research.
                </p>
                <time className="news-date">April 15, 2025</time>
              </div>
            </article>
          </div>
        </div>

        {/* Events Column */}
        <div className="events-column">
          <div className="column-header">
            <h3 className="column-title">UPCOMING EVENTS</h3>
            <Link href="/activities" className="view-all-link">
              View all events <ArrowRightIcon />
            </Link>
          </div>

          <div className="events-list">
            <article className="event-item">
              <div className="event-date">
                <span className="event-month">JUN</span>
                <span className="event-day">20</span>
                <span className="event-year">2025</span>
              </div>
              <div className="event-content">
                <h4 className="event-title">Webinar: Outcome-Based Education in Graduate Programs</h4>
                <p className="event-meta">1:00 PM – 4:00 PM • Online</p>
              </div>
              <CalendarIcon />
            </article>

            <article className="event-item">
              <div className="event-date">
                <span className="event-month">AUG</span>
                <span className="event-day">15</span>
                <span className="event-year">2025</span>
              </div>
              <div className="event-content">
                <h4 className="event-title">PAGE Midyear General Assembly</h4>
                <p className="event-meta">9:00 AM – 1:00 PM • Online</p>
              </div>
              <CalendarIcon />
            </article>

            <article className="event-item">
              <div className="event-date">
                <span className="event-month">NOV</span>
                <span className="event-day">06</span>
                <span className="event-year">2025</span>
              </div>
              <div className="event-content">
                <h4 className="event-title">PAGE National Annual Conference 2025</h4>
                <p className="event-meta">Nov 6 – 7, 2025 • De La Salle University, Manila</p>
              </div>
              <CalendarIcon />
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main Page Component ───────────────────────────────────────────

export default function PAGELandingPage() {
  return (
    <main className="landing-main">
      <HeroSection />
      <AboutSection />
      <ResourcesSection />
      <MembershipSection />
      <NewsEventsSection />
    </main>
  );
}
