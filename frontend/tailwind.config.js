/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary brand — indigo
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
        // Light theme surface colours
        surface: {
          DEFAULT: '#f8f9fc',
          50:  '#ffffff',
          100: '#f1f5f9',
          200: '#e8edf5',
          300: '#dde3ee',
          400: '#c8d0e0',
        },
        // Sidebar / nav
        sidebar: {
          DEFAULT: '#ffffff',
          border: '#e8edf5',
        },
        // Text
        text: {
          primary:   '#1e293b',
          secondary: '#64748b',
          muted:     '#94a3b8',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient':   'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'card-accent':     'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.06) 100%)',
      },
      boxShadow: {
        'card':      '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-md':   '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
        'card-lg':   '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)',
        'brand':     '0 4px 14px 0 rgba(99,102,241,0.35)',
        'brand-sm':  '0 2px 8px 0 rgba(99,102,241,0.25)',
      },
      animation: {
        'fade-in':        'fadeIn 0.4s ease-out',
        'slide-up':       'slideUp 0.35s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in':       'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' },                                  '100%': { opacity: '1' } },
        slideUp:      { '0%': { transform: 'translateY(16px)', opacity: '0' },   '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { '0%': { transform: 'translateX(16px)', opacity: '0' },   '100%': { transform: 'translateX(0)', opacity: '1' } },
        scaleIn:      { '0%': { transform: 'scale(0.95)', opacity: '0' },        '100%': { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
