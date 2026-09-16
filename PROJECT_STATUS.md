# ClickCart — Project Status

**Last updated:** Sep 17, 2026

## Overall Progress

| Phase                           | Status      | Progress |
| ------------------------------- | ----------- | -------- |
| Phase 1: Backend Foundation     | IN PROGRESS | 75%      |
| Phase 2: Product System         | COMPLETE ✅ | 100%     |
| Phase 3: Cart System            | COMPLETE ✅ | 100%     |
| Phase 4: Checkout & Orders      | COMPLETE ✅ | 100%     |
| Phase 5: Payment Integration    | COMPLETE ✅ | 100%     |
| Phase 6: User Profile           | COMPLETE ✅ | 100%     |
| Phase 7: Admin Dashboard        | COMPLETE ✅ | 100%     |
| Phase 8: Reviews & Wishlist     | COMPLETE ✅ | 100%     |
| Phase 9: Search & Filtering     | COMPLETE ✅ | 100%     |
| Phase 10: Coupon System         | COMPLETE ✅ | 100%     |
| Phase 11: Email & Notifications | COMPLETE ✅ | 100%     |
| Phase 12: Testing               | COMPLETE ✅ | 100%     |
| Phase 13: Performance & SEO     | COMPLETE ✅ | 100%     |
| Phase 14: Deployment            | IN PROGRESS | 60%      |

## Phase 1: Backend Foundation

### Unit 1.1: Database Setup ✅

- Prisma schema created, Neon PostgreSQL connected
- Tables synced (19): User, Product, Category, Cart, CartItem, Order, OrderItem, Account, Session, VerificationToken, Address, Payment, Review, Wishlist, Notification, NotificationPreference, Coupon, CouponUse
- Prisma client singleton (`src/lib/db.ts`)

### Unit 1.2: Database Seeding ✅

- 6 categories, 14 products, admin user (admin@clickcart.com)
- Seed verified in database

### Unit 1.3: Authentication Setup ✅

- NextAuth.js v5 (beta 32), Prisma adapter, Credentials provider
- JWT + Session callbacks with role
- `AUTH_SECRET` set in `.env`

### Unit 1.4: Auth API Routes ✅

- `POST /api/auth/register` — creates user with bcrypt hashed password
- `POST /api/auth/login` — validates credentials via NextAuth signIn
- `GET /api/auth/session` — returns current session user
- `POST /api/auth/logout` — clears session
- All routes tested and passing

### Unit 1.5: Auth UI ✅

- Sign-in page (NextAuth signIn), sign-up page (register API)
- SessionProvider, navbar user menu
- Middleware protects /checkout, /orders, /profile, /admin

### Unit 1.6: Zustand Setup ✅

- Zustand v5 installed
- Auth store: session/user/role (`src/store/auth.ts`), synced from NextAuth in Providers
- Cart store: replaced React Context (`src/store/cart.ts`), localStorage persistence with hydration guard
- UI store: cart drawer, mobile menu, search, wishlist (`src/store/ui.ts`)
- Navbar, ProductCard, product detail, cart page migrated off Context

## Phase 2: Product System

### Unit 2.1: Product API Routes ✅

- `GET /api/products` — list with pagination, `?category=` and `?search=` filters
- `GET /api/products/[id]` — detail with category + reviews
- `GET /api/products/search?q=` — search title/description/brand/tags
- `GET /api/products/category/[slug]` — filter by category slug
- `POST /api/products`, `PUT /api/products/[id]`, `DELETE /api/products/[id]` — admin only (`requireAdmin` helper in `src/lib/api.ts`)
- SKU unique conflict → 409; invalid category → 400; missing product → 404; unauth → 401/403

### Unit 2.2: Category API Routes ✅

- `GET /api/categories` — list with product counts (`?withProducts=true` for full products)
- `GET /api/categories/[slug]` — detail with products
- `POST /api/categories`, `PUT /api/categories/[slug]`, `DELETE /api/categories/[slug]` — admin only (PUT/DELETE accept id or slug)
- Auto-generates slug from name on POST; duplicate slug → 409; delete with products → 409; missing → 404

### Unit 2.3: Product Pages Update ✅

- All product/category/search pages converted to Server Components using Prisma (dummyjson removed)
- `loading.tsx` added for `/products`, `/product/[id]`, `/categories`, `/categories/[slug]`, `/search`
- `error.tsx` added for `/products`; all pre-existing lint errors in `error.tsx` files fixed (`<a>` → `<Link>`)
- `generateMetadata` for product detail + category pages
- DB-driven pages set `force-dynamic` for fresh listings
- Client `AddToCartButton` extracted; `Product`/`CartItem` types migrated to Prisma shape (string id, `image`)

### Unit 2.4: Image Handling ✅

