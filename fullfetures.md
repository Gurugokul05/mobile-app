# Roots / Final Mobile Project Reference

This document is the comprehensive feature and architecture reference for the entire workspace. It covers the marketplace product, the three apps in the monorepo, the backend data model, public APIs, navigation structure, seeded demo data, setup flow, and the main user journeys.

## 1. Project Overview

Roots is a regional marketplace for authentic local products. The platform connects buyers, sellers, and administrators around a single shared backend.

The project is organized as a monorepo with three applications:

- `backend/` - Node.js + Express API with MongoDB
- `mobile/` - Expo React Native mobile app for buyers and sellers
- `admin/` - React + Vite admin dashboard

The overall product goals are:

- Let buyers discover region-specific handmade and authentic products
- Let sellers manage products, orders, verification, compliance, and store settings
- Let admins review sellers, compliance documents, and refund requests
- Keep the demo environment usable through auto-seeding and test accounts

## 2. Repository Structure

### Root level

- Project documentation and testing guides live at the root
- The root also contains helper scripts for backend testing
- `README.md` provides a high-level introduction
- `CLAUDE.md` describes the intended architecture and conventions

### Backend

- `backend/server.js` starts the API server
- `backend/seeds/seedData.js` seeds demo users, sellers, products, and sample orders
- `backend/src/config/` contains database and Cloudinary setup
- `backend/src/controllers/` contains business logic
- `backend/src/middlewares/` contains auth, validation, file upload, and rate limiting
- `backend/src/models/` contains MongoDB schemas
- `backend/src/routes/` exposes REST endpoints
- `backend/uploads/` stores locally uploaded files when applicable

### Mobile app

- `mobile/App.js` wires the app providers and navigator
- `mobile/src/navigation/AppNavigator.js` defines auth flow, buyer flow, and seller flow
- `mobile/src/context/` contains state providers for auth, cart, wishlist, and alerts
- `mobile/src/screens/` contains onboarding, auth, buyer, and seller screens
- `mobile/src/api/config.js` centralizes the API base URL and request headers
- `mobile/src/components/` contains reusable UI building blocks
- `mobile/src/theme/` contains shared colors and visual tokens

### Admin app

- `admin/src/App.jsx` defines the dashboard shell and routes
- `admin/src/pages/` contains the login page and management views
- `admin/src/config/api.js` configures admin API requests and auth headers

## 3. Technology Stack

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- bcryptjs password hashing
- nodemailer for email OTP flows
- multer for uploads
- Cloudinary for image and file storage integration
- Razorpay for payment flow integration
- pdfkit for PDF export support
- helmet, cors, morgan for security and logging

### Mobile

- Expo SDK 55
- React Native 0.83
- React Navigation stack, bottom tabs, and material top tabs
- Axios for API calls
- AsyncStorage for local session persistence
- React Native Gesture Handler and Safe Area Context
- Image picking and sharing packages for upload workflows
- Razorpay React Native integration
- Reanimated and tab-view related packages for richer UI flows

### Admin

- React 19
- Vite
- React Router DOM
- Axios
- Lucide React icons

## 4. Users and Roles

The platform has three primary roles.

### Buyer

A buyer can:

- Register and log in
- Browse products by region and category-style groupings
- Open product and seller detail pages
- Add items to cart and complete checkout
- Track orders and payment status
- Request refunds with proof
- Manage profile data, addresses, and payment methods
- View wishlist and billing history screens

### Seller

A seller can:

- Log in to a seller-specific experience
- Complete onboarding and seller verification flows
- Create and manage product listings
- Upload product images
- View incoming orders
- Upload packing proof
- Review insights, transactions, and low-stock items
- Manage store settings, security, compliance, and public store preview

### Admin

An admin can:

- Log in to the web dashboard
- Review and approve or reject sellers
- Review and decide refund requests
- Review compliance verifications
- View seller lists and related operational information

## 5. Mobile App Experience

