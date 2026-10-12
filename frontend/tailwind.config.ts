import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f0f5ec",
          100: "#dce8d2",
          200: "#b9d1a8",
          300: "#93b87d",
          400: "#6f9c5c",
          500: "#527d42",
          600: "#3f6432",
          700: "#345128",
          800: "#2a4121",
          900: "#1f3018",
        },
        coral: {
          50: "#fff4ef",
          100: "#ffe4d7",
          200: "#ffc7ab",
          300: "#ffa374",
          400: "#ff7f4d",
          500: "#ff6b3d",
          600: "#f04f23",
          700: "#c93a17",
          800: "#9f2e16",
          900: "#7f2816",
        },
        ink: {
          50: "#f6f7f8",
          100: "#eceef1",
          200: "#d4d8de",
          300: "#aab1bc",
          400: "#7d8694",
          500: "#5b6371",
          600: "#454b57",
          700: "#343941",
          800: "#23262c",
          900: "#15171b",
        },
        cream: "#faf3e6",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 8px 24px -8px rgba(37, 24, 15, 0.18)",
        card: "0 12px 32px -12px rgba(37, 24, 15, 0.28)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
