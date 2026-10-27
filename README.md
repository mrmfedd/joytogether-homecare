# Joy Together Home Care — Website

Marketing site for [Joy Together Home Care](https://joytogetherhomecare.com/), built with Next.js and styled from the project’s `index.html` template and `assets/` images.

- **Design reference:** `index.html` (navy/green palette, Playfair + DM Sans, single-page sections)
- **Template copy:** `src/content/marketing.ts`
- **Live-site data:** `src/content/site.ts` (contact, extended services, about, training, fingerprinting)
- **Images:** `public/assets/hero-care.jpg`, `public/assets/about-care.jpg`

## Pages

- **Home** — vision, promise, pillars, service preview, CTA
- **About** — mission, why choose us, reputation & values
- **Services** — housekeeping, meals, companionship, care plans, hospice, and more
- **Training** — CPR, AED, BLS, group/on-site courses
- **Fingerprinting** — Live Scan electronic submissions
- **Contact** — phone, email, Apollo Beach office, map link

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm start
```

## Deployment

- **GitHub:** https://github.com/mrmfedd/joytogether-homecare
- **Vercel (production):** https://joytogether-homecare.vercel.app

Pushes to `main` auto-deploy on Vercel (GitHub repo is connected).

### Custom domain (`joytogetherhomecare.com`)

1. In [Vercel → Project → Settings → Domains](https://vercel.com/michael-fedds-projects/joytogether-homecare/settings/domains), add `joytogetherhomecare.com` and `www.joytogetherhomecare.com`.
2. At your domain registrar (GoDaddy), set DNS per Vercel’s instructions (usually `A` record to Vercel IP or `CNAME` to `cname.vercel-dns.com`).
3. Remove or repoint the old GoDaddy site hosting when DNS has propagated.

## Customization

- **Content:** Edit `src/content/site.ts` only — pages read from there.
- **Brand:** Colors and fonts live in `src/app/globals.css` and `src/app/layout.tsx`.
