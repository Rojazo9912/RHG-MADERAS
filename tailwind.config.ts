import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brown: {
          dark: "#2c1810",
          DEFAULT: "#4a2f1f",
        },
        forest: {
          DEFAULT: "#2d5016",
        },
        amber: {
          light: "#e8a84a",
          DEFAULT: "#c8852a",
        },
        cream: "#faf6f0",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
