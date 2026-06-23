/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0a0a0c',
        'surface-secondary': '#151518',
        'surface-tertiary': '#222226',
        'on-surface': '#ffffff',
        'on-surface-secondary': '#a1a1aa',
        'on-surface-tertiary': '#d4d4d8',
        brand: '#d4af37',
        'brand-primary': '#d4af37',
        'brand-secondary': '#e8ce84',
        'brand-tertiary': '#332a10',
        'on-brand': '#000000',
        'on-brand-tertiary': '#d4af37',
        success: '#34c759',
        warning: '#ff9f0a',
        error: '#ff3b30',
        border: '#27272a',
        'border-strong': '#3f3f46',
        divider: '#1f1f22'
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'pill': '999px',
      },
      backdropBlur: {
        'glass': '20px',
      }
    },
  },
  plugins: [],
}
