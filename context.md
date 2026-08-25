# PAGE National Project Architecture & Structure

This document outlines the directory structure, tech stack, database schema, and UI design standards of the **PAGE National** fullstack web application.

---

## 🚀 Launcher Script
At the project root, a startup script orchestrates both development servers concurrently:
- **[run.js](file:///d:/PAGE-NATIONAL/run.js)**: Runs requirements check (Node.js), installs dependencies if missing, configures environment variables, and launches both the backend and frontend dev servers concurrently.
  - **Backend API URL**: `http://localhost:8000`
  - **Frontend UI URL**: `http://localhost:3000`

---

## 📁 Folder & File Structure

```
PAGE-NATIONAL/
│
├── run.js                    # Cross-platform fullstack development launcher
├── context.md                # System context, tech stack, and directory structure (this file)
│
├── backend/                  # Deprecated/leftover PHP backend directory (contains only pestphp/symfony vendor packages)
│   └── vendor/
│
├── backend-nest/             # Active Backend Server (NestJS Framework)
│   ├── prisma/               # Database ORM schema & seed scripts
│   │   ├── migrations/       # SQL migrations history files
│   │   ├── schema.prisma     # Prisma schema defining the PostgreSQL DB schema
│   │   └── seed.ts           # Seeding logic for development database
│   ├── src/                  # Application source code
│   │   ├── about-page/       # Serves about page sections, documents, and board of officers
│   │   ├── articles/         # Article/journal submission services & controllers
│   │   ├── auth/             # JWT/Token authentication, guards, roles decorator
│   │   ├── bir-certifications/ # BIR tax exemption certification records management endpoints
│   │   ├── chapters/         # Chapter profiles, activities, announcements, documents, and officers endpoints
│   │   ├── cloudinary/       # File upload service logic using Cloudinary
│   │   ├── common/           # Shared classes, interceptors, and utility functions
│   │   ├── conventions/      # Conventions, schedules, speakers, and attachments management endpoints
│   │   ├── dashboard/        # Dashboard stats and administration data handlers
│   │   ├── historical-records/ # Historical milestones and timeline records management
│   │   ├── membership-applications/ # Membership application submissions, multi-step application workflow, and document verification
│   │   ├── messages/         # Real-time messaging service between users and administrators
│   │   ├── national-officers/ # National board officers management endpoints
│   │   ├── page-logo/        # PAGE logos history management endpoints
│   │   ├── posts/            # Announcement, news, and blog post management
│   │   ├── prisma/           # Prisma client instantiation module
│   │   ├── sec-registrations/ # SEC registration records management endpoints
│   │   ├── supabase/         # File upload helper module utilizing Supabase Storage
│   │   ├── users/            # User profile and role management
│   │   ├── app.module.ts     # Root module configuration
│   │   └── main.ts           # Entrypoint for NestJS application
│   ├── test/                 # Integration/E2E test files
│   ├── .env                  # Environment secrets (JWT secret, DB URL, Supabase/Cloudinary keys)
│   ├── .env.example          # Environment variable template
│   ├── nest-cli.json         # NestJS CLI configuration options
│   ├── package.json          # Node script commands and package dependencies
│   ├── tsconfig.json         # Base TypeScript configuration
│   └── tsconfig.build.json   # TypeScript configuration for build output
│
└── frontend/                 # Frontend User Interface (Next.js Application)
    ├── app/                  # Next.js App Router pages and assets
    │   ├── (landing-page)/   # Group of public-facing pages
    │   │   ├── (home)/       # Main homepage layout and CSS
    │   │   ├── about/        # About Us main hub & detailed subpages:
    │   │   │   ├── bir/      # BIR Certification page
    │   │   │   ├── cbl/      # Constitution & By-Laws page
    │   │   │   ├── history/  # Historical Milestones page
    │   │   │   ├── logo/     # LOGO Description page
    │   │   │   ├── officers/ # Board of Officers page
    │   │   │   ├── sec/      # SEC Registration page
    │   │   │   └── page.tsx  # About Us main entry page
    │   │   ├── activities/   # Events and activities listings
    │   │   ├── chapters/     # Chapters page
    │   │   ├── components/   # Navbar, Footer, Lightbox, PageSeal, and shared landing components
    │   │   ├── contact/      # Contact details & contact forms
    │   │   ├── convention/   # Convention info page
    │   │   ├── journals/     # Professional journals index and access
    │   │   ├── library/      # Public library and resource documents
    │   │   ├── membership/   # Membership overview & application portal
    │   │   │   ├── apply/    # Multi-step membership application wizard & document uploads
    │   │   │   │   └── track/# Application reference status tracker
    │   │   │   └── page.tsx  # Membership benefits & categories overview
    │   │   ├── news/         # Blogs/Posts announcements feeds
    │   │   └── partners/     # Supporting partners
    │   ├── admin-dashboard/  # Admin Portal components and views
    │   │   ├── about-page/   # About PAGE subsections manager (BIR, CBL, History, Logo, Officers, SEC)
    │   │   │   ├── bir-certification/
    │   │   │   ├── cbl-information/
    │   │   │   ├── history/
    │   │   │   ├── logo-description/
    │   │   │   ├── national-officers/
    │   │   │   └── sec-registrations/
    │   │   ├── approve-post/ # View to moderate draft posts
    │   │   ├── audit-log/    # Log page to monitor actions
    │   │   ├── chapters/     # Regional chapters roster and management interface
    │   │   ├── components/   # Dashboard navigation and structure components
    │   │   ├── conventions/  # Conventions, schedules, speakers, and attachments management interface
    │   │   ├── create-new-post/ # Post writing / publishing interface
    │   │   ├── lib/          # Helper modules
    │   │   ├── manage-users/ # Admin view to manage users and roles
    │   │   ├── membership-applications/ # Verification portal and review workflow for membership applicants
    │   │   ├── national-officers/ # Separate national officers records manager
    │   │   ├── recent-activity/ # Activity feed and audit monitoring interface
    │   │   └── view-messages/# Dashboard communication client
    │   ├── admin-login/      # Admin authentication page
    │   ├── org-dashboard/    # Dashboard layout for organizations
    │   │   ├── article-submission/ # Submit research papers/articles
    │   │   └── create-post/  # Compose local drafts
    │   ├── org-login/        # Organization login page
    │   ├── member-login/     # General member login page
    │   ├── create-account/   # New user registration flow
    │   ├── forgot-password/  # Password reset flow
    │   ├── lib/              # API Client (axios/fetch instances, AcroForm PDF helpers, membership helpers), types, FontAwesome setup
    │   ├── globals.css       # Baseline styles and utility rules
    │   └── layout.tsx        # Top-level Next.js layout
    ├── public/               # Static assets (images, icons, PAGE-favicon.png, about-bg.jpg, hero-bg.jpg)
    ├── next.config.ts        # Next.js server configuration options
    ├── package.json          # Node packages and configuration
    ├── postcss.config.mjs    # PostCSS configuration
    └── tsconfig.json         # TypeScript setup
```

---

## 🎨 UI Design Standards & Landing System Guidelines

1. **Dominant Palette**:
   - Primary Dark Navy: `#051026` / `#081734`
   - Light Backgrounds: `#ffffff` / `#f8fafc`
   - Dark Text & Headings: `#081734`
   - Muted Subtitle Text: `#4a5568` / `#718096`

2. **Gold Accent Allocation Rule**:
   - **Strict ~15–20% Allocation**: Gold (`#d4a053`) is strictly reserved for subtle micro-accents (e.g. small 6px dot indicators, 3px line dividers, active timeline node centers). Solid gold fills, large gold gradients, or heavy gold borders are avoided to preserve a modern executive feel.

3. **Logo Asset Directive**:
   - Primary official emblem logo asset: [`/PAGE-favicon.png`](file:///d:/PAGE-NATIONAL/frontend/public/PAGE-favicon.png).

4. **Outer Layout Scoping**:
   - Outer layout `(landing-page)/layout.tsx` automatically renders the top `<Navbar />` and bottom `<Footer />`. Individual subpage routes must **not** render local `<Navbar />` or footer elements to prevent duplication.

5. **Hero Headers & Background Grayscale Effects**:
   - **Main About Hub (`/about`)**: Uses `/about-bg.jpg` styled with horizontal image flip (`transform: scaleX(-1);`), grayscale contrast filter (`filter: grayscale(100%) contrast(1.1) brightness(1.08); opacity: 0.38;`), and smooth linear gradient overlay matching the homepage hero section.
   - **Subpages (`history`, `logo`, `officers`, `cbl`, `sec`, `bir`)**: Render dark navy headers with crisp white text (`#ffffff`), 1px bottom borderlines, and soft subtle divider drop shadows.

---

## 🗄️ Database Schema & Models (`prisma/schema.prisma`)

The database uses PostgreSQL via Prisma ORM. Key tables include:
- **`users`**: Core credentials and profiles for administration, members, and organizations.
- **`article_submissions`**: Academic/journal articles submitted by organizations for admin review.
- **`messages` & `message_attachments`**: Live dashboard/messaging system records and documents.
- **`posts` & `post_attachments`**: Announcements, news, and library posts managed by administrative users.
- **`about_page_sections` & `about_page_documents`**: Dynamic content segments and attached documents for public display on the About page.
- **`about_page_officers`**: Administrative listing of officers displayed on the Board of Officers view.
- **`cbl_articles` & `cbl_governance_documents`**: Articles and download files related to Constitution & By-Laws.
- **`historical_records`**: Milestones defining PAGE's organization history timeline.
- **`page_logos`**: Timestamps and asset paths for brand/logo iterations.
- **`NationalOfficer`**: Model for storing and managing board officers.
- **`SecRegistration`**: Model storing official SEC registration items and files.
- **`BirCertification`**: Model storing official BIR tax exemption certification records and files.
- **`Chapter` & related models** (`ChapterImage`, `ChapterDocument`, `ChapterOfficer`, `ChapterActivity`, `ChapterAnnouncement`): Models for storing regional chapter details, documents, active officers, events/activities, announcements, and image galleries.
- **`Convention` & related models** (`ConventionAttachment`, `ConventionSchedule`, `ConventionSpeaker`): Models for scheduling, materials, announcements, and speaker profiles for PAGE national conventions.
- **`MembershipApplication` & `MembershipApplicationDocument`**: Multi-step online membership applications (`LIFE`, `REGULAR`, `ASSOCIATE`, `INSTITUTIONAL`), review status progression (`draft`, `submitted`, `under_review`, `approved`, `rejected`), JSON payload chunks for applicant details, and associated supporting document attachments.
- **`user_activities`**: Action audit logs for administrators.

---

## 🛠️ Technology Stack & Dependencies

### 1. Backend (`backend-nest`)
- **Framework**: [NestJS 11](https://nestjs.com/) (Node.js framework)
- **Runtime**: Node.js
- **Language**: TypeScript (v5.7.3)
- **Database ORM**: [Prisma 7](https://www.prisma.io/) (v7.8.0)
- **Database Engine**: PostgreSQL
- **Key Backend Dependencies**:
  - `@nestjs/common`, `@nestjs/config`, `@nestjs/core`, `@nestjs/platform-express`: NestJS framework core and config injection.
  - `@prisma/client`: Auto-generated database client query builder.
  - `@prisma/adapter-pg`, `pg`: PostgreSQL database client integration.
  - `@supabase/supabase-js`: Integration with Supabase Storage for secure static uploads.
  - `bcryptjs`: Password hashing utility.
  - `class-validator` & `class-transformer`: Input schema verification and data transfer object (DTO) validation.
  - `cloudinary`: Image and media CDN asset hosting.
  - `dotenv`: Local environment configuration variables management.

---

### 2. Frontend (`frontend`)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components)
- **UI Library**: React 19
- **Language**: TypeScript (v5)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/postcss`)
- **Key Frontend Dependencies**:
  - `framer-motion`: Animation suite for smooth page/modal transitions.
  - `lucide-react`: Modern SVG vector icons framework.
  - `@fortawesome/react-fontawesome`: FontAwesome icon integration.
  - `recharts`: D3-based charting layout library for dashboard usage.
  - `goey-toast` & `react-toastify`: Interface notifications and alert pop-ups.
  - `pdf-lib`: Dynamic PDF parsing, field filling (AcroForm), and document creation on the client side.
