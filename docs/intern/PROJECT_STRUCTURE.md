# Project structure — intern reference

```
Planitt-Learn/
│
├── .env.example             ← Copy to .env.local (everyone)
├── docs/
│   ├── MENTOR_CHECKLIST.md  ← For mentors (not your daily doc)
│   └── intern/
│       ├── README.md        ← Start here
│       ├── TASKS.md         ← Your sprint tasks
│       └── PROJECT_STRUCTURE.md  ← This file
│
├── src/
│   ├── app/                 ← Pages and API routes (Next.js App Router)
│   ├── components/          ← Reusable UI
│   ├── context/             ← React context (auth state)
│   ├── hooks/               ← Custom hooks
│   └── lib/                 ← Business logic, catalog, utilities
│
├── package.json
└── README.md
```

---

## `src/app/` — pages & API

| Path | Type | Purpose |
|------|------|---------|
| `page.tsx` | Page | Home — "My learning" dashboard |
| `login/page.tsx` | Page | Sign-in (dev user button in intern mode) |
| `courses/[courseId]/page.tsx` | Page | Course hub — modules, progress bar |
| `courses/.../[lessonId]/page.tsx` | Page | Lesson player |
| `api/auth/dev-login/route.ts` | API | Intern dev sign-in (standalone only) |
| `api/auth/me/route.ts` | API | Current user profile |
| `api/auth/logout/route.ts` | API | Clear session cookies |
| `api/payments/me/history/route.ts` | API | Enrollment data (mocked in intern mode) |
| `api/health/route.ts` | API | Health check |

**Intern rule:** Edit pages under `courses/` freely. Do **not** change `api/auth/*` or `api/payments/*` without mentor approval.

---

## `src/components/`

| File | Purpose |
|------|---------|
| `layout/LearnShell.tsx` | Top nav, logout, "Buy courses" link |
| `learn/MyCoursesSection.tsx` | Dashboard — enrolled vs locked courses |

---

## `src/lib/` — core logic

| File | Purpose | Intern edits? |
|------|---------|---------------|
| `catalog/course-content.ts` | **All course content** — modules, lessons, markdown | ✅ Primary work area |
| `catalog/courses.ts` | Types, helpers, exports | ❌ Types/helpers only |
| `learning/progress.ts` | Lesson completion in localStorage | ✅ With care |
| `learning/enrollment.ts` | Which courses user can access | ❌ Read only |
| `env.ts` | Environment variables (server) | ❌ |
| `dev-standalone.ts` | Mock auth for intern mode | ❌ |
| `security/*` | Cookies, rate limits, BFF proxy | ❌ |

---

## `src/context/` & `src/hooks/`

| File | Purpose |
|------|---------|
| `context/auth-context.tsx` | Login state, dev login, logout |
| `context/app-providers.tsx` | Wraps app with React Query + auth |
| `hooks/useEnrollment.ts` | Fetches enrolled course IDs |

---

## Data flow (intern mode)

```
.env.local
  LEARN_DEV_STANDALONE=true
  LEARN_DEV_MOCK_ENROLLMENTS=...
        │
        ▼
/login → POST /api/auth/dev-login → mock cookies
        │
        ▼
/ (dashboard) → useEnrollment()
        │         └─ GET /api/payments/me/history → { items: [] }
        │         └─ enrollment.ts merges LEARN_DEV_MOCK_ENROLLMENTS
        ▼
/courses/[id] → courses.ts content + progress.ts (localStorage)
```

---

## Course catalog shape

Defined in `src/lib/catalog/courses.ts`:

```
CourseDefinition
├── id          ← must match plan_id (e.g. learn-forex-master-track)
├── title, category, level, duration, blurb, outcomes
└── modules[]
    ├── id, title, summary
    └── lessons[]
        ├── id, title, durationMinutes, kind, summary
        └── content { markdown?, videoUrl?, externalUrl? }
```

---

## Styling

- **Tailwind CSS** — utility classes in components
- Global styles: `src/app/globals.css`
- Brand color class: `text-brand`, `bg-brand`
- Surface/card: `bg-surface`, `border-borderSubtle`

Match existing pages when adding UI.

---

## Middleware

`src/middleware.ts` redirects unauthenticated users to `/login`.

Public paths (no login): `/login`, `/api/auth/*`, `/api/health`.

You rarely need to touch this file.

---

## What is NOT in this repo (yet)

| Feature | Status | Requires |
|---------|--------|----------|
| PostgreSQL database | **Planned Phase 1** | `DATABASE_URL` |
| Admin panel | Planned Phase 1 | DB + `LEARN_ADMIN_EMAILS` |
| Video upload | Planned Phase 2 | DB + R2/S3 (`R2_*` env vars) |
| Quizzes / tests | Planned Phase 3 | DB |
| Leaderboard | Planned Phase 4 | DB |
| Server-side progress | Planned Phase 2 | DB |
| 75% video watch rule | Planned Phase 2 | DB + video player |

Current content lives in `courses.ts`. Current progress lives in browser localStorage.

**Full roadmap:** [docs/LMS_ARCHITECTURE.md](../LMS_ARCHITECTURE.md)  
**All env vars:** [docs/ENV_REFERENCE.md](../ENV_REFERENCE.md)
