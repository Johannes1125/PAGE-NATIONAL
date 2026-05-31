"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "./news.css";

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

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
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

const UserIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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

const ExternalLinkIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
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

type NewsCategory = "All" | "News" | "Events" | "Research";

const ALL_NEWS = [
  {
    id: 1,
    category: "Events" as NewsCategory,
    date: "March 12, 2026",
    author: "Dr. Maria Santos",
    title: "PAGE Annual Conference 2026: Innovation in Graduate Education",
    excerpt: "Join us for the most anticipated event of the year as we explore cutting-edge innovations and best practices in graduate education. This three-day conference features keynotes from leading researchers.",
  },
  {
    id: 2,
    category: "News" as NewsCategory,
    date: "March 12, 2026",
    author: "Dr. Maria Santos",
    title: "PAGE Annual Conference 2026: Innovation in Graduate Education",
    excerpt: "Join us for the most anticipated event of the year as we explore cutting-edge innovations and best practices in graduate education. This three-day conference brings together educators nationwide.",
  },
  {
    id: 3,
    category: "Research" as NewsCategory,
    date: "March 12, 2026",
    author: "Dr. Maria Santos",
    title: "PAGE Annual Conference 2026: Innovation in Graduate Education",
    excerpt: "Join us for the most anticipated event of the year as we explore cutting-edge innovations and best practices in graduate education. This three-day event fosters cross-disciplinary dialogue.",
  },
  {
    id: 4,
    category: "Events" as NewsCategory,
    date: "March 27, 2026",
    author: "Dr. Maria Santos",
    title: "PAGE Annual Conference 2026: Innovation in Graduate Education",
    excerpt: "Join us for the most anticipated event of the year as we explore cutting-edge innovations and best practices in graduate education. This three-day conference.",
  },
  {
    id: 5,
    category: "News" as NewsCategory,
    date: "March 15, 2026",
    author: "Dr. Marie Tan-Lay",
    title: "PAGE Annual Conference 2026: Innovation in Graduate Education",
    excerpt: "Join us for the most anticipated event of the year as we explore cutting-edge innovations and best practices in graduate education. This three-day conference.",
  },
  {
    id: 6,
    category: "Research" as NewsCategory,
    date: "March 10, 2026",
    author: "Dr. Maria Santos",
    title: "PAGE Annual Conference 2026: Innovation in Graduate Education",
    excerpt: "Join us for the most anticipated event of the year as we explore cutting-edge innovations and best practices in graduate education. This three-day conference.",
  },
  {
    id: 7,
    category: "Events" as NewsCategory,
    date: "March 12, 2026",
    author: "Dr. Maria Santos",
    title: "PAGE Annual Conference 2026: Innovation in Graduate Education",
    excerpt: "Join us for the most anticipated event of the year as we explore cutting-edge innovations and best practices in graduate education. This three-day conference.",
  },
  {
    id: 8,
    category: "News" as NewsCategory,
    date: "March 12, 2026",
    author: "Dr. Maria Santos",
    title: "PAGE Annual Conference 2026: Innovation in Graduate Education",
    excerpt: "Join us for the most anticipated event of the year as we explore cutting-edge innovations and best practices in graduate education. This three-day conference.",
  },
];

