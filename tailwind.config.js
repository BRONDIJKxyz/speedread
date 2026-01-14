/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'reader-bg': '#000000',
        'reader-text': '#ffffff',
        'reader-orp': '#ff3333',
        'reader-guide': '#333333',
        'reader-highlight': 'rgba(255, 51, 51, 0.2)',
      },
      fontFamily: {
        'reader': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
