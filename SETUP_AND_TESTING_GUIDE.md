# 🌿 Roots - Authentic Local Products Marketplace

A full-stack React Native mobile app with Express backend for discovering and purchasing authentic local products from verified sellers across India.

## 📱 Project Structure

```
├── mobile/          # React Native mobile app (Expo)
├── backend/         # Express.js API server
├── admin/           # React admin dashboard
└── README.md        # This file
```

## ✨ Features

### 🛍️ Buyer Features

- **Browse Products** - Discover authentic items by region/place
- **Search & Filter** - Find products by location
- **Shopping Cart** - Add/remove items before checkout
- **Secure Checkout** - Complete orders with shipping details
- **Payment Integration** - Razorpay payment gateway support
- **Order Tracking** - Monitor order status (Ordered → Packed → Shipped → Delivered)
- **User Profile** - Manage account and view order history
- **Refund System** - Request refunds with unboxing video proof

### 🏪 Seller Features

- **Product Upload** - Add products with images and details
- **Dashboard** - View sales and trust score
- **Order Management** - Manage incoming orders
- **Packing Proof** - Upload proof when packing items
- **Seller Verification** - Get verified as authentic seller

### 👨‍💼 Admin Features

- **Seller Verification** - Approve/reject seller applications
- **Refund Approvals** - Review and approve/reject refund requests
- **Dashboard** - Overview of all orders and refunds

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- MongoDB (local or cloud with connection string)
- Expo CLI (`npm install -g expo-cli`)
- React Native development environment (Android Studio or Xcode)

### 1️⃣ Backend Setup

```bash
cd backend
npm install
```

**Create/Update `.env` file:**

```
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/roots
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Start the server:**

```bash
npm start        # Production mode
# OR
npm run dev      # Development with auto-reload (requires nodemon)
```

The API will run on `http://localhost:5000` and automatically seed the database with mock data.

### 2️⃣ Mobile App Setup

```bash
cd mobile
npm install
```

**Start the Expo development server:**

```bash
npm start
# Press 'a' for Android
# Press 'i' for iOS
# Press 'w' for web
```

### 3️⃣ Admin Dashboard Setup

```bash
cd admin
npm install
npm run dev
```

---

## 🧪 Testing the Buy Button

### Test Credentials (Auto-seeded)

| Role   | Email               | Password    | Purpose         |
| ------ | ------------------- | ----------- | --------------- |
| Buyer  | buyer1@email.com    | password123 | Make purchases  |
| Seller | seller1@kashmir.com | password123 | Upload products |
| Admin  | admin@admin.com     | password123 | Manage platform |

### Complete Buy Flow

1. **Launch Mobile App**
   - Start Expo app on Android/iOS emulator

2. **Login as Buyer**
   - Email: `buyer1@email.com`
   - Password: `password123`

3. **Browse Products**
   - Navigate to Home screen
   - See 18+ products from different regions
   - Tap on any product card

4. **Buy Product**
   - Tap "Buy Now" button on product screen
   - OR add to cart first, then checkout
   - Enter shipping address and city
   - Review order summary
   - Complete "payment" (mock)
   - Success message appears

5. **Track Order**
   - Go to "Orders" tab
   - View order status progression
   - See shipping details

### Mock Data Available

**🌍 Regions with Products:**

- Kashmir (Pashmina shawls, carpets, papier mâché)
- Rajasthan (Blue pottery, bandhani sarees, paintings)
- Darjeeling (Premium teas)
- Kerala (Spices, sarees, coconut oil)
- Mysore (Sandalwood, silk, inlay work)
- Tamil Nadu (Kanchipuram silk, bronze statues, terracotta)

**📦 18+ Products Across 6 Verified Sellers**
Each with realistic prices, images, and seller information.

---

## 🔧 Key Files Modified

### Backend

- ✅ `server.js` - Added automatic database seeding
- ✅ `src/middlewares/auth.js` - Fixed early return bug in token validation
- ✅ `seeds/seedData.js` - NEW: Comprehensive mock data generator
- ✅ `.env.example` - NEW: Environment variables template

### Mobile

- ✅ `src/screens/buyer/CartCheckoutScreen.js` - Enhanced error handling
- ✅ `src/screens/buyer/HomeScreen.js` - Improved price formatting
- ✅ `src/api/config.js` - Token-based authentication setup

