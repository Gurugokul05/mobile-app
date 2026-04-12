# COMPREHENSIVE UI/UX INVENTORY: ROOTS MARKETPLACE

Generated: 2026-04-12
Scope: Mobile (React Native/Expo) • Admin Dashboard (React) • Landing Site (React/Tailwind)

## 1. INFORMATION ARCHITECTURE & NAVIGATION MAPS

### 1.1 Mobile App Navigation Structure

Root Navigator: Auth layers to role-based tab navigation (Buyer/Seller)

AuthProvider Wrapper
- OnboardingScreen (optional first launch)
- LoginScreen
  - Email + Password input
  - Forgot Password (OTP flow)
  - Two-Factor Auth (OTP verification)
- RegisterScreen (new user signup)
- BuyerTabs Navigation
  - Home (primary browsing, places, trending products)
  - Trending (featured regional crafts)
  - Cart (CartCheckoutScreen)
    - Product list with remove option
    - Shipping address input
    - UpiPaymentScreen
  - Orders (OrderTrackingScreen)
    - Order list (all statuses)
    - Status timeline visualization
    - ProductScreen (review eligible orders)
  - Profile (ProfileScreen)
    - User info, order history summary
    - Saved addresses
    - Payment methods
    - Wishlist badge
    - Settings (notifications, account deletion)
    - Help/Terms/Privacy
- SellerTabs Navigation
  - Dashboard (key metrics, verification status, quick actions)
  - Orders (SellerOrdersScreen)
    - Incoming orders (filterable by status)
    - Accept/Reject pending orders
    - SellerOrderDetailScreen
  - Products
    - ProductsScreen (seller inventory list)
    - ProductUploadScreen (create/edit)
  - Insights (revenue, stats, trust score tracking)
  - SellerProfile
    - Store info, trust score, compliance status, security, UPI setup
    - SellerComplianceUploadScreen

Secondary routes (stack overlays)
- ProductScreen (from Home, Trending, search) with Add to Cart / Wishlist
- PlaceScreen (from Places) with region filtered products
- SellerProfileScreen (buyer view) for trust + store profile
- RefundScreen (buyer, delivered orders)
- SellerComplianceScreen / SellerComplianceUploadScreen
- SellerRefundRequestsScreen
- SellerLowStockScreen
- SellerSecurityScreen

### 1.2 Admin Dashboard Navigation

Layout: persistent left sidebar + main content area

Sidebar
- Logo + Roots branding
- Nav links
  - Dashboard
  - Sellers
  - Refunds
  - UPI Payments
  - Compliance Verify
- Logout at bottom

Main content
- Header (title + subtitle + refresh action)
- Filter tabs
- Grid/list views + detail modal

### 1.3 Landing Page Navigation

Sticky navbar to multi-section scroll flow

Navbar
- Brand logo mark
- Home, Marketplace, How It Works, For Sellers, Login
- Explore CTA
- Mobile menu sheet

Sections
- Hero
- StatsBar
- HowItWorks
- ProductShowcase
- SellerSpotlight
- TrustAndTech
- Testimonials
- CTABanner
- Footer

## 2. SCREEN-BY-SCREEN UI LAYOUTS & KEY INTERACTIONS

### 2.1 Mobile App Buyer Flow

#### HomeScreen
File: mobile/src/screens/buyer/HomeScreen.js

Layout
- Safe area wrapper + branded header
- Location chips/places horizontal carousel
- Product card feed/grid with image, name, price, rating, seller cues
- Verified cues and trust indicators where available

Interactions
- Tap place to filter/navigation
- Tap product to ProductScreen
- Horizontal swipe on place carousel

Visual details
- Rounded cards, subtle shadows, compact metadata stack
- Hierarchy: product name > price > seller/rating meta

#### ProductScreen
File: mobile/src/screens/buyer/ProductScreen.js

Layout
- Hero product image area with top controls
- Product meta: name, price, origin
- Seller card: trust score, verification badge, profile link
- Description + highlights
- Reviews section
- Suggested products row
- Sticky footer: Add to Cart + Buy Now

