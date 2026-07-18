# Deployment-ready + payment→enrollment sync

> **Status: Implemented** (Learn-side). Appbackend webhook caller remains out-of-repo.

## Goal

Ship Planitt Learn so that:

1. Production deploy is safe (no open dev auth, sessions don’t die at 30 min).
2. After a user pays for a Learn course on the **main Planitt website**, that course unlocks in this app.
3. **Only enrolled / paid courses** are open; all others stay locked (UI + API).

## Current state (already built)

| Piece | Status |
|-------|--------|
| Enrollment merge: appbackend payment history + Learn DB | Done — `getEnrolledCourseIds` |
| Webhook receiver `POST /api/v1/webhooks/enrollment` | Done — needs appbackend to call it |
| UI lock on cards / hub / lessons | Done — `CourseCard`, `CourseHubView`, locked empty states |
| API gate `assertEnrolled` on content routes | Done for courses, lessons, progress, quizzes, leaderboard |
| Checkout link to main site | Done — `planittCheckoutUrl` → `/learn?plan={id}` |
| Seed of all catalog courses into DB | Done — `prisma/seed.ts` |

**What is missing is mostly Learn-side auth/refresh + post-pay refetch + prod guards, plus an out-of-repo contract for appbackend/main site.**

## Out of scope this pass

- Expanding all course markdown content (intern S1–S3)
- Full automated test suite
- Full Cloudflare R2 SigV4 upload SDK
- Admin RBAC UI / admin enrollment grant UI
- Server sync for notes / bookmarks / achievements
- Dark theme redesign (do not change dark look)

---

## Phase 0 — Security (must ship first)

### 0.1 Gate fixed dev tokens

**File:** `src/lib/dev/standalone.ts`

`isDevAccessToken` / `isDevRefreshToken` must return `false` unless `isDevStandalone()` is true. Today a forged cookie `learn-dev-standalone-access` can authenticate in production.

### 0.2 Middleware production guard

**File:** `src/middleware.ts`

Replace the local `isDevStandalone()` (no `NODE_ENV` check) with `isDevStandalone` from `src/lib/env.ts` (or inline the same production block) so `/` is never public in prod.

### 0.3 Client standalone flag

**Files:** `src/context/auth-context.tsx`, `src/hooks/enrollment/use-enrollment.ts`

Treat `NEXT_PUBLIC_LEARN_DEV_STANDALONE` as false when `NODE_ENV === "production"` so prod builds never auto-call `dev-login` or preview enrollments.

**Verify:** Prod-like build rejects dev cookie on `/api/v1/auth/me`; local standalone login still works.

---

## Phase 1 — Session refresh (fixes 401 noise + 30‑min drop)

### 1.1 `authedFetch` wrapper

**File:** `src/lib/security/client-auth.ts`

On `401` → `POST /api/v1/auth/refresh` once → retry original request. If refresh fails, return the 401.

### 1.2 Wire consumers

Replace protected `fetch(..., withApiCredentials())` with `authedFetch` in:

- `src/context/auth-context.tsx` (bootstrap `/me`)
- `src/hooks/enrollment/use-enrollment.ts`
- Course / progress / quiz / profile / analytics / leaderboard / admin hooks that hit authenticated APIs

**Verify:** Expired access + valid refresh → transparent retry; user stays signed in.

---

## Phase 2 — Payment → unlock in Learn (core product ask)

### 2.1 Post-checkout enrollment refetch

**Files:** `src/hooks/enrollment/use-enrollment.ts`, student home + course hub pages

- `refetchOnWindowFocus: true` on enrollment query; lower `staleTime` (~15s).
- Honor `?purchased=1` (and optional `?plan=`): invalidate `["enrollment"]`, then `router.replace` to strip the param.

Main site return URL (document for their team):

```
{LEARN_PORTAL_URL}/courses/{planId}?purchased=1
```

or if logged out:

```
{LEARN_PORTAL_URL}/login?next=/courses/{planId}?purchased=1
```

(Use `learnCourseUrl` / `learnLoginUrl` from `src/constants/urls.ts`.)

### 2.2 Dual unlock path (no Learn code change to payment itself)

Learn unlocks if **either**:

1. **Live payment history** — `GET {APPBACKEND_URL}/api/v1/payments/me/history` returns paid `learn-*` plans, **or**
2. **Webhook** — appbackend POSTs to Learn after payment and rows land in `enrollments`

Both already merge in `getEnrolledCourseIds`. This phase makes the UI refresh so unlocks appear immediately after return from checkout.

### 2.3 Document contract for main site / appbackend (docs only)

**Files:** `docs/ENV_REFERENCE.md`, `docs/LMS_ARCHITECTURE.md` (and short section in `README.md`)

#### Payment history (read)

```
GET {APPBACKEND_URL}/api/v1/payments/me/history
Authorization: Bearer <access_token>
→ { "items": [{ "plan_id": "learn-forex-master-track", "status": "paid" }] }
```

Rules: `status === "paid"`, `plan_id` starts with `learn-`, `learn-all-courses-combo` unlocks all courses. IDs must match `ALL_COURSE_IDS` in `src/lib/catalog/courses.ts`.

