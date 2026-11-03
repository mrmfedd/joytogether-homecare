# Post-CI deployment readiness (PR #1)

**Updated:** 2026-11-03 after Preview CI migration fix.

## Production environment (owner-verified — do not recreate)

Vercel **Production** for `joytogether-homecare` already has:

- `DATABASE_URL` (Neon production)
- `AUTH_SECRET`
- `CRON_SECRET`
- `RESEND_API_KEY` + `RESEND_FROM`
- `BLOB_READ_WRITE_TOKEN` (private production Blob store)

No new Neon, Blob, or Resend resources are required for cutover.

## Migration behavior (after CI fix)

| Context | `prisma migrate deploy` during build |
|---------|--------------------------------------|
| GitHub Preview CI | **Skipped** (localhost URLs + no `VERCEL_ENV`; optional `SKIP_MIGRATIONS`) |
| Local `npm run build` | **Skipped** |
| Vercel Preview | **Runs** when real Neon URL (not localhost) |
| Vercel Production | **Skipped** unless `RUN_PRODUCTION_MIGRATIONS=true` |

## After GitHub + Vercel Preview are green on the same commit

1. Merge **PR #1** (owner approval).
2. Vercel **Production** deploy from `main`.
3. Smoke-test: public site, `/admin/login`, employee portal, consultation/apply forms, mobile nav, `/api/health/db`.
4. SUPER_ADMIN invite: `ADMIN_INVITE_EMAIL=mrmfedd@gmail.com` + `ADMIN_INVITE_ROLE=SUPER_ADMIN` via `scripts/create-admin-invite.ts` (Production env only).
5. Owner ADMIN invite from `/admin/users` for `joytogetherhomecare@gmail.com`.

## Rollback

- Vercel: redeploy previous **`main`** production deployment (`9cb1c95` era marketing site).
- DB: Neon snapshot **`main at 2026-11-02 21:29:22 UTC (manual)`**.
