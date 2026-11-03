# Production database initialization report

**Date:** 2026-11-02 (America/New_York)  
**Branch:** `upgrade/customer-acquisition-redesign`  
**Neon project:** `weathered-term-63569834` (`joytogether-production`)  
**Branch ID:** `br-tiny-star-bbs3kov4` (main)  
**Preview isolation:** Preview remains `lucky-fire-28361357` / `joytogether-preview-db` — not modified.

## Phase 1 — Safety checks (PASS)

| Check | Result |
|-------|--------|
| Production Neon → Vercel Production only | PASS (`verify:production-wiring`) |
| Preview Neon → Preview only | PASS |
| Production identity | PASS — Neon `weathered-term-63569834`, endpoint `ep-nameless-hall-bb84dosp…` (≠ Preview `ep-summer-band-bc49hrns`) |
| App `public` schema before migrate | Empty (only `neon_auth` provisioning) |
| Migration URL selection | PASS — `DATABASE_URL_UNPOOLED`, unpooled host used for `migrate deploy` |
| Migration plan / order | PASS — init → security → workforce; no destructive SQL in migration files |
| Production build migrate guard | PASS — skips unless `RUN_PRODUCTION_MIGRATIONS=true` |

## Phase 2 — Recovery snapshot (PASS)

| Field | Value |
|-------|--------|
| Snapshot name | `main at 2026-11-02 21:29:22 UTC (manual)` |
| Project | `weathered-term-63569834` |
| Branch | `main` (`br-tiny-star-bbs3kov4`) |
| Restore UI | Neon Console → Backup & Restore → snapshot row → **Restore** |

**Recovery (owner):**

1. Neon Console → project **joytogether-production** → **Backup & Restore**.
2. Select snapshot **`main at 2026-11-02 21:29:22 UTC (manual)`** → restore to a new branch or follow Neon PITR (6h on Free tier).
3. Do **not** point Vercel Production at Preview.

Free tier: one manual snapshot slot used; PITR window ~6 hours.

## Phase 3 — Migrations (PASS)

Command: `npx prisma migrate deploy` via `scripts/run-production-db-init.mjs` with unpooled URL.

Applied:

1. `20260330120000_init`
2. `20260330160000_security`
3. `20261102190000_workforce`

Datasource host (unpooled): `ep-nameless-hall-bb84dosp.c-15.us-east-1.aws.neon.tech`  
`neon_auth` schema not targeted by Prisma migrations.

## Phase 4 — Seed (PASS)

`npx prisma db seed` — idempotent upserts only (settings, services, service areas, homepage content, FAQs). No fictional leads, employees, shifts, or testimonials.

## Explicit non-actions (unchanged)

- PR #1 **not merged**
- Redesign **not deployed** to production
- **No** DNS / live site changes
- Preview database **not** migrated by this procedure

## Post-init recommended steps

1. **Rotate** Neon database password (connection string was used in an automated session; treat as sensitive).
2. Run `ADMIN_INVITE_EMAIL=… NEXT_PUBLIC_SITE_URL=https://www.joytogetherhomecare.com npx tsx scripts/create-admin-invite.ts` against Production when ready.
3. Production Blob + Resend DNS per launch checklist (separate approval).
4. Delete local `/tmp/jt-prod-db.env` if recreated for verification (init script deletes when `JT_PROD_ENV_FILE_DELETE=true`).
