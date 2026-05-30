/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        },
        teal: {
          DEFAULT: '#00D4AA',
          light: '#00F5C8',
          dark: '#00B894',
        },
        amber: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },
        rose: {
          DEFAULT: '#F43F5E',
          light: '#FB7185',
        },
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
