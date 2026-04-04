# 🚀 QUICK TESTING EXECUTION GUIDE

## ⏱️ TOTAL TIME: 15-20 minutes

Follow these exact steps to verify all features work.

---

## ✅ STEP 0: START SERVICES (2 min)

### Terminal 1: Start Backend

```bash
cd backend
npm start
```

**✅ Wait for these messages:**

```
✅ Created 6 sellers
✅ Created 18 products
✅ Created 3 demo users
MongoDB Connected: [host]
Server running on port 5000
```

**❌ If you see errors:**

- "Port 5000 in use" → Stop other services on port 5000
- "MongoDB connection failed" → Check .env MONGO_URI
- "Module not found" → Run `npm install` first

---

### Terminal 2: Start Mobile

```bash
cd mobile
npm start
```

**✅ Wait for:**

```
Expo server running
Ready to accept connections
```

**❌ If issues:**

- Press 'a' for Android or 'i' for iOS
- Make sure emulator/device is ready

---

## ✅ STEP 1: LOGIN TEST (2 min)

### Action 1.1: Open Mobile App

- Tap **Expo Go** on your device
- Scan QR code shown in terminal

**Expected:** Login screen appears ✅

---

### Action 1.2: Login as Buyer

1. **Email:** `buyer1@email.com`
2. **Password:** `password123`
3. Tap **"Sign In"**

**Wait 2-3 seconds**

**Expected Result:**

- ✅ No error message
- ✅ Redirect to Home screen
- ✅ See products loading
- ✅ "Roots" header visible
- ✅ "Discover hidden authentic gems" subtitle

**❌ If "Invalid email or password":**

- Backend didn't seed data
- Check backend console for seeding errors

**❌ If "Token failed":**

