# Planitt Learn

Standalone course consumption app for Planitt. Runs on **port 3001**, separate from the main website.

## Quick start

```bash
git clone <your-planitt-learn-repo-url>
cd Planitt-Learn
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID (same as main website)
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

**Important:** The file must be named `.env.local` (not `.env.example`). Restart `npm run dev` after creating or editing it.

## Environment

Copy `.env.example` to `.env.local` and configure:

- `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` — Google OAuth client (add `http://localhost:3001` to authorized origins)
- `NEXT_PUBLIC_APPBACKEND_URL` — Planitt appbackend URL
- `NEXT_PUBLIC_MAIN_WEBSITE_URL` — Main Planitt website URL (for checkout links)

### Local dev without payment

In `.env.local` (dev only):

```env
LEARN_DEV_MOCK_ENROLLMENTS=learn-forex-master-track
```

Never set this in production.

## Architecture

```
Main website ( :3000 )          Learn portal ( :3001 )
/learn checkout ──Razorpay──► appbackend
                                    ▲
Learn login ──Google──► learn BFF ──┘
Learn enrollment ◄── GET payments/me/history (paid learn-* plans)
```

## Enrollment logic

Course access is derived from **payment history**, not signal entitlements:

- `plan_id` starts with `learn-`
- `status === "paid"`
- `learn-all-courses-combo` unlocks all courses

## Routes

| Route | Purpose |
|-------|---------|
| `/` | My Courses dashboard |
| `/login` | Google sign-in (same Planitt account) |
| `/courses/[courseId]` | Module list + progress |
| `/courses/[courseId]/[moduleId]/[lessonId]` | Lesson player |

## Scripts

```bash
npm run dev        # http://localhost:3001
npm run typecheck
npm run build
npm run start
```

## Repo split

This app was moved out of `Planitt-inhouse/apps/learn` so it can be developed and deployed independently. It has no dependency on monorepo `packages/*`.
