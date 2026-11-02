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

Validation command (safe anytime):

```bash
npm run validate:migration-plan
```

Last validated: 2026-11-02 — script reported `ok: true`.

## Pre-migrate checklist

- [ ] `joytogether-production` connected to Vercel **Production only** (Preview still on `joytogether-preview-db`)
- [ ] `vercel env pull .env.production.local --environment=production` includes `DATABASE_URL` / `DIRECT_URL` (or unpooled equivalents)
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
npx prisma migrate deploy
npm run db:seed
```

**Do not** run `db:seed` on Preview from this procedure. Vercel build already skips seed when `VERCEL_ENV=production`.

## Post-migrate verification

- [ ] `_prisma_migrations` lists all three migrations
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