Interactions
- Wishlist toggle
- Seller profile open
- Add to cart
- Buy now to checkout
- Review modal open/submit if eligible

Review UX behavior
- Shows existing reviews (prioritizes current user review if present)
- Write review button visible only if user can review
- Locked message if purchase/delivery criteria not met

Loading/error states
- Detail fetch overlay spinner
- Suggestion list loading spinner
- Alert-based failure feedback

#### CartCheckoutScreen
File: mobile/src/screens/buyer/CartCheckoutScreen.js

Layout
- Cart items list with thumbnail, quantity, remove action
- Shipping address form fields
- Totals summary
- Checkout CTA

Interactions
- Remove cart items
- Address entry validation
- Checkout to payment flow

Validation/feedback
- Form-level alerts for missing required fields
- Success/failure via alert system

#### UpiPaymentScreen
File: mobile/src/screens/buyer/UpiPaymentScreen.js

Layout
- Payment summary card (seller, amount, reference, expiry)
- Open UPI app action
- Payment proof upload area
- Transaction ID input + screenshot picker

Interactions
- Launch UPI app
- Upload screenshot
- Submit proof

Feedback
- Progress/loading while proof upload
- Error alert if missing required values
- Success state message after submission

#### OrderTrackingScreen
File: mobile/src/screens/buyer/OrderTrackingScreen.js

Layout
- Filter tabs by order status
- Order cards with status badge and timeline cues
- Empty state when no orders

Interactions
- Filter switching
- Open order detail
- Navigate to related product/seller context where exposed

Status language and semantics
- Pending, Accepted, Packed, Shipped, Delivered, Rejected
- Color-coded statuses with consistent iconography

#### RefundScreen
File: mobile/src/screens/buyer/RefundScreen.js

Layout
- Tabs: eligible orders + submitted refund requests
- Request modal with reason + unboxing video upload

Interactions
- Request refund only on eligible delivered orders
- Video picker + form submit

Feedback
- Upload progress cues
- Admin decision status visibility for submitted requests

#### ProfileScreen
File: mobile/src/screens/buyer/ProfileScreen.js

Layout
- User identity header
- Stats blocks
- Saved addresses
- Payment methods
- Legal/help links
- Account actions (edit, logout, delete flow)

Interactions
- Edit profile modal
- Address/payment management actions
- Logout / account deletion flow with OTP patterns

### 2.2 Mobile App Seller Flow

#### OnboardingScreen
File: mobile/src/screens/seller/OnboardingScreen.js

Layout
- Three required document upload cards
  - ID Proof
  - Location Proof
  - Making Proof
- Submit CTA
- Status banner for pending/approved/rejected

Interactions
- Pick/replace files
- Submit verification packet

State rules
- Re-upload blocked while pending
- Resubmission enabled when rejected

#### DashboardScreen
File: mobile/src/screens/seller/DashboardScreen.js

Layout
- Verification status hero/banner
- KPI cards (orders, revenue, products, trust)
- Quick action tiles
- Recent activity widgets

Interactions
- Deep links to onboarding, orders, products, insights
- State-aware banner actions based on verification status

#### OrdersScreen and SellerOrderDetailScreen
Files:
- mobile/src/screens/seller/OrdersScreen.js
- mobile/src/screens/seller/SellerOrderDetailScreen.js

Layout
- Order list with filters and status chips
- Detail view with buyer/product/payment proof context
- Action zones for accept/reject and progression

Interactions
- Accept/reject pending orders
- Review payment proofs when submitted
- Progress shipment lifecycle with role-specific permissions

#### ProductUploadScreen
File: mobile/src/screens/seller/ProductUploadScreen.js

Layout
- Form fields for name, description, price, origin
- Multi-image picker (thumbnail preview + remove)
- Submit button

Interactions
- Add/replace/remove selected images
- Submit as create or edit mode

Validation
- Requires required fields + image set
- Alerts for missing fields or backend constraints

#### SellerComplianceScreen and SellerComplianceUploadScreen
Files:
- mobile/src/screens/seller/SellerComplianceScreen.js
- mobile/src/screens/seller/SellerComplianceUploadScreen.js

