# ROOTS Design System - Complete Token Reference

Centralized design tokens for the ROOTS marketplace platform. Version: 1.0.0

## Directory Structure

```
ROOTS Project (e:\AGG\final mobile\)
├── shared/design-tokens/              ← Single source of truth
│   ├── tokens.js                      ← Core token definitions (CommonJS)
│   ├── tokens.ts                      ← TypeScript definitions
│   ├── index.js                       ← Export index
│   ├── README.md                      ← Overview
│   ├── IMPLEMENTATION_GUIDE.md        ← How to use tokens
│   └── DESIGN_SYSTEM_REFERENCE.md     ← This file
│
├── mobile/src/theme/
│   ├── DesignTokens.js                ← React Native StyleSheet version
│   └── colors.js                      ← (Existing)
│
├── admin/src/theme/
│   └── design-tokens.css              ← CSS custom properties
│
└── roots-landing/
    └── tailwind.config.js             ← Extended with shared tokens
```

---

## Token Categories

### 1. COLOR PALETTE

#### Blue (Primary Brand)

```
--roots-blue-50   #E6F1FB   ← Light backgrounds
--roots-blue-100  #B5D4F4   ← Hover states
--roots-blue-400  #378ADD   ← Secondary accents
--roots-blue-600  #185FA5   ← PRIMARY ACTION (buttons, links)
--roots-blue-800  #0C447C   ← SIDEBAR, DARK SURFACES
--roots-blue-900  #042C53   ← Deep backgrounds
```

#### Semantic - Success

```
--roots-green-50   #EAF3DE   ← Success background
--roots-green-600  #3B6D11   ← Success text/border
```

#### Semantic - Warning

```
--roots-amber-50   #FAEEDA   ← Warning background
--roots-amber-600  #BA7517   ← Warning text/border
```

#### Semantic - Error/Danger

```
--roots-red-50     #FCEBEB   ← Error background
--roots-red-600    #A32D2D   ← Error text/border
```

#### Gray (Neutral/Text)

```
--roots-gray-50    #F8F9FB   ← Page background
--roots-gray-100   #F1F5FB   ← Table headers, skeleton
--roots-gray-200   #E5E7EB   ← Borders, dividers
--roots-gray-500   #6B7280   ← Secondary text (disabled, hints)
--roots-gray-900   #1A1A1A   ← Primary text (headings, body)
```

---

### 2. TYPOGRAPHY

| Scale    | Size | Usage                           | Font Weight  |
| -------- | ---- | ------------------------------- | ------------ |
| **2xl**  | 28px | Page titles                     | 500 (medium) |
| **xl**   | 22px | Section headings                | 400 or 500   |
| **lg**   | 18px | Subheadings, large labels       | 400 or 500   |
| **base** | 15px | Body text (default)             | 400          |
| **sm**   | 13px | Small text, labels, helper text | 400          |
| **xs**   | 12px | Captions, badges                | 400 or 500   |

**Font Weights:** Only 400 (normal) and 500 (medium) are used.

---

### 3. SPACING SCALE (8px base unit)

All spacing should use multiples of 8px for consistency and visual rhythm.

| Scale | Value |
| ----- | ----- |
| 0     | 0px   |
| 1     | 4px   |
| 2     | 8px   |
| 3     | 12px  |
| 4     | 16px  |
| 5     | 20px  |
| 6     | 24px  |
| 8     | 32px  |
| 10    | 40px  |
| 12    | 48px  |

**Common uses:**

- Between sections: 32px (scale 8)
- Between components: 16px (scale 4)
- Component padding: 16px (scale 4)
- Tight spacing: 8px (scale 2)

---

### 4. BORDER RADIUS

| Name     | Value  | Usage                            |
| -------- | ------ | -------------------------------- |
| **sm**   | 6px    | Status badges, tags              |
| **md**   | 8px    | Buttons, inputs, small elements  |
| **lg**   | 12px   | Cards, moderate-sized components |
| **xl**   | 16px   | Modals, large sheets, drawers    |
| **full** | 9999px | Pills, avatars, fully rounded    |

---

### 5. COMPONENT PATTERNS

#### Status Badge

- Border radius: 6px (`--radius-sm`)
- Font size: 12px (`--text-xs`)
- Font weight: 500 (medium)
- Padding: 4px vertical × 12px horizontal
- Background: Semantic color (success/warning/danger/info)
- Example: `Approved`, `Pending`, `Rejected`

#### Card

- Background: White
- Border: 0.5px solid #E5E7EB (`--roots-gray-200`)
- Border radius: 12px (`--radius-lg`)
- Padding: 16px (`--spacing-4`)
- Shadow: Optional, 0 1px 2px rgba(0,0,0,0.05)

#### Primary Button

