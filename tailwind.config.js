/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,ts,tsx}', './src/components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#C5E7E3',
        secondary: '#EBFA9F',
        tertiary: '#191D1D',
        quaternary: '#1E493B',
        quinary: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Aeonik', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
