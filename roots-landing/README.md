# ROOTS Landing Page

A standalone, production-style landing page for **ROOTS** built in a separate folder from the existing app. It uses React, Vite, Tailwind CSS, Framer Motion, and Lucide React to present ROOTS as a premium Indian craft marketplace with buyer, seller, and admin roles.

## What I Built

- A new isolated project in `roots-landing/`
- A premium "Heritage Luxe" visual system using:
  - charcoal-brown, gold, ivory, parchment, and terracotta tones
  - Playfair Display for headings
  - DM Sans for body text
  - Cormorant Garamond for accent copy
- A fully responsive landing page with 10 complete sections:
  - Sticky navbar with mobile hamburger menu
  - Hero section with animated product cards and trust badge
  - Animated stats bar
  - How It Works role overview
  - Featured product showcase
  - Seller spotlight section
  - Trust and tech section
  - Testimonials section
  - Strong CTA banner
  - Footer with social and company links
- Framer Motion animations throughout the page:
  - staggered hero entrance
  - viewport-triggered section reveals
  - product card hover lift and overlay motion
  - animated count-up stats
  - subtle CTA background motion
- A separate Tailwind config and project build pipeline so this page can be run independently

## Folder Structure

```text
roots-landing/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── data.js
    └── components/
        ├── Navbar.jsx
        ├── Hero.jsx
        ├── StatsBar.jsx
        ├── HowItWorks.jsx
        ├── ProductShowcase.jsx
        ├── SellerSpotlight.jsx
        ├── TrustAndTech.jsx
        ├── Testimonials.jsx
        ├── CTABanner.jsx
        └── Footer.jsx
```

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- React Router DOM

## Design Direction

This page follows the "Heritage Luxe" direction requested:

- Rich, warm, tactile color palette
- Editorial-style typography
- Indian craft storytelling instead of generic SaaS styling
- Premium card treatment with depth, shadows, and soft motion
- Responsive behavior for mobile, tablet, and desktop

## Setup

From the `roots-landing` folder:

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production build was verified successfully.

## Notes

- This landing page is intentionally isolated from the existing mobile, backend, and admin apps.
- The mock content is ROOTS-themed and uses premium craft storytelling throughout.
- Product cards use placeholder imagery for layout and motion polish.

## Done In This Build

- Created a separate landing page project folder
- Added the full 10-section marketing page
- Added the theme, animations, and responsive layout
- Added Tailwind and Google Fonts setup
- Verified the production build compiles cleanly
