# Production infrastructure preparation report

**Date:** 2026-11-02  
**Authorization:** Infrastructure preparation only (no production deploy, no migrations, no DNS edits, no PR #1 merge)

## Executive summary

| Area | Status |
|------|--------|
| Neon `joytogether-production` resource | **Created** (Vercel Storage, Available) |
| Connected to `joytogether-homecare` Production | **Pending** — one manual connect step (see below) |
| Production app env (non-DB) | **Partially set** on Vercel Production |
| Preview DB isolation | **Verified** — Preview-only Neon vars; Production has no `DATABASE_URL` yet |
| Prisma migration plan | **Prepared & validated** (`npm run validate:migration-plan`) |
| Resend / DNS | **Prepared for review** — no records published |
| Live site / production deploy | **Unchanged** |

---

## 1. Database isolation

### Preview (unchanged)

- Resource: `joytogether-preview-db`
- Neon project marker: `lucky-fire-28361357`
- Host marker: `ep-summer-band-bc49hrns`
- Vercel: **29 environment variables**, all scoped to **Preview** only (including `DATABASE_URL`, `NEON_PROJECT_ID`, Blob, Auth, Resend)

### Production Neon

- Resource name: **`joytogether-production`**
- Provisioning: Vercel → Storage → Neon (team marketplace)
- Region: **Washington, D.C. (iad1)** per create flow
- **Not** the Preview project `lucky-fire-28361357`

### Connect blocker (automation)

Vercel requires **Production-only** when attaching the second Neon database. If **Preview** is also checked, the UI errors because Preview already owns `POSTGRES_URL` / `DATABASE_URL`.

**Owner action (≈1 minute):**

1. Vercel → **Storage** → search **`joytogether-production`**
2. **Connect Project** → select **`joytogether-homecare`** (existing project, not “Create Project…”)
3. Environments: **Production only** — uncheck Preview
4. Custom prefix: **leave empty** (standard `DATABASE_URL` / `DIRECT_URL` names)
5. **Connect Project**

Then verify (use **only** production pulled env — do not load Preview URLs from `.env.local`):

```bash
cd joytogether-homecare   # linked Vercel project
vercel env ls production   # should list DATABASE_URL, NEON_PROJECT_ID, etc.
vercel env pull .env.production.local --environment=production
set -a && source .env.production.local && set +a
VERCEL_ENV=production npm run verify:env-isolation
npm run verify:db
```

Expected: Production hosts **do not** contain `ep-summer-band-bc49hrns`; `NEON_PROJECT_ID` ≠ `lucky-fire-28361357`.

---

## 2. Backup and recovery

### Current plan tier

`joytogether-production` was created on Neon **Free** via Vercel. Free projects have **limited** history compared to paid plans (no long-retention PITR). Treat Free as **adequate for empty pre-migrate database**, not for production cutover without upgrade.

### Recommended before first `migrate deploy`

| Step | Purpose |
|------|---------|
| Upgrade Neon to **Launch** (or document accepted Free limits) | Longer PITR / branch retention for production |
| Create a **Neon branch** snapshot immediately before migrate | Fast rollback pointer |
| Optional **`pg_dump`** via `DIRECT_URL` to encrypted owner storage | Logical backup off-platform |
| Document restore owner | Neon console restore or branch reset |

### After cutover

- Schedule periodic logical dumps (owner-managed retention)
- Keep Preview DB and branch **unchanged** during production incidents (never “fix” prod by pointing at Preview)

**Neon Auth:** If the integration enabled “Neon Auth”, JoyTogether uses **NextAuth + Prisma** — disable or ignore Neon Auth in integration settings to avoid duplicate auth stacks.

---

## 3. Production Vercel environment variables

### Set on Production (2026-11-02)

| Variable | Notes |
|----------|--------|
| `AUTH_SECRET` | **New** random secret (not shared with Preview) |
| `CRON_SECRET` | **New** random secret |
| `NEXT_PUBLIC_SITE_URL` | `https://www.joytogetherhomecare.com` |

### Pending after Neon connect

Auto-injected by Neon integration (Production only): `DATABASE_URL`, `DIRECT_URL` / unpooled variants, `NEON_PROJECT_ID`, `POSTGRES_*`, etc.

### Pending before cutover (owner / follow-up)

| Variable | Notes |
|----------|--------|
| `RESEND_API_KEY` / `RESEND_FROM` | After JoyTogether Resend domain verified |
| `BLOB_READ_WRITE_TOKEN`, `BLOB_STORE_ID`, … | **Separate production Blob store** (Preview store must not be reused) |
| `BLOB_WEBHOOK_PUBLIC_KEY` | If webhooks used in production |

Preview retains its existing values; Production must never copy Preview secrets.

---

## 4. Prisma migration plan

- Document: `docs/PRODUCTION-MIGRATION-PLAN.md`
- Validator: `npm run validate:migration-plan` → **PASS** (three migrations, SQL present, `prisma validate` OK)
- **Not executed:** `prisma migrate deploy` on production

---

## 5. Resend sending domain (review only — DNS not modified)

Full record tables and approval gate: **`docs/RESEND-DNS-RECORDS.md`**

Summary:

- Proposed domain: `joytogetherhomecare.com` or subdomain `mail.joytogetherhomecare.com`
- Blocker: shared Preview Resend account at **domain limit** — need dedicated JoyTogether Resend project or plan upgrade before Resend shows DKIM `p=…`
- Required records (after domain added in Resend): `send` MX + SPF TXT, `resend._domainkey` TXT (exact DKIM from dashboard), optional `_dmarc`
- **No DNS records were added** in this work

---

## 6. Explicit non-actions (confirmed)

- PR #1 **not merged**
- Redesign **not deployed** to production
- **No** production migrations run
- **No** changes to current live website
- **No** DNS edits

---

## 7. Remaining launch steps (ordered)

1. Complete **Neon → Production-only** connect (section 1)
2. Run **isolation checks** (`verify:env-isolation`, `verify:db`)
3. **Approve** `docs/PRODUCTION-MIGRATION-PLAN.md`
4. Upgrade **Neon backup** posture if required; take pre-migrate snapshot
5. Run **`prisma migrate deploy`** + **`db:seed`** on production (approved window only)
6. Create **production Blob** store; set Production Blob env vars
7. Resend: dedicated project → owner **DNS approval** → verify domain → set Production Resend env
8. Owner: accept **admin invite** + **MFA**
9. Separate decision: merge PR #1, production deploy, domain cutover to redesign (out of scope for this infra pass)

---

## References

- `docs/PRODUCTION-NEON-PLAN.md`, `docs/PRODUCTION-DB-PLAN.md`
- `scripts/verify-env-isolation.ts`, `scripts/verify-db-identity.ts`
- `scripts/validate-migration-plan.ts`