The mobile app is the customer-facing product and also provides seller workflows.

### App bootstrap

- `mobile/App.js` wraps the app in `SafeAreaProvider`, `GestureHandlerRootView`, `AlertProvider`, `AuthProvider`, `WishlistProvider`, and `CartProvider`
- `mobile/src/navigation/AppNavigator.js` decides whether the user sees onboarding/auth screens or the buyer/seller navigation shell
- When authentication state is still loading, the app shows a centered loading indicator

### Authentication flow

The mobile app supports several auth-related flows:

- Standard register and login
- OTP-based registration
- Forgot-password OTP reset flow
- Login two-factor OTP verification and resend
- Logout and persisted session restore through AsyncStorage

The auth context in `mobile/src/context/AuthContext.js` also normalizes input, stores the token and user profile locally, and retries login with trimmed password variants if needed.

### Buyer navigation

The buyer shell uses a bottom tab navigator with these main tabs:

- Home
- Trending
- Cart
- Orders
- Profile

The buyer deep screens include:

- Places
- PlaceScreen
- ProductScreen
- BuyerSellerProfile
- Checkout
- OrderTracking
- Addresses
- PaymentMethods
- BillingHistory
- Info
- Wishlist

### Seller navigation

The seller shell uses a bottom tab navigator with these main tabs:

- Dashboard
- Orders
- Products
- Insights
- Profile

The seller deep screens include:

- SellerOnboarding
- ProductUpload
- SellerPublicStorePreview
- SellerLowStock
- SellerTransactions
- SellerSecurity
- SellerCompliance
- SellerComplianceUpload

### Mobile user-facing features

Buyer-side features visible in the app include:

- Onboarding and login/register entry point
- Product discovery and browsing
- Trending products view
- Place-based browsing
- Product detail pages
- Seller profile pages from product context
- Cart and checkout flow
- Order tracking view
- Saved addresses management
- Payment methods management
- Billing history view
- Informational profile screens
- Wishlist handling through app state

Seller-side features visible in the app include:

- Seller onboarding
- Seller dashboard
- Product creation and edit flows
- Order management
- Analytics and insights
- Public store preview
- Low-stock awareness
- Transaction history
- Security settings and two-factor control
- Compliance upload and review views

## 6. Admin Dashboard Experience

The admin app is a separate React/Vite dashboard.

### Authentication and shell

- `admin/src/App.jsx` reads `adminToken` from localStorage
- If the token is missing, the app redirects to `/login`
- After login, the app shows a sidebar layout with navigation links and logout support
- The dashboard uses inline styles and loads Inter from Google Fonts

### Admin routes

- `/login` - admin sign-in
- `/` - dashboard home
- `/sellers` - seller management
- `/refunds` - refund review and decisioning
- `/compliance` - seller compliance verification review

### Admin features

- View and manage sellers
- Review refund requests
- Review compliance verification items
- Navigate through the dashboard with a persistent sidebar
- Log out and clear local auth state

## 7. Backend Application Behavior

### Server bootstrap

`backend/server.js` performs the following startup sequence:

- Loads environment variables with dotenv
- Connects to MongoDB
- Seeds demo data
- Configures JSON and URL-encoded body parsing with a large payload limit for uploads
- Enables CORS for development use
- Adds explicit CORS headers for browser compatibility
- Configures helmet with cross-origin resource policy for media previews
- Enables morgan request logging
- Serves local files from `/uploads`
- Mounts API routes under `/api`
- Adds a global error handler and a 404 handler

### Database configuration

`backend/src/config/db.js` uses:

- `MONGO_URI` for the connection string
- `DB_NAME` with a fallback of `roots`
- A short server selection timeout for fast failure

If the database connection fails, the server logs the issue and exits.

### Public server endpoints

- `GET /` returns a simple API running message
- `GET /health` returns a health check payload with status and port

## 8. Backend API Reference

