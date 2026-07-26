"use client";
import Navbar from "../components/Navbar";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./contact.css";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// ── Icon Components ────────────────────────────────────────────────────────

const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
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

const MapPinIconSm = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const MailIconContact = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIconSm = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
  </svg>
);

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
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

// ── Types ──────────────────────────────────────────────────────────────────
type NavLink = "Home" | "About" | "News" | "Contact";

const getPath = (link: NavLink): string => {
  const map: Record<NavLink, string> = {
    Home: "/", About: "./about", News: "/news", Contact: "/contact",
  };
  return map[link];
};

const NAV_LINKS: NavLink[] = ["Home", "About", "News", "Contact"];

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

const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES    = ["Journals", "Articles", "Upcoming Activities", "Contact Us"];
const FOOTER_CONTACT_ITEMS = [
  { icon: <MapPinIconSm />,      text: "Manila, Philippines"  },
  { icon: <MailIconContact />,   text: "page@gmail.edu.ph"    },
  { icon: <PhoneIconSm />,       text: "+63 908 XXX XXXX"     },
];

const CONTACT_INFO = [
  {
    icon: <MapPinIcon />,
    label: "Office Address",
    primary: "CHED Central Office, C.P. Garcia Avenue",
    secondary: "Diliman, Quezon City, Metro Manila",
  },
  {
    icon: <MailIcon />,
    label: "Email Address",
    primary: "page@gmail.edu.ph",
    secondary: "For general inquiries & membership",
  },
  {
    icon: <PhoneIcon />,
    label: "Phone Number",
    primary: "+63 (02) 441-1234",
    secondary: "+63 908-XXX-XXXX (Mobile)",
  },
  {
    icon: <ClockIcon />,
    label: "Office Hours",
    primary: "Monday – Friday, 8:00 AM – 5:00 PM",
    secondary: "Saturday – Sunday: Closed",
  },
];

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Membership Application",
  "Journal Submission",
  "Conference & Events",
  "Research Collaboration",
  "Media & Press",
  "Technical Support",
  "Other",
];

// ── Navbar ─────────────────────────────────────────────────────────────────


