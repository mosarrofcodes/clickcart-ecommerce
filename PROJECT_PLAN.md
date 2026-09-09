# ClickCart - Complete Project Plan

## Tech Stack

| Category | Technology | Status |
|----------|------------|--------|
| Framework | Next.js 16 (App Router) | ✅ Done |
| Language | TypeScript | ✅ Done |
| Database | PostgreSQL (Neon) | ✅ Connected |
| ORM | Prisma 5.22.0 | ✅ Schema Ready |
| Password Hashing | bcryptjs | ✅ Installed |
| Auth | NextAuth.js / Auth.js | ⏳ Pending |
| State Management | Zustand | ⏳ Pending |
| Styling | Tailwind CSS 4 | ✅ Done |
| UI Components | shadcn/ui | ✅ Done |
| Payment | SSLCommerz / bKash | ⏳ Pending |
| Validation | Zod | ⏳ Pending |
| Testing | Jest + React Testing Library | ⏳ Pending |
| Dev Tool | tsx (TypeScript runner) | ✅ Installed |

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

#### Unit 1.3: Authentication Setup ⏳
- [ ] Install NextAuth.js / Auth.js
- [ ] Create auth configuration
- [ ] Setup Google/GitHub OAuth providers
- [ ] Create credentials provider (email/password)
- [ ] Add password hashing (bcrypt)
- [ ] Create session callback
- [ ] Create JWT callback

#### Unit 1.4: Auth API Routes ⏳
- [ ] POST /api/auth/register (user registration)
- [ ] POST /api/auth/login (user login)
- [ ] GET /api/auth/session (get current session)
- [ ] POST /api/auth/logout (logout)

#### Unit 1.5: Auth UI ⏳
- [ ] Update sign-in page with NextAuth
- [ ] Update sign-up page with registration logic
- [ ] Add session provider to layout
- [ ] Add user menu in navbar (show email, sign out)
- [ ] Protect routes (redirect if not logged in)

#### Unit 1.6: Zustand Setup ⏳
- [ ] Install Zustand
- [ ] Create auth store (user session state)
- [ ] Create cart store (replace React Context)
- [ ] Create UI store (modals, sidebar state)
- [ ] Persist cart to localStorage

---

### PHASE 2: Product System 📦
**Status: PENDING**

#### Unit 2.1: Product API Routes ⏳
- [ ] GET /api/products (list all, with pagination)
- [ ] GET /api/products/[id] (get single product)
- [ ] GET /api/products/search?q= (search products)
- [ ] GET /api/products/category/[slug] (filter by category)
- [ ] POST /api/products (admin only - create)
- [ ] PUT /api/products/[id] (admin only - update)
- [ ] DELETE /api/products/[id] (admin only - delete)

#### Unit 2.2: Category API Routes ⏳
- [ ] GET /api/categories (list all)
- [ ] GET /api/categories/[slug] (get by slug)
- [ ] POST /api/categories (admin only)
- [ ] PUT /api/categories/[id] (admin only)
- [ ] DELETE /api/categories/[id] (admin only)

#### Unit 2.3: Product Pages Update ⏳
- [ ] Convert product pages to Server Components
- [ ] Use Prisma instead of dummyjson.com
- [ ] Add loading.tsx for each page
- [ ] Add error.tsx for each page
- [ ] Implement generateMetadata for SEO

#### Unit 2.4: Image Handling ⏳
- [ ] Setup Cloudinary or Uploadthing
- [ ] Create image upload component
- [ ] Add image optimization
- [ ] Replace <img> with Next.js <Image>

---

### PHASE 3: Cart System 🛒
**Status: PENDING**

