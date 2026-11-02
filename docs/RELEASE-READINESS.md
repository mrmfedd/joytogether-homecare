# Release candidate readiness report

**Product:** JoyTogether Home Care  
**Branch:** `upgrade/customer-acquisition-redesign`  
**Commit audited:** `31865d7` (RC) → launch prep `fc907ff`  
**Preview URL:** https://joytogether-homecare-git-upgrade-38c1e5-michael-fedds-projects.vercel.app  
**Audit date:** 2026-11-02  

**PR #1 merged:** No  
**Production website changed:** No  
**Production database created/modified:** No  

---

## Overall recommendation

**CONDITIONAL GO** for launch prep — Preview RC is functionally strong.  
**Do not launch production** until: (1) separate production Neon is approved/provisioned, (2) JoyTogether Resend domain is approved/verified, (3) owner accepts invite + MFA on `joytogetherhomecare@gmail.com`, (4) production Lighthouse SEO crawlability confirmed (Preview sends `x-robots-tag: noindex` by Vercel design).

---

## Critical feature scorecard

| # | Feature | Result | Evidence |
|---|---------|--------|----------|
| 1 | Public navigation + responsive design | **PASS** | Playwright RC: desktop nav/CTA, iPhone home/services, iPad contact |
| 2 | Skilled Nursing / Hospice / Private Duty pages | **PASS** | Playwright service pages; content smoke for clinical/comfort/private-pay language |
| 3 | Consultation → lead persistence | **PASS** | POST `/api/consultation` → lead `e12d5e9e-…` in preview DB |
| 4 | Admin login, owner invite, MFA, password reset | **PASS*** | Playwright MFA login + password reset; owner invite **emailed & valid**, not yet accepted |
| 5 | Lead assignment + consultation scheduling | **PASS** | Assignment UI/actions present; scheduled consultation count ≥ 1; Playwright consultations list |
| 6 | CMS edit / draft preview / publish | **PASS** | Published hero/FAQs/areas live; draft preview returns **404 without token** (auth gate) |
| 7 | Media upload / replace / delete / display | **PASS** | QA upload → `/api/media/{id}` **200**; admin media API unauth **401** |
| 8 | Job applications + authorized resume download | **PASS** | Application created with `resumeKey`; unauth download **401**; auth download Playwright **PASS** |
| 9 | Email notifications + retries | **PASS** | RC lead notification `SENT` attempts=1; earlier pending retries previously cleared to SENT |
| 10 | Prisma migrations, DB security, RBAC | **PASS** | Migrations `init` + `security` applied; permission unit tests PASS; Preview Neon only |

\*Owner invitation acceptance is pending human action (inbox), not a system failure.

---

## Automated verification

| Suite | Result |
|-------|--------|
| `npm run test:permissions` | **PASS** |
| `npm run test:unit` (5) | **PASS** |
| `npm run test:preview-smoke` (EXPECT_DB) | **PASS** |
| `scripts/rc-security-probe.mjs` | **PASS** (admin/API/cron/resume denied) |
| Playwright full (14) | **PASS** |
| Production `npm run build` (clean clone) | **PASS** |

### Lighthouse (Preview homepage) — final re-run on `fc907ff`

| Category | Score | Notes |
|----------|------:|-------|
| Performance | **97** | Improved vs prior 89 |
| Accessibility | **100** | Gold CTA contrast fixed (midnight on `#71c73c` / `#5aa82f`) |
| Best practices | **77** | Preview-only: third-party cookies + Chrome Issues panel (Vercel tooling) |
| SEO | **69** | **Expected Preview FAIL** on crawlable: `x-robots-tag: noindex` |

Accessibility fixes: footer contrast, review star ARIA, How Care Begins list semantics, footer heading levels, `.btn-gold` text contrast.

---

## Security isolation

| Check | Result |
|-------|--------|
| Production Vercel env has DB URLs | **None** (`PROD_DB_VARS=none`) |
| Preview Neon resource | `joytogether-preview-db` / `lucky-fire-28361357` — **Preview only** |
| Preview DB host | `ep-summer-band-bc49hrns-pooler…` |
| Unauthorized `/admin/*` | **307** → login |
| Unauthorized `/api/admin/media` | **401** |
| Unauthorized resume download | **401** |
| Cron without secret | **401** |
| Draft CMS preview without token | **404** |
| Marketing `/api/media/{id}` | **Public by design** (non-secret website imagery). Resumes remain private. |

---

## Failures / blockers before launch approval

| Severity | Item | Status |
|----------|------|--------|
| Blocker | Separate **production** Neon + Production env | Not created (by policy) |
| Blocker | JoyTogether-branded Resend domain + DNS approval | Plan only; Preview uses shared verified sender |
| Blocker | Owner accept invite + MFA for `joytogetherhomecare@gmail.com` | Invite valid; acceptance pending |
| Non-blocker | Preview `noindex` | Expected; confirm absent on production |
| Non-blocker | Lighthouse a11y residual after redeploy | Fixes pushed; re-measure on new Preview |

No critical functional regressions found that block Preview RC sign-off.

---

## Production launch checklist (gates)

- [ ] Explicit approval to merge PR #1
- [ ] Explicit approval to provision **new** production Neon (not preview)
- [ ] `verify:db` on production hosts only
- [ ] `migrate deploy` + seed on production
- [ ] Production Blob + Auth + Resend (JoyTogether domain) + `NEXT_PUBLIC_SITE_URL`
- [ ] Owner invite accepted + MFA enabled
- [ ] Post-deploy smoke + Lighthouse on `www.joytogetherhomecare.com`
- [ ] Confirm Preview DB still isolated

---

## Verdict by gate

| Gate | Verdict |
|------|---------|
| Preview feature completeness | **PASS** |
| Unauthorized access controls | **PASS** |
| DB isolation from production | **PASS** |
| Automated tests + build | **PASS** |
| Production launch readiness | **FAIL** (env/domain/owner onboarding gates remain) |
