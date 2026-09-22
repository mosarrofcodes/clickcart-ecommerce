# ClickCart — Project Status

**Last updated:** Sep 22, 2026

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
| Phase 14: Deployment            | IN PROGRESS | 80%      |

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
- `__tests__/api/track.test.ts` — `POST /api/track` required fields, 404, `+880` phone normalization + status label
- `__tests__/api/reports-export.test.ts` — `GET /api/admin/reports/export` admin gate, unknown type, orders/products CSV + quoting/escaping
- `__tests__/api/newsletter.test.ts` — `POST /api/newsletter` invalid email + normalized upsert
- All API tests use `/** @jest-environment node */` (Node provides `Request`/`Response`; jsdom does not)

### Unit 12.2: Component Tests ✅

- `__tests__/components/ProductCard.test.tsx` — renders title/price/category, add-to-cart click, out-of-stock disabled
- `__tests__/components/AddToCartButton.test.tsx` — add-to-cart click, out-of-stock disabled
- `__tests__/components/StarRating.test.tsx` — aria-label, star count
- `__tests__/components/Pagination.test.tsx` — empty for 1 page, page numbers, dual ellipsis for many pages, onPageChange callbacks
- `__tests__/components/Button.test.tsx` — `asChild` renders a real link (no `<button>` wrapper) and merges classes
- Mocks: `next/image`, `sonner`, `@/store/cart`, `@/store/wishlist`, `@/components/product/WishlistButton`

### Unit 12.3: E2E Specs ✅

- `playwright.config.ts` — chromium, `localhost:3000`, `webServer: npm run start`
- `e2e/auth.spec.ts` — register new user + sign in; admin sign in
- `e2e/checkout.spec.ts` — sign in → add product → cart → checkout → COD order → redirects to order detail
- `e2e/admin.spec.ts` — sign in → navigate to `/admin` → Dashboard heading visible
- Note: `npx playwright install chromium` required before first run; DB must be seeded (`npm run db:seed`)

## Production Hardening (Post-Phase 14)

Business-facing features added on top of the 14 phases to make the storefit for a real Bangladeshi business.

### Shipping & Site Settings ✅

- `SiteSetting` key/value table + `src/lib/site-settings.ts` (30s in-memory cache; `getSiteSettings()` + `computeShipping()` + `isInsideDhaka()` + EMI helpers `computeEmi()`/`emiForAmount()`)
- `Order.subtotal` / `Order.shipping` / `Order.district` persisted so historical orders keep their original shipping rules
- Public `GET /api/settings`; admin `GET/PUT /api/admin/settings`; `/admin/settings` page + `AdminSettings.tsx` (shipping inside/outside Dhaka, free-shipping threshold, EMI months + interest)
- Checkout computes shipping from district; `.env.example` documents all settings

### Order Lifecycle & Auto-Cancel ✅

- `src/lib/order-lifecycle.ts` — `cancelStalePendingOrders()` cancels unpaid PENDING/CONFIRMED orders older than `AUTO_CANCEL_PENDING_HOURS` and restores stock
- `GET /api/cron/cancel-stale-pending` guarded by `Authorization: Bearer ${CRON_SECRET}`; `vercel.json` cron schedule
- Customer invoice print + order summary + delivery estimate UI

### Product Variants ✅

- `ProductVariant` model (name, price, stock, sku); `CartItem.variantId` + `lineKey` (`productId` or `productId::variantId`, `@@unique([cartId,lineKey])` to avoid Postgres NULL-uniqueness pitfalls); `OrderItem.variantId`/`variantName` snapshots
- Variant-aware cart: `cart-service.ts`, `/api/cart/items` (+`?variantId=`), `src/store/cart.ts` (`addItem/removeItem/updateQuantity` take an optional variant), `ProductVariantPicker.tsx`
- Orders decrement/restore the selected variant's stock; notification titles include variant name
- Admin `ProductForm.tsx` variant editor + `oldPrice`; `/api/products` POST + `/api/products/[id]` PUT sync variants

### Catalog: Deals, Brands, EMI ✅

- `Product.oldPrice` → discount badge + strikethrough on `ProductCard`
- `/offers` deals page (discounted products) and `/brands` page (all brands); Navbar/Footer links

### Trust & Info Pages + Order Tracking ✅

