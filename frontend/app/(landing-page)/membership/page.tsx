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
import { PageSeal } from "../components/PageSeal";
import { MembershipCategory } from "../../lib/membership-types";
import "./membership.css";

// ── Static Mock Data ────────────────────────────────────────────────────────

const MOCK_MEMBERSHIP_CATEGORIES: MembershipCategory[] = [
  {
    id: "life",
    name: "Life Member",
    description: "Active in PAGE activities for 1+ years and holds a doctoral degree.",
    annualFee: "₱5,000 (One-time)",
    requirements: [
      "Accomplished PAGE Membership Application Form",
      "Scanned 2x2 ID picture (jpg/png)",
      "Proof of highest educational attainment",
      "CV or BIO sketch (for individual members)",
      "One-time payment"
    ]
  },
  {
    id: "regular",
    name: "Regular Member",
    description: "Doctoral/Master's degree holder, active in PAGE nationally or at chapter level.",
    annualFee: "₱2,000.00/year",
    requirements: [
      "Accomplished PAGE Membership Application Form",
      "Scanned 2x2 ID picture (jpg/png)",
      "Proof of highest educational attainment",
      "CV or BIO sketch (for individual members)",
      "Annual membership"
    ]
  },
  {
    id: "associate",
    name: "Associate Member",
    description: "Currently enrolled graduate student (Master's or Doctoral).",
    annualFee: "₱500/year",
    requirements: [
      "Accomplished PAGE Membership Application Form",
      "Scanned 2x2 ID picture (jpg/png)",
      "Proof of highest educational attainment",
      "CV or BIO sketch (for individual members)",
      "Annual membership"
    ]
  },
  {
    id: "institutional",
    name: "Institutional Member",
    description: "Higher education institutions offering graduate course studies.",
    annualFee: "₱1,200 - ₱3,000/year",
    requirements: [
      "For Institutional Members: SEC Registration or Government Recognition Document",
      "Endorsement from the Head of Institution (for Institutional Members)",
      "Payment of membership fee",
      "Annual membership"
    ]
  }
];

const MOCK_BENEFITS = [
  {
    icon: GraduationCap,
    title: "Professional Development",
    description: "Access to webinars, conferences, and capacity building programs."
  },
  {
    icon: Users,
    title: "Networking Opportunities",
    description: "Connect with graduate education leaders, practitioners, and institutions."
  },
  {
    icon: BookOpen,
    title: "Publications & Resources",
    description: "Receive PAGE publications, research updates, and access to exclusive resources."
  },
  {
    icon: Globe,
    title: "Advocacy & Representation",
    description: "Be part of advocacy efforts that promote quality graduate education in the Philippines."
  },
  {
    icon: Award,
    title: "Recognition & Awards",
    description: "Opportunities for recognition of excellence in graduate education."
  },
  {
    icon: Handshake,
    title: "Discounts & Privileges",
    description: "Enjoy discounts on PAGE events, partner offerings, and other privileges."
  }
];

// ── Helpers ────────────────────────────────────────────────────────────────

function getPriceLabel(id: string): string {
  if (id === "life") return "Lifetime Investment";
  if (id === "institutional") return "Annual Institutional Fee";
  return "Annual Dues";
}

function getCardCTA(id: string): string {
  if (id === "institutional") return "Explore Institutional Track";
  if (id === "associate") return "See Eligibility";
  return "Review Credentials";
}

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
      {/* Hero Section */}
      <section className="membership-hero">
        <div className="membership-hero-bg-container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/membership-bg.jpg" alt="Membership Background" className="membership-hero-bg-img" />
          <div className="membership-hero-bg-overlay" />
        </div>

        <div className="membership-container">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Become a<br />PAGE Member
          </motion.h1>
          <div className="membership-hero__gold-line" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Join a distinguished community of educators, researchers,<br />
            and institutions committed to advancing graduate<br />
            education and nation-building in the Philippines.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/membership/apply" className="membership-hero__cta">
              <Users size={22} />
              Join PAGE Today
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="membership-section membership-container">
        <div className="membership-section-header">
          <h2 className="membership-section-title">Membership Categories</h2>
        </div>

        <div className="membership-categories-grid">
          {MOCK_MEMBERSHIP_CATEGORIES.map((cat, idx) => {
            let Icon = Users;
            if (cat.id === "regular") Icon = UserCheck;
            if (cat.id === "associate") Icon = UserPlus;
            if (cat.id === "institutional") Icon = Building2;

            return (
              <motion.div
                key={cat.id}
                className={`membership-category-card membership-category-card--${cat.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.09 }}
              >
                <div className="membership-category-header">
                  <div className="membership-category-icon">
                    <Icon size={24} />
                  </div>
                  <div className="membership-category-title-group">
                    <h3 className="membership-category-card__name">{cat.name}</h3>
                    <div className="membership-category-card__meta">
                      <CheckCircle2 size={13} />
                      <span>
                        {cat.id === "life" ? "One-time payment" : "Annual membership"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="membership-category-card__description">{cat.description}</p>

                <div className="membership-category-price">
                  <span className="membership-category-card__price-label">
                    {cat.id === "life" ? "Lifetime Investment" : cat.id === "institutional" ? "Annual Institutional Fee" : "Annual Dues"}
                  </span>
                  <span className="membership-category-card__price-value">{cat.annualFee}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="membership-note">
          All membership dues are non-refundable.
        </div>
      </section>

      {/* Benefits Section */}
      <section className="membership-section membership-section--alt">
        <div className="membership-container">
          <div className="membership-section-header">
            <h2 className="membership-section-title">Benefits &amp; Services</h2>
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
                    <Icon size={28} />
                  </div>
                  <h3 className="membership-benefit-item__title">{benefit.title}</h3>
                  <p className="membership-benefit-item__desc">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section id="requirements" className="membership-section membership-container">
        <div className="membership-section-header">
          <h2 className="membership-section-title">Requirements &amp; Credentials</h2>
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
          <div className="membership-requirements-wrapper">
            <div className="membership-requirements-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="membership-requirements-content">
              <div className="membership-requirements-columns">
                {activeCategoryData.requirements.map((req, index) => (
                  <div key={index} className="membership-requirement-item">
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
              <div className="membership-requirements-note">
                <span className="membership-requirements-note__icon">ℹ</span>
                <span>Requirements may vary depending on the membership category.</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

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
