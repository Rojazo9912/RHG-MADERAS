import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brown: {
          dark: "#1a0f08",
          DEFAULT: "#3d2314",
          mid: "#5c3520",
          light: "#8b5a2b",
        },
        forest: {
          dark: "#1a3009",
          DEFAULT: "#2d5016",
          light: "#4a7a25",
        },
        amber: {
          light: "#f0c060",
          DEFAULT: "#d4942e",
          dark: "#a86e1a",
        },
        cream: {
          DEFAULT: "#faf6f0",
          dark: "#f0e8dc",
        },
        wood: "#c8a882",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      backgroundImage: {
        "wood-grain": "url('/wood-texture.jpg')",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
