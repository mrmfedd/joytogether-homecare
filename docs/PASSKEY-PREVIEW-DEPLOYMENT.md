# Passkey authentication — Preview deployment plan

**Branch:** `feature/passkey-auth`  
**Migration:** `20261121120000_passkeys`

## Audit summary (pre-passkey)

| Component | Behavior |
|-----------|----------|
| NextAuth | JWT sessions, credentials provider, portal-scoped login |
| TOTP MFA | `mfaSecret` + `otplib`; required for SUPER_ADMIN/ADMIN and optional employee MFA |
| Sessions | `sessionVersion` invalidation on recovery |
| Recovery | `AdminAccountRecoveryToken` + operator `ADMIN_RECOVERY_SECRET` |
| No WebAuthn | No prior passkey models |

## Environment variables (Preview)

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | Existing — also signs passkey reauth cookies |
| `WEBAUTHN_RP_ID` | Hostname without port (e.g. `preview-*.vercel.app` or custom domain) |
| `WEBAUTHN_ORIGIN` | Full HTTPS origin (must match browser URL) |
| `WEBAUTHN_RP_NAME` | Display name (default JoyTogether Home Care) |

Preview must use **HTTPS**. Local dev: `localhost` as RP ID with `http://localhost:3000` origin.

## Migration (Preview only until approved)

```bash
npx prisma migrate deploy
```

## Rollout steps

1. Deploy branch to Vercel Preview; set WebAuthn env vars to Preview hostname.
2. Run migration on Preview database.
3. **Regression:** password + TOTP login for existing QA admin accounts.
4. Enroll passkey on Security / Profile while signed in (password reauth required).
5. Sign out; use **Sign in with Face ID, Touch ID, or Passkey** — confirm **no** six-digit code.
6. Employee portal: same on `/employee/login` and `/employee/account`.
7. Remove passkey (reauth) — confirm last passkey cannot be removed for admin without TOTP unless another passkey exists.
8. Assisted recovery unchanged — still revokes sessions via `sessionVersion`.

## Testing matrix (manual on Preview)

| Platform | Check |
|----------|--------|
| Safari iOS | Admin + employee passkey login |
| Safari macOS | Touch ID |
| Chrome desktop | Windows Hello / security key |
| Chrome Android | Biometric / PIN |
| Fallback | Password + TOTP when passkey unavailable |

Automated: `npm run test:unit` (includes `passkey-mfa-policy.test.ts`).

## Production (do not run until approved)

- Migrate production DB during maintenance window.
- Set `WEBAUTHN_RP_ID` to `joytogetherhomecare.com` (or primary app host).
- Communicate: passkeys optional; password + authenticator remain supported.
- Monitor audit logs for `UserPasskey` CREATE/DELETE/LOGIN.

## Security notes

- Only **public keys** stored; biometrics never sent to JoyTogether.
- Passkey login requires **user verification** to satisfy MFA in lieu of TOTP.
- Password login still requires TOTP when configured — passkeys do not weaken password path.
- Attachments and unrelated features unchanged.