---

## 📊 Database Schema

### Users

- Basic auth (login/register)
- Roles: buyer, seller, admin
- Trust score system
- Verification documents for sellers

### Products

- Seller association
- Images (hosted on Cloudinary)
- Origin place (region/city)
- Verification status
- Price (stored as numbers)

### Orders

- Buyer & seller association
- Order status tracking
- Payment details (Razorpay integration)
- Shipping address

### Refunds

- Order association
- Unboxing video proof requirement
- Admin decision tracking
- Status: Pending/Approved/Rejected

---

## 🐛 Fixed Issues

1. **Auth Middleware Bug**
   - ❌ Was: Early return preventing token validation
   - ✅ Fixed: Proper token flow with correct error handling

2. **No Mock Data**
   - ❌ Was: Empty database on first run
   - ✅ Fixed: Auto-seeds 18 products + sellers + demo users

3. **Buy Button Error**
   - ❌ Was: Authentication token not validated
   - ✅ Fixed: Proper token interceptor + middleware

---

## 🛠️ API Endpoints

### Authentication

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Products

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (seller only)

### Orders

- `POST /api/orders` - Create order (protected)
- `GET /api/orders/my-orders` - Get user orders (protected)
- `GET /api/orders/:id` - Get order details (protected)
- `POST /api/orders/:id/verify-payment` - Verify payment (protected)

### Refunds

- `POST /api/refunds` - Create refund request (protected)
- `PUT /api/refunds/:id/decide` - Approve/reject (admin only)

---

## 📱 Mobile Screens

### Buyer Navigation

- **Home** - Browse products by region
- **Product Detail** - View product and buy
- **Cart** - Review and checkout
- **Orders** - Track purchases
- **Refunds** - Request refunds
- **Profile** - Manage account

### Seller Navigation

- **Dashboard** - Sales overview
- **Upload Product** - Add new items
- **Orders** - Manage orders
- **Profile** - Settings

---

## ⚠️ Important Notes

1. **First Run**: Backend will auto-seed with 18 products and test accounts
2. **Token Expiry**: JWT tokens expire in 30 days (configurable)
3. **Images**: Use Unsplash CDN by default, set up Cloudinary for real uploads
4. **Payment**: Razorpay integration is mock-enabled when keys not provided
5. **Database**: Uses MongoDB Atlas (cloud). For local testing, use local MongoDB

---

## 🚀 Deployment Checklist

- [ ] Set secure JWT_SECRET in production
- [ ] Configure real Razorpay keys
- [ ] Set up Cloudinary for image uploads
- [ ] Test payment flow end-to-end
- [ ] Verify seller onboarding process
- [ ] Set up admin dashboard access
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging

---

## 📞 Troubleshooting

### Buy Button Shows Error

**Error**: "Not authorized, token failed"

- ✅ Solution: Ensure user is logged in
- ✅ Check that token is stored in AsyncStorage
- ✅ Verify API token interceptor is working

### Products Not Loading

**Error**: Empty product list

- ✅ Solution: Verify backend is running on port 5000
- ✅ Check MongoDB connection string
- ✅ Database was seeded (check server logs)

### Connection Refused

**Error**: ECONNREFUSED at localhost:5000

- ✅ Solution: Backend not running - start with `npm start`
- ✅ For emulator: Use `10.0.2.2` instead of `localhost`

### Seller Cannot Upload Products

- ✅ Must complete onboarding first
- ✅ Admin must approve verification
- ✅ Check seller verification status in dashboard

---

## 📈 Performance Optimization

- Image caching on mobile
- Database query optimization with proper indexing
- JWT token validation middleware
- CORS configuration for security
- Compressed API responses

---

## 📝 License

MIT License

---

## 👤 Authors & Contributors

Built with ❤️ for authentic local product commerce

---

### 🎯 Ready to Test?

1. ✅ Backend running? Check `http://localhost:5000` (should show "Roots API is running")
2. ✅ Mobile app starting? Run `npm start` in mobile folder
3. ✅ Logged in as buyer? Use `buyer1@email.com`
4. ✅ Tap a product and press "Buy Now"!

**Happy shopping! 🛍️**
