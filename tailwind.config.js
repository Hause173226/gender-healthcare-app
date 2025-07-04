/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        healthcare: {
          primary: '#F8BBD9',
          secondary: '#E1F5FE',
          accent: '#B2DFDB',
          light: '#FFF8F8',
          dark: '#4A4A4A',
          text: '#2C3E50',
          success: '#81C784',
          warning: '#FFB74D',
          danger: '#E57373',
        },
      },
    },
  },
  plugins: [],
}