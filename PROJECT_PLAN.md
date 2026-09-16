# ClickCart - Complete Project Plan

## Tech Stack

| Category         | Technology                   | Status          |
| ---------------- | ---------------------------- | --------------- |
| Framework        | Next.js 16 (App Router)      | ✅ Done         |
| Language         | TypeScript                   | ✅ Done         |
| Database         | PostgreSQL (Neon)            | ✅ Connected    |
| ORM              | Prisma 5.22.0                | ✅ Schema Ready |
| Password Hashing | bcryptjs                     | ✅ Installed    |
| Auth             | NextAuth.js / Auth.js        | ⏳ Pending      |
| State Management | Zustand                      | ✅ Installed  |
| Styling          | Tailwind CSS 4               | ✅ Done         |
| UI Components    | shadcn/ui                    | ✅ Done         |
| Payment          | SSLCommerz / bKash           | ⏳ Pending      |
| Validation       | Zod                          | ⏳ Pending      |
| Testing          | Jest + RTL + Playwright    | ✅ Done         |
| Dev Tool         | tsx (TypeScript runner)      | ✅ Installed    |

---

## Project Phases & Units

### PHASE 1: Backend Foundation 🔧

**Status: IN PROGRESS**

#### Unit 1.1: Database Setup ✅

- [x] Prisma schema created
- [x] Neon PostgreSQL connected
- [x] Tables synced (User, Product, Category, Cart, Order, Payment, Review, Address)
- [x] Prisma Client generated
- [x] Section comments restored in schema.prisma
- [x] Prisma client singleton created (src/lib/db.ts)

#### Unit 1.2: Database Seeding ✅

- [x] Create seed script (prisma/seed.ts)
- [x] Seed categories (6 categories: Electronics, Clothing, Furniture, Groceries, Beauty, Sports)
- [x] Seed products (14 products with full data)
- [x] Create admin user (admin@clickcart.com / admin123)
- [x] Test seed command (npm run db:seed)
- [x] Verify data in database (1 User, 6 Categories, 14 Products)

#### Unit 1.3: Authentication Setup ✅

- [x] Install NextAuth.js (Auth.js v5)
- [x] Create auth configuration (src/lib/auth.ts)
- [x] Create credentials provider (email/password)
- [x] Add password hashing (bcryptjs)
- [x] Create session callback
- [x] Create JWT callback
- [x] Create auth API route (/api/auth/[...nextauth])
- [x] Create registration API route (/api/auth/register)
- [x] Create SessionProvider component
- [x] Update layout with SessionProvider
- [x] Add AUTH_SECRET to .env

#### Unit 1.4: Auth API Routes ✅

- [x] POST /api/auth/register (user registration)
- [x] POST /api/auth/login (user login)
- [x] GET /api/auth/session (get current session)
- [x] POST /api/auth/logout (logout)

#### Unit 1.5: Auth UI ✅

- [x] Update sign-in page with NextAuth (signIn function, error handling, loading state)
- [x] Update sign-up page with registration logic (API call, redirect to sign-in)
- [x] Add session provider to layout (SessionProvider wrapper)
- [x] Add user menu in navbar (show name, sign out button)
- [x] Protect routes with middleware (redirect to /signin if not authenticated)

#### Unit 1.6: Zustand Setup ✅

- [x] Install Zustand
- [x] Create auth store (user session state)
- [x] Create cart store (replace React Context)
- [x] Create UI store (modals, sidebar state)
- [x] Persist cart to localStorage

---

### PHASE 2: Product System 📦

**Status: COMPLETE ✅**

#### Unit 2.1: Product API Routes ✅

- [x] GET /api/products (list all, with pagination)
- [x] GET /api/products/[id] (get single product)
- [x] GET /api/products/search?q= (search products)
- [x] GET /api/products/category/[slug] (filter by category)
- [x] POST /api/products (admin only - create)
- [x] PUT /api/products/[id] (admin only - update)
- [x] DELETE /api/products/[id] (admin only - delete)

#### Unit 2.2: Category API Routes ✅

- [x] GET /api/categories (list all)
- [x] GET /api/categories/[slug] (get by slug)++++
- [x] POST /api/categories (admin only)
- [x] PUT /api/categories/[id] (admin only)
- [x] DELETE /api/categories/[id] (admin only)

