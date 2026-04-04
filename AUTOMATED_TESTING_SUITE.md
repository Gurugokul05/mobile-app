# 🧪 COMPREHENSIVE FEATURE TESTING GUIDE - Roots App

## ✅ Pre-Testing Checklist

Before starting tests, verify:

- [ ] Backend running on http://localhost:5000
- [ ] Mobile app running on Expo
- [ ] MongoDB connection working
- [ ] Port 5000 is available

---

## 🔥 **PHASE 1: BACKEND VERIFICATION (Must Pass)**

### Test 1.1: Backend Health Check

```bash
# Expected: Server running message in console
curl http://localhost:5000
# Should return: "Roots API is running..."
```

**Status:** ✅ / ❌

### Test 1.2: Database Connection

```bash
# Check backend console for:
"MongoDB Connected: [host]"
"Starting database seeding..."
"✅ Created 6 sellers"
"✅ Created 18 products"
```

**Status:** ✅ / ❌

### Test 1.3: Test Accounts Created

```bash
# Backend should log:
"✅ Created 3 demo users"
"📝 Test Credentials:"
"Buyer: buyer1@email.com / password123"
"Seller: seller1@kashmir.com / password123"
"Admin: admin@admin.com / password123"
```

**Status:** ✅ / ❌

---

## 🔐 **PHASE 2: AUTHENTICATION TESTS**

### Test 2.1: Login as Buyer

**Steps:**

1. Open mobile app
2. Go to Login screen
3. Enter: `buyer1@email.com` / `password123`
4. Tap "Sign In"

**Expected:**

- ✅ No error message
- ✅ Redirected to BuyerHome screen
- ✅ Products visible
- ✅ Can see "Roots" header

**Status:** ✅ / ❌

**Failure Symptoms:**

- ❌ "Invalid email or password" → Check if seeding ran
- ❌ "Network error" → Backend not running
- ❌ "Token failed" → Auth middleware issue

---

### Test 2.2: Login as Seller

**Steps:**

1. Go back to Login screen
2. Enter: `seller1@kashmir.com` / `password123`
3. Tap "Sign In"

**Expected:**

- ✅ Redirected to SellerDashboard
- ✅ Stats card showing "95%" (trust score)
- ✅ "Add New Product" button visible

**Status:** ✅ / ❌

---

### Test 2.3: Login as Admin

**Steps:**

1. Go back to Login screen
2. Enter: `admin@admin.com` / `password123`
3. Tap "Sign In"

**Expected:**

- ✅ Redirected to Admin Dashboard
- ✅ Can see admin options

**Status:** ✅ / ❌

---

### Test 2.4: Invalid Login

**Steps:**

1. Enter wrong credentials: `test@test.com` / `wrongpassword`
2. Tap "Sign In"

**Expected:**

- ✅ Error message: "Invalid email or password"
- ✅ Stay on login screen

**Status:** ✅ / ❌

---

## 🛍️ **PHASE 3: BUYER FEATURES**

### Test 3.1: Browse Home Screen

**Steps:**

1. Login as buyer (buyer1@email.com)
2. Observe Home tab

**Expected:**

- ✅ "Roots" title visible
- ✅ "Explore by Place" section
- ✅ Place cards: Kashmir, Rajasthan, Kerala, etc. (5+ regions)
- ✅ "Authentic Finds" section
- ✅ 18+ product cards showing

**Products Should Include:**

- ✅ Pashmina Shawl (Kashmir, ₹12,500)
- ✅ Blue Pottery Vase (Rajasthan, ₹2,200)
- ✅ Premium First Flush Tea (Darjeeling, ₹1,850)
- ✅ Kerala Spices Gift Box (Kerala, ₹1,950)
- ✅ Sandalwood Idol (Mysore, ₹5,500)
- ✅ Kanchipuram Silk Saree (Tamil Nadu, ₹18,000)

**Status:** ✅ / ❌

**Failure Symptoms:**

- ❌ "No products" → Database not seeded
- ❌ Products but no images → API errors
- ❌ Wrong product names → Seeding data issue

---

### Test 3.2: View Product Details

**Steps:**

1. Tap on any product (e.g., Pashmina Shawl)
2. View Product Screen

**Expected:**

- ✅ Large product image
- ✅ Product name: "Authentic Pashmina Shawl"
- ✅ Price: "₹12,500"
- ✅ Origin: "From Kashmir"
- ✅ Seller card showing: "Kashmir Crafts"
- ✅ Trust Score: "95%"
- ✅ "✓ VERIFIED" badge visible
- ✅ Description visible
- ✅ "Add to Cart" button
- ✅ "Buy Now" button

**Status:** ✅ / ❌

---

### Test 3.3: **BUY BUTTON TEST** (CRITICAL!)

**Steps:**

1. Still on Product Screen (e.g., Pashmina Shawl)
2. Tap "Buy Now" button

**Expected:**

- ✅ Navigate to Checkout screen
- ✅ Product details pre-filled
- ✅ See order summary with price

