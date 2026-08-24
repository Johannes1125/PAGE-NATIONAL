// The convention detail page slug template matching pattern:
// This page dynamically extracts the route parameter `slug` and looks up the
// corresponding convention object in CONVENTIONS_DATA from `../mock-data.ts`.
// If the convention exists, it is rendered via the detail template.
// If not found, a styled "Convention Not Found" error state is displayed.
// This allows a single reusable slug page structure to handle all conventions.

"use client";
import Navbar from "../../components/Navbar";
import { useState, useEffect, useMemo, useRef, useCallback, use, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import Image from "next/image";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { api } from "../../../lib/api-client";
import { Convention } from "../types";
import { Calendar, MapPin, ChevronDown, Download, AlertCircle, ArrowLeft, BookOpen, Mic, Activity, Layers, Image as ImageIcon, Search, SlidersHorizontal, ChevronLeft, ChevronRight, X, Maximize2, Minimize2 } from "lucide-react";
import "./convention-detail.css";

// ── Icon Components ────────────────────────────────────────────────────────

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

const MapPinIcon = () => (
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

// ── Shared Data ────────────────────────────────────────────────────────────

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES    = ["Journals", "Articles", "National Activities", "Contact Us"];
const FOOTER_CONTACT = [
  { icon: <MapPinIcon />,      text: "Manila, Philippines" },
  { icon: <MailIconContact />, text: "page@gmail.edu.ph"   },
  { icon: <PhoneIconSm />,     text: "+63 908 XXX XXXX"    },
];

// ── Shared Navbar Component ─────────────────────────────────────────────────


// ── Detail page entrance animations ─────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const galleryContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.03,
    },
  },
};

const galleryCardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
  },
};

type GallerySort = "newest" | "oldest";

type GalleryItem = {
  image_url: string;
  caption: string;
  sourceIndex: number;
};

