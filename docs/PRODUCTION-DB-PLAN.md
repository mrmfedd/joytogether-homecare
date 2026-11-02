# Production database deployment plan (separate Neon)

**Status:** Planning only — do **not** execute without explicit approval.  
**Rule:** Production must never share the Preview Neon project `lucky-fire-28361357` / `joytogether-preview-db`.  
**Expanded plan:** see also `docs/PRODUCTION-NEON-PLAN.md` (migrations, backup, isolation, rollback detail).

## 1. Provision (owner approval required)

1. In Vercel Marketplace (or Neon console), create a **new** Neon resource named e.g. `joytogether-production-db`.
2. Connect it to the JoyTogether project for **Production** environment **only**.
3. Confirm Preview remains on `joytogether-preview-db`.
4. Do **not** enable the production resource for Preview/Development.

## 2. Environment variables (Production)

Set on Vercel Production (not Preview):

- `DATABASE_URL` (pooled)
- `DIRECT_URL` / `DATABASE_URL_UNPOOLED` (non-pooled for migrations)
- `AUTH_SECRET` (new random secret — do not reuse Preview)
- `RESEND_API_KEY` / `RESEND_FROM` (JoyTogether verified domain after approval)
- `BLOB_READ_WRITE_TOKEN` (production Blob store; prefer separate private store)
- `CRON_SECRET`
- `NEXT_PUBLIC_SITE_URL=https://www.joytogetherhomecare.com`

## 3. Identity / interchange checks before migrate

```bash
# With Production URLs loaded locally (never mix with preview)
npm run verify:db
VERCEL_ENV=production npm run verify:env-isolation
```

Confirm hostnames are the **production** Neon endpoint, not `ep-summer-band-bc49hrns…`.  
`verify:env-isolation` **fails** if Preview host/project markers appear under `VERCEL_ENV=production`.

## 4. Migrations & seed

Committed migrations to apply:

- `20260330120000_init`
- `20260330160000_security`

```bash
npx prisma migrate deploy   # apply committed migrations only
npm run db:seed             # settings/services/FAQs — no fictional leads
```

`scripts/vercel-build.mjs` seeds Preview only (`VERCEL_ENV=production` skips seed). Keep that behavior.

## 5. Backup strategy

| Layer | Action |
|-------|--------|
| Neon PITR / history | Enable/retain per Neon plan before cutover |
| Pre-migrate snapshot | Neon branch or `pg_dump` via `DIRECT_URL` to encrypted owner storage |
| Post-cutover | Schedule periodic dumps; document retention |

## 6. First production administrator

```bash
ADMIN_INVITE_EMAIL=joytogetherhomecare@gmail.com \
NEXT_PUBLIC_SITE_URL=https://www.joytogetherhomecare.com \
npx tsx scripts/create-admin-invite.ts
```

Invite is emailed; do not paste tokens into tickets.

## 7. Cutover checklist

- [ ] `/api/health/db` → connected on production URL
- [ ] Consultation form creates Lead + SENT notification
- [ ] Admin invite accepted + MFA enabled
- [ ] Blob resume upload/download
- [ ] CMS publish reflects on public site
- [ ] Preview still healthy on isolated DB

## 8. Rollback

| Scenario | Action |
|----------|--------|
| Bad app deploy | Vercel rollback; leave DB intact |
| Bad migration | Restore Neon backup / PITR to pre-migrate point |
| Wrong DB wired | Disconnect incorrect resource; re-run `verify:db` / `verify:env-isolation` |
| Never | Point Production at Preview DB as a “fix” |

Keep Preview branch + Preview DB unchanged during Production incidents.