#### Unit 2.3: Product Pages Update ✅

- [x] Convert product pages to Server Components
- [x] Use Prisma instead of dummyjson.com
- [x] Add loading.tsx for each page
- [x] Add error.tsx for each page
- [x] Implement generateMetadata for SEO

#### Unit 2.4: Image Handling ✅

- [x] Setup Cloudinary
- [x] Create image upload component
- [x] Add image optimization
- [x] Replace <img> with Next.js <Image>

---

### PHASE 3: Cart System 🛒

**Status: COMPLETE ✅**

#### Unit 3.1: Cart API Routes ✅

- [x] GET /api/cart (get user's cart)
- [x] POST /api/cart/items (add item to cart)
- [x] PUT /api/cart/items/[id] (update quantity)
- [x] DELETE /api/cart/items/[id] (remove item)
- [x] DELETE /api/cart (clear cart)

#### Unit 3.2: Cart UI Updates ✅

- [x] Integrate Zustand cart store
- [x] Add quantity +/- buttons
- [x] Add "Move to Wishlist" button
- [x] Show stock validation
- [x] Calculate shipping cost
- [x] Apply coupon code input

#### Unit 3.3: Cart Persistence ✅

- [x] Sync localStorage with database
- [x] Merge guest cart on login
- [x] Handle offline/online sync

---

### PHASE 4: Checkout & Orders 📋

**Status: COMPLETE ✅**

#### Unit 4.1: Checkout Page ✅

- [x] Create /checkout page
- [x] Shipping address form
- [x] Order summary display
- [x] Payment method selection
- [x] Place order button

#### Unit 4.2: Order API Routes ✅

- [x] POST /api/orders (create order)
- [x] GET /api/orders (user's orders)
- [x] GET /api/orders/[id] (order details)
- [x] PUT /api/orders/[id]/cancel (cancel order)
- [x] Order writes use array `$transaction` (avoids Neon cold-start interactive-tx timeouts)

#### Unit 4.3: Order UI ✅

- [x] Order confirmation page
- [x] Order history page (/orders)
- [x] Order details page (/orders/[id])
- [x] Order status tracking

---

### PHASE 5: Payment Integration 💳

**Status: COMPLETE ✅**

#### Unit 5.1: SSLCommerz Integration ✅

- [x] Create SSLCommerz REST helper (src/lib/sslcommerz.ts — init/validate/verify APIs)
- [x] Create payment API routes (/api/payments/sslcommerz/*)
- [x] Initialize payment session (POST /api/payments/sslcommerz/init)
- [x] Handle success callback (GET /api/payments/sslcommerz/success)
- [x] Handle fail/cancel callback (GET /api/payments/sslcommerz/fail, /cancel)
- [x] IPN verification (POST /api/payments/sslcommerz/ipn)
- [x] Payment status check (GET /api/payments/sslcommerz/status/[orderId])

#### Unit 5.2: bKash Integration (Optional) ⏳

- [ ] Install bKash SDK
- [ ] Create bKash payment route
- [ ] Handle bKash callback

#### Unit 5.3: Payment UI ✅

- [x] Payment method selection (SSLCommerz enabled in checkout)
- [x] Payment status display (/payment/status page + order detail badge/transaction id)
- [x] Retry payment (PayNowButton on order detail) + invoice total shown on order detail

---

### PHASE 6: User Profile 👤

**Status: COMPLETE ✅**

#### Unit 6.1: Profile API Routes ✅

- [x] GET /api/user/profile
- [x] PUT /api/user/profile
- [x] PUT /api/user/password

#### Unit 6.2: Address Management ✅

- [x] GET /api/user/addresses
- [x] POST /api/user/addresses
- [x] PUT /api/user/addresses/[id]
- [x] DELETE /api/user/addresses/[id]
- [x] Set default address

#### Unit 6.3: Profile UI ✅

- [x] Profile page (/profile)
- [x] Edit profile form
- [x] Address list
- [x] Add/edit address modal
- [x] Order history link

---

### PHASE 7: Admin Dashboard 🛠️

**Status: COMPLETE ✅**

#### Unit 7.1: Admin Layout ✅

- [x] Create /admin layout
- [x] Admin sidebar navigation
- [x] Protect admin routes (role check)

#### Unit 7.2: Product Management ✅

- [x] Product list with search/filter
- [x] Add new product form
- [x] Edit product form
- [x] Delete product confirmation
- [x] Bulk actions (delete selected)

#### Unit 7.3: Order Management ✅

- [x] Order list with status filter
- [x] Order details view
- [x] Update order status
- [x] Print shipping label

#### Unit 7.4: User Management ✅

- [x] User list
- [x] Change user role
- [x] Block/unblock user

#### Unit 7.5: Dashboard ✅

- [x] Sales statistics
- [x] Recent orders
- [x] Low stock alerts
- [x] Revenue charts (14-day CSS bar chart)

#### Unit 7.6: Categories Management ✅

- [x] Category list + add + delete (admin)

---

### PHASE 8: Reviews & Wishlist ⭐

**Status: COMPLETE ✅**

#### Unit 8.1: Reviews ✅

- [x] POST /api/reviews (add/update via upsert on unique user+product)
- [x] DELETE /api/reviews/[id] (delete review)
- [x] Review form component
- [x] Review list component
- [x] Star rating component
- [x] Product rating recompute (src/lib/review-service.ts)

#### Unit 8.2: Wishlist ✅

- [x] Create Wishlist model in Prisma
- [x] POST /api/wishlist (add item)
- [x] DELETE /api/wishlist/[productId] (remove item)
- [x] GET /api/wishlist (get wishlist)
- [x] Wishlist page UI
- [x] Add to wishlist button
- [x] Server-synced wishlist store (guest localStorage + merge on login)

---

### PHASE 9: Search & Filtering 🔍

**Status: COMPLETE ✅**

#### Unit 9.1: Advanced Search ✅

- [x] Search with debounce
- [x] Search suggestions
- [x] Recent searches
- [ ] Search analytics (deferred)

#### Unit 9.2: Filtering ✅

- [x] Price range filter
- [x] Category filter
- [x] Brand filter
- [x] Rating filter
- [x] Availability filter (in stock)

#### Unit 9.3: Sorting ✅

- [x] Sort by price (low to high, high to low)
- [x] Sort by rating
- [x] Sort by newest
- [x] Sort by popularity (most reviewed)

#### Unit 9.4: Pagination ✅

- [x] Server-side pagination
- [x] Page navigation component
- [x] Items per page selector

---

### PHASE 10: Coupon System 🏷️

**Status: COMPLETE ✅**

#### Unit 10.1: Coupon Backend ✅

- [x] Create Coupon + CouponUse models in Prisma
- [x] Create coupon-service.ts (calculateCouponDiscount, findValidCoupon with full validation)
- [x] POST /api/coupons (admin create)
- [x] POST /api/coupons/validate (server-side cart subtotal validation)
- [x] GET/PUT/DELETE /api/coupons/[id] (admin CRUD)
- [x] Apply discount to order (POST /api/orders now validates couponCode server-side)

#### Unit 10.2: Coupon UI ✅

- [x] Coupon management page (/admin/coupons with create/edit/toggle/delete)
- [x] Coupon input on checkout (server-validated via /api/coupons/validate)
- [x] Discount display (checkout: discount line + applied message; cart: coupon hint only)

---

### PHASE 11: Email & Notifications 📧

**Status: COMPLETE ✅**

#### Unit 11.1: Email Setup ✅

- [x] Install Resend (dev fallback: console when `RESEND_API_KEY` empty)
- [x] Create email templates (src/lib/email-templates.ts)
- [x] Order confirmation email
- [x] Shipping notification email
- [x] Payment receipt email (payment-completed flow)

#### Unit 11.2: Notifications ✅

- [x] In-app notifications (Prisma Notification model + service)
- [x] Notification preferences (email order/payment/marketing toggles + in-app)
- [x] Notification API routes (GET/PATCH /api/notifications, GET/PUT /api/user/notification-preference)
- [x] Notification UI (NotificationBell dropdown, `/notifications` page, profile preference form)
- [x] Wired into order lifecycle (placed, shipped, delivered, cancelled, payment completed, low-stock alerts)
- [x] Push notifications (deferred — optional, not needed for prototype)

---

### PHASE 12: Testing 🧪

**Status: COMPLETE ✅**

#### Unit 12.1: Unit Tests ✅

- [x] Setup Jest (next/jest + jsdom, `@/` alias, RTL + jest-dom)
- [x] Test API routes (orders, order-status, reviews — Node env for Request/Response)
- [x] Test utility functions (cart-service, order-status, product-query, email-templates)
- [x] Test Prisma queries (covered via product-query builder tests with Prisma types)

#### Unit 12.2: Component Tests ✅

- [x] Setup React Testing Library
- [x] Test ProductCard
- [x] Test AddToCartButton, StarRating, Pagination
- [x] 53 tests total across 11 suites, all passing

#### Unit 12.3: E2E Tests ✅

- [x] Setup Playwright (playwright.config.ts)
- [x] Test user registration flow (e2e/auth.spec.ts)
- [x] Test login flow
- [x] Test checkout flow (e2e/checkout.spec.ts — COD order)
- [x] Test admin flow (e2e/admin.spec.ts — dashboard access)

---

### PHASE 13: Performance & SEO 🚀

**Status: COMPLETE ✅**

#### Unit 13.1: Performance ✅

- [x] Implement ISR (Incremental Static Regeneration)
- [x] Add caching headers
- [x] Optimize images
- [x] Lazy load components
- [x] Analyze bundle size

#### Unit 13.2: SEO ✅

- [x] Add sitemap.xml
- [x] Add robots.txt
- [x] Add structured data (JSON-LD)
- [x] Add Open Graph tags
- [x] Add meta descriptions

---

### PHASE 14: Deployment 🌐

**Status: IN PROGRESS**

#### Unit 14.1: Environment Setup ⏳

- [x] Create `.env.example` (production-ready with `AUTH_TRUST_HOST`)
- [x] Vercel config: `vercel.json` (`buildCommand: prisma generate + npm run build`)
- [x] Prisma `binaryTargets` for Vercel Lambda (`rhel-openssl-3.0.x` + `linux-musl-openssl-3.0.x`)
- [ ] **Needs user:** create Vercel project (`vercel link`) + configure production env vars
- [ ] **Needs user:** create Neon production database; `npx prisma db push` + `npm run db:seed`

#### Unit 14.2: Deployment ⏳

- [x] GitHub Actions CI (`.github/workflows/ci.yml`) + Vercel deploy (`.github/workflows/deploy.yml`)
- [x] `middleware.ts` → `proxy.ts` (Next 16 deprecation removed)
- [x] Auth production fix (`AUTH_TRUST_HOST=true`) — verified: `/api/auth/session` + `/api/auth/providers` 200 under `next start`
- [ ] **Needs user:** `git push origin main`, add GitHub repo secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`), run deploy
- [ ] **Needs user:** attach custom domain + SSL (automatic on Vercel once domain is verified)
- [ ] **Needs user:** set `NEXT_PUBLIC_APP_URL` to production domain so sitemap/robots/metadataBase resolve correctly

---

## Progress Tracker

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

---

## Current Task

**Active Unit:** 14.1/14.2 Deployment — code/config done, account steps pending (Vercel + Neon + GitHub secrets + push/domain)
**Completed:** 1.1 Database Setup, 1.2 Database Seeding, 1.3 Authentication Setup, 1.4 Auth API Routes, 1.5 Auth UI, 1.6 Zustand Setup, 2.1 Product API Routes, 2.2 Category API Routes, 2.3 Product Pages Update, 2.4 Image Handling, 3.1 Cart API Routes, 3.2 Cart UI Updates, 3.3 Cart Persistence, 4.1 Checkout Page, 4.2 Order API Routes, 4.3 Order UI, 5.1 SSLCommerz Integration, 5.3 Payment UI, 6.1 Profile API Routes, 6.2 Address Management, 6.3 Profile UI, 7.1 Admin Layout, 7.2 Product Management, 7.3 Order Management, 7.4 User Management, 7.5 Dashboard, 7.6 Categories Management, 8.1 Reviews, 8.2 Wishlist, 9.1 Advanced Search, 9.2 Filtering, 9.3 Sorting, 9.4 Pagination, 10.1 Coupon Backend, 10.2 Coupon UI, 11.1 Email Setup, 11.2 Notifications, 12.1 Unit Tests, 12.2 Component Tests, 12.3 E2E Tests, 13.1 Performance, 13.2 SEO

---

## Notes

- User prefers English responses
- Using Neon PostgreSQL (free tier)
- Project is learning-focused but should be production-ready
- All code should be TypeScript
- Commit after each unit completion
