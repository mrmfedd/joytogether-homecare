# Phase 2 — production deployment checklist (do not run without approval)

- [ ] Create **separate** Neon production project/branch (not preview)
- [ ] Set Vercel **Production** env: `DATABASE_URL` (pooled), `DIRECT_URL`, `AUTH_SECRET`, Resend keys
- [ ] Confirm **Preview** env uses preview DB only (never production URLs)
- [ ] Run `npm run db:migrate:deploy` against production **once approved**
- [ ] Run `npm run db:seed` for site settings/services only (no demo leads)
- [ ] Create first SUPER_ADMIN via `scripts/create-admin-invite.ts` on production DB
- [ ] Verify `/api/health/db` on preview then production
- [ ] Submit test consultation on preview → lead + notification rows
- [ ] Submit test job application → resume in private storage
- [ ] Review audit log entries for admin login and lead export (if used)
- [ ] Merge PR #1 only after stakeholder sign-off

## Remaining enhancements (post-MVP)

- Full CMS edit/publish UI with revision history
- Service CRUD + clinical approval workflow UI
- Job posting CRUD + applicant status updates in admin
- Testimonial consent workflow + media library uploads
- MFA for SUPER_ADMIN
- Password reset email flow
- Notification retry controls in settings
- Automated auth/E2E tests in CI
