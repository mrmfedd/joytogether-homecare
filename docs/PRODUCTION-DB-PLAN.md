# Production database deployment plan (separate Neon)

**Status:** Planning only — do **not** execute without explicit approval.  
**Rule:** Production must never share the Preview Neon project `lucky-fire-28361357` / `joytogether-preview-db`.

## 1. Provision

1. In Vercel Marketplace (or Neon console), create a **new** Neon resource named e.g. `joytogether-production-db`.
2. Connect it to the JoyTogether project for **Production** environment **only**.
3. Confirm Preview remains on `joytogether-preview-db`.

## 2. Environment variables (Production)

Set on Vercel Production (not Preview):

- `DATABASE_URL` (pooled)
- `DIRECT_URL` / `DATABASE_URL_UNPOOLED` (non-pooled for migrations)
- `AUTH_SECRET` (new random secret — do not reuse Preview)
- `RESEND_API_KEY` / `RESEND_FROM` (JoyTogether verified domain after approval)
- `BLOB_READ_WRITE_TOKEN` (production Blob store; prefer separate private store)
- `CRON_SECRET`
- `NEXT_PUBLIC_SITE_URL=https://www.joytogetherhomecare.com`

## 3. Identity check before migrate

```bash
# With Production URLs loaded locally (never mix with preview)
npm run verify:db
```

Confirm hostnames are the **production** Neon endpoint, not `ep-summer-band-bc49hrns…`.

## 4. Migrations & seed

```bash
npx prisma migrate deploy   # apply committed migrations only
npm run db:seed             # settings/services/FAQs — no fictional leads
```

Optional: disable auto-seed on Production by ensuring `VERCEL_ENV=production` does not run seed (current `vercel-build.mjs` seeds Preview only).

## 5. First production administrator

```bash
ADMIN_INVITE_EMAIL=joytogetherhomecare@gmail.com \
NEXT_PUBLIC_SITE_URL=https://www.joytogetherhomecare.com \
npx tsx scripts/create-admin-invite.ts
```

Invite is emailed; do not paste tokens into tickets.

## 6. Cutover checklist

- [ ] `/api/health/db` → connected on production URL
- [ ] Consultation form creates Lead + SENT notification
- [ ] Admin invite accepted + MFA enabled
- [ ] Blob resume upload/download
- [ ] CMS publish reflects on public site
- [ ] Preview still healthy on isolated DB

## 7. Rollback

Keep Preview branch + Preview DB unchanged. Production rollback = previous Vercel deployment + leave DB as-is (avoid destructive resets).