- Background: #185FA5 (`--roots-blue-600`)
- Text color: White
- Border radius: 8px (`--radius-md`)
- Min height: 44px (tap target)
- Padding: 12px vertical × 16px horizontal
- Font weight: 500 (medium)
- Hover: Slightly darker (#145194)
- Active: Even darker (#0d3a5a)
- Disabled: Gray (--roots-gray-200 bg, --roots-gray-500 text)

#### Input Field

- Background: White
- Border: 1px solid #E5E7EB (`--roots-gray-200`)
- Border radius: 8px (`--radius-md`)
- Height: 44px (tap target)
- Padding: 8px vertical × 12px horizontal
- Focus ring: 2px #378ADD (`--roots-blue-400`)
- Font size: 15px (`--text-base`)

#### Toast Notification

- Background: White
- Border: 4px left border (semantic color)
- Border radius: 8px (`--radius-md`)
- Padding: 12px vertical × 16px horizontal
- Auto-dismiss: 3-4 seconds
- Stack: Top-right position
- Shadow: Elevation 4+ for visibility

#### Empty State

- Centered layout (flex center)
- Icon: 48px × 48px (gray #E5E7EB)
- Heading: 18px (`--text-lg`) + 500 weight
- Subtext: 14px (gray #6B7280)
- Optional: Action button below text
- Padding: 48px (`--spacing-12`) all sides

#### Skeleton Loader

- Background: #F1F5FB (`--roots-gray-100`)
- Border radius: 8px (`--radius-md`)
- Animation: Shimmer (left-to-right wave, 1.2s loop)
- Matches: Target component's dimensions

---

## Usage by Platform

### Mobile (React Native)

```javascript
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  ComponentStyles,
} from "../theme/DesignTokens";

// Colors
const primaryColor = COLORS["blue-600"];
const textColor = COLORS["gray-900"];

// Spacing
const padding = SPACING[4]; // 16px

// Component preset
const buttonStyle = ComponentStyles.primaryButton;
const cardStyle = ComponentStyles.card;
```

### Admin (React + CSS)

```css
:root {
  /* Colors */
  --roots-blue-600: #185fa5;
  --roots-gray-900: #1a1a1a;

  /* Spacing */
  --spacing-4: 16px;

  /* Typography */
  --text-lg: 18px;
  --font-medium: 500;
}

.my-button {
  background-color: var(--roots-blue-600);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
}
```

### Landing (Tailwind)

```jsx
<button
  className="
  bg-roots-blue-600
  text-white
  px-4 py-3
  rounded-md
  min-h-11
  font-medium
  hover:bg-blue-700
"
>
  Action
</button>
```

---

## Design Principles

1. **Consistency** — Same token values across all apps (iOS, Android, web)
2. **Simplicity** — Limited palette (5 semantic colors + grays)
3. **Accessibility** — Sufficient contrast (WCAG AA minimum: 4.5:1)
4. **Scalability** — 8px base unit allows proportional scaling
5. **Performance** — CSS custom properties enable efficient theming
6. **Flexibility** — Supports light/dark modes and future themes

---

## Brand Color Guarantees

These 6 tokens define the ROOTS brand and **must not be changed**:

| Token               | Hex     | Lock Reason                               |
| ------------------- | ------- | ----------------------------------------- |
| `--roots-blue-600`  | #185FA5 | Primary action color (buttons, links)     |
| `--roots-blue-800`  | #0C447C | Sidebar identity                          |
| `--roots-green-600` | #3B6D11 | Success indicator (universal expectation) |
| `--roots-amber-600` | #BA7517 | Warning indicator (universal expectation) |
| `--roots-red-600`   | #A32D2D | Error indicator (universal expectation)   |
| `--roots-gray-900`  | #1A1A1A | Text hierarchy foundation                 |

---

## Common Implementation Patterns

### Badges (Status Indicators)

**React:**

```jsx
// From design tokens
const statusColors = {
  approved: { bg: "#EAF3DE", text: "#3B6D11" },
  pending: { bg: "#FAEEDA", text: "#BA7517" },
  rejected: { bg: "#FCEBEB", text: "#A32D2D" },
};

<span
  style={{
    backgroundColor: statusColors.approved.bg,
    color: statusColors.approved.text,
    padding: "4px 12px",
    borderRadius: "6px",
  }}
>
  Approved
</span>;
```

### Form Controls

**HTML/CSS:**

```css
input,
textarea,
select {
  border: 1px solid var(--roots-gray-200);
  border-radius: var(--radius-md);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--text-base);
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--roots-blue-400);
  box-shadow: 0 0 0 2px var(--roots-blue-400);
}
```

### Data Tables

**CSS:**

```css
table thead {
  background-color: var(--roots-gray-100);
  color: var(--roots-gray-900);
  font-size: var(--text-sm);
  font-weight: 500;
}

table td {
  padding: var(--spacing-3);
  border-bottom: 0.5px solid var(--roots-gray-200);
  font-size: var(--text-base);
}
```

### Cards with Status

**React:**

```jsx
const statusColor = SEMANTIC[status]; // 'success', 'warning', 'danger'

<div
  style={{
    backgroundColor: "white",
    borderRadius: "12px",
    borderLeft: `4px solid ${statusColor.border}`,
    padding: "16px",
  }}
>
  {content}
</div>;
```

---

## Migration Guide (If updating existing styles)

### Step 1: Identify hardcoded values

```diff
- backgroundColor: '#185FA5'
+ backgroundColor: 'var(--roots-blue-600)' /* CSS */
+ backgroundColor: COLORS['blue-600'] /* React Native */
```

### Step 2: Replace with token references

```diff
- padding: '16px'
+ padding: 'var(--spacing-4)' /* CSS */
+ padding: Spacing[4] /* React Native */
```

### Step 3: Use semantic colors for status

```diff
- backgroundColor: status === 'error' ? '#FFE6E6' : '#E8F5E9'
+ backgroundColor: SEMANTIC[status].background
+ color: SEMANTIC[status].text
```

---

## Version History

| Version | Date       | Changes                       |
| ------- | ---------- | ----------------------------- |
| 1.0.0   | April 2026 | Initial design system release |

---

## Contact & Questions

For design token questions or updates:

- Update source: `shared/design-tokens/tokens.js`
- Request changes: Document rationale in GitHub issue
- Validate usage: Use IMPLEMENTATION_GUIDE.md

---

**Last Updated:** April 12, 2026  
**Status:** Active (All apps using shared tokens)
