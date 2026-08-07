"use client";

import Link from "next/link";
import "./footer.css";

// ── Icons ─────────────────────────────────────────────────────────

const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4A2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const MailLargeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="page-footer">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand">
              <div className="footer-logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/PAGE-favicon.png" alt="PAGE Seal" className="footer-logo-img" />
                <div className="footer-logo-text">
                  <div className="footer-org-name">Philippine Association<br />for Graduate Education</div>
                  <div className="footer-badge">PAGE National</div>
                </div>
              </div>
              <p className="footer-tagline">
                Uniting graduate institutions. Advancing knowledge. Serving the nation since 1976.
              </p>
              <div className="footer-socials">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook"
                  className="footer-social-link"
                >
                  <FacebookIcon />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="LinkedIn"
                  className="footer-social-link"
                >
                  <LinkedinIcon />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Twitter"
                  className="footer-social-link"
                >
                  <TwitterIcon />
                </a>
                <a 
                  href="mailto:secretariat@pagenational.org.ph" 
                  aria-label="Email"
                  className="footer-social-link"
                >
                  <MailLargeIcon />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-column">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link href="/about">About PAGE</Link></li>
                <li><Link href="/about/officers">National Officers</Link></li>
                <li><Link href="/about/history">History</Link></li>
                <li><Link href="/membership">Membership</Link></li>
                <li><Link href="/chapters">Regional Chapters</Link></li>
                <li><Link href="/partners">Partners</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="footer-column">
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-links">
                <li><Link href="/library">Graduate Education Standards</Link></li>
                <li><Link href="/library?tab=cmo">Policies & CMOs</Link></li>
                <li><Link href="/journals">Research & Publications</Link></li>
                <li><Link href="/library?tab=other">Forms & Templates</Link></li>
                <li><Link href="/news">News & Updates</Link></li>
                <li><Link href="/activities">Events & Activities</Link></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="footer-column">
              <h4 className="footer-heading">Contact Us</h4>
              <ul className="footer-contact">
                <li>
                  <MapPinIcon />
                  <span>c/o College of Education<br />University of the Philippines Diliman<br />Quezon City 1101, Philippines</span>
                </li>
                <li>
                  <PhoneIcon />
                  <span>(02) 8928-4741</span>
                </li>
                <li>
                  <MailIcon />
                  <span>secretariat@pagenational.org.ph</span>
                </li>
                <li>
                  <GlobeIcon />
                  <span>www.pagenational.org.ph</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
