# Housing & Roommate Platform: Frontend (B7A7)

## Stack
Next.js (App Router) + TypeScript (strict, no `any`), Tailwind CSS, shadcn/ui,
TanStack Query, Zustand, React Hook Form + Zod, Sonner, Recharts, Lucide, next/image.

## Domain
Housing & Roommate Platform. 3 roles:
- ADMIN: manages users, listings, reports, analytics
- TENANT (user): searches listings/roommates, applies/books, pays, profile
- LANDLORD (provider): posts/manages listings, handles requests, earnings

## Backend
Real API only (my B7A6 backend), base URL from `NEXT_PUBLIC_API_URL`.
No mock data, no Lorem ipsum, no placeholder images.

## Rules (mandatory for grading)
1. Server Components by default; add "use client" only for state/effects/handlers.
2. Every route group has layout.tsx; every data page has loading.tsx (skeleton) and error.tsx.
3. Middleware protects routes by role (/admin, /dashboard, /provider). Role-based UI rendering.
4. Login page has one-click Demo Login buttons for Admin, Tenant, Landlord.
5. All forms: React Hook Form + Zod, human-readable errors. One multi-step wizard form (Post a Listing).
6. Filter/sort/search/pagination live in the URL (useSearchParams).
7. Payment: Stripe or SSLCommerz test mode, with /payment/success and /payment/cancel. No fake payments.
8. Every list shows an empty state. API failures show Sonner toast.
9. Reusable components: DataTable, StatCard, StatusBadge, SearchInput, EmptyState.
10. Custom hooks for repeated logic (useAuth, useDebounce, usePagination).
11. Public pages export Metadata (title, description, Open Graph).
12. next/image for all images. Mobile-first, consistent theme.
13. Git: commit after every sub-step (not only after whole tasks), using conventional
    messages (feat:, fix:, chore:, refactor:, style:). Run `git push` after every commit.
    Target 30+ commits. Never commit .env.local or secrets. If push fails, log it in
    BLOCKERS.md and keep working.

## Routes (18+)
/, /about, /services, /contact, /pricing (or /faq), /login, /register,
/admin, /admin/manage, /admin/reports,
/dashboard, /dashboard/profile, /dashboard/payments,
/provider, /provider/earnings, /provider/profile,
/payment/success, /payment/cancel, not-found.tsx, error.tsx

## Working style
Work autonomously through the full task list in PROGRESS.md without waiting for confirmation.
After each sub-step: commit and push. After each task: run `npm run build`, fix errors,
tick the box in PROGRESS.md, then continue to the next task.
Only stop for a genuine blocker (missing credentials, missing API endpoint).
If the API lacks something, note it in BLOCKERS.md, build the UI against what exists, and move on.