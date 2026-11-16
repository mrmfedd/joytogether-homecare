# Patient Care Coordination — Deployment Checklist (Preview / Staging)

**Branch:** `feature/patient-care-coordination`  
**Migration:** `20261116180000_patient_care_coordination`

## Before merge or production

- [ ] Independent HIPAA/security review completed (technical, administrative, contractual).
- [ ] Set `PHI_ENCRYPTION_KEY` (32+ character secret) on Preview, Staging, and Production Vercel environments.
- [ ] Confirm BAAs for PostgreSQL host, Vercel, and any future attachment storage vendor.
- [ ] Do **not** apply migration to production until explicitly approved.
- [ ] Run `npx prisma migrate deploy` on approved non-production database only.
- [ ] Run `npm run test:unit`, `npm run test:patient-permissions`, `npm run test:e2e` (patient-care-coordination spec).
- [ ] Generate manuals: `node scripts/generate-patient-care-manuals.mjs`
- [ ] Verify caregiver IDOR: employee without assignment cannot open `/employee/patients/[id]`.
- [ ] Verify ended assignment revokes access.
- [ ] Attachments: **disabled** until virus scan, authorization, and retention pipeline exists.

## Outstanding compliance items

- Field encryption protects selected text at application layer; database disk encryption is host-dependent (Neon).
- No in-app audit viewer for `PatientAuditEvent` (query via approved DB tools).
- Formal retention/archival policy not automated in-app.
- Attachment pipeline not implemented (by design).

## Production migration (when approved)

```bash
# On maintenance window, against production DIRECT_URL — owner only
npx prisma migrate deploy
```

Redeploy application build after migration. Monitor error logs for `patient_audit_failed` and migration errors.