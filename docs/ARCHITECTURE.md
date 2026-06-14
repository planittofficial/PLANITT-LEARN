# Planitt Learning Portal — Production Architecture

Senior architecture blueprint for parallel development across three developers with minimal merge conflicts.

**Product boundary:** This app does **not** process payments. Users buy on the main Planitt website → main backend records payment → this portal verifies enrollment → serves content only.

---

## 1. System context

```
┌─────────────────────┐     purchase      ┌──────────────────────┐
│  Main Planitt Site  │ ───────────────►  │  Main Backend (BFF)  │
│  (checkout)         │                   │  auth + payments     │
└─────────────────────┘                   └──────────┬───────────┘
                                                     │
              Google OAuth (same account)            │ payment history
              enrollment webhook (future)            │
                                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              Planitt Learning Portal (this repo)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Student      │  │ Admin        │  │ PostgreSQL (Learn DB)  │ │
│  │ Portal       │  │ Portal       │  │ Prisma                 │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Concern | Owner system |
|---------|--------------|
| Payment / Razorpay | Main website + main backend |
| Google identity | Main backend (BFF proxy in Learn) |
| Course content, progress, quizzes | **Learn DB** |
| Video files | Object storage (R2/S3) — metadata in Learn DB |

---

## 2. Complete folder structure

```
Planitt-Learn/
│
├── prisma/
│   ├── schema.prisma              # Single schema — Lead owns merges
│   ├── migrations/                # Lead reviews all migrations
│   └── seed.ts
│
├── docs/
│   ├── ARCHITECTURE.md            # This file
│   ├── DATABASE_SCHEMA.md
│   ├── ENV_REFERENCE.md
│   └── intern/
│
├── public/
│   └── assets/
│
└── src/
    │
    ├── app/                                    # ROUTING ONLY — thin pages
    │   ├── layout.tsx                          # Root providers
    │   ├── globals.css
    │   │
    │   ├── (student)/                          # Student portal (URL: /)
    │   │   ├── layout.tsx                      # LearnShell, auth gate
    │   │   ├── page.tsx                        # Dashboard / My Courses
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   ├── courses/
    │   │   │   └── [courseId]/
    │   │   │       ├── page.tsx                # Course hub (modules)
    │   │   │       └── [moduleId]/
    │   │   │           └── [lessonId]/
    │   │   │               └── page.tsx        # Lesson player + quiz CTA
    │   │   ├── leaderboard/
    │   │   │   └── page.tsx
    │   │   └── profile/
    │   │       └── page.tsx
    │   │
    │   ├── (admin)/                            # Admin portal (URL: /admin/*)
    │   │   └── admin/
    │   │       ├── layout.tsx                  # AdminShell, role gate
    │   │       ├── page.tsx                    # Admin dashboard
    │   │       ├── courses/
    │   │       │   ├── page.tsx
    │   │       │   ├── new/page.tsx
    │   │       │   └── [courseId]/
    │   │       │       ├── page.tsx
    │   │       │       └── edit/page.tsx
    │   │       ├── modules/
    │   │       │   └── [moduleId]/page.tsx
    │   │       ├── lessons/
    │   │       │   └── [lessonId]/page.tsx
    │   │       ├── quizzes/
    │   │       │   ├── lessons/[lessonId]/page.tsx
    │   │       │   └── modules/[moduleId]/page.tsx
    │   │       ├── students/
    │   │       │   ├── page.tsx
    │   │       │   └── [userId]/page.tsx
    │   │       ├── leaderboard/
    │   │       │   └── page.tsx
    │   │       └── analytics/
    │   │           └── page.tsx
    │   │
    │   └── api/
    │       ├── health/
    │       │   ├── route.ts
    │       │   └── db/route.ts
    │       └── v1/                             # Versioned public API
    │           ├── auth/
    │           │   ├── google/route.ts
    │           │   ├── me/route.ts
    │           │   ├── refresh/route.ts
    │           │   ├── logout/route.ts
    │           │   └── dev-login/route.ts
    │           ├── enrollment/
    │           │   ├── me/route.ts             # Enrolled course IDs
    │           │   └── verify/[courseId]/route.ts
    │           ├── courses/
    │           │   ├── route.ts                # GET catalog (published)
    │           │   └── [courseId]/
    │           │       ├── route.ts
    │           │       └── modules/route.ts
    │           ├── lessons/
    │           │   └── [lessonId]/
    │           │       ├── route.ts
    │           │       └── progress/route.ts   # POST watch heartbeat
    │           ├── quizzes/
    │           │   ├── lessons/[lessonId]/
    │           │   │   ├── route.ts            # GET quiz
    │           │   │   └── attempts/route.ts   # POST submit
    │           │   └── modules/[moduleId]/
    │           │       ├── route.ts
    │           │       └── attempts/route.ts
    │           ├── leaderboard/
    │           │   └── [courseId]/route.ts
    │           ├── profile/
    │           │   └── me/route.ts
    │           ├── webhooks/
    │           │   └── enrollment/route.ts     # From main backend
    │           └── admin/                      # Admin-only APIs
    │               ├── courses/
    │               │   ├── route.ts            # POST, GET
    │               │   └── [courseId]/route.ts # PATCH, DELETE
    │               ├── modules/
    │               ├── lessons/
    │               ├── uploads/
    │               │   └── presign/route.ts    # Video upload URL
    │               ├── quizzes/
    │               ├── analytics/
    │               └── students/
    │
    ├── features/                               # Feature modules (domain UI + logic)
    │   ├── auth/
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   └── index.ts
    │   ├── enrollment/
    │   │   ├── components/                     # LockedCourseBadge, EnrollCTA
    │   │   ├── hooks/
    │   │   └── index.ts
    │   ├── student-dashboard/
    │   │   ├── components/
    │   │   └── index.ts
    │   ├── course-catalog/
    │   │   ├── components/                   # CourseCard, ModuleList
    │   │   └── index.ts
    │   ├── lesson-player/
    │   │   ├── components/                   # VideoPlayer, MarkdownLesson
    │   │   ├── hooks/                        # useWatchProgress
    │   │   └── index.ts
    │   ├── progress/
    │   │   ├── components/                   # ProgressBar, ModuleStats
    │   │   └── index.ts
    │   ├── quizzes/
    │   │   ├── components/                   # QuizForm, QuestionCard
    │   │   └── index.ts
    │   ├── leaderboard/
    │   │   ├── components/
    │   │   └── index.ts
    │   ├── profile/
    │   │   ├── components/
    │   │   └── index.ts
    │   ├── admin-dashboard/
    │   ├── admin-courses/
    │   ├── admin-modules/
    │   ├── admin-lessons/
    │   ├── admin-quizzes/
    │   ├── admin-students/
    │   └── admin-analytics/
    │
    ├── components/                             # Shared presentational UI
    │   ├── ui/                                 # Button, Input, Card, Skeleton…
    │   ├── layout/
    │   │   ├── student/                        # LearnShell, StudentNav
    │   │   └── admin/                          # AdminShell, AdminSidebar
    │   └── shared/                             # EmptyState, ErrorBoundary, Spinner
    │
    ├── services/                               # Server-side business logic ONLY
    │   ├── auth/
    │   │   ├── auth.service.ts
    │   │   └── session.service.ts
    │   ├── enrollment/
    │   │   ├── enrollment.service.ts         # verify access, sync from payment
    │   │   └── webhook.service.ts
    │   ├── courses/
    │   │   ├── course.service.ts
    │   │   ├── module.service.ts
    │   │   └── lesson.service.ts
    │   ├── progress/
    │   │   └── progress.service.ts           # 75% rule, completion
    │   ├── quizzes/
    │   │   ├── lesson-quiz.service.ts
    │   │   └── module-test.service.ts
    │   ├── leaderboard/
    │   │   └── leaderboard.service.ts
    │   ├── analytics/
    │   │   └── analytics.service.ts
    │   ├── storage/
    │   │   └── video-storage.service.ts      # R2 presigned URLs
    │   └── users/
    │       └── user.service.ts
    │
    ├── lib/                                    # Infrastructure — no business rules
    │   ├── db/
    │   │   └── prisma.ts
    │   ├── security/
    │   │   ├── auth-cookies.ts
    │   │   ├── bff-proxy.ts
    │   │   ├── rate-limit.ts
    │   │   └── require-admin.ts
    │   ├── api/
    │   │   ├── response.ts                   # ok(), fail(), paginate()
    │   │   └── parse-body.ts
    │   ├── dev/
    │   │   └── standalone.ts
    │   └── env.ts
    │
    ├── hooks/                                  # Client React Query hooks
    │   ├── auth/
    │   │   └── use-auth.ts                     # wraps context
    │   ├── enrollment/
    │   │   └── use-enrollment.ts
    │   ├── courses/
    │   │   ├── use-courses.ts
    │   │   └── use-course-detail.ts
    │   ├── progress/
    │   │   └── use-lesson-progress.ts
    │   ├── quizzes/
    │   │   └── use-quiz-attempt.ts
    │   ├── leaderboard/
    │   │   └── use-leaderboard.ts
    │   └── admin/
    │       ├── use-admin-courses.ts
    │       └── use-admin-analytics.ts
    │
    ├── types/                                  # Shared TypeScript types
    │   ├── api.types.ts                        # ApiResponse<T>, Paginated
    │   ├── auth.types.ts
    │   ├── course.types.ts
    │   ├── progress.types.ts
    │   ├── quiz.types.ts
    │   └── admin.types.ts
    │
    ├── constants/
    │   ├── routes.ts                           # ROUTES.STUDENT.COURSES, etc.
    │   ├── enrollment.ts                       # COMBO_PLAN_ID, plan prefixes
    │   ├── progress.ts                         # DEFAULT_MIN_WATCH_PERCENT = 75
    │   └── quiz.ts                             # DEFAULT_PASSING_SCORE = 60
    │
    ├── validations/                            # Zod schemas — shared client + server
    │   ├── auth.schema.ts
    │   ├── course.schema.ts
    │   ├── lesson.schema.ts
    │   ├── progress.schema.ts
    │   ├── quiz.schema.ts
    │   └── admin.schema.ts
    │
    ├── context/
    │   └── app-providers.tsx                   # QueryClient + AuthProvider
    │
    └── middleware.ts                           # Auth hints, /admin gate
