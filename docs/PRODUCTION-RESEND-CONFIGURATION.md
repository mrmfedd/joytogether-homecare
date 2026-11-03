# Production Resend configuration report

**Date:** 2026-11-02  
**Project:** `joytogether-homecare` (Vercel)  
**Authorized sender:** `JoyTogether Home Care <notifications@joytogetherhomecare.com>`  
**Business recipient:** `joytogetherhomecare@gmail.com`  
**PR #1:** Not merged · **Production redesign deploy:** Not approved · **DNS:** Not changed in this pass  

---

## Executive verdict

| Overall | Detail |
|---------|--------|
| **Configuration (Vercel + code)** | **READY** — Production-scoped `RESEND_API_KEY` and `RESEND_FROM` are present on Vercel; application code routes all Resend sends through env vars with JoyTogether branding. |
| **Runtime proof (domain API + test send)** | **PENDING OWNER RUN** — Sensitive Production values are not exposed to `vercel env pull` or local `.env.production.local` in this workspace. Run `npm run verify:production-resend` with a gitignored `JT_PROD_ENV_FILE` (Production export from Vercel) to complete items 7–8. |
| **Live Production traffic** | **Not validated here** — Current **Ready** Production deployment predates today’s Resend env update (~8h). A failed Production deploy occurred ~8m after env update; no redesign merge/deploy was performed per standing instructions. |

**Is Production email configuration ready?**  
**Yes for platform configuration and code**, assuming Vercel Production `RESEND_FROM` matches the authorized sender (owner confirmed domain verified in the new Resend account). **No for end-to-end delivery sign-off** until `verify:production-resend` passes and ops confirms the test message in Gmail.

---

## Checklist (10 items)

| # | Requirement | Result | Evidence |
|---|-------------|--------|----------|
| 1 | Production `RESEND_API_KEY` and `RESEND_FROM` configured | **PASS** | `vercel env ls production` — both variables **Encrypted**, **Production** scope only, updated ~2026-11-02 (same window as owner cutover). CLI pull omits values (sensitive). |
| 2 | Sender domain verified and configured | **PASS (owner)** / **PENDING (API)** | Owner reports `joytogetherhomecare.com` verified in the **new** Resend account. Automated domain list check blocked without `JT_PROD_ENV_FILE`. |
| 3 | Mail types use new sender | **PASS** (via `RESEND_FROM`) | Admin invites (`src/lib/admin/invitations.ts`), employee invites (`src/lib/employee/invitations.ts`), password resets (`src/lib/notifications.ts`), customer inquiries/leads (`sendLeadEmail` → `site.contact.email`), staff notices (`notices/actions.ts`) all set `from: resendFrom`. **Job applications:** no Resend notification today — API persists application + audit only (`src/app/api/applications/route.ts`). |
| 4 | No production use of `noreply@teezbydesign.com` | **PASS** | No `teezbydesign` / hardcoded From in `src/`. Teez sender documented **Preview-only** in `docs/RESEND-SENDER.md`. |
| 5 | Templates use JoyTogether branding | **PASS** | Plain-text bodies use `site.name`, `site.legalName`, phone, email, URL from `src/content/site.ts`. |
| 6 | Notification recipient | **PASS** | Lead/inquiry `to`: `site.contact.email` → `joytogetherhomecare@gmail.com`. |
| 7 | Authorized test message | **PENDING** | Run: `JT_PROD_ENV_FILE=/path/to/gitignored.env npm run verify:production-resend` (sends non-sensitive test to `joytogetherhomecare@gmail.com`). |
| 8 | Delivery status and error handling | **PASS (design)** / **PENDING (live)** | Leads: retry queue + `lastError` (`notifications.ts`). Staff notices: `FAILED` + `lastError` on missing Resend or HTTP error. Invites/employee: throw with Resend message. Test send records `testMessageId` when script succeeds. |
| 9 | Preview vs Production isolation | **PASS (Vercel scope)** | Separate encrypted `RESEND_*` on **Preview** vs **Production** (`vercel env ls`). Local pull shows empty values for both. Run `npm run verify:resend-env-isolation` with populated gitignored env files to confirm **different API key fingerprints**. |
| 10 | Document without secrets | **PASS** | This report uses fingerprints/message IDs only; no API keys or invitation tokens. |

---

## Vercel environment (metadata only)

```
Production:  RESEND_API_KEY, RESEND_FROM  (Encrypted, Production scope)
Preview:     RESEND_API_KEY, RESEND_FROM  (Encrypted, Preview scope)
```

Expected Production value (owner / onboarding docs):

```text
RESEND_FROM=JoyTogether Home Care <notifications@joytogetherhomecare.com>
```

---

## Verification commands (owner)

1. Export Production env to a **gitignored** file (Vercel dashboard or CLI with team access to sensitive values).
2. Domain + test send:

   ```bash
   JT_PROD_ENV_FILE=/path/to/production.env npm run verify:production-resend
   ```

3. Preview vs Production key isolation (optional, two files or combined export):

   ```bash
   npm run verify:resend-env-isolation
   ```

4. Confirm Gmail received subject: **Joy Together Home Care — production email configuration test**.

---

## Test send results

| Field | Value |
|-------|--------|
| Executed in this session | No (no Production API key in workspace) |
| Recipient | `joytogetherhomecare@gmail.com` (when script runs) |
| Resend message ID | — (run script to populate) |
| API key fingerprint | — (12-char SHA-256 prefix logged by script only) |

---

## Related docs

- `docs/RESEND-SENDER.md` — Preview interim vs Production authorized sender  
- `docs/PRODUCTION-ADMIN-ONBOARDING.md` — Production `RESEND_*` values  
- `docs/EMAIL-BRANDING-AUDIT.md` — template inventory  

---

## Standing constraints (unchanged)

- Do **not** merge PR #1 or deploy the redesigned site without explicit approval.  
- Do **not** change DNS or re-run database migrations as part of this report.  