All application APIs are mounted under `/api`.

### Auth routes

File: `backend/src/routes/authRoutes.js`

- `POST /api/auth/register` - direct registration
- `POST /api/auth/send-otp` - request registration OTP
- `POST /api/auth/verify-otp` - complete registration using OTP
- `POST /api/auth/forgot-password/send-otp` - request password reset OTP
- `POST /api/auth/forgot-password/reset` - reset password with OTP
- `POST /api/auth/login` - login with email and password
- `POST /api/auth/login/2fa/verify` - verify login two-factor OTP
- `POST /api/auth/login/2fa/resend` - resend login OTP
- `GET /api/auth/profile` - fetch current user profile
- `PUT /api/auth/profile` - update current profile
- `GET /api/auth/addresses` - list saved addresses
- `POST /api/auth/addresses` - add a saved address
- `DELETE /api/auth/addresses/:addressId` - delete a saved address
- `GET /api/auth/payment-methods` - list payment methods
- `POST /api/auth/payment-methods` - add a payment method
- `DELETE /api/auth/payment-methods/:methodId` - delete a payment method
- `POST /api/auth/me/delete/send-otp` - send account deletion OTP
- `POST /api/auth/me/delete/confirm` - confirm account deletion with OTP
- `DELETE /api/auth/me` - delete the current account

### Product routes

File: `backend/src/routes/productRoutes.js`

- `GET /api/products` - list all products
- `POST /api/products` - create a product as a seller
- `GET /api/products/:id` - fetch product details
- `PUT /api/products/:id` - update a product as admin or seller
- `POST /api/products/:id/reviews` - add a review to a product

### Order routes

File: `backend/src/routes/orderRoutes.js`

- `POST /api/orders` - create an order as a buyer
- `GET /api/orders/my-orders` - list the current buyer's orders
- `GET /api/orders/:id` - fetch a single order
- `POST /api/orders/:id/verify-payment` - verify a payment for an order
- `POST /api/orders/:id/packing-proof` - upload packing proof as a seller

### Refund routes

File: `backend/src/routes/refundRoutes.js`

- `GET /api/refunds` - list all refunds as admin
- `POST /api/refunds` - create a refund request as a buyer
- `PUT /api/refunds/:id/decide` - approve or reject a refund as admin

### Seller routes

File: `backend/src/routes/sellerRoutes.js`

- `GET /api/seller/public/:id` - fetch public seller profile
- `GET /api/seller/admin/list` - admin seller list
- `GET /api/seller/admin/sellers` - admin seller list alias
- `GET /api/seller/admin/all-verifications` - admin verification list
- `GET /api/seller/admin/compliance-verifications` - admin compliance verification list
- `GET /api/seller/me/stats` - seller dashboard stats
- `GET /api/seller/me/products` - seller products
- `GET /api/seller/me/orders` - seller orders
- `GET /api/seller/me/revenue` - seller revenue summary
- `GET /api/seller/me/store-settings` - seller store settings
- `PUT /api/seller/me/store-settings` - update seller store settings
- `GET /api/seller/me/compliance` - get seller compliance state
- `POST /api/seller/me/compliance/upload` - upload compliance documents
- `GET /api/seller/me/transactions` - transaction history
- `GET /api/seller/me/security` - seller security data
- `PUT /api/seller/me/security/2fa` - toggle seller two-factor
- `GET /api/seller/me/insights/detailed` - detailed revenue insights
- `GET /api/seller/me/insights/pdf` - download revenue insights PDF
- `POST /api/seller/verify` - submit seller verification documents
- `PUT /api/seller/:id/compliance/verify` - approve or reject seller compliance docs
- `PUT /api/seller/:id/verify` - approve or reject seller verification
- `GET /api/seller/:id/verification` - view seller verification details

## 9. Backend Middleware and Security

### Auth middleware

`backend/src/middlewares/auth.js` provides role gates used across the API.

