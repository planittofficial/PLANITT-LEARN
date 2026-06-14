# Planitt Learn — Developer guide

Same setup for everyone. Local dev runs **without Planitt appbackend** — you still build all portal features (courses, videos, quizzes, admin, leaderboard).

---

## Setup (10 minutes)

```bash
git clone <repo-url>
cd Planitt-Learn
cp .env.example .env.local
npm install
npm run dev
```

Windows:

```powershell
Copy-Item .env.example .env.local
```

Open **http://localhost:3001** → sign in → **Continue as dev user**.

Do **not** commit `.env.local`.

---

## Standard `.env.local`

Comes from `.env.example` — no changes needed to start:

```env
LEARN_DEV_STANDALONE=true
NEXT_PUBLIC_LEARN_DEV_STANDALONE=true
LEARN_DEV_MOCK_ENROLLMENTS=learn-all-courses-combo
LEARN_DEV_MOCK_USER_NAME=Local Dev
NEXT_PUBLIC_MAIN_WEBSITE_URL=http://localhost:3000
```

| Variable | Purpose |
|----------|---------|
| `LEARN_DEV_STANDALONE` | Local auth — no Planitt backend |
| `LEARN_DEV_MOCK_ENROLLMENTS` | Which courses are unlocked locally |
| `DATABASE_URL` | Add when Phase 1 DB lands (same for whole team) |

**You never need `APPBACKEND_URL` for local work.** Mentors only use that for optional staging integration tests.

---

## What you're building

NPTEL / Udemy-lite learning portal:

- Courses → Modules → Lessons (videos)
- Progress dashboard, quizzes, leaderboard, admin panel
- Full roadmap: [LMS_ARCHITECTURE.md](../LMS_ARCHITECTURE.md)

---

## Daily workflow

```bash
npm run dev
npm run typecheck    # before PR
```

Tasks: [TASKS.md](./TASKS.md) (Sanvi · Gauri) · Code map: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) · Architecture: [ARCHITECTURE.md](../ARCHITECTURE.md)

---

## Team

| Person | Focus | Start here |
|--------|-------|------------|
| **Sanvi** | Student portal — dashboard, courses, lesson player, UI | `src/app/(student)/`, `src/features/` |
| **Gauri** | Admin panel, APIs, services, database queries | `src/app/(admin)/`, `src/app/api/v1/`, `src/services/` |

Do **not** edit each other's owned folders without coordinating. See [`ARCHITECTURE.md`](../ARCHITECTURE.md) §4 for the full matrix.

---

## Where to edit

| Task | Owner | Location |
|------|-------|----------|
| Course content | Sanvi | `src/lib/catalog/course-content.ts` |
| Dashboard UI | Sanvi | `src/features/student-dashboard/` |
| Course / lesson pages | Sanvi | `src/app/(student)/courses/` |
| Shared UI components | Sanvi | `src/components/ui/` |
| Admin pages | Gauri | `src/app/(admin)/admin/` |
| Public + admin APIs | Gauri | `src/app/api/v1/` (except auth/enrollment) |
| Business logic | Gauri | `src/services/` |

---

## Course IDs

| ID | Title | Modules |
|----|-------|---------|
| `learn-indian-stocks-pro` | Indian Stocks + Mutual Fund | 7 |
| `learn-forex-master-track` | Forex Master Track | 14 |
| `learn-fno-strategy-program` | F&O Strategy Program | 5 |
| `learn-crypto-technical-edge` | Crypto Technical Edge | 2 |
| `learn-trader-psychology-intensive` | Trader Psychology | 2 |
| `learn-algo-trading` | Algo Trading | 4 |
| `learn-all-courses-combo` | Unlocks all (enrollment mock) |

---

## Test URLs

| URL | Shows |
|-----|-------|
| http://localhost:3001 | Course dashboard |
| http://localhost:3001/login | Dev sign-in |
| http://localhost:3001/courses/learn-forex-master-track | Course modules |

---

## FAQ

**Need Planitt backend?** No — local dev uses `LEARN_DEV_STANDALONE`.

**Need Google login?** No — use **Continue as dev user**.

**When is DATABASE_URL needed?** Phase 1 (PostgreSQL for videos, quizzes, admin). Same for whole team.

**Real payment test?** Ask mentor for staging credentials separately — not part of normal setup.

---

## Help

| Issue | Action |
|-------|--------|
| No courses visible | Check `LEARN_DEV_MOCK_ENROLLMENTS`, restart dev server |
| Dev login missing | Set `NEXT_PUBLIC_LEARN_DEV_STANDALONE=true`, restart |
| Env questions | [ENV_REFERENCE.md](../ENV_REFERENCE.md) |
