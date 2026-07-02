/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3498db',
        success: '#2ecc71',
        error: '#e74c3c',
        warning: '#f39c12',
      },
    },
  },
  plugins: [],
}