- Reusable `src/components/layout/InfoPage.tsx` (`InfoSection`, `infoPageMetadata`)
- Pages: `/about`, `/contact` (+ `ContactForm` + `POST /api/contact`), `/shipping-policy`, `/return`, `/payment-methods`, `/faq`, `/terms`, `/privacy`
- `/track` — public order tracking (`POST /api/track` with `{ orderId, phone }`; normalizes `+880…` phone; returns status timeline, 404 on mismatch)

### Admin Reports & CSV Export ✅

- `/admin/reports` — 30-day revenue, order count, avg order value, items sold, store-wide totals, order-status breakdown, top-selling products, low stock
- `GET /api/admin/reports/export?type=orders|products|customers` — admin-only CSV download (RFC-style quoting/escaping)
- Reports nav item added to `AdminSidebar`

### Google OAuth ✅

- Optional Google provider in `src/lib/auth.ts` (auto-enabled when `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set), `allowDangerousEmailAccountLinking`, `signIn` callback blocks blocked users, JWT backfills `role` for OAuth sessions
- `GoogleSignInButton.tsx` — self-configuring (reads `/api/auth/providers`, renders only when Google is enabled); shown on sign-in + sign-up
- `.env.example` documents `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` and the redirect URI

### Storefront Realism & Correctness (Sep 18) ✅

- **Button `asChild` implemented** (`src/components/ui/button.tsx` via `cloneElement`) — previously `asChild` was declared but ignored, so ~18 usages rendered invalid `<button><a>` nesting. Now they render a real `<a>` with button styles. Remaining `Button><Link` cases in `Navbar`, `categories/[slug]`, `not-found` converted to `asChild`.
- **Navbar rebuilt**: announcement bar (free delivery + hotline + Track Order), `Contact` link, `CategoryMenu` hover dropdown (fetches `/api/categories`), valid link markup throughout, mobile menu hotline.
- **Footer rebuilt**: trust strip (fast delivery / secure payments / easy returns), contact block (address/phone/email), payment badges (COD, bKash, Nagad, Rocket, Visa, Mastercard), newsletter form, social links.
- **Newsletter**: `NewsletterSubscriber` model (db-pushed); `POST /api/newsletter` (email validation + upsert); `NewsletterForm.tsx`.
- **Homepage rebuilt**: gradient hero with CTAs, trust badge row, category tiles, "Today's Deals" (oldPrice products), Featured Products.
- **Product detail**: visual breadcrumb, discount/save display from `oldPrice`, "You may also like" related products by category.
- **Checkout**: payment-method rows changed from `<button>` wrapping a radio (invalid) to `<label>` + radio.
- **Site config**: `src/lib/site.ts` gained `SITE_PHONE`/`SITE_EMAIL`/`SITE_ADDRESS`/`SITE_SOCIAL` (env-overridable, documented in `.env.example`).

### Bug Fix ✅

- `notifyOrderPlaced` was passed a malformed payload (missing `product`) so order-confirmation emails silently failed — fixed by passing the correct `OrderWithItems` shape; `OrderWithItems.items` now carries resolved `title` + optional `variantName`

## Security Hardening (Sep 21) ✅

- **Admin password env-driven:** `prisma/seed.ts` admin password reads `ADMIN_SEED_PASSWORD` (fallback `changeMeOnFirstRun_9f3K!` + warning if unset) — no hardcoded password in committed code
- **Pre-launch artifact cleanup:** `debug/`, `check-db.tmp.ts`, `test-results/`, `playwright-report/` deleted; `.gitignore` covers `test-results/` + `playwright-report/` + `debug/`
- **Rate limiting:** new `src/lib/rate-limit.ts` — in-memory fixed-window `checkRateLimit(id, {limit, windowMs})` + `getClientIp(request)`; honors `RATE_LIMIT_DISABLED=true`. Wired into login (10/15min), register (5/hr), forgot-password (3/hr), reset-password (5/15min), contact (5/hr), newsletter (5/hr), coupon-validate (60/10min) with 429 + `Retry-After`
- **Honeypot:** hidden `website` input on `ContactForm` + `NewsletterForm`; `isHoneypot()` rejects fills
- **Security headers** (`next.config.mjs`): HSTS (preload), `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo/topics off)
- **Tests:** `__tests__/lib/rate-limit.test.ts` (11 tests) → **20 suites / 117 tests pass**; lint, tsc, prod build clean
- Committed `e339816` (cron cleanup — Hobby limit) + `c48ed5e` (security sprint); Vercel auto-deploying
- Note: rate limiter is per-Lambda-instance in-memory (adequate, not global). Vercel KV-backed limiting is a possible upgrade

