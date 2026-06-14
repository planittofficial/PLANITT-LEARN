# Mentor checklist — onboarding to Planitt Learn

Use this when **Sanvi**, **Gauri**, or another developer joins the Learn portal team.

---

## What you provide

| # | Item | How |
|---|------|-----|
| 1 | **Git repo access** | Add to `Planitt-Learn` on GitHub/GitLab |
| 2 | **Env template** | They copy `.env.example` → `.env.local` (same for everyone) |
| 3 | **Onboarding doc** | [`docs/intern/README.md`](./intern/README.md) |
| 4 | **Architecture** | [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) (structure + ownership) |
| 5 | **Product roadmap** | [`docs/LMS_ARCHITECTURE.md`](./LMS_ARCHITECTURE.md) |
| 6 | **Tasks** | [`docs/intern/TASKS.md`](./intern/TASKS.md) — Sanvi vs Gauri tracks |
| 7 | **Review channel** | Slack/Discord + weekly sync |

---

## What you do NOT share

These stay with mentors / production deploy only:

| Secret | Why |
|--------|-----|
| Production `APPBACKEND_URL` | Bulky Planitt backend + prod data |
| Production `DATABASE_URL` | Live Learn DB |
| Production R2/S3 keys | Video storage |
| Razorpay / payment keys | Checkout |

**Local dev does not need any of the above.** The team builds all features using `LEARN_DEV_STANDALONE` + Learn local/staging DB.

---

## Optional — staging integration test

When someone needs to verify **real Google login + payments** against staging, send separately (never in repo):

```env
LEARN_DEV_STANDALONE=false
APPBACKEND_URL=https://staging-appbackend.example.com
NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID=<staging-client-id>
LEARN_DEV_MOCK_ENROLLMENTS=
```

---

## Before they start

- [ ] `main` builds: `npm run typecheck && npm run build`
- [ ] Standard local setup works:
  ```bash
  cp .env.example .env.local
  npm install && npm run dev
  ```
- [ ] http://localhost:3001 shows courses → login → **Continue as dev user** → open a course
- [ ] GitHub issues created for first tasks (Sanvi: S1–S4 · Gauri: G1–G4)

---

## When Phase 1 DB is ready

Share **Learn dev** `DATABASE_URL` with the team (same URL for everyone, or each runs Docker locally):

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/planitt_learn_dev
```

This is the **Learn portal database** — not Planitt's main backend database.

---

## Course IDs (mock enrollment)

```
learn-all-courses-combo    ← unlocks all (default in .env.example)
learn-indian-stocks-pro
learn-forex-master-track
learn-fno-strategy-program
learn-crypto-technical-edge
learn-trader-psychology-intensive
learn-algo-trading
```

---

## PR review

- [ ] No secrets in committed files
- [ ] `npm run typecheck` passes
- [ ] Screenshot for UI changes

---

## Infrastructure you provision (NPTEL/Udemy-lite)

| Phase | Provision | Env |
|-------|-----------|-----|
| **0 — Now** | None extra | `.env.example` only |
| **1** | Learn PostgreSQL | `DATABASE_URL` |
| **2** | R2/S3 bucket | `R2_*` |
| **3–4** | Same DB | quizzes, leaderboard |

See [LMS_ARCHITECTURE.md](./LMS_ARCHITECTURE.md).
