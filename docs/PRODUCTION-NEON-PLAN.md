# Separate Neon production database — plan only

**Status:** Planning document. **No production Neon resource has been created.**  
**Hard rule:** Never reuse Preview project `lucky-fire-28361357` / `joytogether-preview-db`.

## 1. Environment isolation

| Environment | Neon resource | Vercel env target | Notes |
|-------------|---------------|-------------------|-------|
| Preview | `joytogether-preview-db` (`lucky-fire-28361357`) | Preview only | Already live |
| Production | `joytogether-production-db` (**to create**) | Production only | Requires owner approval |
| Development | Local / optional Neon branch | Development | Optional |

### Anti-interchange controls

1. Distinct resource names and Neon project IDs.
2. Vercel Marketplace connect **Production-only** for the new DB (never “all environments”).
3. Run `npm run verify:db` and compare hosts before any migrate:
   - Preview host contains `ep-summer-band-bc49hrns`
   - Production host must be a **different** `ep-…` endpoint
4. Optional gate script: `npm run verify:env-isolation` (fails if Preview host appears under `VERCEL_ENV=production`).
5. Separate `AUTH_SECRET`, Blob store, and Resend key for Production.

## 2. Provisioning steps (after approval)

1. Vercel → Storage / Integrations → Neon → create `joytogether-production-db`.
2. Connect to project `joytogether-homecare` with environment **`production` only**.
3. Set/confirm Production: `DATABASE_URL`, `DIRECT_URL` (or `DATABASE_URL_UNPOOLED`).
4. Confirm Preview still lists only `joytogether-preview-db`.

## 3. Migrations

```bash
# Load PRODUCTION URLs only
npm run verify:db
npx prisma migrate deploy
npm run db:seed   # settings/services/FAQs — no fictional leads
```

`scripts/vercel-build.mjs` already seeds **Preview only** (`VERCEL_ENV=production` skips seed). Keep that behavior.

Committed migrations:

- `20260330120000_init`
- `20260330160000_security`

## 4. Backup strategy

| Layer | Action |
|-------|--------|
| Neon PITR / history | Enable on paid plan if available; note retention window |
| Logical dump before risky ops | `pg_dump` via `DIRECT_URL` to encrypted storage (owner-managed) |
| Pre-migrate snapshot | Create Neon branch or manual backup immediately before first production migrate |
| Blob | Production Blob store is separate; resume keys are not in Postgres dumps alone |

## 5. Rollback procedures

| Scenario | Rollback |
|----------|----------|
| Bad app deploy | Vercel rollback to previous Production deployment (DB untouched) |
| Bad migration | Restore Neon backup / PITR to pre-migrate point; **do not** point Production at Preview DB |
| Data corruption | Restore dump; rotate credentials if compromise suspected |
| Wrong env wiring | Disconnect incorrect Neon resource; re-verify hosts with `verify:db` |

Never “fix” by copying Preview data into Production without an explicit data-migration plan.

## 6. First admin on production

After migrate/seed:

```bash
ADMIN_INVITE_EMAIL=joytogetherhomecare@gmail.com \
NEXT_PUBLIC_SITE_URL=https://www.joytogetherhomecare.com \
npx tsx scripts/create-admin-invite.ts
```

Invite is emailed; do not paste tokens into tickets or docs.

## 7. Approval gate

**Owner must explicitly approve** before creating the production Neon resource or running production migrations.