- Cloudinary SDK installed + configured (`src/lib/cloudinary.ts`); env vars in `.env`/`.env.example`
- `POST /api/upload` — admin-protected multipart upload to Cloudinary (folder `clickcart`), validates image type + 5MB limit
- `ImageUpload` client component (`src/components/admin/ImageUpload.tsx`) — preview, replace, progress, error toast
- All `<img>` → Next `<Image>` (ProductCard, product detail, cart) — fixed all 3 lint warnings
- `res.cloudinary.com` added to `next.config.mjs` remote patterns

## Phase 3: Cart System

### Unit 3.1: Cart API Routes ✅

- `src/lib/api.ts` — added `requireUser()` helper (auth + returns userId)
- `src/lib/cart-service.ts` — `getOrCreateCart()` + `cartSummary()` (subtotal), shared by all routes
- `GET /api/cart` — user's cart with items + product + category, returns subtotal
- `POST /api/cart/items` — `{ productId, quantity }`; upserts item with quantity increment; rejects qty < 1 (400), unknown product (404), over-stock (400)
- `PUT /api/cart/items/[productId]` — set quantity; validates stock
- `DELETE /api/cart/items/[productId]` — remove item (404 if not in cart)
- `DELETE /api/cart` — clears cart
- All routes 401 for guests; verified end-to-end with admin session

### Unit 3.2: Cart UI Updates ✅

- `src/store/cart.ts` — API-aware store: authed users sync to `/api/cart/*`, guests use local state; actions return `null` or an error string (toasted by callers); handles 401 fallback
- `src/store/wishlist.ts` — new persisted wishlist store (id set, toggle)
- `ProductCard` / `AddToCartButton` — await store action, toast API errors
- Cart page: quantity −/+ (disabled at 1 and at stock), "Move to Wishlist", remove, stock warning ("Only X in stock"), shipping cost (free ≥ $50, else $4.99), free-shipping progress hint, coupon input (SAVE10 / FREESHIP, client-side until Phase 10), order summary with discount

### Unit 3.3: Cart Persistence ✅

- `src/store/cart.ts` — guest cart kept in localStorage (key `clickcart-cart`); authed carts sync to `/api/cart/*`
- `mergeFromLocal()` — on login: POSTs each stored guest item to the API, reloads server cart, clears the localStorage key
- `partialize` — only persists local cart state when not authenticated
- `SessionProvider` — triggers merge exactly once on `authenticated`; re-syncs cart to the API when the browser comes back online (`window online` event)

## Phase 4: Checkout & Orders

### Unit 4.1: Checkout Page ✅

- `/checkout` (client page, auth-protected via middleware) — shipping address + phone, payment method (only `cash_on_delivery` enabled; bkash/sslcommerz shown disabled until Phase 5)
- Reads live cart from store, blocks placing order when cart is empty
- Server price rules reused: free shipping ≥ $50 (else $4.99), SAVE10/FREESHIP coupons (client-side), discount clamped to subtotal
- Success → `router.push("/orders/{id}?placed=1")` with confirmation banner

### Unit 4.2: Order API Routes ✅

- `POST /api/orders` — 401 guests; 400 empty cart / invalid payment (`ALLOWED_PAYMENT_METHODS`); creates Order (PENDING) + OrderItems + Payment (PENDING), decrements stock, clears cart
- `GET /api/orders` — current user's orders (newest first), owner/admin only
- `GET /api/orders/[id]` — order detail with items + payment; 404 if not owner/admin
- `PUT /api/orders/[id]/cancel` — only PENDING/CONFIRMED (400 otherwise), sets CANCELLED and restores stock; owner/admin only
- Stock is pre-checked (400 `Insufficient stock for …`); writes run in a single array `$transaction`

### Unit 4.3: Order UI ✅

- `/orders` — order list (server component) with status/date/total
- `/orders/[id]` — detail with items, totals (item/shipping/discount/total), status tracking steps, `?placed=1` confirmation banner, cancelled banner
- `CancelOrderButton` — two-click confirm inline cancel → restores stock server-side
- `src/lib/order-status.ts` — status→label/color/step mapping shared by pages

## Phase 5: Payment Integration ✅

### Unit 5.1: SSLCommerz Integration ✅

- `src/lib/sslcommerz.ts` — SSLCommerz REST helper (init/validate/verify), env-driven sandbox/live switching
- `POST /api/payments/sslcommerz/init` — auth-protected, order ownership + retry validation, initializes session, returns `GatewayPageURL`
- `GET /api/payments/sslcommerz/success` — amount + `val_id` verification → COMPLETED with `transactionId`; overcharged → FAILED; redirects to `/payment/status?result=…&orderId=…`
- `GET /api/payments/sslcommerz/fail`, `/cancel` — update payment to FAILED, redirect to result page
- `POST /api/payments/sslcommerz/ipn` — server-to-server webhook; validates amount + status, stores `val_id`
- `GET /api/payments/sslcommerz/status/[orderId]` — auth-protected payment status poll

### Unit 5.2: bKash Integration (Optional) ⏳