## Cloudflare Turnstile CAPTCHA (Sep 22) ✅

- **Server lib `src/lib/turnstile.ts`:** `verifyTurnstileToken()` calls Cloudflare `siteverify` (`https://challenges.cloudflare.com/turnstile/v0/siteverify`) with the secret, returns `true` only on `success`. `turnstileEnabled()` requires **both** `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; when unconfigured everything short-circuits to allowed (no behavior change — same self-configuring pattern as Google OAuth). `verifyTurnstile(body)` helper reads `captchaToken` out of a request body
- **Widget `src/components/auth/TurnstileCaptcha.tsx`:**
  - Renders nothing until `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set (exported `turnstileSiteKey` constant forms use to gate the submit button)
  - Loads the Turnstile script once (`?render=explicit`) via a small Promise-based loader (no `next/script`), then `window.turnstile.render()` with callback / expired / error handlers (exposes `theme` + `action` props; UX CTA button disabled until a token exists)
- **Server-side enforcement in 6 routes:** `POST /api/auth/login`, `register`, `forgot-password`, `reset-password`, `contact`, `newsletter`. Honeypot stays as the cheap pre-captcha layer on contact/newsletter. Failed verification → 400 "Please complete the security check and try again"
- **Client wiring in 6 forms:** `/signin`, `/signup`, `/forgot-password`, `/reset-password` pages, `ContactForm`, `NewsletterForm` — token sent as `captchaToken`, submit gated client-side when the widget is active, widget remounted (key nonce) after a successful contact send
- **`.env.example`:** documents `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (leave empty → honeypot-only mode)
- **Tests:** `__tests__/lib/turnstile.test.ts` (9 tests, node env, mocked `fetch`) + `__tests__/components/TurnstileCaptcha.test.tsx` (renders null without key) → **22 suites / 129 tests pass**; lint clean, `tsc --noEmit` clean, production build passes
- Note: needs a Cloudflare account to mint keys (free). Add `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to Vercel env to activate — no redeploy logic change needed

## Phase 14: Deployment ⏳

### Unit 14.1: Environment Setup ✅

- [x] Create `.env.example` — production-ready template (DATABASE_URL, AUTH_SECRET, AUTH_TRUST_HOST, Cloudinary, NEXT_PUBLIC_* URLs, SSLCommerz, Resend, CRT_SECRET, AUTO_CANCEL_PENDING_HOURS, Google OAuth, site contact/social); `.env` (gitignored) keeps real secrets
- [x] `.gitignore` now un-ignores `.env.example` so the template is committed
- [x] Vercel config — `vercel.json` with `buildCommand: "prisma generate && npm run build"`
- [x] Prisma serverless targets — `binaryTargets = ["native", "rhel-openssl-3.0.x", "linux-musl-openssl-3.0.x"]` for Vercel Lambda
- [x] Vercel project created (Git import) + production env vars set (DATABASE_URL direct, AUTH_SECRET, AUTH_TRUST_HOST=true, NEXT_PUBLIC_APP_URL, SSLCOMMERZ sandbox; RESEND/CLOUDINARY intentionally empty → dev-fallback verified). `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CLOUDINARY_*` etc. pending until live accounts
- [x] Neon production database created (`ep-divine-king-b41ly5f0`); `prisma db push` + `npm run db:seed` run (admin, 6 categories, 14 products, 3 coupons, site settings)

### Unit 14.2: Deployment ✅

