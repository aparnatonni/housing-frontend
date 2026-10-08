# NestMate — Housing & Roommate Platform (Frontend)

A production-style Next.js (App Router) frontend for a housing & roommate platform with three
roles — **Tenant**, **Landlord/Provider** and **Admin** — built against a real REST backend
(B7A6). No mock data, no placeholder copy and no fake payments.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components by default) |
| Language | TypeScript (strict, zero `any`) |
| Styling | Tailwind CSS v4 + shadcn/ui (built on `@base-ui/react`) |
| Data | TanStack Query v5 |
| State | Zustand (persisted auth store) |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |
| Charts | Recharts |
| Icons | lucide-react |
| Images | `next/image` (via a `SafeImage` wrapper) |

## Roles & routes

| Role | Routes |
| --- | --- |
| Public | `/`, `/about`, `/services`, `/contact`, `/pricing`, `/faq`, `/listings`, `/listings/[id]`, `/login`, `/register` |
| Tenant (`TENANT`) | `/dashboard`, `/dashboard/profile`, `/dashboard/payments`, `/payment/success`, `/payment/cancel` |
| Landlord (`OWNER`) | `/provider`, `/provider/new`, `/provider/earnings`, `/provider/profile` |
| Admin (`ADMIN`) | `/admin`, `/admin/manage`, `/admin/reports` |

Plus `not-found.tsx`, a global `error.tsx` and per-route-group `loading.tsx` / `error.tsx` files.

## Getting started

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL + NEXT_PUBLIC_SITE_URL
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the B7A6 backend (e.g. `.../api/v1`), no trailing slash |
| `NEXT_PUBLIC_SITE_URL` | Public origin of this app, used for canonical/Open Graph URLs |

## Demo accounts

The **Login** page has one-click Demo Login buttons. The buttons call the real `/auth/login`
endpoint — nothing is faked.

| Role | Email | Password |
| --- | --- | --- |
| Tenant | `tenant1@housing.com` | `Password123!` |
| Landlord | `owner1@housing.com` | `Password123!` |
| Admin | `admin@housing.com` | `Password123!` (see `BLOCKERS.md` #1 — backend currently returns 401) |

## Features

- **Auth & RBAC** — register/login/logout, one-click demo logins, a persisted Zustand session,
  role cookies and middleware that guards `/admin`, `/dashboard` and `/provider` by role, plus
  role-based navigation and UI rendering.
- **Listings** — browse with URL-driven filters/sort/search/pagination
  (`useSearchParams`), rich detail page, viewing request and application dialogs, and a
  graceful image fallback for missing photos.
- **Tenant dashboard** — stat cards, URL-synced applications/viewing-request tabs, profile
  (avatar upload via canvas downscale, roommate preferences, change password) and a payments
  panel (rent invoices, bill splits, history).
- **Landlord dashboard** — overview stats, listing management, a 5-step **Post a Listing**
  wizard (basics → location → amenities & photos → rooms → review) that creates the property,
  its rooms and uploads images, viewing-request handling, an earnings rent roll with a chart,
  and profile management.
- **Admin dashboard** — platform stats + charts, user moderation (suspend/reactivate),
  listing moderation and payments/audit-log reporting with filters.
- **Payments** — SSLCommerz test-mode checkout via `POST /payments/initiate` (redirects to the
  gateway) with `/payment/success` and `/payment/cancel` result pages that verify the
  transaction server-side. No mock payments.

## Reusable building blocks

- Components: `DataTable`, `StatCard`, `StatusBadge`, `SearchInput`, `EmptyState`, `SafeImage`,
  `PaginationBar`, `LoadingButton`, skeleton loaders, `RouteError`.
- Hooks: `useAuth`, `useDebounce`, `usePagination` (+ `useUrlParam`).
- `api` client (`get`/`post`/`patch`/`del`/`upload`) with typed envelopes, a `serverFetch`
  helper for Server Components, and automatic 401 refresh.

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build (must stay green)
npm run start    # serve the production build
npm run lint     # eslint
```

## Project docs

- `PROGRESS.md` — task checklist and current state.
- `API_NOTES.md` — verified backend endpoints and response quirks.
- `BLOCKERS.md` — known backend gaps and the workarounds used.
- `FINAL_REPORT.md` — completion summary, decisions and verification.

## Deployment

Deploy to Vercel (or any Node host). Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` in
the project's environment, then `npm run build`.
