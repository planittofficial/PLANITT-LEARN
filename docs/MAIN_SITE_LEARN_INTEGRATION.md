# Main Site / Appbackend ↔ Alvest Learn Integration

**Audience:** Main website + appbackend development team  
**Purpose:** Contract and build steps so paid Learn courses unlock in the LMS after checkout on the main Alvest site.

Learn (this repo) already handles course locks, checkout links, payment-history merge, and the enrollment webhook receiver. **Checkout and payment stay on the main site.** This document covers what the main site / appbackend must provide.

---

## Overview

```
User on Learn
  → clicks Buy
  → main site: /learn?plan={planId}
  → pays (Razorpay / existing checkout)
  → appbackend records payment
  → (recommended) POST webhook → Learn
  → redirect → Learn /courses/{planId}?purchased=1

Learn unlocks the course if EITHER:
  1. Payment history shows a paid learn-* plan, OR
  2. Webhook wrote an enrollment row in Learn’s DB
```

| System | Owns |
|--------|------|
| **Main website** | Checkout UI (`/learn?plan=`), success redirect |
| **Appbackend** | Auth, payment records, payment history API, webhook caller |
| **Alvest Learn** | Course content, locks, progress, quizzes, webhook receiver |

---

## Architecture (identity & payments)

- Learn shares **Google Sign-In** with the main site (same web client ID).
- Learn talks to appbackend as a **BFF** (browser never calls appbackend directly).
- Learn stores its own HTTP-only cookies (`alvest_learn_*`) — separate from main-site session cookies.
- `user.id` from appbackend `GET /auth/me` **must** match `user_id` in the enrollment webhook.

---

## Step-by-step build plan

### Step 1 — Shared auth (do first)

Confirm appbackend auth works for Learn’s BFF.

| Item | Requirement |
|------|-------------|
| Google OAuth | Same client ID as Learn (`NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`) |
| Authorized origins | Include both main site **and** Learn portal origins |
| Exchange | `POST /api/v1/auth/google` with Google `id_token` → access + refresh tokens + user |
| Current user | `GET /api/v1/auth/me` → `{ id, email, name }` (stable `id`) |
| Refresh | `POST /api/v1/auth/refresh` with `{ refresh_token }` → new tokens |

**Done when:** A user can Google-login on Learn and `/auth/me` returns a stable `id` + `email`.

---

### Step 2 — Learn plan catalog on main site / appbackend

Plan IDs must match Learn’s catalog exactly. Learn only treats plans whose `plan_id` starts with `learn-`.

#### Individual courses

| `plan_id` |
|-----------|
| `learn-indian-stocks-pro` |
| `learn-forex-master-track` |
| `learn-fno-strategy-program` |
| `learn-crypto-technical-edge` |
| `learn-trader-psychology-intensive` |
| `learn-algo-trading` |

#### Combo (unlocks all courses)

| `plan_id` | Behavior in Learn |
|-----------|-------------------|
| `learn-all-courses-combo` | Expands to every course ID above |

**Build:**
1. Create/update product or plan records with these exact `plan_id` values.
2. Do not invent alternate IDs — Learn will not recognize them.
3. Wire checkout so paying for a plan records that `plan_id` on the payment.

---

### Step 3 — Checkout page on main website

Learn already links buyers here:

```
{MAIN_WEBSITE_URL}/learn?plan={planId}
```

Examples:
- Local: `http://localhost:3000/learn?plan=learn-forex-master-track`
- Prod: `https://planitt.in/learn?plan=learn-forex-master-track`

**Build:**
1. Page/route at `/learn` that reads `?plan=` and starts checkout for that plan.
2. If `plan` is missing/invalid, show a clear error or plan picker.
3. Payment processing (Razorpay, etc.) stays on the main site — **not** in Learn.

---

### Step 4 — Payment history API (required unlock path)

Learn calls this on the server when loading enrollments:

```http
GET {APPBACKEND_URL}/api/v1/payments/me/history
Authorization: Bearer <access_token>
```

**Expected response:**

```json
{
  "items": [
    {
      "plan_id": "learn-forex-master-track",
      "status": "paid"
    }
  ]
}
```

**Rules Learn enforces:**
- Include only successful payments with `"status": "paid"`.
- Include `plan_id` values for Learn plans (`learn-*`).
- Scope to the authenticated user (same as `/auth/me`).
- Combo plan `learn-all-courses-combo` unlocks all catalog courses when status is `paid`.

This path alone is enough for unlock even if the webhook is delayed or fails.

