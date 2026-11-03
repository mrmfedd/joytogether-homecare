# Neon preview database setup

JoyTogether requires an **isolated Neon branch** for Vercel Preview (never production).

## 1. Create preview project/branch

1. Sign in to [Neon](https://console.neon.tech).
2. Create a project named e.g. `joytogether-preview` (separate from any production project).
3. Create a branch `preview` or use the default dev branch for PR previews only.

## 2. Connection strings

From Neon **Connect**:

| Variable | Neon panel |
|----------|------------|
| `DATABASE_URL` | Pooled connection string (`-pooler` host) |
| `DIRECT_URL` | Direct connection string (non-pooled, for migrations) |

Run locally before migrate:

```bash
npm run verify:db
```

Confirm hostnames match your **preview** project, not production.

## 3. Apply migrations (preview only)

On **Vercel Preview**, when `DATABASE_URL` points to your Neon preview host, the build runs `prisma migrate deploy` automatically, then runs **`prisma db seed`** (idempotent upserts) unless you set `SKIP_SEED=true` or `RUN_SEED_ON_PREVIEW=false`.

Locally:

```bash
npm run db:migrate:deploy
npm run db:seed
```

Optional dev-only fictional data (never on production):

```bash
SEED_DEV_EXAMPLES=true npm run db:seed
```

(Current seed does not insert fictional leads/testimonials.)

## 4. Vercel Preview environment

In Vercel → Project → Settings → Environment Variables, set for **Preview** only:

- `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`
- `RESEND_API_KEY`, `RESEND_FROM` (verified domain)
- `BLOB_READ_WRITE_TOKEN` (Vercel Blob store for resumes)
- `CRON_SECRET` (for `/api/cron/notifications`)
- `NEXT_PUBLIC_SITE_URL` (preview URL)

## 5. First administrator

After migrations on preview:

```bash
ADMIN_INVITE_EMAIL=you@example.com npx tsx scripts/create-admin-invite.ts
```

Open the one-time accept-invite URL, set password, then enable MFA at `/admin/account`.

## 6. Smoke tests

```bash
PREVIEW_URL=https://your-branch.vercel.app npm run test:preview-smoke
# After DATABASE_URL is configured on preview:
EXPECT_DB=true PREVIEW_URL=... npm run test:preview-smoke
```

- `GET /api/health/db` → `{ "database": "connected" }` when preview DB is wired
- Submit consultation form → row in `Lead`, `Notification`
- `/admin` KPIs reflect live counts
- Job application with resume → recruiter download (auth required)
