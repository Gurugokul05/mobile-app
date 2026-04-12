# ROOTS Design Tokens - Implementation Guide

Complete guide for using centralized design tokens across the ROOTS platform (mobile, admin, landing).

## Quick Start

All token values are defined in **`shared/design-tokens/tokens.js`** (JavaScript/CommonJS) and **`shared/design-tokens/tokens.ts`** (TypeScript).

## Usage by App

### 1. Mobile App (React Native / Expo)

**File:** `mobile/src/theme/DesignTokens.js`

The React Native theme file exports StyleSheet-compatible token objects and preset component styles.

#### Import tokens:

```javascript
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  ComponentStyles,
  SemanticColors,
} from "../theme/DesignTokens";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors["gray-50"],
    paddingHorizontal: Spacing[4], // 16px
  },
  button: {
    ...ComponentStyles.primaryButton,
  },
  card: {
    ...ComponentStyles.card,
  },
});
```

#### Available exports:

- **`Colors`** — Color palette (e.g., `Colors['blue-600']`, `Colors['gray-900']`)
- **`Typography`** — Font sizes, weights, preset text styles (`Typography.styles.heading1`)
- **`Spacing`** — Spacing scale (0-12 map to 0-48px)
- **`BorderRadius`** — Radius presets (sm, md, lg, xl, full)
- **`ComponentStyles`** — Pre-made StyleSheet objects for buttons, cards, badges, etc.
- **`SemanticColors`** — Success/warning/danger/info color sets
- **`Theme`** — Single object containing all of above

#### Example badge with semantic color:

```javascript
const badgeStyle = SemanticColors.success;
<View
  style={[
    ComponentStyles.badgeBase,
    { backgroundColor: badgeStyle.background },
  ]}
>
  <Text style={[ComponentStyles.badgeSuccessText]}>Approved</Text>
</View>;
```

---

### 2. Admin Dashboard (React + Vite + CSS)

**Files:**

- CSS tokens: `admin/src/theme/design-tokens.css`
- Link in main CSS: `admin/src/App.css`

#### Import in CSS files:

```css
/* In any .css file */
@import "./theme/design-tokens.css";

.my-component {
  background-color: var(--roots-blue-600);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  color: var(--roots-gray-900);
  font-size: var(--text-lg);
}
```

#### Available CSS custom properties:

- **Colors:** `--roots-blue-600`, `--roots-gray-900`, etc.
- **Spacing:** `--spacing-0` through `--spacing-12` (0–48px)
- **Typography:** `--text-xs` through `--text-2xl`
- **Border radius:** `--radius-sm` through `--radius-full`
- **Semantic utilities:** `.bg-success`, `.text-warning`, `.border-danger`, etc.

#### Example component styles:

```css
.admin-button {
  background-color: var(--roots-blue-600);
  color: white;
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  min-height: 44px;
  border: none;
  cursor: pointer;
}

.admin-card {
  background-color: white;
  border: 0.5px solid var(--roots-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}
```

#### Token reference in JSX:

```jsx
import styles from "./MyComponent.module.css"; // If using CSS modules

// Or inline styles (for dynamic values only)
<button style={{ color: "var(--roots-blue-600)" }}>Click</button>;
```

---

### 3. Landing Page (React + Tailwind + Vite)

**File:** `roots-landing/tailwind.config.js`

The Tailwind config imports shared tokens and extends the default theme.

#### Use Tailwind classes directly:

```jsx
// Colors
<div className="bg-roots-blue-600 text-white">Primary button area</div>
<div className="bg-roots-gray-50 text-roots-gray-900">Page background</div>

// Spacing (via Tailwind scale: 1 = 4px, 4 = 16px)
<div className="p-4 mb-6">  {/* padding 16px, margin-bottom 24px */}
</div>

// Border radius
<div className="rounded-md">  {/* 8px */}
</div>
<div className="rounded-lg">  {/* 12px */}
</div>

// Typography
<h1 className="text-2xl font-medium">Page Title</h1>
<p className="text-base font-normal">Body text</p>

// Min height (component standard: 44px)
<button className="min-h-11">Click me</button>
```

#### Custom Tailwind utilities:

```jsx
// Semantic status colors (from Tailwind config)
<span className="bg-roots-green-50 text-roots-green-600">Success</span>
<span className="bg-roots-amber-50 text-roots-amber-600">Warning</span>

// Landing page custom colors (preserved)
<div className="bg-charcoal text-ivory">Heritage style</div>

// Custom animations (from Tailwind config)
<div className="animate-floatSlow">Floating element</div>
```

#### To add new Tailwind utilities:

```javascript
// In tailwind.config.js
extend: {
  colors: {
    "my-color": '#FFAA00', // imported from tokens if available
  },
}
```

---

## Token Structure Reference

### Colors (All hex, no RGB)

```
--roots-blue-50 through --roots-blue-900
--roots-green-50, --roots-green-600
--roots-amber-50, --roots-amber-600
--roots-red-50, --roots-red-600
--roots-gray-50, --roots-gray-100, --roots-gray-200, --roots-gray-500, --roots-gray-900
```

### Typography

- **Sizes:** 12px (xs), 13px (sm), 15px (base), 18px (lg), 22px (xl), 28px (2xl)
- **Weights:** 400 (normal), 500 (medium)
- **Where used:** Labels, buttons, body text, headings

