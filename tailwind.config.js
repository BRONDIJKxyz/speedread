/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'reader-bg': '#0a0a0a',
        'reader-text': '#d4d4d4',
        'reader-orp': '#c45c5c',
        'reader-guide': '#3a3a3a',
        'reader-highlight': 'rgba(196, 92, 92, 0.2)',
      },
      fontFamily: {
        'reader': ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