- [x] CI/CD — `.github/workflows/ci.yml` (lint + typecheck + tests on push/PR) and `.github/workflows/deploy.yml` (Vercel `--prod` on push to `main`, uses `VERCEL_TOKEN`/`VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` repo secrets)
- [x] Auth production fix — added `AUTH_TRUST_HOST=true` (Auth.js v5 requires it on Vercel/hosted); smoke-tested under `next start`: `/api/auth/session` + `/api/auth/providers` now return 200 (were 500)
- [x] `middleware.ts` → `proxy.ts` rename (Next 16 deprecation removed; matcher also excludes sitemap/robots/og-image routes); verified in build route table + redirect guard on `/checkout`
- [x] Phases 10–14 + pre-launch hardening committed (`cc20d59`) and pushed; branch `main` in sync with `origin`
- [x] **LIVE at https://clickcart-ecommerce.vercel.app** — smoke-tested (home 200, `/api/products` returns prod data, `/api/health` → `{"ok":true}`; deployment eager-builds one preview earlier)
- [x] Vercel Hobby cron limit (1/day) applied — removed `*/2` health keepalive cron; only daily cancel-stale-pending cron remains
- [x] **Custom domain attached (Sep 22):** `clickcarts.me` (Namecheap) added to Vercel — apex → 308 → `https://www.clickcarts.me/` (HTTP 200, TLS OK, auth verified live). **Still pending:** set `NEXT_PUBLIC_APP_URL=https://www.clickcarts.me` in Vercel env + redeploy (canonical/OG/sitemap still use the old `vercel.app` domain); update Google OAuth callback URI to `https://www.clickcarts.me/api/auth/callback/google`
- [ ] **Needs user:** switch SSLCommerz to live credentials when ready (`SSLCOMMERZ_IS_LIVE=true`)
- [ ] **Needs user:** live Resend keys + from-domain, Cloudinary keys (enables product image uploads)

## Current Active Task

- **Phase 14:** Deployment — **PRODUCTION IS LIVE** (Vercel + Neon prod DB seeded; custom domain `clickcarts.me` attached → `www.clickcarts.me`). Security sprint done (rate limiting, honeypot, headers, env-driven admin seed password) + Cloudflare Turnstile CAPTCHA implemented (server verify lib + self-configuring widget on 6 forms; activates when keys are added) + **checkout→login loop bug fixed** (sign-in/up now honor `callbackUrl`; see Recent Changes). Remaining items need user accounts/decisions: set `NEXT_PUBLIC_APP_URL=https://www.clickcarts.me` in Vercel env + redeploy, live SSLCommerz credentials, live Resend/Cloudinary keys, add Turnstile keys to Vercel env.

- **Bug fix (Sep 22): "clicking Checkout keeps sending me to the login page."** Root cause: the `/signin` and `/signup` pages ignored the middleware's `?callbackUrl=…` param and did `router.replace("/")` after auth — so a guest who clicked Checkout (middleware → `/signin?callbackUrl=/checkout`) landed on the **homepage** after logging in, not the checkout. Repeated checkout attempts kept re-triggering login (and could hit the 10/15-min login rate limit) → felt like an endless loop. Fix: new `src/lib/callback-url.ts` `safeCallbackUrl()` (rejects external/protocol-relative/backslash values — no open redirect), `/signin` + `/signup` now read `callbackUrl` (via `useSearchParams` under a `Suspense` boundary), pass it through the sign-in/up Google buttons and cross-links, and redirect post-login **with a full-page navigation** `window.location.assign()` so the just-created session cookie is always attached (the client-side `router.replace` RSC fetch right after login races the cookie jar and gets bounced back to `/signin` by the middleware — reproduced at loopback latency). Also hardened E2E: checkout spec locators (header cart is a Link, logo "Click**Cart**" matched `/cart/i`; cart count is accumulation-prone for logged-in accounts → assert the cart drawer opens instead), new regression test "guest adding to cart gets sent to sign-in and returned to /checkout", and `playwright.config.ts` `timeout: 120_000` (Neon cold-start blew the default 30s). Verified: **5/5 Playwright E2E pass** (auth, admin, checkout incl. new regression), **23 suites / 133 Jest tests pass**, lint clean, `tsc --noEmit` clean, production build clean. Live-probe confirmed prod root cause (login → home, no cookie problem; re-clicking Checkout after login worked).

## Recent Changes

