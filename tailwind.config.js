/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        witcher: {
          dark: '#0c0d0e',
          panel: '#151719',
          border: '#2e3338',
          gold: '#c99a45',
          goldlight: '#e2ba6d',
          silver: '#a6b1b9',
          crimson: '#8a1c14',
          blood: '#b91c1c',
          signAard: '#38bdf8',
          signIgni: '#f97316',
          signQuen: '#eab308',
          signYrden: '#a855f7',
          signAxii: '#22c55e',
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        medieval: ['MedievalSharp', 'cursive'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
