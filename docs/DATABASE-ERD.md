# Prisma schema overview (business admin CRM)

```mermaid
erDiagram
  User ||--o{ Lead : assigns
  User ||--o{ Consultation : assigned
  User ||--o{ LeadActivity : writes
  User ||--o{ AuditLog : performs
  Lead ||--o{ LeadActivity : has
  Lead ||--o{ Consultation : has
  Lead ||--o{ ConsentRecord : has
  Lead ||--o{ FollowUpTask : has
  Service ||--o{ ServiceOnArea : maps
  ServiceArea ||--o{ ServiceOnArea : maps
  PageContent ||--o{ ContentRevision : versions
  JobPosting ||--o{ JobApplication : receives
  Lead ||--o{ Notification : triggers
```

## Core domains

- **Auth:** `User`, `Account`, `Session`, `VerificationToken`, `AdminInvitation`
- **CRM:** `Lead`, `LeadActivity`, `LeadAssignment`, `Consultation`, `FollowUpTask`, `ConsentRecord`
- **CMS:** `PageContent`, `ContentRevision`, `FAQ`, `Testimonial`, `MediaAsset`
- **Services:** `Service`, `ServiceArea`, `ServiceOnArea`
- **Careers:** `JobPosting`, `JobApplication` (resume files in private `storage/resumes/`)
- **Ops:** `SiteSetting`, `Notification`, `AuditLog`

## Indexes & constraints

- UUID primary keys, `createdAt` / `updatedAt` on mutable records
- Lead search indexes on status, service interest, source, createdAt
- Unique: user email, service slug, site setting key, invitation token hash

## Seed policy

`prisma/seed.ts` loads default **site settings**, **published services** from `src/content/careServices.ts`, and **homepage hero** JSON. It does **not** seed fictional leads or testimonials for production.
