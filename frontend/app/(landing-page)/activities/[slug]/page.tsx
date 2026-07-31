"use client";
import Navbar from "../../components/Navbar";

import { useState, useEffect, useCallback, useRef, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { api } from "../../../lib/api-client";
import "../activities.css";
import type { Activity, ActivityDetailResponse } from "../types";
import { ACTIVITY_TYPE_LABELS } from "../types";

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

const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8"  y1="2" x2="8"  y2="6" />
    <line x1="3"  y1="10" x2="21" y2="10" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const ImagesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ZoomIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8"  y1="11" x2="14" y2="11" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
  <polyline points="9 18 15 12 9 6" />
</svg>
);

const AlertCircle = () => (
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

// ── Static data ────────────────────────────────────────────────────────────
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

const ACTIVITY_DROPDOWN_ITEMS = [
  { label: "All Activities",  type: "all"        as const },
  { label: "Conferences",     type: "conference" as const },
  { label: "Seminars",        type: "seminar"    as const },
  { label: "Workshops",       type: "workshop"   as const },
  { label: "Other Events",    type: "other"      as const },
];

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES   = ["Journals", "Articles", "National Activities", "Contact Us"];
const FOOTER_CONTACT = [
  { icon: <MapPinIconSm />,    text: "Manila, Philippines"  },
  { icon: <MailIconContact />, text: "page@gmail.edu.ph"   },
  { icon: <PhoneIconSm />,     text: "+63 908 XXX XXXX"    },
];

// ── Variants ───────────────────────────────────────────────────────────────
const dropdownVariants: Variants = {
  hidden:  { opacity: 0, y: -8, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.18, ease: "easeOut" } },
  exit:    { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.13 } },
};

const lightboxVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

const lightboxImgVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.93 },
  visible: { opacity: 1, scale: 1,    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toUpperCase() ?? "FILE";
}

// ── Navbar ─────────────────────────────────────────────────────────────────