- Auth middleware bug (shouldn't happen)
- Check terminal output

---

## ✅ STEP 2: VERIFY MOCK DATA (3 min)

### Action 2.1: Check Home Screen

**Expected to see 18 products in two sections:**

**Section 1: "Explore by Place"** (horizontal scroll)

- [ ] Kashmir card
- [ ] Rajasthan card
- [ ] Kerala card
- [ ] Darjeeling card
- [ ] Varanasi card

**✅ Count:** 5+ place cards

---

### Action 2.2: Check Product Cards

Scroll down to "Authentic Finds"

**✅ You should see:**

1. Pashmina Shawl - ₹12,500
2. Blue Pottery Vase - ₹2,200
3. Premium Tea - ₹1,850
4. Kerala Spices - ₹1,950
5. Sandalwood Idol - ₹5,500
6. Kanchipuram Saree - ₹18,000

- 12 more...

**✅ Count:** 18+ products

**❌ If no products show:**

```
Check backend console:
- "🌱 Starting database seeding..."
- "✅ Created 18 products"
```

If missing, restart backend with `npm start`

---

## ✅ STEP 3: PRODUCT DETAILS TEST (2 min)

### Action 3.1: Tap Any Product

Tap the **Pashmina Shawl** card

**Expected:**

- ✅ Large product image appears
- ✅ Product name: "Authentic Pashmina Shawl"
- ✅ Price: "₹12,500"
- ✅ From: "Kashmir"
- ✅ Seller name: "Kashmir Crafts"
- ✅ Trust Score: "95%"
- ✅ "✓ VERIFIED" badge
- ✅ Product description visible
- ✅ "Add to Cart" button
- ✅ **"Buy Now" button**

**Verify all ✅ above**

---

## ✅ STEP 4: BUY BUTTON TEST (3 min) ⭐ CRITICAL

### Action 4.1: Tap "Buy Now"

On Product screen, tap the **"Buy Now"** button

**Expected:**

- ✅ Navigate to Checkout screen
- ✅ See "Your Cart" or "Checkout" header
- ✅ Product shown in cart
- ✅ Price total: ₹12,500
- ✅ No error message

**❌ If error "Not authorized":**

- 🔴 **CRITICAL** - Auth middleware not working
- Check backend console for errors
- Restart backend

**❌ If button doesn't respond:**

- 🔴 **CRITICAL** - Navigation not working
- Check mobile console for errors

---

### Action 4.2: Enter Shipping Details

1. **Street Address field:** Type `123 Main Street`
2. **City field:** Type `Delhi`
3. Verify **"Pay ₹12,500"** button shows at bottom

**Expected:**

- ✅ Fields accept text
- ✅ Button shows correct amount
- ✅ Order summary visible above

---

### Action 4.3: Complete Payment (Mock)

Tap **"Pay ₹12,500"** button

**Expected sequence:**

1. Loading spinner appears (2-3 seconds)
2. Spinner disappears
3. Success alert appears:
   - Title: "Success"
   - Message: "Payment successful! Order placed."
4. "Confirm" button visible

**⏱️ Timing:** Should complete in < 3 seconds

**❌ If spinner spins forever (> 5 sec):**

- Backend API hanging
- Check backend terminal for errors

**❌ If error "Checkout Failed":**

```
Possible causes:
- "Product not found" → Database issue
- "Not authorized" → Auth token issue
- Network error → Backend not reachable
```

**✅ If success:** 🎉 **BUY BUTTON WORKS!**

---

## ✅ STEP 5: ORDER VERIFICATION (2 min)

### Action 5.1: Confirm Success

Tap **"Confirm"** button on success message

**Expected:**

- ✅ Navigate to Home screen
- ✅ See buyer tabs at bottom

---

### Action 5.2: View Order History

1. Tap **"Orders"** tab at bottom
2. Look for your order

**Expected:**

- ✅ Your Pashmina Shawl order appears
- ✅ Status badge showing (e.g., "Ordered")
- ✅ Amount: ₹12,500
- ✅ Timestamp visible

**✅ Order visible?** → **DATABASE WORKING!** ✅

---

### Action 5.3: View Order Details

Tap the order card

**Expected:**

- ✅ Full order information
- ✅ Timeline showing order progression
- ✅ Shipping address: "123 Main Street, Delhi"
- ✅ Seller info visible
- ✅ Status timeline (Ordered → Packed → Shipped → Delivered)

---

## ✅ STEP 6: PROFILE & REFUND TEST (2 min)

### Action 6.1: View Profile

Tap **"Profile"** tab

**Expected:**

- ✅ Your name: "John Doe"
- ✅ Email: "buyer1@email.com"
- ✅ Recent orders section
- ✅ Profile stats visible

---

### Action 6.2: Test Refund System

Tap **"Refunds"** tab

**Expected:**

- ✅ See your order (if delivered)
- ✅ "Request Refund" button
- ✅ Can enter refund reason
- ✅ Submit works

---

## ✅ STEP 7: CART TEST (2 min)

### Action 7.1: Add Multiple Products

1. Go back to Home
2. Tap any product (e.g., Blue Pottery)
3. Tap "Add to Cart"
4. Confirm success message
5. Repeat with 2 more products

**Expected:**

- ✅ Success message each time
- ✅ Cart count increases

---

### Action 7.2: View Cart

Tap **"Cart"** icon/tab

**Expected:**

- ✅ 3 items visible
- ✅ Each with price and quantity
- ✅ Total calculated correctly
- ✅ Remove button (trash icon) works
- ✅ Can proceed to checkout

---

## ✅ STEP 8: SELLER TEST (3 min) Optional

### Action 8.1: Logout & Login as Seller

1. Tap Profile → Logout
2. Login with: `seller1@kashmir.com` / `password123`

**Expected:**

- ✅ Redirect to Seller Dashboard
- ✅ See "Trust Score: 95%"
- ✅ "Add New Product" button
- ✅ "Manage Orders" button

---

### Action 8.2: View Seller Orders

Tap **"Manage Orders & Packing"**

**Expected:**

- ✅ See the order you just created!
- ✅ Buyer: "John Doe"
- ✅ Product: "Pashmina Shawl"
- ✅ Amount: ₹12,500

---

## ✅ STEP 9: ERROR HANDLING TEST (2 min)

### Action 9.1: Invalid Checkout

1. Go back to Home
2. Tap any product
3. Tap "Buy Now"
4. **Don't** fill address
5. Tap "Pay" button

**Expected:**

- ✅ Error message: "Please enter full shipping address"
- ✅ Stay on checkout screen
- ✅ No crash

---

### Action 9.2: Invalid Login

1. Logout (Profile tab → Logout)
2. Try: `wrong@email.com` / `wrongpass`

**Expected:**

- ✅ Error: "Invalid email or password"
- ✅ Stay on login screen

---

## 📊 **TEST RESULTS SUMMARY**

Fill in your results:

| Test              | Expected           | Result | Status |
| ----------------- | ------------------ | ------ | ------ |
| Backend starts    | Server on 5000     | **\_** | ✅/❌  |
| Database seeds    | 18 products        | **\_** | ✅/❌  |
| Login works       | Home screen        | **\_** | ✅/❌  |
| Products show     | 18 items visible   | **\_** | ✅/❌  |
| Product details   | Full info visible  | **\_** | ✅/❌  |
| **Buy button**    | No errors          | **\_** | ✅/❌  |
| **Checkout**      | Address form works | **\_** | ✅/❌  |
| **Payment**       | Success < 3s       | **\_** | ✅/❌  |
| **Order created** | Visible in Orders  | **\_** | ✅/❌  |
| Seller sees order | Order visible      | **\_** | ✅/❌  |
| Error handling    | Proper messages    | **\_** | ✅/❌  |

---

## 🎯 **CRITICAL TESTS** (Must All Pass)

These MUST work for app to be functional:

- [ ] **Backend Server** - Starts without errors
- [ ] **Database** - 18 products seeded
- [ ] **Login** - Works with buyer account
- [ ] **Products** - All 18 visible
- [ ] **Product Details** - Shows complete info
- [ ] **BUY BUTTON** - ⭐ NO ERROR on click
- [ ] **Checkout** - Address form works
- [ ] **Payment** - Success message appears
- [ ] **Order** - Created in database & visible
- [ ] **Error Messages** - Shown gracefully

---

## 🐛 **IF SOMETHING FAILS**

### Check Backend Console:

```
npm start output should show:
✅ MongoDB Connected
✅ Server running on port 5000
✅ Created 6 sellers
✅ Created 18 products
✅ Created 3 demo users
```

### Check Mobile Console:

```
Use Expo console to see:
- Network errors
- API call details
- Token information
```

### Most Common Issues:

**"Product not found" error:**

```
→ Database didn't seed
→ Solution: Restart backend with npm start
```

**"Token failed" error:**

```
→ Auth middleware issue
→ Solution: Check backend/src/middlewares/auth.js
```

**"Port 5000 in use":**

```
→ Another service using port 5000
→ Solution: Kill process or use different port
```

**No products showing:**

```
→ API request failing
→ Solution: Check localhost:5000/api/products in browser
```

---

## ✅ **You're All Set!**

**Follow these 9 steps in order.** Expected time: **15-20 minutes**

All critical tests must pass ✅

Report any ❌ failures with console messages!

---

**Happy Testing! 🧪**