Layout
- GST + Business License status blocks
- Upload controls based on document state
- Rejection reason visibility for failed docs

Interactions
- Upload specific doc types
- Track under review, verified, rejected status lifecycle

#### SellerProfileScreen
File: mobile/src/screens/seller/SellerProfileScreen.js

Layout
- Store profile header + trust metrics
- Editable business info and payment settings
- Links to compliance/security/public preview utilities

Interactions
- Save profile updates
- Manage UPI data
- Navigate to secondary seller operations screens

### 2.3 Admin Dashboard Pages

#### Login
File: admin/src/pages/Login.jsx

Layout
- Centered auth card
- Email + password inputs
- Login CTA
- Inline error area

Interactions
- Submit credentials
- Token persistence in localStorage
- Redirect to dashboard shell

#### Sellers
File: admin/src/pages/Sellers.jsx

Layout
- Verification queue with filter tabs
- Seller cards/rows with document readiness indicators
- Detail modal for document review and final decision

Interactions
- Approve/reject seller onboarding
- Add rejection reasons/admin comments
- Refresh and filter queue

#### Refunds
File: admin/src/pages/Refunds.jsx

Layout
- Dispute list with status filters
- Detail modal for buyer and seller evidence
- Decision controls

Interactions
- Review unboxing evidence
- Approve/reject refunds
- Record admin reason/comments

#### PaymentVerifications
File: admin/src/pages/PaymentVerifications.jsx

Layout
- UPI proof queue with status controls
- Proof preview links and transaction context

Interactions
- Verify or reject payment proof submissions
- Queue filtering and refresh

#### ComplianceVerifications
File: admin/src/pages/ComplianceVerifications.jsx

Layout
- Seller compliance queue
- Seller identity block (name/email/phone/location/joined/trust)
- GST and Business License cards per seller
- Status pills and approval/rejection actions per doc type

Interactions
- Open/preview submitted docs
- Approve/reject each doc type independently
- Refresh queue and filter by readiness/status

### 2.4 Landing Site Components

Files under roots-landing/src/components
- Navbar.jsx
- Hero.jsx
- StatsBar.jsx
- HowItWorks.jsx
- ProductShowcase.jsx
- SellerSpotlight.jsx
- TrustAndTech.jsx
- Testimonials.jsx
- CTABanner.jsx
- Footer.jsx

UX characteristics
- Premium editorial aesthetic with warm palette
- Strong typography contrast and storytelling sections
- Motion-led reveals and staggered transitions
- Responsive desktop-first storytelling translated to mobile stack

## 3. COMPONENT LIBRARY & DESIGN LANGUAGE

### 3.1 Mobile Design Language

Primary primitives
- Button, Card, Badge, CustomAlert, ScreenHeader, AnimatedWrapper, AppText

Visual style
- Rounded corners, light shadows, high legibility text
- Blue-led action color family
- Icon-driven microcopy and state signaling

Motion
- Spring and fade patterns for entry and touch feedback
- Simple, meaningful transitions over decorative motion

### 3.2 Admin Visual Language

- Practical enterprise UI with inline style objects
- Clear status coding (success, warning, rejected)
- Sidebar navigation + content workspace pattern
- Emphasis on queue triage and decision workflows

### 3.3 Landing Visual Language

- Brand-forward warm palette and serif/sans pairing
- Animated hero composition and section transitions
- Strong visual hierarchy and CTA funneling

## 4. FORM UX, VALIDATION, AND FEEDBACK

Common patterns across app surfaces
- Mostly submit-time validation (not heavy inline validation)
- Alert/banner-first feedback for errors/success
- Loading spinners and disabled actions during submits
- File upload flows rely on explicit picker + confirmation

Key forms
- Auth forms (login/register/OTP)
- Product creation/edit forms
- Verification/compliance upload forms
- Refund request forms
- Admin decision forms with optional comments and rejection reasons

