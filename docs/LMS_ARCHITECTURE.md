# LMS architecture — NPTEL-lite / Udemy-lite roadmap

This document explains **what infrastructure Alvest Learn needs** to become a full learning portal, what exists **today**, and which **environment variables** each role uses.

---

## Current state vs target

| Capability | Today | Target |
|------------|-------|--------|
| Course content | PostgreSQL + admin CMS (+ static seed catalog) | Same |
| Video lectures | YouTube / manual URL (+ R2 stub) | R2/S3 signed uploads |
| Progress | PostgreSQL `lesson_progress` (+ localStorage fallback) | Server-only |
| 75% watch rule | HTML5 video heartbeat | Same + YouTube tracking |
| Lesson quiz / module test | DB-backed + admin builders | Same |
| Enrollment | Payment history + webhook + lock UI | Same |
| Leaderboard | DB-backed | Same |
| Admin panel | `/admin` CRUD | Same |
| Auth | Google via appbackend (or local standalone) | Same |

---

## Full system diagram

```mermaid
flowchart TB
  subgraph student [Student portal :3001]
    Dash[User dashboard]
    Player[Video player + 75% rule]
    Quiz[Lesson quiz + module test]
    LB[Leaderboard]
  end

  subgraph admin [Admin panel /admin]
    Upload[Video upload]
    CMS[Course / module / lesson CRUD]
    QB[Quiz builder]
  end

  subgraph learn [Alvest Learn backend]
    API[Next.js API routes]
    DB[(PostgreSQL — Learn DB)]
    R2[Cloudflare R2 / S3]
  end

  subgraph planitt [Alvest existing — keep separate]
    Web[Main website :3000]
    AB[appbackend — auth + payments only]
  end

  Web -->|checkout| AB
  AB -->|enrollment webhook| API
  student --> API
  admin --> API
  API --> DB
  API --> R2
  student -->|Google login| AB
```

**Important:** Learn gets its **own PostgreSQL database**. It does **not** connect to Alvest's main trading database.

---

## What you need to run the full LMS

### 1. PostgreSQL (required from Phase 1)

| Who | Database | Purpose |
|-----|----------|---------|
| **Production** | Managed Postgres (Neon, Supabase, RDS) | Live portal data |
| **Staging** | Separate Postgres instance | Mentor / QA testing |
| **Interns** | Shared **Learn dev** Postgres OR local Docker Postgres | Course CRUD, progress, quizzes — **not prod** |
| **Local mentor** | Docker Postgres on `localhost:5432` | Full stack dev |

**Env variable:**

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/planitt_learn
```

Example local:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/alvest_learn_dev
```

### 2. Video object storage (required from Phase 2)

Videos are too large for Postgres. Store files in object storage; DB stores metadata + path only.

| Provider | Env vars |
|----------|----------|
| **Cloudflare R2** (recommended) | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` |
| **AWS S3** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME` |

```env
# Example — Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=alvest-learn-videos
R2_PUBLIC_URL=https://videos.alvest.planitt.in
```

### 3. Alvest appbackend (auth + enrollment only)

Still needed in production/staging — **not** for intern standalone mode.

```env
APPBACKEND_URL=https://appbackend.planitt.in
NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-client-id
```

### 4. Enrollment webhook secret (Phase 1+)

When checkout completes on main website, appbackend notifies Learn:

```env
LEARN_ENROLLMENT_WEBHOOK_SECRET=random-long-secret-string
```

### 5. Admin access control

```env
# Comma-separated emails allowed into /admin
LEARN_ADMIN_EMAILS=mentor@planitt.in,admin@planitt.in
```

---

## Database schema (overview)

These tables replace `courses.ts` and `localStorage`:

```
courses              — id, plan_id, title, description, thumbnail, published
modules              — id, course_id, title, sort_order, published
lessons              — id, module_id, title, video_key, duration_sec, min_watch_percent
lesson_quizzes       — id, lesson_id, passing_score, questions (JSONB)
module_tests         — id, module_id, passing_score, question_ids (JSONB)
enrollments          — user_id, course_id, source, enrolled_at
lesson_progress      — user_id, lesson_id, watched_seconds, watch_percent, completed_at
quiz_attempts        — user_id, lesson_id|module_id, score, passed, attempted_at
leaderboard_entries  — user_id, course_id, total_score, rank (or materialized view)
admin_users          — email, role (optional — or use LEARN_ADMIN_EMAILS)
```

ORM recommendation: **Prisma** or **Drizzle** with migrations in this repo.

---

## Environment files

| File | Who uses it | Database? |
|------|-------------|-----------|
| `.env.example` | **Everyone** — copy to `.env.local` | Optional (Phase 1+) |
| Production secrets | CI / hosting only | Yes — prod Postgres + R2 |

Local dev uses `LEARN_DEV_STANDALONE=true` — **no `APPBACKEND_URL` required**. The whole team builds the same features locally.

See [ENV_REFERENCE.md](./ENV_REFERENCE.md).

---

## Build phases

### Phase 0 — Now (no database)

- Content in `courses.ts`
- Progress in `localStorage`
- Local env: `LEARN_DEV_STANDALONE=true` (from `.env.example`)
- **No `DATABASE_URL` required** in Phase 0

### Phase 1 — Database + admin CRUD

- Add PostgreSQL + Prisma
- Migrate catalog to DB
- `/admin` — create courses, modules, lessons (text/metadata)
- Team adds `DATABASE_URL` to `.env.local` (Learn dev DB or local Docker)

### Phase 2 — Video + watch rules

- R2/S3 upload from admin
- Video player with heartbeat progress
- 75% completion rule in `lesson_progress`

### Phase 3 — Quizzes + module tests

- Quiz builder in admin
- Lesson quiz + module final test UI
- Scores in `quiz_attempts`

### Phase 4 — Dashboard + leaderboard

- User dashboard from DB
- Leaderboard rankings per course

---

## What the team shares vs keeps private

**Shared (in repo / `.env.example`):**
- `LEARN_DEV_STANDALONE` local dev setup
- Learn dev `DATABASE_URL` (Phase 1 — same DB for whole team, or each runs Docker locally)
- Dev R2 bucket credentials when Phase 2 lands

**Private (production / staging only — never in repo):**
- Production `APPBACKEND_URL`
- Alvest main backend database
- Production `DATABASE_URL`
- Production R2/S3 keys
- Razorpay / payment keys

**Optional staging test** (mentor sends separately when needed):
```env
LEARN_DEV_STANDALONE=false
APPBACKEND_URL=<staging-only>
NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID=<staging>
```

---

## Phase 1 `.env.local` example (whole team)

```env
LEARN_DEV_STANDALONE=true
NEXT_PUBLIC_LEARN_DEV_STANDALONE=true
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/alvest_learn_dev
LEARN_DEV_MOCK_ENROLLMENTS=learn-all-courses-combo
```

---

## Quick answers

**Q: Where is the DB URL today?**  
A: Not in the repo yet — the app doesn't use a database. It will be `DATABASE_URL` in `.env.local` once Phase 1 lands.

**Q: Do we need a database for NPTEL/Udemy-lite?**  
A: **Yes.** Videos, progress, quizzes, leaderboard, and admin all require PostgreSQL + object storage.

**Q: Is it the same DB as Alvest trading backend?**  
A: **No.** Learn has its own isolated PostgreSQL instance.

**Q: Can the team run without DB for now?**  
A: **Yes** — Phase 0 uses the course catalog in code and local dev mode. Phase 1 adds `DATABASE_URL` to the same `.env.example` for everyone.
