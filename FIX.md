# FIX.md

## Objective

Implement seller-side UI revamp with tabs and insights, make buyer profile actions functional, fix seller photo upload issues, stabilize payment flow, and include newly reported runtime errors.

## Task Tracker

8. Screen top alignment, seller upload 500, image-picker deprecation, noisy product count (latest round)

- Status: Completed
- Implemented:
  - Increased top spacing across key buyer/seller screens so content no longer sits too close to the status area.
  - Replaced deprecated image-picker media type usage with compatibility-safe API usage.
  - Hardened product upload backend error handling and added clearer JSON responses for upload/cloudinary failures.
  - Improved upload client error parsing so alerts show readable messages (instead of [object Object]).
  - Deduplicated product list rendering in buyer home and clarified API product count logs as unique vs raw.
- Files:
  - mobile/src/screens/seller/ProductUploadScreen.js
  - mobile/src/screens/seller/OnboardingScreen.js
  - backend/src/controllers/productController.js
  - backend/server.js
  - mobile/src/screens/buyer/HomeScreen.js
  - mobile/src/screens/buyer/CartCheckoutScreen.js
  - mobile/src/screens/buyer/ProfileScreen.js
  - mobile/src/screens/buyer/OrderTrackingScreen.js
  - mobile/src/screens/buyer/RefundScreen.js
  - mobile/src/screens/seller/DashboardScreen.js
  - mobile/src/screens/seller/OrdersScreen.js
  - mobile/src/screens/seller/ProductsScreen.js
  - mobile/src/screens/seller/InsightsScreen.js
  - mobile/src/screens/seller/SellerProfileScreen.js

7. Logout, Orders alignment, Info content quality, Seller login reliability (latest round)

- Status: Completed
- Implemented:
  - Logout now resets navigation to Login from both buyer and seller profile flows.
  - Orders page alignment improved with cleaner timeline connectors and label layout.
  - Order total rendering corrected to use totalPrice with formatting fallback.
  - Privacy, Terms, and Help pages expanded with structured sections and polished card alignment.
  - Seller login robustness improved by normalizing email on both mobile and backend (trim + lowercase).
- Files:
  - mobile/src/screens/buyer/ProfileScreen.js
  - mobile/src/screens/seller/SellerProfileScreen.js
  - mobile/src/screens/buyer/OrderTrackingScreen.js
  - mobile/src/screens/buyer/InfoScreen.js
  - mobile/src/context/AuthContext.js
  - mobile/src/screens/RegisterScreen.js
  - backend/src/controllers/authController.js

1. Seller UI revamp with multiple tabs, business look, and insights

- Status: Completed
- Implemented:
  - Added seller tab navigation with Dashboard, Orders, Products, Insights, and Profile.
  - Reworked seller dashboard to use live stats and actionable business cards.
  - Added seller insights screen with KPI cards and revenue trend bars.
  - Removed dead seller actions by wiring Manage Orders and verification onboarding document upload buttons.
- Files:
  - mobile/src/navigation/AppNavigator.js
  - mobile/src/screens/seller/DashboardScreen.js
  - mobile/src/screens/seller/OnboardingScreen.js
  - mobile/src/screens/seller/OrdersScreen.js
  - mobile/src/screens/seller/ProductsScreen.js
  - mobile/src/screens/seller/InsightsScreen.js
  - mobile/src/screens/seller/SellerProfileScreen.js

2. Profile buttons not working on user side

- Status: Completed
- Implemented:
  - Wired Settings button.
  - Wired Privacy, Terms, Help.
  - Wired Payment Methods and Billing History.
  - Wired Add Address and address cards.
  - Implemented Delete Account flow.
  - Replaced static address mocks with API-backed addresses.
- Files:
  - mobile/src/screens/buyer/ProfileScreen.js
  - mobile/src/screens/buyer/AddressesScreen.js
  - mobile/src/screens/buyer/PaymentMethodsScreen.js
  - mobile/src/screens/buyer/BillingHistoryScreen.js
  - mobile/src/screens/buyer/InfoScreen.js
  - backend/src/controllers/authController.js
  - backend/src/routes/authRoutes.js
  - backend/src/models/User.js

3. Seller cannot upload photo

- Status: Completed
- Implemented:
  - Migrated from react-native-image-picker usage to expo-image-picker APIs.
  - Added media/camera permission guards.
  - Added backend guard for missing product images.
- Files:
  - mobile/src/screens/seller/ProductUploadScreen.js
  - mobile/package.json
  - backend/src/controllers/productController.js

4. Payment not working with Razorpay

- Status: Completed (test mode path)
- Implemented:
  - Added explicit RAZORPAY_TEST_MODE flow.
  - createOrder now returns paymentMode and uses mock order in test mode.
  - verifyPayment now accepts deterministic test-mode verification path.
  - Checkout screen now aligns verification payload with paymentMode and logs full 400 diagnostics.
- Files:
  - backend/src/controllers/orderController.js
  - backend/.env
  - mobile/src/screens/buyer/CartCheckoutScreen.js

5. New errors reported in runtime logs

- Status: Completed
- Errors addressed:
  - Checkout 400: handled by payment mode alignment and better backend/mobile contract.
  - Ionicons warning for bell-outline: replaced with notifications-outline.
  - launchImageLibrary/launchCamera null: replaced picker implementation with expo-image-picker.
- Files:
  - mobile/src/screens/buyer/CartCheckoutScreen.js
  - mobile/src/screens/buyer/ProfileScreen.js
  - mobile/src/screens/seller/ProductUploadScreen.js

6. API reliability and environment routing

- Status: Completed
- Implemented:
  - Added API URL environment override with platform fallback.
- Files:
  - mobile/src/api/config.js

## Important Notes

1. Payment mode is set to test mode now.

- backend/.env includes RAZORPAY_TEST_MODE=true.
- This stabilizes checkout immediately in development while keeping live-mode verification strict when switched off.

2. Cloudinary cloud name is still configured as Root.

- Confirm this matches your real Cloudinary cloud name; if not, uploads can still fail at cloud provider level.

3. After dependency change, install packages in mobile app.

- Run: npm install

## Verification Checklist

1. Seller login opens seller tabs.
2. Seller Dashboard shows live KPIs from /api/seller/me/stats.
3. Seller Products tab loads products and can navigate to upload.
4. Seller Orders tab loads incoming seller orders.
5. Seller Insights tab loads KPI and revenue trend bars.
6. Buyer Profile buttons all navigate or perform action.
7. Add/Delete address works from profile flow.
8. Add/Delete payment method works.
9. Delete account confirms and deletes user.
10. Product upload can open gallery/camera without null API errors.
11. Checkout no longer fails with the old 400 signature mismatch in test mode.
12. No bell-outline invalid icon warning in logs.

## Remaining Optional Upgrade

1. Real Razorpay SDK gateway flow on mobile.

- Current implementation intentionally stabilizes with test mode first.
- Next phase can add live Razorpay checkout SDK callback handling for production-grade flow.
