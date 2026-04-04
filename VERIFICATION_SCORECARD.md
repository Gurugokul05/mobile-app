# 📋 QUICK VERIFICATION SCORECARD

Use this to quickly verify all features work.

---

## 🔥 CRITICAL FEATURES (MUST WORK)

### 1. Backend Server

- [ ] **Port 5000 responds**
  - Test: `curl http://localhost:5000`
  - Expected: "Roots API is running..."
  - **Status:** ✅ / ❌

- [ ] **Database Seeding**
  - Expected in console: "✅ Created 18 products"
  - **Status:** ✅ / ❌

### 2. Authentication

- [ ] **Login Works**
  - Account: `buyer1@email.com` / `password123`
  - Expected: Redirects to Home
  - **Status:** ✅ / ❌

- [ ] **Token Validation**
  - Buy button doesn't throw auth error
  - **Status:** ✅ / ❌

### 3. Products Display

- [ ] **18 Products Show**
  - Home screen displays all products
  - **Status:** ✅ / ❌

- [ ] **Product Details Work**
  - Click product → Shows full info
  - Seller name, trust score, verified badge
  - **Status:** ✅ / ❌

### 4. Buy Button

- [ ] **"Buy Now" Clickable**
  - Button responds to tap
  - No crash
  - **Status:** ✅ / ❌

- [ ] **Navigates to Checkout**
  - Shows address form
  - Shows price
  - **Status:** ✅ / ❌

### 5. Checkout

- [ ] **Address Form Works**
  - Can enter street and city
  - No errors
  - **Status:** ✅ / ❌

- [ ] **Payment Processes**
  - Click "Pay ₹XXXX"
  - Loading appears
  - Success message in < 3 seconds
  - **Status:** ✅ / ❌

### 6. Order Creation

- [ ] **Order Created Successfully**
  - Success message appears
  - "Payment successful! Order placed."
  - **Status:** ✅ / ❌

- [ ] **Order in Database**
  - Go to Orders tab
  - Your order appears
  - **Status:** ✅ / ❌

---

## ✨ STANDARD FEATURES (SHOULD WORK)

### 7. Seller Features

- [ ] **Seller Can Login**
  - Account: `seller1@kashmir.com` / `password123`
  - **Status:** ✅ / ❌

- [ ] **Seller Dashboard Shows Stats**
  - Trust score: 95%
  - **Status:** ✅ / ❌

- [ ] **Seller Can Upload Product**
  - Form accepts input
  - Submit works
  - **Status:** ✅ / ❌

### 8. Refund System

- [ ] **Refund Screen Shows**
  - List of eligible orders
  - Request refund button
  - **Status:** ✅ / ❌

- [ ] **Refund Request Works**
  - Modal opens
  - Can enter reason
  - Submit button works
  - **Status:** ✅ / ❌

### 9. Shopping Cart

- [ ] **Add to Cart Works**
  - Success message appears
  - **Status:** ✅ / ❌

- [ ] **Multiple Items in Cart**
  - Can add 3+ items
  - Total calculates correctly
  - **Status:** ✅ / ❌

### 10. Filter by Place

- [ ] **Place Cards Visible**
  - 5+ region cards show
  - **Status:** ✅ / ❌

- [ ] **Filtering Works**
  - Click place → Shows only that region's products
  - **Status:** ✅ / ❌

### 11. User Profile

- [ ] **Profile Shows User Info**
  - Name: "John Doe"
  - Email: "buyer1@email.com"
  - **Status:** ✅ / ❌

- [ ] **Order History Visible**
  - Recent orders show
  - Can tap to view details
  - **Status:** ✅ / ❌

### 12. Order Tracking

- [ ] **Order Timeline Shows**
  - Status progression visible
  - Ordered → Packed → Shipped → Delivered
  - **Status:** ✅ / ❌

- [ ] **Shipping Address Shows**
  - "123 Main Street, Delhi" visible
  - **Status:** ✅ / ❌

---

## 🎯 ERROR HANDLING (SHOULD WORK)

### 13. Invalid Login

- [ ] **Shows Error Message**
  - "Invalid email or password"
  - Stays on login screen
  - **Status:** ✅ / ❌

### 14. Empty Address Checkout

- [ ] **Shows Validation Error**
  - "Please enter full shipping address"
  - Doesn't submit
  - **Status:** ✅ / ❌

### 15. Network Errors

- [ ] **Handles Gracefully**
  - Shows error message
  - No crash
  - **Status:** ✅ / ❌

### 16. Missing Data

- [ ] **No Product Details Shows Error**
  - Doesn't crash
  - Shows message
  - **Status:** ✅ / ❌

---

## 📊 SCORE CALCULATION

### Critical Features

- Count all ✅ in sections 1-6
- **Critical Passed:** **\_** / 15
- **Required:** 15/15 ✅

### Standard Features

- Count all ✅ in sections 7-12
- **Standard Passed:** **\_** / 16
- **Target:** 16/16 ✅

### Error Handling

- Count all ✅ in section 13-16
- **Error Passed:** **\_** / 4
- **Target:** 4/4 ✅

---

## 🎯 OVERALL STATUS

```
If ALL 35 features pass (100%):
✅ APP IS READY FOR PRODUCTION

If 30-34 features pass (85-97%):
⚠️ MINOR ISSUES - Review failures

If 25-29 features pass (71-84%):
🟡 MODERATE ISSUES - Fix before deploy

If < 25 features pass (< 71%):
🔴 CRITICAL ISSUES - Fix immediately
```

### Your Score:

****\_** / 35 features working**

**Success Rate: **\_**%**

---

## 🔴 FAILURES FOUND

### Failure 1:

- Feature: ******\_\_\_******
- Expected: ******\_\_\_******
- Got: ******\_\_\_******
- Severity: 🔴 Critical / 🟡 Medium / 🟢 Low

### Failure 2:

- Feature: ******\_\_\_******
- Expected: ******\_\_\_******
- Got: ******\_\_\_******
- Severity: 🔴 Critical / 🟡 Medium / 🟢 Low

### Failure 3:

- Feature: ******\_\_\_******
- Expected: ******\_\_\_******
- Got: ******\_\_\_******
- Severity: 🔴 Critical / 🟡 Medium / 🟢 Low

---

## ✅ SIGN-OFF

**Tested By:** ******\_\_\_******  
**Date:** ******\_\_\_******  
**Time:** ******\_\_\_******

**Overall Status:**

- [ ] ✅ All features working - READY
- [ ] ⚠️ Some issues found - Review needed
- [ ] 🔴 Critical issues - Fix needed

**Comments:**

---

---

---

---

## 💡 QUICK REFERENCE

**If Buy Button fails:**

1. Check backend console for seeding errors
2. Verify MongoDB connection
3. Check auth middleware in backend
4. Restart backend with `npm start`

**If products don't show:**

1. Verify database seeded (check console)
2. Check API: `curl http://localhost:5000/api/products`
3. Restart backend

**If payment doesn't work:**

1. Check address fields are filled
2. Look at backend console for API errors
3. Check network requests in Expo console

**If order doesn't appear:**

1. Check if payment was successful
2. Verify order in backend console
3. Refresh Orders tab

---

**Use this scorecard to verify the app quickly!**