// Journal data with volumes → issues → articles
const JOURNALS_DATA = [
  {
    id: "vol5",
    volume: "Volume 5",
    year: "2025–2026",
    issueCount: 2,
    issues: [
      {
        id: "v5-i1",
        label: "Issue 1",
        articleCount: 5,
        articles: [
          { title: "Transformative Approaches in Philippine Graduate Research Methodology", author: "Dr. Ana Reyes", pages: "pp. 1–18" },
          { title: "Hybrid Learning Models in Post-Pandemic Graduate Programs", author: "Dr. Jose Mendoza & Dr. Luz Garcia", pages: "pp. 19–35" },
          { title: "Faculty Development and Research Productivity in State Universities", author: "Dr. Caridad Abian", pages: "pp. 36–52" },
          { title: "Institutional Readiness for Internationalization of Graduate Education", author: "Dr. Ramir Austria", pages: "pp. 53–70" },
          { title: "Outcomes-Based Education in Master's Level Programs", author: "Dr. Sonia Pajaron", pages: "pp. 71–88" },
        ],
      },
      {
        id: "v5-i2",
        label: "Issue 2",
        articleCount: 4,
        articles: [
          { title: "Digital Competency Among Graduate Faculty in the Philippines", author: "Dr. Joseph Recio", pages: "pp. 89–108" },
          { title: "Research Collaboration Patterns in Philippine Higher Education", author: "Dr. Ruy Reyes", pages: "pp. 109–126" },
          { title: "Sustainability Frameworks in Graduate Curriculum Design", author: "Dr. Yolanda Sayson", pages: "pp. 127–144" },
          { title: "Student Engagement Metrics in Online Dissertation Programs", author: "Dr. Imelda Soriano", pages: "pp. 145–162" },
        ],
      },
    ],
  },
  {
    id: "vol4",
    volume: "Volume 4",
    year: "2024–2025",
    issueCount: 2,
    issues: [
      {
        id: "v4-i1",
        label: "Issue 1",
        articleCount: 5,
        articles: [
          { title: "Challenges in Graduate Thesis Advisory in Regional Universities", author: "Dr. Dolores Quambo", pages: "pp. 1–16" },
          { title: "Innovation Ecosystems in Philippine Graduate Schools", author: "Dr. Lino Reynoso", pages: "pp. 17–34" },
          { title: "Cross-disciplinary Research in ASEAN Graduate Education", author: "Dr. Alper Pineda", pages: "pp. 35–50" },
          { title: "Assessment Literacy Among Graduate Students", author: "Dr. Remedios Bacus", pages: "pp. 51–68" },
          { title: "Gender Equity in Graduate School Leadership", author: "Dr. Judith Chavez", pages: "pp. 69–85" },
        ],
      },
      {
        id: "v4-i2",
        label: "Issue 2",
        articleCount: 3,
        articles: [
          { title: "Open Access Publishing and Graduate Research Dissemination", author: "Dr. Arnel Bravo", pages: "pp. 86–102" },
          { title: "Benchmarking Philippine Graduate Programs Against ASEAN Standards", author: "Dr. Ma. Kathleen Tiglao", pages: "pp. 103–120" },
          { title: "Mentoring Models and Dissertation Completion Rates", author: "Dr. Rowena Abrea", pages: "pp. 121–138" },
        ],
      },
    ],
  },
  {
    id: "vol3",
    volume: "Volume 3",
    year: "2023–2024",
    issueCount: 2,
    issues: [
      {
        id: "v3-i1",
        label: "Issue 1",
        articleCount: 4,
        articles: [
          { title: "Decolonizing Knowledge in Filipino Graduate Research", author: "Dr. Ana Reyes", pages: "pp. 1–20" },
          { title: "STEM Graduate Education and National Development Goals", author: "Dr. Jose Mendoza", pages: "pp. 21–38" },
          { title: "Language Policy and Medium of Instruction in Graduate Studies", author: "Dr. Luz Garcia", pages: "pp. 39–56" },
          { title: "Quality Assurance Systems in Philippine Graduate Programs", author: "Dr. Caridad Abian", pages: "pp. 57–74" },
        ],
      },
      {
        id: "v3-i2",
        label: "Issue 2",
        articleCount: 4,
        articles: [
          { title: "Research Ethics Education in Philippine Doctoral Programs", author: "Dr. Ramir Austria", pages: "pp. 75–92" },
          { title: "Interdisciplinary Approaches to Social Science Research", author: "Dr. Sonia Pajaron", pages: "pp. 93–110" },
          { title: "Graduate Alumni Tracer Studies as Quality Indicators", author: "Dr. Joseph Recio", pages: "pp. 111–128" },
          { title: "Trends in Graduate Enrollment in State Universities and Colleges", author: "Dr. Ruy Reyes", pages: "pp. 129–146" },
        ],
      },
    ],
  },
  {
    id: "vol2",
    volume: "Volume 2",
    year: "2022–2023",
    issueCount: 2,
    issues: [
      {
        id: "v2-i1",
        label: "Issue 1",
        articleCount: 5,
        articles: [
          { title: "Emergency Remote Teaching in Philippine Graduate Education", author: "Dr. Yolanda Sayson", pages: "pp. 1–18" },
          { title: "E-Learning Readiness of Graduate Faculty During COVID-19", author: "Dr. Imelda Soriano", pages: "pp. 19–36" },
          { title: "Pandemic-Resilient Graduate Research Frameworks", author: "Dr. Dolores Quambo", pages: "pp. 37–54" },
          { title: "Mental Health and Well-being of Graduate Students in Crisis", author: "Dr. Lino Reynoso", pages: "pp. 55–72" },
          { title: "Resilience and Adaptive Capacity in Graduate Institutions", author: "Dr. Alper Pineda", pages: "pp. 73–90" },
        ],
      },
      {
        id: "v2-i2",
        label: "Issue 2",
        articleCount: 3,
        articles: [
          { title: "Revisiting Graduate Competency Standards Post-Pandemic", author: "Dr. Remedios Bacus", pages: "pp. 91–108" },
          { title: "Digital Libraries and Graduate Research Access", author: "Dr. Judith Chavez", pages: "pp. 109–126" },
          { title: "Collaborative Research Networks in Philippine Higher Education", author: "Dr. Arnel Bravo", pages: "pp. 127–144" },
        ],
      },
    ],
  },
];