- Deferred — SSLCommerz already supports bKash as a gateway option

### Unit 5.3: Payment UI ✅

- `src/app/(routes)/payment/status/page.tsx` — user-facing success / failed / cancelled / processing page
- Checkout page — SSLCommerz enabled; order create → init route → redirect to gateway page
- Order detail page — color-coded payment badge + `transactionId`; `PayNowButton` retries PENDING/FAILED SSLCommerz payments
- `.env.example` updated with `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWD`, `SSLCOMMERZ_IS_LIVE` (sandbox defaults included)

## Phase 6: User Profile ✅

### Unit 6.1: Profile API Routes ✅

- `GET /api/user/profile` — returns current user info (id, name, email, role, createdAt)
- `PUT /api/user/profile` — update name + email; rejects duplicate email (409)
- `PUT /api/user/password` — current password verify + bcrypt hash; 6-char minimum, 400 on mismatch

### Unit 6.2: Address Management ✅

- `GET /api/user/addresses` — list user addresses, default-first, auth-protected
- `POST /api/user/addresses` — create; first address auto-default; optional `isDefault` flag auto-unsets others
- `PUT /api/user/addresses/[id]` — update fields; preserve or set default
- `DELETE /api/user/addresses/[id]` — remove; next address auto-defaulted if deleted one was default
- `POST /api/user/addresses/[id]` — toggle `isDefault`

### Unit 6.3: Profile UI ✅

- `src/app/(routes)/profile/page.tsx` — server component; auth-gated; fetches user + addresses; renders ProfileForm + AddressBook + Orders link
- `src/components/profile/ProfileForm.tsx` — inline edit name/email + change password (current + new); toast + loader
- `src/components/profile/AddressBook.tsx` — list (grid), add/edit via `Dialog`, delete (confirm), set-default; auto-default handling
- `src/types/index.ts` — added `Address` interface
- New shadcn/ui components installed: `dialog`, `select`, `textarea` (converted from Base UI JSX to TSX; `components.json` set to `"tsx": true`)

## Phase 7: Admin Dashboard ✅

### Unit 7.1: Admin Layout ✅

- `src/app/admin/layout.tsx` — server-side role gate (`auth()` + `role === "ADMIN"`, redirect otherwise); header + `AdminSidebar` (Dashboard/Products/Orders/Users/Categories) with active-link highlighting
- `src/components/admin/AdminSidebar.tsx` — client nav using `usePathname`
- `src/middleware.ts` already protects `/admin`; API routes self-guard with `requireAdmin()`

### Unit 7.2: Product Management ✅

- `src/app/admin/products/page.tsx` — server list (newest first) passed to the admin table
- `src/components/admin/AdminProductsTable.tsx` — inline search, checkbox bulk-select + bulk delete, per-row edit/delete, stock color hints
- `src/components/admin/ProductForm.tsx` — full create/edit form (title, description, price, stock, SKU, brand, weight, tags, category select, `ImageUpload`); posts to `POST/PUT /api/products`
- `/admin/products/new` + `/admin/products/[id]/edit` — server pages fetching categories (+ product) and rendering `ProductForm`

### Unit 7.3: Order Management ✅

- `PUT /api/orders/[id]/status` — admin-only; validates against `OrderStatus`, rejects CANCELLED→change, marks cash payment COMPLETED on DELIVERED
- `src/app/admin/orders/page.tsx` — server list with `?status=` filter + status badge
- `src/components/admin/AdminOrdersTable.tsx` — status filter select, per-row inline status update (PUT + `router.refresh()`)
- `/admin/orders/[id]` — detail with items, shipping address, payment info, order summary (recomputes shipping/discount from stored total), customer block, `OrderStatusControl` + `PrintButton`
- `src/components/admin/OrderActions.tsx` — status select + `window.print()`; print styles in `globals.css` (.print-order only visible when printing)

### Unit 7.4: User Management ✅

- `PATCH /api/users/[id]/role` — admin-only; CUSTOMER/ADMIN
- `PATCH /api/users/[id]/block` — admin-only; prevents self-block
- `src/app/admin/users/page.tsx` + `AdminUsersTable.tsx` — list, role select, block/unblock toggle
- `src/lib/auth.ts` `authorize()` — blocked users cannot sign in

### Unit 7.5: Dashboard ✅

- `src/app/admin/page.tsx` — stat cards (sales/orders/customers/products labels), 14-day revenue bar chart (CSS), low-stock alerts (≤5), recent orders list
- No heavy chart dependency — chart is pure CSS/Tailwind

### Unit 7.6: Categories Management ✅

- `/admin/categories` — server list + `AdminCategories.tsx` (add dialog, two-click delete, product counts)

## Phase 8: Reviews & Wishlist ✅

### Unit 8.1: Reviews ✅

