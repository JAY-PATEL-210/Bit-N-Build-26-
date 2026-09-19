/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#020617', // slate-950
        surface: {
          DEFAULT: '#0f172a', // slate-900
          hover: '#1e293b',   // slate-800
          active: '#334155',  // slate-700
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        status: {
          normal: '#10b981',
          delayed: '#f59e0b',
          cancelled: '#ef4444',
          analyzing: '#8b5cf6',
          searching: '#06b6d4',
          approval: '#f97316',
          rebooking: '#6366f1',
          confirmed: '#10b981',
          failed: '#f43f5e',
        },
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
