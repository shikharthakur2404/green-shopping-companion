/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        carbon: {
          950: '#0a0f0c',
          900: '#111814',
          800: '#18221c',
          700: '#24322a',
        },
        leaf: {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
        },
      },
      boxShadow: {
        panel: '0 4px 16px rgba(0, 0, 0, 0.12)',
        card: '0 18px 50px -26px rgba(0, 0, 0, 0.9)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.75)', opacity: '0.9' },
          '80%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'float-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        'float-in': 'float-in 0.4s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
