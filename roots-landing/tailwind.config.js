/**
 * ROOTS Landing Page - Tailwind Config with Design Tokens
 * Extends shared design tokens from design-system while preserving custom landing theme
 *
 * @type {import('tailwindcss').Config}
 */

// Import shared design tokens
const tokens = require("../../shared/design-tokens/tokens.js");

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      /* ====================================================================
         ROOTS DESIGN SYSTEM COLORS (Shared across all apps)
         ==================================================================== */
      colors: {
        // ROOTS brand palette (primary)
        "roots-blue": {
          50: tokens.COLORS["roots-blue-50"],
          100: tokens.COLORS["roots-blue-100"],
          400: tokens.COLORS["roots-blue-400"],
          600: tokens.COLORS["roots-blue-600"],
          800: tokens.COLORS["roots-blue-800"],
          900: tokens.COLORS["roots-blue-900"],
        },

        // ROOTS semantic colors
        "roots-green": {
          50: tokens.COLORS["roots-green-50"],
          600: tokens.COLORS["roots-green-600"],
        },
        "roots-amber": {
          50: tokens.COLORS["roots-amber-50"],
          600: tokens.COLORS["roots-amber-600"],
        },
        "roots-red": {
          50: tokens.COLORS["roots-red-50"],
          600: tokens.COLORS["roots-red-600"],
        },
        "roots-gray": {
          50: tokens.COLORS["roots-gray-50"],
          100: tokens.COLORS["roots-gray-100"],
          200: tokens.COLORS["roots-gray-200"],
          500: tokens.COLORS["roots-gray-500"],
          900: tokens.COLORS["roots-gray-900"],
        },

        /* Landing page custom colors (preserved for heritage branding) */
        charcoal: "#1C1410",
        gold: "#C8862A",
        ivory: "#E8D5B0",
        parchment: "#FAF6EE",
        terracotta: "#8B2E16",
        cream: "#FFF8EC",
        ink: "#2C1E16",
      },

      /* ====================================================================
         ROOTS DESIGN SYSTEM - TYPOGRAPHY SCALE
         ==================================================================== */
      fontSize: {
        xs: tokens.TYPOGRAPHY.sizes["text-xs"] + "px",
        sm: tokens.TYPOGRAPHY.sizes["text-sm"] + "px",
        base: tokens.TYPOGRAPHY.sizes["text-base"] + "px",
        lg: tokens.TYPOGRAPHY.sizes["text-lg"] + "px",
        xl: tokens.TYPOGRAPHY.sizes["text-xl"] + "px",
        "2xl": tokens.TYPOGRAPHY.sizes["text-2xl"] + "px",
      },

      fontWeight: {
        normal: tokens.TYPOGRAPHY.weights.normal,
        medium: tokens.TYPOGRAPHY.weights.medium,
      },

      lineHeight: {
        tight: "1.4",
        normal: "1.5",
        relaxed: "1.6",
      },

      /* ====================================================================
         ROOTS DESIGN SYSTEM - SPACING SCALE (8px base)
         ==================================================================== */
      spacing: {
        0: "0",
        1: tokens.SPACING_PX["4px"],
        2: tokens.SPACING_PX["8px"],
        3: tokens.SPACING_PX["12px"],
        4: tokens.SPACING_PX["16px"],
        5: tokens.SPACING_PX["20px"],
        6: tokens.SPACING_PX["24px"],
        8: tokens.SPACING_PX["32px"],
        10: tokens.SPACING_PX["40px"],
        12: tokens.SPACING_PX["48px"],
      },

      /* ====================================================================
         ROOTS DESIGN SYSTEM - BORDER RADIUS
         ==================================================================== */
      borderRadius: {
        sm: tokens.BORDER_RADIUS["radius-sm"] + "px", // badges, tags
        md: tokens.BORDER_RADIUS["radius-md"] + "px", // buttons, inputs
        lg: tokens.BORDER_RADIUS["radius-lg"] + "px", // cards
        xl: tokens.BORDER_RADIUS["radius-xl"] + "px", // modals, sheets
        full: tokens.BORDER_RADIUS["radius-full"] + "px", // pills, avatars
      },

      /* ====================================================================
         COMPONENT-SPECIFIC UTILITIES
         ==================================================================== */
      minHeight: {
        11: "44px", // ROOTS standard button height
      },

      /* ====================================================================
         LANDING PAGE CUSTOM THEME EXTENSIONS
         ==================================================================== */
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        body: ['"DM Sans"', "sans-serif"],
        accent: ['"Cormorant Garamond"', "serif"],
      },

      boxShadow: {
        luxe: "0 24px 80px rgba(28, 20, 16, 0.16)",
        glow: "0 0 0 1px rgba(200, 134, 42, 0.25), 0 20px 60px rgba(200, 134, 42, 0.16)",
      },

      backgroundImage: {
        grain:
          "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, rgba(255,248,236,0.12), rgba(255,248,236,0.02))",
      },

      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(0, -18px, 0) scale(1.05)" },
        },
        drift: {
          "0%": { transform: "translate3d(-4%, -2%, 0)" },
          "50%": { transform: "translate3d(4%, 3%, 0)" },
          "100%": { transform: "translate3d(-4%, -2%, 0)" },
        },
        shimmer: {
          "0%": { opacity: 0.2 },
          "50%": { opacity: 0.45 },
          "100%": { opacity: 0.2 },
        },
      },

      animation: {
        floatSlow: "floatSlow 10s ease-in-out infinite",
        drift: "drift 18s ease-in-out infinite",
        shimmer: "shimmer 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
