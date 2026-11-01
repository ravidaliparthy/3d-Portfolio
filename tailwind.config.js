/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        train: {
          dark: '#0c0e14',
          panel: 'rgba(15, 23, 42, 0.82)',
          amber: '#f59e0b',
          gold: '#fbbf24',
          cream: '#f8fafc',
          steel: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}

