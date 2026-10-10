# API_NOTES — B7A6 backend consumed by B7A7 frontend

Base URL: `NEXT_PUBLIC_API_URL` = `https://housing-backend-2-pr71.onrender.com/api/v1`
(Render free tier — first request can take 30-60s to wake; retry before assuming down.)
Postman docs: https://documenter.getpostman.com/view/55149190/2sBYAxQ9WU
(collection JSON fetched from `https://documenter.gw.postman.com/api/collections/55149190/2sBYAxQ9WU`)

## Envelope (every response)
```jsonc
{ "success": true|false, "message": "Human text", "data": <payload>, "errors": null | { field: [msgs] } }
```
Pagination list payload: `{ "items": [...], "meta": { total, page, limit, totalPages, hasNextPage } }`
Maintenance list returns a bare array in `data`.
Validation errors: HTTP 400 with `errors` map (Zod, e.g. `{"email":["Invalid input: expected string, received undefined"]}`).

## Auth
- `Authorization: Bearer <accessToken>` (JWT, ~15 min) + `refreshToken` (JWT, ~7 days,
  also set as httpOnly cookie scoped `/api/v1/auth`).
- Roles: **TENANT**, **OWNER**, **ADMIN** (register accepts only TENANT/OWNER; OWNER = landlord/provider).
- Suspended users (`isSuspended`) are rejected on protected endpoints.

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | `{ email, password, name, phone?, role? }` → user + tokens |
| POST | `/auth/login` | `{ email, password }` → `{ user, accessToken, refreshToken }` |
| POST | `/auth/refresh-token` | `{ refreshToken }` → rotated tokens |
| POST | `/auth/logout` | `{ refreshToken }` revokes |
| GET | `/auth/me` | current user from bearer |
| GET | `/users/me` | full profile (incl. roommatePreference) |
| PATCH | `/users/me` | `{ name, phone, avatarUrl, bio, roommatePreference{...} }` |
| PATCH | `/users/change-password` | `{ currentPassword, newPassword }` |
| GET | `/users/:id` | public profile |

### Demo accounts (live, verified 2026-10-09)
- `tenant@nestmate.com` / `Demo@12345` → TENANT ✔
- `landlord@nestmate.com` / `Demo@12345` → OWNER (landlord) ✔
- `admin@nestmate.com` / `Demo@12345` → ADMIN ✔
- Login + `GET /auth/me` (Bearer) verified for all three; role enum is `TENANT | OWNER | ADMIN`.

## Properties (listings)
| Method | Path | Notes |
|---|---|---|
| GET | `/properties` | public list. Query: `page, limit, city, minRent, maxRent, propertyType, search, sortBy(newest/oldest/price_asc/price_desc)`. Items include `roomCount`, `minRent`. Redis-cached 60s (`X-Cache` header) |
| GET | `/properties/:id` | detail: + `description, updatedAt, rooms[], owner{id,name,email,phone,avatarUrl,isVerified}` |
| POST | `/properties` | OWNER. `{ title, description, address, city, area, state, zipCode, propertyType, amenities[], images[], status }` |
| PATCH | `/properties/:id` | OWNER, own property |
| DELETE | `/properties/:id` | OWNER, soft delete |
| GET | `/properties/my-properties` | OWNER. `page, limit, search` |
| POST | `/properties/:id/rooms` | `{ roomType, rentAmount, isAvailable, capacity, images[] }` |
| POST | `/properties/:id/images` | multipart (Cloudinary) |
| PATCH/DELETE | `/rooms/:id` | OWNER, own room |

`propertyType`: APARTMENT | STUDIO | HOUSE | CONDO | DUPLEX | ROOM (seed data shows APARTMENT/STUDIO).
`roomType`: SINGLE | DOUBLE | SUITE | STUDIO | QUAD (seed).
Enums seen: listing `status`: ACTIVE | INACTIVE; room `isAvailable`: bool.

