/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'etniko-dark':   '#1D2820', // forest-black
        'etniko-gold':   '#B68D40', // accent
        'etniko-cream':  '#FAF7F2', // page background
        'etniko-cream-alt': '#F2EEE9', // feature strip background
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        terracotta: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        mehendi: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
        },
        rosefabric: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        cream: {
          50: '#fdfbf7',
          100: '#f7f4eb',
          200: '#eee8d5',
          300: '#e2d6b5',
          400: '#d1bd8c',
          500: '#c0a265',
        },
        charcoal: {
          50: '#f6f6f6',
          100: '#e9e9e9',
          200: '#d1d1d1',
          300: '#ababab',
          400: '#7e7e7e',
          500: '#5c5c5c',
          600: '#474747',
          700: '#333333',
          800: '#222222',
          900: '#1f2937',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Poppins"', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        widest: '.25em',
        luxury: '.15em',
      }
    },
  },
  plugins: [],
}
