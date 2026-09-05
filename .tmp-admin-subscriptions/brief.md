# Admin subscription controls

## Objective
Upgrade the existing Next.js/Prisma admin student roster so admins can see each user's subscription status and expiry, grant a number of days, or extend an explicit date. Admins must be able to select one, many, or all visible users and apply the same change in one operation.

## Audience
Planitt Learn administrators managing learner access.

## Aesthetic direction
Preserve the existing dark admin console: near-black canvas, charcoal table surfaces, emerald/brand accents, compact mono labels, and the existing Admin UI primitives. Make subscription state scannable with compact status pills and a clear bulk-action toolbar. Avoid introducing a new visual system.

## Content and behavior
- Add a Subscription column to the student roster showing Active, Expiring soon, Expired, or No subscription, plus expiry date where available.
- Add row checkboxes and a select-all checkbox for the current result set.
- When users are selected, show a bulk action panel with number-of-days input and explicit date input, applying one chosen mode to all selected users.
- Keep a per-user action available from each row or the student detail screen.
- Persist subscription data in Prisma with one subscription record per user, status derived from expiry, and admin grant/extend updates.
- API should validate admin access, target user IDs, positive days, and valid future dates; extending days should continue from the later of now and the current expiry.
- Refresh roster/detail queries after a successful mutation and show success/error feedback.

## Typography / colors
Use existing Tailwind tokens and components. Keep labels uppercase/mono where the admin UI currently does. Use brand/emerald for active, amber for expiring, rose for expired, and muted slate for missing.

## Output
Implement in the existing app under src/, prisma/schema.prisma, and a migration if appropriate. Do not create a standalone HTML page.

## Image needs
None.
