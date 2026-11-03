# JoyTogether — Database & environments

## Stack

- **PostgreSQL** on [Neon](https://neon.tech) (separate projects/branches recommended)
- **Prisma ORM 7** with `@prisma/adapter-pg` at runtime
- **Migrations** pick a connection in `prisma.config.ts` via `scripts/migration-database-url.mjs` (unpooled first).
- **Runtime queries** use pooled **`DATABASE_URL`** through `@prisma/adapter-pg` (unchanged).

### Migration URL priority (`prisma migrate deploy`)

1. `DIRECT_URL`
2. `DATABASE_URL_UNPOOLED`
3. `POSTGRES_URL_NON_POOLING`
4. `DATABASE_URL` (pooled fallback only if nothing else is set)

Vercel Neon integrations usually inject (2) and (3) on Production; Preview may use `DIRECT_URL` from a pulled env file.

## Required environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Pooled connection for the Next.js app (Neon `-pooler` host) |
| `DIRECT_URL` | Optional explicit direct URL for migrations (overrides unpooled Neon vars when set) |
| `DATABASE_URL_UNPOOLED` / `POSTGRES_URL_NON_POOLING` | Neon integration unpooled URLs for migrations when `DIRECT_URL` is unset |
| `AUTH_SECRET` | NextAuth session signing (32+ random bytes) |
| `RESEND_API_KEY` | Optional — lead/application email notifications |
| `RESEND_FROM` | Verified sender, e.g. `JoyTogether <notifications@yourdomain.com>` |
| `NEXT_PUBLIC_SITE_URL` | Preview/production site URL for invite links |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob — private resume storage (preview/prod) |
| `CRON_SECRET` | Protects `POST /api/cron/notifications` retry endpoint |

Never commit `.env` files or paste credentials into GitHub.

## Environments

1. **Development** — local `.env` pointing at a Neon dev branch or local Postgres.
2. **Preview (Vercel PR)** — Vercel **Preview** env vars only; must **not** use production `DATABASE_URL`.
3. **Production** — separate Neon project/branch; migrations only with explicit approval.

## Commands

```bash
npm run db:validate
npm run db:generate
npm run db:migrate:dev      # local only — creates/applies migrations
npm run db:migrate:deploy   # preview/prod CI — apply committed migrations
npm run db:seed             # public services + site settings (no fake leads)
```

## First admin user

No public registration. Create an invitation against **dev/preview DB only**:

```bash
ADMIN_INVITE_EMAIL=you@example.com npx tsx scripts/create-admin-invite.ts
```

Open the printed `/admin/accept-invite?token=…` link once; set a strong password.

## Health check

`GET /api/health/db` returns `{ ok, latencyMs }` without exposing connection strings.

## Data boundary

This schema stores **marketing inquiries, scheduling, CMS, and recruiting** — not clinical/EHR data. See `docs/DATABASE-ERD.md`.
