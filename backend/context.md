# PAGE National - Fullstack Project Documentation

Welcome to the **PAGE National** fullstack web application. This document outlines the project's technical architecture, tech stack, database schemas, API routes, and detailed directory structures for both the frontend and backend.

## 🛠️ Tech Stack Overview

The application is split into a robust **Laravel 13 REST API backend** and a dynamic, interactive **Next.js 16 (App Router) frontend**, glued together with structured authentication tokens and custom services.

### Backend (API Server)
- **Core Framework:** [Laravel 13.x](file:///d:/PAGE-NATIONAL/backend/composer.json)
- **Language:** PHP ^8.3
- **Primary Database:** PostgreSQL (Hosted on **Supabase** cloud database cluster)
- **Storage & Media Delivery:** **Cloudinary** (Configured via [CloudinaryService.php](file:///d:/PAGE-NATIONAL/backend/app/Services/CloudinaryService.php))
- **Testing Engine:** **Pest PHP** framework
- **Custom Authentication:** Custom bearer API-token validation via [AuthenticateApiToken.php](file:///d:/PAGE-NATIONAL/backend/app/Http/Middleware/AuthenticateApiToken.php) middleware.
- **Authorization Model:** Custom Role-Based Access Control (RBAC) via [RequireRole.php](file:///d:/PAGE-NATIONAL/backend/app/Http/Middleware/RequireRole.php) middleware. Roles supported:
  - `admin` — Total system oversight (user moderation, post validation, audit log view).
  - `organization` — Entity representatives (submitting academic articles, publishing newsletters/announcements).
  - `member` — Regular users (interact, view content).
  - `reviewer` — Post and submission checkers.

### Frontend (User Interface)
- **Core Framework:** **Next.js 16.x** (App Router architecture)
- **Libraries & Component Renders:** React ^19.2.4 & React DOM ^19.2.4
- **Language:** TypeScript ^5.x
- **Styling Engine:** **Tailwind CSS v4.0** (Loaded via CSS imports and the post-css toolchain) + Custom page-level Vanilla CSS stylesheets.
- **Micro-Animations:** **Framer Motion** ^12.40.0
- **Data Visualizations:** **Recharts** (Interactive administrative dashboard graphs)
- **Icon Libraries:** Lucide React & FontAwesome (Free Regular & Solid)
- **Toast Notifications:** `goey-toast` (A custom animated elastic notification bubble) & `react-toastify`
- **Networking:** Custom HTTP Fetch wrapper with local storage bearer token integration ([api-client.ts](file:///d:/PAGE-NATIONAL/frontend/app/lib/api-client.ts))

---

## 🗄️ Database Schema & Models

The system architecture utilizes standard relational tables mapped via Eloquent models:

1. **Users** (`users` table): Stores authentication records, user states (`active`, `inactive`), universities, and roles (`admin`, `organization`, `member`, `reviewer`).
2. **Posts** (`posts` table): Handles blog posts, announcements, and news articles with a moderation workflow (`draft`, `pending`, `approved`, `rejected`, `published`, `scheduled`).
3. **Post Attachments** (`post_attachments` table): Maps files (images, documents) uploaded to Cloudinary to specific Posts.
4. **Article Submissions** (`article_submissions` table): Academic article and research submissions by member organizations.
5. **User Activities** (`user_activities` table): Audit logs tracking actions performed by admins and users.
6. **Messages & Attachments** (`messages` and `message_attachments` tables): Direct and group messages inside the dashboard portal.

---

## 🔌 API Route Catalog

Defined in [backend/routes/api.php](file:///d:/PAGE-NATIONAL/backend/routes/api.php), routes are split into public access and protected access layers:

### Public Routes (No Authentication Required)
| HTTP Method | Route | Controller Method | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/login` | `AuthController@login` | User login (returns API token) |
| `POST` | `/api/register` | `AuthController@register` | Sign up new member account |
| `POST` | `/api/forgot-password` | `AuthController@forgotPassword` | Reset link trigger |
| `POST` | `/api/reset-password` | `AuthController@resetPassword` | Password update execution |
| `GET` | `/api/public/posts` | `PostController@index` | Fetch all published blog/news posts |

### Authenticated Routes (Requires Bearer Token)
| HTTP Method | Route | Controller Method | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/logout` | `AuthController@logout` | Any authenticated | Revokes active API token |
| `GET` | `/api/me` | `AuthController@me` | Any authenticated | Returns active session user |
| `GET` | `/api/posts` | `PostController@index` | Any authenticated | List posts accessible to user |
| `POST` | `/api/posts` | `PostController@store` | Any authenticated | Submit a new post (draft or pending) |
| `PUT` | `/api/posts/{id}` | `PostController@update` | Any authenticated | Edit existing post owned by user |
| `DELETE` | `/api/posts/{id}` | `PostController@destroy` | Any authenticated | Delete post owned by user |
| `GET` | `/api/articles` | `ArticleSubmissionController@index` | Any authenticated | Fetch academic article submissions |
| `POST` | `/api/articles` | `ArticleSubmissionController@store` | Any authenticated | Upload/Submit research article |
| `GET` | `/api/messages` | `MessageController@index` | Any authenticated | List conversation channels |
| `GET` | `/api/messages/{id}` | `MessageController@show` | Any authenticated | Fetch messages for specific chat channel |
| `POST` | `/api/messages` | `MessageController@store` | Any authenticated | Send a direct message or attachment |
| `GET` | `/api/org/metrics` | `DashboardController@orgMetrics` | `organization`, `admin` | Organization metrics |
| `GET` | `/api/admin/metrics` | `DashboardController@adminMetrics` | `admin` | Platform aggregate statistics |
| `POST` | `/api/posts/{id}/approve`| `PostController@approve` | `admin` | Approve pending submission |
| `POST` | `/api/posts/{id}/reject` | `PostController@reject` | `admin` | Reject pending submission |
| `GET` | `/api/admin/users` | `UserManagementController@index` | `admin` | View all users and accounts |
| `PATCH` | `/api/admin/users/{id}`| `UserManagementController@update` | `admin` | Update user roles or statuses |
| `DELETE` | `/api/admin/users/{id}`| `UserManagementController@deactivate` | `admin` | Suspend or deactivate account |
| `GET` | `/api/admin/users/{id}/activities` | `UserManagementController@activities` | `admin` | View specific user audit logs |

---

## 📂 Project Directory Structure

Below is the directory structure layout for both directories in the root workspace.

### 📁 Backend (Laravel 13 API)
```
backend/
├── app/                                # Laravel Application Code
│   ├── Http/
│   │   ├── Controllers/                # Controller endpoints handling HTTP inputs
│   │   │   ├── ArticleSubmissionController.php
│   │   │   ├── AuthController.php
│   │   │   ├── Controller.php
│   │   │   ├── DashboardController.php
│   │   │   ├── MessageController.php
│   │   │   ├── PostController.php
│   │   │   └── UserManagementController.php
│   │   └── Middleware/                 # Custom route access filters
│   │       ├── AuthenticateApiToken.php
│   │       └── RequireRole.php
│   ├── Models/                         # Eloquent Database ORM Models
│   │   ├── ArticleSubmission.php
│   │   ├── Message.php
│   │   ├── MessageAttachment.php
│   │   ├── Post.php
│   │   ├── PostAttachment.php
│   │   ├── User.php
│   │   └── UserActivity.php
│   ├── Providers/                      # Core configuration providers
│   │   └── AppServiceProvider.php
│   └── Services/                       # External API / Business logic wrappers
│       └── CloudinaryService.php
├── bootstrap/                          # Framework kernel loader files
│   ├── app.php
│   └── providers.php
├── config/                             # Domain-specific configuration files (auth, database, session, cache)
├── database/
│   ├── factories/                      # Mock generators for seed database
│   ├── migrations/                     # Sequential schema setup files
│   └── seeders/                        # Fills database tables with default/mock values
│       └── DatabaseSeeder.php
├── public/                             # Public gateway entrypoint (index.php)
├── resources/                          # View blades and localized configurations
├── routes/                             # API, Web, and Console endpoint maps
│   ├── api.php
│   ├── console.php
│   └── web.php
├── storage/                            # Compiled engine logs, caches, and temp uploads
├── tests/                              # Automated PHP test cases
├── .env.example                        # Base database structure keys
├── composer.json                       # PHP Dependencies and autoloader config
├── vite.config.js                      # Build configurations
└── phpunit.xml                         # Testing environment setups
```

### 📁 Frontend (Next.js 16 UI)
```
frontend/
├── app/                                # Next.js App Router root layout and paths
│   ├── (landing-page)/                 # Layout grouping for visitor pages
│   │   ├── (home)/
│   │   │   ├── home-page.css           # Styling for landing homepage
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   ├── about-page.css          # Styling for organization info page
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   ├── contact.css             # Contact forms and inquiries page
│   │   │   └── page.tsx
│   │   └── news/
│   │       ├── [slug]/                 # Dynamic route for viewing post detail pages
│   │       │   ├── news-slug.css
│   │       │   └── page.tsx
│   │       ├── news.css
│   │       └── page.tsx
│   ├── admin-dashboard/                # Admin Panel panel layouts
│   │   ├── approve-post/               # View and approve pending publisher queue
│   │   │   ├── approve-post.css
│   │   │   └── page.tsx
│   │   ├── audit-log/                  # Activity dashboard trackers
│   │   │   ├── audit-log.css
│   │   │   └── page.tsx
│   │   ├── components/                 # Panel navigation, graphics and controls
│   │   │   ├── AdminHeader.tsx (and .module.css)
│   │   │   ├── AdminNotifications.tsx (and .module.css)
│   │   │   ├── AdminSidebar.tsx (and .module.css)
│   │   │   ├── AdminSidebarLayout.tsx (and .module.css)
│   │   │   ├── ChartCard.tsx (and .module.css)
│   │   │   └── ToastProvider.tsx
│   │   ├── create-new-post/            # Create post directly from admin
│   │   │   ├── create-new-post.css
│   │   │   └── page.tsx
│   │   ├── lib/
│   │   │   └── adminNotifications.ts
│   │   ├── manage-users/               # Activate, deactivate and verify platform users
│   │   │   ├── manage-users.css
│   │   │   └── page.tsx
│   │   ├── view-messages/              # Message center dashboard
│   │   │   ├── view-messages.css
│   │   │   └── page.tsx
│   │   ├── admin-dashboard.css
│   │   └── page.tsx
│   ├── org-dashboard/                  # Partner Organization Dashboards
│   │   ├── article-submission/         # Submits academic research documents
│   │   │   ├── article-submission.css
│   │   │   └── page.tsx
│   │   ├── create-post/                # Submits news draft posts
│   │   │   ├── create-post.css
│   │   │   └── page.tsx
│   │   ├── org-dashboard.css
│   │   └── page.tsx
│   ├── admin-login/                    # Portal logins for administrators
│   │   ├── admin-login.css
│   │   └── page.tsx
│   ├── create-account/                 # Portal signup gateway for member organizations
│   │   └── page.tsx
│   ├── forgot-password/                # General reset password form layout
│   │   └── page.tsx
│   ├── member-login/                   # Portal logins for general members
│   │   ├── member-login.css
│   │   └── page.tsx
│   ├── org-login/                      # Portal logins for organizations
│   │   ├── org-login.css
│   │   └── page.tsx
│   ├── lib/                            # Project shared utils
│   │   ├── api-client.ts               # Custom authenticated Axios-like fetch handler
│   │   └── fontawesome-icons.ts
│   ├── globals.css                     # Main entry CSS including Tailwind base directives
│   └── layout.tsx                      # Main Next.js document DOM structure
├── public/                             # Public static asset configurations
│   ├── PAGE-logo.jpg
│   └── PAGE-logo.svg
├── eslint.config.mjs                   # Code quality styling guidelines
├── next-env.d.ts                       # Next.js custom typings loader
├── next.config.ts                      # Core Next.js router configurations
├── package.json                        # Node script maps & component packages
├── tsconfig.json                       # TypeScript compiler preferences
└── README.md
```

---