**Done when:** After a test payment, history returns the paid `learn-*` plan for that user.

---

### Step 5 — Enrollment webhook (recommended)

After payment is confirmed, appbackend should push enrollment into Learn.

```http
POST {LEARN_PORTAL_URL}/api/v1/webhooks/enrollment
x-learn-webhook-secret: <LEARN_ENROLLMENT_WEBHOOK_SECRET>
Content-Type: application/json
```

(`Authorization: Bearer <same secret>` is also accepted.)

**Body:**

```json
{
  "user_id": "<same id as GET /auth/me>",
  "plan_id": "learn-forex-master-track",
  "email": "buyer@example.com",
  "name": "Buyer Name",
  "status": "paid"
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `user_id` | Yes | Must match appbackend `/auth/me` `id` |
| `plan_id` | Yes | Exact `learn-*` id from catalog |
| `email` | **Yes** | Required by Learn |
| `name` | No | Used when creating/updating user |
| `status` | Yes | Must be `"paid"` for unlock |

**Implementation notes:**
1. Share secret via env: `LEARN_ENROLLMENT_WEBHOOK_SECRET` (same value on Learn and appbackend).
2. Call only when payment is confirmed.
3. Idempotent — safe to retry; Learn upserts.
4. Log failures; prefer not to block the user’s success redirect if the webhook fails (payment history still unlocks).
5. Courses must already exist in Learn DB (Learn team runs `db:seed` on deploy). Unknown `plan_id`s are skipped.

**URLs:**
- Local Learn: `http://localhost:3001/api/v1/webhooks/enrollment`
- Prod Learn: `https://alvest.planitt.in/api/v1/webhooks/enrollment` (confirm with Learn deploy)

---

### Step 6 — Post-payment redirect to Learn

After successful checkout, redirect the browser to Learn so the UI refetches enrollment.

**Logged into Learn (or session will resolve):**

```
{LEARN_PORTAL_URL}/courses/{planId}?purchased=1
```

**Not logged into Learn yet:**

```
{LEARN_PORTAL_URL}/login?next=/courses/{planId}?purchased=1
```

Examples:
- `https://alvest.planitt.in/courses/learn-forex-master-track?purchased=1`
- `https://alvest.planitt.in/login?next=%2Fcourses%2Flearn-forex-master-track%3Fpurchased%3D1`

`?purchased=1` tells Learn to invalidate enrollment and strip the query param. Learn also refetches on window focus as a backup.

---

### Step 7 — Environment checklist

#### Production dashboards (required)

Configure these in **Render** (appbackend) and **Vercel** (main website) for production:

| Variable | Value | Where |
|----------|-------|--------|
| `LEARN_PORTAL_URL` | `https://alvest.planitt.in` | **Render** (appbackend) **and** **Vercel** (website) — base URL of the LMS portal |
| `LEARN_ENROLLMENT_WEBHOOK_SECRET` | A secure shared secret key | **Render** (appbackend) — **must match** `LEARN_ENROLLMENT_WEBHOOK_SECRET` on the Learn LMS host |

**How they are used:**

| Variable | Used for |
|----------|----------|
| `LEARN_PORTAL_URL` | Post-checkout redirects (`{LEARN_PORTAL_URL}/courses/{planId}?purchased=1`) and building the webhook target (`{LEARN_PORTAL_URL}/api/v1/webhooks/enrollment`) |
| `LEARN_ENROLLMENT_WEBHOOK_SECRET` | Appbackend sends this as `x-learn-webhook-secret` (or `Authorization: Bearer …`) when calling Learn after payment |

**Learn LMS (its own host)** must also set the **same** `LEARN_ENROLLMENT_WEBHOOK_SECRET`, plus `NEXT_PUBLIC_LEARN_PORTAL_URL=https://alvest.planitt.in`.

Generate the secret once (e.g. `openssl rand -hex 32`), set it on Learn, then copy the identical value into Render. Never commit it to git.

#### Appbackend / main site (summary)

| Variable / config | Purpose |
|-------------------|---------|
| `LEARN_PORTAL_URL` | `https://alvest.planitt.in` — redirects + webhook base |
| `LEARN_ENROLLMENT_WEBHOOK_SECRET` | Same secret as Learn LMS |
| Checkout route | `/learn?plan=` |
| Webhook URL | `{LEARN_PORTAL_URL}/api/v1/webhooks/enrollment` |
| Payment history | Includes paid `learn-*` plans for the user |

#### Learn (already documented in `docs/ENV_REFERENCE.md`)