**Status:** ✅ / ❌

**Failure Symptoms:**

- ❌ App crashes → Code error
- ❌ Button doesn't respond → Navigation issue
- ❌ "Not authorized" error → Auth token problem

---

### Test 3.4: Checkout Process

**Steps:**

1. On Checkout screen, scroll down
2. Enter in "Full Street Address": `123 Main Street`
3. Enter in "City": `Delhi`
4. Tap "Pay ₹12,500" button

**Expected (Before Payment):**

- ✅ Address field accepts text
- ✅ City field accepts text
- ✅ Pay button shows correct amount
- ✅ Order summary visible

**Expected (On Payment):**

- ✅ Loading spinner appears
- ✅ No error message
- ✅ After 2-3 seconds: Success message
- ✅ Message: "Payment successful! Order placed."
- ✅ "Confirm" button appears

**Status:** ✅ / ❌

**Failure Symptoms:**

- ❌ "Checkout Failed" → API error
- ❌ "Not authorized, token failed" → Auth middleware bug
- ❌ "Product not found" → Database/API issue
- ❌ Spinner spins forever → Backend hanging

---

### Test 3.5: View Order in History

**Steps:**

1. Tap "Confirm" on success message
2. Should navigate to BuyerHome
3. Tap "Orders" tab at bottom

**Expected:**

- ✅ See order you just created
- ✅ Product name: "Pashmina Shawl"
- ✅ Status badge showing current status
- ✅ Order timestamp visible

**Status:** ✅ / ❌

---

### Test 3.6: Order Tracking

**Steps:**

1. On Orders screen, tap the order card

**Expected:**

- ✅ See full order details
- ✅ Timeline showing status progression
- ✅ Shipping address visible
- ✅ Amount: ₹12,500

**Status:** ✅ / ❌

---

### Test 3.7: Add to Cart

**Steps:**

1. Go back to Home
2. Tap any product
3. Tap "Add to Cart" button

**Expected:**

- ✅ Success message: "Added to cart!"
- ✅ Cart count updates

**Status:** ✅ / ❌

---

### Test 3.8: Shopping Cart

**Steps:**

1. Add 2-3 products to cart
2. Tap "Cart" icon/tab

**Expected:**

- ✅ All items visible
- ✅ Individual item prices
- ✅ Total calculated correctly
- ✅ Remove button (trash icon) works
- ✅ "Proceed to Checkout" button visible

**Status:** ✅ / ❌

---

### Test 3.9: Browse by Place

**Steps:**

1. On Home screen, find "Explore by Place" section
2. Tap "Kashmir" card

**Expected:**

- ✅ Navigate to PlaceScreen
- ✅ Title: "Kashmir"
- ✅ Only Kashmir products shown (Pashmina, Carpet, Papier Mâché)
- ✅ Less than 18 products (only from that region)

**Status:** ✅ / ❌

---

### Test 3.10: User Profile

**Steps:**

1. Tap "Profile" tab
2. View profile screen

**Expected:**

- ✅ User name visible: "John Doe"
- ✅ Email visible: "buyer1@email.com"
- ✅ Profile stats/cards visible
- ✅ Recent orders section

**Status:** ✅ / ❌

---

### Test 3.11: Request Refund

**Steps:**

1. Go to Refunds tab
2. Look for "No eligible orders" or list of delivered orders
3. If orders exist: Tap "Request Refund" on any delivered order
4. Enter reason: "Product quality not as expected"
5. Tap "Submit Request"

**Expected:**

- ✅ Modal opens with order info
- ✅ Text area accepts reason
- ✅ Submit button works
- ✅ Success message appears

**Status:** ✅ / ❌

---

## 🏪 **PHASE 4: SELLER FEATURES**

### Test 4.1: Seller Dashboard

**Steps:**

1. Login as seller: `seller1@kashmir.com` / `password123`
2. View Dashboard

**Expected:**

- ✅ Title: "Dashboard"
- ✅ Trust Score: 95%
- ✅ "Add New Product" button
- ✅ "Manage Orders & Packing" button
- ✅ Logout button

**Status:** ✅ / ❌

---

### Test 4.2: Upload Product

**Steps:**

1. Tap "Add New Product"
2. Fill in form:
   - Name: "Test Product"
   - Description: "Amazing handcrafted item"
   - Price: "5000"
   - Origin: "Kashmir"
3. Add 1-2 images (tap image picker)
4. Submit

**Expected:**

- ✅ Image picker opens (gallery or camera)
- ✅ Can select images
- ✅ Form accepts all inputs
- ✅ Submit button works
- ✅ Success message

**Status:** ✅ / ❌

---

### Test 4.3: Seller Onboarding

**Steps:**

1. If seller not verified (rare), tap "Complete Onboarding"
2. Upload verification documents

**Expected:**

- ✅ Document upload form appears
- ✅ Can take/select photos
- ✅ Submit button works

**Status:** ✅ / ❌

---

