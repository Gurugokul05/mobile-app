/**
 * ROOTS Design Tokens - React Native StyleSheet
 * Mobile app theme and component base styles
 *
 * Usage:
 *   import { Colors, Spacing, BorderRadius, ComponentStyles } from './DesignTokens';
 *   import { StyleSheet } from 'react-native';
 *
 *   const styles = StyleSheet.create({
 *     button: { ...ComponentStyles.primaryButton },
 *   });
 */

import { StyleSheet } from "react-native";

/* ============================================================================
   COLOR TOKENS (Brand Palette - LOCKED)
   ============================================================================ */

export const Colors = {
  // Blue palette (Primary)
  "blue-50": "#E6F1FB",
  "blue-100": "#B5D4F4",
  "blue-400": "#378ADD",
  "blue-600": "#185FA5", // primary action
  "blue-800": "#0C447C", // sidebar, dark surfaces
  "blue-900": "#042C53",

  // Semantic: Success
  "green-50": "#EAF3DE",
  "green-600": "#3B6D11",

  // Semantic: Warning
  "amber-50": "#FAEEDA",
  "amber-600": "#BA7517",

  // Semantic: Danger
  "red-50": "#FCEBEB",
  "red-600": "#A32D2D",

  // Gray palette (Neutral)
  "gray-50": "#F8F9FB", // page background
  "gray-100": "#F1F5FB", // table headers, skeleton bg
  "gray-200": "#E5E7EB", // borders
  "gray-500": "#6B7280", // secondary text
  "gray-900": "#1A1A1A", // primary text

  // Pure neutrals
  white: "#FFFFFF",
  black: "#000000",
};

/* ============================================================================
   TYPOGRAPHY SCALE
   ============================================================================ */

export const Typography = {
  // Font sizes (dp/pt)
  sizes: {
    xs: 12, // captions
    sm: 13, // labels
    base: 15, // body text
    lg: 18, // subheadings
    xl: 22, // section titles
    "2xl": 28, // page titles
  },

  // Font weights
  weights: {
    normal: "400",
    medium: "500",
  },

  // Line heights (scale factor of font size)
  lineHeights: {
    tight: 1.4,
    normal: 1.5,
    relaxed: 1.6,
  },

  // Preset text styles (for consistency across screens)
  styles: {
    heading1: {
      fontSize: 28,
      fontWeight: "500",
      lineHeight: 28 * 1.4,
      color: Colors["gray-900"],
    },
    heading2: {
      fontSize: 22,
      fontWeight: "500",
      lineHeight: 22 * 1.4,
      color: Colors["gray-900"],
    },
    heading3: {
      fontSize: 18,
      fontWeight: "500",
      lineHeight: 18 * 1.5,
      color: Colors["gray-900"],
    },
    body: {
      fontSize: 15,
      fontWeight: "400",
      lineHeight: 15 * 1.5,
      color: Colors["gray-900"],
    },
    bodySmall: {
      fontSize: 13,
      fontWeight: "400",
      lineHeight: 13 * 1.5,
      color: Colors["gray-900"],
    },
    caption: {
      fontSize: 12,
      fontWeight: "400",
      lineHeight: 12 * 1.4,
      color: Colors["gray-500"],
    },
    label: {
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 13 * 1.4,
      color: Colors["gray-900"],
    },
  },
};

/* ============================================================================
   SPACING SCALE (8px base unit for consistency)
   ============================================================================ */

