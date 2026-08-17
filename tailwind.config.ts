import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "9.5": "2.375rem",
      },
      colors: {
        black: "#1a1a1a",
        ink: "#1a1a1a",
        white: "#ffffff",
        "bg-light": "#f8f8f6",
        gold: {
          DEFAULT: "#c9a96e",
          hover: "#b8935a",
        },
        muted: "#888888",
        border: "#e8e8e8",
        whatsapp: "#25D366",
        "whatsapp-dark": "#128C7E",
        success: "#27ae60",
        warning: "#f39c12",
        danger: "#e74c3c",
        info: "#2980b9",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        toastIn: {
          from: { opacity: "0", transform: "translateX(110%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        waPulse: {
          "0%, 100%": { boxShadow: "0 4px 20px rgba(37,211,102,.4)" },
          "50%": { boxShadow: "0 4px 42px rgba(37,211,102,.75)" },
        },
        chatUp: {
          from: { opacity: "0", transform: "translateY(14px) scale(.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        dropIn: {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn .2s ease",
        toastIn: "toastIn .35s ease",
        waPulse: "waPulse 2.5s infinite",
        chatUp: "chatUp .3s ease",
        dropIn: "dropIn .2s ease",
      },
    },
  },
  plugins: [],
};
export default config;