- `protect` - requires a valid Bearer token
- `seller` - seller-only access
- `buyer` - buyer-only access
- `admin` - admin-only access
- `adminOrSeller` - either admin or seller

### Validation

`backend/src/middlewares/validators.js` is used throughout the routes to validate:

- Email payloads
- Register and login requests
- OTP flows
- Profile updates
- Address and payment method payloads
- Product create and update payloads
- Review payloads
- Order creation and payment verification payloads
- Refund requests and decisions
- Seller verification and compliance decisions
- ObjectId route parameters

### Rate limiting

The auth routes use custom rate limiters to reduce abuse of:

- Login attempts
- OTP requests
- OTP verification endpoints

### Upload handling

`backend/src/middlewares/upload.js` handles multipart uploads for:

- Product images
- Seller verification documents
- Packing proof
- Refund unboxing video
- Seller compliance documents

### Error handling

The backend includes both route-level and global error handling for:

- Multer file upload errors
- Cloudinary-related failures
- Validation failures
- Unexpected server errors
- Missing routes

## 10. Data Model Reference

### User

File: `backend/src/models/User.js`

This is the central user model and supports buyers, sellers, and admins.

Key fields include:

- Basic identity fields such as name, email, password, phone, and address
- Saved addresses
- Payment methods
- Role and verification state
- Verification documents
- Trust and seller reputation fields
- Store profile fields
- Seller compliance document status
- Security metadata such as two-factor settings and login activity

### Product

File: `backend/src/models/Product.js`

A product belongs to a seller and contains:

- Seller reference
- Name, description, price, and origin place
- Product images
- Reviews with rating and comment data
- Aggregate rating and review count
- Verification flag for notable items

### Order

File: `backend/src/models/Order.js`

An order links buyer, seller, and product and contains:

- Quantity and total price
- Order status with the lifecycle Ordered, Packed, Shipped, Delivered, Cancelled
- Razorpay payment details and payment status
- Packing proof URL
- Shipping address
- Created and updated timestamps

### RefundRequest

File: `backend/src/models/RefundRequest.js`

A refund request contains:

- Linked order and buyer
- Mandatory unboxing video URL
- Refund reason
- Refund status
- Admin decision metadata

### SellerVerification

File: `backend/src/models/SellerVerification.js`

This model stores the seller verification workflow, including:

- Seller identity and contact info
- Uploaded verification document URLs
- Verification status
- Review timestamps
- Admin reviewer reference
- Admin comments and rejection reason

### OtpChallenge

File: `backend/src/models/OtpChallenge.js`

This model stores registration OTP challenges with:

- Purpose
- Email
- OTP value
- Expiration time
- Last sent time
- Attempt counter

This makes OTP registration persistent instead of relying only on in-memory state.

## 11. Seeded Demo Data

`backend/seeds/seedData.js` is responsible for keeping the demo environment usable.

### Seeded users

The seed script creates or ensures the following user categories:

- Multiple sellers with verified profiles and trust scores
- Multiple buyers
- A default admin user
- A test admin user

### Seeded products

The seed script creates a collection of authentic local products with region-based origin data, such as:

- Kashmir
- Rajasthan
- Darjeeling
- Tamil Nadu
- Mysore
- Kerala
- Karnataka test artisan products

### Seeding behavior

- Seeding is idempotent
- Existing users are preserved
- Products are linked to sellers by email lookup
- The server can be restarted without duplicating demo records

### Practical demo credentials

From the current seed data and repo notes, the most useful accounts are:

- Buyer: buyer1@email.com / password123
- Seller: arun@sellers.com / password123
- Seller: priya@sellers.com / password123
- Seller: rajesh@sellers.com / password123
- Seller: deepika@sellers.com / password123
- Seller: vikram@sellers.com / password123
- Admin: admin@roots.com / admin123
- Test admin: test@admin.com / test1234

## 12. Product and Commerce Flows

### Browse and discover