- `src/lib/review-service.ts` — `recomputeProductRating()` (re-aggregates avg rating, rounded to 2dp)
- `POST /api/reviews` — auth-protected; `upsert` on `@@unique([userId, productId])` (create or update own review); rating 1–5 validation
- `DELETE /api/reviews/[id]` — owner-only
- `src/components/product/StarRating.tsx` — read-only star display (sm/md/lg)
- `src/components/product/ReviewForm.tsx` — interactive star input + comment; sign-in prompt for guests; upsert submit; prefills existing review
- `src/components/product/ReviewList.tsx` — review cards with avatar, date, stars, comment; own-review delete with two-click confirm
- Product detail page — reviews section with rating summary, form, list; `product.rating` displayed via `StarRating`
- Note: update + create share the `POST` upsert endpoint (no separate PUT — simpler and one-review-per-product by design)

### Unit 8.2: Wishlist ✅

- Prisma `Wishlist` model (`userId` + `productId` `@@unique`, cascade) — synced to Neon via `prisma db push`
- `GET /api/wishlist` — returns full products for current user
- `POST /api/wishlist` — add (upsert); `DELETE /api/wishlist/[productId]` — remove
- `src/store/wishlist.ts` — rewritten to mirror cart store: stores `Product[]`, API sync when authed, localStorage for guests, `mergeFromLocal()` on login, `skipHydration` + `partialize`
- `SessionProvider` — rehydrates + merges wishlist store alongside cart (incl. `window online`)
- `src/components/product/WishlistButton.tsx` — heart toggle (filled red when active), used on `ProductCard` image overlay
- `/wishlist` page — grid of saved products with add-to-cart / remove / empty state
- Navbar — wishlist link with count badge + Admin link when role is ADMIN (desktop + mobile)

## Phase 9: Search & Filtering ✅

### Unit 9.1: Advanced Search ✅

- `src/components/search/SearchBar.tsx` — debounced (300ms) suggestions from `/api/products/search?q=&limit=5`, recent searches in localStorage (`clickcart-recent-searches`, last 5), keyboard nav (↑/↓/Enter/Esc), click-outside close
- Navbar desktop search now uses `SearchBar` (mobile menu search kept as-is)

### Unit 9.2: Filtering ✅

- `src/lib/product-query.ts` — shared query builder `buildProductQuery()` + `parseProductSearchParams()` + `getProducts()` + `getDistinctBrands()`; filters: search, category (slug), brand, minPrice/maxPrice, min rating, inStock; `mode:"insensitive"` for brand
- `GET /api/products` — now uses the shared helper (keeps `{products,total,page,limit,totalPages}` shape)
- `src/components/product/ProductFilters.tsx` — sort, category, brand, price (debounced), min-rating, items-per-page, in-stock checkbox; updates URL params (clears `page`)

### Unit 9.3: Sorting ✅

- `PRODUCT_SORTS`: newest, price_asc, price_desc, rating, popular (popular = most reviews via `reviews: { _count: "desc" }`)

### Unit 9.4: Pagination ✅

- `src/components/product/Pagination.tsx` — numbered pager (prev/next, ellipsis, ±2 window)
- `src/components/product/ProductsPagination.tsx` — client wrapper wiring `Pagination` to URL `page`
- `/products` page — server-driven: filter sidebar + grid + pager + items-per-page; `/search` page — server-driven sort/limit controls (`SearchControls.tsx`) + pager

## Phase 10: Coupon System ✅

### Unit 10.1: Coupon Backend ✅

- Prisma models (db-pushed, 19 tables now): `Coupon` (code unique, type `CouponType` enum PERCENT/FIXED/FREESHIP, value, minOrder, maxDiscount, usageLimit, timesUsed, validFrom/Until, active, onePerUser), `CouponUse` (couponId, userId, usedAt; `@@index([couponId, userId])` for per-user tracking), `Order.couponId` + `Order.discount`
- `src/lib/coupon-service.ts` — `calculateCouponDiscount()` (PERCENT with maxDiscount cap; FIXED capped at subtotal; FREESHIP freeShipping flag) + `findValidCoupon()` (active check, validFrom/Until, usageLimit, onePerUser, minOrder validation; code normalized to uppercase)
- `GET/POST /api/coupons` — admin list (with order counts) + create (code uppercase, P2002 → 409)
- `PUT/DELETE /api/coupons/[id]` — admin update (partial fields) + delete (P2025 → 404)
- `POST /api/coupons/validate` — authenticated user, validates against server-side cart subtotal, returns `{valid, code, discountAmount, freeShipping, subtotal}` or 400 error
- `POST /api/orders` — replaces untrusted `discount`/`freeShipping` body params with `couponCode`; validates server-side via `findValidCoupon`, sets `couponId` + `discount`, increments `timesUsed` + creates `CouponUse` in the same `$transaction`

### Unit 10.2: Coupon UI ✅

