"use client";
import Navbar from "../components/Navbar";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { api } from "../../lib/api-client";
import "./activities.css";
import type {
  Activity,
  ActivityType,
  PaginatedActivitiesResponse,
} from "./types";
import { ACTIVITY_TYPE_LABELS } from "./types";

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

const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8"  y1="2" x2="8"  y2="6" />
    <line x1="3"  y1="10" x2="21" y2="10" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarEmptyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8"  y1="2" x2="8"  y2="6" />
    <line x1="3"  y1="10" x2="21" y2="10" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
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

const MapPinIconSm = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIconSm = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
  </svg>
);

// ── Static Data ────────────────────────────────────────────────────────────
type NavLinkName = "Home" | "About" | "News" | "Contact";

const NAV_LINKS: NavLinkName[] = ["Home", "About", "News", "Contact"];

const ABOUT_DROPDOWN_ITEMS = [
  { label: "About PAGE",        href: "/about" },
  { label: "PAGE History",      href: "/about/history" },
  { label: "Set of Officers",   href: "/about/officers" },
  { label: "Logo Description",  href: "/about/logo" },
  { label: "CBL Information",   href: "/about/cbl" },
];
const getPath = (link: NavLinkName): string => ({
  Home: "/", About: "/about", News: "/news", Contact: "/contact",
}[link]);

const ACTIVITY_DROPDOWN_ITEMS: { label: string; type: ActivityType | "all" }[] = [
  { label: "All Activities",  type: "all" },
  { label: "Conferences",     type: "conference" },
  { label: "Seminars",        type: "seminar" },
  { label: "Workshops",       type: "workshop" },
  { label: "Other Events",    type: "other" },
];

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES    = ["Journals", "Articles", "National Activities", "Contact Us"];
const FOOTER_CONTACT = [
  { icon: <MapPinIconSm />,      text: "Manila, Philippines" },
  { icon: <MailIconContact />,   text: "page@gmail.edu.ph"   },
  { icon: <PhoneIconSm />,       text: "+63 908 XXX XXXX"    },
];

// ── Framer Motion Variants ─────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const dropdownVariants: Variants = {
  hidden:  { opacity: 0, y: -8, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.18, ease: "easeOut" } },
  exit:    { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.13 } },
};

// ── Navbar ─────────────────────────────────────────────────────────────────


// ── Activities Hero ────────────────────────────────────────────────────────
function ActivitiesHero() {
  return (
    <section className="acts-hero">
      <div className="container">
        <div className="acts-hero__breadcrumb">
          <Link href="/" className="acts-hero__breadcrumb-link">Home</Link>
          <span className="acts-hero__breadcrumb-sep">/</span>
          <span className="acts-hero__breadcrumb-current">National Activities</span>
        </div>
        <h1 className="acts-hero__title">
          National Activities
        </h1>
        <div className="acts-hero__divider" />
        <p className="acts-hero__subtitle">
          Explore conferences, seminars, workshops, and events organized by PAGE for
          graduate education professionals across the Philippines.
        </p>
      </div>
    </section>
  );
}

// ── Skeleton Cards ─────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="acts-skeleton-grid" aria-busy="true" aria-label="Loading activities">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="acts-skeleton-card">
          <div className="acts-skeleton-cover" />
          <div className="acts-skeleton-body">
            <div className="acts-skeleton-line acts-skeleton-line--short" style={{ marginBottom: 14 }} />
            <div className="acts-skeleton-line acts-skeleton-line--title" style={{ marginBottom: 10 }} />
            <div className="acts-skeleton-line acts-skeleton-line--long" />
            <div className="acts-skeleton-line acts-skeleton-line--mid" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Format date helper ─────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

