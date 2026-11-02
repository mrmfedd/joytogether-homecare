# Preview test report (JoyTogether admin phase)

**Branch:** `upgrade/customer-acquisition-redesign`  
**PR:** [#1](https://github.com/mrmfedd/joytogether-homecare/pull/1)  
**Latest commit:** `1744d4a`  
**Updated:** 2026-11-02  
**Production-ready:** **No**

**Working preview URL:**  
https://joytogether-homecare-git-upgrade-38c1e5-michael-fedds-projects.vercel.app

---

## Executive status

| Area | Result |
|------|--------|
| Vercel Preview build (`1744d4a`) | **Ready / success** |
| Isolated Neon preview DB | **Provisioned** (`joytogether-preview-db` / `lucky-fire-28361357`) — Preview env only |
| Migrations + seed | **Applied** on preview Neon (not production) |
| Lead → DB | **Pass** |
| Private Blob resume upload | **Pass** |
| Resend email to `joytogetherhomecare@gmail.com` | **Blocked** — `RESEND_API_KEY` not set |
| Admin invite created | **Pass** (accept + MFA UI not fully exercised end-to-end in this run) |
| Playwright against preview | **7/7 pass** |
| Merge / production | **Not done** (per instructions) |

---

## Database verification

| Check | Value |
|-------|--------|
| Neon resource | `joytogether-preview-db` (`store_BejypRGqyii19Mw0`) |
| Neon project id | `lucky-fire-28361357` |
| Vercel environments | **preview only** (not Production) |
| `DATABASE_URL` host | `ep-summer-band-bc49hrns-pooler.c-16.us-east-1.aws.neon.tech` |
| `DIRECT_URL` host | `ep-summer-band-bc49hrns.c-16.us-east-1.aws.neon.tech` |
| `npm run verify:db` | Hosts match preview project |
| `prisma migrate deploy` | `20260330120000_init`, `20260330160000_security` applied |
| Seed | Settings, services, service areas, homepage, FAQs |
| Live health | `GET /api/health/db` → `{"database":"connected"}` HTTP 200 |

Production data was **not** accessed. No Production env vars were written for the database.

---

## Successful tests (actual)

1. **HTTPS push** of `7868de0` then `1744d4a` (SSH blocked; remote switched to HTTPS via `gh` auth).
2. **Vercel Preview Ready** for `1744d4a`.
3. **Lead submission:** POST `/api/consultation` → lead `b454df47-…` in preview `Lead` table; notification row `PENDING` (Resend missing).
4. **Job application + Blob:** POST `/api/applications` with PDF → `resumeKey=resumes/d395d05e-….pdf` stored; Blob store `joytogether-preview-blob` (private, Preview).
5. **Playwright** (`PLAYWRIGHT_BASE_URL` = preview): homepage, admin login, contact, services, DB health, lead API, accept-invite route — **7 passed**.
6. **CMS public reads:** hero, services hub, service detail overlay, FAQs (seeded 3), testimonials (DB when published+permission), service areas from DB.

---

## Admin authentication

| Step | Status |
|------|--------|
| `AUTH_SECRET` on Preview | Set |
| Invitation for `joytogetherhomecare@gmail.com` | Created in preview DB (48h token) |
| Accept invite → set password | **Manual** — use the accept URL generated at invite time (re-run script if expired) |
| MFA enroll at `/admin/account` | Code ready; **not completed** in automated run (needs accepted account + authenticator) |
| Password reset email | Needs `RESEND_API_KEY` |

Re-create invite if needed (preview DB only):

```bash
# with preview DATABASE_URL loaded
ADMIN_INVITE_EMAIL=joytogetherhomecare@gmail.com NEXT_PUBLIC_SITE_URL=<preview-url> npx tsx scripts/create-admin-invite.ts
```

---

## Remaining blockers

1. **`RESEND_API_KEY` (Preview)** — required for lead emails, password reset, and invite email delivery to `joytogetherhomecare@gmail.com`. `RESEND_FROM` is set to Resend onboarding sender for preview; replace with a verified domain sender when available.
2. **Authorized resume download** — needs logged-in recruiter/admin session after invite accept.
3. **MFA + password reset** — blocked until admin account is accepted and Resend works.
4. **Consultation scheduling UI** — lead/consultation rows are created; admin scheduling actions need authenticated session.
5. **Testimonials** — no published permission-recorded quotes seeded (policy); publish via admin after login.
6. **ServicesExplorer** modal catalog remains static; hub + detail pages use CMS/DB.

---

## Preview env configured (Preview only)

- Neon: `DATABASE_URL`, `DIRECT_URL`, `DATABASE_URL_UNPOOLED`, related `POSTGRES_*` / `PG*`
- Auth: `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`
- Blob: `BLOB_READ_WRITE_TOKEN`, `BLOB_STORE_ID`, `BLOB_WEBHOOK_PUBLIC_KEY`
- Email: `RESEND_FROM` only (**no** `RESEND_API_KEY`)

---

## Production-readiness assessment

**Not production-ready.** Preview build, isolated DB, migrations, lead persistence, and Blob upload work. Authentication completion, Resend delivery, MFA, and authorized download still need secrets/manual steps. Do **not** merge PR #1 or point Production at this Neon resource without explicit approval.
