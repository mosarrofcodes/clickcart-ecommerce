# ClickCart — Go-Live Path (saved action plan)

Tracked here so we advance one step at a time. Toggle each box from
`[ ]` to `[x]` as we complete it.

## Stage A — Code-side fixes (I can do, ~10 min)
- [x] **Admin password → env-driven** (remove hardcoded `admin123` in `prisma/seed.ts`)
- [x] **Delete debug artifacts** — `debug/`, `check-db.tmp.ts`, `test-results/`, `playwright-report/`
- [x] **Final verification** — lint, `tsc --noEmit`, tests (106 pass), production build
  (also: `.gitignore` now covers `test-results/`, `playwright-report/`, `debug/`)

## Stage B — Account setup (user, ~1-2 hours) + deploy
- [ ] **Commit + push** to GitHub (prepare commit when requested)
- [ ] **Neon:** create production database
- [ ] Run `npx prisma db push` + `npm run db:seed` against prod DB
- [ ] **Vercel:** import repo + set env vars (exact list below), first deploy
- [ ] **Domain:** attach custom domain, set `NEXT_PUBLIC_APP_URL` to real domain

### Vercel production env vars
- `DATABASE_URL` — prod Neon, **direct** (non-pooler) host
- `AUTH_SECRET` — `openssl rand -base64 32`
- `AUTH_TRUST_HOST=true`
- `ADMIN_SEED_PASSWORD` — strong value, used only when seeding
- `NEXT_PUBLIC_APP_URL` — real domain
- `CRON_SECRET` + `AUTO_CANCEL_PENDING_HOURS=24`
- `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWD`, `SSLCOMMERZ_IS_LIVE` (sandbox until live)
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## Stage C — Post-launch (gradual, no rush)
- [ ] **Payments live** — apply for SSLCommerz live merchant, switch `SSLCOMMERZ_IS_LIVE=true`, re-test payment + IPN
- [ ] **Email live** — confirm Resend domain, set `RESEND_API_KEY`
- [ ] **Images live** — real Cloudinary keys, re-upload product images
- [ ] **Security sprint** — rate limiting (auth/contact/newsletter), CAPTCHA, security headers (CSP/HSTS)
- [ ] **Monitoring** — Sentry / Vercel Analytics, Neon backups, uptime alerts
- [ ] **Trust & legal** — real business address/phone/socials, privacy/terms/return policies
- [ ] **Payment badges** — only show methods you're authorized to use
- [ ] **COD fraud guard** — tune `codMaxAmount` / flag high-value COD orders
- [ ] **Localization** — Bengali language toggle
- [ ] **Growth** — Google OAuth live, weekly reports automation, marketing emails

## Accepted risks (can ship with these today)
- English-only content
- No rate limiting yet (add in security sprint)
- No Sentry/analytics yet

## Already green (launch-safe baseline)
- 106 Jest tests (19 suites) + 4 Playwright E2E passing
- lint + `tsc --noEmit` clean, production build passes
- SEO/ISR/caching, error boundaries, auth guards
- DB keepalive + Vercel health cron (Neon stays warm)