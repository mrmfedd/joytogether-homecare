# Preview test report (JoyTogether admin phase)

**Branch:** `upgrade/customer-acquisition-redesign`  
**PR:** [#1](https://github.com/mrmfedd/joytogether-homecare/pull/1)  
**Updated:** 2026-11-02  
**Production-ready:** **No** — pending Neon preview env + live workflow verification

---

## Vercel build failure (root cause)

**Commit `fcff1fd` failed** during `npm install` → `postinstall` → `prisma generate`:

```text
PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL
```

Preview env vars were not available at install time, but `prisma.config.ts` called `env("DATABASE_URL")`, which throws.

**Fix (pushed after `fcff1fd`):** optional placeholder URL in `prisma.config.ts` for generate-only; `scripts/vercel-build.mjs` runs `migrate deploy` only when `DATABASE_URL` points to a non-localhost host.

**Re-verify:** After push, confirm Vercel deployment status is **Ready** (not Error) on the latest commit.

---

## Automated tests (local / CI)

| Test | Environment | Result |
|------|-------------|--------|
| `npm run db:validate` | Dummy/local URLs | Pass (with env set) |
| `npm run test:permissions` | Node | Pass |
| `npm run test:unit` (Vitest) | `/tmp` clone | Pass (4 tests) |
| `npx tsc --noEmit` | `/tmp` clone | Pass (after layout/action fixes) |
| `npm run build` | `/tmp` clone, **no DATABASE_URL** | Pass after prisma.config fix |
| GitHub Actions `Preview CI` | ubuntu-latest | Pass on recent commits |
| `npm run test:e2e` (Playwright) | Requires running server | **Not run in CI yet** — smoke spec added |

**iCloud workspace:** Long `tsc`/build still unreliable; use `/tmp` clone or GitHub/Vercel.

---

## Preview database (Neon)

| Item | Status |
|------|--------|
| Isolated Neon preview project/branch | **Not provisioned by agent** (no Neon credentials in repo) |
| `DATABASE_URL` / `DIRECT_URL` on Vercel Preview | **You must configure** — see [`docs/NEON-PREVIEW.md`](NEON-PREVIEW.md) |
| `npm run verify:db` | Script ready; run after setting env |
| `prisma migrate deploy` | Runs on Vercel build when preview `DATABASE_URL` is a real host |
| `npm run db:seed` | Manual after migrate on preview DB only |

**Never** point preview at production PostgreSQL.

---

## Workflows requiring live preview DB + secrets

These were **not** executed end-to-end in this environment:

| Workflow | Blocker |
|----------|---------|
| Admin invite + accept | Needs preview DB + `ADMIN_INVITE_EMAIL` script run |
| Login / MFA / password reset | Needs `AUTH_SECRET`, Resend for reset email, preview URL |
| Lead form → PostgreSQL | Needs `DATABASE_URL` on preview |
| Resend lead notification | Needs `RESEND_API_KEY`, `RESEND_FROM` (verified domain) |
| Resume upload (Blob) | Needs `BLOB_READ_WRITE_TOKEN` on Vercel |
| Authorized resume download | Needs prior upload + recruiter session |
| CMS publish → public site | Hero, service intro, FAQs, testimonials wired with **static fallback** when DB empty |
| Draft preview link | `/preview/content/[key]?token=…` (HMAC via `AUTH_SECRET`) |

---

## CMS integration (public site)

| Content | Admin CRUD | Public reads DB when published |
|---------|------------|------------------------------|
| Homepage hero | Yes | Yes (`homepage.hero`) |
| Service descriptions | Yes | Partial (intro/SEO merged into static landing layout) |
| FAQs | Yes | Yes on `/contact` |
| Testimonials | Yes | Yes on homepage carousel (permission required) |
| Full page blocks | JSON editor | Other keys: JSON preview only |

**Preview before publish:** Admin content edit → **Preview draft →** signed URL (30 min).

---

## Remaining issues

1. Configure **Vercel Preview** env vars and Neon preview DB; run seed + first admin invite.
2. Confirm **latest Vercel deploy Ready** after prisma.config fix.
3. Wire **Playwright** into CI against preview URL (optional `PLAYWRIGHT_BASE_URL`).
4. **E2E** auth, leads, Resend, Blob — manual or automated after env ready.
5. **Services hub** (`/services`) still largely static catalog; DB services used on detail pages.
6. **Media library** uploads not implemented.
7. Do **not** merge PR #1 or use production DB without explicit approval.

---

## Production approval checklist

See [`docs/PHASE2-DEPLOYMENT.md`](PHASE2-DEPLOYMENT.md).
