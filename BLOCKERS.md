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

## 5. Landlord cannot list received applications (2026-10-09)
- The docs describe `PATCH /applications/:id/approve|reject`, but there is **no endpoint to
  list applications for a landlord's properties** — `GET /applications/received`,
  `/applications/property/:id`, `/properties/:id/applications` all return
  `404 Route not found`. `GET /applications/my-applications` is tenant-scoped only.
- Workaround: the provider dashboard surfaces viewing requests
  (`GET /viewing-requests/received`) + tenancies + maintenance instead of an applications
  inbox. Approve/reject UI is omitted until a received-applications endpoint exists.

## 6. `GET /tenancies` owner list route is missing
- Docs list `GET /tenancies?page&limit&status` (OWNER) but the deployed API returns
  `404 Route not found` for `/tenancies` and `/tenancies/` (both with a fresh token).
- Discovery: `GET /tenancies/:propertyId` **does** work and returns that property's
  tenancies (`items[]` with `id`, `rentAmount`, `status`, `room`, `application`).
- Workaround: `/provider/earnings` fans out over `GET /properties/my-properties` →
  `/tenancies/:propertyId` → `/tenancies/:tenancyId/rent-payments` to build the rent roll.

## 7. Rent-payments response shape is an object, not a list
- `GET /tenancies/:id/rent-payments` returns `{ history: [...], upcoming: [...] }`
  (`history` = paid, `upcoming` = dues), verified live. Frontend types this as
  `RentPaymentsResponse` and merges the two arrays for display.

## 8. Photo upload endpoint requires CLOUDINARY_* env vars
- `POST /properties/:id/images` accepts multipart field `images` (max 10, ≤5 MB, image/*)
  per the docs, but notes it "requires CLOUDINARY_* env vars". If the deployed backend is not
  configured, uploads fail. The Post-a-Listing wizard uploads selected files after creating
  the property and warns (without blocking) if any upload fails; URL-based images always work.

## 9. No admin property-list endpoint (2026-10-09)
- Admin can `PATCH /admin/properties/:id/status`, but there is **no `GET /admin/properties`**
  to enumerate listings (including inactive ones). The admin "Listings" tab therefore uses the
  public `GET /properties` feed (active listings only) with search + pagination, and the UI
  states this limitation. Action needed: add an admin property list to B7A6.


