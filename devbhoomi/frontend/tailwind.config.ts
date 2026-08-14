import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],

  theme: {
    extend: {
      colors: {
        bg: "#FCFBF8",
        cream: "#FFF8F0",

        maroon: {
          DEFAULT: "#7A1E3A",
          dark: "#5C1629",
        },

        forest: {
          DEFAULT: "#305943",
          dark: "#213E30",
        },

        gold: {
          DEFAULT: "#D4AF37",
          soft: "#E8CD7A",
        },

        ink: "#1B1B1B",
        muted: "#666666",
        line: "#EFE8DD",

        // Component specific colors
        brand: {
          burgundy: "#6B1F2A",
          gold: "#A9792C",
          dark: "#241F1C",
          cream: "#FBF8F3",
        },
      },

      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        heading: ["Cormorant Garamond", "serif"],
        hindi: ["Tiro Devanagari Hindi", "serif"],
        button: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Cormorant Garamond", "serif"], // Added mapping for font-display
      },

      fontSize: {
        // Fluid typography using clamp(min, preferred, max)
        "fluid-hero": "clamp(2.25rem, 6vw, 4.5rem)",
        "fluid-stat": "clamp(2.5rem, 7vw, 5rem)",
        "fluid-title": "clamp(1.25rem, 3.5vw, 2.25rem)",
        "fluid-body": "clamp(0.875rem, 1.8vw, 1.125rem)",
        "fluid-sm": "clamp(0.75rem, 1.2vw, 0.95rem)",
      },

      borderRadius: {
        card: "22px",
      },
    },
  },

  plugins: [],
} satisfies Config;