// ── Activity Card ──────────────────────────────────────────────────────────
function ActivityCard({ activity }: { activity: Activity }) {
  const coverUrl = activity.gallery[0] ?? null;
  const excerpt  = activity.description.split("\n")[0].slice(0, 160) +
    (activity.description.length > 160 ? "…" : "");

  return (
    <motion.div className="act-card" variants={cardVariants}>
      {/* Cover */}
      <div className="act-card__cover">
        {coverUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={coverUrl} alt={activity.title} className="act-card__cover-img" />
        ) : (
          <div className="act-card__cover-fallback" />
        )}
        <span className={`act-card__type-badge act-card__type-badge--${activity.type}`}>
          {ACTIVITY_TYPE_LABELS[activity.type]}
        </span>
      </div>

      {/* Body */}
      <div className="act-card__body">
        <div className="act-card__meta">
          <span className="act-card__date">
            <CalendarIcon /> {formatDate(activity.date)}
          </span>
          <span className="act-card__dot" />
          <span className="act-card__venue" title={activity.venue}>
            <MapPinIcon /> {activity.venue}
          </span>
        </div>

        <h3 className="act-card__title">{activity.title}</h3>
        <p className="act-card__excerpt">{excerpt}</p>

        <div className="act-card__footer">
          <Link href={`/activities/${activity.slug}`} className="act-card__cta">
            View Details <ArrowIcon />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ── Activities Section ─────────────────────────────────────────────────────
function ActivitiesSection() {
  const [activities,  setActivities]  = useState<Activity[]>([]);
  const [years,       setYears]       = useState<number[]>([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [page,        setPage]        = useState(1);
  const [typeFilter,  setTypeFilter]  = useState<ActivityType | "all">("all");
  const [yearFilter,  setYearFilter]  = useState<number | null>(null);
  const [timeframeFilter, setTimeframeFilter] = useState<string | null>(null);
  const [status,      setStatus]      = useState<"loading" | "empty" | "error" | "ok">("loading");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sync state from URL query parameters when searchParams change
  useEffect(() => {
    const typeParam = searchParams.get("type") as ActivityType | "all" | null;
    if (typeParam && ["conference", "seminar", "workshop", "other"].includes(typeParam)) {
      setTypeFilter(typeParam);
    } else {
      setTypeFilter("all");
    }

    const yearParam = searchParams.get("year");
    if (yearParam) {
      const yr = parseInt(yearParam, 10);
      if (!isNaN(yr)) {
        setYearFilter(yr);
      } else {
        setYearFilter(null);
      }
    } else {
      setYearFilter(null);
    }

    const timeframeParam = searchParams.get("timeframe");
    if (timeframeParam && ["latest", "future"].includes(timeframeParam)) {
      setTimeframeFilter(timeframeParam);
    } else {
      setTimeframeFilter(null);
    }

    setPage(1);
  }, [searchParams]);

  const fetchActivities = useCallback(async () => {
    setStatus("loading");
    try {
      const qs = new URLSearchParams();
      if (typeFilter !== "all") qs.set("type", typeFilter);
      if (yearFilter !== null)  qs.set("year", String(yearFilter));
      if (timeframeFilter !== null) qs.set("timeframe", timeframeFilter);
      qs.set("page", String(page));

      const res = await api.get<PaginatedActivitiesResponse>(
        `/public/activities${qs.toString() ? `?${qs}` : ""}`
      );

      if (res.success) {
        setActivities(res.activities);
        setYears(res.years);
        setTotal(res.total);
        setTotalPages(res.total_pages);
        setStatus(res.activities.length === 0 ? "empty" : "ok");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [typeFilter, yearFilter, timeframeFilter, page]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const updateUrl = (type: ActivityType | "all", year: number | null) => {
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (year !== null) params.set("year", String(year));
    if (timeframeFilter !== null) params.set("timeframe", timeframeFilter);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleTypeChange = (val: ActivityType | "all") => {
    updateUrl(val, yearFilter);
  };

  const handleYearChange = (yr: number | null) => {
    const newVal = yearFilter === yr ? null : yr;
    updateUrl(typeFilter, newVal);
  };

  return (
    <section className="acts-section">
      <div className="container">
        {/* Section header */}
        <div className="section-header" style={{ textAlign: "left", marginBottom: "36px" }}>
          <span className="section-label">Events & Programs</span>
          <h2 className="section-title" style={{ textAlign: "left", margin: "0 0 8px" }}>
            {timeframeFilter === "latest" ? "Latest Activities" : timeframeFilter === "future" ? "Future Activities" : "National Activities"}
          </h2>
          <p className="section-subtitle" style={{ textAlign: "left", margin: 0, maxWidth: "600px" }}>
            {timeframeFilter === "latest" 
              ? "Browse recently completed conferences, seminars, and workshops organized by PAGE." 
              : timeframeFilter === "future"
              ? "Register for upcoming conferences, seminars, and workshops scheduled by PAGE."
              : "Browse PAGE-organized conferences, seminars, workshops, and events open to graduate education professionals nationwide."}
          </p>
        </div>

        {/* Filter toolbar */}
        <div className="acts-filters">
          {/* Type dropdown */}
          <select
            id="activities-type-filter"
            className="acts-type-select"
            value={typeFilter}
            onChange={e => handleTypeChange(e.target.value as ActivityType | "all")}
            aria-label="Filter by activity type"
          >
            {Object.entries(ACTIVITY_TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          {/* Separator */}
          {years.length > 0 && <div className="acts-filter-sep" />}

          {/* Year pills */}
          {years.length > 0 && (
            <div className="acts-year-pills" role="group" aria-label="Filter by year">
              {years.map(yr => (
                <button
                  key={yr}
                  className={`acts-year-pill${yearFilter === yr ? " acts-year-pill--active" : ""}`}
                  onClick={() => handleYearChange(yr)}
                  aria-pressed={yearFilter === yr}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}

          <span className="acts-filter-count">
            {status === "ok" ? `${total} ${total === 1 ? "result" : "results"}` : ""}
          </span>
        </div>

        {/* Loading */}
        {status === "loading" && <SkeletonGrid />}

        {/* Empty */}
        {status === "empty" && (
          <div className="acts-empty">
            <div className="acts-empty__icon"><CalendarEmptyIcon /></div>
            <p className="acts-empty__title">No activities found</p>
            <p className="acts-empty__desc">
              Try adjusting your filters or check back soon for upcoming events.
            </p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="acts-error">
            <div className="acts-error__icon"><AlertCircleIcon /></div>
            <p className="acts-error__title">Something went wrong</p>
            <p className="acts-error__desc">
              We could not load the activities. Please try again.
            </p>
            <button className="acts-error__retry" onClick={fetchActivities}>
              Retry
            </button>
          </div>
        )}

        {/* Activity cards grid */}
        {status === "ok" && (
          <motion.div
            className="acts-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {activities.map(act => (
              <ActivityCard key={act.id} activity={act} />
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {status === "ok" && totalPages > 1 && (
          <div className="acts-pagination">
            <button
              className="acts-pagination__btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`acts-pagination__btn${page === p ? " acts-pagination__btn--active" : ""}`}
                onClick={() => setPage(p)}
                aria-label={`Page ${p}`}
                aria-current={page === p ? "page" : undefined}
              >
                {p}
              </button>
            ))}

            <button
              className="acts-pagination__btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
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
                <img src="/PAGE.jpg" alt="PAGE Logo"
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement;
                    t.style.display = "none";
                    const fb = t.nextElementSibling as HTMLElement;
                    if (fb) fb.style.display = "flex";
                  }} />
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
              {[<FacebookIcon key="fb" />, <InstagramIcon key="ig" />, <MailIconSm key="mail" />].map((icon, i) => (
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
export default function ActivitiesPage() {
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
        <ActivitiesHero />
        <Suspense fallback={<div className="container"><SkeletonGrid /></div>}>
          <ActivitiesSection />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
