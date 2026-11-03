# Help Center maintenance

## Authoritative content

- **Seed source:** `src/content/help/seed-data.ts` (categories, articles, FAQs). Run `npm run db:seed` against preview to upsert content idempotently.
- **Runtime source:** PostgreSQL tables `HelpCategory`, `HelpArticle`, `HelpArticleRevision`, `HelpFaq`.
- **SUPER_ADMIN CMS:** `/admin/help/manage` edits live database rows and stores revision snapshots on save.

## When application behavior changes

1. Update the matching article in `seed-data.ts` (or via CMS if production content diverged).
2. Set `HELP_LAST_UPDATED` and article `lastReviewedAt` when publishing seed updates.
3. Re-run seed on preview, verify `/admin/help` and `/employee/help` search and contextual Help links.
4. Review the **Review suggested** list on `/admin/help/manage` (articles not reviewed in 90 days).

## Roles

| Action | Roles |
|--------|--------|
| Read admin Help | All admin portal roles except EMPLOYEE |
| Read employee Help | EMPLOYEE only |
| Edit Help CMS | SUPER_ADMIN only |

## Contextual Help

Map routes in `src/lib/help/context-routes.ts` and per-article `contextRoutes` in the database. Use `HelpPageHeader` or `ContextHelpButton` on new screens.

## PDF / print

- Admin: `/admin/help/print`
- Employee: `/employee/help/print`

Use the browser **Print → Save as PDF** action; no server-side PDF engine is required.

## Dependencies

- Markdown rendering: `react-markdown`, `remark-gfm`, `rehype-sanitize`

## Migrations

- `prisma/migrations/20261031120000_help_center/migration.sql`

Deploy migrations on Vercel Preview before relying on Help Center in CI or preview URLs.
