# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Roots** — a regional product marketplace connecting local sellers/artisan makers with buyers. Three apps in a monorepo:

| Package | Tech | Purpose |
|---------|------|---------|
| `backend/` | Node.js / Express 5 + MongoDB | REST API |
| `mobile/` | Expo (React Native) | Buyer-facing mobile app |
| `admin/` | React + Vite + react-router-dom | Admin dashboard |

## Key Commands

```
cd backend && npm run dev       # Start backend API with hot reload (port 5000)
cd mobile  && npm start         # Launch Expo dev server (scan QR on device)
cd mobile  && npm run android   # Run on Android emulator
cd admin   && npm run dev       # Start admin dashboard (Vite HMR)
```

Backend seeds data on startup (`backend/seeds/seedData.js`). All three apps share the same `backend/.env` for config.

## Backend Architecture

### Entry point
`backend/server.js` — connects to MongoDB, seeds DB, mounts middleware & routes.

### Route groups (all under `/api`)

| Prefix | File | Purpose |
|--------|------|---------|
| `/api/auth` | `src/routes/authRoutes.js` | Register, login (JWT), OTP email via nodemailer |
| `/api/seller` | `src/routes/sellerRoutes.js` | Seller profile, verification docs, products |
| `/api/products` | `src/routes/productRoutes.js` | CRUD products, reviews |
| `/api/orders` | `src/routes/orderRoutes.js` | Create/order flow, Razorpay integration, packing proof upload |
| `/api/refunds` | `src/routes/refundRoutes.js` | Submit/manage refund requests with unboxing video |

### Mongoose Models (`src/models/`)

- **User** — multi-role (`buyer` | `seller` | `admin`), saved addresses, payment methods, seller verification docs, trust score, seller profile fields
- **Product** — seller-owned, images, reviews/ratings, `isVerified` flag for famous items
- **Order** — buyer→seller→product linking, Razorpay payment details, status flow, packing proof URL
- **RefundRequest** — tied to Order, requires `unboxingVideoUrl`, admin decision tracking
- **SellerVerification** — separate from User verification docs; tracks id/location/making proof submissions with admin review workflow

### Auth middleware (`src/middlewares/auth.js`)

- `protect` — validates Bearer JWT, attaches `req.user`
- `adminOrSeller` — role gate for admin + seller
- `admin` — role gate for admin only

### Upload handling (`src/middlewares/upload.js`)

Multer middleware; some files stored locally in `backend/uploads/`, Cloudinary integration exists (`src/config/cloudinary.js`).

### Error handling

Global error handler in `server.js` catches Multer errors, Cloudinary errors, and generic server errors. Returns `{ message: string }`.

### Security

- CORS currently allows all origins (`*`) for development
- Helmet enabled by default
- JWT secret from `process.env.JWT_SECRET` (falls back to hardcoded default)

## Admin Dashboard

- Vite React app with inline styles (no CSS files)
- Routes: `/login` → `/` (dashboard) → `/sellers` → `/refunds`
- Auth via `localStorage.adminToken`; Login page posts to backend auth

## Mobile App

- Expo 55, React Native 0.83
- Navigation: `@react-navigation/native` with bottom-tabs + native-stack
- Razorpay payment integration (`react-native-razorpay`)
- Image picking: `expo-image-picker` + `react-native-image-picker`
- Async storage via `@react-native-async-storage/async-storage`
- Communicates with backend API via axios

## Conventions

- Backend uses CommonJS (`require`/`module.exports`)
- Admin uses ES Modules (`import`/`export`)
- No TypeScript anywhere in the repo
- No test framework configured (all `test` scripts are placeholders)
- Backend models live in `src/models/`, controllers in `src/controllers/`, routes in `src/routes/`, middleware in `src/middlewares/`
