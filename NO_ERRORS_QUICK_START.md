# ⚡ NO-ERRORS QUICK START (5 MINUTES)

**Goal:** Get the app running in 5 minutes without any errors.

---

## ✅ STEP 1: START BACKEND (1 minute)

### Open Terminal 1:

```bash
cd backend
npm install
npm start
```

### Expected Output:

```
✅ MongoDB Connected Successfully to: mongodb://...
✅ Roots API running on port: 5000
✅ Created 6 sellers
✅ Created 18 products
✅ Created 3 users
```

**✓ BACKEND READY!**

---

## ✅ STEP 2: START MOBILE (1 minute)

### Open Terminal 2 (keep Terminal 1 running):

```bash
cd mobile
npm install
npm start
```

### Expected Output:

```
› Expo DevTools is running at http://localhost:19002
› Tunnel ready.
› Press i to open iOS simulator, or a to open Android emulator
```

**✓ EXPO READY!**

### To run on device:

- Press `a` for Android emulator
- Or Scan QR with Expo app on your phone

---

## ✅ STEP 3: LOGIN (1 minute)

### Email:

```
buyer1@email.com
```

### Password:

```
password123
```

### Click Login

### Expected:

- ✅ No error message
- ✅ Redirects to Home
- ✅ Shows 18 products

**✓ LOGGED IN!**

---

## ✅ STEP 4: BUY BUTTON TEST (2 minutes)

### On Home Screen:

1. **Tap any product** (e.g., "Pashmina Shawl")
2. **Click "Buy Now"**

### Expected:

- ✅ Navigates to checkout
- ✅ Shows product and price
- ✅ Shows address form

### Fill Address:

```
Street: 123 Main Street
City: Delhi
```

### Click "Pay ₹12,500"

### Expected:

- ✅ Shows loading (1-2 sec)
- ✅ Success message appears
- ✅ "Payment successful! Order placed."

**✓ BUY BUTTON WORKS!**

---

## 🎉 DONE!

**Total Time: 5 minutes**

All features working! ✅

---

## 🔴 ERROR? CHECK HERE

### ❌ "Failed to connect to MongoDB"

**Fix:**

```bash
# Restart backend
npm start
```

### ❌ "Cannot GET /api/products"

**Fix:**

```bash
# Backend not seeding? Stop and restart:
npm start
# Wait 5 seconds for database
```

### ❌ "Not authorized, token failed"

**Fix:**

```bash
# Backend auth middleware issue
# Restart everything:
# Terminal 1: npm start (backend)
# Terminal 2: npm start (mobile)
# Logout and login again
```

### ❌ "Cannot read property 'price' of undefined"

**Fix:**

```bash
# Products not loaded
# Check backend console for seeding errors
# Restart backend
```

### ❌ "TypeError: Cannot read property 'token' of null"

**Fix:**

```bash
# Device not logged in properly
# Clear AsyncStorage:
# Logout → Login again with correct credentials
```

### ❌ App won't start

**Fix:**

```bash
# Clear cache and reinstall:
cd mobile
npm install
npm start
```

### ❌ "EADDRINUSE :::5000"

**Fix:**

```bash
# Port 5000 already in use
# Either:
# A) Kill process: netstat -ano | findstr :5000
# B) Change port in backend/server.js
```

---

## 📱 TEST ACCOUNTS

### Buyer Account:

- **Email:** buyer1@email.com
- **Password:** password123
- **Role:** Buyer
- **Cart:** Empty (ready to buy)

### Seller Account:

- **Email:** seller1@kashmir.com
- **Password:** password123
- **Role:** Seller
- **Total Orders:** 12
- **Trust Score:** 95%

### Admin Account:

- **Email:** admin@admin.com
- **Password:** password123
- **Role:** Admin

---

## 🚀 NEXT STEPS

1. ✅ Complete 5-minute startup
2. ✅ Test buy button
3. ✅ Fill verification scorecard
4. ✅ Check all 35 features

**All features in:** [VERIFICATION_SCORECARD.md](VERIFICATION_SCORECARD.md)

---

## 💾 IMPORTANT NOTES

- **Database auto-seeds** on first backend start
- **Only seeds once** (doesn't duplicate on restarts)
- **Tokens stored** in AsyncStorage (survives app restart)
- **All data persists** in MongoDB
- **Logs visible** in terminal for debugging

---

## 🎯 SUCCESS CRITERIA

✅ You're successful if:

1. Backend runs without errors
2. Mobile app loads products
3. Can login with buyer1@email.com
4. Can buy any product
5. Success message shows after payment

**If all 5 ✅ → APP IS WORKING!**

---

**Estimated Total Time: 5 minutes**

Let's go! 🚀