- **Cloudflare Turnstile CAPTCHA (Sep 22):** server verify lib (`src/lib/turnstile.ts` — Cloudflare `siteverify`, auto-disabled until `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` both set) + self-configuring `TurnstileCaptcha` client widget (script loads on demand, explicit render, renders null without a site key). Enforced server-side on 6 routes (login, register, forgot/reset-password, contact, newsletter; honeypot kept as fallback) with the widget on 6 forms (signin, signup, forgot/reset-password pages, ContactForm, NewsletterForm). `.env.example` documents the keys. Tests added (`__tests__/lib/turnstile.test.ts` 9 tests + `TurnstileCaptcha.test.tsx`) → **23 suites / 133 tests pass**; lint, `tsc --noEmit`, and production build all clean
- **Go-live + security sprint (Sep 21):** 
  - Committed + pushed Phases 10–14 and pre-launch hardening (`cc20d59`) and security sprint (`c48ed5e`); removed keepalive cron (`e339816`) — Vercel Hobby allows 1 cron/day
  - Neon prod DB created (`ep-divine-king-b41ly5f0`, PostgreSQL 18.6) with direct URL, `prisma db push` + seed (admin, 6 categories, 14 products, 3 coupons, site settings)
  - Vercel: project imported from GitHub, prod env vars set (DATABASE_URL direct, AUTH_SECRET, AUTH_TRUST_HOST=true, NEXT_PUBLIC_APP_URL, CRON_SECRET, AUTO_CANCEL_PENDING_HOURS=24, SSLCommerz sandbox; RESEND/CLOUDINARY empty → dev-fallback verified). Live at https://clickcart-ecommerce.vercel.app — `/api/health` → `{"ok":true}`, home + products API return prod data
  - Security hardening: `ADMIN_SEED_PASSWORD` env-driven seeding; deleted debug artifacts; rate limiting (login/register/forgot/reset-password/contact/newsletter/coupon-validate) + honeypot fields + security headers; **20 suites / 117 tests pass**, lint/tsc/build clean
  - PromoBanner dark-mode CTA contrast fix (`bg-white text-slate-900`)
  - `.env.example` rebuilt (was empty in working tree) with all keys documented; `DATABASE_KEEPALIVE_MS=30000` added to dev `.env`

- **Bug fix (Sep 21): client pages crashing with `PrismaClient is unable to run in this browser environment`.** Root cause: client components imported pure helpers from server-only modules (`src/lib/cart-service.ts`, `site-settings.ts`, `product-query.ts`, `coupon-service.ts`) that `import { db }` from `@/lib/db`, bundling PrismaClient into the browser — broke `/products` filters, cart page, checkout, `/admin/coupons`. Fix: moved all db-free helpers (shipping calc, EMI, site defaults, product sorts, coupon labels) into a new pure `src/lib/store-config.ts`; the db modules now re-export from it; client files import from `store-config`. Added `import "server-only"` to `src/lib/db.ts` (+ `jest.server-only.js` stub + `jest.config.mjs` moduleNameMapper) so any future client→db leak fails the build instead of crashing at runtime. Verified: lint clean, `tsc --noEmit` clean, 106 tests / 19 suites pass, production build passes.

