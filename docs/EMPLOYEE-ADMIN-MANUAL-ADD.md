# Add employees without email invitations

**Admin path:** `/admin/employees` → **Add employee manually**

1. Enter name, work email, classification, optional phone/department.
2. Click **Create employee** — profile is **INVITED** (no password yet, no Resend email).
3. Copy the **one-time activation link** from the success banner and share it privately (in person or phone).
4. The employee opens the link, sets their own password (12+ characters), then signs in at `/employee/login`.

## Security

- Administrators never set or share employee passwords.
- Activation links expire in seven days, are single-use, and are stored hashed in the database (only shown once in admin).
- Audit logs record creation and activation without tokens or passwords.

## Production deploy

If manual add fails with a database message, run workforce migrations (`EmployeeInvitation` / `EmployeeProfile` on production Neon).

## Historic invite crash (digest 3752157764)

Uncaught throws from **Send invitation** on old production caused full-page errors. The current UX does not send employee email. See `src/lib/site-url.ts` for portal base URL fallback when env is unset.