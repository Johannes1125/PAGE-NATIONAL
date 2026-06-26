# PAGE National Project Architecture & Structure

This document outlines the directory structure, tech stack, and dependencies of the **PAGE National** fullstack web application.

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
│   │   ├── cloudinary/       # File upload service logic using Cloudinary
│   │   ├── common/           # Shared classes, interceptors, and utility functions
│   │   ├── dashboard/        # Dashboard stats and administration data handlers
│   │   ├── historical-records/ # Historical milestones and timeline records management
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
    │   │   ├── about/        # About Us page, featuring detailed section routes:
    │   │   │   ├── bir/      # BIR Certification page
    │   │   │   ├── cbl/      # Constitution & By-Laws page
    │   │   │   ├── history/  # Historical Milestones page
    │   │   │   ├── logo/     # LOGO Description page
    │   │   │   ├── officers/ # Board of Officers page
    │   │   │   ├── sec/      # SEC Registration page
    │   │   │   └── page.tsx  # About Us main entry page
    │   │   ├── activities/   # Events and activities listings
    │   │   ├── chapters/     # Chapters page
    │   │   ├── components/   # Navbar, Lightbox and shared landing components
    │   │   ├── contact/      # Contact details & contact forms
    │   │   ├── convention/   # Convention info page
    │   │   ├── journals/     # Professional journals index and access
    │   │   ├── library/      # Public library and resource documents
    │   │   ├── membership/   # Membership sign-up information and structure
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
    │   │   ├── components/   # Dashboard navigation and structure components
    │   │   ├── create-new-post/ # Post writing / publishing interface
    │   │   ├── lib/          # Helper modules
    │   │   ├── manage-users/ # Admin view to manage users and roles
    │   │   ├── membership-applications/ # Verification portal for new members
    │   │   ├── national-officers/ # Separate national officers records manager
    │   │   └── view-messages/# Dashboard communication client
    │   ├── admin-login/      # Admin authentication page
    │   ├── org-dashboard/    # Dashboard layout for organizations
    │   │   ├── article-submission/ # Submit research papers/articles
    │   │   └── create-post/  # Compose local drafts
    │   ├── org-login/        # Organization login page
    │   ├── member-login/     # General member login page
    │   ├── create-account/   # New user registration flow
    │   ├── forgot-password/  # Password reset flow
    │   ├── lib/              # API Client (axios instance), types, FontAwesome setup
    │   ├── globals.css       # Tailwind stylesheets and baseline styles
    │   └── layout.tsx        # Top-level Next.js layout
    ├── public/               # Static assets (images, icons)
    ├── next.config.ts        # Next.js server configuration options
    ├── package.json          # Node packages and configuration
    ├── postcss.config.mjs    # Tailwind PostCSS configuration
    └── tsconfig.json         # TypeScript setup
```

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
- **`user_activities`**: Action audit logs for administrators.
- Other system metadata tables: `cache`, `cache_locks`, `failed_jobs`, `job_batches`, `jobs`, `sessions`, `migrations`, `password_reset_tokens`.

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
  - `rxjs`: Reactive Extensions for JavaScript.

---

### 2. Frontend (`frontend`)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components)
- **UI Library**: React 19
- **Language**: TypeScript (v5)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/postcss`)
- **Key Frontend Dependencies**:
  - `framer-motion`: Animation suite for smooth page/modal transitions.
  - `lucide-react`: Modern SVG vector icons framework.
  - `@fortawesome/react-fontawesome`, `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-solid-svg-icons`: SVG icon packs integration.
  - `recharts`: D3-based charting layout library for dashboard usage.
  - `goey-toast` & `react-toastify`: Interface notifications and alert pop-ups.
  - `eslint` & `eslint-config-next`: Static code quality review scripts.
