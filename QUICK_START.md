# 🚀 QUICK START GUIDE - Roots App

Get the app running in 5 minutes!

---

## ⚡ 30-Second Setup

### Step 1: Start Backend

```bash
cd backend
npm install
npm start
```

✅ Server running on `http://localhost:5000`

Database auto-seeded with 18 products + test users

### Step 2: Start Mobile

```bash
cd mobile
npm install
npm start
```

✅ Expo running - press `a` for Android or `i` for iOS

### Step 3: Login & Test

```
Email: buyer1@email.com
Password: password123
```

✅ **Ready to test the buy button!**

---

## 🛍️ Buy Button Test Flow (2 minutes)

1. **Home Screen** → See 18+ products
2. **Tap Any Product** → View details
3. **"Buy Now"** → Checkout page
4. **Enter Address** → City name (any text)
5. **Pay** → Click button (mock payment)
6. ✅ **Success!** → Order placed
7. **Orders Tab** → See your order

---

## 👥 Other Test Accounts

### Seller Account

```
Email: seller1@kashmir.com
Password: password123
Role: Seller (can upload products)
```

### Admin Account

```
Email: admin@admin.com
Password: password123
Role: Admin (can approve/reject)
```

---

## 🐛 If Something Breaks

### Error: "Cannot connect to API"

- ✅ Make sure backend is running: `npm start` from `backend` folder
- ✅ Check port 5000 is free

### Error: "Token failed"

- ✅ Clear app data and login again
- ✅ Check AsyncStorage is clean

### Error: "No products showing"

- ✅ Backend is running and database seeded
- ✅ Check MongoDB connection string in `.env`

### Error: "Buy Now button not responding"

- ✅ Ensure user is logged in
- ✅ Check console logs for errors
- ✅ Verify address field is filled

---

## 📊 What's Auto-Seeded?

✅ **6 Verified Sellers**

- Kashmir Crafts
- Rajasthan Heritage
- Darjeeling Tea House
- Kerala Spices
- Mysore Arts
- Tamil Nadu Textiles

✅ **18+ Products**

- Pashmina Shawls ($125-280)
- Blue Pottery ($22-52)
- Premium Teas ($18-32)
- Spice Sets ($19-33)
- Sandalwood Idols ($55)
- Silk Sarees ($85-180)

✅ **3 Test Users**

- 2 Buyers (buyer1@email.com, buyer2@email.com)
- 1 Admin (admin@admin.com)

---

## 🎯 Key Features Tested

| Feature              | Status       | Where               |
| -------------------- | ------------ | ------------------- |
| Login                | ✅ Works     | LoginScreen         |
| Browse Products      | ✅ Works     | HomeScreen          |
| View Product Details | ✅ Works     | ProductScreen       |
| Add to Cart          | ✅ Works     | ProductScreen       |
| Checkout             | ✅ Works     | CartCheckoutScreen  |
| **Buy Button**       | ✅ **FIXED** | Buy Now             |
| Order Tracking       | ✅ Works     | OrderTrackingScreen |
| Refunds              | ✅ Enhanced  | RefundScreen        |
| Refund Policy        | ✅ Works     | RefundScreen        |

---

## 📦 Mock Data Summary

**Total Mock Products:** 18  
**Total Mock Sellers:** 6  
**Total Test Accounts:** 3  
**Price Range:** ₹850 - ₹28,000  
**All with:** Real images, descriptions, verification badges

---

## 🎨 UI/UX Highlights

✨ Beautiful gradient buttons  
✨ Smooth card-based layouts  
✨ Real location-based shopping  
✨ Status indicators (Verified/Unverified)  
✨ Trust score display  
✨ Seller information display  
✨ Order tracking timeline  
✨ Refund policy info cards

---

## 🔄 Buy Flow Diagram

```
Login
  ↓
HomeScreen (Show Products)
  ↓
ProductScreen (View Details)
  ↓
Buy Now / Add to Cart
  ↓
CartCheckoutScreen (Enter Address)
  ↓
Payment (Mock Razorpay)
  ↓
OrderTrackingScreen
  ↓
Success ✅
```

---

## 🚨 Troubleshooting Checklist

- [ ] Backend running? (`npm start` in backend folder)
- [ ] Mobile app running? (`npm start` in mobile folder)
- [ ] Logged in? (buyer1@email.com)
- [ ] Internet working? (needs connectivity)
- [ ] Port 5000 free? (check with `netstat -an`)
- [ ] MongoDB connected? (check backend console)

---

## 📱 Run Multiple Terminals

**Terminal 1: Backend**

```bash
cd backend && npm start
```

**Terminal 2: Mobile**

```bash
cd mobile && npm start
```

Both should be running simultaneously!

---

## ✨ What's Fixed

1. ✅ **Auth Bug** - Token validation now works
2. ✅ **No Mock Data** - 18 products auto-seeded
3. ✅ **Buy Button Error** - Properly authenticates
4. ✅ **Empty Database** - Sellers & users pre-created
5. ✅ **Price Formatting** - Works with strings & numbers
6. ✅ **Refund Screen** - Full functionality added

---

## 🎉 You're All Set!

**The buy button now works perfectly!**

Go ahead and try:

1. Login with buyer1@email.com
2. Browse to any product
3. Click "Buy Now"
4. Enter any city name
5. Complete the mock payment

**Expected Result:** Success message + Order created ✅

---

## 📞 Next Steps

- [ ] Test on real Android device
- [ ] Test on iOS simulator (if Mac)
- [ ] Test seller features
- [ ] Test refund system
- [ ] Deploy to production

---

**Happy Shopping! 🛍️**