#### Unit 3.1: Cart API Routes ⏳
- [ ] GET /api/cart (get user's cart)
- [ ] POST /api/cart/items (add item to cart)
- [ ] PUT /api/cart/items/[id] (update quantity)
- [ ] DELETE /api/cart/items/[id] (remove item)
- [ ] DELETE /api/cart (clear cart)

#### Unit 3.2: Cart UI Updates ⏳
- [ ] Integrate Zustand cart store
- [ ] Add quantity +/- buttons
- [ ] Add "Move to Wishlist" button
- [ ] Show stock validation
- [ ] Calculate shipping cost
- [ ] Apply coupon code input

#### Unit 3.3: Cart Persistence ⏳
- [ ] Sync localStorage with database
- [ ] Merge guest cart on login
- [ ] Handle offline/online sync

---

### PHASE 4: Checkout & Orders 📋
**Status: PENDING**

#### Unit 4.1: Checkout Page ⏳
- [ ] Create /checkout page
- [ ] Shipping address form
- [ ] Order summary display
- [ ] Payment method selection
- [ ] Place order button

#### Unit 4.2: Order API Routes ⏳
- [ ] POST /api/orders (create order)
- [ ] GET /api/orders (user's orders)
- [ ] GET /api/orders/[id] (order details)
- [ ] PUT /api/orders/[id]/cancel (cancel order)

#### Unit 4.3: Order UI ⏳
- [ ] Order confirmation page
- [ ] Order history page (/orders)
- [ ] Order details page (/orders/[id])
- [ ] Order status tracking

---

### PHASE 5: Payment Integration 💳
**Status: PENDING**

#### Unit 5.1: SSLCommerz Integration ⏳
- [ ] Install SSLCommerz SDK
- [ ] Create payment API route
- [ ] Initialize payment session
- [ ] Handle success callback
- [ ] Handle fail/cancel callback
- [ ] Verify payment

#### Unit 5.2: bKash Integration (Optional) ⏳
- [ ] Install bKash SDK
- [ ] Create bKash payment route
- [ ] Handle bKash callback

#### Unit 5.3: Payment UI ⏳
- [ ] Payment method selection
- [ ] Payment status display
- [ ] Invoice/receipt generation

---

### PHASE 6: User Profile 👤
**Status: PENDING**

#### Unit 6.1: Profile API Routes ⏳
- [ ] GET /api/user/profile
- [ ] PUT /api/user/profile
- [ ] PUT /api/user/password

#### Unit 6.2: Address Management ⏳
- [ ] GET /api/user/addresses
- [ ] POST /api/user/addresses
- [ ] PUT /api/user/addresses/[id]
- [ ] DELETE /api/user/addresses/[id]
- [ ] Set default address

#### Unit 6.3: Profile UI ⏳
- [ ] Profile page (/profile)
- [ ] Edit profile form
- [ ] Address list
- [ ] Add/edit address modal
- [ ] Order history link

---

### PHASE 7: Admin Dashboard 🛠️
**Status: PENDING**

#### Unit 7.1: Admin Layout ⏳
- [ ] Create /admin layout
- [ ] Admin sidebar navigation
- [ ] Protect admin routes (role check)

#### Unit 7.2: Product Management ⏳
- [ ] Product list with search/filter
- [ ] Add new product form
- [ ] Edit product form
- [ ] Delete product confirmation
- [ ] Bulk actions (delete, update stock)

#### Unit 7.3: Order Management ⏳
- [ ] Order list with status filter
- [ ] Order details view
- [ ] Update order status
- [ ] Print shipping label

#### Unit 7.4: User Management ⏳
- [ ] User list
- [ ] View user details
- [ ] Change user role
- [ ] Block/unblock user

#### Unit 7.5: Dashboard ⏳
- [ ] Sales statistics
- [ ] Recent orders
- [ ] Low stock alerts
- [ ] Revenue charts

---

### PHASE 8: Reviews & Wishlist ⭐
**Status: PENDING**

#### Unit 8.1: Reviews ⏳
- [ ] POST /api/reviews (add review)
- [ ] PUT /api/reviews/[id] (update review)
- [ ] DELETE /api/reviews/[id] (delete review)
- [ ] Review form component
- [ ] Review list component
- [ ] Star rating component

#### Unit 8.2: Wishlist ⏳
- [ ] Create Wishlist model in Prisma
- [ ] POST /api/wishlist (add item)
- [ ] DELETE /api/wishlist/[id] (remove item)
- [ ] GET /api/wishlist (get wishlist)
- [ ] Wishlist page UI
- [ ] Add to wishlist button

---

### PHASE 9: Search & Filtering 🔍
**Status: PENDING**

#### Unit 9.1: Advanced Search ⏳
- [ ] Search with debounce
- [ ] Search suggestions
- [ ] Recent searches
- [ ] Search analytics

#### Unit 9.2: Filtering ⏳
- [ ] Price range filter
- [ ] Category filter
- [ ] Brand filter
- [ ] Rating filter
- [ ] Availability filter

#### Unit 9.3: Sorting ⏳
- [ ] Sort by price (low to high, high to low)
- [ ] Sort by rating
- [ ] Sort by newest
- [ ] Sort by popularity

#### Unit 9.4: Pagination ⏳
- [ ] Server-side pagination
- [ ] Page navigation component
- [ ] Items per page selector

---

### PHASE 10: Coupon System 🏷️
**Status: PENDING**

#### Unit 10.1: Coupon Backend ⏳
- [ ] Create Coupon model in Prisma
- [ ] POST /api/coupons (create coupon - admin)
- [ ] POST /api/coupons/validate (validate coupon)
- [ ] Apply discount to order

#### Unit 10.2: Coupon UI ⏳
- [ ] Coupon management page (admin)
- [ ] Coupon input on checkout
- [ ] Discount display

---

### PHASE 11: Email & Notifications 📧
**Status: PENDING**

#### Unit 11.1: Email Setup ⏳
- [ ] Install Resend or Nodemailer
- [ ] Create email templates
- [ ] Order confirmation email
- [ ] Shipping notification email

#### Unit 11.2: Notifications ⏳
- [ ] In-app notifications
- [ ] Push notifications (optional)
- [ ] Notification preferences

---

### PHASE 12: Testing 🧪
**Status: PENDING**

#### Unit 12.1: Unit Tests ⏳
- [ ] Setup Jest
- [ ] Test Prisma queries
- [ ] Test API routes
- [ ] Test utility functions

#### Unit 12.2: Component Tests ⏳
- [ ] Setup React Testing Library
- [ ] Test ProductCard
- [ ] Test Cart
- [ ] Test Checkout form

#### Unit 12.3: E2E Tests ⏳
- [ ] Setup Playwright
- [ ] Test user registration flow
- [ ] Test login flow
- [ ] Test checkout flow
- [ ] Test admin flow

---

### PHASE 13: Performance & SEO 🚀
**Status: PENDING**

#### Unit 13.1: Performance ⏳
- [ ] Implement ISR (Incremental Static Regeneration)
- [ ] Add caching headers
- [ ] Optimize images
- [ ] Lazy load components
- [ ] Analyze bundle size

#### Unit 13.2: SEO ⏳
- [ ] Add sitemap.xml
- [ ] Add robots.txt
- [ ] Add structured data (JSON-LD)
- [ ] Add Open Graph tags
- [ ] Add meta descriptions

---

### PHASE 14: Deployment 🌐
**Status: PENDING**

#### Unit 14.1: Environment Setup ⏳
- [ ] Create .env.example
- [ ] Setup Vercel project
- [ ] Configure environment variables
- [ ] Setup Neon production database

#### Unit 14.2: Deployment ⏳
- [ ] Deploy to Vercel
- [ ] Setup custom domain
- [ ] Configure SSL
- [ ] Setup CI/CD (GitHub Actions)

---

## Progress Tracker

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Backend Foundation | IN PROGRESS | 25% |
| Phase 2: Product System | PENDING | 0% |
| Phase 3: Cart System | PENDING | 0% |
| Phase 4: Checkout & Orders | PENDING | 0% |
| Phase 5: Payment Integration | PENDING | 0% |
| Phase 6: User Profile | PENDING | 0% |
| Phase 7: Admin Dashboard | PENDING | 0% |
| Phase 8: Reviews & Wishlist | PENDING | 0% |
| Phase 9: Search & Filtering | PENDING | 0% |
| Phase 10: Coupon System | PENDING | 0% |
| Phase 11: Email & Notifications | PENDING | 0% |
| Phase 12: Testing | PENDING | 0% |
| Phase 13: Performance & SEO | PENDING | 0% |
| Phase 14: Deployment | PENDING | 0% |

---

## Current Task

**Active Unit:** 1.3 Authentication Setup (Next)
**Completed:** 1.1 Database Setup, 1.2 Database Seeding

---

## Notes

- User prefers English responses
- Using Neon PostgreSQL (free tier)
- Project is learning-focused but should be production-ready
- All code should be TypeScript
- Commit after each unit completion
