/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-noto)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        red: { korean: "#e94560" },
        navy: { deep: "#1a1a2e", mid: "#16213e" },
      },
    },
  },
  plugins: [],
}
