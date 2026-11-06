/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        carbon: {
          950: '#04100a',
          900: '#07160e',
          800: '#0b2117',
          700: '#103021',
        },
        leaf: {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
        },
      },
      boxShadow: {
        glow: '0 0 40px -12px rgba(52, 211, 153, 0.55)',
        panel: '0 24px 80px -32px rgba(0, 0, 0, 0.85)',
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
