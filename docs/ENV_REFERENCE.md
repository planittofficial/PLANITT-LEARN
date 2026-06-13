# Environment variables reference

Copy **`.env.example`** → **`.env.local`**. Everyone on the team uses the same file.

Planitt **appbackend is not required** for local development. Production deploy uses separate secrets.

---

## Local development (everyone)

| Variable | Required | Description |
|----------|----------|-------------|
| `LEARN_DEV_STANDALONE` | Yes | `true` — local auth without Planitt appbackend |
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
| `DATABASE_URL` | Phase 1+ | PostgreSQL for **Learn DB only** (not Planitt main DB) |
| `LEARN_ADMIN_EMAILS` | Phase 1+ | Comma-separated emails with `/admin` access |
| `LEARN_ENROLLMENT_WEBHOOK_SECRET` | Phase 1+ | Validates enrollment webhooks from appbackend |

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/planitt_learn_dev
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
| `APPBACKEND_URL` | Planitt appbackend (staging or prod) |
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
# DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/planitt_learn_dev
```

---

## Production deploy secrets (hosting / CI only)

```env
DATABASE_URL=postgresql://...
APPBACKEND_URL=https://appbackend.planitt.in
NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
LEARN_ENROLLMENT_WEBHOOK_SECRET=...
LEARN_ADMIN_EMAILS=admin@planitt.in
R2_ACCOUNT_ID=...
# LEARN_DEV_STANDALONE must be false or unset
```

---

## Security rules

1. Never commit `.env.local`
2. Never put production `APPBACKEND_URL` or prod `DATABASE_URL` in the repo
3. Learn DB is separate from Planitt's main trading database
4. `LEARN_DEV_STANDALONE` must never be `true` in production