// ── Lightbox ───────────────────────────────────────────────────────────────
function Lightbox({
  images, startIndex, onClose
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   prev();
      if (e.key === "ArrowRight")  next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return (
    <motion.div
      className="act-lightbox-backdrop"
      variants={lightboxVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="act-lightbox-content">
        {/* Close */}
        <button className="act-lightbox-close" onClick={onClose} aria-label="Close lightbox">
          <CloseIcon />
        </button>

        {/* Prev */}
        {images.length > 1 && (
          <button className="act-lightbox-nav act-lightbox-nav--prev" onClick={prev} aria-label="Previous image">
            <ChevronLeftIcon />
          </button>
        )}

        {/* Image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current]}
            alt={`Gallery image ${current + 1}`}
            className="act-lightbox-img"
            variants={lightboxImgVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
        </AnimatePresence>

        {/* Next */}
        {images.length > 1 && (
          <button className="act-lightbox-nav act-lightbox-nav--next" onClick={next} aria-label="Next image">
            <ChevronRightIcon />
          </button>
        )}

        <p className="act-lightbox-counter">{current + 1} / {images.length}</p>
      </div>
    </motion.div>
  );
}

// ── Gallery Grid ───────────────────────────────────────────────────────────
function GalleryGrid({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (i: number) => void;
}) {
  const count = images.length;
  const gridClass =
    count === 1 ? "act-gallery-grid act-gallery-grid--single" :
    count === 2 ? "act-gallery-grid act-gallery-grid--two"    :
                  "act-gallery-grid";

  return (
    <div className={gridClass}>
      {images.map((src, i) => (
        <motion.div
          key={i}
          className="act-gallery-thumb"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => onOpen(i)}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onOpen(i); }}
          aria-label={`Open gallery image ${i + 1}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`Gallery ${i + 1}`} />
          <div className="act-gallery-thumb__overlay">
            <ZoomIcon />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Detail skeleton ────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="act-detail-layout">
      <div>
        <div className="act-detail-skeleton__title" />
        <div className="act-detail-skeleton__meta">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="act-detail-skeleton__meta-item" style={{ width: `${80 + i * 20}px` }} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="acts-skeleton-line acts-skeleton-line--long" style={{ marginBottom: 10, height: 14 }} />
        ))}
      </div>
      <div className="act-detail-sidebar">
        <div className="act-sidebar-card">
          <div className="act-sidebar-card__header">
            <div className="acts-skeleton-line acts-skeleton-line--mid" style={{ height: 10 }} />
          </div>
          <div className="act-sidebar-card__body">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="act-sidebar-info-item">
                <div className="acts-skeleton-line acts-skeleton-line--short" style={{ height: 9 }} />
                <div className="acts-skeleton-line acts-skeleton-line--long" style={{ height: 13 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



// ── Main Page ──────────────────────────────────────────────────────────────
export default function ActivityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [scrolled,      setScrolled]      = useState(false);
  const [activity,      setActivity]      = useState<Activity | null>(null);
  const [status,        setStatus]        = useState<"loading" | "ok" | "error" | "notfound">("loading");
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<ActivityDetailResponse>(`/public/activities/${slug}`);
        if (!res.success || !res.activity) {
          setStatus("notfound");
        } else {
          setActivity(res.activity);
          setStatus("ok");
        }
      } catch {
        setStatus("error");
      }
    })();
  }, [slug]);

  const openLightbox = (i: number) => {
    setLightboxStart(i);
    setLightboxOpen(true);
  };

  const titleTruncated = activity
    ? activity.title.length > 40
      ? activity.title.slice(0, 40) + "…"
      : activity.title
    : "Loading…";

  return (
    <>
      <Navbar scrolled={scrolled} />

      {/* Hero nav bar */}
      <section className="act-detail-hero">
        <div className="container">
          <div className="act-detail-hero__bar">
            <div className="act-detail-hero__breadcrumb">
              <Link href="/" className="act-detail-hero__breadcrumb-link">Home</Link>
              <span className="act-detail-hero__breadcrumb-sep">/</span>
              <Link href="/activities" className="act-detail-hero__breadcrumb-link">National Activities</Link>
              <span className="act-detail-hero__breadcrumb-sep">/</span>
              <span className="act-detail-hero__breadcrumb-current">{titleTruncated}</span>
            </div>
            <Link href="/activities" className="act-detail-hero__back">
              <ArrowLeftIcon /> Back to Activities
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <main>
        <section className="act-detail-section">
          <div className="container">
            {/* Loading */}
            {status === "loading" && <DetailSkeleton />}

            {/* Not found / error */}
            {(status === "notfound" || status === "error") && (
              <div className="acts-error" style={{ padding: "80px 0" }}>
                <div className="acts-error__icon"><AlertCircle /></div>
                <p className="acts-error__title">
                  {status === "notfound" ? "Activity not found" : "Something went wrong"}
                </p>
                <p className="acts-error__desc">
                  {status === "notfound"
                    ? "This activity doesn't exist or has been removed."
                    : "We couldn't load this activity. Please try again."}
                </p>
                <Link href="/activities" className="acts-error__retry" style={{ display: "inline-block" }}>
                  View All Activities
                </Link>
              </div>
            )}

            {/* Activity detail */}
            {status === "ok" && activity && (
              <motion.div
                className="act-detail-layout"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* ── Main column ── */}
                <article className="act-detail-main">
                  {/* Type badge */}
                  <span className={`act-detail__type-badge act-detail__type-badge--${activity.type}`}>
                    {ACTIVITY_TYPE_LABELS[activity.type]}
                  </span>

                  {/* Title */}
                  <h1 className="act-detail__title">{activity.title}</h1>

                  {/* Meta */}
                  <div className="act-detail__meta">
                    <div className="act-detail__meta-item">
                      <span className="act-detail__meta-icon"><CalendarIcon /></span>
                      {formatDate(activity.date)}
                    </div>
                    <div className="act-detail__meta-item">
                      <span className="act-detail__meta-icon"><MapPinIcon /></span>
                      {activity.venue}
                    </div>
                    <div className="act-detail__meta-item">
                      <span className="act-detail__meta-icon"><TagIcon /></span>
                      {ACTIVITY_TYPE_LABELS[activity.type]}
                    </div>
                  </div>

                  <div className="act-detail__divider" />

                  {/* Description */}
                  <p className="act-detail__description">{activity.description}</p>

                  {/* Gallery */}
                  {activity.gallery.length > 0 && (
                    <div className="act-detail__gallery-section">
                      <h2 className="act-detail__section-title">
                        <ImagesIcon /> Photo Gallery
                      </h2>
                      <GalleryGrid images={activity.gallery} onOpen={openLightbox} />
                    </div>
                  )}

                  {/* Materials */}
                  {activity.materials.length > 0 && (
                    <div className="act-detail__materials-section">
                      <h2 className="act-detail__section-title">
                        <DownloadIcon /> Downloadable Materials
                      </h2>
                      <div className="act-materials-list">
                        {activity.materials.map((mat, i) => (
                          <motion.div
                            key={i}
                            className="act-material-item"
                            initial={{ opacity: 0, x: -12 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35, delay: i * 0.05 }}
                          >
                            <div className="act-material-icon"><FileTextIcon /></div>
                            <span className="act-material-name" title={mat.file_name}>
                              {mat.file_name}
                            </span>
                            <span style={{
                              fontSize: "9px", fontWeight: 700, color: "var(--ink-30)",
                              letterSpacing: "1px", textTransform: "uppercase"
                            }}>
                              {getFileExtension(mat.file_name)}
                            </span>
                            <a
                              href={mat.file_path}
                              download={mat.file_name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="act-material-download"
                            >
                              <DownloadIcon /> Download
                            </a>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>

                {/* ── Sidebar ── */}
                <aside className="act-detail-sidebar">
                  <div className="act-sidebar-card">
                    <div className="act-sidebar-card__header">
                      <p className="act-sidebar-card__title">Event Details</p>
                    </div>
                    <div className="act-sidebar-card__body">
                      <div className="act-sidebar-info-item">
                        <span className="act-sidebar-info-label">Date</span>
                        <span className="act-sidebar-info-value">{formatDate(activity.date)}</span>
                      </div>
                      <div className="act-sidebar-info-item">
                        <span className="act-sidebar-info-label">Venue</span>
                        <span className="act-sidebar-info-value">{activity.venue}</span>
                      </div>
                      <div className="act-sidebar-info-item">
                        <span className="act-sidebar-info-label">Type</span>
                        <span className="act-sidebar-info-value">{ACTIVITY_TYPE_LABELS[activity.type]}</span>
                      </div>
                      <div className="act-sidebar-info-item">
                        <span className="act-sidebar-info-label">Year</span>
                        <span className="act-sidebar-info-value">{new Date(activity.date).getFullYear()}</span>
                      </div>
                      {activity.materials.length > 0 && (
                        <div className="act-sidebar-info-item">
                          <span className="act-sidebar-info-label">Materials</span>
                          <span className="act-sidebar-info-value">{activity.materials.length} file{activity.materials.length > 1 ? "s" : ""} available</span>
                        </div>
                      )}
                      {activity.gallery.length > 0 && (
                        <div className="act-sidebar-info-item">
                          <span className="act-sidebar-info-label">Gallery</span>
                          <span className="act-sidebar-info-value">{activity.gallery.length} photo{activity.gallery.length > 1 ? "s" : ""}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back link card */}
                  <div className="act-sidebar-card" style={{ padding: "18px 20px" }}>
                    <Link href="/activities" style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      fontSize: "13px", fontWeight: 600, color: "var(--accent)",
                    }}>
                      <ArrowLeftIcon /> All National Activities
                    </Link>
                  </div>
                </aside>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && activity && (
          <Lightbox
            images={activity.gallery}
            startIndex={lightboxStart}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
