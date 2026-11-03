# Accessibility, security, SEO, performance & UX review

**Branch:** `upgrade/customer-acquisition-redesign`  
**Preview:** https://joytogether-homecare-git-upgrade-38c1e5-michael-fedds-projects.vercel.app  
**Reviewed:** 2026-11-02

## Brand & contact

- Logo remains `/assets/logo.png` via `Logo` component (not replaceable by media library).
- Canonical contact email: **joytogetherhomecare@gmail.com** (`site.contact.email`).
- Major pathways: Skilled Nursing, Hospice Care, Private Duty Care — imagery aligned to dedicated service assets.

## Accessibility

| Check | Notes |
|-------|--------|
| Reduced motion | Hero + review carousel respect `prefers-reduced-motion` |
| Dialogs | Media picker / service explorer use Escape + aria labels |
| Forms | Labels present on admin + consultation fields |
| Alt text | Media library supports alt; hero imageAlt editable |
| Remaining | Some decorative images use empty alt (intentional); expand focus rings audit on all marketing CTAs |

## Security

| Check | Notes |
|-------|--------|
| Admin routes | Middleware + session JWT |
| Media upload | Admin-only; MIME allow-list; 8MB cap; private Blob |
| Media delivery | Public read of image assets only via `/api/media/[id]` (marketing files) |
| Resumes | Private Blob; download requires recruiter role |
| Auth | MFA boolean fixed; rate limit present |
| Remaining | Consider signed short-TTL URLs if media must stay non-enumerable |

## SEO

| Check | Notes |
|-------|--------|
| Metadata | Service + contact pages set title/description |
| Canonicals | Present on key routes |
| Sitemap/robots | Present under `src/app` |
| Remaining | Ensure production `NEXT_PUBLIC_SITE_URL` / metadataBase match `www.joytogetherhomecare.com` |

## Performance

| Check | Notes |
|-------|--------|
| Images | `next/image` on marketing surfaces; API media uses `unoptimized` until CDN remotePatterns added |
| Hero | Priority LCP image |
| Remaining | Add Blob public CDN host to `images.remotePatterns` if switching to public Blob URLs; run Lighthouse on production |

## UX / responsive / motion

| Check | Notes |
|-------|--------|
| Desktop / tablet / mobile | Layout uses `site-container`, responsive type clamps, stacked CTAs on small screens |
| Nav / buttons | Shared `ButtonLink` variants; admin sticky sidebar |
| Contact form | Consultation API + client form with validation |
| Animations | Reveal + hero entrance; keep subtle |
| Remaining | Manual QA on physical devices after next Preview deploy |

## Services content accuracy

- Skilled Nursing: licensed clinical framing; RN/LPN; no outcome guarantees.
- Hospice: comfort/dignity; distinct from companion care; license confirmation disclaimer.
- Private Duty: private-pay / no-insurance pathway; nonmedical options listed carefully.
