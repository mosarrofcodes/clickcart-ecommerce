<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# ClickCart Project Context

## Project Overview

- **Name:** ClickCart
- **Type:** E-commerce storefront (Next.js 16)
- **Status:** Full-stack prototype (Next.js 16 + Prisma + Neon PostgreSQL)
- **Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Prisma + Neon

## Current Progress (as of Sep 17, 2026)

### Completed

- Phases 1–13 complete: DB + seeding, NextAuth auth, Zustand stores, product/category system, cart (API + UI + persistence), checkout & orders (API + UI), SSLCommerz payment integration, user profile (account info, password change, address book), admin dashboard (products/orders/users/categories + stats + print), reviews & wishlist (server-synced), search & filtering (URL filters, sort, pagination, debounced search bar with suggestions), coupon system (server-validated, admin CRUD, 3 coupon types), email (Resend + dev fallback, HTML templates), in-app notifications (Notification + NotificationPreference models, lifecycle-wired), 91 Jest tests (unit + API + component), Playwright E2E specs, Performance & SEO (ISR on public pages, image priority/lazy loading, Suspense streaming, caching headers, bundle analysis; sitemap.xml, robots.txt, Open Graph/Twitter images via ImageResponse, JSON-LD WebSite/Organization/Product/BreadcrumbList, full metadata + canonical per page)
- Phase 14 (deployment readiness, code side): `.env.example` + `AUTH_TRUST_HOST=true` (fixes `/api/auth` 500 under `next start` — verified 200), `middleware.ts` → `proxy.ts` (Next 16 deprecation gone; guard verified), Prisma `binaryTargets` for Vercel Lambda, `vercel.json` (prisma generate + build), GitHub Actions CI + Vercel deploy workflows, `.gitignore` un-ignores `.env.example`
- TypeScript migration, error boundaries, loading states, Cloudinary image upload
- Project context maintained in `PROJECT_STATUS.md`, `PROJECT_PLAN.md`

### Uncommitted Changes

All changes from the TypeScript migration onward are **uncommitted**. Run `git status` to see:
- Deleted `.jsx` files, TSX conversions across `src/app` and `src/components`
- New: `src/middleware.ts` → renamed `src/proxy.ts`, `src/types/`, `prisma/`, `src/store/`, `src/lib/{api,cart-service,cloudinary,order-status,review-service,product-query,sslcommerz,email,notification,coupon-service,site}.ts`, `src/app/api/**`, `src/components/{admin,order,profile,product,search,layout}/`, error/loading pages
- New: `src/app/api/payments/sslcommerz/*`, `src/app/(routes)/payment/status`
- New: `src/app/api/user/{profile,password,addresses,notification-preference}/**`, `src/app/(routes)/profile`, `src/components/profile/`
- New: `src/app/admin/**`, `src/components/admin/*`, `src/app/api/{reviews,wishlist,users/[id],coupons/**,notifications/**}/**`, `src/app/api/orders/[id]/status`, `src/app/(routes)/wishlist`, `src/app/(routes)/notifications`
- New: `__tests__/` (14 test files, 91 tests), `playwright.config.ts`, `e2e/` (3 Playwright specs)
- New: `jest.config.mjs`, `jest.setup.ts`
- New (Phase 13): `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx`, `src/lib/site.ts`
- Updated (Phase 13): `next.config.mjs` (caching headers + bundle analyzer wiring), `package.json` / `package-lock.json` (`@next/bundle-analyzer` devDep)
- New (Phase 14): `vercel.json`, `.github/workflows/{ci,deploy}.yml`, `.env.example` (now committed — `.gitignore` un-ignores it), Prisma `binaryTargets` serverless targets in `prisma/schema.prisma`
- Schema additions: `User.isBlocked`, `Wishlist`, `Notification`, `NotificationPreference`, `Coupon`, `CouponUse` models, `CouponType` enum, `Order.couponId` + `Order.discount` (all `prisma db push`ed)

**ACTION NEEDED:** Commit Phases 10–14, then `git push origin main` and continue Phase 14 account steps (Vercel: env vars + deploy; Neon prod DB; GitHub secrets; custom domain).

## Roadmap

**Full project plan:** See `PROJECT_PLAN.md` for detailed breakdown of all 14 phases and 60+ units.

### Quick Overview

| Phase | Description                        | Status      |
| ----- | ---------------------------------- | ----------- |
| 1     | Backend Foundation (DB, Auth, API) | IN PROGRESS |
| 2     | Product System                     | COMPLETE ✅ |
| 3     | Cart System                        | COMPLETE ✅ |
| 4     | Checkout & Orders                  | COMPLETE ✅ |
| 5     | Payment Integration                | COMPLETE ✅ |
| 6     | User Profile                       | COMPLETE ✅ |
| 7     | Admin Dashboard                    | COMPLETE ✅ |
| 8     | Reviews & Wishlist                 | COMPLETE ✅ |
| 9     | Search & Filtering                 | COMPLETE ✅ |
| 10    | Coupon System                      | COMPLETE ✅ |
| 11    | Email & Notifications              | COMPLETE ✅ |
| 12    | Testing                            | COMPLETE ✅ |
| 13    | Performance & SEO                  | COMPLETE ✅ |
| 14    | Deployment                         | IN PROGRESS |

### Current Active Task

- **Phase 14:** Deployment (Next — commit Phases 10–13, then Vercel/Neon/GitHub account steps: env vars, deploy, custom domain)

## Important Decisions

- Language: Answer user in English only
- Backend: Prisma ORM selected
- Auth: NextAuth.js / Auth.js (implemented)
- Payment: SSLCommerz (implemented, sandbox; bKash optional later)

## User Preferences

- Speaks Bengali but wants responses in English
- Uses VS Code with OpenCode extension

First inspect the existing project.
Do not modify unrelated code.
Give me a short plan first.

After implementation:

- run lint
- run type check
- run build
- review the changes
- update PROJECT_STATUS.md
- report exactly what was changed and tested

Do not commit automatically.
