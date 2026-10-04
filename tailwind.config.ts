import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ice: {
          50: "#f2f8fc",
          100: "#e2f0f9",
          200: "#c2e0f3",
          300: "#8fc8e8",
          400: "#55a8d8",
          500: "#2f8bc4",
          600: "#1f6da3",
          700: "#1b5784",
          800: "#1a4a6e",
          900: "#173e5c",
          950: "#0d2438",
        },
        polar: {
          bg: "#08131f",
          panel: "#0e2032",
          border: "#1c3450",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
