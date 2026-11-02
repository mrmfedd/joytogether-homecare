# Administrator onboarding (Preview → Production)

**Owner email:** `joytogetherhomecare@gmail.com`  
**Branch:** `upgrade/customer-acquisition-redesign`  
**PR #1:** Open — do not merge without explicit approval.

## System capabilities (implemented)

| Requirement | Status |
|-------------|--------|
| Invitation emailed via Resend | Super Admin UI + `scripts/create-admin-invite.ts` |
| Expired / reused invites blocked | Token hash burned on re-invite; accept validates expiry and `acceptedAt` |
| Tokens not logged | Audit logs store email/role only; CLI never prints token |
| Secure password (12+ chars) | Accept-invite + reset flows |
| MFA (TOTP) | Account → Security; login requires code when MFA enabled |
| MFA required for SUPER_ADMIN / ADMIN | Dashboard gated until MFA enabled |
| Password reset email | Forgot password → Resend |
| Session lifetime | JWT session maxAge 8 hours (`auth.config.ts`) |
| Server RBAC | Actions check `canManage*` / role lists |
| Logout | NextAuth sign-out |

## Human steps required

1. Open the Resend invitation for `joytogetherhomecare@gmail.com` on Preview.
2. Accept invite: name + password on `/admin/accept-invite` (48-hour expiry).
3. Sign in at `/admin/login`.
4. Enable MFA under Security (required before other admin pages for Super Admin / Admin roles).
5. Verify Dashboard, Leads, Consultations, Content, Testimonials, Media, Careers, Reports, Settings, and Admins.

### Re-send invite (Preview)

**UI:** `/admin/users` → Email secure invite (Super Admin).

**CLI:**

```bash
ADMIN_INVITE_EMAIL=joytogetherhomecare@gmail.com npx tsx scripts/create-admin-invite.ts
```

**Status (no tokens):**

```bash
npx tsx scripts/check-owner-admin-status.ts
ADMIN_INVITE_EMAIL=joytogetherhomecare@gmail.com npx tsx scripts/check-admin-invite-status.ts
```

## Production gates

- Separate production Neon + env vars  
- JoyTogether Resend domain verified (`docs/RESEND-DNS-RECORDS.md`)  
- Explicit approval to merge PR #1 and deploy production  
