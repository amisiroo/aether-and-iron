/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dungeon: {
          darkest: '#08090c',
          dark: '#10121a',
          card: '#161924',
          border: '#2a2f42',
          gold: '#f59e0b',
          crimson: '#ef4444',
          emerald: '#10b981',
          arcane: '#8b5cf6',
          mist: '#94a3b8'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