The buyer journey is centered on discovery:

- Open the app
- Browse home and trending products
- Filter by region or place
- Open a product detail page
- Inspect seller profile and product reviews

### Checkout

The checkout flow includes:

- Cart review
- Shipping address selection
- Payment method usage
- Razorpay-style payment verification
- Order creation and status tracking

### Order tracking

Orders move through a backend-controlled status lifecycle:

- Ordered
- Packed
- Shipped
- Delivered
- Cancelled

The seller can also upload packing proof to support order handling.

### Refunds

The refund workflow requires proof:

- Buyer submits a refund request
- Buyer uploads unboxing video evidence
- Admin reviews the request
- Admin approves or rejects the claim
- Decision metadata is stored on the refund record

### Seller trust and verification

Seller trust is reinforced through:

- Verification documents
- Compliance uploads
- Public store profile data
- Store settings
- Two-factor support
- Seller review and admin approval flows

## 13. API and UI Integration Notes

### Mobile API behavior

- Mobile requests are sent to the API base URL configured in `mobile/src/api/config.js`
- The app can fall back across localhost-style host candidates when no explicit Expo API URL is configured
- The request interceptor automatically injects the stored user token
- FormData requests avoid manually forcing the content type so multipart boundaries are preserved

### Admin API behavior

- Admin requests use `adminToken` from localStorage
- A 401 response clears the token and returns the user to the login page

## 14. Setup Summary

### Backend

- Install dependencies in `backend/`
- Configure environment variables
- Start the server with `npm start` or `npm run dev`

### Mobile

- Install dependencies in `mobile/`
- Start Expo with `npm start`
- Run on Android or iOS as needed

### Admin

- Install dependencies in `admin/`
- Start the Vite dev server with `npm run dev`

## 15. Environment Variables

Common environment variables used by the project include:

- `MONGO_URI` - MongoDB connection string
- `DB_NAME` - database name, defaults to roots
- `JWT_SECRET` - JWT signing secret
- `PORT` - backend port, defaults to 5000
- `RAZORPAY_KEY_ID` - Razorpay key identifier
- `RAZORPAY_KEY_SECRET` - Razorpay secret
- `CLOUDINARY_*` values for media storage if the Cloudinary path is enabled
- `EXPO_PUBLIC_API_URL` - explicit mobile API base URL override
- `VITE_API_BASE_URL` - explicit admin API base URL override

## 16. Known Implementation Notes

- The backend is CommonJS-based, while the admin app uses ES modules
- The project does not use TypeScript
- The backend enables permissive CORS for development
- Uploaded files may be served locally from `/uploads`
- The seeding script is intentionally safe to rerun
- Some documentation in the repo may be older than the current seed data, so the seed script is the source of truth for demo accounts

## 17. Existing Documentation in This Repo

Useful supporting files include:

- `README.md` - broad introduction and quick start
- `QUICK_START.md` - fast setup guide
- `SETUP_AND_TESTING_GUIDE.md` - detailed setup and testing flow
- `TESTING_CHECKLIST.md` - feature checklist
- `COMPLETE_FIX_SUMMARY.md` - summary of recent fixes
- `SELLER_DETAILS_IMPLEMENTATION.md` - seller-related implementation notes
- `SELLER_COMPLIANCE_TODO.md` - compliance-related work list
- `BACKEND_DEBUG_GUIDE.md` - backend troubleshooting notes
- `DATABASE_SEEDING_GUIDE.md` - seeding-specific guidance

## 18. Short Version

If you need the shortest possible summary of the project, this is it:

- Roots is a three-app marketplace for authentic local products
- Buyers shop in the mobile app
- Sellers manage catalog, orders, compliance, and security in the same mobile app
- Admins manage sellers, refunds, and compliance in the web dashboard
- MongoDB, JWT, Razorpay, Cloudinary, OTP flows, and upload handling power the backend
- The backend seeds demo users and products so the project is immediately testable
