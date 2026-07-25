# Environment variables reference

Copy **`.env.example`** → **`.env.local`**. Everyone on the team uses the same file.

Alvest **appbackend is not required** for local development. Production deploy uses separate secrets.

---

## Local development (everyone)

| Variable | Required | Description |
|----------|----------|-------------|
| `LEARN_DEV_STANDALONE` | Yes | `true` — local auth without Alvest appbackend |
| `NEXT_PUBLIC_LEARN_DEV_STANDALONE` | Yes | `true` — dev login button + course preview on home |
| `LEARN_DEV_MOCK_USER_ID` | No | Mock user id (default: `dev-local-001`) |
| `LEARN_DEV_MOCK_USER_NAME` | No | Display name in nav |
| `LEARN_DEV_MOCK_USER_EMAIL` | No | Mock email |
| `LEARN_DEV_MOCK_ENROLLMENTS` | Yes | Comma-separated course plan IDs to unlock locally |
| `NEXT_PUBLIC_MAIN_WEBSITE_URL` | No | Checkout link (default: `http://localhost:3000`) |

**Not used locally:** `APPBACKEND_URL`, `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`

---

## Phase 1 — Full LMS database

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Phase 1+ | PostgreSQL for **Learn DB only** (not Alvest main DB) |
| `LEARN_ADMIN_EMAILS` | Phase 1+ | Comma-separated emails with `/admin` access |
| `LEARN_ENROLLMENT_WEBHOOK_SECRET` | Phase 1+ | Validates enrollment webhooks from appbackend |
| `LEARN_SERVICE_KEY` | Staging/prod SSO | Sent as `X-Learn-Service-Key` when exchanging `?code=` handoff tokens |

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/alvest_learn_dev
```

---

## Phase 2 — Video storage

| Variable | Description |
|----------|-------------|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API access key |
| `R2_SECRET_ACCESS_KEY` | R2 API secret |
| `R2_BUCKET_NAME` | Bucket name |
| `R2_PUBLIC_URL` | CDN base URL for signed links |

Or AWS S3: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`

---

## Staging / production integration (optional)

Only needed when testing **real Google login + payment history** against staging. Mentor provides these — they are **commented out** in `.env.example`.

| Variable | Description |
|----------|-------------|
| `APPBACKEND_URL` | Alvest appbackend (staging or prod) |
| `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth web client |

Set `LEARN_DEV_STANDALONE=false` when using real auth.

---

## Example `.env.local` (standard local dev)

```env
LEARN_DEV_STANDALONE=true
NEXT_PUBLIC_LEARN_DEV_STANDALONE=true

LEARN_DEV_MOCK_USER_ID=dev-local-001
LEARN_DEV_MOCK_USER_NAME=Local Dev
LEARN_DEV_MOCK_USER_EMAIL=dev@localhost.dev
LEARN_DEV_MOCK_ENROLLMENTS=learn-all-courses-combo

NEXT_PUBLIC_MAIN_WEBSITE_URL=http://localhost:3000

# When Phase 1 lands — same for whole team:
# DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/alvest_learn_dev
```

---

## Production deploy secrets (hosting / CI only)

```env
DATABASE_URL=postgresql://...
APPBACKEND_URL=https://appbackend.planitt.in
NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
NEXT_PUBLIC_MAIN_WEBSITE_URL=https://planitt.in
NEXT_PUBLIC_LEARN_PORTAL_URL=https://learn.planitt.in
LEARN_ENROLLMENT_WEBHOOK_SECRET=<long-random-secret-shared-with-appbackend>
LEARN_SERVICE_KEY=<long-random-secret-shared-with-appbackend-for-sso>
LEARN_ADMIN_EMAILS=admin@planitt.in
# LEARN_DEV_STANDALONE must be false or unset
# NEXT_PUBLIC_LEARN_DEV_STANDALONE must be false or unset
# LEARN_DEV_MOCK_* must be unset
```

### Login / SSO query params

| URL | Behavior |
|-----|----------|
| `/login?email=` | Prefills email on the MPIN form |
| `/login?plan=learn-…` | After login, opens that course with `?purchased=1` (enrollment refresh) |
| `/login?code=` | Exchanges SSO handoff via appbackend (`LEARN_SERVICE_KEY`) |
| `/login?next=` | Explicit post-login path (wins over `plan`) |

### Production preflight

1. Set the Learn secrets above (never commit them).
2. `npm run db:deploy` then `npm run db:seed` (courses must exist for webhook enrollments).
3. On **Render (appbackend)** and **Vercel (website)** set:
   - `LEARN_PORTAL_URL` = `https://learn.planitt.in`
   - `LEARN_ENROLLMENT_WEBHOOK_SECRET` = same secure key as Learn’s `LEARN_ENROLLMENT_WEBHOOK_SECRET`
4. Confirm Google OAuth origins include both main site and Learn portal URLs.
5. `npm run typecheck && npm run build`

See **`docs/MAIN_SITE_LEARN_INTEGRATION.md`** → Step 7 for the full Render / Vercel dashboard checklist.

### Main site / appbackend contract

**Payment history (Learn pulls this on each enrollment check):**

```
GET {APPBACKEND_URL}/api/v1/payments/me/history
Authorization: Bearer <access_token>
→ { "items": [{ "plan_id": "learn-forex-master-track", "status": "paid" }] }
```

Only `status: "paid"` and `plan_id` starting with `learn-` unlock content. `learn-all-courses-combo` unlocks all courses.

**Enrollment webhook (appbackend pushes after successful payment):**

```
POST {LEARN_PORTAL_URL}/api/v1/webhooks/enrollment
Header: x-learn-webhook-secret: <LEARN_ENROLLMENT_WEBHOOK_SECRET>
Body: {
  "user_id": "<same id as /auth/me>",
  "plan_id": "learn-forex-master-track",
  "email": "buyer@example.com",
  "name": "Buyer Name",
  "status": "paid"
}
```

`email` is required. Upserts are idempotent.

**Post-checkout redirect (main site):**

```
{LEARN_PORTAL_URL}/courses/{planId}?purchased=1
```

Or if logged out: `{LEARN_PORTAL_URL}/login?next=/courses/{planId}?purchased=1`

Checkout from Learn: `{MAIN_WEBSITE_URL}/learn?plan={planId}`

---

## Security rules

1. Never commit `.env.local`
2. Never put production `APPBACKEND_URL` or prod `DATABASE_URL` in the repo
3. Learn DB is separate from Alvest's main trading database
4. `LEARN_DEV_STANDALONE` must never be `true` in production
