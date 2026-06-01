/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1B3358",
        teal: {
          DEFAULT: "#00B4C5",
          dark: "#0099AA",
        },
      },
      fontFamily: {
        mono: ["var(--font-fira-code)", "'Fira Code'", "'Courier New'", "monospace"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