const FOOTER_QUICK_LINKS = ["About PAGE", "History", "Officers", "News & Announcements"];
const FOOTER_RESOURCES    = ["Journals", "Articles", "Upcoming Activities", "Contact Us"];
const FOOTER_CONTACT = [
  { icon: <MapPinIcon />,      text: "Manila, Philippines" },
  { icon: <MailIconContact />, text: "page@gmail.edu.ph"   },
  { icon: <PhoneIcon />,       text: "+63 908 XXX XXXX"    },
];

const NEWS_CATEGORIES: { label: string; value: NewsCategory | "All" }[] = [
  { label: "All",      value: "All"      },
  { label: "News",     value: "News"     },
  { label: "Events",   value: "Events"   },
  { label: "Research", value: "Research" },
];

const ITEMS_PER_PAGE = 6;

// ── Navbar ─────────────────────────────────────────────────────────────────
function Navbar({ scrolled }: { scrolled: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className={`navbar${scrolled ? " navbar--scrolled" : ""}${menuOpen ? " navbar--open" : ""}`}>
      <nav className="navbar__inner">
        <div className="navbar__logo">
          <div className="navbar__logo-mark">
            <Image
              src="/PAGE.jpg"
              width={50}
              height={50}
              alt="PAGE Logo"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <span className="navbar__logo-mark-fallback" style={{ display: "none" }}>PAGE</span>
          </div>
          <div className="navbar__logo-text">
            <div className="navbar__logo-name">PAGE</div>
            <div className="navbar__logo-sub">Philippine Association for Graduate Education</div>
          </div>
        </div>

        <div className="navbar__links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link}
              href={getPath(link as NavLink)}
              className={`navbar__link${link === "News" ? " navbar__link--active" : ""}`}
            >
              {link}
            </Link>
          ))}
          <Link href="/member-login" className="navbar__signin">Sign In</Link>
        </div>

        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </nav>

      <div className={`navbar__mobile-menu${menuOpen ? " navbar__mobile-menu--open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link}
            href={getPath(link as NavLink)}
            className={`navbar__mobile-link${link === "News" ? " navbar__mobile-link--active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {link}
          </Link>
        ))}
        <Link href="/member-login" className="navbar__mobile-signin" onClick={() => setMenuOpen(false)}>
          Sign In
        </Link>
      </div>
    </header>
  );
}