| Variable | Example |
|----------|---------|
| `APPBACKEND_URL` | `https://api.planitt.in` |
| `NEXT_PUBLIC_MAIN_WEBSITE_URL` | `https://planitt.in` |
| `NEXT_PUBLIC_LEARN_PORTAL_URL` | `https://alvest.planitt.in` |
| `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Same as main site |
| `LEARN_ENROLLMENT_WEBHOOK_SECRET` | **Same value as Render** |
| Dev flags | **Unset** in production (`LEARN_DEV_*`, `NEXT_PUBLIC_LEARN_DEV_*`) |

---

## Suggested implementation order

| # | Task | Owner | Priority |
|---|------|--------|----------|
| 1 | Verify Google auth + stable `/auth/me` user id | Appbackend | P0 |
| 2 | Add/fix `learn-*` plan IDs | Main site + appbackend | P0 |
| 3 | Build `/learn?plan=` checkout | Main website | P0 |
| 4 | Confirm `GET /payments/me/history` for paid `learn-*` | Appbackend | P0 |
| 5 | Call Learn webhook on payment success | Appbackend | P1 (recommended) |
| 6 | Redirect with `?purchased=1` | Main website | P0 |
| 7 | Staging E2E: login → pay → only that course unlocks | Both teams | P0 |

### Smallest first PR (appbackend)

1. Ensure `/payments/me/history` returns paid `learn-*` items.  
2. Add post-payment webhook call to Learn.  
3. Change success redirect to Learn with `?purchased=1`.

Checkout `/learn?plan=` can ship in parallel on the main website.

---

## Acceptance criteria (staging)

- [ ] Google login works on Learn with the shared client ID.
- [ ] Paying for `learn-forex-master-track` (or any single plan) records that `plan_id` as `paid`.
- [ ] `GET /payments/me/history` returns that paid item for the buyer.
- [ ] (If webhook enabled) Learn receives webhook with matching `user_id` + `email` + `plan_id`.
- [ ] Success redirect lands on Learn with `?purchased=1`.
- [ ] Only the paid course unlocks (or all courses if combo); others stay locked.
- [ ] Direct Learn content APIs without enrollment return 403.
- [ ] Paying for `learn-all-courses-combo` unlocks all Learn courses.

---

## What you do **not** need to build

- Course content, modules, lessons, quizzes, progress, leaderboard (Learn owns these).
- Enrollment lock UI in Learn (already built).
- Payment UI inside Learn (Learn only links out to `/learn?plan=`).
- Learn’s Postgres schema or seed (Learn team).

---

## Dual unlock (why both history + webhook)

| Path | Role |
|------|------|
| **Payment history (pull)** | Source of truth if webhook is late or fails |
| **Webhook (push)** | Durable enrollment row in Learn DB; faster / more reliable unlock |

Ship history first if needed; add webhook as soon as possible for durability.

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Webhook never called | Payment history still unlocks |
| `user_id` mismatch between `/auth/me` and webhook | Use the same appbackend user id; history remains fallback |
| Wrong / custom plan IDs | Use the catalog table in Step 2 only |
| No `?purchased=1` redirect | Learn still refetches on window focus; redirect is required for best UX |
| Courses missing in Learn DB | Learn must run `db:seed` on deploy; webhook skips unknown courses |

---

## Contact / ownership

| Area | Team |
|------|------|
| Auth, payments API, webhook caller | Appbackend |
| `/learn` checkout UI + redirect | Main website |
| LMS locks, webhook receiver, catalog IDs | Alvest Learn |

For Learn env details see `docs/ENV_REFERENCE.md`.  
For Learn internal architecture see `docs/LMS_ARCHITECTURE.md`.

---

## Quick reference — API contracts

### Payment history (appbackend → Learn pulls)

```
GET /api/v1/payments/me/history
Authorization: Bearer <access_token>

→ { "items": [{ "plan_id": "learn-forex-master-track", "status": "paid" }] }
```

### Enrollment webhook (appbackend → Learn)

```
POST /api/v1/webhooks/enrollment
x-learn-webhook-secret: <LEARN_ENROLLMENT_WEBHOOK_SECRET>

{
  "user_id": "<auth/me id>",
  "plan_id": "learn-forex-master-track",
  "email": "buyer@example.com",
  "name": "Buyer Name",
  "status": "paid"
}
```

### Checkout (Learn → main site)

```
{MAIN_WEBSITE_URL}/learn?plan={planId}
```

### Return URL (main site → Learn)

```
{LEARN_PORTAL_URL}/courses/{planId}?purchased=1
```
