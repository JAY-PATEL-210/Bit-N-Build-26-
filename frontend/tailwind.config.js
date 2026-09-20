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
          normal: '#10b981',    // Emerald (Healthy & Active)
          delayed: '#f59e0b',   // Amber (Caution & Delay)
          cancelled: '#f43f5e', // Rose (Critical Disruption)
          analyzing: '#6366f1', // Indigo (AI Reasoning)
          searching: '#0ea5e9', // Sky (Operational Transit Search)
          approval: '#f59e0b',  // Amber (Human Escalation)
          rebooking: '#6366f1', // Indigo (Autonomous Action)
          confirmed: '#10b981', // Emerald (Confirmed & Resolved)
          failed: '#f43f5e',    // Rose (Action Error)
        },
        semantic: {
          brand: '#0ea5e9',     // Sky: Brand & Transit
          success: '#10b981',   // Emerald: Normal & Confirmed
          warning: '#f59e0b',   // Amber: Delay & Human Approval
          critical: '#f43f5e',  // Rose: Cancellation & Critical Alert
          ai: '#6366f1',        // Indigo: Autonomous Agentic AI
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