// ── News Hero ──────────────────────────────────────────────────────────────


// ── News Section ───────────────────────────────────────────────────────────
// ── News Section ───────────────────────────────────────────────────────────
function NewsSection() {
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = ALL_NEWS.filter(item => {
    const matchCat  = category === "All" || item.category === category;
    const matchSearch = !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCatChange = (val: string) => { setCategory(val); setPage(1); };
  const handleSearch    = (val: string) => { setSearch(val);   setPage(1); };

  return (
    <section className="news-section">
      <div className="container">
        {/* Section heading */}
        <div className="section-header" style={{ textAlign: "left", marginBottom: "32px" }}>
          <span className="section-label">Latest Updates</span>
          <h2 className="section-title" style={{ textAlign: "left", margin: "0 0 8px" }}>
            News &amp; Announcements
          </h2>
          <p className="section-subtitle" style={{ textAlign: "left", margin: 0, maxWidth: "600px" }}>
            Stay informed with the latest news, research breakthroughs, and upcoming events
            from the Philippine Association for Graduate Education.
          </p>
        </div>

        {/* Filters */}
        <div className="news-filters">
          <select
            className="news-filter-select"
            value={category}
            onChange={e => handleCatChange(e.target.value)}
            aria-label="Filter by category"
          >
            {NEWS_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <input
            type="text"
            className="news-filter-search"
            placeholder="Search articles, authors…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            aria-label="Search news"
          />

          <span className="news-filter-count">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </span>
        </div>

        {/* Grid */}
        {paginated.length > 0 ? (
          <div className="news-grid">
            {paginated.map(item => (
              <div key={item.id} className="news-card">
                <div className="news-card__image">
                  <span className="news-card__badge">{item.category}</span>
                </div>
                <div className="news-card__body">
                  <div className="news-card__meta">
                    <span className="news-card__date">
                      <CalendarIcon /> {item.date}
                    </span>
                    <span className="news-card__dot" />
                    <span className="news-card__author">
                      <UserIcon /> {item.author}
                    </span>
                  </div>
                  <h3 className="news-card__title">{item.title}</h3>
                  <p className="news-card__excerpt">{item.excerpt}</p>
                  <div className="news-card__footer">
                    {/* CHANGED: Replaced <button> with <Link> to navigate to the slug */}
                    <Link href={`/news/${item.id}`} className="news-card__read-more">
                      Read More <ArrowIcon />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-30)" }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: "18px", marginBottom: "8px" }}>No results found</p>
            <p style={{ fontSize: "13px" }}>Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="news-pagination">
            <button
              className="news-pagination__btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
              aria-label="Previous page"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`news-pagination__btn${page === p ? " news-pagination__btn--active" : ""}`}
                onClick={() => setPage(p)}
                aria-label={`Page ${p}`}
              >
                {p}
              </button>
            ))}

            <button
              className="news-pagination__btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
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

// ── Issue Accordion ────────────────────────────────────────────────────────
function IssueAccordion({ issue }: {
  issue: { id: string; label: string; articleCount: number; articles: { title: string; author: string; pages: string }[] }
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`issue-accordion${open ? " issue-accordion--open" : ""}`}>
      <div
        className="issue-accordion__header"
        onClick={() => setOpen(o => !o)}
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setOpen(o => !o); }}
      >
        <div className="issue-accordion__left">
          <div className="issue-accordion__dot" />
          <span className="issue-accordion__label">{issue.label}</span>
          <span className="issue-accordion__articles-count">{issue.articleCount} articles</span>
        </div>
        <span className="issue-accordion__chevron">
          <ChevronDownIcon />
        </span>
      </div>
      <div className="issue-accordion__body">
        <div className="articles-list">
          {issue.articles.map((article, idx) => (
            <div key={idx} className="article-item">
              <span className="article-item__num">{String(idx + 1).padStart(2, "0")}</span>
            <div className="article-item__content">
            <p className="article-item__title">{article.title}</p>
            <div className="article-item__meta">
                <span className="article-item__author">{article.author}</span>
                <span className="article-item__sep" />
                <span className="article-item__pages">{article.pages}</span>
            </div>
            </div>
            {/* Change this div to a Link and pass a formatted slug or ID */}
            <Link href={`/news/journal-article-1`} className="article-item__action">
            View <ExternalLinkIcon />
            </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Volume Accordion ───────────────────────────────────────────────────────
function VolumeAccordion({
  vol,
  searchQuery,
}: {
  vol: typeof JOURNALS_DATA[0];
  searchQuery: string;
}) {
  const [open, setOpen] = useState(false);

  // Auto-open if search matches
  useEffect(() => {
    if (searchQuery) {
      const hasMatch = vol.issues.some(issue =>
        issue.articles.some(a =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.author.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setOpen(hasMatch);
    }
  }, [searchQuery, vol.issues]);

  const totalArticles = vol.issues.reduce((sum, i) => sum + i.articleCount, 0);

  return (
    <div className={`volume-accordion${open ? " volume-accordion--open" : ""}`}>
      <div
        className="volume-accordion__header"
        onClick={() => setOpen(o => !o)}
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setOpen(o => !o); }}
      >
        <div className="volume-accordion__title-group">
          <span className="volume-accordion__badge">Volume</span>
          <span className="volume-accordion__name">{vol.volume}</span>
          <span className="volume-accordion__year">{vol.year}</span>
        </div>
        <div className="volume-accordion__right">
          <span className="volume-accordion__count">
            {vol.issueCount} issues · {totalArticles} articles
          </span>
          <div className="volume-accordion__chevron">
            <ChevronDownIcon />
          </div>
        </div>
      </div>

      <div className="volume-accordion__body">
        <div className="volume-accordion__issues">
          {vol.issues.map(issue => (
            <IssueAccordion key={issue.id} issue={issue} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Journals Section ───────────────────────────────────────────────────────
function JournalsSection() {
  const [search, setSearch] = useState("");

  const filteredVolumes = JOURNALS_DATA.filter(vol =>
    !search ||
    vol.volume.toLowerCase().includes(search.toLowerCase()) ||
    vol.year.includes(search) ||
    vol.issues.some(issue =>
      issue.articles.some(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.author.toLowerCase().includes(search.toLowerCase())
      )
    )
  );

  return (
    <section className="journals-section">
      <div className="container">
        {/* Header row */}
        <div className="journals-header-row">
          <div className="journals-header-left">
            <span className="section-label">Publications</span>
            <h2 className="section-title">PAGE Journals</h2>
            <p className="section-subtitle">
              Browse peer-reviewed research organized by volume and issue. Select a volume
              to explore individual articles and access full publications.
            </p>
          </div>
          <div className="journals-search">
            <input
              type="text"
              className="journals-search-input"
              placeholder="Search journals, articles, authors…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search journals"
            />
          </div>
        </div>

        {/* Accordion list */}
        {filteredVolumes.length > 0 ? (
          <div className="journals-list">
            {filteredVolumes.map(vol => (
              <VolumeAccordion key={vol.id} vol={vol} searchQuery={search} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-30)" }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: "18px", marginBottom: "8px" }}>No journals found</p>
            <p style={{ fontSize: "13px" }}>Try a different search term.</p>
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
                <span className="navbar__logo-mark-fallback" style={{ display: "none" }}>PAGE</span>
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
export default function NewsPage() {
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
        <NewsSection />
        <JournalsSection />
      </main>
      <Footer />
    </>
  );
}