- **Real-storefront feature pass (Sep 18):** all 9 requested shopping-site UX features built —
  - **Product card upgrades:** rating stars + review count (`_count.reviews`), variant "From ৳X" price (variants ordered by price in all card queries), "Only X left" urgency when stock ≤ 5; `Product.reviewCount` → `Product._count.reviews` type
  - **Quick view:** eye button on card hover opens a `Dialog` (variant picker, price/stock, add-to-cart, view-details)
  - **Cart drawer:** new `src/components/ui/drawer.tsx` (slide-over primitive) + `CartDrawer.tsx` (line items, qty −/+, move-to-wishlist, subtotal, checkout); navbar Cart button now opens the drawer (`useUIStore.openCartDrawer`/`setCartDrawerOpen` added) and every add-to-cart opens it
  - **Recently viewed:** `src/store/recentlyViewed.ts` (persisted, max 8); `RecordProductView` on the product page; "Recently Viewed" section on home
  - **Mobile sticky buy bar:** `ProductBuySection` shares variant state with `ProductVariantPicker` (now controlled-mode) and renders a fixed bottom bar (price + add-to-cart) on `<md`; page adds mobile bottom padding; `FloatingSupport` shifts up on product pages
  - **WhatsApp / hotline floating button:** `FloatingSupport.tsx` in root layout — `wa.me/<digits>` WhatsApp bubble + `tel:` hotline chip + scroll-to-top
  - **Address prefill at checkout:** loads `/api/user/addresses`, auto-fills default, clickable saved-address cards
  - **Home banners + category images:** `PromoBanner` auto-rotating 3-slide carousel (flash sale / COD / free delivery); category tiles show `category.image` with gradient-initial fallback
  - **Dark mode:** `next-themes` `ThemeProvider` (attribute="class", system default) in root layout; `ThemeToggle` in Navbar (`useSyncExternalStore` isClient guard — no setState-in-effect); existing `.dark` tokens used; removed hardcoded `bg-orange-50` from Navbar/Footer (now `bg-background` / `bg-muted/50`)
  - **Invoice PDF:** PrintButton + print CSS already existed; added a print-only branded invoice header (ClickCart, address/phone/email, invoice #, date, status) to `/orders/[id]` and `.print-only` CSS
  - **UI polish:** free-delivery progress bar on cart page; verified dark-mode-safe colors
  - Verified: `eslint` clean, `tsc --noEmit` clean, **103 tests / 18 suites pass** (1 test updated for new `addItem(product, 1, undefined)` signature), production build passes (71 static pages)

- **Storefront realism pass (Sep 18):** real-life storefront polish —
  - Implemented `<Button asChild>` (was declared but broken → invalid `<button><a>` nesting across ~18 usages); converted remaining Button-wrapping-Link cases in Navbar/categories/[slug]/not-found
  - Navbar: announcement bar (hotline, Track Order, free delivery), Contact nav item, category hover dropdown, valid link markup, mobile hotline
  - Footer: trust strip, contact block, payment badges (COD/bKash/Nagad/Rocket/Visa/Mastercard), newsletter signup, social links
  - Newsletter backend: `NewsletterSubscriber` model (db-pushed) + `POST /api/newsletter`
  - Homepage: hero with CTAs, trust badges, category tiles, Today's Deals, Featured Products
  - Product detail: breadcrumbs, old-price discount display, related products
  - Checkout: fixed `<button>`-wrapping-radio markup → `<label>`
  - `src/lib/site.ts` contact/social constants (env-overridable); `.env.example` updated
  - Verified: lint clean, `tsc --noEmit` clean, **103 tests / 18 suites pass** (added newsletter + Button tests), production build passes (71 static pages)

- **Production hardening (Sep 18):** business features on top of the 14 phases —
  - Shipping & `SiteSetting`: district-aware `computeShipping`, admin settings page/API, EMI helpers
  - Order lifecycle: `cancelStalePendingOrders()` + `CRON_SECRET`-guarded `/api/cron/cancel-stale-pending` + `vercel.json` cron
  - Product variants end-to-end (schema, variant-aware cart/orders/stock, picker, admin editor)
  - Catalog: `Product.oldPrice`, `/offers` deals page, `/brands` page, EMI info
  - Trust pages: `/about`, `/contact` (+ API), `/shipping-policy`, `/return`, `/payment-methods`, `/faq`, `/terms`, `/privacy`; public order tracking `/track` + `/api/track`
  - Admin `/admin/reports` + CSV export (`orders`/`products`/`customers`)
  - Optional Google OAuth (auto-enabled by env, self-configuring button on sign-in/up)
  - Fixed `notifyOrderPlaced` malformed payload that silently broke confirmation emails
  - Verified: lint clean, `tsc --noEmit` clean, **103 tests / 18 suites pass**, production build passes

- **Fix (Phase 5): SSLCommerz payment was failing with an error at checkout.** Root cause: the app was calling the expired `gwprocess/v4/process.php` endpoint (SSLCommerz returns "API Expired"), and `.env` was missing `SSLCOMMERZ_STORE_ID`/`SSLCOMMERZ_STORE_PASSWD`/`SSLCOMMERZ_IS_LIVE`/`NEXT_PUBLIC_APP_URL`. Fixed in `src/lib/sslcommerz.ts` (init → `gwprocess/v4/api.php`, validation → `validationserverAPI.php`) and added the sandbox env vars to `.env`. Sandbox session init confirmed working via curl with the exact payload the app sends — returns `SUCCESS` + `GatewayPageURL` (bKash and card).
- **Fix (Phase 11): Notifications verified.** DB check shows in-app notifications ARE created on order placement (4 `order`-type notifications present); no `payment` notifications existed only because no payment had ever completed. Payment/shipped/delivered notifications fire on successful payment and admin status updates.
- **Phase 14 (deployment readiness) complete:** `.env.example` + `AUTH_TRUST_HOST` (fixes `/api/auth` 500 under `next start` — verified: session/providers return 200), `middleware.ts` → `proxy.ts` (deprecation warning gone, proxy guard verified via `/checkout`→signin redirect), Prisma `binaryTargets` for Vercel Lambda, `vercel.json` (prisma generate + build), GitHub Actions CI + Vercel deploy workflows, `.gitignore` un-ignored `.env.example`
- Verified: prisma generate (native+rhel+musl targets), typegen, lint, `tsc --noEmit`, 99 tests (16 suites), production build (Turbopack), and a live `next start` smoke test (home 200, session/providers 200, sitemap 200, `/checkout` 307 → signin)
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
- Verified: 99 tests pass (16 suites), lint clean, `tsc --noEmit` clean (after `next typegen`), production build passes (webpack + Turbopack). Route map: `/`, `/categories`, `/categories/[slug]`, `/sitemap.xml` now ISR (1h revalidate)
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

- Upload endpoint returns 500 if Cloudinary env keys are empty — fill `CLOUDINARY_*` in Vercel env (no function until then)
- `@next/bundle-analyzer` only works with webpack — Next 16 defaults to Turbopack, so run `set ANALYZE=true&& npx next build --webpack` to regenerate `.next/analyze/` reports
- `npm audit` reports vulnerabilities (dev tooling related, non-blocking)
- Neon free tier cold-starts connections (~2–7s per first query) — interactive Prisma transactions can time out if the compute is asleep; array transactions avoid this. Dev `.env` uses `DATABASE_KEEPALIVE_MS=30000`; prod free UptimeRobot ping to `/api/health` recommended (Vercel Hobby can't keep warm via cron)
- Vercel Hobby plan: max **1 cron/day** — health keepalive cron removed; only daily `cancel-stale-pending` remains
- Rate limiter is in-memory **per Lambda instance** — adequate for basic abuse protection, not a global budget; Vercel KV-backed limiting is the upgrade path
- SSLCommerz requires internet access to sandbox/live gateway — init/verify calls will fail without connectivity or when `SSLCOMMERZ_STORE_ID`/`SSLCOMMERZ_STORE_PASSWD` are unset (returns 500 with logging); sandbox creds present in Vercel env
- SSLCommerz sandbox init was broken — the v3 `gwprocess/v4/process.php` endpoint is expired (returns "API Expired"); fixed by migrating to `gwprocess/v4/api.php` (+ `validationserverAPI.php`). Sandbox session init verified via the app's exact payload → returns `SUCCESS` + `GatewayPageURL` for both card and `payment_method=bkash`. Full success callback (sandbox test payment → `/api/payments/sslcommerz/success`) still needs one manual sandbox payment; IPN trusts gateway `status` + amount match
- Google sign-in is hidden unless `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set (and the Google Cloud console redirect URI `…/api/auth/callback/google` is registered)
- SSLCommerz live payments untested until env switches from sandbox (`SSLCOMMERZ_IS_LIVE=false`, `testbox`) to live credentials
- Neon prod DB password was pasted in chat during setup — recommend rotating the database password in Neon once the site is fully public

## Next Steps

1. **User (domain env, ~2 min):** set `NEXT_PUBLIC_APP_URL=https://www.clickcarts.me` in Vercel env (Production) → redeploy → verify canonical/OG/sitemap now use the real domain (`/api/health` warm); update Google OAuth redirect URI in the Google Cloud console to `https://www.clickcarts.me/api/auth/callback/google`
2. **Turnstile activation (user, free):** create a Cloudflare account → mint Turnstile keys → set `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Vercel env (code is deploy-ready; re-verify with a login after adding)
3. **Live credentials (user accounts):** SSLCommerz live merchant → `SSLCOMMERZ_IS_LIVE=true`; Resend domain + API key (enables real email templates); Cloudinary keys (enables admin image upload)
4. **Monitoring (recommended):** UptimeRobot ping to `/api/health` every 5 min (keeps Neon warm + alerting); Sentry for runtime error tracking
5. **Optional hardening:** Vercel KV-backed global rate limiting; security headers tune (CSP)
6. **Ops:** rotate Neon prod DB password; GitHub Actions CI is active (runs lint/typecheck/tests on push; deploy workflow on push to `main`)