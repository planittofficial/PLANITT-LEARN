# Project structure — team reference

**Architecture (ownership, API layout, Git branches):** [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)  
**Your tasks:** [`TASKS.md`](./TASKS.md) — Sanvi (student UI) · Gauri (admin + APIs)

```
Alvest-Learn/
│
├── .env.example             ← Copy to .env.local (everyone)
├── docs/
│   ├── ARCHITECTURE.md      ← Full production structure (read this)
│   ├── MENTOR_CHECKLIST.md
│   └── intern/
│       ├── README.md
│       ├── TASKS.md
│       └── PROJECT_STRUCTURE.md
│
├── prisma/                  ← Lead owns schema; Gauri uses services
├── scripts/
│   └── scaffold-architecture.mjs
│
└── src/
    ├── app/
    │   ├── (student)/       ← Sanvi — URL: /, /login, /courses/...
    │   ├── (admin)/admin/   ← Gauri — URL: /admin/...
    │   └── api/
    │       ├── health/
    │       └── v1/          ← Versioned API
    ├── features/            ← Domain UI (sanvi/*, admin-* for Gauri)
    ├── components/
    │   ├── ui/              ← Sanvi — design system
    │   ├── layout/student/  ← Sanvi — LearnShell
    │   ├── layout/admin/    ← Gauri — AdminShell
    │   └── shared/
    ├── services/            ← Gauri (+ Lead for auth/enrollment)
    ├── hooks/               ← Consumer hooks (Sanvi), admin/ (Gauri)
    ├── lib/                 ← Infra — Lead owns security/env
    ├── types/
    ├── constants/
    └── validations/         ← Gauri
```

---

## `src/app/(student)/` — Sanvi

| Path | Purpose |
|------|---------|
| `page.tsx` | Home — "My learning" dashboard |
| `login/page.tsx` | Dev / Google sign-in |
| `courses/[courseId]/page.tsx` | Course hub — modules, progress |
| `courses/.../[lessonId]/page.tsx` | Lesson player |
| `leaderboard/page.tsx` | Leaderboard (placeholder) |
| `profile/page.tsx` | Profile (placeholder) |

**Sanvi rule:** Keep pages thin — compose from `features/*`. Do **not** change `api/v1/auth/*` or `api/v1/enrollment/*` without Lead approval.

---

## `src/app/(admin)/admin/` — Gauri

| Path | Purpose |
|------|---------|
| `page.tsx` | Admin dashboard |
| `courses/` | Course CRUD shells |
| `modules/[moduleId]/` | Module editor |
| `lessons/[lessonId]/` | Lesson editor |
| `quizzes/` | Quiz / module test editors |
| `students/` | Student list + detail |
| `leaderboard/`, `analytics/` | Admin views |

**Gauri rule:** Do **not** edit `lib/security/*`, `middleware.ts`, or `prisma/schema.prisma` without Lead review.

---

## `src/app/api/v1/` — API routes

| Path | Owner | Purpose |
|------|-------|---------|
| `auth/*` | Lead | Google BFF, dev-login, me, logout, refresh |
| `enrollment/me` | Lead | Enrolled course IDs (payment history) |
| `enrollment/preview` | Lead | Dev preview without login |
| `webhooks/enrollment` | Lead | Enrollment sync from main backend |
| `courses/*` | Gauri | Public course read APIs |
| `lessons/*` | Gauri | Lesson content + progress |
| `quizzes/*` | Gauri | Quiz fetch + submit |
| `leaderboard/*` | Gauri | Rankings |
| `admin/*` | Gauri | Admin CRUD + upload + analytics |

Legacy paths (`/api/auth/*`, `/api/payments/*`) were removed — use `/api/v1/...` only.

---

## `src/features/` — domain UI

| Folder | Owner | Contains |
|--------|-------|----------|
| `student-dashboard/` | Sanvi | `MyCoursesSection` |
| `course-catalog/` | Sanvi | `CourseCard` |
| `lesson-player/` | Sanvi | Video / markdown player |
| `progress/`, `quizzes/`, `leaderboard/`, `profile/` | Sanvi | Student-facing UI |
| `admin-*` | Gauri | Admin feature UIs |

Backward-compat re-exports still work at `src/components/learn/*` — prefer importing from `features/` in new code.

---

## `src/lib/` — core logic

| File | Purpose | Who edits? |
|------|---------|------------|
| `catalog/course-content.ts` | Course curriculum source + seed | Sanvi (content), Gauri (seed sync) |
| `catalog/courses.ts` | Types, helpers | Read-only unless Lead |
| `learning/progress.ts` | localStorage progress (Phase 0) | Sanvi until API lands |
| `learning/enrollment.ts` | Enrollment derivation | Lead only |
| `dev/standalone.ts` | Mock auth | Lead only |
| `security/*` | Cookies, BFF, rate limits | Lead only |
| `db/prisma.ts` | Prisma client | Lead only |

---

## Hooks

| File | Owner | Purpose |
|------|-------|---------|
| `hooks/enrollment/use-enrollment.ts` | Sanvi consumes | Fetches `/api/v1/enrollment/*` |
| `hooks/courses/*` | Sanvi | Course catalog (wire to Gauri's API) |
| `hooks/progress/*`, `hooks/quizzes/*` | Sanvi | Consumer hooks |
| `hooks/admin/*` | Gauri | Admin React Query hooks |

---

## Data flow (local dev)

```
.env.local
  LEARN_DEV_STANDALONE=true
  LEARN_DEV_MOCK_ENROLLMENTS=...
        │
        ▼
/login → POST /api/v1/auth/dev-login → mock cookies
        │
        ▼
/ (dashboard) → useEnrollment()
        │         └─ GET /api/v1/enrollment/me
        │         └─ GET /api/v1/enrollment/preview (if not signed in)
        ▼
/courses/[id] → catalog + progress.ts (localStorage)
        │
        ▼ (Phase 2+)
Gauri's APIs → Prisma → PostgreSQL
```

---

## Styling

- **Tailwind CSS** — utility classes in components
- Global styles: `src/app/globals.css`
- Shared UI: `src/components/ui/` (Sanvi maintains)
- Brand: `text-brand`, `bg-brand` · Surface: `bg-surface`, `border-borderSubtle`

---

## Middleware

`src/middleware.ts` redirects unauthenticated users to `/login`.

Public paths: `/login`, `/api/health`, `/api/v1/auth/google`, `/api/v1/auth/dev-login`, `/api/v1/enrollment/preview`.

Home `/` is public when `LEARN_DEV_STANDALONE=true`.

---

## Phase status

| Feature | Status | Owner |
|---------|--------|-------|
| PostgreSQL + seed | ✅ Schema + seed ready | Lead |
| Scaffold `(student)` + `(admin)` + `api/v1` | ✅ Done | Lead |
| Course read from DB | 🔲 Stub (501) | Gauri |
| Admin CRUD | 🔲 Placeholder pages | Gauri |
| Server-side progress | 🔲 Stub | Gauri |
| Student UI polish | 🔲 Tasks S4–S13 | Sanvi |
| Quizzes / leaderboard | 🔲 Stubs | Gauri + Sanvi |

**Roadmap:** [LMS_ARCHITECTURE.md](../LMS_ARCHITECTURE.md) · **Env vars:** [ENV_REFERENCE.md](../ENV_REFERENCE.md)
