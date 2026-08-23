/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        // Disciplined Primary Brand — Indigo
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Eye-Relaxed True Obsidian / Zinc Dark Mode Surfaces
        darkBg: {
          canvas: '#09090B',       // True Obsidian Pitch Black (Zinc-950 base)
          card:   '#121215',       // Zinc-900 surface (calm, low-glare)
          cardSub:'#18181B',       // Zinc-900 secondary surface
          cardElevated: '#202024', // Zinc-800 elevated popup/modal
          border: 'rgba(255, 255, 255, 0.08)',
          borderSub:'rgba(255, 255, 255, 0.04)',
        },
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '14px',
        '2xl': '18px',
        '3xl': '24px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'card':   '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'card-md':'0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03)',
        'card-lg':'0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
        'elevated':'0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'dark-glow': '0 0 20px -3px rgba(99, 102, 241, 0.2)',
        'dark-card': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
      },
      animation: {
        'fade-in':        'fadeIn 0.3s ease-out',
        'slide-up':       'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'scale-in':       'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' },                                  '100%': { opacity: '1' } },
        slideUp:      { '0%': { transform: 'translateY(12px)', opacity: '0' },   '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { '0%': { transform: 'translateX(12px)', opacity: '0' },   '100%': { transform: 'translateX(0)', opacity: '1' } },
        scaleIn:      { '0%': { transform: 'scale(0.97)', opacity: '0' },        '100%': { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
