# Task breakdown — Sanvi & Gauri

Tasks are ordered by difficulty within each track. Complete Sprint 0 together, then work your assigned track unless your mentor re-prioritizes.

**Full architecture & ownership:** [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)

| Person | Owns | Branch prefix |
|--------|------|---------------|
| **Sanvi** | Student portal UI — pages, features, `components/ui` | `sanvi/` |
| **Gauri** | Admin panel, `/api/v1` APIs (except auth/enrollment), services | `gauri/` |
| **Lead** | Auth, enrollment, webhooks, Prisma schema, middleware | `lead/` |

**Definition of done for every task:**
- Works on localhost:3001 with `.env.example` → `.env.local`
- No TypeScript errors (`npm run typecheck`)
- PR to `develop` with short description + screenshot
- Reviewed by the correct owner (see ARCHITECTURE.md matrix)

---

## Sprint 0 — Setup (Day 1) · Both

- [ ] Clone repo, copy `.env.example` → `.env.local`
- [ ] `npm install` && `npm run dev`
- [ ] Dev login → see dashboard with at least one course
- [ ] Read [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) and skim [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)
- [ ] Sanvi: open `(student)/` pages and `features/` folders
- [ ] Gauri: open `(admin)/admin/` pages and `app/api/v1/admin/`

---

## Sanvi — Student portal track

> **Rule:** UI → hooks → API only. Never import `@/services/*` or `@/lib/db/prisma` in client code.

### Sprint 1 — Course content (Week 1)

Shared catalog work — good warm-up before UI sprints. Coordinate so you don't edit the same module in parallel.

#### Task S1: Expand Forex Master Track Module 1
**Owner:** Sanvi (or pair with Gauri)  
**File:** `src/lib/catalog/course-content.ts`  
**Goal:** Module `fx-m1` has 1 intro lesson. Add 2–3 more lessons with real markdown content.

**Test:** `/courses/learn-forex-master-track` → module 1 shows full lesson list.

---

#### Task S2: Build out Indian Stocks Module 1
**Owner:** Sanvi  
**File:** `src/lib/catalog/course-content.ts`  
**Goal:** Add 3–4 more lessons to `in-m1` covering NSE/BSE basics.

**Test:** `/courses/learn-indian-stocks-pro` → module 1 has 4+ lessons.

---

#### Task S3: Crypto + Psychology course content
**Owner:** Sanvi  
**File:** `src/lib/catalog/course-content.ts`  
**Goal:** Fill `learn-crypto-technical-edge` and `learn-trader-psychology-intensive` with at least 1 module each.

---

### Sprint 2 — UI & progress (Week 2)

#### Task S4: Improve course hub progress UI
**Owner:** Sanvi  
**File:** `src/app/(student)/courses/[courseId]/page.tsx`  
**Goal:** Show per-module completion (e.g. "2/3 lessons done" under each module heading).

Use existing `loadCourseProgress` and `countCompletedLessons`.

---

#### Task S5: Lesson navigation (prev / next)
**Owner:** Sanvi  
**Files:** `src/app/(student)/courses/[courseId]/[moduleId]/[lessonId]/page.tsx`, optionally `src/lib/catalog/courses.ts`  
**Goal:** Add "Previous lesson" / "Next lesson" links at bottom of lesson page.

**Test:** Click through all lessons in Forex module 1 without returning to course hub.

---

#### Task S6: Dashboard course cards
**Owner:** Sanvi  
**File:** `src/features/student-dashboard/components/MyCoursesSection.tsx`  
**Goal:** Ensure completion percentage shows on enrolled cards (extend if needed).

---

### Sprint 3 — Video player (Week 3)

#### Task S7: Add video lesson to catalog
**Owner:** Sanvi  
**File:** `src/lib/catalog/course-content.ts`  
**Goal:** Add one lesson with `kind: "video"` and a public sample `videoUrl`.

---

#### Task S8: Video player on lesson page
**Owner:** Sanvi  
**File:** `src/features/lesson-player/` + `src/app/(student)/courses/.../page.tsx`  
**Goal:** When `lesson.kind === "video"`, render HTML5 `<video>` or iframe instead of markdown.

**Test:** Forex course has at least one playable video lesson.

---

#### Task S9: Auto-complete at 75% watch
**Owner:** Sanvi (UI) — uses Gauri's progress API when ready  
**Files:** lesson player + `src/lib/learning/progress.ts` (localStorage until API lands)  
**Goal:** Track `watchPercent`. Auto-mark complete at ≥ 75% via `timeupdate` on video.

---

### Sprint 4 — Polish (Week 4+)

#### Task S10: Empty states and skeletons
**Owner:** Sanvi  
**Files:** `MyCoursesSection.tsx`, course hub, lesson page, `src/components/ui/Skeleton.tsx`  
**Goal:** Replace plain "Loading…" with skeleton UI.

---

#### Task S11: Mobile responsive pass
**Owner:** Sanvi  
**Files:** `src/components/layout/student/LearnShell.tsx`, dashboard, course hub  
**Goal:** Fix layout on narrow screens.

---

