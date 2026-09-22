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

## Current Progress (as of Sep 21, 2026)

### Completed

- Phases 1–13 complete: DB + seeding, NextAuth auth, Zustand stores, product/category system, cart (API + UI + persistence), checkout & orders (API + UI), SSLCommerz payment integration, user profile (account info, password change, address book), admin dashboard (products/orders/users/categories + stats + print), reviews & wishlist (server-synced), search & filtering (URL filters, sort, pagination, debounced search bar with suggestions), coupon system (server-validated, admin CRUD, 3 coupon types), email (Resend + dev fallback, HTML templates), in-app notifications (Notification + NotificationPreference models, lifecycle-wired), 117 Jest tests (unit + API + component), Playwright E2E specs, Performance & SEO (ISR on public pages, image priority/lazy loading, Suspense streaming, caching headers, bundle analysis; sitemap.xml, robots.txt, Open Graph/Twitter images via ImageResponse, JSON-LD WebSite/Organization/Product/BreadcrumbList, full metadata + canonical per page), TypeScript migration, error boundaries, loading states, Cloudinary image upload
- **Phase 14 (deployment) — app is LIVE at https://clickcart-ecommerce.vercel.app** on Vercel + Neon prod DB (`ep-divine-king-b41ly5f0`, seeded: admin, 6 categories, 14 products, 3 coupons, site settings). All code committed (`cc20d59`), pushed to `origin/main`, GitHub Actions CI active
- Security hardening (committed `c48ed5e`): env-driven `ADMIN_SEED_PASSWORD`, debug artifacts removed, in-memory rate limiting (login/register/forgot/reset-password/contact/newsletter/coupon-validate), honeypot fields on Contact/Newsletter, security headers (HSTS preload, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy)
- Cloudflare Turnstile CAPTCHA: server verify lib (`src/lib/turnstile.ts`) + self-configuring widget (`TurnstileCaptcha`) wired into login/register/forgot/reset-password/contact/newsletter; active only when `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` set (honeypot remains as fallback). 23 suites / 133 tests pass
- **Checkout → login loop fixed (Sep 22, committed locally, NOT pushed):** `/signin` + `/signup` now honor the middleware `?callbackUrl=…` param via `safeCallbackUrl` (`src/lib/callback-url.ts`), redirect after auth with a full-page `window.location.assign` (client `router.replace` to a protected route right after login races the session cookie and bounces back — reproduced at loopback; prod already fine), plus E2E regressions (guest→checkout→sign-in→back at `/checkout`) and hardened checkout spec locators, `playwright.config.ts` `timeout: 120_000`
- Custom domain `clickcarts.me` attached to Vercel (apex → 308 → `www.clickcarts.me`); `NEXT_PUBLIC_APP_URL` still needs updating to `https://www.clickcarts.me` in Vercel env + redeploy
- Vercel Hobby limit: only 1 cron/day → daily `cancel-stale-pending` only (health keepalive cron removed); free UptimeRobot ping to `/api/health` is the recommended warm-up
- `.env.example` rebuilt and committed with all keys documented; `DATABASE_KEEPALIVE_MS=30000` in dev `.env`
- See `PROJECT_STATUS.md` for the full phase-by-phase record

### Remaining (Needs User Account/Decisions)

- Custom domain `clickcarts.me` attached → update `NEXT_PUBLIC_APP_URL` to `https://www.clickcarts.me` in Vercel env + redeploy (also Google OAuth callback URI)
- Live SSLCommerz merchant creds (`SSLCOMMERZ_IS_LIVE=true`), live Resend + Cloudinary keys
- Add Turnstile keys (`TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY`) to Vercel env to activate the CAPTCHA (code already deploy-ready)
- Optional: Vercel KV rate limiting, Sentry monitoring, rotate Neon prod DB password

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

- **Phase 14:** Deployment (Next — custom domain, live SSLCommerz/Resend/Cloudinary credentials, Turnstile keys; optional KV rate limiting, monitoring)

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
