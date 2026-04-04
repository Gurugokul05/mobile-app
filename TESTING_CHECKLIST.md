# ✅ COMPREHENSIVE TESTING CHECKLIST - Roots App

Use this checklist to verify all features are working correctly.

---

## 🔐 Authentication Tests

### Login/Register

- [ ] **Login as Buyer**
  - Email: buyer1@email.com
  - Password: password123
  - Expected: Redirected to BuyerHome
- [ ] **Login as Seller**
  - Email: seller1@kashmir.com
  - Password: password123
  - Expected: Redirected to SellerDashboard
- [ ] **Login as Admin**
  - Email: admin@admin.com
  - Password: password123
  - Expected: Redirected to Admin Dashboard

- [ ] **Register New Account**
  - Fill details and create account
  - Expected: Account created and auto-logged in

- [ ] **Logout**
  - Click logout button
  - Expected: Returned to LoginScreen

---

## 🏠 Buyer Features

### Home Screen

- [ ] **Load Products**
  - Expected: 18+ products displayed
  - Check: All have images, names, prices
- [ ] **Browse by Place**
  - Expected: Place cards scrollable
  - Tap place: Filters products by region
- [ ] **Verified Badge**
  - Expected: Some products show "Verified"
  - Check: Sellers have trust scores

### Product Details

- [ ] **View Product Info**
  - Expected: Image, name, price, description
  - Check: Seller name and trust score shown
- [ ] **See Verified Badges**
  - Expected: Shows if seller is verified
  - Check: Only verified items tagged

### Shopping Cart

- [ ] **Add to Cart**
  - Expected: Success message shows
  - Check: Item added to cart count
- [ ] **Remove from Cart**
  - Expected: Item removed with icon
  - Check: Cart total recalculates
- [ ] **Cart Total**
  - Expected: Correct sum displayed
  - Check: Quantity multiplied correctly

### 🛍️ **BUY BUTTON TEST (MAIN)**

- [ ] **Buy Now (Direct)**
  - Product Screen → "Buy Now"
  - Expected: Redirects to Checkout with product
- [ ] **Buy from Cart**
  - Add multiple items → Go to Cart
  - Expected: All items in checkout
- [ ] **Checkout Flow**
  - Enter street address
  - Enter city name
  - Expected: Order summary shows
- [ ] **Mock Payment**
  - Click "Pay ₹XXXX"
  - Expected: Loading spinner → Success
- [ ] **Success Message**
  - Expected: "Payment successful" alert
  - Can navigate to Orders

### Order Tracking

- [ ] **View My Orders**
  - Orders tab → See all purchases
  - Expected: Order cards with status
- [ ] **Order Status Timeline**
  - Expected: Status progression shown (Ordered → Delivered)
  - Check: Timeline visual is correct
- [ ] **Order Details**
  - Tap order card
  - Expected: Full order information displays

### Profile Management

- [ ] **View Profile**
  - Profile screen → See user info
  - Expected: Name, email, stats displayed
- [ ] **Edit Name**
  - Tap edit → Change name
  - Expected: Profile updated
- [ ] **Saved Addresses**
  - Expected: Address list shown
  - Can add/edit/delete addresses

### Refund System

- [ ] **View Eligible Orders**
  - Refund screen → See delivered orders
  - Expected: Only "Delivered" orders shown
- [ ] **Request Refund**
  - Tap order → Enter reason
  - Expected: Modal opens, form editable
- [ ] **Refund Submission**
  - Submit refund request
  - Expected: Success message, order list updates
- [ ] **Refund Policy Info**
  - Expected: Policy displayed in info card
  - Check: All points shown

---

## 🏪 Seller Features

### Dashboard

- [ ] **View Stats**
  - Dashboard screen
  - Expected: Trust score, order count shown
- [ ] **Verification Status**
  - If not verified: Show verification needed
  - If verified: Show stats and actions
- [ ] **Navigation**
  - Expected: Upload product, manage orders buttons

### Product Upload

- [ ] **Upload Form**
  - Fill product details
  - Expected: All fields editable
- [ ] **Add Images**
  - Gallery or camera
  - Expected: Images preview, max 5
- [ ] **Create Product**
  - Submit form
  - Expected: Success message, product listed

### Seller Orders

- [ ] **View Orders**
  - Seller received orders
  - Expected: Shows buyer info, status
- [ ] **Upload Packing Proof**
  - Take photo of packed item
  - Expected: Photo uploaded, status updated

### Seller Onboarding

- [ ] **Verification Documents**
  - Upload ID, location, making proof
  - Expected: Forms accept documents
- [ ] **Submit for Approval**
  - Complete onboarding
  - Expected: Status shows "Pending Verification"

---

## 👨‍💼 Admin Features

### Dashboard

- [ ] **View Statistics**
  - Expected: Overall sales, users, refunds
- [ ] **Pending Verifications**
  - Expected: List of sellers awaiting approval
- [ ] **Approve Sellers**
  - Tap seller → approve
  - Expected: Status updates to verified

### Refund Management

- [ ] **View Refund Requests**
  - Expected: List of all refunds with status
