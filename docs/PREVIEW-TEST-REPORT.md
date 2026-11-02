# JoyTogether Preview — final feature report

**Branch:** `upgrade/customer-acquisition-redesign`  
**PR:** [#1](https://github.com/mrmfedd/joytogether-homecare/pull/1) — **not merged**  
**Production deploy:** **not performed**  
**Updated:** 2026-11-02  

**Working preview URL:**  
https://joytogether-homecare-git-upgrade-38c1e5-michael-fedds-projects.vercel.app

**Production-ready:** **No**

---

## Completed on Preview

| Area | Status |
|------|--------|
| Isolated Neon preview DB | Connected (`joytogether-preview-db`) |
| Auth / MFA / password reset | Verified earlier; MFA boolean fixed |
| Leads, consultations, Resend delivery | Verified |
| CMS (hero, services, FAQs, areas, testimonials) | Live from DB with static fallbacks |
| **Admin media library** | Upload / list / alt edit / replace / delete; private Blob; public image delivery `/api/media/[id]` |
| **Media selection** | Wired into content editor (hero/hub), services, testimonials |
| Brand logo | Unchanged (`/assets/logo.png`) |
| Service imagery | Skilled Nursing / Hospice / Private Duty assets corrected |
| Contact email | `joytogetherhomecare@gmail.com` |
| Quality review docs | [`QUALITY-REVIEW.md`](QUALITY-REVIEW.md) |
| Resend sender plan (no DNS changes) | [`RESEND-SENDER.md`](RESEND-SENDER.md) |
| Production DB plan | [`PRODUCTION-DB-PLAN.md`](PRODUCTION-DB-PLAN.md) |

---

## Remaining issues

1. JoyTogether-owned Resend domain not verified (Preview uses shared verified domain; **no DNS changes made**).
2. Production Neon + Production env not provisioned.
3. Owner must accept emailed admin invite + enable MFA on `joytogetherhomecare@gmail.com`.
4. Lighthouse / device lab QA after media deploy lands on Preview.
5. Optional: add Blob CDN host to `next.config` `images.remotePatterns` if moving off `/api/media` proxy.

---

## Production launch checklist

- [ ] Explicit approval to merge PR #1
- [ ] Provision **separate** Neon production DB ([`PRODUCTION-DB-PLAN.md`](PRODUCTION-DB-PLAN.md))
- [ ] `npm run verify:db` against production hosts only
- [ ] `prisma migrate deploy` + seed on production
- [ ] Production Blob store + secrets (`AUTH_SECRET`, `CRON_SECRET`, etc.)
- [ ] Approved Resend DNS + JoyTogether `RESEND_FROM`
- [ ] First admin invite emailed (no tokens in tickets)
- [ ] Smoke: health, consultation, Resend SENT, CMS, media, resume ACL, MFA
- [ ] Accessibility + Lighthouse pass on production URL
- [ ] Confirm Preview still isolated from production DB
