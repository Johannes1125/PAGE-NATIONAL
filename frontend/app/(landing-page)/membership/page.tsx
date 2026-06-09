"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  UserCheck,
  UserPlus,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Award,
  BookOpen,
  GraduationCap,
  Globe,
  Handshake,
  MapPin,
  Mail,
  Phone
} from "lucide-react";
import Navbar from "../components/Navbar";
import { MembershipCategory } from "../../lib/membership-types";
import "./membership.css";

// ── Static Mock Data ────────────────────────────────────────────────────────

const MOCK_MEMBERSHIP_CATEGORIES: MembershipCategory[] = [
  {
    id: "life",
    name: "Life Member",
    description: "A lifetime commitment to the development and advancement of graduate education in the Philippines. Tailored for senior educators and academic administrators.",
    annualFee: "₱10,000 (One-time)",
    requirements: [
      "Must have been an active individual member in good standing for at least 3 consecutive years.",
      "Submit a photocopy of a valid professional ID (PRC card) or passport.",
      "Proof of active participation in at least 3 past PAGE national conventions or regional activities.",
      "Endorsement/Nomination form signed by two active Life Members in good standing."
    ]
  },
  {
    id: "institutional",
    name: "Institutional Member",
    description: "For universities, colleges, and higher education institutions offering graduate programs that seek national collaboration, alignment, and prestige.",
    annualFee: "₱5,000 / year",
    requirements: [
      "Certified true copy of SEC Registration Certificate or DTI Certificate.",
      "Copy of CHED Government Recognition / Permit for graduate programs offered.",
      "Official Letter of Intent signed by the University President or Graduate School Dean.",
      "Institution Profile, including a list of active graduate school faculty and active courses."
    ]
  },
  {
    id: "associate",
    name: "Associate Member",
    description: "For graduate researchers, lecturers, and industry professionals who are actively contributing to graduate studies and academic development.",
    annualFee: "₱2,000 / year",
    requirements: [
      "Copy of valid government or institutional ID.",
      "Recommendation/Endorsement letter from a PAGE national officer or institutional member dean.",
      "Updated Curriculum Vitae highlighting graduate teaching history or research publications.",
      "Copy of highest graduate degree diploma or transcript of records (Master's or Doctorate)."
    ]
  },
  {
    id: "regular",
    name: "Regular Member",
    description: "For active deans, administrators, program coordinators, and full-time faculty teaching graduate level courses in PAGE-member institutions.",
    annualFee: "₱1,500 / year",
    requirements: [
      "Copy of valid institutional ID from a PAGE-member graduate school.",
      "Completed individual member profile form.",
      "Endorsement letter from the Graduate School Dean of the employing institution.",
      "Proof of academic load/affiliation (e.g. certificate of employment or teaching load contract)."
    ]
  }
];

const MOCK_BENEFITS = [
  {
    icon: Globe,
    title: "National & Global Networking",
    description: "Connect with deans, administrators, and researchers across the country and access international academic exchange pathways."
  },
  {
    icon: BookOpen,
    title: "Research & Publication Support",
    description: "Enjoy priority double-blind peer reviews and publishing discounts inside the academic PAGE National Research Journals."
  },
  {
    icon: GraduationCap,
    title: "Professional Development",
    description: "Free or subsidized access to training seminars, academic leadership roundtables, and graduate curriculum design workshops."
  },
  {
    icon: Award,
    title: "Annual Convention Delegations",
    description: "Register with exclusive member rates for the prestigious PAGE National Annual Convention and cluster level summits."
  },
  {
    icon: ShieldAlert,
    title: "CHED & Regulatory Alignment",
    description: "Receive updates, briefs, and guidance regarding new policies, accreditation parameters, and CHED guidelines."
  },
  {
    icon: Handshake,
    title: "Collaborative Research Grants",
    description: "Qualify to participate in and apply for PAGE-sponsored interdisciplinary research funding and national projects."
  }
];

// ── Icons Mapper ───────────────────────────────────────────────────────────

const categoryIcons = {
  life: Users,
  institutional: Building2,
  associate: UserCheck,
  regular: UserPlus
};

// ── Shared Page Components ──────────────────────────────────────────────────

function MembershipContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"life" | "institutional" | "associate" | "regular">("life");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Listen to query parameters for category deep linking (e.g., ?cat=life#requirements)
  useEffect(() => {
    const categoryParam = searchParams.get("cat");
    if (categoryParam && ["life", "institutional", "associate", "regular"].includes(categoryParam)) {
      setActiveTab(categoryParam as any);
    }
  }, [searchParams]);

  const scrollToRequirements = (catId: "life" | "institutional" | "associate" | "regular") => {
    setActiveTab(catId);
    const element = document.getElementById("requirements");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const activeCategoryData = MOCK_MEMBERSHIP_CATEGORIES.find(cat => cat.id === activeTab) || MOCK_MEMBERSHIP_CATEGORIES[0];

  return (
    <div className="membership-page">
      <Navbar scrolled={scrolled} />

      {/* Hero Section */}
      <section className="membership-hero">
        <div className="membership-hero__pattern" />
        <div className="membership-container">
          <div className="membership-hero__breadcrumbs">
            <Link href="/" className="membership-hero__breadcrumb-link">Home</Link>
            <span className="membership-hero__breadcrumb-sep">/</span>
            <span className="membership-hero__breadcrumb-current">Membership</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Become a PAGE Member
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Join a prestigious network of graduate school administrators, faculty, and researchers shaping the future of advanced higher education in the Philippines.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/membership/apply" className="membership-hero__cta">
              Apply Now <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="membership-section membership-container">
        <div className="membership-section-header">
          <span className="membership-section-eyebrow">Classifications</span>
          <h2 className="membership-section-title">Membership Categories</h2>
          <p className="membership-section-desc">
            We offer institutional and individual membership options suited to your academic profile and administrative role.
          </p>
        </div>

        <div className="membership-categories-grid">
          {MOCK_MEMBERSHIP_CATEGORIES.map((cat, idx) => {
            const Icon = categoryIcons[cat.id];
            return (
              <motion.div
                key={cat.id}
                className={`membership-category-card membership-category-card--${cat.id}`}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 className="membership-category-card__name">{cat.name}</h3>
                  <Icon size={24} style={{ opacity: 0.8 }} />
                </div>
                <p className="membership-category-card__description">{cat.description}</p>
                <div className="membership-category-card__price-box">
                  <span className="membership-category-card__price-label">Annual Fee</span>
                  <span className="membership-category-card__price-value">{cat.annualFee}</span>
                </div>
                <button
                  onClick={() => scrollToRequirements(cat.id)}
                  className="membership-category-card__link"
                >
                  View Requirements <ArrowRight size={14} />
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="membership-section membership-section--alt">
        <div className="membership-container">
          <div className="membership-section-header">
            <span className="membership-section-eyebrow">Advantages</span>
            <h2 className="membership-section-title">Benefits &amp; Services</h2>
            <p className="membership-section-desc">
              Discover the benefits of joining PAGE, designed to support your institution's growth and accelerate your research career.
            </p>
          </div>

          <div className="membership-benefits-grid">
            {MOCK_BENEFITS.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  className="membership-benefit-item"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                >
                  <div className="membership-benefit-item__icon-wrap">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="membership-benefit-item__title">{benefit.title}</h3>
                    <p className="membership-benefit-item__desc">{benefit.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section id="requirements" className="membership-section membership-container">
        <div className="membership-section-header">
          <span className="membership-section-eyebrow">Checklists</span>
          <h2 className="membership-section-title">Requirements &amp; Credentials</h2>
          <p className="membership-section-desc">
            Ensure you prepare all relevant documents and certifications before beginning the online registration form.
          </p>
        </div>

        <div className="membership-tabs" role="tablist" aria-label="Requirements categories">
          {MOCK_MEMBERSHIP_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeTab === cat.id}
              aria-controls={`panel-${cat.id}`}
              id={`tab-${cat.id}`}
              className={`membership-tab-btn ${activeTab === cat.id ? "membership-tab-btn--active" : ""}`}
              onClick={() => setActiveTab(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="membership-requirements-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="membership-requirements-card__header">
            <h3 className="membership-requirements-card__title">{activeCategoryData.name} Requirements</h3>
            <p className="membership-requirements-card__subtitle">
              All documents listed below must be uploaded in PDF or high-resolution image formats (under 5MB).
            </p>
          </div>

          <div className="membership-requirements-list">
            {activeCategoryData.requirements.map((req, index) => (
              <div key={index} className="membership-requirement-item">
                <CheckCircle2 size={18} strokeWidth={2.5} />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__columns">
            <div>
              <div className="footer__brand-logo">
                <div className="footer__logo-mark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/PAGE.jpg" alt="PAGE Logo" />
                </div>
                <div>
                  <div className="footer__logo-name">PAGE</div>
                  <div className="footer__logo-sub">An academic towards to excellence</div>
                </div>
              </div>
              <p className="footer__brand-desc">
                Philippine Association for Graduate Education — advancing excellence through collaboration, research, and innovation under the CHED Program.
              </p>
            </div>

            <div>
              <h4 className="footer__col-title">Quick Links</h4>
              <ul className="footer__links">
                <li><Link href="/about" className="footer__link">About PAGE</Link></li>
                <li><Link href="/about/history" className="footer__link">History</Link></li>
                <li><Link href="/about/officers" className="footer__link">Officers</Link></li>
                <li><Link href="/news" className="footer__link">News &amp; Announcements</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="footer__col-title">Resources</h4>
              <ul className="footer__links">
                <li><Link href="/journals" className="footer__link">Journals</Link></li>
                <li><Link href="/convention" className="footer__link">Conventions</Link></li>
                <li><Link href="/activities" className="footer__link">Activities</Link></li>
                <li><Link href="/contact" className="footer__link">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="footer__col-title">Contact</h4>
              <div className="footer__contact-list">
                <div className="footer__contact-item">
                  <span className="footer__contact-icon"><MapPin size={15} /></span>
                  <span className="footer__contact-text">Manila, Philippines</span>
                </div>
                <div className="footer__contact-item">
                  <span className="footer__contact-icon"><Mail size={15} /></span>
                  <span className="footer__contact-text">page@gmail.edu.ph</span>
                </div>
                <div className="footer__contact-item">
                  <span className="footer__contact-icon"><Phone size={15} /></span>
                  <span className="footer__contact-text">+63 908 XXX XXXX</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer__bottom">
            <p className="footer__copyright">
              © 2026 Philippine Association for Graduate Education. All rights reserved.
            </p>
            <div className="footer__legal">
              <a href="#" className="footer__legal-link">Privacy Policy</a>
              <a href="#" className="footer__legal-link">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function MembershipPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--font-sans)', color: '#143152' }}>
        <h3>Loading Membership Information...</h3>
      </div>
    }>
      <MembershipContent />
    </Suspense>
  );
}
