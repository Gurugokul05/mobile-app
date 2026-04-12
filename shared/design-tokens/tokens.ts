/**
 * ROOTS Design Tokens - TypeScript Version
 * Single source of truth for all design system tokens
 *
 * Import and use in TypeScript/React projects
 */

/* ============================================================================
   COLOR TOKENS (Brand Palette - LOCKED, no changes)
   ============================================================================ */

export interface ColorTokens {
  // Blue palette
  "roots-blue-50": string;
  "roots-blue-100": string;
  "roots-blue-400": string;
  "roots-blue-600": string;
  "roots-blue-800": string;
  "roots-blue-900": string;
  // Green (success)
  "roots-green-50": string;
  "roots-green-600": string;
  // Amber (warning)
  "roots-amber-50": string;
  "roots-amber-600": string;
  // Red (danger)
  "roots-red-50": string;
  "roots-red-600": string;
  // Gray (neutral)
  "roots-gray-50": string;
  "roots-gray-100": string;
  "roots-gray-200": string;
  "roots-gray-500": string;
  "roots-gray-900": string;
}

export const COLORS: ColorTokens = {
  "roots-blue-50": "#E6F1FB",
  "roots-blue-100": "#B5D4F4",
  "roots-blue-400": "#378ADD",
  "roots-blue-600": "#185FA5",
  "roots-blue-800": "#0C447C",
  "roots-blue-900": "#042C53",
  "roots-green-50": "#EAF3DE",
  "roots-green-600": "#3B6D11",
  "roots-amber-50": "#FAEEDA",
  "roots-amber-600": "#BA7517",
  "roots-red-50": "#FCEBEB",
  "roots-red-600": "#A32D2D",
  "roots-gray-50": "#F8F9FB",
  "roots-gray-100": "#F1F5FB",
  "roots-gray-200": "#E5E7EB",
  "roots-gray-500": "#6B7280",
  "roots-gray-900": "#1A1A1A",
};

/* ============================================================================
   TYPOGRAPHY
   ============================================================================ */

export interface TypographySizes {
  "text-xs": number;
  "text-sm": number;
  "text-base": number;
  "text-lg": number;
  "text-xl": number;
  "text-2xl": number;
}

export interface TypographyWeights {
  normal: number;
  medium: number;
}

export interface Typography {
  sizes: TypographySizes;
  weights: TypographyWeights;
}

export const TYPOGRAPHY: Typography = {
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
   SPACING
   ============================================================================ */

export interface Spacing {
  [key: number]: number;
}

export const SPACING: Spacing = {
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

export const SPACING_PX: { [key: string]: number } = {
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

export interface BorderRadius {
  "radius-sm": number;
  "radius-md": number;
  "radius-lg": number;
  "radius-xl": number;
  "radius-full": number;
}

export const BORDER_RADIUS: BorderRadius = {
  "radius-sm": 6,
  "radius-md": 8,
  "radius-lg": 12,
  "radius-xl": 16,
  "radius-full": 9999,
};

/* ============================================================================
   SEMANTIC COLORS
   ============================================================================ */

export interface SemanticColorSet {
  background: string;
  text: string;
  border: string;
}

export interface Semantic {
  success: SemanticColorSet;
  warning: SemanticColorSet;
  danger: SemanticColorSet;
  info: SemanticColorSet;
}

export const SEMANTIC: Semantic = {
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
   COMPONENT PRESETS
   ============================================================================ */

export interface ComponentPreset {
  [key: string]: string | number;
}

export interface Components {
  statusBadge: ComponentPreset;
  card: ComponentPreset;
  primaryButton: ComponentPreset;
  input: ComponentPreset;
  toast: ComponentPreset;
  emptyState: ComponentPreset;
  skeleton: ComponentPreset;
}

export const COMPONENTS: Components = {
  statusBadge: {
    borderRadius: BORDER_RADIUS["radius-sm"],
    fontSize: TYPOGRAPHY.sizes["text-xs"],
    fontWeight: TYPOGRAPHY.weights.medium,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: BORDER_RADIUS["radius-lg"],
    padding: 16,
    borderWidth: 0.5,
    borderColor: COLORS["roots-gray-200"],
  },
  primaryButton: {
    backgroundColor: COLORS["roots-blue-600"],
    borderRadius: BORDER_RADIUS["radius-md"],
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: BORDER_RADIUS["radius-md"],
    height: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS["roots-gray-200"],
  },
  toast: {
    backgroundColor: "#FFFFFF",
    borderRadius: BORDER_RADIUS["radius-md"],
    borderLeftWidth: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    duration: 3000,
  },
  emptyState: {
    iconSize: 48,
    headingSize: TYPOGRAPHY.sizes["text-lg"],
    subtextSize: 14,
    subtextColor: COLORS["roots-gray-500"],
    spacing: 16,
  },
  skeleton: {
    backgroundColor: COLORS["roots-gray-100"],
    borderRadius: BORDER_RADIUS["radius-md"],
  },
};

/* ============================================================================
   DESIGN SYSTEM EXPORT
   ============================================================================ */

export interface DesignSystem {
  colors: ColorTokens;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  components: Components;
  semantic: Semantic;
}

export const DesignSystem: DesignSystem = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  components: COMPONENTS,
  semantic: SEMANTIC,
};

export default DesignSystem;
