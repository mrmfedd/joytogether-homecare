# Staff portal training manual (PDF)

## Download (after deploy or locally)

- **Public URL:** `/downloads/joytogether-staff-portal-training-manual.pdf`
- **Training page:** https://www.joytogetherhomecare.com/training (download card)

## Regenerate after content changes

1. Edit chapters in `src/lib/training/training-manual-content.ts`.
2. Run:

   ```bash
   npm run generate:training-manual
   ```

3. Commit the updated file under `public/downloads/` if you want it served from the website.

## Full Help Center export (admins only)

Signed-in administrators can open **`/admin/help/print`** and use the browser **Print → Save as PDF** for all published Help articles.

## Versioning

Bump `TRAINING_MANUAL_VERSION` and `TRAINING_MANUAL_DATE` in `training-manual-content.ts` when you publish a new print run.