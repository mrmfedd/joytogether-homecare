# Final launch checklist — JoyTogether Home Care

**Branch:** `upgrade/customer-acquisition-redesign` (PR #1)  
**Hard bans until explicit owner approval:** merge PR #1, production deploy, production Neon create, production DNS changes.

## Already complete (no further owner action)

| Item | Status |
|------|--------|
| Preview RC critical feature tests | PASS |
| Preview Neon isolated (`joytogether-preview-db`) | Done |
| Preview deploy of RC commit | Verified Ready |
| Accessibility remediation (contrast / ARIA / lists) | Code shipped; re-measure on latest Preview |
| Customer-facing email copy branding (`site.*` contact footer) | Code complete |
| Resend DNS record plan documented | Docs only — not applied |
| Production Neon plan documented | Docs only — not provisioned |
| Env isolation verifier (`npm run verify:env-isolation`) | Available |

## Owner approval required

| # | Action | Risk if skipped | Approve? |
|---|--------|-----------------|----------|
| 1 | **Merge PR #1** into main | Blocks production cutover | ⬜ |
| 2 | **Create separate Neon production DB** (`joytogether-production-db`) and attach **Production-only** | Data isolation / launch blocker | ⬜ |
| 3 | **Run production `prisma migrate deploy` (+ seed)** against the new DB only | Schema missing on prod | ⬜ |
| 4 | **Upgrade Resend / dedicated JoyTogether project** (domain slot) | Cannot verify branded domain | ⬜ |
| 5 | **Publish Resend DNS records** for JoyTogether domain (see `docs/RESEND-DNS-RECORDS.md`) | Branded From / SPF/DKIM fail | ⬜ |
| 6 | **Set Production env vars** (`DATABASE_*`, `AUTH_SECRET`, `RESEND_*`, Blob, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`) | Misconfig / outage | ⬜ |
| 7 | **Deploy Production** (Vercel Production) | Live site cutover | ⬜ |
| 8 | **Accept admin invite** for `joytogetherhomecare@gmail.com` + enable MFA (Preview now; Production after migrate) | No owner admin access | ⬜ |
| 9 | **Point custom domain / DNS apex+www to Vercel Production** (if not already) | Traffic routing | ⬜ |
| 10 | **Confirm Production Lighthouse SEO** (must not inherit Preview `noindex`) | Discoverability | ⬜ |
| 11 | **Post-cutover smoke**: consultation lead, lead email, media, CMS publish, resume auth | Latent prod bugs | ⬜ |

## Explicitly do **not** approve yet (per current instruction)

- Merge PR #1
- Production Neon creation
- Production DNS / Resend DNS publish
- Production deploy

## Credential interchange guard

Before any Production migrate or deploy:

```bash
VERCEL_ENV=production DATABASE_URL=… DIRECT_URL=… npm run verify:env-isolation
npm run verify:db
```

Must **fail** if Preview host marker `ep-summer-band-bc49hrns` or project `lucky-fire-28361357` appears under production context.

## Related docs

- `docs/RESEND-DNS-RECORDS.md`
- `docs/PRODUCTION-NEON-PLAN.md` / `docs/PRODUCTION-DB-PLAN.md`
- `docs/RESEND-SENDER.md`
- `docs/RELEASE-READINESS.md`
