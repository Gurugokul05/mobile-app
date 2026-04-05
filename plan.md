# ROOTS Project Plan and Full Feature Map

## 1. Project Overview

ROOTS is a full-stack marketplace platform for authentic local products, with:

- Mobile app for buyers and sellers (React Native + Expo)
- Admin dashboard (React + Vite)
- Backend API (Node.js + Express + MongoDB)

The platform supports discovery, ordering, payments, refund workflows, seller verification, and role-based access.

## 2. Product Goals

- Enable buyers to discover trusted local products by region.
- Enable sellers to onboard, upload products, and manage orders.
- Enable admins to verify seller authenticity and review refunds.
- Maintain trust through verification, proof uploads, and tracked order lifecycle.

## 3. Full Feature Inventory

### 3.1 Authentication and Identity

Implemented features:

- User registration (`buyer`, `seller`, `admin` roles)
- User login with JWT token issuance
- Persistent mobile auth session via AsyncStorage
- Profile fetch and profile update
- Account deletion (self-service)
- Role-based route protection (`protect`, `admin`, `adminOrSeller`)

API surface:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `DELETE /api/auth/me`

### 3.2 Buyer Experience (Mobile)

Implemented buyer screens and flows:

- Onboarding, login, and registration
- Home product browsing
- Trending view
- Product detail screen
- Place/region exploration
- Seller profile view (from buyer context)
- Cart management (add/remove/quantity/total)
- Direct "Buy Now" checkout
- Address capture at checkout
- Mock Razorpay payment verification flow
- Order tracking and order history views
- Refund request initiation with proof upload support
- Buyer profile management hub
- Saved addresses management
- Payment methods management
- Billing history and info pages

Core buyer capabilities:

- Browse products from seeded marketplace inventory
- View product and seller trust information
- Create order and track order status
- Raise refund request with unboxing proof

### 3.3 Seller Experience (Mobile)

Implemented seller screens and flows:

- Seller onboarding
- Seller dashboard
- Seller orders management
- Seller products management
- Product upload flow
- Insights screen
- Seller profile screen

Seller backend capabilities:

- Upload verification documents (ID, location proof, making proof)
- View seller stats, revenue, products, and orders
- Upload packing proof for orders

API surface:

- `POST /api/seller/verify`
- `PUT /api/seller/:id/verify` (admin action)
- `GET /api/seller/me/stats`
- `GET /api/seller/me/products`
- `GET /api/seller/me/orders`
- `GET /api/seller/me/revenue`

### 3.4 Admin Experience (Web)

Current admin dashboard pages:

- Admin login page with role check (`admin`)
- Sellers review page (UI ready)
- Refund review page (UI ready)

Important current-state note:

- Sellers and refunds admin pages currently use mock data in UI and commented API calls.
- Backend APIs for seller verification and refund decisions exist and are ready.
- Admin web integration with live backend endpoints is a remaining integration task.

### 3.5 Catalog and Product Management

Implemented features:

- Product listing API
- Product details API
- Product creation (admin/seller protected)
- Multiple image upload support
- Product reviews endpoint
- Region/origin-based product data

API surface:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `POST /api/products/:id/reviews`

### 3.6 Orders and Payments

Implemented features:

- Order creation from checkout
- Buyer order listing
- Order detail retrieval
- Payment verification endpoint
- Packing proof upload (seller/admin protected)
- End-to-end "buy now" flow fixed and working

API surface:

- `POST /api/orders`
- `GET /api/orders/my-orders`
- `GET /api/orders/:id`
- `POST /api/orders/:id/verify-payment`
- `POST /api/orders/:id/packing-proof`

### 3.7 Refunds and Trust Workflows

Implemented features:

- Buyer can create refund request with unboxing proof upload
- Admin can decide refund status
- Dedicated mobile refund UX and policy visibility

API surface:

- `POST /api/refunds`
- `PUT /api/refunds/:id/decide`

### 3.8 Data, Seeding, and Demo Readiness

Implemented features:

- Automatic DB seeding on backend startup
- Seeded demo users (buyer/seller/admin)
- Seeded seller records with verification/trust scores
- Seeded products across multiple Indian regions

Benefits:

- Zero-empty-state startup for demos/testing
- Fast QA and feature validation

### 3.9 Platform and Infrastructure

Backend platform features:

- Express middleware stack (`helmet`, `cors`, `morgan`)
- Multer-based upload handling
- Cloudinary integration configuration
- Static upload serving
- Centralized error handling for multer/cloud and generic errors

Mobile platform features:

- Navigation architecture with role-specific tab flows
- Context-based state management (`Auth`, `Cart`, alerts)
- API interceptor architecture for token attachment

## 4. Feature Completion Snapshot

Completed and operational:

- Auth, buyer flow, seller flow, backend APIs, seeded data
- Buy-now checkout issue fixed
- Refund request pipeline in backend and mobile

Partially complete:

- Admin web pages (UI exists but key screens still mock-driven)

## 5. Phase Plan (Execution Roadmap)

### Phase 1: Stabilization (Now)

- Keep current buyer and seller mobile flows production-stable.
- Keep seeding and auth middleware validated in CI/manual smoke tests.
- Verify all protected routes reject unauthorized access correctly.

### Phase 2: Admin Live Integration

- Replace mock sellers/refunds data with live API calls.
- Connect actions to:
  - `PUT /api/seller/:id/verify`
  - `PUT /api/refunds/:id/decide`
- Add loading/error/success states and optimistic updates where safe.

### Phase 3: Trust and Operations Enhancements

- Add richer admin analytics and moderation tools.
- Add audit logs for seller verification and refund decisions.
- Add advanced seller insights and trend analytics.

### Phase 4: Production Hardening

- Add end-to-end tests for buyer checkout and refund flows.
- Add API contract tests for role-based endpoints.
- Add observability (structured logs, error monitoring, performance metrics).
- Prepare deployment playbooks for backend, admin, and mobile release channels.

## 6. Success Criteria

- Buyers can complete browse-to-purchase flow without auth/payment blockers.
- Sellers can onboard, list products, and manage orders with proof uploads.
- Admins can verify sellers and decide refunds through live integrated web UI.
- Seeded and non-seeded environments both function reliably.
- Critical paths are covered by repeatable test checklist/automation.

## 7. Immediate Next Priorities

1. Wire admin `Sellers` page to live verification endpoint.
2. Wire admin `Refunds` page to live decision endpoint.
3. Add a single "smoke test" script covering login, browse, checkout, and order fetch.
4. Add deployment environment validation checklist for `.env` completeness.
