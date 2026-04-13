# Backend Issues: Fix Summary & Testing Guide

## Issues Fixed

### 1. **Route Ordering Issue**

- **Problem**: Routes like `/api/seller/verification/admin/all` were being matched by `/:id/verification` before reaching the specific route
- **Fix**: Reorganized routes so specific paths come BEFORE parameter-based routes
- **File**: `backend/src/routes/sellerRoutes.js`

### 2. **CORS Configuration**

- **Problem**: Mobile app couldn't reach backend due to strict CORS settings
- **Fix**: Added explicit CORS headers, set origin to "\*" for development, added OPTIONS method support
- **File**: `backend/server.js`

### 3. **Server Error Handling & Logging**

- **Problem**: Unclear error messages when server fails to start
- **Fix**: Added better error logging, health check endpoint, startup messages
- **File**: `backend/server.js`

### 4. **Database Connection**

- **Problem**: Silent failures in MongoDB connection
- **Fix**: Added detailed error messages and connection pool configuration
- **File**: `backend/src/config/db.js`

### 5. **Seed Data**

- **Problem**: No test accounts available for login testing
- **Fix**: Added test accounts with simple credentials for debugging
- **File**: `backend/seeds/seedData.js`

---

## Test Credentials

### Buyer Accounts

- **Email**: `buyer1@email.com`
- **Password**: `password123`
- **Role**: Buyer

- **Email**: `test@buyer.com`
- **Password**: `test1234`
- **Role**: Buyer

### Seller Accounts

- **Email**: `arun@sellers.com`
- **Password**: `password123`
- **Role**: Seller (Verified)

- **Email**: `test@seller.com`
- **Password**: `test1234`
- **Role**: Seller (Not Verified)

### Admin Accounts

- **Email**: `admin@roots.com`
- **Password**: `admin123`
- **Role**: Admin

- **Email**: `test@admin.com`
- **Password**: `test1234`
- **Role**: Admin

---

## How to Test Backend

### Step 1: Start Backend

```bash
cd backend
npm install  # If not already done
npm start
```

Expected output:

```
✓ Server running on port 5000
✓ API available at http://localhost:5000/api
✓ Health check at http://localhost:5000/health
✓ MongoDB Connected: ...
📦 Starting database seeding...
✅ Created X seller(s)
✅ Created X buyer(s)
✅ Created default admin user...
✅ Database seeding completed
```

### Step 2: Test Health Endpoint (No Authentication Required)

```bash
curl http://localhost:5000/health
```

Should return:

```json
{ "status": "ok", "port": 5000 }
```

### Step 3: Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer1@email.com","password":"password123"}'
```

Should return:

```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "buyer1@email.com",
  "role": "buyer",
  "isVerified": true,
  "token": "eyJ..."
}
```

### Step 4: Test Mobile Connection

1. Ensure backend is running on `http://localhost:5000`
2. Start mobile app (Expo)
3. Try login with test credentials above
4. Mobile app will automatically try multiple IP addresses:
   - Expo debug host
   - 10.0.2.2 (Android emulator)
   - 127.0.0.1
   - localhost

---

## Troubleshooting

### Issue: "Unable to reach server"

**Check 1**: Is backend running?

```bash
curl http://localhost:5000/health
```

**Check 2**: Is port 5000 open?

```bash
netstat -an | grep 5000  # Windows/Mac/Linux
```

**Check 3**: Is MongoDB connected?
Look at console output when you run `npm start`. Should see:

```
✓ MongoDB Connected: cluster0.tywfoo2.mongodb.net
```

**Check 4**: Network connectivity from mobile

- Android: Backend should be accessible at `http://10.0.2.2:5000/api`
- iOS/Web: Backend should be accessible at `http://localhost:5000/api` or your machine IP

### Issue: "401 Unauthorized"

**Check 1**: Credentials are correct
Try logging in with `buyer1@email.com` / `password123`

**Check 2**: Database user exists

```bash
# Login to MongoDB
mongosh "YOUR MONGO DB URL"

# Check users
db.users.find({ email: "buyer1@email.com" }).pretty()
```

**Check 3**: Password hashing is working
The seed data automatically hashes passwords using bcrypt. All test accounts use the credentials listed above.

### Issue: "500 Server Error"

Check console for error message:

```
✗ Error connecting to MongoDB: Connection refused
```

**Solution**: Ensure MONGO_URI in `.env` is correct and MongoDB is accessible

---

## Environment Variables (.env)

```
PORT=5000
MONGO_URI=mongodb+srv://Gurugokul:Gurugokul@cluster0.tywfoo2.mongodb.net/
JWT_SECRET=roots_is_the_best_app_in_2026_and_it_is_good_app
# ... other vars
```

---

## Mobile API Configuration

The mobile app tries these URLs in order:

1. **Configured URL** (from `EXPO_PUBLIC_API_URL`)
2. **Expo debug host** (dynamic, based on Expo config)
3. **10.0.2.2:5000** (Android emulator)
4. **127.0.0.1:5000** (localhost)
5. **localhost:5000** (fallback)

If one fails, it automatically tries the next one.

---

## Next Steps

1. ✅ Verify backend starts without errors
2. ✅ Test health endpoint
3. ✅ Test login with credentials
4. ✅ Test mobile connection
5. Test seller verification feature with test accounts
6. Test admin dashboard with admin account

---

## Key Improvements Made

- ✅ Better error handling and logging
- ✅ Fixed route ordering (prevents routing conflicts)
- ✅ Enhanced CORS configuration
- ✅ Added health check endpoint
- ✅ Test accounts for easier debugging
- ✅ Better database connection handling
- ✅ Cleaner server startup messages
- ✅ JSON responses with proper error messages
