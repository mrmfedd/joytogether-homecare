# Homepage review integrity report

Last updated: 2026-11-02  
Scope: `src/content/contactReviews.ts` (`verifiedGoogleReviews`) and homepage carousel (`HomeReviewsSection` / `resolveHomeReviews`).

## Method

Quotes were checked against **JoyTogether Google review UI captures** supplied for this project (homepage/contact review widgets). We did **not** have API access to Google’s full review corpus. Where a capture showed truncated text with an ellipsis, the stored quote ends with **“…”** and must not be expanded. Star ratings are stored **only** when five stars appeared on the capture. Dates are stored **only** when they appeared on the capture footer (`Name - M/D/YYYY`).

CMS testimonials (`Testimonial` with `permissionRecorded: true` and `PUBLISHED`) are labeled **Approved client testimonial**, carry **no star rating** (not verified on Google), and merge ahead of Google entries. Duplicate Google rows are omitted when quote text matches an approved CMS entry.

Google attribution links to Joy Together’s public Maps search listing: `site.googleBusinessProfileUrl` (business profile / reviews on Google Maps).

---

## Verified Google reviews

| Name | Quote status | Date | 5★ on capture |
|------|----------------|------|----------------|
| **Frederick** | **Full** — `Thanks again! Gretha did a great job!!` | **1/23/2026** | Yes |
| **Raymond** | **Truncated** — `Thank you. My caregiver was amazing and caring aid. She went…` (removed invented ending “above and beyond for our family.”) | **8/5/2021** | Yes |
| **Vanessa** | **Full** — `Thank you for everything! The staffs were wonderful.` | **8/26/2021** | Yes |
| **Nicholas** | **Truncated** — `Arol is the best I appreciate him so very much!! I wish I could take hi…` (removed invented ending “everywhere with us.”) | **1/23/2026** | Yes |
| **Kathy** | **Full** on 3-card capture — `In the last few months Stocker have been taking care of my husband. They have been wonderful and very attentive.` (preserves “Stocker” spelling) | **Omitted** (not on capture footer) | Yes |
| **Adriane** | **Full** on 3-card capture — `It has truly been a blessing to have Martin take such excellent care of my Mom. Thanks` | **Omitted** (not verified per reviewer on capture) | Yes |
| **Rob** | **Full** on 3-card capture — `Services have been outstanding — very knowledgeable, kind, and reliable.` | **Omitted** (prior `1/23/2026` was Nicholas’s date, not verified for Rob) | Yes |

---

## Removed or corrected in this pass

| Item | Action |
|------|--------|
| Raymond / Nicholas expanded endings | **Removed** — quotes end at captured truncation |
| Rob date `1/23/2026` | **Removed** |
| Kathy / Adriane dates | **Removed** (unverified on captures) |
| Unverified star display on CMS items | **Not shown** — only Google rows with `rating: 5` |
| CMS vs Google exclusivity | **Replaced** — merged list with deduplication |

---

## Still requires owner verification (optional)

- **Raymond** and **Nicholas**: paste full text from Google Business Profile if you want complete quotes instead of truncated captures.
- **Kathy / Adriane / Rob**: confirm wording matches live Google reviews (sourced from marketing captures, not live Google API).
- **Google Maps URL**: confirm the Maps listing URL is the canonical profile customers should use.

---

## CMS testimonials

Any row in the database with `status: PUBLISHED` and `permissionRecorded: true` appears as **Approved client testimonial** without a star rating. Wording is stored exactly as entered in admin; do not edit client quotes for tone.

Do **not** merge PR #1 or deploy to production until this report is accepted by the business owner.
