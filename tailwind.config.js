/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,ts,tsx}', './src/components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#5BBFB5', // Brighter teal
        secondary: '#EBFA9F', // Keeping light yellow
        tertiary: '#F5F9FA', // Light grayish-blue instead of dark
        quaternary: '#78B0A8', // Lighter sage green
        quinary: '#FFFFFF', // Keeping white
        background: '#F8FDFF', // Very light blue/white for backgrounds
        text: '#3A464F', // Medium-dark gray for text
        accent: '#FF9D76', // Soft coral as an accent
      },
      fontFamily: {
        sans: ['Aeonik', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
