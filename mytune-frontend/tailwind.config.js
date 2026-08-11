/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F0F11',
        surface: '#1A1A1D',
        surfaceHover: '#2A2A2E',
        primary: '#FF6B00',
        primaryHover: '#FF8533',
        textMain: '#FFFFFF',
        textMuted: '#A0A0A5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
