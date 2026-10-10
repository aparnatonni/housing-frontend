# BLOCKERS

## 1. RESOLVED — Demo credentials now live (2026-10-09)
- The backend now ships working demo accounts verified against the live API:
  - `admin@nestmate.com` / `Demo@12345` → **ADMIN** ✔
  - `tenant@nestmate.com` / `Demo@12345` → **TENANT** ✔
  - `landlord@nestmate.com` / `Demo@12345` → **OWNER** ✔
- All three Demo Login buttons on `/login` call the real `/auth/login` endpoint, return valid
  tokens and `/auth/me` confirms the roles above; role-based redirects send each account to
  `/admin`, `/dashboard` and `/provider` respectively.
- Backend role enum is `TENANT | OWNER | ADMIN` (landlord = `OWNER`). The frontend uses
  `OWNER` consistently across types, middleware, sidebar nav and redirects.
- Previously `admin@housing.com` returned `401`; that placeholder is gone.

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

## 10. E2E flow verified live 2026-10-10 (demo tenant → test owner → gateway)
- Ran the full tenant→landlord→payment flow against the live API with the demo tenant and a
  throwaway owner (`flowtest.owner@nestmate.com`, property "Flow Test Flats", room 401).
  Every step succeeded and returned the documented shape:
  1. `POST /applications { roomId, moveInDate, note }` → application id.
  2. `PATCH /applications/:id/approve` → creates an **ACTIVE tenancy** (confirmed via
     `GET /tenancies/:propertyId`), frees the room. Re-approving returns
     `400 "Application has already been processed"`.
  3. `POST /tenancies/:id/rent-payments/generate { dueDate }` → PENDING invoice in
     `{ history: [], upcoming: [...] }`.
  4. `POST /payments/initiate { type: "RENT", referenceId: <rentPaymentId> }` →
     `gatewayPageURL` (real sandbox.sslcommerz.com checkout) + `payment { id, amount,
     currency: "BDT", purpose: "RENT" }`.
  5. `POST /bill-splits { tenancyId, billType, totalAmount, dueDate, ratio: [n] }` then
     `POST /payments/initiate { type: "BILL", referenceId: <splitId> }` → `gatewayPageURL`
     (amount 150 BDT). Validation requires `billType` ∈ ELECTRICITY|WATER|GAS|INTERNET|OTHER
     and `ratio` as an **array** (a bare number 400s).
  6. `GET /payments/:id` returns the payment to the payer — the `/payment/success` page's
     verification path works.
- **Frontend bug found & fixed**: `useInitiatePayment` stored `data.tranId`/`data.paymentId`
  in sessionStorage, but the API nests them under `data.payment.{ id, gatewayTransactionId }`.
  The stored record had `undefined` ids, so `/payment/success` could not auto-verify the
  transaction. Now stores `payment.id`.
- Notes: the two endpoint calls above (approve, generate, initiate) occasionally take 60–120 s
  before responding (gateway round-trip on Render free tier) — not a frontend issue, but
  buttons stay in a loading state meanwhile. The demo tenant's pre-existing APPROVED seed
  application on "Sunrise Apartments" (room SINGLE, `isAvailable: false`) has `tenancy: null`
  — the approve→tenancy code path works (we proved it), so that is seed-data drift, and the
  tenant's `GET /tenancies/my-tenancy` (404) + no payments remain the correct UI empty states.


