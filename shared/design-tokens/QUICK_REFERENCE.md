# ROOTS Design Tokens - Quick Reference Card

**Single source of truth for design system.** All files synced from `shared/design-tokens/`

## Brand Colors (LOCKED)

| Token         |   Hex   | Usage                   |
| :------------ | :-----: | :---------------------- |
| **Blue-600**  | #185FA5 | Primary buttons & links |
| **Blue-800**  | #0C447C | Sidebar background      |
| **Green-600** | #3B6D11 | ✓ Success               |
| **Amber-600** | #BA7517 | ⚠ Warning               |
| **Red-600**   | #A32D2D | ✗ Error                 |
| **Gray-900**  | #1A1A1A | Primary text            |

## Typography Scale

| Size     | px  | Usage               |
| :------- | :-: | :------------------ |
| **2xl**  | 28  | Page titles         |
| **xl**   | 22  | Section headings    |
| **lg**   | 18  | Subheadings         |
| **base** | 15  | Body text (default) |
| **sm**   | 13  | Labels, small text  |
| **xs**   | 12  | Captions, badges    |

**Weights:** 400 (normal) | 500 (medium)

## Spacing (8px base)

|   px   | Scale |
| :----: | :---: |
|   4    |   1   |
|   8    |   2   |
|   12   |   3   |
| **16** | **4** |
|   20   |   5   |
|   24   |   6   |
|   32   |   8   |
|   40   |  10   |
|   48   |  12   |

## Border Radius

| Name     | px  | Usage           |
| :------- | :-: | :-------------- |
| **sm**   |  6  | Badges, tags    |
| **md**   |  8  | Buttons, inputs |
| **lg**   | 12  | Cards           |
| **xl**   | 16  | Modals          |
| **full** |  ∞  | Pills, avatars  |

## Component Specs

### Primary Button

```
Height: 44px min  |  Radius: 8px md  |  Weight: 500
Bg: blue-600      |  Color: white    |  Hover: darken
```

### Card

```
Bg: white  |  Border: 0.5px gray-200  |  Radius: 12px lg
Padding: 16px  |  Shadow: optional
```

### Input

```
Height: 44px  |  Radius: 8px md  |  Border: 1px gray-200
Padding: 8-12px  |  Focus ring: 2px blue-400
```

### Badge

```
Radius: 6px sm  |  Size: 12px xs  |  Weight: 500
Padding: 4-12px  |  Semantic color bg
```

### Toast

```
Bg: white  |  Left border: 4px semantic  |  Radius: 8px
Auto-dismiss: 3-4s  |  Stack: top-right
```

## Import by Platform

### Mobile (React Native)

```javascript
import { COLORS, SPACING, ComponentStyles } from "../theme/DesignTokens";
```

### Admin (React + CSS)

```css
@import "./theme/design-tokens.css";
background: var(--roots-blue-600);
```

### Landing (Tailwind)

```jsx
className = "bg-roots-blue-600 px-4 py-3 rounded-md";
```

## Quick Dos & Don'ts

| ✓ DO                             | ✗ DON'T                  |
| :------------------------------- | :----------------------- |
| Use `--roots-blue-600`           | Hardcode `#185FA5`       |
| Use spacing scale 4 (16px)       | Random padding like 18px |
| Reference `var(--spacing-4)`     | Write `padding: 16px`    |
| Apply semantic colors            | Use random greens/reds   |
| Use component presets            | Create new button styles |
| Check DESIGN_SYSTEM_REFERENCE.md | Guess token values       |

## Files Location

```
shared/design-tokens/
├── tokens.js                    ← Main source
├── DESIGN_SYSTEM_REFERENCE.md   ← Full spec (this)
├── IMPLEMENTATION_GUIDE.md      ← How to use
└── README.md                    ← Overview
```

## One-Liners

- **Mobile:** StyleSheet-based tokens with presets
- **Admin:** CSS custom properties in `:root`
- **Landing:** Tailwind classes auto-mapped from tokens
- **All apps:** Same color, spacing, radius values

---

**Print this. Pin it. Share it.**  
_Last updated: April 2026_