- Checkout page: server-validated coupon input (calls `/api/coupons/validate`), shows discount/free-shipping line + remove button, sends `couponCode` (not raw discount) to order API
- Cart page: placeholder coupon logic removed; hint message "Use coupon codes at checkout for extra savings"
- Admin: `/admin/coupons` server page + `AdminCoupons` client component (create/edit dialog with type select, value, minOrder, maxDiscount, usageLimit, validFrom/Until, onePerUser checkbox; active toggle button; delete with two-click confirm)
- Sidebar updated with Coupons nav item (Ticket icon)

## Phase 11: Email & Notifications ✅

### Unit 11.1: Email Setup ✅

- `src/lib/email.ts` — Resend client (falls back to console logging when `RESEND_API_KEY` is empty; all template calls return `{id:"dev"}` in dev)
- `src/lib/email-templates.ts` — `orderConfirmationEmail`, `shippingNotificationEmail`, `paymentReceiptEmail` (HTML strings with inline styles; `formatMoney` helper)
- `.env.example` updated with `RESEND_API_KEY=""` and `RESEND_FROM_EMAIL="ClickCart <orders@clickcart.example>"`

### Unit 11.2: Notifications ✅

- Prisma models added (db-pushed + client regenerated): `Notification` (id, userId, type enum `NotificationType`, title, body, link, read, createdAt; indexes on `[userId,read]` and `[userId,createdAt]`), `NotificationPreference` (userId unique, emailOrderUpdates, emailPayment, emailMarketing, inAppEnabled)
- `src/lib/notification.ts` — `createNotification` (creates in-app row + fires email based on preference), `getNotificationPreference` (upserts defaults), `notifyOrderPlaced`, `notifyOrderShipped`, `notifyOrderDelivered`, `notifyOrderCancelled`, `notifyPaymentCompleted`, `lowStockAlerts` (lists products ≤ 5 stock with an admin-facing link)
- Lifecycle wiring (all fire-and-forget via `void`): `POST /api/orders` → `notifyOrderPlaced` + `lowStockAlerts`; `PUT /api/orders/[id]/status` → `notifyOrderShipped` (on SHIPPED), `notifyOrderDelivered` + mark payment COMPLETED (on DELIVERED); `PUT /api/orders/[id]/cancel` → `notifyOrderCancelled`; SSLCommerz success + IPN → `notifyPaymentCompleted`
- `GET /api/notifications` — list latest 50 + `unreadCount`; `PATCH /api/notifications` — mark all read or single by `id`
- `GET/PUT /api/user/notification-preference` — fetch/update user prefs (upsert on first write)
- `src/components/layout/NotificationBell.tsx` — dropdown (unread badge, items with type badges + View links, mark-all-read)
- `src/components/layout/MobileNotificationsLink.tsx` — mobile menu notifications link with unread badge
- `src/components/layout/MarkAllReadButton.tsx` — client button for the `/notifications` page
- `src/app/(routes)/notifications/page.tsx` — server page listing notifications with badges + View + Mark All Read
- `src/components/profile/NotificationPreferenceForm.tsx` — checkbox toggles (email order updates, email payment, email marketing, in-app); inline save
- Profile page + Navbar updated to include notification controls

## Phase 12: Testing ✅

### Unit 12.1: Unit & API Tests ✅

- Jest + React Testing Library installed; `jest.config.mjs` (next/jest + jsdom + `@/` alias); `jest.setup.ts` (`@testing-library/jest-dom`)
- `tsconfig.json` types: `["node", "jest"]`
- `package.json` scripts: `test`, `test:watch`, `test:e2e`
- `__tests__/lib/cart-service.test.ts` — `computeShipping` edge cases, `cartSummary` totals
- `__tests__/lib/order-status.test.ts` — `ORDER_STATUS_STEPS`, `STATUS_COLORS`, `statusStepIndex`
- `__tests__/lib/product-query.test.ts` — `parseProductSearchParams`, `buildProductQuery` (filters, sort, pagination)
- `__tests__/lib/email-templates.test.ts` — `formatMoney`, template HTML output
- `__tests__/api/orders.test.ts` — `POST /api/orders` validation (auth, payment method, address/phone, empty cart, insufficient stock) + success with mocked db/notifications
- `__tests__/api/order-status.test.ts` — `PUT /api/orders/[id]/status` admin gate, invalid transitions, notification triggers
- `__tests__/api/reviews.test.ts` — `POST /api/reviews` auth, validation, product-not-found, upsert + recompute
- All API tests use `/** @jest-environment node */` (Node provides `Request`/`Response`; jsdom does not)

### Unit 12.2: Component Tests ✅

- `__tests__/components/ProductCard.test.tsx` — renders title/price/category, add-to-cart click, out-of-stock disabled
- `__tests__/components/AddToCartButton.test.tsx` — add-to-cart click, out-of-stock disabled
- `__tests__/components/StarRating.test.tsx` — aria-label, star count
- `__tests__/components/Pagination.test.tsx` — empty for 1 page, page numbers, dual ellipsis for many pages, onPageChange callbacks
- Mocks: `next/image`, `sonner`, `@/store/cart`, `@/store/wishlist`, `@/components/product/WishlistButton`

