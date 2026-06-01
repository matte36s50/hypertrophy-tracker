import type { Config } from "tailwindcss";

// Design tokens for the "Light + Green" redesign. These are the shipping
// values from the design handoff (README → Design Tokens). The app is
// light-theme only; a dark palette exists in the handoff but isn't shipped.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#eef1ee", // app background behind cards
        surface: "#ffffff", // card background
        "surface-2": "#f1f4f1", // inset rows, inputs, secondary buttons
        "surface-3": "#e7ebe7", // progress-bar tracks, icon chips
        border: "#e2e7e3", // default 1px card/row border
        "border-strong": "#d2d9d4", // dashed outlines, grab handle
        text: "#16201b", // primary text / numbers
        "text-2": "#5b665f", // secondary text, meta lines
        "text-3": "#8b958e", // tertiary labels, captions
        accent: "#10a05a", // primary buttons, active nav, fills, rings
        "accent-text": "#0d7c46", // accent text readable on light surfaces
        "accent-soft": "rgba(16,160,90,0.12)", // accent tint backgrounds
        "accent-contrast": "#ffffff", // text/icons on a solid accent fill
        good: "#10a05a", // "in range" status
        warn: "#c8780b", // below MEV / near MRV fill
        "warn-text": "#a4630a", // readable warn text
        bad: "#d8403e", // over MRV, delete actions
        "bad-text": "#bf3331", // readable bad text
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
        btn: "14px",
        row: "13px",
        input: "12px",
        chip: "11px",
        badge: "9px",
      },
      boxShadow: {
        // Card elevation (light theme only).
        card: "0 1px 3px rgba(20,40,30,0.08)",
        // Dropdowns / popovers.
        pop: "0 12px 32px rgba(0,0,0,0.25)",
        // Bottom sheets.
        sheet: "0 -8px 40px rgba(0,0,0,0.35)",
      },
      keyframes: {
        sheetUp: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        sheetUp: "sheetUp .26s cubic-bezier(.22,.9,.3,1)",
      },
    },
  },
  plugins: [],
};

export default config;