// ── Contact Page Hero Banner (CBL Hero Header Design) ─────────────────────
function ContactHero() {
  return (
    <section className="cbl-hero">
      <div className="cbl-hero-container">
        <div className="cbl-breadcrumb">
          <Link href="/" className="cbl-breadcrumb-link">Home</Link>
          <span className="cbl-breadcrumb-sep">/</span>
          <span className="cbl-breadcrumb-current">Contact Us</span>
        </div>

        <div className="cbl-hero-left">
          <h1 className="cbl-hero-title">Contact Us</h1>
          <div className="cbl-gold-line" />
          <p className="cbl-hero-subtitle">
            Have questions about our programs, membership, or research initiatives?
            We'd love to hear from the graduate education community.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Contact Main Section ───────────────────────────────────────────────────
function ContactSection() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", institution: "",
    subject: "", message: "", consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim())  e.lastName  = "Last name is required.";
    if (!form.email.trim())     e.email     = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.subject)          e.subject   = "Please select a subject.";
    if (!form.message.trim())   e.message   = "Please enter your message.";
    else if (form.message.trim().length < 20) e.message = "Message must be at least 20 characters.";
    if (!form.consent)          e.consent   = "You must agree to proceed.";
    return e;
  };

  const handleChange = (field: string, value: string | boolean) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 1600));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <section className="contact-section">
      <div className="contact-section__inner">

        {/* ── Left: info panel ── */}
        <aside className="contact-info">
          <div className="contact-info__header">
            <span className="section-label">Contact Information</span>
            <h2 className="contact-info__title">Reach Us Directly</h2>
            <p className="contact-info__desc">
              Our team of graduate education professionals is available
              to answer your inquiries from Monday through Friday.
            </p>
          </div>

          <div className="contact-info__cards">
            {CONTACT_INFO.map(item => (
              <div key={item.label} className="contact-info-card">
                <div className="contact-info-card__icon">{item.icon}</div>
                <div className="contact-info-card__body">
                  <div className="contact-info-card__label">{item.label}</div>
                  <div className="contact-info-card__primary">{item.primary}</div>
                  <div className="contact-info-card__secondary">{item.secondary}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-info__divider" />

          <div className="contact-info__social-wrap">
            <p className="contact-info__social-label">Follow us on</p>
            <div className="contact-info__socials">
              <button className="footer__social-btn" aria-label="Facebook"><FacebookIcon /></button>
              <button className="footer__social-btn" aria-label="Instagram"><InstagramIcon /></button>
              <button className="footer__social-btn" aria-label="Email"><MailIconSm /></button>
            </div>
          </div>
        </aside>

        {/* ── Right: form panel ── */}
        <div className="contact-form-wrap">
          {submitted ? (
            <div className="contact-success">
              <div className="contact-success__icon"><CheckIcon /></div>
              <h3 className="contact-success__title">Message Sent</h3>
              <p className="contact-success__body">
                Thank you for reaching out. A PAGE representative will review
                your message and respond within 2–3 business days.
              </p>
              <button
                className="contact-success__reset"
                onClick={() => { setSubmitted(false); setForm({ firstName: "", lastName: "", email: "", institution: "", subject: "", message: "", consent: false }); }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="contact-form">
              <div className="contact-form__header">
                <span className="section-label">Send a Message</span>
                <h2 className="contact-form__title">How Can We Help?</h2>
                <p className="contact-form__subtitle">
                  Fill in the details below and our team will get back to you promptly.
                </p>
              </div>

              <div className="contact-form__body">
                {/* Name row */}
                <div className="cf-row cf-row--2">
                  <div className={`cf-field${errors.firstName ? " cf-field--error" : ""}`}>
                    <label className="cf-label">First Name <span className="cf-required">*</span></label>
                    <input
                      className="cf-input"
                      type="text"
                      placeholder="e.g. Maria"
                      value={form.firstName}
                      onChange={e => handleChange("firstName", e.target.value)}
                    />
                    {errors.firstName && <span className="cf-error">{errors.firstName}</span>}
                  </div>
                  <div className={`cf-field${errors.lastName ? " cf-field--error" : ""}`}>
                    <label className="cf-label">Last Name <span className="cf-required">*</span></label>
                    <input
                      className="cf-input"
                      type="text"
                      placeholder="e.g. Santos"
                      value={form.lastName}
                      onChange={e => handleChange("lastName", e.target.value)}
                    />
                    {errors.lastName && <span className="cf-error">{errors.lastName}</span>}
                  </div>
                </div>

                {/* Email + Institution */}
                <div className="cf-row cf-row--2">
                  <div className={`cf-field${errors.email ? " cf-field--error" : ""}`}>
                    <label className="cf-label">Email Address <span className="cf-required">*</span></label>
                    <input
                      className="cf-input"
                      type="email"
                      placeholder="yourname@university.edu.ph"
                      value={form.email}
                      onChange={e => handleChange("email", e.target.value)}
                    />
                    {errors.email && <span className="cf-error">{errors.email}</span>}
                  </div>
                  <div className="cf-field">
                    <label className="cf-label">Institution / Organization</label>
                    <input
                      className="cf-input"
                      type="text"
                      placeholder="e.g. University of the Philippines"
                      value={form.institution}
                      onChange={e => handleChange("institution", e.target.value)}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className={`cf-field${errors.subject ? " cf-field--error" : ""}`}>
                  <label className="cf-label">Subject <span className="cf-required">*</span></label>
                  <div className="cf-select-wrap">
                    <select
                      className="cf-select"
                      value={form.subject}
                      onChange={e => handleChange("subject", e.target.value)}
                    >
                      <option value="">Select a subject…</option>
                      {SUBJECT_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <span className="cf-select-arrow">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </span>
                  </div>
                  {errors.subject && <span className="cf-error">{errors.subject}</span>}
                </div>

                {/* Message */}
                <div className={`cf-field${errors.message ? " cf-field--error" : ""}`}>
                  <label className="cf-label">
                    Message <span className="cf-required">*</span>
                    <span className="cf-char-count">{form.message.length} / 1000</span>
                  </label>
                  <textarea
                    className="cf-textarea"
                    placeholder="Please describe your inquiry in detail. The more context you provide, the better we can assist you."
                    rows={6}
                    maxLength={1000}
                    value={form.message}
                    onChange={e => handleChange("message", e.target.value)}
                  />
                  {errors.message && <span className="cf-error">{errors.message}</span>}
                </div>

                {/* Consent */}
                <div className={`cf-field cf-field--checkbox${errors.consent ? " cf-field--error" : ""}`}>
                  <label className="cf-checkbox-label">
                    <input
                      type="checkbox"
                      className="cf-checkbox"
                      checked={form.consent}
                      onChange={e => handleChange("consent", e.target.checked)}
                    />
                    <span className="cf-checkbox-custom" />
                    <span className="cf-checkbox-text">
                      I agree to PAGE's <a href="#" className="cf-link">Privacy Policy</a> and
                      consent to being contacted regarding my inquiry.
                    </span>
                  </label>
                  {errors.consent && <span className="cf-error cf-error--checkbox">{errors.consent}</span>}
                </div>

                {/* Submit */}
                <button
                  className={`cf-submit${sending ? " cf-submit--sending" : ""}`}
                  onClick={handleSubmit}
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <span className="cf-spinner" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <span className="cf-SendIcon" />
                      <SendIcon />
                      Send Message
                    </>
                  )}
                </button>

                <p className="cf-note">
                  Fields marked with <span className="cf-required">*</span> are required.
                  We typically respond within 2–3 business days.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}



// ── Main Page ──────────────────────────────────────────────────────────────
export default function ContactPage() {
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
        <ContactHero />
        <ContactSection />
      </main>
    </>
  );
}