### Unit 12.3: E2E Specs ✅

- `playwright.config.ts` — chromium, `localhost:3000`, `webServer: npm run start`
- `e2e/auth.spec.ts` — register new user + sign in; admin sign in
- `e2e/checkout.spec.ts` — sign in → add product → cart → checkout → COD order → redirects to order detail
- `e2e/admin.spec.ts` — sign in → navigate to `/admin` → Dashboard heading visible
- Note: `npx playwright install chromium` required before first run; DB must be seeded (`npm run db:seed`)

## Phase 14: Deployment ⏳

### Unit 14.1: Environment Setup ⚠️ (in progress)

- [x] Create `.env.example` — production-ready template (DATABASE_URL, AUTH_SECRET, AUTH_TRUST_HOST, Cloudinary, NEXT_PUBLIC_* URLs, SSLCommerz, Resend); `.env` (gitignored) keeps real secrets
- [x] `.gitignore` now un-ignores `.env.example` so the template is committed
- [x] Vercel config — `vercel.json` with `buildCommand: "prisma generate && npm run build"`
- [x] Prisma serverless targets — `binaryTargets = ["native", "rhel-openssl-3.0.x", "linux-musl-openssl-3.0.x"]` for Vercel Lambda
- [ ] **Needs user:** create Vercel project (`vercel link`) + set env vars (DATABASE_URL, AUTH_SECRET, AUTH_TRUST_HOST=true, NEXT_PUBLIC_APP_URL, CLOUDINARY_*, RESEND_API_KEY, SSLCOMMERZ_*)
- [ ] **Needs user:** create Neon production database; run `npx prisma db push` + `npm run db:seed` against it

### Unit 14.2: Deployment ⚠️ (in progress)

- [x] CI/CD — `.github/workflows/ci.yml` (lint + typecheck + 91 tests on push/PR) and `.github/workflows/deploy.yml` (Vercel `--prod` on push to `main`, uses `VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` repo secrets)
- [x] Auth production fix — added `AUTH_TRUST_HOST=true` (Auth.js v5 requires it on Vercel/hosted); smoke-tested under `next start`: `/api/auth/session` + `/api/auth/providers` now return 200 (were 500)
- [x] `middleware.ts` → `proxy.ts` rename (Next 16 deprecation removed; matcher also excludes sitemap/robots/og-image routes); verified in build route table + redirect guard on `/checkout`
- [ ] **Needs user:** `git push origin main` (first deploy), add repo secrets, run Vercel deployment
- [ ] **Needs user:** attach custom domain + SSL (Vercel issues cert automatically)
- [ ] **Needs user:** switch SSLCommerz to live credentials when ready (`SSLCOMMERZ_IS_LIVE=true`)

## Current Active Task

- **Phase 14:** Deployment — code/config done (60%); remaining steps need Vercel/Neon/GitHub account access (env vars, push, domain)

## Recent Changes

