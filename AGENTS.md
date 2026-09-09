<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

---

# ClickCart Project Context

## Project Overview

- **Name:** ClickCart
- **Type:** E-commerce storefront (Next.js 16)
- **Status:** Frontend-only prototype, converting to TypeScript
- **Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Prisma (planned)

## Current Progress (as of Sep 10, 2026)

### Completed

- Comprehensive project audit (`CLICKCART_PROJECT_AUDIT.md`)
- TypeScript migration started (JSX → TSX conversions)
- New files added: `middleware.ts`, `src/types/`, error boundaries, `not-found.tsx`
- Prisma directory created (schema not yet defined)

### Uncommitted Changes

All TypeScript migration changes are **uncommitted**. Run `git status` to see:

- Deleted: All `.jsx` files
- Added: All `.tsx` replacements
- Added: `src/middleware.ts`, `src/types/`, `prisma/`, error pages

**ACTION NEEDED:** Commit TypeScript migration before proceeding.

## Roadmap

**Full project plan:** See `PROJECT_PLAN.md` for detailed breakdown of all 14 phases and 60+ units.

### Quick Overview

| Phase | Description                        | Status      |
| ----- | ---------------------------------- | ----------- |
| 1     | Backend Foundation (DB, Auth, API) | IN PROGRESS |
| 2     | Product System                     | PENDING     |
| 3     | Cart System                        | PENDING     |
| 4     | Checkout & Orders                  | PENDING     |
| 5     | Payment Integration                | PENDING     |
| 6     | User Profile                       | PENDING     |
| 7     | Admin Dashboard                    | PENDING     |
| 8     | Reviews & Wishlist                 | PENDING     |
| 9     | Search & Filtering                 | PENDING     |
| 10    | Coupon System                      | PENDING     |
| 11    | Email & Notifications              | PENDING     |
| 12    | Testing                            | PENDING     |
| 13    | Performance & SEO                  | PENDING     |
| 14    | Deployment                         | PENDING     |

### Current Active Task

- **Unit 1.2:** Database Seeding (Next)

## Important Decisions

- Language: Answer user in English only
- Backend: Prisma ORM selected
- Auth: NextAuth.js / Auth.js (to be implemented)
- Payment: SSLCommerz or bKash (to be decided)

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
