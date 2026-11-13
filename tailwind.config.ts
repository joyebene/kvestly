import type { Config } from "tailwindcss";

/**
 * KVESTY design tokens — derived from the official logo:
 * deep navy field, brushed-silver K, electric/royal blue ribbons.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#030818",
          900: "#050d24",
          850: "#07122f",
          800: "#0a1a40",
          700: "#0f2457",
          600: "#17326f",
        },
        electric: { DEFAULT: "#2f7bff", 400: "#5b9bff", 300: "#8bb8ff", 600: "#1f63e6" },
        royal: { DEFAULT: "#1d4ed8", 700: "#173fb0", 900: "#10286e" },
        silver: { DEFAULT: "#c9d3e3", 100: "#eef2f8", 200: "#dde4ef", 300: "#c9d3e3", 400: "#a6b3c8", 500: "#8393ad", 600: "#62718a" },
      },
      fontFamily: {
        display: ["'Sora Variable'", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["'Inter Variable'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "blue-sheen": "linear-gradient(135deg,#2f7bff 0%,#1d4ed8 100%)",
        "silver-sheen": "linear-gradient(180deg,#ffffff 0%,#c9d3e3 60%,#8393ad 100%)",
        "navy-radial": "radial-gradient(60% 50% at 70% 0%, rgba(47,123,255,.20) 0%, rgba(5,13,36,0) 70%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(91,155,255,.25), 0 10px 40px -12px rgba(47,123,255,.45)",
        card: "0 1px 0 0 rgba(255,255,255,.04) inset, 0 20px 40px -24px rgba(0,0,0,.6)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(14px)" }, "100%": { opacity: "1", transform: "none" } },
        orbit: { to: { transform: "rotate(360deg)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: {
        "fade-up": "fade-up .7s cubic-bezier(.2,.7,.2,1) both",
        orbit: "orbit 60s linear infinite",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
