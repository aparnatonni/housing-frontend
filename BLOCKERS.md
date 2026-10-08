# BLOCKERS

## 1. Admin demo credentials missing (2026-10-08)
- Postman docs list demo logins `admin@housing.com` / `Password123!` but the live API
  returns `401 Invalid email or password` (also tried Admin123!, admin123, Password123).
- `owner1@housing.com` and `tenant1@housing.com` / `Password123!` work fine.
- Tried: register with role ADMIN is not allowed (only TENANT | OWNER).
- Workaround: `src/lib/demo-accounts.ts` carries a clearly-marked TODO placeholder for the
  admin login; Demo Login button for Admin calls the real `/auth/login` endpoint with those
  credentials and surfaces the API error via Sonner if they are still invalid.
- Action needed from owner: create an ADMIN user in the backend (B7A6) or send credentials.

## 2. Property seed images point at example.com
- Seed data uses `https://example.com/*.jpg` (not real files), so listing cards show broken
  images until the owner uploads real images via `POST /properties/:id/images`.
- Workaround: `next.config.ts` allows the domain; UI shows a graceful fallback
  (placeholder block with listing icon) when an image fails to load.

## 3. No "favorite / roommate-match" endpoints
- The backend has no favourites, no roommate-matching module. Task 10 mentions optimistic
  favorite updates — implemented on the mutations that do exist (approve/reject, status
  changes, apply/viewing requests) instead.

## 4. No contact endpoint
- The API has no `/contact` (or similar) endpoint. The Contact page form is fully validated
  (RHF + Zod) and hands the message to the visitor's mail client (mailto with pre-filled
  subject/body) instead of faking a submission. See `src/components/contact/contact-form.tsx`.
