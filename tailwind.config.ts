import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme palette
        bg: "#0b0f14",
        surface: "#141b24",
        "surface-2": "#1c2630",
        border: "#27323e",
        muted: "#8a98a8",
        text: "#e7edf3",
        accent: "#3b82f6",
        "accent-strong": "#2563eb",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
