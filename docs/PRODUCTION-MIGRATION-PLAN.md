# Production Prisma migration plan (approval required)

**Status:** Validated locally — **not applied to production.**  
**Gate:** Owner must approve this document before `npx prisma migrate deploy` on production.

## Scope

Apply committed migrations only to the **new** Neon resource `joytogether-production` (separate from Preview `joytogether-preview-db` / project `lucky-fire-28361357`).

## Migration order

| # | Folder | Purpose |
|---|--------|---------|
| 1 | `20260330120000_init` | Core schema (CMS, leads, auth tables) |
| 2 | `20260330160000_security` | Security hardening migration |
| 3 | `20261102190000_workforce` | Employee portal, scheduling, notices, time clock |
| 4 | `20261103120000_admin_account_recovery` | Operator-initiated admin recovery tokens |
| 5 | `20261103130000_user_session_version` | JWT invalidation via `User.sessionVersion` |
| 6 | `20261103140000_admin_reprovision_invite` | Reprovision invitations for existing SUPER_ADMIN reset |

**Before SUPER_ADMIN reprovision reset:** migrations **4–6** must be applied on Production Neon (`joytogether-production` / `ep-nameless-hall…`). The live app must be deployed with matching code (accept-invite reprovision path + `scripts/reset-production-super-admin.ts`).

Validation command (safe anytime):

```bash
npm run validate:migration-plan
```

Last validated: 2026-11-02 — script reported `ok: true`.

## Pre-migrate checklist

- [ ] `joytogether-production` connected to Vercel **Production only** (Preview still on `joytogether-preview-db`)
- [ ] Production env includes unpooled migration vars (`DATABASE_URL_UNPOOLED` / `POSTGRES_URL_NON_POOLING` from Neon) or `DIRECT_URL`
- [ ] `npm run test:unit -- migration-database-url` — migration URL priority tests pass
- [ ] `VERCEL_ENV=production npm run verify:env-isolation` — **PASS** (no `ep-summer-band-bc49hrns`, no Preview `NEON_PROJECT_ID`)
- [ ] `npm run verify:db` — hosts differ from Preview
- [ ] Neon backup: branch snapshot or `pg_dump` via `DIRECT_URL` to encrypted owner storage
- [ ] No production deploy of redesign branch until migrations approved (separate launch step)

## Apply (owner approval only)

```bash
# Load production URLs only — never mix with .env.preview.local
export $(grep -v '^#' .env.production.local | xargs)  # or dotenv via scripts/load-local-env.ts
npm run verify:db
VERCEL_ENV=production npm run verify:env-isolation
# Uses unpooled URL via prisma.config.ts (DIRECT_URL → DATABASE_URL_UNPOOLED → POSTGRES_URL_NON_POOLING → DATABASE_URL)
npx prisma migrate deploy
npm run db:seed
```

**Vercel Production builds** do **not** run `migrate deploy` unless `RUN_PRODUCTION_MIGRATIONS=true` is set for an approved window. Prefer manual `npx prisma migrate deploy` from an owner machine or a one-off job with unpooled env loaded.

**Do not** run `db:seed` on Preview from this procedure. Vercel build already skips seed when `VERCEL_ENV=production`.

## Post-migrate verification

- [ ] `_prisma_migrations` lists all applied migrations (through `20261103140000_admin_reprovision_invite` before admin reprovision reset)
- [ ] `npx tsx scripts/verify-preview-migrations.ts` pattern adapted for prod (tables exist) or manual `\dt` in SQL editor
- [ ] `/api/health/db` on a **non-customer-facing** production smoke deploy (only after explicit deploy approval)

## First administrator

After seed:

```bash
ADMIN_INVITE_EMAIL=joytogetherhomecare@gmail.com \
NEXT_PUBLIC_SITE_URL=https://www.joytogetherhomecare.com \
npx tsx scripts/create-admin-invite.ts
```

## Rollback

| Issue | Action |
|-------|--------|
| Failed mid-migrate | Restore Neon branch / PITR / dump taken in pre-migrate step; do not point Production at Preview |
| Bad seed data | Truncate affected tables or restore backup; re-run seed if safe |
| Wrong database | Disconnect integration; re-run isolation checks |

## Explicit non-actions (current authorization)

- No `prisma migrate deploy` until you approve this plan
- No merge of PR #1
- No production deploy of the redesign
- No changes to the live marketing site behavior