export const Spacing = {
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

/* ============================================================================
   BORDER RADIUS
   ============================================================================ */

export const BorderRadius = {
  sm: 6, // badges, tags
  md: 8, // buttons, inputs
  lg: 12, // cards
  xl: 16, // modals, sheets
  full: 9999, // pills, avatars
};

/* ============================================================================
   COMPONENT BASE STYLES (StyleSheet for consistent reusability)
   ============================================================================ */

export const ComponentStyles = StyleSheet.create({
  /* -------- Cards -------- */
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderWidth: 0.5,
    borderColor: Colors["gray-200"],
  },

  cardInset: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    borderWidth: 0.5,
    borderColor: Colors["gray-200"],
    marginHorizontal: Spacing[4],
    marginVertical: Spacing[3],
  },

  /* -------- Buttons -------- */
  primaryButton: {
    backgroundColor: Colors["blue-600"],
    borderRadius: BorderRadius.md,
    minHeight: 44,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  primaryButtonText: {
    ...Typography.styles.label,
    color: Colors.white,
    fontWeight: "500",
  },

  secondaryButton: {
    backgroundColor: Colors["blue-50"],
    borderRadius: BorderRadius.md,
    minHeight: 44,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors["blue-400"],
  },

  secondaryButtonText: {
    ...Typography.styles.label,
    color: Colors["blue-600"],
    fontWeight: "500",
  },

  /* -------- Inputs -------- */
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    height: 44,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderWidth: 1,
    borderColor: Colors["gray-200"],
    fontSize: Typography.sizes.base,
    color: Colors["gray-900"],
  },

  textInputFocused: {
    borderColor: Colors["blue-400"],
  },

  /* -------- Status Badges -------- */
  badgeBase: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },

  badgeSuccess: {
    backgroundColor: Colors["green-50"],
  },

  badgeSuccessText: {
    ...Typography.styles.caption,
    color: Colors["green-600"],
    fontWeight: "500",
  },

  badgeWarning: {
    backgroundColor: Colors["amber-50"],
  },

  badgeWarningText: {
    ...Typography.styles.caption,
    color: Colors["amber-600"],
    fontWeight: "500",
  },

  badgeDanger: {
    backgroundColor: Colors["red-50"],
  },

  badgeDangerText: {
    ...Typography.styles.caption,
    color: Colors["red-600"],
    fontWeight: "500",
  },

  /* -------- Empty State -------- */
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[12],
  },

  emptyStateIcon: {
    width: 48,
    height: 48,
    marginBottom: Spacing[4],
  },

  emptyStateHeading: {
    ...Typography.styles.heading3,
    marginBottom: Spacing[2],
  },

  emptyStateSubtext: {
    ...Typography.styles.bodySmall,
    color: Colors["gray-500"],
    textAlign: "center",
  },

  /* -------- Divider -------- */
  divider: {
    height: 1,
    backgroundColor: Colors["gray-200"],
    marginVertical: Spacing[4],
  },

  /* -------- Spacing utilities -------- */
  spacingHorizontal: {
    paddingHorizontal: Spacing[4],
  },

  spacingVertical: {
    paddingVertical: Spacing[4],
  },

  spacingAll: {
    padding: Spacing[4],
  },

  /* -------- Containers -------- */
  screenContainer: {
    flex: 1,
    backgroundColor: Colors["gray-50"],
  },

  screenPadding: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* -------- Shadows (iOS style, will be ignored on Android) -------- */
  shadowSmall: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  shadowMedium: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  shadowLarge: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },

  /* -------- Row layouts -------- */
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rowCenter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

/* ============================================================================
   SEMANTIC COLOR OBJECTS (for status/state props)
   ============================================================================ */

export const SemanticColors = {
  success: {
    background: Colors["green-50"],
    text: Colors["green-600"],
    border: Colors["green-600"],
  },
  warning: {
    background: Colors["amber-50"],
    text: Colors["amber-600"],
    border: Colors["amber-600"],
  },
  danger: {
    background: Colors["red-50"],
    text: Colors["red-600"],
    border: Colors["red-600"],
  },
  info: {
    background: Colors["blue-50"],
    text: Colors["blue-600"],
    border: Colors["blue-600"],
  },
};

/* ============================================================================
   EXPORT THEME OBJECT (convenience)
   ============================================================================ */

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  components: ComponentStyles,
  semantic: SemanticColors,
};

export default Theme;
