# Database Seeding Guide

## Overview

The database automatically seeds with seller and product data when the backend server starts. No manual intervention is required!

## Automatic Seeding

The seeding happens automatically in `backend/server.js`:

```javascript
seedDatabase().catch((err) => console.error("Seeding error:", err));
```

## Seeded Data

### Sellers (5 Total)

| Email               | Name          | Location   | Trust Score | Status      |
| ------------------- | ------------- | ---------- | ----------- | ----------- |
| arun@sellers.com    | Arun Kumar    | Tamil Nadu | 95%         | Verified ✅ |
| priya@sellers.com   | Priya Sharma  | Rajasthan  | 92%         | Verified ✅ |
| rajesh@sellers.com  | Rajesh Nair   | Darjeeling | 98%         | Verified ✅ |
| deepika@sellers.com | Deepika Menon | Tamil Nadu | 94%         | Verified ✅ |
| vikram@sellers.com  | Vikram Singh  | Rajasthan  | 89%         | Verified ✅ |

**All sellers use password: `password123`**

### Buyers (2 Total)

| Email            | Name       | Trust Score |
| ---------------- | ---------- | ----------- |
| buyer1@email.com | John Doe   | 75%         |
| buyer2@email.com | Jane Smith | 82%         |

**All buyers use password: `password123`**

### Products (6 Total)

1. **Authentic Pashmina Shawl** - ₹12,500 (Kashmir) - Seller: Arun Kumar
2. **Jaipuri Blue Pottery Vase** - ₹1,200 (Rajasthan) - Seller: Priya Sharma
3. **Premium First Flush Tea** - ₹850 (Darjeeling) - Seller: Rajesh Nair
4. **Kanchipuram Pure Silk Saree** - ₹18,000 (Tamil Nadu) - Seller: Deepika Menon
5. **Handcrafted Sandalwood Idol** - ₹3,500 (Mysore) - Seller: Vikram Singh
6. **Kerala Spices Gift Box** - ₹950 (Kerala) - Seller: Arun Kumar

## How to Test Seeding

### 1. Start Backend Server

```bash
cd backend
npm install
npm start
```

You'll see output like:

```
✅ Created 5 seller(s)
✅ Created 2 buyer(s)
✅ Created 6 product(s)
✅ Database seeding completed
```

### 2. Verify Database

Connect to MongoDB and check collections:

```javascript
// Check users
db.users.find();

// Check products
db.products.find();
```

### 3. Login with Seeded Credentials

- **As Seller**: Use any seller email with `password123`
- **As Buyer**: Use `buyer1@email.com` or `buyer2@email.com` with `password123`

## Important Features

### ✅ Idempotent Seeding

- The seed script checks if data already exists before creating
- Running the server multiple times won't create duplicates
- Safe to restart the server without data conflicts

### ✅ Seller-Product Linking

- Each product is automatically linked to its correct seller
- Uses email-based lookup to find seller `_id`
- Products have correct `sellerId` ObjectId reference

### ✅ Full Mock Data Integration

- All sellers have complete profiles (phone, address, location, etc.)
- Products are properly categorized by origin place
- Trust scores and verification status included

## Database Structure

### User Model

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  phone: String,
  address: String,
  role: "buyer" | "seller" | "admin",
  isVerified: Boolean,
  trustScore: Number,
  createdAt: Date
}
```

### Product Model

```javascript
{
  _id: ObjectId,
  sellerId: ObjectId (ref: User),
  name: String,
  description: String,
  price: Number,
  originPlace: String,
  images: [String],
  isVerified: Boolean,
  reviews: Array,
  rating: Number,
  numReviews: Number,
  createdAt: Date
}
```

## Troubleshooting

### "Seller not found for product"

- Ensure seller email in SELLERS_DATA matches sellerEmail in PRODUCTS_DATA
- Check that sellers are created before products

### Duplicate data after restart

- This is normal! The seed script checks if data exists first
- If you want to reset, manually clear MongoDB collections or uncomment delete lines

### Products not showing up

- Check if MongoDB connection is working
- Verify seller IDs are correctly referenced
- Check browser console for API errors

## Next Steps

1. ✅ Backend seeding is ready
2. ✅ Mobile app can fetch from `/api/products` endpoint
3. ✅ Seller details load via SellerProfileScreen
4. Ready to integrate with real backend API calls

## Manual Seeding (Optional)

If you need to manually trigger seeding without restarting, you could:

1. Clear the database:

```javascript
// In MongoDB shell
db.users.deleteMany({});
db.products.deleteMany({});
```

2. Restart the server - it will automatically re-seed

Or add an admin endpoint to trigger seeding (not implemented in default setup).