- **Phase 14 (deployment readiness) complete:** `.env.example` + `AUTH_TRUST_HOST` (fixes `/api/auth` 500 under `next start` — verified: session/providers return 200), `middleware.ts` → `proxy.ts` (deprecation warning gone, proxy guard verified via `/checkout`→signin redirect), Prisma `binaryTargets` for Vercel Lambda, `vercel.json` (prisma generate + build), GitHub Actions CI + Vercel deploy workflows, `.gitignore` un-ignored `.env.example`
- Verified: prisma generate (native+rhel+musl targets), typegen, lint, `tsc --noEmit`, 91 tests (14 suites), production build (Turbopack), and a live `next start` smoke test (home 200, session/providers 200, sitemap 200, `/checkout` 307 → signin)
- Performance: ISR on public pages — `/`, `/categories`, `/categories/[slug]` now `revalidate = 3600` (`generateStaticParams` for category slugs); `/products` + `/search` stay dynamic (searchParams-driven); `/product/[id]` stays dynamic (auth/session)
- Image optimization: `ProductCard` gained an optional `priority` prop (`loading="lazy"` default, `eager` + `priority` for LCP); home `ProductList` marks the first card image with `priority`; product detail image already `priority` + `sizes`
- Lazy loading: home `<ProductList>` wrapped in `<Suspense>` with a skeleton grid fallback (streaming)
- Next.js image default lazy-loading + existing Suspense boundaries on `/products` in place
- Caching headers: `next.config.mjs` `headers()` adds `Cache-Control: public, max-age=86400` for `/favicon.ico` and public SVG/WebP/PNG/JPG assets (hashed `/_next/static` already served immutable by Next — no override, avoids breaking dev behavior)
- Bundle analysis: `@next/bundle-analyzer` added as devDependency, wired opt-in via `ANALYZE=true`; reports saved to `.next/analyze/{client,nodejs,edge}.html`. Analyzer requires `npx next build --webpack` (Next 16 default Turbopack is unsupported). Largest client chunks are framework/React core (react-dom 195KB, framework 185KB, main 129KB); app page chunks are small (layout 29KB, page 19KB) — no oversized app-specific bundles
- SEO: `src/lib/site.ts` (SITE_NAME/DESCRIPTION/URL + `absoluteUrl`, from `NEXT_PUBLIC_APP_URL` with fallback)
- Root layout: `metadataBase`, keywords, creator, `alternates.canonical`, Open Graph (type/locale/siteName/url), Twitter summary card, robots index/follow — plus WebSite (SearchAction) + Organization JSON-LD in `<head>`
- Generated social images: `src/app/opengraph-image.tsx` + `twitter-image.tsx` (ImageResponse 1200×630 brand card, statically optimized at build)
- `src/app/sitemap.ts` (DB-backed: static routes + all category slugs + all products, `revalidate = 3600`) and `src/app/robots.ts` (allow all, disallow `/admin/` + `/api/`, sitemap link)
- Per-page metadata: Home (title + description + OG/canonical), Products (description + OG/canonical), Search (noindex), Categories (description + OG/canonical), Category detail (`generateMetadata` with description + canonical + OG), Product detail (`generateMetadata` with og:image = product image, canonical, Twitter, Product + BreadcrumbList JSON-LD)
- Verified: 91 tests pass (14 suites), lint clean, `tsc --noEmit` clean (after `next typegen`), production build passes (webpack + Turbopack). Route map: `/`, `/categories`, `/categories/[slug]`, `/sitemap.xml` now ISR (1h revalidate)
- **Phase 10 complete:** Server-side coupon system
- Coupon/CouponUse models (db-pushed); `coupon-service.ts` (calculateCouponDiscount + findValidCoupon with full validation)
- Coupon APIs: GET/POST `/api/coupons`, PUT/DELETE `/api/coupons/[id]`, POST `/api/coupons/validate` (server-side cart subtotal validation)
- Order creation now validates coupon server-side (`couponCode` body param replaces untrusted `discount`/`freeShipping`), persists `couponId` + `discount`, increments usage atomically
- Checkout: real coupon validation (server-verified), discount/free-shipping display, remove button; cart page placeholder coupon removed (hint only)
- Admin: `/admin/coupons` page + `AdminCoupons` (create/edit/toggle/delete) + sidebar nav item
- Sample coupons seeded: SAVE10 (10% off, min $20, onePerUser), FREESHIP (free shipping), WELCOME5 ($5 off, min $30, onePerUser)
- 91 tests across 14 suites (added: coupon-service unit, coupons API, orders coupon flow, checkout coupon component)
- **Phases 11–12 complete:** Email & Notifications, Testing
- Email: Resend integration with dev console fallback; HTML templates (order confirmation, shipping, payment receipt)
- Notifications: Prisma Notification + NotificationPreference models; in-app notifications wired into order lifecycle (created, shipped, delivered, cancelled, payment completed, low stock admin alerts); NotificationBell dropdown + `/notifications` page + profile preference form; unread badges on desktop + mobile nav
- Testing: 53 Jest tests across 11 suites (unit: cart-service, order-status, product-query, email-templates; API: orders, order-status, reviews; components: ProductCard, AddToCartButton, StarRating, Pagination); Playwright E2E specs (auth, checkout COD, admin dashboard)
- Fix: Cart page "Proceed to Checkout" button was a dead `<Button>` — now a proper `<Link href="/checkout">`
- **Phases 7–9 complete:** Admin Dashboard, Reviews & Wishlist, Search & Filtering
- Admin: `/admin` layout w/ role gate + sidebar; dashboard (stats, 14-day CSS revenue chart, low stock, recent orders); product list/new/edit + bulk delete via `ProductForm`/`AdminProductsTable`; order list w/ status filter + inline update, order detail + print label (`PUT /api/orders/[id]/status`); user list w/ role change + block/unblock (`PATCH /api/users/[id]/{role,block}`); categories management (`AdminCategories`)
- Reviews: `POST /api/reviews` (upsert) + `DELETE /api/reviews/[id]` + `recomputeProductRating()`; `StarRating`, `ReviewForm`, `ReviewList` on the product page
- Wishlist: `Wishlist` Prisma model (db push); `GET/POST /api/wishlist` + `DELETE /api/wishlist/[productId]`; server-synced `src/store/wishlist.ts` w/ `mergeFromLocal`; `WishlistButton` on ProductCard; `/wishlist` page; Navbar wishlist count + Admin link
- Search & Filtering: `src/lib/product-query.ts` shared builder; `/api/products` extended (brand, price range, rating, inStock, sort); `/products` page w/ `ProductFilters` toolbar + `Pagination` + items-per-page; `/search` page w/ sort/limit + pager; debounced `SearchBar` w/ suggestions + recent searches
- Schema: `User.isBlocked` + `Wishlist` model added; auth `authorize()` rejects blocked users
- **Phase 6 complete:** User profile (account info, password change, address book)
- `GET/PUT /api/user/profile` — user info CRUD
- `PUT /api/user/password` — change password (bcrypt verified)
- `GET/POST /api/user/addresses`, `PUT/DELETE/POST /api/user/addresses/[id]` — full address book CRUD with default management
- `src/components/profile/ProfileForm.tsx` — name/email edit + password change forms
- `src/components/profile/AddressBook.tsx` — address list with Dialog-based add/edit modal, delete, set-default
- `src/app/(routes)/profile/page.tsx` — auth-gated server page linking profile + addresses + orders
- New shadcn/ui components: `dialog.tsx`, `select.tsx`, `textarea.tsx` (converted to TSX to match project; `components.json` now `"tsx": true`)
- **Phase 5 complete:** SSLCommerz payment integration
- `src/lib/sslcommerz.ts` — SSLCommerz REST API helper (init session, validate, verify) configured from env (`SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWD`, `SSLCOMMERZ_IS_LIVE`; sandbox defaults `testbox`/`qwerty` included in `.env.example`)
- `POST /api/payments/sslcommerz/init` — auth-protected, validates order ownership + payment retryable (PENDING/FAILED, not CANCELLED), initializes SSLCommerz session, returns `GatewayPageURL`
- `GET /api/payments/sslcommerz/{success,fail,cancel}` — SSLCommerz redirect callbacks; success verifies amount then marks payment COMPLETED + stores `transactionId`; fail/cancel mark FAILED; all redirect the user to `/payment/status?result=…&orderId=…`
- `POST /api/payments/sslcommerz/ipn` — server-to-server webhook; validates amount, updates payment to COMPLETED/FAILED using IPN `status` + `val_id`
- `GET /api/payments/sslcommerz/status/[orderId]` — auth-protected payment status poll endpoint
- `src/app/(routes)/payment/status/page.tsx` — user-facing payment result page (success / failed / cancelled / processing)
- `POST /api/orders` — `sslcommerz` added to allowed payment methods
- Checkout page — SSLCommerz enabled; on order create it calls the init route and redirects the browser to the gateway page
- Order detail page — color-coded payment status badge + `transactionId` display; new `PayNowButton` to retry PENDING/FAILED SSLCommerz payments
- Lint 0 errors, `tsc --noEmit` clean (regenerated route types via `next typegen`), production build passes with all 6 new payment routes

