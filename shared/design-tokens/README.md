# ROOTS Design Tokens

Centralized design system tokens for the ROOTS marketplace platform. Single source of truth for colors, spacing, typography, and component patterns across all apps.

## Structure

- **tokens.js** — Core token definitions (colors, typography, spacing, border radius, component patterns, semantic colors)
- **CSS custom properties file** — For React apps (admin, landing)
- **React Native stylesheet** — For mobile app (Expo)
- **Tailwind config extension** — For landing page

## Usage

### Mobile App (React Native)

```javascript
import {
  COLORS,
  SPACING_PX,
  BORDER_RADIUS,
  COMPONENTS,
} from "@roots/design-tokens";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  button: {
    ...COMPONENTS.primaryButton,
    minHeight: 44,
  },
  card: {
    ...COMPONENTS.card,
  },
});
```

### Admin Dashboard (React + Vite)

```css
/* Import in App.css or any component */
@import "../../theme/design-tokens.css";

.button-primary {
  background-color: var(--roots-blue-600);
  border-radius: var(--radius-md);
  color: white;
  min-height: 44px;
}
```

### Landing Page (React + Tailwind)

```jsx
// Tailwind classes automatically available
<button className="bg-roots-blue-600 text-white rounded-md min-h-11">
  Click me
</button>
```

## Brand Color Tokens (LOCKED - Do Not Change)

| Token               | Value   | Usage                            |
| ------------------- | ------- | -------------------------------- |
| `--roots-blue-600`  | #185FA5 | Primary actions (buttons, links) |
| `--roots-blue-800`  | #0C447C | Sidebar, dark surfaces           |
| `--roots-blue-50`   | #E6F1FB | Light backgrounds                |
| `--roots-green-600` | #3B6D11 | Success states                   |
| `--roots-amber-600` | #BA7517 | Warning states                   |
| `--roots-red-600`   | #A32D2D | Error/danger states              |
| `--roots-gray-900`  | #1A1A1A | Primary text                     |
| `--roots-gray-500`  | #6B7280 | Secondary text                   |
| `--roots-gray-100`  | #F1F5FB | Table headers, light fills       |

## Typography Scale

- **xs**: 12px (captions)
- **sm**: 13px (labels, small text)
- **base**: 15px (body text)
- **lg**: 18px (subheadings)
- **xl**: 22px (section headings)
- **2xl**: 28px (page title)

Font weights: `400` (normal) and `500` (medium) only.

## Spacing

8px base unit:

- 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px

## Border Radius

- **6px** (`radius-sm`) — badges, tags
- **8px** (`radius-md`) — buttons, inputs
- **12px** (`radius-lg`) — cards
- **16px** (`radius-xl`) — modals, sheets
- **9999px** (`radius-full`) — pills, avatars

## Component Patterns

### Status Badge

- 6px border radius
- 12px font size (xs weight: medium)
- Semantic color backgrounds

### Card

- White background
- 12px border radius
- 16px padding
- 0.5px border (#E5E7EB)

### Primary Button

- 44px minimum height
- 8px border radius
- #185FA5 background
- White text
- Medium font weight

### Input

- 44px height
- 8px border radius
- 1px border (#E5E7EB)
- 2px #378ADD focus ring
- 12px horizontal padding

### Toast Notification

- White background
- 8px border radius
- 4px left border (semantic color)
- 3s auto-dismiss
- Slide from top-right

### Empty State

- Centered layout
- 48px icon
- 18px heading
- 14px subtext (#6B7280)
- Optional CTA button

### Skeleton Loader

- #F1F5FB background
- 8px border radius
- Shimmer animation (1.2s)
- Match target component dimensions

## Importing in Each App

### From mobile app:

```javascript
const tokens = require("../../../shared/design-tokens/tokens.js");
const { COLORS, SPACING_PX } = tokens;
```

### From admin/landing:

Place import path relative to each app's location.

## Future Updates

To add new tokens:

1. Update `shared/design-tokens/tokens.js`
2. Regenerate CSS custom properties if needed
3. Update tailwind.config.js
4. Clear all app caches and rebuild

**Important**: Never remove or rename existing brand color tokens. Only add new tokens.
