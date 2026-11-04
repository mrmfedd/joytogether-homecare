# Backup and recovery runbook — Production Neon

**Project ID:** `weathered-term-63569834`  
**Project name:** `joytogether-production`  
**Primary branch:** `main` (branch ID **`br-tiny-star-bbs3kov4`** per init report)  
**Endpoint marker:** `ep-nameless-hall` (Production — never confuse with Preview `ep-summer-band`)

---

## What to back up before risky work

- Schema/data migrations (`prisma migrate deploy`)
- Bulk Help Center re-seeds
- Administrator reprovision or workforce bulk imports
- Any manual SQL in Neon

**Do not** create, delete, or restore snapshots without explicit authorization.

---

## Snapshot verification status

| Snapshot | Status | Notes |
|----------|--------|-------|
| `main at 2026-11-02 21:29:22 UTC (manual)` | **Documented** | See `docs/PRODUCTION-DB-INIT-REPORT.md` |
| Fresh pre–PR #3 snapshot (operator-created) | **Unverified by automation** | Neon OAuth on this machine fails; **Snapshot ID and creation time not recorded in repo** |

### Obtain metadata in Neon Console (authorized operator)

1. Sign in to [Neon Console](https://console.neon.tech).
2. Open project **`weathered-term-63569834`** (`joytogether-production`).
3. Go to **Backup & Restore**.
4. Locate the manual snapshot taken **before PR #3 merge** (2026-11-04 window).
5. Record in your change log (not in git):

   - **Snapshot ID** (Neon-assigned identifier)
   - **Creation date/time (UTC)**
   - **Branch** (typically `main`)
   - **Recovery method:** Console → **Restore** (to new branch or replace per Neon UI)
   - **Retention:** Free tier — one manual snapshot slot; **PITR ~6 hours** (confirm current plan in Console)

### Optional CLI (after `neonctl auth`)

```bash
neonctl snapshots list --project-id weathered-term-63569834
```

Paste snapshot ID and timestamp into `docs/PRODUCTION-ACCEPTANCE-REPORT.md` or your internal ops log only.

---

## Application rollback (no database restore)

If the **code** deploy is bad but the database is fine:

1. Vercel → **joytogether-homecare** → Deployments → Production.
2. Promote the last known-good deployment:
   - Pre–PR #3: commit **`17748d9`**
   - PR #3 merge: **`c8a4007`**
3. Confirm https://www.joytogetherhomecare.com and `/api/health/db`.

---

## Database restore (destructive — authorization required)

1. **Stop** writes if possible (maintenance window messaging).
2. Neon Console → **Backup & Restore** → select verified snapshot → **Restore** per Neon docs.
3. Confirm Vercel Production **`DATABASE_URL`** still points at the restored branch/endpoint.
4. Run read-only verify:  
   `JT_PROD_ENV_FILE=~/.config/joytogether/production-neon.env npx tsx scripts/verify-production-db-readonly.ts`
5. Re-run **`prisma migrate deploy`** only if restore landed on an older schema (operator decision).

**Never** point Production env vars at Preview Neon.

---

## Post-recovery checks

- `/api/health/db` → `connected`
- Administrator and employee login pages → 200
- Migration count matches expectation (`scripts/list-prod-migrations.ts`)
- Bootstrap route remains absent: `/api/bootstrap-super-admin` → 404