### Spacing (8px base)

- 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
- Used for padding, margin, gaps between elements

### Border Radius

- **6px** (badges, tags)
- **8px** (buttons, inputs)
- **12px** (cards)
- **16px** (modals)
- **9999px** (pills, avatars)

---

## Component Patterns

### Status Badge

```jsx
// React
<span className="bg-roots-green-50 text-roots-green-600 px-3 py-1 rounded-sm text-xs font-medium">
  Verified
</span>

// React Native
<View style={[ComponentStyles.badgeSuccess, { borderRadius: 6 }]}>
  <Text style={ComponentStyles.badgeSuccessText}>Verified</Text>
</View>
```

### Card

```css
/* CSS */
.card {
  background-color: white;
  border: 0.5px solid var(--roots-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}
```

```jsx
// Tailwind
<div className="bg-white border border-roots-gray-200 rounded-lg p-4">
  Card content
</div>
```

### Primary Button

```jsx
// Tailwind
<button className="bg-roots-blue-600 text-white px-4 py-3 rounded-md min-h-11 font-medium hover:bg-blue-700">
  Action
</button>

// CSS
.btn-primary {
  background-color: var(--roots-blue-600);
  color: white;
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  min-height: 44px;
}
```

### Input Field

```jsx
// Tailwind
<input
  className="w-full h-11 px-3 py-2 border border-roots-gray-200 rounded-md focus:outline-none focus:border-roots-blue-400 focus:ring-2 focus:ring-roots-blue-400"
/>

// CSS
.input {
  border: 1px solid var(--roots-gray-200);
  border-radius: var(--radius-md);
  height: 44px;
  padding: var(--spacing-2) var(--spacing-3);
}

.input:focus {
  border-color: var(--roots-blue-400);
  box-shadow: 0 0 0 2px var(--roots-blue-400);
}
```

### Toast Notification

```jsx
// React (check admin/src/components/ToastProvider.jsx)
const { showToast } = useToast();

showToast({
  title: "Success",
  message: "Item saved.",
  type: "success", // 'success' | 'warning' | 'error' | 'info'
});
```

---

## File Dependencies

```
shared/design-tokens/
├── tokens.js          ← Main source (CommonJS)
├── tokens.ts          ← TypeScript version
└── README.md          ← Overview

admin/src/theme/
└── design-tokens.css  ← CSS custom properties version

mobile/src/theme/
└── DesignTokens.js    ← React Native StyleSheet version

roots-landing/
└── tailwind.config.js ← Extended with shared tokens
```

## Updating Tokens

To add/change tokens:

1. **Edit source:** `shared/design-tokens/tokens.js`
2. **Update TS version:** `shared/design-tokens/tokens.ts`
3. **Regenerate CSS:** `admin/src/theme/design-tokens.css` (if needed)
4. **Clear caches:**
   ```bash
   cd admin && npm run dev     # Vite will auto-detect
   cd mobile && npm start      # Expo will rebuild
   cd roots-landing && npm run dev  # Tailwind will regenerate
   ```

### Brand Color Token Lock

⚠️ **These tokens should NEVER be changed:**

| Token             | Value   | Usage                  |
| ----------------- | ------- | ---------------------- |
| `roots-blue-600`  | #185FA5 | Primary CTA buttons    |
| `roots-blue-800`  | #0C447C | Sidebar, dark surfaces |
| `roots-green-600` | #3B6D11 | Success indicators     |
| `roots-amber-600` | #BA7517 | Warning indicators     |
| `roots-red-600`   | #A32D2D | Error indicators       |

---

## Common Issues

### Issue: Colors not updating in app

**Solution:** Clear app caches and rebuild:

```bash
# Expo: Clear and rebuild
cd mobile && expo start -c

# Vite: Clear dist/ and rebuild
cd admin && rm -r dist && npm run dev

# Tailwind: Remove .tailwindcss cache
cd roots-landing && rm -rf .next node_modules/.cache && npm run dev
```

### Issue: Can't import from shared tokens

**Solution:** Ensure path is correct from each app location:

- From mobile: `../../../shared/design-tokens/tokens.js`
- From admin: `../../../shared/design-tokens/tokens.js`
- From landing: `../../shared/design-tokens/tokens.js`

### Issue: TypeScript errors in admin

**Solution:** Use `.js` imports, not `.ts`:

```javascript
// ✓ Works
const tokens = require("../../shared/design-tokens/tokens.js");

// ✗ Error in Vite
import tokens from "../../shared/design-tokens/tokens.ts";
```

---

## Best Practices

1. **Always use token values** — Never hardcode colors, spacing, or sizes
2. **Use semantic naming** — `--roots-blue-600` not `--primary-color`
3. **Consistency across apps** — Same token value on mobile, web, and admin
4. **Responsive tokens** — Apply spacing/sizing scales uniformly
5. **Component presets** — Use `ComponentStyles.*` in React Native for DRY code
6. **CSS custom properties** — Use `var(--token-name)` for dynamic theming
7. **Tailwind classes** — Prefer over inline styles in React/landing

---

## Support

For questions on token usage:

- Mobile (React Native): See `DesignTokens.js` exports and examples
- Admin (React/CSS): See `design-tokens.css` root variables
- Landing (Tailwind): See `tailwind.config.js` color and spacing extensions

Last updated: April 2026
