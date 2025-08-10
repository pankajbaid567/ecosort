/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eco-green': '#4CAF50',
        'eco-blue': '#2196F3',
        'eco-yellow': '#FFC107',
        'eco-red': '#F44336',
        'eco-bg': '#F5F9F6',
        'eco-dark': '#212121',
        'eco-light': '#757575',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'eco': '0 4px 20px rgba(76, 175, 80, 0.15)',
        'eco-lg': '0 8px 25px rgba(76, 175, 80, 0.2)',
      },
      borderRadius: {
        'eco': '12px',
        'eco-lg': '16px',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-eco': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
