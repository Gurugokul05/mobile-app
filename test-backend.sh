#!/usr/bin/env bash
# Quick Backend Test Script
# Run this to verify backend is working correctly

echo "🔍 ROOTS API - Quick Testing Script"
echo "=================================="
echo ""

# Check if port 5000 is accessible
echo "1️⃣  Checking if backend is running on port 5000..."
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend is running!"
else
    echo "❌ Backend is NOT running"
    echo "   Start it with: cd backend && npm start"
    exit 1
fi

echo ""
echo "2️⃣  Testing Health Endpoint..."
curl -s http://localhost:5000/health | jq '.' 2>/dev/null || echo "Response: (health check passed)"

echo ""
echo "3️⃣  Testing Login with Test Buyer Account..."
echo "   Email: buyer1@email.com"
echo "   Password: password123"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer1@email.com","password":"password123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✅ Login successful!"
    echo "Response:"
    echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
else
    echo "❌ Login failed!"
    echo "Response:"
    echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
fi

echo ""
echo "4️⃣  Testing with Admin Account..."
echo "   Email: admin@roots.com"
echo "   Password: admin123"
echo ""

ADMIN_LOGIN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@roots.com","password":"admin123"}')

if echo "$ADMIN_LOGIN" | grep -q "token"; then
    echo "✅ Admin login successful!"
    ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.token' 2>/dev/null)
    
    echo ""
    echo "5️⃣  Testing Admin-Only Endpoint (Get Sellers)..."
    curl -s -X GET http://localhost:5000/api/seller/admin/list \
      -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.[] | {name, email, isVerified}' 2>/dev/null | head -20
else
    echo "❌ Admin login failed!"
    echo "$ADMIN_LOGIN" | jq '.' 2>/dev/null || echo "$ADMIN_LOGIN"
fi

echo ""
echo "=================================="
echo "✨ Testing Complete!"
echo ""
echo "🎯 Next Steps:"
echo "  1. If all tests pass, backend is working correctly"
echo "  2. Try logging in from mobile app"
echo "  3. Use test credentials provided in BACKEND_DEBUG_GUIDE.md"
echo ""