function GalleryPhotoCard({
  item,
  index,
  onOpen,
}: {
  item: GalleryItem;
  index: number;
  onOpen: (index: number) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  return (
    <motion.button
      type="button"
      className="gallery-card"
      variants={galleryCardVariants}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen(index)}
      aria-label={`Open gallery photo ${index + 1}: ${item.caption}`}
    >
      <div className="gallery-card__media">
        {!loaded && !broken && <span className="gallery-card__skeleton animate-pulse" aria-hidden="true" />}

        {broken ? (
          <div className="gallery-card__broken" role="img" aria-label="Image unavailable">
            <ImageIcon className="gallery-card__broken-icon" />
            <span>Image unavailable</span>
          </div>
        ) : (
          <Image
            src={item.image_url}
            alt={item.caption}
            fill
            sizes="(max-width: 540px) 50vw, (max-width: 1024px) 33vw, (max-width: 1440px) 20vw, 16vw"
            className={`gallery-card__img${loaded ? " gallery-card__img--loaded" : ""}`}
            onLoad={() => setLoaded(true)}
            onError={() => setBroken(true)}
          />
        )}

        <div className="gallery-card__overlay">
          <div className="gallery-card__copy">
            <span className="gallery-card__eyebrow">Convention Photo</span>
            <h4 className="gallery-card__title">{item.caption}</h4>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function GalleryViewer({
  items,
  startIndex,
  onClose,
}: {
  items: GalleryItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<number | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const goPrev = useCallback(() => setCurrent((value) => (value - 1 + items.length) % items.length), [items.length]);
  const goNext = useCallback(() => setCurrent((value) => (value + 1) % items.length), [items.length]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      const focusTarget = viewerRef.current?.querySelector<HTMLButtonElement>("button[data-focus-initial='true']");
      focusTarget?.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowLeft") {
        goPrev();
      }
      if (event.key === "ArrowRight") {
        goNext();
      }
      if (event.key === "+" || event.key === "=") {
        setZoomed(true);
      }
      if (event.key === "-") {
        setZoomed(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [goNext, goPrev, onClose]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = event.clientX;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerStartRef.current === null) return;
    const delta = event.clientX - pointerStartRef.current;
    if (Math.abs(delta) > 48) {
      if (delta < 0) goNext();
      else goPrev();
    }
    pointerStartRef.current = null;
  };

  const currentItem = items[current];

  return (
    <motion.div
      className="gallery-viewer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-label="Convention photo viewer"
    >
      <motion.div
        ref={viewerRef}
        className="gallery-viewer"
        initial={{ scale: 0.96, opacity: 0, y: 18 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 10 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          className="gallery-viewer__close"
          onClick={onClose}
          aria-label="Close viewer"
          data-focus-initial="true"
        >
          <X size={18} />
        </button>

        <button
          type="button"
          className="gallery-viewer__nav gallery-viewer__nav--prev"
          onClick={goPrev}
          aria-label="Previous image"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          className="gallery-viewer__nav gallery-viewer__nav--next"
          onClick={goNext}
          aria-label="Next image"
        >
          <ChevronRight size={18} />
        </button>

        <div className={`gallery-viewer__frame${zoomed ? " gallery-viewer__frame--zoomed" : ""}`}>
          <motion.div
            key={currentItem.sourceIndex}
            className="gallery-viewer__media"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setZoomed((value) => !value)}
          >
            <Image
              src={currentItem.image_url}
              alt={currentItem.caption}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 90vw"
              className="gallery-viewer__img"
            />
          </motion.div>
        </div>

        <div className="gallery-viewer__meta">
          <div className="gallery-viewer__counter">{current + 1} / {items.length}</div>
          <button
            type="button"
            className="gallery-viewer__zoom"
            onClick={() => setZoomed((value) => !value)}
            aria-label={zoomed ? "Exit zoom" : "Zoom image"}
          >
            {zoomed ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span>{zoomed ? "Fit" : "Zoom"}</span>
          </button>
        </div>

        <div className="gallery-viewer__caption">
          <h4>{currentItem.caption}</h4>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Skeleton Loader Component ────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="conv-detail-skeleton" aria-busy="true">
      <div className="skeleton-hero animate-pulse" />
      <div className="skeleton-container container">
        <div className="skeleton-grid">
          <div className="skeleton-main">
            <div className="skeleton-card animate-pulse" style={{ height: "280px" }} />
            <div className="skeleton-card animate-pulse" style={{ height: "350px", marginTop: "32px" }} />
            <div className="skeleton-card animate-pulse" style={{ height: "300px", marginTop: "32px" }} />
          </div>
          <div className="skeleton-sidebar">
            <div className="skeleton-card animate-pulse" style={{ height: "380px" }} />
            <div className="skeleton-card animate-pulse" style={{ height: "240px", marginTop: "32px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}



// ── Main Page Template ──────────────────────────────────────────────────────
export default function ConventionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [convention, setConvention] = useState<Convention | null>(null);

  // States
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [expandedJournal, setExpandedJournal] = useState<string | null>(null);

  // Gallery state
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryViewerOpen, setGalleryViewerOpen] = useState(false);
  const [galleryViewerStart, setGalleryViewerStart] = useState(0);
  const [gallerySort, setGallerySort] = useState<GallerySort>("newest");
  const galleryModalRef = useRef<HTMLDivElement | null>(null);
  const galleryCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const galleryModalFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!galleryModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    galleryModalFocusRef.current = document.activeElement as HTMLElement | null;

    const focusTimer = window.setTimeout(() => {
      galleryCloseButtonRef.current?.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !galleryViewerOpen) {
        setGalleryModalOpen(false);
        return;
      }

      if (event.key === "Tab" && galleryModalRef.current && !galleryViewerOpen) {
        const focusableElements = galleryModalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], select, [tabindex]:not([tabindex="-1"])',
        );
        const focusable = Array.from(focusableElements).filter((element) => !element.hasAttribute("disabled"));

        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const firstFocusable = focusable[0];
        const lastFocusable = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        } else if (!event.shiftKey && document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      galleryModalFocusRef.current?.focus?.();
    };
  }, [galleryModalOpen, galleryViewerOpen]);

  const galleryItems = useMemo<GalleryItem[]>(() => {
    if (!convention) return [];
    const items = convention.gallery.map((item, sourceIndex) => ({ ...item, sourceIndex }));
    return gallerySort === "newest" ? [...items].reverse() : items;
  }, [convention, gallerySort]);

  const galleryPreview = useMemo(() => galleryItems.slice(0, 6), [galleryItems]);
  const galleryViewerItems = useMemo(
    () => galleryItems.map((item) => ({ ...item })),
    [galleryItems],
  );

  const handleOpenGalleryViewer = (index: number) => {
    setGalleryViewerStart(index);
    setGalleryViewerOpen(true);
  };

  // Fetch / find convention details from the database
  useEffect(() => {
    async function loadConventionDetail() {
      try {
        setLoading(true);
        // 1. Fetch public list to find the convention by slug or id
        const listRes = await api.get<{ success: boolean; data?: any[] }>("/conventions/public");
        if (!listRes.success || !Array.isArray(listRes.data)) {
          setConvention(null);
          return;
        }

        const match = listRes.data.find((c: any) => {
          const cleanNum = (c.convention_number || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const generatedSlug = `${cleanNum}-national-convention`;
          return generatedSlug === slug || c.id === slug;
        });

        if (!match) {
          setConvention(null);
          return;
        }

        // 2. Fetch the full convention details with schedules, speakers, attachments
        const detailRes = await api.get<{ success: boolean; data?: any }>(`/conventions/${match.id}/full`);
        if (!detailRes.success || !detailRes.data) {
          setConvention(null);
          return;
        }

        const data = detailRes.data;

        // 3. Map the data to the frontend Convention type
        const startDate = new Date(data.start_date);
        const endDate = new Date(data.end_date);
        const year = startDate.getFullYear();

        const formatDateFull = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
        const dateRange = formatDateFull(startDate) === formatDateFull(endDate)
          ? formatDateFull(startDate)
          : `${formatDateFull(startDate)} – ${formatDateFull(endDate)}`;

        const coverImage = data.attachments?.find((a: any) => a.file_type === "image")?.file_url || 
          "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop";

        // Map schedules to program_schedule
        const schedules = data.schedules || [];
        const uniqueDates = Array.from(new Set(schedules.map((s: any) => s.schedule_date.split("T")[0])))
          .sort() as string[];

        const programSchedule = uniqueDates.map((dateStr, idx) => {
          const sessionsOnDate = schedules
            .filter((s: any) => s.schedule_date.split("T")[0] === dateStr)
            .map((s: any) => {
              let timeStr = "";
              if (s.start_time) {
                timeStr = s.start_time;
                if (s.end_time) {
                  timeStr += ` - ${s.end_time}`;
                }
              } else {
                timeStr = "TBA";
              }

              const getSessionType = (type: string): "plenary" | "workshop" | "breakout" | "special" => {
                const t = (type || "").toLowerCase();
                if (t.includes("plenary")) return "plenary";
                if (t.includes("workshop")) return "workshop";
                if (t.includes("breakout")) return "breakout";
                return "special";
              };

              return {
                time: timeStr,
                session_title: s.title,
                session_type: getSessionType(s.event_type),
                room_or_venue: s.location || "TBA",
              };
            });

          return {
            day_number: idx + 1,
            date: new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            sessions: sessionsOnDate,
          };
        });

        // Map speakers
        const speakers = (data.speakers || []).map((sp: any) => ({
          name: sp.name,
          title: sp.role_position || "Speaker",
          organization: sp.institution || "",
          topic: sp.presentation_topic || "",
          photo_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(sp.name)}`,
        }));

        // Map activities (derived from schedules where event_type is Workshop/Special Session/Other)
        const activities = (data.schedules || [])
          .filter((s: any) => s.event_type === "Workshop" || s.event_type === "Special Session" || s.event_type === "Other")
          .map((s: any) => {
            const getActType = (type: string): "workshop" | "forum" | "competition" | "cultural" | "other" => {
              const t = (type || "").toLowerCase();
              if (t.includes("workshop")) return "workshop";
              if (t.includes("forum")) return "forum";
              if (t.includes("competition")) return "competition";
              if (t.includes("cultural")) return "cultural";
              return "other";
            };

            return {
              title: s.title,
              description: `Part of our convention schedule. Type: ${s.event_type}`,
              type: getActType(s.event_type),
              date: new Date(s.schedule_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
              venue: s.location || "TBA",
            };
          });

        // Map attachments (PDFs -> journals, Images -> gallery)
        const attachments = data.attachments || [];
        const journals = attachments
          .filter((a: any) => a.file_type === "pdf")
          .map((a: any) => ({
            title: a.file_name.replace(/\.[^/.]+$/, ""),
            authors: ["PAGE National Office"],
            abstract_excerpt: "Download this document to view the full details, guidelines, and articles for this convention edition.",
            volume: "Document",
            issue: "PDF",
            download_url: a.file_url,
          }));

        const gallery = attachments
          .filter((a: any) => a.file_type === "image")
          .map((a: any) => ({
            image_url: a.file_url,
            caption: a.file_name.replace(/\.[^/.]+$/, ""),
          }));

        const mapped: Convention = {
          slug,
          convention_number: data.convention_number,
          theme: data.title,
          year,
          location: data.location,
          date_range: dateRange,
          cover_image_url: coverImage,
          intro_paragraph: data.description,
          program_schedule: programSchedule,
          speakers,
          activities,
          journals,
          gallery,
        };

        setConvention(mapped);
      } catch (err) {
        console.error("Failed to load convention detail:", err);
        setConvention(null);
      } finally {
        setLoading(false);
      }
    }

    loadConventionDetail();
  }, [slug]);

  if (!loading && !convention) {
    return (
      <>
        <Navbar scrolled={scrolled} />
        <main className="convention-detail-error container">
          <div className="conv-error">
            <div className="conv-error__icon"><AlertCircle /></div>
            <h1 className="conv-error__title">Convention Not Found</h1>
            <p className="conv-error__desc">
              The convention archive you are requesting could not be found or has not been uploaded yet.
            </p>
            <Link href="/convention" className="btn-back-archive">
              <ArrowLeft size={14} /> Back to Convention Archives
            </Link>
          </div>
        </main>
      </>
    );
  }

  const activityLabels: Record<string, string> = {
    workshop: "Workshop",
    forum: "Forum",
    competition: "Competition",
    cultural: "Cultural",
    other: "Other Event"
  };

  return (
    <>
      <Navbar scrolled={scrolled} />

      {/* Hero Breadcrumb and Action Section */}
      <section className="convention-detail-hero-bar">
        <div className="container convention-detail-hero-bar__inner">
          <div className="convention-detail-hero-bar__breadcrumb">
            <Link href="/" className="convention-detail-hero-bar__link">Home</Link>
            <span className="convention-detail-hero-bar__sep">/</span>
            <Link href="/convention" className="convention-detail-hero-bar__link">Convention</Link>
            <span className="convention-detail-hero-bar__sep">/</span>
            <span className="convention-detail-hero-bar__current">
              {convention ? `${convention.convention_number} — ${convention.year}` : ""}
            </span>
          </div>
          <Link href="/convention" className="convention-detail-hero-bar__back">
            &larr; Back to Archives
          </Link>
        </div>
      </section>

      <main style={{ paddingBottom: "100px" }}>
        {loading || !convention ? (
          <DetailSkeleton />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* ── SECTION 1: Convention Hero ── */}
            <motion.section className="conv-hero" variants={sectionVariants}>
              <div className="container">
                <div className="conv-hero__card">
                  {/* Visual representation */}
                  <div className="conv-hero__visual">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={convention.cover_image_url} alt={`${convention.convention_number} Cover`} className="conv-hero__img" />
                    <div className="conv-hero__badge">{convention.year}</div>
                  </div>

                  {/* Content */}
                  <div className="conv-hero__content">
                    <span className="conv-hero__edition">{convention.convention_number} National Convention</span>
                    <h1 className="conv-hero__title">{convention.theme}</h1>
                    
                    <div className="conv-hero__stats">
                      <div className="conv-hero__stat-pill">
                        <MapPin size={14} />
                        <span>{convention.location}</span>
                      </div>
                      <div className="conv-hero__stat-pill">
                        <Calendar size={14} />
                        <span>{convention.date_range}</span>
                      </div>
                    </div>

                    <p className="conv-hero__intro">{convention.intro_paragraph}</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Layout Grid */}
            <div className="container conv-layout">
              {/* Main Column */}
              <div className="conv-layout__main">
                
                {/* ── SECTION 2: Program Schedule ── */}
                <motion.section className="conv-section card-container" variants={sectionVariants}>
                  <div className="conv-section__header-row">
                    <div className="conv-section__title-group">
                      <Layers className="section-icon" />
                      <h2 className="conv-section__title">Program Schedule</h2>
                    </div>

                    {/* Day selector with sliding indicator layoutId */}
                    <div className="day-selector" role="tablist" aria-label="Filter schedule days">
                      {convention.program_schedule.map((day) => {
                        const isActive = selectedDay === day.day_number;
                        return (
                          <button
                            key={day.day_number}
                            role="tab"
                            aria-selected={isActive}
                            className={`day-selector__btn${isActive ? " day-selector__btn--active" : ""}`}
                            onClick={() => setSelectedDay(day.day_number)}
                          >
                            Day {day.day_number}
                            {isActive && (
                              <motion.div
                                layoutId="active-day-pill"
                                className="day-selector__active-indicator"
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="schedule-date-label">
                    Schedule for {convention.program_schedule.find(d => d.day_number === selectedDay)?.date}
                  </p>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedDay}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.22 }}
                      className="conv-timeline"
                    >
                      {convention.program_schedule
                        .find((d) => d.day_number === selectedDay)
                        ?.sessions.map((session, index) => (
                          <div key={index} className="timeline-item">
                            <div className="timeline-time">{session.time}</div>
                            <div className="timeline-marker">
                              <span className="timeline-dot" />
                              <span className="timeline-line" />
                            </div>
                            <div className="timeline-content">
                              <div className="timeline-header-row">
                                <span className={`session-badge session-badge--${session.session_type}`}>
                                  {session.session_type}
                                </span>
                                <span className="session-venue">
                                  <MapPin size={12} /> {session.room_or_venue}
                                </span>
                              </div>
                              <h4 className="session-title">{session.session_title}</h4>
                            </div>
                          </div>
                        ))}
                    </motion.div>
                  </AnimatePresence>
                </motion.section>

                {/* ── SECTION 3: Speakers ── */}
                <motion.section className="conv-section card-container" variants={sectionVariants}>
                  <div className="conv-section__title-group" style={{ marginBottom: "24px" }}>
                    <Mic className="section-icon" />
                    <h2 className="conv-section__title">Distinguished Speakers</h2>
                  </div>

                  <div className="speakers-grid">
                    {convention.speakers.map((speaker, idx) => (
                      <div key={idx} className="speaker-card">
                        <div className="speaker-card__image-container">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={speaker.photo_url}
                            alt={`${speaker.name} portrait`}
                            className="speaker-card__img"
                          />
                          {/* Hover overlay with Framer Motion */}
                          <div className="speaker-card__overlay">
                            <div className="speaker-card__overlay-content">
                              <span className="speaker-card__overlay-label">Presentation Topic</span>
                              <p className="speaker-card__overlay-text">&ldquo;{speaker.topic}&rdquo;</p>
                            </div>
                          </div>
                        </div>

                        <div className="speaker-card__body">
                          <h4 className="speaker-card__name">{speaker.name}</h4>
                          <span className="speaker-card__title">{speaker.title}</span>
                          <span className="speaker-card__org">{speaker.organization}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* ── SECTION 4: Activities Conducted ── */}
                <motion.section className="conv-section card-container" variants={sectionVariants}>
                  <div className="conv-section__title-group" style={{ marginBottom: "24px" }}>
                    <Activity className="section-icon" />
                    <h2 className="conv-section__title">Activities Conducted</h2>
                  </div>

                  <div className="activities-list">
                    {convention.activities.map((act) => {
                      const isExpanded = expandedActivity === act.title;
                      return (
                        <div key={act.title} className="activity-item">
                          <div
                            className="activity-item__header"
                            onClick={() => setExpandedActivity(isExpanded ? null : act.title)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                setExpandedActivity(isExpanded ? null : act.title);
                              }
                            }}
                          >
                            <div className="activity-item__title-col">
                              <span className={`activity-badge activity-badge--${act.type}`}>
                                {activityLabels[act.type]}
                              </span>
                              <h3 className="activity-item__title">{act.title}</h3>
                            </div>
                            <div className="activity-item__trigger">
                              <span className={`trigger-chevron${isExpanded ? " trigger-chevron--rotated" : ""}`}>
                                <ChevronDown size={18} />
                              </span>
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                              >
                                <div className="activity-item__body">
                                  <div className="activity-item__meta">
                                    <div className="activity-meta-p">
                                      <Calendar size={13} />
                                      <span>{act.date}</span>
                                    </div>
                                    <div className="activity-meta-p">
                                      <MapPin size={13} />
                                      <span>{act.venue}</span>
                                    </div>
                                  </div>
                                  <p className="activity-item__desc">{act.description}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              </div>

              {/* Sidebar Column */}
              <div className="conv-layout__sidebar">
                
                {/* ── SECTION 5: Journals ── */}
                <motion.section className="conv-sidebar-section card-container" variants={sectionVariants}>
                  <div className="conv-section__title-group" style={{ marginBottom: "20px" }}>
                    <BookOpen className="sidebar-section-icon" />
                    <h3 className="conv-sidebar-section__title">Published Journals</h3>
                  </div>

                  <div className="journals-list">
                    {convention.journals.map((journal, index) => {
                      const isExpanded = expandedJournal === journal.title;
                      return (
                        <div key={index} className="journal-row">
                          <div className="journal-row__header">
                            <h4 className="journal-title" title={journal.title}>{journal.title}</h4>
                            <span className="journal-meta">
                              {journal.volume} • {journal.issue}
                            </span>
                            <p className="journal-authors">
                              By: {journal.authors.join(", ")}
                            </p>
                          </div>

                          <div className="journal-actions">
                            <button 
                              className="btn-toggle-abstract" 
                              onClick={() => setExpandedJournal(isExpanded ? null : journal.title)}
                            >
                              {isExpanded ? "Hide Abstract" : "View Abstract"}
                            </button>
                            {/* Real <a> tag with download attribute as requested */}
                            <a
                              href={journal.download_url}
                              download={`PAGE-${convention.year}-${journal.title.slice(0, 15)}.pdf`}
                              className="btn-download-journal"
                              aria-label={`Download journal ${journal.title}`}
                            >
                              <Download size={13} /> Download
                            </a>
                          </div>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.24 }}
                                style={{ overflow: "hidden" }}
                              >
                                <div className="journal-abstract">
                                  <strong>Abstract Excerpt:</strong>
                                  <p>{journal.abstract_excerpt}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>

                {/* ── SECTION 6: Photo Gallery ── */}
                <motion.section className="conv-sidebar-section card-container" variants={sectionVariants}>
                  <div className="conv-section__title-group conv-section__title-group--gallery" style={{ marginBottom: "20px" }}>
                    <ImageIcon className="sidebar-section-icon" />
                    <div>
                      <h3 className="conv-sidebar-section__title">Photo Gallery</h3>
                      <p className="conv-sidebar-section__subtitle">Selected moments from the convention archive.</p>
                    </div>
                  </div>

                  {galleryPreview.length > 0 ? (
                    <>
                      <motion.div className="gallery-preview-grid" variants={galleryContainerVariants} initial="hidden" animate="visible">
                        {galleryPreview.map((item, idx) => (
                          <GalleryPhotoCard
                            key={`${item.image_url}-${item.sourceIndex}`}
                            item={item}
                            index={idx}
                            onOpen={handleOpenGalleryViewer}
                          />
                        ))}
                      </motion.div>

                      {galleryItems.length > galleryPreview.length && (
                        <button
                          type="button"
                          className="btn-gallery-more"
                          onClick={() => setGalleryModalOpen(true)}
                        >
                          See More Photos
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="gallery-empty-inline">
                      <ImageIcon className="gallery-empty-inline__icon" />
                      <p>No photos available</p>
                    </div>
                  )}
                </motion.section>
              </div>
            </div>

            {/* Gallery Modal */}
            <AnimatePresence>
              {galleryModalOpen && (
                <motion.div
                  className="gallery-modal-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setGalleryModalOpen(false);
                    }
                  }}
                >
                  <motion.div
                    ref={galleryModalRef}
                    className="gallery-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="gallery-modal-title"
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.96 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.header className="gallery-modal__header" variants={sectionVariants} initial="hidden" animate="visible">
                      <div className="gallery-modal__heading">
                        <p className="gallery-modal__eyebrow">Convention Gallery</p>
                        <h3 id="gallery-modal-title" className="gallery-modal__title">All Photos</h3>
                        <p className="gallery-modal__subtitle">Browse memories captured throughout the convention.</p>
                      </div>

                      <div className="gallery-modal__actions">
                        <div className="gallery-modal__count">
                          <Search size={14} />
                          <span>{galleryItems.length} photos</span>
                        </div>

                        <label className="gallery-modal__sort" aria-label="Sort photos">
                          <SlidersHorizontal size={14} />
                          <select value={gallerySort} onChange={(e) => setGallerySort(e.target.value as GallerySort)}>
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                          </select>
                        </label>

                        <button
                          type="button"
                          className="gallery-modal__close"
                          onClick={() => setGalleryModalOpen(false)}
                          aria-label="Close gallery modal"
                          ref={galleryCloseButtonRef}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </motion.header>

                    <div className="gallery-modal__body">
                      {galleryItems.length === 0 ? (
                        <div className="gallery-empty-state">
                          <ImageIcon className="gallery-empty-state__icon" />
                          <h4>No photos available</h4>
                          <p>The gallery is empty for this convention right now.</p>
                        </div>
                      ) : (
                        <motion.div className="gallery-modal__grid" variants={galleryContainerVariants} initial="hidden" animate="visible">
                          {galleryItems.map((item, idx) => (
                            <GalleryPhotoCard
                              key={`${item.image_url}-${item.sourceIndex}`}
                              item={item}
                              index={idx}
                              onOpen={handleOpenGalleryViewer}
                            />
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fullscreen Viewer */}
            <AnimatePresence>
              {galleryViewerOpen && galleryViewerItems.length > 0 && (
                <GalleryViewer
                  key={`${galleryViewerStart}-${gallerySort}`}
                  items={galleryViewerItems}
                  startIndex={galleryViewerStart}
                  onClose={() => setGalleryViewerOpen(false)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </>
  );
}