- [ ] **Review Details**
  - Expected: Buyer info, reason, video proof link
- [ ] **Approve/Reject**
  - Make decision with reason
  - Expected: Status updates, buyer notified

### Seller Verification

- [ ] **Review Documents**
  - Expected: ID, location, making proof displayed
- [ ] **Approve/Reject**
  - Decision with feedback
  - Expected: Seller status updated

---

## 🔄 Integration Tests

### Login → Buy Flow

- [ ] **Complete End-to-End**
  - 1. Login as buyer
  - 2. Browse home
  - 3. View product
  - 4. Buy now
  - 5. Enter address
  - 6. Complete payment
  - 7. See order
  - Expected: All steps work seamlessly

### Multi-User Scenario

- [ ] **Seller Creates Product**
  - Seller logs in
  - Uploads product
  - Expected: Visible in buyer's home
- [ ] **Buyer Purchases**
  - Buyer sees new product
  - Buys it
  - Expected: Seller sees order

### Error Handling

- [ ] **Invalid Login**
  - Wrong credentials
  - Expected: Error message shown
- [ ] **Missing Address**
  - Try checkout without address
  - Expected: Validation error
- [ ] **Network Error**
  - Simulate offline
  - Expected: Graceful error message

---

## 📊 Data Validation

### Product Data

- [ ] **All Products Have:**
  - [ ] Name
  - [ ] Price (numeric)
  - [ ] Images
  - [ ] Description
  - [ ] Seller info
  - [ ] Origin place

### User Data

- [ ] **Buyer Profile:**
  - [ ] Name
  - [ ] Email
  - [ ] Role (buyer)
  - [ ] Token stored

- [ ] **Seller Profile:**
  - [ ] Name
  - [ ] Email
  - [ ] Role (seller)
  - [ ] Trust score
  - [ ] Verified status

### Order Data

- [ ] **Order Contains:**
  - [ ] Buyer info
  - [ ] Product info
  - [ ] Price
  - [ ] Quantity
  - [ ] Shipping address
  - [ ] Status
  - [ ] Payment details

---

## ⚡ Performance Tests

### Load Times

- [ ] **Home Screen Load** < 2 seconds
- [ ] **Product List Render** < 1 second
- [ ] **Checkout Load** < 1 second
- [ ] **Order Tracking** < 2 seconds

### Responsiveness

- [ ] **Smooth Scrolling** - No jank
- [ ] **Button Taps** - Immediate response
- [ ] **Animations** - Fluid transitions
- [ ] **Image Loading** - Progressive

### Storage

- [ ] **Token Stored** - AsyncStorage working
- [ ] **Cart Persists** - Survives refresh
- [ ] **User Data** - Saved in storage

---

## 🎨 UI/UX Tests

### Layout

- [ ] **Proper Spacing** - No overlaps
- [ ] **Text Readable** - Good contrast
- [ ] **Images Centered** - Proper alignment
- [ ] **Safe Areas** - No keyboard overlap

### Colors

- [ ] **Primary Color** - Used consistently
- [ ] **Status Colors** - Green (success), Red (error)
- [ ] **Text Contrast** - WCAG compliant
- [ ] **Badges** - Clearly visible

### Navigation

- [ ] **Back Buttons** - Work correctly
- [ ] **Tab Navigation** - Smooth switching
- [ ] **Modal Close** - X button works
- [ ] **Deep Links** - Navigation works

---

## 🐛 Bug Reports Template

### If You Find a Bug:

```
**Title:** [Brief description]
**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [etc]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Device & OS:**
[Android/iOS, version]

**Screenshots:**
[Attach if helpful]
```

---

## 📈 Feature Completion Checklist

### Must Have ✅

- [x] Login/Register
- [x] Browse Products
- [x] **Buy Button** (FIXED)
- [x] Checkout
- [x] Order Tracking
- [x] Mock Data (18 products)
- [x] Authentication

### Should Have ✅

- [x] Product Details
- [x] Shopping Cart
- [x] User Profile
- [x] Sellers can upload
- [x] Refund Requests

### Nice to Have ✅

- [x] Search/Filter
- [x] Place-based browsing
- [x] Trust scores
- [x] Verification badges
- [x] Admin dashboard

---

## ✨ Final Validation

- [ ] No console errors when using app
- [ ] All buttons respond to taps
- [ ] All screens load under 3 seconds
- [ ] Can complete full purchase flow
- [ ] Order appears in history
- [ ] Can request refund
- [ ] Seller can upload products
- [ ] Admin can manage approvals

---

## 🎯 Sign-Off

**Tested By:** ******\_******  
**Date:** ******\_******  
**Status:** ✅ All tests passed / ⚠️ Some issues found

**Issues Found:**

- Issue 1: ******\_\_\_******
- Issue 2: ******\_\_\_******

---

## 📞 Support

If tests fail, check:

1. Backend running? (`npm start` in backend)
2. Mobile running? (`npm start` in mobile)
3. Network connected?
4. All dependencies installed?
5. Port 5000 available?

---

**Happy Testing! 🎉**
