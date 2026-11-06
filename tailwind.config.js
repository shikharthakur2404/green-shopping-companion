/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    borderRadius: {
      none: '0px',
      sm: '2px',
      DEFAULT: '4px',
      md: '6px',
      lg: '8px',
      full: '9999px',
    },
    extend: {
      colors: {
        paper: '#F4F0E6',
        surface: '#FBF9F3',
        ink: {
          DEFAULT: '#17211C',
          muted: '#5E6A63',
          faint: 'rgba(23, 33, 28, 0.40)',
        },
        hairline: 'rgba(23, 33, 28, 0.14)',
        forest: {
          DEFAULT: '#1E4D3B',
          light: '#25604A',
          tint: 'rgba(30, 77, 59, 0.08)',
        },
        vermilion: {
          DEFAULT: '#D8452A',
          tint: 'rgba(216, 69, 42, 0.08)',
        },
        highlighter: {
          DEFAULT: '#F6E05E',
          tint: 'rgba(246, 224, 94, 0.25)',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