## Tenant actions
| Method | Path | Notes |
|---|---|---|
| POST | `/viewing-requests` | `{ roomId, requestedDate, notes }`, 409 on duplicate pending |
| GET | `/viewing-requests/my-requests` | `page, limit, status` |
| POST | `/applications` | `{ roomId, moveInDate, note }`, 409 on dup/unavailable |
| GET | `/applications/my-applications` | items include `status, tenancy?, tenant, room.property` |
| GET | `/tenancies/my-tenancy` | current ACTIVE tenancy (404 if none) |
| GET | `/maintenance-requests/my-requests` | bare array in `data` |
| POST | `/maintenance-requests` | `{ roomId, category, description, priority }` LOW/MEDIUM/HIGH/URGENT |
| POST | `/bill-splits` | `{ tenancyId, billType, totalAmount, dueDate, ratio | shares }` |
| PATCH | `/bill-splits/:id/settle-share` | TENANT |
| GET | `/payments/my-payments` | `page, limit` |

## Landlord/OWNER actions
| Method | Path | Notes |
|---|---|---|
| GET | `/viewing-requests/received` | `page, limit, status` |
| PATCH | `/viewing-requests/:id/status` | `{ status }` PENDING→APPROVED/REJECTED/CANCELLED; APPROVED→COMPLETED/CANCELLED |
| PATCH | `/applications/:id/approve` | creates ACTIVE tenancy, frees room, rejects others |
| PATCH | `/applications/:id/reject` | |
| GET | `/tenancies/:propertyId` | **verified live** — tenancies for one owned property (the documented `GET /tenancies` list is 404 on the deployed API) |
| GET | `/tenancies/:id/rent-payments` | `{ history: [...], upcoming: [...] }` (object, not array) |
| POST | `/tenancies/:id/rent-payments/generate` | `{ dueDate }` |
| POST | `/rent-payments/:id/mark-paid` | offline/cash |
| GET | `/maintenance-requests/property/:propertyId` | own property requests (bare array) |
| PATCH | `/maintenance-requests/:id/status` | OPEN→IN_PROGRESS→RESOLVED→CLOSED |
| POST | `/properties` | create listing (wizard step 1) |
| POST | `/properties/:id/rooms` | add a room (wizard step 2) |
| POST | `/properties/:id/images` | multipart field `images` (≤10 files, ≤5 MB) |

## Payments — SSLCommerz (test mode) — NOT Stripe
| Method | Path | Notes |
|---|---|---|
| POST | `/payments/initiate` | TENANT. `{ type: "RENT"\|"BILL", referenceId }` → returns `gatewayPageURL` (redirect browser). 409 if in-flight |
| GET | `/payments/success?val_id&tran_id` | backend callback, re-validates with gateway |
| GET | `/payments/fail?tran_id` | marks FAILED |
| GET | `/payments/cancel?tran_id` | marks FAILED (cancelled) |
| POST | `/payments/webhook` | IPN (server-to-server) |
| GET | `/payments/:id` | status lookup (payer / property owner / admin) |

## Admin (ADMIN only)
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/dashboard-stats` | aggregate counts/sums (for stat cards + charts) |
| GET | `/admin/users` | `page, limit, role, search` |
| PATCH | `/admin/users/:id/status` | `{ isSuspended: bool }` |
| PATCH | `/admin/properties/:id/status` | `{ status: "ACTIVE"\|"INACTIVE" }` |
| GET | `/admin/payments` | `page, limit, status, gateway, purpose` |
| GET | `/admin/audit-logs` | `page, limit, entityType, userId, from, to` — used for "reports" page |

## Health
`GET /health` → `{ success, message, data: { uptime, timestamp } }`

## Frontend mapping decisions
- Role names in UI: OWNER is rendered as **Landlord / Provider** (`/provider` routes).
- Payments page: SSLCommerz initiate → `window.location.href = gatewayPageURL`;
  frontend `/payment/success` + `/payment/cancel` pages re-check status via
  `GET /payments/:id` (or the backend callback query params) — no fake payment states.
- Earnings page = sum of own tenancies' rent payments (no dedicated earnings endpoint).
- Reports page = admin audit logs + platform payments.
- No favourites/roommate-matching endpoints exist (see BLOCKERS.md).