## 👨‍💼 **PHASE 5: ERROR HANDLING**

### Test 5.1: Network Error Handling

**Steps:**

1. Turn off internet connection (or use offline mode)
2. Try to load products on Home screen

**Expected:**

- ✅ Error message appears (not crash)
- ✅ Fall back to mock data OR show error gracefully

**Status:** ✅ / ❌

---

### Test 5.2: Invalid Address Checkout

**Steps:**

1. Go to product → Buy Now
2. Don't fill address
3. Tap "Pay" button

**Expected:**

- ✅ Error message: "Please enter full shipping address"
- ✅ Stay on checkout screen

**Status:** ✅ / ❌

---

### Test 5.3: Empty Cart Checkout

**Steps:**

1. Clear all cart items
2. Try to checkout

**Expected:**

- ✅ Error message: "Empty Cart" or "Please add items first"

**Status:** ✅ / ❌

---

## 📊 **PHASE 6: DATA VALIDATION**

### Test 6.1: Product Prices

**Steps:**

1. Check each product price in HomeScreen

**Expected Product Prices:**

- ✅ Pashmina Shawl: 12500
- ✅ Jaipuri Blue Pottery: 2200
- ✅ Premium First Flush Tea: 1850
- ✅ Kerala Spices: 1950
- ✅ Sandalwood Idol: 5500
- ✅ Kanchipuram Silk: 18000

**Status:** ✅ / ❌

---

### Test 6.2: Seller Information

**Steps:**

1. Open any product
2. Check seller card

**Expected:**

- ✅ Seller name visible (e.g., "Kashmir Crafts")
- ✅ Trust score visible (e.g., "95%")
- ✅ Verified badge shows (if verified ✓)

**Status:** ✅ / ❌

---

### Test 6.3: Order Data Persistence

**Steps:**

1. Create an order
2. Go to Orders tab
3. Go back to Home and then Orders again
4. Order should still be there

**Expected:**

- ✅ Order data persists
- ✅ Same order visible after navigation

**Status:** ✅ / ❌

---

## 🎨 **PHASE 7: UI/UX VERIFICATION**

### Test 7.1: Navigation

**Steps:**

1. Check bottom tab navigation

**Expected Tabs:**

- ✅ Home
- ✅ Orders
- ✅ Refunds (or similar)
- ✅ Profile

**Status:** ✅ / ❌

---

### Test 7.2: Images Loading

**Steps:**

1. Home screen should load product images
2. Product screen should show large image

**Expected:**

- ✅ All images load (no broken images)
- ✅ Images from Unsplash CDN work
- ✅ No placeholder "broken image" icons

**Status:** ✅ / ❌

---

### Test 7.3: Button Responsiveness

**Steps:**

1. Tap various buttons throughout app

**Expected:**

- ✅ All buttons respond immediately
- ✅ Visual feedback on tap
- ✅ No lag or delay

**Status:** ✅ / ❌

---

## 📈 **PERFORMANCE TESTS**

### Test 8.1: Load Time - Home Screen

Time to fully load products:

- ✅ **Target:** < 2 seconds

**Actual Time:** **\_\_** seconds

---

### Test 8.2: Checkout Performance

Time from clicking "Buy Now" to reaching checkout:

- ✅ **Target:** < 1 second

**Actual Time:** **\_\_** seconds

---

### Test 8.3: Payment Processing

Time from clicking "Pay" to success message:

- ✅ **Target:** < 3 seconds (mock)

**Actual Time:** **\_\_** seconds

---

## ✅ **FINAL TEST SUMMARY**

### Total Tests: 48

### Passed: **\_** / 48

### Failed: **\_** / 48

### Success Rate: **\_**%

---

## 🎯 **Critical Features** (Must Pass)

These features MUST work for app to be functional:

- [ ] **Login** - Test 2.1
- [ ] **Database Seeding** - Test 1.2
- [ ] **Product Display** - Test 3.1
- [ ] **Buy Button** - Test 3.3 ⭐
- [ ] **Checkout** - Test 3.4 ⭐
- [ ] **Order Creation** - Test 3.5 ⭐
- [ ] **Error Handling** - Test 5.x

---

## 🐛 **Issues Found**

### Issue 1:

**Feature:** ******\_******  
**Expected:** ******\_******  
**Actual:** ******\_******  
**Impact:** 🔴 Critical / 🟡 Medium / 🟢 Low

### Issue 2:

**Feature:** ******\_******  
**Expected:** ******\_******  
**Actual:** ******\_******  
**Impact:** 🔴 Critical / 🟡 Medium / 🟢 Low

---

## 📝 **Overall Assessment**

**Status:** ✅ All Features Working / ⚠️ Some Issues Found / ❌ Critical Issues

**Comments:**

---

---

---

---

## 👤 Tested By: ******\_\_\_******

## 📅 Date: ******\_\_\_******

## ⏰ Time: ******\_\_\_******

---

**Use this checklist to verify each feature step-by-step!**
