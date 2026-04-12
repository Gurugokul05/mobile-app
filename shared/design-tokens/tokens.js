/**
 * ROOTS Design System - Shared Token Definitions
 * Single source of truth for colors, spacing, typography, and component patterns
 * Used across: mobile (React Native), admin (React + Vite), landing (React + Tailwind)
 */

/* ============================================================================
   COLOR TOKENS (Brand Palette - LOCKED, no changes)
   ============================================================================ */

const COLORS = {
  // Blue palette (primary)
  "roots-blue-50": "#E6F1FB",
  "roots-blue-100": "#B5D4F4",
  "roots-blue-400": "#378ADD",
  "roots-blue-600": "#185FA5", // primary action
  "roots-blue-800": "#0C447C", // sidebar, dark surfaces
  "roots-blue-900": "#042C53",

  // Semantic: Success
  "roots-green-50": "#EAF3DE",
  "roots-green-600": "#3B6D11",

  // Semantic: Warning
  "roots-amber-50": "#FAEEDA",
  "roots-amber-600": "#BA7517",

  // Semantic: Danger/Error
  "roots-red-50": "#FCEBEB",
  "roots-red-600": "#A32D2D",

  // Gray palette (neutral)
  "roots-gray-50": "#F8F9FB", // page bg
  "roots-gray-100": "#F1F5FB", // table headers
  "roots-gray-200": "#E5E7EB", // borders
  "roots-gray-500": "#6B7280", // secondary text
  "roots-gray-900": "#1A1A1A", // primary text
};

/* ============================================================================
   TYPOGRAPHY SCALE
   ============================================================================ */

const TYPOGRAPHY = {
  sizes: {
    "text-xs": 12,
    "text-sm": 13,
    "text-base": 15,
    "text-lg": 18,
    "text-xl": 22,
    "text-2xl": 28,
  },
  weights: {
    normal: 400,
    medium: 500,
  },
};

/* ============================================================================
   SPACING SCALE (8px base unit)
   ============================================================================ */

const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
};

const SPACING_PX = {
  "0px": 0,
  "4px": 4,
  "8px": 8,
  "12px": 12,
  "16px": 16,
  "20px": 20,
  "24px": 24,
  "32px": 32,
  "40px": 40,
  "48px": 48,
};

/* ============================================================================
   BORDER RADIUS
   ============================================================================ */

const BORDER_RADIUS = {
  "radius-sm": 6, // badges/tags
  "radius-md": 8, // buttons/inputs
  "radius-lg": 12, // cards
  "radius-xl": 16, // modals/sheets
  "radius-full": 9999, // pills/avatars
};

/* ============================================================================
   COMPONENT PATTERNS & PRESET STYLES
   ============================================================================ */

const COMPONENTS = {
  // Status Badge: 6px radius pill, 12px font, semantic color bg
  statusBadge: {
    borderRadius: BORDER_RADIUS["radius-sm"],
    fontSize: TYPOGRAPHY.sizes["text-xs"],
    fontWeight: TYPOGRAPHY.weights.medium,
    paddingHorizontal: SPACING_PX["12px"],
    paddingVertical: SPACING_PX["4px"],
  },

  // Card: white bg, 0.5px border, 12px radius, 16px padding
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: BORDER_RADIUS["radius-lg"],
    padding: SPACING_PX["16px"],
    borderWidth: 0.5,
    borderColor: COLORS["roots-gray-200"],
  },

  // Primary Button: 44px min height, 8px radius
  primaryButton: {
    backgroundColor: COLORS["roots-blue-600"],
    borderRadius: BORDER_RADIUS["radius-md"],
    minHeight: 44,
    paddingHorizontal: SPACING_PX["16px"],
    paddingVertical: SPACING_PX["12px"],
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Input: white bg, 1px border, 8px radius, 44px height, 2px focus ring
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: BORDER_RADIUS["radius-md"],
    height: 44,
    paddingHorizontal: SPACING_PX["12px"],
    paddingVertical: SPACING_PX["8px"],
    borderWidth: 1,
    borderColor: COLORS["roots-gray-200"],
  },

  // Toast: slide from top-right, 4px left border, white bg, 3s auto-dismiss
  toast: {
    backgroundColor: "#FFFFFF",
    borderRadius: BORDER_RADIUS["radius-md"],
    borderLeftWidth: 4,
    paddingHorizontal: SPACING_PX["16px"],
    paddingVertical: SPACING_PX["12px"],
    duration: 3000, // 3s auto-dismiss
  },

  // Empty State: centered icon 48px + heading 18px + subtext 14px gray
  emptyState: {
    iconSize: 48,
    headingSize: TYPOGRAPHY.sizes["text-lg"],
    subtextSize: 14,
    subtextColor: COLORS["roots-gray-500"],
    spacing: SPACING_PX["16px"],
  },

  // Skeleton: matches component dimensions with shimmer animation
  skeleton: {
    backgroundColor: COLORS["roots-gray-100"],
    borderRadius: BORDER_RADIUS["radius-md"],
  },
};

/* ============================================================================
   SEMANTIC COLOR MAPPINGS
   ============================================================================ */

const SEMANTIC = {
  success: {
    background: COLORS["roots-green-50"],
    text: COLORS["roots-green-600"],
    border: COLORS["roots-green-600"],
  },
  warning: {
    background: COLORS["roots-amber-50"],
    text: COLORS["roots-amber-600"],
    border: COLORS["roots-amber-600"],
  },
  danger: {
    background: COLORS["roots-red-50"],
    text: COLORS["roots-red-600"],
    border: COLORS["roots-red-600"],
  },
  info: {
    background: COLORS["roots-blue-50"],
    text: COLORS["roots-blue-600"],
    border: COLORS["roots-blue-600"],
  },
};

/* ============================================================================
   EXPORT
   ============================================================================ */

module.exports = {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SPACING_PX,
  BORDER_RADIUS,
  COMPONENTS,
  SEMANTIC,

  // Convenience exports
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  components: COMPONENTS,
  semantic: SEMANTIC,
};
