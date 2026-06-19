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
│   │   ├── articles/         # Article/journal submission services & controllers
│   │   ├── auth/             # JWT/Token authentication, guards, roles decorator
│   │   ├── cloudinary/       # File upload service logic using Cloudinary
│   │   ├── common/           # Shared classes, interceptors, and utility functions
│   │   ├── dashboard/        # Dashboard stats and administration data handlers
│   │   ├── messages/         # Real-time messaging service between users and administrators
│   │   ├── posts/            # Announcement, news, and blog post management
│   │   ├── prisma/           # Prisma client instantiation module
│   │   ├── users/            # User profile data management
│   │   ├── app.module.ts     # Root module configuration
│   │   └── main.ts           # Entrypoint for NestJS application
│   ├── test/                 # Integration/E2E test files
│   ├── .env                  # Environment secrets (JWT secret, DB URL, Cloudinary configuration)
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
    │   │   ├── about/        # About Us page
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
    │   │   ├── approve-post/ # View to moderate draft posts
    │   │   ├── audit-log/    # Log page to monitor actions
    │   │   ├── components/   # Dashboard navigation and structure components
    │   │   ├── create-new-post/ # Post writing / publishing interface
    │   │   ├── lib/          # Helper modules
    │   │   ├── manage-users/ # Admin view to manage users and roles
    │   │   ├── membership-applications/ # Verification portal for new members
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

## 🛠️ Technology Stack & Dependencies

### 1. Backend (`backend-nest`)
- **Framework**: [NestJS 11](https://nestjs.com/) (Node.js framework)
- **Runtime**: Node.js
- **Language**: TypeScript (v5.7.3)
- **Database ORM**: [Prisma 7](https://www.prisma.io/) (v7.8.0)
- **Database Engine**: PostgreSQL
- **Key Backend Dependencies**:
  - `@nestjs/common`, `@nestjs/config`, `@nestjs/core`, `@nestjs/platform-express`: NestJS core and configuration.
  - `@prisma/client`: Auto-generated database client query builder.
  - `@prisma/adapter-pg`, `pg`: PostgreSQL database driver integration.
  - `bcryptjs`: Secure password hashing.
  - `class-validator` & `class-transformer`: Input schema validation and serialization for DTOs.
  - `cloudinary`: Media storage integration for uploaded assets (images, PDFs, documents).
  - `rxjs`: Reactive Extensions for JavaScript (NestJS asynchronous operation streams).
  - `jest` & `supertest`: Testing framework and HTTP assertion engine.

---

### 2. Frontend (`frontend`)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components)
- **UI Library**: React 19
- **Language**: TypeScript (v5)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/postcss`)
- **Key Frontend Dependencies**:
  - `framer-motion`: Smooth UI transitions and animations.
  - `lucide-react`: Modern vector icon library.
  - `@fortawesome/react-fontawesome` & `@fortawesome/free-solid-svg-icons`: SVG Icon rendering package.
  - `recharts`: D3-based charting library for displaying dashboard metrics.
  - `goey-toast` & `react-toastify`: Rich pop-up alerts and user notification toasts.
  - `eslint` & `eslint-config-next`: Linter configuration for code cleanliness.
