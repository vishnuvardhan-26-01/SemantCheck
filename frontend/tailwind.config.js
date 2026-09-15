/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f5ff', 100: '#e0eaff', 200: '#c7d8fe', 300: '#a4bcfc',
          400: '#7d99f8', 500: '#5b74f1', 600: '#4653e4', 700: '#3a41c9',
          800: '#3139a3', 900: '#1e2a6e', 950: '#141a4a',
        },
      },
    },
  },
  plugins: [],
}
