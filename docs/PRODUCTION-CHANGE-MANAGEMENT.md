# Production change-management procedure

**Site:** https://www.joytogetherhomecare.com  
**Repo:** `mrmfedd/joytogether-homecare`  
**Production Neon:** `weathered-term-63569834` only  

---

## Principles

1. **Preview first** — merge to a feature branch; validate Vercel Preview + Preview Neon.  
2. **Backup before database writes** — Neon manual snapshot (record ID/time).  
3. **Separate app rollback from DB rollback** — Vercel promote vs Neon restore.  
4. **No secrets in git** — Vercel env + gitignored local env files.  
5. **Owner approval** for Production merges, migrations, seeds, invites, and infra.

---

## Standard release flow

| Step | Action | Owner |
|------|--------|-------|
| 1 | Open PR to `main`; CI/Vercel Preview green on **final** commit | Dev |
| 2 | Document migration list (`prisma/migrations`) | Dev |
| 3 | Neon snapshot on Production **`main`** branch | Operator |
| 4 | Merge PR | Owner approves |
| 5 | Wait Vercel Production **Ready** on merge commit | Dev |
| 6 | `prisma migrate deploy` with **unpooled** Production URL (`JT_PROD_ENV_FILE`) | Operator |
| 7 | Idempotent seeds if required (e.g. Help Center script) | Operator |
| 8 | Run `production-readonly-smoke.mjs`; owner spot-check critical paths | Dev + Owner |
| 9 | Update acceptance/deploy docs with SHA and backup reference | Dev |

**Production builds skip migrate by default** unless `RUN_PRODUCTION_MIGRATIONS=true` — prefer **operator-run** migrate after merge (PR #3 pattern).

---

## Rollback

| Scenario | Action |
|----------|--------|
| Bad deploy, good DB | Vercel → promote prior deployment (`17748d9` pre–PR #3, or last known-good) |
| Bad migration / data | Neon restore from snapshot → verify env URLs → assess migrate |
| Help content only | Re-run seed or SUPER_ADMIN Help CMS (SUPER_ADMIN) |

See `docs/BACKUP-RECOVERY-RUNBOOK.md`.

---

## Forbidden without explicit authorization

- Force-push `main`
- Point Production `DATABASE_URL` at Preview
- Run `prisma migrate reset` on Production
- Bootstrap or temporary super-admin endpoints
- Bulk delete leads, employees, or users
- Disable MFA globally
- Automatic secret rotation in CI

---

## Documentation updates

After each Production release, update:

- `docs/PRODUCTION-ACCEPTANCE-REPORT.md` (or addendum with date + SHA)
- Migration/help counts if changed
- `docs/PR*-QA-REPORT.md` when QA was performed

---

## Current baseline (accepted 2026-11-04)

| Item | Value |
|------|--------|
| PR #3 merge | `c8a4007` |
| Migrations | 8 (includes `staff_notice_archive`) |
| Help counts | 25 / 26 / 24 |
| Next planned change | Owner ADMIN invite (`joytogetherhomecare@gmail.com`) — **pending approval**