## Environment

- Next.js 16.2.6, React 19, TypeScript 6, Prisma 5.22.0
- PostgreSQL (Neon) — us-east-2, database: neondb
- `DATABASE_URL` points to the **direct** (non-pooler) Neon host — required for Prisma transactions
- Tailwind CSS 4, shadcn/ui (Base UI — no Radix)
- SSLCommerz sandbox by default (`SSLCOMMERZ_IS_LIVE=false`, store `testbox`/`qwerty`)

## Known Issues

- Upload endpoint returns 500 if Cloudinary env keys are empty — fill `CLOUDINARY_*` in `.env` (no function until then)
- `@next/bundle-analyzer` only works with webpack — Next 16 defaults to Turbopack, so run `set ANALYZE=true&& npx next build --webpack` to regenerate `.next/analyze/` reports
- `npm audit` reports vulnerabilities (dev tooling related, non-blocking)
- Neon free tier cold-starts connections (~2–7s per first query) — interactive Prisma transactions can time out if the compute is asleep; array transactions avoid this
- SSLCommerz requires internet access to sandbox/live gateway — init/verify calls will fail without connectivity or when `SSLCOMMERZ_STORE_ID`/`SSLCOMMERZ_STORE_PASSWD` are unset (returns 500 with logging)
- SSLCommerz flows are not yet smoke-tested end-to-end against the live sandbox (needs live store credentials + running dev server); IPN trusts gateway `status` + amount match
- Playwright E2E specs written but not yet run — requires `npx playwright install chromium` + running dev/build server + seeded DB

## Next Steps

1. Commit all Phases 10–14 changes (currently uncommitted) and `git push origin main` — CI runs automatically; add GitHub secrets and run the Vercel deploy workflow
2. Vercel: import repo / `vercel link`, configure production env vars (see `.env.example`), first build will `prisma generate` then deploy
3. Neon: create production database, `npx prisma db push` + `npm run db:seed`
4. Attach custom domain in Vercel (SSL is automatic) and set `NEXT_PUBLIC_APP_URL` to the real domain so `metadataBase`/sitemap/robots resolve correctly
5. Set `AUTH_TRUST_HOST=true` in Vercel env (required, already in `.env.example`)
6. Enable GitHub Actions on the repo if not automatic