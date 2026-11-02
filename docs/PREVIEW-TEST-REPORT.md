# Preview test report (JoyTogether admin phase)

**Branch:** `upgrade/customer-acquisition-redesign`  
**PR:** [#1](https://github.com/mrmfedd/joytogether-homecare/pull/1)  
**Updated:** 2026-11-02  
**Production-ready:** **No**

**Working preview URL:**  
https://joytogether-homecare-git-upgrade-38c1e5-michael-fedds-projects.vercel.app

---

## Security note (invitations)

- The previously exposed administrator invitation was **invalidated** in the preview database (token hash burned + expiry forced).
- A **new** invitation for `joytogetherhomecare@gmail.com` was created and **emailed via Resend**.
- The accept link is **not** recorded in this report, git history, or logs.

---

## Database isolation

| Check | Result |
|-------|--------|
| Neon resource | `joytogether-preview-db` (`lucky-fire-28361357`) |
| Vercel connection | **Preview only** |
| Production env DB vars | **None** (`vercel env ls production` has no DATABASE/NEON/POSTGRES) |
| Host verified | `ep-summer-band-bc49hrns…` (preview) |
| Production migrations | **Not run** |

---

## Verification results

| # | Item | Result |
|---|------|--------|
| 1 | Resend Preview config | **Pass** — `RESEND_API_KEY` set; from `JoyTogether Home Care <noreply@teezbydesign.com>` (verified domain on shared Resend account) |
| 2 | Lead email delivery | **Pass** — new lead notification `SENT` on first attempt |
| 2b | Notification retries | **Pass** — 2 previously pending notifications retried and marked `SENT` |
| 3 | Admin login + MFA | **Pass** (Playwright against preview; MFA boolean bug fixed) |
| 4 | Password reset | **Pass** (token mint → set password → login page) |
| 5 | Consultation scheduling / leads | **Pass** — lead API persist; admin consultations shows `SCHEDULED` |
| 6 | Private resume download ACL | **Pass** — unauthenticated `401`; authenticated recruiter `200` |
| 7 | Public CMS from DB | **Pass** — hero (`THE ART OF CARING`), FAQs, services hub, service areas, published testimonial (`M. Rivera`) |
| 8 | Build / unit / permissions / Playwright | Permissions **pass**; unit **5/5**; preview smoke **pass**; Playwright public+backend **pass**; admin workflow **pass** when not rate-limited; clean git clone `npm run build` **pass** |
| 9 | Preview ≠ production DB | **Confirmed** |
| 10 | Owner invite email | **Delivered** to `joytogetherhomecare@gmail.com` (check inbox/spam) |

---

## Remaining blockers (production)

1. **`joytogetherhomecare.com` is not a verified Resend domain** — Preview sends via verified `teezbydesign.com` on the shared Resend account. Production should use a JoyTogether-owned verified sender (plan domain limit currently blocks adding `joytogetherhomecare.com` to that account).
2. **Owner account acceptance** — invitation emailed; MFA enrollment for `joytogetherhomecare@gmail.com` still requires opening the private link and completing accept-invite.
3. **Production Neon + env** — not provisioned; do not reuse preview DB.
4. **Media library uploads** — not implemented.
5. **Login rate limiter** — in-memory per instance; raised threshold for preview operability; consider Redis/KV before production load.
6. **Do not merge PR #1** without explicit approval.

---

## Production-readiness assessment

**Not production-ready.** Preview backend workflows (DB, leads, Resend delivery/retries, Blob ACL, MFA login, password reset, CMS publish reads) are verified on an isolated Neon database. Remaining production blockers are primarily **Resend domain ownership**, **production database provisioning**, and **owner invite acceptance**.
