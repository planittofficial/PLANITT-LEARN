# Database schema — Alvest Learn

PostgreSQL via **Prisma**. See `prisma/schema.prisma` for the source of truth.

## Commands

```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Apply migrations (dev)
npm run db:push       # Push schema without migration file (prototyping)
npm run db:seed       # Load course catalog into DB
npm run db:studio     # Open Prisma Studio
```

## Tables

| Table | Purpose |
|-------|---------|
| `users` | Learner profiles (id = Alvest appbackend user id) |
| `courses` | Course catalog (`id` = plan_id e.g. `learn-forex-master-track`) |
| `modules` | Course modules (`id` = slug e.g. `fx-m1`) |
| `lessons` | Lessons with video/article content, `min_watch_percent` default 75 |
| `lesson_quizzes` | Quiz after each lesson (JSON questions) |
| `module_tests` | Final module test (JSON question pool) |
| `enrollments` | User ↔ course access |
| `lesson_progress` | Watch time, watch %, completion |
| `quiz_attempts` | Lesson quiz + module test scores |
| `leaderboard_entries` | Per-course rankings |
| `admin_users` | Admin panel access by email |
| `enrollment_events` | Webhook audit log from Alvest checkout |

## Entity diagram

```
courses
  └── modules
        ├── lessons
        │     ├── lesson_quizzes
        │     └── lesson_progress (per user)
        └── module_tests

users
  ├── enrollments → courses
  ├── lesson_progress
  ├── quiz_attempts
  └── leaderboard_entries → courses
```

## Supabase notes

If your password contains `@`, URL-encode it as `%40`:

```env
DATABASE_URL=postgresql://postgres:planitt%40learn@db.xxx.supabase.co:5432/postgres?sslmode=require
DIRECT_URL=postgresql://postgres:planitt%40learn@db.xxx.supabase.co:5432/postgres?sslmode=require
```

Use the **Session pooler** URL for `DATABASE_URL` and **Direct** URL for `DIRECT_URL` when using Supabase migrations.