#### Webhook (push)

```
POST {LEARN_PORTAL_URL}/api/v1/webhooks/enrollment
Header: x-learn-webhook-secret: <LEARN_ENROLLMENT_WEBHOOK_SECRET>
        (or Authorization: Bearer <same>)
Body:
{
  "user_id": "<same id as appbackend /auth/me>",
  "plan_id": "learn-forex-master-track",
  "email": "buyer@example.com",
  "name": "Buyer Name",
  "status": "paid"
}
```

`email` is **required**. Courses must exist in Learn DB (`npm run db:seed`). Upsert is idempotent.

#### Checkout link (Learn → main)

```
{MAIN_WEBSITE_URL}/learn?plan={planId}
```

**Out-of-repo dependency:** Appbackend must expose payment history correctly and (recommended) call the webhook after successful Razorpay/checkout. Learn cannot complete that caller inside this repo.

**Verify:**

1. Dev: mock enrollments / DB row → locked → unlocked after `?purchased=1` refetch.
2. Staging: real Google login → pay one plan on main site → return with `?purchased=1` → only that course (or combo-all) unlocks; others stay Locked; direct API without enrollment returns 403.

---

## Phase 3 — Lock hardening + quick blockers

### 3.1 Quiz published hydration

**Files:** `QuizBuilder.tsx`, lesson + module quiz admin pages

Pass `initialPublished={quiz?.published ?? false}` so saving does not silently unpublish.

### 3.2 Spot-check API gates

Confirm every content API still calls `assertEnrolled` (already present on course detail/modules/progress, lessons, quizzes, leaderboard). Fix any gaps found.

### 3.3 Locked UX consistency

Ensure hub / lesson / test all use the same checkout CTA (`planittCheckoutUrl`). No dark-theme restyle.

---

## Phase 4 — Deploy docs & env

### 4.1 Production env checklist

Update `.env.example` + `docs/ENV_REFERENCE.md`:

| Required in prod | Notes |
|------------------|--------|
| `DATABASE_URL` | Learn Postgres; run `db:deploy` + `db:seed` |
| `APPBACKEND_URL` | Real appbackend |
| `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Same as main site |
| `NEXT_PUBLIC_MAIN_WEBSITE_URL` | e.g. `https://planitt.in` |
| `NEXT_PUBLIC_LEARN_PORTAL_URL` | e.g. `https://learn.planitt.in` |
| `LEARN_ENROLLMENT_WEBHOOK_SECRET` | Shared with appbackend; rotate if ever leaked |
| `LEARN_ADMIN_EMAILS` | Admin allowlist |
| **Unset** `LEARN_DEV_STANDALONE`, `NEXT_PUBLIC_LEARN_DEV_STANDALONE`, `LEARN_DEV_MOCK_*` | |

### 4.2 Fix outdated docs

Correct README / LMS_ARCHITECTURE “current state” tables that still say “no DB / no admin / no quizzes”.

---

## Implementation order

1. Phase 0 (security) — smallest, blocks real deploy  
2. Phase 3.1 (quiz publish) — one-liner, prevents data loss  
3. Phase 1 (authedFetch) — session reliability  
4. Phase 2 (post-pay refetch + docs contract) — product ask  
5. Phase 3.2–3.3 + Phase 4 — lock audit + deploy docs  

Prefer **one branch / sequential commits** unless you want separate PRs per phase.

---

## Acceptance criteria (ship checklist)

- [ ] Prod build rejects fixed `learn-dev-standalone-*` tokens  
- [ ] Middleware does not make `/` public in production  
- [ ] Expired access token + valid refresh → APIs succeed without forced logout  
- [ ] Non-enrolled user: Locked badge, checkout CTA, content APIs return 403  
- [ ] Enrolled via payment history **or** webhook: course opens end-to-end  
- [ ] After checkout return with `?purchased=1` (or window focus), enrollment refreshes and unlocks without hard reload  
- [ ] Saving an already-published quiz does not unpublish it  
- [ ] Docs describe payment history + webhook + redirect contract for main-site team  
- [ ] `npm run typecheck` passes  

---

## Risks

| Risk | Mitigation |
|------|------------|
| Appbackend never calls webhook | Payment-history path still unlocks; document webhook as recommended for durability |
| `user_id` mismatch between `/auth/me` and webhook | Require same appbackend user id; payment history still works as fallback |
| Courses missing from DB | Always `db:seed` on deploy; webhook skips unknown courses |
| Main site doesn’t redirect with `?purchased=1` | Window-focus refetch still helps; document redirect as required UX |
| Payment history lag after pay | Webhook push + refetch; optional verify endpoint later |

---

## Summary for implementer

**Learn already knows how to lock and unlock.** Deployment readiness = close auth/prod holes, keep sessions alive, refresh enrollment after pay, hydrate quiz publish, and hand main-site/appbackend a clear contract. The payment UI stays on Planitt’s main site; Learn only consumes paid `learn-*` plans and shows locked vs open courses accordingly.