```

---

## 3. Layer responsibilities

| Layer | Responsibility | Must NOT contain |
|-------|----------------|------------------|
| `app/**/page.tsx` | Compose features, fetch params, metadata | Business logic, Prisma calls |
| `features/*` | Domain UI, feature-specific hooks | Direct Prisma (use hooks → API) |
| `components/ui` | Dumb reusable UI | API calls, domain logic |
| `services/*` | Business rules, Prisma, external APIs | React, HTTP response objects |
| `app/api/**/route.ts` | HTTP: parse, auth, validate, call service, respond | Complex business logic |
| `lib/*` | Infra helpers | Domain rules |
| `hooks/*` | React Query + client state | Server-only code |
| `validations/*` | Zod schemas | — |
| `types/*` | Type definitions | Runtime logic |

**Data flow (student lesson progress example):**

```
LessonPage (app)
  → VideoPlayer (features/lesson-player)
    → useLessonProgress (hooks/progress)
      → POST /api/v1/lessons/:id/progress
        → route.ts validates body (validations/progress.schema)
          → progress.service.ts (75% rule, Prisma upsert)
            → PostgreSQL
```

---

## 4. Folder ownership matrix

### Lead Developer (Developer 1 — You)

| Folder / file | Owns |
|---------------|------|
| `src/middleware.ts` | Auth routing, session hints, admin path protection |
| `src/lib/security/**` | Cookies, BFF proxy, rate limits, admin guard |
| `src/lib/env.ts` | All env parsing |
| `src/lib/dev/**` | Local standalone dev mode |
| `src/services/auth/**` | Google BFF, session lifecycle |
| `src/services/enrollment/**` | Payment history sync, webhook, access checks |
| `src/app/api/v1/auth/**` | Auth routes |
| `src/app/api/v1/webhooks/**` | Enrollment webhooks |
| `src/app/api/v1/enrollment/**` | Enrollment verification API |
| `src/features/auth/**` | Auth context integration (review) |
| `prisma/schema.prisma` | **All schema changes** — others propose via PR |
| `prisma/migrations/**` | Review + apply |
| `.env.example`, deploy config | Production secrets strategy |
| `src/context/app-providers.tsx` | Global providers |

**Rule:** No one else merges Prisma migrations without your review.

---

### Gauri

| Folder / file | Owns |
|---------------|------|
| `src/app/(admin)/**` | All admin pages (thin shells) |
| `src/app/api/v1/admin/**` | Admin CRUD APIs |
| `src/app/api/v1/courses/**` | Public course read APIs |
| `src/app/api/v1/lessons/**` | Lesson + progress APIs |
| `src/app/api/v1/quizzes/**` | Quiz fetch + submit APIs |
| `src/app/api/v1/leaderboard/**` | Leaderboard APIs |
| `src/services/courses/**` | Course/module/lesson services |
| `src/services/progress/**` | Watch tracking, completion |
| `src/services/quizzes/**` | Scoring, pass/fail |
| `src/services/leaderboard/**` | Rank computation |
| `src/services/storage/**` | Video presigned upload |
| `src/services/analytics/**` | Admin analytics queries |
| `src/features/admin-*/**` | Admin feature UIs |
| `src/hooks/admin/**` | Admin React Query hooks |
| `src/validations/course|lesson|quiz|admin.*` | Admin + API validation schemas |

**Rule:** Gauri does **not** touch `lib/security`, `middleware`, or `prisma/schema` directly — opens PR and tags Lead.

---

### Sanvi

| Folder / file | Owns |
|---------------|------|
| `src/app/(student)/**` | All student pages (thin shells only) |
| `src/features/student-dashboard/**` | Dashboard UI |
| `src/features/course-catalog/**` | Course cards, module lists |
| `src/features/lesson-player/**` | Video/markdown player UI |
| `src/features/progress/**` | Progress bars, completion UI |
| `src/features/quizzes/**` | Quiz taking UI (not scoring logic) |
| `src/features/leaderboard/**` | Leaderboard display |
| `src/features/profile/**` | Profile page UI |
| `src/components/ui/**` | Shared buttons, cards, skeletons |
| `src/components/layout/student/**` | LearnShell, nav |
| `src/hooks/courses|progress|quizzes|leaderboard/**` | **Consumer hooks only** — calls Gauri APIs |
| `src/constants/routes.ts` | Route constants (with review) |

**Rule:** Sanvi **never** imports `@/lib/db/prisma` or `@/services/*` in client components. UI → hooks → API only.

---

## 5. Git branch strategy

```
main                          # Production-ready only
└── develop                   # Integration branch (daily merges)
    ├── lead/auth-enrollment
    ├── lead/webhook-sync
    ├── gauri/admin-courses-crud
    ├── gauri/progress-api
    ├── gauri/quiz-api
    ├── sanvi/student-dashboard
    ├── sanvi/lesson-player-ui
    └── sanvi/leaderboard-ui
```

| Branch prefix | Owner | Example |
|---------------|-------|---------|
| `lead/` | Developer 1 | `lead/enrollment-webhook` |
| `gauri/` | Gauri | `gauri/admin-lesson-upload` |
| `sanvi/` | Sanvi | `sanvi/course-hub-progress-ui` |

**Workflow:**

1. Branch from `develop`
2. PR → `develop` (not `main`)
3. Lead reviews all PRs touching `prisma/`, `middleware`, `lib/security/`
4. Gauri reviews Sanvi UI PRs for correct hook/API usage
5. Weekly: `develop` → `main` after smoke test

**Conflict hotspots (coordinate daily):**

- `prisma/schema.prisma` — Lead only
- `src/types/api.types.ts` — announce in Slack before edit
- `src/components/ui/*` — Sanvi owns, others request additions via PR
- `src/constants/routes.ts` — single PR owner at a time

---

## 6. Naming conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
| Page | `page.tsx` | `app/(student)/courses/[courseId]/page.tsx` |
| API route | `route.ts` | `app/api/v1/courses/[courseId]/route.ts` |
| Service | `{domain}.service.ts` | `progress.service.ts` |
| Hook | `use-{name}.ts` | `use-lesson-progress.ts` |
| Component | `PascalCase.tsx` | `CourseCard.tsx` |
| Validation | `{domain}.schema.ts` | `quiz.schema.ts` |
| Types | `{domain}.types.ts` | `course.types.ts` |

### Code

| Item | Convention |
|------|------------|
| React components | `PascalCase` |
| Functions / hooks | `camelCase` |
| Constants | `SCREAMING_SNAKE_CASE` |
| DB columns | `snake_case` (Prisma `@map`) |
| API routes | `kebab-case` URLs, `/api/v1/...` |
| Course IDs | `learn-{slug}` (matches payment `plan_id`) |
| Module/Lesson IDs | `{prefix}-m{n}`, `{prefix}-m{n}-l{n}` |

### API responses

```ts
// Success
{ ok: true, data: T }

// Error
{ ok: false, detail: string, code?: string }

// Paginated
{ ok: true, data: T[], meta: { page, pageSize, total } }
```

---

## 7. API folder structure (detailed)

```
app/api/v1/
├── auth/                    # Lead — Google BFF, cookies
├── enrollment/
│   ├── me/route.ts          # GET enrolled course IDs (student)
│   └── verify/[courseId]/   # GET { enrolled: boolean }
├── webhooks/
│   └── enrollment/route.ts  # POST from main backend (Lead)
├── courses/
│   ├── route.ts             # GET published catalog
│   └── [courseId]/
│       ├── route.ts         # GET course detail (gated)
│       └── modules/route.ts # GET modules + lessons tree
├── lessons/[lessonId]/
│   ├── route.ts             # GET lesson content (gated)
│   └── progress/route.ts    # GET + POST watch heartbeat
├── quizzes/
│   ├── lessons/[lessonId]/
│   │   ├── route.ts         # GET quiz questions (no answers)
│   │   └── attempts/route.ts
│   └── modules/[moduleId]/
│       ├── route.ts
│       └── attempts/route.ts
├── leaderboard/[courseId]/route.ts
├── profile/me/route.ts
└── admin/                   # All require admin role
    ├── courses/...
    ├── modules/...
    ├── lessons/...
    ├── uploads/presign/route.ts
    ├── quizzes/...
    ├── students/...
    └── analytics/overview/route.ts
```

**Auth on every student content route:**

```ts
// Pattern in route.ts
const user = await requireUser(request);
const enrolled = await enrollmentService.isEnrolled(user.id, courseId);
if (!enrolled) return fail("Not enrolled", 403);
```

---

## 8. Database module structure (Prisma)

Organize schema mentally (single `schema.prisma`, commented sections):

```
prisma/schema.prisma
├── // AUTH & USERS          → User
├── // CATALOG               → Course, Module, Lesson
├── // ASSESSMENTS           → LessonQuiz, ModuleTest
├── // ACCESS                → Enrollment, EnrollmentEvent
├── // LEARNING              → LessonProgress
├── // ASSESSMENT RESULTS    → QuizAttempt
├── // GAMIFICATION          → LeaderboardEntry
└── // ADMIN                 → AdminUser
```

**Service ↔ table mapping:**

| Service | Tables |
|---------|--------|
| `course.service` | Course, Module, Lesson |
| `enrollment.service` | Enrollment, EnrollmentEvent |
| `progress.service` | LessonProgress |
| `lesson-quiz.service` | LessonQuiz, QuizAttempt |
| `module-test.service` | ModuleTest, QuizAttempt |
| `leaderboard.service` | LeaderboardEntry, QuizAttempt, LessonProgress |

**Migration rule:** One migration per logical change. Name: `YYYYMMDDHHMMSS_add_lesson_quizzes`.

---

## 9. Reusable component structure

```
components/
├── ui/                         # Sanvi maintains (design system)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   ├── skeleton.tsx
│   ├── progress-bar.tsx
│   └── index.ts                # barrel export
│
├── layout/
│   ├── student/
│   │   ├── LearnShell.tsx
│   │   └── StudentNav.tsx
│   └── admin/
│       ├── AdminShell.tsx
│       └── AdminSidebar.tsx
│
└── shared/
    ├── EmptyState.tsx
    ├── ErrorMessage.tsx
    ├── LoadingGrid.tsx
    └── LockedOverlay.tsx       # "Purchase on Planitt" CTA
```

**Feature components stay in `features/`:**

```
features/course-catalog/components/CourseCard.tsx   # domain-specific
components/ui/card.tsx                            # generic wrapper
```

---

## 10. Coding guidelines to avoid conflicts

### Import boundaries

```
✅ app/page.tsx           → features/*, components/*
✅ features/*             → components/ui, hooks/*, types/*
✅ hooks/*                → types/*, lib/api client (fetch only)
✅ app/api/route.ts       → services/*, validations/*, lib/*
✅ services/*             → lib/db, types/*

❌ features/*             → services/* (server-only)
❌ components/ui/*        → features/*
❌ hooks/*                → prisma
❌ Sanvi client code      → lib/security internals
```

### Enrollment gate (single source of truth)

All content access goes through:

```ts
// services/enrollment/enrollment.service.ts
export async function assertEnrolled(userId: string, courseId: string): Promise<void>
export async function getEnrolledCourseIds(userId: string): Promise<string[]>
```

Sanvi UI uses `useEnrollment()` hook — never reimplements lock logic.

### Progress rule (single source of truth)

```ts
// services/progress/progress.service.ts
const COMPLETE_THRESHOLD = 75; // or from lesson.minWatchPercent
export async function recordWatchHeartbeat(userId, lessonId, payload): Promise<ProgressResult>
```

### Feature flags during parallel work

```ts
// constants/features.ts
export const FEATURES = {
  DB_COURSES: process.env.NEXT_PUBLIC_FEATURE_DB_COURSES === "true",
  QUIZZES: process.env.NEXT_PUBLIC_FEATURE_QUIZZES === "true",
};
```

Allows Sanvi to ship UI while Gauri finishes APIs (fallback to mock data).

### PR size limits

| Developer | Max PR scope |
|-----------|--------------|
| Lead | 1 system concern (auth OR webhook OR schema) |
| Gauri | 1 API domain (e.g. all progress routes + service) |
| Sanvi | 1 page or 1 feature folder |

### Shared file lock (weekly rotation)

| File | Primary editor this sprint |
|------|---------------------------|
| `types/api.types.ts` | Lead |
| `constants/routes.ts` | Sanvi |
| `components/ui/*` | Sanvi |
| `validations/*.schema.ts` | Gauri |

---

## 11. Migration path from current codebase

Current repo is Phase 0. Migrate incrementally:

| Phase | Lead | Gauri | Sanvi |
|-------|------|-------|-------|
| **A** | Move auth → `services/auth`, API → `v1/auth` | — | Route groups `(student)` |
| **B** | Enrollment service + webhook | Course read APIs from Prisma | Dashboard uses API |
| **C** | — | Admin CRUD + upload | Course/lesson pages from API |
| **D** | — | Progress + quiz APIs | Player + progress UI |
| **E** | — | Leaderboard API | Leaderboard UI |
| **F** | Production auth (disable standalone) | Admin analytics | Profile page |

Existing files map to new structure:

| Current | Target |
|---------|--------|
| `src/lib/catalog/course-content.ts` | Deprecated → `services/courses` + DB seed |
| `src/hooks/useEnrollment.ts` | `src/hooks/enrollment/use-enrollment.ts` |
| `src/components/learn/*` | `src/features/course-catalog/components/*` |
| `src/app/api/auth/*` | `src/app/api/v1/auth/*` |
| `src/lib/learning/enrollment.ts` | `src/services/enrollment/enrollment.service.ts` |

---

## 12. Environment variables by role

| Variable | Lead | Gauri | Sanvi |
|----------|------|-------|-------|
| `DATABASE_URL` | ✅ | ✅ | ✅ |
| `LEARN_DEV_STANDALONE` | ✅ | ✅ | ✅ |
| `APPBACKEND_URL` | ✅ staging | ❌ | ❌ |
| `LEARN_ENROLLMENT_WEBHOOK_SECRET` | ✅ | ❌ | ❌ |
| `LEARN_ADMIN_EMAILS` | ✅ | ✅ | ❌ |
| `R2_*` | ✅ | ✅ | ❌ |

---

## 13. Definition of done (per feature)

- [ ] Zod validation on API input
- [ ] Enrollment check on gated routes
- [ ] Service layer unit (no Prisma in route handler body)
- [ ] React Query hook for client fetch
- [ ] Loading + error + empty states (Sanvi)
- [ ] `npm run typecheck` passes
- [ ] No secrets in code
- [ ] PR reviewed by correct owner (see matrix above)

---

## Quick reference: who builds what

```
LEAD (Dev 1)          GAURI                    SANVI
─────────────         ─────────────            ─────────────
Auth / BFF            Admin panel              Student dashboard
Enrollment sync       All /api/v1/admin        Course / lesson pages
Webhooks              Progress API             Video player UI
Prisma schema         Quiz API                 Progress UI
Middleware            Leaderboard API          Quiz UI (display)
Security              CRUD services            Leaderboard UI
Deploy                Video upload API         components/ui
                      Analytics API            Responsive / skeletons
```

This structure keeps **three developers in separate directories** most of the time, converging only on typed contracts (`types/`, `validations/`, API response shapes) reviewed by the Lead.
