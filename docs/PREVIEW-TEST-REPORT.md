# Preview test report (JoyTogether admin phase)

**Branch:** `upgrade/customer-acquisition-redesign`  
**PR:** [#1](https://github.com/mrmfedd/joytogether-homecare/pull/1)  
**Updated:** 2026-11-02  
**Production-ready:** **No** — preview builds succeed; Neon preview env not wired on Vercel yet

---

## Vercel deployment (verified)

| Commit | Vercel | Notes |
|--------|--------|--------|
| `fcff1fd` | **Error** | `PrismaConfigEnvError: DATABASE_URL` during postinstall |
| `767b4e2` | **Ready** | GitHub commit status: deployment completed |
| Latest preview URL | [joytogether-homecare-git-upgrade-…](https://joytogether-homecare-git-upgrade-38c1e5-michael-fedds-projects.vercel.app) | From Vercel PR comment (Nov 2, 2026) |

**Fix:** Optional placeholder in `prisma.config.ts`; `scripts/vercel-build.mjs` migrates/seeds only when preview `DATABASE_URL` is a real host.

---

## Live preview smoke (agent-run, no secrets)

| Check | URL | Result |
|-------|-----|--------|
| Homepage | `/` | **200** |
| Admin login | `/admin/login` | **200** (contains “JoyTogether Admin”) |
| DB health | `/api/health/db` | **503** `{ "database": "unavailable" }` — **`DATABASE_URL` not set on Vercel Preview** |
| Remote smoke script | `npm run test:preview-smoke` | Passes with current env (expects 503 for DB) |

**Playwright (public routes, against preview URL):** **4/4 passed** (home, admin login, contact, services) on Nov 2, 2026 — auth/lead/Blob flows not covered.

```bash
PLAYWRIGHT_BASE_URL=https://joytogether-homecare-git-upgrade-38c1e5-michael-fedds-projects.vercel.app npx playwright test
```

---

## Automated tests (local / CI)

| Test | Environment | Result |
|------|-------------|--------|
| `npm run db:validate` | Dummy/local URLs | Pass (with env set) |
| `npm run test:permissions` | Node | Pass |
| `npm run test:unit` (Vitest) | `/tmp` clone | Pass |
| `npm run build` | No `DATABASE_URL` | Pass after prisma.config fix |
| GitHub Actions `Preview CI` | ubuntu-latest | Pass on recent commits |
| `npm run test:e2e` | Local server or `PLAYWRIGHT_BASE_URL` | Spec covers home, admin login, contact, services |
| `npm run test:preview-smoke` | `PREVIEW_URL` | Pass (DB unavailable until Neon wired) |

---

## Preview database (Neon)

| Item | Status |
|------|--------|
| Isolated Neon preview project/branch | **Not provisioned in repo** — you create in Neon console |
| `DATABASE_URL` / `DIRECT_URL` on Vercel Preview | **Not configured** (health check confirms) |
| Auto `migrate deploy` + `db seed` on preview build | **Implemented** when real preview `DATABASE_URL` is set |
| First admin invite | **Pending** — run `create-admin-invite.ts` against preview DB after env is set |

**Never** point preview at production PostgreSQL.

See [`docs/NEON-PREVIEW.md`](NEON-PREVIEW.md).

---

## Workflows requiring live preview DB + secrets

| Workflow | Status |
|----------|--------|
| Admin invite + accept | **Blocked** — no preview DB |
| Login / MFA / password reset | **Blocked** — needs DB + Resend + `AUTH_SECRET` |
| Lead form → PostgreSQL | **Blocked** — no `DATABASE_URL` on preview |
| Resend lead notification | **Blocked** — no API key on preview |
| Resume upload (Blob) | **Blocked** — no `BLOB_READ_WRITE_TOKEN` |
| Authorized resume download | **Blocked** — depends on above |
| CMS publish → public site | **Static fallback only** until DB connected |
| Draft preview link (`/preview/content/[key]?token=`) | **Code ready** — needs DB + `AUTH_SECRET` for admin link generation |

---

## CMS integration (public site)

| Content | Admin CRUD | Public reads DB when published |
|---------|------------|------------------------------|
| Homepage hero | Yes | Yes (`homepage.hero`) |
| Services hub hero | Yes | Yes (`services.hub`) |
| Service list (support links) | Yes (Service model) | Yes on `/services` |
| Service descriptions | Yes | Partial on detail pages (intro/SEO + static layout) |
| FAQs | Yes | Yes on `/contact` |
| Testimonials | Yes | Yes on homepage carousel |
| Other page keys | JSON editor | JSON preview route only |

**Preview before publish:** Admin content edit → **Preview draft →** HMAC URL (30 min).

---

## Remaining issues

1. **Configure Vercel Preview env** with isolated Neon `DATABASE_URL` / `DIRECT_URL`; redeploy; confirm `EXPECT_DB=true npm run test:preview-smoke` passes.
2. Create **first admin invite** on preview DB; exercise MFA and password reset with Resend.
3. Submit **test lead** and verify `Notification` + Resend (or retry cron).
4. **Blob** resume upload/download with recruiter session.
5. Run **Playwright** against preview after DB/auth env is ready (admin flows need credentials).
6. **ServicesExplorer** modal grid remains static catalog (by design for UX); DB drives hub hero + support links + detail pages.
7. **Media library** uploads not implemented.
8. Do **not** merge PR #1 or use production DB without explicit approval.

---

## Production approval checklist

See [`docs/PHASE2-DEPLOYMENT.md`](PHASE2-DEPLOYMENT.md).