#### Task S12: Leaderboard page UI
**Owner:** Sanvi  
**File:** `src/app/(student)/leaderboard/page.tsx`, `src/features/leaderboard/`  
**Goal:** Build display UI wired to `useLeaderboard()` hook (mock data OK until Gauri's API ships).

---

#### Task S13: Profile page UI
**Owner:** Sanvi  
**File:** `src/app/(student)/profile/page.tsx`, `src/features/profile/`  
**Goal:** Show user name, enrolled course count, overall progress summary.

---

## Gauri — Admin & API track

> **Rule:** Do not edit `lib/security/*`, `middleware.ts`, or `prisma/schema.prisma` without Lead review. Open a PR and tag Lead.

### Sprint 1 — Course read APIs (Week 1–2)

#### Task G1: Wire `GET /api/v1/courses`
**Owner:** Gauri  
**Files:** `src/app/api/v1/courses/route.ts`, `src/services/courses/course.service.ts`  
**Goal:** Return published courses from Prisma (seed data). Replace static-only catalog for list view.

**Test:** `curl http://localhost:3001/api/v1/courses` returns JSON catalog.

---

#### Task G2: Course detail + modules API
**Owner:** Gauri  
**Files:** `src/app/api/v1/courses/[courseId]/route.ts`, `.../modules/route.ts`  
**Goal:** Return course tree with enrollment gate via `requireUser` + enrollment check.

---

#### Task G3: F&O Module 1 content (catalog seed)
**Owner:** Gauri  
**File:** `src/lib/catalog/course-content.ts` + `prisma/seed.ts`  
**Goal:** Add 2 lessons to `fno-m1` on calls, puts, and moneyness. Re-run `npm run db:seed`.

---

### Sprint 2 — Admin CRUD (Week 2–3)

#### Task G4: Admin courses list + create
**Owner:** Gauri  
**Files:** `src/app/(admin)/admin/courses/page.tsx`, `src/features/admin-courses/`, `src/app/api/v1/admin/courses/route.ts`  
**Goal:** List courses from DB; form to create a draft course.

---

#### Task G5: Admin module & lesson editors
**Owner:** Gauri  
**Files:** `src/app/(admin)/admin/modules/[moduleId]/page.tsx`, `lessons/[lessonId]/page.tsx`, matching admin APIs  
**Goal:** Edit module title/summary and lesson markdown content.

---

#### Task G6: Video presigned upload
**Owner:** Gauri  
**Files:** `src/app/api/v1/admin/uploads/presign/route.ts`, `src/services/storage/video-storage.service.ts`  
**Goal:** Return presigned URL for R2/S3 upload; store `videoUrl` on lesson record.

---

### Sprint 3 — Progress & quizzes (Week 3–4)

#### Task G7: Lesson progress API
**Owner:** Gauri  
**Files:** `src/app/api/v1/lessons/[lessonId]/progress/route.ts`, `src/services/progress/progress.service.ts`  
**Goal:** POST watch heartbeat; enforce 75% completion rule server-side.

---

#### Task G8: Lesson quiz API
**Owner:** Gauri  
**Files:** `src/app/api/v1/quizzes/lessons/[lessonId]/*`, `src/services/quizzes/lesson-quiz.service.ts`  
**Goal:** GET quiz (no answers in response); POST attempt with pass/fail scoring.

---

#### Task G9: Module test API
**Owner:** Gauri  
**Files:** `src/app/api/v1/quizzes/modules/[moduleId]/*`, `src/services/quizzes/module-test.service.ts`  
**Goal:** Same pattern as lesson quiz for end-of-module tests.

---

### Sprint 4 — Leaderboard & analytics (Week 4+)

#### Task G10: Leaderboard API
**Owner:** Gauri  
**Files:** `src/app/api/v1/leaderboard/[courseId]/route.ts`, `src/services/leaderboard/leaderboard.service.ts`  
**Goal:** Rank users by quiz scores + lesson completion for a course.

---

#### Task G11: Admin analytics dashboard
**Owner:** Gauri  
**Files:** `src/app/(admin)/admin/analytics/page.tsx`, `src/app/api/v1/admin/analytics/route.ts`  
**Goal:** Show enrollment counts, completion rates, quiz pass rates.

---

#### Task G12: Admin students list
**Owner:** Gauri  
**Files:** `src/app/(admin)/admin/students/page.tsx`, `src/app/api/v1/admin/students/route.ts`  
**Goal:** Search users; link to per-user progress detail page.

---

## Coordination tasks (pair up)

| Task | Sanvi | Gauri |
|------|-------|-------|
| Replace localStorage progress with API | Wire `useLessonProgress()` hook | Ship progress API (G7) |
| Quiz taking UI | Build `features/quizzes/` form UI | Ship quiz APIs (G8, G9) |
| Leaderboard page | Build display (S12) | Ship leaderboard API (G10) |
| Course catalog on dashboard | Switch `useCourses()` to API | Ship courses API (G1) |

---

## PR checklist

Before requesting review:

```bash
npm run typecheck
npm run build
```

**Branch naming:**
- Sanvi: `sanvi/course-hub-progress-ui`
- Gauri: `gauri/progress-api`

PR description template:

```markdown
## Task
Task S4 / G7: [title]

## Owner
Sanvi | Gauri

## Changes
- ...

## How to test
1. cp .env.example .env.local
2. npm run dev
3. Go to ...

## Screenshot
[attach]
```
