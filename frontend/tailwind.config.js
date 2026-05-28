/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Allow switching themes, although we'll default beautifully to dark
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#09090b', // Deep rich zinc-950 black
          card: '#18181b', // Zinc-900 for modern cards
          input: '#27272a', // Zinc-800 for glassy inputs
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Violet accent
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        income: {
          DEFAULT: '#10b981', // Emerald green
          light: '#d1fae5',
          dark: '#065f46',
        },
        expense: {
          DEFAULT: '#f43f5e', // Rose red
          light: '#ffe4e6',
          dark: '#9f1239',
        },
        cardBorder: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 2px 8px 0 rgba(0, 0, 0, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 20px 0 rgba(139, 92, 246, 0.15)',
        'glow-income': '0 0 20px 0 rgba(16, 185, 129, 0.15)',
        'glow-expense': '0 0 20px 0 rgba(244, 63, 94, 0.15)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
