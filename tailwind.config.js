/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-ibm-plex)',
          '"IBM Plex Sans"',
          '"IBM Plex Sans Fallback"',
          '-apple-system',
          'system-ui',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          '"Open Sans"',
          '"Helvetica Neue"',
          'sans-serif'
        ],
      },
      colors: {
        'runreveal': {
          50: '#f6ecfe',
          100: '#f0d9fd',
          200: '#e5b7fb',
          300: '#d09efb',
          400: '#c17af9',
          500: '#a13df7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        'purple-lightest': 'hsl(273.33deg 90% 96.08%)',
        // Highlight colors
        'highlight-best': '#7c3aed', // Purple - confidence and innovation
        'highlight-fastest': '#F1B31C', // Yellow - optimism and clarity
        'highlight-affordable': '#10b981', // Green - growth and reliability
        'highlight-simple': '#ec4899', // Pink - energy and creativity
        'highlight-modern': '#3b82f6', // Blue - trust and intelligence
        // Theme colors
        'primary': '#7c3aed',
        'primary-light': '#f5f3ff',
        'primary-dark': '#5b21b6',
        'secondary': '#ec4899',
        'secondary-light': '#fce7f3',
        'secondary-dark': '#be185d',
        'accent': '#F1B31C',
        'accent-light': '#fef3c7',
        'accent-dark': '#d97706',
        'vitality': '#10b981',
        'vitality-light': '#d1fae5',
        'vitality-dark': '#065f46',
        'insight': '#3b82f6',
        'insight-light': '#dbeafe',
        'insight-dark': '#1e40af',
      },
    },
  },
  plugins: [],
} 