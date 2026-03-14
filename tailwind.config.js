/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        'lelab-dark': '#0a0a0a',
        'lelab-purple': '#a855f7',
        'lelab-pink': '#ec4899',
        'lelab-yellow': '#eab308',
        'lelab-green': '#a3e635',
      },
    },
  },
  plugins: [],
}
