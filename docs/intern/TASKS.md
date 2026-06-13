# Intern task breakdown

Tasks are ordered by difficulty. Complete them in order unless your mentor assigns differently.

**Definition of done for every task:**
- Works on localhost:3001 with `.env.example` → `.env.local`
- No TypeScript errors (`npm run typecheck`)
- PR opened with short description + screenshot
- Mentor review approved

---

## Sprint 0 — Setup (Day 1)

- [ ] Clone repo, copy `.env.example` → `.env.local`
- [ ] `npm install` && `npm run dev`
- [ ] Dev login → see dashboard with at least one course
- [ ] Read `PROJECT_STRUCTURE.md` and skim `src/lib/catalog/course-content.ts`

---

## Sprint 1 — Course content (Week 1)

> **Note:** All 6 courses and module shells already exist. Your job is to **expand lessons**, add videos, and improve content — not create courses from scratch.

### Task 1: Expand Forex Master Track Module 1
**File:** `src/lib/catalog/course-content.ts`  
**Goal:** Module `fx-m1` has 1 intro lesson. Add 2–3 more lessons with real markdown content.

**Test:** Open `/courses/learn-forex-master-track` → module 1 shows full lesson list.

---

### Task 2: Build out Indian Stocks Module 1
**File:** `src/lib/catalog/course-content.ts`  
**Goal:** Add 3–4 more lessons to `in-m1` covering NSE/BSE basics.

**Test:** `/courses/learn-indian-stocks-pro` → module 1 has 4+ lessons.

---

### Task 3: Add lessons to F&O Module 1
**File:** `src/lib/catalog/course-content.ts`  
**Goal:** `fno-m1` has 1 placeholder. Add 2 more lessons on calls, puts, and moneyness.

**Test:** F&O course module 1 is no longer a single-lesson stub.

---

## Sprint 2 — UI & progress (Week 2)

### Task 4: Improve course hub progress UI
**File:** `src/app/courses/[courseId]/page.tsx`  
**Goal:** Show per-module completion (e.g. "2/3 lessons done" under each module heading).

Use existing `loadCourseProgress` and `countCompletedLessons`.

---

### Task 5: Lesson navigation (prev / next)
**Files:** `src/app/courses/[courseId]/[moduleId]/[lessonId]/page.tsx`, optionally `src/lib/catalog/courses.ts`  
**Goal:** Add "Previous lesson" / "Next lesson" links at bottom of lesson page.

**Test:** Can click through all lessons in Forex module 1 without going back to course hub.

---

### Task 6: Dashboard course cards enhancement
**File:** `src/components/learn/MyCoursesSection.tsx`  
**Goal:** Show completion percentage on each enrolled course card.

---

## Sprint 3 — Video-ready content (Week 3)

### Task 7: Add video lesson type to catalog
**File:** `src/lib/catalog/course-content.ts`  
**Goal:** Add one lesson with `kind: "video"` and a public sample `videoUrl` (e.g. a short MP4 or YouTube embed URL).

---

### Task 8: Video player on lesson page
**File:** `src/app/courses/[courseId]/[moduleId]/[lessonId]/page.tsx`  
**Goal:** When `lesson.kind === "video"`, render an HTML5 `<video>` or iframe instead of markdown.

**Test:** Forex course has at least one playable video lesson.

---

### Task 9: Replace manual "Mark complete" for videos
**File:** lesson page + `src/lib/learning/progress.ts`  
**Goal:** Track `watchPercent` in progress. Auto-mark complete when user watched ≥ 75% (use `timeupdate` on video element).

---

## Sprint 4 — Polish (Week 4+)

### Task 10: Empty states and loading skeletons
**Files:** `MyCoursesSection.tsx`, course hub, lesson page  
**Goal:** Replace plain "Loading…" text with simple skeleton UI.

---

### Task 11: Mobile responsive pass
**Files:** `LearnShell.tsx`, dashboard, course hub  
**Goal:** Verify layout on narrow screens; fix overflow issues.

---

### Task 12: Crypto + Psychology course content
**File:** `src/lib/catalog/course-content.ts`  
**Goal:** Fill `learn-crypto-technical-edge` and `learn-trader-psychology-intensive` with at least 1 module each.

---

## Future tasks (after mentor adds database)

These are **not** for current sprint — listed so you know what's coming:

- Admin panel (`/admin`) — upload videos, CRUD modules
- Lesson quiz after each video
- Module final test
- Leaderboard
- Server-side progress (replace localStorage)

---

## PR checklist

Before requesting review:

```bash
npm run typecheck
npm run build   # optional but recommended for UI tasks
```

PR description template:

```markdown
## Task
Task X: [title]

## Changes
- ...

## How to test
1. cp .env.example .env.local
2. npm run dev
3. Go to ...

## Screenshot
[attach]
```