Feedback semantics
- Success: affirmative message + flow progression (refresh, close modal, navigate)
- Error: human-readable fallback message from API or default text
- Loading: button text changes and activity indicators

## 5. EMPTY, LOADING, AND ERROR STATES

Loading
- Full-page spinner for initial fetch-heavy screens
- Section spinner for partial widgets (suggested products, tabs)

Empty
- Purposeful empty copy per domain:
  - No orders
  - No refunds
  - No submissions in filter
  - No reviews yet

Error
- Mobile: alert modals
- Admin: inline banners plus refresh affordance
- Network fallback text used where backend message absent

## 6. ACCESSIBILITY OBSERVATIONS

Implemented positives
- Safe area handling in mobile app
- Text truncation and layout containment in high-density cards
- Semantic controls on web pages (buttons/forms)

Gaps/opportunities
- Icon-only actions often lack explicit accessibility labels
- Admin modal focus management can be strengthened
- Motion-heavy landing sections would benefit from stricter reduced-motion alternatives

## 7. END-TO-END UX JOURNEYS

### Buyer journey
1. Discover product through home/trending/place flow
2. Inspect product and seller trust
3. Purchase via cart/checkout and UPI proof process
4. Track order lifecycle
5. Submit refund request if needed after delivery
6. Submit product review only after delivered purchase

### Seller journey
1. Complete onboarding verification upload
2. Wait for review decision
3. Complete compliance docs (GST/license)
4. Configure profile and payout readiness
5. Upload products when compliance allows
6. Process and fulfill incoming orders
7. Monitor trust and performance indicators

### Admin journey
1. Login to review queues
2. Process seller onboarding verifications
3. Process compliance verifications
4. Verify UPI payment proofs
5. Resolve refund disputes with evidence review

## 8. UX INCONSISTENCIES & FRICTION POINTS

Cross-surface
- Design system is partially shared conceptually but not centralized as tokens/components across all apps
- Validation relies heavily on submit-time alerts rather than inline guidance
- Notification feedback loops across roles can be improved

Mobile-specific
- Some flows depend on multi-step external app handoff (UPI), increasing context loss risk
- Address/payment management can be streamlined for checkout speed

Admin-specific
- Inline style approach increases maintenance overhead and responsive complexity
- Batch operations and audit views are limited for high-throughput moderation

Landing-specific
- Motion richness is strong but can be heavy on low-end devices without adaptive reduction

## 9. RESPONSIVE BEHAVIOR SUMMARY

Mobile app
- Native responsive behavior via flex layouts and SafeArea usage
- Card-based modules adapt to screen width and content length

Admin app
- Desktop-oriented workspace with usable but limited small-screen ergonomics
- Filter rows and dense cards can crowd on narrow widths

Landing app
- Tailwind breakpoint-based adaptation from multi-column desktop to stacked mobile sections
- Navigation collapses into mobile menu

## 10. FILE REFERENCE MAP

Mobile key paths
- mobile/src/navigation/AppNavigator.js
- mobile/src/context/AuthContext.js
- mobile/src/context/CartContext.js
- mobile/src/context/AlertContext.js
- mobile/src/context/WishlistContext.js
- mobile/src/screens/buyer
- mobile/src/screens/seller
- mobile/src/components

Admin key paths
- admin/src/App.jsx
- admin/src/pages/Login.jsx
- admin/src/pages/Sellers.jsx
- admin/src/pages/Refunds.jsx
- admin/src/pages/PaymentVerifications.jsx
- admin/src/pages/ComplianceVerifications.jsx
- admin/src/config/api.js

Landing key paths
- roots-landing/src/App.jsx
- roots-landing/src/components
- roots-landing/src/animations.js
- roots-landing/src/data.js
- roots-landing/tailwind.config.js

## 11. RECOMMENDED NEXT UX DOCUMENT ADDITIONS

For an even deeper design dossier, extend this file with:
- Annotated screen wireframes linked per route
- Interaction timing specs per animation group
- Full copywriting inventory (all user-facing strings)
- Accessibility conformance checklist (WCAG mapping)
- Usability heuristics and role-based test scripts
