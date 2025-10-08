/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primary : {
  50:  '#F4F7F6',
  100: '#DFE7E4',
  200: '#BFCEC9',
  300: '#94AEA4',
  400: '#5E8577',
  500: '#295C4A',
  600: '#245141',
  700: '#1E4235',
  800: '#142E25',
  900: '#0A1713',
  950: '#040907',
},
      }
    },
  },
  plugins: [],
}

