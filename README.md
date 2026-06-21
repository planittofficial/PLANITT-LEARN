# Planitt Learn 

**Planitt Learn** is the standalone learning portal for [Planitt](https://planitt.in) — a course consumption app where users watch lessons, track progress, and continue courses they purchased on the main website.

This repo was split out of the Planitt monorepo (`Planitt-inhouse/apps/learn`) so it can be developed and deployed independently. It runs on **port 3001**, separate from the main marketing/checkout site on port 3000.

---

## What this app does

| In scope | Out of scope |
|----------|--------------|
| Google sign-in (same Planitt account) | Course checkout / payments |
| Display enrolled courses on a dashboard | Creating or editing payment plans |
| Module list, lesson player, progress tracking | Admin CMS (content lives in code for now) |
| Gate content by payment history | Signal entitlements or trading features |

**Purchase flow:** users buy courses on the main website → payment is recorded in appbackend → this app reads payment history and unlocks matching courses.

**Content flow:** course curriculum is defined in `src/lib/catalog/courses.ts` → interns extend modules and lessons there.

### Roadmap: NPTEL-lite / Udemy-lite

The full vision (videos, quizzes, module tests, 75% watch rule, leaderboard, admin panel) **requires a dedicated Learn PostgreSQL database** and video object storage — separate from Planitt's main backend DB.

| Phase | Status | Key env |
|-------|--------|---------|
| **0 — Now** | Static catalog + localStorage | `.env.example` + optional `DATABASE_URL` |
| **1** | PostgreSQL + admin CRUD | `DATABASE_URL` — **schema in `prisma/schema.prisma`** |
| **2** | Video upload + watch tracking | `R2_*` / S3 |
| **3** | Lesson quizzes + module tests | DB |
| **4** | Dashboard + leaderboard | DB |

See **[docs/LMS_ARCHITECTURE.md](docs/LMS_ARCHITECTURE.md)** and **[docs/ENV_REFERENCE.md](docs/ENV_REFERENCE.md)**.

---

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS**
- **TanStack React Query** (enrollment / payment history)
- **Lucide React** (icons)

Auth tokens are stored in HTTP-only cookies. The Learn app acts as a **BFF (Backend-for-Frontend)** — browser calls `/api/*` routes, which proxy to Planitt appbackend server-side.

---

## Prerequisites

1. **Node.js 20+** and npm
2. Copy **`.env.example`** → **`.env.local`** (same setup for the whole team)

You do **not** need Planitt appbackend, Google OAuth, or Docker for Phase 0.

---

## Quick start

```bash
git clone <your-planitt-learn-repo-url>
cd Planitt-Learn
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) → **Sign in** → **Continue as dev user**.

**Important:** Restart `npm run dev` after editing `.env.local`.

Onboarding guide: [`docs/intern/README.md`](docs/intern/README.md) · Architecture: [`docs/LMS_ARCHITECTURE.md`](docs/LMS_ARCHITECTURE.md)

### Database setup (Supabase / PostgreSQL)

Prisma schema lives in `prisma/schema.prisma`. After setting `DATABASE_URL` in `.env.local`:

```bash
Copy-Item .env.local .env          # Prisma reads .env
npm run db:deploy                  # Create all tables in Supabase
npm run db:seed                    # Load course catalog into DB
```

Check connection: http://localhost:3001/api/health/db

Full schema reference: [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md)

**Supabase URL tip:** if your password contains `@`, encode it as `%40`.

---

## Local dev without payment

You do not need to complete a real checkout to test enrolled courses locally. In `.env.local` (dev only):

```env
LEARN_DEV_MOCK_ENROLLMENTS=learn-forex-master-track
```

Use comma-separated plan IDs. Available course IDs:

- `learn-indian-stocks-pro`
- `learn-forex-master-track`
- `learn-fno-strategy-program`
- `learn-crypto-technical-edge`
- `learn-trader-psychology-intensive`
- `learn-all-courses-combo` — unlocks every course above

**Never set `LEARN_DEV_MOCK_ENROLLMENTS` in production.**

---

## Project structure

```
Planitt-Learn/
├── src/
│   ├── app/                          # Next.js App Router pages & API routes
│   │   ├── page.tsx                  # Home — "My learning" dashboard
│   │   ├── login/page.tsx            # Google sign-in
│   │   ├── courses/
│   │   │   ├── [courseId]/page.tsx   # Course hub (modules + progress)
│   │   │   └── [courseId]/[moduleId]/[lessonId]/page.tsx  # Lesson player
│   │   └── api/
│   │       ├── auth/                 # google, me, logout, refresh
│   │       ├── payments/me/history/  # BFF proxy → appbackend
│   │       └── health/
│   ├── components/
│   │   ├── layout/LearnShell.tsx     # Nav shell (logo, logout, buy link)
│   │   └── learn/MyCoursesSection.tsx
│   ├── context/
│   │   ├── auth-context.tsx          # Client auth state
│   │   └── app-providers.tsx
│   ├── hooks/
│   │   └── useEnrollment.ts          # Fetches payment history → enrolled course IDs
│   └── lib/
│       ├── catalog/course-content.ts # ★ Course catalog — main work area
│       ├── catalog/courses.ts        # Types, helpers, exports
│       ├── learning/
│       │   ├── enrollment.ts         # Derives enrolled courses from payments
│       │   └── progress.ts           # localStorage lesson completion
│       ├── security/                   # Auth cookies, BFF proxy, rate limits
│       └── env.ts                    # Server/client env helpers
├── .env.example
├── package.json
└── README.md
```

---

## Where to work

### Primary file: `src/lib/catalog/course-content.ts`

This file defines every course, module, and lesson. The `id` on each course **must match** the `plan_id` in appbackend (e.g. `learn-forex-master-track`).

Each lesson has a `kind`:

| Kind | Content field | Notes |
|------|---------------|-------|
| `article` | `content.markdown` | Rendered as simple markdown (headings + paragraphs) |
| `video` | `content.videoUrl` | Placeholder for future video embed |
| `external` | `content.externalUrl` | Link out to external resource |

**Example — adding a module and lesson:**

```ts
{
  id: "fx-m3",
  title: "Risk Management",
  summary: "Position sizing and stop placement.",
  lessons: [
    {
      id: "fx-m3-l1",
      title: "Calculating position size",
      durationMinutes: 15,
      kind: "article",
      summary: "Risk per trade as a percentage of account.",
      content: {
        markdown: "## Position sizing\n\nNever risk more than 1–2% per trade.",
      },
    },
  ],
},
```

Several courses in the catalog have empty `modules: []` — those are ready for you to fill in.

### What not to change (without review)

- `src/lib/security/*` — auth, cookies, BFF proxy
- `src/app/api/auth/*` — login flow
- Enrollment logic in `src/lib/learning/enrollment.ts` — ties into real payments

UI tweaks and new lesson types are fine; discuss architectural changes with your mentor first.

---

## How key flows work

### Authentication

```
Browser → Google Sign-In button → POST /api/auth/google
       → appbackend /api/v1/auth/google
       → HTTP-only cookies (access + refresh tokens)
       → middleware checks session hint cookie on protected routes
```

Users sign in with the **same Google account** as the main Planitt site. Unauthenticated visitors are redirected to `/login`.

### Enrollment (course access)

Access is derived from **payment history**, not trading signal entitlements:

1. Client calls `GET /api/payments/me/history` (BFF proxy)
2. `enrolledCourseIdsFromTransactions()` filters transactions where:
   - `plan_id` starts with `learn-`
   - `status === "paid"`
3. `learn-all-courses-combo` expands to all course IDs

If a user is not enrolled, course and lesson pages show a link to buy on the main website.

### Progress tracking

Lesson completion is stored in **browser localStorage** keyed by user ID + course ID. There is no server-side progress API yet — marking a lesson complete updates local state only.

---

## Architecture (ecosystem view)

```
Main website (:3000)              Learn portal (:3001)
─────────────────────             ───────────────────────────
/learn checkout ──Razorpay──► appbackend (:8000)
                                    ▲
Learn login ──Google──► Learn BFF ──┘
Learn enrollment ◄── GET /payments/me/history
Course content ◄── courses.ts (in this repo)
```

---

## Routes

| Route | Auth required | Purpose |
|-------|---------------|---------|
| `/` | Yes | My Courses dashboard |
| `/login` | No | Google sign-in |
| `/courses/[courseId]` | Yes | Module list + progress bar |
| `/courses/[courseId]/[moduleId]/[lessonId]` | Yes | Lesson player + mark complete |
| `/api/health` | No | Health check |

---

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Required | Description |
|----------|----------|-------------|
| `APPBACKEND_URL` | Yes (server) | Planitt appbackend URL. Default in dev: `http://127.0.0.1:8000` |
| `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Yes | Google OAuth web client ID. Add `http://localhost:3001` to authorized origins |
| `NEXT_PUBLIC_MAIN_WEBSITE_URL` | No | Main Planitt site for checkout links. Default: `http://localhost:3000` |
| `LEARN_DEV_MOCK_ENROLLMENTS` | No (dev only) | Comma-separated plan IDs to simulate enrollment without payment |

`APPBACKEND_URL` is server-only (no `NEXT_PUBLIC_` prefix) — the browser never talks to appbackend directly.

---

## Scripts

```bash
npm run dev        # Dev server at http://localhost:3001
npm run typecheck  # TypeScript check (no emit)
npm run build      # Production build
npm run start      # Run production build on port 3001
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Google sign-in button missing | Set `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env.local` and restart dev server |
| "Auth service unavailable" | Ensure appbackend is running at `APPBACKEND_URL` |
| No courses after login | Add mock enrollment in `.env.local`, or complete checkout on main site |
| Changes to `.env.local` ignored | Restart `npm run dev` — Next.js reads env at startup |
| Course page says "not enrolled" | Course `id` in `courses.ts` must exactly match the paid `plan_id` |

---

## Repo notes

- **Standalone:** no dependency on monorepo `packages/*` — all env and utilities live in this repo
- **Educational disclaimer:** all course UI includes "not investment advice" copy — keep it on new pages
- **BFF v1:** payment history proxy is GET-only; do not add write operations to the BFF without security review

---

## Questions?

Ask your mentor about appbackend setup, Google OAuth credentials, or deployment. For course content structure, start with `src/lib/catalog/courses.ts` and the lesson player at `src/app/courses/[courseId]/[moduleId]/[lessonId]/page.tsx`.
