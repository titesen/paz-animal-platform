import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#029501",
          hover: "#027a01",
          light: "#03b002",
        },
        secondary: {
          DEFAULT: "#E6F4E6",
        },
        accent: {
          DEFAULT: "#FF9F1C",
          hover: "#e08b15",
        },
        slate: {
          850: "#151f32",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
        heading: ["Outfit", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
