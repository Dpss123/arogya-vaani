import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0A1128",
        cream: "#F9F6F0",
        teal: "#00E676",
        teal2: "#00B4D8",
        danger: "#FF4757",
        gold: "#C9A84C",
        purple: "#818cf8",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      animation: {
        "pulse-teal": "pulse-teal 2s ease-in-out infinite",
        "ticker": "ticker 25s linear infinite",
        "fadeUp": "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
      },
      keyframes: {
        "pulse-teal": {
          "0%,100%": { boxShadow: "0 0 8px #00E676" },
          "50%": { boxShadow: "0 0 24px #00E676" },
        },
        "ticker": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "fadeUp": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
