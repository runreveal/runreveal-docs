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
      },
    },
  },
  plugins: [],
} 