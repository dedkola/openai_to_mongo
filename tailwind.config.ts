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
        brand: {
          200: "#e0f2fe",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          800: "#075985",
        },
      },
    },
  },
  plugins: [],
};

export default config;
