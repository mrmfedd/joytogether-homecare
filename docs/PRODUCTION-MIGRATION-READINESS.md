# Production migration readiness report

**Date:** 2026-11-02  
**Branch:** `upgrade/customer-acquisition-redesign`  
**PR #1:** Open (not merged)  
**Migrations / seed:** Not run  
**Production deploy / DNS / live site:** Unchanged  

## Verdict

| Question | Answer |
|----------|--------|
| Is `joytogether-production` connected to `joytogether-homecare` for **Production only**? | **Yes** — Vercel integration + env scope verified |
| Is Preview still on `joytogether-preview-db` only? | **Yes** — Neon vars remain **Preview**-scoped |
| Are Production and Preview Neon identities distinct? | **Yes** (Preview markers unchanged; Production has separate integration) |
| Is the database ready for an **approved** `prisma migrate deploy`? | **Yes** — wiring + unpooled migration URL selection fixed; take backup snapshot before migrate |

**Overall:** **Migration-ready after you approve `docs/PRODUCTION-MIGRATION-PLAN.md`**, with pre-migrate backup recommended (see backup section).

---

## 1. Vercel connection & environment variables

### Integrations (team)

| Resource | Linked project |
|----------|----------------|
| `joytogether-production` | `joytogether-homecare` |
| `joytogether-preview-db` | `joytogether-homecare` |

### Production env (scoped **Production** only)

Present (names only, no values): `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_PROJECT_ID`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, plus related `POSTGRES_*` / `PG*` vars, and app secrets `AUTH_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`.

Also injected by Neon integration (review): `NEON_AUTH_BASE_URL`, `VITE_NEON_AUTH_URL` — JoyTogether uses **NextAuth + Prisma**; disable or ignore Neon Auth if not needed.

**Note:** Prisma migrations read connection URLs via `scripts/migration-database-url.mjs` in this order: `DIRECT_URL` → `DATABASE_URL_UNPOOLED` → `POSTGRES_URL_NON_POOLING` → `DATABASE_URL`. Vercel Production Neon injects the unpooled vars; `DIRECT_URL` is optional. **Production Vercel builds skip `migrate deploy`** unless `RUN_PRODUCTION_MIGRATIONS=true` during an approved window.

### Preview env (unchanged)

All Neon-related variables remain **Preview**-only, including:

- Host marker: `ep-summer-band-bc49hrns…`
- `NEON_PROJECT_ID`: `lucky-fire-28361357`

Automated check: `npm run verify:production-wiring` → **PASS**

---

## 2. Identity comparison (no credentials)

| | Preview (`joytogether-preview-db`) | Production (`joytogether-production`) |
|---|-------------------------------------|----------------------------------------|
| Pooled host | `ep-summer-band-bc49hrns-pooler.c-16.us-east-1.aws.neon.tech` | *(integration secret — distinct endpoint)* |
| Unpooled host | `ep-summer-band-bc49hrns.c-16.us-east-1.aws.neon.tech` | *(integration secret — distinct endpoint)* |
| Neon project ID | `lucky-fire-28361357` | *(set on Production — not equal to Preview)* |

Commands:

```bash
npm run compare:db-identities      # from pulled .env.*.local when values populated
npm run verify:production-wiring   # Vercel scope + integration linkage (no secrets)
```

Vercel `env pull` leaves integration-managed URLs as empty placeholders locally; runtime on Vercel Production has the real values.

---

## 3. Isolation scripts

Run with **Production** pulled env only (avoid mixing `.env.local` Preview URLs):

```bash
vercel env pull .env.production.local --environment=production
set -a && source .env.production.local && set +a
VERCEL_ENV=production npm run verify:env-isolation
npm run verify:db
```

When Production URLs are loaded at runtime (Vercel deploy), `verify:env-isolation` must **not** contain Preview host marker `ep-summer-band-bc49hrns` or project `lucky-fire-28361357`.

Local CLI note: with empty pulled placeholders, isolation passes on “no DB vars loaded” — **authoritative pass is `verify:production-wiring` + Production deployment env.**

Preview check (unchanged): `VERCEL_ENV=preview` + Preview env → **PASS** against Preview markers.

---

## 4. Read-only Production connectivity & empty database

| Check | Result |
|-------|--------|
| `npm run verify:production-connectivity` (local `.env.production.local`) | **Blocked locally** — integration secrets not exported in `env pull` |
| Expected state before migrate | **Empty** public schema (new Neon project; no `_prisma_migrations` until deploy) |

**Optional owner verification (read-only):** Vercel → Storage → `joytogether-production` → **Browse data** → SQL:  
`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`  
Expect **no application tables** until migrate.

Or export `DATABASE_URL` once from Neon console into a local gitignored file and run:

```bash
DATABASE_URL=... DATABASE_URL_UNPOOLED=... npx tsx scripts/verify-production-connectivity.ts
```

No migrations or seed were executed in this pass.

---

## 5. Prisma migration plan

Document: **`docs/PRODUCTION-MIGRATION-PLAN.md`**

| Step | Migration |
|------|-----------|
| 1 | `20260330120000_init` |
| 2 | `20260330160000_security` |
| 3 | `20261102190000_workforce` |

`npm run validate:migration-plan` → **PASS** (ordering, SQL files, `prisma validate`).

**Do not** run `npx prisma migrate deploy` or `npm run db:seed` until you explicitly approve the migration plan.

---

## 6. Backup & restore (joytogether-production)

Current tier: **Neon Free** (via Vercel provisioning).

| Capability | Free plan |
|------------|-----------|
| Instant restore / PITR history | **6 hours** max (up to 1 GB WAL) |
| Manual snapshots | **1** |
| Scheduled backup schedules | Paid plans |

**Before first production migrate:** create the **manual snapshot** (uses the one Free slot) or upgrade to **Launch** for longer history; optional `pg_dump` via unpooled URL to owner storage.

---

## 7. Explicit non-actions

- PR #1 **not merged**
- Redesign **not deployed** to production
- **No** `migrate deploy` / **no** seed
- **No** DNS or live website changes

---

## 8. Recommended next steps

1. **Approve** `docs/PRODUCTION-MIGRATION-PLAN.md`
2. Neon **snapshot** (or plan upgrade) immediately before migrate window
3. Run `npx prisma migrate deploy` then `npm run db:seed` on Production (approved window only)
4. Create **production Blob** store + env vars; **Resend** after DNS approval
5. Admin invite + MFA; then separate decision on PR #1 / production deploy

---

## Verification commands (summary)

```bash
npm run verify:production-wiring
npm run validate:migration-plan
npm run compare:db-identities          # after optional Neon URL export
npm run verify:production-connectivity # after optional Neon URL export
```
