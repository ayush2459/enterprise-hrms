import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#3A66DB",
          dark: "#14141A",
          light: "#5B82E8",
        },
        accent: {
          DEFAULT: "#0EA5E9",
          soft: "#E0F2FE",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F6F7FB",
          sunken: "#EEF1F7",
        },
        ink: {
          DEFAULT: "#1D1D26",
          soft: "#585866",
          faint: "#9494A3",
        },
      },
      fontFamily: {
        display: ["Manrope", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(20, 20, 26, 0.04), 0 1px 12px rgba(20, 20, 26, 0.04)",
        lift: "0 8px 24px rgba(20, 20, 26, 0.08)",
        glow: "0 0 0 3px rgba(58, 102, 219, 0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(6px, -8px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        drift: "drift 7s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
