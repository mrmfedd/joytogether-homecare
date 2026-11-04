# Routine maintenance checklist — JoyTogether Production

Use this list weekly (or after any deploy). **Read-only checks** unless noted.

---

## Production website

- [ ] https://www.joytogetherhomecare.com loads (home, contact, services, apply/careers).
- [ ] TLS certificate valid (browser padlock).
- [ ] No unexpected maintenance banners in CMS.

## Database

- [ ] `GET /api/health/db` → `"database":"connected"` (or run `production-readonly-smoke.mjs`).
- [ ] Neon Console: project **`weathered-term-63569834`** healthy; storage within plan limits.
- [ ] **Backup:** manual snapshot current before major changes (`docs/BACKUP-RECOVERY-RUNBOOK.md`).

## Email (Resend)

- [ ] Vercel Production has `RESEND_API_KEY` and `RESEND_FROM` (JoyTogether sender).
- [ ] Send a **test admin or employee invite** only in approved windows (consumes real invite).
- [ ] Monitor Resend dashboard for bounces/spam complaints.

## Blob storage

- [ ] Vercel Production `BLOB_READ_WRITE_TOKEN` present.
- [ ] Upload/replace one **media** asset in admin (authorized) if validating after infra change.
- [ ] Job application resume download works for SUPER_ADMIN/ADMIN/RECRUITER (authorized test).

## Authentication

- [ ] `/admin/login` and `/employee/login` → 200.
- [ ] Unauthenticated `/admin` and `/employee` routes redirect to login (smoke script).
- [ ] `/api/bootstrap-super-admin` → **404**.

## Workforce operations

- [ ] Spot-check **scheduling**, **open shifts**, **time-off**, **notices** after process changes.
- [ ] Credential expiration alerts (employee credentials with `expiresAt`) reviewed in **Employees**.

## Errors and notifications

- [ ] Vercel **Logs** / **Observability** for 5xx spikes after deploys.
- [ ] Failed notification patterns in application logs (Resend errors).
- [ ] Settings → notification health if exposed in admin UI.

## Security audit events

- [ ] Periodically export or query **`AuditLog`** for unexpected LOGIN failures or privilege changes (database tool — no in-app viewer yet).
- [ ] Confirm no new public API routes bypass `requireAdminSession` / employee session.

## Credential expiration (operators)

- [ ] Neon database password rotation policy (rotate if exposed; update Vercel + local env file).
- [ ] Resend API key rotation annually or on compromise.
- [ ] `AUTH_SECRET` unchanged unless coordinated re-login acceptable.

---

**Do not** add cron jobs, new Neon branches, or Resend domains without explicit approval.

**Script:** `node scripts/production-readonly-smoke.mjs` — quick HTTP regression.
