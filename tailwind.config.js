/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F0F6F2',
          100: '#E1EDE5',
          200: '#C2DBCB',
          300: '#95C2A4',
          400: '#5BA175',
          500: '#2E7A4A',
          DEFAULT: '#245C3A', // Primary Forest Green
          600: '#245C3A',
          700: '#1D4A2E',
          800: '#163823',
          900: '#0F2718',
        },
        cream: {
          50: '#FDFCF9',
          100: '#FAF7EE',
          DEFAULT: '#F8F4E9', // Secondary Warm Cream
          200: '#F0E9D5',
          300: '#E5DABF',
          400: '#D5C39D',
        },
        earth: {
          50: '#F9F5F1',
          100: '#F0E6DD',
          200: '#DDC9B7',
          DEFAULT: '#8B5E3C', // Accent Earthy Brown
          600: '#734D31',
          700: '#5C3E27',
          800: '#452E1D',
          900: '#302014',
        },
        gold: {
          50: '#FAF6EB',
          100: '#F4ECCC',
          200: '#EBD89E',
          300: '#E2C670',
          DEFAULT: '#D5B46A', // Highlight Soft Gold
          500: '#C8A34F',
          600: '#B08C39',
          700: '#8A6E2D',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Outfit"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(36, 92, 58, 0.08)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'elevated': '0 20px 40px -15px rgba(36, 92, 58, 0.15)',
      }
    },
  },
  plugins: [],
}
