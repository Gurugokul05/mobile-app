@echo off
REM Quick Backend Test Script for Windows
REM Run this to verify backend is working correctly

echo.
echo 🔍 ROOTS API - Quick Testing Script
echo ==================================
echo.

REM Check if curl is available
curl --version >nul 2>&1
if errorlevel 1 (
    echo ❌ curl is not installed or not in PATH
    echo    Please install curl or use git bash
    exit /b 1
)

echo 1️⃣  Checking if backend is running on port 5000...
curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend is NOT running
    echo    Start it with: cd backend ^&^& npm start
    exit /b 1
)
echo ✅ Backend is running!

echo.
echo 2️⃣  Testing Health Endpoint...
curl -s http://localhost:5000/health

echo.
echo 3️⃣  Testing Login with Test Buyer Account...
echo    Email: buyer1@email.com
echo    Password: password123
echo.

curl -s -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"buyer1@email.com\",\"password\":\"password123\"}"

echo.
echo.
echo 4️⃣  Testing with Admin Account...
echo    Email: admin@roots.com
echo    Password: admin123
echo.

curl -s -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@roots.com\",\"password\":\"admin123\"}"

echo.
echo ==================================
echo ✨ Testing Complete!
echo.
echo 🎯 Next Steps:
echo   1. If all tests pass, backend is working correctly
echo   2. Try logging in from mobile app
echo   3. Use test credentials provided in BACKEND_DEBUG_GUIDE.md
echo.
pause
